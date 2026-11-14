from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Awaitable, Callable

VERSION = 1
PAGE_SIZE = 40
NEWEST_PAGES = 5
ENGAGER_PAGE_SIZE = 40


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
    return {"version": VERSION, "userId": me, "bottomCursor": None, "historyDone": False, "syncedAt": None, "rows": {}, "engagements": {}}


def read_store(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None
    try:
        store = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None
    if not isinstance(store, dict) or store.get("version") != VERSION or not isinstance(store.get("rows"), dict):
        return None
    if not isinstance(store.get("engagements"), dict):
        store["engagements"] = {}
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
                    "source": "notification",
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
            "source": "notification",
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
        if row.get("source") == "notification" and held.get("source") == "engagements":
            held["source"] = "notification"
            for field in ("notificationId", "message"):
                if row.get(field) is not None:
                    held[field] = row[field]
    return added


Fetch = Callable[[str | None], Awaitable[dict[str, Any]]]
Pace = Callable[[], Awaitable[None]]


def engager(user: Any) -> dict[str, Any]:
    return {"userId": str(getattr(user, "id", "") or ""), "handle": getattr(user, "screen_name", None), "name": getattr(user, "name", None), "followsYou": None, "youFollow": None, "followers": getattr(user, "followers_count", None)}


def engager_rows(users: list[Any], kind: str, post_id: str, me: str, my_handle: str | None, post_text: str | None) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for user in users:
        who = engager(user)
        if not who["userId"] or who["userId"] == me:
            continue
        rows.append({"key": f"{kind}:{who['userId']}:{post_id}", "kind": kind, "at": None, **who, "postId": post_id, "postText": post_text, "postUrl": post_url(my_handle, post_id), "source": "engagements"})
    return rows


def engager_counts(store: dict[str, Any], post_id: str, kind: str) -> dict[str, int]:
    rows = [row for row in store["rows"].values() if row.get("kind") == kind and row.get("postId") == post_id]
    unrolled = sum(1 for row in rows if row.get("source") == "engagements")
    return {"fromNotifications": len(rows) - unrolled, "addedByUnroll": unrolled, "total": len(rows)}


def empty_progress() -> dict[str, Any]:
    return {"cursor": None, "done": False, "pages": 0, "seen": 0, "added": 0, "ownAction": False, "syncedAt": None}


EngagerFetch = Callable[[str | None], Awaitable[Any]]


async def unroll_engagers(fetch: EngagerFetch, pace: Pace, path: Path, me: str, my_handle: str | None, post_id: str, kind: str, max_pages: int, log: Callable[[str], None]) -> dict[str, Any]:
    store = read_store(path) or empty_store(me)
    post = store["engagements"].setdefault(post_id, {})
    held = post.get(kind)
    resumed = bool(held and not held.get("done") and held.get("cursor"))
    progress = {**empty_progress(), **held} if resumed else empty_progress()
    post[kind] = progress
    post_text = next((row.get("postText") for row in store["rows"].values() if row.get("postId") == post_id and row.get("postText")), None)
    pages = 0
    added = 0
    while pages < max_pages and not progress["done"]:
        if pages:
            await pace()
        page = await fetch(progress["cursor"])
        pages += 1
        users = list(page)
        new = add_rows(store, engager_rows(users, kind, post_id, me, my_handle, post_text))
        added += new
        nxt = getattr(page, "next_cursor", None)
        progress["pages"] += 1
        progress["seen"] += len(users)
        progress["added"] += new
        if any(str(getattr(user, "id", "") or "") == me for user in users):
            progress["ownAction"] = True
        if not users or not nxt or nxt == progress["cursor"]:
            progress["done"] = True
            progress["cursor"] = None
        else:
            progress["cursor"] = nxt
        progress["syncedAt"] = now_iso()
        write_store(path, store)
        log(f"{kind} page {progress['pages']} of post {post_id}: {len(users)} people, {new} new{', the end of the list' if progress['done'] else ''}")
    return {"postId": post_id, "kind": kind, "pages": pages, "newRows": added, "resumed": resumed, "done": progress["done"], "stoppedBy": "end" if progress["done"] else "pageCap", "counts": engager_counts(store, post_id, kind), "syncedAt": progress["syncedAt"]}




async def sync_notifications(fetch: Fetch, pace: Pace, path: Path, me: str, my_handle: str | None, full: bool, max_pages: int, log: Callable[[str], None]) -> dict[str, Any]:
    store = read_store(path) or empty_store(me)
    first = not store["rows"]
    pages = 0
    added = 0
    stopped = "caughtUp"
    cursor: str | None = None
    newest_cap = min(NEWEST_PAGES, max_pages) if first else max_pages
    while True:
        if pages:
            await pace()
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
        await pace()
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
