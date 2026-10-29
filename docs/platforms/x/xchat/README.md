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
