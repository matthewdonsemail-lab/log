"""No Camoufox opens for an account unless its proxy is attached and its exit
IP is in the account's country (AGENTS.md rule 12, matt 2026-10-18), and then
only as the account's one device (rule 15), in its pinned locale (rule 16),
after a self-check (rule 17).

The TypeScript side writes the account's proxy (Twenty socialAccounts.proxy
and homeCountry) and its device file (pinned locale, home timezone, stored
device) to a private temp folder per run (browser/run) and passes the paths,
never the credentials. This process calls arm() once. Every launch goes
through apply(), from visibleBrowser.launch_kwargs(), which:

1. refuses any launch option a caller adds beyond headless/humanize/geoip/
   proxy, whose values it replaces anyway (`unguardedLaunch`): no caller
   locale, config, env, fingerprint, block_webrtc or persistent context;
2. reads the proxy file: none means `noProxy`. There is no exception, not
   for dry runs and not for signing in (matt: "never, ever open" without one);
3. resolves the exit IP through the proxy (Camoufox's own public_ip) and its
   country and timezone (Camoufox's own GeoIP database): unreachable means
   `proxyUnreachable`, a 407 `proxyAuthFailed`, another country or no
   timezone `proxyCountryMismatch`;
4. reads the device file (`deviceProfileInvalid` without one). On the
   account's first launch it makes the device (deviceProfile.new_profile) and
   writes it back for Twenty;
5. builds the launch from the stored device (deviceProfile.build_launch):
   the exit IP's timezone and WebRTC IP, the pinned locale, the pinned
   geolocation, headed, humanized, the cursor shown, and only the system
   environment variables Firefox needs.

Guards installed by arm() hold the rest, on Playwright's own classes, which
the sync and async APIs and every Camoufox route (AsyncCamoufox, Camoufox,
NewBrowser, launch_options + firefox.launch) all go through:

- BrowserType.launch / launch_persistent_context refuse anything apply()
  didn't build (`unguardedLaunch`), so `from camoufox import AsyncCamoufox`
  or a hand-made launch can't get round the gate;
- every context (Browser.new_context, which new_page uses, and persistent
  contexts) gets the exit IP's timezoneId, the pinned geolocation with the
  permission, and no caller locale, proxy or user agent. Camoufox's own
  timezone doesn't take on Windows (a Galway run showed this PC's
  Asia/Bangkok until the context set it);
- then, before the caller gets the context and so before Facebook can load,
  the self-check opens an IP echo through the browser and reads, in the page
  and in a dedicated worker, the timezone, navigator.language(s) and the Intl
  locale. Anything that isn't the exit IP's timezone, the pinned locale or
  the gate's exit IP closes the browser and refuses
  (`browserTimezoneMismatch`, `browserLocaleMismatch`,
  `browserExitIpMismatch`, `selfCheckFailed`).
"""
from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from device import deviceProfile
from errors.errorCodes import checked, redact, register_secret

_armed: dict[str, Any] = {
    "path": None,
    "devicePath": None,
    "proxy": None,
    "launch": None,
    "timezone": None,
    "exitIp": None,
    "country": None,
    "locale": None,
    "languages": None,
    "facebookLocale": None,
    "geolocation": None,
    "captureDir": None,
}

# What a caller may pass to a Camoufox launcher. Their values are replaced.
ALLOWED_CALLER_KEYS = frozenset({"headless", "humanize", "geoip", "proxy"})

# Plain-text IP echoes the self-check and the rotation check load through the browser.
IP_ECHO_URLS = ("https://api.ipify.org/", "https://checkip.amazonaws.com/")
IP_TEXT = re.compile(r"^\s*([0-9]{1,3}(?:\.[0-9]{1,3}){3}|[0-9a-fA-F:]{3,39})\s*$")

