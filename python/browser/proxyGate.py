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

ALLOWED_CALLER_KEYS = frozenset({"headless", "humanize", "geoip", "proxy"})

IP_ECHO_URLS = ("https://api.ipify.org/", "https://checkip.amazonaws.com/")
IP_TEXT = re.compile(r"^\s*([0-9]{1,3}(?:\.[0-9]{1,3}){3}|[0-9a-fA-F:]{3,39})\s*$")

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
    capture = _armed.get("captureDir")
    if not capture:
        return
    try:
        Path(capture).mkdir(parents=True, exist_ok=True)
        at = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
        with open(Path(capture) / "steps.jsonl", "a", encoding="utf8") as steps:
            steps.write(json.dumps({"at": at, "step": message}) + "\n")
    except OSError:
        pass


class GateError(Exception):

    def __init__(self, code: str, detail: str) -> None:
        detail = redact(detail)
        super().__init__(detail)
        self.code = checked(code)
        self.detail = detail


def arm(proxy_path: str | None, device_path: str | None = None, capture_dir: str | None = None) -> None:
    _armed.update({key: None for key in _armed})
    _armed["path"] = proxy_path
    _armed["devicePath"] = device_path
    _armed["captureDir"] = capture_dir
    try:
        install_guards()
    except ImportError:
        pass


def load_proxy(path: str | None) -> dict[str, Any] | None:
    if not path or not Path(path).is_file():
        return None
    try:
        proxy = json.loads(Path(path).read_text(encoding="utf8"))
    except Exception as exc:
        raise GateError("proxyMalformed", f"{path}: {exc}") from None
    if isinstance(proxy, dict) and proxy.get("direct") is True:
        if str(proxy.get("platform") or "facebook") == "facebook":
            raise GateError("noProxy", f"{path}: a Facebook account never opens without its proxy (rule 12)")
        return proxy
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
    return _armed["proxy"]


def twocaptcha_proxy() -> dict[str, str] | None:
    proxy = _armed["proxy"]
    if not proxy or proxy.get("direct"):
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
    from camoufox.geolocation import get_geolocation

    geo = get_geolocation(ip)
    return {"country": str(geo.locale.region or "").upper(), "timezone": str(geo.timezone or ""),
            "latitude": geo.latitude, "longitude": geo.longitude}


def exit_location(proxy: dict[str, Any]) -> dict[str, Any]:
    from camoufox.exceptions import InvalidIP
    from camoufox.ip import public_ip

    try:
        ip = public_ip(None if proxy.get("direct") else proxy_url(proxy))
    except InvalidIP as exc:
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
    proxy = load_proxy(proxy_path)
    if proxy is None:
        raise GateError("noProxy", f"no proxy file at {proxy_path}")
    if proxy.get("direct"):
        where = exit_location(proxy)
        if not where["timezone"]:
            raise GateError("proxyCountryMismatch", f"this machine's exit {where['ip']} has no known timezone")
        return {"ok": True, "direct": True, "exitIp": where["ip"], "exitCountry": where["country"], "country": where["country"], "timezone": where["timezone"],
                "latitude": where["latitude"], "longitude": where["longitude"], "facebookMs": None}
    where = exit_location(proxy)
    ip, country, timezone = where["ip"], where["country"], where["timezone"]
    want = str(proxy["country"]).upper()
    if country != want:
        raise GateError("proxyCountryMismatch", f"exit IP {ip} is in {country or 'an unknown country'}, the account is {want}")
    if not timezone:
        raise GateError("proxyCountryMismatch", f"exit IP {ip} has no known timezone")
    return {"ok": True, "exitIp": ip, "exitCountry": country, "country": want, "timezone": timezone,
            "latitude": where["latitude"], "longitude": where["longitude"], "facebookMs": facebook_ms(proxy)}


FACEBOOK_PROBES = ("https://www.facebook.com/favicon.ico", "https://static.xx.fbcdn.net/rsrc.php/")
SLOW_MS = 2500
PROBE_ROUNDS = 3


def slow_ms() -> int:
    try:
        return int(os.environ.get("LOG_PROXY_MAX_MS") or SLOW_MS)
    except ValueError:
        return SLOW_MS


