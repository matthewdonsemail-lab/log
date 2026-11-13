# console

The local console: this machine's log.db, MCP, accounts, usage, events, AI client config and settings, read in the terminal, as JSON per screen, or in the web console on loopback with no sign-in.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 55). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Current scope

This guide describes the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.

## The tools in this guide

| Tool | What it does |
|---|---|
| `consoleStart` | Whether log.db is here and the MCP is running, how many accounts… |
| `consoleConnections` | Local accounts by platform with their session state |
| `consoleUsage` | Calls by kind over 1, 7 or 30 days, from platform reads and actions… |
| `consoleEvents` | The newest log.db events and inference calls, filtered by kind and… |
| `consoleAiClients` | The MCP config for this machine for Claude Code, Codex or opencode |
| `consoleSettings` | Where log.db, runs, accounts and settings live, each account's… |

## The work, step by step: console

From `skills/console/SKILL.md`.

## console

`log console` is the local console. Everything it shows is read on this machine: log.db, `~/.logCli/localAccounts.json`, each account's governor and the MCP config. There is no sign-in, no team and no billing locally; a team needs `log login`.

### Screens

One screen per web console nav item, in the same order, each backed by one loader in `src/console/<domain>/`:

| Screen | Terminal and MCP | Web (`log console --web`) | Loader |
|---|---|---|---|
| Start | `consoleStart` / `log console start` | `/console/start` | `src/console/start` |
| Connections | `consoleConnections` / `log console connections` | `/console/connections` | `src/console/connections` |
| Usage | `consoleUsage` { days: 1, 7 or 30 } | `/console/usage` | `src/console/usage` |
| Events | `consoleEvents` { kind, status, page, pageSize } | `/console/events` | `src/console/events` |
| AI clients | `consoleAiClients` { client } | `/console/mcp` | `src/console/aiClients` |
| Settings | `consoleSettings` | `/console/settings` | `src/console/settings` |

Every screen takes `--json`; the MCP tools return that JSON. Teams and Subscription say "local: no team or billing" and point to `log login`.

### The loop

1. **Read the screen that answers the question.** Use the MCP tool (`consoleStart`, `consoleEvents` …). It reads only; it never signs in, sends or resets anything.
2. **Act through the command it names.** Connections lists accounts and their session state; checking or signing one in is `log <platform> session check` or `log <platform> cookies save`, which the interactive console runs for you through the same code as `log launch`.
3. **The terminal console** is `log console` (or `log launch`, Console). It needs a terminal, so an agent reads the screens instead.
4. **The web console** is `log console --web [--port <n>] [--noOpen]`. It serves the built site (`site/apps/web/dist`) on 127.0.0.1 (port 7338 by default), answers `/api/console/*` from the same loaders, and opens `/console/start`. The page knows it is local because the server injects `window.logConsoleMode = "local"` into the page, and `/api/console/mode` answers `{ mode: "local" }`; it then skips the sign-in and team redirects. If the site isn't built it prints the build command: `pnpm --dir site install && pnpm --dir site --filter web build`. For the Vite dev server, run `log console --web` first and start Vite with `LOG_CONSOLE_API=http://127.0.0.1:7338`: it marks the page local and proxies `/api/console` there.
5. **The hosted console** (a signed-in team, e.g. log.listeningkit.com) shows the same screens from the team's paired workspace: the control service relays `/api/v1/teams/<team>/console/*` to `log runtime connect`, which answers with the same `src/console/operations` (`connectionsList`, `credentialsSave`, `credentialsRead`, `accountCheck`, `accountSignIn`, `usage`, `events`). The site's `connectionsData`, `usageData` and `eventsData` pick local or hosted, so no screen cares which.
6. **What the web Connections screen changes.** Manage keys checks a key with its provider, then saves it to `~/.logCli/.env` on the workspace (AdsPower: its Local API `/status`; an empty AdsPower key keeps the held one). Check status runs `<platform>SessionCheck`, one at a time. Sign in with pasted cookies runs the platform's own `log <platform> cookies save` (X, LinkedIn, Slack); a Facebook username and password are saved where `log facebook connect` reads them and the browser check finishes the sign-in. Other platforms refuse rather than pretend.
7. **The Facebook browser check** is the Connections row's Browser check (and what a Facebook password sign-in opens). It drives the account's one browser through the console operations `browserState`, `browserOpen` (`inspectStart`, detached), `browserFrame` and `browserInput` (the live viewer and its gated `/input`), `browserAction` (back and reload through `inspectDo`, verify with a snapshot, resolve with `inspectDoLive signIn` from the saved login, link profile with `adsPower sync`), `browserSaveState` (`inspectDo saveState`, then the account shows as checked) and `browserClose` (`inspectDo stop`, only for a browser the dialog itself opened). Local: the browser is also open in the window on the screen, and the console shows its frames. Remote: voxl streams it when the runtime has one, frames otherwise; the stream descriptor goes only to the dialog and is journalled as `<redacted>`, like frames.
8. **Hosted widgets.** The control service's `/mcp` gives a client that advertises `io.modelcontextprotocol/ui` (remembered in a signed `Mcp-Session-Id`, nothing stored) the runtime's `ui://` resources (`uiResourcesList`, `uiResourceRead`), `browserView` with its `_meta.ui`, and the app-only tools (`browserViewStream`, `browserViewFrame`, `browserViewInput`, `browserViewDone`, `visibility: ["app"]`); other clients see none of them and are refused. App-tool answers are relayed, never recorded.

