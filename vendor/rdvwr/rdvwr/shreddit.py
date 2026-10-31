from __future__ import annotations

import json
import re
from datetime import datetime
from typing import Any
from urllib.parse import parse_qsl, quote_plus, urlencode, urljoin, urlsplit

from bs4 import BeautifulSoup, Tag

from .errors import RedditError, raise_for
from .transport import ORIGIN

PARTIAL_HTML = "text/vnd.reddit.partial+html"
PARTIAL_OR_HTML = "text/vnd.reddit.partial+html, text/html;q=0.9"
HTML = "text/html"
JSON_ACCEPT = "application/json"
REFERER = ORIGIN + "/"
HOME_FEED_PATH = "/svc/shreddit/feeds/home-feed"
POPULAR_FEED_PATH = "/svc/shreddit/feeds/popular-feed"
COMMUNITY_MORE_PREFIX = "/svc/shreddit/community-more-posts/"
SEARCH_PATH = "/search/"
SEARCH_PARTIAL_PATH = "/svc/shreddit/search/"
TYPEAHEAD_PATH = "/svc/shreddit/search-typeahead"
FEED_SORTS = ("best", "hot", "new", "top", "rising", "controversial")
COMMUNITY_SORTS = ("best", "hot", "new", "top", "rising")
TIME_SORTS = ("top", "controversial")
TOP_TIMES = ("hour", "day", "week", "month", "year", "all")
COMMENT_SORTS = ("best", "top", "new", "controversial", "old", "qa")
SEARCH_KINDS = ("posts", "communities")
COMMUNITY_MORE_PATH = re.compile(r"^/svc/shreddit/community-more-posts/(best|hot|new|top|rising)/?$", re.I)
MORE_COMMENTS_PATH = re.compile(r"^/svc/shreddit/more-comments/r/([^/]+)/(t3_[a-z0-9]+)$", re.I)
SUBREDDIT_NAME = re.compile(r"^(?:/?r/)?([a-z0-9_]{2,21})/?$", re.I)
SUBREDDIT_PATH = re.compile(r"^/r/([^/]+)/?$", re.I)
PERMALINK_SUBREDDIT = re.compile(r"^/r/([^/]+)/", re.I)
POST_ID = re.compile(r"^(?:t3_)?([a-z0-9]+)$", re.I)
INTEGER = re.compile(r"^-?\d+$")


def _soup(html: str) -> BeautifulSoup:
    return BeautifulSoup(html, "html.parser")


def _text(value: str | None) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def _text_or_none(value: str | None) -> str | None:
    text = _text(value)
    return text or None


def _attr(el: Tag, name: str) -> str | None:
    value = el.get(name)
    if isinstance(value, list):
        value = " ".join(value)
    return value if value else None


def _int(value: str | None) -> int | None:
    return int(value) if value is not None and INTEGER.match(value) else None


def _number(value: str | None) -> float | None:
    if value is None or not value.strip():
        return None
    try:
        return float(value)
    except ValueError:
        return None


def _epoch(value: str | None) -> int | None:
    if not value:
        return None
    try:
        return int(datetime.fromisoformat(re.sub(r"([+-]\d{2})(\d{2})$", r"\1:\2", value)).timestamp())
    except ValueError:
        return None


def _int_list(value: str | None) -> list[int]:
    try:
        parsed = json.loads(value or "")
    except ValueError:
        return []
    return parsed if isinstance(parsed, list) and all(isinstance(n, int) and not isinstance(n, bool) for n in parsed) else []


def _query(url: str) -> dict[str, str]:
    return dict(parse_qsl(urlsplit(url).query, keep_blank_values=True))


def _with_query(path: str, params: dict[str, Any]) -> str:
    kept = {k: v for k, v in params.items() if v is not None and v != ""}
    url = ORIGIN + path
    return f"{url}?{urlencode(kept, safe=',')}" if kept else url


