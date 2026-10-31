from __future__ import annotations

import json
import math
import os
import random
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

PROFILE_VERSION = 1

HUMANIZE_MIN_SECONDS = 0.02
PER_LAUNCH = ("timezone", "webrtc:", "geolocation:", "locale:", "humanize", "showcursor", "allowMainWorld", "addons", "debug")

SAFE_ENV = (
    "SYSTEMROOT", "SYSTEMDRIVE", "WINDIR", "TEMP", "TMP", "USERPROFILE", "APPDATA", "LOCALAPPDATA",
    "HOMEDRIVE", "HOMEPATH", "PROGRAMDATA", "PROGRAMFILES", "PROGRAMFILES(X86)", "COMMONPROGRAMFILES",
    "NUMBER_OF_PROCESSORS", "PROCESSOR_ARCHITECTURE", "OS", "PATH", "PATHEXT", "COMSPEC",
    "HOME", "DISPLAY", "XAUTHORITY", "WAYLAND_DISPLAY", "XDG_RUNTIME_DIR",
)

PINNED_PREFS = {"network.http.http3.enable": False, "network.trr.mode": 5}

PER_LAUNCH_PREFS = ("network.dns.disableIPv6", "intl.locale.requested")

ACCURACY_RANGE_M = (20.0, 1500.0)


class ProfileError(Exception):
    pass


def is_per_launch(key: str) -> bool:
    return any(key == p or (p.endswith(":") and key.startswith(p)) or key.startswith(p + ":") for p in PER_LAUNCH)


def strip_per_launch(config: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in config.items() if not is_per_launch(k)}


def decode_env_config(env: dict[str, Any]) -> dict[str, Any]:
    chunks = sorted((int(k.rsplit("_", 1)[1]), str(v)) for k, v in env.items() if k.startswith("CAMOU_CONFIG_"))
    if not chunks:
        raise ProfileError("launch_options() returned no CAMOU_CONFIG")
    return json.loads("".join(v for _, v in chunks))


def safe_env(environ: dict[str, str] | None = None) -> dict[str, str]:
    source = os.environ if environ is None else environ
    return {k: v for k, v in source.items() if k.upper() in SAFE_ENV and not k.upper().startswith(("CAMOU", "CAMOFOX"))}


def locale_config(locale: str, languages: list[str]) -> dict[str, str]:
    language, _, region = locale.partition("-")
    out = {"locale:language": language, "locale:all": ", ".join(dict.fromkeys([locale, *languages]))}
    if region:
        out["locale:region"] = region.upper()
    return out


def refresh_version(config: dict[str, Any], major: str) -> dict[str, Any]:
    import re

    out = dict(config)
    for key in ("navigator.userAgent", "navigator.appVersion"):
        if isinstance(out.get(key), str):
            out[key] = re.sub(r"rv:\d+\.0", f"rv:{major}.0", re.sub(r"Firefox/\d+\.0", f"Firefox/{major}.0", out[key]))
    return out


def pinned_geolocation(lat: float, lon: float, rng: random.Random) -> dict[str, float]:
    low, high = ACCURACY_RANGE_M
    accuracy = round(math.exp(rng.uniform(math.log(low), math.log(high))), 1)
    distance = rng.uniform(150.0, 1800.0)
    bearing = rng.uniform(0, 2 * math.pi)
    dlat = distance * math.cos(bearing) / 111_320.0
    dlon = distance * math.sin(bearing) / (111_320.0 * max(math.cos(math.radians(lat)), 0.01))
    return {"latitude": round(lat + dlat, 6), "longitude": round(lon + dlon, 6), "accuracy": accuracy}


def screen_bounds():
    try:
        from camoufox.fingerprints import Screen
    except ImportError:
        from browserforge.fingerprints import Screen

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
    from camoufox.utils import launch_options

    rng = rng or random.SystemRandom()
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
    config["humanize:minTime"] = min(HUMANIZE_MIN_SECONDS, float(visible["humanize"]))
    config["showcursor"] = bool(visible["showcursor"])
    return config


def launch_prefs(profile: dict[str, Any], run: dict[str, Any], exit_ip: str) -> dict[str, Any]:
    prefs = {k: v for k, v in profile["firefoxUserPrefs"].items() if k not in PER_LAUNCH_PREFS}
    prefs.update(PINNED_PREFS)
    prefs["intl.locale.requested"] = run["locale"]
    if ":" not in exit_ip:
        prefs["network.dns.disableIPv6"] = True
    return prefs


def build_launch(profile: dict[str, Any], run: dict[str, Any], exit_ip: str, exit_timezone: str, proxy: dict[str, str], visible: dict[str, Any]) -> dict[str, Any]:
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
