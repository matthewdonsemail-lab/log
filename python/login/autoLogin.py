"""Facebook's sign-in pages, for `log connect` (python/session/connectSession.py).

`classify` says which page the browser is on. It is the page kind the connect
machine (`src/marketplace/connect/machine.ts`) routes on: loggedIn, loginForm,
wrongPassword, findAccount, twoStepCode, twoStepMethod, trustDevice, saveLogin,
continueAs, cookieBanner, automatedBehaviour, checkpoint, captcha, disabled or
unknown. Facebook's sign-in ends three ways, not two: signed in, the two-step
code, or Facebook's own checkpoint. Connect takes Listaro's path on each
(rule 23): "We suspect automated behaviour" is dismissed, captchas are
solved, and only identity, photo, video and SMS checkpoints go to a person.
The other functions each do one thing a page asks for; the machine decides
when, and how many times.

Phrases and selectors are Listaro's (Listaro_backup
src/lib/auto-login/facebook-auto-login.ts, src/lib/fb-login-helper.ts,
src/app/api/check-accounts/route.ts), cited per constant.

The email, password and totpSecret come from the run's private `login.json`.
Nothing here prints or logs them: log lines name the action only.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import random
import re
import struct
import time
from typing import Any

from human.humanMouse import human_click

# Two-step: the code page or its "approve on another device" first screen
# (fb-login-helper.ts:161-167, validate.ts:334-343, new_user_onboard.ts:137-147).
TWO_STEP = re.compile(
    r"two.factor|authenticat|login code|security code|enter the code|6.digit|code generator"
    r"|check your notifications|approve|try another way|login approval", re.I)
# "We suspect automated behaviour": Listaro dismisses it (fb-login-helper.ts:146,195-208).
AUTOMATED_TEXT = re.compile(r"suspect automated behaviou?r|we suspect automated", re.I)
# "Confirm that you're a real person with a video selfie" / "Start video selfie": only a
# person on camera clears it. Listaro marked it needs_verification and stopped
# (check-accounts/route.ts:218-381 "Video verification required").
VIDEO_SELFIE_TEXT = re.compile(r"video selfie|record a video|upload a video|take a video|verify with video|video verification", re.I)
# Facebook's own checkpoints a person clears, checked before TWO_STEP: identity,
# photo or video (facebook-auto-login.ts:649-655, check-accounts/route.ts:218-381,
# fb-login-helper.ts:181-183).
CHECKPOINT_TEXT = re.compile(
    r"unusual activity|suspicious activity|confirm (?:your identity|it.s you)|verify your identity"
    r"|upload (?:a photo|a video|your id)|video selfie|photo id|identity document|government.issued"
    r"|more info needed|security check", re.I)
# A code sent by SMS: never typed from the authenticator. With "Try another way"
# it is two-step by text message, switched to the app; without, a checkpoint
# (facebook-auto-login.ts:632-638 needs_sms).
SMS_TEXT = re.compile(
    r"code we sent to|we sent (?:a|you a) code to your (?:phone|mobile)|text message|confirm your phone number"
    r"|enter your mobile number|add your phone number", re.I)
ANOTHER_WAY = re.compile(r"try another way", re.I)
# The whole account (facebook-auto-login.ts:543,558,566,606-622).
DISABLED_TEXT = re.compile(
    r"disabled your account|account (?:has been|is|was) (?:disabled|locked|suspended)|we suspended your account", re.I)
DISABLED_URL = re.compile(r"checkpoint/disabled|account/disabled", re.I)
# Wrong password or no such account (facebook-auto-login.ts:334-338,388-398).
WRONG_PASSWORD_TEXT = re.compile(
    r"wrong password|incorrect password|password (?:that )?you(?:.ve)? entered is incorrect|mot de passe incorrect"
    r"|email (?:address )?you entered isn|no account found", re.I)
# "Find your account": submitted once, then wrong credentials if it stays (facebook-auto-login.ts:349-386).
FIND_ACCOUNT_TEXT = re.compile(r"find your account", re.I)
# The cookie consent banner (facebook-auto-login.ts:202).
COOKIE_BANNER = '[data-cookiebanner="accept_only_essential_button"], [data-cookiebanner="accept_button"]'
TRUST_TEXT = re.compile(r"trust this device|save (?:this )?browser|remember (?:this )?browser", re.I)
SAVE_LOGIN_TEXT = re.compile(r"save (?:your )?login info", re.I)
CONTINUE_AS_TEXT = re.compile(r"continue as|log into facebook as|use another profile", re.I)
CHECKPOINT_URL = re.compile(r"/checkpoint|two_step_verification|two_factor", re.I)
LOGIN_URL = re.compile(r"/login|login\.php", re.I)
# The code field (facebook-auto-login.ts:483-492, fb-login-helper.ts:380-397).
CODE_FIELD = ('input[id="approvals_code"], input[name="approvals_code"], input[autocomplete="one-time-code"], '
              'input[type="text"][maxlength="6"], input[type="tel"][maxlength="6"], input[type="number"][maxlength="6"], '
              'input[placeholder*="code" i], input[aria-label*="code" i]')
PASSWORD_FIELD = 'input[name="pass"], input#pass, input[type="password"]'
EMAIL_FIELD = 'input[name="email"], input#email, input[type="email"], input[autocomplete="username"]'
# A click that something covers would otherwise wait out the page's timeout.
CLICK_MS = 5000


def totp(secret: str, at: float | None = None, digits: int = 6, period: int = 30) -> str:
    """RFC 6238 TOTP (HMAC-SHA1), the code an authenticator app shows for `secret`."""
    key = base64.b32decode(secret.replace(" ", "").upper() + "=" * (-len(secret.replace(" ", "")) % 8))
    counter = int((time.time() if at is None else at) // period)
    digest = hmac.new(key, struct.pack(">Q", counter), hashlib.sha1).digest()
    offset = digest[-1] & 0x0F
    number = struct.unpack(">I", digest[offset:offset + 4])[0] & 0x7FFFFFFF
    return str(number % 10 ** digits).zfill(digits)


def classify(url: str, heading: str, text: str, *, password_field: bool, code_field: bool,
             captcha: bool, login_markers: bool, session_cookies: bool = True, cookie_banner: bool = False) -> str:
    """The page kind, from what is on screen. Pure. First match wins, most final first.
    `session_cookies`: the browser holds c_user and xs, Listaro's proof of a login."""
    seen = f"{heading}\n{text}"
    if DISABLED_URL.search(url) or DISABLED_TEXT.search(seen):
        return "disabled"
    if cookie_banner:
        return "cookieBanner"
    if (password_field or LOGIN_URL.search(url)) and WRONG_PASSWORD_TEXT.search(seen):
        return "wrongPassword"
    if FIND_ACCOUNT_TEXT.search(seen) and not password_field:
        return "findAccount"
    if captcha:
        return "captcha"
    if AUTOMATED_TEXT.search(seen):
        return "automatedBehaviour"
    if VIDEO_SELFIE_TEXT.search(seen):
        return "videoSelfie"
    on_checkpoint = bool(CHECKPOINT_URL.search(url))
    # The heading decides first: a two-step page's body can mention a phone.
    if on_checkpoint and heading and CHECKPOINT_TEXT.search(heading) and not TWO_STEP.search(heading):
        return "checkpoint"
    if on_checkpoint and SMS_TEXT.search(seen):
        return "twoStepMethod" if ANOTHER_WAY.search(seen) else "checkpoint"
    if code_field and (on_checkpoint or TWO_STEP.search(seen)):
        return "twoStepCode"
    if TRUST_TEXT.search(seen) and (on_checkpoint or "trust" in heading.lower()):
        return "trustDevice"
    if SAVE_LOGIN_TEXT.search(seen):
        return "saveLogin"
    if password_field:
        return "loginForm"
    if CONTINUE_AS_TEXT.search(seen) and login_markers:
        return "continueAs"
    if on_checkpoint:
        if CHECKPOINT_TEXT.search(seen) or not TWO_STEP.search(seen):
            return "checkpoint"
        return "twoStepMethod"
    if not login_markers and session_cookies and "facebook.com" in url:
        return "loggedIn"
    return "unknown"


