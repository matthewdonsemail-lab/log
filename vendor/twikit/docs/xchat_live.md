# X Chat live (vendored twikit, 2026-10-28)

X's own chat app does not poll for new messages. It opens one socket and X pushes every event down it. This copy of twikit does the same.

```python
await client.unlock_xchat(pin)
async for event in client.watch_xchat():
    if event['type'] == 'Message':
        print(event['sender_id'], event['text'])
```

- `GQLClient.generate_xchat_token()` posts `GenerateXChatTokenMutation`; `Client.get_xchat_token()` returns its JWT (about 5 minutes; an open socket outlives it).
- `Client.watch_xchat(seconds=None, keepalive=30)` opens `wss://chat-ws.x.com/ws?token=<jwt>` through `self.http` (curl_cffi, the same pinned impersonation as every other call), sends `xchat.KEEPALIVE` every 30 s, takes a new token and reconnects when it drops, and yields:
  - `{'type': 'Message', 'conversation_id', 'sender_id', 'time_ms', 'text', 'event_id'}` for each message, decrypted when `unlock_xchat` ran (`'encrypted': True` when it didn't, `'error'` when it couldn't open);
  - `{'type': 'instruction', 'instruction', 'sequence_start'}` for X's instructions;
  - `{'type': 'socket', 'state': 'open' | 'closed' | 'connectFailed' | 'keysNotPrimed'}`.
- Keys: a pushed message carries only its key version, so `watch_xchat` first feeds every conversation's key-change events from the inbox to chat-xdk (`_xchat_prime_keys`), and re-reads the newest inbox page once for a message whose key it doesn't have yet.
- Frames: `xchat.frame_of(raw)` reads the Thrift binary `Message` union from `vendor/chatXdk/thrift/event.thrift`. A `MessageEvent` comes out as the base64 struct `Chat.decrypt_event` takes.
- Tests: `tests/test_xchat_frames.py`.

How it was found, and how to check it again when X changes: `docs/platforms/x/xchat/live.md` in log-cli.
