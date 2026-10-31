from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

VERSION = 1


def shown(m: dict[str, Any]) -> bool:
    return m.get("type", "Message") == "Message" and not (m.get("text") is None and not m.get("error") and m.get("kind") not in (None, "Text"))


def empty_state() -> dict[str, Any]:
    return {"version": VERSION, "maxSequenceId": "0", "syncedAt": None, "xchat": {}, "legacy": {"conversations": {}, "users": {}, "messages": [], "boxes": {}}}


def read_state(path: Path | None) -> dict[str, Any] | None:
    if path is None or not path.exists():
        return None
    try:
        state = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None
    if not isinstance(state, dict) or state.get("version") != VERSION or not str(state.get("maxSequenceId") or "").isdigit():
        return None
    return state


def write_state(path: Path | None, state: dict[str, Any]) -> None:
    if path is None:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    on_disk = read_state(path)
    if on_disk is not None:
        merge_states(state, on_disk)
    temp = path.with_name(f"{path.name}.{os.getpid()}.tmp")
    temp.write_text(json.dumps(state), encoding="utf-8")
    os.replace(temp, path)


def seq(value: Any) -> int:
    text = str(value or "")
    return int(text) if text.isdigit() else 0


def merge_states(into: dict[str, Any], other: dict[str, Any]) -> None:
    if seq(other.get("maxSequenceId")) > seq(into.get("maxSequenceId")):
        into["maxSequenceId"] = str(other["maxSequenceId"])
    for cid, conv in (other.get("xchat") or {}).items():
        mine = into["xchat"].setdefault(cid, {"participants": conv.get("participants") or [], "handles": {}, "lastMs": None, "lastSender": None, "messages": []})
        for uid, handle in (conv.get("handles") or {}).items():
            mine["handles"].setdefault(uid, handle)
        add_messages(mine, conv.get("messages") or [])
        mark_last(mine, conv.get("lastMs"), conv.get("lastSender"))
    merge_pool(into["legacy"], other.get("legacy") or {}, keep_newer=False)


def add_messages(conv: dict[str, Any], messages: list[dict[str, Any]]) -> int:
    held = {str(m.get("event_id")): i for i, m in enumerate(conv["messages"])}
    added = 0
    for m in messages:
        key = str(m.get("event_id") or "")
        if not key:
            continue
        if key in held:
            old = conv["messages"][held[key]]
            if old.get("text") is None and (m.get("text") is not None or (m.get("kind") and not old.get("kind"))):
                conv["messages"][held[key]] = m
            continue
        held[key] = len(conv["messages"])
        conv["messages"].append(m)
        added += 1
    conv["messages"].sort(key=lambda m: (m.get("time_ms") or 0, seq(m.get("event_id"))))
    return added


def mark_last(conv: dict[str, Any], time_ms: Any, sender: Any) -> None:
    if time_ms is not None and (conv.get("lastMs") is None or int(time_ms) >= int(conv["lastMs"])):
        conv["lastMs"], conv["lastSender"] = int(time_ms), (str(sender) if sender else conv.get("lastSender"))


def max_sequence(heads: list[dict[str, Any]], current: Any = "0") -> str:
    best = seq(current)
    for head in heads:
        best = max(best, seq(head.get("event_id")))
    return str(best)


def seed_xchat(state: dict[str, Any], conversations: list[dict[str, Any]], opened: dict[str, list[dict[str, Any]]] | None) -> None:
    for c in conversations:
        cid = str(c.get("conversation_id") or "")
        if not cid:
            continue
        conv = state["xchat"].setdefault(cid, {"participants": [], "handles": {}, "lastMs": None, "lastSender": None, "messages": []})
        conv["participants"] = list(c.get("participant_ids") or conv["participants"])
        conv["handles"].update(c.get("handles") or {})
        mark_last(conv, c.get("last_time_ms"), c.get("last_sender_id"))
    for cid, messages in (opened or {}).items():
        conv = state["xchat"].setdefault(cid, {"participants": [], "handles": {}, "lastMs": None, "lastSender": None, "messages": []})
        add_messages(conv, [m for m in messages if m.get("type", "Message") == "Message"])
        for m in messages:
            if shown(m) and m.get("text") is not None:
                mark_last(conv, m.get("time_ms"), m.get("sender_id"))


