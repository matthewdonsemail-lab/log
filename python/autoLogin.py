"""Auto-login for `log connect --noPrompt` (the MCP tool).

The worker watches the Camoufox window until Facebook shows a logged-in page.
On each pass, `step` does at most one thing the page is asking for: type the
email and password into the login form, type the current authenticator code
on the two-step page (switching to "Authentication app" first if Facebook
offers another method), or accept "Trust this device". A person can still take
over in the visible window at any point (rule 11).

The details come from the run's private `login.json` (Twenty's email,
password and totpSecret, written by `camofox/run` and deleted after the run).
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

LOGIN_TRIES = 2
CODE_TRIES = 3
# A click that something covers would otherwise wait out the page's 120 s timeout.
CLICK_MS = 5000


def totp(secret: str, at: float | None = None, digits: int = 6, period: int = 30) -> str:
    """RFC 6238 TOTP (HMAC-SHA1), the code an authenticator app shows for `secret`."""
    key = base64.b32decode(secret.replace(" ", "").upper() + "=" * (-len(secret.replace(" ", "")) % 8))
    counter = int((time.time() if at is None else at) // period)
    digest = hmac.new(key, struct.pack(">Q", counter), hashlib.sha1).digest()
    offset = digest[-1] & 0x0F
    number = struct.unpack(">I", digest[offset:offset + 4])[0] & 0x7FFFFFFF
    return str(number % 10 ** digits).zfill(digits)


async def _visible(locator) -> bool:
    try:
        return await locator.count() > 0 and await locator.first.is_visible()
    except Exception:
        return False


async def _scopes(page) -> list:
    """Where to look, the open dialog first. Marketplace puts a "Log in to
    Facebook" dialog over the page while the header keeps its own login form
    underneath, and a click on that covered form never lands."""
    dialog = page.locator('[role="dialog"]')
    return [dialog.last, page] if await _visible(dialog) else [page]


async def _pick(page, find):
    """The first visible match of `find(scope)`, dialog first, or None."""
    for scope in await _scopes(page):
        matches = find(scope)
        try:
            for i in range(await matches.count()):
                if await matches.nth(i).is_visible():
                    return matches.nth(i)
        except Exception:
            continue
    return None


async def _type(page, field, text: str) -> None:
    """Click the field and type like a person (Camoufox moves the cursor)."""
    await field.click(timeout=CLICK_MS)
    await field.fill("", timeout=CLICK_MS)
    await page.keyboard.type(text, delay=random.randint(60, 140))
    await page.wait_for_timeout(random.randint(300, 700))


async def _click_button(page, pattern: str) -> bool:
    button = await _pick(page, lambda scope: scope.get_by_role("button", name=re.compile(pattern, re.I)))
    if button is None:
        return False
    await button.click(timeout=CLICK_MS)
    return True


async def step(page, secrets: dict[str, Any], tries: dict[str, Any], log) -> None:
    """One auto-login action, if the page is asking for one."""
    email, password, secret = secrets.get("email"), secrets.get("password"), secrets.get("totpSecret")

    # 1. The login form (the dialog's when one is open).
    pass_field = await _pick(page, lambda scope: scope.locator('input[name="pass"], input[type="password"]'))
    if email and password and pass_field is not None:
        if tries.get("login", 0) >= LOGIN_TRIES:
            return
        tries["login"] = tries.get("login", 0) + 1
        email_field = await _pick(page, lambda scope: scope.locator('input[name="email"], input[type="email"], input[autocomplete="username"]'))
        if email_field is not None:
            await _type(page, email_field, email)
        await _type(page, pass_field, password)
        if not await _click_button(page, r"^(log in|login)$"):
            await page.keyboard.press("Enter")
        log(f"Auto-login: typed the email and password (try {tries['login']}).")
        return

    # 2. Two-step: the code field, or the way to reach it.
    code_field = await _pick(page, lambda scope: scope.locator(
        'input[name="approvals_code"], input[autocomplete="one-time-code"], '
        'input[type="text"][maxlength="6"], input[type="tel"][maxlength="6"]'
    ))
    two_step = "two_step_verification" in page.url or "checkpoint" in page.url
    if secret and (code_field is not None or two_step):
        if code_field is None:
            # Facebook often opens on "check your notifications": switch to the app.
            if await _click_button(page, r"try another way"):
                await page.wait_for_timeout(1500)
                choice = await _pick(page, lambda scope: scope.get_by_text(re.compile(r"authentication app", re.I)))
                if choice is not None:
                    await choice.click(timeout=CLICK_MS)
                    await page.wait_for_timeout(800)
                    await _click_button(page, r"^continue$")
                log("Auto-login: picked the authentication app for two-step.")
            return
        window = int(time.time() // 30)
        if tries.get("codeWindow") == window or tries.get("code", 0) >= CODE_TRIES:
            return  # one try per 30 s code, three in all
        tries["code"] = tries.get("code", 0) + 1
        tries["codeWindow"] = window
        await _type(page, code_field, totp(secret))
        if not await _click_button(page, r"^(continue|submit code|submit|next)$"):
            await page.keyboard.press("Enter")
        log(f"Auto-login: typed the authenticator code (try {tries['code']}).")
        return

    # 3. After the code: keep this browser as a known device.
    if await _click_button(page, r"trust this device|save browser|^continue$"):
        log("Auto-login: trusted this device.")
