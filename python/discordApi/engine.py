from __future__ import annotations

import asyncio
import json
import re
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
from platformKit import media
from platformKit import reactions

PLATFORM = "discord"
LIBRARY = "vendor/endcord"
WRITES: tuple[str, ...] = ("send", "delete", "react", "voice")
SEARCH_PAGE = 25


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


def refusal_of(status: int, answer: Any, where: str) -> dict[str, Any]:
    said = (answer.decode("utf-8", "replace") if isinstance(answer, bytes) else str(answer or "")).strip()[:300]
    detail = f"Discord answered {status} to {where}{f': {said}' if said else ''}: the read stopped there, nothing more was read and nothing retried (rule 94)"
    if status == 429:
        return {"ok": False, "code": "rateLimited", "detail": detail, "loginState": "loggedIn", "httpStatus": status, "event": "throttled", "answer": said}
    if status == 401:
        return {"ok": False, "code": "sessionDead", "detail": detail, "loginState": "loggedOut", "httpStatus": status, "answer": said}
    return {"ok": False, "code": "platformError", "detail": detail, "loginState": "loggedIn", "httpStatus": status, "answer": said}


def attachments_of(embeds: Any) -> list[dict[str, Any]]:
    return [{k: e.get(k) for k in ("name", "type", "url", "duration") if e.get(k) is not None} for e in embeds or [] if isinstance(e, dict) and e.get("name") and e.get("url")]


def raw_attachments_of(d: dict[str, Any]) -> list[dict[str, Any]]:
    return [{k: v for k, v in raw_fields(a) if v is not None} for a in d.get("attachments") or [] if isinstance(a, dict) and a.get("filename") and a.get("url")]


def raw_fields(a: dict[str, Any]) -> tuple[tuple[str, Any], ...]:
    return (("name", a.get("filename")), ("type", a.get("content_type")), ("url", a.get("url")), ("duration", round(a["duration_secs"]) if a.get("duration_secs") else None), ("waveform", True if a.get("waveform") else None))


def is_audio(attachment: dict[str, Any], flags: int | None = None) -> bool:
    return media.is_audio(attachment, flags)


def text_of(content: str | None, attachments: list[dict[str, Any]], flags: int | None = None) -> str:
    return media.text_with_audio(content, attachments, flags)


def plain_embeds(embeds: Any) -> list[dict[str, Any]]:
    return [{k: e.get(k) for k in ("title", "description", "url") if e.get(k)} for e in embeds or [] if isinstance(e, dict) and not e.get("name")]


def audio_file_of(client: Any, spec: dict[str, Any], channel_id: str, message_id: str, attachment: dict[str, Any]) -> dict[str, Any]:
    path = media.audio_path(spec, channel_id, message_id, str(attachment.get("name") or "audio"))
    if path.is_file() and path.stat().st_size:
        return {**attachment, "path": str(path)}
    saved = client.get_file(str(attachment["url"]), str(path.parent), path.name)
    if not saved or not Path(saved).is_file():
        return {**attachment, "error": "Discord's CDN didn't send the file"}
    return {**attachment, "path": str(saved)}


def visual_file_of(client: Any, spec: dict[str, Any], channel_id: str, message_id: str, attachment: dict[str, Any]) -> dict[str, Any]:
    kept = audio_file_of(client, spec, channel_id, message_id, attachment)
    path = Path(str(kept.get("path") or ""))
    if kept.get("path") and path.is_file() and path.stat().st_size > media.VISUAL_MAX_BYTES:
        path.unlink()
        return {**attachment, "error": f"the file is over the {media.VISUAL_MAX_BYTES // 1024 // 1024} MB kept"}
    return kept


