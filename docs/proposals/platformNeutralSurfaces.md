# One platform-neutral capability set across the CLI, MCP and console

14 November 2026.

Status: proposal. Slice 1 is merged (PR #133). Every other slice is not built. The findings come from read-only audits of `main` on 13 and 14 November 2026; each claim names its file.

## Goal

Every capability is one thing, with one name, reachable the same way from the CLI, the MCP and the console. The platform is an input, never a default. Anything that runs over time is an XState machine (AGENTS.md rule 6). Adding a platform or a capability later must not need a new special case in shared code.

## What is wrong today (verified)

1. Facebook is the platform with no name: `toolBaseName` (`src/cli/runner/helpers/platforms.ts:3-5`) skips the prefix for the first platform, so 23 Facebook-only tools have generic names (`accounts`, `check`, `status`, `connect`, `capture` and so on).
2. Missing platforms fall back to Facebook (`platforms.ts:48-49, 72, 94`; `src/mcp/server/helpers/toolAnnotations.ts:21`).
3. Ten shared commands are filed under Facebook guide topics (`src/mcp/server/helpers/guides.ts`): `inspect`, `browsers`, `browser`, `adsPower`, `localAccount`, `login`, `logout`, `whoami` under `facebookBrowser`; `flow`, `warmup` under `facebookFlows`.
4. Shared tool notes say Facebook (`src/mcp/server/helpers/toolsFromCommands.ts:85-86`).
5. On a non-Facebook login page the page state is `loginForm`, whose next step is Facebook's auto sign-in.
6. Signing in is not one capability. The console has `accountSignIn` and `browser*` operations (the browser ones Facebook only in the web UI); the CLI and MCP have `inspectStart` then `inspectDo stop`; the hosted relay has neither.
7. Closing the browser saves the session without checking it is signed in, so a signed-out browser overwrites a good session (`src/marketplace/socialAccount/client.ts:125-133`). The save's outcome never reaches the caller.
8. Check state lives outside a machine: "running" rows can be left behind (`src/console/accountCheck/machine.ts`), busy is enforced outside the machine, and `proofs`, `busy` and `shared` are module memory.
9. The console, `sessionsCheck` and `openBrowser` each have their own rule for which accounts may be checked.
10. The hosted relay lacks `sessionsCheck`, `instagramSessionCheck`, `slackSessionCheck`, and strips `next` from every result (`src/cli/runtime/index.ts:117`).
11. Shared machinery is named for Facebook: `log facebook capture --docs`, `check:facebookClientDocs`, the request-doc template, and shared code under `src/marketplace/`.

## Slices, in order

Each slice is its own PR onto `main`, small enough to review, with the repo's hooks passing. Do not start a slice until the one before is merged or stacked cleanly.

### Slice 1: the platform is never a default

- `toolBaseName`: remove the first-platform exception. Facebook tools become `facebookAccounts`, `facebookCheck`, `facebookStatus` and so on.
- Keep every old name working for one release as an alias that calls the new tool and says in its description "renamed to `<new name>`". Aliases are not listed to hosts that don't ask for them, so the model sees only the new names.
- Remove the Facebook fallbacks: `platformOfAccount` with no platform throws `accountPlatformMissing`; a command with no platform is `any`; `titleOf` has no default place.
- Regenerate docs, guides, skills and use cases (`bun run docs:build`, `bun run skills:build`). Update every use case that names an old tool.
- Done when: a script over `COMMANDS` finds no platform-specific command whose tool name lacks its platform, and `check:docs`, `check:useCases`, `check:specs` pass.

### Slice 2: guides and notes say "the platform"

- New shared guide topics: `accountBrowser` (inspect, browsers, browser, adsPower, localAccount, sessions) and `flows` (flow, warmup). `login`, `logout`, `whoami` move to `accountsAndProxies`. The Facebook topics keep only Facebook commands.
- `inspectDo` / `inspectDoLive` notes say "steps that act on the platform".
- Rewrite the seven non-Facebook commands whose usage or summary says Facebook or Marketplace (`launch`, `localAccount`, `inspect`, `warmup`, `governor`, `instagram watch`, `instagram voice`) so the platform is named only where it is the platform in use.
- Fix `docs/useCases/inbox/signIn.md` so its steps match slice 3.
- New check `check:platformNeutral`: fails when a command with platform `any` or `byArgument` has a guide topic, usage, summary or tool note that names one platform. Add it to the pre-commit hooks.
- Done when: the new check passes and no shared command's guide topic starts with a platform name.

### Slice 3: one sign-in capability, as a machine

- Domain: `src/platformKit/signIn/` (`index.ts`, `types.ts`, `client.ts`, `machine.ts`, tests).
- Machine states: `checking` → `signedIn` (final) | `opening` → `waitingForOwner` → `saving` → `rechecking` → `signedIn` | `signInNeeded` | `stopped` (platform refused, final) | `failed`. Named actions and guards, `setup()`, every invoke has `onError`, no state held outside the machine.
- Routes per platform, from one table (extend `signInRouteOf`): `browser` (every platform with a browser: the owner signs in on the login screen and the cookies and session are saved from the browser) and `cookies` (the masked prompt) as the alternative where it exists. X stays cookies until it has a browser.
- Saving: before `savePlatformSession` writes, check the platform's own session cookies or token are present (the `platformGate` shape). A signed-out browser never overwrites a session. After saving, write `sessionState` and `sessionCheckedAt`, and return the outcome to the caller.
- Page states: `loginForm` resolves to Facebook's `signIn` only on facebook.com. Other platforms get `<platform>Login`, whose next step is "the owner signs in".
- Surfaces, all calling the same machine:
  - CLI: `log sessions signIn --account <a> [--platform <p>] [--route browser|cookies]`
  - MCP: `sessionsSignIn` (generated), with `browserView` showing the live browser where the host draws MCP Apps
  - Console: the Connections page's Sign in and Browser check, for every platform with a browser (not Facebook only)
  - Hosted relay: `sessionsCheck`, `sessionsSignIn`, `instagramSessionCheck`, `slackSessionCheck` in READ_TOOLS; stop stripping `next`
- Done when: the same account shows the same state after sign-in from each surface, and a test proves a signed-out browser close leaves the stored session untouched.

### Slice 4: one check state, one gate, crash-safe

- One state type for all three surfaces: `signedIn | signInNeeded | stopped | unknown | checking | skipped`. The console's `CheckState` and the `SessionVerdict` from PR #131 become this one type.
- One gate function in `src/platformKit/sessionCheck/` decides whether an account may be checked. The console, `sessionsCheck` and the sign-in machine all call it. An account held stopped is never re-hit (rule 94).
- The check machine owns "checking": the row stores the pid and a start time, `onError` records the outcome, and startup reconciles rows whose process is gone (as `src/mcp/jobs/client.ts:119` does for jobs). Busy is a machine state, per account.
- Remove `proofs`, the sign-in `busy` flag and the `shared` singleton in favour of machine state or `log.db`.
- Add `sessions` to LONG_RUNNING so a check of every account runs as a job with progress.
- Remove dead code: `checkStateOf`, `sessionCheckTool`, `accountCheckUnavailable`.
- Done when: killing the process mid-check leaves no stuck row, and the console, CLI and MCP print the same state for every account in one fixture.

### Slice 5: shared machinery loses its Facebook names

- `log capture docs` (shared) replaces `log facebook capture --docs`; `check:clientDocs` replaces `check:facebookClientDocs`; the request-doc template takes the platform's name and its own machines.
- Move shared code out of `src/marketplace/`: `socialAccount`, `connect`, `account`, `preflight`, `lifecycle` go to `src/platformKit/` or `src/browser/` by what they do. `src/marketplace/` keeps Facebook Marketplace only.
- Done when: nothing under `src/` outside `src/facebook/` and `src/marketplace/` imports from `src/marketplace/`.

### Slice 6: console-only operations get their twins

- `credentialsSave` / `credentialsRead`, the Facebook email and password save, and `accountsList` each get a CLI command and so an MCP tool, or the console calls an existing command.
- Extend `checkConsoleParity` to compare `CONSOLE_OPERATIONS` against commands, and fail on an operation with no command.

## Measured after slice 1 (PR #133 branch, 2026-11-13)

Slice 1 fixed tool names only. A script over `COMMANDS`, the guides, the use cases and the README found:

| What | Number | Why it steers |
|---|---|---|
| Shared commands under a platform-named guide | 10 | A Discord task loads Facebook's guide |
| Shared commands whose summary names a platform | 3 (`launch`, `warmup`, `transcribe`) | |
| Tools per platform | shared 76, facebook 43, twitter 40, discord 16, reddit 11, slack 11, instagram 9, linkedin 1 | |
| Use cases per folder | twitter 16, inbox 9, discord 6, facebook 2, instagram 2, reddit 1, slack 1, web 1 | The router's phrases are mostly X plays |
| Files with a state machine | 15: Facebook and Marketplace 10, browser 2, console check 1, X queue 1, flow 1 | |
| Commands with a live (acting) tool | 35 | Sends on X, Discord, Slack, Instagram and Reddit are not machines |
| Hook hosts in code | 2 (`claudeCode`, `codex`) | Every other harness has docs only |
| README mentions | Claude Code 5, Codex 3, Cursor 3; ChatGPT, Hermes, Grok, Claude app 0 | |

The same capability has a different name on each platform, so the model can't infer it:

| Capability | X | Discord | Slack | Instagram | Reddit |
|---|---|---|---|---|---|
| Send a message | `twitterDm` | `discordSend` | `slackSend` | `instagramSend` | none |
| Read a chat | `twitterDms` | `discordRead` | `slackRead` | `instagramDms` | none |
| List chats | `twitterDms` | `discordChats` | `slackChats` | `instagramDms` | none |
| Post publicly | `twitterPost` | none | none | none | `redditPost` |

## Added slices

### Slice 0: the scorecard, as a check (do this first)

- `check:agnostic` prints the table above from the code and fails when a number gets worse than the committed baseline. It runs in pre-commit and CI.
- This is the answer to rot: a new platform-named shared guide, a new shared command that names a platform, or a new acting command with no machine fails the commit.
- The baseline file is committed, and each later slice lowers it.

### Slice 7: capabilities first, the platform as an input

The full design is in [capabilitySchema.md](capabilitySchema.md): the naming rule, the canonical inputs, three worked examples and the migration order. It supersedes the outline below where they differ (names are `<noun><Verb>`, such as `messagesSend`, and live calls stay as `*Live` twins).

- One capability table in code: `capability × platform → command`, with what each supports (`send`, `read`, `chats`, `react`, `voice`, `watch`, `post`, `reply`, `sessionCheck`, `signIn`). Generated from the commands, never hand-written.
- Shared tools by capability: `send { platform?, account, to, text }`, `read`, `chats`, `react`, `voice`, `watch`. The platform comes from the account when it isn't given. A platform that lacks the capability answers `capabilityMissing` with the platforms that have it.
- The per-platform tools stay as the implementation and are not listed to hosts once the shared ones cover them.
- Use cases name capabilities, not platform tools, unless the play is about one platform. The router matches the task to a capability, then the account picks the platform.
- Guides: one guide per capability, with a per-platform section generated from the capability table.

### Slice 8: every acting capability is a machine

- Each of the 35 acting commands runs through one shared action machine: `gating` (governor, claim, voice gate, play) → `acting` → `confirming` (the platform's answer) → `done | refused | uncertain`. Platforms supply the actors; the states are the same everywhere.
- The X queue machine drives the run instead of tracing it.

### Slice 9: one harness contract

- One table in code: `harness × capability` (prompt hook, session-start hook, tool hooks, MCP Apps, server instructions, skills, plugin format, elicitation). `HookHost` grows from 2 to every harness log supports.
- One adapter per harness, generated from the same router, guides and skills:
  - Claude Code and Codex: the prompt hooks that exist today.
  - Hermes: the plugin in `hermesPlugin/` gains a `pre_llm_call` hook that runs the router and ships every log skill.
  - Cursor: a `sessionStart` hook (its prompt hook can't add context).
  - ChatGPT, Claude app, Grok: server instructions plus `getGuide({ ask })`.
- `docs/harnesses/*.md`, the README's install section and the site's harness pages are generated from that table, so no harness is described by hand and the README stops being Claude Code first.
- `log new harness <name>` scaffolds an adapter, as `log new platform` does for a platform.

### Slice 10: the watcher is one machine per account, started by any harness

Today (read in `src/inbox/watch/client.ts`, `scripts/hooks/inbox.ts` and the watch commands):
- Four platforms have a push watcher: X (`twitter chat watch`), Discord (`discord watch`, the gateway), Slack (`slack watch`) and Instagram (`instagram watch`). Reddit, LinkedIn and Facebook have none; `facebook watch` is the listing monitor.
- Each is its own process per account, claimed by pid (`claimWatcher`, `watchHolder`, `releaseWatcher`), started by four hand-written functions (`startTwitterWatch`, `startDiscordWatch`, `startSlackWatch`, `startInstagramWatch`) and restarted when its code changes (`WATCHER_CODE`, `stopStaleWatchers`).
- They are started by the inbox hook, which only Claude Code and Codex run. What they hear goes to a pending store that the same hook puts into the agent's context.
- The lifecycle is not a machine. Starting, connected, catching up, live, reconnecting, cooling down, session dead and stopped are implied by pid files and flags.
- The inputs differ: Discord `--channel`, Slack `--workspace --chat`, Instagram none, and X's watch is terminal only so it has no MCP tool.

Change:
- One `accountWatcher` machine in `src/platformKit/watcher/`: `starting` → `catchingUp` → `live` ⇄ `reconnecting`, plus `coolingDown`, `signInNeeded` (a 401 from the socket, the same state `sessionsCheck` reports), `stopped` and `failed`. Each platform supplies only its connect and decode actors. The pid claim is the machine's guard, so a second watcher is refused by a state, not a file race.
- One shared command and tool set: `log watchers status|start|stop [--platform] [--account]` (`watchersStatus`, `watchersStart`, `watchersStop`), and `messagesWatch { platform?, account, chat?, space?, seconds }` to listen for a set time.
- A platform with no push watcher answers `capabilityMissing`.
- Starting is not tied to one harness. The runtime (`log runtime connect`) and every harness adapter from slice 9 call `watchersStart`; the Claude Code and Codex hook becomes one caller among several.
- Delivery of what was heard goes through one reader, `inboxPending { reader }`, that every harness can call. Harnesses with a prompt hook (Claude Code, Codex, Hermes through `pre_llm_call`) get it put into context; the others read it as a tool.

### Slices 11 to 15: the CLI and the MCP say and do the same thing

The evidence, with every file, is in [schemaParityAudit.md](schemaParityAudit.md). An MCP call runs the CLI in the same process, so the parser is shared; the gaps are in the schema, the result and the gates around it.

**Slice 11: one schema source, tested through `run`.**
- `FlagSpec` gains number, list, date and span kinds, ranges, patterns and one-of groups, so the schema says what `run` enforces. Today 51 of 151 form tools refuse schema-valid input for a reason the schema can't express.
- `approvedBy` becomes required in every `*Live` schema.
- `docs/reference.md` is built from the input forms, not a regex over usage text.
- A round-trip test runs every form through `run` with a stubbed context.
- Files: `src/cli/runner/types.ts`, `src/cli/runner/helpers/commandInput.ts`, `src/cli/runner/helpers/parseArgs.ts`, `src/cli/runner/commandInput.test.ts`, `src/surface/catalog/index.ts`, `src/mcp/server/helpers/toolsFromCommands.ts`, and every `src/cli/**/index.ts` that re-parses a flag.

**Slice 12: every tool has named inputs.**
- The 25 raw `args` tools get input forms. `flow`, `join` and `warmup` need a redesign.
- Flow tools enter the catalog with their platform.
- Files: `src/cli/{auth,live,adsPower,localAccount,lifecycle,preflight,proxy,capture,poll,campaign,profile,errors,flow,join,warmup}/`, `src/mcp/server/helpers/toolsFromFlows.ts`, `src/mcp/catalog/helpers/entries.ts`.

**Slice 13: one result envelope, with error codes.**
- `ToolResult` gains `code`, `platform` and `capability`. Every refusal carries a code as a field; 380 refusals return plain text today.
- The hosted relay forwards the code. Today every refused command reaches a hosted caller as `toolFailed`.
- One answer shape per capability on every platform.
- Shared error codes stop naming one platform (`limitInvalid`, `secondsInvalid`, `mediaInvalid`, `crashed`).
- Files: `src/mcp/server/types.ts`, `src/mcp/server/index.ts`, `src/cli/runner/types.ts`, `src/cli/runner/helpers/refuse.ts`, `src/errors/catalog/types.ts`, `src/cli/runtime/index.ts`, `src/platformKit/sessionCheck/client.ts`, `src/cli/sessions/index.ts`, the per-platform send, read, react and session commands, and `python/*Api/engine.py`.

**Slice 14: one gate pipeline for every path.**
- One `gateCall(tool, input, caller)` in `src/platformKit/gates/` for live, approval, play, bypass, busy and terminal-only. The CLI runner, `runToolCall`, the console and the runtime all call it.
- The name lists (`PLAY_REQUIRED`, `LONG_RUNNING`, `TERMINAL_ONLY`, `NO_PROMPT`, the hosted lists) are derived from command metadata.
- Reddit post and reply get the voice gate, the AI-artifact check and the claim they lack today.
- `--apply` and `--write` become live flags.
- The console stops setting `confirmLive` on the caller's behalf.
- Files: `src/mcp/server/helpers/activePlay.ts`, `src/mcp/server/helpers/guardCall.ts`, `src/mcp/server/types.ts`, `src/cli/reddit/index.ts`, `src/cli/slack/index.ts`, `src/cli/instagram/index.ts`, `src/cli/twitter/helpers/send.ts`, `src/console/browserCheck/client.ts`, `python/controlService/tools.py`, `python/controlService/dispatcher.py`, `python/controlService/mcpRoutes.py`.

**Slice 15: a platform-scoped catalog.**
- `logSearch` ranks reads above writes for "who…" questions, treats platform synonyms as platform words, never marks a terminal-only entry `strong`, and groups results by capability.
- An account on the wrong platform answers `accountPlatformMismatch` with where it was found.
- A golden set of queries is checked in CI.
- Files: `src/mcp/catalog/helpers/search.ts`, `src/mcp/catalog/helpers/entries.ts`, `src/platformKit/session/client.ts`, `src/marketplace/socialAccount/client.ts`.

### Slices 16 to 19: the right context reaches the model, in every harness

The evidence, with every file, is in [contextInjectionAudit.md](contextInjectionAudit.md).

**Slice 16: one router.**
- `getGuide({ ask })` and the prompt hook call one `route(prompt, context)`. Today they are two algorithms: of 44 test prompts, the ask path activated the wrong play for about 19, and 7 of those were a play for another platform.
- The platform word in the prompt is weighted, placeholders such as `<server>` are not counted as words, and a tie is broken by platform, never by folder order. Nothing is activated on a tie.
- Every use case gets its asks line (10 of 38 have none) and a numbered step table (the Facebook plays have no steps the code can parse).
- Files: `src/useCases/router/client.ts`, `src/useCases/router/types.ts`, `src/mcp/server/helpers/guideAnswer.ts`, `scripts/contextLayer/service.ts`, `src/contextLayer/hook/client.ts`, `docs/useCases/**`.

**Slice 17: the play state.**
- The play is per session and expires. Today it is one per process and never cleared.
- A play unlocks only the sends it covers. Today any play unlocks every send.
- The play gate is derived from each tool's effect. Today 18 live acting tools are ungated.
- The hosted path gets the play footer and keeps `next`.
- Files: `src/mcp/server/helpers/activePlay.ts`, `src/cli/runtime/index.ts`, `src/contextLayer/session/client.ts`.

**Slice 18: guides scoped by capability and platform, and a budget on what is injected.**
- 27 tools point at another platform's guide, not 10: the inbox tools point at `xInbox`, the voice gate at `xSending`, `sessionsCheck` at a Twenty accounts guide. These move to shared topics (extends slice 2).
- The 38 flow tools get their platform.
- Guides are rendered without shell text for hosts with no shell, shared rules appear once, and developer rules stop being cited as operating rules.
- Dead rule citations (78 in use cases, 124 in skills), the Twenty text and the owner's name in hosted text are removed.
- Hook output names MCP tools, not shell lines that another hook then refuses.
- Files: `src/mcp/server/helpers/guides.ts`, `src/mcp/server/helpers/agentRules.ts`, `src/mcp/server/helpers/toolsFromCommands.ts`, `src/mcp/server/helpers/toolsFromFlows.ts`, `scripts/docs/buildDocs.ts`, `python/controlService/mcpRoutes.py`, `src/agentHooks/answers/client.ts`, `src/agentHooks/pageState/index.ts`, `src/browser/runStore/helpers/storageVerdict.ts`, `skills/**`, `docs/useCases/**`.

**Slice 19: hooks as adapters from one contract (extends slice 9).**
- `HookHost` covers every harness, with a capability table per harness. Today it is Claude Code and Codex, and nothing installs their hooks for a user: they run only inside the log checkout.
- `log launch --setup` installs user-level hooks and skills for each harness.
- The Hermes plugin gets the router hook and the 38 play skills, generated. Its two hand-written skills call sends that the play gate refuses today.
- Watchers and pending messages stop depending on a hook (slice 10).
- Files: `src/agentHooks/registry/types.ts`, `src/agentHooks/registry/index.ts`, `src/cli/launch/index.ts`, `src/cli/launch/helpers/setup.ts`, `src/cli/launch/helpers/start.ts`, `hermesPlugin/**`, `.opencode/plugins/logHooks/**`, `.agents/hooks.json`, `scripts/hooks/antigravity.ts`, `docs/harnesses/*.md`.

### Slices 20 and 21: signing in from inside any harness, and the people data `report` draws

The detail, with schemas, files and acceptance tests, is in [inAppVerificationAndGenerativeUI.md](inAppVerificationAndGenerativeUI.md).

**Slice 20: one sign-in that works inside every harness (extends slice 3).**
- The sign-in machine from slice 3 is reached through one tool, `sessionsSignIn { platform?, account }`, on the local and the hosted server. Today the hosted model is told to call `inspectStart`, which it cannot.
- What the owner sees is decided per session, from what the host declares:
  1. The host draws MCP Apps: the live browser shows inline, as `browserView` does today.
  2. The host has no MCP Apps but supports URL elicitation: the answer is a signed, single-use console link that expires in ten minutes. It is never the raw stream URL.
  3. Neither: plain text with the same link.
- A missing account answers with a structured `accountNotConfigured { platform, next }`, so any host can show a connect step.
- Page states are classified per platform, from a fixture login page for each, not from Facebook's flow.
- Polling by the live view stops writing a hosted journal row per frame.
- Which hosts support which rung comes from web research and is not verified by running each one; the matrix is a list of claims to test.
- Files: `src/platformKit/sessionCheck/client.ts`, `src/mcp/apps/browserView/client.ts`, `src/mcp/server/index.ts`, `src/cli/browser/index.ts`, `python/browser/browserViewer.py`, `python/controlService/tools.py`, `python/controlService/dispatcher.py`, `src/runtime/bridge/client.ts`, `src/console/operations/types.ts`, and a new console route for the link.

**Slice 21: people data stored once, so `report` draws it without a platform call.**
- `report` reads one data source today (`twitterDmsBySender`), and the `source` input is never dispatched on. It becomes a registry of sources, one per capability, on every platform that has the data.
- The engines already fetch bios, follower counts, verified flags and display names, then drop them. A new `identityProfiles` table, keyed by platform and user id, keeps them, with the avatar in the existing `blobs` table under a raw codec. It is rebuilt from events like the other derived tables.
- `report` gains an `identityProfile` source that reads that table.
- On the hosted path, `report` and `sessionsSignIn` results are redacted before they are journaled. Today a `report` result is journaled as it is.
- A view written by the agent can't reach a module through a dynamic `import()`. Today only static imports are blocked.
- Files: `src/storage/schema/helpers/migrations.ts`, `src/storage/schema/helpers/platformTables.ts`, `src/storage/platform/client.ts`, `src/storage/platform/types.ts`, `src/inbox/senders/types.ts`, `src/mcp/apps/report/client.ts`, `src/mcp/apps/report/view/run.ts`, `src/twitter/notification/helpers/extenders.ts`, the Discord, Slack and LinkedIn session callers, `src/console/operations/types.ts`, `src/runtime/bridge/client.ts`.

## Order

1. Slice 0, the scorecard check, so nothing below can regress.
2. Slices 16 and 17, the router and the play state: the wrong play is the most direct cause of wrong content.
3. Slices 2 and 18, the guides.
4. Slices 11 to 15, the schema, result and gate parity.
5. Slices 7 and 8, capabilities and action machines.
6. Slices 3, 4, 10 and 20, sign-in, check state, the watcher and sign-in inside every harness.
7. Slices 9 and 19, the harness contract.
8. Slice 21, the people data for `report`.
9. Slices 5 and 6, renames and console twins.

## Found while building slice 1 (PR #133)

- **Aliases say "renamed" in the call result**, not a description: aliases are never listed, so a description would never be seen. Slice 2 must not bring bare names back.
- **`LONG_RUNNING`, `NO_PROMPT` and `TERMINAL_ONLY` are keyed by bare command name**, so `discord read` and `slack watch` share Facebook's entries by accident. Key them by `commandKey` in slice 4, before adding `sessions`.
- **`facebookCapture` rebuilds every platform's docs.** Slice 5 moves it to a shared `capture docs` and aliases the old name.
- **`accountNotFacebook`** is the error `checkRunnable` gives every platform. Slice 3's sign-in machine calls `platformOfAccount` (which now throws `accountPlatformMissing`) and doesn't copy that Facebook check.
- **Facebook defaults still in place**, for a later slice:
  - `src/browser/runStore/client.ts:97`
  - `src/cli/inspect/index.ts:158`
  - `src/knowledge/base/helpers/collect.ts:132`
  - `src/marketplace/account/helpers/accountLabel.ts:4`
  - `scripts/checks/checkPlatforms.ts:16`
- **Removing the aliases next release:** delete `toolAliases.ts`, its test and the alias half of REQ-MCP-21 together.

## Rules for whoever builds this

- Read `AGENTS.md` first. camelCase, `{library}/{domain}/` layout, no comments in code, XState for anything over time, commit as the repo owner (rule 4), never `--no-verify`, the devlog entry filled for each commit.
- `LOG_PYTHON` must point at a Python with the engines' packages, for the transport checks.
- No calls to any social platform. Unit tests and fixtures only. Never source `.env.local`.
- Rule 178: no real names, handles or messages in tracked files.
- One slice per PR. Report what was run and what was not.
