import asyncio
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import x_browser  # noqa: E402
import x_push  # noqa: E402


def card(handle, tid, text, time="2026-09-18T10:00:00.000Z", likes="12 Likes. Like", replies="3 Replies. Reply", extra=""):
    return f"""
<article data-testid="tweet">{extra}
  <div data-testid="User-Name"><span>{handle.title()} Name</span><span>@{handle}</span></div>
  <a href="/{handle}/status/{tid}"><time datetime="{time}">1h</time></a>
  <div data-testid="tweetText">{text}</div>
  <button data-testid="reply" aria-label="{replies}"></button>
  <button data-testid="like" aria-label="{likes}"></button>
</article>"""


RESULTS = "<main>" + "".join([
    card("pat", "1790000000000000001", "we are switching accountants next month, any advice?", likes="1.2K Likes. Like", replies="1,204 Replies. Reply"),
    card("sponsor", "1790000000000000002", "Switching accountants? Try us", extra='<div data-testid="placementTracking"></div>'),
    card("someone", "1790000000000000003", "a repost of something", extra='<div data-testid="socialContext">Kim reposted</div>'),
    card("kim", "1790000000000000004", "Switching Accountants was the best decision", likes="7 Likes. Like", replies="0 Replies. Reply"),
    '<article data-testid="tweet"><a href="/media/status/1790000000000000005"><time datetime="2026-09-18T09:00:00Z"></time></a></article>',
]) + "</main>"

PAGES = {
    "results": RESULTS,
    "empty": '<main><div data-testid="emptyState">No results for "zzz"</div></main>',
    "login": '<main><a href="/login" data-testid="loginButton">Log in</a></main>',
    "wall": "<main><h1>See what's happening</h1><p>Select an option below:</p><button>Continue with Google</button></main>",
    "rate": "<main><p>Rate limit exceeded. Try again later.</p></main>",
    "broken": "<main><p>Something went wrong. Try reloading.</p></main>",
}


def in_browser(page_name, count=20, redirect=None):
    """Search through the real class in a real headless browser, with X's search URL answered by a stand-in page."""

    async def go():
        jar = [{"name": "auth_token", "value": "fake", "domain": ".x.com"}, {"name": "ct0", "value": "fake", "domain": ".x.com"}]
        client = x_browser.BrowserXClient(jar)
        try:
            page = await client._page_ready()

            async def handle(route):
                if redirect and "/search" in route.request.url:  # only the search address bounces; the login page it lands on is plain
                    body = f"<script>location.replace('https://x.com{redirect}')</script>"
                elif redirect:  # where the bounce lands: a page with no results on it
                    body = "<html><body><main><p>Welcome</p></main></body></html>"
                else:
                    body = f"<html><body>{PAGES[page_name]}</body></html>"
                await route.fulfill(status=200, content_type="text/html", body=body)

            await page.route("https://x.com/**", handle)
            return await client.search_tweet('"switching accountants" -filter:retweets', "Latest", count=count)
        finally:
            await client.close()

    return asyncio.run(go())


