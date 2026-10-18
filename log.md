# log

One entry per commit, newest at the bottom. On every commit the pre-commit
hook parses the staged code into a syntax tree and writes the AST block of the
entry (what was added, changed or removed). The agent then writes What
changed, Why and Checked from it. Never edit old entries. Add a new one.

Entries before the AST hook existed were rebuilt from each commit with
`node scripts/astSummary.mjs <commit>`.

## 2026-10-18 04:01Z · main · 1407332

AST (generated from the staged code by scripts/astSummary.mjs, don't edit):
- `.gitignore`: new file
- `AGENTS.md`: new file
- `LICENSE`: new file
- `README.md`: new file
- `bin/log.ts`: added const code
- `bun.lock`: new file
- `docs/namingConventions.md`: new file
- `package.json`: new file
- `scripts/checkNamingConventions.mjs`: added const root, const CAMEL, const TS_FILE, const violations, const rel, function walk, function checkHelpers, function checkDomains
- `src/cli/account/helpers/index.ts`: added export from "./renderAccounts.ts"
- `src/cli/account/helpers/renderAccounts.ts`: added function renderAccountsTable
- `src/cli/account/index.ts`: added export from "./helpers/index.ts", const ACCOUNTS_USAGE, const accountsCommand
- `src/cli/launch/helpers/index.ts`: added export from "./parseLaunchArgs.ts", export from "./shouldPrompt.ts"
- `src/cli/launch/helpers/parseLaunchArgs.ts`: added type ParseLaunchArgsResult, function parseLaunchArgs
- `src/cli/launch/helpers/shouldPrompt.ts`: added interface LaunchTTY, function shouldPrompt
- `src/cli/launch/index.ts`: added export from "./helpers/index.ts", const LAUNCH_USAGE, const ACTIONS, type PromptSelectOptions, interface LaunchPrompts, const launchDeps, function delegate, function pick, function runLaunch, const launchCommand
- `src/cli/launch/launch.test.ts`: added const real, function capture, function stubPrompts, test "accepts empty and --json, rejects the rest", test "never prompts for --json or without both TTYs", test "--json lists actions without prompting", test "no TTY exits 2 without prompting", test "browse delegates to `listing <listingId>`", test "status delegates to `listings --status`", test "cancel exits 1"
- `src/cli/listing/helpers/index.ts`: added export from "./renderListing.ts"
- `src/cli/listing/helpers/renderListing.ts`: added function renderStatus, function renderListingsTable, function renderListingDetail
- `src/cli/listing/index.ts`: added export from "./helpers/index.ts", const LISTINGS_USAGE, const LISTING_USAGE, const listingsCommand, const listingCommand
- `src/cli/runner/cli.test.ts`: added function run, test "no command prints usage for every command", test "unknown command exits 2", test "listings --json returns every listing", test "listings filters and validates", test "listing shows detail and actions", test "accounts --json lists the three Facebook accounts"
- `src/cli/runner/helpers/index.ts`: added export from "./parseArgs.ts", export from "./renderTable.ts", export from "./renderUsage.ts"
- `src/cli/runner/helpers/parseArgs.ts`: added type ParsedArgs, function parseArgs
- `src/cli/runner/helpers/renderTable.ts`: added function renderTable
- `src/cli/runner/helpers/renderUsage.ts`: added const NOTES, function renderUsage
- `src/cli/runner/index.ts`: added export from "./helpers/index.ts", export from "./types.ts", const COMMANDS, const ALIASES, function createContext, function runCli
- `src/cli/runner/types.ts`: added interface CommandResult, interface MarketplaceData, interface CommandContext, interface Command
- `src/marketplace/account/client.ts`: added const FACEBOOK_ACCOUNTS, function listAccounts
- `src/marketplace/account/helpers/accountLabel.ts`: added function getAccountLabel
- `src/marketplace/account/helpers/index.ts`: added export from "./accountLabel", export from "./writeBlocking"
- `src/marketplace/account/helpers/writeBlocking.ts`: added const WRITE_BLOCKING_ISSUES, function isWriteBlocked
- `src/marketplace/account/index.ts`: added export from "./helpers/index", export from "./client", export from "./types"
- `src/marketplace/account/types.ts`: added type AccountIssue, interface RawSignal, interface ConnectionRecord
- `src/marketplace/listing/client.test.ts`: added test "loads the six dashboard seed listings, all on Facebook accounts", test "returns fresh copies so callers cannot mutate the seed", test "filters by status and account", test "finds by listingId and by opaque id", test "the platform-removed wardrobe only offers delete"
- `src/marketplace/listing/client.ts`: added const img, const DEFAULT_LISTING_IMAGE, const SEED_LISTINGS, function listListings
- `src/marketplace/listing/helpers/filterListings.ts`: added interface ListingFilter, function filterListings
- `src/marketplace/listing/helpers/findListing.ts`: added function findListing
- `src/marketplace/listing/helpers/index.ts`: added export from "./filterListings", export from "./findListing", export from "./sellerActions", export from "./uuid"
- `src/marketplace/listing/helpers/sellerActions.ts`: added function getSellerActions
- `src/marketplace/listing/helpers/uuid.ts`: added function uuid
- `src/marketplace/listing/index.ts`: added export from "./helpers/index", export from "./machine", export from "./types", export from "./client"
- `src/marketplace/listing/machine.test.ts`: added test "seller can sell or remove an active listing", test "only the platform moves a listing out of review to active", test "a platform takedown blocks the seller relist", test "a write-blocked account refuses seller writes", test "observation states belong to the platform", test "a sold listing offers mark-available, not relist"
- `src/marketplace/listing/machine.ts`: added type TransitionSource, interface ListingTransitionContext, const OBSERVATION_STATES, const SELLER_EDGES, const PLATFORM_EDGES, function allowedTransition, function validateContext, function listingActions
- `src/marketplace/listing/types.ts`: added type ListingStatus, type RemovalProvenance, const LISTING_STATUSES, const LISTING_STATUS_LABELS, interface ListingLocation, const DEFAULT_LISTING_LOCATION, interface ListingRecord, interface ListingsResponse, interface ListingDraft, interface ListingCreatedResponse, interface ListingStatusResponse
- `tsconfig.json`: new file

What changed: created log-cli. It loads log's Facebook Marketplace seed (6 listings, 3 accounts, the listing state machine), has the rank-cli command registry, and `log launch` as a Clack menu.
Why: matt asked for log-cli built from listeningkit-hackathon data and the Nebius rank CLI, Marketplace only, with camelCase `{library}/{domain}/` naming.
Checked: `bun run check` (naming, typecheck, 24 tests); every command run against the seed.

## 2026-10-18 05:09Z · feat/liveMarketplace · 5b314ee

AST (generated from the staged code by scripts/astSummary.mjs, don't edit):
- `.gitignore`: edited
- `AGENTS.md`: edited
- `README.md`: edited
- `package.json`: edited
- `python/logWorker.py`: added const SELLING_URL, const EXTRACT_JS, def log, const NEEDS_ATTENTION_JS, def auth_flags, def doctor, def acquire, def login, def scan, def status, const ACTIONS, def main
- `src/camofox/worker/client.ts`: added const WORKER_PATH, const runWorker
- `src/camofox/worker/helpers/index.ts`: added export from "./parseWorkerOutput.ts", export from "./storageStatePath.ts", export from "./toListingStatus.ts"
- `src/camofox/worker/helpers/parseWorkerOutput.ts`: added function parseWorkerOutput
- `src/camofox/worker/helpers/storageStatePath.ts`: added function storageStatePath
- `src/camofox/worker/helpers/toListingStatus.ts`: added function toListingStatus
- `src/camofox/worker/index.ts`: added export from "./helpers/index.ts", export from "./types.ts", export from "./client.ts"
- `src/camofox/worker/types.ts`: added type WorkerAction, interface WorkerRequest, type DashboardHealth, interface DoctorChecks, interface ScannedListing, type WorkerFailure, type DoctorResult, type LoginResult, type ScanResult, type StatusResult, interface WorkerResultMap, type WorkerResult, interface WorkerRunOptions, type WorkerClient
- `src/cli/launch/index.ts`: changed const ACTIONS, function runLaunch, const launchCommand
- `src/cli/launch/launch.test.ts`: added test "scan delegates to `scan --account <id>`" · changed function capture, test "--json lists actions without prompting"
- `src/cli/live/helpers/index.ts`: added export from "./renderScan.ts"
- `src/cli/live/helpers/renderScan.ts`: added function renderScan, function renderDoctor
- `src/cli/live/index.ts`: added export from "./helpers/index.ts", const DOCTOR_USAGE, const LOGIN_USAGE, const SCAN_USAGE, const STATUS_USAGE, function failure, function requireAccount, const doctorCommand, const loginCommand, const scanCommand, const statusCommand
- `src/cli/live/live.test.ts`: added function run, const SCAN, test "maps dashboard badges onto listing statuses", test "one file per account, overridable", test "scan sends the account's session and compares with log", test "scan --json passes the worker result through", test "scan needs a known account and explains a missing session", test "status opens one listing", test "login hands the terminal to the worker", test "doctor reports checks and per-account sessions"
- `src/cli/runner/cli.test.ts`: changed test "no command prints usage for every command"
- `src/cli/runner/index.ts`: changed const COMMANDS, function createContext
- `src/cli/runner/types.ts`: changed interface CommandContext

What changed: added `log doctor`, `login` (now `connect`), `scan` and `status`. They launch Camoufox through facebook-camofox-client via `python/logWorker.py`, with one saved session per account.
Why: log-cli only read the seed and never launched a browser. matt pointed at the old working setup: inferencesaver `facebook-client.mjs` and Listaro.
Checked: 33 tests; `doctor` is all green on matt's PC; `scan` launched Camoufox and reported the login wall for an empty session.

## 2026-10-18 05:22Z · feat/xstateMonitor · df2ca4b

AST (generated from the staged code by scripts/astSummary.mjs, don't edit):
- `README.md`: edited
- `bun.lock`: edited
- `package.json`: edited
- `python/logWorker.py`: added def body_sample · changed def scan
- `src/camofox/worker/types.ts`: changed type ScanResult
- `src/cli/launch/index.ts`: changed const ACTIONS, function runLaunch
- `src/cli/launch/launch.test.ts`: changed test "--json lists actions without prompting"
- `src/cli/runner/cli.test.ts`: changed test "no command prints usage for every command"
- `src/cli/runner/index.ts`: changed const COMMANDS
- `src/cli/watch/helpers/index.ts`: added export from "./summarizeMonitor.ts", export from "./toCheckOutcome.ts"
- `src/cli/watch/helpers/summarizeMonitor.ts`: added function summarizeMonitor, function renderMonitorOutput
- `src/cli/watch/helpers/toCheckOutcome.ts`: added function toCheckOutcome
- `src/cli/watch/index.ts`: added export from "./helpers/index.ts", const WATCH_USAGE, const LIVE_STATUSES, const watchDeps, const watchCommand
- `src/cli/watch/watch.test.ts`: added function run, const SCAN, test "classifies worker results", test "runs one check, prints the trace and the decisions", test "--json streams NDJSON trace lines, then the output", test "a missing session stops with code 1", test "validates flags"
- `src/marketplace/account/helpers/classifySignal.ts`: added const RULES, function classifySignal
- `src/marketplace/account/helpers/index.ts`: added export from "./classifySignal"
- `src/marketplace/monitor/helpers/detectHealth.ts`: added function detectHealth
- `src/marketplace/monitor/helpers/evaluateRelist.ts`: added const FATAL, function evaluateRelist
- `src/marketplace/monitor/helpers/index.ts`: added export from "./detectHealth", export from "./evaluateRelist"
- `src/marketplace/monitor/index.ts`: added export from "./helpers/index", export from "./machine", export from "./types"
- `src/marketplace/monitor/machine.test.ts`: added const FAST, const listing, function runMonitor, const ok, test "fatal states never repost", test "takedown reposts with a growing cooldown until the budget runs out", test "dedup guard: no second repost while one is queued", test "missing listings are DELETED_BY_FB only when the scan looks complete", test "maps Listaro signals onto one account issue each", test "one healthy check ends in done with decisions", test "loops, and the second check does not queue the same repost again", test "a transient error gets one quick retry, which does not count as a new check", test "circuit breaker trips after the same error 3 times in a row", test "account issues stop the account; a rate limit rests, then checks again", test "STOP ends a forever loop"
- `src/marketplace/monitor/machine.ts`: added interface MonitorOutput, const monitorMachine
- `src/marketplace/monitor/types.ts`: added type ListingHealth, interface RelistPolicy, interface MonitorTiming, const DEFAULT_RELIST_POLICY, const DEFAULT_MONITOR_TIMING, const CIRCUIT_BREAKER_THRESHOLD, const MAX_TRANSIENT_RETRIES, interface WatchedListing, interface RelistDecision, type CheckOutcome, interface MonitorInput, interface MonitorContext
- `src/observability/trace/helpers/createInspector.ts`: added function createInspector
- `src/observability/trace/helpers/formatTraceLine.ts`: added function formatTraceLine
- `src/observability/trace/helpers/index.ts`: added export from "./createInspector.ts", export from "./formatTraceLine.ts", export from "./stateToPath.ts"
- `src/observability/trace/helpers/stateToPath.ts`: added function stateToPath
- `src/observability/trace/index.ts`: added export from "./helpers/index.ts", export from "./types.ts"
- `src/observability/trace/trace.test.ts`: added test "stateToPath flattens nested state values", test "inspector reports actor start, events and state changes once each"
- `src/observability/trace/types.ts`: added interface TraceLine, type TraceSink

What changed: added xstate 5.33.3, the listing monitor machine (check, quick retry, circuit breaker, 24h rest, blocked, relist decisions) and `log watch`, which prints every step through XState inspect. README was emptied by a bad Windows-encoding write in this commit.
Why: matt asked for XState so the process can be started from the CLI and watched, using Listaro's retry and account-status rules next to facebook-camofox-client's relist rules.
Checked: 51 tests; real `log watch` runs stopped at `blocked` with `never_connected`, then with `session_expired`.

## 2026-10-18 05:22Z · feat/xstateMonitor · fa8972d

AST (generated from the staged code by scripts/astSummary.mjs, don't edit):
- `AGENTS.md`: edited
- `README.md`: edited

What changed: restored README and documented the monitor in README and AGENTS.md.
Why: the README was empty after df2ca4b.
Checked: the README diff against the first commit only adds lines.

## 2026-10-18 05:32Z · feat/commitLogAndRules · 1299841

AST (generated from the staged code by scripts/astSummary.mjs, don't edit):
- `.githooks/pre-commit`: new file
- `AGENTS.md`: edited
- `README.md`: edited
- `docs/namingConventions.md`: edited
- `package.json`: edited
- `python/logWorker.py`: changed def scan, def main
- `scripts/checkNamingConventions.mjs`: added const KEBAB, const ALLOWED_KEBAB, const LITERAL, function checkLiterals, function checkNames
- `scripts/commitLog.mjs`: added const root, const LOG, const PLACEHOLDER, const HEADER, const git, function renderEntry, function addedLines, function checkAdded, function main
- `scripts/commitLog.test.ts`: added test "the template has three AST lines to fill in", test "a filled entry passes, a missing or partial one fails", test "addedLines reads only the + lines of a diff"
- `skills.md`: new file
- `skills/captureRule/SKILL.md`: new file
- `skills/commitLog/SKILL.md`: new file
- `skills/logCli/SKILL.md`: new file
- `src/camofox/worker/helpers/fromCamofoxStatus.ts`: added function fromCamofoxStatus
- `src/camofox/worker/helpers/index.ts`: added export from "./fromCamofoxStatus.ts"
- `src/camofox/worker/helpers/toListingStatus.ts`: changed function toListingStatus
- `src/cli/launch/launch.test.ts`: changed test "scan delegates to `scan --account <id>`"
- `src/cli/listing/index.ts`: changed const LISTINGS_USAGE, const LISTING_USAGE, const listingCommand
- `src/cli/live/index.ts`: changed const LOGIN_USAGE, const SCAN_USAGE, const STATUS_USAGE, function failure, const statusCommand
- `src/cli/live/live.test.ts`: changed test "maps dashboard badges onto listing statuses", test "one file per account, overridable", test "scan sends the account's session and compares with log", test "scan --json passes the worker result through", test "scan needs a known account and explains a missing session", test "status opens one listing", test "login hands the terminal to the worker", test "doctor reports checks and per-account sessions"
- `src/cli/runner/cli.test.ts`: changed test "accounts --json lists the three Facebook accounts"
- `src/cli/watch/helpers/toCheckOutcome.ts`: changed function toCheckOutcome
- `src/cli/watch/index.ts`: changed const WATCH_USAGE, const LIVE_STATUSES
- `src/cli/watch/watch.test.ts`: changed test "classifies worker results", test "runs one check, prints the trace and the decisions", test "--json streams NDJSON trace lines, then the output", test "a missing session stops with code 1", test "validates flags"
- `src/marketplace/account/client.ts`: changed const FACEBOOK_ACCOUNTS
- `src/marketplace/account/types.ts`: changed interface RawSignal
- `src/marketplace/listing/client.test.ts`: changed test "filters by status and account"
- `src/marketplace/listing/client.ts`: changed const SEED_LISTINGS
- `src/marketplace/listing/machine.test.ts`: changed test "only the platform moves a listing out of review to active", test "observation states belong to the platform"
- `src/marketplace/listing/machine.ts`: changed const OBSERVATION_STATES, const SELLER_EDGES, const PLATFORM_EDGES, function allowedTransition
- `src/marketplace/listing/types.ts`: changed type ListingStatus, const LISTING_STATUSES, const LISTING_STATUS_LABELS
- `src/marketplace/monitor/machine.test.ts`: changed function runMonitor, test "STOP ends a forever loop"

What changed: every value is camelCase now (statuses, account ids, worker codes, usage text), with camofox kebab statuses converted at the worker boundary. The naming gate rejects kebab-case string values. Added log.md with a pre-commit gate, the AGENTS.md hard rules list, and skills/ indexed in skills.md. That first gate used "AST:" as a line prefix, which was wrong. The next commit replaces it with a real syntax-tree summary.
Why: matt: no kebab-case anywhere; every commit adds to log.md; his rules go into AGENTS.md as hard facts; routines become a skills directory like twitter-controller.
Checked: `bun run check` (54 pass); a planted `no-session` literal failed the gate; this commit went through the hook.

## 2026-10-18 05:38Z · feat/commitLogAndRules

AST (generated from the staged code by scripts/astSummary.mjs, don't edit):
- `.gitattributes`: new file
- `AGENTS.md`: edited
- `docs/namingConventions.md`: edited
- `package.json`: edited
- `scripts/astSummary.mjs`: added const root, const git, function readAt, const normalize, function declarationName, function collectDeclarations, const PY_AST, function collectPython, function diffDeclarations, function renderSummary, function summarize
- `scripts/commitLog.mjs`: added const AST_HEADING, const AGENT_FIELDS, function astBlock, function replaceLastAstBlock · changed const HEADER, function renderEntry, function addedLines, function checkAdded, function main
- `scripts/commitLog.test.ts`: added test "reports added, changed and removed declarations from the syntax tree", test "whitespace and comment-only moves inside a declaration don't count as changes", test "test files report test titles", test "renders one line per file", test "the template carries the AST block and three fields to write", test "a written entry with a matching AST passes; a stale AST is caught", test "replaceLastAstBlock swaps only the newest entry's block" · changed test "addedLines reads only the + lines of a diff" · removed test "the template has three AST lines to fill in", test "a filled entry passes, a missing or partial one fails"
- `skills.md`: edited
- `skills/captureRule/SKILL.md`: edited
- `skills/commitLog/SKILL.md`: edited
- `src/camofox/worker/types.ts`: no declaration changed (comments, formatting or line endings)
- `src/cli/launch/index.ts`: no declaration changed (comments, formatting or line endings)
- `src/cli/live/index.ts`: no declaration changed (comments, formatting or line endings)
- `src/cli/runner/index.ts`: no declaration changed (comments, formatting or line endings)
- `src/cli/runner/types.ts`: no declaration changed (comments, formatting or line endings)
- `src/marketplace/account/helpers/classifySignal.ts`: no declaration changed (comments, formatting or line endings)
- `src/marketplace/monitor/machine.ts`: no declaration changed (comments, formatting or line endings)
- `src/marketplace/monitor/types.ts`: no declaration changed (comments, formatting or line endings)
- `src/observability/trace/helpers/createInspector.ts`: no declaration changed (comments, formatting or line endings)

What changed: log.md entries now start from an abstract syntax tree. On commit, `scripts/astSummary.mjs` parses every staged .ts/.mjs file with the TypeScript compiler and every .py file with Python's ast module, and lists the top-level declarations and test titles that were added, changed or removed. The hook writes that block into the entry, prints it back so it reaches the agent, and blocks the commit until What changed / Why / Checked are written. A block that doesn't match the staged code gets rewritten. log.md is rebuilt so every past commit has its real AST block. The old "AST:" line prefix is gone. Also: every file is LF now (.gitattributes eol=lf). Windows writes this session had left CRLF in 14 files, which broke the log.md parser.
Why: matt: "AST is not a line prefix! AST stands for Abstract Syntax Tree". An AST should run over each commit and feed into the agent's context, so the agent fills in the template from what really changed.
Checked: `bun run check` (naming OK, typecheck, 59 pass, 8 of them new for the AST summary and gate). This commit went through the hook: the first try printed the AST above and stopped. The AST for commits 1407332 to 1299841 was regenerated with `node scripts/astSummary.mjs <commit>`.
