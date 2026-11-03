from __future__ import annotations

import asyncio
import json
import socket
import sys
import time
from datetime import timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
VENDOR = ROOT.parent / "vendor"
for p in (str(ROOT), str(VENDOR / "instagrapi")):
    if p not in sys.path:
        sys.path.insert(0, p)

from platformKit import engine as kit
from platformKit import media

PLATFORM = "instagram"
LIBRARY = "vendor/instagrapi"
WRITES: tuple[str, ...] = ("send",)
SESSION_COOKIES = ("sessionid",)
TRANSPORT = "curl"
INBOX_SEARCH = 100
PING_EVERY = 60
SHARES = ("media", "raven_media", "visual_media", "animated_media", "reel_share", "story_share", "felix_share", "link", "generic_xma", "xma_story_share", "xma_profile")


def message_of(message_id: str, at: str | None, sender: str | None, from_me: bool, text: str | None, attachments: list[dict[str, Any]]) -> dict[str, Any]:
    return {"id": message_id, "at": at, "from": sender, "fromMe": from_me, "text": media.text_with_audio(text, attachments), "attachments": [{k: v for k, v in a.items() if k != "url"} for a in attachments]}


def client_of() -> Any:
    from instagrapi import Client

    client = Client()
    client.set_retry_config(private_transport=TRANSPORT, public_transport=TRANSPORT, public_request_retries_count=0)
    return client


def refused(error: Exception) -> dict[str, Any] | None:
    from instagrapi import exceptions as ig

    name = type(error).__name__
    if isinstance(error, (ig.ChallengeRequired, ig.FeedbackRequired)):
        return {"ok": False, "code": "challenged", "detail": f"Instagram asked this session for a check ({name})", "loginState": "restricted", "event": "automated"}
    if isinstance(error, (ig.PleaseWaitFewMinutes, ig.RateLimitError)):
        return {"ok": False, "code": "rateLimited", "detail": f"Instagram is refusing requests from this session for now ({name})", "loginState": "unknown", "event": "throttled"}
    if isinstance(error, (ig.LoginRequired, ig.ClientForbiddenError)):
        return {"ok": False, "code": "sessionDead", "detail": f"Instagram doesn't take this sessionid ({name})", "loginState": "loggedOut"}
    return None


def signed_in(cookies: dict[str, str]) -> tuple[Any, dict[str, Any]]:
    client = client_of()
    try:
        client.login_by_sessionid(cookies["sessionid"])
    except AssertionError:
        return None, {"ok": False, "code": "sessionDead", "detail": "the account's sessionid isn't one Instagram issues", "loginState": "loggedOut"}
    except Exception as error:
        answer = refused(error)
        if answer:
            return None, answer
        raise
    user_id = str(client.authorization_data.get("ds_user_id") or "") or None
    if cookies.get("ds_user_id") and user_id and cookies["ds_user_id"] != user_id:
        return None, {"ok": False, "code": "sessionMismatch", "detail": f"Instagram says this sessionid is user {user_id}, the account's cookies say {cookies['ds_user_id']}", "loginState": "unknown"}
    return client, {"ok": True, "loginState": "loggedIn", "screenName": client.username, "userId": user_id, "transport": TRANSPORT}


def check(cookies: dict[str, str]) -> dict[str, Any]:
    return signed_in(cookies)[1]


def missing_session(cookies: dict[str, str]) -> dict[str, Any] | None:
    missing = [c for c in SESSION_COOKIES if not cookies.get(c)]
    if missing:
        return {"ok": False, "code": "sessionDead", "detail": f"the account's cookies have no {', '.join(missing)}", "loginState": "loggedOut"}
    return None


def iso(value: Any) -> str | None:
    return value.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ") if value else None


def owner_of(shared: Any) -> str | None:
    user = getattr(shared, "user", None)
    return getattr(user, "username", None) if user else None


