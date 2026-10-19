"""One device per account (AGENTS.md rule 15, matt 2026-10-18).

Camoufox draws a new random device on every launch: OS, screen, GPU, fonts,
voices, and canvas/audio/font-spacing seeds. A Facebook account restored from
its cookies then shows up from a different computer every session, which is
what stolen cookies look like. So each account gets ONE device, made on its
first launch and replayed exactly on every launch after:

- new_profile() runs Camoufox's own launch_options() once, with os="windows"
  (this PC's real GPU and font stack render it, so a Mac or Linux claim would
  not match the pixels), no geoip (no network) and env={} so nothing from this
  process's environment is copied. It keeps only Camoufox's config (what it
  sends as CAMOU_CONFIG_*) and the Firefox prefs, minus everything that
  belongs to a single launch (PER_LAUNCH, PER_LAUNCH_PREFS). It also pins a
  point near the home city (CITY_COORDINATES from marketplace/home, else the
  exit IP's location) with a realistic geolocation accuracy (20-1500 m).
- build_launch() turns a stored profile back into Playwright launch options:
  the stored config plus this launch's exit-IP timezone and WebRTC IP, the
  pinned locale, humanize and the cursor, and an environment of the few
  system variables Firefox needs plus CAMOU_CONFIG_*. Never os.environ: it
  holds the Twenty and 2Captcha keys.

The profile travels Twenty → camofox/run → device.json → here, and a new one
goes back the same way (`created: true`). It is never printed.
"""
from __future__ import annotations

import json
import math
import os
import random
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

PROFILE_VERSION = 1

# Config keys that belong to one launch, set fresh by build_launch() and never stored.
PER_LAUNCH = ("timezone", "webrtc:", "geolocation:", "locale:", "humanize", "showcursor", "allowMainWorld", "addons", "debug")

# The only parts of this machine's environment the browser gets. Firefox on
# Windows needs the system paths; nothing else (no keys, no TZ, no LANG).
SAFE_ENV = (
    "SYSTEMROOT", "SYSTEMDRIVE", "WINDIR", "TEMP", "TMP", "USERPROFILE", "APPDATA", "LOCALAPPDATA",
    "HOMEDRIVE", "HOMEPATH", "PROGRAMDATA", "PROGRAMFILES", "PROGRAMFILES(X86)", "COMMONPROGRAMFILES",
    "NUMBER_OF_PROCESSORS", "PROCESSOR_ARCHITECTURE", "OS", "PATH", "PATHEXT", "COMSPEC",
    "HOME", "DISPLAY", "XAUTHORITY", "WAYLAND_DISPLAY", "XDG_RUNTIME_DIR",
)

# Pinned for every account: no HTTP/3 and no DNS-over-HTTPS around the proxy.
PINNED_PREFS = {"network.http.http3.enable": False, "network.trr.mode": 5}

# Firefox prefs that follow this launch, never stored.
PER_LAUNCH_PREFS = ("network.dns.disableIPv6", "intl.locale.requested")

ACCURACY_RANGE_M = (20.0, 1500.0)


class ProfileError(Exception):
    """The run's device file or the stored profile can't be used."""


def is_per_launch(key: str) -> bool:
    return any(key == p or (p.endswith(":") and key.startswith(p)) or key.startswith(p + ":") for p in PER_LAUNCH)


def strip_per_launch(config: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in config.items() if not is_per_launch(k)}


def decode_env_config(env: dict[str, Any]) -> dict[str, Any]:
    """CAMOU_CONFIG_1..n (Camoufox's chunked JSON) → the config dict."""
    chunks = sorted((int(k.rsplit("_", 1)[1]), str(v)) for k, v in env.items() if k.startswith("CAMOU_CONFIG_"))
    if not chunks:
        raise ProfileError("launch_options() returned no CAMOU_CONFIG")
    return json.loads("".join(v for _, v in chunks))


def safe_env(environ: dict[str, str] | None = None) -> dict[str, str]:
    source = os.environ if environ is None else environ
    return {k: v for k, v in source.items() if k.upper() in SAFE_ENV and not k.upper().startswith(("CAMOU", "CAMOFOX"))}


