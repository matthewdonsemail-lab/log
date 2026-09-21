import argparse
import asyncio
import sys
from pathlib import Path
from types import SimpleNamespace

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import facebook_browser  # noqa: E402
import facebook_push  # noqa: E402
import listeningkit_ingest as ingest  # noqa: E402
import x_browser  # noqa: E402
import x_push  # noqa: E402


def card(author, pid, text, comments="3 comments", extra="", link=None):
    href = link or f"/groups/123/posts/{pid}/?__cft__[0]=tracking&__tn__=%2CO"
    return f"""
<div role="article">{extra}
  <h3><a role="link" href="/{author}">{author}</a></h3>
  <a href="{href}">2h</a>
  <div data-ad-rendering-role="story_message"><div dir="auto">{text}</div></div>
  <span>All reactions: 1.2K</span><span>{comments}</span>
  <div role="article"><h3>replier</h3><div dir="auto">a comment inside the post</div></div>
</div>"""


RESULTS = "<div role='feed'>" + "".join([
    card("Pat Owner", "1001", "Does anyone know a good bookkeeper? we need a bookkeeper in Leeds", comments="1,204 comments"),
    card("Shop Ads", "1002", "Need a bookkeeper? Try us", extra="<div>Sponsored</div>"),
    card("Kim", "pfbid02abcDEF", "we NEED a  bookkeeper asap", comments="0 comments", link="/kim/posts/pfbid02abcDEF?comment_id=9"),
    card("Old Story", "5", "need a bookkeeper", link="/story.php?story_fbid=777&id=42&__tn__=x"),
    '<div role="article"><h3>No link</h3><div dir="auto">cards without a permalink are dropped</div></div>',
]) + "</div>"

def live_card(author, text, hover_href, likes="Like: 1 person", comments="8"):
    """Mimics what the real Facebook search page serves: no role=article, the timestamp link is empty until hovered."""
    return f"""
<div aria-posinset="1"><div>
  <div data-ad-rendering-role="profile_name"><span>{author}</span></div>
  <div aria-label="Actions for this post by {author}" role="button"></div>
  <a role="link" target="_blank" href="?__cft__[0]=abc#?bia" onmouseover="this.href='{hover_href}'">time</a>
  <div data-ad-rendering-role="story_message"><div>{text}</div></div>
  <span aria-label="{likes}">1</span>
  <div data-ad-rendering-role="comment_button">{comments}</div>
  <span>Facebook</span><span>Facebook</span>
</div></div>"""


LIVE = "<div role='feed'>" + "".join([
    live_card("Brandon Dinario", "I need a bookkeeper today.", "https://www.facebook.com/brandon.d/posts/pfbid0Abc123?__cft__[0]=zz&__tn__=-R"),
    live_card("Nic Richey", "need a  Bookkeeper", "https://www.facebook.com/groups/55/posts/98765/", likes="Like: 12 people", comments="1.5K"),
    '<div aria-posinset="3"><div data-ad-rendering-role="profile_name">No Stamp</div><div data-ad-rendering-role="story_message">need a bookkeeper, no timestamp link</div></div>',
]) + "</div>"

PAGES = {
    "live": LIVE,
    "results": RESULTS,
    "empty": "<div><p>No results found</p></div>",
    "login": '<form id="login_form"><input name="email" type="text"><input name="pass" type="password"></form><h2>Log into Facebook</h2>',
    "rate": "<div><p>You're going too fast. Slow down.</p></div>",
    "broken": "<div><p>Something went wrong</p></div>",
    "notfound": "Not Found",
}


def in_browser(page_name, count=20, redirect=None):
    """Search through the real class in real Chrome, with Facebook's search URL answered by a stand-in page."""

    async def go():
        jar = [{"name": "c_user", "value": "1", "domain": ".facebook.com"}, {"name": "xs", "value": "fake", "domain": ".facebook.com"}]
        client = facebook_browser.BrowserFacebookClient(jar)
        try:
            page = await client._page_ready()

            async def handle(route):
                if redirect and "/search" in route.request.url:
                    body = f"<script>location.replace('https://www.facebook.com{redirect}')</script>"
                elif redirect:
                    body = "<html><body><p>Welcome</p></body></html>"
                else:
                    body = f"<html><body>{PAGES[page_name]}</body></html>"
                await route.fulfill(status=200, content_type="text/html", body=body)

            await page.route("https://www.facebook.com/**", handle)
            return await client.search_posts("need a bookkeeper", count=count)
        finally:
            await client.close()

    return asyncio.run(go())


