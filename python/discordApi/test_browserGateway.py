from __future__ import annotations

import asyncio
import base64
import json
import sys
import time
import zlib
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from curl_cffi.requests.websockets import WebSocketTimeout

from discordApi import browserGateway, browserIdentity

SUPER = base64.b64encode(json.dumps({"os": "Windows", "browser": "Chrome", "client_build_number": 672800, "client_launch_id": "old", "launch_signature": "old"}).encode()).decode()
IDENTIFY = {"token": "secret", "capabilities": 1734653, "properties": {"os": "Windows", "browser": "Chrome", "client_build_number": 672800, "client_launch_id": "old", "launch_signature": "old", "installation_id": "inst"}, "presence": {"status": "online", "since": 0, "activities": [], "afk": False}, "compress": False, "client_state": {"guild_versions": {}}, "qos_token": "q"}


VOICE = {"guild_id": None, "channel_id": None, "self_mute": True, "self_deaf": False, "self_video": False, "flags": 2}
QOS = {"active": True, "ver": 31, "reasons": ["foregrounded"]}


def har(tmp: Path) -> Path:
    entries = [
        {"request": {"url": "https://discord.com/api/v9/users/@me", "headers": [{"name": "authorization", "value": "secret"}, {"name": "user-agent", "value": "Chrome/157"}, {"name": "x-super-properties", "value": SUPER}, {"name": "cookie", "value": "c=1"}]}},
        {"request": {"url": "wss://gateway.discord.gg/?encoding=json&v=9&compress=zlib-stream", "headers": []}, "_webSocketMessages": [{"type": "send", "data": json.dumps({"op": 2, "d": IDENTIFY})}, {"type": "send", "data": json.dumps({"op": 4, "d": VOICE})}, {"type": "send", "data": json.dumps({"op": 40, "d": {"seq": 1, "qos": QOS}})}]},
    ]
    path = tmp / "inspect" / "20261113T000000_acct" / "adsPower" / "session.har"
    path.parent.mkdir(parents=True)
    path.write_text(json.dumps({"log": {"entries": entries}}), encoding="utf-8")
    return path


def test_identity_keeps_the_browser_and_drops_what_belongs_to_one_session(tmp_path: Path) -> None:
    made = browserIdentity.load(str(tmp_path / "state"), "acct", tmp_path)
    assert made is None
    har(tmp_path)
    made = browserIdentity.load(str(tmp_path / "state"), "acct", tmp_path)
    assert made and "token" not in made["identify"] and "qos_token" not in made["identify"]
    assert "client_launch_id" not in made["identify"]["properties"]
    assert "authorization" not in made["headers"] and "cookie" not in made["headers"]
    launched = {"client_launch_id": "new", "launch_signature": "sig", "client_heartbeat_session_id": "hb"}
    payload = browserIdentity.identify_payload(made, "tok", launched)
    assert payload["op"] == 2 and payload["d"]["token"] == "tok" and payload["d"]["capabilities"] == 1734653
    assert payload["d"]["properties"]["client_launch_id"] == "new" and payload["d"]["properties"]["installation_id"] == "inst"
    sent = json.loads(base64.b64decode(browserIdentity.rest_headers(made, "tok", launched)["X-Super-Properties"]))
    assert sent["client_launch_id"] == "new" and sent["client_build_number"] == 672800
    assert made["voiceState"] == VOICE and made["qos"] == QOS
    assert (tmp_path / "state" / "acct" / browserIdentity.FILE).exists()


class FakeSocket:
    def __init__(self, frames: list[bytes], close_code: int | None = None) -> None:
        self.frames = frames
        self.sent: list[dict] = []
        self.close_code = close_code

    async def recv(self, timeout: float | None = None) -> tuple[bytes, int]:
        await asyncio.sleep(0)
        if self.frames:
            return self.frames.pop(0), 2
        if self.close_code:
            raise ConnectionError("closed")
        raise WebSocketTimeout("quiet")

    async def send_str(self, text: str) -> None:
        self.sent.append(json.loads(text))

    async def close(self) -> None:
        return None


class FakeSession:
    def __init__(self, socket: FakeSocket) -> None:
        self.socket = socket

    async def __aenter__(self) -> "FakeSession":
        return self

    async def __aexit__(self, *args: object) -> None:
        return None

    async def ws_connect(self, url: str, **kwargs: object) -> FakeSocket:
        return self.socket


def stream(*payloads: dict) -> list[bytes]:
    deflate = zlib.compressobj()
    return [deflate.compress(json.dumps(p).encode()) + deflate.flush(zlib.Z_SYNC_FLUSH) for p in payloads]


def identity() -> dict:
    return {"gatewayUrl": browserIdentity.GATEWAY_URL, "identify": browserIdentity.template_of(IDENTIFY), "headers": {"user-agent": "Chrome/157", "x-super-properties": SUPER}, "voiceState": VOICE, "qos": QOS}


def run(socket: FakeSocket) -> browserGateway.BrowserGateway:
    gateway = browserGateway.BrowserGateway("tok", identity(), browserIdentity.launch(), session_factory=lambda: FakeSession(socket))
    import threading

    threading.Thread(target=gateway.connect, daemon=True).start()
    return gateway


def test_the_gateway_signs_on_as_the_browser_and_hands_over_messages() -> None:
    message = {"id": "9", "channel_id": "5", "content": "yo", "author": {"id": "7", "username": "matt", "global_name": "Matt"}, "referenced_message": {"id": "8", "author": {"id": "1"}}}
    socket = FakeSocket([json.dumps({"op": 10, "d": {"heartbeat_interval": 41250}}).encode()] + stream({"op": 0, "s": 1, "t": "READY", "d": {"user": {"id": "1"}, "guilds": [{"id": "3", "properties": {"name": "srv"}, "channels": []}]}}, {"op": 0, "s": 2, "t": "MESSAGE_CREATE", "d": message}))
    gateway = run(socket)
    started = time.time()
    event = None
    while time.time() - started < 5 and event is None:
        event = gateway.get_messages()
        time.sleep(0.02)
    gateway.stop()
    assert gateway.get_ready() and gateway.get_my_id() == "1" and gateway.guilds[0]["name"] == "srv"
    assert socket.sent[0]["op"] == 2 and socket.sent[0]["d"]["capabilities"] == 1734653 and socket.sent[0]["d"]["token"] == "tok"
    assert [p["op"] for p in socket.sent[1:4]] == [4, 41, 40] and socket.sent[3]["d"] == {"seq": 1, "qos": QOS}
    assert socket.sent[2]["d"]["client_launch_id"] == gateway.launched["client_launch_id"]
    assert event and event["op"] == "MESSAGE_CREATE" and event["d"]["user_id"] == "7" and event["d"]["referenced_message"]["user_id"] == "1"


def test_a_4004_close_is_a_dead_session() -> None:
    socket = FakeSocket(stream({"op": 10, "d": {"heartbeat_interval": 41250}}), close_code=4004)
    gateway = run(socket)
    started = time.time()
    while gateway.get_state() != 0 and time.time() - started < 5:
        time.sleep(0.02)
    assert gateway.get_state() == 0 and gateway.dead() and not gateway.get_ready()
