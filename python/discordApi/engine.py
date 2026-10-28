from __future__ import annotations

import asyncio
import json
import time
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
WRITES: tuple[str, ...] = ("send",)


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


def open_client(token: str) -> tuple[Any, dict[str, Any] | None]:
    try:
        return client_of(token), None
    except SystemExit as e:
        if str(e).startswith("Unauthorized"):
            return None, {"ok": False, "code": "sessionDead", "detail": "Discord answered 401 to the session", "loginState": "loggedOut", "httpStatus": 401}
        return None, {"ok": False, "code": "platformError", "detail": str(e).splitlines()[0], "loginState": "unknown"}


def chats_of(token: str) -> dict[str, Any]:
    client, failed = open_client(token)
    if failed:
        return failed
    got = client.get_dms()
    if got is None:
        return {"ok": False, "code": "platformError", "detail": "Discord didn't answer /users/@me/channels", "loginState": "unknown"}
    dms, _ = got
    kinds = {1: "dm", 3: "group"}
    chats = [{"id": d["id"], "kind": kinds.get(d["type"], str(d["type"])), "name": d["name"], "members": [r.get("global_name") or r["username"] for r in d["recipients"]]} for d in dms]
    return {"ok": True, "loginState": "loggedIn", "chats": chats}


def send_of(token: str, channel: str, text: str) -> dict[str, Any]:
    client, failed = open_client(token)
    if failed:
        return failed
    target = channel
    if not channel.isdigit():
        got = client.get_dms()
        dms = got[0] if got else []
        named = [d for d in dms if (d["name"] or "").strip().lower() == channel.strip().lower()]
        if len(named) != 1:
            return {"ok": False, "code": "chatNotFound" if not named else "chatAmbiguous", "detail": f"{len(named)} of the account's DMs and groups are called {channel!r}", "loginState": "loggedIn"}
        target = named[0]["id"]
    sent = client.send_message(target, text)
    if not sent:
        return {"ok": False, "code": "sendFailed", "detail": f"Discord didn't take the message in channel {target}", "loginState": "loggedIn", "event": "dropped", "channelId": target}
    return {"ok": True, "loginState": "loggedIn", "event": "sent", "channelId": sent["channel_id"], "messageId": sent["id"], "timestamp": sent["timestamp"], "content": sent["content"]}


def history_of(client: Any, channel_id: str, limit: int, pause: float) -> tuple[list[dict[str, Any]], str | None]:
    from endcord.message import prepare_messages

    out: list[dict[str, Any]] = []
    before = None
    while len(out) < limit:
        url = f"/api/v9/channels/{channel_id}/messages?limit={min(100, limit - len(out))}" + (f"&before={before}" if before else "")
        for _ in range(4):
            data, status = client.request("GET", url, None, client.header)
            if status != 429:
                break
            try:
                wait = float(json.loads(data).get("retry_after", 2))
            except Exception:
                wait = 2.0
            time.sleep(min(wait, 30) + 0.2)
        if status != 200:
            return out, f"messages answered {status}"
        page = prepare_messages(json.loads(data))
        out.extend(page)
        if len(page) < 100 or not page:
            break
        before = page[-1]["id"]
        time.sleep(pause)
    return out, None


def export_of(token: str, per_chat: int, pause: float) -> dict[str, Any]:
    client, failed = open_client(token)
    if failed:
        return failed
    got = client.get_dms()
    if got is None:
        return {"ok": False, "code": "platformError", "detail": "Discord didn't answer /users/@me/channels", "loginState": "unknown"}
    dms, _ = got
    me = str(client.my_id)
    kinds = {1: "dm", 3: "group"}
    conversations, problems = [], []
    for index, d in enumerate(dms, 1):
        messages, problem = history_of(client, d["id"], per_chat, pause)
        if problem:
            problems.append({"id": d["id"], "problem": problem})
        conversations.append({
            "id": d["id"],
            "kind": kinds.get(d["type"], str(d["type"])),
            "name": d["name"],
            "members": [r.get("global_name") or r["username"] for r in d["recipients"]],
            "messages": [{"id": m["id"], "at": m["timestamp"], "from": m.get("global_name") or m["username"], "fromMe": str(m["user_id"]) == me, "text": m["content"] or ""} for m in reversed(messages)],
        })
        print(json.dumps({"liveEvent": "progress", "line": f"discord export {index}/{len(dms)}: {len(messages)} message(s)"}), file=sys.stderr, flush=True)
        time.sleep(pause)
    return {"ok": True, "loginState": "loggedIn", "conversations": conversations, "problems": problems}


async def export(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    token = cookies.get("token")
    if not token:
        return {"ok": False, "code": "noPlatformSession", "detail": "no Discord token saved for this account", "loginState": "unknown"}
    return await asyncio.to_thread(export_of, token, int(spec.get("limit") or 200), float(spec.get("pause") or 0.4))


async def chats(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    token = cookies.get("token")
    if not token:
        return {"ok": False, "code": "noPlatformSession", "detail": "no Discord token saved for this account", "loginState": "unknown"}
    return await asyncio.to_thread(chats_of, token)


async def send(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    token = cookies.get("token")
    if not token:
        return {"ok": False, "code": "noPlatformSession", "detail": "no Discord token saved for this account", "loginState": "unknown"}
    channel, text = str(spec.get("channel") or "").strip(), str(spec.get("text") or "")
    if not channel or not text.strip():
        return {"ok": False, "code": "sendInvalid", "detail": "send needs a channel and text"}
    return await asyncio.to_thread(send_of, token, channel, text)


ACTIONS = {"ping": ping, "chats": chats, "export": export, "send": send}


if __name__ == "__main__":
    raise SystemExit(kit.main(ACTIONS, WRITES, LIBRARY))
