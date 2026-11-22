import json
import os
import sys
import time

KINDS = {
    "promise": "I will do something for you later",
    "debt": "money owed, pay back",
    "job": "my job title or role",
    "workplace": "the company I work at",
    "building": "the product or startup I am building",
    "location": "the city I live in",
    "interest": "a hobby I love",
    "relationship": "how we know each other",
    "none": "chit-chat, reaction, thanks, question, link",
}

ENTITIES = ["person", "company", "product", "project", "place", "money", "date"]

RELATIONS = ["promised", "owes", "works at", "building", "met"]


def load(model_dir, threads, revision=""):
    import torch
    from gliner2 import AutoExtractor

    if threads:
        torch.set_num_threads(threads)
    model = AutoExtractor.from_pretrained(model_dir)
    if revision:
        try:
            import gliner2

            gliner2.load_lora_adapter(getattr(model, "model", model), revision, auto_unload=False)
        except Exception as error:
            sys.stderr.write(f"the trained revision {revision} did not load ({type(error).__name__}: {error}); screening with the base model\n")
    model.eval()
    return model


def schema_of(model):
    return model.create_schema().classification("kind", KINDS).entities(ENTITIES).relations(RELATIONS)


def kind_of(result):
    found = result.get("kind")
    if isinstance(found, dict):
        return found.get("label"), float(found.get("confidence") or 0)
    if isinstance(found, list) and found:
        first = found[0]
        if isinstance(first, dict):
            return first.get("label"), float(first.get("confidence") or 0)
        return str(first), 1.0
    if isinstance(found, str):
        return found, 1.0
    return None, 0.0


def flat_entities(result):
    out = []
    for label, items in (result.get("entities") or {}).items():
        for item in items or []:
            text = item.get("text") if isinstance(item, dict) else item
            if text:
                out.append({"label": label, "text": str(text)})
    return out


def flat_relations(result):
    out = []
    for label, items in (result.get("relation_extraction") or result.get("relations") or {}).items():
        for item in items or []:
            if isinstance(item, dict):
                head = item.get("head")
                tail = item.get("tail")
                head = head.get("text") if isinstance(head, dict) else head
                tail = tail.get("text") if isinstance(tail, dict) else tail
            elif isinstance(item, (list, tuple)) and len(item) == 2:
                head, tail = item
            else:
                continue
            if head and tail:
                out.append({"label": label, "head": str(head), "tail": str(tail)})
    return out


def answer(model, schema, request):
    texts = [str(t) for t in request.get("texts") or []]
    started = time.perf_counter()
    results = model.batch_extract(texts, schema, batch_size=int(request.get("batchSize") or 16), threshold=float(request.get("threshold") or 0.5), include_confidence=True) if texts else []
    ms = (time.perf_counter() - started) * 1000
    marks = []
    for result in results:
        kind, confidence = kind_of(result)
        marks.append({"kind": kind or "none", "confidence": confidence, "entities": flat_entities(result), "relations": flat_relations(result)})
    return {"ok": True, "ms": ms, "marks": marks}


def main():
    model_dir = os.environ.get("LOG_FACTS_MODEL") or (sys.argv[1] if len(sys.argv) > 1 else "")
    revision = os.environ.get("LOG_FACTS_REVISION") or (sys.argv[2] if len(sys.argv) > 2 else "")
    threads = int(os.environ.get("LOG_FACTS_THREADS") or 0)
    try:
        started = time.perf_counter()
        model = load(model_dir, threads, revision)
        schema = schema_of(model)
        sys.stdout.write(json.dumps({"ok": True, "ready": True, "loadMs": (time.perf_counter() - started) * 1000}) + "\n")
        sys.stdout.flush()
    except Exception as error:
        sys.stdout.write(json.dumps({"ok": False, "error": f"{type(error).__name__}: {error}"}) + "\n")
        sys.stdout.flush()
        return
    for line in sys.stdin:
        if not line.strip():
            continue
        try:
            reply = answer(model, schema, json.loads(line))
        except Exception as error:
            reply = {"ok": False, "error": f"{type(error).__name__}: {error}"}
        sys.stdout.write(json.dumps(reply) + "\n")
        sys.stdout.flush()


if __name__ == "__main__":
    main()
