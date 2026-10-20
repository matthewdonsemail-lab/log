"""log-cli's publish session: one Camoufox browser, driven step by step.

`marketplace/publish/machine.ts` (XState) decides; this file only acts. The
TypeScript side starts it once per publish and sends one JSON request per
line on stdin:

    {"id": 1, "step": "open", "params": {"recheck": false}}

and reads one JSON line back on stdout:

    {"id": 1, "result": {...}}

argv[1] is the session config: {"accountId", "storageStatePath", "formUrl",
"receiptDir", "proxyPath", "devicePath"}. The browser is always headed,
humanized, with the cursor shown (visibleBrowser.py, rule 11), and only opens
through the account's proxy, from the account's country (proxyGate.py, rule
12), as the account's one device in its pinned locale (rules 15-16), after the
launch self-check (rule 17). The exit IP is read again through the browser at
review and right before Publish: another country stops the run. Progress
goes to stderr. Anything a library prints is moved to stderr too, so stdout
only carries replies.

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
import tempfile
import time
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse

import sys as _sys
from pathlib import Path as _Path

# python/ holds the domain packages (browser, human, session, ...): on the path when run directly.
_sys.path.insert(0, str(_Path(__file__).resolve().parents[1]))
from errors.errorCodes import checked, failure
from browser import proxyGate
from human.humanMouse import SyncHumanMouse, human_click, human_scroll_by, human_scroll_into_view
from browser.visibleBrowser import launch_kwargs

CREATE_PATH = "https://www.facebook.com/marketplace/create/item"


def create_url() -> str:
    """The create form in the account's own Facebook UI locale (en_GB for IE, from
    marketplace/home), never a forced en_US on an en-IE browser."""
    locale = proxyGate.pinned().get("facebookLocale")
    return f"{CREATE_PATH}?locale={locale}" if locale else CREATE_PATH
SELLING_URL = "https://www.facebook.com/marketplace/you/selling"

LIMIT_TEXT = re.compile(
    r"daily listing limit|reached (?:your|the) (?:daily )?limit|you can.t (?:create|post) (?:more )?listings"
    r"|limit on how many listings", re.I)
# The whole account, not just Marketplace: log-cli marks it BANNED and replaces its campaign listings.
DISABLED_TEXT = re.compile(r"(?:your )?account has been (?:disabled|locked|suspended)|we suspended your account", re.I)
# Restricted account-wide (classifySignal's restrictedPolicy phrases): Pittsburgh's Marketplace pages, 2026-10-19.
RESTRICTED_TEXT = re.compile(r"we added a restriction to your account|everything you manage, including|you can no longer request a review|your account is restricted", re.I)
BLOCKED_TEXT = re.compile(r"you can.t (?:use|buy or sell on) marketplace|marketplace isn.t available to you", re.I)
TEXT_CAPTCHA = re.compile(r"confirm (?:that )?you.re human|enter the text (?:from|in) the image|can.t read this text", re.I)
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
    proxyGate.note_step(message)


# Facebook's US suggestions name the state ("Philadelphia, Pennsylvania"); a
# listing may write its code ("Philadelphia, PA"). Either is the same place.
US_STATES = {
    "al": "alabama", "ak": "alaska", "az": "arizona", "ar": "arkansas", "ca": "california", "co": "colorado",
    "ct": "connecticut", "de": "delaware", "dc": "district of columbia", "fl": "florida", "ga": "georgia",
    "hi": "hawaii", "id": "idaho", "il": "illinois", "in": "indiana", "ia": "iowa", "ks": "kansas",
    "ky": "kentucky", "la": "louisiana", "me": "maine", "md": "maryland", "ma": "massachusetts",
    "mi": "michigan", "mn": "minnesota", "ms": "mississippi", "mo": "missouri", "mt": "montana",
    "ne": "nebraska", "nv": "nevada", "nh": "new hampshire", "nj": "new jersey", "nm": "new mexico",
    "ny": "new york", "nc": "north carolina", "nd": "north dakota", "oh": "ohio", "ok": "oklahoma",
    "or": "oregon", "pa": "pennsylvania", "ri": "rhode island", "sc": "south carolina", "sd": "south dakota",
    "tn": "tennessee", "tx": "texas", "ut": "utah", "vt": "vermont", "va": "virginia", "wa": "washington",
    "wv": "west virginia", "wi": "wisconsin", "wy": "wyoming",
}


# The Location input, most specific first. The last two are Listaro's
# (facebook-poster.ts:1778-1875): the input after a "Location" span, and any
# input whose label mentions it.
LOCATION_SELECTORS = (
    'input[role="combobox"][aria-label="Location"]',
    'label:has-text("Location") input',
    'input[aria-label="Location"]',
    'xpath=//span[text()="Location"]/following-sibling::input[1]',
    'input[aria-label*="ocation"]',
    'input[placeholder*="ocation"]',
)


def location_field(s: "Session"):
    """The first visible Location input, or None."""
    for selector in LOCATION_SELECTORS:
        found = s.page.locator(selector)
        try:
            for i in range(found.count()):
                if found.nth(i).is_visible():
                    return found.nth(i)
        except Exception:
            continue
    return None


# The form's preview: "Listed a few seconds ago in Kearney", or "Listed in Philadelphia, PA".
LISTED_IN = re.compile(r"listed(?: [a-z ]+?)? in ([^\n]+)|marketplace location[:\s]*([^\n]+)", re.I)


def listed_in(s: "Session") -> str | None:
    """Where the form says the listing goes up ("Listed in Philadelphia, PA"), or None."""
    match = LISTED_IN.search(s.body(12000))
    return (match.group(1) or match.group(2)).strip()[:80] if match else None


def visible_inputs(s: "Session") -> list[str]:
    """What the form's visible inputs are called, so a missing field says what is there instead."""
    try:
        return s.page.evaluate("""() => [...document.querySelectorAll('input, textarea, [role="combobox"]')]
          .filter((e) => e.offsetParent !== null && e.type !== 'file' && e.type !== 'hidden')
          .map((e) => e.ariaLabel || e.placeholder || (e.labels && e.labels[0] && e.labels[0].innerText) || e.name || e.type)
          .map((t) => String(t).trim().slice(0, 40)).filter(Boolean).slice(0, 15)""")
    except Exception:
        return []


