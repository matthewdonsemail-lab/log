from __future__ import annotations

import asyncio
import json
import os
import re
import sys
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
VENDOR = ROOT.parent / "vendor"
for p in (str(ROOT), str(VENDOR / "twikit"), str(VENDOR / "fbk" / "src")):
    if p not in sys.path:
        sys.path.insert(0, p)

SECRET_KEYS = ("auth_token", "ct0", "twid", "kdt", "att", "password", "cookie")
READS = ("ping", "follows", "inbox", "followers")
WRITES = ("reply", "quote", "like", "dm")
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


def governor_for(account: str) -> Any:
    from governor import RequestGovernor

    return RequestGovernor(state_path=state_dir(account) / "governor_state.json")


def governor_status(account: str) -> dict[str, Any]:
    return {"ok": True, "account": account, "governor": governor_for(account).status()}


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
        "messagesLoaded": len(mine),
    }


async def inbox(client: Any, cookies: dict[str, str], limit: int) -> dict[str, Any]:
    me = own_user_id(cookies) or ""
    data, response = await client.get(DM_INBOX, params=INBOX_PARAMS, headers=client._base_headers)
    state = (data or {}).get("inbox_initial_state") or {}
    pool: dict[str, Any] = {"conversations": {}, "users": {}, "messages": [], "boxes": {}}
    merge_state(pool, state, None)
    timelines = state.get("inbox_timelines") or {}
    pages = 1
    for box, label in (("trusted", "inbox"), ("untrusted", "request")):
        timeline = timelines.get(box) or {}
        cursor = timeline.get("min_entry_id")
        while timeline.get("status") == "HAS_MORE" and cursor and len(pool["conversations"]) < limit and pages < 8:
            await asyncio.sleep(1.5)
            page, _ = await client.get(DM_TIMELINE.format(box), params={**INBOX_PARAMS, "max_id": cursor}, headers=client._base_headers)
            timeline = (page or {}).get("inbox_timeline") or {}
            added = merge_state(pool, timeline, label)
            cursor = timeline.get("min_entry_id")
            pages += 1
            if not added:
                break
    threads = [thread_of(c, pool["messages"], pool["users"], me, pool["boxes"].get(cid, "inbox")) for cid, c in pool["conversations"].items()]
    threads.sort(key=lambda t: t["lastAt"] or "", reverse=True)
    threads = threads[:limit]
    return {"ok": True, "loginState": "loggedIn", "userId": me, "screenName": (pool["users"].get(me) or {}).get("screen_name"), "pages": pages, "limits": limits_of(response), "threads": threads, "waitingOnYou": sum(1 for t in threads if not t["lastFromMe"] and t["lastText"] is not None)}


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
    if action == "dm":
        message = await client.send_dm(str(spec["userId"]), spec["text"])
        message_id = str(getattr(message, "id", "") or "") or None
        if not message_id:
            return {"ok": False, "event": "dropped", "code": "xSentNothing", "detail": "x answered the dm with no message id: nothing was sent"}
        pair = sorted([str(getattr(message, "sender_id", "") or ""), str(getattr(message, "recipient_id", "") or "")], key=lambda i: int(i) if i.isdigit() else 0)
        return {"ok": True, "event": "sent", "mode": "dm", "messageId": message_id, "conversationId": "-".join(pair), "userId": str(spec["userId"])}
    if action == "reply":
        tweet = await client.create_tweet(text=spec["text"], reply_to=tweet_id_from_url(spec["tweetUrl"]))
    else:
        tweet = await client.create_tweet(text=spec["text"], attachment_url=spec["tweetUrl"])
    tweet_id = getattr(tweet, "id", None)
    if not tweet_id:
        limits = raw.get("limits") or {}
        return {"ok": False, "event": "dropped", "code": "xSentNothing", "detail": f"x created no tweet (empty result): nothing was posted. x said: {json.dumps(raw.get('body'))[:300]}", "limits": limits, "rateLimitReset": reset_of(limits)}
    return {"ok": True, "event": "sent", "mode": action, "tweetId": tweet_id, "target": spec["tweetUrl"], "limits": raw.get("limits") or {}}


def refusal_of(spec: dict[str, Any]) -> dict[str, Any] | None:
    action = spec["action"]
    if action in WRITES and spec.get("live") is not True:
        return {"ok": False, "code": "notLive", "detail": f"{action} sends on X: the engine only sends with live set (rule 8)"}
    if action in WRITES and not str(spec.get("approvedBy") or "").strip():
        return {"ok": False, "code": "notApproved", "detail": f"{action} needs the name of who approved it"}
    if action in ("reply", "quote", "like") and not spec.get("tweetUrl"):
        return {"ok": False, "code": "targetMissing", "detail": f"{action} needs the post's url"}
    if action == "dm" and not spec.get("userId"):
        return {"ok": False, "code": "targetMissing", "detail": "dm needs the recipient's user id"}
    if action in ("reply", "quote", "dm") and not str(spec.get("text") or "").strip():
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
    if action == "inbox":
        limit = max(1, min(int(spec.get("limit") or 20), 200))
        if spec.get("conversationId"):
            return await conversation(client, cookies, str(spec["conversationId"]), limit)
        return await inbox(client, cookies, limit)
    return {**(await send(client, spec)), "loginState": "loggedIn"}


async def run(spec: dict[str, Any]) -> dict[str, Any]:
    from governor import GovernorBlockedError
    from twikit import Client
    from twikit.errors import TooManyRequests

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
    governor = governor_for(account)
    forced_past = None
    try:
        governor.before_request(is_mutation=action in WRITES, quiet=True)
    except GovernorBlockedError as e:
        if spec.get("force") is not True:
            return {"ok": False, "code": "governorBlocked", "detail": str(e)}
        forced_past = str(e)
    client = Client(language="en-US")
    client.set_cookies(cookies, clear_cookies=True)
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
    out = governor_status(spec["account"]) if spec.get("governorStatus") else asyncio.run(run(spec))
    print(json.dumps(out, default=str))
    return 0 if out.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
