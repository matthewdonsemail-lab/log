import asyncio
import base64
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest

from rdvwr.actions import Actions
from rdvwr.errors import NotLoggedIn, RateLimited, Refused
from rdvwr.reads import Reads
from rdvwr.session import Session, jwt_exp
from rdvwr.transport import IMPERSONATE, Transport


def token(exp):
    payload = base64.urlsafe_b64encode(json.dumps({"exp": exp}).encode()).decode().rstrip("=")
    return f"h.{payload}.s"


class Answer:
    def __init__(self, status=200, body=None, headers=None):
        self.status_code = status
        self.body = body
        self.headers = headers or {}

    def json(self):
        if self.body is None:
            raise ValueError("no body")
        return self.body


class FakeTransport:
    def __init__(self, answers, jar=None, on_home=None):
        self.answers = list(answers)
        self.jar = dict(jar or {})
        self.calls = []
        self.on_home = on_home or {}

    async def request(self, method, url, **kwargs):
        self.calls.append((method, url, kwargs))
        if url == "/" and self.on_home:
            self.jar.update(self.on_home)
        return self.answers.pop(0)

    def cookie(self, name):
        return self.jar.get(name)

    def drop_cookie(self, name):
        self.jar.pop(name, None)


def run(coro):
    return asyncio.run(coro)


def test_jwt_exp_reads_the_token_expiry():
    assert jwt_exp(token(2_000_000_000)) == 2_000_000_000


def test_whoami_is_none_when_reddit_says_401():
    session = Session(FakeTransport([Answer(401)]))
    assert run(session.whoami()) is None


def test_whoami_returns_the_account():
    session = Session(FakeTransport([Answer(200, {"data": {"name": "someone", "id": "abc"}})]))
    assert run(session.whoami())["name"] == "someone"


def test_access_token_mints_a_fresh_token_v2_from_the_home_page():
    fresh = token(4_000_000_000)
    transport = FakeTransport([Answer(200)], jar={"reddit_session": "s", "token_v2": token(1)}, on_home={"token_v2": fresh})
    assert run(Session(transport).access_token()) == fresh
    assert transport.calls[0][1] == "/"


def test_a_still_valid_token_v2_is_used_without_a_request():
    held = token(4_000_000_000)
    transport = FakeTransport([], jar={"token_v2": held})
    assert run(Session(transport).access_token()) == held
    assert transport.calls == []


def test_no_token_v2_means_the_session_is_dead():
    transport = FakeTransport([Answer(200)], jar={"reddit_session": "s"})
    with pytest.raises(NotLoggedIn):
        run(Session(transport).access_token())


def test_reads_retry_once_with_a_fresh_token_after_a_401():
    held = token(4_000_000_000)
    transport = FakeTransport([Answer(401), Answer(200, {"kind": "Listing"})], jar={"token_v2": held})
    out = run(Reads(transport, Session(transport)).feed("best"))
    assert out == {"kind": "Listing"}
    assert [c[1] for c in transport.calls] == ["https://oauth.reddit.com/best", "https://oauth.reddit.com/best"]
    assert transport.calls[0][2]["headers"]["Authorization"] == f"Bearer {held}"


def test_reads_say_rate_limited():
    transport = FakeTransport([Answer(429, headers={"retry-after": "7"})], jar={"token_v2": token(4_000_000_000)})
    with pytest.raises(RateLimited) as caught:
        run(Reads(transport, Session(transport)).search("junk removal"))
    assert caught.value.retry_after == 7.0


def test_an_action_reddit_refuses_raises_refused():
    transport = FakeTransport([Answer(200, {"json": {"errors": [["RATELIMIT", "you are doing that too much", "ratelimit"]]}})], jar={"token_v2": token(4_000_000_000)})
    session = Session(transport)
    with pytest.raises(Refused, match="too much"):
        run(Actions(transport, session, Reads(transport, session)).vote("t3_abc", 1))
    assert transport.calls[0][2]["data"] == {"id": "t3_abc", "dir": 1, "api_type": "json", "raw_json": 1}


def test_the_transport_is_one_pinned_curl_cffi_session_that_follows_no_redirects():
    async def build():
        t = Transport({"reddit_session": "s", "loid": "l"})
        try:
            return t.http.impersonate, t.http.allow_redirects, t.cookie("reddit_session"), t.refreshed()
        finally:
            await t.close()

    impersonate, redirects, held, refreshed = run(build())
    assert impersonate == IMPERSONATE == "chrome131"
    assert redirects is False
    assert held == "s"
    assert refreshed == {}


def test_the_transport_reports_cookies_reddit_rotated():
    async def rotate():
        t = Transport({"reddit_session": "old"})
        try:
            t.http.cookies.set("reddit_session", "new", domain=".reddit.com")
            return t.refreshed()
        finally:
            await t.close()

    assert run(rotate()) == {"reddit_session": "new"}
