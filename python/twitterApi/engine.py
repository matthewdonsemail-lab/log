from __future__ import annotations

import asyncio
import contextvars
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

from platformKit import media as media_kit
from platformKit import reactions

SECRET_KEYS = ("auth_token", "ct0", "twid", "kdt", "att", "password", "cookie")
READS = ("ping", "follows", "inbox", "followers", "notifications", "webClient", "xchatContacts", "xchatUnlock", "xchatWatch", "lists")
WRITES = ("reply", "quote", "like", "repost", "dm", "follow", "post", "react", "listCreate", "listAdd", "xchatVoice")
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


def count_forced(governor: Any, is_mutation: bool) -> None:
    with governor._lock:
        now = governor._clock()
        governor.state._roll(now)
        governor.state.last_request_ts = now
        governor.state.hour_count += 1
        governor.state.day_count += 1
        if is_mutation:
            governor.state.mutation_count += 1
        governor._persist()


def governor_status(account: str, writes_per_day: int | None = None) -> dict[str, Any]:
    return {"ok": True, "account": account, "governor": governor_for(account, writes_per_day).status()}


TRANSACTION_SECONDS = 3 * 3600
LOCK_WAIT_SECONDS = 900
SPACING_SECONDS = (4.0, 11.0)
READ_SPACING_SECONDS = (0.8, 2.5)
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
    def __init__(self, account: str, wait_seconds: float = LOCK_WAIT_SECONDS, name: str = "engine.lock") -> None:
        self.path = state_dir(account) / name
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


SESSIONS: dict[str, Any] = {}


def operations_path() -> Path:
    return state_root() / "xOperations.json"


def live_operations_of(main_js: str, home_html: str) -> dict[str, Any]:
    operations = {}
    for m in re.finditer(r'queryId:"([A-Za-z0-9_-]+)",operationName:"(\w+)",operationType:"(\w+)",metadata:\{featureSwitches:\[([^\]]*)\]', main_js):
        operations[m.group(2)] = {"queryId": m.group(1), "type": m.group(3), "features": [f.strip('"') for f in m.group(4).split(",") if f.strip('"')]}
    wanted = {f for op in operations.values() for f in op["features"]}
    values = {}
    for m in re.finditer(r'"(\w+)":\{"value":(true|false)\}', home_html):
        if m.group(1) in wanted:
            values[m.group(1)] = m.group(2) == "true"
    return {"operations": operations, "featureValues": values}


LIVE_CHUNKS = re.compile(r"DirectMessages|directMessagesData|loader\.MessageHandler|NotificationHandler|bundle\.Notifications|bundle\.Chat\b|XChatEmbed")


def chunk_urls_of(home_html: str) -> dict[str, str]:
    start = home_html.find("t.u=e=>")
    if start < 0:
        return {}
    builder = home_html[start:home_html.find('a.js"', start)]
    maps = re.findall(r"\(\{([^}]*)\}\)\[e\]", builder)
    if len(maps) < 2:
        return {}
    names = dict(re.findall(r'(\d+):"([^"]+)"', maps[0]))
    hashes = dict(re.findall(r'(\d+):"([^"]+)"', maps[1]))
    return {names.get(k, k): f"https://abs.twimg.com/responsive-web/client-web/{names.get(k, k)}.{h}a.js" for k, h in hashes.items()}


XCHAT_EMBED_MANIFEST = "https://chat.x.com/embed-v1.json"
XCHAT_BUILD = re.compile(r"^https://abs\.twimg\.com/x-web/xchat/embed/[0-9a-f]{40}/$")


def xchat_build_of(manifest: Any) -> str | None:
    meta = (manifest or {}).get("metaData") or {}
    entry = str((meta.get("remoteEntry") or {}).get("name") or "")
    public = str(meta.get("publicPath") or "")
    found = re.match(r"([0-9a-f]{40})/", entry)
    build = f"{public}{found.group(1)}/" if found else None
    return build if build and XCHAT_BUILD.match(build) else None


XCHAT_LOCALE = re.compile(r"^assets/(ar|ar-x-fm|bg|bn|ca|cs|cy|da|de|el|en-gb|en-ss|en-xx|es|eu|fa|fi|fil|fr|ga|gl|gu|ha|he|hi|hr|hu|id|ig|it|ja|kk|kn|ko|mr|ms|msa|nb|nl|no|pl|pt|ro|ru|sk|sl|sq|sr|sv|sw|ta|te|th|tr|uk|ur|vi|yo|zh|zh-cn|zh-hk|zh-tw)-[A-Za-z0-9_-]{8}\.js$")


def xchat_scripts_of(build: str, manifest: Any) -> list[str]:
    names: set[str] = set()
    entry = str((((manifest or {}).get("metaData") or {}).get("remoteEntry") or {}).get("name") or "")
    if entry:
        names.add(entry)

    def walk(value: Any) -> None:
        if isinstance(value, str) and value.endswith(".js") and not value.startswith("http"):
            names.add(value.lstrip("./"))
        elif isinstance(value, dict):
            for item in value.values():
                walk(item)
        elif isinstance(value, list):
            for item in value:
                walk(item)

    walk((manifest or {}).get("exposes") or [])
    keep = [name for name in names if not XCHAT_LOCALE.match(name)]
    public = build.rstrip("/").rsplit("/", 1)[0] + "/"
    return sorted(public + name for name in keep)


XCHAT_MOST_FILES = 400


def xchat_imports_of(code: str, url: str) -> list[str]:
    base = url.rsplit("/", 1)[0] + "/"
    found = []
    for name in sorted(set(re.findall(r"[`'\"]\./([A-Za-z0-9_~.-]+-[A-Za-z0-9_-]{8}\.(?:js|wasm))[`'\"]", code))):
        if XCHAT_LOCALE.match("assets/" + name):
            continue
        found.append(base + name)
    return found


