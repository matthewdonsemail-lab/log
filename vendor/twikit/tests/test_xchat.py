import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from twikit import Client
from twikit.client.gql import Endpoint


def run(coroutine):
    return asyncio.run(coroutine)


def offline_client():
    client = Client(language="en-US")
    client._user_id = "100"
    return client


def conv(their_id):
    return {
        "conversation_detail": {
            "conversation_id": f"{their_id}:100",
            "participants_results": [
                {"rest_id": str(their_id)},
                {"rest_id": "100"},
            ],
        }
    }


def test_xchat_endpoints_hit_the_api_host():
    assert Endpoint.XCHAT_INITIAL_PAGE.startswith("https://api.x.com/graphql/")
    assert "GetInitialXChatPageQuery" in Endpoint.XCHAT_INITIAL_PAGE
    assert "GetInboxPageRequestQuery" in Endpoint.XCHAT_INBOX_PAGE


def test_get_xchat_conversations_pages_and_returns_counterpart_ids(monkeypatch):
    client = offline_client()
    pages = {
        None: ({"data": {"get_initial_chat_page": {"items": [conv(42)], "inboxCursor": {"cursor_id": "10", "graph_snapshot_id": "snap"}}}}, None),
        "10": ({"data": {"get_inbox_page": {"items": [conv(7)], "inboxCursor": {"cursor_id": "20", "graph_snapshot_id": "snap"}}}}, None),
        "20": ({"data": {"get_inbox_page": {"items": []}}}, None),
    }

    async def initial():
        return pages[None]

    async def inbox(cursor_id, graph_snapshot_id):
        return pages[cursor_id]

    monkeypatch.setattr(client.gql, "get_initial_xchat_page", initial)
    monkeypatch.setattr(client.gql, "get_xchat_inbox_page", inbox)

    convs = run(client.get_xchat_conversations())
    ids = {p for c in convs for p in c["participant_ids"]}
    assert ids == {"42", "7"}
    assert "100" not in ids
    assert len(convs) == 2


def test_public_keys_pick_latest_version_and_map_signing_entry():
    from twikit.xchat import juicebox_config, public_keys_of, signing_key_entry

    def entry(version, key):
        return {
            "public_key_with_metadata": {"version": version, "public_key": {"public_key": f"id{key}", "signing_public_key": f"sig{key}", "identity_public_key_signature": f"bind{key}"}},
            "token_map": {"key_store_token_map_json": "{}", "max_guess_count": 20, "token_map": [{"key": "r1", "value": {"address": "https://realm-a.x.com/", "token": "t"}}]},
        }

    response = {"data": {"user_results_by_rest_ids": [{"rest_id": "7", "result": {"get_public_keys": {"public_keys_with_token_map": [entry("1", "old"), entry("3", "new")]}}}]}}
    keys = public_keys_of(response)
    assert keys[0]["version"] == "3"
    assert signing_key_entry(keys[0]) == {"user_id": "7", "public_key_version": "3", "public_key": "signew", "identity_public_key": "idnew", "identity_public_key_signature": "bindnew"}
    assert '"address": "https://realm-a.x.com/"' in juicebox_config(keys[0]["token_map"])


def thrift_string(fid, value):
    import struct
    raw = value.encode()
    return bytes([11]) + struct.pack(">h", fid) + struct.pack(">i", len(raw)) + raw


def message_event(sequence_id, key_version):
    import base64
    create = thrift_string(101, key_version) + b"\x00"
    detail = bytes([12]) + (1).to_bytes(2, "big") + create + b"\x00"
    body = thrift_string(1, sequence_id) + thrift_string(3, "7") + thrift_string(4, "7:100") + thrift_string(6, "1793224215135") + bytes([12]) + (7).to_bytes(2, "big") + detail + b"\x00"
    return base64.b64encode(body).decode()


def test_key_version_of_reads_the_message_create_event():
    from twikit.xchat import decode_event, key_version_of
    event = message_event("2115561809398673414", "1793224215135")
    assert key_version_of(event) == "1793224215135"
    assert decode_event(event)["event_id"] == "2115561809398673414"
    assert key_version_of("not base64!") is None


