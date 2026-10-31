import asyncio
import re
from pathlib import Path
from types import SimpleNamespace

import pytest

from rdvwr.errors import RateLimited, RedditError
from rdvwr.shreddit import (
    Shreddit,
    parse_comments,
    parse_feed,
    parse_flairs,
    parse_post,
    parse_search,
    parse_typeahead,
)

FIXTURES = Path(__file__).resolve().parent / "fixtures"
HOME_URL = "https://www.reddit.com/svc/shreddit/feeds/home-feed?sort=BEST"
SUBREDDIT_URL = "https://www.reddit.com/r/CharacterAIrunaways/new/"
SUBREDDIT_MORE_URL = "https://www.reddit.com/svc/shreddit/community-more-posts/new/?after=opaque&t=DAY&name=CharacterAIrunaways&navigationSessionId=opaque-session&feedLength=4"
POST_URL = "https://www.reddit.com/r/typescript/comments/example/a_post/"
MORE_URL = "https://www.reddit.com/svc/shreddit/more-comments/r/typescript/t3_example?top-level=1&comments-remaining=150&commentPositionOffset=2"
SEARCH_URL = "https://www.reddit.com/search/?q=typescript&type=communities"
SEARCH_MORE_URL = "https://www.reddit.com/svc/shreddit/search/?q=typescript&type=communities&cursor=opaque-cursor"
SUGGEST_URL = "https://www.reddit.com/svc/shreddit/search-typeahead?query=typescript&recentSearchesCount=0"
PARTIAL = "text/vnd.reddit.partial+html"
PARTIAL_OR_HTML = "text/vnd.reddit.partial+html, text/html;q=0.9"
REFERER = "https://www.reddit.com/"


def fixture(name: str) -> str:
    return (FIXTURES / name).read_text(encoding="utf-8")


class FakeTransport:
    def __init__(self, answer):
        self.answer = answer
        self.calls = []

    async def request(self, method, url, *, headers=None, params=None, data=None, json=None, multipart=None, allow_redirects=False, timeout=None):
        self.calls.append({"method": method, "url": url, "headers": headers, "params": params, "data": data})
        status, body = self.answer(method, url)
        return SimpleNamespace(status_code=status, text=body, url=url, headers={})


class FakeSession:
    async def csrf_token(self):
        return "csrf"


def client(answer):
    transport = FakeTransport(answer)
    return Shreddit(transport, FakeSession()), transport


def run(coroutine):
    return asyncio.run(coroutine)


def test_home_feed_parses_posts_and_the_opaque_next_page_url():
    page = parse_feed(fixture("home-feed.html"), HOME_URL)
    assert page["requestUrl"] == HOME_URL
    assert len(page["posts"]) == 2
    first = page["posts"][0]
    assert {k: first[k] for k in ("author", "authorId", "commentCount", "contentHref", "domain", "fullname", "id", "permalink", "score", "subredditId", "subreddit", "subredditPrefixedName", "title")} == {
        "author": "Zestyclose-Food4062",
        "authorId": "t2_example1",
        "commentCount": 116,
        "contentHref": "/r/CleanEating/comments/1vgiu2y/_/",
        "domain": "self.CleanEating",
        "fullname": "t3_1vgiu2y",
        "id": "1vgiu2y",
        "permalink": "/r/CleanEating/comments/1vgiu2y/_/",
        "score": 214,
        "subredditId": "t5_example1",
        "subreddit": "CleanEating",
        "subredditPrefixedName": "r/CleanEating",
        "title": "Finally found the sub & stayed",
    }
    assert page["posts"][1]["authorId"] is None
    assert page["posts"][1]["title"] == "Just one sip to take away your stress"
    assert page["nextPageUrl"] == "https://www.reddit.com/svc/shreddit/feeds/home-feed?after=dDNfMXZkb3kzMA%3D%3D&distance=32&cursor=dDNfMXZkb3kzMA%3D%3D&sort=BEST"
    assert page["after"] == "dDNfMXZkb3kzMA=="


