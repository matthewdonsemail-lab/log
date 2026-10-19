"""log-cli's inspect session (`log inspect`, rule 29): one Camoufox you control a step at a time, and see.

Before code is written against a Facebook page, the page is looked at (rule
25). This keeps one browser open for an account and runs one action per
command, the way camofox-mcp drives a browser (accessibility snapshots with
element refs), but through log-cli's own launch: headed with humanize and the
cursor shown (rule 11), only through the account's proxy from its country
(12), as its one device in its pinned locale (15-16), after the launch
self-check (17), recording the raw session HAR (19, 22). It uses Camoufox's
async API (`AsyncCamoufox`, https://camoufox.com/python/usage/); the proxy
gate guards both APIs.

Every action is a step, recorded in order as it happens, in
`<runDir>/steps/NN_<action>/`:
  snapshot.yml   the page's accessibility tree with refs (`aria_snapshot(mode="ai")`)
  screenshot.png what the window showed
  network.har    every request the step made, raw (rule 19), built from the page's events
  rea.json       rea's reading of that HAR, run at once (`inspect-web-network-capture`)
and every log line, timed, in `steps.jsonl` (`proxyGate.log`).

Commands arrive as JSON lines appended to `commandsPath`; each reply is a
JSON line in `repliesPath` with the same id. Actions: goto, snapshot, click,
type, press, solve, back, wait, stop. click/type/press/solve act on Facebook:
the TS side only sends them with `--live` (rule 8). `solve` is its own state:
Facebook's text captcha goes to 2Captcha's image solver (matt, rule 10's
solver), the answer is typed and sent, and `solve.json` keeps the solver, its
job id and timing next to the step's HAR. `signIn` and `code` type the
account's email, password and current authenticator code from the run's
private login.json (rule 21): commands carry no secret, and no value is ever
logged or written to a step. Thirty idle minutes stop the session.
"""
from __future__ import annotations

import asyncio
import base64
import json
import os
import re
import shutil
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import autoLogin
import proxyGate
from humanMouse import HumanMouse
from errorCodes import failure
from visibleBrowser import launch_kwargs

IDLE_SECONDS = 30 * 60
# A step ends when the page has been quiet on the network this long, or at SETTLE_MAX_MS.
QUIET_MS = 1500
SETTLE_MAX_MS = 15_000
# rea's own input limit for one capture (`maximum_capture_bytes`).
REA_MAX_BYTES = 33_554_432
STATIC = re.compile(r"javascript|css|image/|font/|woff", re.I)
TEXT_TYPES = re.compile(r"json|javascript|text|html|xml|x-www-form-urlencoded", re.I)
MAX_BODY = 2_000_000


def log(message: str) -> None:
    proxyGate.log(message)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def slug(text: str) -> str:
    words = re.split(r"[^A-Za-z0-9]+", text)
    words = [w for w in words if w][:4]
    return "".join(w.lower() if i == 0 else w[:1].upper() + w[1:].lower() for i, w in enumerate(words)) or "step"


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


FRIENDLY_NAME = re.compile(r'(?:^|&)fb_api_req_friendly_name=([^&]+)|name="fb_api_req_friendly_name"\r?\n\r?\n([^\r\n]+)')


def request_names(entries: list[dict[str, Any]]) -> set[str]:
    """Facebook's GraphQL operation names among the step's requests (urlencoded or multipart bodies)."""
    names = set()
    for e in entries:
        for h in e["request"].get("headers", []):
            if h["name"].lower() == "x-fb-friendly-name":
                names.add(h["value"])
        match = FRIENDLY_NAME.search(e["request"].get("postData", {}).get("text", "") or "")
        if match:
            names.add(match.group(1) or match.group(2))
    return names


