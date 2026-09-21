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
import hashlib
import json
import os
import re
from types import SimpleNamespace
from typing import Any
from urllib.parse import parse_qsl, quote, urlencode, urlsplit, urlunsplit

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


# Facebook's search results are `aria-posinset` cards inside `role="feed"`; older layouts use `div[role="article"]`.
# Runs inside the page. Reads every top-level post card currently on screen.
EXTRACT_JS = r"""
() => {
  const cardsOf = () => [...document.querySelectorAll('[role="feed"] [aria-posinset], div[role="article"]')]
    .filter((card) => !card.parentElement.closest('[aria-posinset], div[role="article"]'));
  const number = (text) => {
    const found = /([\d][\d,.]*)\s*([KMB]?)/i.exec(text || '');
    if (!found) return 0;
    const base = parseFloat(found[1].replace(/,/g, ''));
    const unit = { K: 1e3, M: 1e6, B: 1e9 }[found[2].toUpperCase()] || 1;
    return Number.isFinite(base) ? Math.round(base * unit) : 0;
  };
  const direct = (card) => {
    for (const anchor of card.querySelectorAll('a[href]')) {
      if (/\/(?:posts|permalink|videos|reel)\/(?:pfbid\w+|\d+)|[?&](?:story_fbid|fbid)=/.test(anchor.href)) return anchor.href;
    }
    return '';
  };
  window.__lkCards = window.__lkCards || 0;
  return cardsOf().map((card) => {
    if (!card.dataset.lkCard) card.dataset.lkCard = String(++window.__lkCards);
    const tag = card.dataset.lkCard;
    // Facebook leaves the timestamp link's address empty until the mouse is over it; mark it so we can hover it.
    let stamp = false;
    for (const anchor of card.querySelectorAll('a[role="link"][target="_blank"]')) {
      const href = anchor.getAttribute('href') || '';
      if (href.startsWith('?') || href.startsWith('#')) { anchor.setAttribute('data-lk-stamp', tag); stamp = true; break; }
    }
    const message = card.querySelector('[data-ad-rendering-role="story_message"], [data-ad-comet-preview="message"], [data-ad-preview="message"]');
    let text = message?.innerText || '';
    if (!text) {
      text = [...card.querySelectorAll('div[dir="auto"]')].map((el) => el.innerText || '').sort((a, b) => b.length - a.length)[0] || '';
    }
    const all = card.innerText || '';
    const acted = /Actions for this post by (.+)/.exec(card.querySelector('[aria-label^="Actions for this post by"]')?.getAttribute('aria-label') || '');
    const author = card.querySelector('[data-ad-rendering-role="profile_name"]')?.innerText
      || (acted ? acted[1] : '') || card.querySelector('h2, h3, h4')?.innerText || '';
    const liked = card.querySelector('[aria-label^="Like:"]')?.getAttribute('aria-label') || '';
    return {
      tag, href: direct(card), stamp, text, author: author.split('\n')[0].trim(),
      comments: number(card.querySelector('[data-ad-rendering-role="comment_button"]')?.innerText)
        || number((/(\d[\d,.]*\s*[KMB]?)\s+comments?/i.exec(all) || [])[1]),
      likes: number((/(?:Like:|All reactions:)\s*([\d,.]+\s*[KMB]?)/i.exec(liked + ' ' + all) || [])[1]),
      sponsored: /^\s*Sponsored\s*$/m.test(all.slice(0, 500)) || !!card.querySelector('a[href*="/ads/"]'),
    };
  });
}
"""

# True once the page shows results, "no results", or a login/lock screen, so we never wait the full timeout for a wall.
SETTLED_JS = r"""
() => !!document.querySelector('[role="feed"] [aria-posinset], div[role="article"], form#login_form, input[name="email"]')
  || /login|checkpoint|recover/.test(location.pathname)
  || /No results found|We couldn.t find anything|Log (in|into) to Facebook|going too fast|temporarily blocked/i.test((document.body?.innerText || '').slice(0, 3000))
"""

# Runs inside the page after it settles: which of Facebook's screens are we on?
STATE_JS = r"""
() => {
  const text = (document.body?.innerText || '').slice(0, 4000);
  return {
    url: location.href,
    posts: [...document.querySelectorAll('[role="feed"] [aria-posinset], div[role="article"]')].filter((card) => !card.parentElement.closest('[aria-posinset], div[role="article"]')).length,
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


PERMALINK = re.compile(r"/(?:posts|permalink|videos|reel)/(pfbid\w+|\d+)|[?&](?:story_fbid|fbid)=(pfbid\w+|\d+)")


def permalink(href: str) -> tuple[str, str]:
    """(post id, clean address) from a link Facebook filled in, dropping tracking parameters. ('', '') if it is not a post link."""
    found = PERMALINK.search(href or "")
    if not found:
        return "", ""
    parts = urlsplit(href)
    keep = [(k, v) for k, v in parse_qsl(parts.query) if k in ("story_fbid", "fbid", "id")]
    return found.group(1) or found.group(2), urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(keep), ""))


def stable_id(author: str, text: str) -> str:
    """An id for a post whose permalink could not be read: the same post always gets the same id, so it is never stored twice."""
    return "fb-" + hashlib.sha1(f"{author}\n{text}".encode()).hexdigest()[:20]


def to_post(row: dict) -> Any | None:
    """A scraped card as the object the helper maps to a post. None for ads and cards with no text."""
    text = str(row.get("text", "")).strip()
    if row.get("sponsored") or not text:
        return None
    author = str(row.get("author") or "").strip()
    post_id, url = str(row.get("id") or "").strip(), str(row.get("url") or "")
    if not post_id:
        post_id, url = stable_id(author, text), ""
    return SimpleNamespace(
        id=post_id, url=url, text=text,
        author=author,
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

    async def _hover_for_link(self, page: Any, tag: str) -> str:
        """Hover a card's timestamp so Facebook fills in the real post address, then read it. '' if that fails."""
        selector = f'[data-lk-stamp="{tag}"]'
        try:
            await page.hover(selector, timeout=4000)
            await page.wait_for_timeout(350)
            return await safe_evaluate(page, f"() => document.querySelector('{selector}')?.href || ''")
        except Exception:  # noqa: BLE001 - a card we cannot hover still counts, with a stable id instead of an address
            return ""

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
            html = await safe_evaluate(page, "() => { const copy = document.body.cloneNode(true); copy.querySelectorAll('script, style, svg, img, link, noscript').forEach((el) => el.remove()); return copy.outerHTML.slice(0, 400000) }")
            with open(os.path.join(debug, "fb_page.html"), "w", encoding="utf-8") as out:
                out.write(html)
        check_state(state)

        rows: dict[str, dict] = {}
        for _ in range(MAX_SCROLLS):
            for row in await safe_evaluate(page, EXTRACT_JS):
                if row["tag"] in rows:
                    continue
                href = row.get("href") or (await self._hover_for_link(page, row["tag"]) if row.get("stamp") else "")
                row["id"], row["url"] = permalink(href)
                rows[row["tag"]] = row
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
