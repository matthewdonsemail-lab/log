from __future__ import annotations

import json
import re
import time
from dataclasses import dataclass
from typing import Any, Iterable, Mapping
from urllib.parse import urlsplit, urlunsplit

SNAPSHOT_VERSION = 1
AUTHENTICATED_COOKIE = "reddit_session"
DEFAULT_REDDIT_ORIGIN = "https://www.reddit.com/"
DEFAULT_REDDIT_BROWSER_PROFILE = "chrome_140"
DEFAULT_REDDIT_BROWSER_OS = "windows"
COOKIE_NAME = re.compile(r"^[^\s=;,]+$")
COOKIE_CONTROL_CHARACTER = re.compile(r"[\0\r\n]")
JSON_START = re.compile(r"^\s*[\[{]")


class SessionStateError(ValueError):
    pass


@dataclass(frozen=True)
class RedditSessionCookie:
    name: str
    value: str
    domain: str | None = None
    path: str | None = None
    expires_at_ms: float | None = None
    secure: bool | None = None
    http_only: bool | None = None
    same_site: str | None = None

    def to_json(self) -> dict[str, Any]:
        out: dict[str, Any] = {"name": self.name, "value": self.value}
        if self.domain is not None:
            out["domain"] = self.domain
        if self.path is not None:
            out["path"] = self.path
        if self.expires_at_ms is not None:
            out["expiresAtMs"] = self.expires_at_ms
        if self.secure is not None:
            out["secure"] = self.secure
        if self.http_only is not None:
            out["httpOnly"] = self.http_only
        if self.same_site is not None:
            out["sameSite"] = self.same_site
        return out


class RedditSessionState:
    def __init__(
        self,
        cookies: Iterable[RedditSessionCookie],
        *,
        username: str | None = None,
        origin: str | None = None,
        browser: str | None = None,
        os: str | None = None,
    ) -> None:
        self.username = username or ""
        self.origin = normalize_reddit_origin(origin or DEFAULT_REDDIT_ORIGIN)
        self.browser = browser or DEFAULT_REDDIT_BROWSER_PROFILE
        self.os = os or DEFAULT_REDDIT_BROWSER_OS
        self.cookies = tuple(cookies)
        self.version = SNAPSHOT_VERSION

    @classmethod
    def from_(cls, value: Any, **options: Any) -> "RedditSessionState":
        if isinstance(value, RedditSessionState):
            return value
        if isinstance(value, str) and JSON_START.match(value):
            return cls.from_json(value, **options)
        if isinstance(value, Mapping) and "cookies" in value:
            return cls.from_json(value, **options)
        return cls.from_cookies(value, **options)

    @classmethod
    def from_cookies(cls, value: Any, **options: Any) -> "RedditSessionState":
        return cls(normalize_cookies(value), **options)

    @classmethod
    def from_json(cls, value: Any, **options: Any) -> "RedditSessionState":
        parsed = parse_json(value) if isinstance(value, str) else value
        if isinstance(parsed, list):
            return cls.from_cookies(parsed, **options)
        if not isinstance(parsed, Mapping):
            raise SessionStateError("Reddit session JSON must contain an object or array")
        shown = parsed.get("version")
        if shown is not None and shown != SNAPSHOT_VERSION:
            raise SessionStateError(f"Unsupported Reddit session version: {shown}")
        cookies = parsed["cookies"] if "cookies" in parsed else parsed
        merged = {
            "username": options.get("username") or string_or_none(parsed.get("username")),
            "origin": options.get("origin") or string_or_none(parsed.get("origin")),
            "browser": options.get("browser") or string_or_none(parsed.get("browser")),
            "os": options.get("os") or string_or_none(parsed.get("os")),
        }
        return cls.from_cookies(cookies, **{k: v for k, v in merged.items() if v is not None})

    def cookie_map(self) -> dict[str, str]:
        return {cookie.name: cookie.value for cookie in self.cookies}

    def to_cookie_header(self) -> str:
        return "; ".join(f"{cookie.name}={cookie.value}" for cookie in self.cookies)

    def to_json(self) -> dict[str, Any]:
        if not self.username.strip():
            raise SessionStateError("Reddit session username is required")
        return {
            "version": self.version,
            "username": self.username,
            "origin": self.origin,
            "browser": self.browser,
            "os": self.os,
            "cookies": [cookie.to_json() for cookie in self.cookies],
        }

    def dumps(self) -> str:
        return json.dumps(self.to_json())


def cookie_applies(cookie: RedditSessionCookie, origin: str) -> bool:
    if cookie.domain is None:
        return True
    domain = cookie.domain.lstrip(".").lower()
    hostname = (urlsplit(origin).hostname or "").lower()
    return hostname == domain or hostname.endswith(f".{domain}")


def cookie_path(cookie: RedditSessionCookie) -> str:
    return cookie.path if cookie.path and cookie.path.startswith("/") else "/"