def with_visuals(client: Any, spec: dict[str, Any], channel_id: str, message_id: str, attachments: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [visual_file_of(client, spec, channel_id, message_id, a) if media.is_visual(a) else a for a in attachments]


def saved_audio(client: Any, spec: dict[str, Any], channel_id: str, message_id: str, attachments: list[dict[str, Any]], flags: int | None = None) -> list[dict[str, Any]]:
    return [audio_file_of(client, spec, channel_id, message_id, a) for a in attachments if is_audio(a, flags)]


def dms_of(client: Any) -> tuple[list[dict[str, Any]], dict[str, Any] | None]:
    data, status = client.request("GET", f"/api/v9/users/{client.my_id}/channels", None, client.header)
    if not status:
        return [], {"ok": False, "code": "platformError", "detail": "Discord didn't answer /users/@me/channels (the network dropped)", "loginState": "unknown"}
    if status != 200:
        return [], refusal_of(status, data, "/users/@me/channels")
    dms = []
    for dm in json.loads(data):
        recipients = [{"id": r["id"], "username": r["username"], "global_name": r.get("global_name")} for r in dm.get("recipients") or []]
        name = dm["name"] if "name" in dm else (recipients[0].get("global_name") if recipients else None)
        dms.append({"id": dm["id"], "type": dm["type"], "recipients": recipients, "name": name})
    return dms, None


SERVERS_FRESH_SECONDS = 24 * 3600
SERVER_READ_SPACING = 1.5
TEXT_CHANNELS = (0, 5, 15)


def servers_path(spec: dict[str, Any]) -> Path:
    return Path.home() / ".logCli" / "discord" / re.sub(r"[^0-9A-Za-z_-]", "_", str(spec.get("account") or "account")) / "servers.json"


def server_channels_of(client: Any, spec: dict[str, Any]) -> tuple[list[dict[str, Any]], str | None]:
    path = servers_path(spec)
    try:
        kept = json.loads(path.read_text(encoding="utf-8"))
        if time.time() - float(kept.get("savedAt") or 0) < SERVERS_FRESH_SECONDS:
            return kept.get("channels") or [], None
    except (OSError, ValueError):
        kept = {}
    data, status = client.request("GET", "/api/v9/users/@me/guilds", None, client.header)
    if status != 200:
        return (kept.get("channels") or []), f"Discord answered {status or 'nothing'} to /users/@me/guilds"
    channels: list[dict[str, Any]] = []
    skipped: list[str] = []
    for number, guild in enumerate(json.loads(data)):
        if number:
            time.sleep(SERVER_READ_SPACING)
        found = client.get_channels(guild["id"])
        if found is None:
            skipped.append(str(guild.get("name")))
            continue
        channels += [{"id": c["id"], "kind": "channel", "name": f"{guild.get('name')} #{c['name']}", "members": [], "server": guild.get("name"), "serverId": guild["id"]} for c in found if c.get("type") in TEXT_CHANNELS]
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"savedAt": time.time() if not skipped else 0, "channels": channels}), encoding="utf-8")
    return channels, (f"Discord didn't answer the channels of {', '.join(skipped)}, so those servers are left out until the next read" if skipped else None)


def save_servers_from(socket: Any, spec: dict[str, Any]) -> int:
    channels = [{"id": str(c["id"]), "kind": "channel", "name": f"{g.get('name')} #{c['name']}", "members": [], "server": g.get("name"), "serverId": str(g.get("guild_id"))} for g in (getattr(socket, "guilds", None) or []) for c in (g.get("channels") or []) if c.get("type") in TEXT_CHANNELS]
    if not channels:
        return 0
    path = servers_path(spec)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"savedAt": time.time(), "from": "gateway", "channels": channels}), encoding="utf-8")
    return len(channels)


def chats_of(token: str, spec: dict[str, Any] | None = None) -> dict[str, Any]:
    client, failed = open_client(token)
    if failed:
        return failed
    dms, refused = dms_of(client)
    if refused:
        return refused
    kinds = {1: "dm", 3: "group"}
    chats = [{"id": d["id"], "kind": kinds.get(d["type"], str(d["type"])), "name": d["name"], "members": [r.get("global_name") or r["username"] for r in d["recipients"]]} for d in dms]
    channels, problem = server_channels_of(client, spec or {})
    return {"ok": True, "loginState": "loggedIn", "chats": chats + channels, **({"serversProblem": problem} if problem else {})}


MEDIA_LINK = re.compile(r"^https?://\S+?\.(mp4|mov|gif|jpe?g|png|webp)(\?\S*)?$", re.I)
OUTGOING_MEDIA = Path.home() / ".logCli" / "discord" / "media" / "outgoing"


def media_file_of(link: str) -> Path:
    import hashlib
    import urllib.request

    OUTGOING_MEDIA.mkdir(parents=True, exist_ok=True)
    path = OUTGOING_MEDIA / f"{hashlib.sha1(link.encode()).hexdigest()[:16]}{Path(link.split('?')[0]).suffix.lower()}"
    if not path.exists():
        with urllib.request.urlopen(urllib.request.Request(link, headers={"User-Agent": "Mozilla/5.0"}), timeout=60) as answer:
            path.write_bytes(answer.read())
    return path