# -- the page ---------------------------------------------------------------
def _visible(locator) -> bool:
    try:
        return locator.count() > 0 and locator.first.is_visible()
    except Exception:
        return False


def _scope(page):
    """The open dialog, else the page. Marketplace puts a "Log in to Facebook"
    dialog over the page while the header keeps its own login form underneath,
    and a click on that covered form never lands."""
    dialog = page.locator('[role="dialog"]')
    return dialog.last if _visible(dialog) else page


def _pick(page, selector: str):
    """The first visible match of `selector`, in the dialog when one is open, or None."""
    matches = _scope(page).locator(selector)
    try:
        for i in range(matches.count()):
            if matches.nth(i).is_visible():
                return matches.nth(i)
    except Exception:
        pass
    return None


def _click_button(page, pattern: str) -> bool:
    for role in ("button", "link", "radio"):
        found = _scope(page).get_by_role(role, name=re.compile(pattern, re.I))
        if _visible(found):
            human_click(found.first, timeout=CLICK_MS)
            return True
    return False


def _type(page, field, text: str) -> None:
    """Click the field and type like a person (Camoufox moves the cursor)."""
    human_click(field, circle=False, timeout=CLICK_MS)
    field.fill("", timeout=CLICK_MS)
    page.keyboard.type(text, delay=random.randint(60, 140))
    page.wait_for_timeout(random.randint(300, 700))


