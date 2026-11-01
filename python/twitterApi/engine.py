from __future__ import annotations

import asyncio
import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
VENDOR = ROOT.parent / "vendor"
for p in (str(ROOT), str(VENDOR / "twikit"), str(VENDOR / "fbk" / "src")):
    if p not in sys.path:
        sys.path.insert(0, p)

SECRET_KEYS = ("auth_token", "ct0", "twid", "kdt", "att", "password", "cookie")
READS = ("ping", "follows", "inbox", "followers", "xchatContacts", "xchatUnlock", "xchatWatch")
WRITES = ("reply", "quote", "like", "repost", "dm", "follow", "post")
ACTIONS = READS + WRITES


def state_root() -> Path:
    return Path(os.environ.get("LOG_TWITTER_STATE") or Path.home() / ".logCli" / "twitter")


def state_dir(account: str) -> Path:
    folder = state_root() / account
    folder.mkdir(parents=True, exist_ok=True)
    return folder


def _domain_rank(domain: Any) -> int:
    host = str(domain or "").lower()
    if "x.com" in host or "twitter.com" in host:
        return 0
    return 1 if host else 2


def normalize_cookies(raw: Any) -> dict[str, str]:
    if isinstance(raw, str):
        text = raw.strip()
        if text[:1] in "[{":
            try:
                return normalize_cookies(json.loads(text))
            except json.JSONDecodeError:
                pass
        out: dict[str, str] = {}
        for part in re.split(r";\s*", text):
            if "=" in part:
                name, _, value = part.partition("=")
                out[name.strip()] = value.strip()
        return {k: v for k, v in out.items() if k != "__cf_bm"}
    if isinstance(raw, dict):
        return {str(k): str(v) for k, v in raw.items() if v is not None and k != "__cf_bm"}
    if isinstance(raw, (list, tuple)):
        pairs = sorted((i for i in raw if isinstance(i, dict) and "name" in i), key=lambda i: -_domain_rank(i.get("domain")))
        out = {str(i["name"]): str(i.get("value") or "") for i in pairs}
        for item in raw:
            if isinstance(item, (list, tuple)) and len(item) == 2:
                out[str(item[0])] = str(item[1])
        return {k: v for k, v in out.items() if k != "__cf_bm"}
    return {}


def has_session(cookies: dict[str, str]) -> bool:
    return bool(cookies.get("auth_token") and cookies.get("ct0"))


def own_user_id(cookies: dict[str, str]) -> str | None:
    match = re.search(r"u=(\d+)", unquote(cookies.get("twid", "")))
    return match.group(1) if match else None


def redact(text: Any, cookies: dict[str, str]) -> str:
    out = str(text or "")
    for value in cookies.values():
        if value and len(value) >= 8:
            out = out.replace(value, "***")
    for key in SECRET_KEYS:
        out = re.sub(rf'("{key}"\s*:\s*)"[^"]*"', r'\1"***"', out, flags=re.IGNORECASE)
        out = re.sub(rf"{key}=[^&;\s]+", f"{key}=***", out, flags=re.IGNORECASE)
    return out


def governor_for(account: str, writes_per_day: int | None = None) -> Any:
    from dataclasses import replace

    from governor import GovernorConfig, RequestGovernor

    config = GovernorConfig.from_env()
    if writes_per_day and "FBK_GOVERNOR_MUTATION_DAILY" not in os.environ:
        config = replace(config, mutation_daily_cap=int(writes_per_day))
    return RequestGovernor(config=config, state_path=state_dir(account) / "governor_state.json")


def governor_status(account: str, writes_per_day: int | None = None) -> dict[str, Any]:
    return {"ok": True, "account": account, "governor": governor_for(account, writes_per_day).status()}


TRANSACTION_SECONDS = 3 * 3600
LOCK_WAIT_SECONDS = 900
SPACING_SECONDS = (4.0, 11.0)
UNLOCKED = ("xchatWatch",)


def transaction_path(account: str) -> Path:
    return state_dir(account) / "clientTransaction.json"


def restore_transaction(client: Any, account: str, now: float | None = None) -> bool:
    path = transaction_path(account)
    try:
        saved = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return False
    if (now or time.time()) - float(saved.get("savedAt") or 0) > TRANSACTION_SECONDS:
        return False
    return bool(client.client_transaction.restore(saved.get("state")))


def keep_transaction(client: Any, account: str, now: float | None = None) -> None:
    state = client.client_transaction.state()
    if not state:
        return
    path = transaction_path(account)
    try:
        saved = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        saved = {}
    if saved.get("state") == state:
        return
    path.write_text(json.dumps({"savedAt": now or time.time(), "state": state}), encoding="utf-8")


class AccountBusy(Exception):
    pass


