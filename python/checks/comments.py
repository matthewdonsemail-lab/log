import ast
import io
import json
import sys
import tokenize


def comment_spans(source):
    spans = []
    for token in tokenize.generate_tokens(io.StringIO(source).readline):
        if token.type == tokenize.COMMENT:
            spans.append({"kind": "comment", "start": list(token.start), "end": list(token.end)})
    tree = ast.parse(source)
    for node in ast.walk(tree):
        for child in getattr(node, "body", []) if isinstance(getattr(node, "body", None), list) else []:
            if isinstance(child, ast.Expr) and isinstance(child.value, ast.Constant) and isinstance(child.value.value, str):
                spans.append({"kind": "docstring", "start": [child.lineno, child.col_offset], "end": [child.end_lineno, child.end_col_offset], "only": len(node.body) == 1})
    return spans


def strip(source):
    spans = comment_spans(source)
    lines = source.splitlines(keepends=True)
    drop = set()
    passes = {}
    for span in spans:
        start_line, start_col = span["start"]
        end_line, end_col = span["end"]
        if span["kind"] == "comment":
            line = lines[start_line - 1]
            before = line[:start_col]
            ending = "\n" if line.endswith("\n") else ""
            if before.strip():
                lines[start_line - 1] = before.rstrip() + ending
            else:
                drop.add(start_line - 1)
        else:
            first = lines[start_line - 1]
            indent = first[: len(first) - len(first.lstrip())]
            for index in range(start_line - 1, end_line):
                drop.add(index)
            if span.get("only"):
                passes[start_line - 1] = indent + "pass\n"
    out = []
    for index, line in enumerate(lines):
        if index in passes:
            out.append(passes[index])
        elif index not in drop:
            out.append(line)
    text = "".join(out)
    while "\n\n\n\n" in text:
        text = text.replace("\n\n\n\n", "\n\n\n")
    return text.lstrip("\n") if text.strip() else ""


def main():
    mode = sys.argv[1]
    found = {}
    for path in sys.argv[2:]:
        with open(path, encoding="utf8", newline="") as handle:
            source = handle.read()
        crlf = "\r\n" in source
        source = source.replace("\r\n", "\n")
        if mode == "--strip":
            stripped = strip(source)
            if stripped != source:
                if crlf:
                    stripped = stripped.replace("\n", "\r\n")
                with open(path, "w", encoding="utf8", newline="") as handle:
                    handle.write(stripped)
        spans = comment_spans(source if mode == "--check" else strip(source))
        if spans:
            found[path] = [{"kind": s["kind"], "line": s["start"][0]} for s in spans]
    print(json.dumps(found))


if __name__ == "__main__":
    main()