# Evaluated in the page; runs the same probe in a dedicated worker.
SELF_CHECK_JS = """async () => {
  const realm = () => {
    const r = Intl.DateTimeFormat().resolvedOptions();
    return { timeZone: r.timeZone, intlLocale: r.locale, numberLocale: new Intl.NumberFormat().resolvedOptions().locale,
             language: navigator.language, languages: Array.from(navigator.languages || []),
             offset: new Date().getTimezoneOffset() };
  };
  const worker = await new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(new Blob(['postMessage((' + realm.toString() + ')())'], { type: 'text/javascript' }));
      const w = new Worker(url);
      w.onmessage = (e) => { resolve(e.data); w.terminate(); };
      w.onerror = (e) => resolve({ error: String((e && e.message) || 'worker error') });
      setTimeout(() => resolve({ error: 'the worker did not answer in 5s' }), 5000);
    } catch (e) { resolve({ error: String(e) }); }
  });
  return { page: realm(), worker };
}"""


def log(message: str) -> None:
    print(message, file=sys.stderr, flush=True)
    note_step(message)


def note_step(message: str) -> None:
    """Every action of a run, timed, next to its HAR (`steps.jsonl`), so log-cli
    can cut the HAR into one file per action for rea. Lines name actions and
    page paths only, never credentials."""
    capture = _armed.get("captureDir")
    if not capture:
        return
    try:
        Path(capture).mkdir(parents=True, exist_ok=True)
        at = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
        with open(Path(capture) / "steps.jsonl", "a", encoding="utf8") as steps:
            steps.write(json.dumps({"at": at, "step": message}) + "\n")
    except OSError:
        pass  # the timeline is for analysis; it never stops a run


class GateError(Exception):
    """A refused launch. `code` is an error-catalog code."""

    def __init__(self, code: str, detail: str) -> None:
        detail = redact(detail)
        super().__init__(detail)
        self.code = checked(code)
        self.detail = detail


def arm(proxy_path: str | None, device_path: str | None = None, capture_dir: str | None = None) -> None:
    _armed.update({key: None for key in _armed})
    _armed["path"] = proxy_path
    _armed["devicePath"] = device_path
    # Every browser context records a raw HAR here (rule 22); none opens without it.
    _armed["captureDir"] = capture_dir
    try:
        install_guards()
    except ImportError:
        pass  # no playwright: nothing can launch, and `doctor` reports it


def load_proxy(path: str | None) -> dict[str, Any] | None:
    if not path or not Path(path).is_file():
        return None
    try:
        proxy = json.loads(Path(path).read_text(encoding="utf8"))
    except Exception as exc:
        raise GateError("proxyMalformed", f"{path}: {exc}") from None
    if not isinstance(proxy, dict) or not proxy.get("server") or len(str(proxy.get("country") or "")) != 2:
        raise GateError("proxyMalformed", f"{path}: needs server and a 2-letter country")
    username = str(proxy.get("username") or "")
    register_secret(proxy.get("password"))
    register_secret(username.split("-", 1)[0] if "-" in username else username)
    return proxy


def playwright_proxy(proxy: dict[str, Any]) -> dict[str, str]:
    out = {"server": str(proxy["server"])}
    for key in ("username", "password"):
        if proxy.get(key):
            out[key] = str(proxy[key])
    return out


def proxy_url(proxy: dict[str, Any]) -> str:
    """scheme://user:pass@host:port with the credentials percent-encoded (Camoufox's
    Proxy.as_string doesn't encode them, so a password with @ or : would break)."""
    from urllib.parse import quote

    scheme, _, hostport = str(proxy["server"]).partition("://")
    if not hostport:
        scheme, hostport = "http", scheme
    auth = ""
    if proxy.get("username"):
        auth = quote(str(proxy["username"]), safe="")
        if proxy.get("password"):
            auth += ":" + quote(str(proxy["password"]), safe="")
        auth += "@"
    return f"{scheme}://{auth}{hostport}"


