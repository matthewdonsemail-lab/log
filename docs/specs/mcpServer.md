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

The instructions say to load `getGuide({ topic: "logMcpInstructions" })` before the other log tools, once per session. Active rule 158.

Checked by: code (anchors)

### REQ-MCP-03: AGENTS.md is the resource log://agents

The server lists `log://agents`, and reading it returns AGENTS.md as it is in the checkout. A client that supports MCP Apps also sees the browser view resource (REQ-MCP-19) and the report resource (REQ-MCP-20).

Checked by: code and SubQ

### REQ-MCP-04: Every tool names the rules it falls under

Every tool's description ends with a line naming AGENTS.md (`log://agents`) and the rules it falls under: its command's own rules from `COMMAND_RULES` and the rules every tool falls under (30, 38, 39, 40, 41). `currentRuleIds` resolves retired references to the active ids in the MCP generator's consolidated mapping. Generated guides use active rule text and distinguish current legacy command behavior from the native hosted target; active rules 171/172/175 govern the data boundary.

Checked by: code and SubQ

### REQ-MCP-05: Every tool names its guide

Every tool whose command belongs to a guide topic says in its description to load that guide with `getGuide({ topic })` before first using it. A flow tool names the flows guide.

Checked by: code and SubQ

## Guides and use cases

### REQ-MCP-06: getGuide reads a guide or a use case

The `getGuide` tool takes a `topic` (one of the guide topics, read from `docs/guides/<topic>.md`, the core guide when none is given) or a `useCase` (`<platform>/<page>`, read from `docs/useCases/<platform>/<page>.md`), and an unknown one is answered with an error listing the ones there are.

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

### REQ-MCP-17: One warm context layer routes matt's prompts and puts the play back after compaction

`scripts/contextLayer/service.ts` keeps the route index and its embedder loaded on `127.0.0.1` at `CONTEXT_PORT` (`src/contextLayer/service/types.ts`), and answers `/hook` with `hookAnswer` (`src/contextLayer/hook/client.ts`). The UserPromptSubmit hook for `scripts/hooks/useCases.ts` carries `service: "/hook"` in `src/agentHooks/registry/index.ts`. For Codex, `hookCommand` writes `serviceHookCommand`: a curl to the service, with the bun script after `||`. Claude Code reaches it through the event's http hook (as the agent hooks spec says), and `useCasesAnswer` calls the same `hookAnswer`. `routePrompt` in `src/useCases/router/client.ts`:
- returns nothing for a text `isPrompt` refuses (`NOT_A_PROMPT`);
- corrects words with `correctTypos` against the index's vocabulary;
- embeds `windowsOf` the prompt;
- scores each route with `denseScores` (its utterances among the `TOP_K` closest) and `sparseScores`, at `DENSE_WEIGHT`;
- names matches at or above the route's threshold (default `DEFAULT_THRESHOLD`);
- otherwise gives a `menu` of the `MATCHES_SHOWN` closest at or above `DEFAULT_MENU_FLOOR`.

`playMatchText` writes `>>> PLAY MATCH` for matches, `>>> MAYBE A PLAY` for a menu, and nothing for neither. On SessionStart, `hookAnswer` reads the session's transcript with `sessionPlayOf` and returns `playReminder` for the last play it loaded. `scripts/useCases/benchRouter.ts` scores the router 5-fold on `~/.logCli/contextLayer/labelledPrompts.json`, kept on matt's machine and never committed because the repo is public and reports plays caught, wrong fires on "none", the right play in the top 3 and p50/p95/p99; with `--fit` it writes the threshold that catches the most plays under `FALSE_FIRE_CAP`. matt, 2026-11-07. Rule 159.

The service moves itself onto new code: every `CODE_CHECK_MS` (30 s) it compares log's code stamp (`codeStamp`, and the newest file under `scripts/`) with the one it started on. Once it is newer and no hook request is in flight (`inFlight`), it stops listening, forgets its record (`forgetService`), starts a fresh service with `startService` and exits, so a hook never runs old code for long.

Checked by: code and SubQ

### REQ-MCP-16: The prompt is matched to a play, and every play is a skill

`matchPlays` in `src/useCases/router/client.ts` scores a prompt against every use case from `listUseCases` by content words (`contentWords`, stop words and links left out) over each page's quoted "How the owner asks for it" phrases and its title (`phrasesOf`), keeps those at `MATCH_FLOOR` (0.6) or above, best first, at most `MATCHES_SHOWN` (3). `playMatchText` turns matches into a `>>> PLAY MATCH` line telling the agent to load the top one with `getGuide({ useCase })` before anything else, a menu of near misses into a `>>> MAYBE A PLAY` list, and says nothing when there is neither. The UserPromptSubmit hook `scripts/hooks/useCases.ts`, registered in `src/agentHooks/registry/index.ts`, asks the warm context service for the route (`askRoute`, rule 159), starts the service when it isn't running, and writes the answer through `hookOutput` only when there is text. `scripts/docs/syncSiteSkills.mjs` writes every `docs/useCases/<platform>/<page>.md` as the skill `log-<platform>-<page>` (its description the title and lead, its `when_to_use` the page's own asks or else its title, its body saying to load the play with `getGuide` first) into `.claude/skills/` and `/.well-known/skills/`, and `--check` refuses one out of step. matt, 2026-11-07: "how do the guides get CALLED when I say something". Rule 158.

Checked by: code and SubQ

### REQ-MCP-15: The loaded use case is the session's play, and sends need one

When `getGuide` is called with a `useCase`, `runToolCall` in `src/mcp/server/index.ts` makes it the active play with `setActivePlay` (`src/mcp/server/helpers/activePlay.ts`), which reads the page's steps table (`stepsOf`: each row's number, step, tools named in backticks, and done when). Every other tool's answer then ends with `playFooter`: the play's id and title, the step this tool is and what counts as done, and the next step with its tools, or that the tool isn't one of the play's steps. A tool in `PLAY_REQUIRED` (the live sends as matt) is refused by `playRefusal` with `playMissing` while no play is loaded, naming the use cases whose pages name that tool. matt, 2026-11-07: the guides were not being called for actions. Rule 157.

