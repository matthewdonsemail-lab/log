# runsAndEvidence

What runs leave behind: run folders and pruning, captures and request docs, error codes, jobs and the MCP server itself.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## The tools in this guide

| Tool | What it does |
|---|---|
| `errors` | The error catalog |
| `graph` | Print a machine's states and transitions as a Mermaid diagram |
| `capture` | Read a run's raw HAR |
| `runsList` | Every recorded run |
| `runsExchanges` | Take every recorded step's internal API calls |
| `runsPrune` | Delete each analysed run after taking out its steps' exchanges… |
| `runsSpace` | The size of the runs folder and the disk's free space |
| `jobStatus` | A long run's status, the lines after afterLine, and its result once… |
| `jobCancel` | Stop a long run at its next browser step |
| `jobList` | The latest jobs |

## The work, step by step: runs

From `skills/runs/SKILL.md`.

## runs

Every action records a raw HAR (rules 19, 22): a warm-up run is about 1.5 GB,
an inspect run up to 1.4 GB. On 2026-10-22 they reached 12.5 GB, the disk had
2 GB left and AdsPower refused to start Bethlehem's browser.

### The loop

1. **Analyse** (rules 25, 27): a run may go only when rea settled it
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

Code: `src/browser/runStore`, `src/cli/runs`.

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
   stays on matt's development machine in the run folder
   (`~/.logCli/publish/<run>/<browser>`) and is never committed.
2. **Captures come from every live run (rule 22)**: `connect`, `scan`,
   `status`, each `watch` check and `log facebook publish` (dry run unless `--live`,
   rule 10). There is no flag to skip it. Those runs follow the launch rules as they are:
   headed (11), proxy in country (12), self-check (17), waking hours (18).
3. **REA reads files, never the window.** No CDP, no attach. The rea
   commands that need a live target (`inspect-web-page`,
   `analyze-web-bundle`, `observe-web-*`, `export-web-scripts`) aren't
   used on Camoufox.
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

Any action records one. Through the MCP, `mcp__log__connect` / `scan` /
`publish` do the same.

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
`Firefox capture: N requests, M scripts, raw HAR kept. REA ...`.

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

#### 2b. The Facebook client docs (per request, rules 25 and 27)

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
4. `docs/platforms/facebook/<domain>/<Name>.md` gets the facts block; the three
   reasoning sections are written by hand from the facts and rea (open the
   Evidence with `inspect_analysis_view`). lefthook's pre-push refuses a
   push while any is unwritten, unread by rea, or older than a run.

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

### Status (2026-10-18)

- Done: the raw HAR capture in `log facebook publish`, `log facebook capture`, and
  rea 6.7.0 read on a sample HAR (both calls exit 0, with the POST body
  visible to rea).
- Next: the first live capture run, then `docs/rea/findings/`, then the
  first SubQ matrix over it.

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

## Every tool, in full

### `errors`