def _same_origin(url: str, base: str = ORIGIN) -> bool:
    a, b = urlsplit(url), urlsplit(base)
    return (a.scheme, a.netloc) == (b.scheme, b.netloc)


def _is_url(value: str) -> bool:
    return value.startswith("/") or value.startswith("http://") or value.startswith("https://")


def _absolute(value: str) -> str:
    return urljoin(REFERER, value).split("#", 1)[0]


def _cursor_of(url: str | None) -> str | None:
    if not url:
        return None
    query = _query(url)
    return query.get("after") or query.get("cursor")


def subreddit_name(value: str) -> str:
    match = SUBREDDIT_NAME.match(value.strip())
    if not match:
        raise ValueError("Reddit subreddit must be a valid name or r/name")
    return match.group(1)


def _short_post_id(value: str) -> str:
    match = POST_ID.match(value.strip())
    if not match:
        raise ValueError("Reddit post must be a post id or t3_ fullname")
    return match.group(1)


def _normalized_query(query: str) -> str:
    normalized = _text(query)
    if not normalized:
        raise ValueError("Reddit search query cannot be empty")
    return normalized


def _subreddit_of(permalink: str | None) -> str | None:
    match = PERMALINK_SUBREDDIT.match(permalink or "")
    return match.group(1) if match else None


def _post_body(el: Tag, fullname: str) -> Tag | None:
    return el.find(id=f"{fullname}-post-rtjson-content") or el.find(attrs={"slot": "text-body"})


def parse_post_element(el: Tag) -> dict[str, Any] | None:
    fullname = _attr(el, "id")
    permalink = _attr(el, "permalink")
    if not fullname or not re.match(r"^t3_[a-z0-9]+$", fullname, re.I) or not permalink:
        return None
    title_el = el.select_one('[slot="title"], h1, h2, h3')
    body = _post_body(el, fullname)
    created = _attr(el, "created-timestamp")
    return {
        "id": fullname[3:],
        "fullname": fullname,
        "subreddit": _attr(el, "subreddit-name") or _subreddit_of(permalink),
        "subredditId": _attr(el, "subreddit-id"),
        "subredditPrefixedName": _attr(el, "subreddit-prefixed-name"),
        "title": _text(_attr(el, "post-title") or (title_el.get_text() if title_el else "")),
        "author": _attr(el, "author"),
        "authorId": _attr(el, "author-id"),
        "score": _int(_attr(el, "score")),
        "commentCount": _int(_attr(el, "comment-count")),
        "created": created,
        "createdUtc": _epoch(created),
        "permalink": permalink,
        "contentHref": _attr(el, "content-href"),
        "domain": _attr(el, "domain"),
        "postType": _attr(el, "post-type"),
        "upvoteRatio": _number(_attr(el, "upvote-ratio")),
        "awardCount": _int(_attr(el, "award-count")),
        "nsfw": el.has_attr("is-nsfw") or el.has_attr("nsfw"),
        "spoiler": el.has_attr("is-spoiler") or el.has_attr("spoiler"),
        "body": _text_or_none(body.get_text()) if body else None,
        "bodyHtml": (body.decode_contents().strip() or None) if body else None,
        "recommendationSource": _attr(el, "recommendation-source"),
    }


def _posts(soup: BeautifulSoup) -> list[dict[str, Any]]:
    posts: list[dict[str, Any]] = []
    for el in soup.find_all("shreddit-post"):
        if el.has_attr("promoted"):
            continue
        post = parse_post_element(el)
        if post:
            posts.append(post)
    return posts


def _feed_continuation(value: str | None, source: str) -> str | None:
    if not value:
        return None
    url = urljoin(source, value)
    if not _same_origin(url, source):
        return None
    path = urlsplit(url).path
    if path in (HOME_FEED_PATH, POPULAR_FEED_PATH):
        return url
    query = _query(url)
    if COMMUNITY_MORE_PATH.match(path) and "name" in query and "after" in query:
        return url
    return None


