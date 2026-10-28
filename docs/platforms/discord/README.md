# Discord

Made by `log new platform discord`. Discord is a platform of its own: every command is `log discord <command> …`, and each one is an MCP tool named `discord<Command>`.

## What is here

| Part | Where |
| --- | --- |
| The accounts | Twenty `socialAccounts` with platform `DISCORD` (added 2026-10-28 by `scripts/twenty/twentySetup.mjs`). First account: `sourcedandsoldtothehighestbidder`, AdsPower profile `k1ifqe1s` |
| The session (find the account, its gate, its engine, the answer back to Twenty) | `src/discord/account/session`, on the shared `src/platformKit/session` |
| The commands | `src/cli/discord/index.ts`: `log discord session check` (MCP `discordSessionCheck`) |
| The engine | `python/discordApi/engine.py`, on the shared `python/platformKit/engine.py`; each account's governor is under `~/.logCli/discord/<account>` |
| The client | not vendored yet |
| Proxy | none, like Reddit (matt, 2026-10-28): the gate reads this machine's own exit and the profile's timezone follows it |

## What the inspect found (2026-10-28, `log inspect` on `sourcedandsoldtothehighestbidder`)

Runs `~/.logCli/runs/inspect/20261028T062914_…` (sign-in, chats, paging) and `20261028T065202_…` (the gateway push).

### Signing in

- `discord.gg` is the invite domain. `discord.gg/login` reads `login` as an invite code: `GET /api/v9/invites/login` answers **404 `Unknown Invite`** (code 10006) and the page says "Invite Invalid". The login page is `https://discord.com/login`.
- matt typed his details himself; pressing Log In sent `POST /api/v9/auth/login` → **200**, and the page went to `discord.com/app`, then `discord.com/channels/@me` ("Friends"). No captcha, no two-step on this account.
- The page-state map calls Discord's login page `loginForm`, a Facebook state whose resolver is Facebook's auto sign-in. It does not apply here; the sign-in is matt's.

### Finding a chat

- Ctrl+K opens the Quick Switcher (`combobox "Quick Switcher"`). Typing a name searches what the client already holds: the only call it makes is `GET /api/v9/games/autocomplete?q=<text>`. People, DMs and channels come back as `option` rows (`Jilly, User, Jilly#0902`); Enter opens the selected one.

### Reading a chat's history

```
GET /api/v9/channels/<channel_id>/messages?before=<oldest loaded message id>&limit=20
```

Scrolling up (PageUp in the chat) fires it once the loaded messages run out. It answers the 20 messages before `before`, newest first; the oldest id in that answer is the next `before`. Fewer than 20 back means the start of the chat.

### Sending

```
POST /api/v9/channels/<channel_id>/messages
  {"content": "...", "nonce": "<snowflake>", "tts": false, "flags": 0, "mobile_network_type": "unknown"}
→ 200 {"id": "...", "channel_id": "...", "author": {...}, "timestamp": "...", ...}
```

The answer's `id` is the message. In a server channel a mention is `<@user_id>` in `content` and the user in `mentions` (VIBE BOT in vibe coders university #bot-help, `<@1458086860571017340>`).

### How a reply comes in: the gateway pushes it

Discord never polls. One WebSocket, `wss://gateway.discord.gg/?encoding=json&v=9&compress=zlib-stream`, carries everything the account sees, as JSON events compressed in one continuous zlib stream (one inflater per socket; a message ends with `00 00 ff ff`). Each event is `{"op", "t", "s", "d"}`: `t` names it, `s` is its sequence.

One real round trip, DM with Jilly (channel `1555254123148873869`), 28 Oct:

| UTC | | |
|---|---|---|
| 06:55:08.337 | HTTP | `POST …/messages` → 200, our message |
| 08.774 (+0.44 s) | RECV | `MESSAGE_CREATE` our own message, echoed back |
| 08.974 (+0.64 s) | RECV | `TYPING_START` Jilly (user `1540556850045521930`) |
| 09.117 (+0.78 s) | RECV | `MESSAGE_REACTION_ADD` Jilly on our message |
| 11.600 (+3.3 s) | RECV | `TYPING_START` |
| **12.521 (+4.2 s)** | RECV | **`MESSAGE_CREATE` Jilly's reply** ("Through AgentConnect's Discord integration…") |
| 15.853 (+7.5 s) | RECV | `MESSAGE_ACK` the client marks it read |

The client then fetches the sender's profile (`GET /api/v9/users/<id>/profile`) to draw it, and acks (`POST …/messages/<id>/ack`). Other events seen on the same socket: `MESSAGE_UPDATE`, `MESSAGE_DELETE`, `PRESENCE_UPDATE`, `PASSIVE_UPDATE_V2`, `CHANNEL_UPDATE`, `THREAD_CREATE`, `VOICE_STATE_UPDATE`, `SESSIONS_REPLACE`, and the heartbeat (`op 1` sent, `op 11` back).

So a Discord watch is the X Chat watch again (`docs/platforms/x/xchat/live.md`): one socket, push, nothing polled. A `MESSAGE_CREATE` whose `d.channel_id` is a DM and whose `d.author.id` isn't the account is a new message to answer.

### Recording it

`log inspect` now records every WebSocket frame, sent and received, into each step's `network.har` (`_webSocketMessages` on a `101` entry, the browser's own HAR shape; `python/browser/harRecorder.py` `SocketTap`, which inflates `zlib-stream` and redacts a token in the socket URL). Each frame is an exchange named for its event (`RECV ws MESSAGE_CREATE`) in `exchanges.json` / `exchanges.md`, beside the HTTP calls. A step's SubQ reading keeps the first 3 frames of each event and folds the rest into one count (`foldSocketFrames`), so Discord's hundreds of presence events don't drown it.

## On GitHub

Every call and event above was searched on GitHub (2026-10-28): `githubSearch.md`. All of them are known there; `discord-userdoccers/discord-userdoccers` documents most, and chojs23/concord, sparklost/endcord and Discord-S.C.U.M already run the gateway watch and the send.

## Next

1. A watch on the gateway: `log discord chat watch --account <a>` in the account's open browser (or a vendored client), each `MESSAGE_CREATE` to someone else handed to the inbox hook, as `log twitter chat watch --inbox` does.
2. Read and send as commands, on the two calls above, each in the account's open browser (rule 35), sending only with `--live`.
3. Vendor a client under `vendor/<library>` and fill in `ping` in `python/discordApi/engine.py` for a direct-API path, if matt wants one.
4. A `discordLogin` page state, so the hook stops offering Facebook's auto sign-in on Discord's login page.