def test_home_feed_requests_the_partial_endpoint():
    shreddit, transport = client(lambda method, url: (200, fixture("home-feed.html")))
    page = run(shreddit.home_feed())
    assert len(page["posts"]) == 2
    assert transport.calls == [{"method": "GET", "url": HOME_URL, "headers": {"Accept": PARTIAL_OR_HTML, "Referer": REFERER}, "params": None, "data": None}]


def test_home_feed_builds_the_recorded_cursor_query():
    shreddit, transport = client(lambda method, url: (200, "<div></div>"))
    run(shreddit.home_feed("top", after="dDNf", t="WEEK"))
    assert transport.calls[0]["url"] == "https://www.reddit.com/svc/shreddit/feeds/home-feed?sort=TOP&after=dDNf&cursor=dDNf&t=week"


def test_home_feed_follows_only_same_origin_home_feed_page_urls():
    shreddit, transport = client(lambda method, url: (200, fixture("home-feed.html")))
    nxt = "/svc/shreddit/feeds/home-feed?after=opaque&cursor=opaque&sort=BEST"
    run(shreddit.home_feed(after=nxt))
    assert [c["url"] for c in transport.calls] == [f"https://www.reddit.com{nxt}"]
    with pytest.raises(ValueError, match="home-feed endpoint"):
        run(shreddit.home_feed(after="https://example.com/svc/shreddit/feeds/home-feed?after=x"))
    with pytest.raises(ValueError, match="cannot be combined"):
        run(shreddit.home_feed(sort="new", after=nxt))


def test_home_feed_reports_http_errors_without_parsing_the_body():
    shreddit, _ = client(lambda method, url: (429, "rate limited"))
    with pytest.raises(RateLimited) as caught:
        run(shreddit.home_feed("new"))
    assert caught.value.status == 429


def test_popular_feed_requests_its_partial():
    shreddit, transport = client(lambda method, url: (200, "<div></div>"))
    run(shreddit.popular_feed())
    run(shreddit.popular_feed(after="dDNf"))
    assert [c["url"] for c in transport.calls] == [
        "https://www.reddit.com/svc/shreddit/feeds/popular-feed?sort=BEST",
        "https://www.reddit.com/svc/shreddit/feeds/popular-feed?sort=BEST&after=dDNf&cursor=dDNf",
    ]
    assert transport.calls[0]["headers"]["Accept"] == PARTIAL_OR_HTML


def test_subreddit_feed_parses_posts_and_the_observed_continuation():
    page = parse_feed(fixture("subreddit-feed.html"), SUBREDDIT_URL)
    assert page["requestUrl"] == SUBREDDIT_URL
    assert page["nextPageUrl"] == SUBREDDIT_MORE_URL
    assert page["after"] == "opaque"
    assert [(p["fullname"], p["title"]) for p in page["posts"]] == [("t3_first", "First sorted post"), ("t3_second", "Second sorted post")]


@pytest.mark.parametrize(
    ("sort", "t", "expected"),
    [
        ("best", None, "https://www.reddit.com/r/CharacterAIrunaways/best/"),
        ("hot", None, "https://www.reddit.com/r/CharacterAIrunaways/hot/"),
        ("new", None, "https://www.reddit.com/r/CharacterAIrunaways/new/"),
        ("top", None, "https://www.reddit.com/r/CharacterAIrunaways/top/"),
        ("top", "WEEK", "https://www.reddit.com/r/CharacterAIrunaways/top/?t=week"),
        ("rising", None, "https://www.reddit.com/r/CharacterAIrunaways/rising/"),
    ],
)
def test_subreddit_feed_maps_every_sort_to_its_route(sort, t, expected):
    shreddit, transport = client(lambda method, url: (200, "<shreddit-feed></shreddit-feed>"))
    run(shreddit.community_feed("r/CharacterAIrunaways", sort, t=t))
    assert [c["url"] for c in transport.calls] == [expected]


