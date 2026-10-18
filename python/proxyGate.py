"""No Camoufox opens for an account unless its proxy is attached and its exit
IP is in the account's country (AGENTS.md rule 12, matt 2026-10-18).

The TypeScript side passes the path of the account's proxy file
(`~/.logCli/proxies/<accountId>.json`), never the credentials, and calls
arm() once per process. Every launch then goes through apply(), from
visibleBrowser.launch_kwargs(), which:

1. reads the proxy file: none means `noProxy`, unless this launch is a person
   signing in (`log connect`), the only launch allowed without one;
2. resolves the exit IP through the proxy (Camoufox's own public_ip) and its
   country (Camoufox's own GeoIP database): unreachable means
   `proxyUnreachable`, a 407 means `proxyAuthFailed`;
3. refuses with `proxyCountryMismatch` unless that country is the file's
   `country`;
4. launches with the proxy and `geoip=<exit IP>`, so timezone, locale,
   geolocation and WebRTC all match the proxy, never this machine.

A sign-in whose account has a proxy file still goes through 2-4.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

from errorCodes import checked

_armed: dict[str, Any] = {"path": None, "allowNoProxy": False}


class GateError(Exception):
    """A refused launch. `code` is an error-catalog code."""

    def __init__(self, code: str, detail: str) -> None:
        super().__init__(detail)
        self.code = checked(code)
        self.detail = detail


def arm(proxy_path: str | None, allow_no_proxy: bool = False) -> None:
    _armed["path"] = proxy_path
    _armed["allowNoProxy"] = allow_no_proxy


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


def _machine_country() -> str:
    try:
        from camoufox.geolocation import get_geolocation
        from camoufox.ip import public_ip

        return str(get_geolocation(public_ip()).locale.region or "unknown country")
    except Exception:
        return "unknown country"


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
        if _armed["allowNoProxy"]:
            # A person signing in, and the account has no proxy yet. Say where Facebook will see them.
            print(f"proxyGate: no proxy for this account. Facebook will see this machine ({_machine_country()})."
                  " Set one with `log proxy set` and sign in again through it.", file=sys.stderr, flush=True)
            return {**kwargs, "proxy": None, "geoip": True}
        raise GateError("noProxy", f"no proxy file at {_armed['path']}: no browser opens without one")
    ip = check(_armed["path"])["exitIp"]
    return {**kwargs, "proxy": playwright_proxy(proxy), "geoip": ip}