def attached_media(client: Any, channel: str, text: str) -> tuple[list[dict[str, Any]], dict[str, Any] | None]:
    link = text.strip()
    if not MEDIA_LINK.match(link):
        return [], None
    path = media_file_of(link)
    slot, code = client.request_attachment_url(channel, str(path), f"meme{path.suffix}")
    if code or not slot:
        return [], {"ok": False, "code": "sendFailed", "detail": f"Discord gave no upload slot for {path.name} (code {code}): nothing was sent", "loginState": "loggedIn", "event": "dropped", "channelId": channel}
    if not client.upload_attachment(slot["upload_url"], str(path)):
        return [], {"ok": False, "code": "sendFailed", "detail": f"the upload of {path.name} to Discord failed: nothing was sent", "loginState": "loggedIn", "event": "dropped", "channelId": channel}
    print(f"media link {link} sent as an attachment, not as text ({path.stat().st_size} bytes)", file=sys.stderr, flush=True)
    return [{"upload_url": slot["upload_url"], "upload_filename": slot["upload_filename"], "name": f"meme{path.suffix}"}], None


def send_of(token: str, channel: str, text: str) -> dict[str, Any]:
    client, failed = open_client(token)
    if failed:
        return failed
    target = channel
    if not channel.isdigit():
        dms, refused = dms_of(client)
        if refused:
            return refused
        named = [d for d in dms if (d["name"] or "").strip().lower() == channel.strip().lower()]
        if len(named) != 1:
            return {"ok": False, "code": "chatNotFound" if not named else "chatAmbiguous", "detail": f"{len(named)} of the account's DMs and groups are called {channel!r}", "loginState": "loggedIn"}
        target = named[0]["id"]
    files, failed = attached_media(client, target, text)
    if failed:
        return failed
    sent = client.send_message(target, "" if files else text, attachments=files or None)
    if not sent:
        return {"ok": False, "code": "sendFailed", "detail": f"Discord didn't take the message in channel {target}", "loginState": "loggedIn", "event": "dropped", "channelId": target}
    return {"ok": True, "loginState": "loggedIn", "event": "sent", "channelId": sent["channel_id"], "messageId": sent["id"], "timestamp": sent["timestamp"], "content": sent["content"]}


def history_of(client: Any, channel_id: str, limit: int, pause: float) -> tuple[list[dict[str, Any]], dict[str, Any] | None]:
    from endcord.message import prepare_messages

    out: list[dict[str, Any]] = []
    before = None
    while len(out) < limit:
        url = f"/api/v9/channels/{channel_id}/messages?limit={min(100, limit - len(out))}" + (f"&before={before}" if before else "")
        data, status = client.request("GET", url, None, client.header)
        if not status:
            return out, {"refused": False, "detail": f"channel {channel_id} messages: the network dropped, Discord didn't answer"}
        if status != 200:
            return out, {"refused": True, **refusal_of(status, data, f"channel {channel_id} messages")}
        page = prepare_messages(json.loads(data))
        out.extend(page)
        if len(page) < 100 or not page:
            break
        before = page[-1]["id"]
        time.sleep(pause)
    return out, None


def exported_message(m: dict[str, Any], me: str) -> dict[str, Any]:
    attachments = attachments_of(m.get("embeds"))
    out = {"id": m["id"], "at": m["timestamp"], "from": m.get("global_name") or m["username"], "fromMe": str(m["user_id"]) == me, "text": text_of(m["content"], attachments)}
    if attachments:
        out["attachments"] = [{k: v for k, v in a.items() if k != "url"} for a in attachments]
    return out


def exported_of(d: dict[str, Any], messages: list[dict[str, Any]], me: str) -> dict[str, Any]:
    kinds = {1: "dm", 3: "group"}
    return {
        "id": d["id"],
        "kind": kinds.get(d["type"], str(d["type"])),
        "name": d["name"],
        "members": [r.get("global_name") or r["username"] for r in d["recipients"]],
        "messages": [exported_message(m, me) for m in reversed(messages)],
    }