def test_get_xchat_conversation_reads_one_chat_then_older_pages(monkeypatch):
    client = offline_client()
    client._xchat = object()
    client._xchat_me = "100"
    latest, older = message_event("20", "5"), message_event("10", "5")
    calls = []

    async def data(ids):
        calls.append(("data", ids))
        return {"data": {"get_inbox_page_conversation_data": {"items": [{"latest_message_events": [latest], "latest_conversation_key_change_events": []}]}}}, None

    async def page(cid, min_sequence, min_version):
        calls.append(("page", cid, min_sequence, min_version))
        return {"data": {"get_conversation_page": {"encoded_message_events": [older] if min_sequence == "20" else [], "missing_conversation_key_change_events": [], "has_more": min_sequence == "20"}}}, None

    async def decrypt(events, people):
        return {"7:100": [{"event_id": e} for e in events]}

    async def no_sleep(_):
        return None

    monkeypatch.setattr(client.gql, "get_xchat_conversation_data", data)
    monkeypatch.setattr(client.gql, "get_xchat_conversation_page", page)
    monkeypatch.setattr(client, "_xchat_decrypt", decrypt)
    monkeypatch.setattr(asyncio, "sleep", no_sleep)

    out = run(client.get_xchat_conversation("7:100", older_pages=5))
    assert calls == [("data", ["7:100"]), ("page", "7:100", "20", "5"), ("page", "7:100", "10", "5")]
    assert [m["event_id"] for m in out["messages"]] == [older, latest]
    assert out["has_more"] is False
    assert not any(c[0] == "inbox" for c in calls)


def test_get_xchat_updates_reads_from_the_newest_held_until_x_says_finished(monkeypatch):
    client = offline_client()
    first, second = message_event("21", "5"), message_event("22", "5")
    calls = []

    async def page(since):
        calls.append(since)
        if since == "20":
            return {"data": {"get_message_events_page": {"encoded_message_events": [second, first], "cursor": {"__typename": "XChatGetMessageEventsPageContinueCursor", "max_local_sequence_id": "22"}}}}, None
        return {"data": {"get_message_events_page": {"encoded_message_events": [], "cursor": {"__typename": "XChatGetMessageEventsPageEndCursor", "pull_finished": True}}}}, None

    monkeypatch.setattr(client.gql, "get_xchat_message_events_page", page)
    out = run(client.get_xchat_updates("20"))
    assert calls == ["20", "22"]
    assert out["events"] == [first, second]
    assert out["max_sequence_id"] == "22"
    assert out["finished"] is True


def test_get_xchat_updates_with_nothing_new_is_one_request(monkeypatch):
    client = offline_client()
    calls = []

    async def page(since):
        calls.append(since)
        return {"data": {"get_message_events_page": {"encoded_message_events": [], "cursor": {"__typename": "XChatGetMessageEventsPageEndCursor", "pull_finished": True}}}}, None

    monkeypatch.setattr(client.gql, "get_xchat_message_events_page", page)
    out = run(client.get_xchat_updates("30"))
    assert calls == ["30"]
    assert out == {"events": [], "max_sequence_id": "30", "pages": 1, "finished": True}


def test_open_xchat_events_reads_only_those_conversations_keys(monkeypatch):
    client = offline_client()
    client._xchat = object()
    client._xchat_me = "100"
    event, key = message_event("40", "5"), "keyChange"
    asked = []

    async def data(ids):
        asked.append(ids)
        return {"data": {"get_inbox_page_conversation_data": {"items": [{"latest_conversation_key_change_events": [key], "conversation_detail": {"conversation_id": "7:100", "participants_results": [{"rest_id": "7", "result": {"core": {"screen_name": "seven"}}}, {"rest_id": "100"}]}}]}}}, None

    async def decrypt(events, people):
        assert events == [key, event]
        assert people == {"100", "7"}
        return {"7:100": [{"event_id": "40", "text": "hey"}]}

    monkeypatch.setattr(client.gql, "get_xchat_conversation_data", data)
    monkeypatch.setattr(client, "_xchat_decrypt", decrypt)
    out = run(client.open_xchat_events([event], ["7:100"]))
    assert asked == [["7:100"]]
    assert out["messages"]["7:100"][0]["text"] == "hey"
    assert out["conversations"]["7:100"] == {"participant_ids": ["7"], "handles": {"7": "seven"}}
