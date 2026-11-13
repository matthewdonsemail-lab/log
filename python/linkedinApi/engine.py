from __future__ import annotations

import asyncio
import json
import os
import sys
import time
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
WRITES: tuple[str, ...] = ("post", "deletePost", "connect")
CONNECT_GAP_S = 15 * 60
CONNECTS_PER_DAY = 5
SESSION_COOKIES = ("li_at", "JSESSIONID")
BROWSER_COOKIES = ("bcookie", "bscookie")
BROWSER_HEADERS = {
    "userAgent": "user-agent",
    "secChUa": "sec-ch-ua",
    "secChUaMobile": "sec-ch-ua-mobile",
    "secChUaPlatform": "sec-ch-ua-platform",
    "acceptLanguage": "accept-language",
    "xLiTrack": "x-li-track",
}
VOYAGER_HEADERS = {
    "accept": "application/vnd.linkedin.normalized+json+2.1",
    "x-li-lang": "en_US",
    "x-restli-protocol-version": "2.0.0",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "referer": "https://www.linkedin.com/feed/",
}


def no_wait() -> None:
    return None


def browser_path(spec: dict[str, Any]) -> Path:
    return Path(spec["stateRoot"]) / spec["account"] / "browser.json"


def browser_of(spec: dict[str, Any]) -> dict[str, str]:
    path = browser_path(spec)
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except ValueError:
        return {}
    return {k: str(v) for k, v in data.items() if k in BROWSER_HEADERS and v}


def session_of(cookies: dict[str, str], browser: dict[str, str] | None = None) -> Any:
    from open_linkedin_api import Linkedin

    api = Linkedin("", "", cookies=dict(cookies))
    if browser:
        headers = api.client.session.headers
        headers.update(VOYAGER_HEADERS)
        for key, header in BROWSER_HEADERS.items():
            if browser.get(key):
                headers[header] = browser[key]
    return api


def is_deleted(value: str, attrs: str = "") -> bool:
    return value.strip().strip('"').lower() in ("", "delete me", "deleted") or "max-age=0" in attrs or "1970" in attrs


def set_cookies_of(res: Any) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for raw in res.headers.get_list("set-cookie"):
        head, _, rest = raw.partition(";")
        name, _, value = head.partition("=")
        out.append({"name": name.strip(), "deleted": is_deleted(value, rest.lower())})
    return out


def refreshed_of(api: Any, cookies: dict[str, str]) -> dict[str, str]:
    now = {c.name: c.value for c in api.client.session.cookies.jar if c.value and not is_deleted(c.value)}
    return {k: v for k, v in now.items() if cookies.get(k) != v}


def redirect_of(res: Any) -> str | None:
    location = res.headers.get("location")
    return location.split("?", 1)[0] if location else None


def answer_of(res: Any, cookies: dict[str, str], browser: dict[str, str]) -> dict[str, Any]:
    return {
        "sent": sorted(cookies),
        "browserHeaders": sorted(browser),
        "setCookies": set_cookies_of(res),
        "redirect": redirect_of(res),
    }


def check(cookies: dict[str, str], browser: dict[str, str]) -> dict[str, Any]:
    api = session_of(cookies, browser)
    res = api._fetch("/me", evade=no_wait, allow_redirects=False)
    status = res.status_code
    answer = answer_of(res, cookies, browser)
    revoked = any(c["name"] == "li_at" and c["deleted"] for c in answer["setCookies"])
    if revoked:
        return {"ok": False, "code": "sessionRevoked", "detail": f"LinkedIn answered HTTP {status} to /voyager/api/me and deleted li_at: it ended this session", "loginState": "loggedOut", "httpStatus": status, "linkedinAnswer": answer}
    if status in (301, 302, 303, 401, 403):
        return {"ok": False, "code": "sessionDead", "detail": f"LinkedIn answered HTTP {status} to /voyager/api/me: these cookies aren't signed in", "loginState": "loggedOut", "httpStatus": status, "linkedinAnswer": answer}
    if status == 999 or status == 429:
        return {"ok": False, "code": "rateLimited", "detail": f"LinkedIn answered HTTP {status}: it is refusing requests from this session for now", "loginState": "unknown", "httpStatus": status, "event": "throttled", "linkedinAnswer": answer}
    if status != 200:
        return {"ok": False, "code": "sessionUnknown", "detail": f"LinkedIn answered HTTP {status} to /voyager/api/me", "loginState": "unknown", "httpStatus": status, "linkedinAnswer": answer}
    try:
        me = res.json()
    except ValueError:
        return {"ok": False, "code": "sessionUnknown", "detail": "LinkedIn's /voyager/api/me answer wasn't JSON", "loginState": "unknown", "httpStatus": status, "linkedinAnswer": answer}
    mini = me.get("miniProfile") or {}
    if not mini:
        mini = next((x for x in me.get("included") or [] if str(x.get("$type", "")).endswith("MiniProfile")), {})
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
        "linkedinAnswer": answer,
    }
    refreshed = refreshed_of(api, cookies)
    if refreshed:
        out["refreshedCookies"] = refreshed
    return out


