# runsAndEvidence

What runs leave behind: run folders and pruning, captures and request docs, error codes, jobs, every call's timings, log.db's typed tables checked and rebuilt from its events, and the MCP server itself.

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "inbox/voiceNote" })` | Sending a voice note | "send <person> a voice note saying …", "voice note him that …", "send a vn to the group saying …" |
| `getGuide({ useCase: "instagram/newPlatform" })` | Bringing a new platform up, then vendoring its client | "make a new platform via the MCP for <platform>", "open <platform> in AdsPower", "find me via the gh api the most likely to go into the vendor", "make it work" |
| `getGuide({ useCase: "twitter/dmInbox" })` | Reading the DM inbox: who is waiting on you | "who is waiting on me", "check my x dms", "go through my twitter inbox and tell me who needs a reply", "who am I waiting on in my dms". |
| `getGuide({ useCase: "twitter/getTheAction" })` | Getting people to do the thing: retweet, like, try it | "get me all them people who liked it ... yo cool to see that you liked that, would you give that a wee retweet", "notifications: people who like, comment, reply", "go through all the people there who need a message", "get them to retweet the thing", "would you do me a favour and give it a wee retweet", "I need them to retweet it so I can get some inbound leads", "I don't know what they're even talking about, explain the context", "make them do the action I need", "get the full context of everything on the account at the time of sending the message". |

## The tools in this guide

Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.

| Tool | What it does | Usage |
|---|---|---|
| `errors` | The error catalog | `log errors [--layer <account\|listing\|photo\|form\|captcha\|runtime\|twenty\|proxyVendor\|auth\|profile\|tool>] [--code <code>] [--json] [--markdown]` |
| `graph` | Print a machine's states and transitions as a Mermaid diagram | `log graph <publish\|monitor>` |
| `facebookCapture` | Read a run's raw HAR and its scripts with offline rea, settle a run's… | `log facebook capture --har <path> [--out <dir>] [--noRea] [--json]` |
| `runsList` | Every recorded run | `log runs [list] [--json]   (every recorded run: its size, settled by rea, in the request docs, and why it is kept or that it may go)` |
| `runsExchanges` | Take every recorded step's internal API calls | `log runs exchanges   (takes every recorded step's internal API calls, what was sent and what came back, out of its HAR into exchanges.json, for every run still on disk; prune does it first too)` |
| `runsPrune` | Delete each analysed run after taking out its steps' exchanges… | `log runs prune [--before <YYYY-MM-DD>] [--apply]   (deletes each analysed run, started before the day when given, after taking out every step's exchanges, keeping its findings.md, steps.jsonl, settle.json, every step's exchanges.json, reading.json and readingState.json, its goalFindings and its requests by domain; a dry run unless --apply)` |
| `runsSpace` | The size of the runs folder and the disk's free space | `log runs space   (the size of ~/.logCli/runs and the disk's free space, as the storage hook says them)` |
| `storageVerify` | Replay every event into a scratch copy and compare each typed table… | `log storage verify [--json]   (replays every event in ~/.logCli/log.db into a scratch copy and compares each typed table, row by row, with the live one; nothing is changed)` |
| `storageRebuild` | Clear the typed tables and replay every event into them, in one… | `log storage rebuild [--apply] [--json]   (clears the typed tables (messages, attachments, chats, identities, memberships, interactions) and replays every event into them in order, in one transaction; a verify unless --apply)` |
| `timing` | Where the time goes | `log timing [--tool <name>] [--hours <n>] [--stages <n>] [--json]   (p50, p95 and p99 for every tool call, and for every stage inside it: the guards, the voice gate, each fetch, the Python start, the session host's queue, lock, spacing and governor, each platform request; newest --hours, default 24)` |
| `jobStatus` | A long run's status, the lines after afterLine, and its result once… | `log job status <jobId> [--afterLine <n>] [--waitMs <ms>] [--json]   (a long MCP run: its status, the lines after afterLine, and its result once it ends; waits up to waitMs, default 10000, for something new)` |
| `jobCancel` | Stop a long run at its next browser step | `log job cancel <jobId>   (stops it at its next browser step; never once Publish is clicked, rule 8)` |
| `jobList` | The latest jobs | `log job list [--json]   (the latest jobs)` |

## The work, step by step: runs

From `skills/runs/SKILL.md`.

## runs

Every action records a raw HAR (rule 19): a warm-up run is about 1.5 GB,
an inspect run up to 1.4 GB. On 2026-10-22 they reached 12.5 GB, the disk had
2 GB left and AdsPower refused to start Bethlehem's browser.

### The loop

1. **Analyse** (rule 25): a run may go only when rea settled it
   (`settle.json`: every step read, findings.md written) and the request docs
   hold its requests (`docs/platforms/facebook/operations.json` built after it).
   - Not settled: `log facebook capture --settle <its capture folder>`.
   - Not in the docs: `log facebook capture --docs`, then write any request's
     reasoning it asks for.
2. **Look:** `log runs` lists each run with `may go` or why it is kept (still
   being written, not settled, not in the docs).
3. **Prune:** `log runs prune --apply` (`--before <YYYY-MM-DD>` keeps the
   runs from that day on). First it takes every step's internal API calls
   out of its HAR (`exchanges.json`: what was sent and what came back, rule
   73), the same as `log runs exchanges` does for every run on disk. A run
   with a step HAR it can't read is not pruned. Each pruned run leaves:
   - `~/.logCli/runs/kept/<action>/<run>/`: findings.md, steps.jsonl,
     settle.json, pruned.json, goalFindings.md and .jsonl, every inspect
     step's `steps/<step>/exchanges.json`, `reading.json` and
     `readingState.json`, and every settle cut's
     `<browser>/steps/<step>.exchanges.json` (2 MB for 11 steps, against
     1.2 GB of HAR);
   - one line in `~/.logCli/runs/pruned.jsonl`: size, settled, documented, and
     its requests counted by docs domain (`groups`, `reels`, `checkpoint`…).

   A request's doc keeps what its pruned runs showed. The docs build folds
   every request's fields and sightings into `~/.logCli/rea/clientFacts.json`
   (local: run ids carry account ids). Each run is counted once, a request
   seen again only adds its new rows, and a field a later build couldn't read
   (the bundle wasn't captured) keeps what was known. Without the store, a
   request starts from its committed doc (`factsFromDoc`). The store also
   keeps each request's newest 3 real exchanges (one per step: what it sent
   and what came back, secrets and signed link tokens out, each cut to 6,000
   characters by depth), and its doc shows them under "What it sent and what
   came back". First seen
   2026-10-22: a rebuild after the prune had cut FBYRPTimeLimitsEnforcementQuery
   from 17 runs to 1.

### The hook

`scripts/hooks/storage.ts` (SessionStart, UserPromptSubmit, `src/agentHooks/registry`)
says in the agent's context when `~/.logCli/runs` holds over 2 GB or the disk
has under 5 GB free (`storageVerdict`), measured at most every 15 minutes.
`log runs space` prints the same.

### Tests

`bun test` loads `scripts/tests/preload.ts` (bunfig.toml), which points
`LOG_RUNS_DIR` at a scratch folder: tests never write into the real runs
again (the profile tests had left about 76 `galwayOne` folders there).

Code: `src/browser/runStore`, `src/cli/runs`. The requirements: [docs/specs/runsAndRea.md](../../docs/specs/runsAndRea.md).

## The work, step by step: reaCapture

From `skills/reaCapture/SKILL.md`.

## reaCapture

The point of this work: use REA on real captures of our own Facebook client
to find out what the create page actually does, then score design changes
with SubQ so the client gets as efficient as it can. The work is based on
live runs. log-cli already knows much of the flow
(`docs/listingPublish/`, `src/marketplace/publish/machine.ts`). The
captures test that knowledge and find what it misses.

Why a HAR plus scripts, read offline: `docs/rea/matrix/` and
`docs/rea/spec.md`.

### Hard boundaries

1. **Captures are raw (rule 19).** The HAR keeps every cookie, header,
   token and body. Nothing is stripped, because the analysis needs it. It
   stays on the owner's development machine in the run folder
   (`~/.logCli/publish/<run>/<browser>`) and is never committed.
2. **Captures come from every browser action (rule 19)**: inspect, flow,
   host, warm-up, `facebookConnect`, `facebookScan`, `facebookStatus`, each
   `facebookWatch` check and `log facebook publish` (dry run unless `--live`,
   rule 8). There is no flag to skip it. Those runs follow the launch rules
   as they are (rule 35): headed, proxy in country, self-check, waking hours.
3. **REA reads files, never the window.** No CDP, no attach. The rea
   commands that need a live target (`inspect-web-page`,
   `analyze-web-bundle`, `observe-web-*`, `export-web-scripts`) aren't
   used on the account's browser.
4. **Listen, don't replay.** A capture never sends a request of its own.

### Environment

- `rea --version` prints `6.7.0` (`npm install --global rea-agents@6.7.0`).
  Frida's postinstall is skipped. The HAR and script commands don't need it.
- SubQ: `SUBQ_API_KEY` in the environment, `POST https://api.subq.ai/v1/systemone`,
  model `subq-snap-preview`, 1-16 questions per call. Pattern:
  `docs/rea/matrix/runMatrix.mjs`.
- Code: `src/rea/capture/` (`exportScripts`, `settleCapture`,
  `captureFromHar`), `src/cli/capture/`, and the `record_har_*`
  arguments in `python/session/publishSession.py`.

### The loop

#### 1. Capture (live)

Any action records one. Through the MCP, `mcp__log__facebookConnect` /
`facebookScan` / `facebookPublish` do the same.

```bash
log facebook connect --account <a> --noPrompt   # the login, step by step
log facebook scan --account <a>
log facebook publish <listingId>                # dry run; the HAR records the whole session
```

Where: `~/.logCli/runs/<action>/<time>_<account>/<browser>/` (`adsPower`, `camoufox`, or `firefox` for runs before 2026-10-20) (`LOG_RUNS_DIR`
moves it; a watch has `check<N>/` per check), and publish's
`~/.logCli/publish/<run>/<browser>/`. The command's last lines name the folder.

Per action: the Python writes each log line, timed, to `steps.jsonl` (what
the run did: page reached, email typed, submitted, code typed...). After the
run, `settleRunCapture` cuts `session.har` by those times into
`steps/NN_<action>.har` (each request goes to the step it started in; quiet
steps are left out), runs `rea inspect-web-network-capture` on each one
(`steps/NN_<action>.rea.json`), and lists them in run order in
`steps/index.json`. Read a step's rea output to see exactly what Facebook
did for that one action, e.g. which GraphQL operations the login submit
fired.

The run folder gets `<browser>/session.har` (raw), `<browser>/scripts/scriptN.js`,
`<browser>/scriptsManifest.json` and `<browser>/reaNetwork.json`, and the exit
notes print
`Capture: N requests, M scripts, raw HAR kept. REA ...`.

#### 2. Read with rea (offline)

`log facebook publish` runs these itself. To re-run on any HAR:

```bash
log facebook capture --har <path> --out <dir>      # --noRea to only write the files
rea inspect-web-network-capture <absolute>/session.har har --format json
```

Never `rea analyze-javascript-application` on a run's whole `scripts/`: it
timed out after 10 minutes on 50 MB of bundles (2026-10-19). Facebook's code
is read per request instead (step 2b).

- `reaNetwork.json` → `normalized_result.records[]`, one per request:
  method, URL, status, mime, timings, and the request body. On Facebook
  the operation is in the body of `POST /api/graphql/`
  (`fb_api_req_friendly_name`, `doc_id`, `variables`). rea blanks the
  values of the auth headers and cookies it knows in its own output. The
  HAR still has them. Keep the `evidence_id`.

#### 2b. The Facebook client docs (per request, rule 25)

```bash
log facebook capture --docs          # run it live (Monitor), every stage prints
```

1. Every run under `~/.logCli` is split by its `steps.jsonl`; each request
   to Facebook is named (GraphQL by `fb_api_req_friendly_name`, or by
   `doc_id` through Facebook's `_facebookRelayOperation` modules; other
   POSTs by path) with its step, status, duration and time after our step.
2. Facebook's bundles are parsed into a syntax tree (TypeScript's compiler,
   `src/rea/facebookClient/helpers/indexModules.ts`): every
   `__d("Name", [deps], factory)` module.