def parse_feed(html: str, response_url: str = REFERER) -> dict[str, Any]:
    soup = _soup(html)
    candidates = []
    marked = soup.find(id="feed-next-page-partial")
    if isinstance(marked, Tag):
        candidates.append(_attr(marked, "src"))
    candidates += [_attr(el, "src") for el in soup.find_all("faceplate-partial") if el.has_attr("src")]
    next_url = next((url for url in (_feed_continuation(c, response_url) for c in candidates) if url), None)
    return {"posts": _posts(soup), "after": _cursor_of(next_url), "nextPageUrl": next_url, "requestUrl": response_url}


def _more_comments(partial: Tag, source: str) -> dict[str, Any] | None:
    src = _attr(partial, "src")
    if not src:
        return None
    url = urljoin(source, src)
    match = MORE_COMMENTS_PATH.match(urlsplit(url).path)
    if not _same_origin(url, source) or not match:
        return None
    params = _query(url)
    cursor_input = partial.find("input", attrs={"name": "cursor"})
    cursor = _attr(cursor_input, "value") if isinstance(cursor_input, Tag) else None
    number = partial.find("faceplate-number")
    return {
        "subreddit": match.group(1),
        "postId": match.group(2),
        "cursor": cursor or params.pop("cursor", None),
        "params": params,
        "count": _int(_attr(number, "number")) if isinstance(number, Tag) else None,
        "url": url,
    }


def _comments(soup: BeautifulSoup, source: str) -> tuple[list[dict[str, Any]], dict[str, Any] | None]:
    replies: dict[str, dict[str, Any]] = {}
    next_page: dict[str, Any] | None = None
    for partial in soup.find_all("faceplate-partial"):
        if "/svc/shreddit/more-comments/" not in (_attr(partial, "src") or ""):
            continue
        more = _more_comments(partial, source)
        if not more:
            continue
        parent = partial.find_parent("shreddit-comment")
        parent_id = _attr(parent, "thingid") if parent else None
        if parent_id and parent_id.startswith("t1_"):
            replies.setdefault(parent_id, more)
        elif next_page is None:
            next_page = more
    comments: list[dict[str, Any]] = []
    for el in soup.find_all("shreddit-comment"):
        fullname = _attr(el, "thingid")
        post_id = _attr(el, "postid")
        permalink = _attr(el, "permalink")
        if not fullname or not fullname.startswith("t1_") or not post_id or not post_id.startswith("t3_") or not permalink:
            continue
        body = el.find(id=f"{fullname}-comment-rtjson-content")
        parent = _attr(el, "parentid")
        created = _attr(el, "created")
        comments.append({
            "id": fullname[3:],
            "fullname": fullname,
            "postId": post_id,
            "subreddit": _subreddit_of(permalink),
            "parentId": parent if parent and parent.startswith("t1_") else None,
            "depth": _int(_attr(el, "depth")),
            "author": _attr(el, "author"),
            "score": _int(_attr(el, "score")),
            "created": created,
            "createdUtc": _epoch(created),
            "permalink": permalink,
            "body": _text_or_none(body.get_text()) if isinstance(body, Tag) else None,
            "bodyHtml": (body.decode_contents().strip() or None) if isinstance(body, Tag) else None,
            "contentType": _attr(el, "content-type"),
            "awardCount": _int(_attr(el, "award-count")),
            "position": _int(_attr(el, "comment-position")),
            "parentPositions": _int_list(_attr(el, "comment-parent-positions")),
            "moreReplies": replies.get(fullname),
        })
    return comments, next_page


def parse_comments(html: str, response_url: str = REFERER) -> dict[str, Any]:
    comments, more = _comments(_soup(html), response_url)
    return {"comments": comments, "more": more, "after": more["cursor"] if more else None, "requestUrl": response_url}


def parse_post(html: str, response_url: str = REFERER) -> dict[str, Any]:
    soup = _soup(html)
    el = soup.find("shreddit-post")
    post = parse_post_element(el) if isinstance(el, Tag) else None
    if not post:
        raise RedditError(f"Reddit response did not contain a valid shreddit-post ({response_url})")
    comments, more = _comments(soup, response_url)
    return {"post": post, "comments": comments, "more": more, "after": more["cursor"] if more else None, "requestUrl": response_url}


