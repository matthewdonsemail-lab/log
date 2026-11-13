# One platform-neutral capability set across the CLI, MCP and console

14 November 2026.

Status: proposal. Slice 1 is merged (PR #133) and slice 0, the scorecard check, is built. Every other slice is not built. The findings come from read-only audits of `main` on 13 and 14 November 2026; each claim names its file.

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
- **Built, with slice 18.** Shared topics `accountBrowser` (inspect, browsers, browser, adsPower, localAccount), `sessions` (sessions, login, logout, whoami: they are log's own sign-in, so they sit with the session check), `flows` (flow, warmup), `inbox` and `voiceGate`. `facebookBrowser` keeps Facebook's commands and gains `facebook accounts` and `facebook account`; `accountsAndProxies` keeps proxy and launch. The `inspect`, `flow` and `warmup` skills are split: the shared skill keeps what applies to any platform, `facebookInspect`, `facebookFlows` and `facebookWarmup` keep Facebook's part. `inspectDo` / `inspectDoLive` say "the platform"; `launch`, `inspect`, `warmup` (its forms are `log <platform> warmup …`, with a `Platforms:` line), `report` and `voice` no longer name one platform. `docs/useCases/inbox/signIn.md` step 2 says what is true today (`inspectStart` opens the browser, `browserView` shows an open one), not slice 3's tool. `check:platformNeutral` is built (see slice 18). No topic was renamed, so `GUIDE_ALIASES` is empty. Spec: [REQ-MCP-22](../specs/mcpServer.md).

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

### Slice 0: the scorecard, as a check (built)

- Built: `check:agnostic` (`scripts/checks/checkAgnostic.ts`, measuring in `src/surface/scorecard/`) prints the table above from the code, with `--json`, and fails when a number is worse than `scripts/checks/agnosticBaseline.json` or missing from it. It runs in pre-commit, pre-push and `bun run check` (CI). `--write` moves the baseline and refuses to raise a number without `--allowWorse`. What each number means and the "has a machine" rule are in [the scorecard spec](../specs/agnosticScorecard.md).
- This is the answer to rot: a new platform-named shared guide, a new shared command that names one platform, or a new acting command with no machine fails the commit.
- The baseline file is committed, and each later slice lowers it in the same PR.
- First baseline (integration branch, 14 November 2026): 12 shared commands and 27 shared tools under a platform-named guide; 5 shared commands naming exactly one platform; 36 of 38 flow tools with no platform in the name; 10 use cases with no asks line, 2 with no parseable steps; 143 tools named by no use case; 25 raw `args` tools; 46 of 54 acting tools outside `PLAY_REQUIRED`; 24 of 34 live commands with no machine; 2 hook hosts; 4 guides over 50,000 characters; dead rule citations 78 in use cases, 124 in skills, 87 in tool descriptions; 5 hard-coded Facebook fallbacks.

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
  - Hermes: a native plugin (`plugin.yaml`, `__init__.py`) registers a `pre_llm_call` hook that runs the router. The portable plugin in `hermesPlugin/` can't register hooks; it ships every log skill.
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
- **Built.** `route(prompt, context)` is the one router: `askAnswer` calls it with the use cases, the hook's `routePrompt` with the dense scores as an optional signal. Placeholders aren't words; `PLATFORM_WORDS` reads the platform and its synonyms; plays under another platform's folder are left out; a play activates only when clear (word score 0.6 or more, 0.1 ahead of the next, its phrase naming no platform the prompt left out); otherwise a menu, never a folder-order pick. `ask` loads a play only on a clear match. Hook and router text is statements of fact. The ten use cases have asks lines; the Facebook pages have numbered step tables. `src/useCases/router/fixtures/golden.json` (94 prompts) is run on both entry points by `router.test.ts`. Spec: [REQ-MCP-16 and 17](../specs/mcpServer.md).

**Slice 17: the play state.**
- The play is keyed by a handle the server mints and the client passes back, and it expires. Today it is one per process and never cleared. It is not keyed by the session header, which the 2026-07-28 revision removes.
- A play unlocks only the sends it covers. Today any play unlocks every send.
- The play gate is derived from each tool's effect. Today 18 live acting tools are ungated.
- The hosted path gets the play footer and keeps `next`.
- Files: `src/mcp/server/helpers/activePlay.ts`, `src/cli/runtime/index.ts`, `src/contextLayer/session/client.ts`.
- **Built.** Plays live in a store keyed by a minted handle (`play_…`): one per stdio process, one per HTTP session's server, one per team and actor on the hosted runtime (from the dispatch authority), never the session header. `getGuide` names the handle; a call may pass it back as `playHandle`. A play expires after two idle hours, is replaced by the next load and ends with `clearPlay`. Acting as the owner is derived from each tool's effect (31 tools, flows marked with `effect`). A play covers a tool its steps name, and every tool of the platform it is filed under (`inbox/` and `web/` plays only what they name). The eight tools gated on main need a covering play; every other acting tool runs with no play, as on main, and is refused (`playNotCovering`, naming `clearPlay` and the play that fits) only under a play that doesn't cover it. `unnamedActingTools` (13 today) is counted by the scorecard. The hosted `toolRunner` adds the same footer through `withCallFooter` and keeps `next`. Play restore reads plays loaded with `ask`. Spec: [REQ-MCP-15](../specs/mcpServer.md).

**Slice 18: guides scoped by capability and platform, and a budget on what is injected.**
- 27 tools point at another platform's guide, not 10: the inbox tools point at `xInbox`, the voice gate at `xSending`, `sessionsCheck` at a Twenty accounts guide. These move to shared topics (extends slice 2).
- The 38 flow tools get their platform.
- Guides are rendered without shell text for hosts with no shell, shared rules appear once, and developer rules stop being cited as operating rules.
- No guide is larger than one host will take. Claude Code limits MCP output to 25,000 tokens and saves text over 50,000 characters to a file; four guides are over that today (`xSending`, `facebookFlows`, `facebookBrowser`, `facebookMarketplace`).
- Hook and router text is written as statements of fact, not instructions, as Claude Code's hook reference advises.
- Dead rule citations (78 in use cases, 124 in skills), the Twenty text and the owner's name in hosted text are removed.
- Hook output names MCP tools, not shell lines that another hook then refuses.
- Files: `src/mcp/server/helpers/guides.ts`, `src/mcp/server/helpers/agentRules.ts`, `src/mcp/server/helpers/toolsFromCommands.ts`, `src/mcp/server/helpers/toolsFromFlows.ts`, `scripts/docs/buildDocs.ts`, `python/controlService/mcpRoutes.py`, `src/agentHooks/answers/client.ts`, `src/agentHooks/pageState/index.ts`, `src/browser/runStore/helpers/storageVerdict.ts`, `skills/**`, `docs/useCases/**`.
- **Built.** The structure: one guide per shared capability and per platform area (slice 2), each listing its tools as one row with the usage line (the tool's own description carries the rest), its rules by number and first line, and the guides to load next; the scope block and the full rule text only in `logMcpInstructions`. Every guide is under 50,000 characters without dropping guidance: `xSending` 129,082 → 28,699, `facebookFlows` 78,807 → 24,009, `facebookBrowser` 69,073 → 19,650, `facebookMarketplace` 53,763 → 35,067, `logMcpInstructions` 29,923 → 22,907; all guides 726k → 323k characters. Guides are rendered once with shell-only and no-shell blocks; `getGuide` keeps the block that fits the caller (`hasShell` locally, no shell on the hosted runtime), so `check:docs` stays deterministic. The 38 flow tools carry their platform from the definition's `platform` field (`facebookFlowPostComment`, `facebookFlowLanguageEnglish`), with the old `flow<Name>` names as unlisted aliases (`RENAMED_FLOW_TOOLS`); the play gate and the page-state resolver use the new names. Tool rule lines list each current operating rule once: `CONSOLIDATED_RULES` maps a retired id to its current rule or drops it, and `operatingRuleIds` drops the developer rules (`DEVELOPER_RULES`), except for `new`. Literal rule numbers in tool, flow and hook text are current (`cite`). Dead citations are 0 in use cases, skills, tool descriptions, guides and hook text. Hook text names MCP tools (`inspectDo`, `kbSearch`, `runsList`, `runsPrune`), not shell lines. Served text says "the owner" (tool descriptions, guides, both instructions, use cases: 0, a new scorecard number). The hosted `INSTRUCTIONS` is read from `python/controlService/serverInstructions.txt`, written by `docs:build` from `serverInstructions("hosted")`, the same lines as `SERVER_INSTRUCTIONS`. `check:platformNeutral` holds eleven scorecard numbers at zero, in pre-commit, pre-push and `bun run check`. Spec: [REQ-MCP-22](../specs/mcpServer.md).
- Not built here: the `confirmLive` and `confirmBypass` schema descriptions and some flag descriptions still name the owner (they are schema, which slice 11 owns); runtime refusal and result text (`Needs matt:` in browser lines, the voice gate's refusals, the error catalog) still does; skills that describe CLI terminal steps (`inspect`'s "terminal 1 (or Monitor)") carry no shell markers yet; Twenty text stays where the code still needs Twenty (the knowledge base, `join`'s group record, `connect` for accounts kept in Twenty).

**Slice 19: hooks as adapters from one contract (extends slice 9).**
- `HookHost` covers every harness, with a capability table per harness. Today it is Claude Code and Codex, and nothing installs their hooks for a user: they run only inside the log checkout.
- `log launch --setup` installs user-level hooks and skills for each harness.
- The Hermes plugin ships the 38 play skills, generated. Its two hand-written skills call sends that the play gate refuses today. The router hook needs a native Hermes plugin, because a portable one can't register hooks.
- Hooks ship as a plugin per harness. Claude Code, Codex and Cursor each load hooks from a plugin, so nothing edits a user's settings file.
- Each adapter cuts its text to the harness's limit: 10,000 characters per context string in Claude Code, about 2,500 tokens per hook in Codex.
- Watchers and pending messages stop depending on a hook (slice 10).
- Files: `src/agentHooks/registry/types.ts`, `src/agentHooks/registry/index.ts`, `src/cli/launch/index.ts`, `src/cli/launch/helpers/setup.ts`, `src/cli/launch/helpers/start.ts`, `hermesPlugin/**`, `.opencode/plugins/logHooks/**`, `.agents/hooks.json`, `scripts/hooks/antigravity.ts`, `docs/harnesses/*.md`.

### Slices 20 and 21: signing in from inside any harness, and the people data `report` draws

The detail, with schemas, files and acceptance tests, is in [inAppVerificationAndGenerativeUI.md](inAppVerificationAndGenerativeUI.md).

**Slice 20: one sign-in that works inside every harness (extends slice 3).**
- The sign-in machine from slice 3 is reached through one tool, `sessionsSignIn { platform?, account }`, on the local and the hosted server. Today the hosted model is told to call `inspectStart`, which it cannot.
- What the owner sees is decided per session, from what the host declares:
  1. The host draws MCP Apps: the live browser shows inline, as `browserView` does today.
  2. The host has no MCP Apps but supports URL elicitation: the answer is a console link that expires in ten minutes and works once. It is never the raw stream URL, and it grants nothing by itself: the console page checks that the signed-in person is the one the request was made for.
  3. Neither: plain text with the same link.
- A missing account answers with a structured `accountNotConfigured { platform, next }`, so any host can show a connect step.
- Page states are classified per platform, from a fixture login page for each, not from Facebook's flow.
- Polling by the live view stops writing a hosted journal row per frame.
- URL elicitation is verified for Claude Code and VS Code only ([sources.md](sources.md)). Every other host is unknown until tested, and gets rung 3.
- Files: `src/platformKit/sessionCheck/client.ts`, `src/mcp/apps/browserView/client.ts`, `src/mcp/server/index.ts`, `src/cli/browser/index.ts`, `python/browser/browserViewer.py`, `python/controlService/tools.py`, `python/controlService/dispatcher.py`, `src/runtime/bridge/client.ts`, `src/console/operations/types.ts`, and a new console route for the link.

**Slice 21: people data stored once, so `report` draws it without a platform call (built).**
- `report`'s `data` is a registry of sources, `REPORT_SOURCES` (`src/mcp/apps/report/helpers/sources.ts`), dispatched on `source`: `twitterDmsBySender` as before, `dmsBySender { platform }` for any platform with chats in log.db (refused with `reportSourceNoData` when it has none), and `identityProfile { platform, userId | handle }` (refused with `identityProfileMissing`).
- Migration 19 adds `identityProfiles (platform, userId, bio, avatarHash, followerCount, verified, extra, fetchedAt)`. It is a derived table, rebuilt from events: the session callers and `log twitter followers` append `profileSeen` events, and the X extender reads follower counts from notifications. `extra` holds only the keys in `IDENTITY_PROFILE_EXTRA_KEYS`. `putBlob` has a `raw` codec for `avatar` blobs. What each platform keeps is in [storage.md](../specs/storage.md) REQ-STORAGE-18.
- No avatar is fetched: no engine answer carries the bytes. X followers and Discord's session check now pass the picture link through, kept as `extra.pictureUrl`.
- On the hosted path, `report` and `reportData` results are redacted before they are journaled (`PRIVATE_RESULT_TOOLS`). `sessionsSignIn` doesn't exist yet: slice 20 adds it to that list.
- A view written by the agent can't reach a module through `import()`: refused at compile time (`dynamicImportIn`) and at run time (`moduleRequire`).
- Not built: Slack keeps no profile (its engine folds `display_name` and `real_name` into one label inside Python, so they never reach TypeScript); `log report data` still offers only `twitterDmsBySender`; the server-side text rendering still runs view code with `new Function`, so runtime globals stay reachable from a view.
- Files: `src/storage/schema/helpers/migrations.ts`, `src/storage/schema/helpers/platformTables.ts`, `src/storage/platform/client.ts`, `src/storage/platform/types.ts`, `src/inbox/senders/types.ts`, `src/mcp/apps/report/client.ts`, `src/mcp/apps/report/view/run.ts`, `src/storage/platform/helpers/extenders.ts`, the Discord, Slack and LinkedIn session callers, `src/console/operations/types.ts`, `src/runtime/bridge/client.ts`.

### Slice 22: serve the 2026-07-28 revision as well as the older ones

The detail and the quotes are in [sources.md](sources.md).

- log's servers speak 2025-11-25 and earlier. The local server uses `@modelcontextprotocol/sdk` 1.32.1; the hosted one lists its revisions in `python/controlService/settings.py:30`. A client on 2026-07-28 that has no fallback can't connect.
- The 2026-07-28 revision has no `initialize` handshake and no `Mcp-Session-Id` header. Each request carries its version and the client's capabilities in `_meta`. Both servers become dual-era: a request with per-request `_meta` is served statelessly, and `initialize` keeps the legacy behaviour.
- `server/discover` is implemented on both.
- `tools/list` must not vary per connection. Today the list depends on whether the host draws MCP Apps and whether it has a shell. It becomes one list in a fixed order, and what differs per host moves into each result.
- The hosted server carries the UI flag in the session header today (`python/controlService/mcpRoutes.py:196-204`). It reads the capability from each request.
- Every result carries `resultType`. A step that needs the owner returns `InputRequiredResult`, not a server-initiated request.
- Files: `src/mcp/server/index.ts`, `src/mcp/server/helpers/toolsFromCommands.ts`, `src/mcp/apps/browserView/client.ts`, `src/mcp/apps/report/client.ts`, `python/controlService/mcpRoutes.py`, `python/controlService/settings.py`, `package.json`.

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
10. Slice 22, the 2026-07-28 revision. It can start as soon as slice 17 has moved the play off the session.

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

## Conventions

From `AGENTS.md` and the sources in [sources.md](sources.md). Every slice follows these.

**Names and layout**
- camelCase for files, folders, values, ids, statuses and error codes (rule 1). External names are converted once at the boundary.
- Platform code lives in `src/<platform>/<area>/<domain>`; shared code in its shared library, such as `src/platformKit/<domain>`. A domain has `index.ts`, `types.ts`, `client.ts`, `machine.ts` and `helpers/` as it needs them (rule 2).
- Platform commands are `log <platform> <command> <what>`; shared commands stay shared (rule 63). A capability is a shared command: `log <noun> <verb>`, tool `<noun><Verb>`, catalog id `<noun>.<verb>`.
- No comments or docstrings in owned TypeScript, JavaScript or Python (rule 70).

**Machines**
- Anything that runs over time is an XState machine (rule 6), built with `setup()`, with named actions and guards.
- Every `invoke` has `onError`. A callback actor's rejections aren't caught by `onError`, so promise actors are used for async work.
- State that must survive a restart is the machine's persisted snapshot or a row in `log.db`, never a module variable.

**Tools**
- One source for a tool's name, schema, description, gates and docs. Nothing restates a tool name or an input by hand.
- `inputSchema` says what the command enforces: types, ranges, lists and one-of groups.
- Annotations are set from the command's effect: `readOnlyHint` for reads, `destructiveHint` for deletes. They are hints to the host and never a gate.
- Tools are listed in a fixed order, and the list is the same for every connection.
- Every refusal carries a code from the error catalog as a field. A shared code names no platform.

**What reaches the model**
- The platform is an input, never a default, in names, guides, plays, error text and hook text.
- Guides, skills, hook files and the harness docs are generated from one source (rule 55). Only sources are edited.
- Text served to hosted clients carries no owner's name, memory or secret (rule 47).
- Injected text stays inside each harness's limits and is written as statements of fact.

**Evidence**
- A claim about the code names its file and line. A claim about a host or a protocol names its page in `sources.md`.
- Current behaviour belongs in its domain spec with code anchors (rule 117). A proposal says what is built and what isn't.
- No real person's name, handle or message in a tracked file (rule 178).

**Checks**
- Each slice adds the check that stops its problem coming back, and the check runs in the hooks.
- Tests use fixtures and stubbed engines. Nothing calls a platform.

## Every file

[fileIndex.md](fileIndex.md) lists every file these proposals name, whether it exists on `main`, and which document names it.

## Rules for whoever builds this

- Read `AGENTS.md` first. camelCase, `{library}/{domain}/` layout, no comments in code, XState for anything over time, commit as the repo owner (rule 4), never `--no-verify`, the devlog entry filled for each commit.
- `LOG_PYTHON` must point at a Python with the engines' packages, for the transport checks.
- No calls to any social platform. Unit tests and fixtures only. Never source `.env.local`.
- Rule 178: no real names, handles or messages in tracked files.
- One slice per PR. Report what was run and what was not.
