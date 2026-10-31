from __future__ import annotations

import base64
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any

from .errors import RedditError
from .session import Session
from .transport import GQL_FED, Transport

HASHES_FILE = Path(__file__).parent / "gql_hashes.json"
CURSOR_PREFIX = "gql:"
TOP_LEVEL_COUNT = 100
MAX_DEPTH = 8
MEDIA_REF_RE = re.compile(r"!\[([^\]]*)\]\(([A-Za-z0-9]+)\)")


def hashes() -> dict[str, str]:
    return json.loads(HASHES_FILE.read_text(encoding="utf-8"))


def encode_cursor(cursor: str) -> str:
    return CURSOR_PREFIX + base64.urlsafe_b64encode(cursor.encode()).decode()


def decode_cursor(child: str) -> str:
    return base64.urlsafe_b64decode(child[len(CURSOR_PREFIX):].encode()).decode()


def epoch(iso: str | None) -> float | None:
    try:
        return datetime.fromisoformat(iso).timestamp() if iso else None
    except ValueError:
        return None


def resolve_media(content: dict[str, Any]) -> str:
    markdown = content.get("markdown") or ""
    media = content.get("richtextMedia") or []
    urls = {m.get("id"): m["url"] for m in media if m.get("url")}
    urls.update({m["id"]: f"https://www.reddit.com/link/_/video/{m['id']}/player" for m in media if m.get("__typename") == "VideoAsset" and m.get("id")})
    if not urls:
        return markdown

    def swap(m: re.Match[str]) -> str:
        url = urls.get(m.group(2))
        if not url:
            return m.group(0)
        return url if "/video/" in url else f"![{m.group(1)}]({url})"

    return MEDIA_REF_RE.sub(swap, markdown)


def comment_of(n: dict[str, Any], depth: int) -> dict[str, Any]:
    author = n.get("authorInfo") or {}
    flair = n.get("authorFlair") or {}
    vote = n.get("voteState")
    return {
        "id": n["id"].removeprefix("t1_"),
        "author": author.get("name") or "[deleted]",
        "authorId": author.get("id"),
        "body": resolve_media(n.get("content") or {}),
        "score": n.get("score") or 0,
        "likes": True if vote == "UPVOTE" else False if vote == "DOWNVOTE" else None,
        "created_utc": epoch(n.get("createdAt")) or 0,
        "edited_utc": epoch(n.get("editedAt")),
        "depth": depth,
        "replies": [],
        "distinguished": (n.get("distinguishedAs") or "").lower() or None,
        "is_submitter": bool(n.get("isOP")),
        "stickied": bool(n.get("isStickied")),
        "author_flair_text": flair.get("text") or "",
    }


def tree_of(data: dict[str, Any]) -> list[dict[str, Any]]:
    by_id: dict[str, dict[str, Any]] = {}
    roots: list[dict[str, Any]] = []
    for entry in data["data"]["postInfoById"]["commentForest"]["trees"]:
        node, more = entry.get("node"), entry.get("more")
        parent = by_id.get((entry.get("parentId") or "").removeprefix("t1_"))
        siblings = parent["replies"] if parent else roots
        if node and node.get("__typename") == "Comment":
            c = comment_of(node, entry.get("depth", 0))
            by_id[c["id"]] = c
            siblings.append(c)
        elif more and more.get("cursor"):
            siblings.append({"kind": "more", "id": entry.get("parentId") or "top", "children": [encode_cursor(more["cursor"])], "count": more.get("count", 0), "depth": entry.get("depth", 0)})
    return roots


class Gql:
    def __init__(self, transport: Transport, session: Session) -> None:
        self.transport = transport
        self.session = session

    async def persisted(self, operation: str, variables: dict[str, Any], timeout: float = 15) -> dict[str, Any]:
        sha = hashes().get(operation)
        if not sha:
            raise RedditError(f"no persisted-query hash for {operation} in gql_hashes.json", 500)
        body = {"operationName": operation, "variables": variables, "extensions": {"persistedQuery": {"version": 1, "sha256Hash": sha}}}
        for attempt in range(2):
            token = await self.session.access_token()
            response = await self.transport.request("POST", GQL_FED, headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"}, json=body, timeout=timeout)
            if response.status_code == 401 and attempt == 0:
                self.session.forget_token()
                continue
            data = response.json() if response.status_code == 200 else {}
            if data.get("errors") or response.status_code != 200:
                message = ((data.get("errors") or [{}])[0] or {}).get("message")
                raise RedditError(f"gql {operation}: HTTP {response.status_code} {message or ''}".strip(), response.status_code, data)
            return data
        raise RedditError(f"gql {operation}: Reddit rejected the token", 401)

    async def post_comments(self, post_id: str, sort: str = "confidence", after: str | None = None, comment_id: str | None = None) -> list[dict[str, Any]]:
        variables: dict[str, Any] = {"id": f"t3_{post_id}", "sortType": sort.upper(), "count": TOP_LEVEL_COUNT, "maxDepth": MAX_DEPTH, "includePremiumAvatarTreatment": False, "includeConsistencyToken": False}
        if after:
            variables["after"] = after
        if comment_id:
            variables["focusedCommentContext"] = {"commentId": f"t1_{comment_id}", "isFocusedThreadOnly": True}
        data = await self.persisted("PostComments", variables)
        if not (data.get("data") or {}).get("postInfoById"):
            raise RedditError(f"gql PostComments: no post {post_id}", 404, data)
        return tree_of(data)
