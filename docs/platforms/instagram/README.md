# Instagram

Made by `log new platform instagram`. Instagram is a platform of its own: every command is `log instagram <command> …`, and each one is an MCP tool named `instagram<Command>`.

## What is here

| Part | Where |
| --- | --- |
| The accounts | Twenty `socialAccounts` with platform `INSTAGRAM` |
| The session (find the account, its gate, its engine, the answer back to Twenty) | `src/instagram/account/session`, on the shared `src/platformKit/session` |
| The commands | `src/cli/instagram/index.ts`: `log instagram session check` (MCP `instagramSessionCheck`) |
| The engine | `python/instagramApi/engine.py`, on the shared `python/platformKit/engine.py`; each account's governor is under `~/.logCli/instagram/<account>` |
| The client | not vendored yet |

## Next

1. Vendor Instagram's client under `vendor/<library>` and set `LIBRARY` in `python/instagramApi/engine.py`.
2. Fill in `ping` there: call Instagram with the account's cookies and answer `loginState` from Instagram's own answer.
3. Add each family as an action in the engine, a command in `src/cli/instagram` and its rules in `COMMAND_RULES`, with a `…Live` flag for anything that acts on Instagram.
