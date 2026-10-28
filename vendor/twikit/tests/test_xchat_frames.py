import base64
import struct
import unittest

from twikit.xchat import KEEPALIVE, decode_event, frame_of, token_of


def _string(fid: int, text: str) -> bytes:
    data = text.encode()
    return bytes([11]) + struct.pack('>h', fid) + struct.pack('>i', len(data)) + data


def _event(event_id: str, sender: str, conversation: str, time_ms: str) -> bytes:
    nested = bytes([12]) + struct.pack('>h', 7) + _string(1, 'ciphertext') + b'\x00'
    return _string(1, event_id) + _string(3, sender) + _string(4, conversation) + _string(6, time_ms) + nested + b'\x00'


class FrameTests(unittest.TestCase):
    def test_keepalive_is_message_instruction_keepalive(self):
        self.assertEqual(frame_of(KEEPALIVE), {'kind': 'messageInstruction', 'events': [], 'instruction': 'keepAlive'})

    def test_a_pushed_message_event_comes_out_as_the_base64_struct_decrypt_event_takes(self):
        event = _event('2115317248474906682', '823855632', '823855632:1974596626342686720', '1793160000000')
        frame = frame_of(bytes([12]) + struct.pack('>h', 1) + event + b'\x00')
        self.assertEqual(frame['kind'], 'messageEvent')
        self.assertEqual(base64.b64decode(frame['events'][0]), event)
        head = decode_event(frame['events'][0])
        self.assertEqual((head['event_id'], head['sender_id'], head['time_ms']), ('2115317248474906682', '823855632', 1793160000000))

    def test_a_batch_gives_every_event(self):
        events = [_event(str(i), '1', '1:2', '1793160000000') for i in range(3)]
        body = bytes([15]) + struct.pack('>h', 1) + bytes([12]) + struct.pack('>i', 3) + b''.join(events) + b'\x00'
        frame = frame_of(bytes([12]) + struct.pack('>h', 3) + body + b'\x00')
        self.assertEqual(frame['kind'], 'batchedMessageEvents')
        self.assertEqual([base64.b64decode(e) for e in frame['events']], events)

    def test_a_pull_instruction_says_where_to_pull_from(self):
        pull = bytes([12]) + struct.pack('>h', 1) + _string(1, '2115317248474906682') + b'\x00'
        frame = frame_of(bytes([12]) + struct.pack('>h', 2) + pull + b'\x00\x00')
        self.assertEqual((frame['instruction'], frame['sequence_start']), ('pullMessages', '2115317248474906682'))

    def test_the_token_is_the_jwt_in_the_answer(self):
        jwt = 'a' * 40 + '.' + 'b' * 60 + '.' + 'c' * 40
        self.assertEqual(token_of({'data': {'user_get_x_chat_auth_token': {'token': jwt}}}), jwt)
        self.assertIsNone(token_of({'data': {}}))

    def test_garbage_is_unknown_not_a_crash(self):
        self.assertEqual(frame_of(b'\x01\x02'), {'kind': 'unknown', 'events': []})


if __name__ == '__main__':
    unittest.main()