3. Each GraphQL request's slice (`<Name>.graphql`, its doc_id module, and the
   modules that import it) goes to `rea analyze-javascript-application`:
   about 4 s each, cached by sha256 in `~/.logCli/rea/facebookClient/`.
4. `docs/platforms/facebook/<domain>/<Name>.md` gets the facts block, redacted
   before it is written (`src/privacy/redact`: secrets, emails, phones, IPs,
   ids, names, usernames and message text become `<slackToken>`, `<email>`,
   `<userId:1>`, `<messageText>` and the like; the raw run stays in
   `~/.logCli/runs/`). The three
   reasoning sections are written by hand from the facts and rea (open the
   Evidence with `inspect_analysis_view`). lefthook's pre-push refuses a
   push while any is unwritten, unread by rea, or older than a run.
5. Every other platform with a browser path (Reddit) is documented the same
   way under `docs/platforms/<platform>/`, its calls named by GraphQL
   operation or path and its code found in its own bundles.

What the recording, the docs build and the docs gate must do is in
[docs/specs/runsAndRea.md](../../docs/specs/runsAndRea.md).

#### 3. Findings

Every run writes a first pass itself: `<browser>/findings.md` in the run
folder, one section per step with Facebook's GraphQL operations by name
(`x-fb-friendly-name`), pages loaded, uploads, failed requests and the
step's rea `evidence_id` (`summarizeStep`). Names and counts only. Read it
first; e.g. `useUFACSubmitActionMutation` is a checkpoint answer being sent,
`useMarketplaceComposerAttributesQuery` the category being set.

