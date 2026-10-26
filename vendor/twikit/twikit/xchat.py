from __future__ import annotations

import base64
import struct


def _read_fields(data: bytes) -> dict[int, object]:
    """Reads the top-level fields of a Thrift binary-protocol struct.

    X Chat message events are Thrift binary structs. This walks the
    top-level fields and returns the ones needed to know who sent a
    message and when; it does not descend into nested structs and never
    touches the end-to-end-encrypted message body.
    """
    fields: dict[int, object] = {}
    i, n = 0, len(data)
    try:
        while i < n:
            ftype = data[i]
            i += 1
            if ftype == 0:
                break
            fid = struct.unpack(">h", data[i:i + 2])[0]
            i += 2
            if ftype == 11:
                length = struct.unpack(">i", data[i:i + 4])[0]
                i += 4
                fields[fid] = data[i:i + length]
                i += length
            elif ftype == 10:
                fields[fid] = struct.unpack(">q", data[i:i + 8])[0]
                i += 8
            elif ftype == 8:
                fields[fid] = struct.unpack(">i", data[i:i + 4])[0]
                i += 4
            elif ftype == 2:
                fields[fid] = bool(data[i])
                i += 1
            else:
                break
    except (struct.error, IndexError):
        pass
    return fields


def _as_text(value: object) -> str | None:
    if isinstance(value, (bytes, bytearray)):
        try:
            return value.decode("utf-8")
        except UnicodeDecodeError:
            return None
    return None


def decode_event(encoded: str) -> dict:
    """Decodes an X Chat message event's who/when from its base64 Thrift.

    Returns the event id, sender id, conversation id and time in epoch
    milliseconds. The message text is encrypted in a separate field and is
    not decoded here.
    """
    fields = _read_fields(base64.b64decode(encoded))
    time_raw = _as_text(fields.get(6))
    return {
        "event_id": _as_text(fields.get(1)),
        "sender_id": _as_text(fields.get(3)),
        "conversation_id": _as_text(fields.get(4)),
        "time_ms": int(time_raw) if time_raw and time_raw.isdigit() else None,
    }