def in_place(text: str, place: str) -> bool:
    """`text` (a normalized suggestion or field value) names `place`, the
    listing's last part: a country, or a US state by code or by name, as a
    whole word (rule 12: never a same-named city elsewhere). Empty: no check."""
    if not place:
        return True
    names = [place] + ([US_STATES[place]] if place in US_STATES else [])
    return any(re.search(r"\b" + re.escape(name) + r"\b", text) for name in names)


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
        self.mouse = None

    # -- lifecycle ---------------------------------------------------------
    def _watch_create(self, response: Any) -> None:
        try:
            request = response.request
            if "/api/graphql" not in request.url or "useCometMarketplaceListingCreateMutation" not in (request.post_data or ""):
                return
            match = re.search(r'"marketplace_listing_create":\{"listing":\{[^{}]*?"id":"(\d+)"', response.text())
            if match:
                self.created_listing_id = match.group(1)
                log(f"Facebook created listing {match.group(1)}")
        except Exception:
            pass

    def start(self) -> dict[str, Any] | None:
        state = Path(self.config.get("storageStatePath") or "")
        # Only connect (connectSession.py) may start without a session: it is the one that makes it.
        fresh = bool(self.config.get("allowFresh"))
        if not state.is_file() and not fresh:
            return {"kind": "issue", "issue": checked("neverConnected"), "detail": f"no saved session at {state}. Run: log connect --account <id>"}
        from camoufox.sync_api import Camoufox

        # Proxy gate (rule 12), the account's device and locale (15-16), headed,
        # humanize 1.5s, cursor shown (rule 11). Never configurable.
        # The cursor is drawn by humanMouse (rule 32): humanize stays on, its per-hop curve capped.
        self.runtime = Camoufox(**launch_kwargs({}, own_trajectory=True))
        try:
            self.browser = self.runtime.__enter__()
            # The gate's self-check runs inside new_context (rule 17): a refusal closes the browser.
            # HAR is Playwright's Firefox recorder (record_har_*), flushed when the context
            # closes. It is kept raw for analysis (rule 19). The gate leaves these kwargs.
            context_kwargs: dict[str, Any] = {"storage_state": str(state)} if state.is_file() else {}
            receipt = self.config.get("receiptDir")
            if receipt:
                capture = Path(receipt) / "camoufox"
                capture.mkdir(parents=True, exist_ok=True)
                context_kwargs["record_har_path"] = str(capture / "session.har")
                context_kwargs["record_har_content"] = "embed"
                context_kwargs["record_har_mode"] = "full"
            self.context = self.browser.new_context(**context_kwargs)
        except Exception:
            self.close()
            raise
        self.page = self.context.new_page()
        self.page.set_default_timeout(30_000)
        # Facebook's own answer to Publish carries the new listing's id (recorded on Reading
        # 2026-10-19: useCometMarketplaceListingCreateMutation -> marketplace_listing_create.listing.id),
        # so the id never depends on the Selling page having drawn the card yet.
        self.created_listing_id = None
        self.page.on("response", self._watch_create)
        self.mouse = SyncHumanMouse(self.page, log)
        return None

    def close(self) -> None:
        try:
            if self.context is not None:
                # The session as the browser left it, for log-cli to save to Twenty (cookies, localStorage).
                try:
                    self.context.storage_state(path=str(self.config.get("storageStatePath")))
                except Exception as exc:
                    log(f"could not save the session state ({type(exc).__name__})")
                self.context.close()
        except Exception:
            pass
        finally:
            runtime = self.runtime
            self.context = self.browser = self.runtime = self.page = None
            if runtime is not None:
                try:
                    runtime.__exit__(None, None, None)
                except Exception:
                    pass

    def recheck_exit(self) -> dict[str, Any]:
        """The exit IP again, through the browser (proxyGate.recheck_exit). Raises
        GateError proxyCountryChanged when it left the country; returns
        {"exitIpChanged": ...} when it moved inside it, so the run records it."""
        result = proxyGate.recheck_exit(self.context)
        try:
            self.page.bring_to_front()
        except Exception:
            pass
        return {"exitIpChanged": result["changed"]} if result["changed"] else {}

    def enabled_button(self, pattern: re.Pattern, timeout_ms: int = 3000):
        """The first visible, enabled button matching `pattern`, without clicking it, or None."""
        deadline = time.monotonic() + timeout_ms / 1000
        while time.monotonic() < deadline:
            buttons = self.page.get_by_role("button", name=pattern)
            for i in range(buttons.count()):
                button = buttons.nth(i)
                try:
                    if button.is_visible() and not button.evaluate(DISABLED_JS):
                        return button
                except Exception:
                    continue
            self.page.wait_for_timeout(500)
        return None

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

    def text_captcha_image(self):
        """The text captcha's image, or None (Listaro's image_captcha selectors, fb-login-helper.ts:176)."""
        found = self.page.locator('img[src*="captcha"], [id*="captcha"] img, [class*="captcha"] img')
        try:
            for i in range(found.count()):
                if found.nth(i).is_visible():
                    return found.nth(i)
        except Exception:
            pass
        return None

    def text_captcha_field(self):
        """The box the text captcha's answer goes in: the visible text input on its page."""
        found = self.page.locator('input[type="text"], input:not([type])')
        try:
            for i in range(found.count()):
                if found.nth(i).is_visible():
                    return found.nth(i)
        except Exception:
            pass
        return None

    def submit_text_captcha(self) -> bool:
        """Send the typed answer: Enter in the box, then Continue once FB enables it
        (it stays disabled until its own scripts see the text). Logs what it did."""
        url = self.page.url
        field = self.text_captcha_field()
        if field is not None:
            try:
                field.press("Enter", timeout=5000)
                self.page.wait_for_timeout(3000)
            except Exception:
                pass
        if self.page.url != url or not TEXT_CAPTCHA.search(self.body()):
            log("Text captcha: sent with Enter; the page moved on.")
            return True
        button = self.enabled_button(re.compile(r"^(continue|submit)$", re.I), 8000)
        if button is None:
            log("Text captcha: answer typed, but Continue never enabled.")
            return False
        human_click(button)
        self.page.wait_for_timeout(4000)
        log("Text captcha: clicked Continue.")
        return True

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
        # FB's own text captcha: "Confirm that you're human / Enter the text from the image".
        # Listaro solved it as an image (captcha-solver.ts, fb-login-helper.ts:170-178).
        text_image = TEXT_CAPTCHA.search(self.body())
        if text_image or self.text_captcha_image() is not None:
            return {"kind": "textImage", "detail": f"text captcha: {text_image.group(0) if text_image else 'captcha image'}"}
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
        human_scroll_into_view(opener)
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
                human_click(target)
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
                            human_click(options.nth(i))
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
                    human_click(search)
                    search.fill("", timeout=4000)
                    search.type(want, delay=30)
                    self.page.wait_for_timeout(1500)
                button = dialog.get_by_role("button", name=re.compile(re.escape(want), re.I)).first
                if button.count() == 0:
                    button = self.page.get_by_role("button", name=re.compile(re.escape(want), re.I)).first
                button.wait_for(state="visible", timeout=8000)
                human_click(button)
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
        human_scroll_into_view(loc)
        human_click(loc)
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
                        human_scroll_into_view(button)
                        human_click(button)
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
        url = s.config.get("formUrl") or create_url()
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
    if RESTRICTED_TEXT.search(text):
        return {"kind": "issue", "issue": checked("restrictedPolicy"), "detail": RESTRICTED_TEXT.search(text).group(0)}
    if BLOCKED_TEXT.search(text):
        return {"kind": "issue", "issue": checked("suspended"), "detail": BLOCKED_TEXT.search(text).group(0)}
    if LIMIT_TEXT.search(text):
        return {"kind": "issue", "issue": checked("rateLimited"), "detail": LIMIT_TEXT.search(text).group(0)}

    # Listing-type picker (Listaro facebook-poster.ts:1118-1154).
    try:
        item = s.page.get_by_text(re.compile(r"^Item for sale$", re.I)).first
        if item.count() > 0 and item.is_visible():
            human_click(item)
            s.page.wait_for_timeout(2500)
    except Exception:
        pass
    # If we were sent back home after a captcha, go to the form again.
    if params.get("recheck") and "marketplace/create" not in s.page.url and not s.config.get("formUrl"):
        s.page.goto(create_url(), wait_until="domcontentloaded", timeout=90_000)
        s.page.wait_for_timeout(3000)
    title = s.page.locator('label:has-text("Title") input, input[aria-label="Title"]').first
    try:
        title.wait_for(state="visible", timeout=15_000)
    except Exception:
        # Still rendering (a slow proxy exit): load it again once and wait longer, as Listaro
        # does (facebook-poster.ts:1212-1237). Nothing has been typed yet, so this is safe.
        log("No form after 15 s; loading the create page again once.")
        try:
            s.page.goto(s.config.get("formUrl") or create_url(), wait_until="domcontentloaded", timeout=90_000)
            title.wait_for(state="visible", timeout=30_000)
        except Exception:
            return {"kind": "error", "code": checked("formNotFound"), "detail": f"no Title field on {s.page.url}, loaded twice"}
    # Where Facebook will list it, before any photo goes up (rule 12): the US form has no
    # Location field and lists at the account's Marketplace location (`sell_location`).
    wrong = sell_location_mismatch(s, params.get("location"))
    if wrong:
        postal = str(params.get("postalCode") or "").strip()
        if not postal:
            return {"kind": "error", "code": checked("locationNotSet"), "detail": wrong + " Give the listing a locationPostalCode and a --live run sets it."}
        if not params.get("setLocation"):
            return {"kind": "error", "code": checked("locationNotSet"), "detail": wrong + f" A --live run sets it to {postal} first (a dry run changes nothing on Facebook)."}
        moved = set_marketplace_location(s, postal)
        if moved:
            return {"kind": "error", "code": checked("locationNotSet"), "detail": f"{wrong} Setting it to {postal} failed: {moved}"}
        s.page.goto(create_url(), wait_until="domcontentloaded", timeout=90_000)
        s.page.wait_for_timeout(3000)
        try:
            title.wait_for(state="visible", timeout=30_000)
        except Exception:
            return {"kind": "error", "code": checked("formNotFound"), "detail": f"no Title field after setting the location, on {s.page.url}"}
        still = sell_location_mismatch(s, params.get("location"))
        if still:
            return {"kind": "error", "code": checked("locationNotSet"), "detail": f"set the Marketplace location to {postal}, and still: {still}"}
    return {"kind": "ready", "url": s.page.url}


