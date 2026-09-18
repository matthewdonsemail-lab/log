"""Read X's search page in a real browser (Camoufox), logged in with the connected X login.

The twikit library signs private-API requests with values X changes often; when X rebuilt its site
that broke ("Couldn't get KEY_BYTE indices"). A browser reads the page the way a person does, so it
does not depend on those internals. It is slower, and it can still break if X renames the page
elements it reads (`article[data-testid="tweet"]` and friends).

The class exposes the same `search_tweet(query, product, count)` the helper already uses, and raises
exceptions named Unauthorized, TooManyRequests and AccountLocked so the helper can react to them.
"""
from __future__ import annotations

import re
from datetime import datetime
from types import SimpleNamespace
from typing import Any
from urllib.parse import quote

X_DOMAINS = ("x.com", "twitter.com")
SEARCH_URL = "https://x.com/search?q={query}&src=typed_query&f={product}"
PAGE_TIMEOUT_MS = 25_000
MAX_SCROLLS = 4
# Addresses X sends a logged-out browser to (seen on the real site: /i/jf/onboarding/web?redirect_after_login=...).
LOGIN_URL_MARKS = ("/i/flow/login", "/login", "/onboarding", "redirect_after_login", "/i/jf/")


class Unauthorized(Exception):
    """X sent the browser to a login page: the saved login no longer works."""


class TooManyRequests(Exception):
    """X says we are going too fast."""


class AccountLocked(Exception):
    """X wants the account to be checked or unlocked by hand."""


# Runs inside the page. Reads every tweet card currently on screen.
EXTRACT_JS = r"""
() => {
  const count = (root, selector) => {
    const label = root.querySelector(selector)?.getAttribute('aria-label') || '';
    const found = /([\d][\d,.]*)\s*([KMB]?)/i.exec(label);
    if (!found) return 0;
    const base = parseFloat(found[1].replace(/,/g, ''));
    const unit = { K: 1e3, M: 1e6, B: 1e9 }[found[2].toUpperCase()] || 1;
    return Number.isFinite(base) ? Math.round(base * unit) : 0;
  };
  return [...document.querySelectorAll('article[data-testid="tweet"]')].map((card) => {
    const stamp = card.querySelector('time');
    const href = stamp?.closest('a')?.getAttribute('href') || '';
    const match = /^\/([^\/]+)\/status\/(\d+)/.exec(href);
    const promoted = !!card.querySelector('[data-testid="placementTracking"]') || /\bPromoted\b/.test(card.innerText.slice(0, 400));
    const reposted = /reposted/i.test(card.querySelector('[data-testid="socialContext"]')?.innerText || '');
    return {
      id: match ? match[2] : '',
      handle: match ? match[1] : '',
      name: card.querySelector('[data-testid="User-Name"] span')?.innerText || '',
      text: card.querySelector('[data-testid="tweetText"]')?.innerText || '',
      time: stamp?.getAttribute('datetime') || '',
      replies: count(card, '[data-testid="reply"]'),
      likes: count(card, '[data-testid="like"], [data-testid="unlike"]'),
      promoted, reposted,
    };
  });
}
"""

# True once the page shows results, "no results", or a login/lock screen, so we never wait the full timeout for a wall.
SETTLED_JS = r"""
() => !!document.querySelector('article[data-testid="tweet"], [data-testid="emptyState"], [data-testid="loginButton"]')
  || /onboarding|login|account\/access|redirect_after_login/.test(location.pathname + location.search)
  || /Continue with (phone|Google|Apple)|Rate limit exceeded/i.test((document.body?.innerText || '').slice(0, 3000))
"""

# Runs inside the page after it settles: which of X's screens are we on?
STATE_JS = r"""
() => {
  const text = (document.body?.innerText || '').slice(0, 4000);
  return {
    url: location.href,
    tweets: document.querySelectorAll('article[data-testid="tweet"]').length,
    login: !!document.querySelector('[data-testid="loginButton"], a[href="/login"], input[autocomplete="username"]')
      || /See what.s happening|Continue with (phone|Google|Apple)|Sign in to X|Log in to X/i.test(text),
    empty: !!document.querySelector('[data-testid="emptyState"]') || /No results for/i.test(text),
    rateLimited: /rate limit exceeded|you are rate limited|too many requests/i.test(text),
    locked: /account has been locked|your account is locked|suspended/i.test(text),
    failed: /something went wrong|try reloading/i.test(text),
  };
}
"""