def _tracking_context(el: Tag | None) -> dict[str, Any]:
    if el is None:
        return {}
    try:
        parsed = json.loads(_attr(el, "data-faceplate-tracking-context") or "")
    except ValueError:
        return {}
    return parsed if isinstance(parsed, dict) else {}


def _metric(el: Tag, label: str) -> int | None:
    for number in el.select("faceplate-number[number]"):
        if label in _text(number.parent.get_text() if number.parent else "").lower():
            return _int(_attr(number, "number"))
    return None


def _community_permalink(value: str | None, source: str) -> str | None:
    if not value:
        return None
    url = urljoin(source, value)
    return url if _same_origin(url, source) and SUBREDDIT_PATH.match(urlsplit(url).path) else None


def _community_name(permalink: str) -> str | None:
    match = SUBREDDIT_PATH.match(urlsplit(permalink).path)
    return match.group(1) if match else None


def _resolved(value: str | None, source: str) -> str | None:
    return urljoin(source, value) if value else None


def _bool_or_none(value: Any) -> bool | None:
    return value if isinstance(value, bool) else None


def _parse_community(el: Tag, source: str) -> dict[str, Any] | None:
    tracker = el.find_parent("search-telemetry-tracker")
    context = _tracking_context(tracker) or _tracking_context(el.find(attrs={"data-faceplate-tracking-context": True}))
    subreddit = context.get("subreddit") if isinstance(context.get("subreddit"), dict) else {}
    link = el.select_one('a[href^="/r/"]')
    permalink = _community_permalink(_attr(link, "href") if link else None, source)
    fullname = subreddit.get("id")
    if not (isinstance(fullname, str) and re.match(r"^t5_[a-z0-9]+$", fullname, re.I)):
        title = el.select_one('[id^="search-community-title-"]')
        found = re.match(r"^search-community-title-(t5_[a-z0-9]+)$", _attr(title, "id") or "", re.I) if title else None
        fullname = found.group(1) if found else None
    if not permalink or not fullname:
        return None
    name = subreddit.get("name") if isinstance(subreddit.get("name"), str) and subreddit.get("name") else _community_name(permalink)
    if not name:
        return None
    desc = el.select_one('[data-testid="search-subreddit-desc-text"]')
    icon = el.select_one("img.shreddit-subreddit-icon__icon, img")
    return {
        "id": fullname[3:],
        "fullname": fullname,
        "name": name,
        "prefixedName": f"r/{name}",
        "permalink": permalink,
        "description": _text_or_none(desc.get_text()) if desc else None,
        "iconUrl": _resolved(_attr(icon, "src"), source) if icon else None,
        "nsfw": _bool_or_none(subreddit.get("nsfw")),
        "quarantined": _bool_or_none(subreddit.get("quarantined")),
        "weeklyVisitors": _metric(el, "weekly visitor"),
        "weeklyContributions": _metric(el, "weekly contributions"),
    }


def _tracked_posts(soup: BeautifulSoup, seen: set[str]) -> list[dict[str, Any]]:
    posts: list[dict[str, Any]] = []
    for el in soup.find_all(attrs={"data-faceplate-tracking-context": True}):
        post = _tracking_context(el).get("post")
        if not isinstance(post, dict):
            continue
        fullname = post.get("id")
        if not isinstance(fullname, str) or not re.match(r"^t3_[a-z0-9]+$", fullname, re.I) or fullname in seen:
            continue
        seen.add(fullname)
        link = el.select_one('a[data-testid="post-title"]') or el.select_one('a[href*="/comments/"]')
        permalink = _attr(link, "href") if link else None
        subreddit = _tracking_context(el).get("subreddit")
        posts.append({
            "id": fullname[3:],
            "fullname": fullname,
            "subreddit": (subreddit.get("name") if isinstance(subreddit, dict) else None) or _subreddit_of(permalink),
            "title": _text(post.get("title") if isinstance(post.get("title"), str) else (link.get_text() if link else "")),
            "author": post.get("author") if isinstance(post.get("author"), str) else None,
            "score": post.get("score") if isinstance(post.get("score"), int) else None,
            "commentCount": post.get("number_comments") if isinstance(post.get("number_comments"), int) else None,
            "created": None,
            "createdUtc": int(post["created_timestamp"] / 1000) if isinstance(post.get("created_timestamp"), (int, float)) else None,
            "permalink": permalink,
            "nsfw": _bool_or_none(post.get("nsfw")),
        })
    return posts