def set_marketplace_location(s: Session, postal: str) -> str | None:
    """The account's Marketplace location to `postal`, the way it was recorded on Reading
    (inspect run 20261019T131409, steps 3-15): Marketplace > the "Location: ..." button >
    "Change location" > clear the Location box > type the zip > the first suggestion
    ("Reading, PA, US 19601", not in the accessibility tree: ArrowDown, Enter) > Apply, which
    sends CometMarketplaceSetBuyLocationMutation. The city's name found Reading, Jamaica and
    Reading, Berkshire; the zip found Reading, PA. Returns why not, or None when it moved."""
    page = s.page
    log(f"Setting the Marketplace location to {postal} (the form would list elsewhere)")
    try:
        page.goto("https://www.facebook.com/marketplace/", wait_until="domcontentloaded", timeout=90_000)
        button = page.get_by_role("button", name=re.compile(r"^Location: "))
        button.first.wait_for(state="visible", timeout=30_000)
        human_click(button.first)
        dialog = page.get_by_role("dialog", name="Change location")
        dialog.wait_for(state="visible", timeout=15_000)
        box = dialog.get_by_role("combobox", name="Location")
        human_click(box, circle=False)
        page.keyboard.press("ControlOrMeta+A")
        page.keyboard.press("Backspace")
        page.keyboard.type(postal, delay=90)
        page.wait_for_timeout(2500)
        page.keyboard.press("ArrowDown")
        page.keyboard.press("Enter")
        apply = dialog.get_by_role("button", name="Apply")
        page.wait_for_timeout(1200)
        if apply.is_disabled():
            return f"no suggestion was picked for {postal}"
        with page.expect_response(lambda r: "CometMarketplaceSetBuyLocationMutation" in (r.request.post_data or ""), timeout=20_000) as saved:
            human_click(apply)
        if saved.value.status != 200:
            return f"CometMarketplaceSetBuyLocationMutation answered {saved.value.status}"
        page.wait_for_timeout(2500)
        log(f"Marketplace location set to {postal}")
        return None
    except Exception as exc:
        return f"{type(exc).__name__}: {str(exc)[:160]}"