def loaded_proxy() -> dict[str, Any] | None:
    """The proxy this launch went through (for 2Captcha). Never print it."""
    return _armed["proxy"]


def twocaptcha_proxy() -> dict[str, str] | None:
    """The account's proxy in 2captcha-python's shape, so a 2Captcha worker
    solves from the same exit as the browser. None when there is none."""
    proxy = _armed["proxy"]
    if not proxy:
        return None
    scheme, _, hostport = str(proxy["server"]).partition("://")
    if not hostport:
        scheme, hostport = "http", scheme
    kind = {"http": "HTTP", "https": "HTTPS", "socks5": "SOCKS5", "socks4": "SOCKS4"}.get(scheme.lower())
    if not kind:
        return None
    auth = ""
    if proxy.get("username"):
        auth = str(proxy["username"]) + (f":{proxy['password']}" if proxy.get("password") else "") + "@"
    return {"type": kind, "uri": f"{auth}{hostport}"}


def locate_ip(ip: str) -> dict[str, Any]:
    """Country, timezone and coordinates of an IP from Camoufox's GeoIP database."""
    from camoufox.geolocation import get_geolocation

    geo = get_geolocation(ip)
    return {"country": str(geo.locale.region or "").upper(), "timezone": str(geo.timezone or ""),
            "latitude": geo.latitude, "longitude": geo.longitude}


def exit_location(proxy: dict[str, Any]) -> dict[str, Any]:
    """The exit IP seen through the proxy, with its country, timezone and coordinates. Raises GateError."""
    from camoufox.exceptions import InvalidIP
    from camoufox.ip import public_ip

    try:
        ip = public_ip(proxy_url(proxy))
    except InvalidIP as exc:
        # Never echo the proxy URL back: it carries the password.
        if "407" in str(exc):
            raise GateError("proxyAuthFailed", "the proxy answered 407: check username and password") from None
        raise GateError("proxyUnreachable", f"no exit IP through {proxy['server']}") from None
    except Exception as exc:
        raise GateError("proxyMalformed", f"{type(exc).__name__} for {proxy['server']}") from None
    try:
        where = locate_ip(ip)
    except Exception as exc:
        raise GateError("proxyCountryMismatch", f"exit IP {ip} has no known country ({type(exc).__name__})") from None
    return {"ip": ip, **where}


def check(proxy_path: str | None) -> dict[str, Any]:
    """`log proxy check`: the exit IP and country, without opening a browser."""
    proxy = load_proxy(proxy_path)
    if proxy is None:
        raise GateError("noProxy", f"no proxy file at {proxy_path}")
    where = exit_location(proxy)
    ip, country, timezone = where["ip"], where["country"], where["timezone"]
    want = str(proxy["country"]).upper()
    if country != want:
        raise GateError("proxyCountryMismatch", f"exit IP {ip} is in {country or 'an unknown country'}, the account is {want}")
    if not timezone:
        raise GateError("proxyCountryMismatch", f"exit IP {ip} has no known timezone")
    return {"ok": True, "exitIp": ip, "exitCountry": country, "country": want, "timezone": timezone,
            "latitude": where["latitude"], "longitude": where["longitude"], "facebookMs": facebook_ms(proxy)}


# Facebook's own hosts, fetched through the proxy. A page is hundreds of these:
# an exit that takes seconds for each never gets past the loading skeleton.
FACEBOOK_PROBES = ("https://www.facebook.com/favicon.ico", "https://static.xx.fbcdn.net/rsrc.php/")
# A healthy exit answers in about a second; the 2026-10-19 skeleton exit took 3 s here and 5-12 s per page file.
SLOW_MS = 2500
PROBE_ROUNDS = 3


def slow_ms() -> int:
    """The limit for this run: `--proxyMs <ms>` on any log command sets LOG_PROXY_MAX_MS (rule 33); default SLOW_MS."""
    try:
        return int(os.environ.get("LOG_PROXY_MAX_MS") or SLOW_MS)
    except ValueError:
        return SLOW_MS


