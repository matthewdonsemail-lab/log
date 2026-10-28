# Discord: what GitHub already has on the calls we found

Searched 2026-10-28 with GitHub's code search API (`/search/code`, two at a time, backing off on 403), for every internal call and gateway event the inspect runs of `sourcedandsoldtothehighestbidder` recorded (`README.md`, `background/*.md`). 49 searches, 12 by event or call shape and 37 by path. Stars and last push are from `GET /repos/<repo>` the same day.

## The repos that come up across most of them

| Repo | Stars | Last push | What it is | Hits |
| --- | --- | --- | --- | --- |
| [discord-userdoccers/discord-userdoccers](https://github.com/discord-userdoccers/discord-userdoccers) | 427 | 2026-10-10 | Unofficial docs of the user API: the gateway, `zlib-stream`, ack, experiments, conditional login, location metadata | 18 |
| [moonlight-mod/moonlight](https://github.com/moonlight-mod/moonlight) | 354 | 2026-10-05 | A client mod; its route list holds nearly every `@me` call we saw | 18 |
| [meowcorded/meowcord](https://github.com/meowcorded/meowcord) | 56 | 2026-10-21 | A self-hosted Discord clone: `auth/login`, `settings-proto/2`, invite 10006 | 19 |
| [spacebarchat/server](https://github.com/spacebarchat/server) | 2211 | 2026-10-19 | A rebuild of discord.com's backend: `settings-proto/2`, `auth/login`, error codes | 4 |
| [spacebarchat/missing-routes](https://github.com/spacebarchat/missing-routes) | 6 | 2026-10-27 | Every route defined in the discord.com client, compared with Spacebar's | 13 |
| [xhyrom/discord-datamining](https://github.com/xhyrom/discord-datamining) | 69 | 2026-10-28 | Discord's web builds, datamined | 10 |
| [Wumpus-Central/discrapper-canary](https://github.com/Wumpus-Central/discrapper-canary) | 42 | 2026-10-28 | Discord's own client chunks, archived: `PASSIVE_UPDATE_V2` | 2 |
| [doggybootsy/hidden-disc-docs](https://github.com/doggybootsy/hidden-disc-docs) | 213 | 2024-09-14 | Notes on hidden calls: metrics, science, affinities | 10 |

## User-account clients that already do what we need

The watch and send we found (one gateway socket, `MESSAGE_CREATE`, paging with `before`, `POST …/messages` with a `nonce`) are already done in these:

| Repo | Stars | Last push | Language | Has |
| --- | --- | --- | --- | --- |
| [chojs23/concord](https://github.com/chojs23/concord) | 1634 | 2026-10-23 | Rust | gateway `zlib-stream` (`src/discord/gateway.rs`), ack (`rest/read_state.rs`), send with `mobile_network_type` (`rest/messages.rs`), apex experiments |
| [sparklost/endcord](https://github.com/sparklost/endcord) | 1017 | 2026-10-28 | Python | login (`endcord/auth.py`), ack and profile `with_mutual` (`endcord/discord.py`) |
| [Merubokkusu/Discord-S.C.U.M](https://github.com/Merubokkusu/Discord-S.C.U.M) | 597 | 2024-03-25 | Python | gateway events and parsing (`discum/gateway/event.py`, `parse.py`), `SESSIONS_REPLACE`, affinities |
| [DiscordMessenger/dm](https://github.com/DiscordMessenger/dm) | 2303 | 2026-10-03 | C++ | ack, send with `mobile_network_type` |
| [uowuo/abaddon](https://github.com/uowuo/abaddon) | 2231 | 2026-09-09 | C++ | gateway `zlib-stream` |
| [HuyaneMatsu/hata](https://github.com/HuyaneMatsu/hata) | 187 | 2026-10-21 | Python | gateway event parsers, `SESSIONS_REPLACE` |
| [Badim41/DiscordUserAPI](https://github.com/Badim41/DiscordUserAPI) | 10 | 2026-10-20 | Python | send with `mobile_network_type` |

The Python ones are the ones that fit `python/discordApi` if a client is vendored (`README.md`, Next 3): endcord is kept up today, and Discord-S.C.U.M has the gateway parsing but hasn't been pushed since 2024.

## Each path

The total is GitHub's count of matching files; the repos are the first three it returned. A bare path (`/typing`, `/notes/`, `/integrations`, `/promotions`, `/entitlements`) matches far more than Discord, so those totals don't mean anything.

| Path | Files | First repos |
| --- | --- | --- |
| `apex/experiments` | 30 | chojs23/concord, AidenNT/fastcord, SakuraCordApp/SakuraCord |
| `applications/public` | 385 | coollabsio/coolify, AnikBeris/Automatic-execution-of-Discord-tasks, yapfast/yapfast |
| `auth/conditional/start` | 23 | aiko-chan-ai/DiscordBotClient, navilansanthanakrishnan/discord-mcp, moonlight-mod/moonlight |
| `auth/location-metadata` | 213 | many account tools, chen08209/FlClash |
| `/api/v9/auth/login` | 301 | spacebarchat/server, sparklost/endcord, meowcorded/meowcord |
| `channels/<id>/messages?before=&limit=` | 224 | mak448a/Qtcord, MattX/Milton, BornTactical/Discord |
| `channels/<id>/messages/<id>/ack` | 52 | sparklost/endcord, chojs23/concord, DiscordMessenger/dm |
| `nonce` + `mobile_network_type` (a send) | 124 | chojs23/concord, DiscordMessenger/dm, Badim41/DiscordUserAPI |
| `content-inventory/users/@me` | 31 | jiamingc/ublock-filters, lathienvu-yt/voidcord, moonlight-mod/moonlight |
| `dismissible-content/arbitrate` | 5 | meowcorded/meowcord, spacebarchat/missing-routes, kmljkjj/discord-canary-scraper |
| `/api/v9/games/autocomplete` | 2 | nf4z/disx, SakuraCordApp/SakuraCord |
| `games/detectable/exclusions` | 29 | creikey/fastcord, discord-userdoccers, crouton-labs/capture |
| `/powerups` | 556 | tldraw/tldraw, crouton-labs/capture, ignite-chat/ignite-frontend |
| `migrate-command-scope` | 29 | discord-userdoccers, ignite-chat/ignite-frontend, TourIT-NL/Ultimate-Discord-Selfbot |
| `top-emojis` | 84 | ignite-chat/ignite-frontend, llsc12/Paicord |
| `invites/<code>` 404, 10006 `Unknown Invite` | 272 | discord/discord-api-docs (`opcodes-and-status-codes.mdx`), spacebarchat/server, discord-jda/JDA |
| `/api/v9/metrics` | 22 | asdfzxcvbn/DiscordNoTrack, doggybootsy/hidden-disc-docs |
| `/api/v9/science` | 382 | mostly account tools; asdfzxcvbn/DiscordNoTrack blocks it |
| `/api/v9/tokens` | 0 | nothing |
| `partner-sdk/storefront-config` | 21 | ignite-chat/ignite-frontend, creikey/fastcord, crouton-labs/capture |
| `quests/decision` | 52 | Masterain98/discord-quest-helper, 36go/OrbWarden, moonlight-mod/moonlight |
| `quests/@me` | 358 | Masterain98/discord-quest-helper, DIYgod/RSSHub |
| `published-listings/skus` | 53 | Xyraniz/Kryndel, moonlight-mod/moonlight, doggybootsy/hidden-disc-docs |
| `users/@me/affinities/guilds` | 103 | account tools, V4NSH4J/discord-mass-DM-GO |
| `users/@me/affinities/users` | 86 | account tools |
| `billing/checkout-recovery` | 25 | moonlight-mod/moonlight, creikey/fastcord, crouton-labs/capture |
| `billing/payment-sources` | 1616 | mostly token grabbers |
| `billing/subscriptions` | 1350 | kylepelham/discord-self.js, rpie/discord.why |
| `billing/user-offer` | 35 | moonlight-mod/moonlight, celenityy/BadBlock, creikey/fastcord |
| `collectibles-marketing` | 54 | ublock filter lists, moonlight-mod/moonlight |
| `mfa/webauthn/credentials` | 48 | moonlight-mod/moonlight, ignite-chat/ignite-frontend, crouton-labs/capture |
| `referrals/eligibility` | 23 | moonlight-mod/moonlight, crouton-labs/capture, creikey/fastcord |
| `saved-messages` | 144 | moonlight-mod/moonlight, creikey/fastcord, getopenpost/openpost |
| `settings-proto/2` | 110 | spacebarchat/server (`routes/users/@me/settings-proto/2.ts`), SwiftcordApp/DiscordKit, itschasa/Discord-Backup |
| `users/@me/survey` | 36 | moonlight-mod/moonlight, bluemods/Bluecord |
| `unclaimed-games` | 19 | crouton-labs/capture, ignite-chat/ignite-frontend, creikey/fastcord |
| `users/<id>/profile?with_mutual` | 132 | sparklost/endcord, rpie/discord.why |
| `assets/version.stable.json` | 15 | Merubokkusu/Discord-S.C.U.M, creikey/fastcord, discummer/discum-remaded |
| `status.discord.com …/scheduled-maintenances/upcoming.json` | 237 | Merubokkusu/Discord-S.C.U.M, Milkshiift/GoofCord |

## Gateway events

| Event | Files | First repos |
| --- | --- | --- |
| `gateway.discord.gg` + `compress=zlib-stream` | 15008 | uowuo/abaddon, ouwou/acheron, kordlib/kord, Discord-S.C.U.M, chojs23/concord |
| `MESSAGE_CREATE` + `TYPING_START` + `MESSAGE_ACK` | 356 | Discord-S.C.U.M (`discum/gateway/event.py`), HuyaneMatsu/hata, fluxerapp/fluxer |
| `SESSIONS_REPLACE` | 1240 | Discord-S.C.U.M (`discum/gateway/parse.py`), HuyaneMatsu/hata |
| `PASSIVE_UPDATE_V2` | 148 | Wumpus-Central/discrapper-canary (Discord's own chunks), Wumpus-Central/discord-mobile-datamining |

## What it changes

Nothing we found is new to GitHub: every call has someone who documented it or calls it, and `discord-userdoccers` documents most of them. What we have that they don't is the timing of one real round trip (`README.md`: send 200, echo +0.44 s, the bot's reply +4.2 s) and each call tied to the step that fired it.