SELL_LOCATION = re.compile(r'"sell_location":\{"latitude":(-?[\d.]+),"longitude":(-?[\d.]+),"reverse_geocode_detailed":\{"city":"([^"]*)","postal_code":"([^"]*)","country_alpha_two":"([A-Z]{2})"')


def read_sell_location(s: Session) -> dict[str, Any] | None:
    """The account's Marketplace location, as the create page's own data carries it, or None."""
    try:
        match = SELL_LOCATION.search(s.page.content())
    except Exception:
        return None
    if not match:
        return None
    lat, lng, city, postal, country = match.groups()
    return {"city": city, "postalCode": postal, "country": country, "latitude": float(lat), "longitude": float(lng)}


def sell_location_mismatch(s: Session, location: str | None) -> str | None:
    """Why the account's Marketplace location isn't the listing's city, or None when it is
    (or the page doesn't say: the Location field, when there is one, is checked at fillFields)."""
    if not location or s.config.get("formUrl"):
        return None
    where = read_sell_location(s)
    if where is None:
        return None
    log(f"Marketplace location: {where['city']} {where['postalCode']} {where['country']}")
    city = norm(location.split(",")[0])
    home = str(proxyGate.pinned().get("country") or "").upper()
    if city and city == norm(where["city"]) and (not home or where["country"] == home):
        return None
    return (f"the account's Marketplace location is {where['city']} ({where['postalCode']}, {where['country']}), "
            f"not {location!r}: Facebook would list it there. Change the account's Marketplace location first.")


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
    if detection.get("kind") == "textImage" and result.is_solved:
        # Kraken types the text; FB's Continue may still need the click. The next read judges it.
        s.submit_text_captcha()
    return {"solved": bool(result.is_solved), "detail": f"verdicts={verdicts}"}