def attachments_of(m: Any) -> list[dict[str, Any]]:
    kind = str(m.item_type or "")
    if kind == "voice_media":
        return [{"name": f"voice_{m.id}.m4a", "type": "audio/mp4", "kind": kind}]
    if kind in ("clip", "media_share"):
        shared = m.clip or m.media_share
        return [{"name": kind, "type": "share", "kind": kind, "owner": owner_of(shared), "code": getattr(shared, "code", None)}]
    if kind in ("xma_clip", "xma_media_share"):
        shared = m.xma_share
        return [{"name": kind, "type": "share", "kind": kind, "owner": getattr(shared, "header_title_text", None) or None}]
    if kind in SHARES:
        return [{"name": kind, "type": "share", "kind": kind}]
    return []


def text_of(m: Any, attachments: list[dict[str, Any]]) -> str:
    shown = [f"({a['kind']}{' from @' + a['owner'] if a.get('owner') else ''})" for a in attachments if a.get("type") == "share"]
    return " ".join([media.text_with_audio(m.text, attachments), *shown]).strip()


def message_row(m: Any, me: str | None, names: dict[str, str]) -> dict[str, Any]:
    attachments = attachments_of(m)
    from_me = bool(m.is_sent_by_viewer) or (me is not None and str(m.user_id) == me)
    row = message_of(str(m.id), iso(m.timestamp), "me" if from_me else names.get(str(m.user_id), str(m.user_id)), from_me, None, attachments)
    row["text"] = text_of(m, attachments)
    row["kind"] = m.item_type
    return row


def thread_row(t: Any, me: str | None) -> dict[str, Any]:
    names = {str(u.pk): u.username or str(u.pk) for u in t.users}
    last = message_row(t.messages[0], me, names) if t.messages else None
    return {
        "id": t.id,
        "title": t.thread_title,
        "group": t.is_group,
        "with": [u.username for u in t.users],
        "lastActivity": iso(t.last_activity_at),
        "unread": bool(me) and not t.is_seen(me),
        "pending": t.pending,
        "last": last,
    }


def match_threads(threads: list[Any], said: str) -> list[Any]:
    key = said.strip().lstrip("@").lower()
    if key.isdigit():
        return [t for t in threads if key in (str(t.id), str(t.pk))]
    exact = [t for t in threads if any((u.username or "").lower() == key for u in t.users) or (t.thread_title or "").lower() == key]
    if exact:
        return exact
    return [t for t in threads if key in (t.thread_title or "").lower() or any(key in (u.username or "").lower() for u in t.users)]


def inbox_sync(cookies: dict[str, str], limit: int) -> dict[str, Any]:
    client, answer = signed_in(cookies)
    if not client:
        return answer
    try:
        threads = client.direct_threads(amount=limit, thread_message_limit=1)
    except Exception as error:
        refusal = refused(error)
        if refusal:
            return refusal
        raise
    return {**answer, "threads": [thread_row(t, answer["userId"]) for t in threads]}


def thread_sync(cookies: dict[str, str], said: str, limit: int) -> dict[str, Any]:
    client, answer = signed_in(cookies)
    if not client:
        return answer
    try:
        found = match_threads(client.direct_threads(amount=INBOX_SEARCH, thread_message_limit=1), said)
        if not found:
            return {"ok": False, "code": "threadNotFound", "detail": f"no thread in the latest {INBOX_SEARCH} matches {said}"}
        if len(found) > 1:
            return {"ok": False, "code": "threadAmbiguous", "detail": f"{said} matches {len(found)} threads: give one's id", "candidates": [{"id": t.id, "title": t.thread_title, "with": [u.username for u in t.users]} for t in found]}
        thread = client.direct_thread(int(found[0].id), amount=limit)
    except Exception as error:
        refusal = refused(error)
        if refusal:
            return refusal
        raise
    names = {str(u.pk): u.username or str(u.pk) for u in thread.users}
    rows = [message_row(m, answer["userId"], names) for m in thread.messages[:limit]]
    rows.reverse()
    return {**answer, "thread": {k: v for k, v in thread_row(thread, answer["userId"]).items() if k != "last"}, "messages": rows}