### Testing the hosted path

Pair a second runtime that cannot touch the real one: its own `LOG_RUNTIME_DIR` and its own log.db (`LOG_DB` or `LOG_INBOX_STATE` in the same temporary folder). `log runtime connect` refuses a `LOG_RUNTIME_DIR` without one. Point it at a local control service on a temporary SQLite `DATABASE_URL`, and never at the hosted one. Account checks and sign-ins are not run against real accounts while testing.

### Hard boundaries

- Loopback only. The server binds 127.0.0.1 and refuses any request whose Host, remote address or Origin isn't this machine, or which is cross-site, the same guard as the dev server's `/api/console/events`. Changes are same-origin JSON posts with the `x-log-console: 1` header.
- Keys never leave the workspace: answers carry only `hasValue` and a fixed mask, `credentialsRead` answers AdsPower's countries and URL only, secret arguments are journalled as `<redacted>`, and the control service stores none of it (rule 172).
- Governor resets stay with `governorReset` and matt's word (rule 168); sends stay with their own tools and gates.
- Parity is checked: `bun run check:consoleParity` fails when a web nav item has no terminal screen, or the two don't read the same `src/console/<domain>` loader.

## Every tool, in full

### `consoleStart`

Whether log.db is here and the MCP is running, how many accounts there are and when the last event came in.
The local console: this machine's status, accounts, usage, events, AI client config and settings, as an interactive terminal console, as JSON per screen, or as the web console served on loopback (--web)
log console start [--json]
Everything is local: no sign-in, no team. Each screen reads the same src/console loader as the web console's /api/console endpoint.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "console" }) (The local console: this machine's log.db, MCP, accounts, usage, events, AI client config and settings, read in the terminal, as JSON per screen, or in the web console on loopback with no sign-in).
AGENTS.md (log://agents): rules 47, 55, 134, 163, 168, 172, 177, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `consoleConnections`

Local accounts by platform with their session state.
The local console: this machine's status, accounts, usage, events, AI client config and settings, as an interactive terminal console, as JSON per screen, or as the web console served on loopback (--web)
log console connections [--platform <p>] [--json]
Everything is local: no sign-in, no team. Each screen reads the same src/console loader as the web console's /api/console endpoint.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "console" }) (The local console: this machine's log.db, MCP, accounts, usage, events, AI client config and settings, read in the terminal, as JSON per screen, or in the web console on loopback with no sign-in).
AGENTS.md (log://agents): rules 47, 55, 134, 163, 168, 172, 177, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `consoleUsage`

Calls by kind over 1, 7 or 30 days, from platform reads and actions to decisions and media.
The local console: this machine's status, accounts, usage, events, AI client config and settings, as an interactive terminal console, as JSON per screen, or as the web console served on loopback (--web)
log console usage [--days <1|7|30>] [--json]
Everything is local: no sign-in, no team. Each screen reads the same src/console loader as the web console's /api/console endpoint.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "console" }) (The local console: this machine's log.db, MCP, accounts, usage, events, AI client config and settings, read in the terminal, as JSON per screen, or in the web console on loopback with no sign-in).
AGENTS.md (log://agents): rules 47, 55, 134, 163, 168, 172, 177, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `consoleEvents`

The newest log.db events and inference calls, filtered by kind and status, a page at a time.
The local console: this machine's status, accounts, usage, events, AI client config and settings, as an interactive terminal console, as JSON per screen, or as the web console served on loopback (--web)
log console events [--kind <kind>] [--status <recorded|succeeded|failed|unknown>] [--page <n>] [--pageSize <n>] [--json]
Everything is local: no sign-in, no team. Each screen reads the same src/console loader as the web console's /api/console endpoint.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "console" }) (The local console: this machine's log.db, MCP, accounts, usage, events, AI client config and settings, read in the terminal, as JSON per screen, or in the web console on loopback with no sign-in).
AGENTS.md (log://agents): rules 47, 55, 134, 163, 168, 172, 177, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `consoleAiClients`

The MCP config for this machine for Claude Code, Codex or opencode.
The local console: this machine's status, accounts, usage, events, AI client config and settings, as an interactive terminal console, as JSON per screen, or as the web console served on loopback (--web)
log console aiClients [--client <claudeCode|codex|opencode>] [--json]
Everything is local: no sign-in, no team. Each screen reads the same src/console loader as the web console's /api/console endpoint.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "console" }) (The local console: this machine's log.db, MCP, accounts, usage, events, AI client config and settings, read in the terminal, as JSON per screen, or in the web console on loopback with no sign-in).
AGENTS.md (log://agents): rules 47, 55, 134, 163, 168, 172, 177, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `consoleSettings`

Where log.db, runs, accounts and settings live, each account's governor today and the web console's address.
The local console: this machine's status, accounts, usage, events, AI client config and settings, as an interactive terminal console, as JSON per screen, or as the web console served on loopback (--web)
log console settings [--json]
Everything is local: no sign-in, no team. Each screen reads the same src/console loader as the web console's /api/console endpoint.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "console" }) (The local console: this machine's log.db, MCP, accounts, usage, events, AI client config and settings, read in the terminal, as JSON per screen, or in the web console on loopback with no sign-in).
AGENTS.md (log://agents): rules 47, 55, 134, 163, 168, 172, 177, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From the current AGENTS.md (`log://agents`). Historical citations are consolidated; archived instructions do not override the active scope.

**Rule 30.** 2026-10-19 · Complete the authorized task. Do not repeatedly request confirmation already given. Distinguish implemented behavior, proposed contracts and unverified assumptions.

**Rule 38.** 2026-10-19 · Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless Matt raises them.

**Rule 39.** 2026-10-19 · Use only the scope, options and intent Matt stated or implied. Do not add unrelated alternatives to research, comparisons, plans or implementation.

**Rule 40.** 2026-10-19 · Do not propose physical infrastructure unless Matt asks. His available implementation scope is hosted/cloud environments and the tools already selected.

**Rule 41.** 2026-10-19 · Paid work must stay within the authorized task and spend. Ask before adding a paid operation he did not authorize; do not substitute a new paid provider implicitly.

**Rule 47.** 2026-10-20 · CLI, MCP, hooks and guides share the current instructions. Hosted product clients receive appropriately scoped product guidance, not a server owner's personal secrets or memories. A target design does not mean the current MCP/runtime dependencies have already migrated.

**Rule 55.** 2026-10-20 · Keep CLI commands, MCP catalog/tools, hooks and generated documentation aligned. Change their source and regenerate the affected surfaces; do not hand-edit generated guides.

**Rule 134.** 2026-11-04 · Existing workspace log.db is the native private record/coordination foundation. Preserve events, stable identities, chats/messages, attachments/interactions, claims/owners/cursors, queues/jobs, media/search and records/state. Keep current WAL/migration/version semantics and transaction boundaries; unknown events retain source payload and are surfaced for analysis. Only proven projections are rebuildable.

**Rule 163.** 2026-11-07 · Agent Log actions go through Log MCP tools; never work around a stale or unavailable MCP with shell Log commands or scratch clients. Terminal-only credential prompts remain for Matt. Expose discoverable command contracts through the existing Log catalog: search the job, get exact inputs, then call. Keep tool descriptions concise and accurate to the current implementation.

**Rule 168.** 2026-11-08 · Reset governor or browser-launch counts only when Matt explicitly asks, using the existing recorded reset command. A code/schema migration is not authorization to reset them.

**Rule 172.** 2026-11-11 · The selected persistent cloud workspace owns private accounts, credentials/sessions, messages and execution data in existing SQLite plus protected files. Central storage owns identity, team authorization, scoped grants and minimal routing/recovery metadata only. No durable central private payload/message catalog. Use paired outbound routing, fencing and uncertain-write reconciliation; one selected workspace per team in V1.

**Rule 177.** 2026-11-12 · Website and console errors show as toasts through the shared `@listeningkit/ui` toast, never inline under a field, in a form or on the page. A failed load toasts its error and leaves only a neutral empty state with its Try again action. Errors from embedded widgets (Clerk's form) are hidden in place and raised as toasts.
