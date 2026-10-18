"""log-cli's publish session: one Camoufox browser, driven step by step.

`marketplace/publish/machine.ts` (XState) decides; this file only acts. The
TypeScript side starts it once per publish and sends one JSON request per
line on stdin:

    {"id": 1, "step": "open", "params": {"recheck": false}}

and reads one JSON line back on stdout:

    {"id": 1, "result": {...}}

argv[1] is the session config: {"accountId", "storageStatePath", "formUrl",
"receiptDir", "proxyPath"}. The browser is always headed, humanized, with the
cursor shown (visibleBrowser.py, rule 11), and only opens through the
account's proxy, from the account's country (proxyGate.py, rule 12). Progress goes to stderr. Anything a
library prints is moved to stderr too, so stdout only carries replies.

Why sync Playwright: CaptchaKraken's Python page solver (PyPI
`captchakraken`) drives sync Playwright pages only, and the captcha has to be
solved on the very page the form is on.

Every selector and step is cited in docs/listingPublish/formFill.md. Every
failure code is in the error catalog (errorCodes.py, errorCatalog.json).
"""
from __future__ import annotations

import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse

from errorCodes import checked, failure
import proxyGate
from visibleBrowser import launch_kwargs

CREATE_URL = "https://www.facebook.com/marketplace/create/item?locale=en_US"
SELLING_URL = "https://www.facebook.com/marketplace/you/selling"

LIMIT_TEXT = re.compile(
    r"daily listing limit|reached (?:your|the) (?:daily )?limit|you can.t (?:create|post) (?:more )?listings"
    r"|limit on how many listings", re.I)
# The whole account, not just Marketplace: log-cli marks it BANNED and replaces its campaign listings.
DISABLED_TEXT = re.compile(r"(?:your )?account has been (?:disabled|locked|suspended)|we suspended your account", re.I)
BLOCKED_TEXT = re.compile(r"you can.t (?:use|buy or sell on) marketplace|marketplace isn.t available to you", re.I)
CHALLENGE_TEXT = re.compile(
    r"confirm (?:your identity|it.s you)|enter the code|we sent (?:a|you a) code|upload a (?:photo|video) of yourself"
    r"|security check|suspicious activity", re.I)
OOPS_TEXT = re.compile(r"\boops\b|something went wrong", re.I)
PUBLISHED_TEXT = re.compile(r"listing (?:is )?published|your listing is (?:now )?(?:live|published)|listed on marketplace", re.I)
PHOTO_COUNT_JS = """() => {
  const text = (document.querySelector('[role="main"]') || document.body).innerText || '';
  const m = text.match(/(\\d+)\\s*\\/\\s*10/);
  return m ? Number(m[1]) : null;
}"""
# Same card extractor as logWorker.py scan (facebook-camofox-client scan_selling.py).
EXTRACT_JS = """() => {
  const seen = new Map();
  for (const a of document.querySelectorAll('a[href*="/marketplace/item/"]')) {
    const href = a.getAttribute('href') || '';
    const m = href.match(/\\/item\\/(\\d+)/);
    if (!m || seen.has(m[1])) continue;
    let el = a, cardText = '';
    for (let i = 0; i < 8 && el; i++) {
      el = el.parentElement;
      if (el && (el.innerText || '').length > (cardText || '').length) cardText = el.innerText;
      if (cardText && cardText.length > 300) break;
    }
    seen.set(m[1], {id: m[1], href, card: (cardText || '').slice(0, 600)});
  }
  return [...seen.values()];
}"""
INJECT_RECAPTCHA_JS = """(token) => {
  let n = 0;
  for (const t of document.querySelectorAll('#g-recaptcha-response, textarea[name="g-recaptcha-response"]')) {
    t.style.display = 'block'; t.value = token; n++;
  }
  if (typeof window.successCallback === 'function') { try { window.successCallback(token); n++; } catch (e) {} }
  const cfg = window.___grecaptcha_cfg;
  if (cfg && cfg.clients) {
    const walk = (o, depth) => {
      if (!o || depth > 4) return;
      for (const k of Object.keys(o)) {
        const v = o[k];
        if (v && typeof v === 'object') {
          if (typeof v.callback === 'function') { try { v.callback(token); n++; } catch (e) {} }
          walk(v, depth + 1);
        }
      }
    };
    walk(cfg.clients, 0);
  }
  return n;
}"""
INJECT_ARKOSE_JS = """(token) => {
  let n = 0;
  for (const el of document.querySelectorAll('input[name="fc-token"], #FunCaptcha-Token, input[name="verification-token"], input[name="arkose_token"]')) {
    el.value = token; n++;
  }
  return n;
}"""
DISABLED_JS = "e => e.getAttribute('aria-disabled') === 'true'"