The error catalog.
List every error code: meaning, retryable, where each machine ends up
log errors [--layer <account|listing|photo|form|captcha|runtime|twenty|proxyVendor|auth|profile>] [--code <code>] [--json] [--markdown]
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "runsAndEvidence" }) (What runs leave behind: run folders and pruning, captures and request docs, error codes, jobs and the MCP server itself).
AGENTS.md (log://agents): rules 25, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `graph`

log graph <publish|monitor>
Print a machine's states and transitions as a Mermaid diagram
Usage: log graph <publish|monitor>
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Before first using this tool in a session, load its guide: getGuide({ topic: "runsAndEvidence" }) (What runs leave behind: run folders and pruning, captures and request docs, error codes, jobs and the MCP server itself).
AGENTS.md (log://agents): rules 6, 25, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `capture`

log facebook capture --har <path> [--out <dir>] [--noRea] [--json] | --settle <dir> | --docs [--noRea]
Read a run's raw HAR (any browser driver) and its scripts with offline rea; --docs builds every platform's client docs, rea reading each request's code. No browser.
Usage: log facebook capture --har <path> [--out <dir>] [--noRea] [--json]
       log facebook capture --settle <runCaptureDir>  (what each run starts in the background: rea reads its capture, split per step)
       log facebook capture --docs [--noRea]  (every run's requests → docs/platforms/<platform>/, one doc per request, rea reading each one's slice: Facebook's by its modules, every other platform with a browser path by the call sites its bundles hold for each request)
The HAR is the one Playwright writes from Camoufox. It is copied raw, and rea reads it. No browser opens.
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "runsAndEvidence" }) (What runs leave behind: run folders and pruning, captures and request docs, error codes, jobs and the MCP server itself).
AGENTS.md (log://agents): rules 19, 22, 26, 27, 46, 48, 85, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `runsList`

Every recorded run: its size, settled by rea, in the request docs, and whether it may go.
The recorded runs on this machine, and pruning the ones rea settled and the request docs hold, keeping each one's findings and domains
log runs [list] [--json]   (every recorded run: its size, settled by rea, in the request docs, and why it is kept or that it may go)
log runs exchanges   (takes every recorded step's internal API calls, what was sent and what came back, out of its HAR into exchanges.json, for every run still on disk; prune does it first too)
log runs prune [--before <YYYY-MM-DD>] [--apply]   (deletes each analysed run, started before the day when given, after taking out every step's exchanges, keeping its findings.md, steps.jsonl, settle.json, every step's exchanges.json, reading.json and readingState.json, its goalFindings and its requests by domain; a dry run unless --apply)
log runs space   (the size of ~/.logCli/runs and the disk's free space, as the storage hook says them)
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "runsAndEvidence" }) (What runs leave behind: run folders and pruning, captures and request docs, error codes, jobs and the MCP server itself).
AGENTS.md (log://agents): rules 19, 22, 25, 27, 66, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `runsExchanges`

Take every recorded step's internal API calls (sent and answered) out of its HAR into exchanges.json, for every run still on disk.
The recorded runs on this machine, and pruning the ones rea settled and the request docs hold, keeping each one's findings and domains
log runs exchanges   (takes every recorded step's internal API calls, what was sent and what came back, out of its HAR into exchanges.json, for every run still on disk; prune does it first too)
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "runsAndEvidence" }) (What runs leave behind: run folders and pruning, captures and request docs, error codes, jobs and the MCP server itself).
AGENTS.md (log://agents): rules 19, 22, 25, 27, 66, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `runsPrune`

Delete each analysed run after taking out its steps' exchanges, keeping its findings, exchanges, readings and goal findings; a dry run unless apply.
The recorded runs on this machine, and pruning the ones rea settled and the request docs hold, keeping each one's findings and domains
log runs prune [--before <YYYY-MM-DD>] [--apply]   (deletes each analysed run, started before the day when given, after taking out every step's exchanges, keeping its findings.md, steps.jsonl, settle.json, every step's exchanges.json, reading.json and readingState.json, its goalFindings and its requests by domain; a dry run unless --apply)
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "runsAndEvidence" }) (What runs leave behind: run folders and pruning, captures and request docs, error codes, jobs and the MCP server itself).
AGENTS.md (log://agents): rules 19, 22, 25, 27, 66, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `runsSpace`

The size of the runs folder and the disk's free space.
The recorded runs on this machine, and pruning the ones rea settled and the request docs hold, keeping each one's findings and domains
log runs space   (the size of ~/.logCli/runs and the disk's free space, as the storage hook says them)
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "runsAndEvidence" }) (What runs leave behind: run folders and pruning, captures and request docs, error codes, jobs and the MCP server itself).
AGENTS.md (log://agents): rules 19, 22, 25, 27, 66, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `jobStatus`

A long run's status, the lines after afterLine, and its result once it ends.
Follow or stop a long MCP run: each runs as a job when it outlasts its call's wait
log job status <jobId> [--afterLine <n>] [--waitMs <ms>] [--json]   (a long MCP run: its status, the lines after afterLine, and its result once it ends; waits up to waitMs, default 10000, for something new)
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "runsAndEvidence" }) (What runs leave behind: run folders and pruning, captures and request docs, error codes, jobs and the MCP server itself).
AGENTS.md (log://agents): rules 10, 26, 35, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `jobCancel`

Stop a long run at its next browser step.
Follow or stop a long MCP run: each runs as a job when it outlasts its call's wait
log job cancel <jobId>   (stops it at its next browser step; never once Publish is clicked, rule 10)
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "runsAndEvidence" }) (What runs leave behind: run folders and pruning, captures and request docs, error codes, jobs and the MCP server itself).
AGENTS.md (log://agents): rules 10, 26, 35, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `jobList`

The latest jobs.
Follow or stop a long MCP run: each runs as a job when it outlasts its call's wait
log job list [--json]   (the latest jobs)
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "runsAndEvidence" }) (What runs leave behind: run folders and pruning, captures and request docs, error codes, jobs and the MCP server itself).
AGENTS.md (log://agents): rules 10, 26, 35, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From AGENTS.md (`log://agents`). The newest rules are at the bottom of AGENTS.md and win.

**Rule 6.** 2026-10-18 · Processes that run over time are XState machines that can be started and watched from the CLI (`log watch`, `observability/trace`).

**Rule 10.** 2026-10-18 · matt asked for posting: `log publish` posts one listing through the publish machine. It is a dry run unless `--live`, and once Publish is clicked nothing is retried. Captchas go CaptchaKraken first, then 2Captcha, and Facebook's own challenges go to a person. Rule 8 still holds for editing and deleting.

**Rule 19.** 2026-10-18 · Captures are kept raw for analysis. The HAR `log publish` records from Camoufox keeps every cookie, header, token and body: nothing is stripped, because rea, SubQ and the matrices need it. It is only for matt's own development machine: it stays in the run folder (`~/.logCli/publish/<run>/firefox`) and is never committed (`skills/reaCapture/SKILL.md`). The REA work is based on live runs.

**Rule 22.** 2026-10-19 · Every action records a HAR, with no way to turn it off. The proxy gate puts a raw HAR recorder (rule 19) on every browser context, and refuses a context without a capture folder (`captureMissing`). That covers connect, scan, status, each watch check and publish. Each run keeps `~/.logCli/runs/<action>/<time>_<account>/firefox` (publish: its run folder): `session.har`, `steps.jsonl` (every action the run logged, timed), and `steps/NN_<action>.har`, one per step, each read by the local rea (`settleRunCapture`). Never committed.

**Rule 25.** 2026-10-19 · matt: a run that fails or hangs is fixed from its own recording, never by guessing. Read its HAR with rea (timeline, cause line, compare runs), then fix the machine. The outline is at the top of this file.

**Rule 26.** 2026-10-19 · matt: "I always want to see what is going on." Every process that runs over time writes a progress line per stage as it happens (never only at the end) and to a log file in its folder. Agents run long commands so the lines stream live (Claude Code: Monitor, never piped through `tail`/`head`).

**Rule 27.** 2026-10-19 · matt: every request Facebook's client makes in our runs is documented by domain in `docs/platforms/facebook/<domain>/<request>.md`: what it sends and reads, which step fires it, how fast, what errors it returns, and why it matters to our machines. Built by `log capture --docs`: our syntax-tree parse cuts each request's modules out of Facebook's bundles, rea reads each slice (seconds, not the whole bundle). lefthook's pre-push (`check:facebookClientDocs`) refuses a push while a request is undocumented, unread by rea, has its reasoning unwritten, or a run is newer than the docs.

**Rule 30.** 2026-10-19 · matt: "If I tell you to do something, do it completely." When matt gives a plan, it is carried out to the end in the same turn, not stopped to ask again or to say what won't be done. `log inspect start --now` (and `log connect --now`, and since 2026-10-19 `log publish --now`, matt: "run it now") skips rule 24's 10-minute gap (the 8 a day still holds) so a recording continues at once. Recording a sign-in or a checkpoint with `log inspect` (signIn, code, solve, click) is the intended work: it is how each state gets documented from rea. The run on 2026-10-19 was interrupted once because a snapshot printed the account's email and password; snapshots now redact every typed field value (`redact_fields`), and signIn/code read only the private login.json (rule 21), so no credential reaches any output.

**Rule 35.** 2026-10-19 · matt: the browser stays open. One browser per account, opened once per local day by its host and kept open through the account's active hours; every action is a tab in it; it closes only for a logged reason (end of active hours, shutdown, checkpoint or restriction, account lost, a crash reopened once). Every account runs one lifecycle machine (`src/marketplace/lifecycle`, XState) across an onboarding lane (with a day's warm-up after profile and name) and a host lane. Top of this file.

