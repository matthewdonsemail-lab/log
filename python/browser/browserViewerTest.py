import asyncio
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from browser.browserViewer import BrowserViewer
from browser import streamSurface

LOGIN_PAGE = {"url": "http://127.0.0.1:9/login", "heading": "Log in", "text": "Log in to continue", "password": True, "code": False, "width": 800, "height": 600, "historyLength": 1}
HOME_PAGE = {"url": "http://127.0.0.1:9/home", "heading": "Home", "text": "Welcome back", "password": False, "code": False, "width": 800, "height": 600, "historyLength": 2}
CHECKPOINT_PAGE = {"url": "http://127.0.0.1:9/checkpoint/123", "heading": "Confirm your identity", "text": "Upload a photo ID", "password": False, "code": False, "width": 800, "height": 600, "historyLength": 1}


class FakeMouse:
    def __init__(self, page):
        self.page = page

    async def click(self, x, y):
        self.page.actions.append(("click", x, y))

    async def wheel(self, dx, dy):
        self.page.actions.append(("wheel", dx, dy))


class FakeKeyboard:
    def __init__(self, page):
        self.page = page

    async def insert_text(self, text):
        self.page.actions.append(("text", text))

    async def press(self, key):
        self.page.actions.append(("key", key))


class FakePage:
    def __init__(self, signals):
        self.signals = dict(signals)
        self.actions = []
        self.mouse = FakeMouse(self)
        self.keyboard = FakeKeyboard(self)

    async def evaluate(self, _script, *_args):
        return dict(self.signals)

    async def screenshot(self, **_options):
        return b"\xff\xd8\xff\xe0fakejpeg\xff\xd9"


class FakeRecorder:
    def seen(self):
        return 0


class FakeGlide:
    def __init__(self):
        self.glides = []

    async def glide(self, x, y, kind):
        self.glides.append((x, y, kind))
        return True


class FakeOwner:
    def __init__(self, folder, signals):
        self.run_dir = Path(folder)
        self.page = FakePage(signals)
        self.index = 0
        self.recorder = FakeRecorder()
        self.controlLock = asyncio.Lock()
        self.mouse = FakeGlide()
        self.opts = {}
        self.steps = []
        self.config = {"repliesPath": str(self.run_dir / "replies.jsonl")}

    async def step(self, action, label, act):
        self.index += 1
        self.steps.append((action, label))
        await act()
        return {"ok": True, "step": f"{self.index:02d}_{action}"}


async def call(port, token, method, path, body=None):
    reader, writer = await asyncio.open_connection("127.0.0.1", port)
    data = json.dumps(body).encode() if body is not None else b""
    head = f"{method} {path} HTTP/1.1\r\nHost: 127.0.0.1\r\nAuthorization: Bearer {token}\r\nContent-Length: {len(data)}\r\n\r\n"
    writer.write(head.encode() + data)
    await writer.drain()
    raw = await reader.read()
    writer.close()
    header, _, payload = raw.partition(b"\r\n\r\n")
    status = int(header.split(b" ")[1])
    headers = {line.split(b":", 1)[0].decode(): line.split(b":", 1)[1].decode().strip() for line in header.split(b"\r\n")[1:] if b":" in line}
    return status, headers, payload