def log(message: str) -> None:
    print(message, file=sys.stderr, flush=True)


def norm(text: str | None) -> str:
    """Dash-insensitive, case-insensitive, whitespace-collapsed (FCC form_driver)."""
    return re.sub(r"\s+", " ", re.sub(r"[–—−]", "-", text or "")).strip().lower()


def fail(code: str, detail: str = "") -> dict[str, Any]:
    return failure(code, detail)


# Combobox name -> the code for a pick that did not stick.
NOT_SET_CODES = {"Category": "categoryNotSet", "Condition": "conditionNotSet"}

# CaptchaKraken: hosted API `ck_error.code` (captchakraken.kinds.ErrorCode) and
# exception class names -> catalog codes.
KRAKEN_CODES = {
    "missing_api_key": "missingApiKey",
    "invalid_api_key": "invalidApiKey",
    "account_suspended": "solverAccountSuspended",
    "insufficient_credits": "insufficientCredits",
    "rate_limited": "solverRateLimited",
    "solve_abandoned": "solveAbandoned",
    "unrecognized_prompt": "unrecognizedPrompt",
    "invalid_request": "solverBadRequest",
    "request_too_large": "requestTooLarge",
    "upstream_unavailable": "upstreamUnavailable",
    "NoCaptchaFoundError": "noWidget",
    "VendorBlockedError": "vendorBlocked",
    "UnsupportedChallengeError": "unsupportedChallenge",
    "PageClosedError": "pageClosed",
    "AnimatedChallengeError": "animatedChallenge",
}

# 2Captcha error text -> catalog codes, first match wins.
TWOCAPTCHA_CODES = (
    ("ZERO_BALANCE", "insufficientCredits"),
    ("WRONG_USER_KEY", "invalidApiKey"),
    ("KEY_DOES_NOT_EXIST", "invalidApiKey"),
    ("UNSOLVABLE", "unsolvable"),
    ("TIMEOUT", "solverTimeout"),
    ("IP_BANNED", "solverAccountSuspended"),
)


