# LinkedIn

Made by `log new platform linkedin`. LinkedIn is a platform of its own: every command is `log linkedin <command> …`, and each one is an MCP tool named `linkedin<Command>`.

## What is here

| Part | Where |
| --- | --- |
| The accounts | Twenty `socialAccounts` with platform `LINKEDIN` |
| The session (find the account, its gate, its engine, the answer back to Twenty) | `src/linkedin/account/session`, on the shared `src/platformKit/session` |
| The commands | `src/cli/linkedin/index.ts`: `log linkedin session check` (MCP `linkedinSessionCheck`) |
| The engine | `python/linkedinApi/engine.py`, on the shared `python/platformKit/engine.py`; each account's governor is under `~/.logCli/linkedin/<account>` |
| The client | `vendor/openLinkedinApi` (open-linkedin-api, pinned in `UPSTREAM`) |

## How it reaches LinkedIn (rule 102)

- **Transport:** one curl_cffi `Session` in `vendor/openLinkedinApi/open_linkedin_api/transport.py`, pinned to `IMPERSONATE` (`chrome150`). LinkedIn sees Chrome's TLS and HTTP/2 fingerprint and Chrome's own user agent, never Python `requests` or the library's fixed user agent. `bun run check:linkedinTransport` refuses anything else.
- **Pacing:** every call goes through the account's governor (`python/platformKit/engine.py`): at least 4 s between calls (12 s on average, never even), 120 an hour, 500 a day, and a 15-minute pause after LinkedIn throttles (HTTP 999 or 429).
- **Writes:** at most 10 a day per account (`WRITES_PER_DAY` in `src/directApi/engine/types.ts`).
- **Cookies and the browser behind them:** `log linkedin cookies save` reads one www.linkedin.com request copied as cURL from Chrome's DevTools (Network, right-click, Copy, Copy as cURL) off the clipboard, then clears it. Every cookie it carries goes to Twenty (`li_at`, `JSESSIONID`, and the browser's own `bcookie`, `bscookie`, `li_rm`, `lidc` and the rest), and its headers (user agent, client hints, language, `x-li-track`) go to `~/.logCli/linkedin/<account>/browser.json`. Every call then carries them all, with Voyager's own `accept`, `x-li-lang`, `x-restli-protocol-version` and `csrf-token`. Cookies LinkedIn refreshes are written back to Twenty; one LinkedIn deletes is never written back.
- **Why:** on 2026-11-03 and 2026-11-04, cookies saved as `li_at` and `JSESSIONID` alone, sent with curl_cffi's default macOS Chrome headers, were accepted once and then ended by LinkedIn within 12 seconds: its answer to the next `/voyager/api/me` deleted `li_at`, `li_a` and `liap` and set Cloudflare's `__cf_bm`. A session arriving without its browser's identity looks stolen.
- **Refusals before anything is sent:** the engine never calls LinkedIn for a session missing `bcookie`, `bscookie` or the saved user agent (`browserIdentityMissing`), and calls a session LinkedIn ended by deleting `li_at` `sessionRevoked`. Each check's answer carries `linkedinAnswer`: the cookie names sent, the browser headers used, the cookies LinkedIn set or deleted (names only) and any redirect.
- **Desktop only:** `log linkedin cookies save` refuses a request copied from a phone browser (a phone user agent, `sec-ch-ua-mobile: ?1`, or an iOS or Android platform), because log reaches LinkedIn as desktop Chrome and a phone user agent over it ends the session. On 2026-11-06 a request copied with Chrome's device toolbar on saved an iPhone user agent, and LinkedIn deleted `li_at` on the next check (HTTP 302).
- **No proxy:** the account calls LinkedIn from this machine, as the browser its cookies came from does.

## Next

1. Vendor LinkedIn's client under `vendor/<library>` and set `LIBRARY` in `python/linkedinApi/engine.py`.
2. Fill in `ping` there: call LinkedIn with the account's cookies and answer `loginState` from LinkedIn's own answer.
3. Add each family as an action in the engine, a command in `src/cli/linkedin` and its rules in `COMMAND_RULES`, with a `…Live` flag for anything that acts on LinkedIn.
