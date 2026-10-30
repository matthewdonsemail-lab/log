# LinkedIn

Made by `log new platform linkedin`. LinkedIn is a platform of its own: every command is `log linkedin <command> …`, and each one is an MCP tool named `linkedin<Command>`.

## What is here

| Part | Where |
| --- | --- |
| The accounts | Twenty `socialAccounts` with platform `LINKEDIN` |
| The session (find the account, its gate, its engine, the answer back to Twenty) | `src/linkedin/account/session`, on the shared `src/platformKit/session` |
| The commands | `src/cli/linkedin/index.ts`: `log linkedin session check` (MCP `linkedinSessionCheck`) |
| The engine | `python/linkedinApi/engine.py`, on the shared `python/platformKit/engine.py`; each account's governor is under `~/.logCli/linkedin/<account>` |
| The client | `vendor/openLinkedinApi` |

## Next

1. Vendor LinkedIn's client under `vendor/<library>` and set `LIBRARY` in `python/linkedinApi/engine.py`.
2. Fill in `ping` there: call LinkedIn with the account's cookies and answer `loginState` from LinkedIn's own answer.
3. Add each family as an action in the engine, a command in `src/cli/linkedin` and its rules in `COMMAND_RULES`, with a `…Live` flag for anything that acts on LinkedIn.