def playwright_cookies(jar: list[dict]) -> list[dict]:
    """The connected login as browser cookies, kept to X's own domains."""
    cookies = []
    for cookie in jar:
        if not isinstance(cookie, dict) or not cookie.get("name") or not cookie.get("value"):
            continue
        domain = str(cookie.get("domain", "")).lstrip(".").lower()
        if not any(domain == d or domain.endswith(f".{d}") for d in X_DOMAINS):
            continue
        same_site = cookie.get("sameSite") if cookie.get("sameSite") in ("Strict", "Lax", "None") else "Lax"
        expires = cookie.get("expires")
        cookies.append({
            "name": str(cookie["name"]), "value": str(cookie["value"]),
            "domain": str(cookie["domain"]), "path": str(cookie.get("path") or "/"),
            "expires": float(expires) if isinstance(expires, (int, float)) else -1,
            "httpOnly": cookie.get("httpOnly") is True, "secure": cookie.get("secure") is True,
            "sameSite": same_site,
        })
    return cookies


def to_tweet(row: dict) -> Any | None:
    """A scraped card as the object the helper maps to a post. None for ads, reposts and cards with no text."""
    if row.get("promoted") or row.get("reposted") or not str(row.get("id", "")).isdigit() or not str(row.get("text", "")).strip():
        return None
    stamp = None
    raw = str(row.get("time") or "")
    if raw:
        try:
            stamp = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        except ValueError:
            stamp = None
    return SimpleNamespace(
        id=str(row["id"]), text=str(row["text"]).strip(), full_text=None,
        user=SimpleNamespace(screen_name=str(row.get("handle") or ""), name=str(row.get("name") or "")),
        favorite_count=int(row.get("likes") or 0), reply_count=int(row.get("replies") or 0),
        created_at_datetime=stamp,
    )


def check_state(state: dict) -> None:
    """Raise the right exception when the page is a login wall, a lock or a slow-down instead of results."""
    url = str(state.get("url", ""))
    if "/account/access" in url or state.get("locked"):
        raise AccountLocked("X asked for the account to be checked")
    if state.get("tweets"):
        return
    if state.get("rateLimited"):
        raise TooManyRequests("X said rate limit exceeded")
    if state.get("login") or any(mark in url for mark in LOGIN_URL_MARKS):
        raise Unauthorized("X asked for a login")
    if state.get("empty"):
        return
    raise RuntimeError("X did not show any results" + (" (it said something went wrong)" if state.get("failed") else ""))


async def safe_evaluate(page: Any, script: str, tries: int = 4) -> Any:
    """Run a script in the page, waiting and retrying if X navigates (redirects) while it runs."""
    for attempt in range(tries):
        try:
            return await page.evaluate(script)
        except Exception as error:  # noqa: BLE001 - only navigation races are retried
            text = str(error).lower()
            if attempt == tries - 1 or not ("context was destroyed" in text or "navigation" in text):
                raise
            try:
                await page.wait_for_load_state("domcontentloaded", timeout=10_000)
            except Exception:  # noqa: BLE001
                pass
            await page.wait_for_timeout(600)


class BrowserXClient:
    """Lazily starts one browser window, logs it in with the cookies, and searches X's Latest tab."""

    def __init__(self, jar: list[dict], *, show: bool = False) -> None:
        self._cookies = playwright_cookies(jar)
        self._show = show
        self._manager: Any = None
        self._page: Any = None

    async def _page_ready(self) -> Any:
        if self._page is not None:
            return self._page
        from camoufox.async_api import AsyncCamoufox  # imported here so the helper still starts without a browser installed

        self._manager = AsyncCamoufox(headless=not self._show, humanize=True)
        browser = await self._manager.__aenter__()
        context = await browser.new_context()
        await context.add_cookies(self._cookies)
        self._page = await context.new_page()
        self._page.set_default_timeout(PAGE_TIMEOUT_MS)
        return self._page

    async def search_tweet(self, query: str, product: str = "Latest", count: int = 20) -> list[Any]:
        page = await self._page_ready()
        tab = {"Latest": "live", "Top": "top", "Media": "media"}.get(product, "live")
        await page.goto(SEARCH_URL.format(query=quote(query), product=tab), wait_until="domcontentloaded")
        try:
            await page.wait_for_function(SETTLED_JS, timeout=PAGE_TIMEOUT_MS)
        except Exception:  # noqa: BLE001 - a timeout is judged below from what the page shows
            pass
        await page.wait_for_timeout(1500)  # let the first cards finish rendering
        check_state(await safe_evaluate(page, STATE_JS))

        rows: dict[str, dict] = {}
        for _ in range(MAX_SCROLLS):
            for row in await safe_evaluate(page, EXTRACT_JS):
                if row.get("id") and row["id"] not in rows:
                    rows[row["id"]] = row
            if len(rows) >= count:
                break
            await page.mouse.wheel(0, 1600)
            await page.wait_for_timeout(1200)
        tweets = [t for t in (to_tweet(row) for row in rows.values()) if t is not None]
        return tweets[:count]

    async def close(self) -> None:
        if self._manager is not None:
            try:
                await self._manager.__aexit__(None, None, None)
            finally:
                self._manager = None
                self._page = None