def twocaptcha_code(exc: Exception) -> str:
    text = str(exc).upper()
    for needle, code in TWOCAPTCHA_CODES:
        if needle in text:
            return code
    return "solveError"


def recaptcha_cookies(s: Session) -> str:
    """Google's own cookies in the browser, in 2Captcha's KEY:Value; format (reCAPTCHA v2
    is the only task that takes cookies). Never Facebook's: those are the account's session."""
    try:
        jar = s.context.cookies()
    except Exception:
        return ""
    keep = [c for c in jar if str(c.get("domain", "")).lstrip(".").endswith(("google.com", "recaptcha.net"))]
    return ";".join(f"{c['name']}:{c['value']}" for c in keep)


def solve_twocaptcha(s: Session, detection: dict[str, Any]) -> dict[str, Any]:
    key = (os.environ.get("TWOCAPTCHA_API_KEY") or os.environ.get("2CAPTCHA_API_KEY") or "").strip()
    if not key:
        return {"solved": False, "code": checked("missingApiKey"), "detail": "2CAPTCHA_API_KEY (or TWOCAPTCHA_API_KEY) is not set"}
    try:
        from twocaptcha import TwoCaptcha
    except Exception as exc:
        return {"solved": False, "code": checked("notInstalled"), "detail": f"pip install 2captcha-python ({exc})"}
    # The same exit as the browser, or not at all: a token minted on 2Captcha's own IP
    # and browser is a third identity in this account's session.
    proxy = proxyGate.twocaptcha_proxy()
    if not proxy:
        return {"solved": False, "code": checked("captchaNoProxy"), "detail": "the account's proxy can't be passed to 2Captcha"}
    try:
        user_agent = str(s.page.evaluate("() => navigator.userAgent"))
    except Exception as exc:
        return {"solved": False, "code": checked("captchaNoProxy"), "detail": f"could not read the browser's userAgent ({type(exc).__name__})"}
    solver = TwoCaptcha(key, defaultTimeout=180, recaptchaTimeout=600, pollingInterval=5)
    if detection.get("kind") == "textImage":
        return solve_text_image(s, solver)
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
            extra: dict[str, Any] = {"proxy": proxy, "userAgent": user_agent}
            cookies = recaptcha_cookies(s)
            if cookies:
                extra["cookies"] = cookies
            token = solver.recaptcha(sitekey=site_key, url=s.page.url, enterprise=1 if detection.get("enterprise") else 0, **extra)["code"]
            js = INJECT_RECAPTCHA_JS
        else:
            if not site_key:
                return {"solved": False, "code": checked("noSiteKey"), "detail": "no Arkose public key in the frame URL"}
            surl = None
            if detection.get("frameUrl"):
                parsed = urlparse(detection["frameUrl"])
                surl = f"{parsed.scheme}://{parsed.netloc}"
            log("2Captcha: submitting Arkose (unproven on Facebook)")
            kwargs = {"sitekey": site_key, "url": s.page.url, "proxy": proxy, "userAgent": user_agent}
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