def facebook_ms(proxy: dict[str, Any]) -> int | None:
    """The slowest of FACEBOOK_PROBES through the proxy, in ms (any HTTP answer counts,
    a timeout counts as 15 s). None for a SOCKS proxy, which urllib can't time."""
    import time
    import urllib.error
    import urllib.request

    if not str(proxy["server"]).lower().startswith("http"):
        return None
    url = proxy_url(proxy)
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({"http": url, "https": url}))

    def one_round() -> int:
        worst = 0
        for probe in FACEBOOK_PROBES:
            started = time.monotonic()
            try:
                opener.open(urllib.request.Request(probe, headers={"User-Agent": "Mozilla/5.0"}), timeout=15).read(256)
            except urllib.error.HTTPError:
                pass  # an answer is an answer: only the time matters
            except Exception:
                return 15_000
            worst = max(worst, int((time.monotonic() - started) * 1000))
        return worst

    # Residential exits swing from one moment to the next (one exit measured 2 s, then 5 s,
    # three minutes apart): the fastest of three rounds is the exit's real speed. A slow
    # exit stays slow every round; a fast one is let through on its first.
    best = 15_000
    for _ in range(PROBE_ROUNDS):
        best = min(best, one_round())
        if best <= slow_ms():
            break
    return best


def apply(kwargs: dict[str, Any], visible: dict[str, Any]) -> dict[str, Any]:
    """The only launch options any Camoufox in log-cli gets: {"from_options": ...}, or a GateError."""
    refused = sorted(set(kwargs) - ALLOWED_CALLER_KEYS)
    if refused:
        raise GateError("unguardedLaunch", f"launch options the gate doesn't allow: {', '.join(refused)}")
    if "headless" in kwargs and kwargs["headless"] not in (None, False):
        raise GateError("unguardedLaunch", "a headless launch was asked for (rule 11)")
    proxy = load_proxy(_armed["path"])
    if proxy is None:
        raise GateError("noProxy", f"no proxy file at {_armed['path']}: no browser opens without one")
    exit_ = check(_armed["path"])
    if exit_.get("facebookMs") is not None and exit_["facebookMs"] > slow_ms():
        # Loud, before any page: otherwise Facebook sits on its loading skeleton for minutes.
        raise GateError("proxyTooSlow", f"exit IP {exit_['exitIp']} took {exit_['facebookMs']} ms for one Facebook file (limit {slow_ms()} ms). Run: log proxy assign --account <name>, or raise the limit for this run with --proxyMs <ms>")
    try:
        run = deviceProfile.read_run_file(_armed["devicePath"])
        profile = run.get("profile")
        if profile is None:
            log(f"First launch for {run.get('accountName')}: making its one device (rule 15)")
            profile = deviceProfile.check_profile(deviceProfile.new_profile(run, exit_, log))
            run = {**run, "profile": profile, "created": True}
            deviceProfile.write_run_file(_armed["devicePath"], run)
    except deviceProfile.ProfileError as exc:
        raise GateError("deviceProfileInvalid", str(exc)) from None
    options = deviceProfile.build_launch(profile, run, exit_["exitIp"], exit_["timezone"], playwright_proxy(proxy), visible)
    _armed.update({
        "proxy": proxy,
        "launch": options,
        "timezone": exit_["timezone"],
        "exitIp": exit_["exitIp"],
        "country": exit_["country"],
        "locale": run["locale"],
        "languages": list(run["languages"]),
        "facebookLocale": run.get("facebookLocale"),
        "geolocation": {k: profile["geolocation"][k] for k in ("latitude", "longitude", "accuracy")},
    })
    install_guards()
    return {"from_options": options}