async def save_xchat_build(client: Any, folder: Path, spacing: tuple[float, float]) -> dict[str, Any]:
    import random

    headers = {"Referer": "https://x.com/", "Origin": "https://x.com", "User-Agent": client._user_agent}
    out = folder / "xchat"
    out.mkdir(parents=True, exist_ok=True)
    answer = await client.http.request("GET", XCHAT_EMBED_MANIFEST, headers=headers)
    if answer.status_code != 200:
        return {"ok": False, "status": answer.status_code, "detail": f"{XCHAT_EMBED_MANIFEST} answered {answer.status_code}"}
    (out / "embed-v1.json").write_bytes(answer.content)
    manifest = json.loads(answer.text)
    build = xchat_build_of(manifest)
    if not build:
        return {"ok": False, "status": 200, "detail": "embed-v1.json names no X Chat build"}
    public = build.rstrip("/").rsplit("/", 1)[0] + "/"
    saved = []
    wanted = list(xchat_scripts_of(build, manifest))
    seen = set(wanted)
    while wanted and len(seen) <= XCHAT_MOST_FILES:
        url = wanted.pop(0)
        await asyncio.sleep(random.uniform(*spacing))
        got = await client.http.request("GET", url, headers=headers)
        if got.status_code != 200:
            continue
        target = out / url[len(public):]
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(got.content)
        saved.append({"url": url, "file": str(target.relative_to(folder)), "bytes": len(got.content)})
        if url.endswith(".js"):
            for found in xchat_imports_of(got.text, url):
                if found not in seen:
                    seen.add(found)
                    wanted.append(found)
    return {"ok": True, "build": build, "saved": saved}


def load_live_operations() -> None:
    from twikit.client import gql

    try:
        gql.set_live_operations(json.loads(operations_path().read_text(encoding="utf-8")))
    except (OSError, json.JSONDecodeError):
        gql.set_live_operations(None)


def client_for(account: str, cookies: dict[str, str], make: Any) -> Any:
    held = SESSIONS.get(account)
    if held is not None and held.get_cookies().get("auth_token") == cookies.get("auth_token"):
        return held
    load_live_operations()
    client = make(language="en-US")
    client.set_cookies(cookies, clear_cookies=True)
    if own_user_id(cookies):
        client._user_id = own_user_id(cookies)
    restore_transaction(client, account)
    if HOSTING:
        SESSIONS[account] = client
    return client


HOSTING = False


def last_call_path(account: str) -> Path:
    return state_dir(account) / "lastCall.json"


def spacing_wait(account: str, now: float | None = None, draw: Any = None, action: str | None = None) -> float:
    import random
    try:
        last = float(json.loads(last_call_path(account).read_text(encoding="utf-8")).get("at") or 0)
    except (OSError, json.JSONDecodeError, ValueError):
        return 0.0
    gap = (draw or random.uniform)(*(READ_SPACING_SECONDS if action in READS else SPACING_SECONDS))
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


DM_MEDIA_CATEGORIES = {".mp4": "dm_video", ".mov": "dm_video", ".gif": "dm_gif"}
MEDIA_LINK = re.compile(r"^https?://\S+?\.(mp4|mov|gif|jpe?g|png|webp)(\?\S*)?$", re.I)


def media_links_out(spec: dict[str, Any]) -> tuple[str, list[str]]:
    import hashlib
    import urllib.request

    kept, links = [], []
    for line in str(spec.get("text") or "").split("\n"):
        (links if MEDIA_LINK.match(line.strip()) else kept).append(line.strip() if MEDIA_LINK.match(line.strip()) else line)
    media = list(spec.get("media") or [])
    folder = state_dir(str(spec["account"])) / "media" / "outgoing"
    folder.mkdir(parents=True, exist_ok=True)
    for link in links:
        suffix = Path(link.split("?")[0]).suffix.lower()
        path = folder / f"{hashlib.sha1(link.encode()).hexdigest()[:16]}{suffix}"
        if not path.exists():
            with urllib.request.urlopen(urllib.request.Request(link, headers={"User-Agent": "Mozilla/5.0"}), timeout=60) as answer:
                path.write_bytes(answer.read())
        print(f"media link {link} sent as media, not as text ({path.stat().st_size} bytes)", file=sys.stderr, flush=True)
        media.append(str(path))
    return "\n".join(kept).strip(), media


async def upload_dm_media(client: Any, path: str) -> str:
    category = DM_MEDIA_CATEGORIES.get(Path(path).suffix.lower(), "dm_image")
    media_id = await asyncio.wait_for(
        client.upload_media(path, wait_for_completion=category != "dm_image", media_category=category),
        timeout=MEDIA_PROCESSING_SECONDS,
    )
    if not str(media_id or ""):
        raise RuntimeError(f"x gave no media id for {Path(path).name}: nothing was sent")
    return str(media_id)


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
    my_id = own_user_id(cookies)
    me = None
    checked = []
    for handle in handles:
        try:
            data, _ = await client.get(
                "https://x.com/i/api/1.1/friendships/show.json",
                params={"source_id": my_id, "target_screen_name": handle},
                headers=client._base_headers,
            )
            relationship = (data or {}).get("relationship") if isinstance(data, dict) else None
            if not relationship:
                checked.append({"handle": handle, "error": f"x gave no relationship: {json.dumps(data)[:200]}", "event": "failed"})
                continue
            source = relationship.get("source") or {}
            me = me or source.get("screen_name")
            checked.append({"handle": handle, "followsYou": bool(source.get("followed_by")), "youFollow": bool(source.get("following"))})
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
    text = m.get("text") if m.get("text") is not None else f"(could not open: {m.get('error') or 'no key'})"
    extra = media_line(m)
    out = {"id": str(m.get("event_id") or ""), "conversationId": str(m.get("conversation_id") or ""), "time": iso_of(m.get("time_ms")), "senderId": sender, "recipientId": None, "text": f"{text} {extra}".strip() if extra else text, "fromMe": sender == me, "from": handles.get(sender)}
    if m.get("media"):
        out["media"] = [{**{k: a.get(k) for k in ("type", "filename", "path", "error") if a.get(k)}, "audio": media_kit.is_audio({"name": a.get("filename"), "type": "audio/" if str(a.get("type") or "").lower() == "audio" else a.get("type")})} for a in m["media"]]
    return out


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
    sync["named"] = await name_people(client, spec, state, threads)
    sync["seconds"] = round(time.perf_counter() - started, 2)
    sync["maxSequenceId"] = state["maxSequenceId"]
    out = {"ok": True, "loginState": "loggedIn", "userId": me, "screenName": (legacy["users"].get(me) or {}).get("screen_name"), "pages": pages, "limits": limits_of(response), "threads": threads, "waitingOnYou": sum(1 for t in threads if not t["lastFromMe"] and t["lastText"] is not None), "sync": sync}
    if export:
        kept = [t for t in everything if touched is None or t["conversationId"] in touched]
        out["conversations"] = conversations_of(kept, legacy, inboxSync.opened_of(state), me)
    return out


