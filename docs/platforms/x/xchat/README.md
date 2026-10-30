---
title: "X Chat (encrypted DMs) API, read from X's own web client"
tags: [x, twitter, xchat, dms, encryption, log-cli]
status: active
created: 2026-10-26
---

# X Chat: how the encrypted inbox works, from X's web client (2026-10-26)

Why: `log twitter dms` (twikit, X's older `dm/inbox_initial_state`) never shows replies sent through X's newer encrypted Chat. @shwetasd19 replied to a treg DM and the old read showed only our message.

## Where the code is

- The logged-in x.com page (`/i/chat`) loads `responsive-web/client-web/main.*.js`, which embeds the Chat app from `__META_DATA__.xchatEmbedBuild` = `https://abs.twimg.com/x-web/xchat/embed/<build>/`, manifest `https://chat.x.com/embed-v1.json` (module federation, Vite).
- The engine is `assets/dm-core-*.js` (11.5 MB): Kotlin Multiplatform compiled to JS (Ktor, Apollo Kotlin 5.2.0, SQLDelight in a `sqlite.worker`). Same core as the mobile apps.
- `assets/juicebox-sdk-*.js` + `juicebox-sdk_bg-*.wasm`: Juicebox (PIN-protected key backup), with `Client.recover`, `RecoverError(guesses_remaining)`.
- Juicebox realms pinned in dm-core: `https://realm-a.x.com/`, `https://realm-b.x.com/`, `https://d1muhwhmpsz4u8.cloudfront.net/`, plus 5 realm public keys.

## The API

- GraphQL at `https://api.x.com/graphql/<operationId>/<operationName>` (GET with `variables`, POST for mutations), bearer `AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA` (app id 3033300), the session's cookies and `x-csrf-token` = ct0.
- 89 operation ids extracted from dm-core (`.scratch` copy: xchatOpIds.json). The reading ones:

| Operation | id |
|---|---|
| GetInitialXChatPageQuery | Q4Mw0C6YcnjJac21wq-5NA |
| GetInboxPageRequestQuery | txrXftx8RcSvw9jCjwRZWA |
| GetInboxPageConversationDataQuery | 4T3Z2Rwf_1SdOA6b-Oi5-w |
| GetMessageRequestsPageQuery | 9ZPeVUiUU2_iLiGecVDydg |
| GetConversationPageQuery | GX9ZijkxG8AqRMQVD7hMnQ |
| GetMessageEventsPageQuery | 8ds29Y40jrxh_MZDbqWy0A |
| GenerateXChatTokenMutation (Juicebox auth token) | Qh3fZRjPPtPoHYR_2sCZsA |
| FetchSelfCustodyBackupQuery | W31ToTUKEssJ8CEtwCfALQ |
| GetPublicKeysQuery | C-YphxeIcPLOGtFNGhkuOw |
| XChatInitiatePasscodeRetrievalMutation | nTsYB72LJ1it6qlLt0EexQ |

## What a read returns (live, matthewsoldit, GetInitialXChatPageQuery with `{}`: HTTP 200)

- `get_initial_chat_page.items[]`: one per conversation (`conversation_detail.conversation_id` like `<theirId>:<ourId>`, participants with screen names), `latest_message_events[]`, `latest_conversation_key_change_events[]`, `latest_read_events_per_participant`, plus `inboxCursor` for paging and `message_requests_count`.
- Each message event is a base64 Thrift struct: event id, conversation id, sender id, timestamp (ms), and either plain text (messages sent through the old DM API show in clear) or an encrypted payload with a JWT naming the sender (`requestingUser`) and recipient.
- @shwetasd19's conversation held two encrypted events from her at 1792985775141 and 1792985822253 ms (03:36:15 and 03:37:02 UTC 2026-10-26).

## So

1. **Who replied and when** can be read now with the session alone: sender id and time are in the clear.
2. **What they said** needs the account's X Chat private key: the PIN recovers it through Juicebox (realms above, auth token from `GenerateXChatTokenMutation`), it opens the conversation key from the key-change events, and that opens the message payload.

## Live

New messages arrive by push, not by reading the inbox: one socket to `wss://chat-ws.x.com`, a KeepAlive every 30 s, each message decrypted as it lands. How it works, what was seen live and how to check it again: [live.md](live.md).

## Opening one chat, and what X's app does on a 429 (2026-10-29)

Read from X's shipped chat code (`assets/dm-core-DNH_F-Zu.js`, 11.7 MB, from `https://chat.x.com/embed-v1.json`). rea's whole-bundle read timed out at 240 s (partial Evidence `ev_f21c68f1…`), so these come from the bundle's own bytes:

- **Opening a chat** is `GetInboxPageConversationDataQuery` (`4T3Z2Rwf_1SdOA6b-Oi5-w`) with `conversation_ids: [<id>]` and `include_user_public_keys: false`. It returns that conversation's `latest_message_events` and `latest_conversation_key_change_events`. It never reads the whole inbox.
- **Older messages** come from `GetConversationPageQuery` (`GX9ZijkxG8AqRMQVD7hMnQ`), which the app logs as `fetchOlderMessages … from <sequence id> oldestCKey=<key version>`. Its variables are `conversation_id`, `min_local_sequence_id` (the oldest `MessageEvent.sequence_id` held, Thrift field 1) and `min_conversation_key_version` (the oldest key version held: `MessageCreateEvent.conversation_key_version`, field 101 of `detail.messageCreateEvent`). It answers with `encoded_message_events`, `missing_conversation_key_change_events` and `has_more`. `0` for either variable is refused (`BadRequest`, code 214).
- **On a 429** the app does not retry. Its only automatic retry is Ktor's `HttpRequestRetry`, whose condition is `500 <= status <= 599`. A 429 becomes `TooManyRequests` (an `HttpException` carrying `retryAfterSeconds` from `Retry-After`) and the request ends there.

log does the same. `log twitter dms --with <handle>` and `--conversation <a:b>` open one chat with `GetInboxPageConversationDataQuery`, then page back with `GetConversationPageQuery` up to 5 times, 1.5 s apart, while X says `has_more` (`client.get_xchat_conversation`). A 429 stops the read and pauses the account's governor, with nothing retried (rule 94). Checked live on 2026-10-29: @ricardoampudiar's thread took 4 requests in total (the legacy thread, the chat, two older pages), where the old path pulled up to 30 inbox pages back to back.

## Catching up: only what is new (2026-10-30)

`log twitter dms` took 32 to 90 s a read: every run unlocked the PIN through Juicebox (2.1 s), pulled the whole X Chat inbox (23 `GetInboxPageRequestQuery` pages back to back, 11.6 s), fetched every participant's keys and decrypted everything (3 s), then paged the old DM inbox with 1.5 s gaps (8 s). Nothing was kept between runs.

X's own chat app doesn't do that. Read from `assets/dm-core-C1AlWU5D.js` (11.7 MB, build `d44a8531a879caf9c7543bb1afda9e0f1da43cd2` from `https://chat.x.com/embed-v1.json`): it keeps a local database (SQLDelight, `inboxConversationLocalPaginationPageSize`), pulls the inbox once (`GotInboxInitialPageAndProcessedFirstPage`, then `AfterFirstInboxPage` in the background) and after that catches up by sequence number: `MessagePullCoordinator`, `PullMessagesInstruction(sequence_start=…)` over the socket, and over GraphQL `GetMessageEventsPageQuery` (`8ds29Y40jrxh_MZDbqWy0A`):

```graphql
query GetMessageEventsPageQuery($continue_cursor: XChatGetMessageEventsPageContinueCursorInput, $query_settings: XChatPageQuerySettingsInput)
# cursor: XChatGetMessageEventsPageEndCursor { pull_finished } | XChatGetMessageEventsPageContinueCursor { max_local_sequence_id }
# answer: encoded_message_events, message_requests_count
```

`continue_cursor.max_local_sequence_id` is the newest event the client holds; an event's sequence id is its event id (Thrift field 1). Checked live on matthewsoldit (2026-10-30): from the newest event kept on 29 Oct 04:22 UTC, one call answered 61 events across 16 conversations in 1.4 s with `pull_finished: true`; with nothing new, one call answers none.

rea read the whole bundle (`rea analyze-javascript-application`, Evidence `ev_a5489f350157a3fa307746e0ac39e035c95c93ca11b9d8472524771c3d440928`). Its semantic graph is partial on this minified Kotlin build: it stopped at its 20,000-node ceiling, with 117,370 dynamic calls and 336,952 ambiguous object flows left unresolved, before it reached the pull code. The query text, the cursor types and the pull log lines above are the bundle's own bytes.

What log does now (`client.get_xchat_updates`, `client.open_xchat_events` in `vendor/twikit`; `python/twitterApi/inboxSync.py`):

1. The first read takes everything once and keeps it in `~/.logCli/twitter/<account>/inboxSync.json` with the newest sequence id.
2. Every read after asks `GetMessageEventsPageQuery` from that sequence id, beside one `dm/inbox_initial_state` for the old DMs, both at once. Nothing new: no PIN unlock, no keys, no decrypt.
3. Something new: unlock once, read only those conversations' keys and participants (`GetInboxPageConversationDataQuery`, up to 20 ids a call), decrypt only the new events. Each event is kept once by its id.
4. The conversations that changed are saved for `log search`, and the index embeds only the chunks that are new or changed (`updateIndex`).

Measured on matthewsoldit, 2026-10-30, six reads 10 s apart with nothing new: the engine took p50 1.27 s, max 1.44 s (2 requests); the whole command p50 6.4 s, max 9.1 s, the rest being Bun and Python start-up and the Twenty lookups. The first read, which fills the store, took 21.7 s once.

### Start-up cut (2026-10-30)

Of the ~6 s a read took after the sync, about 1.3 s was X. The rest:

- **Python, 1.73 s → 0.96 s.** `import twikit` loaded js2py (0.69 s, through `twikit.ui_metrics`) and the captcha solver with numpy (0.36 s) on every run, though only the password login uses them. Both now load when used (vendor/twikit, rule 81).
- **Twenty, about 0.6 s less.** The account's Twenty id is kept in `~/.logCli/twitter/<account>/session.json` (not a secret), so the X Chat PIN is fetched at the same time as the account row. The session is written back only when the state or a cookie changed, or once an hour (`SESSION_REWRITE_MS`), instead of on every read.
- **Commands load only when run (2026-10-30).** `bin/log.ts` used to import all 60 commands and their libraries (about 770 ms) before running one. It now looks the command up in `src/cli/runner/helpers/commandIndex.ts`, which `bun run docs:build` writes from `COMMANDS` and `check:docs` keeps in step, and imports only that command's module (`runFast`, `src/cli/runner/client.ts`). Help and unknown commands still load the whole catalog. That is the pattern OpenCode moved to for its CLI (anomalyco/opencode PR 27800). The Twenty client's 3.6 MB type map is now `types.json` (132 ms → 12 ms to load), linked on the first query instead of at import (105 ms), written that way by the generator (`scripts/twenty/lightenTwentyClient.mjs`). A command now starts in about 310 ms instead of 765 ms. Bun's compiled bytecode build (`bun build --compile --bytecode`) would cut parsing further, but it only works with the Bun version that built it, so it isn't used.

Six reads with nothing new, 10 s apart: the whole command p50 4.6 s, max 6.5 s (was p50 6.4 s, max 9.1 s); the engine p50 1.3 s. With commands loaded only when run: p50 3.9 s, max 6.0 s.

**No network for "who's waiting".** The engine records the account's user id in the store, and `log twitter chat watch --inbox` writes every message X pushes into it (each kept once, the sequence id left alone so the next sync still reads everything after it). The SessionStart hook reads the store and puts who wrote last into the agent's context in about 0.45 s, with nothing fetched (`storedInboxContext`, `src/inbox/watch`).