Checked by: code and SubQ

## The live browser in the chat

### REQ-MCP-19: browserView shows an account's live browser where the person is, and only their own gated input reaches it

`browserView` (`log browser view --account`, `browserCommand` in `src/cli/browser/index.ts`) reads the account's viewer with `viewerState` (`src/browser/viewer/client.ts`). Where the runtime is comes from `browserViewLocation`, which `settleLocation` in `src/mcp/apps/browserView/client.ts` sets once per process: `local` for the stdio server (`startLogMcpServer`), `httpLocation` for the HTTP server (local only on loopback with no token or OAuth), `remote` for the hosted bridge (`runtimeDeps` in `src/cli/runtime/index.ts`). Local: `browserViewText` tells the person to finish the sign-in in the browser window on this machine, `browserViewJson` carries no stream, and `runAppTool` refuses frames and input with `browserViewLocal`. Remote: `browserViewJson` says only which stream there is (`streamKind`), and the voxl descriptor from `streamOf`, whose URL carries voxl's password, reaches the view only through the app-only `browserViewStream` (voxl first); `browserViewFrame` (`viewerFrame`) is the screenshot fallback when there is none. Nothing the model reads carries the voxl URL. When the client advertises the MCP Apps extension (`uiCapable`), `createLogMcpServer` adds `_meta.ui.resourceUri` `ui://log/browserView` to `browserView` (`withBrowserViewUi`), lists `appTools` with `visibility: ["app"]` and the `browserViewResource`; a client without it is refused the app-only tools with `browserViewAppOnly`. `browserViewInput` posts the person's click, text, key or scroll to the viewer's `/input` (`viewerInput`), which `BrowserViewer.input` in `python/browser/browserViewer.py` refuses unless the generation and revision still match and the page still reports a sign-in state, and replays as a recorded `viewerInput` step; input never goes through voxl. `readBrowserViewResource` answers one HTML page built by `widgetHtml` (`src/mcp/apps/browserView/helpers/build.ts`) with `text/html;profile=mcp-app` and a CSP from `browserViewCsp`: no connect domains unless `LOG_VOXL_URL` is https, or http on loopback (`voxlOrigins`). matt, 2026-11-13: the person signs in without leaving the harness, voxl is the stream and screenshots only the fallback, and on their own machine they use the window already open there.

Checked by: code and SubQ

## Reports in the chat

### REQ-MCP-20: report draws a report from log's block catalog in every host, inline where the host can and as markdown where it can't

`report` is a server tool listed to every client (`reportTool` in `src/mcp/apps/report/client.ts`, added by `createLogMcpServer`). Its input is a declarative spec, `{ title, subtitle?, blocks }`, each block one of `REPORT_BLOCK_TYPES` (`heading`, `text`, `stat`, `barChart`, `lineChart`, `table`, `personList`, `callout`): data and layout only, never code. `checkReport` (`src/mcp/apps/report/helpers/schema.ts`) validates it against `reportSchema` (zod, strict objects, `REPORT_LIMITS`), and `runReport` refuses a spec that breaks it with one of `REPORT_REFUSALS` and the paths to fix. A valid spec comes back as `structuredContent`. When the client advertises the MCP Apps extension (`uiCapable`), the tool carries `_meta.ui.resourceUri` `ui://log/report` (`withReportUi`), the resource list has `reportResource`, and the text is `reportSummary`, one line so the model doesn't repeat the numbers. Without it, the text is `reportText` (`src/mcp/apps/report/helpers/text.ts`): markdown headings, the KPI line, tables, people, and unicode bar charts (`bar`) and sparklines (`sparkline`). `readReportResource` answers one HTML page built by `reportHtml` (`src/mcp/apps/report/helpers/build.ts`) with `text/html;profile=mcp-app` and an empty CSP; `reportBodyHtml` (`src/mcp/apps/report/widget/render.ts`) draws every block as escaped HTML and SVG in log's `brandTokens`, and the view follows the host's theme and offers fullscreen when the host lists it. The numbers come from `reportData` (`log report data`, `reportCommand` in `src/cli/report/index.ts`), which reads log.db only through `readTwitterSenders` (`src/inbox/senders/client.ts`): no platform call and no governor use. The server instructions and the `ui` guide topic point the model at it. matt, 2026-11-13: "We are making a generative UI MCP. I go to my harness and say 'generate a report with some bar charts of who has been messaging me on Twitter'." One server, the best presentation each host can show.

Checked by: code and SubQ