**Rule 38.** 2026-10-19 · matt: never mention or discuss Meta's or Facebook's rules, terms, policies, eligibility or account ownership with him unless he raises them first. Research text that does is not his, and is never repeated to him. Top of this file.

**Rule 39.** 2026-10-19 · matt: "If I never mentioned it, if I never inferred it, if I never outlined it as an option, therefore it is not an option." Deep research prompts, searches, SubQ matrices, plans and write-ups use only what matt said, or clearly meant through a misspelling. Nothing added, nothing steered towards. Top of this file.

**Rule 40.** 2026-10-19 · matt: no physical options. He is in Vietnam with no physical access. Phones, SIMs, mini PCs, laptops, phone farms and home devices are never options unless he names them. In scope: hosted and cloud options, the tools he named and their competitors, and what our four projects already use.

**Rule 41.** 2026-10-19 · matt: "any time any task correlates to money, and I never say something, that means you shouldn't do what you think. You should do what I say." Paid work (deep research, SubQ, proxies, captcha, vendors) does exactly what he asked, nothing more. Ask before anything else.

**Rule 46.** 2026-10-20 · matt: names are browser-agnostic. A command, domain, type or message is named for what it does, never for one browser (Camoufox's Firefox, AdsPower's Chromium, rule 44): `log capture --docs | --settle | --har` (was `firefoxCapture`, kept as an alias), `src/rea/capture` (was `rea/firefox`), `BrowserCapture`, `settleCapture`. Run folders already carry the browser that ran (`adsPower/`, `camoufox/`).

