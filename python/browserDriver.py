"""One opener for every browser log-cli drives (rule 44): the session gets a Playwright context either way.

Camoufox and AdsPower differ only in how the browser starts. Everything after is the same
Playwright async API: HumanMouse (rule 32), scrollMotion, the flows, the warm-up, the inspect
steps and the Recorder. So a session never asks which browser it is in.

  camoufox  AsyncCamoufox(**launch_kwargs(...)), then browser.new_context(): the proxy gate's
            launch and context guards run the gate, the device, the locale, the self-check and
            Playwright's own session HAR (rules 11-12, 15-17, 22).
  adsPower  proxyGate.gate_attached() (the same checks, before anything starts), the proxy put on
            the profile, the profile started headed through the Local API, Playwright attached with
            connect_over_cdp, the profile's own context (its cookies and fingerprint live there),
            harRecorder.SessionHar for the session HAR, proxyGate.check_attached() (the same
            self-check), then the session. At the end, the profile is stopped and its proxy cleared,
            so the proxy is in AdsPower only while the browser is open (rule 42).

A new browser is one more opener here, one more driver in src/browser/<name>, and a row in
docs/browsers.md. scripts/checkBrowserParity.mjs refuses a commit that leaves one out.
"""
from __future__ import annotations

from contextlib import asynccontextmanager
from dataclasses import dataclass
from pathlib import Path
from typing import Any, AsyncIterator

import proxyGate
from visibleBrowser import launch_kwargs

BROWSERS = ("camoufox", "adsPower")


@dataclass
class Opened:
    browser: Any
    context: Any
    driver: str


def driver_of(config: dict[str, Any]) -> tuple[str, str | None]:
    """The session's browser from its config (`browser: {driver, profileId}`); no entry keeps Camoufox. Pure."""
    browser = config.get("browser") or {}
    driver = str(browser.get("driver") or "camoufox")
    if driver not in BROWSERS:
        raise proxyGate.GateError("unguardedLaunch", f"unknown browser driver {driver!r}")
    return driver, browser.get("profileId")


@asynccontextmanager
async def open_camoufox(config: dict[str, Any], own_trajectory: bool) -> AsyncIterator[Opened]:
    from camoufox.async_api import AsyncCamoufox

    state = Path(config["storageStatePath"])
    async with AsyncCamoufox(**launch_kwargs({}, own_trajectory=own_trajectory)) as browser:
        context = await browser.new_context(**({"storage_state": str(state)} if state.is_file() else {}))
        yield Opened(browser, context, "camoufox")


@asynccontextmanager
async def open_ads_power(config: dict[str, Any], own_trajectory: bool) -> AsyncIterator[Opened]:
    import adsPowerBrowser
    from harRecorder import SessionHar
    from playwright.async_api import async_playwright

    _driver, profile_id = driver_of(config)
    if not profile_id:
        raise proxyGate.GateError("adsPowerProfileMissing", "the account has no AdsPower profile: run log adsPower sync --apply")
    gate = proxyGate.gate_attached()
    started = False
    try:
        adsPowerBrowser.set_proxy(profile_id, adsPowerBrowser.user_proxy_config(gate["proxy"]))
        proxyGate.log(f"AdsPower profile {profile_id}: proxy set; starting it headed")
        cdp = adsPowerBrowser.start(profile_id)
        started = True
        proxyGate.log(f"AdsPower profile {profile_id} started; attaching over CDP")
        async with async_playwright() as playwright:
            browser = await playwright.chromium.connect_over_cdp(cdp)
            context = browser.contexts[0] if browser.contexts else await browser.new_context()
            har = SessionHar(proxyGate.har_path(str(proxyGate._armed["captureDir"])))
            har.attach(context)
            try:
                # Inside the try, so a refused self-check still leaves its HAR to read (rule 25).
                await proxyGate.check_attached(context)
                await carry_session_once(context, Path(config["storageStatePath"]))
                yield Opened(browser, context, "adsPower")
            finally:
                written = await har.write()
                proxyGate.log(f"Session HAR: {written} request(s) to {har.path.name}")
    finally:
        # Cleanup never hides what went wrong: a stop or proxy-clear failure is logged, the first error stands.
        if started:
            try:
                adsPowerBrowser.stop(profile_id)
                proxyGate.log(f"AdsPower profile {profile_id} stopped")
            except proxyGate.GateError as exc:
                proxyGate.log(f"AdsPower profile {profile_id}: stop answered {exc.code} ({exc.detail})")
        try:
            adsPowerBrowser.set_proxy(profile_id, adsPowerBrowser.NO_PROXY)
            proxyGate.log(f"AdsPower profile {profile_id}: proxy cleared")
        except proxyGate.GateError as exc:
            proxyGate.log(f"AdsPower profile {profile_id}: clearing the proxy answered {exc.code} ({exc.detail})")


async def carry_session_once(context: Any, state: Path) -> None:
    """A new AdsPower profile has no Facebook login: Twenty's saved cookies go in once, so the account
    carries on signed in instead of signing in fresh on a new device. A profile that already holds a
    c_user keeps its own cookies (Listaro's rule: AdsPower manages the profile's session)."""
    import json

    have = {c["name"] for c in await context.cookies("https://www.facebook.com")}
    if "c_user" in have or not state.is_file():
        return
    try:
        cookies = json.loads(state.read_text(encoding="utf8")).get("cookies") or []
    except Exception:
        return
    facebook = [c for c in cookies if "facebook.com" in str(c.get("domain", ""))]
    if any(c.get("name") == "c_user" for c in facebook):
        await context.add_cookies(facebook)
        proxyGate.log(f"The profile had no Facebook login: carried Twenty's session in once ({len(facebook)} cookies)")


OPENERS = {"camoufox": open_camoufox, "adsPower": open_ads_power}


def open_browser(config: dict[str, Any], own_trajectory: bool = True):
    """The session's browser, gated and self-checked, as an async context manager of `Opened`."""
    driver, _profile = driver_of(config)
    return OPENERS[driver](config, own_trajectory)
