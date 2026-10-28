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
