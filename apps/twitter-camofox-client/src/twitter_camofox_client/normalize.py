"""Normalize a twikit Tweet -> the same NormalizedPostRecord shape used by
reddit-camofox-client / facebook-camofox-client, so the frontend adapter
in apps/web/src/lib/feed/remote.ts can treat all three platforms alike.
"""
from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any


def normalize_tweet(tweet: Any) -> dict:
    user = getattr(tweet, "user", None)
    occurred_at = None
    created = getattr(tweet, "created_at_datetime", None)
    if isinstance(created, datetime):
        occurred_at = created.astimezone(UTC).isoformat()

    return {
        "record_id": f"rec-{uuid.uuid4().hex[:12]}",
        "record_type": "tweet",
        "external_id": str(getattr(tweet, "id", "")),
        "source": "tweets.listen",
        "content": getattr(tweet, "full_text", "") or getattr(tweet, "text", "") or "",
        "url": f"https://x.com/{getattr(user, 'screen_name', 'i')}/status/{getattr(tweet, 'id', '')}",
        "author": {
            "id": str(getattr(user, "id", "")) if user else "",
            "name": getattr(user, "name", "") if user else "",
            "handle": getattr(user, "screen_name", "") if user else "",
        },
        "occurred_at": occurred_at,
        "metrics": {
            "likes": getattr(tweet, "favorite_count", 0) or 0,
            "retweets": getattr(tweet, "retweet_count", 0) or 0,
            "replies": getattr(tweet, "reply_count", 0) or 0,
            "views": getattr(tweet, "view_count", None),
        },
        "raw_extraction": None,
    }
