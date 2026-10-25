from __future__ import annotations

from typing import Any, Iterable

from curl_cffi import CurlMime
from curl_cffi.requests import AsyncSession, Response

from .state import RedditSessionCookie, cookie_applies, cookie_path

IMPERSONATE = "chrome131"
COOKIE_DOMAIN = ".reddit.com"
ORIGIN = "https://www.reddit.com"
OAUTH = "https://oauth.reddit.com"
GQL_FED = "https://gql-fed.reddit.com/"


class Transport:
    def __init__(self, cookies: dict[str, str], proxy: str | None = None, timeout: float = 20.0) -> None:
        self.http = AsyncSession(
            impersonate=IMPERSONATE,
            timeout=timeout,
            allow_redirects=False,
            proxies={"http": proxy, "https": proxy} if proxy else None,
        )
        for name, value in cookies.items():
            self.http.cookies.set(name, value, domain=COOKIE_DOMAIN)
        self.initial = dict(cookies)
        self.sent: list[tuple[str, str, int]] = []

    async def request(
        self,
        method: str,
        url: str,
        *,
        headers: dict[str, str] | None = None,
        params: dict[str, Any] | None = None,
        data: dict[str, Any] | None = None,
        json: Any = None,
        multipart: CurlMime | None = None,
        allow_redirects: bool = False,
        timeout: float | None = None,
    ) -> Response:
        if url.startswith("/"):
            url = ORIGIN + url
        extra: dict[str, Any] = {} if timeout is None else {"timeout": timeout}
        response = await self.http.request(
            method,
            url,
            headers=headers,
            params=params,
            data=data,
            json=json,
            multipart=multipart,
            allow_redirects=allow_redirects,
            **extra,
        )
        self.sent.append((method, url.split("?", 1)[0], response.status_code))
        return response

    def cookie(self, name: str) -> str | None:
        found = [c.value for c in self.http.cookies.jar if c.name == name and "reddit.com" in (c.domain or "")]
        return found[-1] if found else None

    def drop_cookie(self, name: str) -> None:
        for c in list(self.http.cookies.jar):
            if c.name == name:
                self.http.cookies.jar.clear(c.domain, c.path, c.name)

    def restore(self, cookies: Iterable[RedditSessionCookie], origin: str) -> None:
        for cookie in cookies:
            if not cookie_applies(cookie, origin):
                continue
            domain, path = cookie.domain or COOKIE_DOMAIN, cookie_path(cookie)
            self.http.cookies.set(cookie.name, cookie.value, domain=domain, path=path)
            for held in self.http.cookies.jar:
                if (held.name, held.domain, held.path) == (cookie.name, domain, path):
                    if cookie.expires_at_ms is not None:
                        held.expires = int(cookie.expires_at_ms // 1000)
                    if cookie.secure is not None:
                        held.secure = cookie.secure
            self.initial[cookie.name] = cookie.value

    def cookie_records(self) -> list[dict[str, Any]]:
        records = []
        for c in self.http.cookies.jar:
            if "reddit.com" not in (c.domain or "") or c.value is None:
                continue
            record: dict[str, Any] = {"name": c.name, "value": c.value, "domain": c.domain, "path": c.path or "/", "secure": bool(c.secure)}
            if c.expires is not None:
                record["expires"] = c.expires
            if c.has_nonstandard_attr("HttpOnly"):
                record["httpOnly"] = True
            records.append(record)
        return records

    def cookies(self) -> dict[str, str]:
        return {c.name: c.value for c in self.http.cookies.jar if "reddit.com" in (c.domain or "") and c.value is not None}

    def refreshed(self) -> dict[str, str]:
        return {k: v for k, v in self.cookies().items() if self.initial.get(k) != v}

    async def close(self) -> None:
        await self.http.close()
