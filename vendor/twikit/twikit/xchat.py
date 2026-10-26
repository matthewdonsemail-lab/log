from __future__ import annotations

import base64
import json
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


def public_keys_of(response: dict) -> list[dict]:
    """Flattens a GetPublicKeysQuery answer into one dict per user.

    Each entry carries the user's rest id, their latest registered key
    (identity ``public_key``, ``signing_public_key``, the binding
    signature and its ``version``) and, when tokens were asked for, the
    Juicebox ``token_map`` their keys are stored under.
    """
    out = []
    data = (response or {}).get('data') or {}
    for user in data.get('user_results_by_rest_ids') or []:
        rest_id = str(user.get('rest_id') or '')
        keys = (((user.get('result') or {}).get('get_public_keys')) or {})
        entries = keys.get('public_keys_with_token_map') or []
        best = None
        for entry in entries:
            meta = entry.get('public_key_with_metadata') or {}
            version = str(meta.get('version') or '')
            if best is None or int(version or 0) > int(best['version'] or 0):
                key = meta.get('public_key') or {}
                best = {
                    'user_id': rest_id,
                    'version': version,
                    'public_key': key.get('public_key'),
                    'signing_public_key': key.get('signing_public_key'),
                    'identity_public_key_signature': key.get('identity_public_key_signature'),
                    'token_map': entry.get('token_map'),
                }
        if best:
            out.append(best)
    return out


def signing_key_entry(key: dict) -> dict:
    """Maps one user's public keys to the shape chat-xdk verifies against."""
    return {
        'user_id': key['user_id'],
        'public_key_version': key['version'],
        'public_key': key['signing_public_key'],
        'identity_public_key': key['public_key'],
        'identity_public_key_signature': key['identity_public_key_signature'],
    }


def juicebox_config(token_map: dict) -> str:
    """Builds the Juicebox config chat-xdk unlocks with from a token map."""
    return json.dumps({
        'key_store_token_map_json': token_map['key_store_token_map_json'],
        'token_map': [
            {'key': t['key'], 'value': {'address': t['value']['address'], 'token': t['value']['token']}}
            for t in token_map.get('token_map') or []
        ],
        'max_guess_count': token_map.get('max_guess_count'),
    })


def message_of(decrypted: dict) -> dict:
    """Reads one chat-xdk decrypted event into who, when and what was said."""
    event = decrypted.get('event') or {}
    raw = decrypted.get('original_b64')
    head = decode_event(raw) if raw else {}
    content = event.get('content') or {}
    return {
        'event_id': head.get('event_id') or event.get('message_id'),
        'conversation_id': event.get('conversation_id') or head.get('conversation_id'),
        'sender_id': str(event.get('sender_id') or head.get('sender_id') or ''),
        'time_ms': head.get('time_ms'),
        'type': event.get('type'),
        'text': content.get('text') if isinstance(content, dict) else None,
    }