class AccountLock:
    def __init__(self, account: str, wait_seconds: float = LOCK_WAIT_SECONDS) -> None:
        self.path = state_dir(account) / "engine.lock"
        self.wait_seconds = wait_seconds
        self.handle: Any = None

    def _try(self) -> bool:
        if os.name == "nt":
            import msvcrt
            try:
                self.handle.seek(0)
                msvcrt.locking(self.handle.fileno(), msvcrt.LK_NBLCK, 1)
                return True
            except OSError:
                return False
        import fcntl
        try:
            fcntl.flock(self.handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
            return True
        except OSError:
            return False

    async def __aenter__(self) -> "AccountLock":
        self.handle = open(self.path, "a+b")
        deadline = time.time() + self.wait_seconds
        while not self._try():
            if time.time() > deadline:
                self.handle.close()
                raise AccountBusy(f"another log twitter call held this account for over {int(self.wait_seconds)} s")
            await asyncio.sleep(0.5)
        return self

    async def __aexit__(self, *_: Any) -> None:
        if os.name == "nt":
            import msvcrt
            try:
                self.handle.seek(0)
                msvcrt.locking(self.handle.fileno(), msvcrt.LK_UNLCK, 1)
            except OSError:
                pass
        self.handle.close()


def last_call_path(account: str) -> Path:
    return state_dir(account) / "lastCall.json"


def spacing_wait(account: str, now: float | None = None, draw: Any = None) -> float:
    import random
    try:
        last = float(json.loads(last_call_path(account).read_text(encoding="utf-8")).get("at") or 0)
    except (OSError, json.JSONDecodeError, ValueError):
        return 0.0
    gap = (draw or random.uniform)(*SPACING_SECONDS)
    return max(0.0, last + gap - (now or time.time()))


def mark_call(account: str, now: float | None = None) -> None:
    last_call_path(account).write_text(json.dumps({"at": now or time.time()}), encoding="utf-8")


async def session_answer(client: Any) -> int:
    from twikit.constants import TOKEN

    cookies = client.get_cookies()
    resp = await client.http.request(
        "GET",
        "https://api.x.com/1.1/account/settings.json",
        headers={
            "authorization": f"Bearer {TOKEN}",
            "x-csrf-token": cookies.get("ct0", ""),
            "x-twitter-auth-type": "OAuth2Session",
            "x-twitter-active-user": "yes",
            "User-Agent": client._user_agent,
        },
    )
    client.set_cookies(cookies, clear_cookies=True)
    return resp.status_code


def page_title(text: str) -> str | None:
    match = re.search(r"<title>(.*?)</title>", text, re.S)
    return re.sub(r"\s+", " ", match.group(1)).strip() if match else None


def blocked_answer(error: Exception, step: str, state: str) -> dict[str, Any] | None:
    text = str(error)
    if "cloudflare" not in text.lower() and "you have been blocked" not in text.lower():
        return None
    return {"ok": False, "code": "cloudflareBlocked", "detail": f"Cloudflare answered the {step} with its block page ({page_title(text) or 'no title'}: you have been blocked, unable to access x.com)", "loginState": state, "step": step, "httpStatus": getattr(getattr(error, "response", None), "status_code", 403)}


def login_state_of(status: int) -> str:
    if status in (401, 403):
        return "loggedOut"
    if status in (200, 404):
        return "loggedIn"
    return "unknown"


async def ping(client: Any, cookies: dict[str, str]) -> dict[str, Any]:
    from twikit.errors import AccountLocked, AccountSuspended, Forbidden, Unauthorized

    status = await session_answer(client)
    state = login_state_of(status)
    if state != "loggedIn":
        return {"ok": False, "code": "sessionDead" if state == "loggedOut" else "sessionUnknown", "detail": f"X answered HTTP {status} to the session check", "loginState": state, "httpStatus": status}
    user_id = own_user_id(cookies)
    if not user_id:
        return {"ok": False, "code": "twidMissing", "detail": "the twid cookie is missing or malformed, so the account's id is unknown", "loginState": "unknown", "httpStatus": status}
    try:
        user = await client.get_user_by_id(user_id)
    except (AccountSuspended, AccountLocked) as e:
        return {"ok": False, "code": "accountRestricted", "detail": type(e).__name__, "loginState": "restricted", "httpStatus": status}
    except Unauthorized:
        return {"ok": False, "code": "sessionDead", "detail": "X rejected the session on the profile read", "loginState": "loggedOut", "httpStatus": status}
    except Forbidden as e:
        blocked = blocked_answer(e, "profileRead", "loggedIn")
        if blocked:
            return blocked
        return {"ok": False, "code": "forbidden", "detail": f"X answered 403 to the profile read ({page_title(str(e)) or str(e)[:120]})", "loginState": "unknown", "httpStatus": 403}
    return {"ok": True, "loginState": "loggedIn", "httpStatus": status, "userId": user_id, "screenName": getattr(user, "screen_name", None), "name": getattr(user, "name", None)}


def tweet_id_from_url(url: str) -> str:
    path = urlparse(url).path.rstrip("/")
    return path.split("/status/")[-1] if "/status/" in path else path.split("/")[-1]


def limits_of(response: Any) -> dict[str, str]:
    headers = getattr(response, "headers", None) or {}
    return {h: headers.get(h) for h in ("x-rate-limit-limit", "x-rate-limit-remaining", "x-rate-limit-reset") if headers.get(h) is not None}


def reset_of(limits: dict[str, str]) -> int | None:
    if str(limits.get("x-rate-limit-remaining")) == "0" and str(limits.get("x-rate-limit-reset", "")).isdigit():
        return int(limits["x-rate-limit-reset"])
    return None


def event_of(error: Exception) -> str:
    from twikit.errors import AccountLocked, AccountSuspended, DuplicateTweet, TooManyRequests, TweetNotAvailable, Unauthorized

    text = str(error)
    if isinstance(error, Unauthorized):
        return "sessionDead"
    if isinstance(error, (AccountSuspended, AccountLocked)):
        return "restricted"
    if re.search(r"\b344\b", text):
        return "dailyLimit"
    if re.search(r"\b226\b", text) or "automated" in text.lower():
        return "automated"
    if isinstance(error, TweetNotAvailable) or re.search(r"\b(385|433)\b", text):
        return "gone"
    if isinstance(error, DuplicateTweet) or re.search(r"\b187\b", text):
        return "duplicate"
    if isinstance(error, TooManyRequests) or "cloudflare" in text.lower() or "you have been blocked" in text.lower():
        return "throttled"
    return "failed"


MEDIA_CATEGORIES = {".mp4": "tweet_video", ".mov": "tweet_video", ".gif": "tweet_gif"}
MEDIA_PROCESSING_SECONDS = 300


async def upload_post_media(client: Any, paths: list[str]) -> list[str]:
    ids = []
    for path in paths:
        category = MEDIA_CATEGORIES.get(Path(path).suffix.lower(), "tweet_image")
        moving = category != "tweet_image"
        media_id = await asyncio.wait_for(
            client.upload_media(path, wait_for_completion=moving, media_category=category),
            timeout=MEDIA_PROCESSING_SECONDS,
        )
        if not str(media_id or ""):
            raise RuntimeError(f"x gave no media id for {Path(path).name}: nothing was posted")
        ids.append(str(media_id))
    return ids


def keep_create_answers(client: Any) -> dict[str, Any]:
    raw: dict[str, Any] = {}
    create = client.gql.create_tweet

    async def keep(*args: Any, **kwargs: Any) -> Any:
        answer = await create(*args, **kwargs)
        raw["body"] = answer[0]
        raw["limits"] = limits_of(answer[1])
        return answer

    client.gql.create_tweet = keep
    return raw


async def follows(client: Any, cookies: dict[str, str], handles: list[str]) -> dict[str, Any]:
    me = getattr(await client.get_user_by_id(own_user_id(cookies)), "screen_name", None)
    checked = []
    for handle in handles:
        try:
            data, _ = await client.get(
                "https://x.com/i/api/1.1/friendships/show.json",
                params={"source_screen_name": me, "target_screen_name": handle},
                headers=client._base_headers,
            )
            relationship = (data or {}).get("relationship") or {}
            checked.append({"handle": handle, "followsYou": bool((relationship.get("target") or {}).get("following")), "youFollow": bool((relationship.get("source") or {}).get("following"))})
        except Exception as e:
            checked.append({"handle": handle, "error": redact(e, cookies)[:200], "event": event_of(e)})
        await asyncio.sleep(1.5)
    return {"ok": True, "loginState": "loggedIn", "screenName": me, "checked": checked}



INBOX_PARAMS = {
    "nsfw_filtering_enabled": "false",
    "filter_low_quality": "true",
    "include_quality": "all",
    "include_profile_interstitial_type": "1",
    "include_blocking": "1",
    "include_blocked_by": "1",
    "include_followed_by": "1",
    "include_want_retweets": "1",
    "include_mute_edge": "1",
    "include_can_dm": "1",
    "include_can_media_tag": "1",
    "include_ext_is_blue_verified": "1",
    "skip_status": "1",
    "dm_secret_conversations_enabled": "false",
    "krs_registration_enabled": "true",
    "cards_platform": "Web-12",
    "include_cards": "1",
    "include_ext_alt_text": "true",
    "include_quote_count": "true",
    "include_reply_count": "1",
    "tweet_mode": "extended",
    "include_ext_collab_control": "true",
    "dm_users": "true",
    "include_groups": "true",
    "include_inbox_timelines": "true",
    "supports_reactions": "true",
    "supports_edit": "true",
}

DM_INBOX = "https://x.com/i/api/1.1/dm/inbox_initial_state.json"
DM_TIMELINE = "https://x.com/i/api/1.1/dm/inbox_timeline/{}.json"
DM_CONVERSATION = "https://x.com/i/api/1.1/dm/conversation/{}.json"


def iso_of(ms: Any) -> str | None:
    from datetime import datetime, timezone

    return datetime.fromtimestamp(int(ms) / 1000, timezone.utc).isoformat().replace("+00:00", "Z") if str(ms or "").isdigit() else None


def id_key(value: Any) -> int:
    text = str(value or "")
    return int(text) if text.isdigit() else 0


def messages_of(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    out = []
    for entry in entries or []:
        message = entry.get("message") if isinstance(entry, dict) else None
        if not message:
            continue
        data = message.get("message_data") or {}
        out.append({"id": str(message.get("id") or data.get("id") or ""), "conversationId": str(message.get("conversation_id") or ""), "time": iso_of(message.get("time") or data.get("time")), "senderId": str(data.get("sender_id") or ""), "recipientId": str(data.get("recipient_id") or "") or None, "text": data.get("text") or ""})
    return out


def merge_state(into: dict[str, Any], state: dict[str, Any], box: str | None) -> int:
    added = 0
    for cid, c in (state.get("conversations") or {}).items():
        if cid not in into["conversations"]:
            added += 1
        into["conversations"][cid] = c
        into["boxes"][cid] = box or ("request" if c.get("trusted") is False else "inbox")
    into["users"].update(state.get("users") or {})
    into["messages"].extend(messages_of(state.get("entries") or []))
    return added


def user_of(users: dict[str, Any], user_id: str) -> dict[str, Any]:
    user = users.get(user_id) or {}
    return {"userId": user_id, "handle": user.get("screen_name"), "name": user.get("name"), "followsYou": user.get("followed_by"), "youFollow": user.get("following")}


def thread_of(conversation: dict[str, Any], messages: list[dict[str, Any]], users: dict[str, Any], me: str, box: str) -> dict[str, Any]:
    cid = str(conversation.get("conversation_id") or "")
    mine = sorted((m for m in messages if m["conversationId"] == cid), key=lambda m: id_key(m["id"]))
    last = mine[-1] if mine else None
    participants = conversation.get("participants") or []
    people = [user_of(users, str(p.get("user_id"))) for p in participants if str(p.get("user_id")) != me]
    read_up_to = next((str(p.get("last_read_event_id") or "") for p in participants if str(p.get("user_id")) == me), "")
    last_id = str(conversation.get("max_entry_id") or (last or {}).get("id") or "")
    last_from_me = bool(last and last["senderId"] == me)
    unread = id_key(last_id) > id_key(read_up_to) if read_up_to else bool(last and not last_from_me)
    their_read = max((str(p.get("last_read_event_id") or "") for p in participants if str(p.get("user_id")) != me and p.get("last_read_event_id")), key=id_key, default="")
    opened = bool(last_from_me and their_read and id_key(their_read) >= id_key(str(last["id"])))
    return {
        "conversationId": cid,
        "box": box,
        "type": "group" if conversation.get("type") == "GROUP_DM" else "oneToOne",
        "name": conversation.get("name"),
        "with": people,
        "lastAt": iso_of(conversation.get("sort_timestamp")) or (last or {}).get("time"),
        "lastFromMe": last_from_me,
        "lastText": (last or {}).get("text"),
        "unread": bool(unread and not last_from_me),
        "openedByThem": opened,
        "messagesLoaded": len(mine),
    }


def xchat_message(m: dict[str, Any], me: str, handles: dict[str, str]) -> dict[str, Any]:
    sender = str(m.get("sender_id") or "")
    return {"id": str(m.get("event_id") or ""), "conversationId": str(m.get("conversation_id") or ""), "time": iso_of(m.get("time_ms")), "senderId": sender, "recipientId": None, "text": m.get("text") if m.get("text") is not None else f"(could not open: {m.get('error') or 'no key'})", "fromMe": sender == me, "from": handles.get(sender)}


async def xchat_read(client: Any, spec: dict[str, Any]) -> dict[str, list[dict[str, Any]]] | None:
    pin_path = spec.get("pinPath")
    if not pin_path:
        return None
    try:
        await xchat_read_keys(client, spec)
    except Exception as e:
        raise XChatLocked(str(e)) from e
    return await client.get_xchat_messages()


async def xchat_read_keys(client: Any, spec: dict[str, Any]) -> None:
    await client.unlock_xchat(Path(spec["pinPath"]).read_text(encoding="utf-8").strip())


class XChatLocked(Exception):
    pass


async def xchat_threads(client: Any, me: str, opened: dict[str, list[dict[str, Any]]] | None = None) -> list[dict[str, Any]]:
    convs = await client.get_xchat_conversations()
    out = []
    for conv in convs:
        people = [{"userId": uid, "handle": (conv.get("handles") or {}).get(uid)} for uid in conv.get("participant_ids") or []]
        last_ms = conv.get("last_time_ms")
        from_me = bool(conv.get("last_from_me"))
        said = [m for m in (opened or {}).get(conv.get("conversation_id") or "", []) if m.get("text") is not None]
        if said:
            last = said[-1]
            last_ms, from_me = last.get("time_ms") or last_ms, str(last.get("sender_id")) == me
        out.append({
            "conversationId": conv.get("conversation_id"),
            "box": "xchat",
            "type": "group" if len(people) > 1 else "oneToOne",
            "name": None,
            "with": people,
            "lastAt": iso_of(last_ms),
            "lastFromMe": from_me,
            "lastText": None if last_ms is None else (said[-1]["text"] if said else ("(encrypted X Chat message)" if opened is None else "(could not open)")),
            "unread": bool(last_ms is not None and not from_me),
            "messagesLoaded": len(said),
        })
    return out


async def legacy_pool(client: Any, limit: int, max_pages: int = 8) -> tuple[dict[str, Any], Any, int]:
    data, response = await client.get(DM_INBOX, params=INBOX_PARAMS, headers=client._base_headers)
    state = (data or {}).get("inbox_initial_state") or {}
    pool: dict[str, Any] = {"conversations": {}, "users": {}, "messages": [], "boxes": {}}
    merge_state(pool, state, None)
    timelines = state.get("inbox_timelines") or {}
    pages = 1
    for box, label in (("trusted", "inbox"), ("untrusted", "request")):
        timeline = timelines.get(box) or {}
        cursor = timeline.get("min_entry_id")
        while timeline.get("status") == "HAS_MORE" and cursor and len(pool["conversations"]) < limit and pages < max_pages:
            await asyncio.sleep(1.5)
            page, _ = await client.get(DM_TIMELINE.format(box), params={**INBOX_PARAMS, "max_id": cursor}, headers=client._base_headers)
            timeline = (page or {}).get("inbox_timeline") or {}
            added = merge_state(pool, timeline, label)
            cursor = timeline.get("min_entry_id")
            pages += 1
            if not added:
                break
    return pool, response, pages


def is_xchat_id(conversation_id: str) -> bool:
    return ":" in conversation_id or bool(re.fullmatch(r"g\d+", conversation_id))


REOPEN_PER_SYNC = 3
REOPEN_AGAIN_MS = 24 * 3600 * 1000


async def reopen_unopened(client: Any, spec: dict[str, Any], state: dict[str, Any], unlocked: bool) -> dict[str, Any]:
    from twitterApi import inboxSync

    now = int(time.time() * 1000)
    due = []
    for cid, conv in state["xchat"].items():
        ids = [str(m["event_id"]) for m in conv["messages"] if m.get("event_id") and m.get("text") is None and inboxSync.shown(m) and now - int(m.get("retriedAt") or 0) > REOPEN_AGAIN_MS]
        if ids:
            due.append((int(conv.get("lastMs") or 0), cid, ids[-5:]))
    due.sort(reverse=True)
    out = {"opened": 0, "conversations": []}
    if not due:
        return out
    if not unlocked:
        await xchat_read_keys(client, spec)
    for _, cid, ids in due[:REOPEN_PER_SYNC]:
        conv = state["xchat"][cid]
        try:
            page = await client.get_xchat_conversation(cid, older_pages=0, reopen=ids)
        except Exception:
            continue
        before = sum(1 for m in conv["messages"] if m.get("text") is None and inboxSync.shown(m))
        inboxSync.add_messages(conv, [{k: m.get(k) for k in ("event_id", "sender_id", "time_ms", "text", "conversation_id", "kind", "error") if m.get(k) is not None} | {"conversation_id": cid} for m in page["messages"]])
        for m in conv["messages"]:
            if str(m.get("event_id")) in ids and m.get("text") is None:
                m["retriedAt"] = now
        out["opened"] += before - sum(1 for m in conv["messages"] if m.get("text") is None and inboxSync.shown(m))
        out["conversations"].append(cid)
    return out


def sync_path(spec: dict[str, Any]) -> Path:
    return state_dir(str(spec["account"])) / "inboxSync.json"


async def synced_inbox(client: Any, cookies: dict[str, str], spec: dict[str, Any], limit: int, export: bool) -> dict[str, Any]:
    from twikit.xchat import decode_event
    from twitterApi import inboxSync

    started = time.perf_counter()
    me = own_user_id(cookies) or ""
    path = sync_path(spec)
    decrypted = bool(spec.get("pinPath"))
    held = None if spec.get("full") is True else inboxSync.read_state(path)
    if held is None:
        opened = await xchat_read(client, spec)
        pool, response, pages = await legacy_pool(client, limit)
        state = inboxSync.empty_state()
        try:
            convs = await client.get_xchat_conversations()
        except Exception:
            convs = []
        inboxSync.seed_xchat(state, convs, opened)
        items = getattr(client, "_xchat_items", None) or []
        heads = [decode_event(e) for item in items for e in (item.get("latest_message_events") or []) + (item.get("latest_conversation_key_change_events") or [])]
        state["maxSequenceId"] = inboxSync.max_sequence(heads)
        inboxSync.merge_pool(state["legacy"], pool)
        touched = None
        sync = {"mode": "full", "newEvents": sum(len(c["messages"]) for c in state["xchat"].values()), "xchatConversations": len(items), "legacyPages": pages}
    else:
        state = held
        since = str(held["maxSequenceId"])
        updates, (pool, response, pages) = await asyncio.gather(client.get_xchat_updates(state["maxSequenceId"]), legacy_pool(client, limit, max_pages=1))
        heads = [decode_event(e) for e in updates["events"]]
        opened, details = {}, {}
        if updates["events"] and decrypted:
            try:
                await xchat_read_keys(client, spec)
            except Exception as e:
                raise XChatLocked(str(e)) from e
            got = await client.open_xchat_events(updates["events"], sorted({h["conversation_id"] for h in heads if h.get("conversation_id")}))
            opened, details = got["messages"], got["conversations"]
        added = inboxSync.merge_xchat(state, me, heads, opened, details, decrypted)
        touched = {h["conversation_id"] for h in heads if h.get("conversation_id")} | set(opened)
        state["maxSequenceId"] = updates["max_sequence_id"]
        inboxSync.merge_pool(state["legacy"], pool)
        sync = {"mode": "delta", "newEvents": len(updates["events"]), "newMessages": added, "xchatPages": updates["pages"], "legacyPages": pages, "since": since}
        if decrypted:
            repaired = await reopen_unopened(client, spec, state, bool(updates["events"]))
            touched |= set(repaired["conversations"])
            sync["reopened"] = repaired["opened"]
    from datetime import datetime, timezone

    state["syncedAt"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    state["userId"] = me
    inboxSync.write_state(path, state)
    legacy = state["legacy"]
    threads = [thread_of(c, legacy["messages"], legacy["users"], me, legacy["boxes"].get(cid, "inbox")) for cid, c in legacy["conversations"].items()]
    threads += inboxSync.xchat_threads(state, me, decrypted)
    threads.sort(key=lambda t: t["lastAt"] or "", reverse=True)
    everything = threads
    threads = threads[:limit]
    sync["seconds"] = round(time.perf_counter() - started, 2)
    sync["maxSequenceId"] = state["maxSequenceId"]
    out = {"ok": True, "loginState": "loggedIn", "userId": me, "screenName": (legacy["users"].get(me) or {}).get("screen_name"), "pages": pages, "limits": limits_of(response), "threads": threads, "waitingOnYou": sum(1 for t in threads if not t["lastFromMe"] and t["lastText"] is not None), "sync": sync}
    if export:
        kept = [t for t in everything if touched is None or t["conversationId"] in touched]
        out["conversations"] = conversations_of(kept, legacy, inboxSync.opened_of(state), me)
    return out


async def inbox(client: Any, cookies: dict[str, str], limit: int, opened: dict[str, list[dict[str, Any]]] | None = None, export: bool = False) -> dict[str, Any]:
    me = own_user_id(cookies) or ""
    pool, response, pages = await legacy_pool(client, limit)
    threads = [thread_of(c, pool["messages"], pool["users"], me, pool["boxes"].get(cid, "inbox")) for cid, c in pool["conversations"].items()]
    try:
        threads += await xchat_threads(client, me, opened)
    except Exception:
        pass
    threads.sort(key=lambda t: t["lastAt"] or "", reverse=True)
    threads = threads[:limit]
    out = {"ok": True, "loginState": "loggedIn", "userId": me, "screenName": (pool["users"].get(me) or {}).get("screen_name"), "pages": pages, "limits": limits_of(response), "threads": threads, "waitingOnYou": sum(1 for t in threads if not t["lastFromMe"] and t["lastText"] is not None)}
    if export:
        out["conversations"] = conversations_of(threads, pool, opened, me)
    return out


def conversations_of(threads: list[dict[str, Any]], pool: dict[str, Any], opened: dict[str, list[dict[str, Any]]] | None, me: str) -> list[dict[str, Any]]:
    handles = {uid: (u.get("screen_name") or "") for uid, u in pool["users"].items()}
    for t in threads:
        for p in t["with"]:
            if p.get("handle"):
                handles[p["userId"]] = p["handle"]
    out = []
    for t in threads:
        cid = t["conversationId"]
        if t["box"] == "xchat":
            messages = [xchat_message(m, me, handles) for m in (opened or {}).get(cid, []) if m.get("text") is not None]
        else:
            messages = [{**m, "fromMe": m["senderId"] == me, "from": handles.get(m["senderId"])} for m in pool["messages"] if m["conversationId"] == cid]
        messages.sort(key=lambda m: m.get("time") or "")
        out.append({"conversationId": cid, "box": t["box"], "with": t["with"], "messages": messages})
    return out


async def xchat_conversation(client: Any, cookies: dict[str, str], spec: dict[str, Any], conversation_id: str, limit: int) -> dict[str, Any]:
    me = own_user_id(cookies) or ""
    if not spec.get("pinPath"):
        return {"ok": False, "code": "xchatPinMissing", "detail": "this is an X Chat conversation and its text is encrypted: save the account's X Chat PIN with `log twitter chat pin --account <a>` (a masked prompt, kept in Twenty)", "loginState": "loggedIn"}
    try:
        await xchat_read_keys(client, spec)
    except Exception as e:
        return {"ok": False, "code": "xchatLocked", "detail": f"X Chat didn't unlock with the saved PIN: {redact(e, cookies)[:200]}", "loginState": "loggedIn"}
    unopened = [str(m.get("event_id")) for m in stored_xchat(spec, conversation_id) if m.get("text") is None and m.get("event_id") and inboxSync_shown(m)][-5:]
    page = await client.get_xchat_conversation(conversation_id, older_pages=max(0, min(int(spec.get("olderPages") if spec.get("olderPages") is not None else 5), 10)), reopen=unopened)
    handles: dict[str, str | None] = dict(stored_handles(spec, conversation_id))
    for user_id in [p for p in conversation_id.split(":") if p.isdigit() and p != me]:
        await handle_of(client, user_id, handles)
    fetched = {str(m.get("event_id") or ""): m for m in page["messages"]}
    keep_opened(spec, conversation_id, page["messages"])
    held = stored_xchat(spec, conversation_id)
    for m in held:
        key = str(m.get("event_id") or "")
        if key and (key not in fetched or (fetched[key].get("text") is None and m.get("text") is not None)):
            fetched[key] = m
    merged = sorted(fetched.values(), key=lambda m: int(m.get("time_ms") or 0))
    from twitterApi import inboxSync

    messages = [xchat_message(m, me, handles) for m in merged if inboxSync.shown(m)][-limit:]
    return {"ok": True, "loginState": "loggedIn", "userId": me, "conversationId": conversation_id, "box": "xchat", "hasMore": page.get("has_more"), "olderPages": page.get("older_pages") or [], "fromStore": len(held), "messages": messages}


def inboxSync_shown(m: dict[str, Any]) -> bool:
    from twitterApi import inboxSync

    return inboxSync.shown(m)


def keep_opened(spec: dict[str, Any], conversation_id: str, messages: list[dict[str, Any]]) -> None:
    from twitterApi import inboxSync

    if not spec.get("account") or not messages:
        return
    path = sync_path(spec)
    state = inboxSync.read_state(path)
    conv = (state or {}).get("xchat", {}).get(conversation_id)
    if conv is None:
        return
    inboxSync.add_messages(conv, [{k: m.get(k) for k in ("event_id", "sender_id", "time_ms", "text", "conversation_id", "kind", "error") if m.get(k) is not None} | {"conversation_id": conversation_id} for m in messages])
    inboxSync.write_state(path, state)


def stored_handles(spec: dict[str, Any], conversation_id: str) -> dict[str, str]:
    from twitterApi import inboxSync

    if not spec.get("account"):
        return {}
    state = inboxSync.read_state(sync_path(spec))
    return dict(((state or {}).get("xchat", {}).get(conversation_id) or {}).get("handles") or {})


def stored_xchat(spec: dict[str, Any], conversation_id: str) -> list[dict[str, Any]]:
    from twitterApi import inboxSync

    if not spec.get("account"):
        return []
    state = inboxSync.read_state(sync_path(spec))
    conv = (state or {}).get("xchat", {}).get(conversation_id) or {}
    return [{**m, "conversation_id": m.get("conversation_id") or conversation_id} for m in conv.get("messages") or []]


async def with_person(client: Any, cookies: dict[str, str], spec: dict[str, Any], handle: str, limit: int) -> dict[str, Any]:
    from twikit.errors import TooManyRequests
    me = own_user_id(cookies) or ""
    user = await client.get_user_by_screen_name(handle)
    them = str(getattr(user, "id", "") or "")
    if not them:
        return {"ok": False, "code": "targetMissing", "detail": f"@{handle} wasn't found on X", "loginState": "loggedIn"}
    pair = sorted([them, me], key=lambda i: int(i) if i.isdigit() else 0)
    ids, messages, limits = [], [], None
    try:
        legacy = await conversation(client, cookies, "-".join(pair), limit)
        ids.append(legacy["conversationId"])
        messages += legacy["messages"]
        limits = legacy.get("limits")
    except TooManyRequests:
        raise
    except Exception:
        pass
    chat = await xchat_conversation(client, cookies, spec, ":".join(pair), limit)
    older_pages = chat.get("olderPages") or []
    if chat.get("ok"):
        if chat["messages"]:
            ids.append(chat["conversationId"])
        messages += chat["messages"]
    elif chat.get("code") != "xchatPinMissing":
        return chat
    for m in messages:
        m["fromMe"] = m["senderId"] == me
        m["from"] = m.get("from") or (handle if m["senderId"] == them else None)
    messages.sort(key=lambda m: m.get("time") or "")
    return {"ok": True, "loginState": "loggedIn", "userId": me, "with": {"userId": them, "handle": handle}, "conversationId": " + ".join(ids), "limits": limits, "olderPages": older_pages, "messages": messages[-limit:]}


async def conversation(client: Any, cookies: dict[str, str], conversation_id: str, limit: int) -> dict[str, Any]:
    me = own_user_id(cookies) or ""
    params = {**INBOX_PARAMS, "context": "FETCH_DM_CONVERSATION_HISTORY", "include_conversation_info": "true"}
    data, response = await client.get(DM_CONVERSATION.format(conversation_id), params=params, headers=client._base_headers)
    timeline = (data or {}).get("conversation_timeline") or {}
    users = dict(timeline.get("users") or {})
    messages = messages_of(timeline.get("entries") or [])
    while timeline.get("status") == "HAS_MORE" and timeline.get("min_entry_id") and len(messages) < limit:
        await asyncio.sleep(1.5)
        data, _ = await client.get(DM_CONVERSATION.format(conversation_id), params={**params, "max_id": timeline["min_entry_id"]}, headers=client._base_headers)
        timeline = (data or {}).get("conversation_timeline") or {}
        users.update(timeline.get("users") or {})
        older = messages_of(timeline.get("entries") or [])
        if not older:
            break
        messages.extend(older)
    messages.sort(key=lambda m: id_key(m["id"]))
    messages = messages[-limit:]
    for m in messages:
        m["fromMe"] = m["senderId"] == me
        m["from"] = (users.get(m["senderId"]) or {}).get("screen_name")
    return {"ok": True, "loginState": "loggedIn", "userId": me, "conversationId": conversation_id, "limits": limits_of(response), "messages": messages}


def follower_of(user: Any) -> dict[str, Any]:
    return {
        "userId": str(getattr(user, "id", "") or ""),
        "handle": getattr(user, "screen_name", None),
        "name": getattr(user, "name", None),
        "bio": getattr(user, "description", "") or "",
        "location": getattr(user, "location", "") or "",
        "followers": getattr(user, "followers_count", 0),
        "following": getattr(user, "following_count", 0),
        "posts": getattr(user, "statuses_count", 0),
        "canDm": bool(getattr(user, "can_dm", False)),
        "protected": bool(getattr(user, "protected", False)),
        "createdAt": getattr(user, "created_at", None),
    }


async def followers(client: Any, cookies: dict[str, str], limit: int) -> dict[str, Any]:
    me = own_user_id(cookies) or ""
    page = await client.get_user_followers(me, count=100)
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    pages = 1
    while True:
        added = 0
        for user in page:
            row = follower_of(user)
            if row["userId"] and row["userId"] not in seen:
                seen.add(row["userId"])
                out.append(row)
                added += 1
        if len(out) >= limit or not added or not getattr(page, "next_cursor", None) or pages >= 40:
            break
        await asyncio.sleep(1.5)
        page = await page.next()
        pages += 1
    return {"ok": True, "loginState": "loggedIn", "userId": me, "pages": pages, "followers": out[:limit], "complete": len(out) < limit}


async def xchat_contacts(client: Any, cookies: dict[str, str]) -> dict[str, Any]:
    me = own_user_id(cookies) or ""
    convs = await client.get_xchat_conversations()
    contacts: set[str] = set()
    for conv in convs:
        for rest in conv.get("participant_ids") or []:
            if rest and rest != me:
                contacts.add(str(rest))
    return {"ok": True, "loginState": "loggedIn", "userId": me, "conversations": len(convs), "contacts": sorted(contacts)}


def live_line(event: dict[str, Any]) -> None:
    print(json.dumps({"liveEvent": event}, default=str), flush=True)


async def handle_of(client: Any, user_id: str, handles: dict[str, str | None]) -> str | None:
    if user_id and user_id not in handles:
        try:
            handles[user_id] = getattr(await client.get_user_by_id(user_id), "screen_name", None)
        except Exception:
            handles[user_id] = None
    return handles.get(user_id)


async def xchat_watch(client: Any, cookies: dict[str, str], spec: dict[str, Any]) -> dict[str, Any]:
    from twitterApi import inboxSync

    me = own_user_id(cookies) or ""
    unlocked = False
    if spec.get("pinPath"):
        try:
            await xchat_read_keys(client, spec)
            unlocked = True
        except Exception as e:
            live_line({"type": "socket", "state": "locked", "error": redact(e, cookies)[:200]})
    seconds = spec.get("seconds")
    handles: dict[str, str | None] = {}
    messages = 0
    async for event in client.watch_xchat(seconds=float(seconds) if seconds else None):
        if event.get("type") == "socket":
            live_line({**event, "error": redact(event["error"], cookies)[:200]} if event.get("error") else event)
            continue
        if event.get("type") not in ("Message", None):
            continue
        sender = str(event.get("sender_id") or "")
        messages += 1
        handle = await handle_of(client, sender, handles)
        if unlocked and event.get("text") is not None:
            inboxSync.push_message(sync_path(spec), me, event, handle)
        live_line({**xchat_message(event, me, {sender: handle or ""}), "box": "xchat", "encrypted": not unlocked})
    return {"ok": True, "loginState": "loggedIn", "userId": me, "messages": messages, "unlocked": unlocked}


async def send(client: Any, spec: dict[str, Any]) -> dict[str, Any]:
    action = spec["action"]
    raw = keep_create_answers(client)
    if action == "like":
        tweet_id = tweet_id_from_url(spec["tweetUrl"])
        data, _ = await client.gql.favorite_tweet(tweet_id)
        errors = data.get("errors") if isinstance(data, dict) else None
        if errors and any(e.get("code") == 139 for e in errors):
            return {"ok": True, "event": "sent", "liked": True, "already": True, "tweetId": tweet_id}
        if errors or ((data or {}).get("data") or {}).get("favorite_tweet") != "Done":
            raise RuntimeError(f"x did not like the post: {json.dumps(data)[:300]}")
        return {"ok": True, "event": "sent", "liked": True, "tweetId": tweet_id}
    if action == "repost":
        tweet_id = tweet_id_from_url(spec["tweetUrl"])
        data, _ = await client.gql.retweet(tweet_id)
        errors = data.get("errors") if isinstance(data, dict) else None
        if errors and any(e.get("code") == 327 for e in errors):
            return {"ok": True, "event": "sent", "reposted": True, "already": True, "tweetId": tweet_id}
        if errors or not ((data or {}).get("data") or {}).get("create_retweet"):
            raise RuntimeError(f"x did not repost the post: {json.dumps(data)[:300]}")
        return {"ok": True, "event": "sent", "reposted": True, "tweetId": tweet_id}
    if action == "follow":
        user_id = str(spec["userId"])
        before = await client.get_user_by_id(user_id)
        if getattr(before, "following", False):
            return {"ok": True, "event": "sent", "followed": True, "already": True, "userId": user_id, "handle": getattr(before, "screen_name", None)}
        user = await client.follow_user(user_id)
        if not str(getattr(user, "id", "") or ""):
            return {"ok": False, "event": "dropped", "code": "xSentNothing", "detail": "x answered the follow with no user: nobody was followed"}
        return {"ok": True, "event": "sent", "followed": True, "userId": user_id, "handle": getattr(user, "screen_name", None) or getattr(before, "screen_name", None)}
    if action == "dm":
        message = await client.send_dm(str(spec["userId"]), spec["text"])
        message_id = str(getattr(message, "id", "") or "") or None
        if not message_id:
            return {"ok": False, "event": "dropped", "code": "xSentNothing", "detail": "x answered the dm with no message id: nothing was sent"}
        pair = sorted([str(getattr(message, "sender_id", "") or ""), str(getattr(message, "recipient_id", "") or "")], key=lambda i: int(i) if i.isdigit() else 0)
        return {"ok": True, "event": "sent", "mode": "dm", "messageId": message_id, "conversationId": "-".join(pair), "userId": str(spec["userId"])}
    media_ids: list[str] = []
    if action == "post":
        media_ids = await upload_post_media(client, list(spec.get("media") or []))
        tweet = await client.create_tweet(text=spec["text"], media_ids=media_ids or None)
    elif action == "reply":
        tweet = await client.create_tweet(text=spec["text"], reply_to=tweet_id_from_url(spec["tweetUrl"]))
    else:
        tweet = await client.create_tweet(text=spec["text"], attachment_url=spec["tweetUrl"])
    tweet_id = getattr(tweet, "id", None)
    if not tweet_id:
        limits = raw.get("limits") or {}
        return {"ok": False, "event": "dropped", "code": "xSentNothing", "detail": f"x created no tweet (empty result): nothing was posted. x said: {json.dumps(raw.get('body'))[:300]}", "limits": limits, "rateLimitReset": reset_of(limits)}
    return {"ok": True, "event": "sent", "mode": action, "tweetId": tweet_id, "target": spec.get("tweetUrl") or "newPost", **({"mediaIds": media_ids} if media_ids else {}), "limits": raw.get("limits") or {}}


def refusal_of(spec: dict[str, Any]) -> dict[str, Any] | None:
    action = spec["action"]
    if action in WRITES and spec.get("live") is not True:
        return {"ok": False, "code": "notLive", "detail": f"{action} sends on X: the engine only sends with live set (rule 8)"}
    if action in WRITES and not str(spec.get("approvedBy") or "").strip():
        return {"ok": False, "code": "notApproved", "detail": f"{action} needs the name of who approved it"}
    if action in ("reply", "quote", "like", "repost") and not spec.get("tweetUrl"):
        return {"ok": False, "code": "targetMissing", "detail": f"{action} needs the post's url"}
    if action in ("dm", "follow") and not spec.get("userId"):
        return {"ok": False, "code": "targetMissing", "detail": f"{action} needs the person's user id"}
    if action == "post" and any(not Path(str(m)).is_file() for m in (spec.get("media") or [])):
        return {"ok": False, "code": "mediaInvalid", "detail": "post: a media file isn't there"}
    if action in ("reply", "quote", "dm", "post") and not str(spec.get("text") or "").strip():
        return {"ok": False, "code": "textMissing", "detail": f"{action} needs its text"}
    if action == "follows" and not spec.get("handles"):
        return {"ok": False, "code": "targetMissing", "detail": "follows needs the handles to check"}
    return None


async def act(client: Any, cookies: dict[str, str], spec: dict[str, Any]) -> dict[str, Any]:
    action = spec["action"]
    if action == "ping":
        return await ping(client, cookies)
    status = await session_answer(client)
    state = login_state_of(status)
    if state != "loggedIn":
        dead = state == "loggedOut"
        return {"ok": False, "code": "sessionDead" if dead else "sessionUnknown", "event": "sessionDead" if dead else "failed", "detail": f"X answered HTTP {status} to the session check before the {action}", "loginState": state, "httpStatus": status}
    if action == "follows":
        return await follows(client, cookies, [h.strip().lstrip("@") for h in spec["handles"] if h.strip()])
    if action == "followers":
        return await followers(client, cookies, max(1, min(int(spec.get("limit") or 200), 4000)))
    if action == "xchatContacts":
        return await xchat_contacts(client, cookies)
    if action == "xchatUnlock":
        if not spec.get("pinPath"):
            return {"ok": False, "code": "xchatPinMissing", "detail": "no PIN was given to check", "loginState": "loggedIn"}
        try:
            await xchat_read_keys(client, spec)
        except Exception as e:
            return {"ok": False, "code": "xchatLocked", "detail": f"X Chat didn't unlock with that PIN: {redact(e, cookies)[:200]}", "loginState": "loggedIn"}
        return {"ok": True, "loginState": "loggedIn", "userId": own_user_id(cookies)}
    if action == "xchatWatch":
        return await xchat_watch(client, cookies, spec)
    if action == "inbox":
        from twikit.errors import TooManyRequests
        limit = max(1, min(int(spec.get("limit") or 20), 200))
        conversation_id = str(spec.get("conversationId") or "")
        if is_xchat_id(conversation_id):
            return await xchat_conversation(client, cookies, spec, conversation_id, limit)
        if conversation_id:
            return await conversation(client, cookies, conversation_id, limit)
        if str(spec.get("withHandle") or "").strip():
            return await with_person(client, cookies, spec, str(spec["withHandle"]).strip().lstrip("@"), limit)
        try:
            if spec.get("sync") is not False:
                return await synced_inbox(client, cookies, spec, limit, spec.get("export") is True)
            opened = await xchat_read(client, spec)
        except XChatLocked as e:
            return {"ok": False, "code": "xchatLocked", "detail": f"X Chat didn't unlock with the saved PIN: {redact(e, cookies)[:200]}", "loginState": "loggedIn"}
        except TooManyRequests:
            raise
        except Exception as e:
            return {"ok": False, "code": "xchatReadFailed", "detail": f"X Chat unlocked but its messages didn't open: {redact(e, cookies)[:200]}", "loginState": "loggedIn"}
        return await inbox(client, cookies, limit, opened, spec.get("export") is True)
    return {**(await send(client, spec)), "loginState": "loggedIn"}


async def run(spec: dict[str, Any]) -> dict[str, Any]:
    action = spec.get("action")
    if action not in ACTIONS:
        return {"ok": False, "code": "actionUnknown", "detail": f"{action} is not one of {', '.join(ACTIONS)}"}
    cookies = normalize_cookies(json.loads(Path(spec["cookiesPath"]).read_text(encoding="utf-8")))
    if not has_session(cookies):
        return {"ok": False, "code": "noSession", "detail": "the saved cookies have no auth_token + ct0", "loginState": "loggedOut"}
    refused = refusal_of(spec)
    if refused:
        return refused
    account = spec["account"]
    if action in UNLOCKED:
        return await run_locked(spec, cookies, action, account)
    try:
        async with AccountLock(account):
            wait = spacing_wait(account)
            if wait:
                await asyncio.sleep(wait)
            try:
                return await run_locked(spec, cookies, action, account)
            finally:
                mark_call(account)
    except AccountBusy as e:
        return {"ok": False, "code": "accountBusy", "detail": str(e)}


async def run_locked(spec: dict[str, Any], cookies: dict[str, str], action: str, account: str) -> dict[str, Any]:
    from governor import GovernorBlockedError
    from twikit import Client
    from twikit.errors import TooManyRequests

    governor = governor_for(account, spec.get("writesPerDay"))
    forced_past = None
    try:
        governor.before_request(is_mutation=action in WRITES, quiet=True)
    except GovernorBlockedError as e:
        if spec.get("force") is not True:
            return {"ok": False, "code": "governorBlocked", "detail": str(e)}
        forced_past = str(e)
    client = Client(language="en-US")
    client.set_cookies(cookies, clear_cookies=True)
    if own_user_id(cookies):
        client._user_id = own_user_id(cookies)
    restore_transaction(client, account)
    try:
        out = await act(client, cookies, spec)
    except TooManyRequests as e:
        out = {"ok": False, "code": "rateLimited", "event": "throttled", "detail": redact(e, cookies), "rateLimitReset": getattr(e, "rate_limit_reset", None)}
    except Exception as e:
        text = redact(e, cookies)
        out = blocked_answer(e, "request", "unknown") or {"ok": False, "code": type(e).__name__, "detail": (page_title(text) or text)[:300]}
        out.setdefault("event", event_of(e))
        if out["event"] == "sessionDead":
            out.setdefault("loginState", "loggedOut")
        if out["event"] == "restricted":
            out.setdefault("loginState", "restricted")
    if out.get("code") == "cloudflareBlocked":
        out["event"] = "throttled"
    if out.get("event") in ("throttled", "dropped", "automated", "dailyLimit"):
        governor.observe_soft_block()
    keep_transaction(client, account)
    refreshed = client.get_cookies()
    if spec.get("refreshedPath") and refreshed:
        Path(spec["refreshedPath"]).write_text(json.dumps({k: v for k, v in refreshed.items() if k != "__cf_bm"}), encoding="utf-8")
    if forced_past:
        out["forcedPast"] = forced_past
    out["governor"] = governor.status()
    return out


def main() -> int:
    if os.name == "nt":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    spec = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    out = governor_status(spec["account"], spec.get("writesPerDay")) if spec.get("governorStatus") else asyncio.run(run(spec))
    print(json.dumps(out, default=str))
    return 0 if out.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
