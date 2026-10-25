from __future__ import annotations

import asyncio
import json
import os
import re
import sys
from pathlib import Path
from typing import Any
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
VENDOR = ROOT.parent / "vendor"
for p in (str(ROOT), str(VENDOR / "twikit"), str(VENDOR / "fbk" / "src")):
    if p not in sys.path:
        sys.path.insert(0, p)

SECRET_KEYS = ("auth_token", "ct0", "twid", "kdt", "att", "password", "cookie")
ACTIONS = ("ping",)


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
    account = spec["account"]
    governor = governor_for(account)
    try:
        governor.before_request(is_mutation=False, quiet=True)
    except GovernorBlockedError as e:
        return {"ok": False, "code": "governorBlocked", "detail": str(e)}
    client = Client(language="en-US")
    client.set_cookies(cookies, clear_cookies=True)
    try:
        out = await ping(client, cookies)
    except TooManyRequests as e:
        governor.observe_soft_block()
        out = {"ok": False, "code": "rateLimited", "detail": redact(e, cookies), "rateLimitReset": getattr(e, "rate_limit_reset", None)}
    except Exception as e:
        text = redact(e, cookies)
        out = blocked_answer(e, "request", "unknown") or {"ok": False, "code": type(e).__name__, "detail": (page_title(text) or text)[:300]}
    if out.get("code") == "cloudflareBlocked":
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