def gate_attached() -> dict[str, Any]:
    """Rule 12 for a browser log-cli attaches to instead of launching (AdsPower over CDP, rule 44).

    The same checks apply() runs before a Camoufox launch: the armed proxy file, its exit IP
    in the account's country, its speed to Facebook, the capture folder (rule 22). It pins
    the exit timezone, IP and the account's locale for the self-check. The browser is
    started only after this returns. Returns the proxy and the exit it was checked at.
    """
    proxy = load_proxy(_armed["path"])
    if proxy is None:
        raise GateError("noProxy", f"no proxy file at {_armed['path']}: no browser opens without one")
    if not _armed.get("captureDir"):
        raise GateError("captureMissing", "a browser without a HAR capture folder: every action records one")
    exit_ = check(_armed["path"])
    if exit_.get("facebookMs") is not None and exit_["facebookMs"] > slow_ms():
        raise GateError("proxyTooSlow", f"exit IP {exit_['exitIp']} took {exit_['facebookMs']} ms for one Facebook file (limit {slow_ms()} ms). Run: log proxy assign --account <name>, or raise the limit for this run with --proxyMs <ms>")
    try:
        run = deviceProfile.read_run_file(_armed["devicePath"])
    except deviceProfile.ProfileError as exc:
        raise GateError("deviceProfileInvalid", str(exc)) from None
    _armed.update({
        "proxy": proxy,
        "timezone": exit_["timezone"],
        "exitIp": exit_["exitIp"],
        "country": exit_["country"],
        "locale": run["locale"],
        "languages": list(run["languages"]),
        "facebookLocale": run.get("facebookLocale"),
    })
    log(f"Gate passed: exit {exit_['exitIp']} in {exit_['country']} ({exit_['timezone']}), proxy to Facebook {exit_.get('facebookMs')} ms")
    return {"proxy": proxy, **exit_}


async def check_attached(context: Any) -> None:
    """Rule 17 on an attached browser's context, before Facebook loads: the same self-check and verdict
    as a Camoufox context. On a refusal the caller stops the browser through its own API (the profile's
    context isn't ours to close); a pass logs "Self-check passed", which counts the launch (rule 24)."""
    observed = await _self_check(context, public=True)
    problem = compare(observed, expected())
    if problem is None:
        page = observed["page"]
        log(f"Self-check passed: exit {observed['ip']}, {page.get('timeZone')}, {page.get('language')} (page and worker)")
        return
    code, detail = problem
    log(f"Self-check refused ({code}): {detail}. Stopping the browser before anything else loads.")
    raise GateError(code, detail)


def pinned() -> dict[str, Any]:
    """What this launch pinned (no secrets): for publishSession's form URL and logs."""
    return {k: _armed[k] for k in ("timezone", "exitIp", "country", "locale", "languages", "facebookLocale")}


# -- guards on Playwright --------------------------------------------------
def _require_gate(args: tuple, kwargs: dict[str, Any]) -> None:
    """Only the launch apply() built may start a browser."""
    built = _armed["launch"]
    if built is None:
        raise GateError("unguardedLaunch", "a browser launch that didn't go through the proxy gate")
    same = (
        not args
        and kwargs.get("env") == built["env"]
        and kwargs.get("proxy") == built["proxy"]
        and "headless" in kwargs and kwargs["headless"] is False
        and str(kwargs.get("executablePath")) == str(built["executable_path"])
    )
    if not same:
        raise GateError("unguardedLaunch", "launch options differ from what the proxy gate built")


def _force_context(kwargs: dict[str, Any]) -> None:
    """The exit IP's timezone and the pinned geolocation on every context; no caller locale, proxy or UA."""
    if not _armed["timezone"] or not _armed["geolocation"]:
        raise GateError("unguardedLaunch", "a browser context outside the proxy gate")
    for key in ("locale", "proxy", "userAgent", "timezoneId", "geolocation"):
        kwargs.pop(key, None)
    kwargs["timezoneId"] = _armed["timezone"]
    kwargs["geolocation"] = dict(_armed["geolocation"])
    kwargs["permissions"] = sorted(set(kwargs.get("permissions") or []) | {"geolocation"})
    _force_capture(kwargs)


