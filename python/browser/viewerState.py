from __future__ import annotations

import re
from typing import Any
from urllib.parse import urlparse

from login.autoLogin import classify

PLATFORM_HOSTS: dict[str, tuple[str, ...]] = {
    "facebook": ("facebook.com",),
    "twitter": ("x.com", "twitter.com"),
    "reddit": ("reddit.com", "redd.it", "redditmedia.com"),
    "discord": ("discord.com", "discord.gg"),
    "linkedin": ("linkedin.com", "www.linkedin.com"),
    "slack": ("slack.com", "app.slack.com"),
    "instagram": ("instagram.com", "www.instagram.com"),
}

FACEBOOK_INPUT = {"loginForm", "wrongPassword", "findAccount", "twoStepCode", "twoStepMethod", "trustDevice", "saveLogin", "continueAs"}
FACEBOOK_BLOCKED = {"disabled", "checkpoint", "videoSelfie", "automatedBehaviour", "captcha"}
BLOCKED_URL = re.compile(r"/checkpoint|/account/disabled", re.I)
STOPPED_URL = re.compile(r"/checkpoint|/account/(disabled|suspended|locked)|/suspended", re.I)

CODE_FIELD_SELECTOR = "input[autocomplete=one-time-code],input[name=approvals_code],input[name=pin],input[name*=otp i],input[name*=verificationCode i],input[name*=code i][inputmode=numeric]"


def platform_of(url: str) -> str | None:
    try:
        host = (urlparse(url).hostname or "").lower()
    except ValueError:
        return None
    for platform, hosts in PLATFORM_HOSTS.items():
        if any(host == known or host.endswith(f".{known}") for known in hosts):
            return platform
    return None


def facebook_state(signals: dict[str, Any]) -> dict[str, Any]:
    state = classify(signals["url"], signals["heading"], signals["text"], password_field=signals["password"], code_field=signals["code"], login_markers=False, session_cookies=False, captcha=False)
    blocked = bool(BLOCKED_URL.search(signals["url"])) or state in FACEBOOK_BLOCKED
    return {"state": state, "blocked": blocked, "inputAllowed": not blocked and state in FACEBOOK_INPUT}


def viewer_state(signals: dict[str, Any]) -> dict[str, Any]:
    platform = platform_of(signals["url"])
    if platform is None or platform == "facebook":
        return facebook_state(signals)
    if signals["password"]:
        return {"state": f"{platform}Login", "blocked": False, "inputAllowed": True}
    if signals["code"]:
        return {"state": f"{platform}TwoStep", "blocked": False, "inputAllowed": True}
    if STOPPED_URL.search(signals["url"]):
        return {"state": f"{platform}Stopped", "blocked": True, "inputAllowed": False}
    return {"state": "unknown", "blocked": False, "inputAllowed": False}
