from __future__ import annotations

from typing import Any

from .errors import NotLoggedIn, raise_for
from .session import Session
from .transport import OAUTH, Transport

FEED_SORTS = ("best", "hot", "new", "top", "rising", "controversial")
TIME_SORTS = ("top", "controversial")


def with_time(params: dict[str, Any], sort: str, t: str | None) -> dict[str, Any]:
    if t and sort in TIME_SORTS:
        params["t"] = t
    return params


class Reads:
    def __init__(self, transport: Transport, session: Session) -> None:
        self.transport = transport
        self.session = session

    async def get(self, path: str, params: dict[str, Any] | None = None, what: str = "read") -> Any:
        for attempt in range(2):
            token = await self.session.access_token()
            response = await self.transport.request(
                "GET",
                OAUTH + path,
                params={"raw_json": 1, **{k: v for k, v in (params or {}).items() if v not in (None, "")}},
                headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
            )
            if response.status_code == 401 and attempt == 0:
                self.session.forget_token()
                continue
            if response.status_code == 401:
                raise NotLoggedIn(f"{what}: Reddit rejected the account's token")
            raise_for(response, what)
            return response.json()
        return None

    async def feed(self, sort: str = "best", subreddit: str | None = None, after: str | None = None, limit: int = 25, t: str | None = None) -> Any:
        path = f"/r/{subreddit}/{sort}" if subreddit else f"/{sort}"
        return await self.get(path, with_time({"after": after, "limit": limit}, sort, t), f"feed {path}")

    async def comments(self, post_id: str, sort: str = "confidence", subreddit: str | None = None, comment: str | None = None, limit: int = 200, depth: int | None = None) -> Any:
        base = f"/r/{subreddit}/comments/{post_id}" if subreddit else f"/comments/{post_id}"
        path = f"{base}/_/{comment}" if comment else base
        return await self.get(path, {"sort": sort, "limit": limit, "depth": depth}, f"comments {post_id}")

    async def more_children(self, link_id: str, children: list[str], sort: str = "confidence") -> Any:
        return await self.get("/api/morechildren", {"link_id": link_id, "children": ",".join(children), "sort": sort, "api_type": "json"}, f"more comments {link_id}")

    async def search(self, query: str, kind: str = "link", subreddit: str | None = None, sort: str = "relevance", after: str | None = None, limit: int = 25, t: str | None = None) -> Any:
        path = f"/r/{subreddit}/search" if subreddit else "/search"
        params = {"q": query, "type": kind, "sort": sort, "after": after, "limit": limit, "restrict_sr": "on" if subreddit else None}
        return await self.get(path, with_time(params, "top", t), f"search {query!r}")

    async def user_about(self, name: str) -> Any:
        return await self.get(f"/user/{name}/about", None, f"user {name}")

    async def user_listing(self, name: str, where: str = "overview", sort: str = "new", after: str | None = None, limit: int = 25, t: str | None = None) -> Any:
        return await self.get(f"/user/{name}/{where}", with_time({"sort": sort, "after": after, "limit": limit}, sort, t), f"user {name} {where}")

    async def trophies(self, name: str) -> Any:
        return await self.get(f"/api/v1/user/{name}/trophies", None, f"trophies {name}")

    async def subreddit_about(self, name: str) -> Any:
        return await self.get(f"/r/{name}/about", None, f"r/{name} about")

    async def subreddit_rules(self, name: str) -> Any:
        return await self.get(f"/r/{name}/about/rules", None, f"r/{name} rules")

    async def post_requirements(self, name: str) -> Any:
        return await self.get(f"/api/v1/{name}/post_requirements", None, f"r/{name} post requirements")

    async def link_flairs(self, name: str) -> Any:
        return await self.get(f"/r/{name}/api/link_flair_v2", None, f"r/{name} flairs")

    async def info(self, fullnames: list[str]) -> Any:
        return await self.get("/api/info", {"id": ",".join(fullnames)}, "info")

    async def subscriptions(self, after: str | None = None, limit: int = 100) -> Any:
        return await self.get("/subreddits/mine/subscriber", {"after": after, "limit": limit}, "subscriptions")

    async def subreddit_autocomplete(self, query: str, limit: int = 10) -> Any:
        return await self.get("/api/subreddit_autocomplete_v2", {"query": query, "limit": limit, "include_over_18": "true"}, "subreddit autocomplete")
