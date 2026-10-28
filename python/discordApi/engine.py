from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
VENDOR = ROOT.parent / "vendor"
for p in (str(ROOT), str(VENDOR / "endcord")):
    if p not in sys.path:
        sys.path.insert(0, p)

from platformKit import engine as kit

PLATFORM = "discord"
LIBRARY = "vendor/endcord"
WRITES: tuple[str, ...] = ()


def client_of(token: str) -> Any:
    from endcord import client_properties as props
    from endcord import discord

    agent = props.get_user_agent()
    properties = props.encode_properties(props.add_user_agent(props.get_default_properties(), agent))
    return discord.Discord(token, None, properties, agent)


def me_of(token: str) -> tuple[int | None, Any]:
    try:
        client = client_of(token)
    except SystemExit as e:
        return (401 if str(e).startswith("Unauthorized") else None), str(e).splitlines()[0]
    data, status = client.request("GET", "/api/v9/users/@me", None, client.header)
    if status == 200:
        return status, json.loads(data)
    return status, data


async def ping(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    token = cookies.get("token")
    if not token:
        return {"ok": False, "code": "noPlatformSession", "detail": "no Discord token saved for this account (discord.com localStorage token)", "loginState": "unknown"}
    status, me = await asyncio.to_thread(me_of, token)
    if status in (401, 403):
        return {"ok": False, "code": "sessionDead", "detail": f"Discord's /api/v9/users/@me answered {status}", "loginState": "loggedOut", "httpStatus": status}
    if status == 429:
        return {"ok": False, "code": "rateLimited", "detail": "Discord's /api/v9/users/@me answered 429", "loginState": "unknown", "httpStatus": 429, "event": "throttled"}
    if status != 200 or not isinstance(me, dict):
        return {"ok": False, "code": "platformError", "detail": f"Discord's /api/v9/users/@me answered {status}", "loginState": "unknown", "httpStatus": status}
    return {"ok": True, "loginState": "loggedIn", "httpStatus": 200, "screenName": me.get("username"), "userId": me.get("id"), "globalName": me.get("global_name"), "verified": me.get("verified"), "mfaEnabled": me.get("mfa_enabled")}


ACTIONS = {"ping": ping}


if __name__ == "__main__":
    raise SystemExit(kit.main(ACTIONS, WRITES, LIBRARY))