def facebook_ms(proxy: dict[str, Any]) -> int | None:
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
                pass
            except Exception:
                return 15_000
            worst = max(worst, int((time.monotonic() - started) * 1000))
        return worst

    best = 15_000
    for _ in range(PROBE_ROUNDS):
        best = min(best, one_round())
        if best <= slow_ms():
            break
    return best


def apply(kwargs: dict[str, Any], visible: dict[str, Any]) -> dict[str, Any]:
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
    if exit_.get("direct"):
        log(f"Gate passed with no proxy ({proxy.get('platform')} runs direct): this machine's exit {exit_['exitIp']} in {exit_['country']} ({exit_['timezone']})")
    else:
        log(f"Gate passed: exit {exit_['exitIp']} in {exit_['country']} ({exit_['timezone']}), proxy to Facebook {exit_.get('facebookMs')} ms")
    return {"proxy": proxy, **exit_}


async def check_attached(context: Any) -> None:
    observed = await _self_check(context, public=True)
    problem = compare(observed, expected())
    if problem is None:
        page = observed["page"]
        log(f"Self-check passed: exit {observed['ip']}, {page.get('timeZone')}, {page.get('language')} (page and worker)")
        return
    code, detail = problem
    if code == "browserExitIpMismatch":
        moved = exit_checked(observed["ip"])
        if moved is None:
            page = observed["page"]
            log(f"Self-check passed: exit {observed['ip']}, {page.get('timeZone')}, {page.get('language')} (page and worker)")
            return
        detail = moved
    log(f"Self-check refused ({code}): {detail}. Stopping the browser before anything else loads.")
    raise GateError(code, detail)


def exit_checked(ip: str, locate: Any = None) -> str | None:
    try:
        where = (locate or locate_ip)(ip)
    except Exception:
        where = {"country": "", "timezone": ""}
    if where.get("country") != _armed["country"] or where.get("timezone") != _armed["timezone"]:
        return f"the browser exits at {ip} in {where.get('country') or 'an unknown country'} ({where.get('timezone') or 'no timezone'}), the gate checked {_armed['exitIp']} in {_armed['country']} ({_armed['timezone']})"
    log(f"The browser exits at {ip}, not the gate's {_armed['exitIp']}: checked it, {where['country']} on {where['timezone']}, the same as the account's")
    _armed["exitIp"] = ip
    return None


def pinned() -> dict[str, Any]:
    return {k: _armed[k] for k in ("timezone", "exitIp", "country", "locale", "languages", "facebookLocale")}


def _require_gate(args: tuple, kwargs: dict[str, Any]) -> None:
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
    if not _armed["timezone"] or not _armed["geolocation"]:
        raise GateError("unguardedLaunch", "a browser context outside the proxy gate")
    for key in ("locale", "proxy", "userAgent", "timezoneId", "geolocation"):
        kwargs.pop(key, None)
    kwargs["timezoneId"] = _armed["timezone"]
    kwargs["geolocation"] = dict(_armed["geolocation"])
    kwargs["permissions"] = sorted(set(kwargs.get("permissions") or []) | {"geolocation"})
    _force_capture(kwargs)


def har_path(capture_dir: str) -> Path:
    folder = Path(capture_dir)
    folder.mkdir(parents=True, exist_ok=True)
    path, n = folder / "session.har", 1
    while path.exists():
        n += 1
        path = folder / f"session{n}.har"
    return path


def _force_capture(kwargs: dict[str, Any]) -> None:
    if not kwargs.get("recordHarPath"):
        if not _armed.get("captureDir"):
            raise GateError("captureMissing", "a browser context without a HAR capture folder: every action records one")
        kwargs["recordHarPath"] = str(har_path(_armed["captureDir"]))
    kwargs["recordHarContent"] = "embed"
    kwargs["recordHarMode"] = "full"


def expected() -> dict[str, Any]:
    return {"timezone": _armed["timezone"], "locale": _armed["locale"], "languages": _armed["languages"], "exitIp": _armed["exitIp"]}


def compare(observed: dict[str, Any], want: dict[str, Any]) -> tuple[str, str] | None:
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
        function._logCliGate = True
    BrowserType.launch = launch
    BrowserType.launch_persistent_context = launch_persistent_context
    Browser.new_context = new_context


def recheck_exit(context: Any) -> dict[str, Any]:
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