async def ping(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    return missing_session(cookies) or await asyncio.to_thread(check, cookies)


async def inbox(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    limit = max(1, min(int(spec.get("limit") or 20), 100))
    return missing_session(cookies) or await asyncio.to_thread(inbox_sync, cookies, limit)


async def thread(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    said = str(spec.get("with") or "").strip()
    if not said:
        return {"ok": False, "code": "threadNeeded", "detail": "give the thread: who it is with (their handle), its name, or its id"}
    limit = max(1, min(int(spec.get("limit") or 30), 200))
    return missing_session(cookies) or await asyncio.to_thread(thread_sync, cookies, said, limit)


def recipients_of(client: Any, said: str) -> tuple[dict[str, Any], dict[str, Any]]:
    found = match_threads(client.direct_threads(amount=INBOX_SEARCH, thread_message_limit=1), said)
    if len(found) == 1:
        return {"thread_ids": [int(found[0].id)]}, {"id": found[0].id, "title": found[0].thread_title, "with": [u.username for u in found[0].users]}
    if len(found) > 1:
        raise LookupError(json.dumps({"code": "threadAmbiguous", "detail": f"{said} matches {len(found)} threads: give one's id", "candidates": [{"id": t.id, "title": t.thread_title, "with": [u.username for u in t.users]} for t in found]}))
    handle = said.strip().lstrip("@")
    if handle.isdigit():
        raise LookupError(json.dumps({"code": "threadNotFound", "detail": f"no thread in the latest {INBOX_SEARCH} has the id {said}"}))
    return {"user_ids": [int(client.user_id_from_username(handle))]}, {"id": None, "title": handle, "with": [handle]}


def lines_of(text: str, as_one: bool) -> list[str]:
    if as_one:
        return [text.strip()] if text.strip() else []
    return [line.strip() for line in text.split("\n") if line.strip()]


def send_sync(cookies: dict[str, str], said: str, text: str, photo: str, as_one: bool) -> dict[str, Any]:
    client, answer = signed_in(cookies)
    if not client:
        return answer
    try:
        to, recipient = recipients_of(client, said)
    except LookupError as error:
        return {"ok": False, **json.loads(str(error))}
    except Exception as error:
        refusal = refused(error)
        if refusal:
            return refusal
        return {"ok": False, "code": "recipientNotFound", "detail": f"Instagram has no user {said}"}
    lines = lines_of(text, as_one)
    sent: list[dict[str, Any]] = []
    try:
        if photo:
            message = client.direct_send_photo(Path(photo), **to)
            sent.append({"id": str(message.id), "kind": "photo", "thread": str(message.thread_id or "")})
            to = {"thread_ids": [int(message.thread_id)]} if message.thread_id else to
        for index, line in enumerate(lines):
            if index or photo:
                time.sleep(1.5)
            message = client.direct_send(line, **to)
            sent.append({"id": str(message.id), "kind": "text", "text": line, "thread": str(message.thread_id or "")})
            to = {"thread_ids": [int(message.thread_id)]} if message.thread_id else to
    except Exception as error:
        out = refused(error) or {"ok": False, "code": type(error).__name__, "detail": str(error)[:300]}
        return {**out, "sent": sent}
    return {**answer, "to": recipient, "sent": sent}


def live(event: dict[str, Any]) -> None:
    print(json.dumps({"liveEvent": event}, default=str), flush=True)


def item_of(value: Any) -> dict[str, Any] | None:
    if not isinstance(value, dict):
        return None
    if "item_id" in value or "item_type" in value:
        return value
    for key in ("item", "message"):
        if isinstance(value.get(key), dict):
            return item_of(value[key])
    return None


def message_event(wrapper: dict[str, Any], me: str, names: dict[str, str], titles: dict[str, str]) -> dict[str, Any] | None:
    if str(wrapper.get("op") or "") not in ("add", "replace") or "/items/" not in str(wrapper.get("path") or ""):
        return None
    item = item_of(wrapper)
    if not item or not item.get("item_id"):
        return None
    item_id = str(item["item_id"])
    user = str(item.get("user_id") or "")
    kind = str(item.get("item_type") or "")
    attachments = [{"name": f"voice_{item_id}.m4a", "type": "audio/mp4"}] if kind == "voice_media" else []
    text = media.text_with_audio(item.get("text"), attachments) or ("" if kind == "text" else f"({kind})")
    stamp = int(item.get("timestamp") or 0)
    thread_id = str(wrapper.get("thread_id") or "")
    return {
        "type": "message",
        "thread": thread_id,
        "title": titles.get(thread_id),
        "itemId": item_id,
        "userId": user,
        "from": "me" if user == me else names.get(user, user),
        "fromMe": user == me,
        "kind": kind,
        "text": text,
        "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(stamp / 1_000_000)) if stamp else None,
    }


def watch_sync(cookies: dict[str, str], seconds: int) -> dict[str, Any]:
    client, answer = signed_in(cookies)
    if not client:
        return answer
    me = str(answer["userId"])
    threads = client.direct_threads(amount=INBOX_SEARCH, thread_message_limit=1)
    names = {str(u.pk): u.username or str(u.pk) for t in threads for u in t.users}
    titles = {str(t.id): t.thread_title for t in threads}
    seen: set[str] = set()
    counts = {"message": 0}

    def on_message(payload: Any) -> None:
        wrapper = payload.get("message") if isinstance(payload, dict) else None
        event = message_event(wrapper, me, names, titles) if isinstance(wrapper, dict) else None
        if not event or event["itemId"] in seen:
            return
        seen.add(event["itemId"])
        counts["message"] += 1
        live(event)

    try:
        client.realtime_on("message", on_message)
        realtime = client.realtime_connect()
        realtime.direct_subscribe(amount=1)
    except Exception as error:
        refusal = refused(error)
        if refusal:
            return refusal
        return {"ok": False, "code": "realtimeRefused", "detail": f"Instagram's realtime (edge-mqtt.facebook.com) didn't take this session: {str(error)[:200]}", "loginState": "unknown", "event": "dropped"}
    live({"type": "watching", "host": "edge-mqtt.facebook.com", "seconds": seconds, "threads": len(threads)})
    started = time.monotonic()
    pinged = started
    try:
        while not seconds or time.monotonic() - started < seconds:
            try:
                client.realtime_read_once()
            except (socket.timeout, TimeoutError):
                pass
            if time.monotonic() - pinged >= PING_EVERY:
                client.realtime_ping()
                pinged = time.monotonic()
    except (ConnectionError, OSError) as error:
        return {"ok": False, "code": "realtimeDropped", "detail": f"Instagram closed the realtime connection: {str(error)[:200]}", "loginState": "unknown", "counts": counts, "event": "dropped"}
    finally:
        try:
            client.realtime_disconnect()
        except Exception:
            pass
    return {**answer, "watchedSeconds": seconds, "counts": counts}


async def send(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    said = str(spec.get("with") or "").strip()
    text = str(spec.get("text") or "")
    photo = str(spec.get("photo") or "").strip()
    if not said:
        return {"ok": False, "code": "threadNeeded", "detail": "give who it goes to: their handle, a thread's name, or its id"}
    if not text.strip() and not photo:
        return {"ok": False, "code": "nothingToSend", "detail": "give the text, a photo, or both"}
    if photo and not Path(photo).is_file():
        return {"ok": False, "code": "photoMissing", "detail": f"no file at {photo}"}
    return missing_session(cookies) or await asyncio.to_thread(send_sync, cookies, said, text, photo, bool(spec.get("asOne")))


async def watch(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    seconds = int(spec.get("seconds") or 0)
    seconds = 0 if seconds <= 0 else max(5, min(seconds, 86400))
    return missing_session(cookies) or await asyncio.to_thread(watch_sync, cookies, seconds)


ACTIONS = {"ping": ping, "inbox": inbox, "thread": thread, "send": send, "watch": watch}


if __name__ == "__main__":
    raise SystemExit(kit.main(ACTIONS, WRITES, LIBRARY))
