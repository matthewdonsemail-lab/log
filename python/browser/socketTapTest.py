import json
import sys
import unittest
import zlib
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from browser.harRecorder import SocketTap, socket_url


class SocketTapTests(unittest.TestCase):
    def test_a_zlib_stream_socket_is_inflated_frame_by_frame_with_one_context(self):
        tap = SocketTap("wss://gateway.discord.gg/?encoding=json&v=9&compress=zlib-stream")
        deflate = zlib.compressobj()
        for event in ({"op": 10, "d": {"heartbeat_interval": 41250}}, {"op": 0, "t": "MESSAGE_CREATE", "d": {"content": "hi"}}):
            tap.frame("receive", deflate.compress(json.dumps(event).encode()) + deflate.flush(zlib.Z_SYNC_FLUSH))
        entry = tap.take()
        self.assertEqual([json.loads(f["data"]).get("t") for f in entry["_webSocketMessages"]], [None, "MESSAGE_CREATE"])
        self.assertEqual(entry["response"]["status"], 101)
        self.assertIsNone(tap.take())

    def test_a_message_split_over_frames_waits_for_the_flush(self):
        tap = SocketTap("wss://gateway.discord.gg/?compress=zlib-stream")
        deflate = zlib.compressobj()
        body = deflate.compress(json.dumps({"t": "READY"}).encode()) + deflate.flush(zlib.Z_SYNC_FLUSH)
        tap.frame("receive", body[:5])
        tap.frame("receive", body[5:])
        frames = tap.take()["_webSocketMessages"]
        self.assertEqual(len(frames), 1)
        self.assertEqual(json.loads(frames[0]["data"])["t"], "READY")

    def test_text_frames_pass_through_and_unknown_binary_is_base64(self):
        tap = SocketTap("wss://example.com/ws")
        tap.frame("send", '{"op":1}')
        tap.frame("receive", b"\x01\x02")
        frames = tap.take()["_webSocketMessages"]
        self.assertEqual((frames[0]["type"], frames[0]["data"]), ("send", '{"op":1}'))
        self.assertEqual(frames[1]["_encoding"], "base64")

    def test_a_token_in_the_socket_url_is_redacted(self):
        self.assertEqual(socket_url("wss://chat-ws.x.com/ws?token=eyJabc&v=1"), "wss://chat-ws.x.com/ws?token=<redacted>&v=1")


if __name__ == "__main__":
    unittest.main()