def _search_continuation(value: str | None, source: str) -> str | None:
    if not value:
        return None
    url = urljoin(source, value)
    query = _query(url)
    ok = (
        _same_origin(url, source)
        and urlsplit(url).path == SEARCH_PARTIAL_PATH
        and query.get("type") in SEARCH_KINDS
        and "q" in query
        and "cursor" in query
    )
    return url if ok else None


def parse_search(html: str, response_url: str = REFERER) -> dict[str, Any]:
    soup = _soup(html)
    communities = [c for c in (_parse_community(el, response_url) for el in soup.select('[data-testid="search-community"]')) if c]
    posts = _posts(soup)
    posts += _tracked_posts(soup, {p["fullname"] for p in posts})
    next_url = next(
        (url for url in (_search_continuation(_attr(el, "src"), response_url) for el in soup.select("faceplate-partial[src]")) if url),
        None,
    )
    return {
        "posts": posts,
        "communities": communities,
        "after": _query(next_url).get("cursor") if next_url else None,
        "nextPageUrl": next_url,
        "requestUrl": response_url,
    }


def parse_typeahead(html: str, response_url: str = REFERER) -> dict[str, Any]:
    soup = _soup(html)
    queries: list[dict[str, str]] = []
    for item in soup.select('a[role="menuitem"]:not([data-search-scope-id])'):
        href = _attr(item, "href")
        if not href:
            continue
        url = urljoin(response_url, href)
        query = _query(url).get("q") if urlsplit(url).path == SEARCH_PATH else None
        if query is None or not query.strip():
            continue
        queries.append({"query": query, "searchUrl": urljoin(response_url, SEARCH_PATH) + "?" + urlencode({"q": query}, quote_via=quote_plus)})
    communities: list[dict[str, Any]] = []
    for item in soup.select('a[role="menuitem"][data-search-scope-id]'):
        fullname = _attr(item, "data-search-scope-id")
        permalink = _community_permalink(_attr(item, "href"), response_url)
        if not fullname or not re.match(r"^t5_[a-z0-9]+$", fullname, re.I) or not permalink:
            continue
        name = _community_name(permalink)
        if not name:
            continue
        visitors = _metric(item, "weekly visitor")
        details = re.sub(rf"^r/{re.escape(name)}\s*", "", _text(item.get_text()), flags=re.I)
        details = re.sub(r"^\S+\s+weekly visitors?$", "", details, flags=re.I).strip()
        icon = item.find("img")
        communities.append({
            "id": fullname[3:],
            "fullname": fullname,
            "name": name,
            "prefixedName": f"r/{name}",
            "permalink": permalink,
            "description": details if visitors is None and details else None,
            "iconUrl": _resolved(_attr(icon, "src"), response_url) if isinstance(icon, Tag) else None,
            "weeklyVisitors": visitors,
        })
    return {"queries": queries, "communities": communities, "requestUrl": response_url}


