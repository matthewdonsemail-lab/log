# Reddit

Made by `log new platform reddit`. Reddit is a platform of its own: every command is `log reddit <command> …`, and each one is an MCP tool named `reddit<Command>`.

## What is here

| Part | Where |
| --- | --- |
| The accounts | Twenty `socialAccounts` with platform `REDDIT` |
| The session (find the account, its gate, its engine, the answer back to Twenty) | `src/reddit/account/session`, on the shared `src/platformKit/session` |
| The commands | `src/cli/reddit/index.ts`: `log reddit session check` (MCP `redditSessionCheck`) |
| The engine | `python/redditApi/engine.py`, on the shared `python/platformKit/engine.py`; each account's governor is under `~/.logCli/reddit/<account>` |
| The client | not vendored yet |

## Next

1. Vendor Reddit's client under `vendor/<library>` and set `LIBRARY` in `python/redditApi/engine.py`.
2. Fill in `ping` there: call Reddit with the account's cookies and answer `loginState` from Reddit's own answer.
3. Add each family as an action in the engine, a command in `src/cli/reddit` and its rules in `COMMAND_RULES`, with a `…Live` flag for anything that acts on Reddit.
