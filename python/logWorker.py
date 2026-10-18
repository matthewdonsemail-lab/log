"""log-cli's bridge into facebook-camofox-client.

Same contract as the old inferencesaver `facebook-worker.py`: one request in,
one JSON result out. The request is a JSON object in argv[1]:

    {"action": "doctor" | "login" | "marketplace.scan" | "marketplace.status",
     "account_id": "fbGalwayRubbish",
     "storage_state_path": "C:/Users/.../fbGalwayRubbish.json",
     "params": {"listing_id": "1583545526797714"}}

The result is the only thing written to stdout (one JSON line). Progress and
prompts go to stderr, and stdin stays free so `login` can wait for Enter.

Every action is read-only on Facebook except `login`, which only saves the
session you log into by hand.
"""
from __future__ import annotations

import asyncio
import json
import re
import sys
from pathlib import Path
from typing import Any

from errorCodes import failure
import proxyGate
from visibleBrowser import force_visible

SELLING_URL = "https://www.facebook.com/marketplace/you/selling"

# Same extractor as facebook-camofox-client scripts/scan_selling.py.
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


def log(message: str) -> None:
    print(message, file=sys.stderr, flush=True)


# Titles under the selling page's "Needs attention" heading, the zone Listaro's
# agent (Listaro_backup agent/src/listing-checker.ts) treats as flagged.
NEEDS_ATTENTION_JS = """() => {
  const main = document.querySelector('[role="main"]');
  if (!main) return [];
  const lines = main.innerText.split('\\n').map((l) => l.trim()).filter(Boolean);
  let flagged = false;
  const out = [];
  for (const line of lines) {
    if (/^needs?\\s+attention$/i.test(line)) { flagged = true; continue; }
    if (/^all\\s+listings$/i.test(line)) { flagged = false; continue; }
    if (flagged && line.length > 3 && line.length < 200 && !/^(CA\\$|\\$|€|£)\\d/.test(line)) out.push(line);
  }
  return [...new Set(out)];
}"""


async def body_sample(page) -> str:
    """First 4000 chars of the page text, for account-issue classification in log-cli."""
    try:
        return (await page.locator("body").inner_text(timeout=5000))[:4000]
    except Exception:
        return ""


async def auth_flags(page) -> dict[str, bool]:
    title = (await page.title()).lower()
    url = page.url.lower()
    try:
        # Listaro's isLoggedIn markers: a login button or the sign-up banner.
        banner = await page.evaluate("""() => {
          const text = document.body.innerText || '';
          return !!document.querySelector('button[name="login"]') ||
            text.includes('Log in or sign up for Facebook') || text.includes('Create new account');
        }""")
    except Exception:
        banner = False
    return {
        "login_in_url_or_title": ("login" in url) or ("log in" in title),
        "login_email_field": await page.locator('input[name="email"]').count() > 0,
        "login_banner": bool(banner),
        "checkpoint": "checkpoint" in url,
    }


def doctor(_: dict[str, Any]) -> dict[str, Any]:
    checks: dict[str, Any] = {"python": sys.version.split()[0]}
    try:
        import facebook_camofox_client

        checks["facebookCamofoxClient"] = str(Path(facebook_camofox_client.__file__).parent)
    except Exception as exc:
        checks["facebookCamofoxClient"] = None
        checks["facebookCamofoxClientError"] = str(exc)
    try:
        from camoufox.pkgman import installed_verstr, launch_path

        checks["camoufoxBrowser"] = launch_path()
        checks["camoufoxVersion"] = installed_verstr()
    except Exception as exc:
        checks["camoufoxBrowser"] = None
        checks["camoufoxBrowserError"] = str(exc)
    ok = bool(checks.get("facebookCamofoxClient") and checks.get("camoufoxBrowser"))
    return {"ok": ok, "checks": checks}


async def acquire(request: dict[str, Any], storage_state_path: str | None):
    from facebook_camofox_client.domain_camofox.session_manager import CamofoxSessionManager

    manager = CamofoxSessionManager()
    session = await manager.acquire(
        request.get("account_id") or "default", storage_state_path=storage_state_path)
    return manager, session


async def login(request: dict[str, Any]) -> dict[str, Any]:
    state = Path(request["storage_state_path"])
    manager, session = await acquire(request, str(state) if state.exists() else None)
    try:
        page = await session.new_page()
        page.set_default_timeout(120_000)
        try:
            await page.goto(SELLING_URL, wait_until="domcontentloaded")
        except Exception as exc:
            log(f"Navigation warning: {exc}. The browser stays open, carry on in it.")
        log("")
        log("In the Camoufox window:")
        log("  1. Log into Facebook (finish any checkpoint or 2FA)")
        log("  2. Check you can see Marketplace > Selling > Your listings")
        log("  3. Come back here and press Enter to save the session")
        log("Do not close the browser yourself.")
        await asyncio.to_thread(sys.stdin.readline)
        try:
            await page.reload(wait_until="domcontentloaded")
            await page.wait_for_timeout(2500)
            flags = await auth_flags(page)
        except Exception as exc:
            log(f"Could not re-check login: {exc}")
            flags = {"recheck_failed": True}
        state.parent.mkdir(parents=True, exist_ok=True)
        await session.context.storage_state(path=str(state))
        return {"ok": True, "storageStatePath": str(state),
                "loggedIn": not any(flags.values()), "authFlags": flags}
    finally:
        await manager.release(session)


