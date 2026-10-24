from __future__ import annotations

import asyncio
import random
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

import sys as _sys
from pathlib import Path as _Path

_sys.path.insert(0, str(_Path(__file__).resolve().parents[1]))
from login import autoLogin
from human import scrollMotion
from browser import proxyGate
from location.placeName import pick_suggestion, place_problem
from human.humanMouse import HumanMouse
from errors.errorCodes import failure
from browser.browserDriver import open_browser
from browser.harRecorder import MAX_BODY, STATIC, TEXT_TYPES, Recorder

IDLE_SECONDS = 30 * 60
QUIET_MS = 1500
SETTLE_MAX_MS = 15_000
REA_MAX_BYTES = 33_554_432
def log(message: str) -> None:
    proxyGate.log(message)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def slug(text: str) -> str:
    words = re.split(r"[^A-Za-z0-9]+", text)
    words = [w for w in words if w][:4]
    return "".join(w.lower() if i == 0 else w[:1].upper() + w[1:].lower() for i, w in enumerate(words)) or "step"


FRIENDLY_NAME = re.compile(r'(?:^|&)fb_api_req_friendly_name=([^&]+)|name="fb_api_req_friendly_name"\r?\n\r?\n([^\r\n]+)')


def request_names(entries: list[dict[str, Any]]) -> set[str]:
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
    exe = shutil.which("rea")
    if not exe:
        return {"code": 127, "evidenceId": None, "detail": "rea not on PATH"}
    try:
        proc = await asyncio.create_subprocess_exec(exe, "inspect-web-network-capture", str(har), "har", "--format", "json",
                                                    stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
        out, err = await asyncio.wait_for(proc.communicate(), timeout=90)
    except Exception as exc:
        return {"code": 1, "evidenceId": None, "detail": type(exc).__name__}
    try:
        parsed = json.loads(out)
        records = parsed.get("normalized_result", {}).get("records") or []
        result = {"code": proc.returncode, "evidenceId": parsed.get("evidence_id"), "records": len(records)}
    except Exception:
        result = {"code": proc.returncode, "evidenceId": None}
    (har.parent / "rea.json").write_text(json.dumps({**result, "stderr": err.decode("utf8", "replace")[:2000]}), encoding="utf8")
    return result


FIELD_VALUE = re.compile(r'^(\s*- (?:textbox|searchbox|combobox|spinbutton)\b[^\n]*?):\s+\S.*$', re.M)


def redact_fields(snapshot: str) -> str:
    return FIELD_VALUE.sub(r"\1: <redacted>", snapshot)


INTERACTIVE = re.compile(r"\b(button|link|textbox|checkbox|radio|combobox|menuitem|tab|heading|dialog|alert)\b")


def read_login(path: str | None) -> dict[str, Any]:
    if not path or not Path(path).is_file():
        return {}
    try:
        secrets = json.loads(Path(path).read_text(encoding="utf8"))
    except Exception:
        return {}
    return secrets if isinstance(secrets, dict) else {}


SELL_LOCATION = re.compile(r'"sell_location":\{"latitude":(-?[\d.]+),"longitude":(-?[\d.]+),"reverse_geocode_detailed":\{"city":"([^"]*)","postal_code":"([^"]*)","country_alpha_two":"([A-Z]{2})"')


def typing_ms(text: str) -> int:
    return max(30_000, len(text) * 250)


HITTABLE_JS = """(el) => {
  const r = el.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return false;
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return false;
  const hit = document.elementFromPoint(x, y);
  return !!hit && (hit === el || el.contains(hit));
}"""


def draw(spec: str) -> int:
    match = re.fullmatch(r"\s*(-?\d+)\s*(?:-\s*(-?\d+))?\s*", str(spec))
    if not match:
        raise ValueError(f"not a number or a range: {spec!r}")
    low, high = int(match.group(1)), int(match.group(2) or match.group(1))
    return random.randint(min(low, high), max(low, high))


VISIBLE_LINKS_JS = """(pattern) => {
  const re = new RegExp(pattern), seen = new Set(), out = [];
  for (const a of document.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href'), r = a.getBoundingClientRect();
    if (!href || seen.has(href) || !re.test(href) || r.width < 20 || r.height < 20 || r.bottom < 0 || r.top > innerHeight) continue;
    seen.add(href); out.push(href);
  }
  return out;
}"""

POST_OF_HEADING_JS = """(h) => {
  const likes = (el) => [...el.querySelectorAll('[role="button"][aria-label="Like"], [role="button"][aria-label="Remove Like"]')];
  let el = h.parentElement;
  while (el && el !== document.body) {
    const found = likes(el);
    if (found.length > 1) return null;
    if (found.length === 1) {
      const images = [...el.querySelectorAll('img[alt]')].map((i) => i.getAttribute('alt')).filter((a) => a && a.length > 3);
      return { text: (el.innerText || '').replace(/\\s+/g, ' ').trim(), images, liked: found[0].getAttribute('aria-label') === 'Remove Like' };
    }
    el = el.parentElement;
  }
  return null;
}"""

POST_HEADINGS = 'h4, [role="heading"][aria-level="4"]'

FEED_POSTS_JS = """() => {
  const out = [];
  const heads = [...document.querySelectorAll('h4, [role="heading"][aria-level="4"]')];
  heads.forEach((h, index) => {
    const post = (""" + POST_OF_HEADING_JS + """)(h);
    if (!post) return;
    out.push({ index, name: (h.innerText || '').replace(/\\s+/g, ' ').trim(), top: h.getBoundingClientRect().top, viewport: innerHeight, ...post });
  });
  return out;
}"""

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
        self.rea_tasks: set[asyncio.Task[None]] = set()
        self.popup: Any = None
        self.opts: dict[str, Any] = {}
        self.page: Any = None
        self.context: Any = None

    async def step(self, action: str, label: str, act: Any, expect: str | None = None, expect_ms: int = 30_000) -> dict[str, Any]:
        self.index += 1
        self.extra: dict[str, Any] = {}
        name = f"{self.index:02d}_{slug(action + ' ' + label)}"
        folder = self.steps_dir / name
        folder.mkdir(parents=True, exist_ok=True)
        self.folder = folder
        log(f"step {self.index}: {action} {label}".rstrip())
        started = time.monotonic()
        url_before = self.page.url
        pages_before = set(self.context.pages)
        error = None
        try:
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
        opts = getattr(self, "opts", {})
        quiet_ms = opts.get("quietMs") if opts.get("quietMs") is not None else (0 if action == "dwell" else QUIET_MS)
        settle_max_ms = opts.get("settleMaxMs") or SETTLE_MAX_MS
        settle_start = time.monotonic()
        if opts.get("urlChange") and not error:
            while self.page.url == url_before and (time.monotonic() - settle_start) * 1000 < settle_max_ms:
                await asyncio.sleep(0.05)
            quiet_ms = 0
        opened = [p for p in self.context.pages if p not in pages_before]
        if opened and not error:
            self.popup = opened[-1]
            try:
                await self.popup.wait_for_load_state("domcontentloaded", timeout=15_000)
            except Exception:
                pass
            self.extra["openedTab"] = self.popup.url.split("?", 1)[0]
            log(f"  opened a tab: {self.extra['openedTab']}")
        landed_ms = round((time.monotonic() - started) * 1000)
        count, quiet_since = self.recorder.seen(), time.monotonic()
        limit_ms = max(settle_max_ms, expect_ms) if expect and not error else (settle_max_ms if quiet_ms else 0)
        expect_seen = False
        while (time.monotonic() - settle_start) * 1000 < limit_ms:
            await asyncio.sleep(0.25)
            if expect and not expect_seen:
                expect_seen = expect in request_names(self.recorder.entries)
            now_count = self.recorder.seen()
            if now_count != count:
                count, quiet_since = now_count, time.monotonic()
            elif (time.monotonic() - quiet_since) * 1000 >= quiet_ms and (not expect or expect_seen or error):
                break
        entries = await self.recorder.take()
        if expect and not expect_seen:
            expect_seen = expect in request_names(entries)
        if expect:
            log(f"  expected {expect}: {'sent' if expect_seen else 'NOT seen'}")
        try:
            await self.page.screenshot(path=str(folder / "screenshot.png"))
        except Exception:
            pass
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
        url = self.page.url.split("?", 1)[0]
        try:
            title = await self.page.title()
        except Exception:
            title = ""
        seen = notable(entries)
        log(f"  now on {url} \"{title}\" after {round((time.monotonic() - started) * 1000)} ms; {len(entries)} request(s)")
        for line in seen[:15]:
            log(f"    {line}")
        if opts.get("reaLater"):
            task = asyncio.create_task(self.read_later(har, entries, name))
            self.rea_tasks.add(task)
            task.add_done_callback(self.rea_tasks.discard)
            rea = {"code": -1, "evidenceId": None, "pending": True}
        else:
            rea = await run_rea(rea_copy(har, entries))
            log(f"  rea read the step: exit {rea['code']}{', ' + rea['evidenceId'] if rea.get('evidenceId') else ''}")
        every = [l.strip() for l in snapshot.splitlines() if INTERACTIVE.search(l)]
        before = getattr(self, "last_interactive", None)
        fresh = [l for l in every if l not in before] if before is not None else every
        interactive = (fresh + [l for l in every if l in before] if before is not None else every)[:80]
        self.last_interactive = set(every)
        log(f"  page has {len(every)} interactive element(s), {len(fresh)} new since the last step; snapshot: {folder / 'snapshot.yml'}")
        ok = error is None and (not expect or expect_seen)
        if error is None and expect and not expect_seen:
            error = f"expected request {expect} was not sent"
        return {"ok": ok, **({"error": error} if error else {}), **({"expect": {"name": expect, "seen": expect_seen}} if expect else {}),
                "step": name, "action": action, "args": [label] if label else [],
                **getattr(self, "extra", {}),
                "ms": round((time.monotonic() - started) * 1000), "landedMs": landed_ms, "url": url, "title": title,
                "requests": len(entries), "notable": seen, "mouse": {"legs": len(mouse["legs"]), "idleMoves": mouse["idleMoves"]}, "rea": rea, "interactive": interactive, "interactiveTotal": len(every), "interactiveNew": len(fresh), "folder": str(folder)}

    async def read_later(self, har: Path, entries: list[dict[str, Any]], name: str) -> None:
        rea = await run_rea(rea_copy(har, entries))
        log(f"  rea read step {name}: exit {rea['code']}{', ' + rea['evidenceId'] if rea.get('evidenceId') else ''}")

    async def first_visible(self, selector: str):
        found = self.page.locator(selector)
        for i in range(await found.count()):
            if await found.nth(i).is_visible():
                return found.nth(i)
        return None

    async def solve_text_captcha(self) -> None:
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
            await self.mouse.click(button.first)
            return
        text = self.page.get_by_text(re.compile(r"^continue$", re.I)).last
        if await text.count() and await text.is_visible():
            log("  Text captcha: Continue is plain text here, clicking it.")
            await self.mouse.click(text)

    async def sign_in(self) -> None:
        password = self.secrets.get("password")
        pass_field = await self.first_visible(autoLogin.PASSWORD_FIELD)
        if pass_field is None or not password:
            raise RuntimeError("no password field on the page, or no password in Twenty")
        email_field = await self.first_visible(autoLogin.EMAIL_FIELD)
        if email_field is not None and self.secrets.get("email"):
            await self.mouse.click(email_field, circle=False)
            await email_field.fill("")
            await email_field.press_sequentially(str(self.secrets["email"]), delay=90)
            log("  signIn: email typed")
        await self.mouse.click(pass_field, circle=False)
        await pass_field.press_sequentially(str(password), delay=90)
        log("  signIn: password typed; submitting with Enter")
        before = self.page.url
        await pass_field.press("Enter")
        for _ in range(30):
            await asyncio.sleep(0.5)
            try:
                if self.page.url != before or await self.first_visible(autoLogin.PASSWORD_FIELD) is None:
                    break
            except Exception:
                break

    async def enter_code(self) -> None:
        secret = self.secrets.get("totpSecret")
        field = await self.first_visible(autoLogin.CODE_FIELD)
        if field is None or not secret:
            raise RuntimeError("no code field on the page, or no totpSecret in Twenty")
        await field.click()
        await field.press_sequentially(autoLogin.totp(str(secret)), delay=110)
        log("  code: typed the current authenticator code; submitting with Enter")
        await field.press("Enter")

    async def enter_pin(self) -> None:
        pin = str(self.secrets.get("messengerPin") or "")
        if not re.fullmatch(r"\d{6}", pin):
            raise RuntimeError("no 6-digit messengerPin in Twenty: matt sets it with log facebook messenger pin --account <a>")
        field = await self.first_visible('input[autocomplete="one-time-code"], input[inputmode="numeric"], input[type="password"], input[type="tel"], input[type="text"]')
        if field is not None:
            await self.mouse.click(field, circle=False)
        await self.page.keyboard.type(pin, delay=140)
        log("  pin: typed the account's Messenger PIN")

    async def by_role(self, role: str, name: str, timeout_ms: int = 15_000):
        deadline = time.monotonic() + timeout_ms / 1000
        while True:
            found = self.page.get_by_role(role, name=name, exact=True)
            visible = [found.nth(i) for i in range(await found.count()) if await found.nth(i).is_visible()]
            for candidate in reversed(visible):
                try:
                    if await candidate.evaluate(HITTABLE_JS):
                        return candidate
                except Exception:
                    continue
            if visible:
                return visible[-1]
            if time.monotonic() > deadline:
                raise RuntimeError(f'no visible {role} "{name}"')
            await asyncio.sleep(0.5)

    async def handle(self, command: dict[str, Any]) -> dict[str, Any]:
        action = str(command.get("action") or "")
        args = [str(a) for a in command.get("args") or []]
        page = self.page
        expect = command.get("expect") or None
        expect_ms = int(command.get("expectMs") or 30_000)
        self.opts = {k: command.get(k) for k in ("reaLater", "quietMs", "settleMaxMs", "urlChange", "findMs")}
        if action == "closeTab":
            async def close_tab() -> None:
                popup = getattr(self, "popup", None)
                self.popup = None
                if popup is not None and not popup.is_closed():
                    await popup.close()
                await self.page.bring_to_front()
            return await self.step("closeTab", "", close_tab)
        self.mouse.resting = bool(command.get("rest"))
        if action == "goto" and args:
            return await self.step("goto", args[0], lambda: page.goto(args[0], wait_until="domcontentloaded"), expect, expect_ms)
        if action == "clickRole" and len(args) >= 2:
            already = command.get("already")

            async def click_role() -> None:
                if already and await self.page.get_by_role(already[0], name=already[1], exact=True).count() and not await self.page.get_by_role(args[0], name=args[1], exact=True).count():
                    self.extra["already"] = f'{already[0]} "{already[1]}"'
                    log(f'  {args[0]} "{args[1]}" not needed: {already[0]} "{already[1]}" shows')
                    return
                await self.mouse.click(await self.by_role(args[0], args[1], int(self.opts.get("findMs") or 15_000)))
            return await self.step("clickRole", f'{args[0]} "{args[1]}"', click_role, expect, expect_ms)
        if action == "fillRole" and len(args) >= 3:
            async def fill_role() -> None:
                field = await self.by_role(args[0], args[1])
                await self.mouse.click(field, circle=False)
                await page.keyboard.press("Control+a")
                text = " ".join(args[2:])
                await field.press_sequentially(text, delay=90, timeout=typing_ms(text))
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
        if action == "scroll":
            times, px = (args + ["3-5", "300-600"][len(args):])[:2]

            async def scroll() -> None:
                for _ in range(draw(times)):
                    await scrollMotion.scroll_by(page, draw(px), self.mouse, log)
                    await asyncio.sleep(random.uniform(1.5, 3.5))
            return await self.step("scroll", f"{times} x {px}px", scroll)
        if action == "scrollIn" and len(args) >= 2:
            times, px = (args[2:] + ["2-3", "300-500"][len(args[2:]):])[:2]

            async def scroll_in() -> None:
                box = await (await self.by_role(args[0], args[1])).bounding_box()
                if not box:
                    raise RuntimeError(f'{args[0]} "{args[1]}" has no box on screen')
                await self.mouse.measure()
                for _ in range(draw(times)):
                    at = self.mouse.inside(box, 0.3, 0.7, 0.3, 0.8)
                    await scrollMotion.scroll_by(page, draw(px), self.mouse, log, at=at)
                    await asyncio.sleep(random.uniform(1.5, 3.5))
            return await self.step("scrollIn", f'{args[0]} "{args[1]}" {times} x {px}px', scroll_in)
        if action == "dwell":
            span = args[0] if args else "2-4"
            return await self.step("dwell", f"{span}s", lambda: asyncio.sleep(random.uniform(*[float(x) for x in (span.split("-") + [span])[:2]])))
        if action == "openAny" and args:
            pattern, count = (args + ["2-4"])[:2]

            async def open_any() -> None:
                hrefs = await page.evaluate(VISIBLE_LINKS_JS, pattern)
                random.shuffle(hrefs)
                chosen = hrefs[: draw(count)]
                if not chosen:
                    raise RuntimeError(f"no visible link matches {pattern}")
                for href in chosen:
                    await self.mouse.click(page.locator(f'a[href="{href}"]').first)
                    await page.wait_for_load_state("domcontentloaded")
                    await asyncio.sleep(random.uniform(2.0, 4.0))
                    await scrollMotion.scroll_by(page, random.randint(200, 500), self.mouse, log)
                    await asyncio.sleep(random.uniform(1.5, 3.0))
                    log(f"  openAny: read {href.split('?')[0]}")
                    await page.go_back(wait_until="domcontentloaded")
                    await asyncio.sleep(random.uniform(2.0, 3.0))
            return await self.step("openAny", f"{count} x {pattern}", open_any)
        if action == "clickAny" and len(args) >= 2:
            role, pattern, count = (args + ["1-2"])[:3]

            async def click_any() -> None:
                found = page.get_by_role(role, name=re.compile(pattern, re.I))
                options = []
                for i in range(min(await found.count(), 30)):
                    item = found.nth(i)
                    try:
                        if await item.is_visible() and (await item.get_attribute("aria-pressed")) != "true":
                            options.append(item)
                    except Exception:
                        continue
                hittable = []
                for item in options:
                    try:
                        if await item.evaluate(HITTABLE_JS):
                            hittable.append(item)
                    except Exception:
                        continue
                if hittable:
                    options = hittable
                random.shuffle(options)
                chosen = options[: draw(count)]
                if not chosen:
                    raise RuntimeError(f'no visible {role} named /{pattern}/')
                for item in chosen:
                    await scrollMotion.scroll_into_view(item, self.mouse, log)
                    await asyncio.sleep(random.uniform(0.8, 1.5))
                    await self.mouse.click(item)
                    await asyncio.sleep(random.uniform(1.0, 2.0))
                log(f"  clickAny: {len(chosen)} {role} /{pattern}/")
            return await self.step("clickAny", f'{count} x {role} /{pattern}/', click_any)
        if action == "saveState":
            async def save_state() -> None:
                await self.context.storage_state(path=str(self.config["storageStatePath"]))
            return await self.step("saveState", "", save_state)
        if action == "nextPost":
            async def next_post() -> None:
                read = getattr(self, "read_posts", set())
                posts = await page.evaluate(FEED_POSTS_JS)
                for post in posts:
                    name = post["name"]
                    if not name or name in read or post["top"] < 40:
                        continue
                    distance = post["top"] - post["viewport"] * 0.2
                    if distance > 40:
                        await scrollMotion.scroll_by(page, int(distance), self.mouse, log)
                    read.add(name)
                    self.read_posts = read
                    self.post = page.locator(POST_HEADINGS).filter(has_text=name[:60]).first
                    words = len(post["text"].split())
                    self.extra = {"post": {"heading": name[:200], "text": post["text"][:1500], "images": post["images"][:6], "words": words, "liked": post["liked"]}}
                    log(f'  post: "{name[:80]}", {words} words, {len(post["images"])} image(s), scrolled {int(max(distance, 0))} px')
                    return
                await scrollMotion.scroll_by(page, random.randint(500, 800), self.mouse, log)
                self.extra = {"post": None}
            return await self.step("nextPost", "", next_post)
        if action in ("likePost", "postButton"):
            name = "Like" if action == "likePost" else (args[0] if args else "")

            async def post_button() -> None:
                post = getattr(self, "post", None)
                if post is None:
                    raise RuntimeError("no post in view: nextPost first")
                block = post.locator("xpath=ancestor::*[.//*[@role='button' and (@aria-label='Like' or @aria-label='Remove Like')]][1]")
                button = block.get_by_role("button", name=name, exact=True).first
                if not await button.count():
                    raise RuntimeError(f'no button "{name}" in this post')
                await self.mouse.click(button)
            return await self.step(action, name, post_button)
        if action == "pageText":
            async def page_text() -> None:
                text = await page.evaluate("() => document.body ? document.body.innerText : ''")
                self.extra = {"text": " ".join(str(text).split())[:4000]}
            return await self.step("pageText", "", page_text)
        if action == "sellLocation":
            async def sell_location() -> None:
                match = SELL_LOCATION.search(await page.content())
                if match:
                    lat, lng, city, postal, country = match.groups()
                    self.extra = {"sellLocation": {"city": city, "postalCode": postal, "country": country}}
                else:
                    self.extra = {"sellLocation": None}
            return await self.step("sellLocation", "", sell_location)
        if action == "setLocation" and args:
            place = " ".join(args).strip()
            problem = place_problem(place)

            async def set_location() -> None:
                if problem:
                    raise RuntimeError(f"locationAbbreviated: {problem}; nothing was typed")
                answers: list[list[str]] = []

                async def on_response(response: Any) -> None:
                    try:
                        if "MarketplaceSearchAddressDataSourceQuery" not in (response.request.post_data or ""):
                            return
                        text = await response.text()
                        answers.append([json.loads(f'"{a}"') for a in re.findall(r'"single_line_address":"((?:[^"\\]|\\.)*)"', text)])
                    except Exception:
                        pass

                page.on("response", on_response)
                await page.goto("https://www.facebook.com/marketplace/", wait_until="domcontentloaded")
                button = page.get_by_role("button", name=re.compile(r"^Location: "))
                await button.first.wait_for(state="visible", timeout=30_000)
                await self.mouse.click(button.first)
                dialog = page.get_by_role("dialog", name="Change location")
                await dialog.wait_for(state="visible", timeout=15_000)
                box = dialog.get_by_role("combobox", name="Location")
                await self.mouse.click(box, circle=False)
                await page.keyboard.press("Control+a")
                await page.keyboard.press("Backspace")
                await page.keyboard.type(place, delay=90)
                await asyncio.sleep(2.5)
                page.remove_listener("response", on_response)
                offered = answers[-1] if answers else []
                index = pick_suggestion(place, offered)
                if index is None:
                    await page.keyboard.press("Escape")
                    raise RuntimeError(f"no suggestion is {place!r} (Facebook offered {offered[:6]}); nothing was set")
                log(f"  setLocation: {place!r} is suggestion {index + 1} of {len(offered)}")
                option = page.get_by_role("option", name=re.compile(r"^" + re.escape(offered[index]) + r"(\s|$)", re.I))
                if not await option.count() or not await option.first.is_visible():
                    await page.keyboard.press("Backspace")
                    await page.keyboard.type(place[-1], delay=90)
                    await asyncio.sleep(2.5)
                await option.first.wait_for(state="visible", timeout=15_000)
                await self.mouse.click(option.first)
                await asyncio.sleep(1.2)
                apply = dialog.get_by_role("button", name="Apply")
                if await apply.is_disabled():
                    raise RuntimeError(f"no suggestion was picked for {place}")
                async with page.expect_response(lambda r: "CometMarketplaceSetBuyLocationMutation" in (r.request.post_data or ""), timeout=20_000) as saved:
                    await self.mouse.click(apply)
                if (await saved.value).status != 200:
                    raise RuntimeError("CometMarketplaceSetBuyLocationMutation was not accepted")
                await asyncio.sleep(2.5)
            return await self.step("setLocation", place, set_location)
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
            return await self.step("type", args[0], lambda: page.locator(f"aria-ref={args[0]}").press_sequentially(text, delay=90, timeout=typing_ms(text)))
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
        if action == "pin":
            return await self.step("pin", "", self.enter_pin)
        if action == "solve":
            return await self.step("solve", "textCaptcha", self.solve_text_captcha)
        if action == "press" and args:
            return await self.step("press", args[0], lambda: page.keyboard.press(args[0]))
        return failure("badRequest", f"unknown or incomplete action: {action} {' '.join(args)}")

    def watch_navigations(self, page: Any) -> None:
        def navigated(frame: Any) -> None:
            if frame != page.main_frame:
                return
            event = {"url": frame.url, "at": now_iso()}
            with (self.run_dir / "navigations.jsonl").open("a", encoding="utf8") as out:
                out.write(json.dumps(event) + "\n")

        page.on("framenavigated", navigated)

    async def serve(self) -> int:
        commands = Path(self.config["commandsPath"])
        replies = Path(self.config["repliesPath"])
        commands.touch(exist_ok=True)
        async with open_browser(self.config, own_trajectory=True) as opened:
            log(f"Browser: {opened.driver}")
            self.context = opened.context
            self.recorder.attach(self.context)
            self.page = await self.context.new_page()
            self.page.set_default_timeout(30_000)
            self.mouse = HumanMouse(self.page, log, busy=self.recorder.busy)
            self.closed = False
            self.page.on("close", lambda _page: setattr(self, "closed", True))
            self.watch_navigations(self.page)
            self.context.on("page", self.watch_navigations)
            if self.config.get("idleMouse", True):
                self.mouse.start_idle()
            else:
                log("Our cursor stays still in this session (--noIdleMouse).")
            log("Inspect session open. Send steps with: log inspect do <action>.")
            with replies.open("a", encoding="utf8") as out:
                out.write(json.dumps({"id": "ready", "result": {"ok": True}}) + "\n")
            offset = commands.stat().st_size
            start = self.config.get("startUrl")
            if start:
                reply = await self.handle({"action": "goto", "args": [start]})
                with replies.open("a", encoding="utf8") as out:
                    out.write(json.dumps({"id": "start", "result": reply}) + "\n")
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
                if self.rea_tasks:
                    log(f"waiting for rea on {len(self.rea_tasks)} step(s) before closing")
                    await asyncio.wait(set(self.rea_tasks), timeout=180)
                try:
                    await self.context.storage_state(path=str(self.config["storageStatePath"]))
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
