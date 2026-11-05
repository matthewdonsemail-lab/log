from __future__ import annotations

import asyncio
import contextvars
import json
import os
import socket
import sys
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
VENDOR = ROOT.parent / "vendor"
for p in (str(ROOT), str(VENDOR / "instagrapi")):
    if p not in sys.path:
        sys.path.insert(0, p)

from platformKit import engine as kit
from platformKit import media
from platformKit import reactions

PLATFORM = "instagram"
LIBRARY = "vendor/instagrapi"
WRITES: tuple[str, ...] = ("send", "react", "voice")
SESSION_COOKIES = ("sessionid",)
TRANSPORT = "curl"
INBOX_SEARCH = 100
PING_EVERY = 60
SESSION: dict[str, Any] = {}
HTTP = threading.Lock()
LIVE_TARGET: contextvars.ContextVar[Any] = contextvars.ContextVar("LIVE_TARGET", default=None)
REALTIME: dict[str, Any] = {}
STOPPING = threading.Event()
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
    held = SESSION.get("held")
    if held and held["sessionid"] == cookies["sessionid"]:
        return held["client"], {**held["answer"], "reused": True}
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
    answer = {"ok": True, "loginState": "loggedIn", "screenName": client.username, "userId": user_id, "transport": TRANSPORT}
    SESSION["held"] = {"sessionid": cookies["sessionid"], "client": client, "answer": answer}
    return client, {**answer, "reused": False}


def locked(work: Any, *args: Any) -> dict[str, Any]:
    with HTTP:
        out = work(*args)
    if out.get("code") in ("sessionDead", "sessionMismatch", "challenged"):
        SESSION.pop("held", None)
    return out


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
    return missing_session(cookies) or await asyncio.to_thread(locked, check, cookies)


