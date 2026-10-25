import asyncio
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest

from rdvwr.client import RedditClient
from rdvwr.errors import NotLoggedIn
from rdvwr.session import Session
from rdvwr.transport import Transport
from rdvwr.state import (
    AUTHENTICATED_COOKIE,
    SNAPSHOT_VERSION,
    RedditSessionState,
    SessionStateError,
)

FUTURE_S = time.time() + 86_400
PAST_S = time.time() - 86_400


def names(state):
    return [cookie.name for cookie in state.cookies]


def test_cookie_header_imports_name_value_pairs():
    state = RedditSessionState.from_("reddit_session=abc; token_v2=def", username="someone")
    assert state.cookie_map() == {"reddit_session": "abc", "token_v2": "def"}


def test_name_value_map_imports():
    state = RedditSessionState.from_({"reddit_session": "abc"}, username="someone")
    assert state.cookie_map() == {"reddit_session": "abc"}


def test_chrome_playwright_export_imports_and_filters_expired():
    export = [
        {"name": "reddit_session", "value": "live", "domain": ".reddit.com", "expirationDate": FUTURE_S, "sameSite": "no_restriction", "secure": True},
        {"name": "dead", "value": "x", "expirationDate": PAST_S},
    ]
    state = RedditSessionState.from_(export, username="someone")
    assert names(state) == ["reddit_session"]
    cookie = state.cookies[0]
    assert cookie.same_site == "none"
    assert cookie.secure is True
    assert cookie.expires_at_ms == pytest.approx(FUTURE_S * 1000)


def test_firefox_raw_export_imports():
    export = [
        {"Name raw": "reddit_session", "Content raw": "live", "Host raw": "www.reddit.com", "Expires raw": str(int(FUTURE_S)), "This domain only raw": "false", "Send for raw": "true", "HTTP only raw": "true"},
        {"Name raw": "dead", "Content raw": "x", "Expires raw": str(int(PAST_S))},
    ]
    state = RedditSessionState.from_(export, username="someone")
    assert names(state) == ["reddit_session"]
    cookie = state.cookies[0]
    assert cookie.domain == ".www.reddit.com"
    assert cookie.secure is True
    assert cookie.http_only is True


def test_snapshot_round_trips_through_json():
    state = RedditSessionState.from_("reddit_session=abc", username="someone", browser="chrome_140", os="windows")
    blob = state.dumps()
    again = RedditSessionState.from_(blob)
    assert again.version == SNAPSHOT_VERSION
    assert again.username == "someone"
    assert again.cookie_map() == {"reddit_session": "abc"}
    assert again.origin == "https://www.reddit.com/"


def test_snapshot_detected_from_json_object_with_cookies_key():
    blob = json.dumps({"version": 1, "username": "someone", "cookies": [{"name": "reddit_session", "value": "abc"}]})
    state = RedditSessionState.from_(blob)
    assert state.username == "someone"
    assert state.cookie_map() == {"reddit_session": "abc"}


def test_unsupported_version_is_refused():
    with pytest.raises(SessionStateError):
        RedditSessionState.from_json({"version": 99, "cookies": []})


def test_invalid_cookie_name_is_refused():
    with pytest.raises(SessionStateError):
        RedditSessionState.from_cookies([{"name": "bad name", "value": "x"}], username="someone")


def test_control_character_in_value_is_refused():
    with pytest.raises(SessionStateError):
        RedditSessionState.from_cookies([{"name": "ok", "value": "a\nb"}], username="someone")


def test_to_json_requires_a_username():
    state = RedditSessionState.from_("reddit_session=abc")
    with pytest.raises(SessionStateError):
        state.to_json()


def test_origin_with_credentials_is_refused():
    with pytest.raises(SessionStateError):
        RedditSessionState.from_cookies("reddit_session=abc", username="someone", origin="https://user:pass@www.reddit.com/")


def test_cookie_header_round_trips():
    state = RedditSessionState.from_({"reddit_session": "abc", "token_v2": "def"}, username="someone")
    assert state.to_cookie_header() == "reddit_session=abc; token_v2=def"


def test_from_state_builds_a_client_with_the_restored_cookies():
    async def build():
        client = RedditClient.from_state("reddit_session=abc; token_v2=def", proxy=None)
        try:
            return client.transport.cookie("reddit_session"), client.transport.cookie("token_v2")
        finally:
            await client.close()

    assert asyncio.run(build()) == ("abc", "def")


def test_export_session_snapshots_the_live_cookies():
    async def build():
        client = RedditClient.from_state({"reddit_session": "abc"}, proxy=None)
        try:
            return client.export_session(username="someone").to_json()
        finally:
            await client.close()

    snapshot = asyncio.run(build())
    assert snapshot["username"] == "someone"
    assert snapshot["version"] == SNAPSHOT_VERSION
    assert {c["name"]: c["value"] for c in snapshot["cookies"]} == {"reddit_session": "abc"}


def test_authenticated_cookie_constant_is_reddit_session():
    assert AUTHENTICATED_COOKIE == "reddit_session"


def test_cookie_header_keeps_equals_signs_in_values():
    state = RedditSessionState.from_("reddit_session=user%2Ctime%2Csignature==; csrf_token=csrf", username="someone")
    assert [c.to_json() for c in state.cookies] == [
        {"name": "csrf_token", "value": "csrf"},
        {"name": "reddit_session", "value": "user%2Ctime%2Csignature=="},
    ]
    assert state.to_cookie_header() == "csrf_token=csrf; reddit_session=user%2Ctime%2Csignature=="