def parse_flairs(text: str, response_url: str = REFERER) -> list[dict[str, str]]:
    try:
        payload = json.loads(text)
    except ValueError:
        raise RedditError(f"Reddit response did not contain a valid post-flair listing ({response_url})") from None
    if not isinstance(payload, list):
        raise RedditError(f"Reddit response did not contain a valid post-flair listing ({response_url})")
    flairs: list[dict[str, str]] = []
    seen: set[str] = set()
    for item in payload:
        flair_id = item.get("id") if isinstance(item, dict) else None
        flair_text = item.get("text") if isinstance(item, dict) else None
        if not isinstance(flair_id, str) or not flair_id.strip() or not isinstance(flair_text, str) or not flair_text.strip():
            raise RedditError(f"Reddit response did not contain a valid post-flair listing ({response_url})")
        if flair_id.strip() in seen:
            continue
        seen.add(flair_id.strip())
        flairs.append({"id": flair_id.strip(), "text": flair_text.strip()})
    return flairs


class Shreddit:
    def __init__(self, transport: Any, session: Any) -> None:
        self.transport = transport
        self.session = session

    async def _get(self, url: str, accept: str, what: str, referer: str = REFERER) -> tuple[str, str]:
        response = await self.transport.request("GET", url, headers={"Accept": accept, "Referer": referer})
        raise_for(response, what)
        return response.text, str(getattr(response, "url", "") or url)

    def _own(self, value: str, check: Any, message: str) -> str:
        url = _absolute(value)
        if not _same_origin(url) or not check(url):
            raise ValueError(message)
        return url

    async def home_feed(self, sort: str | None = None, after: str | None = None, t: str | None = None) -> dict[str, Any]:
        if after and _is_url(after):
            if sort is not None:
                raise ValueError("Reddit feed page URL cannot be combined with sort")
            url = self._own(after, lambda u: urlsplit(u).path == HOME_FEED_PATH, "Reddit feed page URL must target the home-feed endpoint")
        else:
            sort = (sort or "best").lower()
            if sort not in FEED_SORTS:
                raise ValueError(f"Unsupported Reddit home-feed sort: {sort}")
            params: dict[str, Any] = {"sort": sort.upper()}
            if after:
                params.update({"after": after, "cursor": after})
            if t and sort in TIME_SORTS:
                params["t"] = t.lower()
            url = _with_query(HOME_FEED_PATH, params)
        html, final = await self._get(url, PARTIAL_OR_HTML, "home feed")
        return parse_feed(html, final)

    async def popular_feed(self, after: str | None = None) -> dict[str, Any]:
        if after and _is_url(after):
            url = self._own(after, lambda u: urlsplit(u).path == POPULAR_FEED_PATH, "Reddit feed page URL must target the popular-feed endpoint")
        else:
            url = _with_query(POPULAR_FEED_PATH, {"sort": "BEST", "after": after, "cursor": after})
        html, final = await self._get(url, PARTIAL_OR_HTML, "popular feed")
        return parse_feed(html, final)

    async def community_feed(self, subreddit: str, sort: str = "hot", after: str | None = None, t: str | None = None) -> dict[str, Any]:
        name = subreddit_name(subreddit)
        sort = sort.lower()
        if sort not in COMMUNITY_SORTS:
            raise ValueError(f"Unsupported Reddit subreddit-feed sort: {sort}")
        if t is not None and sort != "top":
            raise ValueError("Reddit subreddit-feed time requires the top sort")
        if t is not None and t.lower() not in TOP_TIMES:
            raise ValueError(f"Unsupported Reddit top time: {t}")
        if after and _is_url(after):
            def owned(u: str) -> bool:
                match = COMMUNITY_MORE_PATH.match(urlsplit(u).path)
                return bool(match) and match.group(1).lower() == sort and _query(u).get("name", "").lower() == name.lower()
            url = self._own(after, owned, "Reddit feed cursor must target the configured subreddit endpoint")
            accept = PARTIAL_HTML
        elif after:
            url = _with_query(f"{COMMUNITY_MORE_PREFIX}{sort}/", {"after": after, "t": t.upper() if t else None, "name": name})
            accept = PARTIAL_HTML
        else:
            url = _with_query(f"/r/{name}/{sort}/", {"t": t.lower() if t else None})
            accept = HTML
        html, final = await self._get(url, accept, f"r/{name} feed")
        return parse_feed(html, final)

    async def post(self, subreddit: str | None, post_id: str, sort: str | None = None) -> dict[str, Any]:
        short = _short_post_id(post_id)
        path = f"/r/{subreddit_name(subreddit)}/comments/{short}/" if subreddit else f"/comments/{short}/"
        if sort is not None and sort.lower() not in COMMENT_SORTS:
            raise ValueError(f"Unsupported Reddit comment sort: {sort}")
        url = _with_query(path, {"sort": sort.lower() if sort else None})
        html, final = await self._get(url, HTML, f"post {short}")
        return parse_post(html, final)

    async def more_comments(
        self,
        subreddit: str,
        post_id: str,
        cursor: str | None = None,
        sort: str | None = None,
        starting_depth: int | None = None,
        parent_positions: list[int] | str | None = None,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        name = subreddit_name(subreddit)
        fullname = "t3_" + _short_post_id(post_id)
        query: dict[str, Any] = dict(params or {})
        if sort is not None:
            query["sort"] = sort.upper()
        if starting_depth is not None:
            query["startingDepth"] = starting_depth
        if parent_positions is not None:
            query["commentParentPositions"] = parent_positions if isinstance(parent_positions, str) else ",".join(str(p) for p in parent_positions)
        url = _with_query(f"/svc/shreddit/more-comments/r/{name}/{fullname}", query)
        body: dict[str, Any] = {"csrf_token": await self.session.csrf_token()}
        if cursor:
            body = {"cursor": cursor, **body}
        response = await self.transport.request(
            "POST",
            url,
            headers={
                "Accept": PARTIAL_HTML,
                "Content-Type": "application/x-www-form-urlencoded",
                "Origin": ORIGIN,
                "Referer": f"{ORIGIN}/r/{name}/comments/{fullname[3:]}/",
            },
            data=body,
        )
        raise_for(response, f"more comments {fullname}")
        return parse_comments(response.text, str(getattr(response, "url", "") or url))

    async def follow(self, more: dict[str, Any]) -> dict[str, Any]:
        return await self.more_comments(more["subreddit"], more["postId"], more.get("cursor"), params=more.get("params"))

    async def flairs(self, subreddit: str) -> list[dict[str, str]]:
        name = subreddit_name(subreddit)
        url = f"{ORIGIN}/r/{name}/api/link_flair_v2.json"
        text, final = await self._get(url, JSON_ACCEPT, f"r/{name} flairs", referer=f"{ORIGIN}/r/{name}/submit/?type=TEXT")
        return parse_flairs(text, final)

    async def search(self, query: str, kind: str = "posts", after: str | None = None) -> dict[str, Any]:
        q = _normalized_query(query)
        if kind not in SEARCH_KINDS:
            raise ValueError(f"Unsupported Reddit search kind: {kind}")
        if after and _is_url(after):
            def owned(u: str) -> bool:
                found = _query(u)
                return urlsplit(u).path == SEARCH_PARTIAL_PATH and found.get("q") == q and found.get("type") == kind and "cursor" in found
            url = self._own(after, owned, "Reddit search cursor must target the configured search endpoint")
            accept = PARTIAL_HTML
        elif after:
            url = _with_query(SEARCH_PARTIAL_PATH, {"q": q, "type": kind, "cursor": after})
            accept = PARTIAL_HTML
        else:
            url = _with_query(SEARCH_PATH, {"q": q, "type": kind})
            accept = HTML
        html, final = await self._get(url, accept, f"search {q!r}")
        return {"kind": kind, **parse_search(html, final)}

    async def typeahead(self, query: str) -> dict[str, Any]:
        url = _with_query(TYPEAHEAD_PATH, {"query": _normalized_query(query), "recentSearchesCount": 0})
        html, final = await self._get(url, PARTIAL_HTML, "search typeahead")
        return parse_typeahead(html, final)
