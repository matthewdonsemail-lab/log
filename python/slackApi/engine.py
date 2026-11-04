from __future__ import annotations

import asyncio
import json
import sys
import time
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
VENDOR = ROOT.parent / "vendor"
for p in (str(ROOT), str(VENDOR / "gabrielSlack")):
    if p not in sys.path:
        sys.path.insert(0, p)

from platformKit import engine as kit
from platformKit import media

PLATFORM = "slack"
LIBRARY = "vendor/gabrielSlack"
WRITES: tuple[str, ...] = ("send",)
SESSION_COOKIES = ("d",)
SEND_GAP_SECONDS = (1.5, 3.5)
WATCHED = ("message", "user_typing", "im_marked", "channel_marked", "reaction_added", "reaction_removed", "presence_change", "draft_create", "draft_send", "draft_delete", "badge_counts_updated", "reconnect_url", "hello")


def gabriel_error(err: Exception) -> dict[str, Any] | None:
    from gabriel import is_gabriel_error

    if not is_gabriel_error(err):
        return None
    code = str(getattr(err, "code", "") or "")
    detail = str(err)
    if code == "AUTH_DEAD":
        return {"ok": False, "code": "sessionDead", "detail": detail, "loginState": "loggedOut"}
    if code == "RATE_LIMITED":
        return {"ok": False, "code": "rateLimited", "detail": detail, "loginState": "unknown", "event": "throttled", "retryAfter": getattr(err, "retry_after", None)}
    return {"ok": False, "code": f"slack{code.title().replace('_', '')}", "detail": detail, "loginState": "unknown"}


def files_of(m: dict[str, Any]) -> list[dict[str, Any]]:
    return [{k: v for k, v in (("name", f.get("name") or f.get("title") or f.get("id")), ("type", f.get("mimetype")), ("subtype", f.get("subtype")), ("id", f.get("id")), ("url", f.get("url_private_download") or f.get("url_private")), ("duration", round(f["duration_ms"] / 1000) if f.get("duration_ms") else None)) if v is not None} for f in m.get("files") or [] if isinstance(f, dict)]


async def file_of(core: Any, spec: dict[str, Any], chat: str, ts: str, attachment: dict[str, Any]) -> dict[str, Any]:
    plain = {k: v for k, v in attachment.items() if k != "url"}
    path = media.audio_path(spec, chat, ts, str(attachment.get("name") or "audio"))
    if path.is_file() and path.stat().st_size:
        return {**plain, "path": str(path)}
    if not attachment.get("url"):
        return {**plain, "error": "Slack gave no private url for the file"}
    resp = await core.http.fetch_authenticated(str(attachment["url"]), method="GET")
    if not resp.is_success or "text/html" in str(resp.headers.get("content-type", "")):
        return {**plain, "error": f"Slack answered {resp.status_code} to the file"}
    if len(resp.content) > media.VISUAL_MAX_BYTES:
        return {**plain, "error": f"the file is {len(resp.content) // 1024 // 1024} MB, over the {media.VISUAL_MAX_BYTES // 1024 // 1024} MB kept"}
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(resp.content)
    return {**plain, "path": str(path)}


