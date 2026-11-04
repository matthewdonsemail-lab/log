from __future__ import annotations

EMOJI_NAMES: dict[str, str] = {
    "\U0001f44d": "+1",
    "\U0001f44e": "-1",
    "\u2764\ufe0f": "heart",
    "\u2764": "heart",
    "\U0001f602": "joy",
    "\U0001f923": "rolling_on_the_floor_laughing",
    "\U0001f62d": "sob",
    "\U0001f525": "fire",
    "\U0001f440": "eyes",
    "\U0001f64f": "pray",
    "\U0001f4af": "100",
    "\U0001f480": "skull",
    "\U0001f605": "sweat_smile",
    "\U0001f60e": "sunglasses",
    "\U0001f914": "thinking_face",
    "\U0001f62e": "open_mouth",
    "\U0001f622": "cry",
    "\U0001f621": "rage",
    "\U0001f44f": "clap",
    "\U0001f389": "tada",
    "\U0001f64c": "raised_hands",
    "\U0001f4aa": "muscle",
    "\U0001fae1": "saluting_face",
    "\U0001f91d": "handshake",
    "\u2705": "white_check_mark",
}
UNICODE_OF: dict[str, str] = {}
for _unicode, _name in EMOJI_NAMES.items():
    UNICODE_OF.setdefault(_name, _unicode)
UNICODE_OF.update({"thumbsup": "\U0001f44d", "thumbsdown": "\U0001f44e", "laughing": "\U0001f602", "rofl": "\U0001f923", "hundred": "\U0001f4af"})


def name_of(value: str) -> str:
    return str(value or "").strip().strip(":").strip()


def unicode_of(value: str) -> str | None:
    raw = str(value or "").strip()
    if not raw:
        return None
    if raw.startswith(":") or raw.replace("_", "").replace("+", "").replace("-", "").isalnum() and raw.isascii():
        return UNICODE_OF.get(name_of(raw))
    return raw


def slack_name_of(value: str) -> str | None:
    raw = str(value or "").strip()
    if not raw:
        return None
    if raw.isascii():
        name = name_of(raw)
        return name or None
    return EMOJI_NAMES.get(raw) or EMOJI_NAMES.get(raw.replace("\ufe0f", ""))