class TestPure:
    def test_the_recent_posts_filter_is_facebooks_own_value(self):
        assert facebook_browser.RECENT_FILTER == "eyJyZWNlbnRfcG9zdHM6MCI6IntcIm5hbWVcIjpcInJlY2VudF9wb3N0c1wiLFwiYXJnc1wiOlwiXCJ9In0="

    def test_turns_the_saved_login_into_cookies_on_facebook_only(self):
        jar = [
            {"name": "c_user", "value": "1", "domain": ".facebook.com"},
            {"name": "xs", "value": "s", "domain": ".facebook.com"},
            {"name": "stolen", "value": "x", "domain": ".x.com"},
        ]
        assert [c["name"] for c in x_browser.playwright_cookies(jar, facebook_browser.FACEBOOK_DOMAINS)] == ["c_user", "xs"]
        assert [c["name"] for c in x_browser.playwright_cookies(jar)] == ["stolen"]  # the X default is unchanged

    def test_refuses_a_login_missing_its_key_cookies(self):
        jar = [{"name": "c_user", "value": "1", "domain": ".facebook.com"}]
        with pytest.raises(ingest.SessionError, match="Reconnect Facebook"):
            facebook_push.cookie_dict(jar)
        assert facebook_push.cookie_dict(jar + [{"name": "xs", "value": "s", "domain": "facebook.com"}]) == {"c_user": "1", "xs": "s"}

    def test_cleans_post_links_and_ignores_other_links(self):
        clean = facebook_browser.permalink
        assert clean("https://www.facebook.com/k/posts/pfbid02x?comment_id=9&__cft__[0]=t") == ("pfbid02x", "https://www.facebook.com/k/posts/pfbid02x")
        assert clean("https://www.facebook.com/permalink.php?story_fbid=77&id=42&__tn__=x") == ("77", "https://www.facebook.com/permalink.php?story_fbid=77&id=42")
        assert clean("https://www.facebook.com/brandon.d?__cft__[0]=t") == ("", "")
        assert clean("") == ("", "")

    def test_drops_ads_and_cards_with_no_text(self):
        base = {"id": "1", "text": "hi", "author": "A", "url": "https://www.facebook.com/a/posts/1", "likes": 2, "comments": 1}
        post = facebook_browser.to_post(base)
        assert (post.id, post.text, post.author, post.likes, post.comments) == ("1", "hi", "A", 2, 1)
        for bad in ({**base, "sponsored": True}, {**base, "text": "  "}):
            assert facebook_browser.to_post(bad) is None
        loose = facebook_browser.to_post({**base, "id": "", "url": "x"})  # no address read: the same post always gets the same id
        assert loose.id == facebook_browser.to_post({**base, "id": ""}).id and loose.id.startswith("fb-") and loose.url == ""
        assert facebook_browser.to_post({**base, "id": "", "text": "other"}).id != loose.id

    def test_maps_a_post_to_the_ingest_shape(self):
        mapped = facebook_push.post_to_ingest(SimpleNamespace(id="9", text="need a bookkeeper", url="https://www.facebook.com/a/posts/9", author="Pat", likes=3, comments=-4))
        assert mapped == {"externalId": "9", "authorName": "Pat", "body": ["need a bookkeeper"], "url": "https://www.facebook.com/a/posts/9", "likes": 3, "comments": 0}
        loose = facebook_push.post_to_ingest(SimpleNamespace(id="9", text="x", url="", author=""))
        assert loose["url"] == "https://www.facebook.com/search/posts?q=%22x%22" and loose["authorName"] == "Facebook user"
        assert facebook_push.post_to_ingest(SimpleNamespace(id="", text="x")) is None

    def test_reads_the_screen_facebook_is_showing(self):
        check = facebook_browser.check_state
        check({"url": "https://www.facebook.com/search", "posts": 3})
        check({"url": "https://www.facebook.com/search", "posts": 0, "empty": True})
        with pytest.raises(x_browser.Unauthorized):
            check({"url": "https://www.facebook.com/login/?next=x", "posts": 0})
        with pytest.raises(x_browser.Unauthorized):
            check({"url": "https://www.facebook.com/search", "posts": 0, "login": True})
        with pytest.raises(x_browser.Unauthorized):  # what the real site answers a logged-out or fake login
            check({"url": "https://www.facebook.com/search/posts", "posts": 0, "notFound": True})
        with pytest.raises(x_browser.TooManyRequests):
            check({"url": "https://www.facebook.com/search", "posts": 0, "rateLimited": True})
        with pytest.raises(x_browser.AccountLocked):
            check({"url": "https://www.facebook.com/checkpoint/1501092823525282/", "posts": 0})
        with pytest.raises(x_browser.AccountLocked):
            check({"url": "https://www.facebook.com/search", "posts": 0, "locked": True})
        with pytest.raises(RuntimeError, match="something went wrong"):
            check({"url": "https://www.facebook.com/search", "posts": 0, "failed": True})


class FakeClient:
    def __init__(self, results):
        self.results = results
        self.searched = []

    async def search_posts(self, phrase, count):
        self.searched.append((phrase, count))
        outcome = self.results[len(self.searched) - 1]
        if isinstance(outcome, Exception):
            raise outcome
        return outcome


def post(pid, text):
    return SimpleNamespace(id=pid, text=text, url=f"https://www.facebook.com/g/posts/{pid}", author="Pat", likes=1, comments=2)