def test_subreddit_feed_follows_its_continuation_with_the_partial_accept():
    first = fixture("subreddit-feed.html")
    second = re.sub(r"<faceplate-partial[\s\S]*?</faceplate-partial>", "", first, count=1).replace("t3_first", "t3_third").replace("First sorted post", "Third sorted post")
    shreddit, transport = client(lambda method, url: (200, second if url == SUBREDDIT_MORE_URL else first))
    page = run(shreddit.community_feed("CharacterAIrunaways", "new"))
    assert len(page["posts"]) == 2
    more = run(shreddit.community_feed("CharacterAIrunaways", "new", after=page["nextPageUrl"]))
    assert [p["fullname"] for p in more["posts"]] == ["t3_third", "t3_second"]
    assert more["nextPageUrl"] is None
    assert transport.calls == [
        {"method": "GET", "url": SUBREDDIT_URL, "headers": {"Accept": "text/html", "Referer": REFERER}, "params": None, "data": None},
        {"method": "GET", "url": SUBREDDIT_MORE_URL, "headers": {"Accept": PARTIAL, "Referer": REFERER}, "params": None, "data": None},
    ]


def test_subreddit_feed_builds_a_continuation_from_a_bare_cursor():
    shreddit, transport = client(lambda method, url: (200, "<div></div>"))
    run(shreddit.community_feed("AskReddit", "best", after="dDNf"))
    assert transport.calls[0]["url"] == "https://www.reddit.com/svc/shreddit/community-more-posts/best/?after=dDNf&name=AskReddit"
    assert transport.calls[0]["headers"]["Accept"] == PARTIAL


def test_subreddit_feed_validates_names_top_windows_and_cursor_ownership():
    shreddit, _ = client(lambda method, url: (200, fixture("subreddit-feed.html").replace("name=CharacterAIrunaways", "name=AnotherCommunity")))
    with pytest.raises(ValueError, match="valid name"):
        run(shreddit.community_feed("not a subreddit"))
    with pytest.raises(ValueError, match="requires the top sort"):
        run(shreddit.community_feed("CharacterAIrunaways", "new", t="WEEK"))
    page = run(shreddit.community_feed("CharacterAIrunaways", "new"))
    with pytest.raises(ValueError, match="configured subreddit endpoint"):
        run(shreddit.community_feed("CharacterAIrunaways", "new", after=page["nextPageUrl"]))


def test_post_parses_the_post_flat_comments_and_both_cursor_kinds():
    thread = parse_post(fixture("post.html"), POST_URL)
    post = thread["post"]
    assert {k: post[k] for k in ("author", "body", "commentCount", "fullname", "id", "score", "title", "upvoteRatio", "subreddit", "createdUtc")} == {
        "author": "poster",
        "body": "Post body.",
        "commentCount": 250,
        "fullname": "t3_example",
        "id": "example",
        "score": 42,
        "title": "A post title",
        "upvoteRatio": 0.95,
        "subreddit": "typescript",
        "createdUtc": 1785974400,
    }
    assert post["bodyHtml"] == "<p>Post <strong>body</strong>.</p>"
    comments = thread["comments"]
    assert len(comments) == 2
    root, child = comments
    assert root["author"] == "commenter"
    assert root["body"] == "Root comment."
    assert root["depth"] == 0
    assert root["fullname"] == "t1_root"
    assert root["parentId"] is None
    assert root["parentPositions"] == []
    assert root["moreReplies"]["count"] == 12
    assert root["moreReplies"]["url"] == "https://www.reddit.com/svc/shreddit/more-comments/r/typescript/t3_example?sort=CONFIDENCE&startingDepth=1&commentParentPositions=0"
    assert root["moreReplies"]["params"] == {"sort": "CONFIDENCE", "startingDepth": "1", "commentParentPositions": "0"}
    assert child["body"] == "Child reply."
    assert child["depth"] == 1
    assert child["fullname"] == "t1_child"
    assert child["parentId"] == "t1_root"
    assert child["parentPositions"] == [0]
    assert thread["more"]["url"] == MORE_URL
    assert thread["more"]["subreddit"] == "typescript"
    assert thread["more"]["postId"] == "t3_example"


