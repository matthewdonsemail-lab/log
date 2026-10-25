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
READS = ("ping", "follows")
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
        conversation = str(getattr(message, "conversation_id", "") or "") or None
        if not conversation:
            return {"ok": False, "event": "dropped", "code": "xSentNothing", "detail": "x answered the dm with no conversation id: nothing was sent"}
        return {"ok": True, "event": "sent", "mode": "dm", "conversationId": conversation, "userId": str(spec["userId"])}
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
    try:
        governor.before_request(is_mutation=action in WRITES, quiet=True)
    except GovernorBlockedError as e:
        return {"ok": False, "code": "governorBlocked", "detail": str(e)}
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