def har_path(capture_dir: str) -> Path:
    """`session.har`, or `session2.har`... when a run opens more than one context."""
    folder = Path(capture_dir)
    folder.mkdir(parents=True, exist_ok=True)
    path, n = folder / "session.har", 1
    while path.exists():
        n += 1
        path = folder / f"session{n}.har"
    return path


def _force_capture(kwargs: dict[str, Any]) -> None:
    """Rule 22: every context records a raw HAR (rule 19), mandatory for every
    action. A caller's own HAR path is kept (publish names its own); otherwise
    the armed capture folder is used, and with neither nothing opens."""
    if not kwargs.get("recordHarPath"):
        if not _armed.get("captureDir"):
            raise GateError("captureMissing", "a browser context without a HAR capture folder: every action records one")
        kwargs["recordHarPath"] = str(har_path(_armed["captureDir"]))
    kwargs["recordHarContent"] = "embed"
    kwargs["recordHarMode"] = "full"


def expected() -> dict[str, Any]:
    return {"timezone": _armed["timezone"], "locale": _armed["locale"], "languages": _armed["languages"], "exitIp": _armed["exitIp"]}


def compare(observed: dict[str, Any], want: dict[str, Any]) -> tuple[str, str] | None:
    """The self-check's verdict: None when the browser is what the gate pinned. Pure."""
    for realm in ("page", "worker"):
        values = observed.get(realm) or {}
        if values.get("error") or not values:
            return "selfCheckFailed", f"{realm}: {values.get('error') or 'no answer'}"
        if values.get("timeZone") != want["timezone"]:
            return "browserTimezoneMismatch", f"the {realm} is on {values.get('timeZone')}, the exit IP is on {want['timezone']}"
    if (observed["page"].get("offset") != observed["worker"].get("offset")):
        return "browserTimezoneMismatch", f"page offset {observed['page'].get('offset')} != worker {observed['worker'].get('offset')}"
    for realm in ("page", "worker"):
        values = observed[realm]
        for key in ("language", "intlLocale", "numberLocale"):
            if values.get(key) != want["locale"]:
                return "browserLocaleMismatch", f"{realm} {key} is {values.get(key)}, the account's locale is {want['locale']}"
        if list(values.get("languages") or []) != list(want["languages"]):
            return "browserLocaleMismatch", f"{realm} navigator.languages is {values.get('languages')}, pinned {want['languages']}"
    ip = observed.get("ip")
    if not ip:
        return "selfCheckFailed", "no IP echo answered through the browser"
    if ip != want["exitIp"]:
        return "browserExitIpMismatch", f"the browser exits at {ip}, the gate checked {want['exitIp']}"
    return None


def _ip_from_text(text: str) -> str | None:
    match = IP_TEXT.match(text or "")
    return match.group(1) if match else None


async def _self_check(context: Any, public: bool = False) -> dict[str, Any]:
    """One throwaway page on an IP echo. `context` is Playwright-internal (the launch guards, which take
    camelCase options) unless `public` (a context from playwright.async_api, e.g. AdsPower over CDP,
    which takes snake_case: wait_until). The last load error is kept, so a refusal says why."""
    page = await context.new_page()
    try:
        ip, last_error = None, None
        for url in IP_ECHO_URLS:
            try:
                if public:
                    await page.goto(url, timeout=30_000, wait_until="domcontentloaded")
                else:
                    await page.goto(url, timeout=30_000, waitUntil="domcontentloaded")
                ip = _ip_from_text(await page.evaluate("() => document.body ? document.body.innerText : ''"))
                if not ip:
                    last_error = f"{url} answered no IP"
            except Exception as exc:
                ip, last_error = None, f"{url}: {type(exc).__name__}: {str(exc).splitlines()[0][:200] if str(exc) else ''}"
            if ip:
                break
        if not ip:
            return {"ip": None, "page": {"error": f"no IP echo loaded ({redact(last_error or 'unknown')})"}, "worker": {}}
        return {"ip": ip, **(await page.evaluate(SELF_CHECK_JS))}
    finally:
        try:
            await page.close()
        except Exception:
            pass


