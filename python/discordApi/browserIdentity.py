from __future__ import annotations

import base64
import copy
import json
import os
import time
import uuid
from pathlib import Path
from typing import Any

IMPERSONATE = "chrome150"
ORIGIN = "https://discord.com"
GATEWAY_URL = "wss://gateway.discord.gg/?encoding=json&v=9&compress=zlib-stream"
REST_HEADERS = ("accept-language", "sec-ch-ua", "sec-ch-ua-mobile", "sec-ch-ua-platform", "user-agent", "x-debug-options", "x-discord-locale", "x-discord-timezone", "x-installation-id", "x-super-properties")
PER_SESSION = ("token", "qos_token")
PER_LAUNCH = ("client_launch_id", "launch_signature", "client_heartbeat_session_id")
FILE = "browserIdentity.json"


def runs_root() -> Path:
    return Path(os.environ.get("LOG_RUNS_ROOT") or Path.home() / ".logCli" / "runs")


def recordings(account: str, root: Path | None = None) -> list[Path]:
    base = (root or runs_root()) / "inspect"
    if not base.exists():
        return []
    found = [p / "adsPower" / "session.har" for p in base.glob(f"*_{account}") if (p / "adsPower" / "session.har").exists()]
    return sorted(found, key=lambda p: p.stat().st_mtime, reverse=True)


def sent_op(entries: list[dict[str, Any]], op: int) -> dict[str, Any] | None:
    for entry in entries:
        if not str(entry.get("request", {}).get("url") or "").startswith("wss://gateway.discord.gg"):
            continue
        for message in entry.get("_webSocketMessages") or []:
            if message.get("type") != "send":
                continue
            try:
                sent = json.loads(message.get("data") or "")
            except ValueError:
                continue
            if isinstance(sent, dict) and sent.get("op") == op and isinstance(sent.get("d"), dict):
                return sent["d"]
    return None


def identify_of(entries: list[dict[str, Any]]) -> tuple[str, dict[str, Any]] | None:
    found = None
    for entry in entries:
        url = str(entry.get("request", {}).get("url") or "")
        if not url.startswith("wss://gateway.discord.gg"):
            continue
        for message in entry.get("_webSocketMessages") or []:
            if message.get("type") != "send":
                continue
            try:
                sent = json.loads(message.get("data") or "")
            except ValueError:
                continue
            if isinstance(sent, dict) and sent.get("op") == 2 and isinstance(sent.get("d"), dict):
                found = (url, sent["d"])
    return found


def headers_of(entries: list[dict[str, Any]]) -> dict[str, str] | None:
    found = None
    for entry in entries:
        request = entry.get("request", {})
        if not str(request.get("url") or "").startswith(f"{ORIGIN}/api/v9/"):
            continue
        named = {str(h.get("name") or "").lower(): str(h.get("value") or "") for h in request.get("headers") or []}
        if named.get("x-super-properties") and named.get("user-agent") and named.get("authorization"):
            found = {k: named[k] for k in REST_HEADERS if named.get(k)}
    return found


def template_of(identify: dict[str, Any]) -> dict[str, Any]:
    kept = {k: v for k, v in copy.deepcopy(identify).items() if k not in PER_SESSION}
    properties = kept.get("properties") or {}
    for key in PER_LAUNCH:
        properties.pop(key, None)
    kept["properties"] = properties
    return kept


def from_har(path: Path) -> dict[str, Any] | None:
    try:
        entries = json.loads(path.read_text(encoding="utf-8")).get("log", {}).get("entries") or []
    except (OSError, ValueError):
        return None
    found = identify_of(entries)
    headers = headers_of(entries)
    if not found or not headers:
        return None
    url, identify = found
    voice = sent_op(entries, 4)
    heartbeat = sent_op(entries, 40)
    return {"recordedFrom": str(path), "recordedAt": path.stat().st_mtime, "gatewayUrl": url, "identify": template_of(identify), "headers": headers, **({"voiceState": voice} if voice else {}), **({"qos": heartbeat["qos"]} if heartbeat and isinstance(heartbeat.get("qos"), dict) else {})}


def load(state_root: str, account: str, root: Path | None = None) -> dict[str, Any] | None:
    path = Path(state_root) / account / FILE
    kept = json.loads(path.read_text(encoding="utf-8")) if path.exists() else None
    for har in recordings(account, root):
        if kept and kept.get("recordedAt", 0) >= har.stat().st_mtime:
            break
        made = from_har(har)
        if made:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(json.dumps(made, indent=1), encoding="utf-8")
            return made
    return kept


def launch_signature() -> str:
    bits = 0b00000000100000000001000000010000000010000001000000001000000000000010000010000001000000000100000000000001000000000000100000000000
    return str(uuid.UUID(int=uuid.uuid4().int & (~bits & ((1 << 128) - 1))))


def launch() -> dict[str, str]:
    return {"client_launch_id": str(uuid.uuid4()), "launch_signature": launch_signature(), "client_heartbeat_session_id": str(uuid.uuid4())}


def identify_payload(identity: dict[str, Any], token: str, launched: dict[str, str]) -> dict[str, Any]:
    d = copy.deepcopy(identity["identify"])
    d["token"] = token
    properties = d.setdefault("properties", {})
    properties["client_launch_id"] = launched["client_launch_id"]
    properties["launch_signature"] = launched["launch_signature"]
    properties["is_fast_connect"] = False
    return {"op": 2, "d": d}


def after_ready(identity: dict[str, Any], launched: dict[str, str], started_ms: int, sequence: int | None) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    if identity.get("voiceState") is not None:
        out.append({"op": 4, "d": copy.deepcopy(identity["voiceState"])})
    if identity.get("qos") is not None:
        out.append({"op": 41, "d": {"initialization_timestamp": started_ms, "session_id": launched["client_heartbeat_session_id"], "client_launch_id": launched["client_launch_id"]}})
    out.append(heartbeat(identity, sequence))
    return out


def heartbeat(identity: dict[str, Any], sequence: int | None) -> dict[str, Any]:
    if identity.get("qos") is not None:
        return {"op": 40, "d": {"seq": sequence, "qos": copy.deepcopy(identity["qos"])}}
    return {"op": 1, "d": sequence}


def super_properties(identity: dict[str, Any], launched: dict[str, str]) -> str:
    properties = json.loads(base64.b64decode(identity["headers"]["x-super-properties"]))
    properties["client_launch_id"] = launched["client_launch_id"]
    properties["launch_signature"] = launched["launch_signature"]
    if "client_heartbeat_session_id" in properties:
        properties["client_heartbeat_session_id"] = launched["client_heartbeat_session_id"]
    return base64.b64encode(json.dumps(properties, separators=(",", ":"), ensure_ascii=False).encode("utf-8")).decode("ascii")


def rest_headers(identity: dict[str, Any], token: str, launched: dict[str, str], referer: str = f"{ORIGIN}/channels/@me") -> dict[str, str]:
    named = {"-".join(part.capitalize() for part in k.split("-")): v for k, v in identity["headers"].items()}
    named["X-Super-Properties"] = super_properties(identity, launched)
    named.update({"Authorization": token, "Accept": "*/*", "Origin": ORIGIN, "Referer": referer, "Sec-Fetch-Dest": "empty", "Sec-Fetch-Mode": "cors", "Sec-Fetch-Site": "same-origin", "Priority": "u=1, i"})
    named["X-Discord-Timezone"] = identity["headers"].get("x-discord-timezone") or time.tzname[0]
    return named
