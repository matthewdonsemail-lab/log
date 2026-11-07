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
TEXT_SUFFIXES = (".txt", ".tsv", ".csv", ".md", ".json")
TEXT_MAX_BYTES = 2 * 1024 * 1024
TEXT_PREVIEW_LINES = 200
TEXT_PREVIEW_CHARS = 20000
IMAGE_SIGNATURES = ((b"\x89PNG\r\n\x1a\n", 0), (b"\xff\xd8\xff", 0), (b"GIF87a", 0), (b"GIF89a", 0), (b"BM", 0))
VIDEO_SIGNATURES = ((b"ftyp", 4), (b"\x1a\x45\xdf\xa3", 0))


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


def is_text_file(attachment: dict[str, Any]) -> bool:
    kind = str(attachment.get("type") or "").lower()
    name = str(attachment.get("name") or "").lower()
    if any(kind.startswith(t) for t in ("image/", "video/", "audio/")):
        return False
    return name.endswith(TEXT_SUFFIXES) and (not kind or kind.startswith("text/") or kind.startswith("application/json"))


def starts_with(head: bytes, signatures: tuple[tuple[bytes, int], ...]) -> bool:
    return any(head[at:at + len(sig)] == sig for sig, at in signatures)


def visual_problem(path: Path) -> str | None:
    head = path.read_bytes()[:16]
    if starts_with(head, IMAGE_SIGNATURES) or (head[:4] == b"RIFF" and head[8:12] == b"WEBP") or starts_with(head, VIDEO_SIGNATURES):
        return None
    return "its bytes aren't an image or video, whatever its name says"


def text_problem(path: Path) -> str | None:
    if path.stat().st_size > TEXT_MAX_BYTES:
        return f"the file is over the {TEXT_MAX_BYTES // 1024 // 1024} MB a text file may be"
    raw = path.read_bytes()
    if b"\x00" in raw:
        return "it has binary bytes in it, so it isn't plain text"
    try:
        raw.decode("utf_8_sig")
    except UnicodeDecodeError:
        return "it isn't plain UTF-8 text"
    return None


def checked(kept: dict[str, Any], problem_of: Any) -> dict[str, Any]:
    path = Path(str(kept.get("path") or ""))
    if not kept.get("path") or not path.is_file():
        return kept
    problem = problem_of(path)
    if not problem:
        return kept
    path.unlink()
    return {k: v for k, v in kept.items() if k != "path"} | {"error": f"deleted: {problem}"}


def text_preview(path: Path) -> str:
    text = path.read_bytes().decode("utf_8_sig", errors="replace")
    return "\n".join(text.splitlines()[:TEXT_PREVIEW_LINES])[:TEXT_PREVIEW_CHARS]


def not_opened(attachment: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in attachment.items() if k != "url"} | {"error": "not a type log opens, so it wasn't downloaded"}