def merge_xchat(state: dict[str, Any], me: str, heads: list[dict[str, Any]], opened: dict[str, list[dict[str, Any]]], details: dict[str, dict[str, Any]], decrypted: bool) -> int:
    added = 0
    for cid, detail in details.items():
        conv = state["xchat"].setdefault(cid, {"participants": [], "handles": {}, "lastMs": None, "lastSender": None, "messages": []})
        conv["participants"] = list(detail.get("participant_ids") or conv["participants"])
        conv["handles"].update(detail.get("handles") or {})
    for cid, messages in opened.items():
        conv = state["xchat"].setdefault(cid, {"participants": [p for p in cid.split(":") if p.isdigit() and p != me], "handles": {}, "lastMs": None, "lastSender": None, "messages": []})
        said = [m for m in messages if m.get("type", "Message") == "Message"]
        added += add_messages(conv, said)
        for m in said:
            if shown(m):
                mark_last(conv, m.get("time_ms"), m.get("sender_id"))
    if not decrypted:
        for head in heads:
            cid = str(head.get("conversation_id") or "")
            if not cid:
                continue
            conv = state["xchat"].setdefault(cid, {"participants": [p for p in cid.split(":") if p.isdigit() and p != me], "handles": {}, "lastMs": None, "lastSender": None, "messages": []})
            added += add_messages(conv, [{**head, "text": None, "error": "no key"}])
            mark_last(conv, head.get("time_ms"), head.get("sender_id"))
    return added


def merge_pool(into: dict[str, Any], fresh: dict[str, Any], keep_newer: bool = True) -> int:
    added = 0
    for cid, c in (fresh.get("conversations") or {}).items():
        held = into["conversations"].get(cid)
        if held is None:
            added += 1
        if held is None or keep_newer or seq(c.get("sort_timestamp")) > seq(held.get("sort_timestamp")):
            into["conversations"][cid] = c
            if cid in (fresh.get("boxes") or {}):
                into["boxes"][cid] = fresh["boxes"][cid]
    for uid, user in (fresh.get("users") or {}).items():
        into["users"][uid] = user
    seen = {m.get("id") for m in into["messages"]}
    for m in fresh.get("messages") or []:
        if m.get("id") and m["id"] not in seen:
            seen.add(m["id"])
            into["messages"].append(m)
    return added


def xchat_threads(state: dict[str, Any], me: str, decrypted: bool) -> list[dict[str, Any]]:
    from datetime import datetime, timezone

    def iso(ms: Any) -> str | None:
        return datetime.fromtimestamp(int(ms) / 1000, timezone.utc).isoformat().replace("+00:00", "Z") if str(ms or "").isdigit() else None

    out = []
    for cid, conv in state["xchat"].items():
        people = [{"userId": uid, "handle": conv["handles"].get(uid)} for uid in conv.get("participants") or []]
        visible = [m for m in conv["messages"] if shown(m)]
        said = [m for m in visible if m.get("text") is not None]
        last_ms, sender = conv.get("lastMs"), conv.get("lastSender")
        newest = visible[-1] if visible else None
        markers = {m.get("time_ms") for m in conv["messages"] if not shown(m)}
        if newest is not None and last_ms in markers:
            last_ms, sender = newest.get("time_ms"), newest.get("sender_id")
        if said and (last_ms is None or (said[-1].get("time_ms") or 0) >= int(last_ms)):
            last_ms, sender = said[-1].get("time_ms"), said[-1].get("sender_id")
        from_me = str(sender or "") == me
        if last_ms is None:
            text = None
        elif said and said[-1].get("time_ms") == last_ms:
            text = said[-1]["text"]
        elif newest is not None and newest.get("time_ms") == last_ms and newest.get("text") is None:
            text = f"(could not open: {newest.get('error') or 'no key'})" if decrypted else "(encrypted X Chat message)"
        else:
            text = "(could not open)" if decrypted else "(encrypted X Chat message)"
        out.append({
            "conversationId": cid,
            "box": "xchat",
            "type": "group" if len(people) > 1 else "oneToOne",
            "name": None,
            "with": people,
            "lastAt": iso(last_ms),
            "lastFromMe": from_me,
            "lastText": text,
            "unread": bool(last_ms is not None and not from_me),
            "messagesLoaded": len(said),
        })
    return out


def push_message(path: Path | None, me: str, event: dict[str, Any], handle: str | None) -> bool:
    state = read_state(path)
    cid = str(event.get("conversation_id") or "")
    if state is None or not cid or not event.get("event_id"):
        return False
    conv = state["xchat"].setdefault(cid, {"participants": [p for p in cid.split(":") if p.isdigit() and p != me], "handles": {}, "lastMs": None, "lastSender": None, "messages": []})
    sender = str(event.get("sender_id") or "")
    if handle and sender and sender != me:
        conv["handles"].setdefault(sender, handle)
    kept = {k: event.get(k) for k in ("event_id", "sender_id", "time_ms", "text", "conversation_id")} | {k: event[k] for k in ("kind", "error") if event.get(k) is not None}
    added = add_messages(conv, [kept])
    if shown(kept):
        mark_last(conv, event.get("time_ms"), sender)
    write_state(path, state)
    return bool(added)


def opened_of(state: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    return {cid: [m for m in conv["messages"] if shown(m)] for cid, conv in state["xchat"].items()}
