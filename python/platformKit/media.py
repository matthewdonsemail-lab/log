from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any

AUDIO_SUFFIXES = (".ogg", ".oga", ".opus", ".m4a", ".mp3", ".wav", ".aac", ".flac", ".webm")
AUDIO_TYPES = ("audio/", "video/ogg")
DISCORD_VOICE_FLAG = 8192
SLACK_AUDIO_SUBTYPES = ("slack_audio",)
VISUAL_SUFFIXES = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".mp4", ".mov", ".m4v", ".mkv")
VISUAL_TYPES = ("image/", "video/")
VISUAL_MAX_BYTES = 50 * 1024 * 1024


def is_audio(attachment: dict[str, Any], message_flags: int | None = None) -> bool:
    kind = str(attachment.get("type") or "").lower()
    name = str(attachment.get("name") or "").lower()
    if any(kind.startswith(t) for t in AUDIO_TYPES):
        return True
    if str(attachment.get("subtype") or "") in SLACK_AUDIO_SUBTYPES:
        return True
    if attachment.get("waveform") or (message_flags is not None and int(message_flags) & DISCORD_VOICE_FLAG and attachment.get("duration")):
        return True
    if kind.startswith("video/") or kind.startswith("image/"):
        return False
    return name.endswith(AUDIO_SUFFIXES)


def audio_marker(name: str) -> str:
    return f"(audio: {name})"


def text_with_audio(content: str | None, attachments: list[dict[str, Any]], message_flags: int | None = None) -> str:
    return " ".join([content or "", *(audio_marker(str(a["name"])) for a in attachments if is_audio(a, message_flags))]).strip()


def media_dir(spec: dict[str, Any], conversation_id: str) -> Path:
    return Path(str(spec["stateRoot"])) / str(spec["account"]) / "media" / re.sub(r"[^0-9A-Za-z_-]", "_", conversation_id)


def audio_path(spec: dict[str, Any], conversation_id: str, message_id: str, name: str) -> Path:
    return media_dir(spec, conversation_id) / f"{re.sub(r'[^0-9A-Za-z._-]', '_', message_id)}_{re.sub(r'[^0-9A-Za-z._-]', '_', name or 'audio')[-80:]}"


def is_visual(attachment: dict[str, Any]) -> bool:
    if is_audio(attachment):
        return False
    kind = str(attachment.get("type") or "").lower()
    name = str(attachment.get("name") or "").lower()
    return any(kind.startswith(t) for t in VISUAL_TYPES) or name.endswith(VISUAL_SUFFIXES)


def voice_notes_root() -> Path:
    return Path(os.environ.get("LOG_VOICE_NOTES_DIR") or Path.home() / ".logCli" / "voiceNotes").resolve()


def voice_note_path(given: Any, suffix: str) -> Path | None:
    if not isinstance(given, str) or not given.strip():
        return None
    path = Path(given).resolve()
    if path.suffix.lower() != suffix or not path.is_file() or not path.stat().st_size:
        return None
    return path if voice_notes_root() in path.parents else None