def solve_text_image(s: Session, solver) -> dict[str, Any]:
    """2Captcha's image solver on FB's text captcha, as Listaro did (captcha-solver.ts:
    ImageToText): screenshot the image, type the answer, click Continue."""
    image = s.text_captcha_image()
    field = s.text_captcha_field()
    if image is None or field is None:
        return {"solved": False, "code": checked("noWidget"), "detail": "no captcha image or answer box on the page"}
    shot = Path(s.config.get("receiptDir") or tempfile.gettempdir(), "textCaptcha.png")
    try:
        image.screenshot(path=str(shot), timeout=10_000)
        log("2Captcha: submitting the text image")
        answer = str(solver.normal(str(shot))["code"]).strip()
    except Exception as exc:
        return {"solved": False, "code": checked(twocaptcha_code(exc)), "detail": str(exc)[:300]}
    if not answer:
        return {"solved": False, "code": checked("unsolvable"), "detail": "2Captcha returned an empty answer"}
    human_click(field)
    s.page.keyboard.type(answer, delay=90)
    submitted = s.submit_text_captcha()
    return {"solved": True, "detail": f"{len(answer)} characters typed" + ("" if submitted else ", Continue not found")}


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
        loc = location_field(s)
        if loc is None:
            # The US form has no Location field: the listing goes up at the account's own
            # Marketplace location, as Listaro posted (facebook-poster.ts:1170-1198,1921-1923).
            # Rule 12 still holds: the "Listed in ..." the form shows must be the listing's place.
            listed = listed_in(s)
            # "Reading, PA": the part after the comma is a state, not a country, so the form's own
            # sell_location (its city, and the account's home country, rule 12) decides, as at open.
            if listed and city in norm(listed) and (in_place(norm(listed), country) or sell_location_mismatch(s, location) is None):
                filled["location"] = f"{listed} (the account's Marketplace location)"
                return {"ok": True, "filled": filled}
            receipt = s.config.get("receiptDir")
            if receipt:
                # The form as it read, to see where Facebook would list it (local run folder only).
                Path(receipt, "formText.txt").write_text(s.body(20000), encoding="utf8")
            return fail("locationNotSet", f"no Location field, and the form lists it in {listed or 'nowhere it says'}, not {location!r}; "
                                          f"inputs on the form: {visible_inputs(s)}")
        # Already the right place (the account's Marketplace location, set before the run): leave it.
        try:
            current = norm(loc.input_value())
        except Exception:
            current = ""
        if city and city in current and sell_location_mismatch(s, location) is None:
            filled["location"] = f"{loc.input_value()} (already set)"
            return {"ok": True, "filled": filled}
        # "Reading, PA" suggests Reading, Jamaica and Reading, Berkshire: when the city name finds
        # nothing in the right place, the account's Marketplace postal code does (recorded on
        # Reading 2026-10-19: "19601" -> "Reading, PA, US 19601").
        where = read_sell_location(s)
        queries = [location]
        if where and where.get("postalCode") and norm(where["city"]) == city:
            queries.append(str(where["postalCode"]))
        picked = False
        seen: list[str] = []
        options = s.page.locator('[role="listbox"] [role="option"]')
        for query in queries:
            human_click(loc)
            s.page.keyboard.press("ControlOrMeta+A")
            s.page.keyboard.press("Backspace")
            s.page.keyboard.type(query, delay=30)
            try:
                options.first.wait_for(state="visible", timeout=6000)
            except Exception:
                seen.append(f"{query}: no suggestions")
                continue
            for i in range(options.count()):
                text = norm(options.nth(i).inner_text())
                if city and city in text and (in_place(text, country) or query in text):
                    human_click(options.nth(i))
                    picked = True
                    break
            if picked:
                break
            seen += [f"{query}: {norm(options.nth(i).inner_text())[:60]}" for i in range(min(options.count(), 4))]
        if not picked:
            return fail("locationNotSet", f"no suggestion matched {city!r} in {country!r}: {seen}")
        s.page.wait_for_timeout(800)
        value = norm(loc.input_value())
        if city not in value or not (in_place(value, country) or sell_location_mismatch(s, location) is None):
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
    # The exit can rotate during a long form (2Captcha sticky sessions last 120 min at most).
    moved = s.recheck_exit()
    return {"ok": True, "receipt": receipt, "photoCount": count, **moved}