def notable(entries: list[dict[str, Any]]) -> list[str]:
    """What a person reads first: Facebook's own requests, by name and status, never values."""
    lines = []
    for e in entries:
        url = e["request"]["url"]
        host = url.split("/")[2] if "//" in url else ""
        if not (host == "facebook.com" or host.endswith(".facebook.com")):
            continue
        if "/static_resources/" in url or "rsrc.php" in url:
            continue
        path = url.split("?", 1)[0].split("facebook.com", 1)[-1]
        body = e["request"].get("postData", {}).get("text", "") or ""
        name = re.search(r"(?:^|&)fb_api_req_friendly_name=([^&]+)", body)
        status = e["response"]["status"]
        redirect = e["response"].get("redirectURL")
        if e["request"]["method"] == "GET" and not redirect and "html" not in e["response"]["content"].get("mimeType", ""):
            continue
        label = name.group(1) if name else path
        lines.append(f"{e['request']['method']} {status} {label}" + (f" -> {redirect.split('?', 1)[0]}" if redirect else "") + f" ({e['time']} ms)")
    return lines[:40]


def rea_copy(har: Path, entries: list[dict[str, Any]]) -> Path:
    """The HAR rea reads: the raw one (rule 19), or, over rea's 32 MB limit, a copy
    without the bodies of static scripts, styles, images and fonts (`reaNetwork.har`)."""
    if har.stat().st_size <= REA_MAX_BYTES:
        return har
    slim = []
    for e in entries:
        content = e["response"]["content"]
        if STATIC.search(content.get("mimeType", "")) and "text" in content:
            e = {**e, "response": {**e["response"], "content": {k: v for k, v in content.items() if k not in ("text", "encoding")}}}
        slim.append(e)
    copy = har.parent / "reaNetwork.har"
    copy.write_text(json.dumps({"log": {"version": "1.2", "creator": {"name": "log-cli inspect", "version": "1"}, "pages": [], "entries": slim}}), encoding="utf8")
    return copy


