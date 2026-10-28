from __future__ import annotations

import asyncio
import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Awaitable, Callable

ROOT = Path(__file__).resolve().parents[1]
VENDOR = ROOT.parent / "vendor"
for p in (str(ROOT), str(VENDOR / "fbk" / "src")):
    if p not in sys.path:
        sys.path.insert(0, p)

SECRET_KEYS = ("password", "cookie", "token", "session", "secret")

Action = Callable[[dict[str, Any], dict[str, str]], Awaitable[dict[str, Any]]]


def normalize_cookies(raw: Any) -> dict[str, str]:
    if isinstance(raw, str):
        text = raw.strip()
        if text[:1] in "[{":
            try:
                return normalize_cookies(json.loads(text))
            except json.JSONDecodeError:
                pass
        out: dict[str, str] = {}
        for part in re.split(r";\s*", text):
            if "=" in part:
                name, _, value = part.partition("=")
                out[name.strip()] = value.strip()
        return out
    if isinstance(raw, dict):
        return {str(k): str(v) for k, v in raw.items() if v is not None}
    if isinstance(raw, (list, tuple)):
        out = {str(i["name"]): str(i.get("value") or "") for i in raw if isinstance(i, dict) and "name" in i}
        for item in raw:
            if isinstance(item, (list, tuple)) and len(item) == 2:
                out[str(item[0])] = str(item[1])
        return out
    return {}


def redact(text: Any, cookies: dict[str, str]) -> str:
    out = str(text or "")
    for value in cookies.values():
        if value and len(value) >= 8:
            out = out.replace(value, "***")
    for key in SECRET_KEYS:
        out = re.sub(rf'("{key}"\s*:\s*)"[^"]*"', r'\1"***"', out, flags=re.IGNORECASE)
    return out


def governor_for(state_root: str, account: str, writes_per_day: int | None = None) -> Any:
    from dataclasses import replace

    from governor import GovernorConfig, RequestGovernor

    folder = Path(state_root) / account
    folder.mkdir(parents=True, exist_ok=True)
    config = GovernorConfig.from_env()
    if writes_per_day and "FBK_GOVERNOR_MUTATION_DAILY" not in os.environ:
        config = replace(config, mutation_daily_cap=int(writes_per_day))
    return RequestGovernor(config=config, state_path=folder / "governor_state.json")


def not_built(platform: str, action: str) -> dict[str, Any]:
    return {"ok": False, "code": "engineNotBuilt", "detail": f"{platform}'s {action} has no client wired in yet: vendor its client and fill in python/{platform}Api/engine.py"}


async def run(spec: dict[str, Any], actions: dict[str, Action], writes: tuple[str, ...]) -> dict[str, Any]:
    from governor import GovernorBlockedError

    action = spec.get("action")
    if action not in actions:
        return {"ok": False, "code": "actionUnknown", "detail": f"{action} is not one of {', '.join(actions)}"}
    if action in writes and spec.get("live") is not True:
        return {"ok": False, "code": "notLive", "detail": f"{action} acts on {spec.get('platform')}: the engine only acts with live set (rule 8)"}
    if action in writes and not str(spec.get("approvedBy") or "").strip():
        return {"ok": False, "code": "notApproved", "detail": f"{action} needs the name of who approved it"}
    cookies = normalize_cookies(json.loads(Path(spec["cookiesPath"]).read_text(encoding="utf-8")))
    if spec.get("storagePath"):
        cookies.update({str(k): str(v) for k, v in json.loads(Path(spec["storagePath"]).read_text(encoding="utf-8")).items() if v})
    governor = governor_for(spec["stateRoot"], spec["account"], spec.get("writesPerDay"))
    try:
        governor.before_request(is_mutation=action in writes, quiet=True)
    except GovernorBlockedError as e:
        return {"ok": False, "code": "governorBlocked", "detail": str(e)}
    try:
        out = await actions[action](spec, cookies)
    except Exception as e:
        out = {"ok": False, "code": type(e).__name__, "detail": redact(e, cookies)[:300]}
    refreshed = out.pop("refreshedCookies", None)
    if spec.get("refreshedPath") and refreshed:
        Path(spec["refreshedPath"]).write_text(json.dumps(refreshed), encoding="utf-8")
    if out.get("event") in ("throttled", "dropped", "automated", "dailyLimit"):
        governor.observe_soft_block()
    out["governor"] = governor.status()
    return out


def main(actions: dict[str, Action], writes: tuple[str, ...] = (), library: str | None = None) -> int:
    if library:
        path = str(VENDOR.parent / library)
        if path not in sys.path:
            sys.path.insert(0, path)
    if os.name == "nt":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    spec = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    out = asyncio.run(run(spec, actions, writes))
    print(json.dumps(out, default=str))
    return 0 if out.get("ok") else 1
