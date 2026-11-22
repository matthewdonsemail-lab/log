import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from screen import ENTITIES, KINDS, RELATIONS, kind_of

TASK = "kind"


def read_jsonl(path):
    rows = []
    with open(path, "r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
            except Exception:
                continue
            if row.get("text") and row.get("label") in KINDS:
                rows.append(row)
    return rows


def load(model_dir):
    from gliner2 import AutoExtractor

    model = AutoExtractor.from_pretrained(model_dir)
    model.eval()
    return model


def accuracy(model, rows):
    if not rows:
        return 0.0
    schema = model.create_schema().classification(TASK, KINDS).entities(ENTITIES).relations(RELATIONS)
    texts = [row["text"] for row in rows]
    results = model.batch_extract(texts, schema, batch_size=8, threshold=0.5, include_confidence=True)
    right = 0
    for row, result in zip(rows, results):
        kind, _ = kind_of(result)
        if (kind or "none") == row["label"]:
            right += 1
    return round(right / len(rows), 3)


def adapter_in(directory):
    best = None
    for root, _dirs, files in os.walk(directory):
        for name in files:
            if name.endswith((".safetensors", ".pt", ".bin")):
                path = os.path.join(root, name)
                if best is None or os.path.getsize(path) > os.path.getsize(best):
                    best = path
    return best


def main():
    if len(sys.argv) < 5:
        print(json.dumps({"ok": False, "error": "usage: train.py <model_dir> <train.jsonl> <heldout.jsonl> <out_dir> [--epochs N]"}))
        return
    model_dir, train_path, heldout_path, out_dir = sys.argv[1:5]
    epochs = 3
    if "--epochs" in sys.argv:
        epochs = int(sys.argv[sys.argv.index("--epochs") + 1])
    threads = int(os.environ.get("LOG_FACTS_THREADS") or 0)
    try:
        import torch

        if threads:
            torch.set_num_threads(threads)
        train_rows = read_jsonl(train_path)
        held_rows = read_jsonl(heldout_path)
        if len(train_rows) < 8 or not held_rows:
            print(json.dumps({"ok": False, "error": f"not enough examples to train: {len(train_rows)} to learn from, {len(held_rows)} held out"}))
            return
        started = time.perf_counter()
        base = load(model_dir)
        before = accuracy(base, held_rows)
        del base

        from gliner2 import create_classification_example
        from gliner2.training import train_gliner2

        examples = [create_classification_example(text=row["text"], task=TASK, labels=list(KINDS.keys()), true_label=row["label"]) for row in train_rows]
        held = [create_classification_example(text=row["text"], task=TASK, labels=list(KINDS.keys()), true_label=row["label"]) for row in held_rows]
        os.makedirs(out_dir, exist_ok=True)
        trained = train_gliner2(
            model_dir,
            train_data=examples,
            eval_data=held,
            output_dir=out_dir,
            num_epochs=epochs,
            batch_size=2,
            eval_batch_size=8,
            eval_strategy="epoch",
            use_lora=True,
            save_adapter_only=True,
            lora_r=8,
            lora_alpha=16.0,
            encoder_lr=0.0,
            task_lr=0.0005,
            fp16=False,
            bf16=False,
            num_workers=0,
            report_to_wandb=False,
            save_total_limit=1,
            logging_steps=5,
            seed=7,
        )
        adapter = adapter_in(out_dir)
        after = before
        if adapter:
            import gliner2

            tuned = load(model_dir)
            target = getattr(tuned, "model", tuned)
            gliner2.load_lora_adapter(target, adapter, auto_unload=False)
            tuned.eval()
            after = accuracy(tuned, held_rows)
        report = {
            "ok": True,
            "examples": len(train_rows),
            "heldOut": len(held_rows),
            "accuracyBefore": before,
            "accuracyAfter": after,
            "epochs": epochs,
            "adapter": adapter or "",
            "ms": round((time.perf_counter() - started) * 1000),
            "trainer": {k: v for k, v in (trained or {}).items() if isinstance(v, (int, float, str, bool))},
        }
        with open(os.path.join(out_dir, "train.json"), "w", encoding="utf-8") as handle:
            json.dump(report, handle, indent=2)
        print(json.dumps(report))
    except Exception as error:
        print(json.dumps({"ok": False, "error": f"{type(error).__name__}: {error}"}))


if __name__ == "__main__":
    main()