def heading(page) -> str:
    """The page's main heading, e.g. "We suspect automated behaviour on your account"."""
    try:
        text = page.evaluate("""() => {
          const el = document.querySelector('[role="dialog"] h1, [role="dialog"] h2, h1, h2, [role="heading"]');
          return el ? el.innerText : '';
        }""")
    except Exception:
        return ""
    return " ".join(str(text).split())[:160]


def frames_text(page) -> str:
    """The text of the page's frames, for a checkpoint drawn inside one."""
    parts = []
    for frame in page.frames[1:]:
        try:
            parts.append(frame.locator("body").inner_text(timeout=2000))
        except Exception:
            continue
    return " ".join(" ".join(parts).split())[:300]


def button_names(page) -> list[str]:
    try:
        names = page.evaluate("""() => [...document.querySelectorAll('[role="button"], button')]
          .filter((b) => b.offsetParent !== null).map((b) => (b.innerText || b.ariaLabel || '').trim())
          .filter(Boolean).slice(0, 6)""")
    except Exception:
        return []
    return [" ".join(str(n).split())[:40] for n in names]


def login_markers(page) -> bool:
    """Listaro's not-logged-in markers (agent/src/browser.ts:109-119): a login
    URL, the email field, the login button or the sign-up banner."""
    if LOGIN_URL.search(page.url) or CHECKPOINT_URL.search(page.url):
        return True
    try:
        return bool(page.evaluate("""() => {
          const text = document.body.innerText || '';
          return !!document.querySelector('input[name="email"], button[name="login"]') ||
            text.includes('Log in or sign up for Facebook') || text.includes('Create new account');
        }"""))
    except Exception:
        return True


def read(page, captcha: dict[str, Any] | None, session_cookies: bool) -> dict[str, Any]:
    """What the page is: its kind, path, heading and buttons (and the captcha's
    detection, for the solver). Never clicks."""
    head = heading(page)
    try:
        text = (page.locator("body").inner_text(timeout=5000) or "")[:3000]
    except Exception:
        text = ""
    kind = classify(page.url, head, text,
                    password_field=_pick(page, PASSWORD_FIELD) is not None,
                    code_field=_pick(page, CODE_FIELD) is not None,
                    captcha=captcha is not None,
                    login_markers=login_markers(page),
                    session_cookies=session_cookies,
                    cookie_banner=_visible(page.locator(COOKIE_BANNER)))
    out: dict[str, Any] = {"ok": True, "kind": kind, "path": page.url.split("?", 1)[0].split("#", 1)[0], "heading": head}
    if kind in ("checkpoint", "captcha", "unknown", "twoStepMethod", "automatedBehaviour"):
        out["buttons"] = button_names(page)
        # What the page says, so a checkpoint with no heading still names itself (main frame and frames).
        out["text"] = " ".join(text.split())[:300] or frames_text(page)
    if kind == "captcha":
        out["captcha"] = captcha
    if kind == "loggedIn":
        # Listaro's post-login Marketplace check reads the page (facebook-auto-login.ts:717-823).
        out["bodySample"] = text
    return out


