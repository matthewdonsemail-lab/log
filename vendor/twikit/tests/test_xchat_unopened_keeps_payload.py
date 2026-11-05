from twikit import xchat


def test_an_unopened_event_keeps_its_payload_so_it_can_be_opened_later(monkeypatch):
    monkeypatch.setattr(xchat, 'decode_event', lambda encoded: {'event_id': '9', 'conversation_id': 'g1', 'sender_id': '2'})
    monkeypatch.setattr(xchat, 'event_kind_of', lambda encoded: 'Message')
    event = xchat.unopened_of('ENCODED', "Decryption failed: no matching key found. Available versions: []")
    assert event['original_b64'] == 'ENCODED'
    assert event['text'] is None and 'no matching key' in event['error']
