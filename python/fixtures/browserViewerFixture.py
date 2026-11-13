import asyncio
import json
import os
import sys
import threading
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from playwright.async_api import async_playwright
from browser.browserViewer import BrowserViewer

LOGIN = """<!doctype html><html><head><title>Fixture sign-in</title><style>body{font-family:system-ui;background:#f1f5f9;display:flex;justify-content:center;padding-top:60px}form{background:#fff;padding:28px;border-radius:14px;width:320px;box-shadow:0 4px 18px #0002}h1{font-size:22px;margin:0 0 16px}input{display:block;width:100%;box-sizing:border-box;margin:0 0 12px;padding:10px;font-size:16px;border:1px solid #cbd5e1;border-radius:8px}button{width:100%;padding:11px;font-size:16px;border:0;border-radius:8px;background:#2563eb;color:#fff}</style></head><body><form method="post" action="/session"><h1>Log in to the fixture</h1><input name="email" id="email" placeholder="Email" autocomplete="username"><input type="password" name="pass" id="pass" placeholder="Password"><button id="submit" type="submit">Log in</button></form></body></html>"""
HOME = """<!doctype html><html><head><title>Fixture home</title></head><body style="font-family:system-ui;padding:40px"><h1>Welcome back</h1><p>Signed in as {who}.</p></body></html>"""


class Pages(BaseHTTPRequestHandler):
    def log_message(self, *_args):
        pass

    def answer(self, body: str, status: int = 200) -> None:
        data = body.encode()
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    who = "nobody"

    def do_GET(self):
        self.answer(HOME.format(who=Pages.who) if self.path.startswith("/home") else LOGIN)

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        fields = parse_qs(self.rfile.read(length).decode())
        who = (fields.get("email") or ["nobody"])[0].replace("<", "")
        if not (fields.get("pass") or [""])[0]:
            self.answer(LOGIN)
            return
        self.send_response(303)
        self.send_header("Location", "/home")
        self.send_header("Content-Length", "0")
        self.end_headers()
        Pages.who = who


class Recorder:
    def seen(self) -> int:
        return 0


class Glide:
    async def glide(self, _x: float, _y: float, _kind: str) -> bool:
        return True


class Owner:
    def __init__(self, run_dir: Path, page) -> None:
        self.run_dir = run_dir
        self.page = page
        self.index = 0
        self.recorder = Recorder()
        self.controlLock = asyncio.Lock()
        self.mouse = Glide()
        self.opts = {}
        self.config = {"repliesPath": str(run_dir / "replies.jsonl")}

    async def step(self, action: str, label: str, act) -> dict:
        self.index += 1
        error = None
        try:
            await act()
            await self.page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception as exc:
            error = type(exc).__name__
        result = {"ok": error is None, "step": f"{self.index:02d}_{action}", "url": self.page.url, **({"error": error} if error else {})}
        with (self.run_dir / "steps.jsonl").open("a", encoding="utf8") as out:
            out.write(json.dumps({"action": action, "label": label, **result}) + "\n")
        return result


async def main() -> int:
    current = Path(sys.argv[1])
    account = sys.argv[2]
    server = ThreadingHTTPServer(("127.0.0.1", 0), Pages)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    run_dir = current.parent / "runs" / account
    run_dir.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as playwright:
        try:
            browser = await playwright.chromium.launch(headless=False)
        except Exception:
            browser = await playwright.chromium.launch(headless=False, channel=os.environ.get("LOG_FIXTURE_CHANNEL") or "msedge")
        page = await browser.new_page(viewport={"width": 900, "height": 620})
        await page.goto(f"http://127.0.0.1:{server.server_address[1]}/login")
        owner = Owner(run_dir, page)
        viewer = BrowserViewer(owner)
        await viewer.start()
        session = {"account": account, "runDir": str(run_dir), "commandsPath": str(run_dir / "commands.jsonl"), "repliesPath": str(run_dir / "replies.jsonl"), "startedAt": datetime.now(timezone.utc).isoformat(), "pid": os.getpid()}
        (current.parent / "sessions").mkdir(parents=True, exist_ok=True)
        (current.parent / "sessions" / f"{account}.json").write_text(json.dumps(session), encoding="utf8")
        print(json.dumps({"ready": True, "page": page.url}), flush=True)
        try:
            await asyncio.get_running_loop().run_in_executor(None, sys.stdin.read)
        finally:
            await viewer.close()
            await browser.close()
            server.shutdown()
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