async def saved_audio(core: Any, spec: dict[str, Any], chat: str, ts: str, attachments: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [await file_of(core, spec, chat, ts, a) for a in attachments if media.is_audio(a)]


async def saved_visuals(core: Any, spec: dict[str, Any], chat: str, ts: str, attachments: list[dict[str, Any]]) -> list[dict[str, Any]]:
    out = []
    for a in attachments:
        out.append(await file_of(core, spec, chat, ts, a) if media.is_visual(a) else {k: v for k, v in a.items() if k != "url"})
    return out


def core_for(cookies: dict[str, str], workspace: str | None) -> Any:
    from gabriel import AuthOptions, GabrielCore

    return GabrielCore(auth=AuthOptions(cookie_d=cookies["d"], workspace=workspace or None))


def team_row(team: Any) -> dict[str, Any]:
    return {"id": team.id, "name": team.name, "domain": team.domain, "url": team.url, "userId": team.user_id}


async def teams_of(cookies: dict[str, str]) -> list[dict[str, Any]]:
    core = core_for(cookies, None)
    try:
        result = await core.auth.exchange_cookie(cookies["d"])
        return [team_row(t) for t in result.teams]
    finally:
        await core.close()


def workspace_of(spec: dict[str, Any]) -> str | None:
    value = str(spec.get("workspace") or "").strip().lower()
    for suffix in (".slack.com", ".slack.com/"):
        if value.endswith(suffix):
            value = value[: -len(suffix)]
    return value.removeprefix("https://") or None


def missing_session(cookies: dict[str, str]) -> dict[str, Any] | None:
    if cookies.get("d"):
        return None
    return {"ok": False, "code": "sessionDead", "detail": "the account's cookies have no d (Slack's session cookie)", "loginState": "loggedOut"}


async def with_workspace(spec: dict[str, Any], cookies: dict[str, str], work: Any) -> dict[str, Any]:
    missing = missing_session(cookies)
    if missing:
        return missing
    workspace = workspace_of(spec)
    try:
        if not workspace:
            teams = await teams_of(cookies)
            if len(teams) != 1:
                return {"ok": False, "code": "workspaceNeeded", "detail": f"this session is signed in to {len(teams)} workspaces: give --workspace, one of {', '.join(t['domain'] for t in teams)}", "workspaces": teams, "loginState": "loggedIn" if teams else "loggedOut"}
            workspace = teams[0]["domain"]
        core = core_for(cookies, workspace)
        try:
            session = await core.initialize()
            out = await work(core, session)
            out.setdefault("workspace", {"id": session.team_id, "name": session.team_name, "domain": session.domain})
            return out
        finally:
            await core.close()
    except Exception as err:
        mapped = gabriel_error(err)
        if mapped:
            return mapped
        raise


async def ping(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    missing = missing_session(cookies)
    if missing:
        return missing
    try:
        teams = await teams_of(cookies)
    except Exception as err:
        mapped = gabriel_error(err)
        if mapped:
            return mapped
        raise
    if not teams:
        return {"ok": False, "code": "sessionDead", "detail": "Slack's cookie exchange answered with no signed-in workspace", "loginState": "loggedOut"}
    workspace = workspace_of(spec)
    if not workspace:
        return {"ok": True, "loginState": "loggedIn", "screenName": None, "userId": teams[0]["userId"], "workspaces": teams}

    async def work(core: Any, session: Any) -> dict[str, Any]:
        me = await core.auth.test()
        return {"ok": True, "loginState": "loggedIn", "screenName": me.get("user"), "userId": me.get("user_id"), "workspaces": teams}

    return await with_workspace(spec, cookies, work)


async def workspaces(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    answer = await ping({**spec, "workspace": None}, cookies)
    if not answer.get("ok"):
        return answer
    return {"ok": True, "loginState": "loggedIn", "workspaces": answer["workspaces"]}


def user_names(users: list[dict[str, Any]]) -> dict[str, str]:
    out: dict[str, str] = {}
    for u in users:
        profile = u.get("profile") or {}
        out[str(u.get("id"))] = str(profile.get("display_name") or profile.get("real_name") or u.get("real_name") or u.get("name") or u.get("id"))
    return out


async def names_for(core: Any, ids: list[str]) -> dict[str, str]:
    users: list[dict[str, Any]] = []
    for uid in sorted({i for i in ids if i}):
        try:
            answer = await core.call_web_api("users.info", {"user": uid})
            if answer.get("user"):
                users.append(answer["user"])
        except Exception:
            continue
    return user_names(users)


async def chats(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    limit = max(1, min(int(spec.get("limit") or 30), 200))

    async def work(core: Any, session: Any) -> dict[str, Any]:
        listed = await core.call_web_api("conversations.list", {"types": "im,mpim", "exclude_archived": "true", "limit": str(limit)})
        channels = listed.get("channels") or []
        names = await names_for(core, [str(c.get("user") or "") for c in channels])
        rows = [
            {
                "id": c.get("id"),
                "kind": "dm" if c.get("is_im") else "group",
                "name": None if c.get("is_im") else c.get("name"),
                "members": [names.get(str(c.get("user") or ""), c.get("user"))] if c.get("is_im") else [],
                "userId": c.get("user"),
                "updated": c.get("updated"),
            }
            for c in channels
        ]
        rows.sort(key=lambda r: r.get("updated") or 0, reverse=True)
        return {"ok": True, "loginState": "loggedIn", "chats": rows[:limit]}

    return await with_workspace(spec, cookies, work)


async def read(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    chat = str(spec.get("chat") or "").strip()
    if not chat:
        return {"ok": False, "code": "chatNeeded", "detail": "give the chat's id (a D…, G… or C… id from log slack chats)"}
    limit = max(1, min(int(spec.get("limit") or 50), 1000))

    async def work(core: Any, session: Any) -> dict[str, Any]:
        messages: list[dict[str, Any]] = []
        cursor: str | None = None
        while len(messages) < limit:
            fields = {"channel": chat, "limit": str(min(200, limit - len(messages)))}
            if spec.get("oldest"):
                fields["oldest"] = str(spec["oldest"])
            if cursor:
                fields["cursor"] = cursor
            page = await core.call_web_api("conversations.history", fields)
            messages.extend(page.get("messages") or [])
            cursor = ((page.get("response_metadata") or {}).get("next_cursor") or "").strip() or None
            if not page.get("has_more") or not cursor:
                break
        names = await names_for(core, [str(m.get("user") or "") for m in messages])
        rows = []
        for m in messages[:limit]:
            attachments = files_of(m)
            row = {
                "ts": m.get("ts"),
                "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(float(m.get("ts") or 0))),
                "userId": m.get("user"),
                "from": "me" if m.get("user") == session.user_id else names.get(str(m.get("user") or ""), m.get("user") or m.get("username")),
                "text": media.text_with_audio(m.get("text"), attachments),
                "subtype": m.get("subtype"),
                "threadTs": m.get("thread_ts"),
                "replies": m.get("reply_count"),
                "attachments": [{k: v for k, v in a.items() if k != "url"} for a in attachments],
            }
            if spec.get("saveAudio") is not False and any(media.is_audio(a) for a in attachments):
                row["audio"] = await saved_audio(core, spec, chat, str(m.get("ts") or ""), attachments)
            rows.append(row)
        rows.reverse()
        return {"ok": True, "loginState": "loggedIn", "chat": chat, "messages": rows}

    return await with_workspace(spec, cookies, work)


async def send(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    import random

    chat = str(spec.get("chat") or "").strip()
    lines = [str(x) for x in (spec.get("lines") or []) if str(x).strip()]
    if not chat or not lines:
        return {"ok": False, "code": "sendNeeded", "detail": "give the chat's id and the text to send"}

    async def work(core: Any, session: Any) -> dict[str, Any]:
        sent: list[dict[str, Any]] = []
        for i, line in enumerate(lines):
            if i:
                await asyncio.sleep(random.uniform(*SEND_GAP_SECONDS))
            answer = await core.call_web_api("chat.postMessage", {"channel": chat, "text": line})
            if not answer.get("ok"):
                return {"ok": False, "code": "slackRefused", "detail": f"chat.postMessage answered {answer.get('error')}", "sent": sent, "loginState": "loggedIn"}
            sent.append({"ts": answer.get("ts"), "text": (answer.get("message") or {}).get("text", line)})
        return {"ok": True, "loginState": "loggedIn", "chat": chat, "sent": sent}

    return await with_workspace(spec, cookies, work)


def live(event: dict[str, Any]) -> None:
    print(json.dumps({"liveEvent": event}, default=str), flush=True)


async def watch(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    missing = missing_session(cookies)
    if missing:
        return missing
    seconds = int(spec.get("seconds") or 0)
    seconds = 0 if seconds <= 0 else max(5, min(seconds, 86400))
    only = set(spec.get("types") or WATCHED)
    try:
        chosen = workspace_of(spec)
        domains = [chosen] if chosen else [t["domain"] for t in await teams_of(cookies)]
        if not domains:
            return {"ok": False, "code": "sessionDead", "detail": "Slack's cookie exchange answered with no signed-in workspace", "loginState": "loggedOut"}
        counts: dict[str, int] = {}
        cores: list[Any] = []
        stops: list[Any] = []
        for domain in domains:
            core = core_for(cookies, domain)
            session = await core.initialize()
            names: dict[str, str] = {}

            def on_frame(frame: Any, core: Any = core, session: Any = session, names: dict[str, str] = names) -> None:
                data = frame if isinstance(frame, dict) else getattr(frame, "data", None) or {}
                kind = str(data.get("type") or "")
                if kind not in only:
                    return
                counts[kind] = counts.get(kind, 0) + 1
                channel = data.get("channel") or (data.get("item") or {}).get("channel")
                if isinstance(channel, dict):
                    channel = channel.get("id")
                row = {"type": kind, "subtype": data.get("subtype"), "workspace": session.domain, "teamId": session.team_id, "channel": channel, "user": data.get("user"), "ts": data.get("ts") or data.get("event_ts")}
                if kind == "message":
                    user = str(data.get("user") or "")
                    text = str(data.get("text") or "")
                    row["fromMe"] = user == session.user_id
                    row["from"] = "me" if row["fromMe"] else names.get(user, user or data.get("username") or "?")
                    attachments = files_of(data)
                    row["text"] = media.text_with_audio(text, attachments)
                    if attachments:
                        row["attachments"] = [{k: v for k, v in a.items() if k != "url"} for a in attachments]
                    visuals = [a for a in attachments if media.is_visual(a)] if not row["fromMe"] else []
                    row["mentionsMe"] = f"<@{session.user_id}>" in text
                    row["threadTs"] = data.get("thread_ts")
                    row["at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(float(data.get("ts") or time.time())))
                    if visuals or (user and user not in names and not row["fromMe"]):
                        asyncio.ensure_future(name_then_live(core, names, user, row, spec, str(channel or ""), attachments if visuals else []))
                        return
                live(row)

            stops.append(core.on_raw_frame(on_frame))
            await core.connect()
            cores.append(core)
            live({"type": "watching", "workspace": session.domain, "seconds": seconds})
        try:
            if seconds:
                await asyncio.sleep(seconds)
            else:
                while True:
                    await asyncio.sleep(3600)
        finally:
            for stop in stops:
                stop()
            for core in cores:
                core.disconnect()
                await core.close()
        return {"ok": True, "loginState": "loggedIn", "watchedSeconds": seconds, "workspaces": domains, "counts": counts}
    except Exception as err:
        mapped = gabriel_error(err)
        if mapped:
            return mapped
        raise


async def name_then_live(core: Any, names: dict[str, str], user: str, row: dict[str, Any], spec: dict[str, Any] | None = None, chat: str = "", attachments: list[dict[str, Any]] | None = None) -> None:
    if user and user not in names:
        try:
            names.update(await names_for(core, [user]))
        except Exception:
            pass
    row["from"] = names.get(user, user)
    if attachments and spec is not None:
        try:
            row["attachments"] = await saved_visuals(core, spec, chat, str(row.get("ts") or ""), attachments)
        except Exception as e:
            row["attachments"] = [{**{k: v for k, v in a.items() if k != "url"}, "error": str(e)[:200]} for a in attachments]
    live(row)


ACTIONS = {"ping": ping, "workspaces": workspaces, "chats": chats, "read": read, "send": send, "watch": watch}


if __name__ == "__main__":
    raise SystemExit(kit.main(ACTIONS, WRITES, LIBRARY))
