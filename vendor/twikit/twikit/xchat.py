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


KEEPALIVE = bytes.fromhex('0c00020c0002000000')
"""Message{messageInstruction{keepAliveInstruction{}}}, the frame X's own
chat app sends every 30 seconds to hold the chat-ws socket open."""

_INSTRUCTIONS = {
    1: 'pullMessages', 2: 'keepAlive', 3: 'pullMessagesFinished', 4: 'pinReminder',
    5: 'switchToHybridPull', 6: 'displayTemporaryPasscode', 7: 'deviceEnrollment',
}
_FIXED = {2: 1, 3: 1, 4: 8, 6: 2, 8: 4, 10: 8}


def _skip(data: bytes, i: int, ftype: int) -> int:
    """Returns the offset just past one Thrift binary value of ``ftype``."""
    if ftype in _FIXED:
        return i + _FIXED[ftype]
    if ftype == 11:
        return i + 4 + struct.unpack(">i", data[i:i + 4])[0]
    if ftype == 12:
        while True:
            inner = data[i]
            i += 1
            if inner == 0:
                return i
            i = _skip(data, i + 2, inner)
    if ftype in (14, 15):
        etype, size = data[i], struct.unpack(">i", data[i + 1:i + 5])[0]
        i += 5
        for _ in range(size):
            i = _skip(data, i, etype)
        return i
    if ftype == 13:
        ktype, vtype, size = data[i], data[i + 1], struct.unpack(">i", data[i + 2:i + 6])[0]
        i += 6
        for _ in range(size):
            i = _skip(data, _skip(data, i, ktype), vtype)
        return i
    raise ValueError(f'unknown thrift type {ftype}')


def _struct_at(data: bytes, i: int) -> dict[int, tuple[int, int]]:
    """Maps each field of the Thrift struct starting at ``i`` to its type and
    the offset its value starts at."""
    fields: dict[int, tuple[int, int]] = {}
    while i < len(data):
        ftype = data[i]
        if ftype == 0:
            break
        fid = struct.unpack(">h", data[i + 1:i + 3])[0]
        fields[fid] = (ftype, i + 3)
        i = _skip(data, i + 3, ftype)
    return fields


def key_version_of(encoded: str) -> str | None:
    """The conversation key version a message event was encrypted under
    (``MessageEvent.detail.messageCreateEvent.conversation_key_version``,
    ``vendor/chatXdk/thrift/event.thrift``), or the version a key-change
    event sets (``conversationKeyChangeEvent.conversation_key_version``)."""
    try:
        data = base64.b64decode(encoded)
        detail = _struct_at(data, 0).get(7)
        if not detail or detail[0] != 12:
            return None
        union = _struct_at(data, detail[1])
        for fid, version_field in ((1, 101), (3, 1)):
            inner = union.get(fid)
            if inner and inner[0] == 12:
                found = _struct_at(data, inner[1]).get(version_field)
                if found and found[0] == 11:
                    start = found[1]
                    length = struct.unpack(">i", data[start:start + 4])[0]
                    return data[start + 4:start + 4 + length].decode("utf-8", "replace")
    except (ValueError, struct.error, IndexError):
        return None
    return None


EVENT_KINDS = {1: 'messageCreate', 3: 'conversationKeyChange', 4: 'groupChange', 5: 'messageFailure', 6: 'messageTyping', 7: 'messageDelete', 8: 'conversationDelete', 9: 'conversationMetadataChange', 10: 'grokSearchResponse', 12: 'markConversationRead', 13: 'markConversationUnread', 14: 'memberAccountDelete'}


def event_kind_of(encoded: str) -> str | None:
    """Which ``MessageEventDetail`` a message event carries
    (``vendor/chatXdk/thrift/event.thrift``)."""
    try:
        data = base64.b64decode(encoded)
        detail = _struct_at(data, 0).get(7)
        if not detail or detail[0] != 12:
            return None
        union = _struct_at(data, detail[1])
        return next((EVENT_KINDS.get(fid, str(fid)) for fid in union), None)
    except (ValueError, struct.error, IndexError):
        return 'unreadable'