def locale_config(locale: str, languages: list[str]) -> dict[str, str]:
    """Pinned locale keys. No `locale:script`: with it, Intl resolves plain "en"
    and formats dates US-style; without it, the page and workers resolve en-IE
    (probed on this PC, 2026-10-18)."""
    language, _, region = locale.partition("-")
    out = {"locale:language": language, "locale:all": ", ".join(dict.fromkeys([locale, *languages]))}
    if region:
        out["locale:region"] = region.upper()
    return out


def refresh_version(config: dict[str, Any], major: str) -> dict[str, Any]:
    """After a browser upgrade the device updates its Firefox version, like a
    real Firefox does; everything else stays."""
    import re

    out = dict(config)
    for key in ("navigator.userAgent", "navigator.appVersion"):
        if isinstance(out.get(key), str):
            out[key] = re.sub(r"rv:\d+\.0", f"rv:{major}.0", re.sub(r"Firefox/\d+\.0", f"Firefox/{major}.0", out[key]))
    return out


def pinned_geolocation(lat: float, lon: float, rng: random.Random) -> dict[str, float]:
    """A point near the city (never its exact centroid) with a believable accuracy."""
    low, high = ACCURACY_RANGE_M
    accuracy = round(math.exp(rng.uniform(math.log(low), math.log(high))), 1)
    distance = rng.uniform(150.0, 1800.0)
    bearing = rng.uniform(0, 2 * math.pi)
    dlat = distance * math.cos(bearing) / 111_320.0
    dlon = distance * math.sin(bearing) / (111_320.0 * max(math.cos(math.radians(lat)), 0.01))
    return {"latitude": round(lat + dlat, 6), "longitude": round(lon + dlon, 6), "accuracy": accuracy}


def screen_bounds():
    """A screen no bigger than this PC's real monitor (the headed window is sized from
    it) and no smaller than a common laptop. Camoufox skips this bound for headed launches,
    which gave 3072x1728 and 5120x1440 screens on a 1920x1080 display."""
    try:
        from camoufox.fingerprints import Screen  # camoufox >= 0.5.8 (fpgen)
    except ImportError:
        from browserforge.fingerprints import Screen  # camoufox 0.5.5

    width, height = 1920, 1080
    try:
        from screeninfo import get_monitors

        monitor = max(get_monitors(), key=lambda m: m.width * m.height)
        width, height = monitor.width, monitor.height
    except Exception:
        pass
    return Screen(min_width=min(1280, width), max_width=width, min_height=min(720, height), max_height=height)


def versions() -> tuple[str, str]:
    from importlib.metadata import version

    from camoufox.pkgman import installed_verstr

    return version("camoufox"), installed_verstr()


def new_profile(run: dict[str, Any], exit_geo: dict[str, Any], log=lambda _m: None, rng: random.Random | None = None) -> dict[str, Any]:
    """The account's one device. Called only when Twenty has none for it."""
    from camoufox.utils import launch_options

    rng = rng or random.SystemRandom()
    # The locale only shapes what follows it (camoufox 0.5.8 draws the voices from the
    # display language); the locale keys themselves are per launch and stripped.
    opts = launch_options(os="windows", headless=False, env={}, screen=screen_bounds(), locale=run["locale"], i_know_what_im_doing=True)
    config = strip_per_launch(decode_env_config(opts["env"]))
    prefs = {k: v for k, v in (opts.get("firefox_user_prefs") or {}).items() if k not in PER_LAUNCH_PREFS}
    home = run.get("homeCoordinates")
    if home:
        geo = {**pinned_geolocation(home["latitude"], home["longitude"], rng), "source": "homeCity"}
    else:
        log(f"No coordinates for {run.get('homeCity') or '?'}, {run['homeCountry']}: the device is pinned near the exit IP's location")
        geo = {**pinned_geolocation(exit_geo["latitude"], exit_geo["longitude"], rng), "source": "exitIp"}
    package, browser = versions()
    return {
        "version": PROFILE_VERSION,
        "createdAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "os": "windows",
        "camoufoxVersion": package,
        "browserVersion": browser,
        "config": config,
        "firefoxUserPrefs": prefs,
        "geolocation": geo,
        "home": {"city": run.get("homeCity"), "country": run["homeCountry"], "timezone": run.get("homeTimezone")},
    }


