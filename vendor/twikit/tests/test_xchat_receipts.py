from twikit.xchat import unopened_of


def test_a_read_receipt_that_cannot_be_verified_is_a_marker_not_a_message():
    out = unopened_of(None, "Crypto error: Signature verification failed: ReadReceipt signature could not be verified")
    assert out["kind"] == "MarkRead"
    assert out["text"] is None
    assert "error" not in out


def test_any_other_failure_keeps_its_error():
    out = unopened_of(None, "no matching key for version 3")
    assert out["error"].startswith("no matching key")
    assert out["text"] is None


def test_a_live_message_under_a_key_not_held_fetches_the_key_changes_and_opens():
    import asyncio
    import types
    from twikit.client.client import Client

    class Chat:
        def __init__(self):
            self.keys = False

        def decrypt_event(self, encoded):
            if not self.keys:
                raise RuntimeError("Decryption failed: Message encrypted with key version '7' but no matching key found. Available versions: []")
            return {'type': 'Message', 'content': {'text': 'i just posted it now'}, 'conversation_id': '1:2', 'sender_id': '1'}

        def decrypt_events(self, events):
            self.keys = True
            return {'messages': []}

    fetched = []

    async def signers(self, ids):
        return None

    async def prime(self, pages=1):
        return None

    async def fetch(self, missing):
        fetched.append(missing)
        return ['keyChange']

    fake = types.SimpleNamespace(_xchat=Chat(), _xchat_items=None)
    fake._xchat_signers = types.MethodType(signers, fake)
    fake._xchat_prime_keys = types.MethodType(prime, fake)
    fake._xchat_fetch_key_changes = types.MethodType(fetch, fake)
    fake._xchat_missing_keys = lambda events, result: {'1:2': {'sequence': 5, 'needed': {7}, 'held': set()}}
    out = asyncio.run(Client._xchat_open(fake, ''))
    assert out['text'] == 'i just posted it now'
    assert fetched


def test_a_message_signed_with_a_key_not_cached_refetches_the_senders_key_and_opens():
    import asyncio
    import types
    from twikit.client.client import Client

    class Chat:
        def __init__(self):
            self.fresh = False

        def decrypt_event(self, encoded):
            if not self.fresh:
                raise RuntimeError('Crypto error: Signature verification failed: Message signature could not be verified: signature missing or no matching signing key')
            return {'type': 'Message', 'content': {'text': 'get in then merge'}, 'conversation_id': '1:2', 'sender_id': '7'}

    chat = Chat()
    fetched = []

    async def signers(self, ids):
        if '7' in self._xchat_signing:
            return None
        fetched.append(set(ids))
        self._xchat_signing['7'] = {'key': 'new'}
        chat.fresh = len(fetched) > 1

    fake = types.SimpleNamespace(_xchat=chat, _xchat_items=None, _xchat_signing={})
    fake._xchat_signers = types.MethodType(signers, fake)
    import twikit.xchat as xchat
    original = xchat.decode_event
    xchat.decode_event = lambda encoded: {'sender_id': '7', 'conversation_id': '1:2'}
    try:
        out = asyncio.run(Client._xchat_open(fake, ''))
    finally:
        xchat.decode_event = original
    assert out['text'] == 'get in then merge'
    assert len(fetched) == 2
