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

## How it reaches LinkedIn (rule 96)

- **Transport:** one curl_cffi `Session` in `vendor/openLinkedinApi/open_linkedin_api/transport.py`, pinned to `IMPERSONATE` (`chrome150`). LinkedIn sees Chrome's TLS and HTTP/2 fingerprint and Chrome's own user agent, never Python `requests` or the library's fixed user agent. `bun run check:linkedinTransport` refuses anything else.
- **Pacing:** every call goes through the account's governor (`python/platformKit/engine.py`): at least 4 s between calls (12 s on average, never even), 120 an hour, 500 a day, and a 15-minute pause after LinkedIn throttles (HTTP 999 or 429).
- **Writes:** at most 10 a day per account (`WRITES_PER_DAY` in `src/directApi/engine/types.ts`).
- **Cookies:** `li_at` and `JSESSIONID`, from a browser signed in to linkedin.com, saved by `log linkedin cookies save`. Cookies LinkedIn refreshes are written back to Twenty.
- **No proxy:** the account calls LinkedIn from this machine, as the browser its cookies came from does.

## Next

1. Vendor LinkedIn's client under `vendor/<library>` and set `LIBRARY` in `python/linkedinApi/engine.py`.
2. Fill in `ping` there: call LinkedIn with the account's cookies and answer `loginState` from LinkedIn's own answer.
3. Add each family as an action in the engine, a command in `src/cli/linkedin` and its rules in `COMMAND_RULES`, with a `…Live` flag for anything that acts on LinkedIn.