def export_of(token: str, per_chat: int, pause: float) -> dict[str, Any]:
    client, failed = open_client(token)
    if failed:
        return failed
    dms, refused = dms_of(client)
    if refused:
        return refused
    me = str(client.my_id)
    conversations, problems = [], []
    for index, d in enumerate(dms, 1):
        messages, stop = history_of(client, d["id"], per_chat, pause)
        conversations.append(exported_of(d, messages, me))
        if stop and stop["refused"]:
            answer = {k: v for k, v in stop.items() if k != "refused"}
            print(json.dumps({"liveEvent": "progress", "line": f"discord export {index}/{len(dms)}: stopped, {answer['detail']}"}), file=sys.stderr, flush=True)
            return {**answer, "stopped": {"conversationId": d["id"], "name": d["name"], "httpStatus": answer["httpStatus"], "answer": answer["answer"], "read": len(messages), "conversationsLeft": len(dms) - index}, "conversations": conversations, "problems": problems}
        if stop:
            problems.append({"id": d["id"], "problem": stop["detail"]})
        print(json.dumps({"liveEvent": "progress", "line": f"discord export {index}/{len(dms)}: {len(messages)} message(s)"}), file=sys.stderr, flush=True)
        time.sleep(pause)
    return {"ok": True, "loginState": "loggedIn", "conversations": conversations, "problems": problems}


