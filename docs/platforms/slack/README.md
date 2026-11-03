# Slack

Slack is a platform of its own: every command is `log slack <command> …`, and each one is an MCP tool named `slack<Command>` (a `…Live` twin for anything that acts on Slack).

## What is here

| Part | Where |
| --- | --- |
| The accounts | `socialAccounts` with platform `SLACK`, kept locally in `~/.logCli/localAccounts.json` (rule 97) or in Twenty |
| The session (find the account, its gate, its engine, the answer back to its row) | `src/slack/account/session`, on the shared `src/platformKit/session` |
| The commands | `src/cli/slack/index.ts`: `session check`, `workspaces`, `chats`, `read`, `watch`, `send`, and `cookies save` (terminal only) |
| The engine | `python/slackApi/engine.py`, on the shared `python/platformKit/engine.py`; each account's governor is under `~/.logCli/slack/<account>` |
| The client | `vendor/gabrielSlack` (Easy-Ez/gabriel-slack, MIT, pinned in `UPSTREAM`) |
| The live watcher | `log slack watch --inbox`, started by the inbox hook for every signed-in account (rule 123) |
| What Slack's own web client calls | `docs/platforms/slack/<domain>/`, built from inspect runs by `log facebook capture --docs` (rule 85) |

## The client: gabriel-slack

Picked from a GitHub code search for the internal names Slack's own web client uses (`client.getWebSocketURL`, `wss-primary.slack.com`, `user_change_subscribe_request`, `xoxc-` with `client.init`…) and a SubQ matrix over the 16 clients it found: gabriel-slack scored highest (19.2 of 30, 95%) as a Python library that signs in as the user with the browser's `d` cookie and holds Slack's websocket. The search and matrix are in `RESEARCH/SLACK_CLIENT_VENDOR_MATRIX_2026_11_03.md` in the Buzz workspace.

It is vendored as its Python package only (`vendor/gabrielSlack/gabriel`), at the commit in `UPSTREAM`, with its `LICENSE` and `README.md`. log uses:

| What | gabriel | Slack |
| --- | --- | --- |
| Which workspaces the cookie is signed in to | `core.auth.exchange_cookie(d)` | the cookie exchange, giving each team's `xoxc-` token |
| Open one workspace | `GabrielCore(auth=AuthOptions(cookie_d, workspace)).initialize()` | its team, user and token |
| Who the account is | `core.auth.test()` | `auth.test` |
| DMs and group DMs | `core.call_web_api("conversations.list", types=im,mpim)` | `conversations.list` |
| A chat's messages | `core.call_web_api("conversations.history")`, paged by cursor | `conversations.history` |
| Names | `core.call_web_api("users.info")` | `users.info` |
| Send | `core.call_web_api("chat.postMessage")` | `chat.postMessage` |
| Live events | `core.on_raw_frame`, `core.connect()` | `wss-primary.slack.com` (message, user_typing, im_marked, reactions, drafts, presence) |

gabriel doesn't call `client.init`, `client.boot`, `drafts.*`, `messages.list` or `client.dms`, which Slack's web client does: log doesn't need them yet.

Errors come back as `GabrielError` with a code: `AUTH_DEAD` is `sessionDead` (loggedOut), `RATE_LIMITED` is `rateLimited` and stops the run (rule 94), anything else is `slack<Code>`.

## Saving an account

The `d` cookie (`xoxd-…`) from a browser signed in to app.slack.com is the whole session: the engine exchanges it for each workspace's token every run.

- **From a browser log already holds:** `log inspect start --account <a>` on the account's AdsPower profile, sign in, open a workspace, then stop the session: the cookies are saved to the account's row.
- **By hand:** `log slack cookies save --account <name> [--workspace <domain>]` in a terminal. A masked Clack prompt asks for `d`, never a flag and never printed. It is checked with Slack before anything is saved, then written to the local accounts file (a new row) or the account's row (its `d` replaced, the other cookies kept).

## Workspaces

One `d` cookie can be signed in to many workspaces. `log slack workspaces` lists them. `chats`, `read` and `send` take `--workspace <domain>`; without it they pick the only one, or answer `workspaceNeeded` with the list. `watch` without `--workspace` opens every one.

## How it reaches Slack

- **Pacing:** every call goes through the account's governor (`python/platformKit/engine.py`). A message on several lines goes out one per line (rule 90), each its own engine call, with matt's own gap between them.
- **Writes:** `send` is the only write. It is a dry run unless `--live` with `--approvedBy` (rule 8), and its copy is read for AI artifacts first (rule 111).
- **No proxy, no browser:** the account calls Slack from this machine.
- **Transport:** gabriel uses httpx and websockets as published. It is not yet moved to curl_cffi the way twikit (rule 81) and openLinkedinApi (rule 102) were.
