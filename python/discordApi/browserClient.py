from __future__ import annotations

import base64
import json
import os
from pathlib import Path
from typing import Any

KEPT = (
    "accept-language",
    "priority",
    "referer",
    "sec-ch-ua",
    "sec-ch-ua-mobile",
    "sec-ch-ua-platform",
    "sec-fetch-dest",
    "sec-fetch-mode",
    "sec-fetch-site",
    "user-agent",
    "x-debug-options",
    "x-discord-locale",
    "x-discord-timezone",
    "x-installation-id",
    "x-super-properties",
)
HEADER_NAMES = {name: "-".join(part.capitalize() for part in name.split("-")) for name in KEPT}
HEADER_NAMES.update({"x-super-properties": "X-Super-Properties", "x-discord-locale": "X-Discord-Locale", "x-discord-timezone": "X-Discord-Timezone", "x-debug-options": "X-Debug-Options", "x-installation-id": "X-Installation-ID"})

current: dict[str, Any] | None = None


def runs_root() -> Path:
    return Path(os.environ.get("LOG_RUNS_ROOT") or Path.home() / ".logCli" / "runs") / "inspect"


def newest_har(account: str) -> Path | None:
    hars = sorted(runs_root().glob(f"*_{account}/*/session.har"), key=lambda p: p.stat().st_mtime)
    return hars[-1] if hars else None


def headers_from_har(path: Path) -> dict[str, str] | None:
    with path.open(encoding="utf-8") as f:
        har = json.load(f)
    for entry in reversed(har.get("log", {}).get("entries", [])):
        request = entry.get("request", {})
        if not str(request.get("url", "")).startswith("https://discord.com/api/v9/"):
            continue
        found = {str(h.get("name", "")).lower(): str(h.get("value", "")) for h in request.get("headers", [])}
        if found.get("x-super-properties") and found.get("user-agent"):
            return {HEADER_NAMES[name]: found[name] for name in KEPT if name in found}
    return None


def load(state_root: str, account: str) -> dict[str, Any] | None:
    folder = Path(state_root) / account
    cache = folder / "browserClient.json"
    har = newest_har(account)
    kept = json.loads(cache.read_text(encoding="utf-8")) if cache.exists() else None
    if har is None:
        return kept
    stamp = har.stat().st_mtime
    if kept and kept.get("harMtime", 0) >= stamp:
        return kept
    headers = headers_from_har(har)
    if not headers:
        return kept
    made = {"har": str(har), "harMtime": stamp, "headers": headers}
    folder.mkdir(parents=True, exist_ok=True)
    cache.write_text(json.dumps(made, indent=2), encoding="utf-8")
    return made


def use(spec: dict[str, Any], cookies: dict[str, str]) -> None:
    global current
    made = load(str(spec.get("stateRoot") or ""), str(spec.get("account") or "")) if spec.get("stateRoot") and spec.get("account") else None
    if not made:
        current = None
        return
    jar = "; ".join(f"{k}={v}" for k, v in cookies.items() if k != "token" and v)
    current = {**made, "cookie": jar}


def user_agent() -> str | None:
    return current["headers"].get("User-Agent") if current else None


def super_properties() -> str | None:
    return current["headers"].get("X-Super-Properties") if current else None


def gateway_properties() -> dict[str, Any] | None:
    encoded = super_properties()
    return json.loads(base64.b64decode(encoded)) if encoded else None


def dress(header: dict[str, str]) -> None:
    if not current:
        return
    header.update(current["headers"])
    header["Origin"] = "https://discord.com"
    if current.get("cookie"):
        header["Cookie"] = current["cookie"]