What rea does per run (`settleInBackground`, its own hidden process):
- the whole `session.har` only when it is 32 MB or less (rea's
  `maximum_capture_bytes`); bigger ones are read per step only;
- the scripts are saved, never read whole: `--docs` reads them per request;
- `settle.json` says when it finished and what it read.

For a decision, write `docs/rea/findings/<runId>.md` by hand: the operations the
create page fired, in order, with timing; the fields each one submits;
what the page's scripts read from the browser; and every gap against
`src/marketplace/publish/machine.ts` and `docs/listingPublish/formFill.md`.
Each line names its rea `evidence_id`. Session values aren't copied into
this file. It holds names, orders and counts.

#### 4. SubQ matrix

Copy `docs/rea/matrix/runMatrix.mjs` into `docs/rea/<question>/` and
give it the findings as state, design options as `options.json`, criteria
(efficiency: requests, time, failure points, fit with the gate) as
`criteria.json`, and the claims the findings support or refute as
`claims.json`. Run two repeats per pass, as before, and keep
`subqResults.json`.

#### 5. Decide

The winning option becomes a change to the client, plus a failing
fixture test first (`python/fixtures/createItem.html` or a new fixture).
Record the decision and its evidence ids in the `log.md` entry.

### Every action's run feeds the request docs