class BrowserViewerTests(unittest.TestCase):
    def setUp(self):
        os.environ.pop("LOG_VOXL_URL", None)

    def run_with(self, signals, scenario):
        async def main():
            with tempfile.TemporaryDirectory() as folder:
                owner = FakeOwner(folder, signals)
                viewer = BrowserViewer(owner)
                await viewer.start()
                try:
                    descriptor = json.loads((Path(folder) / "browserViewer.json").read_text(encoding="utf8"))
                    await scenario(owner, viewer, descriptor)
                finally:
                    await viewer.close()
                self.assertFalse((Path(folder) / "browserViewer.json").exists())
        asyncio.run(main())

    def test_the_descriptor_names_a_loopback_port_a_token_and_a_generation(self):
        async def scenario(_owner, viewer, descriptor):
            self.assertEqual(descriptor["generation"], viewer.generation)
            self.assertRegex(descriptor["generation"], r"^[a-f0-9]{32}$")
            self.assertEqual(descriptor["pid"], os.getpid())
            status, _headers, _body = await call(descriptor["port"], "wrong", "GET", "/state")
            self.assertEqual(status, 403)
        self.run_with(LOGIN_PAGE, scenario)

    def test_a_sign_in_page_allows_input_and_reports_its_revision(self):
        async def scenario(_owner, _viewer, descriptor):
            status, _headers, body = await call(descriptor["port"], descriptor["token"], "GET", "/state")
            state = json.loads(body)
            self.assertEqual(status, 200)
            self.assertEqual(state["state"], "loginForm")
            self.assertTrue(state["inputAllowed"])
            self.assertFalse(state["blocked"])
            self.assertRegex(state["revision"], r"^[a-f0-9]{64}$")
            self.assertIsNone(state["stream"])
        self.run_with(LOGIN_PAGE, scenario)

    def test_the_frame_is_a_jpeg_with_generation_and_revision_headers(self):
        async def scenario(_owner, viewer, descriptor):
            status, headers, body = await call(descriptor["port"], descriptor["token"], "GET", "/frame")
            self.assertEqual(status, 200)
            self.assertEqual(headers["Content-Type"], "image/jpeg")
            self.assertEqual(headers["X-Log-Browser-Generation"], viewer.generation)
            self.assertRegex(headers["X-Log-Browser-Revision"], r"^[a-f0-9]{64}$")
            self.assertTrue(body.startswith(b"\xff\xd8"))
        self.run_with(LOGIN_PAGE, scenario)

    def test_a_click_with_the_current_revision_is_replayed_as_a_recorded_step(self):
        async def scenario(owner, viewer, descriptor):
            _status, _headers, body = await call(descriptor["port"], descriptor["token"], "GET", "/state")
            revision = json.loads(body)["revision"]
            status, _headers, body = await call(descriptor["port"], descriptor["token"], "POST", "/input", {"type": "click", "x": 40, "y": 50, "generation": viewer.generation, "revision": revision})
            self.assertEqual(status, 200, body)
            self.assertEqual(owner.page.actions, [("click", 40.0, 50.0)])
            self.assertEqual(owner.steps, [("viewerInput", "click")])
            self.assertEqual(owner.mouse.glides, [(40.0, 50.0, "viewerClick")])
            replies = [json.loads(line) for line in Path(owner.config["repliesPath"]).read_text(encoding="utf8").splitlines()]
            self.assertEqual(replies[0]["id"], "viewer1")
            self.assertNotEqual(json.loads(body)["revision"], revision)
        self.run_with(LOGIN_PAGE, scenario)

    def test_a_stale_revision_is_refused_and_nothing_reaches_the_page(self):
        async def scenario(owner, viewer, descriptor):
            status, _headers, body = await call(descriptor["port"], descriptor["token"], "POST", "/input", {"type": "text", "text": "hello", "generation": viewer.generation, "revision": "0" * 64})
            self.assertEqual(status, 409)
            self.assertEqual(json.loads(body)["error"], "browserStateChanged")
            self.assertEqual(owner.page.actions, [])
        self.run_with(LOGIN_PAGE, scenario)

    def test_a_page_no_longer_in_a_sign_in_state_refuses_input(self):
        async def scenario(owner, viewer, descriptor):
            _status, _headers, body = await call(descriptor["port"], descriptor["token"], "GET", "/state")
            revision = json.loads(body)["revision"]
            status, _headers, body = await call(descriptor["port"], descriptor["token"], "POST", "/input", {"type": "key", "key": "Enter", "generation": viewer.generation, "revision": revision})
            self.assertEqual(status, 409)
            self.assertEqual(json.loads(body)["error"], "browserInputStopped")
            self.assertEqual(owner.page.actions, [])
        self.run_with(HOME_PAGE, scenario)

    def test_a_checkpoint_is_blocked(self):
        async def scenario(_owner, _viewer, descriptor):
            _status, _headers, body = await call(descriptor["port"], descriptor["token"], "GET", "/state")
            state = json.loads(body)
            self.assertTrue(state["blocked"])
            self.assertFalse(state["inputAllowed"])
        self.run_with(CHECKPOINT_PAGE, scenario)

    def test_keys_outside_the_list_are_invalid(self):
        async def scenario(owner, viewer, descriptor):
            _status, _headers, body = await call(descriptor["port"], descriptor["token"], "GET", "/state")
            revision = json.loads(body)["revision"]
            status, _headers, body = await call(descriptor["port"], descriptor["token"], "POST", "/input", {"type": "key", "key": "F12", "generation": viewer.generation, "revision": revision})
            self.assertEqual(status, 409)
            self.assertEqual(json.loads(body)["error"], "browserInputInvalid")
            self.assertEqual(owner.page.actions, [])
        self.run_with(LOGIN_PAGE, scenario)


class StreamSurfaceTests(unittest.TestCase):
    def test_no_voxl_url_means_no_stream(self):
        os.environ.pop("LOG_VOXL_URL", None)
        self.assertIsNone(streamSurface.configured())

    def test_only_http_and_https_urls_with_a_host_count(self):
        os.environ["LOG_VOXL_URL"] = "ftp://example.com"
        try:
            self.assertIsNone(streamSurface.configured())
            os.environ["LOG_VOXL_URL"] = "https://voxl.example.com/"
            self.assertEqual(streamSurface.configured(), "https://voxl.example.com/")
        finally:
            os.environ.pop("LOG_VOXL_URL", None)


if __name__ == "__main__":
    unittest.main()