class Session:
    def __init__(self, config: dict[str, Any]) -> None:
        self.config = config
        self.runtime = None
        self.browser = None
        self.context = None
        self.page = None

    # -- lifecycle ---------------------------------------------------------
    def start(self) -> dict[str, Any] | None:
        state = Path(self.config.get("storageStatePath") or "")
        if not state.is_file():
            return {"kind": "issue", "issue": checked("neverConnected"), "detail": f"no saved session at {state}. Run: log connect --account <id>"}
        from camoufox.sync_api import Camoufox

        # Proxy gate (rule 12), then headed, humanize 1.5s, cursor shown (rule 11). Never configurable.
        self.runtime = Camoufox(**launch_kwargs({}))
        self.browser = self.runtime.__enter__()
        self.context = self.browser.new_context(storage_state=str(state))
        self.page = self.context.new_page()
        self.page.set_default_timeout(30_000)
        return None

    def close(self) -> None:
        try:
            if self.context is not None:
                self.context.close()
        finally:
            if self.runtime is not None:
                self.runtime.__exit__(None, None, None)
            self.context = self.browser = self.runtime = self.page = None

    # -- page reading ------------------------------------------------------
    def body(self, limit: int = 6000) -> str:
        try:
            return (self.page.locator("body").inner_text(timeout=5000) or "")[:limit]
        except Exception:
            return ""

    def login_wall(self) -> bool:
        url = self.page.url.lower()
        if "/login" in url:
            return True
        try:
            return self.page.locator('input[name="email"]').count() > 0 and self.page.locator('input[name="pass"]').count() > 0
        except Exception:
            return False

    def detect_captcha(self) -> dict[str, Any] | None:
        """Which captcha is on screen, read from frame URLs (never clicks)."""
        for frame in self.page.frames:
            url = frame.url or ""
            low = url.lower()
            if "arkoselabs.com" in low or "funcaptcha.com" in low:
                pk = parse_qs(urlparse(url).query).get("pk", [None])[0]
                if not pk:
                    m = re.search(r"/v2/([0-9A-F-]{20,})/", url, re.I)
                    pk = m.group(1) if m else None
                return {"kind": "arkose", "siteKey": pk, "frameUrl": url[:300], "detail": "Arkose frame"}
        for frame in self.page.frames:
            url = frame.url or ""
            low = url.lower()
            if "google.com/recaptcha" in low or "recaptcha.net" in low:
                key = parse_qs(urlparse(url).query).get("k", [None])[0]
                return {"kind": "recaptcha", "enterprise": "/enterprise" in low, "siteKey": key,
                        "frameUrl": url[:300], "detail": "reCAPTCHA frame"}
        for frame in self.page.frames:
            if "fbsbx.com/captcha" in (frame.url or "").lower():
                return {"kind": "recaptcha", "enterprise": True, "siteKey": None,
                        "frameUrl": frame.url[:300], "detail": "FB captcha frame (fbsbx.com)"}
        try:
            if self.page.locator("iframe#captcha-recaptcha").count() > 0:
                return {"kind": "recaptcha", "enterprise": True, "siteKey": None, "frameUrl": None,
                        "detail": "iframe#captcha-recaptcha"}
        except Exception:
            pass
        if "/checkpoint" in self.page.url.lower() and CHALLENGE_TEXT.search(self.body()):
            return {"kind": "facebookChallenge", "detail": "checkpoint page: " + CHALLENGE_TEXT.search(self.body()).group(0)}
        return None

    # -- low-level form mechanics (sync ports of FCC form_driver.py) --------
    def portal_visible(self, opener=None) -> bool:
        try:
            self.page.locator('div[role="listbox"], div[role="dialog"], div[role="menu"], ul[role="listbox"]').first.wait_for(
                state="visible", timeout=1500)
            return True
        except Exception:
            pass
        if opener is not None:
            try:
                return opener.evaluate("e => e.getAttribute('aria-expanded') === 'true'")
            except Exception:
                return False
        return False

    def open_combobox(self, name: str):
        opener = self.page.locator('label[role="combobox"]', has_text=re.compile(name, re.I)).first
        if opener.count() == 0:
            return None
        opener.scroll_into_view_if_needed()
        if self.portal_visible(opener):
            return opener
        attempts = [opener.locator("i, svg").first]
        inners = opener.locator("div, span")
        attempts += [inners.nth(i) for i in range(min(inners.count(), 6))]
        attempts.append(opener)
        for target in attempts:
            try:
                if target.count() == 0:
                    continue
                target.click(timeout=4000)
                if self.portal_visible(opener):
                    return opener
            except Exception:
                pass
            self.page.keyboard.press("Escape")
        for key in ("ArrowDown", "Enter", "Space"):
            try:
                opener.focus(timeout=2000)
                self.page.keyboard.press(key)
                if self.portal_visible(opener):
                    return opener
            except Exception:
                pass
            self.page.keyboard.press("Escape")
        return None

    def pick_option(self, want: str) -> bool:
        options = self.page.locator('div[role="listbox"] [role="option"]')
        want_n = norm(want)
        if options.count() > 0:
            for exact in (True, False):
                for i in range(options.count()):
                    try:
                        text = norm(options.nth(i).inner_text())
                        if (text == want_n) if exact else (want_n in text or text in want_n):
                            options.nth(i).click(timeout=5000)
                            return True
                    except Exception:
                        continue
            return False
        # Category is a taxonomy dialog: search, then click the matching button.
        try:
            dialog = self.page.locator('div[role="dialog"]').last
            if dialog.count() > 0 and dialog.is_visible():
                search = dialog.locator('input[placeholder*="Search"], input[type="search"], input[type="text"]').first
                if search.count() > 0:
                    search.click(timeout=4000)
                    search.fill("", timeout=4000)
                    search.type(want, delay=30)
                    self.page.wait_for_timeout(1500)
                button = dialog.get_by_role("button", name=re.compile(re.escape(want), re.I)).first
                if button.count() == 0:
                    button = self.page.get_by_role("button", name=re.compile(re.escape(want), re.I)).first
                button.wait_for(state="visible", timeout=8000)
                button.click(timeout=5000)
                return True
        except Exception:
            pass
        return False

    def combobox_value(self, name: str) -> str:
        try:
            return self.page.locator('label[role="combobox"]', has_text=re.compile(name, re.I)).first.inner_text(timeout=3000)
        except Exception:
            return ""

    def select_combobox(self, name: str, value: str) -> dict[str, Any]:
        """Open, pick, then READ BACK (FB restores drafts: spike_marketplace_e2e.py:303-312)."""
        for attempt in range(3):
            if norm(value) in norm(self.combobox_value(name)):
                return {"ok": True, "value": value}
            opener = self.open_combobox(name)
            if opener is None:
                self.page.keyboard.press("Escape")
                self.page.wait_for_timeout(1500)
                continue
            picked = self.pick_option(value)
            self.page.wait_for_timeout(1000)
            self.page.keyboard.press("Escape")
            if picked and norm(value) in norm(self.combobox_value(name)):
                return {"ok": True, "value": value}
            log(f"{name}: pick {attempt + 1}/3 did not stick ({self.combobox_value(name)!r})")
        return fail(NOT_SET_CODES[name], f"{name} still reads {self.combobox_value(name)!r}")

    def field(self, label: str, tag: str = "input"):
        loc = self.page.locator(f'label:has-text("{label}") {tag}').first
        if loc.count() > 0:
            return loc
        loc = self.page.locator(f'{tag}[aria-label="{label}"]').first
        return loc if loc.count() > 0 else None

    def type_and_check(self, loc, value: str, check, delay: int = 20) -> bool:
        """Type like a person, read the value back, fall back to fill + input event (spike :54-60)."""
        loc.scroll_into_view_if_needed()
        loc.click(timeout=8000)
        self.page.keyboard.press("ControlOrMeta+A")
        self.page.keyboard.press("Backspace")
        self.page.keyboard.type(value, delay=delay)
        if check(loc.input_value()):
            return True
        loc.fill(value)
        loc.evaluate("e => e.dispatchEvent(new Event('input', {bubbles: true}))")
        return check(loc.input_value())

    def click_when_enabled(self, pattern: re.Pattern, timeout_ms: int = 15000) -> bool:
        """div[role=button] never becomes Playwright-enabled: poll aria-disabled (FCC form_driver.py:144-178)."""
        deadline = time.monotonic() + timeout_ms / 1000
        while time.monotonic() < deadline:
            buttons = self.page.get_by_role("button", name=pattern)
            for i in range(buttons.count()):
                button = buttons.nth(i)
                try:
                    if button.is_visible() and not button.evaluate(DISABLED_JS):
                        button.scroll_into_view_if_needed()
                        button.click(timeout=8000)
                        return True
                except Exception:
                    continue
            self.page.wait_for_timeout(500)
        return False