def frame_of(raw: bytes) -> dict:
    """Reads one chat-ws socket frame, a Thrift binary ``Message`` union.

    Returns ``kind`` (``messageEvent``, ``messageInstruction``,
    ``batchedMessageEvents`` or ``unknown``), the frame's message events as
    base64 ``MessageEvent`` structs in ``events`` (what chat-xdk's
    ``decrypt_event`` takes), and for an instruction its ``instruction``
    name and, on a pull, the ``sequence_start`` X says to pull from.
    """
    out: dict = {'kind': 'unknown', 'events': []}
    if len(raw) < 4 or raw[0] != 12:
        return out
    fid = struct.unpack(">h", raw[1:3])[0]
    if fid == 1:
        end = _skip(raw, 3, 12)
        out.update(kind='messageEvent', events=[base64.b64encode(raw[3:end]).decode()])
    elif fid == 2:
        out['kind'] = 'messageInstruction'
        if raw[3] == 12:
            which = struct.unpack(">h", raw[4:6])[0]
            out['instruction'] = _INSTRUCTIONS.get(which, f'instruction{which}')
            if which == 1:
                start = _read_fields(raw[6:]).get(1)
                out['sequence_start'] = _as_text(start)
    elif fid == 3:
        out['kind'] = 'batchedMessageEvents'
        i = 3
        while i < len(raw) and raw[i] != 0:
            ftype, inner = raw[i], struct.unpack(">h", raw[i + 1:i + 3])[0]
            i += 3
            if ftype == 15 and inner == 1 and raw[i] == 12:
                size = struct.unpack(">i", raw[i + 1:i + 5])[0]
                i += 5
                for _ in range(size):
                    end = _skip(raw, i, 12)
                    out['events'].append(base64.b64encode(raw[i:end]).decode())
                    i = end
            else:
                i = _skip(raw, i, ftype)
    return out


def token_of(response: dict) -> str | None:
    """Finds the chat-ws JWT in a ``GenerateXChatTokenMutation`` answer."""
    stack = [response]
    while stack:
        item = stack.pop()
        if isinstance(item, dict):
            stack.extend(item.values())
        elif isinstance(item, list):
            stack.extend(item)
        elif isinstance(item, str) and item.count('.') == 2 and len(item) > 100:
            return item
    return None


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
    content = event.get('content') if isinstance(event.get('content'), dict) else {}
    kind = content.get('content_type') or ('Text' if 'text' in content else None)
    out = {
        'event_id': head.get('event_id') or event.get('message_id'),
        'conversation_id': event.get('conversation_id') or head.get('conversation_id'),
        'sender_id': str(event.get('sender_id') or head.get('sender_id') or ''),
        'time_ms': head.get('time_ms'),
        'type': event.get('type'),
        'kind': kind,
        'text': None,
    }
    if kind == 'Text':
        said = content.get('text') or ''
        shared = [a for a in (attachment_text(x) for x in content.get('attachments') or []) if a and a not in said]
        out['text'] = ' '.join([said, *shared]).strip()
    elif kind == 'Edit':
        out['text'] = f"(edited) {content.get('new_text') or ''}".strip()
        out['target_message_id'] = str(content.get('target_message_id') or '')
    elif kind == 'Reaction':
        out['text'] = f"(reacted {content.get('emoji') or ''})".replace(' )', ')')
        out['target_message_id'] = str(content.get('target_message_id') or '')
    return out


RECEIPT_KINDS = ('markConversationRead', 'markConversationUnread', 'messageTyping')


def unopened_of(encoded: str | None, error: Exception | str) -> dict:
    """An event chat-xdk couldn't open. A read receipt, an unread marker or
    a typing notice says nothing, so it comes back as a marker
    (``kind`` ``MarkRead``) whatever its signature; anything else keeps its
    error."""
    head = decode_event(encoded) if encoded else {}
    text = str(error)
    if (encoded and event_kind_of(encoded) in RECEIPT_KINDS) or 'ReadReceipt' in text:
        return {**head, 'type': 'Message', 'kind': 'MarkRead', 'text': None}
    return {**head, 'type': 'Message', 'text': None, 'error': text[:200]}


def is_marker(message: dict) -> bool:
    """A decrypted event that says nothing: a read or unread marker, a
    reaction taken back, or a content type chat-xdk doesn't know."""
    return message.get('text') is None and not message.get('error') and message.get('kind') not in (None, 'Text')


def attachment_text(attachment: dict) -> str | None:
    """A shared post, link, card, media or payment as one line of text."""
    if not isinstance(attachment, dict):
        return None
    post = attachment.get('post') or {}
    if post:
        return post.get('post_url') or (f"https://x.com/i/status/{post['rest_id']}" if post.get('rest_id') else '(a post)')
    url = attachment.get('url') or {}
    if url:
        return url.get('url') or url.get('display_title') or '(a link)'
    media = attachment.get('media') or {}
    if media:
        return f"({str(media.get('type') or 'media').lower()}{': ' + media['filename'] if media.get('filename') else ''})"
    if attachment.get('unified_card'):
        return '(a card)'
    money = attachment.get('money') or {}
    if money:
        return money.get('fallback_text') or '(a payment)'
    return None
