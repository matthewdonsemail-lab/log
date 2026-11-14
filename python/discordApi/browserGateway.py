from __future__ import annotations

import asyncio
import json
import queue
import random
import threading
import time
import zlib
from typing import Any

from curl_cffi.requests.websockets import WebSocketTimeout

from discordApi import browserIdentity

SUFFIX = b"\x00\x00\xff\xff"
DEAD_CLOSES = {4004}
MAX_MESSAGE = 64 * 1024 * 1024


def flat_message(d: dict[str, Any]) -> dict[str, Any]:
    author = d.get("author") or {}
    out = {**d, "user_id": author.get("id"), "username": author.get("username"), "global_name": author.get("global_name"), "bot": bool(author.get("bot"))}
    referenced = d.get("referenced_message")
    if isinstance(referenced, dict):
        out["referenced_message"] = {**referenced, "user_id": (referenced.get("author") or {}).get("id")}
    return out


def guild_of(g: dict[str, Any]) -> dict[str, Any]:
    return {"guild_id": g.get("id"), "name": g.get("name") or (g.get("properties") or {}).get("name"), "channels": g.get("channels") or []}


class BrowserGateway:
    def __init__(self, token: str, identity: dict[str, Any], launched: dict[str, str], session_factory: Any = None) -> None:
        self.token = token
        self.identity = identity
        self.launched = launched
        self.session_factory = session_factory
        self.events: queue.Queue[dict[str, Any]] = queue.Queue()
        self.ready = threading.Event()
        self.state = 1
        self.my_id: str | None = None
        self.guilds: list[dict[str, Any]] = []
        self.sequence: int | None = None
        self.acked = True
        self.close_code: int | None = None
        self.stopping = False
        self.started_ms = int(time.time() * 1000)

    def get_ready(self) -> bool:
        return self.ready.is_set()

    def get_state(self) -> int:
        return self.state

    def get_my_id(self) -> str | None:
        return self.my_id

    def get_messages(self) -> dict[str, Any] | None:
        try:
            return self.events.get_nowait()
        except queue.Empty:
            return None

    def dead(self) -> bool:
        return self.close_code in DEAD_CLOSES

    def connect(self) -> None:
        try:
            asyncio.run(self.run())
        except Exception as error:
            self.events.put({"op": "CLOSED", "d": {"detail": str(error)[:300]}})
        finally:
            self.state = 0

    def stop(self) -> None:
        self.stopping = True

    def session(self) -> Any:
        if self.session_factory:
            return self.session_factory()
        from curl_cffi.requests import AsyncSession

        return AsyncSession(impersonate=browserIdentity.IMPERSONATE)

    def headers(self) -> dict[str, str]:
        named = self.identity["headers"]
        return {"User-Agent": named["user-agent"], "Origin": browserIdentity.ORIGIN, "Accept-Language": named.get("accept-language") or "en-US,en;q=0.9", "Cache-Control": "no-cache", "Pragma": "no-cache"}

    async def run(self) -> None:
        inflator = zlib.decompressobj()
        buffer = bytearray()
        async with self.session() as session:
            ws = await session.ws_connect(self.identity.get("gatewayUrl") or browserIdentity.GATEWAY_URL, headers=self.headers(), max_message_size=MAX_MESSAGE)
            beat: asyncio.Task[None] | None = None
            try:
                while not self.stopping:
                    try:
                        frame, _ = await ws.recv(timeout=1.0)
                    except WebSocketTimeout:
                        continue
                    except Exception as error:
                        self.close_code = getattr(ws, "close_code", None)
                        self.events.put({"op": "CLOSED", "d": {"code": self.close_code, "detail": str(error)[:300]}})
                        return
                    if not frame:
                        continue
                    if not buffer and frame[:1] == b"{":
                        beat = await self.handle(ws, json.loads(frame.decode("utf-8", "replace")), beat)
                        continue
                    buffer.extend(frame)
                    if not bytes(buffer).endswith(SUFFIX):
                        continue
                    text = inflator.decompress(bytes(buffer)).decode("utf-8", "replace")
                    buffer.clear()
                    beat = await self.handle(ws, json.loads(text), beat)
            finally:
                if beat:
                    beat.cancel()
                try:
                    await ws.close()
                except Exception:
                    pass

    async def handle(self, ws: Any, payload: dict[str, Any], beat: asyncio.Task[None] | None) -> asyncio.Task[None] | None:
        op = payload.get("op")
        if payload.get("s") is not None:
            self.sequence = payload["s"]
        if op == 10:
            interval = float((payload.get("d") or {}).get("heartbeat_interval") or 41250) / 1000
            await ws.send_str(json.dumps(browserIdentity.identify_payload(self.identity, self.token, self.launched), separators=(",", ":")))
            return asyncio.create_task(self.heartbeat(ws, interval))
        if op == 11:
            self.acked = True
            return beat
        if op == 1:
            await ws.send_str(json.dumps(browserIdentity.heartbeat(self.identity, self.sequence), separators=(",", ":")))
            return beat
        if op in (7, 9):
            self.events.put({"op": "CLOSED", "d": {"detail": "Discord asked to reconnect" if op == 7 else "Discord said the session is invalid", "op": op}})
            self.stopping = True
            return beat
        if op != 0:
            return beat
        kind, d = payload.get("t"), payload.get("d") or {}
        if kind == "READY":
            self.my_id = str((d.get("user") or {}).get("id") or "")
            self.guilds = [guild_of(g) for g in d.get("guilds") or [] if isinstance(g, dict)]
            for payload in browserIdentity.after_ready(self.identity, self.launched, self.started_ms, self.sequence):
                await ws.send_str(json.dumps(payload, separators=(",", ":")))
            self.ready.set()
        elif kind == "MESSAGE_CREATE":
            self.events.put({"op": "MESSAGE_CREATE", "d": flat_message(d)})
        return beat

    async def heartbeat(self, ws: Any, interval: float) -> None:
        await asyncio.sleep(interval * random.random())
        while not self.stopping:
            if not self.acked:
                self.events.put({"op": "CLOSED", "d": {"detail": "Discord stopped answering heartbeats"}})
                self.stopping = True
                return
            self.acked = False
            await ws.send_str(json.dumps(browserIdentity.heartbeat(self.identity, self.sequence), separators=(",", ":")))
            await asyncio.sleep(interval)
