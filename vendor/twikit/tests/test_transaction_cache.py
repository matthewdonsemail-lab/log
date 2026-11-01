import asyncio
import base64
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from twikit import Client
from twikit.x_client_transaction import ClientTransaction

KEY = base64.b64encode(bytes(range(48))).decode()
STATE = {"key": KEY, "animationKey": "ab12cd34ef560000", "rowIndex": 2, "keyBytesIndices": [12, 14, 7]}


def test_a_fresh_transaction_has_no_state():
    assert ClientTransaction().state() is None


def test_state_round_trips_through_restore():
    first = ClientTransaction()
    assert first.restore(STATE) is True
    second = ClientTransaction()
    assert second.restore(first.state()) is True
    assert second.state() == STATE


def test_restore_refuses_a_state_without_its_keys():
    assert ClientTransaction().restore({"key": KEY}) is False
    assert ClientTransaction().restore(None) is False


def test_restored_ids_match_the_ids_of_the_same_keys():
    restored = ClientTransaction()
    restored.restore(STATE)
    built = ClientTransaction()
    built.restore(STATE)
    one = restored.generate_transaction_id("POST", "/i/api/graphql/x/CreateTweet", time_now=1000)
    two = built.generate_transaction_id("POST", "/i/api/graphql/x/CreateTweet", time_now=1000)
    assert base64.b64decode(one + "==")[1:] != b""
    raw_one, raw_two = base64.b64decode(one + "=="), base64.b64decode(two + "==")
    assert bytes(b ^ raw_one[0] for b in raw_one[1:]) == bytes(b ^ raw_two[0] for b in raw_two[1:])


def test_a_restored_client_never_loads_the_home_page():
    client = Client()
    client.set_cookies({"auth_token": "a", "ct0": "b"}, clear_cookies=True)
    client.client_transaction.restore(STATE)
    loads = []

    async def init(*_):
        loads.append("home")

    async def answer(method, url, headers=None, **_):
        assert headers["X-Client-Transaction-Id"]

        class Response:
            status_code = 200
            headers = {}
            text = "{}"

            def json(self):
                return {}

        return Response()

    client.client_transaction.init = init
    client.http.request = answer
    asyncio.run(client.request("GET", "https://x.com/i/api/1.1/account/settings.json"))
    assert loads == []