def test_post_requests_post_pages_and_comment_pages():
    html = fixture("post.html")
    shreddit, transport = client(lambda method, url: (200, html))
    thread = run(shreddit.post("typescript", "example", sort="top"))
    page = run(shreddit.follow(thread["more"]))
    assert len(thread["comments"]) == 2
    assert len(page["comments"]) == 2
    assert transport.calls == [
        {"method": "GET", "url": "https://www.reddit.com/r/typescript/comments/example/?sort=top", "headers": {"Accept": "text/html", "Referer": REFERER}, "params": None, "data": None},
        {
            "method": "POST",
            "url": MORE_URL,
            "headers": {
                "Accept": PARTIAL,
                "Content-Type": "application/x-www-form-urlencoded",
                "Origin": "https://www.reddit.com",
                "Referer": "https://www.reddit.com/r/typescript/comments/example/",
            },
            "params": None,
            "data": {"csrf_token": "csrf"},
        },
    ]


def test_more_comments_sends_the_recorded_query_and_cursor_body():
    shreddit, transport = client(lambda method, url: (200, ""))
    run(shreddit.more_comments("AskReddit", "1x8sr8s", "Y29tbWVudA==", sort="CONFIDENCE", starting_depth=4, parent_positions=[0, 0, 0, 0]))
    call = transport.calls[0]
    assert call["method"] == "POST"
    assert call["url"] == "https://www.reddit.com/svc/shreddit/more-comments/r/AskReddit/t3_1x8sr8s?sort=CONFIDENCE&startingDepth=4&commentParentPositions=0,0,0,0"
    assert call["data"] == {"cursor": "Y29tbWVudA==", "csrf_token": "csrf"}


def test_post_accepts_post_ids():
    shreddit, transport = client(lambda method, url: (200, fixture("post.html")))
    run(shreddit.post(None, "t3_example"))
    assert [c["url"] for c in transport.calls] == ["https://www.reddit.com/comments/example/"]


def test_post_reports_http_errors_and_changed_post_contracts():
    shreddit, _ = client(lambda method, url: (429, "rate limited"))
    with pytest.raises(RateLimited):
        run(shreddit.post("typescript", "example"))
    with pytest.raises(RedditError, match="shreddit-post"):
        parse_post("<main></main>", POST_URL)


def test_comments_parse_standalone_fragments():
    page = parse_comments(fixture("post.html"), MORE_URL)
    assert [c["fullname"] for c in page["comments"]] == ["t1_root", "t1_child"]
    assert page["more"]["url"] == MORE_URL


def test_flairs_discovers_ids_and_display_text():
    shreddit, transport = client(lambda method, url: (200, fixture("post-flairs.json")))
    assert run(shreddit.flairs("r/CharacterAIrunaways")) == [
        {"id": "9db8d3f2-7590-11ef-9354-3ada40f3344f", "text": "C.AI complaint"},
        {"id": "555d3a74-f007-11f0-bcf0-9e242efd211e", "text": "Searching for Alternatives"},
        {"id": "71336372-f007-11f0-a068-da335058ca6e", "text": "Making a Recommendation"},
    ]
    assert transport.calls == [
        {
            "method": "GET",
            "url": "https://www.reddit.com/r/CharacterAIrunaways/api/link_flair_v2.json",
            "headers": {"Accept": "application/json", "Referer": "https://www.reddit.com/r/CharacterAIrunaways/submit/?type=TEXT"},
            "params": None,
            "data": None,
        }
    ]


def test_flairs_report_request_and_json_contract_errors():
    shreddit, _ = client(lambda method, url: (403, "denied"))
    with pytest.raises(RedditError) as caught:
        run(shreddit.flairs("test"))
    assert caught.value.status == 403
    with pytest.raises(RedditError, match="post-flair listing"):
        parse_flairs("{}")


