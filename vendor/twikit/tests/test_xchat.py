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