async def scan(request: dict[str, Any]) -> dict[str, Any]:
    """Read the seller dashboard (/you/selling). Deletes and edits nothing."""
    from facebook_camofox_client.domain_marketplace.health import (
        classify_dashboard_card,
        parse_clicks,
    )

    manager, session = await acquire(request, request["storage_state_path"])
    try:
        page = await session.new_page()
        log(f"Opening {SELLING_URL}")
        await page.goto(SELLING_URL, wait_until="domcontentloaded")
        await page.wait_for_timeout(4000)
        flags = await auth_flags(page)
        if any(flags.values()):
            return failure("loginWall", "Facebook showed login markers", authFlags=flags,
                           url=page.url, bodySample=await body_sample(page))
        try:
            tab = page.get_by_text(re.compile(r"^Your listings$", re.I)).first
            if await tab.count() > 0:
                await tab.click(timeout=5000)
                await page.wait_for_timeout(2000)
        except Exception:
            pass
        rows: list[dict[str, Any]] = []
        # Cards hydrate on scroll: scroll and poll for item links (~25s max).
        for attempt in range(8):
            log(f"Waiting for listing cards ({attempt + 1}/8)")
            try:
                await page.evaluate("window.scrollBy(0, 800)")
            except Exception:
                pass
            await page.wait_for_timeout(2500)
            try:
                rows = await page.evaluate(EXTRACT_JS)
            except Exception:
                rows = []
            if rows:
                break
        try:
            needs_attention = await page.evaluate(NEEDS_ATTENTION_JS)
        except Exception:
            needs_attention = []
        listings = []
        for row in rows:
            card = row.get("card", "")
            lines = [ln.strip() for ln in card.splitlines() if ln.strip()]
            listings.append({
                "listingId": row["id"],
                "title": lines[0] if lines else None,
                "health": classify_dashboard_card(card).value,
                "clicks": parse_clicks(card),
                "href": row["href"],
            })
        return {"ok": True, "url": page.url, "listings": listings,
                "needsAttention": needs_attention, "bodySample": await body_sample(page)}
    finally:
        await manager.release(session)


async def status(request: dict[str, Any]) -> dict[str, Any]:
    """Read one public item page via MarketplaceStatusAction. Read-only."""
    from facebook_camofox_client.domain_actions.envelope import ActionEnvelope
    from facebook_camofox_client.domain_camofox.session_manager import CamofoxSessionManager
    from facebook_camofox_client.domain_events.emitter import InMemoryEventEmitter
    from facebook_camofox_client.domain_marketplace.status import MarketplaceStatusAction

    listing_id = str(request.get("params", {}).get("listing_id", ""))
    if not listing_id:
        return failure("badRequest", "params.listing_id is required")
    state = request["storage_state_path"]
    manager = CamofoxSessionManager()
    real_acquire = manager.acquire

    async def acquire_with_state(account_id, **kwargs):
        kwargs.setdefault("storage_state_path", state)
        return await real_acquire(account_id, **kwargs)

    manager.acquire = acquire_with_state  # type: ignore[method-assign]
    action = MarketplaceStatusAction(manager, InMemoryEventEmitter())
    env = ActionEnvelope(
        action_id=f"log-cli-status-{listing_id}",
        action_type=MarketplaceStatusAction.ACTION_TYPE,
        account_id=request.get("account_id") or "default",
        input={"listing_id": listing_id},
        idempotency_key=f"log-cli-status-{listing_id}",
    )
    log(f"Opening marketplace item {listing_id}")
    out = await action.execute(env)
    return {"ok": True, "listingId": out.listing_id, "listingUrl": out.listing_url,
            "status": out.status, "title": out.title}


ACTIONS = {"login": login, "marketplace.scan": scan, "marketplace.status": status}


def main() -> int:
    try:
        request = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
    except json.JSONDecodeError as exc:
        print(json.dumps(failure("badRequest", f"request is not JSON: {exc}")))
        return 1
    action = request.get("action")
    # No browser without the account's proxy, for any action, signing in included (rule 12).
    proxyGate.arm(request.get("proxy_path"))
    try:
        # Every Camoufox facebook-camofox-client launches: proxy gate, then headed,
        # humanized, cursor shown (rules 11 and 12).
        force_visible()
    except ImportError:
        pass  # no camoufox: `doctor` reports it
    # Anything a library prints goes to stderr, so stdout carries only the result.
    real_stdout, sys.stdout = sys.stdout, sys.stderr
    try:
        if action == "doctor":
            result = doctor(request)
        elif action == "proxy.check":
            result = proxyGate.check(request.get("proxy_path"))
        elif action in ACTIONS:
            if action != "login" and not Path(request.get("storage_state_path") or "").exists():
                result = failure("neverConnected", "no saved session",
                                 storageStatePath=request.get("storage_state_path"))
            else:
                result = asyncio.run(ACTIONS[action](request))
        else:
            result = failure("unknownAction", str(action))
    except proxyGate.GateError as exc:
        result = failure(exc.code, exc.detail)
    except Exception as exc:
        result = failure("crashed", f"{type(exc).__name__}: {exc}"[:400])
    finally:
        sys.stdout = real_stdout
    print(json.dumps(result))
    return 0 if result.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
