"""Read Facebook's post search in real Chrome, logged in with the connected Facebook login.

Facebook has no public search API, so this reads the page the way a person does. It can break if
Facebook renames the page elements it reads (`div[role="article"]`, the permalink links, the message
`data-ad-*` attributes), so the reader is deliberately simple and `LISTENINGKIT_FB_DEBUG_DIR` saves a
screenshot and the page text when it finds nothing, to make fixing it quick.

The class exposes `search_posts(phrase, count)` and raises exceptions named Unauthorized,
TooManyRequests and AccountLocked (the same ones the X reader uses) so the helper can react.
"""
from __future__ import annotations

import base64
import json
import os
from types import SimpleNamespace
from typing import Any
from urllib.parse import quote

from x_browser import (  # noqa: F401 - the helper classifies errors by these names
    AccountLocked, TooManyRequests, Unauthorized, launch_chrome, playwright_cookies, safe_evaluate,
)

FACEBOOK_DOMAINS = ("facebook.com",)
PAGE_TIMEOUT_MS = 25_000
MAX_SCROLLS = 4
RELOAD_TRIES = 2
SEARCH_URL = "https://www.facebook.com/search/posts?q={query}&filters={filters}"
# Facebook's "Recent posts" filter, so the newest matches come first.
RECENT_FILTER = base64.b64encode(json.dumps({"recent_posts:0": json.dumps({"name": "recent_posts", "args": ""}, separators=(",", ":"))}, separators=(",", ":")).encode()).decode()
# Addresses Facebook sends a logged-out or checkpointed browser to.
LOGIN_URL_MARKS = ("/login", "/checkpoint", "/recover")


# Runs inside the page. Reads every top-level post card currently on screen.
EXTRACT_JS = r"""
() => {
  const number = (text) => {
    const found = /([\d][\d,.]*)\s*([KMB]?)/i.exec(text || '');
    if (!found) return 0;
    const base = parseFloat(found[1].replace(/,/g, ''));
    const unit = { K: 1e3, M: 1e6, B: 1e9 }[found[2].toUpperCase()] || 1;
    return Number.isFinite(base) ? Math.round(base * unit) : 0;
  };
  const link = (card) => {
    for (const anchor of card.querySelectorAll('a[href]')) {
      const href = anchor.href;
      const found = /\/(?:posts|permalink|videos|reel)\/(pfbid\w+|\d+)/.exec(href)
        || /[?&](?:story_fbid|fbid)=(pfbid\w+|\d+)/.exec(href);
      if (!found) continue;
      const url = new URL(href);
      const keep = new URLSearchParams();
      for (const name of ['story_fbid', 'fbid', 'id']) if (url.searchParams.has(name)) keep.set(name, url.searchParams.get(name));
      const query = keep.toString();
      return { id: found[1], url: url.origin + url.pathname + (query ? '?' + query : '') };
    }
    return { id: '', url: '' };
  };
  const cards = [...document.querySelectorAll('div[role="article"]')].filter((card) => !card.parentElement.closest('div[role="article"]'));
  return cards.map((card) => {
    const { id, url } = link(card);
    const message = card.querySelector('[data-ad-rendering-role="story_message"], [data-ad-comet-preview="message"], [data-ad-preview="message"]');
    let text = message?.innerText || '';
    if (!text) {
      text = [...card.querySelectorAll('div[dir="auto"]')].map((el) => el.innerText || '').sort((a, b) => b.length - a.length)[0] || '';
    }
    const author = card.querySelector('[data-ad-rendering-role="profile_name"]')?.innerText
      || card.querySelector('h2, h3, h4')?.innerText || '';
    const all = card.innerText || '';
    return {
      id, url, text, author: author.split('\n')[0].trim(),
      comments: number((/(\d[\d,.]*\s*[KMB]?)\s+comments?/i.exec(all) || [])[1]),
      likes: number((/(?:All reactions:|Like:)\s*([\d,.]+\s*[KMB]?)/i.exec(all) || [])[1]),
      sponsored: /^\s*Sponsored\s*$/m.test(all.slice(0, 500)) || !!card.querySelector('a[href*="/ads/"]'),
    };
  });
}
"""

# True once the page shows results, "no results", or a login/lock screen, so we never wait the full timeout for a wall.
SETTLED_JS = r"""
() => !!document.querySelector('div[role="article"], form#login_form, input[name="email"]')
  || /login|checkpoint|recover/.test(location.pathname)
  || /No results found|We couldn.t find anything|Log (in|into) to Facebook|going too fast|temporarily blocked/i.test((document.body?.innerText || '').slice(0, 3000))
"""

