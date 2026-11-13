from __future__ import annotations

import asyncio
import hashlib
import json
import os
import re
import secrets
from pathlib import Path
from typing import Any
from browser import streamSurface
from login.autoLogin import classify

class BrowserViewer:
    def __init__(self, owner: Any) -> None:
        self.owner = owner
        self.token = secrets.token_urlsafe(32)
        self.generation = secrets.token_hex(16)
        self.path = owner.run_dir / "browserViewer.json"
        self.server: Any = None
        self.inputRevision = 0

    async def start(self) -> None:
        self.server = await asyncio.start_server(self.request, "127.0.0.1", 0, limit=65536)
        port = self.server.sockets[0].getsockname()[1]
        descriptor = {"port": port, "token": self.token, "generation": self.generation, "pid": os.getpid()}
        with self.path.open("w", encoding="utf8") as target:
            os.chmod(self.path, 0o600)
            target.write(json.dumps(descriptor))

    async def close(self) -> None:
        if self.server:
            self.server.close()
            await self.server.wait_closed()
        try:
            if json.loads(self.path.read_text(encoding="utf8")).get("generation") == self.generation:
                self.path.unlink()
        except (OSError, ValueError):
            pass

    async def state(self) -> dict[str, Any]:
        page = self.owner.page
        signals = await page.evaluate("""() => ({url: location.href, heading: document.querySelector('h1,h2,[role=heading]')?.textContent || '', text: (document.body?.innerText || '').slice(0, 64000), password: [...document.querySelectorAll('input[type=password]')].some(e => e.getBoundingClientRect().height > 0), code: [...document.querySelectorAll('input[autocomplete=one-time-code],input[name=approvals_code]')].some(e => e.getBoundingClientRect().height > 0), width: innerWidth, height: innerHeight, historyLength: history.length})""")
        state = classify(signals["url"], signals["heading"], signals["text"], password_field=signals["password"], code_field=signals["code"], login_markers=False, session_cookies=False, captcha=False)
        blocked = bool(re.search(r"/checkpoint|/account/disabled", signals["url"], re.I)) or state in {"disabled", "checkpoint", "videoSelfie", "automatedBehaviour", "captcha"}
        revision = hashlib.sha256(json.dumps([signals["url"], signals["text"], self.owner.index, self.inputRevision, self.owner.recorder.seen()], ensure_ascii=True).encode()).hexdigest()
        return {"generation": self.generation, "revision": revision, "state": state, "url": signals["url"], "historyLength": signals["historyLength"], "blocked": blocked, "inputAllowed": not blocked and state in {"loginForm", "wrongPassword", "findAccount", "twoStepCode", "twoStepMethod", "trustDevice", "saveLogin", "continueAs"}, "width": signals["width"], "height": signals["height"], "busy": self.owner.controlLock.locked(), "stream": await streamSurface.surface(self.owner)}

    async def input(self, data: dict[str, Any]) -> dict[str, Any]:
        if self.owner.controlLock.locked():
            raise ValueError("browserBusy")
        async with self.owner.controlLock:
            state = await self.state()
            if data.get("generation") != self.generation or data.get("revision") != state["revision"]:
                raise ValueError("browserStateChanged")
            if state["blocked"] or not state["inputAllowed"]:
                raise ValueError("browserInputStopped")
            kind = data.get("type")
            async def perform() -> None:
                page = self.owner.page
                if kind == "click":
                    x, y = float(data.get("x", -1)), float(data.get("y", -1))
                    if not 0 <= x <= state["width"] or not 0 <= y <= state["height"]:
                        raise ValueError("browserInputInvalid")
                    await self.owner.mouse.glide(x, y, "viewerClick")
                    await page.mouse.click(x, y)
                elif kind == "text":
                    text = data.get("text")
                    if not isinstance(text, str) or len(text) > 2048:
                        raise ValueError("browserInputInvalid")
                    await page.keyboard.insert_text(text)
                elif kind == "key":
                    key = data.get("key")
                    if key not in {"Enter", "Tab", "Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Escape", "Space", "Home", "End"}:
                        raise ValueError("browserInputInvalid")
                    await page.keyboard.press(key)
                elif kind == "scroll":
                    amount = max(-600, min(600, float(data.get("deltaY", 0))))
                    await page.mouse.wheel(0, amount)
                else:
                    raise ValueError("browserInputInvalid")
            self.inputRevision += 1
            previous = self.owner.opts
            self.owner.opts = {"quietMs": 0, "settleMaxMs": 1}
            try:
                result = await self.owner.step("viewerInput", str(kind), perform)
                with Path(self.owner.config["repliesPath"]).open("a", encoding="utf8") as target:
                    target.write(json.dumps({"id": f"viewer{self.inputRevision}", "result": result}) + "\n")
            finally:
                self.owner.opts = previous
            if not result.get("ok"):
                raise ValueError("browserInputFailed")
        for _attempt in range(10):
            try:
                return await self.state()
            except Exception:
                await asyncio.sleep(0.3)
        return await self.state()

    async def request(self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter) -> None:
        status, contentType, body, extra = 503, "application/json", b'{"error":"browserUnavailable"}', {}
        try:
            header = await asyncio.wait_for(reader.readuntil(b"\r\n\r\n"), 5)
            lines = header.decode("latin1").split("\r\n")
            method, path, _version = lines[0].split(" ", 2)
            headers = dict(line.split(":", 1) for line in lines[1:] if ":" in line)
            headers = {key.lower(): value.strip() for key, value in headers.items()}
            if not secrets.compare_digest(headers.get("authorization", ""), f"Bearer {self.token}"):
                status, body = 403, b'{"error":"browserAccessDenied"}'
            elif method == "GET" and path in {"/state", "/frame"}:
                state = await asyncio.wait_for(self.state(), 5)
                if path == "/frame":
                    body = await self.owner.page.screenshot(type="jpeg", quality=65, scale="css", timeout=5000)
                    contentType = "image/jpeg"
                    extra = {"X-Log-Browser-Generation": self.generation, "X-Log-Browser-Revision": state["revision"]}
                else:
                    body = json.dumps(state).encode()
                status = 200
            elif method == "POST" and path == "/input":
                length = int(headers.get("content-length", "0"))
                if not 0 < length <= 16384:
                    raise ValueError("browserInputInvalid")
                data = json.loads(await asyncio.wait_for(reader.readexactly(length), 5))
                if not isinstance(data, dict):
                    raise ValueError("browserInputInvalid")
                body = json.dumps(await self.input(data)).encode()
                status = 200
            else:
                status, body = 404, b'{"error":"browserRouteMissing"}'
        except ValueError as error:
            code = str(error)
            if code not in {"browserBusy", "browserStateChanged", "browserInputStopped", "browserInputInvalid", "browserInputFailed"}:
                code = "browserInputInvalid"
            status, body = 409, json.dumps({"error": code}).encode()
        except Exception:
            pass
        try:
            responseHeaders = {"Content-Type": contentType, "Content-Length": str(len(body)), "Cache-Control": "no-store", "Connection": "close", **extra}
            writer.write((f"HTTP/1.1 {status} Result\r\n" + "".join(f"{key}: {value}\r\n" for key, value in responseHeaders.items()) + "\r\n").encode() + body)
            await writer.drain()
        finally:
            writer.close()
            await writer.wait_closed()