async def ping(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    missing = [c for c in SESSION_COOKIES if not cookies.get(c)]
    if missing:
        return {"ok": False, "code": "sessionDead", "detail": f"the account's cookies have no {', '.join(missing)}", "loginState": "loggedOut"}
    browser = browser_of(spec)
    lacking = [c for c in BROWSER_COOKIES if not cookies.get(c)] + ([] if browser.get("userAgent") else ["the browser's user agent"])
    if lacking:
        return {"ok": False, "code": "browserIdentityMissing", "detail": f"LinkedIn ends a session that arrives without its browser's identity, so nothing was sent: missing {', '.join(lacking)}. Save the session again with log linkedin cookies save (paste a linkedin.com request copied as cURL)", "loginState": "unknown"}
    return await asyncio.to_thread(check, cookies, browser)


def app_scripts(cookies: dict[str, str], browser: dict[str, str]) -> dict[str, Any]:
    import re

    api = session_of(cookies, browser)
    headers = {k: v for k, v in api.client.session.headers.items() if k.lower() not in ("accept", "csrf-token", "x-li-lang", "x-restli-protocol-version", "x-li-track", "referer")}
    headers.update({"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "sec-fetch-dest": "document", "sec-fetch-mode": "navigate", "sec-fetch-site": "none", "sec-fetch-user": "?1", "upgrade-insecure-requests": "1"})
    res = api.client.session.get("https://www.linkedin.com/feed/", headers=headers, allow_redirects=False)
    status = res.status_code
    answer = answer_of(res, cookies, browser)
    if any(c["name"] == "li_at" and c["deleted"] for c in answer["setCookies"]):
        return {"ok": False, "code": "sessionRevoked", "detail": f"LinkedIn answered HTTP {status} to /feed/ and deleted li_at", "loginState": "loggedOut", "httpStatus": status, "linkedinAnswer": answer}
    if status in (999, 429):
        return {"ok": False, "code": "rateLimited", "detail": f"LinkedIn answered HTTP {status} to /feed/", "loginState": "unknown", "httpStatus": status, "event": "throttled", "linkedinAnswer": answer}
    if status != 200:
        return {"ok": False, "code": "sessionUnknown", "detail": f"LinkedIn answered HTTP {status} to /feed/", "loginState": "unknown", "httpStatus": status, "linkedinAnswer": answer}
    html = res.text.replace("\\" + "u002F", "/").replace("\\/", "/")
    found = re.findall(r"""https://static\.licdn\.com/[^"'\s<>]+?\.js""", html)
    scripts = list(dict.fromkeys(found))
    return {"ok": True, "loginState": "loggedIn", "httpStatus": status, "scripts": scripts, "htmlBytes": len(html), "linkedinAnswer": answer}


async def scripts(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    browser = browser_of(spec)
    if not browser.get("userAgent") or any(not cookies.get(c) for c in SESSION_COOKIES + BROWSER_COOKIES):
        return {"ok": False, "code": "browserIdentityMissing", "detail": "the saved session or its browser identity is incomplete, so nothing was sent", "loginState": "unknown"}
    return await asyncio.to_thread(app_scripts, cookies, browser)


def share_run(cookies: dict[str, str], browser: dict[str, str], act: Any, kind: Any = None, folder: str = "share") -> dict[str, Any]:
    from linkedinApi.share import Composer, ShareRefused

    api = session_of(cookies, browser)
    session = api.client.session
    session.headers.clear()
    lines: list[str] = []
    composer = (kind or Composer)(session, cookies, browser, log=lambda line: (lines.append(line), print(line, file=sys.stderr, flush=True)))
    home = Path(os.environ.get("LOG_CLI_HOME") or Path.home() / ".logCli")
    composer.record = home / "linkedin" / folder / time.strftime("%Y%m%dT%H%M%S")
    try:
        out = act(composer)
    except ShareRefused as refused:
        return {"ok": False, "code": refused.code, "detail": f"{refused.detail} (LinkedIn's answers: {composer.record})", "calls": composer.calls, **refused.extra}
    refreshed = refreshed_of(api, cookies)
    answer: dict[str, Any] = {"ok": True, "loginState": "loggedIn", "calls": composer.calls, "appVersion": composer.version, **out}
    if refreshed:
        answer["refreshedCookies"] = refreshed
    return answer


def identity_missing(cookies: dict[str, str], browser: dict[str, str]) -> dict[str, Any] | None:
    if not browser.get("userAgent") or any(not cookies.get(c) for c in SESSION_COOKIES + BROWSER_COOKIES):
        return {"ok": False, "code": "browserIdentityMissing", "detail": "the saved session or its browser identity is incomplete, so nothing was sent", "loginState": "unknown"}
    return None


async def post(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    from linkedinApi.share import TEXT_MAX, ShareRefused, image_of

    browser = browser_of(spec)
    missing = identity_missing(cookies, browser)
    if missing:
        return missing
    text = str(spec.get("text") or "")
    if not text.strip():
        return {"ok": False, "code": "invalidArgs", "detail": "a post needs its text"}
    if len(text) > TEXT_MAX:
        return {"ok": False, "code": "invalidArgs", "detail": f"LinkedIn posts hold at most {TEXT_MAX} characters, this one has {len(text)}"}
    try:
        image = image_of(str(spec["image"])) if spec.get("image") else None
    except ShareRefused as refused:
        return {"ok": False, "code": refused.code, "detail": refused.detail}
    return await asyncio.to_thread(share_run, cookies, browser, lambda c: c.post(text, image))


async def delete_post(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    browser = browser_of(spec)
    missing = identity_missing(cookies, browser)
    if missing:
        return missing
    activity = str(spec.get("activityId") or "").strip()
    if not activity.isdigit():
        return {"ok": False, "code": "invalidArgs", "detail": "deletePost needs the post's activityId (digits)"}
    return await asyncio.to_thread(share_run, cookies, browser, lambda c: c.delete(activity))


async def mentions(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    browser = browser_of(spec)
    missing = identity_missing(cookies, browser)
    if missing:
        return missing
    text = str(spec.get("text") or "")
    return await asyncio.to_thread(share_run, cookies, browser, lambda c: c.preview_mentions(text))


def connects_path(spec: dict[str, Any]) -> Path:
    return Path(spec["stateRoot"]) / spec["account"] / "connects.json"


def connects_sent(spec: dict[str, Any]) -> list[float]:
    path = connects_path(spec)
    try:
        return [float(t) for t in json.loads(path.read_text(encoding="utf-8")).get("sent") or []]
    except (OSError, ValueError):
        return []


def connect_pace(spec: dict[str, Any], now: float) -> dict[str, Any] | None:
    sent = connects_sent(spec)
    if sent and now - max(sent) < CONNECT_GAP_S:
        wait = int((CONNECT_GAP_S - (now - max(sent))) // 60) + 1
        return {"ok": False, "code": "connectTooSoon", "detail": f"the last invitation went {int((now - max(sent)) // 60)} min ago: connects go at least {CONNECT_GAP_S // 60} min apart (LinkedIn refused every connect sent seconds after another), so nothing was sent. Wait about {wait} min"}
    today = [t for t in sent if now - t < 24 * 3600]
    if len(today) >= CONNECTS_PER_DAY:
        return {"ok": False, "code": "connectDailyCap", "detail": f"{len(today)} invitations in the last 24 hours, the most this account sends: nothing was sent"}
    return None


def connect_noted(spec: dict[str, Any], now: float) -> None:
    sent = [t for t in connects_sent(spec) if now - t < 7 * 24 * 3600] + [now]
    path = connects_path(spec)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"sent": sent}), encoding="utf-8")


async def suggestions(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    from linkedinApi.network import Network

    browser = browser_of(spec)
    missing = identity_missing(cookies, browser)
    if missing:
        return missing
    return await asyncio.to_thread(share_run, cookies, browser, lambda n: n.suggestions(), Network, "network")


async def connect_check(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    return connect_pace(spec, time.time()) or {"ok": True, "loginState": "unknown", "connectsToday": len([t for t in connects_sent(spec) if time.time() - t < 24 * 3600])}


async def connect(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    from linkedinApi.network import Network

    browser = browser_of(spec)
    missing = identity_missing(cookies, browser)
    if missing:
        return missing
    profile = str(spec.get("profile") or "").strip()
    if not profile:
        return {"ok": False, "code": "invalidArgs", "detail": "connect needs the profile's public id"}
    now = time.time()
    paced = connect_pace(spec, now)
    if paced:
        return paced
    out = await asyncio.to_thread(share_run, cookies, browser, lambda n: n.connect(profile), Network, "network")
    if out.get("ok") or out.get("code") == "connectRefused":
        connect_noted(spec, now)
    return out


ACTIONS = {"ping": ping, "scripts": scripts, "post": post, "deletePost": delete_post, "mentions": mentions, "suggestions": suggestions, "connectPace": connect_check, "connect": connect}


if __name__ == "__main__":
    raise SystemExit(kit.main(ACTIONS, WRITES, LIBRARY))
