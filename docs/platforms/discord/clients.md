# Discord: the clients GitHub has, and how much of what we found each one already does

The 7 user-account Discord clients the GitHub search turned up (`githubSearch.md`) were shallow-cloned on 2026-10-28 into `~/.buzz/REPOS/discordClients/`, not committed. Each was searched for the 66 things our inspect runs found (`README.md`, `background/*.md`), in four areas, by `~/.buzz/RESEARCH/DISCORD_CLIENT_VENDOR_MATRIX/coverage.py` (raw: `coverage.json`). The gaps the pattern search reported for the leading clients were then checked by hand.

## The count

| Client | Language | Watch (18) | Read and send (8) | Sign in (6) | Background calls (34) | All (66) | Last push |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [Merubokkusu/Discord-S.C.U.M](https://github.com/Merubokkusu/Discord-S.C.U.M) | Python | 17 | 7 | 4 | 9 | 37 | 2024-03-25 |
| [chojs23/concord](https://github.com/chojs23/concord) | Rust | 16 | 7 | 3 | 7 | 33 | 2026-10-23 |
| [sparklost/endcord](https://github.com/sparklost/endcord) | Python | 18 | 7 | 3 | 4 | 32 | 2026-10-28 |
| [HuyaneMatsu/hata](https://github.com/HuyaneMatsu/hata) | Python | 17 | 7 | 0 | 7 | 31 | 2026-10-21 |
| [DiscordMessenger/dm](https://github.com/DiscordMessenger/dm) | C++ | 15 | 7 | 1 | 4 | 27 | 2026-10-03 |
| [uowuo/abaddon](https://github.com/uowuo/abaddon) | C++ | 14 | 6 | 2 | 2 | 24 | 2026-09-09 |
| [Badim41/DiscordUserAPI](https://github.com/Badim41/DiscordUserAPI) | Python | 14 | 4 | 0 | 0 | 18 | 2026-10-20 |

Corrected by hand from the pattern search: Discord-S.C.U.M reads history (`discum/messages/messages.py` `getMessages`, `?limit=&before=`), and endcord resumes the socket (`endcord/gateway.py` `resume()`, `resume_gateway_url`) and reads the DM list from READY's `private_channels`.

## What each of the three Python ones has and lacks

| | Discord-S.C.U.M | endcord | hata |
| --- | --- | --- | --- |
| Gateway, `zlib-stream`, identify, heartbeat, resume, READY | yes | yes | yes |
| `MESSAGE_CREATE`, `TYPING_START`, `MESSAGE_REACTION_ADD`, `MESSAGE_ACK` | yes | yes | yes |
| `PASSIVE_UPDATE_V2` | no | yes | no |
| `SESSIONS_REPLACE` | yes | yes | yes |
| History (`before` + `limit`) | yes | yes | yes |
| Send (`nonce`), ack, typing, profile | yes | yes | yes |
| `mobile_network_type` on a send | no | no | no |
| `auth/login`, captcha | yes | yes | no (a bot library) |
| `mfa/totp` | yes | no | no |
| `settings-proto` | no | yes | no |
| Shape | a library (`discum`) | a terminal app; `endcord/gateway.py`, `discord.py`, `auth.py` are its client | a bot library |
| Transport | `requests`, `websocket-client` 0.59 | `websocket-client` | `aiohttp` |
| Size | 78 code files | 53 code files | 1362 code files |

## Where it leaves us

- **The watch** (one gateway socket, every `MESSAGE_CREATE` to someone else) is done in Discord-S.C.U.M, endcord and hata alike. endcord is the only one with `PASSIVE_UPDATE_V2` and is kept up to date (pushed the day we searched); Discord-S.C.U.M hasn't been pushed since March 2024.
- **Read and send** (history paging, a send with a `nonce`, ack, typing) are in all three Python ones. None sends `mobile_network_type`, which the web client does.
- **Sign-in** is in Discord-S.C.U.M and endcord; only Discord-S.C.U.M does two-step. Our account is signed in by matt in the browser, so the client would carry the token from the account's session.
- **The background calls** (experiments, quests, billing, science…) are mostly the web client's own; no client does many of them, and nothing we do depends on them.
- concord (Rust) covers about as much as the Python ones, and is the one to read when the web client's exact headers matter.