def run_round(client, phrases, **over):
    pushed = []

    def fake_push(platform, posts, **kw):
        pushed.append((platform, posts, kw))
        return {"ingested": len(posts), "skipped": 0, "batches": 1}

    async def no_sleep(_):
        return None

    base = dict(phrases=None, count=20, interval=0, dry_run=False, endpoint="https://e/ingest", key="k")
    base.update(over)
    status = asyncio.run(x_push.run_once(
        argparse.Namespace(**base), client, phrases, push_posts=fake_push, sleep=no_sleep,
        platform="facebook", search=facebook_push.search, to_post=facebook_push.post_to_ingest,
    ))
    return status, pushed


class TestRound:
    def test_pushes_facebook_posts_that_say_the_phrase(self, capsys):
        client = FakeClient([[post("1", "we need a bookkeeper"), post("2", "unrelated group chatter")]])
        status, pushed = run_round(client, ['need a "bookkeeper"'])
        assert status == 0 and client.searched == [("need a bookkeeper", 20)]
        assert pushed[0][0] == "facebook" and [p["externalId"] for p in pushed[0][1]] == ["1"]
        assert "pushed 1 posts, 0 skipped" in capsys.readouterr().out

    def test_says_facebook_not_x_when_it_is_refused_or_slowed(self, capsys):
        status, pushed = run_round(FakeClient([x_browser.Unauthorized()]), ["a"])
        assert status == 1 and pushed == []
        assert "Reconnect Facebook in ListeningKit" in capsys.readouterr().err
        status, _ = run_round(FakeClient([x_browser.TooManyRequests()]), ["a"])
        assert status == 0 and "Facebook asked us to slow down" in capsys.readouterr().out

    def test_one_odd_error_skips_that_phrase_only(self, capsys):
        client = FakeClient([RuntimeError("boom"), [post("7", "need a bookkeeper")]])
        status, pushed = run_round(client, ["bad", "need a bookkeeper"])
        assert status == 0 and len(pushed) == 1
        assert "could not read Facebook (RuntimeError)" in capsys.readouterr().err

    def test_dry_run_never_pushes(self, capsys):
        status, pushed = run_round(FakeClient([[post("1", "need a bookkeeper")]]), ["need a bookkeeper"], dry_run=True)
        assert (status, pushed) == (0, [])
        assert "would push 1 posts" in capsys.readouterr().out


pytest.importorskip("playwright", reason="Playwright is not installed")


class TestInARealBrowser:
    def test_reads_posts_skips_ads_comments_and_cards_without_a_link(self):
        posts = in_browser("results")
        assert [p.id for p in posts[:3]] == ["1001", "pfbid02abcDEF", "777"]
        assert posts[3].id.startswith("fb-") and posts[3].url == "" and "cards without a permalink" in posts[3].text  # kept, with a stable id
        assert len(posts) == 4
        first = posts[0]
        assert (first.author, first.comments, first.likes) == ("Pat Owner", 1204, 1200)
        assert first.text.startswith("Does anyone know a good bookkeeper")
        assert "a comment inside the post" not in first.text
        assert first.url == "https://www.facebook.com/groups/123/posts/1001/"  # tracking parameters removed
        assert posts[1].url == "https://www.facebook.com/kim/posts/pfbid02abcDEF"
        assert posts[2].url == "https://www.facebook.com/story.php?story_fbid=777&id=42"

    def test_reads_the_layout_the_real_site_serves_and_hovers_for_the_address(self):
        posts = in_browser("live")
        assert [p.id for p in posts[:2]] == ["pfbid0Abc123", "98765"]
        first = posts[0]
        assert (first.author, first.likes, first.comments) == ("Brandon Dinario", 1, 8)
        assert first.text == "I need a bookkeeper today."  # the repeated "Facebook" filler is not part of the message
        assert first.url == "https://www.facebook.com/brandon.d/posts/pfbid0Abc123"
        assert (posts[1].likes, posts[1].comments, posts[1].url) == (12, 1500, "https://www.facebook.com/groups/55/posts/98765/")
        assert posts[2].id.startswith("fb-") and posts[2].author == "No Stamp"  # no timestamp link: stable id, no address

    def test_the_helper_maps_them_to_ingest_posts(self):
        mapped = [facebook_push.post_to_ingest(p) for p in in_browser("results")]
        assert mapped[0]["externalId"] == "1001" and mapped[0]["authorName"] == "Pat Owner" and mapped[0]["comments"] == 1204

    def test_honours_the_count(self):
        assert len(in_browser("results", count=1)) == 1

    def test_no_results_is_an_empty_list_not_an_error(self):
        assert in_browser("empty") == []

    def test_a_login_page_means_the_saved_login_no_longer_works(self):
        with pytest.raises(x_browser.Unauthorized):
            in_browser("login")
        with pytest.raises(x_browser.Unauthorized):
            in_browser("results", redirect="/login/?next=%2Fsearch")
        with pytest.raises(x_browser.Unauthorized):  # Facebook's real answer to a login it does not accept
            in_browser("notfound")

    def test_rate_limit_lock_and_a_broken_page_are_told_apart(self):
        with pytest.raises(x_browser.TooManyRequests):
            in_browser("rate")
        with pytest.raises(x_browser.AccountLocked):
            in_browser("results", redirect="/checkpoint/123/")
        with pytest.raises(RuntimeError, match="did not show any results"):
            in_browser("broken")
