---
title: "X Chat live: how X pushes new messages, and how log listens"
tags: [x, twitter, xchat, websocket, realtime, log-cli]
status: active
created: 2026-10-28
---

# X Chat live: X pushes, log listens (2026-10-28)

**Why:** log used to find out about replies by reading the whole X Chat inbox again and again. X answered `429 Rate limit exceeded` (27 Oct 14:57 to 15:38 UTC, 28 Oct 03:2x and 05:15 UTC), so the closer we watched, the less we could read. X's own app never polls: it keeps one socket open and X pushes every event down it. Issue #68.

## How it works, in one picture

```
GenerateXChatTokenMutation        ->  a JWT (claims cc did exp iss nbf sub ua, about 5 minutes)
wss://chat-ws.x.com/ws?token=<jwt>    one socket, Origin https://x.com
   every 30 s we send KeepAlive       0c 00 02 0c 00 02 00 00 00  (binary frame)
   X pushes Message frames            messageEvent | messageInstruction | batchedMessageEvents
   socket drops                       new token, new socket (2 s, doubling to 60 s)
```

One real example, 28 Oct 05:49:45 UTC: @QuadScorpion08 typed "Ok wait let ai reply now". X pushed it as a `messageEvent` frame the same second, `log twitter chat watch` decrypted it with the saved PIN and printed `>>> NEW 2026-10-28T05:49:45.872000Z @QuadScorpion08: Ok wait let ai reply now`. No inbox read.

## The parts

| Part | Where | What it does |
|---|---|---|
| Token | `vendor/twikit` `Client.get_xchat_token()`, `GQLClient.generate_xchat_token()` | Posts `GenerateXChatTokenMutation` (id `Qh3fZRjPPtPoHYR_2sCZsA`, field `user_get_x_chat_auth_token`), returns the JWT (`xchat.token_of`) |
| Frames | `vendor/twikit/twikit/xchat.py` `frame_of`, `KEEPALIVE` | Reads the Thrift binary `Message` union (`vendor/chatXdk/thrift/event.thrift`): a `MessageEvent` comes out as the base64 struct chat-xdk's `decrypt_event` takes; a `PullMessagesInstruction` gives its `sequence_start` |
| Socket | `Client.watch_xchat(seconds, keepalive)` | Opens `wss://chat-ws.x.com/ws` through `self.http` (curl_cffi, rule 81), sends KeepAlive every 30 s, reconnects on a drop, yields each event |
| Keys | `Client._xchat_prime_keys`, `Client._xchat_open` | A pushed message only carries its key version. At the start one inbox read feeds every conversation's `latest_conversation_key_change_events` to chat-xdk, which caches the keys; a message with an unknown key (new conversation, rotated key) re-reads the newest inbox page once and tries again. Senders' signing keys come from `GetPublicKeysQuery`, cached per sender |
| Engine | `python/twitterApi/engine.py` action `xchatWatch` | Unlocks with the PIN, prints one `{"liveEvent": …}` JSON line per message as it lands, then its usual answer |
| Runner | `src/twitter/account/session/client.ts` `runTwitterEngineLive` | Spawns the engine and calls back on each `liveEvent` line, so the command can print it the moment it comes (rule 26) |
| Command | `log twitter chat watch --account <a> [--seconds <n>] [--inbox] [--json]` | Prints each message as X pushes it; `--inbox` hands each new message from someone else to the inbox hook |
| Hook | `scripts/hooks/inbox.ts`, `src/inbox/watch` `ensureLiveWatchers` | Keeps one `chat watch --inbox` running per signed-in X account (pid in `~/.logCli/inbox/twitter/<a>/watch.pid`, its log in `watch.log`) and puts each new message in front of the agent with what to do: read the thread, draft from matt's guide, `log voice`, show matt, send only when he says |
| Voice gate | `log voice --to <h> --text "<draft>" [--context "<what they said>"]`, `src/twitter/copy/voice` | SubQ reads the draft against `GUIDES/MATT_WRITING_STYLE.md` and dms matt wrote himself (voice 0.8 to pass); a phrase he never says fails it outright |

## What we saw live

- 28 Oct ~05:35 to 05:40 UTC (probe): 40 `messageEvent` frames in ~85 s while matt was getting messages. Two shapes: 1143 to 1454 bytes with a 19-digit event id first (messages), 896 to 912 bytes with a UUID first (non-message events such as receipts).
- The socket stayed open past the JWT's `exp`; only a new connection needs a new token.
- Without the key-change events chat-xdk says `Message encrypted with key version '…' but no matching key found`. Priming fixed it (05:49:45 UTC, first message opened live).
- 90 s run: 8 messages pushed, nothing polled, exit 0.

## How it was found (do this again when X changes)

Read X's shipped code with rea, never guess (rules 73, 85):

1. Fetch the signed-in page `https://x.com/messages` with the account's cookies and read its script URLs (`responsive-web/client-web/main.*.js`). The chunk map is in the page (`t.u=e=>(({id:"name"…})[e]||e)+"."+({id:"hash"…})[e]+"a.js"`).
2. X Chat is an embed: `https://chat.x.com/embed-v1.json` names `remoteEntry.js` and its modules under `https://abs.twimg.com/x-web/xchat/embed/`. Crawl its imports.
3. In `assets/dm-core-*.js` (Kotlin compiled to JS) find `wss://chat-ws.x.com/ws?token=`, the `XWS` log lines (`got token, connecting to websocket`, `Sending KeepAlive`, `Running heartbeat cron`, `existing jwt token is expired, fetching new one from graphql`) and `GenerateXChatTokenMutation`. The heartbeat is `Wc(vs(30, …))`, 30 seconds.
4. The frame shapes are in `vendor/chatXdk/thrift/event.thrift` (`union Message`, `union MessageInstruction`, `struct KeepAliveInstruction {}`), Thrift binary protocol (chat-xdk uses `TBinaryInputProtocol`).
5. rea's `analyze_javascript_application` runs out of heap on the whole of dm-core (11.5 MB); cut the slice around the string you need and give rea that.

If the socket stops opening, check in this order: the mutation id in `vendor/twikit/twikit/client/gql.py` (`XCHAT_GENERATE_TOKEN`), the socket host and query (`chat-ws.x.com/ws?token=`), the KeepAlive bytes, then the `Message` union's field ids.
