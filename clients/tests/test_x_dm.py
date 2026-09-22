import argparse
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import listeningkit_ingest as ingest  # noqa: E402
import x_dm  # noqa: E402
from x_browser import AccountLocked, TooManyRequests, Unauthorized  # noqa: E402


def args(**over):
    base = dict(endpoint="https://e/ingest", key="k", dry_run=False, interval=0, show=False)
    base.update(over)
    return argparse.Namespace(**base)


class FakeClient:
    def __init__(self, threads=None, sent_id="s1", send_error=None):
        self.threads = threads or []
        self.sent_id = sent_id
        self.send_error = send_error
        self.sent: list[tuple[str, str]] = []

    async def list_dm_threads(self, limit=15):
        if isinstance(self.threads, Exception):
            raise self.threads
        return self.threads

    async def send_dm(self, peer_handle, text):
        self.sent.append((peer_handle, text))
        if self.send_error:
            raise self.send_error
        return self.sent_id


CONVO = [{"peerHandle": "needhelp99", "peerName": "Need Help", "messages": [{"externalId": "m1", "text": "hi", "sentAt": 1}]}]
PENDING = [{"id": "msg1", "threadId": "t1", "peerHandle": "needhelp99", "text": "sure, what do you need?", "sentAt": 2}]


@pytest.mark.asyncio
async def test_reads_and_pushes_new_conversations(monkeypatch):
    pushed = []
    monkeypatch.setattr(x_dm, "push_dms", lambda platform, threads, **kw: pushed.append((platform, threads)) or {"threadsSeen": 1, "messagesAdded": 1})
    monkeypatch.setattr(x_dm, "fetch_pending_dms", lambda platform, **kw: [])
    client = FakeClient(threads=CONVO)
    status = await x_dm.one_round(args(), client)
    assert status == 0
    assert pushed == [("x", CONVO)]


@pytest.mark.asyncio
async def test_dry_run_never_pushes_or_sends(monkeypatch):
    monkeypatch.setattr(x_dm, "push_dms", lambda *a, **kw: pytest.fail("must not push in --dry-run"))
    monkeypatch.setattr(x_dm, "fetch_pending_dms", lambda *a, **kw: pytest.fail("must not check pending in --dry-run"))
    client = FakeClient(threads=CONVO)
    status = await x_dm.one_round(args(dry_run=True), client)
    assert status == 0


@pytest.mark.asyncio
async def test_sends_a_queued_message_and_reports_it(monkeypatch):
    reported = []
    monkeypatch.setattr(x_dm, "push_dms", lambda *a, **kw: {"threadsSeen": 0, "messagesAdded": 0})
    monkeypatch.setattr(x_dm, "fetch_pending_dms", lambda *a, **kw: PENDING)
    monkeypatch.setattr(x_dm, "report_dm_sent", lambda message_id, external_id, **kw: reported.append(("sent", message_id, external_id)))
    monkeypatch.setattr(x_dm, "report_dm_failed", lambda message_id, error, **kw: reported.append(("failed", message_id, error)))
    client = FakeClient(threads=[], sent_id="ext-1")
    status = await x_dm.one_round(args(), client)
    assert status == 0
    assert client.sent == [("needhelp99", "sure, what do you need?")]
    assert reported == [("sent", "msg1", "ext-1")]


@pytest.mark.asyncio
async def test_a_failed_send_is_reported_not_swallowed(monkeypatch):
    reported = []
    monkeypatch.setattr(x_dm, "push_dms", lambda *a, **kw: {"threadsSeen": 0, "messagesAdded": 0})
    monkeypatch.setattr(x_dm, "fetch_pending_dms", lambda *a, **kw: PENDING)
    monkeypatch.setattr(x_dm, "report_dm_sent", lambda *a, **kw: pytest.fail("must not report sent"))
    monkeypatch.setattr(x_dm, "report_dm_failed", lambda message_id, error, **kw: reported.append((message_id, error)))
    client = FakeClient(threads=[], send_error=RuntimeError("X did not offer @needhelp99 to message"))
    status = await x_dm.one_round(args(), client)
    assert status == 0
    assert reported == [("msg1", "X did not offer @needhelp99 to message")]


@pytest.mark.asyncio
async def test_a_refused_login_stops_the_round(monkeypatch):
    monkeypatch.setattr(x_dm, "push_dms", lambda *a, **kw: pytest.fail("must not push"))
    client = FakeClient(threads=Unauthorized("login wall"))
    status = await x_dm.one_round(args(), client)
    assert status == 1


@pytest.mark.asyncio
async def test_a_locked_account_stops_the_round(monkeypatch):
    client = FakeClient(threads=AccountLocked("checkpoint"))
    status = await x_dm.one_round(args(), client)
    assert status == 1


@pytest.mark.asyncio
async def test_a_rate_limit_reads_nothing_but_still_checks_pending(monkeypatch):
    monkeypatch.setattr(x_dm, "fetch_pending_dms", lambda *a, **kw: [])
    client = FakeClient(threads=TooManyRequests("slow down"))
    status = await x_dm.one_round(args(), client)
    assert status == 0


def test_cookie_dict_needs_the_x_auth_cookies():
    with pytest.raises(ingest.SessionError):
        x_dm.cookie_dict([{"domain": "x.com", "name": "ct0", "value": "a"}])
    cookies = x_dm.cookie_dict([
        {"domain": ".x.com", "name": "auth_token", "value": "a"},
        {"domain": ".x.com", "name": "ct0", "value": "b"},
        {"domain": "facebook.com", "name": "c_user", "value": "ignored"},
    ])
    assert cookies == {"auth_token": "a", "ct0": "b"}


def test_main_requires_endpoint_and_key(monkeypatch, capsys):
    monkeypatch.delenv("LISTENINGKIT_INGEST_URL", raising=False)
    monkeypatch.delenv("LISTENINGKIT_INGEST_KEY", raising=False)
    with pytest.raises(SystemExit):
        x_dm.main([])
