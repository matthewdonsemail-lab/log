from __future__ import annotations

import asyncio
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Awaitable, Callable

VERSION = 1
PAGE_SIZE = 40
NEWEST_PAGES = 5


def iso_of_ms(ms: Any) -> str | None:
    try:
        value = int(ms)
    except (TypeError, ValueError):
        return None
    if value <= 0:
        return None
    return datetime.fromtimestamp(value / 1000, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def empty_store(me: str) -> dict[str, Any]:
    return {"version": VERSION, "userId": me, "bottomCursor": None, "historyDone": False, "syncedAt": None, "rows": {}}


def read_store(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None
    try:
        store = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None
    if not isinstance(store, dict) or store.get("version") != VERSION or not isinstance(store.get("rows"), dict):
        return None
    return store


def write_store(path: Path, store: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(f"{path.name}.{os.getpid()}.tmp")
    temp.write_text(json.dumps(store), encoding="utf-8")
    os.replace(temp, path)


def post_url(handle: Any, tweet_id: Any) -> str | None:
    if not tweet_id:
        return None
    return f"https://x.com/{handle or 'i'}/status/{tweet_id}"


def person(user: dict[str, Any]) -> dict[str, Any]:
    return {"userId": str(user.get("user_id") or ""), "handle": user.get("screen_name"), "name": user.get("name"), "followsYou": user.get("followed_by"), "youFollow": user.get("following"), "followers": user.get("followers_count")}


def rows_of(page: dict[str, Any], me: str, my_handle: str | None) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for note in page.get("notifications") or []:
        at = iso_of_ms(note.get("timestamp_ms"))
        targets = [t for t in note.get("targets") or [] if t] or [None]
        for user in note.get("users") or []:
            who = person(user)
            if not who["userId"] or who["userId"] == me:
                continue
            for target in targets:
                post_id = (target or {}).get("id")
                rows.append({
                    "key": f"{note['kind']}:{who['userId']}:{post_id or note['id']}",
                    "kind": note["kind"],
                    "at": at,
                    **who,
                    "postId": post_id,
                    "postText": (target or {}).get("text"),
                    "postUrl": post_url(my_handle if (target or {}).get("user_id") == me else None, post_id),
                    "notificationId": note["id"],
                    "message": note.get("message") or "",
                })
    for entry in page.get("tweets") or []:
        tweet = entry.get("tweet") or {}
        who = person(entry.get("user") or {})
        if not tweet.get("id") or who["userId"] == me:
            continue
        quoted = entry.get("quoted") or {}
        replied = entry.get("replied_to") or {}
        if quoted.get("id") and quoted.get("user_id") == me:
            kind, target = "quote", quoted
        elif tweet.get("in_reply_to_user_id") == me or (replied.get("id") and replied.get("user_id") == me):
            kind, target = "reply", replied or {"id": tweet.get("in_reply_to_status_id"), "user_id": me}
        else:
            kind, target = "mention", {}
        rows.append({
            "key": f"{kind}:{tweet['id']}",
            "kind": kind,
            "at": iso_of_ms(entry.get("timestamp_ms")) or tweet.get("created_at"),
            **who,
            "postId": target.get("id"),
            "postText": target.get("text"),
            "postUrl": post_url(my_handle, target.get("id")),
            "tweetId": tweet["id"],
            "tweetUrl": post_url(who["handle"], tweet["id"]),
            "text": tweet.get("text") or "",
        })
    return rows


def add_rows(store: dict[str, Any], rows: list[dict[str, Any]]) -> int:
    added = 0
    for row in rows:
        held = store["rows"].get(row["key"])
        if held is None:
            store["rows"][row["key"]] = row
            added += 1
            continue
        if row.get("at") and (not held.get("at") or row["at"] < held["at"]):
            held["at"] = row["at"]
        for field in ("handle", "name", "followsYou", "youFollow", "followers", "postText", "text"):
            if row.get(field) is not None:
                held[field] = row[field]
    return added


Fetch = Callable[[str | None], Awaitable[dict[str, Any]]]
Pace = Callable[[], None]


async def sync_notifications(fetch: Fetch, pace: Pace, path: Path, me: str, my_handle: str | None, full: bool, max_pages: int, seconds: float, log: Callable[[str], None]) -> dict[str, Any]:
    store = read_store(path) or empty_store(me)
    first = not store["rows"]
    pages = 0
    added = 0
    stopped = "caughtUp"
    cursor: str | None = None
    newest_cap = min(NEWEST_PAGES, max_pages) if first else max_pages
    while True:
        if pages:
            await asyncio.sleep(seconds)
            pace()
        page = await fetch(cursor)
        pages += 1
        rows = rows_of(page, me, my_handle)
        seen = len(page.get("notifications") or []) + len(page.get("tweets") or [])
        new = add_rows(store, rows)
        added += new
        cursor = page.get("cursor_bottom")
        if first or store["bottomCursor"] is None:
            store["bottomCursor"] = cursor
        if first and (not seen or not cursor):
            store["historyDone"] = True
        store["syncedAt"] = now_iso()
        write_store(path, store)
        log(f"newest page {pages}: {len(rows)} rows, {new} new")
        if not seen or not cursor or (not first and new < len(rows)):
            break
        if pages >= newest_cap:
            stopped = "newestCap"
            break
    while full and not store["historyDone"] and store["bottomCursor"] and pages < max_pages:
        await asyncio.sleep(seconds)
        pace()
        page = await fetch(store["bottomCursor"])
        pages += 1
        rows = rows_of(page, me, my_handle)
        seen = len(page.get("notifications") or []) + len(page.get("tweets") or [])
        new = add_rows(store, rows)
        added += new
        nxt = page.get("cursor_bottom")
        if not seen or not nxt or nxt == store["bottomCursor"]:
            store["historyDone"] = True
        else:
            store["bottomCursor"] = nxt
        store["syncedAt"] = now_iso()
        write_store(path, store)
        log(f"history page {pages}: {len(rows)} rows, {new} new{', the end of what X gives' if store['historyDone'] else ''}")
    if full:
        stopped = "historyDone" if store["historyDone"] else "pageCap"
    elif first and store["historyDone"]:
        stopped = "historyDone"
    return {"mode": "full" if full else ("first" if first else "newest"), "pages": pages, "newRows": added, "total": len(store["rows"]), "historyDone": store["historyDone"], "stoppedBy": stopped, "syncedAt": store["syncedAt"]}