# -- steps ----------------------------------------------------------------
def step_open(s: Session, params: dict[str, Any]) -> dict[str, Any]:
    if s.page is None:
        problem = s.start()
        if problem:
            return problem
    if not params.get("recheck"):
        url = s.config.get("formUrl") or CREATE_URL
        log(f"Opening {url}")
        try:
            s.page.goto(url, wait_until="domcontentloaded", timeout=90_000)
        except Exception:
            s.page.goto(url, wait_until="commit", timeout=60_000)
        s.page.wait_for_timeout(3000)
    else:
        s.page.wait_for_timeout(2500)

    if s.login_wall():
        return {"kind": "issue", "issue": checked("sessionExpired"), "detail": s.page.url}
    captcha = s.detect_captcha()
    if captcha:
        log(f"Captcha on screen: {captcha['kind']} ({captcha.get('detail')})")
        return {"kind": "captcha", "detection": captcha}
    if "/checkpoint" in s.page.url.lower():
        return {"kind": "issue", "issue": checked("checkpointed"), "detail": s.page.url}
    text = s.body()
    if DISABLED_TEXT.search(text):
        return {"kind": "issue", "issue": checked("accountDisabled"), "detail": DISABLED_TEXT.search(text).group(0)}
    if BLOCKED_TEXT.search(text):
        return {"kind": "issue", "issue": checked("suspended"), "detail": BLOCKED_TEXT.search(text).group(0)}
    if LIMIT_TEXT.search(text):
        return {"kind": "issue", "issue": checked("rateLimited"), "detail": LIMIT_TEXT.search(text).group(0)}

    # Listing-type picker (Listaro facebook-poster.ts:1118-1154).
    try:
        item = s.page.get_by_text(re.compile(r"^Item for sale$", re.I)).first
        if item.count() > 0 and item.is_visible():
            item.click(timeout=5000)
            s.page.wait_for_timeout(2500)
    except Exception:
        pass
    # If we were sent back home after a captcha, go to the form again.
    if params.get("recheck") and "marketplace/create" not in s.page.url and not s.config.get("formUrl"):
        s.page.goto(CREATE_URL, wait_until="domcontentloaded", timeout=90_000)
        s.page.wait_for_timeout(3000)
    try:
        s.page.locator('label:has-text("Title") input, input[aria-label="Title"]').first.wait_for(state="visible", timeout=15_000)
    except Exception:
        return {"kind": "error", "code": checked("formNotFound"), "detail": f"no Title field on {s.page.url}"}
    return {"kind": "ready", "url": s.page.url}


