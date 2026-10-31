from __future__ import annotations

from typing import Any

from .actions import Actions
from .errors import NotLoggedIn
from .gql import Gql
from .reads import Reads
from .session import Session
from .shreddit import Shreddit
from .state import AUTHENTICATED_COOKIE, RedditSessionState
from .transport import Transport


class RedditClient:
    def __init__(self, cookies: dict[str, str], proxy: str | None = None, timeout: float = 20.0, username: str | None = None) -> None:
        self.transport = Transport(cookies, proxy=proxy, timeout=timeout)
        self.session = Session(self.transport)
        self.reads = Reads(self.transport, self.session)
        self.actions = Actions(self.transport, self.session, self.reads, username)
        self.gql = Gql(self.transport, self.session)
        self.shreddit = Shreddit(self.transport, self.session)
        self.username = username
        self.origin: str | None = None
        self.browser: str | None = None
        self.os: str | None = None

    @classmethod
    def from_state(cls, state: Any, proxy: str | None = None, timeout: float = 20.0) -> "RedditClient":
        snapshot = RedditSessionState.from_(state)
        client = cls({}, proxy=proxy, timeout=timeout, username=snapshot.username or None)
        client.transport.restore(snapshot.cookies, snapshot.origin)
        client.origin, client.browser, client.os = snapshot.origin, snapshot.browser, snapshot.os
        return client

    @classmethod
    async def resume(cls, state: Any, proxy: str | None = None, timeout: float = 20.0) -> "RedditClient":
        client = cls.from_state(state, proxy=proxy, timeout=timeout)
        try:
            if client.transport.cookie(AUTHENTICATED_COOKIE) is None:
                raise NotLoggedIn("Reddit session does not contain an authentication cookie")
            me = await client.session.whoami()
            if not me:
                raise NotLoggedIn("Reddit returned no account for this session")
            client.username = client.actions.username = me["name"]
            return client
        except BaseException:
            await client.close()
            raise

    def export_session(self, username: str | None = None) -> RedditSessionState:
        return RedditSessionState.from_cookies(
            self.transport.cookie_records(),
            username=username or self.username,
            origin=self.origin,
            browser=self.browser,
            os=self.os,
        )

    async def verify_authenticated(self) -> bool:
        if self.transport.cookie(AUTHENTICATED_COOKIE) is None:
            return False
        return bool(await self.session.whoami())

    async def __aenter__(self) -> "RedditClient":
        return self

    async def __aexit__(self, *_: Any) -> None:
        await self.close()

    async def close(self) -> None:
        await self.transport.close()

    async def check(self) -> dict[str, Any]:
        me = await self.session.whoami()
        if not me:
            return {"loggedIn": False}
        self.username = me["name"]
        self.actions.username = me["name"]
        await self.session.access_token()
        return {
            "loggedIn": True,
            "name": me.get("name"),
            "id": me.get("id"),
            "linkKarma": me.get("link_karma"),
            "commentKarma": me.get("comment_karma"),
            "created": me.get("created_utc"),
            "suspended": bool(me.get("is_suspended")),
            "verifiedEmail": me.get("has_verified_email"),
            "inboxCount": me.get("inbox_count"),
        }

    def refreshed_cookies(self) -> dict[str, str]:
        return self.transport.refreshed()