# -- actions (one each; the machine decides when) ---------------------------
def submit_credentials(page, secrets: dict[str, Any], log) -> bool:
    pass_field = _pick(page, PASSWORD_FIELD)
    if pass_field is None or not secrets.get("password"):
        return False
    email_field = _pick(page, EMAIL_FIELD)
    if email_field is not None and secrets.get("email"):
        log("Auto-login: typing the email.")
        _type(page, email_field, secrets["email"])
    log("Auto-login: typing the password.")
    _type(page, pass_field, secrets["password"])
    # Enter in the password field submits the form it belongs to, whichever it
    # is; a "Log in" button may be one that is covered.
    log("Auto-login: submitting (Enter).")
    before = page.url
    pass_field.press("Enter", timeout=CLICK_MS)
    # Wait for the page to answer, not a fixed time: read too early, the login form is still
    # there and the machine signs in a second time (Erie 2026-10-19: Enter 13:46:06, re-read
    # 13:46:07 still loginForm, second sign-in; the first had already reached the checkpoint).
    deadline = time.time() + 15
    while time.time() < deadline:
        page.wait_for_timeout(500)
        try:
            if page.url != before or not _visible(page.locator(PASSWORD_FIELD)):
                break
        except Exception:
            break
    page.wait_for_timeout(random.randint(1200, 2200))
    return True


def choose_auth_app(page, log) -> bool:
    """"Try another way" → "Authentication app" → Continue (fb-login-helper.ts:311-370)."""
    log("Auto-login: two-step without a code field; choosing 'Try another way'.")
    if not _click_button(page, r"try another way|another way|other method"):
        found = page.get_by_text(re.compile(r"try another way", re.I))
        if not _visible(found):
            return False
        human_click(found.first, timeout=CLICK_MS)
    page.wait_for_timeout(random.randint(2500, 3500))
    choice = _scope(page).get_by_role("radio", name=re.compile(r"authentication app|authenticator", re.I))
    if not _visible(choice):
        choice = _scope(page).get_by_text(re.compile(r"authentication app|authenticator", re.I))
    if not _visible(choice):
        return False
    human_click(choice.first, timeout=CLICK_MS)
    page.wait_for_timeout(800)
    _click_button(page, r"^(continue|next)$")
    page.wait_for_timeout(random.randint(1500, 2500))
    log("Auto-login: picked the authentication app for two-step.")
    return True


def submit_code(page, secret: str | None, log) -> bool:
    field = _pick(page, CODE_FIELD)
    if field is None or not secret:
        return False
    log("Auto-login: typing the authenticator code.")
    _type(page, field, totp(secret))
    log("Auto-login: submitting the code (Enter).")
    field.press("Enter", timeout=CLICK_MS)
    page.wait_for_timeout(random.randint(4000, 7000))
    return True


# The answer to each prompt (fb-login-helper.ts:195-242, facebook-auto-login.ts:665-686).
DISMISS = {
    "trustDevice": r"trust this device|always confirm|save browser|^continue$",
    "saveLogin": r"^not now$",
    "continueAs": r"^continue",
    "automatedBehaviour": r"dismiss",
}
# Pages answered by a selector rather than a button name.
DISMISS_SELECTOR = {
    "cookieBanner": COOKIE_BANNER,
    "findAccount": 'button[type="submit"], input[type="submit"]',
}


def dismiss(page, kind: str, log) -> bool:
    if kind in DISMISS_SELECTOR:
        target = _pick(page, DISMISS_SELECTOR[kind])
        if target is None:
            return False
        human_click(target, timeout=CLICK_MS)
    elif kind in DISMISS:
        if not _click_button(page, DISMISS[kind]):
            # Listaro's last fallback: any visible "Dismiss" text (fb-login-helper.ts:204).
            found = page.get_by_text(re.compile(DISMISS[kind], re.I))
            if kind != "automatedBehaviour" or not _visible(found):
                return False
            human_click(found.first, timeout=CLICK_MS)
    else:
        return False
    log(f"Auto-login: answered {kind}.")
    page.wait_for_timeout(random.randint(2000, 3000))
    return True