def step_publish(s: Session, _: dict[str, Any]) -> dict[str, Any]:
    publish = re.compile(r"^(Publish|Share|Post)$", re.I)
    moved: dict[str, Any] = {}
    for page_no in range(4):
        if s.enabled_button(publish, timeout_ms=3000) is not None:
            # Immediately before the click: still the account's country, or stop (proxyCountryChanged).
            moved = s.recheck_exit()
            if not s.click_when_enabled(publish, timeout_ms=5000):
                return fail("publishNotFound", "the Publish button went away after the exit check")
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
    return {"ok": True, "audienceStep": audience, **moved}


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


REVIEW_NEAR = re.compile(r'"integrity_status_indicator":\{"content":"([^"]+)"')


def listing_review(s: Session, listing_id: str) -> str | None:
    """What Facebook's Selling page says about this listing's review, or None when it says nothing.
    A new account's listing is held: "This listing is being reviewed." (`integrity_status_indicator`,
    with is_live true): listed, but not shown to buyers until it clears."""
    try:
        if "/marketplace/you/selling" not in s.page.url:
            s.page.goto(SELLING_URL, wait_until="domcontentloaded", timeout=90_000)
            s.page.wait_for_timeout(4000)
        html = s.page.content()
    except Exception:
        return None
    for at in [m.start() for m in re.finditer(re.escape(f'"{listing_id}"'), html)]:
        match = REVIEW_NEAR.search(html, max(0, at - 6000), at + 6000)
        if match:
            return match.group(1)
    return None