async def _checked(context: Any, browser: Any) -> None:
    observed = await _self_check(context)
    problem = compare(observed, expected())
    if problem is None:
        page = observed["page"]
        log(f"Self-check passed: exit {observed['ip']}, {page.get('timeZone')}, {page.get('language')} (page and worker)")
        return
    code, detail = problem
    log(f"Self-check refused ({code}): {detail}. Closing the browser before anything else loads.")
    for target in (context, browser):
        if target is not None:
            try:
                await target.close()
            except Exception:
                pass
    raise GateError(code, detail)


def install_guards() -> None:
    from playwright._impl._browser import Browser
    from playwright._impl._browser_type import BrowserType

    if getattr(BrowserType.launch, "_logCliGate", False):
        return
    original_launch = BrowserType.launch
    original_persistent = BrowserType.launch_persistent_context
    original_new_context = Browser.new_context

    async def launch(self: Any, *args: Any, **kwargs: Any) -> Any:
        _require_gate(args, kwargs)
        return await original_launch(self, **kwargs)

    async def launch_persistent_context(self: Any, *args: Any, **kwargs: Any) -> Any:
        user_data_dir = args[0] if args else kwargs.pop("userDataDir", None)
        _require_gate(args[1:], kwargs)
        _force_context(kwargs)
        context = await original_persistent(self, user_data_dir, **kwargs)
        await _checked(context, None)
        return context

    async def new_context(self: Any, *args: Any, **kwargs: Any) -> Any:
        if args:
            raise GateError("unguardedLaunch", "positional new_context arguments")
        _force_context(kwargs)
        context = await original_new_context(self, **kwargs)
        await _checked(context, self)
        return context

    for function in (launch, launch_persistent_context, new_context):
        function._logCliGate = True  # type: ignore[attr-defined]
    BrowserType.launch = launch  # type: ignore[method-assign]
    BrowserType.launch_persistent_context = launch_persistent_context  # type: ignore[method-assign]
    Browser.new_context = new_context  # type: ignore[method-assign]


# -- during a run ----------------------------------------------------------
def recheck_exit(context: Any) -> dict[str, Any]:
    """The exit IP now, read through the browser (a throwaway tab on an IP echo,
    sync API). Another country raises `proxyCountryChanged`; a new IP in the
    same country is returned as `changed` so the run can record it."""
    page = context.new_page()
    try:
        ip = None
        for url in IP_ECHO_URLS:
            try:
                page.goto(url, timeout=30_000, wait_until="domcontentloaded")
                ip = _ip_from_text(page.evaluate("() => document.body ? document.body.innerText : ''"))
            except Exception:
                ip = None
            if ip:
                break
    finally:
        try:
            page.close()
        except Exception:
            pass
    if not ip:
        raise GateError("selfCheckFailed", "no IP echo answered through the browser before Publish")
    if ip == _armed["exitIp"]:
        return {"ip": ip, "changed": None}
    try:
        country = locate_ip(ip)["country"]
    except Exception:
        country = ""
    if country != _armed["country"]:
        raise GateError("proxyCountryChanged", f"the exit moved from {_armed['exitIp']} to {ip} in {country or 'an unknown country'}, the account is {_armed['country']}")
    changed = {"from": _armed["exitIp"], "to": ip, "country": country}
    log(f"The exit IP moved from {changed['from']} to {ip}, still in {country}")
    _armed["exitIp"] = ip
    return {"ip": ip, "changed": changed}
