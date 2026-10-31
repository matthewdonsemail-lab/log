from __future__ import annotations

from typing import Any


class RedditError(Exception):
    def __init__(self, message: str, status: int = 502, body: Any = None) -> None:
        super().__init__(message)
        self.status = status
        self.body = body


class NotLoggedIn(RedditError):
    def __init__(self, message: str = "Reddit no longer accepts this session", status: int = 401) -> None:
        super().__init__(message, status)


class Forbidden(RedditError):
    pass


class RateLimited(RedditError):
    def __init__(self, message: str, retry_after: float | None = None) -> None:
        super().__init__(message, 429)
        self.retry_after = retry_after


class Refused(RedditError):
    pass


class ChallengeRequired(RedditError):
    def __init__(self, message: str, challenge: Any = None) -> None:
        super().__init__(message, 403)
        self.challenge = challenge


def raise_for(response: Any, what: str) -> None:
    status = response.status_code
    if 200 <= status < 300:
        return
    if status == 401:
        raise NotLoggedIn(f"{what}: Reddit answered 401")
    if status == 403:
        raise Forbidden(f"{what}: Reddit answered 403", 403)
    if status == 429:
        retry = response.headers.get("retry-after")
        raise RateLimited(f"{what}: Reddit is rate limiting", float(retry) if retry and retry.replace(".", "", 1).isdigit() else None)
    raise RedditError(f"{what}: Reddit answered HTTP {status}", status)