def normalize_reddit_origin(value: str) -> str:
    parts = urlsplit(value)
    if "@" in parts.netloc:
        raise SessionStateError("Reddit origin cannot contain credentials")
    if not parts.scheme or not parts.netloc:
        raise SessionStateError("Reddit origin must be an absolute URL")
    return urlunsplit((parts.scheme, parts.netloc, "/", "", ""))


def normalize_cookies(value: Any) -> list[RedditSessionCookie]:
    if isinstance(value, str):
        raw_cookies: Iterable[Any] = cookie_header_entries(value)
    elif isinstance(value, Mapping):
        raw_cookies = [{"name": name, "value": val} for name, val in value.items()]
    elif isinstance(value, Iterable):
        raw_cookies = list(value)
    else:
        raise SessionStateError("Reddit session cookies must be a header, map, or list")

    now_ms = time.time() * 1000
    cookies: dict[str, RedditSessionCookie] = {}
    for raw in raw_cookies:
        if not isinstance(raw, Mapping):
            raise SessionStateError("Reddit session cookie entries must be objects")
        raw_export = "Name raw" in raw or "Content raw" in raw
        name = string_or_none(raw.get("Name raw") if raw_export else raw.get("name"))
        val = string_or_none(raw.get("Content raw") if raw_export else raw.get("value"))
        if name is None or not COOKIE_NAME.match(name):
            raise SessionStateError("Reddit session contains an invalid cookie name")
        if val is None or COOKIE_CONTROL_CHARACTER.search(val):
            raise SessionStateError(f"Reddit session cookie {name} has an invalid value")
        expires_at_ms = raw_export_expiration(raw) if raw_export else expiration(raw)
        if expires_at_ms is not None and expires_at_ms <= now_ms:
            continue
        domain = raw_export_domain(raw) if raw_export else string_or_none(raw.get("domain"))
        path = string_or_none(raw.get("Path raw") if raw_export else raw.get("path"))
        same_site = normalize_same_site(raw.get("SameSite raw") if raw_export else raw.get("sameSite"))
        secure = raw_boolean(raw.get("Send for raw")) if raw_export else bool_or_none(raw.get("secure"))
        http_only = raw_boolean(raw.get("HTTP only raw")) if raw_export else bool_or_none(raw.get("httpOnly"))
        cookie = RedditSessionCookie(
            name=name,
            value=val,
            domain=domain,
            path=path,
            expires_at_ms=expires_at_ms,
            secure=secure,
            http_only=http_only,
            same_site=same_site,
        )
        cookies[f"{domain or ''}\0{path or ''}\0{name}"] = cookie

    return sorted(cookies.values(), key=lambda cookie: cookie.name)


def cookie_header_entries(header: str) -> list[dict[str, str]]:
    if not header.strip():
        return []
    entries: list[dict[str, str]] = []
    for part in header.split(";"):
        separator = part.find("=")
        if separator < 1:
            raise SessionStateError("Reddit Cookie header contains an invalid pair")
        entries.append({"name": part[:separator].strip(), "value": part[separator + 1:].strip()})
    return entries


def expiration(cookie: Mapping[str, Any]) -> float | None:
    milliseconds = finite_number(cookie.get("expiresAtMs"))
    if milliseconds is not None:
        return milliseconds
    seconds = finite_number(cookie.get("expirationDate"))
    if seconds is None:
        seconds = finite_number(cookie.get("expires"))
    if seconds is None or seconds < 0:
        return None
    return seconds * 1000


def raw_export_expiration(cookie: Mapping[str, Any]) -> float | None:
    value = string_or_none(cookie.get("Expires raw"))
    if value is None:
        return None
    try:
        seconds = float(value)
    except ValueError:
        return None
    return seconds * 1000 if seconds > 0 else None


def raw_export_domain(cookie: Mapping[str, Any]) -> str | None:
    value = string_or_none(cookie.get("Host raw"))
    if value is None:
        return None
    stripped = re.sub(r"^[a-z][a-z\d+.-]*://", "", value.strip(), flags=re.IGNORECASE)
    domain = stripped.split("/", 1)[0].lower()
    if not domain:
        return None
    if raw_boolean(cookie.get("This domain only raw")) is False and not domain.startswith("."):
        return f".{domain}"
    return domain


def raw_boolean(value: Any) -> bool | None:
    if isinstance(value, bool):
        return value
    if value == "true":
        return True
    if value == "false":
        return False
    return None


def bool_or_none(value: Any) -> bool | None:
    return value if isinstance(value, bool) else None


def normalize_same_site(value: Any) -> str | None:
    if not isinstance(value, str):
        return None
    normalized = value.lower()
    if normalized == "no_restriction":
        return "none"
    return normalized if normalized in ("lax", "strict", "none") else None


def finite_number(value: Any) -> float | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        number = float(value)
        return number if number == number and number not in (float("inf"), float("-inf")) else None
    return None


def parse_json(value: str) -> Any:
    try:
        return json.loads(value)
    except ValueError:
        raise SessionStateError("Reddit session JSON is invalid") from None


def string_or_none(value: Any) -> str | None:
    return value if isinstance(value, str) else None
