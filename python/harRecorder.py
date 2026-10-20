"""HAR entries from a Playwright context's own events, for any browser log-cli drives (rule 44).

Moved from inspectSession.py so every browser records the same way. `Recorder` gives
the requests of one step (inspect's per-step `network.har`). `SessionHar` keeps every
request of the session and writes it as `session.har` when the session ends. That is the
raw session HAR (rules 19, 22) for browsers Playwright attaches to over CDP (AdsPower),
where Playwright's own `record_har_path` can't be set, because the profile's context
already exists. Camoufox contexts get Playwright's recorder from the proxy gate instead.
"""
from __future__ import annotations

import asyncio
import base64
import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

STATIC = re.compile(r"javascript|css|image/|font/|woff", re.I)
TEXT_TYPES = re.compile(r"json|javascript|text|html|xml|x-www-form-urlencoded", re.I)
MAX_BODY = 2_000_000


class Recorder:
    """The requests of the step in progress, as HAR entries, from the context's events."""

    def __init__(self) -> None:
        self.entries: list[dict[str, Any]] = []
        self.pending: set[asyncio.Task] = set()
        self.inflight = 0
        self.last_start = 0.0

    def busy(self) -> bool:
        """The page is loading: requests in flight, or one started in the last 0.4 s (the cursor waits, rule 32)."""
        # A request still open 4 s after the last one started is a long poll, not the page loading.
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

    def _track(self, coro: Any) -> None:
        task = asyncio.ensure_future(coro)
        self.pending.add(task)
        task.add_done_callback(self.pending.discard)

    async def _entry(self, request: Any, failed: str | None) -> None:
        try:
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
            response = None if failed else await request.response()
            if response is not None:
                rheaders = await response.all_headers()
                mime = rheaders.get("content-type", "")
                content: dict[str, Any] = {"size": 0, "mimeType": mime}
                try:
                    raw = await response.body()
                    content["size"] = len(raw)
                    if len(raw) <= MAX_BODY:
                        if TEXT_TYPES.search(mime):
                            content["text"] = raw.decode("utf8", "replace")
                        else:
                            content["text"], content["encoding"] = base64.b64encode(raw).decode(), "base64"
                except Exception:
                    pass  # redirects and aborted bodies have none
                entry["response"].update({"status": response.status, "statusText": response.status_text,
                                          "headers": [{"name": k, "value": v} for k, v in rheaders.items()],
                                          "content": content, "redirectURL": rheaders.get("location", "")})
            self.entries.append(entry)
        except Exception:
            pass  # the page closed under it

    def seen(self) -> int:
        return len(self.entries) + len(self.pending)

    async def take(self) -> list[dict[str, Any]]:
        if self.pending:
            await asyncio.wait(set(self.pending), timeout=10)
        entries, self.entries = self.entries, []
        return sorted(entries, key=lambda e: e["startedDateTime"])


class SessionHar(Recorder):
    """Every request of the session, written once as a HAR 1.2 file when the session ends."""

    def __init__(self, path: Path) -> None:
        super().__init__()
        self.path = path

    async def write(self) -> int:
        entries = await self.take()
        har = {"log": {"version": "1.2", "creator": {"name": "log-cli harRecorder", "version": "1"}, "pages": [], "entries": entries}}
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(har), encoding="utf8")
        return len(entries)