def kraken_code(exc: Exception) -> str:
    code = getattr(exc, "code", None)
    key = code if isinstance(code, str) and code else type(exc).__name__
    return KRAKEN_CODES.get(key, "solveError")


def solve_kraken(s: Session, detection: dict[str, Any]) -> dict[str, Any]:
    try:
        from captchakraken.kinds import HumanizationMode
        from captchakraken.page_solver import PageSolver, PageSolverConfig
    except Exception as exc:
        return {"solved": False, "code": checked("notInstalled"), "detail": f"pip install captchakraken ({exc})"}
    # Camoufox already humanizes; running both took 82 s vs 13 s (CaptchaKraken docs/usage.md).
    solver = PageSolver(PageSolverConfig(humanization=HumanizationMode.NONE))
    try:
        result = solver.solve(s.page)
    except Exception as exc:
        return {"solved": False, "code": checked(kraken_code(exc)), "detail": str(exc)[:300]}
    verdicts = [f"{getattr(v, 'vendor', '?')}:{getattr(v, 'verdict', '?')}" for v in (result.verdicts or [])]
    return {"solved": bool(result.is_solved), "detail": f"verdicts={verdicts}"}


def twocaptcha_code(exc: Exception) -> str:
    text = str(exc).upper()
    for needle, code in TWOCAPTCHA_CODES:
        if needle in text:
            return code
    return "solveError"


def solve_twocaptcha(s: Session, detection: dict[str, Any]) -> dict[str, Any]:
    key = (os.environ.get("TWOCAPTCHA_API_KEY") or os.environ.get("2CAPTCHA_API_KEY") or "").strip()
    if not key:
        return {"solved": False, "code": checked("missingApiKey"), "detail": "2CAPTCHA_API_KEY (or TWOCAPTCHA_API_KEY) is not set"}
    try:
        from twocaptcha import TwoCaptcha
    except Exception as exc:
        return {"solved": False, "code": checked("notInstalled"), "detail": f"pip install 2captcha-python ({exc})"}
    solver = TwoCaptcha(key, defaultTimeout=180, recaptchaTimeout=600, pollingInterval=5)
    site_key = detection.get("siteKey")
    try:
        if detection["kind"] == "recaptcha":
            if not site_key:
                # FB's fbsbx wrapper hides the key; the anchor frame carries it (Listaro read it via CDP targets).
                for frame in s.page.frames:
                    match = re.search(r"[?&]k=([^&]+)", frame.url or "")
                    if match and "recaptcha" in (frame.url or ""):
                        site_key = match.group(1)
                        break
            if not site_key:
                return {"solved": False, "code": checked("noSiteKey"), "detail": "no reCAPTCHA site key in any frame URL"}
            log("2Captcha: submitting reCAPTCHA" + (" Enterprise" if detection.get("enterprise") else ""))
            token = solver.recaptcha(sitekey=site_key, url=s.page.url, enterprise=1 if detection.get("enterprise") else 0)["code"]
            js = INJECT_RECAPTCHA_JS
        else:
            if not site_key:
                return {"solved": False, "code": checked("noSiteKey"), "detail": "no Arkose public key in the frame URL"}
            surl = None
            if detection.get("frameUrl"):
                parsed = urlparse(detection["frameUrl"])
                surl = f"{parsed.scheme}://{parsed.netloc}"
            log("2Captcha: submitting Arkose (unproven on Facebook)")
            kwargs = {"sitekey": site_key, "url": s.page.url}
            if surl:
                kwargs["surl"] = surl
            token = solver.funcaptcha(**kwargs)["code"]
            js = INJECT_ARKOSE_JS
    except Exception as exc:
        return {"solved": False, "code": checked(twocaptcha_code(exc)), "detail": str(exc)[:300]}

    injected = 0
    for frame in s.page.frames:
        try:
            injected += int(frame.evaluate(js, token) or 0)
        except Exception:
            continue
    # Token values never reach logs or results: only their length.
    if injected == 0:
        return {"solved": False, "code": checked("notInjected"), "detail": f"token ({len(token)} chars) found no field to go into"}
    s.page.wait_for_timeout(6000)
    return {"solved": True, "detail": f"token {len(token)} chars into {injected} place(s)"}