async def inbox(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    limit = max(1, min(int(spec.get("limit") or 20), 100))
    return missing_session(cookies) or await asyncio.to_thread(locked, inbox_sync, cookies, limit)


async def thread(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    said = str(spec.get("with") or "").strip()
    if not said:
        return {"ok": False, "code": "threadNeeded", "detail": "give the thread: who it is with (their handle), its name, or its id"}
    limit = max(1, min(int(spec.get("limit") or 30), 200))
    return missing_session(cookies) or await asyncio.to_thread(locked, thread_sync, cookies, said, limit)


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


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def heard_since(account: str, thread: str, since: str) -> list[dict[str, Any]]:
    path = Path(os.environ.get("LOG_INBOX_STATE") or Path.home() / ".logCli" / "inbox") / "pending.jsonl"
    if not account or not thread or not path.is_file():
        return []
    heard: list[dict[str, Any]] = []
    kept: set[tuple[str, str]] = set()
    for line in path.read_text(encoding="utf-8").splitlines():
        try:
            message = json.loads(line)
        except ValueError:
            continue
        if message.get("platform") != "instagram" or message.get("account") != account or str(message.get("conversationId")) != thread:
            continue
        if str(message.get("seenAt") or message.get("at") or "") <= since:
            continue
        key = (str(message.get("at")), str(message.get("text")))
        if key in kept:
            continue
        kept.add(key)
        heard.append(message)
    return heard


def send_sync(cookies: dict[str, str], said: str, text: str, photo: str, as_one: bool, account: str = "") -> dict[str, Any]:
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
    started = utc_now()
    try:
        if photo:
            message = client.direct_send_photo(Path(photo), **to)
            sent.append({"id": str(message.id), "kind": "photo", "thread": str(message.thread_id or "")})
            to = {"thread_ids": [int(message.thread_id)]} if message.thread_id else to
        for index, line in enumerate(lines):
            if index or photo:
                time.sleep(1.5)
                heard = heard_since(account, str(sent[-1].get("thread") or ""), started) if sent else []
                if heard:
                    return {**answer, "to": recipient, "sent": sent, "interrupted": heard, "held": lines[index:]}
            message = client.direct_send(line, **to)
            sent.append({"id": str(message.id), "kind": "text", "text": line, "thread": str(message.thread_id or "")})
            to = {"thread_ids": [int(message.thread_id)]} if message.thread_id else to
    except Exception as error:
        out = refused(error) or {"ok": False, "code": type(error).__name__, "detail": str(error)[:300]}
        return {**out, "sent": sent}
    return {**answer, "to": recipient, "sent": sent}


def write_line(writer: Any, line: str) -> None:
    writer.write((line + "\n").encode("utf-8"))


def emit(target: Any, event: dict[str, Any]) -> None:
    line = json.dumps({"liveEvent": event}, default=str)
    if target is None:
        print(line, flush=True)
        return
    loop, writer = target
    loop.call_soon_threadsafe(write_line, writer, line)


def live(event: dict[str, Any]) -> None:
    emit(LIVE_TARGET.get(), event)


def item_of(value: Any) -> dict[str, Any] | None:
    if not isinstance(value, dict):
        return None
    if "item_id" in value or "item_type" in value:
        return value
    for key in ("item", "message"):
        if isinstance(value.get(key), dict):
            return item_of(value[key])
    return None


def media_ref_of(item: dict[str, Any]) -> dict[str, str] | None:
    item_id = str(item.get("item_id") or "")
    if str(item.get("item_type") or "") == "animated_media":
        url = (((item.get("animated_media") or {}).get("images") or {}).get("fixed_height") or {}).get("url")
        return {"url": str(url), "name": f"{item_id}.gif", "type": "image/gif"} if url else None
    found = item.get("media") or (item.get("visual_media") or {}).get("media") or {}
    if not isinstance(found, dict):
        return None
    videos = found.get("video_versions") or []
    if videos and videos[0].get("url"):
        return {"url": str(videos[0]["url"]), "name": f"{item_id}.mp4", "type": "video/mp4"}
    candidates = (found.get("image_versions2") or {}).get("candidates") or []
    if candidates and candidates[0].get("url"):
        return {"url": str(candidates[0]["url"]), "name": f"{item_id}.jpg", "type": "image/jpeg"}
    return None


def saved_media(client: Any, thread_id: str, ref: dict[str, str]) -> dict[str, Any]:
    plain = {"name": ref["name"], "type": ref["type"]}
    root = REALTIME.get("stateRoot")
    if not root:
        return {**plain, "error": "no state folder to keep the file in"}
    path = media.media_dir({"stateRoot": root, "account": REALTIME.get("account") or "instagram"}, thread_id) / ref["name"]
    if path.is_file() and path.stat().st_size:
        return {**plain, "path": str(path)}
    with HTTP:
        response = client.private.get(ref["url"], timeout=30)
    if response.status_code != 200:
        return {**plain, "error": f"Instagram answered {response.status_code} to the file"}
    if len(response.content) > media.VISUAL_MAX_BYTES:
        return {**plain, "error": f"the file is over the {media.VISUAL_MAX_BYTES // 1024 // 1024} MB kept"}
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(response.content)
    return {**plain, "path": str(path)}


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
        **({"media": media_ref_of(item)} if media_ref_of(item) and user != me else {}),
    }


class Realtime:
    def __init__(self, client: Any, me: str, names: dict[str, str], titles: dict[str, str]) -> None:
        self.client = client
        self.me = me
        self.names = names
        self.titles = titles
        self.listeners: dict[int, Any] = {}
        self.seen: set[str] = set()
        self.alive = False
        self.error = ""
        self.started = time.time()
        self.thread: threading.Thread | None = None

    def dispatch(self, payload: Any) -> None:
        wrapper = payload.get("message") if isinstance(payload, dict) else None
        event = message_event(wrapper, self.me, self.names, self.titles) if isinstance(wrapper, dict) else None
        if not event or event["itemId"] in self.seen:
            return
        self.seen.add(event["itemId"])
        ref = event.pop("media", None)
        if ref:
            threading.Thread(target=self.save_then_emit, args=(event, ref), name="instagramMedia", daemon=True).start()
            return
        self.emit(event)

    def emit(self, event: dict[str, Any]) -> None:
        for listener in list(self.listeners.values()):
            listener(event)

    def save_then_emit(self, event: dict[str, Any], ref: dict[str, str]) -> None:
        try:
            event["attachments"] = [saved_media(self.client, str(event.get("thread") or ""), ref)]
        except Exception as e:
            event["attachments"] = [{"name": ref["name"], "type": ref["type"], "error": str(e)[:200]}]
        self.emit(event)

    def start(self) -> None:
        self.client.realtime_on("message", self.dispatch)
        realtime = self.client.realtime_connect()
        realtime.direct_subscribe(amount=1)
        self.alive = True
        self.thread = threading.Thread(target=self.run, name="instagramRealtime", daemon=True)
        self.thread.start()

    def run(self) -> None:
        pinged = time.monotonic()
        try:
            while self.alive and not STOPPING.is_set():
                try:
                    self.client.realtime_read_once()
                except (socket.timeout, TimeoutError):
                    pass
                if time.monotonic() - pinged >= PING_EVERY:
                    self.client.realtime_ping()
                    pinged = time.monotonic()
        except (ConnectionError, OSError) as error:
            self.error = str(error)[:200]
        finally:
            self.alive = False
            try:
                self.client.realtime_disconnect()
            except Exception:
                pass


def realtime_for(client: Any, me: str) -> tuple[Any, bool]:
    held = REALTIME.get("held")
    if held and held.alive and held.client is client:
        return held, True
    threads = client.direct_threads(amount=INBOX_SEARCH, thread_message_limit=1)
    names = {str(u.pk): u.username or str(u.pk) for t in threads for u in t.users}
    titles = {str(t.id): t.thread_title for t in threads}
    realtime = Realtime(client, me, names, titles)
    realtime.start()
    REALTIME["held"] = realtime
    return realtime, False


def watch_sync(cookies: dict[str, str], seconds: int, target: Any = None) -> dict[str, Any]:
    try:
        with HTTP:
            client, answer = signed_in(cookies)
            if not client:
                return answer
            realtime, shared = realtime_for(client, str(answer["userId"]))
    except Exception as error:
        refusal = refused(error)
        if refusal:
            SESSION.pop("held", None)
            return refusal
        return {"ok": False, "code": "realtimeRefused", "detail": f"Instagram's realtime (edge-mqtt.facebook.com) didn't take this session: {str(error)[:200]}", "loginState": "unknown", "event": "dropped"}
    counts = {"message": 0}

    def listener(event: dict[str, Any]) -> None:
        counts["message"] += 1
        emit(target, event)

    key = id(listener)
    realtime.listeners[key] = listener
    emit(target, {"type": "watching", "host": "edge-mqtt.facebook.com", "seconds": seconds, "threads": len(realtime.titles), "shared": shared})
    started = time.monotonic()
    try:
        while realtime.alive and not STOPPING.is_set() and (not seconds or time.monotonic() - started < seconds):
            time.sleep(0.5)
    finally:
        realtime.listeners.pop(key, None)
    if not realtime.alive:
        return {"ok": False, "code": "realtimeDropped", "detail": f"Instagram closed the realtime connection: {realtime.error or 'no reason given'}", "loginState": "unknown", "counts": counts, "event": "dropped"}
    return {**answer, "watchedSeconds": seconds, "counts": counts, "sharedConnection": shared}


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
    return missing_session(cookies) or await asyncio.to_thread(locked, send_sync, cookies, said, text, photo, bool(spec.get("asOne")), str(spec.get("account") or ""))


def curl_voice_rupload(client: Any, audio_bytes: bytes, upload_id: str, rand_key: int) -> int:
    from instagrapi.exceptions import ClientError
    from instagrapi.transports import create_curl_h2_adapter

    entity = f"{upload_id}_0_{rand_key}"
    url = f"https://rupload.facebook.com/messenger_audio/{entity}"
    session = type(client.private)()
    session.mount("https://", create_curl_h2_adapter())
    session.verify = client.tls_verify
    if getattr(client, "proxy", None):
        session.proxies = {"http": client.proxy, "https": client.proxy}
    headers = client._messenger_rupload_headers({"audio_type": "FILE_ATTACHMENT"})
    try:
        offered = session.get(url, headers=headers, timeout=30)
        if offered.status_code != 200:
            raise ClientError(f"messenger_audio offset GET failed: {offered.status_code} {offered.text[:300]}")
        try:
            offset = int(offered.json().get("offset", 0))
        except Exception:
            offset = 0
        posted = session.post(url, data=audio_bytes[offset:], headers={**headers, "content-type": "application/octet-stream", "offset": str(offset), "x-entity-length": str(len(audio_bytes)), "x-entity-name": entity, "x-entity-type": "audio/mp4"}, timeout=120)
        if posted.status_code != 200:
            raise ClientError(f"messenger_audio upload POST failed: {posted.status_code} {posted.text[:300]}")
        try:
            return int(posted.json()["media_id"])
        except Exception as error:
            raise ClientError(f"messenger_audio response missing media_id: {posted.text[:300]}") from error
    finally:
        session.close()


def voice_sync(cookies: dict[str, str], said: str, path: Path, levels: list[float]) -> dict[str, Any]:
    import types

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
    client._voice_rupload = types.MethodType(curl_voice_rupload, client)
    try:
        message = client.direct_send_voice(path, waveform=levels or None, **to)
    except Exception as error:
        return refused(error) or {"ok": False, "code": "voiceNoteRefused", "detail": f"Instagram refused the voice note: {str(error)[:300]}", "loginState": "loggedIn"}
    return {**answer, "event": "sent", "mode": "voice", "to": recipient, "messageId": str(message.id), "thread": str(message.thread_id or "")}


async def voice(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    said = str(spec.get("with") or "").strip()
    path = media.voice_note_path(spec.get("path"), ".m4a")
    levels = [max(0.0, min(1.0, float(x))) for x in (spec.get("levels") or []) if isinstance(x, (int, float))]
    if not said or not path:
        return {"ok": False, "code": "voiceNoteInvalid", "detail": "voice needs who it goes to and a voice note log made itself (an .m4a under ~/.logCli/voiceNotes): no other audio is sent"}
    return missing_session(cookies) or await asyncio.to_thread(locked, voice_sync, cookies, said, path, levels)


def react_sync(cookies: dict[str, str], thread_id: str, item_id: str, emoji: str, remove: bool) -> dict[str, Any]:
    client, answer = signed_in(cookies)
    if not client:
        return answer
    try:
        done = (client.direct_delete_reaction if remove else client.direct_send_reaction)(int(thread_id), int(item_id), emoji)
    except Exception as error:
        refusal = refused(error)
        if refusal:
            return refusal
        return {"ok": False, "code": "reactRefused", "detail": f"Instagram refused the reaction: {str(error)[:200]}", "loginState": "loggedIn"}
    if not done:
        return {"ok": False, "code": "reactRefused", "detail": f"Instagram didn't take the reaction {emoji} on item {item_id}", "loginState": "loggedIn"}
    return {"ok": True, "loginState": "loggedIn", "event": "sent", "mode": "react", "removed": remove, "thread": thread_id, "itemId": item_id, "emoji": emoji}


async def react(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    thread_id, item_id = str(spec.get("thread") or "").strip(), str(spec.get("itemId") or "").strip()
    emoji = reactions.unicode_of(str(spec.get("emoji") or ""))
    if not thread_id.isdigit() or not item_id.isdigit() or not emoji:
        return {"ok": False, "code": "reactInvalid", "detail": "react needs the thread id, the message's item id and an emoji"}
    return missing_session(cookies) or await asyncio.to_thread(locked, react_sync, cookies, thread_id, item_id, emoji, spec.get("remove") is True)


async def watch(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    seconds = int(spec.get("seconds") or 0)
    seconds = 0 if seconds <= 0 else max(5, min(seconds, 86400))
    if spec.get("stateRoot"):
        REALTIME["stateRoot"] = str(spec["stateRoot"])
        REALTIME["account"] = str(spec.get("account") or "")
    return missing_session(cookies) or await asyncio.to_thread(watch_sync, cookies, seconds, LIVE_TARGET.get())


ACTIONS = {"ping": ping, "inbox": inbox, "thread": thread, "send": send, "react": react, "voice": voice, "watch": watch}


def main() -> int:
    if os.environ.get("LOG_INSTAGRAM_HOST") == "inline":
        return kit.main(ACTIONS, WRITES, LIBRARY)
    from instagramApi import host

    out = host.call(json.loads(Path(sys.argv[1]).read_text(encoding="utf-8")))
    print(json.dumps(out, default=str))
    return 0 if out.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
