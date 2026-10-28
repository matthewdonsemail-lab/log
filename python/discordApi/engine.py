from __future__ import annotations

import asyncio
import json
import threading
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


def read_of(token: str, channel: str, limit: int, after: str | None) -> dict[str, Any]:
    client, failed = open_client(token)
    if failed:
        return failed
    messages, problem = history_of(client, channel, limit, 0.4)
    if problem and not messages:
        return {"ok": False, "code": "platformError", "detail": f"channel {channel}: {problem}", "loginState": "loggedIn"}
    me = str(client.my_id)
    picked = [m for m in reversed(messages) if not after or int(m["id"]) > int(after)]
    return {"ok": True, "loginState": "loggedIn", "channelId": channel, "messages": [{"id": m["id"], "at": m["timestamp"], "from": m.get("global_name") or m["username"], "fromId": str(m["user_id"]), "bot": bool(m.get("bot")), "fromMe": str(m["user_id"]) == me, "replyTo": (m.get("referenced_message") or {}).get("id"), "text": m["content"] or "", "embeds": [{k: e.get(k) for k in ("title", "description", "url") if e.get(k)} for e in (m.get("embeds") or []) if isinstance(e, dict)]} for m in picked]}


async def read(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    token = cookies.get("token")
    if not token:
        return {"ok": False, "code": "noPlatformSession", "detail": "no Discord token saved for this account", "loginState": "unknown"}
    channel = str(spec.get("channel") or "").strip()
    if not channel.isdigit():
        return {"ok": False, "code": "sendInvalid", "detail": "read needs a channel id"}
    after = str(spec.get("after") or "").strip() or None
    return await asyncio.to_thread(read_of, token, channel, int(spec.get("limit") or 20), after)


def live(event: dict[str, Any]) -> None:
    print(json.dumps({"liveEvent": event}, default=str), flush=True)


def watch_of(token: str, seconds: float) -> dict[str, Any]:
    from endcord import client_properties as props
    from endcord import gateway

    gateway.is_relevant_message = lambda *args, **kwargs: True
    agent = props.get_user_agent()
    properties = props.add_user_agent(props.get_default_properties(), agent)
    socket = gateway.Gateway(token, None, props.add_for_gateway(properties), agent)
    threading.Thread(target=socket.connect, daemon=True).start()
    started = time.time()
    while not socket.get_ready():
        if time.time() - started > 45:
            return {"ok": False, "code": "platformError", "detail": "Discord's gateway didn't send READY within 45 s", "loginState": "unknown"}
        if socket.get_state() == 0 and time.time() - started > 10:
            return {"ok": False, "code": "sessionDead", "detail": "Discord's gateway closed before READY", "loginState": "loggedOut"}
        time.sleep(0.2)
    me = str(socket.get_my_id())
    live({"kind": "open", "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "detail": "wss://gateway.discord.gg open, every message pushed as it lands"})
    count = 0
    while not seconds or time.time() - started < seconds:
        event = socket.get_messages()
        if event is None:
            if socket.get_state() == 0:
                live({"kind": "closed", "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "detail": "the gateway closed"})
                break
            time.sleep(0.05)
            continue
        if event.get("op") != "MESSAGE_CREATE":
            continue
        d = event.get("d") or {}
        count += 1
        live({"kind": "message", "channelId": d.get("channel_id"), "guildId": d.get("guild_id"), "id": d.get("id"), "at": d.get("timestamp"), "from": d.get("global_name") or d.get("username"), "fromId": str(d.get("user_id")), "fromMe": str(d.get("user_id")) == me, "bot": bool(d.get("bot")), "replyTo": (d.get("referenced_message") or {}).get("id"), "mentionsMe": any(str(u.get("id")) == me for u in (d.get("mentions") or []) if isinstance(u, dict)), "repliesToMe": str((d.get("referenced_message") or {}).get("user_id")) == me, "text": d.get("content") or ""})
    return {"ok": True, "loginState": "loggedIn", "messages": count, "seconds": round(time.time() - started)}


async def watch(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    token = cookies.get("token")
    if not token:
        return {"ok": False, "code": "noPlatformSession", "detail": "no Discord token saved for this account", "loginState": "unknown"}
    return await asyncio.to_thread(watch_of, token, float(spec.get("seconds") or 0))


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


ACTIONS = {"ping": ping, "chats": chats, "export": export, "read": read, "send": send, "watch": watch}


if __name__ == "__main__":
    raise SystemExit(kit.main(ACTIONS, WRITES, LIBRARY))
