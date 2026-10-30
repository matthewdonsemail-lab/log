from __future__ import annotations

import asyncio
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
VENDOR = ROOT.parent / "vendor"
for p in (str(ROOT), str(VENDOR / "openLinkedinApi")):
    if p not in sys.path:
        sys.path.insert(0, p)

from platformKit import engine as kit

PLATFORM = "linkedin"
LIBRARY = "vendor/openLinkedinApi"
WRITES: tuple[str, ...] = ()
SESSION_COOKIES = ("li_at", "JSESSIONID")
COOKIE_DOMAIN = ".linkedin.com"


def no_wait() -> None:
    return None


def session_of(cookies: dict[str, str]) -> Any:
    from open_linkedin_api import Linkedin
    from requests.cookies import RequestsCookieJar

    jar = RequestsCookieJar()
    for name, value in cookies.items():
        jar.set(name, value, domain=COOKIE_DOMAIN, path="/")
    return Linkedin("", "", cookies=jar)


def refreshed_of(api: Any, cookies: dict[str, str]) -> dict[str, str]:
    now = {c.name: c.value for c in api.client.session.cookies}
    return {k: v for k, v in now.items() if k in SESSION_COOKIES and cookies.get(k) != v}


def check(cookies: dict[str, str]) -> dict[str, Any]:
    api = session_of(cookies)
    res = api._fetch("/me", evade=no_wait, allow_redirects=False)
    status = res.status_code
    if status in (301, 302, 303, 401, 403):
        return {"ok": False, "code": "sessionDead", "detail": f"LinkedIn answered HTTP {status} to /voyager/api/me: these cookies aren't signed in", "loginState": "loggedOut", "httpStatus": status}
    if status == 999 or status == 429:
        return {"ok": False, "code": "rateLimited", "detail": f"LinkedIn answered HTTP {status}: it is refusing requests from this session for now", "loginState": "unknown", "httpStatus": status, "event": "throttled"}
    if status != 200:
        return {"ok": False, "code": "sessionUnknown", "detail": f"LinkedIn answered HTTP {status} to /voyager/api/me", "loginState": "unknown", "httpStatus": status}
    try:
        me = res.json()
    except ValueError:
        return {"ok": False, "code": "sessionUnknown", "detail": "LinkedIn's /voyager/api/me answer wasn't JSON", "loginState": "unknown", "httpStatus": status}
    mini = me.get("miniProfile") or {}
    urn = str(mini.get("entityUrn") or mini.get("dashEntityUrn") or "")
    name = " ".join(x for x in (mini.get("firstName"), mini.get("lastName")) if x) or None
    out: dict[str, Any] = {
        "ok": True,
        "loginState": "loggedIn",
        "httpStatus": status,
        "screenName": mini.get("publicIdentifier"),
        "name": name,
        "userId": urn.rsplit(":", 1)[-1] or str(me.get("plainId") or "") or None,
        "premium": bool(me.get("premiumSubscriber")),
    }
    refreshed = refreshed_of(api, cookies)
    if refreshed:
        out["refreshedCookies"] = refreshed
    return out


async def ping(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    missing = [c for c in SESSION_COOKIES if not cookies.get(c)]
    if missing:
        return {"ok": False, "code": "sessionDead", "detail": f"the account's cookies have no {', '.join(missing)}", "loginState": "loggedOut"}
    return await asyncio.to_thread(check, cookies)


ACTIONS = {"ping": ping}


if __name__ == "__main__":
    raise SystemExit(kit.main(ACTIONS, WRITES, LIBRARY))