def step_solve_captcha(s: Session, params: dict[str, Any]) -> dict[str, Any]:
    detection = params.get("detection") or {}
    solver = params.get("solver")
    log(f"Solving {detection.get('kind')} with {solver}")
    if solver == "captchaKraken":
        return solve_kraken(s, detection)
    if solver == "twoCaptcha":
        return solve_twocaptcha(s, detection)
    return {"solved": False, "code": checked("unknownSolver"), "detail": str(solver)}


def step_set_category(s: Session, params: dict[str, Any]) -> dict[str, Any]:
    category = params.get("category") or ""
    try:
        from facebook_camofox_client.domain_marketplace.categories import resolve_category

        category = resolve_category(category) or category
    except Exception:
        pass
    log(f"Category: {category}")
    return s.select_combobox("Category", category)


def step_upload_photos(s: Session, params: dict[str, Any]) -> dict[str, Any]:
    paths = [str(Path(p)) for p in params.get("paths") or []]
    missing = [p for p in paths if not Path(p).is_file()]
    if missing:
        return fail("photoMissing", ", ".join(missing))
    before = s.page.evaluate(PHOTO_COUNT_JS) or 0
    file_input = s.page.locator('input[type="file"][accept*="image"]').first
    try:
        file_input.wait_for(state="attached", timeout=10_000)
    except Exception:
        return fail("noFileInput", "no image file input on the form")
    log(f"Uploading {len(paths)} photo(s)")
    file_input.set_input_files(paths)
    want = before + len(paths)
    # Gate on FB's own counter, never a sleep (docs/listingPublish/imagePipeline.md).
    deadline = time.monotonic() + 15 + 10 * len(paths)
    seen = before
    while time.monotonic() < deadline:
        seen = s.page.evaluate(PHOTO_COUNT_JS) or 0
        if seen >= want:
            return {"ok": True, "count": seen}
        s.page.wait_for_timeout(750)
    return fail("photosNotConfirmed", f"the form shows {seen}/10 photos, expected {want}")


