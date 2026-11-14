# How Discord works: the systems map

Read from Discord's own internal calls, never guessed (rules 73, 85): the 2026-10-28 inspect runs (sign-in, chats, paging, the gateway push) and the 2026-11-13 run `~/.logCli/runs/inspect/20261113T231616_deepman2` (hCaptcha, a refused password, the QR sign-in, the gateway sign-on, two sessions lost). Each call has its own doc beside this one, read by rea from the code that sends it.

## 1. One account, one token, many sessions

- The account's session is one **token** (discord.com localStorage `token`). Every REST call carries it in `Authorization`; the gateway carries it once, in IDENTIFY.
- A token belongs to the **client that signed in**. The browser that signed in says who it is on every call: `X-Super-Properties` (base64 JSON: os, browser, browser version, `client_build_number`, a per-launch `client_launch_id` and `launch_signature`), `X-Installation-Id`, `X-Discord-Timezone`, `X-Discord-Locale`, the `sec-ch-ua` set and Chrome's own TLS.
- Discord keeps a list of the account's sessions (the client that signed in, where, when). Signing in anew adds one; a token that is revoked answers **401** to REST and **close 4004** to the gateway.

## 2. Signing in: three ways in, and what stops each

| Way | Calls, in order | What decides |
| --- | --- | --- |
| Email and password | `POST /api/v9/auth/login` {login, password, undelete, login_source, gift_code_sku_id} | 200 `{token}`; 200 `{mfa: true, ticket}` then `POST /api/v9/auth/mfa/totp` {code, ticket}; **400 `captcha-required`** (hcaptcha sitekey, rqdata, rqtoken); 400 code 50035 `INVALID_LOGIN` |
| hCaptcha | `checksiteconfig`, the challenge, `checkcaptcha` → `pass: true` and a pass token valid 120 s; then `auth/login` again with it | a person solves it (log does not automate captchas) |
| QR code | `wss://remote-auth-gateway.discord.gg/?v=2`: hello → init (the browser's public key) → nonce_proof → pending_remote_init (the QR fingerprint) → the phone scans → pending_ticket → pending_login {ticket} → `POST /api/v9/users/@me/remote-auth/login` {ticket} → `encrypted_token`, decrypted with the browser's key | the phone app, signed in already |

On 2026-10-28 the password went straight through (no captcha). On 2026-11-13 the same page asked for hCaptcha first, refused the password typed from `log discord secrets` (`INVALID_LOGIN`), and the account got in by QR.

## 3. The gateway: one socket carries everything live

`wss://gateway.discord.gg/?encoding=json&v=9&compress=zlib-stream`. Frames are one continuous zlib stream (one inflater per socket, a message ends `00 00 ff ff`); small control frames can arrive as plain JSON.

What the browser does, to the second (2026-11-13):

| s | Direction | Op | What |
| --- | --- | --- | --- |
| 0.0 | ← | 10 HELLO | `heartbeat_interval` 41250 ms |
| 0.0 | → | 2 IDENTIFY | token, `capabilities` 1734653, `properties` (as X-Super-Properties plus `installation_id`, `is_fast_connect`, `gateway_connect_reasons: AppSkeleton`, `client_app_state: focused`), `presence` {online, since 0}, `compress: false`, `client_state` {guild_versions: {}} |
| 1.4 | ← | 0 READY | the account, its guilds, DMs, read state (256 KB) |
| 1.5 | → | 4 | voice state: nowhere, self-muted, `flags` 2 |
| 1.5 | → | 41 | `initialization_timestamp`, `session_id` (the launch's heartbeat session id), `client_launch_id` |
| 1.5 | → | 40 | **the web client's heartbeat**: `{seq, qos: {active: true, ver: 31, reasons: [foregrounded]}}` |
| 4.8 | ← | 11 | heartbeat ACK |
| 25.9 | → | 40 | heartbeat again |

The web client never sends the classic op 1 heartbeat; it sends op 40 with its QoS state, and Discord ACKs it with op 11. Events after READY arrive as op 0 with `t`: MESSAGE_CREATE, MESSAGE_UPDATE, PRESENCE_UPDATE, VOICE_STATE_UPDATE, CHANNEL_CREATE…

## 4. REST: what the client asks for

- Reading: `GET /channels/<id>/messages?before=<id>&limit=20`, newest first; fewer than 20 is the start.
- Sending: `POST /channels/<id>/messages` {content, nonce, tts, flags, mobile_network_type}; the answer's `id` is the message; the gateway echoes it as MESSAGE_CREATE ~0.4 s later.
- On start the web client also asks for its account bits (experiments, entitlements, quests, promotions, affinities, badges, billing, survey). `GET /users/@me/survey` answered **429** with `retry_after` 81170 s on 2026-11-13: a per-account limit on that one route, not on the account.

## 5. What Discord watches

- `POST /api/v9/science` and `POST /api/v9/metrics/v2`: the client reports every event it has (`open_modal`, `captcha_event`, `network_action_user_login`, `login_successful`, `client_heartbeat`, `session_start_client`, `quest_content_viewed`…), each with the launch's ids and a sequence number. A client that never reports looks unlike the browser.
- Every call carries the same launch (`client_launch_id`, `launch_signature`, `client_heartbeat_session_id`) across REST, the gateway and science.

## 6. What ended our sessions

| When (UTC) | What we did | What came back |
| --- | --- | --- |
| 2026-11-12 16:52 → 19:34 | the watcher held the gateway through endcord, identifying as **Discord's desktop app** ("Discord Client", Electron UA, `client_version 1.0.156`, no build number, endcord's capabilities, op 1 heartbeats) with a token the Chrome web client signed in | 119 messages pushed, then the gateway closed; every IDENTIFY after it: closed before READY (238 tries, 30 h, until the hook was fixed) |
| 2026-11-13 23:19:20 | the browser closed; the new token saved; `GET /users/@me` 200 | loggedIn |
| 23:19:25 | the hook started the watcher: endcord's gateway, the 11-11 browser's properties (build 670026), endcord's capabilities, `client_app_state: unfocused`, op 1 heartbeats, Python's TLS | |
| 23:19:29 | | REST 401; the token is revoked |

Both times the token died while a client that wasn't the browser held the gateway with it. Which difference Discord reacts to isn't proven by these two runs: the client identity, the capabilities, the heartbeat op, the TLS, or a second login landing on a token right after a refused password. Stage 2 is built to tell them apart.

## 7. Stages, each built on the one before

1. **Understand** (this page, and each call's doc).
2. **Hold a session** as the browser does: the identity recorded from the account's own browser (`python/discordApi/browserIdentity.py`), REST over curl_cffi as Chrome (`browserRest.py`), the gateway as the web client (`browserGateway.py`: IDENTIFY, then op 4, 41, 40, heartbeats on op 40). No recording, no call (`templateStale`). Tested by session checks at 1, 5 and 15 minutes; the first 401 or 4004 stops it.
3. **Read and watch** on top of 2.
4. **Send** on top of 3.
5. **Sign in again** when a session dies: the account's browser, the saved login, a person for the captcha or the QR.