async def export(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    token = cookies.get("token")
    if not token:
        return {"ok": False, "code": "noPlatformSession", "detail": "no Discord token saved for this account", "loginState": "unknown"}
    return await asyncio.to_thread(export_of, token, int(spec.get("limit") or 200), float(spec.get("pause") or 0.4))


def read_of(token: str, channel: str, limit: int, after: str | None, spec: dict[str, Any] | None = None) -> dict[str, Any]:
    client, failed = open_client(token)
    if failed:
        return failed
    spec = spec or {}
    messages, stop = history_of(client, channel, limit, 0.4)
    refused = {k: v for k, v in stop.items() if k != "refused"} if stop and stop["refused"] else None
    if refused and not messages:
        return refused
    if stop and not messages:
        return {"ok": False, "code": "platformError", "detail": stop["detail"], "loginState": "unknown"}
    me = str(client.my_id)
    picked = [m for m in reversed(messages) if not after or int(m["id"]) > int(after)]
    said = {"httpStatus": refused["httpStatus"], **({"event": refused["event"]} if refused.get("event") else {})} if refused else {}
    return {"ok": True, "loginState": "loggedIn", "channelId": channel, **({"stopped": stop["detail"], **said} if stop else {}), "messages": [read_message(client, spec, channel, m, me) for m in picked]}


def read_message(client: Any, spec: dict[str, Any], channel: str, m: dict[str, Any], me: str) -> dict[str, Any]:
    attachments = attachments_of(m.get("embeds"))
    out = {"id": m["id"], "at": m["timestamp"], "from": m.get("global_name") or m["username"], "fromId": str(m["user_id"]), "bot": bool(m.get("bot")), "fromMe": str(m["user_id"]) == me, "replyTo": (m.get("referenced_message") or {}).get("id"), "text": text_of(m["content"], attachments), "embeds": plain_embeds(m.get("embeds")), "attachments": attachments}
    if spec.get("saveAudio") is not False and any(is_audio(a) for a in attachments):
        out["audio"] = saved_audio(client, spec, channel, str(m["id"]), attachments)
    return out


async def read(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    token = cookies.get("token")
    if not token:
        return {"ok": False, "code": "noPlatformSession", "detail": "no Discord token saved for this account", "loginState": "unknown"}
    channel = str(spec.get("channel") or "").strip()
    if not channel.isdigit():
        return {"ok": False, "code": "sendInvalid", "detail": "read needs a channel id"}
    after = str(spec.get("after") or "").strip() or None
    return await asyncio.to_thread(read_of, token, channel, int(spec.get("limit") or 20), after, spec)


def live(event: dict[str, Any]) -> None:
    print(json.dumps({"liveEvent": event}, default=str), flush=True)


def watch_of(token: str, seconds: float, spec: dict[str, Any]) -> dict[str, Any]:
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
    save_servers_from(socket, spec)
    live({"kind": "open", "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "detail": "wss://gateway.discord.gg open, every message pushed as it lands"})
    count = 0
    rest = None
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
        attachments = raw_attachments_of(d)
        audio: list[dict[str, Any]] = []
        flags = d.get("flags")
        if any(is_audio(a, flags) for a in attachments) and str(d.get("user_id")) != me:
            rest = rest or open_client(token)[0]
            audio = saved_audio(rest, spec, str(d.get("channel_id")), str(d.get("id")), attachments, flags) if rest else [{**a, "error": "no REST session to fetch it"} for a in attachments if is_audio(a, flags)]
        to_me = not d.get("guild_id") or any(str(u.get("id")) == me for u in (d.get("mentions") or []) if isinstance(u, dict)) or str((d.get("referenced_message") or {}).get("user_id")) == me
        if to_me and str(d.get("user_id")) != me and any(media.is_visual(a) for a in attachments):
            rest = rest or open_client(token)[0]
            attachments = with_visuals(rest, spec, str(d.get("channel_id")), str(d.get("id")), attachments) if rest else [{**a, "error": "no REST session to fetch it"} if media.is_visual(a) else a for a in attachments]
        live({"kind": "message", "channelId": d.get("channel_id"), "guildId": d.get("guild_id"), "id": d.get("id"), "at": d.get("timestamp"), "from": d.get("global_name") or d.get("username"), "fromId": str(d.get("user_id")), "fromMe": str(d.get("user_id")) == me, "bot": bool(d.get("bot")), "replyTo": (d.get("referenced_message") or {}).get("id"), "mentionsMe": any(str(u.get("id")) == me for u in (d.get("mentions") or []) if isinstance(u, dict)), "repliesToMe": str((d.get("referenced_message") or {}).get("user_id")) == me, "text": text_of(d.get("content"), attachments, d.get("flags")), **({"attachments": attachments} if attachments else {}), **({"audio": audio} if audio else {})})
    return {"ok": True, "loginState": "loggedIn", "messages": count, "seconds": round(time.time() - started)}


async def watch(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    token = cookies.get("token")
    if not token:
        return {"ok": False, "code": "noPlatformSession", "detail": "no Discord token saved for this account", "loginState": "unknown"}
    return await asyncio.to_thread(watch_of, token, float(spec.get("seconds") or 0), spec)


async def chats(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    token = cookies.get("token")
    if not token:
        return {"ok": False, "code": "noPlatformSession", "detail": "no Discord token saved for this account", "loginState": "unknown"}
    return await asyncio.to_thread(chats_of, token, spec)


async def send(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    token = cookies.get("token")
    if not token:
        return {"ok": False, "code": "noPlatformSession", "detail": "no Discord token saved for this account", "loginState": "unknown"}
    channel, text = str(spec.get("channel") or "").strip(), str(spec.get("text") or "")
    if not channel or not text.strip():
        return {"ok": False, "code": "sendInvalid", "detail": "send needs a channel and text"}
    return await asyncio.to_thread(send_of, token, channel, text)


def delete_of(token: str, channel: str, message: str) -> dict[str, Any]:
    client, failed = open_client(token)
    if failed:
        return failed
    data, status = client.request("GET", f"/api/v9/channels/{channel}/messages?around={message}&limit=1", None, client.header)
    if not status:
        return {"ok": False, "code": "platformError", "detail": f"Discord didn't answer the read of message {message}", "loginState": "unknown", "event": "dropped"}
    if status != 200:
        return refusal_of(status, data, f"channel {channel} message {message}")
    found = [m for m in json.loads(data) if str(m.get("id")) == message]
    if not found:
        return {"ok": False, "code": "messageNotFound", "detail": f"message {message} isn't in channel {channel}", "loginState": "loggedIn"}
    if str((found[0].get("author") or {}).get("id")) != str(client.my_id):
        return {"ok": False, "code": "notOwnMessage", "detail": f"message {message} was sent by someone else; only the account's own messages are deleted", "loginState": "loggedIn"}
    deleted = client.delete_message(channel, message)
    if deleted is None:
        return {"ok": False, "code": "deleteFailed", "detail": f"Discord didn't answer the delete of message {message}", "loginState": "unknown", "event": "dropped"}
    if not deleted:
        return {"ok": False, "code": "deleteFailed", "detail": f"Discord refused the delete of message {message}", "loginState": "loggedIn", "event": "throttled"}
    return {"ok": True, "loginState": "loggedIn", "event": "deleted", "channelId": channel, "messageId": message, "content": found[0].get("content") or ""}


async def delete(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    token = cookies.get("token")
    if not token:
        return {"ok": False, "code": "noPlatformSession", "detail": "no Discord token saved for this account", "loginState": "unknown"}
    channel, message = str(spec.get("channel") or "").strip(), str(spec.get("message") or "").strip()
    if not channel.isdigit() or not message.isdigit():
        return {"ok": False, "code": "sendInvalid", "detail": "delete needs a channel id and a message id"}
    return await asyncio.to_thread(delete_of, token, channel, message)


def react_of(token: str, channel: str, message: str, emoji: str, remove: bool) -> dict[str, Any]:
    client, failed = open_client(token)
    if failed:
        return failed
    done = client.remove_reaction(channel, message, emoji) if remove else client.send_reaction(channel, message, emoji)
    if done is None:
        return {"ok": False, "code": "reactFailed", "detail": f"Discord didn't answer the reaction on message {message}", "loginState": "unknown", "event": "dropped"}
    if not done:
        return {"ok": False, "code": "reactRefused", "detail": f"Discord refused the reaction {emoji} on message {message}", "loginState": "loggedIn", "event": "throttled"}
    return {"ok": True, "loginState": "loggedIn", "event": "sent", "mode": "react", "removed": remove, "channelId": channel, "messageId": message, "emoji": emoji}


async def react(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    token = cookies.get("token")
    if not token:
        return {"ok": False, "code": "noPlatformSession", "detail": "no Discord token saved for this account", "loginState": "unknown"}
    channel, message = str(spec.get("channel") or "").strip(), str(spec.get("message") or "").strip()
    raw = str(spec.get("emoji") or "").strip()
    emoji = raw if ":" in raw.strip(":") else reactions.unicode_of(raw)
    if not channel.isdigit() or not message.isdigit() or not emoji:
        return {"ok": False, "code": "reactInvalid", "detail": "react needs a channel id, a message id and an emoji (unicode, a known name, or a custom one as name:id)"}
    return await asyncio.to_thread(react_of, token, channel, message, emoji, spec.get("remove") is True)


def voice_of(token: str, channel: str, path: Path, seconds: float, waveform: str) -> dict[str, Any]:
    from endcord.discord import generate_nonce

    client, failed = open_client(token)
    if failed:
        return failed
    slot, code = client.request_attachment_url(channel, str(path), custom_name="voice-message.ogg")
    if code or not slot:
        return {"ok": False, "code": "voiceNoteRefused", "detail": f"Discord gave no upload slot for the voice note (code {code}): nothing was sent", "loginState": "loggedIn", "event": "dropped", "channelId": channel}
    if not client.upload_attachment(slot["upload_url"], str(path)):
        return {"ok": False, "code": "voiceNoteRefused", "detail": "the upload of the voice note to Discord failed: nothing was sent", "loginState": "loggedIn", "event": "dropped", "channelId": channel}
    body = json.dumps({"channel_id": channel, "content": "", "attachments": [{"id": "0", "filename": "voice-message.ogg", "uploaded_filename": slot["upload_filename"], "duration_secs": seconds, "waveform": waveform}], "message_reference": None, "flags": media.DISCORD_VOICE_FLAG, "type": 0, "sticker_ids": [], "nonce": generate_nonce()})
    data, status = client.request("POST", f"/api/v9/channels/{channel}/messages", body, client.header)
    if not status:
        return {"ok": False, "code": "voiceNoteFailed", "detail": f"Discord didn't answer the voice note in channel {channel}: whether it landed is unknown", "loginState": "unknown", "event": "dropped", "channelId": channel}
    if status != 200:
        refusal = refusal_of(status, data, f"the voice note in channel {channel}")
        return {**refusal, "code": refusal["code"] if refusal["code"] in ("rateLimited", "sessionDead") else "voiceNoteRefused", "event": "throttled"}
    sent = json.loads(data)
    return {"ok": True, "loginState": "loggedIn", "event": "sent", "mode": "voice", "channelId": sent.get("channel_id") or channel, "messageId": sent.get("id"), "timestamp": sent.get("timestamp"), "seconds": seconds, "flags": sent.get("flags")}


async def voice(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    token = cookies.get("token")
    if not token:
        return {"ok": False, "code": "noPlatformSession", "detail": "no Discord token saved for this account", "loginState": "unknown"}
    channel = str(spec.get("channel") or "").strip()
    path = media.voice_note_path(spec.get("path"), ".ogg")
    seconds = float(spec.get("seconds") or 0)
    waveform = str(spec.get("waveform") or "")
    if not channel.isdigit() or not path or seconds <= 0 or not waveform:
        return {"ok": False, "code": "voiceNoteInvalid", "detail": "voice needs a channel id and a voice note log made itself (an .ogg under ~/.logCli/voiceNotes, with its seconds and waveform): no other audio is sent"}
    return await asyncio.to_thread(voice_of, token, channel, path, seconds, waveform)


def sound_search_of(client: Any, channel_id: str, pause: float) -> tuple[list[dict[str, Any]], dict[str, Any] | None]:
    from endcord.message import prepare_messages

    found: list[dict[str, Any]] = []
    offset = 0
    while True:
        url = f"/api/v9/channels/{channel_id}/messages/search?has=sound" + (f"&offset={offset}" if offset else "")
        data, status = client.request("GET", url, None, client.header)
        if not status:
            return found, {"refused": False, "detail": f"channel {channel_id} sound search: the network dropped, Discord didn't answer"}
        if status == 202:
            return found, {"refused": False, "detail": f"channel {channel_id} sound search: Discord answered 202, its search index for this chat isn't built yet"}
        if status != 200:
            return found, {"refused": True, **refusal_of(status, data, f"channel {channel_id} sound search")}
        body = json.loads(data)
        page = prepare_messages([hit[0] for hit in body.get("messages") or [] if hit], have_channel_id=True)
        found.extend(page)
        offset += SEARCH_PAGE
        if not page or offset >= int(body.get("total_results") or 0):
            return found, None
        time.sleep(pause)


def voice_notes_of(token: str, spec: dict[str, Any]) -> dict[str, Any]:
    client, failed = open_client(token)
    if failed:
        return failed
    pause = float(spec.get("pause") or 1.5)
    wanted = [str(c) for c in spec.get("channels") or [] if str(c).isdigit()]
    if not wanted:
        dms, refused = dms_of(client)
        if refused:
            return refused
        wanted = [d["id"] for d in dms]
    me = str(client.my_id)
    notes: list[dict[str, Any]] = []
    searched: list[str] = []
    problems: list[dict[str, Any]] = []
    for index, channel_id in enumerate(wanted, 1):
        messages, stop = sound_search_of(client, channel_id, pause)
        for m in messages:
            attachments = attachments_of(m.get("embeds"))
            for a in saved_audio(client, spec, channel_id, str(m["id"]), attachments):
                notes.append({"channelId": channel_id, "messageId": str(m["id"]), "at": m["timestamp"], "from": m.get("global_name") or m["username"], "fromMe": str(m["user_id"]) == me, "text": text_of(m["content"], attachments), **{k: v for k, v in a.items() if k != "url"}})
        if stop and stop["refused"]:
            answer = {k: v for k, v in stop.items() if k != "refused"}
            print(json.dumps({"liveEvent": "progress", "line": f"discord voice notes {index}/{len(wanted)}: stopped, {answer['detail']}"}), file=sys.stderr, flush=True)
            return {**answer, "stopped": {"channelId": channel_id, "httpStatus": answer["httpStatus"], "answer": answer["answer"], "channelsLeft": len(wanted) - index}, "notes": notes, "searched": searched, "problems": problems}
        if stop:
            problems.append({"channelId": channel_id, "problem": stop["detail"]})
        else:
            searched.append(channel_id)
        print(json.dumps({"liveEvent": "progress", "line": f"discord voice notes {index}/{len(wanted)}: channel {channel_id}, {len(messages)} with sound"}), file=sys.stderr, flush=True)
        time.sleep(pause)
    return {"ok": True, "loginState": "loggedIn", "notes": notes, "searched": searched, "problems": problems}


async def voice_notes(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    token = cookies.get("token")
    if not token:
        return {"ok": False, "code": "noPlatformSession", "detail": "no Discord token saved for this account", "loginState": "unknown"}
    return await asyncio.to_thread(voice_notes_of, token, spec)


ACTIONS = {"ping": ping, "chats": chats, "export": export, "read": read, "send": send, "delete": delete, "react": react, "voice": voice, "watch": watch, "voiceNotes": voice_notes}


if __name__ == "__main__":
    raise SystemExit(kit.main(ACTIONS, WRITES, LIBRARY))
