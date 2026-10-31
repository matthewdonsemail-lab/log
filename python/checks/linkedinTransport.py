import ast
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PACKAGE = ROOT / "vendor" / "openLinkedinApi" / "open_linkedin_api"
TRANSPORT = PACKAGE / "transport.py"
FORBIDDEN = ("requests", "httpx", "aiohttp", "urllib.request", "urllib3", "http.client", "socket", "websockets")
SESSION_NAMES = {"AsyncSession", "Session", "Cookies"}


def forbidden(module):
    return any(module == f or module.startswith(f + ".") for f in FORBIDDEN)


def problems_in(path):
    tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
    rel = str(path.relative_to(ROOT)).replace("\\", "/")
    found = []
    sessions = 0
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                if forbidden(alias.name):
                    found.append(f"{rel}:{node.lineno} imports {alias.name}: only curl_cffi reaches the network")
        elif isinstance(node, ast.ImportFrom):
            module = node.module or ""
            if forbidden(module):
                found.append(f"{rel}:{node.lineno} imports from {module}: only curl_cffi reaches the network")
            if module.startswith("curl_cffi") and path != TRANSPORT:
                for alias in node.names:
                    if alias.name in SESSION_NAMES or module == "curl_cffi.requests":
                        found.append(f"{rel}:{node.lineno} takes {module}.{alias.name}: only transport.py holds the session")
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in ("AsyncSession", "Session"):
            sessions += 1
            if path != TRANSPORT:
                found.append(f"{rel}:{node.lineno} makes a {node.func.id}: only transport.py's new_session does")
            keywords = {k.arg: k.value for k in node.keywords}
            if not (isinstance(keywords.get("impersonate"), ast.Name) and keywords["impersonate"].id == "IMPERSONATE"):
                found.append(f"{rel}:{node.lineno} {node.func.id} isn't pinned to IMPERSONATE")
    return found, sessions


def tracked():
    out = subprocess.run(["git", "ls-files", "--cached", "--others", "--exclude-standard", "vendor/openLinkedinApi/open_linkedin_api"], cwd=ROOT, capture_output=True, text=True).stdout
    staged = set(subprocess.run(["git", "ls-files", "--cached", "vendor/openLinkedinApi/open_linkedin_api"], cwd=ROOT, capture_output=True, text=True).stdout.split())
    names = [line for line in out.split() if line.endswith(".py")]
    return [ROOT / n for n in names if n in staged] if staged else [ROOT / n for n in names]


def main():
    problems = []
    sessions = 0
    for path in sorted(tracked()):
        found, count = problems_in(path)
        problems += found
        sessions += count
    if sessions != 1:
        problems.append(f"vendor/openLinkedinApi makes {sessions} session(s): it must make exactly one, in transport.py")
    print(json.dumps({"ok": not problems, "problems": problems}, indent=1))
    return 0 if not problems else 1


if __name__ == "__main__":
    sys.exit(main())