class TestPure:
    def test_turns_the_saved_login_into_browser_cookies_on_x_only(self):
        jar = [
            {"name": "auth_token", "value": "a", "domain": ".x.com", "path": "/", "expires": 1900000000, "httpOnly": True, "secure": True, "sameSite": "None"},
            {"name": "ct0", "value": "c", "domain": ".x.com", "sameSite": "weird"},
            {"name": "stolen", "value": "s", "domain": ".evil.com"},
            "junk",
            {"name": "", "value": "x", "domain": ".x.com"},
        ]
        cookies = x_browser.playwright_cookies(jar)
        assert [c["name"] for c in cookies] == ["auth_token", "ct0"]
        assert cookies[0] == {"name": "auth_token", "value": "a", "domain": ".x.com", "path": "/", "expires": 1900000000.0, "httpOnly": True, "secure": True, "sameSite": "None"}
        assert cookies[1]["sameSite"] == "Lax" and cookies[1]["expires"] == -1 and cookies[1]["path"] == "/"

    def test_drops_ads_reposts_and_empty_cards(self):
        base = {"id": "1", "text": "hi", "handle": "a", "name": "A", "time": "2026-09-18T10:00:00Z", "likes": 2, "replies": 1}
        tweet = x_browser.to_tweet(base)
        assert (tweet.id, tweet.text, tweet.user.screen_name, tweet.favorite_count, tweet.reply_count) == ("1", "hi", "a", 2, 1)
        assert tweet.created_at_datetime.year == 2026
        for bad in ({**base, "promoted": True}, {**base, "reposted": True}, {**base, "text": "  "}, {**base, "id": ""}, {**base, "id": "abc"}):
            assert x_browser.to_tweet(bad) is None
        assert x_browser.to_tweet({**base, "time": "not a date"}).created_at_datetime is None

    def test_reads_the_screen_x_is_showing(self):
        check = x_browser.check_state
        check({"url": "https://x.com/search", "tweets": 3})
        check({"url": "https://x.com/search", "tweets": 0, "empty": True})
        with pytest.raises(x_browser.Unauthorized):
            check({"url": "https://x.com/i/flow/login", "tweets": 0})
        with pytest.raises(x_browser.Unauthorized):
            check({"url": "https://x.com/search", "tweets": 0, "login": True})
        with pytest.raises(x_browser.Unauthorized):  # the address X really sends a logged-out browser to
            check({"url": "https://x.com/i/jf/onboarding/web?redirect_after_login=%2Fsearch%3Fq%3Dgood", "tweets": 0})
        with pytest.raises(x_browser.TooManyRequests):
            check({"url": "https://x.com/search", "tweets": 0, "rateLimited": True})
        with pytest.raises(x_browser.AccountLocked):
            check({"url": "https://x.com/account/access", "tweets": 0})
        with pytest.raises(RuntimeError, match="something went wrong"):
            check({"url": "https://x.com/search", "tweets": 0, "failed": True})

    def test_the_helper_reacts_to_these_exceptions_by_name(self):
        assert x_push.classify(x_browser.TooManyRequests()) == "rate"
        assert x_push.classify(x_browser.Unauthorized()) == "auth"
        assert x_push.classify(x_browser.AccountLocked()) == "auth"


camoufox = pytest.importorskip("camoufox", reason="Camoufox is not installed")


class TestInARealBrowser:
    def test_reads_results_skips_ads_and_reposts_and_parses_counts(self):
        tweets = in_browser("results")
        assert [t.id for t in tweets] == ["1790000000000000001", "1790000000000000004"]
        first = tweets[0]
        assert (first.user.screen_name, first.favorite_count, first.reply_count) == ("pat", 1200, 1204)
        assert first.text.startswith("we are switching accountants")
        assert (tweets[1].favorite_count, tweets[1].reply_count) == (7, 0)

    def test_the_helper_maps_them_to_ingest_posts(self):
        posts = [x_push.tweet_to_post(t) for t in in_browser("results")]
        assert posts[0]["url"] == "https://x.com/pat/status/1790000000000000001"
        assert posts[0]["timestamp"].startswith("2026-09-18T10:00:00")
        assert posts[0]["authorName"] == "pat" and posts[0]["likes"] == 1200

    def test_honours_the_count(self):
        assert len(in_browser("results", count=1)) == 1

    def test_no_results_is_an_empty_list_not_an_error(self):
        assert in_browser("empty") == []

    def test_a_login_page_means_the_saved_login_no_longer_works(self):
        with pytest.raises(x_browser.Unauthorized):
            in_browser("login")
        with pytest.raises(x_browser.Unauthorized):
            in_browser("results", redirect="/i/flow/login")
        with pytest.raises(x_browser.Unauthorized):  # X's real logged-out wall, by its wording
            in_browser("wall")
        with pytest.raises(x_browser.Unauthorized):  # and by its real address
            in_browser("results", redirect="/i/jf/onboarding/web?redirect_after_login=%2Fsearch")

    def test_rate_limit_lock_and_a_broken_page_are_told_apart(self):
        with pytest.raises(x_browser.TooManyRequests):
            in_browser("rate")
        with pytest.raises(x_browser.AccountLocked):
            in_browser("results", redirect="/account/access")
        with pytest.raises(RuntimeError, match="did not show any results"):
            in_browser("broken")