async def name_people(client: Any, spec: dict[str, Any], state: dict[str, Any] | None, threads: list[dict[str, Any]]) -> int:
    known: dict[str, str | None] = {}
    for conv in ((state or {}).get("xchat") or {}).values():
        known.update({u: h for u, h in (conv.get("handles") or {}).items() if h})
    for uid, user in (((state or {}).get("legacy") or {}).get("users") or {}).items():
        if (user or {}).get("screen_name"):
            known[str(uid)] = user["screen_name"]
    named = 0
    for thread in threads:
        found: dict[str, str | None] = {}
        for person in thread.get("with") or []:
            uid = str(person.get("userId") or "")
            if person.get("handle") or not uid.isdigit():
                continue
            handle = known.get(uid) or await handle_of(client, uid, known)
            if handle:
                person["handle"] = handle
                found[uid] = handle
                named += 1
        if found:
            remember_handles(spec, str(thread.get("conversationId")), found)
    return named


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
    await name_people(client, {}, {"legacy": {"users": pool["users"]}}, threads)
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
    stored = stored_xchat(spec, conversation_id)
    unopened = [str(m.get("event_id")) for m in stored if m.get("text") is None and m.get("event_id") and inboxSync_shown(m)][-5:]
    unfetched = [str(m.get("event_id")) for m in stored if m.get("event_id") and not m.get("media") and MEDIA_TEXT.search(m.get("text") or "")][-3:]
    asked = [str(i) for i in spec.get("mediaEvents") or [] if str(i).isdigit()][:MEDIA_EVENTS_PER_READ]
    reopen = list(dict.fromkeys(unopened + unfetched + asked))
    page = await client.get_xchat_conversation(conversation_id, older_pages=max(0, min(int(spec.get("olderPages") if spec.get("olderPages") is not None else 5), 10)), reopen=reopen)
    handles: dict[str, str | None] = dict(stored_handles(spec, conversation_id))
    senders = [str(m.get("sender_id") or "") for m in page["messages"] + stored]
    for user_id in dict.fromkeys([p for p in conversation_id.split(":") if p.isdigit()] + [u for u in senders if u.isdigit()]):
        if user_id != me:
            await handle_of(client, user_id, handles)
    remember_handles(spec, conversation_id, handles)
    fetched = {str(m.get("event_id") or ""): m for m in page["messages"]}
    await save_xchat_media(client, spec, conversation_id, page["messages"], set(asked))
    keep_opened(spec, conversation_id, page["messages"])
    held = stored_xchat(spec, conversation_id)
    for m in held:
        key = str(m.get("event_id") or "")
        if key and (key not in fetched or (fetched[key].get("text") is None and m.get("text") is not None)):
            fetched[key] = m
    merged = sorted(fetched.values(), key=lambda m: int(m.get("time_ms") or 0))
    from twitterApi import inboxSync

    shown = [m for m in merged if inboxSync.shown(m)]
    messages = [xchat_message(m, me, handles) for m in shown if m.get("text") is not None or m.get("media")][-limit:]
    unnamed = {u: HANDLE_ERRORS.get(u, "no screen_name in X's answer") for u in dict.fromkeys(m["senderId"] for m in messages) if u and u != me and not handles.get(u)}
    return {"ok": True, "loginState": "loggedIn", "userId": me, "conversationId": conversation_id, "box": "xchat", "hasMore": page.get("has_more"), "olderPages": page.get("older_pages") or [], "fromStore": len(held), "messages": messages, **({"unnamed": unnamed} if unnamed else {})}


MEDIA_PER_READ = 8
MEDIA_EVENTS_PER_READ = 9
MEDIA_TEXT = re.compile(r"\((image|gif|video|audio|media|file)[:)]")


def media_path(spec: dict[str, Any], conversation_id: str, attachment: dict[str, Any]) -> Path:
    name = str(attachment.get("filename") or "")
    suffix = Path(name).suffix.lower() if re.fullmatch(r"\.[A-Za-z0-9]{1,5}", Path(name).suffix) else ".bin"
    stem = re.sub(r"[^0-9A-Za-z_-]", "_", str(attachment["media_hash_key"]))[-48:]
    return state_dir(str(spec["account"])) / "media" / re.sub(r"[^0-9A-Za-z_-]", "_", conversation_id) / f"{stem}{suffix}"


async def save_xchat_media(client: Any, spec: dict[str, Any], conversation_id: str, messages: list[dict[str, Any]], asked: set[str] | None = None) -> None:
    if not spec.get("account"):
        return
    every = [(m, a) for m in messages for a in (m.get("media") or [])]
    latest = every[-MEDIA_PER_READ:]
    wanted = latest + [(m, a) for m, a in every if str(m.get("event_id") or "") in (asked or set()) and (m, a) not in latest]
    for m, attachment in wanted:
        path = media_path(spec, conversation_id, attachment)
        if not path.is_file():
            if not m.get("key_version"):
                attachment["error"] = "no key version on its message"
                continue
            try:
                data = await client.get_xchat_media(conversation_id, attachment["media_hash_key"], m["key_version"])
            except Exception as e:
                attachment["error"] = str(e)[:160]
                continue
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
        attachment["path"] = str(path)


def media_line(m: dict[str, Any]) -> str:
    saved = [f"({a.get('type') or 'media'} saved: {a['path']})" for a in m.get("media") or [] if a.get("path")]
    failed = [f"({a.get('type') or 'media'} not downloaded: {a['error']})" for a in m.get("media") or [] if a.get("error") and not a.get("path")]
    return " ".join(saved + failed)


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
    inboxSync.add_messages(conv, [{k: m.get(k) for k in ("event_id", "sender_id", "time_ms", "text", "conversation_id", "kind", "error", "media", "key_version") if m.get(k) is not None} | {"conversation_id": conversation_id} for m in messages])
    inboxSync.write_state(path, state)