Every action (inspect, flow, host, warm-up, publish) records the session's
`session.har` with Facebook's bundles in it, and `log facebook capture --docs`
reads code slices from all of them: a run that isn't settled yet (a host still
open) has its bundles taken from its `session.har` and kept as `scripts/`
(`scriptsFromHar`). The recorder reads each body first, before any header round
trip, keeps scripts and documents up to 16 MB (other bodies 2 MB), and writes
`_bodyError` on a response whose body it couldn't keep; the build says how many
were lost. A request whose slice no run has is read the next time a run loads
its bundle.

## The work, step by step: callTiming

From `skills/callTiming/SKILL.md`.

## callTiming

### The loop

1. **Read the numbers first.** Run `timing` (MCP), or `timing { tool, hours }` for one tool. Note the tool's p50, p95 and p99, and the stages with the largest share.
2. **Open a slow call.** Take a call id from a `■` line in the live log, or pick a slow call, and run `timing { call }`. The waterfall shows which stage took the time.
3. **Name the cause from the span.**
   - `python.start` or `python.imports`: the cost of starting Python for each call.
   - `host.connect` with `started=true`: the account's session host was started cold.
   - `host.queue` or `account.lock`: another call held the account.
   - `spacing` or `governor`: pacing, which is there on purpose.
   - `inbox.waitCaughtUp`: the account was behind.
   - `voice.*` or `fetch …`: SubQ, Jina or Twenty.
   - `http …`: the platform itself.
   - `unaccounted`: our own code with no span yet. Add one.
4. **Go deeper only when a span can't explain it.** Run `py-spy record --native --pid <host pid>` on the Python host, or `bun --cpu-prof` on Bun, to see which function and library the time is in.
5. **Fix, then measure again.** Run the same `timing` report after the change and give the owner both numbers. Never call something faster without them.

### Hard boundaries

- Timing never changes what a call sends. A span holds no cookie, token or message text.
- Pacing (`spacing`, `governor`) protects the accounts. It is never cut to win a benchmark unless the owner says so.
- Commands go through the MCP (rule 163). `timing` is read-only.

Docs: `docs/callTiming.md`. Spec: `docs/specs/callTiming.md`.

## The rules these tools fall under

Each by its number and first line. The full text is in AGENTS.md (`log://agents`); the core rules are in full in `getGuide({ topic: "logMcpInstructions" })`.

- **Rule 8.** Platform actions require the user authorization their tool defines.
- **Rule 19.** Every browser action records its raw HAR and timed step evidence, with no switch to disable capture.
- **Rule 25.** Fix failed or unfamiliar behavior from its own recorded action/request/response timeline.
- **Rule 26.** Stream progress while work runs, one meaningful line per stage, with the run log retained.
- **Rule 30.** Complete the authorized task.
- **Rule 35.** Browser work uses one account browser through its active day, with actions as tabs/steps; close only for a logged lifecycle reason.
- **Rule 38.** Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless the owner raises them.
- **Rule 39.** Use only the scope, options and intent the owner stated or implied.
- **Rule 40.** Do not propose physical infrastructure unless the owner asks.
- **Rule 41.** Paid work must stay within the authorized task and spend.
- **Rule 66.** Prune recordings only through the existing evidence-aware routine after analysis and documentation requirements are satisfied.
- **Rule 73.** For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence.
- **Rule 134.** Existing workspace log.db is the native private record/coordination foundation.
- **Rule 165.** Preserve per-stage call timings in the private observability store so latency can be traced to its cause.
