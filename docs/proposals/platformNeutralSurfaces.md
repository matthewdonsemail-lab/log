# One platform-neutral capability set across the CLI, MCP and console

14 November 2026.

Status: proposal. Slice 1 is merged (PR #133) and slice 0, the scorecard check, is built. Each other slice says below what of it is built. The findings come from read-only audits of `main` on 13 and 14 November 2026; each claim names its file.

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
- **Built, with slice 4.** `src/platformKit/signIn/`: `signInMachine` has the states above, with named guards and actions and `onError` on every invoke; the caller supplies the actors (`signInMachineWith`). `runSignIn` runs it until it ends or waits for the owner; a machine waiting for the owner is kept as its persisted snapshot in `log.db` (`signIn` state rows, thirty minutes) and resumed by the next call, and `done` finishes it (closes the browser, saves, checks again). Routes come from `SIGN_IN_ROUTES` (`src/cli/launch/helpers/start.ts`, next to `signInRouteOf`, which launch still uses): `browser` on every platform with a browser, `cookies` where a prompt exists, X cookies only; a missing route is `signInRouteUnavailable`. Saving: `keepSession` runs `browserSessionGate` (each platform's own session cookies or token, from its `PlatformShape`; Facebook's `c_user` and `xs`) before `savePlatformSession` writes, which now also writes `sessionState` and `sessionCheckedAt` and returns the outcome; every outcome is recorded (`sessionSave` state rows) and read back by the machine's `saving`. Page states: `loginForm` is Facebook's sign-in only on facebook.com, `<platform>Login` (the owner signs in) elsewhere. Surfaces: `log sessions signIn` and the generated `sessionsSignIn`, whose waiting answer names `browserView`; the console's `accountSignIn` takes `browser` as a method and runs the machine for cookies too, the pasted cookies reaching the cookie command through the context (`cookiePrompts`), and closing the console's browser finishes a waiting sign-in; the web console offers Browser check and a browser sign-in on every platform with a browser; the hosted `READ_TOOLS` gain `sessionsCheck`, `sessionsSignIn`, `instagramSessionCheck` and `slackSessionCheck`. The hosted relay already kept `next` (slice 17). Spec: [sessions.md](../specs/sessions.md) REQ-SESSIONS-04 to 08.
- Not built: `sessionsSignIn` answers with text and the next step only; the MCP Apps widget, the URL-elicitation link and `accountNotConfigured` are slice 20. The hosted runtime runs `sessionsSignIn` like any tool, so its browser opens in the workspace; whether the console's `browserOpen` should stand in for it there is slice 20's too. The Python viewer still classifies a password field as `loginForm` on every site (slice 20, a fixture per platform). The web console changes were not built or run here (no `site/apps/web` packages on this machine).

### Slice 4: one check state, one gate, crash-safe

- One state type for all three surfaces: `signedIn | signInNeeded | stopped | unknown | checking | skipped`. The console's `CheckState` and the `SessionVerdict` from PR #131 become this one type.
- One gate function in `src/platformKit/sessionCheck/` decides whether an account may be checked. The console, `sessionsCheck` and the sign-in machine all call it. An account held stopped is never re-hit (rule 94).
- The check machine owns "checking": the row stores the pid and a start time, `onError` records the outcome, and startup reconciles rows whose process is gone (as `src/mcp/jobs/client.ts:119` does for jobs). Busy is a machine state, per account.
- Remove `proofs`, the sign-in `busy` flag and the `shared` singleton in favour of machine state or `log.db`.
- Add `sessions` to LONG_RUNNING so a check of every account runs as a job with progress.
- Remove dead code: `checkStateOf`, `sessionCheckTool`, `accountCheckUnavailable`.
- Done when: killing the process mid-check leaves no stuck row, and the console, CLI and MCP print the same state for every account in one fixture.
- **Built.** `CHECK_STATES` (`src/platformKit/sessionCheck/types.ts`) is the one type; the console's `CheckState` re-exports it, Facebook's old `browserCheck` verdict is `skipped` with `browserCheckRequired`, and old rows (`succeeded`, `running`, `unavailable`) are read as the new names. `sessionGate` is the one gate (`gateReport` for `sessionsCheck`, `checkRefusal` for the console, the sign-in machine through its check, `openBrowser` with `openedByOwner`, which lifts only the last-check rule so the owner can still open a browser by hand). Where the two old rules disagreed, the gate follows rule 94: a last check that the platform refused holds the account until a newer session check, and an `unknown` one does not (the console used to hold both). `sessionCheckMachine` owns "checking": `claimCheck` writes the pid and start time in one transaction, a live holder is `busy` per account, a thrown check is recorded `unknown`, and `readStoredChecks` reconciles a `checking` row whose process is gone. `proofs` is a `browserCheckProof` state row, the sign-in `busy` flag and the cookie-prompt swap are gone (`cookiePrompts` on the context), and the `shared` checker singleton is gone. `sessions` is in `LONG_RUNNING`. Removed: `checkStateOf`, `sessionCheckTool`, `accountCheckUnavailable` (TypeScript, Python and the web client) and `signInBusy`. `verdictOf` reads a failed tool result's `code` (slice 13) instead of matching its stderr, and reads the platform's answer only from `json` inside a result envelope. New catalog codes: `accountCheckBusy`, `accountCheckStopped`, `sessionPlatformInvalid`, `signInRouteUnavailable`, `sessionSaveUnconfirmed`, `browserOperationRefused`; `log sessions check` and `log sessions signIn` exit 0 whenever they ran (the state is in the result), and `signIn` refuses with a code when the machine failed. Spec: [sessions.md](../specs/sessions.md) REQ-SESSIONS-01 to 03.
- Not built: `LONG_RUNNING`, `NO_PROMPT` and `TERMINAL_ONLY` are still keyed by bare command name. Keying `LONG_RUNNING` by `commandKey` needs `check:agentHooks` to read keys (it checks each entry is a command name), and that check was left as it is.

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
- **Built in part (order steps 2 and 3 of capabilitySchema.md).** The table is `CAPABILITIES` in `src/platformKit/capability/`: per capability its noun, verb, effect and canonical inputs (`account`, `chat`, `space`, `limit`), and per platform the command key, form words and the flag each input becomes. `capabilityRows` derives the rows from `COMMANDS` and throws on a binding to a command, form or flag that doesn't exist, so nothing about a command is restated. `choosePlatform` takes the platform from the account (`platformAmbiguous`, `accountPlatformMismatch`, `accountNotFound`), `argvFor` maps the inputs (`capabilityMissing` with `platformsWithIt`, `inputUnsupported`); all four codes are in the error catalog. The read capabilities ship as shared commands from `capabilityCommandOf` (`src/cli/capabilities/`): `log chats list` / `chatsList` (X, Discord, Slack, Instagram, Facebook) and `log messages read` / `messagesRead` (the same five), in the `inbox` guide; `bossMaxxing` names them. Spec: [capabilities.md](../specs/capabilities.md).
- Not built: `messagesWatch`; the write capabilities (`messagesSend`, `messagesReact`, `voiceNotesSend` and their Live twins), which need the play gate to resolve a capability tool to the platform tool it runs (`gatedToolOf`, `actsAsOwner` only counts platform commands) so a shared Live tool can't escape a play that doesn't cover it; keying `TERMINAL_ONLY`, `LONG_RUNNING` and `NO_PROMPT` by command key; per-capability guides; hiding the per-platform tools; renaming use cases beyond `bossMaxxing`.

### Slice 8: every acting capability is a machine

- Each of the 35 acting commands runs through one shared action machine: `gating` (governor, claim, voice gate, play) → `acting` → `confirming` (the platform's answer) → `done | refused | uncertain`. Platforms supply the actors; the states are the same everywhere.
- The X queue machine drives the run instead of tracing it.
- **Built in part.** `actionMachine` / `runAction` in `src/platformKit/action/`: `gating` → `acting` → `confirming` → `done | refused | uncertain`, promise actors supplied by the caller, named guards and actions, `onError` on every invoke; a throwing gate is refused with nothing acted, a throwing act or confirm is uncertain, `confirmAnswer` lets only an ok platform answer through. The react and voice note factories run every live call through it (8 commands), so `liveCommandsWithoutMachine` is 16, down from 24. Spec: [platformActions.md](../specs/platformActions.md).
- Not built: the text sends (`twitter dm`, `discord send`, `slack send`, `instagram send`: multi-part sends with interruption and fencing, each in a file shared with other commands), the X post/reply/quote/like/follow/list/repost commands, Reddit post/reply/vote, `discord delete`, `facebook campaign`, and the X queue machine driving its run.

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
- **Built.** `accountWatcherMachine` in `src/platformKit/watcher/`: `starting` (the claim, `claimWatcher` on the `owners` row, is its `claimRefused` guard, so a second watcher ends in `busy` with the holder and connects nothing) → `running` (the platform's `connect` invoked for the socket's life, holding `catchingUp` → `live` ⇄ `reconnecting`; `dropped`, `opened`, anything `heard` while reconnecting, and a `recheck` guarded by `behind`) → `releasing` → `stopped | signInNeeded | coolingDown | failed`; named guards and actions, `onError` on every invoke. `watchEndOf` maps the engine's answer: `sessionDead`/`noPlatformSession`/`noSession`/`sessionMismatch` → `signInNeeded`, `rateLimited`/`governorBlocked` → `coolingDown`. `ownOrAttach`, where the four watch commands meet, runs the machine: its actors are the claim, the relay plus the platform's own watch, the catch-up as owner and the release; events are decoded by `socketEventOf` (a platform may pass its own `decode`). The relay writes the machine state into the `owners` row (`starting`, `catchingUp`, `live`, `reconnecting` replace `connecting`/`streaming`), the end is a `watcherEnd` state row, and `reconcileWatchers` marks a row whose process is gone `stopped` (`watcherGone`). The four hand-written start functions are one `startWatcher` over `WATCH_COMMANDS`, and `superviseWatchers` (hung owners, stale code, then start, skipping cooling and held accounts) is the one start: called by the Claude Code and Codex hook, by `log watchers start`, and by `log runtime connect` through `watchersStart` when it connects and every minute after. Shared commands: `log watchers status|start|stop [--platform] [--account]` (`watchersStatus`, `watchersStart`, `watchersStop`; `stop` holds the account until `start` names it again; a platform with no push watcher is `capabilityMissing`), `messagesWatch { platform?, account, chat?, space?, seconds }` as a `CAPABILITIES` entry over `twitter chat watch`, `discord watch`, `slack watch` and `instagram watch` (so X's watch reaches MCP; `seconds`, 5 to 3600 and 60 when left out, is a new canonical input; `messages` is in `LONG_RUNNING`), and `log inbox pending --reader` (`inboxPending`), the same `readPending` the hook now calls. Spec: [watchers.md](../specs/watchers.md) REQ-WATCH-01 to 07.
- Not built: the slice 9 harness adapters (Hermes `pre_llm_call`, Cursor `sessionStart`) that would call `watchersStart` and `inboxPending`, since slice 9 isn't built; `signInNeeded` from a watch is not yet written into the session check's row for the account (the watcher knows the accountName, the check row is keyed by the console account id), so `sessionsCheck` doesn't see it until its next check; a 401 that arrives mid-stream as an event (rather than ending the watch) stays `live` until the engine ends the watch; the hosted relay's `READ_TOOLS` don't list the new tools; `facebook watch` (the listing monitor) is not a messages watcher and is left as it is.

### Slices 11 to 15: the CLI and the MCP say and do the same thing

The evidence, with every file, is in [schemaParityAudit.md](schemaParityAudit.md). An MCP call runs the CLI in the same process, so the parser is shared; the gaps are in the schema, the result and the gates around it.

**Slice 11: one schema source, tested through `run` (built).**
- Built: `FlagSpec` kinds are `string`, `integer`, `number` (with `min`/`max`), `boolean`, `booleanValue` (`true`/`false`), `enum`, `list` and `pairs`; a string or list item takes a `pattern` (with the words it `takes`) or a `format` (`date`, `time`, `dateOrSpan`, `jsonObject`); a form takes `groups` (`atLeastOne`, `atMostOne`), `counts` (`inspect do` values per action, from the action's own arity) and `terminalOnly`. A flag keeps the refusal code it already had (`limitInvalid`, `secondsInvalid`, `messageInvalid`, `userIdInvalid`, `tweetUrlInvalid`, `notificationQueryInvalid`, `tregParamsInvalid`, `tregTrimInvalid`, `listInvalid`, `textMissing`); everything else is the one new code, `inputInvalid`. The contract is REQ-COMMAND-15 to 20 in [the command shape spec](../specs/commandShape.md).
- `parseArgs` parses once, by the form its words pick, into `values`; a repeated scalar flag is refused on every spec; `pairs` and `global` flags are in `parserSpecOf`. The commands the audit listed read `numberOf`, `listOf` and `truthOf`, with their range limits moved into the spec. `check:agnostic` counts a flag declared `string` read through `Number(...)` or `.split(",")` (`stringFlagReparses`): 32 on the integration branch, 0 now.
- `inputSchemaOf` emits `integer`/`number` with `minimum`/`maximum`, arrays, `pattern` and `format`. Groups and counts are a sentence on each property and never a top-level `anyOf`: some providers refuse a combinator at the top of a tool's input, and which accept it is not verified per host ([sources.md](sources.md) row 6). Groups are declared on `redditVote`, `instagramSend`, `twitterListAdd` and `voice`; slice 12 added them on `proxyAssign`, `facebookCapture`, `facebookPoll` and `facebookJoinGroup`.
- `approvedBy` is required on 24 `*Live` schemas, not 25: `tregCallLive` runs a free endpoint without it.
- For one release the MCP layer coerces `"20"` to 20, `"a,b"` to a list and `"true"` to true; the hook prompts, the use cases under `docs/useCases/`, the knowledge-base skill and the site's examples now send typed values (`limit: 20`, lists as arrays).
- `docs/reference.md` lists each flag from the input forms with its kind and range. `log console --web`, `--port` and `--noOpen` are a terminal-only form. `facebook read --worker` is not an accepted flag (it is refused with the command it became), so it needs no form.
- `src/cli/runner/runRoundTrip.test.ts` drives every non-live form tool through its command's own `run` with stubbed engines, Twenty, treg and fetch in a temporary home: a minimal input, each optional field on its own, and each bound at its minimum, maximum and one past. On the integration branch it finds 53 refusals across 29 tools; now none. Skipped: `inspectStart`, `facebookHostStart` and `mediaDescriber`, which start a process.
- `facebook read`, `facebook host` and `job` read their integer flags through the typed values too, with the ranges in the spec.
- The raw `args` commands got their forms in slice 12.
- Files: `src/cli/runner/types.ts`, `src/cli/runner/helpers/{flagValues,commandInput,parseArgs}.ts`, `src/cli/runner/{commandInput,runRoundTrip}.test.ts`, `src/surface/catalog/index.ts`, `src/surface/readme/index.ts`, `src/surface/scorecard/helpers/flagReparses.ts`, `src/mcp/server/helpers/{toolsFromCommands,guardCall}.ts`, `src/mcp/catalog/helpers/{entries,examples}.ts`, and the commands under `src/cli/` that re-parsed a flag.

**Slice 12: every tool has named inputs (built).**
- Built: the 20 commands behind the 25 raw `args` tools declare input forms, and the CLI parses the same forms, so `argsTools` is 0 (it was 25) and the scorecard keeps it there. A command with sub-commands is one tool per form (`adsPowerSync`, `localAccountAdd`, `proxyAssign`, `facebookCampaignRunLive`, `facebookLifecycleStates`, `flowRun`/`flowRunLive`, `facebookJoinGroup`/`facebookJoinGroupLive`, `facebookProfileSetup`/`facebookProfileSetupLive`, …); the rest keep their name with typed fields. The contract is REQ-COMMAND-21 in [the command shape spec](../specs/commandShape.md).
- The redesigns: `flow` is five forms, and a per-flow tool runs `flowRun` with named fields (`set` is a `pairs` input), not `args`. `join` is one form, `join group`, with `show`, `answer` and `fill` an `atMostOne` group and `set` the answers. `warmup` keeps its two tools with one typed form: `platform`, `activity` and `step` are enums, the ranges are patterns, the chances are numbers 0 to 1, and `live` and `likes` are both live flags. The multi-step join state and a per-activity warm-up form are not redesigned further.
- The old 25 names keep running their command from `args` for one release, unlisted, with the live and bypass checks, and say which tools replaced them. The use cases name the new tools.
- Flow tools enter the catalog as `<platform>.flow.<name>` (`flowEntries`), `logCall` resolves them, and `logSearch` ranks a recorded flow below the commands.
- Found: `localAccountPull` reads Twenty with its own client, not the context's, so the round-trip test skips it; `facebookWatch` with `checks` 0 watches until stopped and is skipped too. `adsPower sync --apply` and `preflight --apply` still act with no live flag (slice 14).
- Files: `src/cli/{auth,live,watch,adsPower,localAccount,lifecycle,preflight,proxy,capture,poll,campaign,profile,errors,flow,join,warmup}/`, `src/mcp/server/helpers/{toolsFromCommands,toolsFromFlows,guardCall,toolAliases,playGate}.ts`, `src/mcp/catalog/helpers/{entries,search}.ts`, `src/mcp/catalog/index.ts`, `docs/useCases/**`.

**Slice 13: one result envelope, with error codes (built, in part).**
- Built: `ToolResult` has `code`, `platform` and `capability`, required in the output schema. `refuse` sets the code as a field (`CommandResult.error`), parse refusals go through `refuseInput` (85 call sites) and 117 more input refusals carry `inputInvalid`, `runCli` reports the code through `context.refused`, and a refusal with no code of its own is `commandFailed`. Guard, play and busy refusals carry their own codes. The contract is REQ-MCP-23 in [the MCP server spec](../specs/mcpServer.md).
- The hosted relay returns the result's `code` as its error code instead of `toolFailed`.
- Shared codes name no platform (`limitInvalid`, `secondsInvalid`, `mediaInvalid`, `crashed`), the new `tool` layer holds `inputInvalid`, `commandFailed`, `toolUnknown`, `terminalOnly`, `liveNotConfirmed`, `bypassNotConfirmed`, `playMissing` and `playNotCovering`, and catalog, guard and `browserLines` text says "the owner". `log sessions check` exits 0 when the check ran.
- Not built: 236 command refusals under `src/cli/` still return stderr with no code field (`uncodedRefusals` in the scorecard, which may only go down); they reach a caller as `commandFailed`. One answer shape per capability on every platform (the engines in `python/*Api/engine.py` and the send, read, react and session commands) is not built. `src/platformKit/sessionCheck/client.ts` still reads a code from stderr when the answer has none (left to slices 3 and 4, which own that file). `getGuide` and `report` don't use the envelope yet.
- Files: `src/mcp/server/{types,index}.ts`, `src/mcp/server/helpers/guardCall.ts`, `src/cli/runner/{types,client}.ts`, `src/cli/runner/helpers/refuse.ts`, `src/errors/catalog/types.ts`, `src/cli/runtime/index.ts` (one line), `src/cli/sessions/index.ts`, `src/surface/scorecard/helpers/uncodedRefusals.ts`, and the commands under `src/cli/`.

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
