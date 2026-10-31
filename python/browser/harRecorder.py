from __future__ import annotations

import asyncio
import base64
import json
import re
import time
import zlib
from datetime import datetime, timezone
from urllib.parse import parse_qs, urlsplit, urlunsplit
from pathlib import Path
from typing import Any

STATIC = re.compile(r"javascript|css|image/|font/|woff", re.I)
TEXT_TYPES = re.compile(r"json|javascript|text|html|xml|x-www-form-urlencoded", re.I)
MAX_BODY = 2_000_000
MAX_DOCUMENT_BODY = 16_000_000
LARGE_BODY = re.compile(r"html|javascript|ecmascript", re.I)
MAX_FRAME = 256_000
ZLIB_FLUSH = b"\x00\x00\xff\xff"
SECRET_QUERY = re.compile(r"token|auth|key|secret|sig", re.I)


def socket_url(url: str) -> str:
    parts = urlsplit(url)
    query = "&".join(f"{k}={'<redacted>' if SECRET_QUERY.search(k) else v[0]}" for k, v in parse_qs(parts.query).items())
    return urlunsplit((parts.scheme, parts.netloc, parts.path, query, ""))


class SocketTap:

    def __init__(self, url: str) -> None:
        self.url = socket_url(url)
        self.started = time.time()
        compress = (parse_qs(urlsplit(url).query).get("compress") or [""])[0]
        self.inflate = zlib.decompressobj() if compress == "zlib-stream" else None
        self.zstd = None
        if compress == "zstd-stream":
            try:
                import zstandard
                self.zstd = zstandard.ZstdDecompressor().decompressobj()
            except Exception:
                self.zstd = None
        self.buffer = b""
        self.frames: list[dict[str, Any]] = []

    def _decoded(self, payload: Any) -> tuple[int, str, str | None]:
        if isinstance(payload, str):
            return 1, payload[:MAX_FRAME], None
        raw = bytes(payload)
        try:
            if self.inflate is not None:
                self.buffer += raw
                if not self.buffer.endswith(ZLIB_FLUSH):
                    return 2, "", "partial"
                text = self.inflate.decompress(self.buffer).decode("utf8", "replace")
                self.buffer = b""
                return 2, text[:MAX_FRAME], None
            if self.zstd is not None:
                return 2, self.zstd.decompress(raw).decode("utf8", "replace")[:MAX_FRAME], None
        except Exception:
            self.buffer = b""
        return 2, base64.b64encode(raw[:MAX_FRAME]).decode(), "base64"

    def frame(self, kind: str, payload: Any) -> None:
        opcode, data, encoding = self._decoded(payload)
        if encoding == "partial":
            return
        self.frames.append({"type": kind, "time": time.time(), "opcode": opcode, "data": data, **({"_encoding": encoding} if encoding else {})})

    def take(self) -> dict[str, Any] | None:
        frames, self.frames = self.frames, []
        if not frames:
            return None
        return {
            "startedDateTime": datetime.fromtimestamp(frames[0]["time"], timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"),
            "time": 0,
            "_resourceType": "websocket",
            "request": {"method": "GET", "url": self.url, "httpVersion": "HTTP/1.1", "headers": [], "queryString": [], "cookies": [], "headersSize": -1, "bodySize": 0},
            "response": {"status": 101, "statusText": "Switching Protocols", "httpVersion": "HTTP/1.1", "headers": [], "cookies": [],
                         "content": {"size": 0, "mimeType": "x-websocket"}, "redirectURL": "", "headersSize": -1, "bodySize": -1},
            "cache": {}, "timings": {"send": 0, "wait": 0, "receive": 0},
            "_webSocketMessages": frames,
        }


class Recorder:

    def __init__(self) -> None:
        self.entries: list[dict[str, Any]] = []
        self.pending: set[asyncio.Task] = set()
        self.inflight = 0
        self.last_start = 0.0
        self.sockets: list[SocketTap] = []

    def busy(self) -> bool:
        since = time.monotonic() - self.last_start
        return since < 0.4 or (self.inflight > 0 and since < 4.0)

    def _started(self, _request: Any) -> None:
        self.inflight += 1
        self.last_start = time.monotonic()

    def _ended(self) -> None:
        self.inflight = max(0, self.inflight - 1)

    def attach(self, context: Any) -> None:
        context.on("request", self._started)
        context.on("requestfinished", lambda request: (self._ended(), self._track(self._entry(request, None))))
        context.on("requestfailed", lambda request: (self._ended(), self._track(self._entry(request, request.failure or "failed"))))
        context.on("page", self._watch)
        for page in getattr(context, "pages", []) or []:
            self._watch(page)

    def _watch(self, page: Any) -> None:
        try:
            page.on("websocket", self._socket)
        except Exception:
            pass

    def _socket(self, ws: Any) -> None:
        tap = SocketTap(ws.url)
        self.sockets.append(tap)
        ws.on("framesent", lambda payload: tap.frame("send", payload))
        ws.on("framereceived", lambda payload: tap.frame("receive", payload))

    def _track(self, coro: Any) -> None:
        task = asyncio.ensure_future(coro)
        self.pending.add(task)
        task.add_done_callback(self.pending.discard)

    async def _entry(self, request: Any, failed: str | None) -> None:
        try:
            response = None if failed else await request.response()
            raw, body_error = None, None
            if response is not None:
                try:
                    raw = await response.body()
                except Exception as exc:
                    body_error = f"{type(exc).__name__}: {str(exc).splitlines()[0][:160] if str(exc) else ''}"
            started = request.timing.get("startTime") or time.time() * 1000
            headers = await request.all_headers()
            body = request.post_data
            entry: dict[str, Any] = {
                "startedDateTime": datetime.fromtimestamp(started / 1000, timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"),
                "time": max(0, round(request.timing.get("responseEnd", 0) or 0)),
                "request": {
                    "method": request.method, "url": request.url, "httpVersion": "HTTP/2",
                    "headers": [{"name": k, "value": v} for k, v in headers.items()],
                    "queryString": [], "cookies": [], "headersSize": -1, "bodySize": len(body or ""),
                    **({"postData": {"mimeType": headers.get("content-type", ""), "text": body}} if body else {}),
                },
                "response": {"status": 0, "statusText": failed or "", "httpVersion": "HTTP/2", "headers": [], "cookies": [],
                             "content": {"size": 0, "mimeType": ""}, "redirectURL": "", "headersSize": -1, "bodySize": -1},
                "cache": {}, "timings": {"send": 0, "wait": 0, "receive": 0},
            }
            if response is not None:
                rheaders = await response.all_headers()
                mime = rheaders.get("content-type", "")
                content: dict[str, Any] = {"size": 0, "mimeType": mime}
                if raw is not None:
                    content["size"] = len(raw)
                    limit = MAX_DOCUMENT_BODY if LARGE_BODY.search(mime) or request.url.split("?", 1)[0].endswith(".js") else MAX_BODY
                    if len(raw) > limit:
                        content["_bodyError"] = f"over {limit} bytes"
                    elif TEXT_TYPES.search(mime):
                        content["text"] = raw.decode("utf8", "replace")
                    else:
                        content["text"], content["encoding"] = base64.b64encode(raw).decode(), "base64"
                elif body_error:
                    content["_bodyError"] = body_error
                entry["response"].update({"status": response.status, "statusText": response.status_text,
                                          "headers": [{"name": k, "value": v} for k, v in rheaders.items()],
                                          "content": content, "redirectURL": rheaders.get("location", "")})
            self.entries.append(entry)
        except Exception:
            pass

    def seen(self) -> int:
        return len(self.entries) + len(self.pending)

    async def take(self) -> list[dict[str, Any]]:
        if self.pending:
            await asyncio.wait(set(self.pending), timeout=10)
        entries, self.entries = self.entries, []
        entries += [entry for entry in (tap.take() for tap in self.sockets) if entry]
        return sorted(entries, key=lambda e: e["startedDateTime"])


class SessionHar(Recorder):

    def __init__(self, path: Path) -> None:
        super().__init__()
        self.path = path

    async def write(self) -> int:
        entries = await self.take()
        har = {"log": {"version": "1.2", "creator": {"name": "log-cli harRecorder", "version": "1"}, "pages": [], "entries": entries}}
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(har), encoding="utf8")
        return len(entries)