def step_capture_id(s: Session, params: dict[str, Any]) -> dict[str, Any]:
    found = s.created_listing_id
    if not found:
        match = re.search(r"/marketplace/item/(\d+)", s.page.url)
        found = match.group(1) if match else None
    if found:
        review = listing_review(s, found)
        if review:
            log(f"Listing {found}: {review}")
        return {"listingId": found, "listingUrl": f"https://www.facebook.com/marketplace/item/{found}/", "review": review}
    title = norm(params.get("title"))
    s.page.goto(SELLING_URL, wait_until="domcontentloaded", timeout=90_000)
    s.page.wait_for_timeout(4000)
    rows: list[dict[str, Any]] = []
    for _ in range(8):
        try:
            human_scroll_by(s.page, 800)
            s.page.wait_for_timeout(2000)
            rows = s.page.evaluate(EXTRACT_JS)
        except Exception:
            rows = []
        # Only the card whose title matches: never "the first item link" (FCC create.py:203-219 bug).
        for row in rows:
            lines = [ln.strip() for ln in (row.get("card") or "").splitlines() if ln.strip()]
            if lines and norm(lines[0]) == title:
                return {"listingId": row["id"], "listingUrl": f"https://www.facebook.com/marketplace/item/{row['id']}/", "review": listing_review(s, row["id"])}
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
    receipt = config.get("receiptDir")
    proxyGate.arm(config.get("proxyPath"), config.get("devicePath"), str(Path(receipt) / "camoufox") if receipt else None)
    session = Session(config)
    # Rule 24: a login wall or checkpoint met while publishing is signed through in this
    # same browser (connectSession.py's steps), never in a second launch. Imported here:
    # connectSession imports this module.
    from session import connectSession

    session.secrets = connectSession.read_login(config.get("loginPath"))
    STEPS.update({
        "signInOpen": connectSession.step_open_in_session,
        "signInRead": connectSession.step_read,
        "signInSubmitCredentials": connectSession.step_submit_credentials,
        "signInChooseAuthApp": connectSession.step_choose_auth_app,
        "signInSubmitCode": connectSession.step_submit_code,
        "signInDismiss": connectSession.step_dismiss,
        "signInSave": connectSession.step_save,
    })

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
                # The wait in between (rule 32): a hand looks at the page before it acts.
                if session.mouse is not None and step not in ("open",):
                    session.mouse.look()
                result = handler(session, request.get("params") or {})
            except proxyGate.GateError as exc:
                result = fail(exc.code, exc.detail)
            except Exception as exc:
                result = fail("crashed", f"{type(exc).__name__}: {exc}"[:400])
            if result.get("ok") is False or result.get("kind") in ("error", "issue"):
                # Why a step failed, on the trace at once, and the page as it read (local run folder only).
                log(f"{step} failed: {result.get('code') or result.get('issue')} {result.get('detail', '')}".rstrip())
                receipt = session.config.get("receiptDir")
                if receipt and session.page is not None:
                    Path(receipt, f"{step}Failed.txt").write_text(f"{session.page.url.split('?', 1)[0]}\n\n{session.body(20000)}", encoding="utf8")
            reply(request.get("id"), result)
    finally:
        session.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