# Runs inside the page after it settles: which of Facebook's screens are we on?
STATE_JS = r"""
() => {
  const text = (document.body?.innerText || '').slice(0, 4000);
  return {
    url: location.href,
    posts: [...document.querySelectorAll('div[role="article"]')].filter((card) => !card.parentElement.closest('div[role="article"]')).length,
    login: !!document.querySelector('form#login_form, input[name="email"][type="text"], input[name="pass"]')
      || /Log (in|into) to Facebook|You must log in to continue/i.test(text),
    empty: /No results found|We couldn.t find anything|didn.t find any/i.test(text),
    rateLimited: /going too fast|temporarily blocked|you.re temporarily|try again later/i.test(text),
    locked: /your account has been (locked|suspended|disabled)|confirm your identity|secure your account/i.test(text),
    notFound: /^\s*Not Found\s*$/i.test(text),  // what search answers to a browser whose login it does not accept (checked on the real site)
    failed: /something went wrong|this page isn.t available|content isn.t available/i.test(text),
  };
}
"""


def to_post(row: dict) -> Any | None:
    """A scraped card as the object the helper maps to a post. None for ads, cards with no permalink and cards with no text."""
    text = str(row.get("text", "")).strip()
    if row.get("sponsored") or not str(row.get("id", "")).strip() or not text:
        return None
    return SimpleNamespace(
        id=str(row["id"]).strip(), url=str(row.get("url") or ""), text=text,
        author=str(row.get("author") or "").strip(),
        likes=int(row.get("likes") or 0), comments=int(row.get("comments") or 0),
    )


def check_state(state: dict) -> None:
    """Raise the right exception when the page is a login wall, a lock or a slow-down instead of results."""
    url = str(state.get("url", ""))
    if "/checkpoint" in url or state.get("locked"):
        raise AccountLocked("Facebook asked for the account to be checked")
    if state.get("posts"):
        return
    if state.get("rateLimited"):
        raise TooManyRequests("Facebook said we are going too fast")
    if state.get("login") or any(mark in url for mark in LOGIN_URL_MARKS):
        raise Unauthorized("Facebook asked for a login")
    if state.get("empty"):
        return
    if state.get("notFound"):
        raise Unauthorized("Facebook did not accept the saved login (search answered Not Found)")
    raise RuntimeError("Facebook did not show any results" + (" (it said something went wrong)" if state.get("failed") else ""))


class BrowserFacebookClient:
    """Lazily starts one Chrome window, logs it in with the cookies, and searches Facebook's recent posts."""

    def __init__(self, jar: list[dict], *, show: bool = False) -> None:
        self._cookies = playwright_cookies(jar, FACEBOOK_DOMAINS)
        self._show = show
        self._playwright: Any = None
        self._browser: Any = None
        self._page: Any = None

    async def _page_ready(self) -> Any:
        if self._page is not None:
            return self._page
        self._playwright, self._browser = await launch_chrome(self._show)
        context = await self._browser.new_context(locale="en-US")
        await context.add_cookies(self._cookies)
        self._page = await context.new_page()
        self._page.set_default_timeout(PAGE_TIMEOUT_MS)
        return self._page

    async def _settle(self, page: Any) -> dict:
        try:
            await page.wait_for_function(SETTLED_JS, timeout=PAGE_TIMEOUT_MS)
        except Exception:  # noqa: BLE001 - a timeout is judged below from what the page shows
            pass
        await page.wait_for_timeout(2000)  # let the first cards finish rendering
        return await safe_evaluate(page, STATE_JS)

    async def search_posts(self, phrase: str, count: int = 20) -> list[Any]:
        page = await self._page_ready()
        await page.goto(SEARCH_URL.format(query=quote(f'"{phrase}"'), filters=quote(RECENT_FILTER)), wait_until="domcontentloaded")
        state = await self._settle(page)
        for _ in range(RELOAD_TRIES):  # a transient "Something went wrong" often clears on a reload
            if state.get("posts") or not state.get("failed") or state.get("login") or state.get("rateLimited"):
                break
            await page.wait_for_timeout(4000)
            await page.reload(wait_until="domcontentloaded")
            state = await self._settle(page)
        debug = os.environ.get("LISTENINGKIT_FB_DEBUG_DIR")  # for finding out why Facebook shows a page we cannot read
        if debug and not state.get("posts"):
            await page.screenshot(path=os.path.join(debug, "fb_page.png"))
            text = await safe_evaluate(page, "() => location.href + ' | ' + (document.body?.innerText || '').slice(0, 1500)")
            with open(os.path.join(debug, "fb_page.txt"), "w", encoding="utf-8") as out:
                out.write(text)
        check_state(state)

        rows: dict[str, dict] = {}
        for _ in range(MAX_SCROLLS):
            for row in await safe_evaluate(page, EXTRACT_JS):
                if row.get("id") and row["id"] not in rows:
                    rows[row["id"]] = row
            if len(rows) >= count:
                break
            await page.mouse.wheel(0, 1800)
            await page.wait_for_timeout(1500)
        posts = [p for p in (to_post(row) for row in rows.values()) if p is not None]
        return posts[:count]

    async def close(self) -> None:
        try:
            if self._browser is not None:
                await self._browser.close()
            if self._playwright is not None:
                await self._playwright.stop()
        finally:
            self._browser = None
            self._playwright = None
            self._page = None