def step_fill_fields(s: Session, params: dict[str, Any]) -> dict[str, Any]:
    listing = params.get("listing") or {}
    filled: dict[str, str] = {}

    title = str(listing.get("title") or "")
    loc = s.field("Title")
    if loc is None or not s.type_and_check(loc, title, lambda v: v == title):
        return fail("titleNotSet", "the Title field did not keep the value")
    filled["title"] = title

    price = str(int(listing.get("price") or 0))
    loc = s.field("Price")
    if loc is None or not s.type_and_check(loc, price, lambda v: re.sub(r"\D", "", v) == price):
        return fail("priceNotSet", "the Price field did not keep the value")
    filled["price"] = price

    if listing.get("condition"):
        result = s.select_combobox("Condition", listing["condition"])
        if not result.get("ok"):
            return result
        filled["condition"] = listing["condition"]

    if listing.get("description"):
        description = str(listing["description"])
        loc = s.field("Description", "textarea") or s.page.locator("textarea").first
        if loc.count() == 0 or not s.type_and_check(loc, description, lambda v: norm(v) == norm(description), delay=8):
            return fail("descriptionNotSet", "the Description field did not keep the value")
        filled["description"] = f"{len(description)} chars"

    if listing.get("location"):
        location = str(listing["location"])
        city = norm(location.split(",")[0])
        # "City, Country": the suggestion must be in that country too, never a same-named city abroad (rule 12).
        country = norm(location.split(",")[-1]) if "," in location else ""
        loc = s.page.locator('input[role="combobox"][aria-label="Location"]').first
        if loc.count() == 0:
            loc = s.field("Location")
        if loc is None or loc.count() == 0:
            return fail("locationNotSet", "no Location field")
        loc.click(timeout=8000)
        s.page.keyboard.press("ControlOrMeta+A")
        s.page.keyboard.press("Backspace")
        s.page.keyboard.type(location, delay=30)
        options = s.page.locator('[role="listbox"] [role="option"]')
        try:
            options.first.wait_for(state="visible", timeout=6000)
        except Exception:
            return fail("locationNotSet", f"no suggestions for {location!r}")
        picked = False
        for i in range(options.count()):
            text = norm(options.nth(i).inner_text())
            if city and city in text and (not country or country in text):
                options.nth(i).click(timeout=5000)
                picked = True
                break
        if not picked:
            return fail("locationNotSet", f"no suggestion matched {city!r} in {country!r}")
        s.page.wait_for_timeout(800)
        if city not in norm(loc.input_value()) or (country and country not in norm(loc.input_value())):
            return fail("locationNotSet", f"Location reads {loc.input_value()!r}")
        filled["location"] = loc.input_value()
    return {"ok": True, "filled": filled}


def step_review(s: Session, params: dict[str, Any]) -> dict[str, Any]:
    listing = params.get("listing") or {}
    text = s.body()
    if LIMIT_TEXT.search(text):
        return fail("rateLimited", LIMIT_TEXT.search(text).group(0))
    count = s.page.evaluate(PHOTO_COUNT_JS) or 0
    if count < int(params.get("photoCount") or 0):
        return fail("photosNotConfirmed", f"photos dropped to {count}/10 before publish")
    price = s.field("Price")
    if price is not None and re.sub(r"\D", "", price.input_value()) != str(int(listing.get("price") or 0)):
        return fail("priceMismatch", f"Price reads {price.input_value()!r}")
    invalid = s.page.locator('[aria-invalid="true"]').count()
    if invalid:
        return fail("invalidFields", f"{invalid} field(s) marked invalid by Facebook")
    receipt = None
    receipt_dir = s.config.get("receiptDir")
    if receipt_dir:
        Path(receipt_dir).mkdir(parents=True, exist_ok=True)
        receipt = str(Path(receipt_dir) / "review.png")
        try:
            s.page.screenshot(path=receipt, full_page=True)
        except Exception as exc:
            log(f"receipt screenshot failed: {exc}")
            receipt = None
    return {"ok": True, "receipt": receipt, "photoCount": count}


def step_publish(s: Session, _: dict[str, Any]) -> dict[str, Any]:
    publish = re.compile(r"^(Publish|Share|Post)$", re.I)
    for page_no in range(4):
        if s.click_when_enabled(publish, timeout_ms=3000):
            break
        if not s.click_when_enabled(re.compile(r"^Next$", re.I), timeout_ms=15_000 if page_no == 0 else 5000):
            # Boost / promote pages: skip, never pay.
            if not s.click_when_enabled(re.compile(r"^(Not now|Skip)$", re.I), timeout_ms=3000):
                return fail("publishNotFound", f"no enabled Next or Publish on {s.page.url}")
        s.page.wait_for_timeout(3000)
    else:
        return fail("publishNotFound", "went through 4 pages without a Publish button")
    s.page.wait_for_timeout(5000)
    audience = False
    # step=audience is a cross-post screen, not the listing: one more confirm (spike :388-397).
    if "create/item" in s.page.url:
        audience = s.click_when_enabled(re.compile(r"^(Publish|Share|Post|Done)$", re.I), timeout_ms=10_000)
        s.page.wait_for_timeout(5000)
    return {"ok": True, "audienceStep": audience}


