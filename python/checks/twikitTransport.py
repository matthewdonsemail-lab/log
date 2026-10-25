import ast
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VENDOR = ROOT / "vendor" / "twikit"
PACKAGE = VENDOR / "twikit"
TARGET_MODULE = "curl_cffi.requests"
RENAMED = {"AsyncClient": "AsyncSession", "Response": "Response"}
NO_EQUIVALENT = {"AsyncHTTPTransport", "URLPattern"}
DOC_NAMES = {"httpx.Response": "curl_cffi.requests.Response", "httpx.AsyncClient": "curl_cffi.requests.AsyncSession"}
REQUIREMENT = "curl_cffi>=0.15"
REQUIREMENTS = (VENDOR / "requirements.txt", VENDOR / "docs" / "requirements.txt")


def session_attributes():
    from curl_cffi.requests import AsyncSession

    session = AsyncSession()
    return set(dir(session)) | set(vars(session))


def is_httpx(module):
    return module == "httpx" or (module or "").startswith("httpx.")


class Touchpoints(ast.NodeVisitor):
    def __init__(self, path, allowed):
        self.path = path
        self.allowed = allowed
        self.found = []
        self.imported = {}
        self.module_alias = set()

    def add(self, node, kind, symbol, replacement, fixable):
        self.found.append({
            "file": str(self.path.relative_to(ROOT)).replace("\\", "/"),
            "line": node.lineno,
            "span": [node.lineno, node.col_offset, node.end_lineno, node.end_col_offset],
            "kind": kind,
            "httpx": symbol,
            "curlCffi": replacement,
            "fixable": fixable,
        })

    def visit_Import(self, node):
        for alias in node.names:
            if is_httpx(alias.name):
                self.module_alias.add(alias.asname or alias.name)
                self.add(node, "import", f"import {alias.name}", "from curl_cffi import requests", True)
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        if is_httpx(node.module):
            for alias in node.names:
                self.imported[alias.asname or alias.name] = alias.name
            names = [RENAMED[a.name] for a in node.names if a.name in RENAMED]
            replacement = f"from {TARGET_MODULE} import {', '.join(names)}" if names else None
            self.add(node, "import", f"from {node.module} import {', '.join(a.name for a in node.names)}", replacement, True)
        self.generic_visit(node)

    def visit_Name(self, node):
        source = self.imported.get(node.id)
        if source in RENAMED:
            self.add(node, "typeName", source, RENAMED[source], True)
        elif source in NO_EQUIVALENT:
            self.add(node, "noEquivalent", source, None, False)
        elif node.id.startswith("httpx"):
            self.add(node, "httpxHelper", node.id, None, False)

    def visit_FunctionDef(self, node):
        if node.name.startswith("httpx"):
            self.add(node, "httpxHelper", node.name, None, False)
        self.generic_visit(node)

    visit_AsyncFunctionDef = visit_FunctionDef

    def visit_alias(self, node):
        if node.name.startswith("httpx") and node.name != "httpx":
            self.add(node, "httpxHelper", node.name, None, False)

    def visit_Attribute(self, node):
        if isinstance(node.value, ast.Name) and node.value.id in self.module_alias:
            self.add(node, "moduleCall", f"httpx.{node.attr}", f"requests.{node.attr}", True)
            return
        if isinstance(node.value, ast.Attribute) and node.value.attr == "http":
            if node.attr not in self.allowed:
                self.add(node, "transportAttribute", f".http.{node.attr}", None, False)
            else:
                self.add(node, "transportUse", f".http.{node.attr}", f"AsyncSession.{node.attr}", None)
        self.generic_visit(node)

    def visit_Call(self, node):
        for keyword in node.keywords:
            if keyword.arg == "files":
                self.add(keyword.value, "multipartFiles", "files=", "multipart=CurlMime", False)
        self.generic_visit(node)

    def visit_Constant(self, node):
        if isinstance(node.value, str) and "httpx" in node.value:
            fixable = any(name in node.value for name in DOC_NAMES) or node.value.startswith("httpx[") or node.value == "httpx"
            self.add(node, "text", node.value.strip()[:80], "curl_cffi", fixable)


