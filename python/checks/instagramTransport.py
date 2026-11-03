from __future__ import annotations

import ast
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ENGINE = ROOT / "python" / "instagramApi" / "engine.py"
VENDOR = ROOT / "vendor" / "instagrapi"
FORBIDDEN_IMPORTS = ("requests", "httpx", "aiohttp", "urllib.request", "urllib3", "websockets", "http.client")
REALTIME_SOCKET = "edge-mqtt.facebook.com MQTT, a raw TLS socket: not HTTP, so outside curl_cffi like Discord's gateway and X Chat's socket"


def engine_problems() -> list[str]:
    tree = ast.parse(ENGINE.read_text(encoding="utf-8"))
    problems: list[str] = []
    transport = None
    for node in ast.walk(tree):
        if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id == "TRANSPORT" for t in node.targets):
            transport = node.value.value if isinstance(node.value, ast.Constant) else None
        if isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name.split(".")[0] in {f.split(".")[0] for f in FORBIDDEN_IMPORTS}:
                    problems.append(f"{ENGINE.name}:{node.lineno} imports {alias.name}: the engine reaches Instagram only through instagrapi's curl transports")
        if isinstance(node, ast.ImportFrom) and node.module and any(node.module == f or node.module.startswith(f + ".") for f in FORBIDDEN_IMPORTS):
            problems.append(f"{ENGINE.name}:{node.lineno} imports from {node.module}: the engine reaches Instagram only through instagrapi's curl transports")
    if transport != "curl":
        problems.append(f"{ENGINE.name}: TRANSPORT is {transport!r}, it must be 'curl'")
    calls = [n for n in ast.walk(tree) if isinstance(n, ast.Call) and isinstance(n.func, ast.Attribute) and n.func.attr == "set_retry_config"]
    if not calls:
        problems.append(f"{ENGINE.name}: client_of never calls set_retry_config, so instagrapi picks its own transports")
    for call in calls:
        given = {k.arg: k.value for k in call.keywords}
        for name in ("private_transport", "public_transport"):
            value = given.get(name)
            if not (isinstance(value, ast.Name) and value.id == "TRANSPORT"):
                problems.append(f"{ENGINE.name}:{call.lineno} set_retry_config must pass {name}=TRANSPORT")
    return problems


def client_problems() -> list[str]:
    sys.path.insert(0, str(VENDOR))
    sys.path.insert(0, str(ROOT / "python"))
    from instagramApi import engine

    client = engine.client_of()
    problems: list[str] = []
    for side in ("private", "public"):
        session = getattr(client, side)
        adapters = {prefix: type(adapter).__name__ for prefix, adapter in getattr(session, "adapters", {}).items()}
        if not adapters or not all("Curl" in name for name in adapters.values()):
            problems.append(f"instagrapi's {side} session isn't on curl_cffi: {adapters or type(session).__name__}")
    return problems


def report() -> dict:
    problems = engine_problems()
    try:
        problems += client_problems()
    except Exception as error:
        problems.append(f"instagrapi's client couldn't be built the engine's way: {type(error).__name__}: {error}")
    return {"ok": not problems, "problems": problems, "exception": REALTIME_SOCKET}


def main(argv: list[str]) -> int:
    mode = argv[1] if len(argv) > 1 else "--check"
    out = report()
    print(json.dumps(out, indent=2))
    if mode == "--check":
        return 0 if out["ok"] else 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
