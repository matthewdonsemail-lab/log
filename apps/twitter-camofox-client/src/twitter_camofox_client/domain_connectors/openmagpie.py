"""Adapter to wire twikit search into OpenMagpie (Reddit/Facebook parity).

Same surface as ``RedditCamofoxConnector`` and
``FacebookCamofoxConnector`` so one poll loop drives all three:

    connector = TwitterCamofoxConnector(commit=convex_commit)
    async for rec in connector.poll({"account_id": "x1", "query": "plumber", "limit": 25}):
        ...

Spec keys: ``account_id`` (default ``"default"``), ``query``
(default ``"from:home"``), ``limit`` (default 25), ``cookies``
(twikit dict; falls back to ``TWIKIT_COOKIES_FILE`` like the REST
service). ``session_manager`` / ``normalizer`` are accepted for
signature parity and otherwise unused: twikit needs no Camofox
session and ``normalize_tweet`` is the normalizer.

Ordering matches the sibling clients: ``commit`` runs for every new
record BEFORE the cursor saves, ``posts.new`` emits only after the
cursor is durable.
"""
from __future__ import annotations

import os
from collections.abc import AsyncIterator, Awaitable, Callable
from datetime import UTC, datetime
from types import SimpleNamespace
from typing import Any, ClassVar


def _parse_occurred(value: Any) -> datetime | None:
    if not value:
        return None
    if isinstance(value, datetime):
        return value
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None


def _cursor_state(cursor: Any) -> tuple[Any | None, Any | None]:
    if cursor is None:
        return None, None
    if isinstance(cursor, dict):
        return cursor.get("watermark"), cursor.get("last_post_id")
    return getattr(cursor, "watermark", None), getattr(cursor, "last_post_id", None)


class _NoopEmitter:
    async def emit(self, *args: Any, **kwargs: Any) -> None:
        return None


async def _default_commit(_: dict[str, Any]) -> bool:
    return True


CommitCallback = Callable[[dict[str, Any]], Awaitable[bool]]


class TwitterCamofoxConnector:
    kind: ClassVar[str] = "x_search"
    CURSOR_KEY: ClassVar[str] = "tweets-listen"

    def __init__(
        self,
        session_manager: Any | None = None,
        cursor_repo: Any | None = None,
        emitter: Any | None = None,
        normalizer: Any | None = None,
        commit: CommitCallback | None = None,
    ) -> None:
        # session_manager/normalizer kept for Reddit/Facebook signature parity.
        self.session_manager = session_manager
        self.cursor_repo = cursor_repo or {}
        self.emitter = emitter or _NoopEmitter()
        self.normalizer = normalizer
        self.commit = commit or _default_commit

    async def _load_cursor(self, account_id: str, scope_key: str) -> Any | None:
        repo = self.cursor_repo
        if isinstance(repo, dict):
            return repo.get(f"{account_id}:{self.CURSOR_KEY}:{scope_key}")
        try:
            return await repo.load(self.CURSOR_KEY, account_id, scope_key)
        except Exception:
            return None

    async def _save_cursor(
        self, account_id: str, scope_key: str, last_post_id: str, watermark: Any | None
    ) -> None:
        repo = self.cursor_repo
        if isinstance(repo, dict):
            repo[f"{account_id}:{self.CURSOR_KEY}:{scope_key}"] = {
                "watermark": watermark,
                "last_post_id": last_post_id,
            }
            return
        cursor = SimpleNamespace(
            cursor_key=self.CURSOR_KEY,
            action_type="tweets.listen",
            account_id=account_id,
            scope_key=scope_key,
            last_post_id=last_post_id,
            watermark=watermark,
            opaque_cursor="",
            updated_at=datetime.now(UTC),
        )
        try:
            await repo.save(cursor)
        except Exception:
            pass

    async def _emit(self, event_type: str, payload: dict, dedupe_key: str) -> None:
        try:
            await self.emitter.emit(event_type, payload, dedupe_key=dedupe_key)
        except Exception:
            pass

    async def poll(self, spec: dict, since: datetime | None = None) -> AsyncIterator[dict]:
        from twikit import Client

        from twitter_camofox_client.normalize import normalize_tweet

        account_id = spec.get("account_id", "default")
        query = spec.get("query", "from:home")
        limit = int(spec.get("limit", 25))
        cookies = spec.get("cookies")
        scope_key = str(query)
        action_id = f"poll-{datetime.now(UTC).timestamp()}"

        client = Client("en-US")
        if cookies:
            client.set_cookies(cookies)
        elif os.getenv("TWIKIT_COOKIES_FILE"):
            client.load_cookies(os.getenv("TWIKIT_COOKIES_FILE", ""))

        try:
            tweets = await client.search_tweet(query, product="Latest", count=limit)
        except Exception as exc:
            await self._emit(
                "tweets.listen_failed",
                {"action_id": action_id, "reason": str(exc)},
                dedupe_key=f"{action_id}-failed",
            )
            return

        cursor = await self._load_cursor(account_id, scope_key)
        watermark, last_post_id = _cursor_state(cursor)
        if since is not None and (watermark is None or since > watermark):
            watermark = since

        new_records: list[dict] = []
        newest_watermark = watermark
        newest_post_id = last_post_id
        for tweet in tweets or []:
            try:
                rec = normalize_tweet(tweet)
            except Exception:
                continue
            post_id = str(rec.get("external_id", ""))
            created_at = _parse_occurred(rec.get("occurred_at"))
            if post_id and post_id == last_post_id:
                continue
            if watermark is not None and created_at is not None and created_at <= watermark:
                continue
            if self.normalizer is not None and callable(self.normalizer):
                try:
                    rec = self.normalizer(rec)
                except Exception:
                    pass
            new_records.append(rec)
            if created_at is not None and (newest_watermark is None or created_at > newest_watermark):
                newest_watermark = created_at
                newest_post_id = post_id

        for rec in new_records:
            try:
                await self.commit(rec)
            except Exception:
                pass

        if new_records and (newest_watermark != watermark or newest_post_id != last_post_id):
            await self._save_cursor(account_id, scope_key, newest_post_id or "", newest_watermark)

        for rec in new_records:
            await self._emit(
                "posts.new",
                {"action_id": action_id, **rec},
                dedupe_key=f"x:{rec.get('external_id', rec.get('record_id', ''))}",
            )
            yield rec

        await self._emit(
            "tweets.listen_completed",
            {"action_id": action_id, "new_count": len(new_records)},
            dedupe_key=f"{action_id}-completed",
        )

    async def listen(self, spec: dict) -> AsyncIterator[dict]:
        async for record in self.poll(spec):
            yield record