def check_profile(profile: Any) -> dict[str, Any]:
    if not isinstance(profile, dict) or profile.get("version") != PROFILE_VERSION or profile.get("os") != "windows":
        raise ProfileError("not a version-1 windows device profile")
    config = profile.get("config")
    if not isinstance(config, dict) or not isinstance(config.get("navigator.userAgent"), str):
        raise ProfileError("the profile has no Camoufox config")
    geo = profile.get("geolocation") or {}
    if not all(isinstance(geo.get(k), (int, float)) for k in ("latitude", "longitude", "accuracy")):
        raise ProfileError("the profile has no pinned geolocation")
    if any(is_per_launch(k) for k in config):
        raise ProfileError("the profile stores per-launch keys")
    return profile


def read_run_file(path: str | None) -> dict[str, Any]:
    if not path or not Path(path).is_file():
        raise ProfileError(f"no device file at {path}")
    try:
        run = json.loads(Path(path).read_text(encoding="utf8"))
    except Exception as exc:
        raise ProfileError(f"device file unreadable ({type(exc).__name__})") from None
    for key in ("locale", "languages", "homeCountry", "homeTimezone"):
        if not run.get(key):
            raise ProfileError(f"device file has no {key}")
    if run.get("profile") is not None:
        check_profile(run["profile"])
    return run


def write_run_file(path: str, run: dict[str, Any]) -> None:
    Path(path).write_text(json.dumps(run), encoding="utf8")


def launch_config(profile: dict[str, Any], run: dict[str, Any], exit_ip: str, exit_timezone: str, visible: dict[str, Any], major: str) -> dict[str, Any]:
    """The full Camoufox config for this launch. Pure."""
    config = refresh_version(profile["config"], major)
    config.update(locale_config(run["locale"], list(run["languages"])))
    config["timezone"] = exit_timezone
    if ":" in exit_ip:
        config["webrtc:ipv6"] = exit_ip
    else:
        config["webrtc:ipv4"] = exit_ip
    geo = profile["geolocation"]
    config["geolocation:latitude"] = geo["latitude"]
    config["geolocation:longitude"] = geo["longitude"]
    config["geolocation:accuracy"] = geo["accuracy"]
    config["humanize"] = True
    config["humanize:maxTime"] = visible["humanize"]
    config["showcursor"] = bool(visible["showcursor"])
    return config


def launch_prefs(profile: dict[str, Any], run: dict[str, Any], exit_ip: str) -> dict[str, Any]:
    """The stored prefs plus this launch's: the UI locale requested is the pinned one
    (without a script part, like the Intl locale), IPv6 off for an IPv4 exit. Pure."""
    prefs = {k: v for k, v in profile["firefoxUserPrefs"].items() if k not in PER_LAUNCH_PREFS}
    prefs.update(PINNED_PREFS)
    prefs["intl.locale.requested"] = run["locale"]
    if ":" not in exit_ip:
        prefs["network.dns.disableIPv6"] = True
    return prefs


def build_launch(profile: dict[str, Any], run: dict[str, Any], exit_ip: str, exit_timezone: str, proxy: dict[str, str], visible: dict[str, Any]) -> dict[str, Any]:
    """Playwright launch options for this account, as Camoufox(from_options=...) takes them."""
    from camoufox.addons import add_default_addons
    from camoufox.pkgman import installed_verstr, launch_path
    from camoufox.utils import get_env_vars, get_target_os, validate_config

    config = launch_config(profile, run, exit_ip, exit_timezone, visible, installed_verstr().split(".", 1)[0])
    addons: list[str] = []
    add_default_addons(addons, None)
    if addons:
        config["addons"] = addons
    validate_config(config, path=None)
    prefs = launch_prefs(profile, run, exit_ip)
    env = {**safe_env(), **get_env_vars(config, get_target_os(config))}
    try:
        # camoufox >= 0.5.8 applies prefs at browser startup from CAMOU_PREFS_* (Playwright's
        # firefox_user_prefs arrive after startup, too late for intl.locale.requested).
        from camoufox.utils import get_pref_env_vars

        env.update(get_pref_env_vars(prefs))
    except ImportError:
        pass
    return {
        "executable_path": launch_path(),
        "args": [],
        "env": env,
        "firefox_user_prefs": prefs,
        "headless": bool(visible["headless"]),
        "proxy": proxy,
    }
