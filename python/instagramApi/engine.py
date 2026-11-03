from __future__ import annotations

import asyncio
import sys
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
WRITES: tuple[str, ...] = ()
SESSION_COOKIES = ("sessionid",)
TRANSPORT = "curl"


def message_of(message_id: str, at: str | None, sender: str | None, from_me: bool, text: str | None, attachments: list[dict[str, Any]]) -> dict[str, Any]:
    return {"id": message_id, "at": at, "from": sender, "fromMe": from_me, "text": media.text_with_audio(text, attachments), "attachments": [{k: v for k, v in a.items() if k != "url"} for a in attachments]}


def client_of() -> Any:
    from instagrapi import Client

    client = Client()
    client.set_retry_config(private_transport=TRANSPORT, public_request_retries_count=0)
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


def check(cookies: dict[str, str]) -> dict[str, Any]:
    client = client_of()
    try:
        client.login_by_sessionid(cookies["sessionid"])
    except AssertionError:
        return {"ok": False, "code": "sessionDead", "detail": "the account's sessionid isn't one Instagram issues", "loginState": "loggedOut"}
    except Exception as error:
        answer = refused(error)
        if answer:
            return answer
        raise
    user_id = str(client.authorization_data.get("ds_user_id") or "") or None
    if cookies.get("ds_user_id") and user_id and cookies["ds_user_id"] != user_id:
        return {"ok": False, "code": "sessionMismatch", "detail": f"Instagram says this sessionid is user {user_id}, the account's cookies say {cookies['ds_user_id']}", "loginState": "unknown"}
    return {"ok": True, "loginState": "loggedIn", "screenName": client.username, "userId": user_id, "transport": TRANSPORT}


async def ping(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    missing = [c for c in SESSION_COOKIES if not cookies.get(c)]
    if missing:
        return {"ok": False, "code": "sessionDead", "detail": f"the account's cookies have no {', '.join(missing)}", "loginState": "loggedOut"}
    return await asyncio.to_thread(check, cookies)


ACTIONS = {"ping": ping}


if __name__ == "__main__":
    raise SystemExit(kit.main(ACTIONS, WRITES, LIBRARY))
