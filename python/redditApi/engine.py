from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from platformKit import engine as kit

PLATFORM = "reddit"
LIBRARY = "vendor/reverseChud"
WRITES: tuple[str, ...] = ("create", "reply", "vote")
BRIDGE = REPO / "src" / "reddit" / "engine" / "index.ts"
BRIDGE_TIMEOUT_S = 300
READ_SPACING_MS = [800, 2500]


def bun() -> str:
    return os.environ.get("LOG_BUN") or shutil.which("bun") or "bun"


def bridge(spec: dict[str, Any], cookies: dict[str, str], **fields: Any) -> dict[str, Any]:
    request = {"action": spec["action"], "account": spec.get("account"), "cookies": cookies, "proxy": spec.get("proxy") or None, "readSpacingMs": READ_SPACING_MS, **fields}
    try:
        run = subprocess.run([bun(), str(BRIDGE)], input=json.dumps(request), capture_output=True, text=True, encoding="utf-8", timeout=BRIDGE_TIMEOUT_S, cwd=str(REPO))
    except subprocess.TimeoutExpired:
        return {"ok": False, "code": "networkDropped", "detail": f"the reverseChud bridge gave no answer in {BRIDGE_TIMEOUT_S} s", "loginState": "unknown"}
    lines = [line for line in (run.stdout or "").splitlines() if line.strip()]
    try:
        return json.loads(lines[-1])
    except (IndexError, ValueError):
        return {"ok": False, "code": "engineNoAnswer", "detail": kit.redact((run.stderr or "no output")[-300:], cookies), "loginState": "unknown"}


async def ping(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    return bridge(spec, cookies)


async def subreddits(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    return bridge(spec, cookies, query=str(spec.get("query") or ""), limit=int(spec.get("limit") or 15))


async def posts(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    return bridge(spec, cookies, subreddit=str(spec.get("subreddit") or ""), days=float(spec.get("days") or 7), maxPages=int(spec.get("maxPages") or 20))


async def home(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    return bridge(spec, cookies)


async def post(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    return bridge(spec, cookies, url=str(spec.get("url") or ""), limit=int(spec.get("limit") or 50))


async def create(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    return bridge(spec, cookies, subreddit=str(spec.get("subreddit") or ""), title=str(spec.get("title") or ""), text=str(spec.get("text") or ""), flair=str(spec.get("flair") or ""))


async def reply(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    return bridge(spec, cookies, url=str(spec.get("url") or ""), commentId=str(spec.get("commentId") or ""), text=str(spec.get("text") or ""))


async def vote(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    return bridge(spec, cookies, url=str(spec.get("url") or ""), target=str(spec.get("target") or ""), direction=str(spec.get("direction") or "up"))


ACTIONS = {"ping": ping, "subreddits": subreddits, "posts": posts, "home": home, "post": post, "create": create, "reply": reply, "vote": vote}


if __name__ == "__main__":
    raise SystemExit(kit.main(ACTIONS, WRITES, LIBRARY))