def stored_handles(spec: dict[str, Any], conversation_id: str) -> dict[str, str]:
    from twitterApi import inboxSync

    if not spec.get("account"):
        return {}
    state = inboxSync.read_state(sync_path(spec))
    return dict(((state or {}).get("xchat", {}).get(conversation_id) or {}).get("handles") or {})


def remember_handles(spec: dict[str, Any], conversation_id: str, handles: dict[str, str | None]) -> None:
    from twitterApi import inboxSync

    named = {u: h for u, h in handles.items() if h}
    if spec.get("account") and named:
        inboxSync.remember_handles(sync_path(spec), conversation_id, named)


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


def notifications_path(account: str) -> Path:
    return state_dir(account) / "notifications.json"


async def notifications(client: Any, cookies: dict[str, str], spec: dict[str, Any], governor: Any) -> dict[str, Any]:
    from governor import GovernorBlockedError
    from twikit.errors import TooManyRequests

    from twitterApi.notifications import PAGE_SIZE, read_store, sync_notifications

    me = own_user_id(cookies) or ""
    path = notifications_path(str(spec["account"]))
    full = spec.get("full") is True
    max_pages = max(1, min(int(spec.get("pages") or (25 if full else 5)), 200))

    async def fetch(cursor: str | None) -> dict[str, Any]:
        return await client.get_notifications_page("All", PAGE_SIZE, cursor)

    async def pace() -> None:
        import random
        await asyncio.sleep(random.uniform(*READ_SPACING_SECONDS))
        if governor is not None:
            governor.before_request(is_mutation=False, quiet=True)

    def log(line: str) -> None:
        print(f"notifications: {line}", file=sys.stderr, flush=True)

    base = {"loginState": "loggedIn", "userId": me, "storePath": str(path)}
    try:
        sync = await sync_notifications(fetch, pace, path, me, spec.get("screenName"), full, max_pages, log)
    except TooManyRequests as e:
        held = read_store(path) or {"rows": {}}
        return {**base, "ok": False, "code": "rateLimited", "event": "throttled", "detail": f"X answered 429 to a notifications page: the read stopped there, {len(held['rows'])} rows are kept ({redact(e, cookies)[:160]})", "rateLimitReset": getattr(e, "rate_limit_reset", None)}
    except GovernorBlockedError as e:
        held = read_store(path) or {"rows": {}}
        return {**base, "ok": False, "code": "governorBlocked", "detail": f"the governor stopped the notifications read between pages: {e}; {len(held['rows'])} rows are kept"}
    return {**base, "ok": True, "notificationSync": sync}


LIVE_WRITER: contextvars.ContextVar[Any] = contextvars.ContextVar("liveWriter", default=None)


def live_line(event: dict[str, Any]) -> None:
    line = json.dumps({"liveEvent": event}, default=str)
    writer = LIVE_WRITER.get()
    if writer is not None:
        writer.write((line + chr(10)).encode("utf-8"))
        return
    print(line, flush=True)


HANDLE_ERRORS: dict[str, str] = {}


async def handle_of(client: Any, user_id: str, handles: dict[str, str | None]) -> str | None:
    if user_id and not handles.get(user_id):
        try:
            found = getattr(await client.get_user_by_id(user_id), "screen_name", None)
            if found:
                handles[user_id] = found
                HANDLE_ERRORS.pop(user_id, None)
        except Exception as e:
            HANDLE_ERRORS[user_id] = f"{type(e).__name__}: {str(e)[:160]}"
    return handles.get(user_id)