def test_search_parses_rich_community_results_and_their_continuation():
    page = parse_search(fixture("community-search.html"), SEARCH_URL)
    assert page["requestUrl"] == SEARCH_URL
    assert page["nextPageUrl"] == SEARCH_MORE_URL
    assert page["after"] == "opaque-cursor"
    assert page["communities"] == [
        {
            "id": "2v6gg",
            "fullname": "t5_2v6gg",
            "name": "typescript",
            "prefixedName": "r/typescript",
            "permalink": "https://www.reddit.com/r/typescript/",
            "description": "TypeScript is a typed superset of JavaScript.",
            "iconUrl": "https://styles.redditmedia.com/typescript.png",
            "nsfw": False,
            "quarantined": False,
            "weeklyVisitors": 23307,
            "weeklyContributions": 912,
        },
        {
            "id": "example",
            "fullname": "t5_example",
            "name": "typescript_examples",
            "prefixedName": "r/typescript_examples",
            "permalink": "https://www.reddit.com/r/typescript_examples/",
            "description": "Small TypeScript examples.",
            "iconUrl": None,
            "nsfw": True,
            "quarantined": False,
            "weeklyVisitors": 47,
            "weeklyContributions": 8,
        },
    ]


def test_typeahead_parses_query_and_community_suggestions():
    suggestions = parse_typeahead(fixture("search-typeahead.html"), SUGGEST_URL)
    assert suggestions["queries"] == [
        {"query": "typescript", "searchUrl": "https://www.reddit.com/search/?q=typescript"},
        {"query": "typescript enum", "searchUrl": "https://www.reddit.com/search/?q=typescript+enum"},
    ]
    assert suggestions["communities"] == [
        {
            "id": "2v6gg",
            "fullname": "t5_2v6gg",
            "name": "typescript",
            "prefixedName": "r/typescript",
            "permalink": "https://www.reddit.com/r/typescript/",
            "description": None,
            "iconUrl": "https://styles.redditmedia.com/typescript.png",
            "weeklyVisitors": 23307,
        },
        {
            "id": "example",
            "fullname": "t5_example",
            "name": "typescript_examples",
            "prefixedName": "r/typescript_examples",
            "permalink": "https://www.reddit.com/r/typescript_examples/",
            "description": "Small TypeScript examples.",
            "iconUrl": None,
            "weeklyVisitors": None,
        },
    ]


def test_search_follows_community_continuations():
    first = fixture("community-search.html")
    second = re.sub(r"<faceplate-partial[\s\S]*?</faceplate-partial>", "", first, count=1).replace("t5_2v6gg", "t5_second").replace("typescript", "typescript_second")
    shreddit, transport = client(lambda method, url: (200, second if url == SEARCH_MORE_URL else first))
    page = run(shreddit.search("  typescript  ", "communities"))
    assert len(page["communities"]) == 2
    more = run(shreddit.search("typescript", "communities", after=page["nextPageUrl"]))
    assert [c["fullname"] for c in more["communities"]][0] == "t5_second"
    assert transport.calls == [
        {"method": "GET", "url": SEARCH_URL, "headers": {"Accept": "text/html", "Referer": REFERER}, "params": None, "data": None},
        {"method": "GET", "url": SEARCH_MORE_URL, "headers": {"Accept": PARTIAL, "Referer": REFERER}, "params": None, "data": None},
    ]
    run(shreddit.search("typescript", "communities", after="opaque-cursor"))
    assert transport.calls[-1]["url"] == SEARCH_MORE_URL


def test_search_posts_requests_the_posts_tab():
    shreddit, transport = client(lambda method, url: (200, fixture("home-feed.html")))
    page = run(shreddit.search("typescript enum"))
    assert transport.calls[0]["url"] == "https://www.reddit.com/search/?q=typescript+enum&type=posts"
    assert [p["fullname"] for p in page["posts"]] == ["t3_1vgiu2y", "t3_1vfs8ai"]


def test_typeahead_requests_suggestions():
    shreddit, transport = client(lambda method, url: (200, fixture("search-typeahead.html")))
    suggestions = run(shreddit.typeahead("typescript"))
    assert len(suggestions["communities"]) == 2
    assert transport.calls == [{"method": "GET", "url": SUGGEST_URL, "headers": {"Accept": PARTIAL, "Referer": REFERER}, "params": None, "data": None}]


def test_search_rejects_empty_queries_and_reports_http_errors():
    shreddit, _ = client(lambda method, url: (429, "rate limited"))
    with pytest.raises(RateLimited):
        run(shreddit.search("typescript", "communities"))
    with pytest.raises(ValueError, match="cannot be empty"):
        run(shreddit.typeahead(" "))
