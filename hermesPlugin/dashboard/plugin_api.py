"""Dashboard routes for log: read-only JSON for the log tab.

Reads only log's own files under ~/.logCli (or LOG_CLI_HOME): each account's session state,
its request counter for today, and the X inbox log already synced. It makes no network call,
runs no command and writes nothing.
"""

from __future__ import annotations

import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter

router = APIRouter()

PLATFORMS = {
    "twitter": ("X", 240),
    "discord": ("Discord", 60),
    "slack": ("Slack", 40),
    "instagram": ("Instagram", 40),
    "reddit": ("Reddit", 40),
    "linkedin": ("LinkedIn", 10),
}
WAITING_LIMIT = 12
TEXT_LIMIT = 200


def _home() -> Path:
    override = os.environ.get("LOG_CLI_HOME", "").strip()
    return Path(override).expanduser() if override else Path.home() / ".logCli"


def _read(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8-sig"))
    except (OSError, ValueError):
        return None


def _iso(seconds: Any) -> str | None:
    try:
        return datetime.fromtimestamp(float(seconds), tz=timezone.utc).isoformat()
    except (TypeError, ValueError, OSError):
        return None


def _today(governor: dict[str, Any]) -> bool:
    day = str(governor.get("day") or "")
    return day in (time.strftime("%Y-%m-%d"), datetime.now(timezone.utc).strftime("%Y-%m-%d"))


def _account(platform: str, folder: Path) -> dict[str, Any]:
    label, limit = PLATFORMS[platform]
    session = _read(folder / "session.json") or {}
    governor = _read(folder / "governor_state.json") or {}
    fresh = isinstance(governor, dict) and _today(governor)
    cooldown = float(governor.get("cooldown_until") or 0) if isinstance(governor, dict) else 0.0
    return {
        "platform": platform,
        "platformLabel": label,
        "account": folder.name,
        "sessionState": str(session.get("sessionState") or "unknown") if isinstance(session, dict) else "unknown",
        "checkedAt": session.get("checkedAt") if isinstance(session, dict) else None,
        "writesToday": int(governor.get("mutation_count") or 0) if fresh else 0,
        "requestsToday": int(governor.get("day_count") or 0) if fresh else 0,
        "writesLimit": limit,
        "lastActionAt": _iso(governor.get("last_request_ts")) if fresh else None,
        "coolingDownUntil": _iso(cooldown) if cooldown > time.time() else None,
    }


def _accounts(home: Path) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for platform in PLATFORMS:
        root = home / platform
        if not root.is_dir():
            continue
        for folder in sorted(root.iterdir(), key=lambda p: p.name.lower()):
            if folder.is_dir() and (folder / "session.json").is_file():
                out.append(_account(platform, folder))
    return out


def _waiting(home: Path, account: str) -> tuple[list[dict[str, Any]], int, str | None]:
    state = _read(home / "twitter" / account / "inboxSync.json")
    if not isinstance(state, dict) or not isinstance(state.get("xchat"), dict) or not state.get("userId"):
        return [], 0, None
    me = str(state["userId"])
    rows: list[dict[str, Any]] = []
    for conversation_id, chat in state["xchat"].items():
        if not isinstance(chat, dict):
            continue
        last_ms, sender = chat.get("lastMs"), chat.get("lastSender")
        if not last_ms or not sender or str(sender) == me:
            continue
        handles = chat.get("handles") or {}
        people = [f"@{handles[p]}" for p in chat.get("participants") or [] if handles.get(p)]
        said = [m for m in chat.get("messages") or [] if isinstance(m, dict) and m.get("text") is not None]
        last = said[-1] if said else None
        text = str(last["text"]) if last and last.get("time_ms") == last_ms else ""
        rows.append({
            "account": account,
            "platform": "twitter",
            "conversationId": conversation_id,
            "with": ", ".join(people) or "someone",
            "handle": people[0][1:] if len(people) == 1 else None,
            "at": _iso(float(last_ms) / 1000),
            "text": " ".join(text.split())[:TEXT_LIMIT],
            "ms": float(last_ms),
        })
    rows.sort(key=lambda r: -r["ms"])
    for r in rows:
        r.pop("ms")
    return rows[:WAITING_LIMIT], len(rows), state.get("syncedAt")


@router.get("/overview")
async def overview() -> dict[str, Any]:
    home = _home()
    if not home.is_dir():
        return {"installed": False, "accounts": [], "waiting": [], "waitingTotal": 0, "syncedAt": None}
    accounts = _accounts(home)
    waiting: list[dict[str, Any]] = []
    total = 0
    synced: list[str] = []
    for a in accounts:
        if a["platform"] != "twitter" or a["sessionState"] != "loggedIn":
            continue
        rows, count, synced_at = _waiting(home, a["account"])
        a["waiting"] = count
        waiting.extend(rows)
        total += count
        if synced_at:
            synced.append(str(synced_at))
    waiting.sort(key=lambda r: r["at"] or "", reverse=True)
    return {
        "installed": True,
        "accounts": accounts,
        "waiting": waiting[:WAITING_LIMIT],
        "waitingTotal": total,
        "syncedAt": max(synced) if synced else None,
    }