async def web_client(client: Any, spec: dict[str, Any]) -> dict[str, Any]:
    import random
    from datetime import datetime, timezone

    folder = state_dir(str(spec["account"])) / "webClient" / datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    folder.mkdir(parents=True, exist_ok=True)
    page_headers = {"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "Accept-Language": f"{client.language},{client.language.split('-')[0]};q=0.9", "Cache-Control": "no-cache", "Referer": "https://x.com", "User-Agent": client._user_agent}
    home = await client.http.request("GET", "https://x.com/home", headers=page_headers)
    html = home.text
    (folder / "home.html").write_text(html, encoding="utf-8")
    scripts = sorted(set(re.findall(r"https://abs\.twimg\.com/[^\"'\s]+?\.js", html)))
    chunks = sorted(url for name, url in chunk_urls_of(html).items() if LIVE_CHUNKS.search(name))
    scripts = scripts + [url for url in chunks if url not in scripts]
    saved = []
    for url in scripts:
        await asyncio.sleep(random.uniform(*READ_SPACING_SECONDS))
        answer = await client.http.request("GET", url, headers={"Referer": "https://x.com/", "User-Agent": client._user_agent})
        if answer.status_code == 200:
            name = url.rsplit("/", 1)[-1]
            (folder / name).write_bytes(answer.content)
            saved.append({"url": url, "file": name, "bytes": len(answer.content)})
    main = next((folder / f["file"] for f in saved if f["file"].startswith("main.")), None)
    code = "\n".join((folder / f["file"]).read_text(encoding="utf-8") for f in saved if f["file"].endswith(".js"))
    live = live_operations_of(code, html) if main else None
    if live and live["operations"]:
        live["savedAt"] = datetime.now(timezone.utc).isoformat()
        live["from"] = main.name
        operations_path().write_text(json.dumps(live, indent=1), encoding="utf-8")
        load_live_operations()
    xchat = await save_xchat_build(client, folder, READ_SPACING_SECONDS)
    return {"ok": True, "loginState": "loggedIn", "folder": str(folder), "homeStatus": home.status_code, "scripts": scripts, "chunks": chunks, "saved": saved, "xchat": {"ok": xchat["ok"], "build": xchat.get("build"), "files": len(xchat.get("saved", [])), **({"detail": xchat["detail"]} if not xchat["ok"] else {})}, "operations": len(live["operations"]) if live else 0, "featureValues": len(live["featureValues"]) if live else 0}


VIEWER_BADGE_COUNTS = "https://x.com/i/api/graphql/q4Npr1-FYRWyXsRzPckwEA/ViewerBadgeCounts"
POLLING_HEADERS = {"x-twitter-polling": "true"}
BADGE_POLL_SECONDS = 120.0


def badge_counts_of(answer: Any) -> dict[str, Any] | None:
    result = (((answer or {}).get("data") or {}).get("viewer_v2") or {}).get("user_results", {}).get("result") or {}
    counts = result.get("badge_counts") if result.get("__typename") == "User" else None
    return counts if isinstance(counts, dict) else None


def live_path(account: str) -> Path:
    return state_dir(account) / "live.jsonl"


def append_live(account: str, event: dict[str, Any]) -> None:
    from datetime import datetime, timezone

    with live_path(account).open("a", encoding="utf-8") as out:
        out.write(json.dumps({"seenAt": datetime.now(timezone.utc).isoformat(), **event}, default=str) + "\n")


def notification_rose(before: dict[str, Any] | None, after: dict[str, Any]) -> bool:
    return int(after.get("ntab_unread_count") or 0) > int((before or {}).get("ntab_unread_count") or 0)


async def new_notifications(client: Any, cookies: dict[str, str], spec: dict[str, Any], governor: Any) -> list[dict[str, Any]]:
    from twitterApi.notifications import read_store

    path = notifications_path(str(spec["account"]))
    before = set((read_store(path) or {"rows": {}})["rows"])
    answer = await notifications(client, cookies, {**spec, "full": False, "pages": 1}, governor)
    if not answer.get("ok"):
        return [{"type": "notificationsRefused", "code": answer.get("code"), "detail": answer.get("detail")}]
    rows = (read_store(path) or {"rows": {}})["rows"]
    return [{"type": "notification", **row} for key, row in rows.items() if key not in before and live_worthy(row, before)]


LIVE_KINDS = ("like", "repost", "reply", "quote", "mention", "follow")
LIVE_WINDOW_SECONDS = 24 * 3600


def live_worthy(row: dict[str, Any], before: set[str], now: float | None = None) -> bool:
    from datetime import datetime

    if not before or row.get("kind") not in LIVE_KINDS:
        return False
    try:
        at = datetime.fromisoformat(str(row.get("at")).replace("Z", "+00:00")).timestamp()
    except ValueError:
        return False
    return (now if now is not None else time.time()) - at <= LIVE_WINDOW_SECONDS


BADGE_POLL_TIMEOUT_SECONDS = 45

NETWORK_ERROR = re.compile(r"curl: \(\d+\)|Connection (was )?reset|timed out|Recv failure|Could not resolve|TimeoutError", re.IGNORECASE)


def network_only(error: str) -> bool:
    return bool(NETWORK_ERROR.search(error)) and not re.search(r"\b429\b", error)


async def badge_poll(client: Any, cookies: dict[str, str], spec: dict[str, Any], governor: Any, every: float = BADGE_POLL_SECONDS) -> None:
    import random

    account = str(spec["account"])
    last: dict[str, Any] | None = None
    while True:
        try:
            if governor is not None:
                governor.before_request(is_mutation=False, quiet=True)
            answer, _ = await asyncio.wait_for(client.gql.gql_get(VIEWER_BADGE_COUNTS, {}, headers={**client._base_headers, **POLLING_HEADERS}), timeout=BADGE_POLL_TIMEOUT_SECONDS)
            counts = badge_counts_of(answer)
            if counts is not None and counts != last:
                append_live(account, {"type": "badge", **counts})
                live_line({"type": "badge", **counts})
                if notification_rose(last, counts):
                    refused = False
                    for event in await asyncio.wait_for(new_notifications(client, cookies, spec, governor), timeout=BADGE_POLL_TIMEOUT_SECONDS * 2):
                        append_live(account, event)
                        live_line(event)
                        refused = refused or event.get("type") == "notificationsRefused"
                    if refused:
                        return
                last = counts
        except asyncio.CancelledError:
            raise
        except Exception as e:
            error = (redact(e, cookies) or type(e).__name__)[:200]
            if isinstance(e, asyncio.TimeoutError):
                error = f"TimeoutError: no answer from x in {BADGE_POLL_TIMEOUT_SECONDS}s"
            append_live(account, {"type": "pollRefused", "error": error})
            live_line({"type": "pollRefused", "error": error})
            if not network_only(error):
                return
        await asyncio.sleep(every * random.uniform(0.95, 1.05))


async def xchat_watch(client: Any, cookies: dict[str, str], spec: dict[str, Any], governor: Any = None) -> dict[str, Any]:
    poll = asyncio.create_task(badge_poll(client, cookies, spec, governor)) if spec.get("live") is not False else None
    try:
        return await xchat_stream(client, cookies, spec)
    finally:
        if poll is not None:
            poll.cancel()


async def xchat_stream(client: Any, cookies: dict[str, str], spec: dict[str, Any]) -> dict[str, Any]:
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
    unopened: dict[str, dict[str, Any]] = {}

    async def deliver(event: dict[str, Any]) -> None:
        nonlocal messages
        sender = str(event.get("sender_id") or "")
        messages += 1
        if sender and not handles.get(sender):
            handles.update({u: h for u, h in stored_handles(spec, str(event.get("conversation_id"))).items() if h})
        handle = await handle_of(client, sender, handles) if sender != me else None
        if handle:
            remember_handles(spec, str(event.get("conversation_id")), {sender: handle})
        if unlocked and event.get("media"):
            await save_xchat_media(client, spec, str(event.get("conversation_id")), [event])
        if unlocked and event.get("text") is not None:
            inboxSync.push_message(sync_path(spec), me, event, handle)
        live_line({**xchat_message(event, me, {sender: handle or ""}), "box": "xchat", "encrypted": not unlocked})

    async def reopen_due() -> None:
        while True:
            await asyncio.sleep(XCHAT_REOPEN_TICK)
            now = time.time()
            for key, held in list(unopened.items()):
                if held["due"] > now:
                    continue
                opened = await reopened(client, held["event"])
                if opened is not None:
                    unopened.pop(key, None)
                    live_line({"type": "unopened", "state": "opened", "eventId": key, "tries": held["tries"] + 1})
                    await deliver(opened)
                    continue
                held["tries"] += 1
                if held["tries"] >= len(XCHAT_REOPEN_AFTER) + XCHAT_REOPEN_LATE_TRIES:
                    unopened.pop(key, None)
                    live_line({"type": "unopened", "state": "gaveUp", "eventId": key, "conversationId": held["event"].get("conversation_id"), "error": str(held["event"].get("error") or "")[:160]})
                    continue
                held["due"] = now + (XCHAT_REOPEN_AFTER[held["tries"]] if held["tries"] < len(XCHAT_REOPEN_AFTER) else XCHAT_REOPEN_LATE)

    reopener = asyncio.create_task(reopen_due()) if unlocked else None
    try:
        async for event in client.watch_xchat(seconds=float(seconds) if seconds else None):
            if event.get("type") == "socket":
                live_line({**event, "error": redact(event["error"], cookies)[:200]} if event.get("error") else event)
                continue
            if event.get("type") not in ("Message", None) or (event.get("text") is None and event.get("kind") in XCHAT_SILENT_KINDS) or not event.get("conversation_id"):
                continue
            if unlocked and event.get("text") is None and event.get("original_b64"):
                key = str(event.get("event_id") or event["original_b64"][:40])
                unopened.setdefault(key, {"event": event, "tries": 0, "due": time.time() + XCHAT_REOPEN_AFTER[0]})
                live_line({"type": "unopened", "state": "waitingForKey", "eventId": key, "conversationId": event.get("conversation_id")})
                continue
            await deliver(event)
    finally:
        if reopener:
            reopener.cancel()
    return {"ok": True, "loginState": "loggedIn", "userId": me, "messages": messages, "unlocked": unlocked}


XCHAT_REOPEN_AFTER = (5, 30, 120, 600, 1800)
XCHAT_REOPEN_LATE = 1800
XCHAT_REOPEN_LATE_TRIES = 48
XCHAT_REOPEN_TICK = 5
XCHAT_SILENT_KINDS = ("MarkRead", "ReactionRemoved")


async def reopened(client: Any, event: dict[str, Any]) -> dict[str, Any] | None:
    try:
        opened = await client._xchat_open(event["original_b64"])
    except Exception:
        return None
    if opened.get("text") is None and not opened.get("media"):
        return None
    return opened


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
    if action == "react":
        return await react(client, spec)
    if action == "xchatVoice":
        return await xchat_voice(client, spec)
    if action == "listCreate":
        return await list_create(client, spec)
    if action == "listAdd":
        return await list_add(client, spec)
    if action == "follow":
        user_id = str(spec["userId"])
        before = await client.get_user_by_id(user_id)
        if getattr(before, "following", False):
            return {"ok": True, "event": "sent", "followed": True, "already": True, "userId": user_id, "handle": getattr(before, "screen_name", None)}
        user = await client.follow_user(user_id)
        if not str(getattr(user, "id", "") or ""):
            return {"ok": False, "event": "dropped", "code": "xSentNothing", "detail": "x answered the follow with no user: nobody was followed"}
        return {"ok": True, "event": "sent", "followed": True, "userId": user_id, "handle": getattr(user, "screen_name", None) or getattr(before, "screen_name", None)}
    if action in ("dm", "post", "reply"):
        text, media = media_links_out(spec)
        spec = {**spec, "text": text, "media": media}
    if action == "dm" and re.fullmatch(r"g\d+", str(spec.get("userId") or "")):
        return await xchat_group_text(client, spec)
    if action == "dm":
        media = list(spec.get("media") or [])
        dm_media_id = await upload_dm_media(client, str(media[0])) if media else None
        message = await client.send_dm(str(spec["userId"]), spec["text"], media_id=dm_media_id)
        message_id = str(getattr(message, "id", "") or "") or None
        if not message_id:
            return {"ok": False, "event": "dropped", "code": "xSentNothing", "detail": "x answered the dm with no message id: nothing was sent"}
        pair = sorted([str(getattr(message, "sender_id", "") or ""), str(getattr(message, "recipient_id", "") or "")], key=lambda i: int(i) if i.isdigit() else 0)
        return {"ok": True, "event": "sent", "mode": "dm", "messageId": message_id, "conversationId": "-".join(pair), "userId": str(spec["userId"]), **({"mediaIds": [dm_media_id]} if dm_media_id else {})}
    media_ids: list[str] = []
    followed: dict[str, Any] | None = None
    liked: dict[str, Any] | None = None
    if action == "post":
        media_ids = await upload_post_media(client, list(spec.get("media") or []))
        tweet = await client.create_tweet(text=spec["text"], media_ids=media_ids or None)
    elif action == "reply":
        too_big = await author_too_big(client, spec)
        if too_big:
            print(f"reply to {spec.get('tweetUrl')}: skipped, {too_big['detail']}", file=sys.stderr, flush=True)
            return too_big
        liked = await like_post_first(client, spec)
        followed = await follow_author_first(client, spec)
        print(f"reply to {spec.get('tweetUrl')}: like first {json.dumps(liked)}, follow first {json.dumps(followed)}", file=sys.stderr, flush=True)
        media_ids = await upload_post_media(client, list(spec.get("media") or []))
        tweet = await client.create_tweet(text=spec["text"], media_ids=media_ids or None, reply_to=tweet_id_from_url(spec["tweetUrl"]))
    else:
        tweet = await client.create_tweet(text=spec["text"], attachment_url=spec["tweetUrl"])
    tweet_id = getattr(tweet, "id", None) or created_id_of(raw.get("body"))
    if not tweet_id:
        limits = raw.get("limits") or {}
        return {"ok": False, "event": "dropped", "code": "xSentNothing", "detail": f"x created no tweet (empty result): nothing was posted. x said: {json.dumps(raw.get('body'))[:300]}", "limits": limits, "rateLimitReset": reset_of(limits)}
    return {"ok": True, "event": "sent", "mode": action, "tweetId": tweet_id, "target": spec.get("tweetUrl") or "newPost", **({"mediaIds": media_ids} if media_ids else {}), **({"likedPost": liked} if liked else {}), **({"followedAuthor": followed} if followed else {}), "limits": raw.get("limits") or {}}


def list_row(found: Any) -> dict[str, Any]:
    return {"id": str(found.id), "name": found.name, "mode": found.mode, "memberCount": found.member_count, "description": found.description}


async def lists_of(client: Any) -> list[dict[str, Any]]:
    me = str(await client.user_id())
    return [list_row(found) for found in await client.get_lists(count=100) if getattr(found, "owner_id", None) in (None, me)]


async def list_create(client: Any, spec: dict[str, Any]) -> dict[str, Any]:
    name = str(spec["name"]).strip()
    for found in await lists_of(client):
        if found["name"].lower() == name.lower():
            return {"ok": True, "event": "sent", "mode": "listCreate", "already": True, "list": found}
    made = await client.create_list(name, str(spec.get("description") or ""), is_private=spec.get("private") is True)
    if not str(getattr(made, "id", "") or ""):
        return {"ok": False, "event": "dropped", "code": "listRefused", "detail": f"x made no list called {name}"}
    return {"ok": True, "event": "sent", "mode": "listCreate", "list": list_row(made)}


async def list_add(client: Any, spec: dict[str, Any]) -> dict[str, Any]:
    user_id = str(spec.get("userId") or "")
    handle = str(spec.get("screenName") or "").lstrip("@")
    if not user_id:
        user = await client.get_user_by_screen_name(handle)
        user_id = str(getattr(user, "id", "") or "")
        if not user_id:
            return {"ok": False, "event": "dropped", "code": "targetMissing", "detail": f"x has no user @{handle}"}
    added = await client.add_list_member(str(spec["listId"]), user_id)
    if not str(getattr(added, "id", "") or ""):
        return {"ok": False, "event": "dropped", "code": "listRefused", "detail": f"x didn't add {handle or user_id} to list {spec['listId']}"}
    return {"ok": True, "event": "sent", "mode": "listAdd", "list": list_row(added), "userId": user_id, **({"handle": handle} if handle else {})}


async def react(client: Any, spec: dict[str, Any]) -> dict[str, Any]:
    conversation_id = str(spec["conversationId"]).replace(":", "-")
    message_id = str(spec["messageId"])
    emoji = str(reactions.unicode_of(str(spec["emoji"])))
    remove = spec.get("remove") is True
    call = client.gql.user_dm_reaction_mutation_remove_mutation if remove else client.gql.user_dm_reaction_mutation_add_mutation
    data, _ = await call(message_id, conversation_id, emoji)
    errors = data.get("errors") if isinstance(data, dict) else None
    if errors or not (isinstance(data, dict) and data.get("data")):
        return {"ok": False, "event": "dropped", "code": "reactRefused", "detail": f"x didn't take the reaction: {json.dumps(data)[:300]}"}
    return {"ok": True, "event": "sent", "mode": "react", "removed": remove, "emoji": emoji, "messageId": message_id, "conversationId": conversation_id}


def created_id_of(body: Any) -> str | None:
    data = (body or {}).get("data") or {} if isinstance(body, dict) else {}
    made = data.get("create_tweet") or data.get("notetweet_create") or {}
    result = ((made.get("tweet_results") or {}).get("result")) or {}
    if result.get("__typename") == "TweetWithVisibilityResults":
        result = result.get("tweet") or {}
    rest_id = result.get("rest_id")
    return str(rest_id) if rest_id else None


def handle_from_post_url(url: str) -> str | None:
    match = re.match(r"https?://(?:www\.)?(?:x|twitter)\.com/([A-Za-z0-9_]{1,15})/status/\d+", str(url or ""))
    return match.group(1) if match and match.group(1).lower() not in ("i", "home") else None


MAX_AUTHOR_FOLLOWERS = 1500


async def author_too_big(client: Any, spec: dict[str, Any]) -> dict[str, Any] | None:
    cap = spec.get("maxAuthorFollowers", MAX_AUTHOR_FOLLOWERS)
    if cap is None or cap is False or spec.get("force") is True:
        return None
    screen_name = handle_from_post_url(spec["tweetUrl"])
    if not screen_name:
        return None
    try:
        author = await client.get_user_by_screen_name(screen_name)
    except (KeyError, IndexError, TypeError):
        return None
    count = getattr(author, "followers_count", None)
    if not isinstance(count, int) or count <= int(cap):
        return None
    return {"ok": False, "event": "tooBig", "code": "authorTooBig", "detail": f"@{screen_name} has {count} followers, over {int(cap)}: too big to reply to yet, so nothing was liked, followed or sent", "followers": count}


async def like_post_first(client: Any, spec: dict[str, Any]) -> dict[str, Any] | None:
    if spec.get("likeFirst") is False:
        return None
    tweet_id = tweet_id_from_url(spec["tweetUrl"])
    data, _ = await client.gql.favorite_tweet(tweet_id)
    errors = data.get("errors") if isinstance(data, dict) else None
    if errors and any(e.get("code") == 139 for e in errors):
        return {"tweetId": tweet_id, "already": True}
    if errors or ((data or {}).get("data") or {}).get("favorite_tweet") != "Done":
        return {"tweetId": tweet_id, "skipped": f"x did not like the post: {json.dumps(data)[:200]}"}
    return {"tweetId": tweet_id, "already": False}


async def follow_author_first(client: Any, spec: dict[str, Any]) -> dict[str, Any] | None:
    if spec.get("followFirst") is False:
        return None
    screen_name = handle_from_post_url(spec["tweetUrl"])
    try:
        author = await client.get_user_by_screen_name(screen_name) if screen_name else getattr(await client.get_tweet_by_id(tweet_id_from_url(spec["tweetUrl"])), "user", None)
    except (KeyError, IndexError, TypeError) as error:
        return {"skipped": f"the author could not be read ({type(error).__name__}: {error}), so they were not followed"}
    user_id = str(getattr(author, "id", "") or "")
    if not user_id or user_id == str(getattr(client, "_user_id", "") or ""):
        return None
    handle = getattr(author, "screen_name", None)
    if getattr(author, "following", False):
        return {"userId": user_id, "handle": handle, "already": True}
    await client.follow_user(user_id)
    return {"userId": user_id, "handle": handle, "already": False}


XCHAT_VOICE_FILENAME = "voice-note-{stamp}.m4a"


async def xchat_group_text(client: Any, spec: dict[str, Any]) -> dict[str, Any]:
    conversation_id = str(spec["userId"])
    if getattr(client, "_xchat", None) is None:
        if not spec.get("pinPath"):
            return {"ok": False, "event": "dropped", "code": "xchatPinMissing", "detail": "X Chat has to be opened with the account's saved PIN to send in a group"}
        try:
            await xchat_read_keys(client, spec)
        except Exception as e:
            return {"ok": False, "event": "dropped", "code": "xchatLocked", "detail": f"X Chat didn't unlock with the saved PIN: {str(e)[:200]}"}
    sent = await client.send_xchat_message(conversation_id, str(spec["text"]))
    return {"ok": True, "event": "sent", "mode": "xchatGroup", "messageId": sent["message_id"], "conversationId": conversation_id, "keyVersion": sent["key_version"]}


async def xchat_voice(client: Any, spec: dict[str, Any]) -> dict[str, Any]:
    path = media_kit.voice_note_path(spec.get("path"), ".m4a")
    if not path:
        return {"ok": False, "event": "dropped", "code": "voiceNoteInvalid", "detail": "xchatVoice sends only a voice note log made itself (an .m4a under ~/.logCli/voiceNotes): no other audio is sent"}
    if getattr(client, "_xchat", None) is None:
        if not spec.get("pinPath"):
            return {"ok": False, "event": "dropped", "code": "xchatPinMissing", "detail": "X Chat has to be opened with the account's saved PIN to send"}
        try:
            await xchat_read_keys(client, spec)
        except Exception as e:
            return {"ok": False, "event": "dropped", "code": "xchatLocked", "detail": f"X Chat didn't unlock with the saved PIN: {str(e)[:200]}"}
    named = str(spec.get("screenName") or spec.get("userId") or "")
    if re.fullmatch(r"g\d+", named):
        user_id, conversation_id = "", named
    else:
        user_id = str(spec.get("userId") or "")
        if not user_id and spec.get("screenName"):
            user = await client.get_user_by_screen_name(str(spec["screenName"]))
            user_id = str(getattr(user, "id", "") or "")
        if not user_id.isdigit():
            return {"ok": False, "event": "dropped", "code": "targetMissing", "detail": f"no X user found for {spec.get('screenName') or spec.get('userId')}"}
        me = str(await client.user_id())
        conversation_id = ":".join(sorted([me, user_id], key=int))
    seconds = float(spec.get("seconds") or 0)
    stamp = int(time.time() * 1000)
    sent = await client.send_xchat_voice(conversation_id, path.read_bytes(), int(round(seconds * 1000)), XCHAT_VOICE_FILENAME.format(stamp=stamp))
    return {"ok": True, "event": "sent", "mode": "xchatVoice", "messageId": sent["message_id"], "conversationId": conversation_id, "userId": user_id, "seconds": seconds, "keyVersion": sent["key_version"], "mediaHashKey": sent["media"]["media_hash_key"], "parts": sent["media"]["parts"]}


def refusal_of(spec: dict[str, Any]) -> dict[str, Any] | None:
    action = spec["action"]
    if action in WRITES and spec.get("live") is not True:
        return {"ok": False, "code": "notLive", "detail": f"{action} sends on X: the engine only sends with live set (rule 8)"}
    if action in WRITES and not str(spec.get("approvedBy") or "").strip():
        return {"ok": False, "code": "notApproved", "detail": f"{action} needs the name of who approved it"}
    if action in ("reply", "quote", "like", "repost") and not spec.get("tweetUrl"):
        return {"ok": False, "code": "targetMissing", "detail": f"{action} needs the post's url"}
    if action == "react" and not (spec.get("conversationId") and spec.get("messageId") and reactions.unicode_of(str(spec.get("emoji") or ""))):
        return {"ok": False, "code": "reactInvalid", "detail": "react needs the conversation id, the message id and an emoji"}
    if action == "listCreate" and not str(spec.get("name") or "").strip():
        return {"ok": False, "code": "listInvalid", "detail": "listCreate needs the list's name"}
    if action == "listAdd" and not (str(spec.get("listId") or "").strip() and (spec.get("userId") or spec.get("screenName"))):
        return {"ok": False, "code": "listInvalid", "detail": "listAdd needs the list's id and the person's user id or handle"}
    if action == "xchatVoice" and not (spec.get("userId") or spec.get("screenName")):
        return {"ok": False, "code": "targetMissing", "detail": "xchatVoice needs the person's user id or handle"}
    if action == "xchatVoice" and not spec.get("path"):
        return {"ok": False, "code": "voiceNoteInvalid", "detail": "xchatVoice needs the voice note log made"}
    if action in ("dm", "follow") and not spec.get("userId"):
        return {"ok": False, "code": "targetMissing", "detail": f"{action} needs the person's user id"}
    if action == "post" and any(not Path(str(m)).is_file() for m in (spec.get("media") or [])):
        return {"ok": False, "code": "mediaInvalid", "detail": "post: a media file isn't there"}
    if action in ("reply", "quote", "dm", "post") and not str(spec.get("text") or "").strip():
        return {"ok": False, "code": "textMissing", "detail": f"{action} needs its text"}
    if action == "follows" and not spec.get("handles"):
        return {"ok": False, "code": "targetMissing", "detail": "follows needs the handles to check"}
    return None


async def act(client: Any, cookies: dict[str, str], spec: dict[str, Any], governor: Any = None) -> dict[str, Any]:
    action = spec["action"]
    if action == "ping":
        return await ping(client, cookies)
    status = await session_answer(client)
    state = login_state_of(status)
    if state != "loggedIn":
        dead = state == "loggedOut"
        return {"ok": False, "code": "sessionDead" if dead else "sessionUnknown", "event": "sessionDead" if dead else "failed", "detail": f"X answered HTTP {status} to the session check before the {action}", "loginState": state, "httpStatus": status}
    if action == "lists":
        return {"ok": True, "loginState": "loggedIn", "lists": await lists_of(client)}
    if action == "follows":
        return await follows(client, cookies, [h.strip().lstrip("@") for h in spec["handles"] if h.strip()])
    if action == "followers":
        return await followers(client, cookies, max(1, min(int(spec.get("limit") or 200), 4000)))
    if action == "notifications":
        return await notifications(client, cookies, spec, governor)
    if action == "webClient":
        return await web_client(client, spec)
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
        return await xchat_watch(client, cookies, spec, governor)
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
            wait = spacing_wait(account, action=action)
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
        count_forced(governor, action in WRITES)
    client = client_for(account, cookies, Client)
    try:
        out = await act(client, cookies, spec, governor)
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
    if spec.get("governorStatus"):
        out = governor_status(spec["account"], spec.get("writesPerDay"))
    elif os.environ.get("LOG_TWITTER_HOST") == "inline":
        out = asyncio.run(run(spec))
    else:
        from twitterApi import host
        out = host.call(spec)
    print(json.dumps(out, default=str))
    return 0 if out.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
