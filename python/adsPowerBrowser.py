"""AdsPower's Local API from Python, for browserDriver.py's AdsPower opener (rule 44).

The same v2 endpoints the TS client uses (src/browser/adsPower/client.ts), from the
AdsPower docs (RESEARCH/MARKETPLACE_PROVIDERS/antidetectBrowsers/adsPower/DOCS.md):
start, stop and update a profile, with the key as `Authorization: Bearer`. The Local API
answers only on this machine (local.adspower.net, localhost or 127.0.0.1; docs/deployment.md),
so this runs beside AdsPower. ADSPOWER_HOST and ADSPOWER_API_KEY come from the environment
(log-cli's .env.local). The key is never printed.
"""
from __future__ import annotations

import json
import os
import time
import urllib.request
from typing import Any
from urllib.parse import urlsplit

import proxyGate

DEFAULT_HOST = "http://local.adspower.net:50325"
RATE_LIMIT_WAIT_S = (2.0, 4.0)


def base_url() -> str:
    return (os.environ.get("ADSPOWER_HOST") or DEFAULT_HOST).strip().rstrip("/")


def _call(method: str, path: str, body: dict[str, Any] | None = None) -> Any:
    key = (os.environ.get("ADSPOWER_API_KEY") or "").strip()
    proxyGate.register_secret(key)
    headers = {"Content-Type": "application/json", **({"Authorization": f"Bearer {key}"} if key else {})}
    data = json.dumps(body).encode() if body is not None else None
    for attempt in range(len(RATE_LIMIT_WAIT_S) + 1):
        request = urllib.request.Request(f"{base_url()}{path}", data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                reply = json.loads(response.read().decode("utf8"))
        except Exception as exc:
            raise proxyGate.GateError("adsPowerUnavailable", f"{method} {path}: {exc} (is the AdsPower app running?)") from None
        if reply.get("code") == 0:
            return reply.get("data")
        msg = str(reply.get("msg") or "")
        if "too many request" in msg.lower() and attempt < len(RATE_LIMIT_WAIT_S):
            time.sleep(RATE_LIMIT_WAIT_S[attempt])
            continue
        code = "adsPowerRateLimited" if "too many request" in msg.lower() else "adsPowerRequestFailed"
        raise proxyGate.GateError(code, f"{path}: {msg or 'code ' + str(reply.get('code'))}")
    raise proxyGate.GateError("adsPowerRateLimited", path)


def user_proxy_config(proxy: dict[str, Any]) -> dict[str, str]:
    """The gate's proxy file (server, username, password) as AdsPower's user_proxy_config. Pure."""
    server = urlsplit(str(proxy["server"]) if "://" in str(proxy["server"]) else f"http://{proxy['server']}")
    return {
        "proxy_soft": "other",
        "proxy_type": server.scheme if server.scheme in ("http", "https", "socks5") else "http",
        "proxy_host": server.hostname or "",
        "proxy_port": str(server.port or ""),
        "proxy_user": str(proxy.get("username") or ""),
        "proxy_password": str(proxy.get("password") or ""),
    }


NO_PROXY = {"proxy_soft": "no_proxy"}


def set_proxy(profile_id: str, config: dict[str, str]) -> None:
    _call("POST", "/api/v2/browser-profile/update", {"profile_id": profile_id, "user_proxy_config": config})


def start(profile_id: str) -> str:
    """Opens the profile headed (rule 11's intent: a window you can watch), no IP tab, no restored tabs.
    Returns the CDP websocket Playwright's connect_over_cdp takes (AdsPower calls it `ws.puppeteer`)."""
    data = _call("POST", "/api/v2/browser-profile/start", {
        "profile_id": profile_id, "headless": "0", "last_opened_tabs": "0", "proxy_detection": "0", "cdp_mask": "1",
    })
    ws = ((data or {}).get("ws") or {}).get("puppeteer")
    if not ws:
        raise proxyGate.GateError("adsPowerRequestFailed", f"profile {profile_id} started without a CDP websocket")
    return str(ws)


def stop(profile_id: str) -> None:
    _call("POST", "/api/v2/browser-profile/stop", {"profile_id": profile_id})