def step_confirm(s: Session, _: dict[str, Any]) -> dict[str, Any]:
    deadline = time.monotonic() + 30
    while time.monotonic() < deadline:
        try:
            dialog_text = " ".join(s.page.locator('[role="dialog"]').all_inner_texts())
        except Exception:
            dialog_text = ""
        if OOPS_TEXT.search(dialog_text):
            return fail("rejected", OOPS_TEXT.search(dialog_text).group(0))
        if PUBLISHED_TEXT.search(s.body(3000)):
            return {"ok": True, "how": "toast"}
        url = s.page.url
        if "/marketplace/item/" in url or "/marketplace/you/selling" in url:
            return {"ok": True, "how": f"url {url}"}
        s.page.wait_for_timeout(1000)
    return fail("noConfirmation", f"no toast or selling page within 30s ({s.page.url})")


def step_capture_id(s: Session, params: dict[str, Any]) -> dict[str, Any]:
    match = re.search(r"/marketplace/item/(\d+)", s.page.url)
    if match:
        return {"listingId": match.group(1), "listingUrl": f"https://www.facebook.com/marketplace/item/{match.group(1)}/"}
    title = norm(params.get("title"))
    s.page.goto(SELLING_URL, wait_until="domcontentloaded", timeout=90_000)
    s.page.wait_for_timeout(4000)
    rows: list[dict[str, Any]] = []
    for _ in range(8):
        try:
            s.page.evaluate("window.scrollBy(0, 800)")
            s.page.wait_for_timeout(2000)
            rows = s.page.evaluate(EXTRACT_JS)
        except Exception:
            rows = []
        # Only the card whose title matches: never "the first item link" (FCC create.py:203-219 bug).
        for row in rows:
            lines = [ln.strip() for ln in (row.get("card") or "").splitlines() if ln.strip()]
            if lines and norm(lines[0]) == title:
                return {"listingId": row["id"], "listingUrl": f"https://www.facebook.com/marketplace/item/{row['id']}/"}
    return {"listingId": None, "listingUrl": None, "detail": f"no selling card titled {params.get('title')!r} ({len(rows)} cards seen)"}


STEPS = {
    "open": step_open,
    "solveCaptcha": step_solve_captcha,
    "setCategory": step_set_category,
    "uploadPhotos": step_upload_photos,
    "fillFields": step_fill_fields,
    "review": step_review,
    "publish": step_publish,
    "confirm": step_confirm,
    "captureId": step_capture_id,
}


def main() -> int:
    try:
        config = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
    except json.JSONDecodeError as exc:
        print(json.dumps({"id": 0, "result": fail("badConfig", str(exc))}), flush=True)
        return 1
    # Node writes UTF-8; Windows would read cp1252 and mangle the en dash in "Used – good".
    sys.stdin.reconfigure(encoding="utf8")
    reply_out, sys.stdout = sys.stdout, sys.stderr
    proxyGate.arm(config.get("proxyPath"))
    session = Session(config)

    def reply(request_id: Any, result: dict[str, Any]) -> None:
        reply_out.write(json.dumps({"id": request_id, "result": result}) + "\n")
        reply_out.flush()

    try:
        for line in sys.stdin:
            if not line.strip():
                continue
            try:
                request = json.loads(line)
            except json.JSONDecodeError as exc:
                reply(None, fail("badRequest", str(exc)))
                continue
            step = request.get("step")
            if step == "close":
                reply(request.get("id"), {"ok": True})
                break
            handler = STEPS.get(step)
            if handler is None:
                reply(request.get("id"), fail("unknownStep", str(step)))
                continue
            if step != "open" and session.page is None:
                reply(request.get("id"), fail("notOpen", "send open first"))
                continue
            try:
                result = handler(session, request.get("params") or {})
            except proxyGate.GateError as exc:
                result = fail(exc.code, exc.detail)
            except Exception as exc:
                result = fail("crashed", f"{type(exc).__name__}: {exc}"[:400])
            reply(request.get("id"), result)
    finally:
        session.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
