---
title: "MCP server"
---

# MCP server

The log MCP server is how every agent works with log-cli: it carries matt's rules into the agent's context, serves the guides and the use cases, names on every tool the rules, guide and use cases it falls under, and the hooks keep agents on it. Active rules 47, 55, 73, 158, 163 and 176 govern current guidance. Retired citations are consolidated into active rules; historical snapshots never restore superseded scope.

## What the server carries

The runtime HTTP server also serves `GET /api/console/events` through `serveLogMcpHttp` in `src/mcp/server/index.ts`. This is a read of the fixed workspace projection in `src/observability/console`, not a platform action or inbox catch-up. It requires the existing workspace-owner static bearer token, returns no private payloads and uses `Cache-Control: no-store`. Legacy OAuth does not authorize this route. A hosted team gateway and paired workspace transport are still pending; see [Usage summaries](../proposals/listeningKitUsage.md).

### REQ-MCP-01: The instructions carry the core rules, rule one first

The server's instructions, sent at initialize, list the core rules each with its rule number, and the first of them is rule one ("if we don't know, we do this", rule 73), followed by rule 30.

Checked by: code and SubQ

### REQ-MCP-02: The instructions send the agent to the full guide first

The instructions say to load `getGuide({ topic: "logMcpInstructions" })` before the other log tools, once per session, and to load a tool's own guide before first using it. They describe `getGuide({ ask })` as it is: it routes the owner's words and loads a play only on a clear match (REQ-MCP-16). The local text and the hosted text are one source, `serverInstructions` in `src/mcp/server/helpers/agentRules.ts` (REQ-MCP-22). Active rule 158.

Checked by: code (anchors)

### REQ-MCP-03: AGENTS.md is the resource log://agents

The server lists `log://agents`, and reading it returns AGENTS.md as it is in the checkout. A client that supports MCP Apps also sees the browser view resource (REQ-MCP-19) and the report resource (REQ-MCP-20).

Checked by: code and SubQ

### REQ-MCP-04: Every tool names the rules it falls under

Every tool's description ends with a line naming AGENTS.md (`log://agents`) and the rules it falls under: its command's own rules from `COMMAND_RULES` and the rules every tool falls under (30, 38, 39, 40, 41), each once. `currentRuleIds` resolves retired references to the active ids, or drops them when no current rule holds their content; `operatingRuleIds` also drops the developer rules (`DEVELOPER_RULES`: code layout, naming, docs, schema), so a tool never cites them as rules for using it; only the `new` command, which writes code, keeps them. Rule numbers written into tool, flow and hook text go through `cite`, which does the same. The core guide carries the scope block (active rules 171/172/175 govern the data boundary).

Checked by: code and SubQ

### REQ-MCP-05: Every tool names its guide

Every tool whose command belongs to a guide topic says in its description to load that guide with `getGuide({ topic })` before first using it. A flow tool names its platform's flows guide (`facebookFlows`, `FLOWS_GUIDE`).

Checked by: code and SubQ

## Guides and use cases

### REQ-MCP-06: getGuide reads a guide or a use case

The `getGuide` tool takes a `topic` (one of the guide topics, read from `docs/guides/<topic>.md`, the core guide when none is given) or a `useCase` (`<platform>/<page>`, read from `docs/useCases/<platform>/<page>.md`), or an `ask` it routes (REQ-MCP-16), or `clearPlay` (REQ-MCP-15), and an unknown one is answered with an error listing the ones there are.

Checked by: code and SubQ

### REQ-MCP-07: Every tool names the use cases that call it

A use case page names its tools in backticks. Every tool named on a use case page carries a line in its description naming those use cases as `getGuide({ useCase: "<id>" })`, placed before its guide line.

Checked by: code and SubQ

### REQ-MCP-08: Every tool declares Claude Code's result limit

Every tool the server lists carries `anthropic/maxResultSizeChars` in its `_meta`, so a guide or a big result arrives whole.

Checked by: code and SubQ

### REQ-MCP-09: The use-case review asks SubQ whether the use cases are stale, when run

