import ast
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VENDOR = ROOT / "vendor" / "gabrielSlack"
PACKAGE = VENDOR / "gabriel"
TRANSPORT = PACKAGE / "core" / "transport.py"
METADATA = PACKAGE / "core" / "metadata.py"
PYPROJECT = VENDOR / "pyproject.toml"
FORBIDDEN = ("httpx", "websockets", "aiohttp", "requests", "urllib.request", "urllib3", "http.client", "http.cookiejar", "socket", "ssl")
RENAMED = {"httpx.AsyncClient": "SlackTransport", "httpx.Response": "SlackResponse", "httpx.TimeoutException": "TIMEOUT_ERRORS"}


def rel(path):
    return str(path.relative_to(ROOT)).replace("\\", "/")


def forbidden(module):
    return any(module == f or module.startswith(f + ".") for f in FORBIDDEN)


def dotted(node):
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        inner = dotted(node.value)
        return f"{inner}.{node.attr}" if inner else None
    return None


def touchpoints(path):
    tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
    found = []

    def add(node, kind, symbol, replacement):
        found.append({"file": rel(path), "line": node.lineno, "span": [node.lineno, node.col_offset, node.end_lineno, node.end_col_offset], "kind": kind, "symbol": symbol, "curlCffi": replacement, "fixable": replacement is not None})

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                if forbidden(alias.name):
                    add(node, "import", f"import {alias.name}", "" if alias.name == "httpx" else None)
                if alias.name.startswith("curl_cffi") and path != TRANSPORT:
                    add(node, "curlCffiOutsideTransport", f"import {alias.name}", None)
        elif isinstance(node, ast.ImportFrom) and node.level == 0:
            module = node.module or ""
            if forbidden(module):
                add(node, "import", f"from {module} import {', '.join(a.name for a in node.names)}", None)
            if module.startswith("curl_cffi") and path != TRANSPORT:
                add(node, "curlCffiOutsideTransport", f"from {module} import {', '.join(a.name for a in node.names)}", None)
        elif isinstance(node, ast.Attribute):
            name = dotted(node)
            if name and name.split(".")[0] in ("httpx", "websockets", "aiohttp", "requests"):
                add(node, "use", name, RENAMED.get(name))
        elif isinstance(node, ast.Call) and dotted(node.func) in ("AsyncSession", "Session"):
            keywords = {k.arg: k.value for k in node.keywords}
            pinned = isinstance(keywords.get("impersonate"), ast.Name) and keywords["impersonate"].id == "IMPERSONATE"
            add(node, "session", dotted(node.func), "ok" if path == TRANSPORT and pinned else None)
    return found


def transport_problems():
    problems = []
    if not TRANSPORT.exists():
        return [f"{rel(TRANSPORT)} is missing: gabriel's one curl_cffi transport"]
    tree = ast.parse(TRANSPORT.read_text(encoding="utf-8"))
    values = {t.id: n.value.value for n in tree.body if isinstance(n, ast.Assign) for t in n.targets if isinstance(t, ast.Name) and isinstance(n.value, ast.Constant)}
    target = values.get("IMPERSONATE")
    agent = values.get("USER_AGENT", "")
    version = re.fullmatch(r"chrome(\d+)", str(target or ""))
    if not version:
        problems.append(f"{rel(TRANSPORT)}: IMPERSONATE must be one desktop Chrome target (chromeNNN), found {target!r}")
    elif f"Chrome/{version.group(1)}." not in agent:
        problems.append(f"{rel(TRANSPORT)}: USER_AGENT must be {target}'s own user agent (Chrome/{version.group(1)}.0.0.0), found {agent!r}")
    meta = METADATA.read_text(encoding="utf-8")
    if not re.search(r"user_agent=USER_AGENT\b", meta):
        problems.append(f"{rel(METADATA)}: the default user_agent must be transport.USER_AGENT, never a fixed string of its own")
    deps = PYPROJECT.read_text(encoding="utf-8")
    for name in ("httpx", "websockets", "aiohttp", "requests"):
        if re.search(rf'"{name}[<>=~! ]', deps):
            problems.append(f"{rel(PYPROJECT)} still depends on {name}")
    return problems


def files():
    out = subprocess.run(["git", "ls-files", "--cached", "--others", "--exclude-standard", "vendor/gabrielSlack/gabriel"], cwd=ROOT, capture_output=True, text=True).stdout
    return sorted(ROOT / n for n in out.split() if n.endswith(".py") and (ROOT / n).exists())


def apply(found):
    by_file = {}
    for t in found:
        if t["fixable"] and t["curlCffi"] != "ok":
            by_file.setdefault(t["file"], []).append(t)
    for name, items in by_file.items():
        path = ROOT / name
        lines = path.read_text(encoding="utf-8").split("\n")
        for t in sorted(items, key=lambda x: (x["span"][0], x["span"][1]), reverse=True):
            l0, c0, l1, c1 = t["span"]
            if l0 != l1:
                continue
            line = lines[l0 - 1]
            lines[l0 - 1] = line[:c0] + t["curlCffi"] + line[c1:] if t["kind"] == "use" else ""
        path.write_text("\n".join(lines), encoding="utf-8", newline="\n")
    return sorted(by_file)


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "--check"
    found = [t for path in files() for t in touchpoints(path)]
    if mode == "--map":
        print(json.dumps({"touchpoints": found}, indent=1))
        return 0
    if mode == "--apply":
        print(json.dumps({"rewrote": apply(found)}, indent=1))
        found = [t for path in files() for t in touchpoints(path)]
    sessions = [t for t in found if t["kind"] == "session"]
    problems = [f"{t['file']}:{t['line']} {t['kind']} {t['symbol']}: only core/transport.py's one curl_cffi session pinned to IMPERSONATE reaches Slack" for t in found if t["curlCffi"] != "ok"]
    if len(sessions) != 1:
        problems.append(f"vendor/gabrielSlack makes {len(sessions)} curl_cffi session constructor(s): it must make exactly one, transport.new_session")
    problems += transport_problems()
    print(json.dumps({"ok": not problems, "problems": problems}, indent=1))
    return 0 if not problems else 1


if __name__ == "__main__":
    sys.exit(main())