def scan_file(path, allowed):
    tree = ast.parse(path.read_text(encoding="utf-8"))
    visitor = Touchpoints(path, allowed)
    visitor.visit(tree)
    return visitor.found


def python_files():
    yield VENDOR / "setup.py"
    yield from sorted(PACKAGE.rglob("*.py"))


def scan():
    allowed = session_attributes()
    found = []
    for path in python_files():
        found.extend(scan_file(path, allowed))
    for requirements in REQUIREMENTS:
        for number, line in enumerate(requirements.read_text(encoding="utf-8").splitlines(), 1):
            if line.strip().startswith("httpx"):
                found.append({"file": str(requirements.relative_to(ROOT)).replace("\\", "/"), "line": number, "span": None, "kind": "requirement", "httpx": line.strip(), "curlCffi": REQUIREMENT, "fixable": True})
    return found


def splice(source, edits):
    lines = source.splitlines(keepends=True)
    encoded = [line.encode("utf-8") for line in lines]
    for (start_line, start_col, end_line, end_col), text in sorted(edits, key=lambda e: (e[0][0], e[0][1]), reverse=True):
        head = encoded[start_line - 1][:start_col]
        tail = encoded[end_line - 1][end_col:]
        merged = head + text.encode("utf-8") + tail
        if text == "" and merged.strip() == b"":
            merged = b""
        encoded[start_line - 1:end_line] = [merged]
    return b"".join(encoded).decode("utf-8")


def replacement_text(point, original):
    if point["kind"] == "text":
        text = original
        for old, new in DOC_NAMES.items():
            text = text.replace(old, new)
        if text.startswith("'httpx[") or text.startswith('"httpx['):
            text = text[0] + REQUIREMENT + text[0]
        return text
    return point["curlCffi"] or ""


def segment(source, span):
    lines = source.splitlines(keepends=True)
    start_line, start_col, end_line, end_col = span
    chunk = [line.encode("utf-8") for line in lines[start_line - 1:end_line]]
    if len(chunk) == 1:
        return chunk[0][start_col:end_col].decode("utf-8")
    return b"".join([chunk[0][start_col:], *chunk[1:-1], chunk[-1][:end_col]]).decode("utf-8")


def apply():
    found = scan()
    blocking = [p for p in found if p["fixable"] is False]
    if blocking:
        return found, blocking
    by_file = {}
    for point in found:
        if point["fixable"] and point["span"]:
            by_file.setdefault(point["file"], []).append(point)
    for file, points in by_file.items():
        path = ROOT / file
        source = path.read_text(encoding="utf-8")
        seen = set()
        edits = []
        for point in points:
            span = tuple(point["span"])
            if span in seen:
                continue
            seen.add(span)
            edits.append((span, replacement_text(point, segment(source, span))))
        path.write_text(splice(source, edits), encoding="utf-8", newline="")
    for requirements in REQUIREMENTS:
        lines = requirements.read_text(encoding="utf-8").splitlines(keepends=True)
        requirements.write_text("".join(REQUIREMENT + line[len(line.rstrip("\r\n")):] if line.strip().startswith("httpx") else line for line in lines), encoding="utf-8", newline="")
    return found, []


def main(argv):
    mode = argv[1] if len(argv) > 1 else "--map"
    if mode == "--map":
        found = scan()
        print(json.dumps(found, indent=1))
        return 0
    if mode == "--apply":
        found, blocking = apply()
        if blocking:
            print(json.dumps({"refused": "hand-edit these first, they have no curl_cffi equivalent by name", "points": blocking}, indent=1))
            return 1
        print(json.dumps({"applied": len([p for p in found if p["fixable"]])}))
        return 0
    if mode == "--check":
        left = [p for p in scan() if p["kind"] != "transportUse"]
        if left:
            print(json.dumps({"httpxLeft": left}, indent=1))
            return 1
        print(json.dumps({"ok": True}))
        return 0
    print(f"usage: {argv[0]} --map | --apply | --check", file=sys.stderr)
    return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