Run by hand (`bun run check:useCases`), never in a commit, push or CI (rule 170), `check:useCases` reads the latest Claude Code session for the repo (matt's asks and the tools called) and asks SubQ, for every use case page, whether it is still current, stale or should move, and whether the session did repeatable work no page covers. A stale or misplaced page, or uncovered work, stops the commit unless that page, or a new page, is staged. A commit that stages only the landing site (`site/`) and the commit log (`log.md`, `log/<date>.md`) isn't reviewed (`siteOnly`): site work is never a use case (matt, 2026-11-06).

Checked by: code and SubQ

## Through the MCP only

### REQ-MCP-10: A log command run by hand from a shell is refused

The PreToolUse hook refuses a shell command that runs `log …` or `bun bin/log.ts …`, and names the MCP tool route instead. Active rule 163.

Checked by: code and SubQ

### REQ-MCP-11: The terminal-only prompts are let through

A hand-run command whose name is in `TERMINAL_ONLY` (launch, login, mcp, chat pin, cookies save, messenger pin) is not refused, since matt runs those prompts in a terminal.

Checked by: code and SubQ

### REQ-MCP-12: A stale MCP server is said to matt

When the running MCP server started before the newest change to log-cli's code, the engines hook says so. When no reload proxy is running (rule 167), it tells matt to restart the app and never to work around it with a hand-run command. When the proxy is running, there is no line while the reload is due, a line naming what the reload waits on (a call or a job), or a line saying why the new code didn't start.

Checked by: code and SubQ

## Local changes first

### REQ-MCP-13: Uncommitted local changes are said loudly

The engines hook lists the uncommitted changes in log-cli's code (src, python, vendor, bin, scripts, package.json) under `>>> UNCOMMITTED LOCAL CHANGES`, and says to read each one's diff and never overwrite, revert, stage, publish or ship them without matt. Active rule 163.

Checked by: code and SubQ

### REQ-MCP-14: They are said at session start and whenever they change

The engines hook writes its text at every session start, and on a prompt only when the text differs from the last one it wrote.

Checked by: code and SubQ

### REQ-MCP-18: Any command is found and run with logSearch, logGet and logCall

`catalogTools` in `src/mcp/catalog/index.ts` lists three tools, which the ListTools handler in `src/mcp/server/index.ts` puts right after `getGuide`. `catalogOf` (`src/mcp/catalog/helpers/entries.ts`) makes one entry per command tool from `commandTools`, its `…Live` twin folded in as `liveTool`, with the id `catalogIdOf` gives (`<platform>.<command>.<form words>`, no platform for `any`). Each terminal-only command (`TERMINAL_ONLY`) is an entry too, with `terminalOnly` set and no tool.

- **`logSearch`:** `searchCatalog` (`src/mcp/catalog/helpers/search.ts`) scores the query's words against each entry's id, summary, input names and usage, keeps only the named platform (and `any`) when a platform is named, and answers `strong` when the first result has every word, `closest` when results have at least half, and `none` with up to 3 near misses otherwise.
- **`logGet`:** `renderGet` (`src/mcp/catalog/helpers/view.ts`) answers the entry's inputs, required first, a `logCall` line from `exampleInputs`, a live line when there is a `liveTool`, the CLI form from `cliExample`, its guide and `rulesLine`. A terminal-only entry says matt runs it in a terminal. An unknown id gets `didYouMean`.
- **`logCall`:** `resolveCall` refuses an unknown id, a terminal-only entry, `live` on an entry with no `liveTool`, and any input not among the entry's inputs (naming the ones it takes, and that nothing was run). Otherwise `runToolCall` runs the entry's `tool`, or its `liveTool` when `live` is true, with the inputs and `confirmLive`, `confirmBypass` and `waitMs`, so `guardCall`, `playRefusal`, jobs and claims apply as for that tool, and the play footer names that tool.

Every answer ends with `helpLines`. `src/mcp/catalog/catalog.test.ts` fails when an entry's `exampleInputs` don't pass `guardCall`. matt, 2026-11-07. Rule 163.

Checked by: code and SubQ

### REQ-MCP-21: Every platform's tools carry the platform's name, and renamed tools still answer for one release

`toolBaseName` in `src/cli/runner/helpers/platforms.ts` names a command's tool `<platform><Command>` for every command whose platform is one of `PLATFORMS`, Facebook included (`facebookAccounts`, `facebookCheck`, `facebookPublishLive`), and leaves a shared command (`any`, `byArgument`) its own name. No platform is the one with no name, and no command or account falls back to a platform: `platformOfAccount` throws `accountPlatformMissing` for an account with no platform or an unknown one, `platformLabel` says "the platform" for a shared command, and `titleOf` takes the place it names.

The Facebook tools had bare names until 2026-11-13. `RENAMED_TOOLS` in `src/mcp/server/helpers/toolAliases.ts` is the one table of those old names and their new ones, kept for one release. The ListTools handler lists only the new names. `runToolCall` runs the new tool for an old name and adds a line saying it was renamed; `guardCall` and `entryById` (so `logGet` and `logCall`) take an old name as its new one. `src/mcp/server/toolAliases.test.ts` fails when a platform command's tool lacks its platform, or when the table and the Facebook tools differ. Rule 63.

Checked by: code and SubQ

### REQ-MCP-17: One warm context layer routes the owner's prompts and puts the play back after compaction

`scripts/contextLayer/service.ts` keeps the route index and its embedder loaded on `127.0.0.1` at `CONTEXT_PORT` (`src/contextLayer/service/types.ts`), and answers `/hook` with `hookAnswer` (`src/contextLayer/hook/client.ts`). The UserPromptSubmit hook for `scripts/hooks/useCases.ts` carries `service: "/hook"` in `src/agentHooks/registry/index.ts`. For Codex, `hookCommand` writes `serviceHookCommand`: a curl to the service, with the bun script after `||`. Claude Code reaches it through the event's http hook (as the agent hooks spec says), and `useCasesAnswer` calls the same `hookAnswer`. `routePrompt` in `src/useCases/router/client.ts` is the hook's way into the one router (REQ-MCP-16):
- returns nothing for a text `isPrompt` refuses (`NOT_A_PROMPT`);
- corrects words with `correctTypos` against the index's vocabulary;
- embeds `windowsOf` the prompt and scores each route with `denseScores` (its utterances among the `TOP_K` closest);
- hands those scores to `route` as its optional `dense` signal, which weighs them at `DENSE_WEIGHT` against the word score, with the route's threshold (default `DEFAULT_THRESHOLD`), `AMBIGUITY_BAND` and `DEFAULT_MENU_FLOOR`.

`hookAnswer` writes `playMatchText` for the router's answer: `>>> PLAY MATCH` naming the one play and the `getGuide({ useCase })` that loads it, `>>> MAYBE A PLAY` with the menu, and nothing for neither. The text is statements of fact, not instructions, as Claude Code's hook reference advises ([sources](../proposals/sources.md), row 11). On SessionStart, `hookAnswer` reads the session's transcript with `sessionPlayOf` and returns `playReminder` for the last play it loaded: a `getGuide` call with a `useCase`, or a `getGuide` call with an `ask` whose answer says `>>> PLAY <id> is now this session's play` (`PLAY_LOADED`); a `clearPlay` call ends it. `scripts/useCases/benchRouter.ts` scores the router 5-fold on `~/.logCli/contextLayer/labelledPrompts.json`, kept on the owner's machine and never committed because the repo is public, and reports plays caught, wrong fires on "none", the right play in the top 3 and p50/p95/p99; with `--fit` it writes the threshold that catches the most plays under `FALSE_FIRE_CAP`. matt, 2026-11-07. Rule 159.

The service moves itself onto new code: every `CODE_CHECK_MS` (30 s) it compares log's code stamp (`codeStamp`, and the newest file under `scripts/`) with the one it started on. Once it is newer and no hook request is in flight (`inFlight`), it stops listening, forgets its record (`forgetService`), starts a fresh service with `startService` and exits, so a hook never runs old code for long.

Checked by: code and SubQ

### REQ-MCP-16: One router for the ask path and the prompt hook, and every play is a skill

`route(prompt, context)` in `src/useCases/router/client.ts` is the one router. `getGuide({ ask })` (`askAnswer` in `src/mcp/server/helpers/guideAnswer.ts`) calls it with the use cases alone; the prompt hook calls it through `routePrompt` with the dense scores as well (REQ-MCP-17). It:
- scores each use case by its best phrase: the quoted "How the owner asks for it" phrases and the title (`phrasesOf`), as the share of the phrase's content words the prompt has (`phraseScore`). `contentWords` leaves out stop words, links and `<placeholder>` tokens, and folds plurals and simple endings (`stem`). A one-word phrase counts in full only in a prompt of `SHORT_PROMPT_WORDS` content words or fewer, and a phrase left with one word once its placeholders are gone is not used;
- reads the platforms the prompt names from `PLATFORM_WORDS` (synonyms such as tweet, x, server, guild, workspace, subreddit, marketplace) with `platformsOf`. Plays filed under another platform's folder (`PLATFORM_FOLDERS`) are left out, and plays under a named platform get `PLATFORM_BONUS` in the ranking. Plays with no platform folder (`inbox/`, `web/`) are never left out;
- activates a play only when it is clear: its word score is at least the threshold (`WORD_THRESHOLD`, or `DEFAULT_THRESHOLD` with dense scores), it leads the next play by at least the ambiguity band (`WORD_AMBIGUITY_BAND`, or `AMBIGUITY_BAND`), and its best phrase names no platform the prompt left out. A tie is never broken by folder order: the ranking orders equal scores by platform match and then id only for the menu;
- otherwise returns a menu of up to `MATCHES_SHOWN` at `WORD_MENU_FLOOR` (or `DEFAULT_MENU_FLOOR`) or above, or nothing (`outcomeOf`: the play's id, `menu` or `none`).

`askAnswer` loads the play only on a clear match (REQ-MCP-15). On a menu or none it loads nothing and keeps the play already loaded. `src/useCases/router/fixtures/golden.json` holds the audit's prompts and more, over every platform and prompts with none, each with its expected play, `menu` or `none`; `src/useCases/router/router.test.ts` runs both entry points over it, asserts the same outcome from each, and asserts that no prompt naming one platform activates a play under another platform's folder. The UserPromptSubmit hook `scripts/hooks/useCases.ts`, registered in `src/agentHooks/registry/index.ts`, asks the warm context service for the route (`askRoute`, rule 159), starts the service when it isn't running, and writes the answer through `hookOutput` only when there is text. `scripts/docs/syncSiteSkills.mjs` writes every `docs/useCases/<platform>/<page>.md` as the skill `log-<platform>-<page>` (its description the title and lead, its `when_to_use` the page's own asks or else its title, its body saying to load the play with `getGuide` first) into `.claude/skills/` and `/.well-known/skills/`, and `--check` refuses one out of step. matt, 2026-11-07: "how do the guides get CALLED when I say something". Rule 158.

Checked by: code and SubQ

### REQ-MCP-15: The loaded use case is the caller's play, kept under a handle, and a send needs a play that names it

When `getGuide` loads a use case (with `useCase`, or with an `ask` the router matches clearly), `guideAnswer` makes it the caller's play with `setActivePlay` (`src/mcp/server/helpers/activePlay.ts`), which reads the page's steps table (`stepsOf`: each row's number, step, tools named in backticks, and done when).

Plays live in a store keyed by a play handle (`play_` and 24 random characters, `mintPlayHandle`). Each caller has its own handle (`playScope`): the stdio server's one per process (`processPlayScope`), each HTTP session's server its own owner, and on the hosted runtime one per team and actor (`hostedPlayOwner`, from the dispatch's signed authority). It is never keyed on the `Mcp-Session-Id` header, which the 2026-07-28 revision removes ([sources](../proposals/sources.md), row 7). The `getGuide` answer names the handle; a tool call may pass it back as `playHandle` (`handleOf`, stripped before the command's own inputs are checked), and a handle owned by another caller is ignored. A play is replaced by the next one loaded for that handle, ends with `getGuide({ clearPlay: true })`, and expires after `PLAY_IDLE_MS` (two hours) with no call that used it.

Every other tool's answer then ends with `playFooter` (`withCallFooter` in `src/mcp/server/index.ts`, used by the local CallTool handler and by the hosted `toolRunner` in `src/cli/runtime/index.ts`): the play's id, title and handle, the step this tool is and what counts as done, and the next step with its tools, or that the tool isn't one of the play's steps. The structured result carries it as `play`, and the hosted result keeps `next` (only `browsers` is dropped).

The gate is in `src/mcp/server/helpers/playGate.ts`. A tool acts as the owner (`actingToolsOf`, `actingAsOwnerTools`) when it is a live tool on a platform whose effect is `write` or `delete` (`actsAsOwner`, `OWNER_EFFECTS`), or a live flow whose definition says `effect` (`flowActsAsOwner`; flows are Facebook's, `FLOW_PLATFORM`). Each acting tool has its platform (`platformOfTool`). A hand-run `flowLive` of an acting flow is gated as that flow's tool (`gatedToolOf`).

A play covers a tool (`playCovers`) when its steps name the tool or its dry-run twin, or the play is filed under the tool's own platform folder: a `twitter/*` play covers X tools, a `discord/*` play Discord tools. Plays under `inbox/` and `web/` have no platform and cover only the tools their steps name. A Discord play never unlocks an X send. `playGateMode` then decides:
- `required`: the eight tools the old hand list gated (`PLAY_GATED_ON_MAIN`) need an active play that covers them. `playRefusal` answers `playMissing` with no play and `playNotCovering` with one that doesn't cover the tool. Today all eight are `required`: each is named by a use case or has plays under its platform (`twitterQuoteLive` and `twitterVoiceLive`, named by none, are covered by any `twitter/*` play).
- `anyPlay`: one of the eight that no use case names and no platform play could cover keeps main's behaviour of needing some active play. None is in this case today.
- `ifPlay`: every other acting tool (ungated on main) runs with no play loaded, as on main, with its other gates (`confirmLive`, `approvedBy`, the voice gate, claims, the governor). With an active play that doesn't cover it, it is refused with `playNotCovering`, which names both ways out: `getGuide({ clearPlay: true })`, or loading the play that fits.
- `none`: everything else.

`playRequiredTools` lists the tools that never run with no play (the eight). `unnamedActingTools` lists the acting tools no use case's steps name (13 today); the agnostic scorecard counts them as `actingToolsInNoUseCase`. Refusals name the use cases whose steps name the tool or that are filed under its platform. Every acting tool takes `playHandle` in its schema. X replies and posts in the X plays go through the queue (`twitterQueueRunLive`); a direct `twitterReplyLive` or `twitterPostLive` runs under any `twitter/*` play, or `twitterPostLive` with no play at all. matt, 2026-11-07: the guides were not being called for actions.

Checked by: code and SubQ

### REQ-MCP-19: browserView shows an account's live browser where the person is, and only their own gated input reaches it

`browserView` (`log browser view --account`, `browserCommand` in `src/cli/browser/index.ts`) reads the account's viewer with `viewerState` (`src/browser/viewer/client.ts`). Where the runtime is comes from `browserViewLocation`, which `settleLocation` in `src/mcp/apps/browserView/client.ts` sets once per process: `local` for the stdio server (`startLogMcpServer`), `httpLocation` for the HTTP server (local only on loopback with no token or OAuth), `remote` for the hosted bridge (`runtimeDeps` in `src/cli/runtime/index.ts`). Local: `browserViewText` tells the person to finish the sign-in in the browser window on this machine, `browserViewJson` carries no stream, and `runAppTool` refuses frames and input with `browserViewLocal`. Remote: `browserViewJson` says only which stream there is (`streamKind`), and the voxl descriptor from `streamOf`, whose URL carries voxl's password, reaches the view only through the app-only `browserViewStream` (voxl first); `browserViewFrame` (`viewerFrame`) is the screenshot fallback when there is none. Nothing the model reads carries the voxl URL. When the client advertises the MCP Apps extension (`uiCapable`), `createLogMcpServer` adds `_meta.ui.resourceUri` `ui://log/browserView` to `browserView` (`withBrowserViewUi`), lists `appTools` with `visibility: ["app"]` and the `browserViewResource`; a client without it is refused the app-only tools with `browserViewAppOnly`. `browserViewInput` posts the person's click, text, key or scroll to the viewer's `/input` (`viewerInput`), which `BrowserViewer.input` in `python/browser/browserViewer.py` refuses unless the generation and revision still match and the page still reports a sign-in state, and replays as a recorded `viewerInput` step; input never goes through voxl. `readBrowserViewResource` answers one HTML page built by `widgetHtml` (`src/mcp/apps/browserView/helpers/build.ts`) with `text/html;profile=mcp-app` and a CSP from `browserViewCsp`: no connect domains unless `LOG_VOXL_URL` is https, or http on loopback (`voxlOrigins`). matt, 2026-11-13: the person signs in without leaving the harness, voxl is the stream and screenshots only the fallback, and on their own machine they use the window already open there.

Checked by: code and SubQ

## Reports in the chat

### REQ-MCP-20: report draws a report from log's block catalog in every host, inline where the host can and as markdown where it can't

`report` is a server tool listed to every client (`reportTool` in `src/mcp/apps/report/client.ts`, added by `createLogMcpServer`). Its input is a declarative spec, `{ title, subtitle?, blocks }`, each block one of `REPORT_BLOCK_TYPES` (`heading`, `text`, `stat`, `barChart`, `lineChart`, `table`, `personList`, `callout`): data and layout only, never code. `checkReport` (`src/mcp/apps/report/helpers/schema.ts`) validates it against `reportSchema` (zod, strict objects, `REPORT_LIMITS`), and `runReport` refuses a spec that breaks it with one of `REPORT_REFUSALS` and the paths to fix. A valid spec comes back as `structuredContent`. When the client advertises the MCP Apps extension (`uiCapable`), the tool carries `_meta.ui.resourceUri` `ui://log/report` (`withReportUi`), the resource list has `reportResource`, and the text is `reportSummary`, one line so the model doesn't repeat the numbers. Without it, the text is `reportText` (`src/mcp/apps/report/helpers/text.ts`): markdown headings, the KPI line, tables, people, and unicode bar charts (`bar`) and sparklines (`sparkline`). `readReportResource` answers one HTML page built by `reportHtml` (`src/mcp/apps/report/helpers/build.ts`) with `text/html;profile=mcp-app` and an empty CSP; `reportBodyHtml` (`src/mcp/apps/report/widget/render.ts`) draws every block as escaped HTML and SVG in log's `brandTokens`, and the view follows the host's theme and offers fullscreen when the host lists it. The numbers come from `reportData` (`log report data`, `reportCommand` in `src/cli/report/index.ts`), which reads log.db only through `readTwitterSenders` (`src/inbox/senders/client.ts`): no platform call and no governor use. The server instructions and the `ui` guide topic point the model at it. matt, 2026-11-13: "We are making a generative UI MCP. I go to my harness and say 'generate a report with some bar charts of who has been messaging me on Twitter'." One server, the best presentation each host can show.

The `data` input is read through a registry of sources, `REPORT_SOURCES` (`src/mcp/apps/report/helpers/sources.ts`), and `runReport` dispatches each named entry on its `source` (`readReportSource`); the input schema is one discriminated union, `reportDataSource`. `twitterDmsBySender` reads X one-to-one DMs by sender as before (`readTwitterSenders`). `dmsBySender { platform, account?, since?, limit? }` counts the same for any platform with chats in log.db (`readPlatformSenders`, `src/inbox/senders/client.ts`), and refuses with `reportSourceNoData` when log.db holds no conversation on that platform, never with an empty X answer. `identityProfile { platform, userId | handle }` reads one person's stored row (`readIdentityProfile`, the profile rows in [storage](storage.md)) and draws the `person` starter: no engine is called. A person with no stored profile is refused with `identityProfileMissing`. With no `code`, the first source picks the starter (`sourceStarter`) and the text a host without widgets gets (`sourceBlocks`). Every source reads log.db only.

Agent-written view code can reach only `log` and `react`. `compileView` (`src/mcp/apps/report/view/server.tsx`) refuses a static import from anything else, and `dynamicImportIn` refuses, with `viewImportRefused`, any `import()` (which sucrase turns into a `require` inside a promise), any `import(` left in the compiled code, and any `require` whose argument is not one of `VIEW_MODULES`. At run time `moduleRequire` (`src/mcp/apps/report/view/run.ts`) throws `viewImportRefused` for any other name, so an `import()` that got past the compiler rejects when it is called, in the widget and in the server's text rendering alike. The server-side text rendering still runs the code with `new Function`, so the runtime's globals stay reachable from a view; this is not a sandbox.

On the hosted path, the bridge journals each operation's result in `operations.result` (`journalState`, `src/runtime/bridge/client.ts`). `redactConsoleResult` (`src/console/operations/client.ts`) replaces every top-level field of a result from a tool in `PRIVATE_RESULT_TOOLS` (`report`, `reportData`) with `<redacted>` before it is written, so bios and message text never reach the journal. The live answer to the caller is not redacted; a reconcile read of the journal returns the redacted copy.

Checked by: code and SubQ

## What reaches the model, by capability and platform

### REQ-MCP-22: Guides are scoped by capability and platform, fit every host, and say "the owner"

Shared commands (platform `any` or `byArgument`) are filed under shared guide topics in `GUIDE_TOPICS` (`src/mcp/server/helpers/guides.ts`): `accountBrowser` (inspect, browsers, browser, adsPower, localAccount), `sessions` (sessions, login, logout, whoami), `flows` (flow, warmup), `inbox` (the `inbox*` tools) and `voiceGate` (voice, voiceIndex, voiceAiIndex). A platform topic (`facebook…`, `x…`, `discord` and the rest) holds only its own platform's commands; the flow tools are Facebook's, from their definitions, and sit under `facebookFlows`. Shared topics embed only platform-neutral skills (`inspect`, `adsPower`, `humanMouse`, `flow`, `warmup`); the Facebook parts live in `facebookInspect`, `facebookFlows` and `facebookWarmup`. Each topic names the topics to load next (`next`, rendered by `nextGuidesLine` at the top of the guide). `GUIDE_ALIASES` keeps an old topic name answering for one release (empty today: no topic was renamed).

`renderGuide` keeps every guide under `GUIDE_LIMIT` (50,000 characters: Claude Code saves a larger MCP text result to a file) by structure: one row per tool with its title and usage line, never the tool's whole description (the description is in `tools/list` already); the rules by number and first line (`ruleSummary`), with their full text only in the core guide and AGENTS.md; and the scope block only in the core guide. The whole guide goes through `ownerNeutral`, and rule text through `ruleText`, so served text says "the owner".

Guides are rendered once, deterministically, with shell-only and no-shell blocks marked (`shellOnly`, `noShellOnly`). `readGuide` passes the text through `guideForCaller`: the local server passes `hasShell` of the client to `runToolCall`, and the hosted runtime passes `false`, so a host with no shell is never told to tail a log file.

`serverInstructions` (`src/mcp/server/helpers/agentRules.ts`) writes both instruction texts from the same lines: `local` is `SERVER_INSTRUCTIONS`; `hosted` adds that every tool runs in the team's workspace, starts with `accountsList`, and says each result carries its `progress`. `bun run docs:build` writes the hosted text to `python/controlService/serverInstructions.txt`, which `python/controlService/mcpRoutes.py` reads as `INSTRUCTIONS`; `check:docs` fails when the file is out of date.

`check:platformNeutral` (`scripts/checks/checkPlatformNeutral.ts`, `platformNeutralProblems` in `src/surface/scorecard/helpers/neutral.ts`) fails when any of these scorecard numbers is above zero: shared commands or tools under a platform-named guide, shared commands whose usage, summary or tool note names one platform (a `Platforms:` line listing the platforms in use doesn't count), flow tools with no platform, guides over the limit, dead rule citations in tool descriptions, guides, use cases, skills or hook text, and the owner's name in served text. It runs in pre-commit, pre-push and `bun run check`.

Checked by: code and SubQ

## One result envelope

### REQ-MCP-23: Every result carries its code, platform and capability

`ToolResult` (`src/mcp/server/types.ts`) has `code`, `platform` and `capability`, required in `TOOL_RESULT_SCHEMA`. `code` is the error catalog code of a refusal or failure, null when the call worked or is still running as a job. `refuse` and `refuseInput` (`src/cli/runner/helpers/refuse.ts`) set `CommandResult.error`; `runOne` reports it through `context.refused`, a non-zero result with no code as `commandFailed` (`resultCodeOf`), and `runTimed` puts the first one in the result (`crashed` when the command threw). Guard refusals carry their own (`inputInvalid`, `liveNotConfirmed`, `bypassNotConfirmed`, `terminalOnly`, `toolUnknown`, `playMissing`, `playNotCovering`, `accountBusy`). `platform` is the command's platform, the platform word of a `byArgument` command, or the flow's; `capability` is the command and its form words (`session.check`, `send`, `flow.run`). The hosted relay (`toolRunner`, `src/cli/runtime/index.ts`) returns the result's `code` as its error code, so a refused command no longer reaches a hosted caller as `toolFailed`. `log sessions check` exits 0 when the check ran, whatever it found. Shared codes (`limitInvalid`, `secondsInvalid`, `mediaInvalid`, `crashed`) and every `tool`-layer code name no platform, and catalog text says "the owner". `uncodedRefusals` in the scorecard counts the command refusals under `src/cli/` that still return stderr with no code; it may only go down. Tests: `src/mcp/server/resultCode.test.ts`.

Checked by: code and SubQ