def test_browser_export_json_string_normalizes_like_the_reference():
    future = int(FUTURE_S)
    blob = json.dumps([
        {"name": "reddit_session", "value": "authenticated", "domain": ".reddit.com", "path": "/", "secure": True, "httpOnly": True, "sameSite": "Lax", "expirationDate": future},
        {"name": "expired", "value": "ignored", "expires": 1},
    ])
    state = RedditSessionState.from_(blob, username="someone")
    assert [c.to_json() for c in state.cookies] == [
        {"name": "reddit_session", "value": "authenticated", "domain": ".reddit.com", "path": "/", "expiresAtMs": future * 1000, "secure": True, "httpOnly": True, "sameSite": "lax"},
    ]


def test_firefox_export_with_zero_expiry_is_a_session_cookie():
    blob = json.dumps([
        {"Host raw": "https://.reddit.com/", "Name raw": "reddit_session", "Path raw": "/", "Content raw": "authenticated", "Expires raw": "0", "Send for raw": "true", "HTTP only raw": "true", "SameSite raw": "no_restriction", "This domain only raw": "false"},
    ])
    state = RedditSessionState.from_json(blob, username="someone")
    assert [c.to_json() for c in state.cookies] == [
        {"name": "reddit_session", "value": "authenticated", "domain": ".reddit.com", "path": "/", "secure": True, "httpOnly": True, "sameSite": "none"},
    ]


def test_snapshot_to_json_round_trips_exactly():
    original = RedditSessionState.from_cookies({"reddit_session": "authenticated", "csrf_token": "csrf"}, username="someone")
    restored = RedditSessionState.from_json(original.dumps())
    assert restored.to_json() == original.to_json()


def test_options_override_snapshot_metadata():
    blob = RedditSessionState.from_("reddit_session=abc", username="someone").dumps()
    assert RedditSessionState.from_(blob, username="other").username == "other"


@pytest.mark.parametrize("bad", ["{not json", "[1, 2]", 42, None, "nopair"])
def test_invalid_state_is_refused(bad):
    with pytest.raises(SessionStateError):
        RedditSessionState.from_(bad, username="someone")


def test_from_state_restores_domain_and_path_and_skips_other_hosts():
    export = [
        {"name": "reddit_session", "value": "abc", "domain": ".reddit.com", "path": "/"},
        {"name": "scoped", "value": "s", "domain": "www.reddit.com", "path": "/svc"},
        {"name": "elsewhere", "value": "x", "domain": ".example.com"},
    ]

    async def build():
        client = RedditClient.from_state(export, proxy=None)
        try:
            return {c.name: (c.domain, c.path) for c in client.transport.http.cookies.jar}
        finally:
            await client.close()

    jar = asyncio.run(build())
    assert jar["reddit_session"] == (".reddit.com", "/")
    assert jar["scoped"][1] == "/svc"
    assert "elsewhere" not in jar


def test_export_keeps_cookie_attributes_and_snapshot_metadata():
    future = int(FUTURE_S)
    state = RedditSessionState.from_(
        [{"name": "reddit_session", "value": "abc", "domain": ".reddit.com", "path": "/", "expirationDate": future}],
        username="someone",
        origin="https://www.reddit.com/r/test?x=1",
        browser="chrome_140",
        os="macos",
    )

    async def build():
        client = RedditClient.from_state(state, proxy=None)
        try:
            return client.export_session()
        finally:
            await client.close()

    exported = asyncio.run(build())
    assert exported.username == "someone"
    assert exported.origin == "https://www.reddit.com/"
    assert exported.os == "macos"
    cookie = exported.cookies[0]
    assert (cookie.name, cookie.value, cookie.domain, cookie.path) == ("reddit_session", "abc", ".reddit.com", "/")
    assert cookie.expires_at_ms == pytest.approx(future * 1000)


def test_restored_cookies_are_not_reported_as_refreshed():
    async def build():
        client = RedditClient.from_state("reddit_session=abc", proxy=None)
        try:
            return client.refreshed_cookies()
        finally:
            await client.close()

    assert asyncio.run(build()) == {}


class Closes:
    def __init__(self, monkeypatch, whoami):
        self.closed = 0

        async def close(transport):
            self.closed += 1
            await transport.http.close()

        async def fake_whoami(session):
            return whoami

        monkeypatch.setattr(Transport, "close", close)
        monkeypatch.setattr(Session, "whoami", fake_whoami)


def test_resume_without_the_authentication_cookie_refuses_and_closes(monkeypatch):
    closes = Closes(monkeypatch, {"name": "someone"})
    with pytest.raises(NotLoggedIn):
        asyncio.run(RedditClient.resume("csrf_token=csrf"))
    assert closes.closed == 1


def test_resume_refuses_and_closes_when_reddit_names_no_account(monkeypatch):
    closes = Closes(monkeypatch, None)
    with pytest.raises(NotLoggedIn):
        asyncio.run(RedditClient.resume("reddit_session=abc"))
    assert closes.closed == 1


def test_resume_verifies_and_takes_the_account_name(monkeypatch):
    closes = Closes(monkeypatch, {"name": "verified_user"})

    async def build():
        client = await RedditClient.resume({"reddit_session": "abc"})
        try:
            return client.username, client.actions.username, client.export_session().username
        finally:
            await client.close()

    assert asyncio.run(build()) == ("verified_user", "verified_user", "verified_user")
    assert closes.closed == 1