async def run_rea(har: Path) -> dict[str, Any]:
    """rea reads this step's HAR at once: rea as we go."""
    exe = shutil.which("rea")
    if not exe:
        return {"code": 127, "evidenceId": None, "detail": "rea not on PATH"}
    try:
        proc = await asyncio.create_subprocess_exec(exe, "inspect-web-network-capture", str(har), "har", "--format", "json",
                                                    stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
        out, err = await asyncio.wait_for(proc.communicate(), timeout=90)
    except Exception as exc:
        return {"code": 1, "evidenceId": None, "detail": type(exc).__name__}
    (har.parent / "rea.json").write_text(json.dumps({"code": proc.returncode, "stdout": out.decode("utf8", "replace"), "stderr": err.decode("utf8", "replace")}), encoding="utf8")
    try:
        parsed = json.loads(out)
        records = parsed.get("normalized_result", {}).get("records") or []
        return {"code": proc.returncode, "evidenceId": parsed.get("evidence_id"), "records": len(records)}
    except Exception:
        return {"code": proc.returncode, "evidenceId": None}


# What is typed in a field is never kept or shown: a sign-in leaves the email and password in
# the snapshot's textbox values (rule 21). Every field's value is replaced before anything is written.
FIELD_VALUE = re.compile(r'^(\s*- (?:textbox|searchbox|combobox|spinbutton)\b[^\n]*?):\s+\S.*$', re.M)


def redact_fields(snapshot: str) -> str:
    return FIELD_VALUE.sub(r"\1: <redacted>", snapshot)


INTERACTIVE = re.compile(r"\b(button|link|textbox|checkbox|radio|combobox|menuitem|tab|heading|dialog|alert)\b")


def read_login(path: str | None) -> dict[str, Any]:
    """The run's login.json (rule 21), read once; {} without one. Never logged."""
    if not path or not Path(path).is_file():
        return {}
    try:
        secrets = json.loads(Path(path).read_text(encoding="utf8"))
    except Exception:
        return {}
    return secrets if isinstance(secrets, dict) else {}


class Inspector:
    def __init__(self, config: dict[str, Any]) -> None:
        self.config = config
        self.secrets = read_login(config.get("loginPath"))
        self.folder: Path | None = None
        self.run_dir = Path(config["captureDir"]).parent
        self.steps_dir = self.run_dir / "steps"
        self.steps_dir.mkdir(parents=True, exist_ok=True)
        self.index = 0
        self.recorder = Recorder()
        self.page: Any = None
        self.context: Any = None

    async def step(self, action: str, label: str, act: Any, expect: str | None = None, expect_ms: int = 30_000) -> dict[str, Any]:
        """One step: note it, act, let the page settle, then record snapshot, screenshot, HAR and rea.
        With `expect` (a flow step's confirming request, e.g. ProfileCometProfilePictureSetMutation)
        the step also waits until Facebook was sent that request, up to `expect_ms`."""
        self.index += 1
        name = f"{self.index:02d}_{slug(action + ' ' + label)}"
        folder = self.steps_dir / name
        folder.mkdir(parents=True, exist_ok=True)
        self.folder = folder
        # proxyGate.log also writes the line to steps.jsonl, timed, next to the session HAR.
        log(f"step {self.index}: {action} {label}".rstrip())
        started = time.monotonic()
        error = None
        try:
            # The cursor is the step's while it acts; between steps it drifts (humanMouse, rule 32).
            self.mouse.preempt = True
            async with self.mouse.lock:
                self.mouse.preempt = False
                self.mouse.navigating = action in ("goto", "back")
                if self.mouse.navigating:
                    self.mouse.fresh_page = True
                try:
                    await act()
                finally:
                    self.mouse.navigating = False
        except Exception as exc:
            error = f"{type(exc).__name__}: {str(exc).splitlines()[0][:200] if str(exc) else ''}"
            log(f"  {action} failed: {error}")
        try:
            await self.page.wait_for_load_state("domcontentloaded", timeout=15_000)
        except Exception:
            pass
        # Settled when the network has been quiet for QUIET_MS: a fixed wait snapshotted half-drawn pages.
        settle_start = time.monotonic()
        count, quiet_since = self.recorder.seen(), time.monotonic()
        limit_ms = max(SETTLE_MAX_MS, expect_ms) if expect and not error else SETTLE_MAX_MS
        expect_seen = False
        while (time.monotonic() - settle_start) * 1000 < limit_ms:
            await asyncio.sleep(0.25)
            if expect and not expect_seen:
                expect_seen = expect in request_names(self.recorder.entries)
            now_count = self.recorder.seen()
            if now_count != count:
                count, quiet_since = now_count, time.monotonic()
            elif (time.monotonic() - quiet_since) * 1000 >= QUIET_MS and (not expect or expect_seen or error):
                break
        entries = await self.recorder.take()
        if expect and not expect_seen:
            expect_seen = expect in request_names(entries)
        if expect:
            log(f"  expected {expect}: {'sent' if expect_seen else 'NOT seen'}")
        har = folder / "network.har"
        har.write_text(json.dumps({"log": {"version": "1.2", "creator": {"name": "log-cli inspect", "version": "1"}, "pages": [], "entries": entries}}), encoding="utf8")
        try:
            snapshot = redact_fields(await self.page.locator("body").aria_snapshot(mode="ai"))
        except Exception as exc:
            snapshot = f"(no snapshot: {type(exc).__name__})"
        (folder / "snapshot.yml").write_text(snapshot, encoding="utf8")
        mouse = self.mouse.take()
        (folder / "mouseSamples.json").write_text(json.dumps(mouse.pop("recording")), encoding="utf8")
        (folder / "mouse.json").write_text(json.dumps(mouse), encoding="utf8")
        kinds: dict[str, int] = {}
        for leg in mouse["legs"]:
            kinds[leg["kind"]] = kinds.get(leg["kind"], 0) + 1
        log(f"  mouse: {', '.join(f'{n} {k}' for k, n in kinds.items()) or 'no legs'}; {mouse['idleMoves']} idle drift move(s)")
        try:
            await self.page.screenshot(path=str(folder / "screenshot.png"))
        except Exception:
            pass
        url = self.page.url.split("?", 1)[0]
        try:
            title = await self.page.title()
        except Exception:
            title = ""
        seen = notable(entries)
        log(f"  now on {url} \"{title}\" after {round((time.monotonic() - started) * 1000)} ms; {len(entries)} request(s)")
        for line in seen[:15]:
            log(f"    {line}")
        rea = await run_rea(rea_copy(har, entries))
        log(f"  rea read the step: exit {rea['code']}{', ' + rea['evidenceId'] if rea.get('evidenceId') else ''}")
        interactive = [l.strip() for l in snapshot.splitlines() if INTERACTIVE.search(l)][:80]
        log(f"  page has {len(interactive)} interactive element(s); snapshot: {folder / 'snapshot.yml'}")
        ok = error is None and (not expect or expect_seen)
        if error is None and expect and not expect_seen:
            error = f"expected request {expect} was not sent"
        return {"ok": ok, **({"error": error} if error else {}), **({"expect": {"name": expect, "seen": expect_seen}} if expect else {}),
                "step": name, "action": action, "args": [label] if label else [],
                "ms": round((time.monotonic() - started) * 1000), "url": url, "title": title,
                "requests": len(entries), "notable": seen, "mouse": {"legs": len(mouse["legs"]), "idleMoves": mouse["idleMoves"]}, "rea": rea, "interactive": interactive, "folder": str(folder)}

    async def first_visible(self, selector: str):
        found = self.page.locator(selector)
        for i in range(await found.count()):
            if await found.nth(i).is_visible():
                return found.nth(i)
        return None

    async def solve_text_captcha(self) -> None:
        """Facebook's "Enter the text from the image": 2Captcha's image solver, then type and send.
        The image is solved offline by 2Captcha (it never reaches Facebook), so no proxy is needed."""
        image = await self.first_visible('img[src*="captcha"], [id*="captcha"] img, [class*="captcha"] img')
        field = await self.first_visible('input[type="text"], input:not([type])')
        if image is None or field is None:
            raise RuntimeError("no captcha image or answer box on the page")
        key = (os.environ.get("TWOCAPTCHA_API_KEY") or os.environ.get("2CAPTCHA_API_KEY") or "").strip()
        if not key:
            raise RuntimeError("2CAPTCHA_API_KEY is not set")
        from twocaptcha import TwoCaptcha

        shot = self.folder / "captcha.png"
        await image.screenshot(path=str(shot))
        log("  2Captcha: submitting the text image")
        started = time.monotonic()
        result = await asyncio.to_thread(TwoCaptcha(key, defaultTimeout=180, pollingInterval=5).normal, str(shot))
        answer = str(result.get("code") or "").strip()
        took = round(time.monotonic() - started, 1)
        (self.folder / "solve.json").write_text(json.dumps({"solver": "2captcha", "kind": "textImage", "captchaId": result.get("captchaId"),
                                                            "answer": answer, "seconds": took}), encoding="utf8")
        log(f"  2Captcha answered {len(answer)} characters in {took} s (job {result.get('captchaId')})")
        if not answer:
            raise RuntimeError("2Captcha returned an empty answer")
        await field.click()
        await self.page.keyboard.type(answer, delay=90)
        await field.press("Enter")
        await asyncio.sleep(3)
        button = self.page.get_by_role("button", name=re.compile(r"^(continue|submit)$", re.I))
        if await button.count() and await button.first.is_visible() and await button.first.is_enabled():
            log("  Text captcha: Continue still there, clicking it.")
            await button.first.click(timeout=8000)

    async def sign_in(self) -> None:
        """Email and password from login.json into the page's own fields, then Enter. Values never logged."""
        password = self.secrets.get("password")
        pass_field = await self.first_visible(autoLogin.PASSWORD_FIELD)
        if pass_field is None or not password:
            raise RuntimeError("no password field on the page, or no password in Twenty")
        email_field = await self.first_visible(autoLogin.EMAIL_FIELD)
        if email_field is not None and self.secrets.get("email"):
            await email_field.click()
            await email_field.fill("")
            await email_field.press_sequentially(str(self.secrets["email"]), delay=90)
            log("  signIn: email typed")
        await pass_field.click()
        await pass_field.press_sequentially(str(password), delay=90)
        log("  signIn: password typed; submitting with Enter")
        await pass_field.press("Enter")

    async def enter_code(self) -> None:
        """The current authenticator code from totpSecret into the code field, then Enter."""
        secret = self.secrets.get("totpSecret")
        field = await self.first_visible(autoLogin.CODE_FIELD)
        if field is None or not secret:
            raise RuntimeError("no code field on the page, or no totpSecret in Twenty")
        await field.click()
        await field.press_sequentially(autoLogin.totp(str(secret)), delay=110)
        log("  code: typed the current authenticator code; submitting with Enter")
        await field.press("Enter")

    async def by_role(self, role: str, name: str, timeout_ms: int = 15_000):
        """The element a flow step names: role and accessible name, as the snapshot shows them (a ref
        only lives for one session). The last visible match wins: a dialog sits on top of the page."""
        deadline = time.monotonic() + timeout_ms / 1000
        while True:
            found = self.page.get_by_role(role, name=name, exact=True)
            for i in reversed(range(await found.count())):
                if await found.nth(i).is_visible():
                    return found.nth(i)
            if time.monotonic() > deadline:
                raise RuntimeError(f'no visible {role} "{name}"')
            await asyncio.sleep(0.5)

    async def handle(self, command: dict[str, Any]) -> dict[str, Any]:
        action = str(command.get("action") or "")
        args = [str(a) for a in command.get("args") or []]
        page = self.page
        expect = command.get("expect") or None
        expect_ms = int(command.get("expectMs") or 30_000)
        if action == "goto" and args:
            return await self.step("goto", args[0], lambda: page.goto(args[0], wait_until="domcontentloaded"), expect, expect_ms)
        # Flow steps (`log flow run`): the element by role and name, and the request that confirms it.
        if action == "clickRole" and len(args) >= 2:
            async def click_role() -> None:
                await self.mouse.click(await self.by_role(args[0], args[1]))
            return await self.step("clickRole", f'{args[0]} "{args[1]}"', click_role, expect, expect_ms)
        if action == "fillRole" and len(args) >= 3:
            async def fill_role() -> None:
                field = await self.by_role(args[0], args[1])
                await self.mouse.click(field, circle=False)
                await page.keyboard.press("Control+a")
                await field.press_sequentially(" ".join(args[2:]), delay=90)
            return await self.step("fillRole", f'{args[0]} "{args[1]}"', fill_role, expect, expect_ms)
        if action == "uploadRole" and len(args) >= 3:
            path = " ".join(args[2:])

            async def upload_role() -> None:
                if not Path(path).is_file():
                    raise RuntimeError("no such file")
                target = await self.by_role(args[0], args[1])
                async with page.expect_file_chooser(timeout=15_000) as chooser:
                    await self.mouse.click(target)
                await (await chooser.value).set_files(path)
                log(f"  upload: {Path(path).name} handed to the file chooser")
            return await self.step("uploadRole", f'{args[0]} "{args[1]}"', upload_role, expect, expect_ms)
        if action == "waitRole" and len(args) >= 2:
            async def wait_role() -> None:
                await self.by_role(args[0], args[1], timeout_ms=expect_ms)
            return await self.step("waitRole", f'{args[0]} "{args[1]}"', wait_role)
        if action == "snapshot":
            return await self.step("snapshot", "", lambda: asyncio.sleep(0))
        if action == "back":
            return await self.step("back", "", lambda: page.go_back(wait_until="domcontentloaded"))
        if action == "wait":
            seconds = float(args[0]) if args else 5
            return await self.step("wait", f"{seconds:g}s", lambda: asyncio.sleep(seconds))
        if action == "click" and args:
            return await self.step("click", args[0], lambda: self.mouse.click(page.locator(f"aria-ref={args[0]}")))
        if action == "highlight" and len(args) >= 2:
            async def highlight() -> None:
                box = await (await self.by_role(args[0], args[1])).bounding_box()
                if not box:
                    raise RuntimeError("the element has no box on screen")
                await self.mouse.circle(box)
            return await self.step("highlight", f'{args[0]} "{args[1]}"', highlight)
        if action == "type" and len(args) >= 2:
            text = " ".join(args[1:])
            return await self.step("type", args[0], lambda: page.locator(f"aria-ref={args[0]}").press_sequentially(text, delay=90))
        if action == "upload" and len(args) >= 2:
            path = " ".join(args[1:])

            async def choose() -> None:
                if not Path(path).is_file():
                    raise RuntimeError("no such file")
                async with page.expect_file_chooser(timeout=15_000) as chooser:
                    await self.mouse.click(page.locator(f"aria-ref={args[0]}"))
                await (await chooser.value).set_files(path)
                log(f"  upload: {Path(path).name} handed to the file chooser")

            return await self.step("upload", args[0], choose)
        if action == "signIn":
            return await self.step("signIn", "", self.sign_in)
        if action == "code":
            return await self.step("code", "", self.enter_code)
        if action == "solve":
            return await self.step("solve", "textCaptcha", self.solve_text_captcha)
        if action == "press" and args:
            return await self.step("press", args[0], lambda: page.keyboard.press(args[0]))
        return failure("badRequest", f"unknown or incomplete action: {action} {' '.join(args)}")

    async def serve(self) -> int:
        from camoufox.async_api import AsyncCamoufox

        commands = Path(self.config["commandsPath"])
        replies = Path(self.config["repliesPath"])
        commands.touch(exist_ok=True)
        state = Path(self.config["storageStatePath"])
        # humanMouse draws the cursor's every move (rule 32): humanize's own per-hop curve is kept tiny.
        async with AsyncCamoufox(**launch_kwargs({}, own_trajectory=True)) as browser:
            # The proxy gate's self-check runs inside new_context (rule 17); it adds the raw session HAR (rule 22).
            self.context = await browser.new_context(**({"storage_state": str(state)} if state.is_file() else {}))
            self.recorder.attach(self.context)
            self.page = await self.context.new_page()
            self.page.set_default_timeout(30_000)
            self.mouse = HumanMouse(self.page, log, busy=self.recorder.busy)
            # A closed window ends the session at once (a person closed it, or the browser went away).
            self.closed = False
            self.page.on("close", lambda _page: setattr(self, "closed", True))
            # --noIdleMouse: a person drives this window (recordMouse.py records their hand), so ours stays still.
            if self.config.get("idleMouse", True):
                self.mouse.start_idle()
            else:
                log("Our cursor stays still in this session (--noIdleMouse).")
            log("Inspect session open. Send steps with: log inspect do <action>.")
            # `log flow run` waits for this before its first step: commands sent earlier are skipped.
            with replies.open("a", encoding="utf8") as out:
                out.write(json.dumps({"id": "ready", "result": {"ok": True}}) + "\n")
            start = self.config.get("startUrl")
            if start:
                reply = await self.handle({"action": "goto", "args": [start]})
                with replies.open("a", encoding="utf8") as out:
                    out.write(json.dumps({"id": "start", "result": reply}) + "\n")
            offset = commands.stat().st_size
            last = time.monotonic()
            try:
                while time.monotonic() - last < IDLE_SECONDS:
                    await asyncio.sleep(0.3)
                    if self.closed:
                        log("The browser window was closed: stopping.")
                        return 0
                    size = commands.stat().st_size
                    if size <= offset:
                        continue
                    with commands.open("r", encoding="utf8") as source:
                        source.seek(offset)
                        chunk = source.read()
                    offset = size
                    for line in chunk.splitlines():
                        if not line.strip():
                            continue
                        last = time.monotonic()
                        try:
                            command = json.loads(line)
                        except json.JSONDecodeError:
                            continue
                        if command.get("action") == "stop":
                            with replies.open("a", encoding="utf8") as out:
                                out.write(json.dumps({"id": command.get("id"), "result": {"ok": True, "stopped": True, "steps": self.index}}) + "\n")
                            log(f"Stopping after {self.index} step(s).")
                            return 0
                        try:
                            result = await self.handle(command)
                        except proxyGate.GateError as exc:
                            result = failure(exc.code, exc.detail)
                        except Exception as exc:
                            result = failure("crashed", type(exc).__name__)
                        with replies.open("a", encoding="utf8") as out:
                            out.write(json.dumps({"id": command.get("id"), "result": result}) + "\n")
                log("Idle for 30 minutes: stopping.")
                return 0
            finally:
                await self.mouse.stop_idle()
                try:
                    await self.context.storage_state(path=str(state))
                except Exception as exc:
                    log(f"could not save the session state ({type(exc).__name__})")
                await self.context.close()


def main() -> int:
    try:
        config = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
    except json.JSONDecodeError as exc:
        print(json.dumps(failure("badConfig", str(exc))), flush=True)
        return 1
    proxyGate.arm(config.get("proxyPath"), config.get("devicePath"), config.get("captureDir"))
    try:
        return asyncio.run(Inspector(config).serve())
    except proxyGate.GateError as exc:
        log(f"Refused: {exc.code} {exc.detail}")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
