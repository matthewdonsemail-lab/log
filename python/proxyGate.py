"""No Camoufox opens for an account unless its proxy is attached and its exit
IP is in the account's country (AGENTS.md rule 12, matt 2026-10-18).

The TypeScript side writes the account's proxy (Twenty socialAccounts.proxy
and homeCountry) to a private temp file per run (camofox/run) and passes its
path, never the credentials, then this process calls arm() once. Every launch
goes through apply(), from visibleBrowser.launch_kwargs(), which:

1. reads the proxy file: none means `noProxy`. There is no exception, not
   for dry runs and not for signing in (matt: "never, ever open" without one);
2. resolves the exit IP through the proxy (Camoufox's own public_ip) and its
   country (Camoufox's own GeoIP database): unreachable means
   `proxyUnreachable`, a 407 means `proxyAuthFailed`;
3. refuses with `proxyCountryMismatch` unless that country is the file's
   `country`;
4. launches with the proxy and `geoip=<exit IP>`, so timezone, locale,
   geolocation and WebRTC all match the proxy, never this machine.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from errorCodes import checked

_armed: dict[str, Any] = {"path": None}


class GateError(Exception):
    """A refused launch. `code` is an error-catalog code."""

    def __init__(self, code: str, detail: str) -> None:
        super().__init__(detail)
        self.code = checked(code)
        self.detail = detail


def arm(proxy_path: str | None) -> None:
    _armed["path"] = proxy_path


def load_proxy(path: str | None) -> dict[str, Any] | None:
    if not path or not Path(path).is_file():
        return None
    try:
        proxy = json.loads(Path(path).read_text(encoding="utf8"))
    except Exception as exc:
        raise GateError("proxyMalformed", f"{path}: {exc}") from None
    if not isinstance(proxy, dict) or not proxy.get("server") or len(str(proxy.get("country") or "")) != 2:
        raise GateError("proxyMalformed", f"{path}: needs server and a 2-letter country")
    return proxy


def playwright_proxy(proxy: dict[str, Any]) -> dict[str, str]:
    out = {"server": str(proxy["server"])}
    for key in ("username", "password"):
        if proxy.get(key):
            out[key] = str(proxy[key])
    return out


def exit_location(proxy: dict[str, Any]) -> tuple[str, str]:
    """(exit IP, ISO country) as seen through the proxy. Raises GateError."""
    from camoufox.exceptions import InvalidIP
    from camoufox.geolocation import get_geolocation
    from camoufox.ip import Proxy, public_ip

    try:
        ip = public_ip(Proxy(**playwright_proxy(proxy)).as_string())
    except InvalidIP as exc:
        # Never echo the proxy URL back: it carries the password.
        text = str(exc)
        if "407" in text:
            raise GateError("proxyAuthFailed", "the proxy answered 407: check username and password") from None
        raise GateError("proxyUnreachable", f"no exit IP through {proxy['server']}") from None
    except Exception as exc:
        raise GateError("proxyMalformed", f"{type(exc).__name__} for {proxy['server']}") from None
    try:
        region = get_geolocation(ip).locale.region
    except Exception as exc:
        raise GateError("proxyCountryMismatch", f"exit IP {ip} has no known country ({type(exc).__name__})") from None
    return ip, str(region or "").upper()


def check(proxy_path: str | None) -> dict[str, Any]:
    """`log proxy check`: the exit IP and country, without opening a browser."""
    proxy = load_proxy(proxy_path)
    if proxy is None:
        raise GateError("noProxy", f"no proxy file at {proxy_path}")
    ip, country = exit_location(proxy)
    want = str(proxy["country"]).upper()
    if country != want:
        raise GateError("proxyCountryMismatch", f"exit IP {ip} is in {country or 'an unknown country'}, the account is {want}")
    return {"ok": True, "exitIp": ip, "exitCountry": country, "country": want}


def apply(kwargs: dict[str, Any]) -> dict[str, Any]:
    """The launch kwargs with the account's proxy and geoip forced, or a GateError."""
    proxy = load_proxy(_armed["path"])
    if proxy is None:
        raise GateError("noProxy", f"no proxy file at {_armed['path']}: no browser opens without one")
    ip = check(_armed["path"])["exitIp"]
    return {**kwargs, "proxy": playwright_proxy(proxy), "geoip": ip}