**Rule 48.** 2026-10-20 · matt: what a platform's client does is documented by platform first, then domain: `docs/platforms/<platform>/<domain>/<request>.md` (was `docs/facebookClient/`; Facebook is `docs/platforms/facebook/`, and its group requests have a `groups` domain of their own). A new platform or domain is explored with `log inspect` and gets its own folder beside Facebook's. Over MCP, any call that runs long is watched live: the caller starts a Monitor on `~/.logCli/mcp/<day>.log` before it (rule 26), as the server's instructions and each long tool's description say.

**Rule 66.** 2026-10-22 · matt: the runs never fill the disk again. A run is deleted once it is analysed: rea settled it (`settle.json`) and the request docs hold its requests (`log facebook capture --docs`). The docs build folds each request's facts into `~/.logCli/rea/clientFacts.json`, so a doc keeps every row its pruned runs gave and only adds. `log runs` lists them, `log runs prune --apply` deletes them and keeps each one's findings.md, steps.jsonl, settle.json and requests by domain (`~/.logCli/runs/kept`, `runs/pruned.jsonl`). An agent hook (`scripts/hooks/storage.ts`) says so when `~/.logCli/runs` passes 2 GB or the disk has under 5 GB free. Tests never write into the real runs (`scripts/tests/preload.ts`). `skills/runs/SKILL.md`.

**Rule 73.** 2026-10-23 · matt: "IT MUST ALWAYS READ THEM." The number one rule of the stack, above rule 30 and every other: Facebook's internal API answers are the decision-making factor of what and when something is relevant, and the deterministic factor of the system. Every browser step reads the internal API answers it triggers and the requests it sent, keeps them past the prune, and decides on them, never on a page loading, a timer or the step having run. The MCP instructions put it first. Inspect steps read theirs since rule 74, and every flow, warm-up and host step on AdsPower that makes a call since 2026-10-23; the Camoufox-only machines don't yet (#35). Top of this file.

**Rule 85.** 2026-10-25 · matt: "THE WHOLE POINT IS TO GO THROUGH REA." Every platform's internal calls go through rea, their code as well as their network, never Facebook's alone. `log facebook capture --docs` builds every browser platform's request docs (`docs/platforms/<platform>/`): it takes each run's calls to that platform's hosts (`PLATFORM_SITES`), names each by its GraphQL operation or its path without ids, finds the code that sends it in the platform's own bundles by syntax tree (an operation by its exact name, a path where it is fetched), and rea reads each call's slice (`src/rea/platformClient`). A call whose code isn't in the bundles keeps its step's rea reading. The docs gate (`check:facebookClientDocs`) refuses a platform's doc that rea hasn't read or whose reasoning isn't written. The first Reddit run: 39 calls, 33 read from their code, the other 6 from their step.
