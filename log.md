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

## 2026-10-18 05:45Z · feat/oauthLogin

AST (generated from the staged code by scripts/astSummary.mjs, don't edit):
- `README.md`: edited
- `docs/namingConventions.md`: edited
- `scripts/checkNamingConventions.mjs`: changed const ALLOWED_KEBAB
- `skills/logCli/SKILL.md`: edited
- `src/auth/exchange/client.ts`: added const MAX_BODY_BYTES, const MAX_TOKEN_LENGTH, const CORS, const isTokenField, function isValidExchange, function runExchangeServer
- `src/auth/exchange/index.ts`: added export from "./types.ts", export from "./client.ts"
- `src/auth/exchange/types.ts`: added interface ExchangeRequest, type ExchangeResult, interface ExchangeServer, const EXCHANGE_TIMEOUT_MS
- `src/auth/session/client.ts`: added function authDir, function readJsonFile, function isSessionRecord, function loadSessionHome, function writeSessionHome, function saveSessionRecord, function removeSessionRecord, function resolveApiUrl, function resolveWebUrl, function unreachableApi, function validateSessionToken, function refreshSessionToken, function liveSession
- `src/auth/session/helpers/index.ts`: added export from "./pkce.ts", export from "./urls.ts"
- `src/auth/session/helpers/pkce.ts`: added function base64UrlEncode, function randomBase64Url, function generateCodeVerifier, function generateState, function codeChallengeForVerifier, function isTokenExpired
- `src/auth/session/helpers/urls.ts`: added function maskSecret, function validateHttpUrl, function buildAuthorizeUrl, const HANDOFF_MARKER, function buildBrowserCommand
- `src/auth/session/index.ts`: added export from "./helpers/index.ts", export from "./types.ts", export from "./client.ts"
- `src/auth/session/types.ts`: added interface SessionRecord, interface SessionConfig, interface SessionHome, interface OperatorIdentity, type ValidationResult, const DEFAULT_WEB_URL, const DEFAULT_API_URL
- `src/cli/auth/auth.test.ts`: added const real, const dir, function fakeBlaster, function run, test "PKCE challenge is base64url SHA-256 (RFC 7636 example)", test "tokens are masked, expiry has 60s of skew, the authorize URL carries the handoff", test "accepts only a POST that echoes this run's state and challenge", test "times out when the browser never posts", test "browser login: the web app posts tokens to the loopback, the session is validated and stored", test "paste login, whoami, logout", test "whoami refreshes a rejected token once and stores the rotated one", test "rejects bad tokens, bad URLs, and a web URL that isn't blaster"
- `src/cli/auth/index.ts`: added const LOGIN_USAGE, const LOGOUT_USAGE, const WHOAMI_USAGE, const authDeps, function checkHandoff, function browserSignIn, const loginCommand, function pickSession, const logoutCommand, const whoamiCommand
- `src/cli/launch/index.ts`: changed const ACTIONS, function runLaunch
- `src/cli/launch/launch.test.ts`: changed test "--json lists actions without prompting"
- `src/cli/live/helpers/renderScan.ts`: changed function renderDoctor
- `src/cli/live/index.ts`: added const CONNECT_USAGE, const connectCommand · changed function failure · removed const LOGIN_USAGE, const loginCommand
- `src/cli/live/live.test.ts`: added test "connect hands the terminal to the worker" · changed test "scan needs a known account and explains a missing session" · removed test "login hands the terminal to the worker"
- `src/cli/runner/cli.test.ts`: changed test "no command prints usage for every command"
- `src/cli/runner/index.ts`: changed const COMMANDS

What changed: `log login` / `log logout` / `log whoami` sign in with Twenty through blaster's hosted web app, the same OAuth flow as `blaster login`: a state nonce and PKCE challenge, a one-shot 127.0.0.1 loopback that only accepts a POST echoing them, then a check through blaster's `/api/auth/me` and storage in `~/.logCli/auth/`. `whoami` refreshes an expired or rejected token once through `/api/auth/refresh`. `--token` is the paste path. The Facebook Camoufox command moves from `log login` to `log connect --account <id>`, so `login` means what it means in blaster.
Why: matt: give log-cli the OAuth login the blaster CLI has.
Checked: `bun run check` (naming OK, typecheck, 67 pass; 8 new auth tests, one of which runs a real loopback exchange end to end against a fake blaster). Against the real hosted blaster: `/login` serves the `blaster-web` marker, `/api/auth/me` answers 401 unauthenticated, and `log login --token <bogus>` was rejected by the real API. Not done: a full browser sign-in, because that needs matt in the browser.

## 2026-10-18 06:19Z · feat/captchaKrakenAndPublishFlow

AST (generated from the staged code by scripts/astSummary.mjs, don't edit):
- `.env.example`: new file
- `AGENTS.md`: edited
- `docs/listingPublish/README.md`: new file
- `docs/listingPublish/captchaKraken.md`: new file
- `docs/listingPublish/formFill.md`: new file
- `docs/listingPublish/imagePipeline.md`: new file
- `docs/listingPublish/sources.md`: new file
- `docs/listingPublish/stateMachine.md`: new file

What changed: New `docs/listingPublish/` (README, stateMachine, imagePipeline, formFill, captchaKraken, sources) documents how a Marketplace listing is posted. It covers each source flow as states with mermaid diagrams, how photos are loaded, varied and attached through `setInputFiles` and confirmed by the N/10 counter, the create form field by field with the selectors that worked, and the XState publish machine log-cli should build (proposal, not code). New `.env.example` lists LOG_* plus CAPTCHA_KRAKEN_API_KEY and VLLM_BASE_URL. AGENTS.md rule 9: captchas go through the CaptchaKraken hosted API, and open-typesafe-camoufox is stale.
Why: matt asked for the CaptchaKraken key in the env template, and for an accurate, source-cited map of the posting state machine and image flow before building Facebook posting.
Checked: Every claim cites file:line in facebook-camofox-client, Listaro_backup, listeningkit-hackathon or CaptchaKraken/CaptchaKraken (GH API, commit a08b8ff). I re-read the key lines (Listaro setInputFiles + 3-5s sleep, count = 1, the AI fallback Promise bug, the FCC spike audience step). bun run check passes (67 tests).

## 2026-10-18 06:44Z · feat/publishMachine

AST (generated from the staged code by scripts/astSummary.mjs, don't edit):
- `AGENTS.md`: edited
- `bun.lock`: edited
- `package.json`: edited
- `python/fixtures/createItem.html`: new file
- `python/publishSession.py`: added const CREATE_URL, const SELLING_URL, const LIMIT_TEXT, const BLOCKED_TEXT, const CHALLENGE_TEXT, const OOPS_TEXT, const PUBLISHED_TEXT, const PHOTO_COUNT_JS, const EXTRACT_JS, const INJECT_RECAPTCHA_JS, const INJECT_ARKOSE_JS, const DISABLED_JS, def log, def norm, def fail, class Session, def step_open, def kraken_code, def solve_kraken, def twocaptcha_code, def solve_twocaptcha, def step_solve_captcha, def step_set_category, def step_upload_photos, def step_fill_fields, def step_review, def step_publish, def step_confirm, def step_capture_id, const STEPS, def main
- `skills/logCli/SKILL.md`: edited
- `src/camofox/session/client.ts`: added const SESSION_PATH, const startSession
- `src/camofox/session/helpers/index.ts`: added export from "./splitReplies"
- `src/camofox/session/helpers/splitReplies.ts`: added function splitReplies
- `src/camofox/session/index.ts`: added export from "./client", export from "./helpers/index", export from "./types"
- `src/camofox/session/types.ts`: added type SessionStep, interface SessionConfig, interface SessionRequest, interface SessionReply, interface PublishSession, type SessionFactory
- `src/captcha/router/client.ts`: added function ledgerPath, function appendAttempt, function readAttempts, function solverAvailability
- `src/captcha/router/helpers/countArkoseToday.ts`: added function countArkoseToday
- `src/captcha/router/helpers/index.ts`: added export from "./countArkoseToday", export from "./planNextSolver"
- `src/captcha/router/helpers/planNextSolver.ts`: added function planNextSolver
- `src/captcha/router/index.ts`: added export from "./client", export from "./helpers/index", export from "./types"
- `src/captcha/router/router.test.ts`: added const both, const recaptcha, const arkose, const attempt, test "reCAPTCHA: CaptchaKraken twice, then 2Captcha, then out", test "a dead CaptchaKraken key skips straight to 2Captcha", test "reCAPTCHA with only 2Captcha configured goes to 2Captcha", test "Arkose never goes to CaptchaKraken, and is capped per day", test "Facebook's own challenge and unknown captchas go to a person", test "no keys at all says which env vars to set", test "the round cap stops everything", test "appends and reads JSON lines, skipping torn ones", test "solverAvailability reads keys from env, never the network"
- `src/captcha/router/types.ts`: added type CaptchaKind, type CaptchaSolverName, interface CaptchaDetection, interface SolverAvailability, interface CaptchaAttempt, interface CaptchaPolicy, const DEFAULT_CAPTCHA_POLICY, const SOLVER_DEAD_CODES, type CaptchaPlan
- `src/cli/launch/launch.test.ts`: changed function capture
- `src/cli/publish/helpers/index.ts`: added export from "./summarizePublish.ts"
- `src/cli/publish/helpers/summarizePublish.ts`: added function summarizePublish, const RESULT_TEXT, function renderPublishOutput
- `src/cli/publish/index.ts`: added export from "./helpers/index.ts", const PUBLISH_USAGE, function publishRunDir, function readListing, const publishCommand
- `src/cli/publish/publish.test.ts`: added const root, const saved, const ENV, const photo, function fakeSession, function run, const BASE, test "dry run by default: fills, reviews, never clicks Publish, closes the browser", test "--live publishes and reports the listing id", test "a reCAPTCHA goes to CaptchaKraken, and the attempt lands in the ledger", test "Arkose with no 2Captcha key stops for a person, without solving", test "--json streams the trace then the output, and writes the run record", test "refuses before any browser opens: bad listing, unknown account, no session"
- `src/cli/runner/index.ts`: changed const COMMANDS, function createContext
- `src/cli/runner/types.ts`: changed interface CommandContext
- `src/marketplace/publish/helpers/index.ts`: added export from "./validateListing"
- `src/marketplace/publish/helpers/validateListing.ts`: added function validateListing, function toConditionLabel
- `src/marketplace/publish/index.ts`: added export from "./helpers/index", export from "./machine", export from "./types"
- `src/marketplace/publish/machine.test.ts`: added const listing, interface Script, function run, test "dry run fills everything and stops at review: Publish is never clicked", test "live run publishes, confirms and reads the id", test "published but no id is unconfirmedId, and nothing is retried", test "no toast still looks for the listing instead of retrying", test "FB's Oops dialog fails the run", test "reCAPTCHA: CaptchaKraken solves it, the re-check marks it accepted", test "reCAPTCHA: CaptchaKraken fails twice, 2Captcha gets it", test "Arkose goes to 2Captcha only", test "FB's own challenge stops at needsPerson without spending a solve", test "solvers that keep failing end in needsPerson, not a loop", test "an account issue stops the run as blocked", test "a step that cannot confirm its write fails at that step", test "the condition is mapped to the form label", test "catches what would stall the form"
- `src/marketplace/publish/machine.ts`: added function missing, const isFailure, interface FailureParams, const publishMachine, function markLast
- `src/marketplace/publish/types.ts`: added interface PublishListing, interface PublishInput, type PublishIssue, interface StepFailure, type PreparePhotosOutput, type FormOutcome, interface SolveOutput, type StepOutput, type UploadOutput, type FillOutput, type ReviewOutput, type PublishClickOutput, type ConfirmOutput, type CaptureOutput, type PublishResultKind, interface PublishContext, interface PublishOutput, interface PublishActorInputs
- `src/media/photo/client.ts`: added interface PrepareOptions, function mediaDir, function loadBytes, function varyPhoto, function preparePhotos
- `src/media/photo/helpers/index.ts`: added export from "./photoSource", export from "./variationParams"
- `src/media/photo/helpers/photoSource.ts`: added function photoSourceKind, function decodeDataUrl, function sniffImageType, function describeSource
- `src/media/photo/helpers/variationParams.ts`: added const between, const round, function variationParams
- `src/media/photo/index.ts`: added export from "./client", export from "./helpers/index", export from "./types"
- `src/media/photo/photo.test.ts`: added function seeded, const samplePng, test "photoSourceKind", test "sniffImageType reads magic bytes, not names", test "decodeDataUrl", test "variationParams stays inside Listaro ranges", test "writes a varied JPEG per source, each with a different hash", test "refuses non-images, missing files, none and more than 10", test "downloads URLs through the injected fetch"
- `src/media/photo/types.ts`: added const MAX_PHOTOS, type PhotoSourceKind, type ImageType, interface VariationParams, interface PreparedPhoto, type PrepareResult

What changed: `log publish` posts one Marketplace listing through a new XState publish machine (preparingPhotos, openingForm, routingCaptcha/solvingCaptcha, choosingCategory, uploadingPhotos, fillingFields, reviewing, publishing, confirming, capturingId). It is a dry run unless `--live`. `media/photo` makes a varied JPEG per photo with sharp (Listaro's ranges) so every post has new hashes. `camofox/session` drives one long-lived Camoufox over JSON lines (`python/publishSession.py`): photos are gated on FB's own N/10 counter, every field is read back, and nothing is retried after Publish. `captcha/router` picks the solver from what is on screen: reCAPTCHA goes to CaptchaKraken twice, then 2Captcha; Arkose goes to 2Captcha only, capped per account per day; FB's own challenges go to a person. Every attempt goes to `~/.logCli/captcha/attempts.jsonl`. AGENTS.md rule 10 and the logCli skill cover posting.
Why: matt: "make it so that we're able to implement these things here now", after choosing both solvers routed by which captcha is on screen (CaptchaKraken first, 2Captcha fallback). Rule 10 records that he asked for posting.
Checked: `bun run check`: naming gate ok, tsc ok, 103 pass. A real Camoufox run against `python/fixtures/createItem.html` (no Facebook): category set, 2 photos confirmed by the 2/10 counter, title and price read back, then it stopped at fillingFields with conditionNotSet. Not run against live Facebook, and no live captcha solve yet (no keys in .env.local).

## 2026-10-18 07:01Z · feat/publishMachine

AST (generated from the staged code by scripts/astSummary.mjs, don't edit):
- `AGENTS.md`: edited
- `README.md`: edited
- `docs/errorCatalog.md`: new file
- `docs/listingPublish/stateMachine.md`: edited
- `package.json`: edited
- `python/errorCatalog.json`: new file
- `python/errorCodes.py`: added const CATALOG_PATH, def _load_codes, const CODES, def checked, def failure
- `python/logWorker.py`: changed def scan, def status, def main
- `python/publishSession.py`: added const NOT_SET_CODES, const KRAKEN_CODES, const TWOCAPTCHA_CODES · changed def fail, class Session, def step_open, def kraken_code, def solve_kraken, def twocaptcha_code, def solve_twocaptcha, def step_solve_captcha, def step_review, def main
- `python/visibleBrowser.py`: added const HUMANIZE_MAX_SECONDS, def visible_kwargs, def force_visible
- `skills/logCli/SKILL.md`: edited
- `src/auth/exchange/types.ts`: changed type ExchangeResult
- `src/camofox/session/client.ts`: changed const startSession
- `src/camofox/session/helpers/index.ts`: added export from "./normalizeResult"
- `src/camofox/session/helpers/normalizeResult.ts`: added function normalizeResult
- `src/camofox/session/types.ts`: changed interface SessionConfig
- `src/camofox/session/visible.test.ts`: added const python, const read, test "visibleBrowser.py forces headed, humanize and the cursor", test "publishSession.py launches only through visible_kwargs", test "logWorker.py forces it before facebook-camofox-client launches anything", test "nothing can ask for headless"
- `src/camofox/worker/client.ts`: changed const runWorker
- `src/camofox/worker/helpers/parseWorkerOutput.ts`: changed function parseWorkerOutput
- `src/camofox/worker/types.ts`: changed type WorkerFailure
- `src/captcha/router/helpers/planNextSolver.ts`: changed function planNextSolver
- `src/captcha/router/router.test.ts`: changed test "Facebook's own challenge and unknown captchas go to a person"
- `src/captcha/router/types.ts`: changed interface CaptchaAttempt, const SOLVER_DEAD_CODES, type CaptchaPlan
- `src/cli/errors/errors.test.ts`: added const root, function run, test "lists every code, or one layer", test "--code explains one code; unknown codes and layers exit 1", test "--json is the catalog", test "docs/errorCatalog.md is the current export (run `bun run errors:export`)", test "draws the publish machine, stopping and all", test "needs exactly one known machine"
- `src/cli/errors/helpers/index.ts`: added export from "./renderCatalog.ts"
- `src/cli/errors/helpers/renderCatalog.ts`: added const LAYERS, const MACHINES, function catalogEntries, function endsText, function renderCatalogTable, function renderCatalogEntry, const cell, function renderCatalogMarkdown
- `src/cli/errors/index.ts`: added export from "./helpers/index.ts", const ERRORS_USAGE, const GRAPH_USAGE, const errorsCommand, const graphCommand
- `src/cli/launch/launch.test.ts`: changed function capture
- `src/cli/live/index.ts`: changed function failure
- `src/cli/live/live.test.ts`: changed test "scan needs a known account and explains a missing session"
- `src/cli/publish/index.ts`: changed const PUBLISH_USAGE, const publishCommand
- `src/cli/publish/publish.test.ts`: changed function fakeSession
- `src/cli/runner/index.ts`: changed const COMMANDS
- `src/cli/watch/helpers/toCheckOutcome.ts`: changed function toCheckOutcome
- `src/cli/watch/watch.test.ts`: changed test "classifies worker results", test "a missing session stops with code 1"
- `src/errors/catalog/catalog.test.ts`: added const root, const entries, const CAMEL, const STEP_ACTORS, const listing, function publishFailing, test "every code and every layer is camelCase (AGENTS.md rule 1)", test "every entry says where it is raised and what a person does", test "SOLVER_DEAD_CODES is exactly the skipSolver codes", test "python/errorCatalog.json is the current export (run `bun run errors:export`)", test "toKnownCode keeps known codes and marks unknown ones", test "worker output: failures get catalog codes, results and doctor pass through", test "session replies: codes and issues are checked, the rest passes through", test "every literal code in the Python is in the catalog", test "no failure uses the old free-text "error" field", test "codes are never built from strings at runtime", test "stopping ends every code with a publish end where the catalog says", test "every account code stops the run as blocked", test "a runtime failure after Publish is crashedAfterPublish, never failed", test "a crash while solving a captcha fails the run (nothing was published)"
- `src/errors/catalog/helpers/index.ts`: added export from "./knownCode"
- `src/errors/catalog/helpers/knownCode.ts`: added function isErrorCode, function errorEntry, function toKnownCode, function solverDeadCodes
- `src/errors/catalog/index.ts`: added export from "./helpers/index", export from "./types"
- `src/errors/catalog/types.ts`: added type ErrorLayer, type PublishEnd, type MonitorEnd, type CaptchaEnd, interface ErrorEntry, const reconnect, const tellMatt, const ERROR_CATALOG, type ErrorCode, type CodeOfLayer, type CaptchaStopReason, interface CodedFailure
- `src/marketplace/account/client.ts`: changed const FACEBOOK_ACCOUNTS
- `src/marketplace/account/helpers/classifySignal.ts`: changed const RULES, function classifySignal
- `src/marketplace/account/helpers/writeBlocking.ts`: changed const WRITE_BLOCKING_ISSUES
- `src/marketplace/account/types.ts`: changed type AccountIssue
- `src/marketplace/monitor/machine.test.ts`: changed test "maps Listaro signals onto one account issue each", test "a transient error gets one quick retry, which does not count as a new check", test "circuit breaker trips after the same error 3 times in a row", test "account issues stop the account; a rate limit rests, then checks again"
- `src/marketplace/monitor/machine.ts`: changed const monitorMachine
- `src/marketplace/monitor/types.ts`: changed type CheckOutcome, interface MonitorContext
- `src/marketplace/publish/helpers/index.ts`: added export from "./publishEnd"
- `src/marketplace/publish/helpers/publishEnd.ts`: added function publishEnd
- `src/marketplace/publish/machine.test.ts`: changed interface Script, function run, test "reCAPTCHA: CaptchaKraken fails twice, 2Captcha gets it", test "FB's own challenge stops at needsPerson without spending a solve", test "an account issue stops the run as blocked", test "a step that cannot confirm its write fails at that step"
- `src/marketplace/publish/machine.ts`: added const stepFailure, const crash · changed const publishMachine · removed interface FailureParams
- `src/marketplace/publish/types.ts`: added type StepFailure, interface PublishFailure · changed type FormOutcome, interface SolveOutput, type PublishResultKind, interface PublishContext, interface PublishOutput · removed type PublishIssue, interface StepFailure
- `src/observability/graph/helpers/index.ts`: added export from "./toMermaid.ts"
- `src/observability/graph/helpers/toMermaid.ts`: added interface Node, interface Edge, function eventLabel, function guardLabel, function toMermaid
- `src/observability/graph/index.ts`: added export from "./helpers/index.ts"

What changed: One error catalog (`src/errors/catalog/types.ts`, ~90 codes). For every code it holds the layer, meaning, whether it clears by itself, where it's raised, the publish / monitor / captcha end, and what a person does. `ErrorCode`, `AccountIssue` (now camelCase: `neverConnected`, `rateLimited`...), the router's stop reasons and `SOLVER_DEAD_CODES` are all derived from it. The publish machine sends every failure through a new `stopping` state that reads the code's end from the catalog (`publishEnd`). A runtime failure after Publish is clicked becomes `crashedAfterPublish` and ends `unconfirmedId`; before, a crash while publishing ended `failed`, which hid a possibly live listing. `PublishIssue` is gone: the form's issues are account codes, so a limit at review now ends `blocked`, not `failed`. Worker and session failures are `{ code, detail }`. The `split(":")` parsing is gone, and the monitor's retryable flag comes from the catalog. Both Python boundaries turn an unknown code into `uncatalogued`. The Python reads `python/errorCatalog.json` (`bun run errors:export`) through `errorCodes.py`, and its code mappers are explicit tables. New `log errors [--layer|--code|--json|--markdown]` and `log graph publish|monitor` (Mermaid read from the machine definition), with `docs/errorCatalog.md` generated. Camoufox is now always headed with humanize 1.5 and the cursor shown (`python/visibleBrowser.py`; the worker forces it on facebook-camofox-client's launches), and `--headless` is removed. publishSession.py reads stdin as UTF-8, which fixes `conditionNotSet`: on Windows the en dash in "Used – good" arrived as cp1252 and never matched.
Why: matt: "how are we defining the states and clearly defined errors? ... how we know exactly what is happening with all the errors", then "proceed with the best plan" (steps 1–5 of the plan: catalog, Python follows it, `{ code, detail }`, camelCase AccountIssue, generated diagrams + a test that every code reaches its end). Rule 11, from matt: "there's no means for this ever to be ... headless ... It always has to be headed ... make sure that we have humanize on ... see the actual cursor".
Checked: `bun run check`: naming gate ok, tsc ok, 225 pass. `catalog.test.ts` runs every code through the machine it claims to end in (publish per raising state, every account code to blocked, router reasons, solver skip/retry, monitor ends), and checks that the Python's literal codes and both exports match the catalog. `visible.test.ts` enforces rule 11. A real headed Camoufox dry run against `python/fixtures/createItem.html` now reaches `done`: category, 2/10 photos, title, price, condition "Used – good" and description all read back, with a review screenshot. Not checked: live Facebook, a live captcha solve (no keys yet), and `--live` past review.

## 2026-10-18 07:10Z · feat/publishMachine

AST (generated from the staged code by scripts/astSummary.mjs, don't edit):
- `AGENTS.md`: edited
- `docs/errorCatalog.md`: edited
- `docs/proxies.md`: new file
- `python/errorCatalog.json`: edited
- `python/logWorker.py`: changed def main
- `python/proxyGate.py`: added class GateError, def arm, def load_proxy, def playwright_proxy, def exit_location, def _machine_country, def check, def apply
- `python/publishSession.py`: changed class Session, def main
- `python/visibleBrowser.py`: added def launch_kwargs · changed def force_visible
- `skills/logCli/SKILL.md`: edited
- `src/camofox/proxy/client.ts`: added function proxyPath, type ReadProxyResult, function readProxy, function writeProxy
- `src/camofox/proxy/helpers/countryOfLocation.ts`: added const regionNames, const CODE_BY_NAME, function countryOfLocation, function countryName
- `src/camofox/proxy/helpers/index.ts`: added export from "./countryOfLocation.ts", export from "./validateProxy.ts"
- `src/camofox/proxy/helpers/validateProxy.ts`: added const SERVER, const COUNTRY, function validateProxy, function maskProxy
- `src/camofox/proxy/index.ts`: added export from "./helpers/index.ts", export from "./types.ts", export from "./client.ts"
- `src/camofox/proxy/types.ts`: added interface ProxyConfig, interface ProxyCheck
- `src/camofox/session/types.ts`: changed interface SessionConfig
- `src/camofox/session/visible.test.ts`: added test "publishSession.py launches only through launch_kwargs (proxy gate, then visible)", test "only a sign-in may launch without a proxy", test "the gate checks the exit country and pins geoip to the exit IP" · removed test "publishSession.py launches only through visible_kwargs"
- `src/camofox/worker/types.ts`: changed type WorkerAction, interface WorkerRequest, interface WorkerResultMap
- `src/cli/live/index.ts`: added function requireProxy · changed const connectCommand, const scanCommand, const statusCommand
- `src/cli/live/live.test.ts`: added const proxyDir, const savedProxyDir, test "rule 12: scan and status refuse an account with no proxy, without starting the worker", test "the worker gets the proxy file path, never the credentials"
- `src/cli/proxy/index.ts`: added const PROXY_USAGE, const proxyCommand, function refused
- `src/cli/proxy/proxy.test.ts`: added const root, const saved, function run, test "countryOfLocation reads the last part, and refuses to guess", test "validateProxy wants scheme://host:port and an ISO country", test "maskProxy never shows the password", test "set validates, saves; show masks the password", test "check asks the worker with the file path, and explains a refusal", test "needs an action and a known account"
- `src/cli/publish/index.ts`: changed const publishCommand
- `src/cli/publish/publish.test.ts`: added test "rule 12: no proxy, or a listing in another country, refuses before any browser opens" · changed const ENV
- `src/cli/runner/index.ts`: changed const COMMANDS
- `src/cli/watch/index.ts`: changed const watchCommand
- `src/errors/catalog/types.ts`: changed const ERROR_CATALOG

What changed: No Camoufox opens for an account unless its proxy is attached and its exit IP is in the account's country (AGENTS.md rule 12). Each account's proxy is `~/.logCli/proxies/<accountId>.json` (server, username, password, country), read by `camofox/proxy`. It is managed with `log proxy set | show | check` (show masks the password; check resolves the exit IP and its country without a browser). The TS refuses `scan`, `status` and `publish` with `noProxy` before any Python starts. `publish` also refuses a listing whose "City, Country" isn't in the account's country (`listingCountryMismatch`). The Python only gets the file path, never the credentials. Every launch goes through `python/proxyGate.py`, from `visibleBrowser.launch_kwargs()`: it reads the file, resolves the exit IP through the proxy and its country (Camoufox's own `public_ip` and GeoIP), and refuses with `noProxy` / `proxyUnreachable` / `proxyAuthFailed` / `proxyMalformed` / `proxyCountryMismatch`. Otherwise it launches with the proxy and `geoip=<exit IP>`, so timezone, locale, geolocation and WebRTC match the proxy. `logWorker.py` arms the gate with `allow_no_proxy` only for `login` (signing in, matt's exception), and warns which country Facebook will see. `force_visible()` makes facebook-camofox-client's launches go through the same gate. The new codes are in the catalog as `account` codes (publish → blocked, monitor → blocked). `docs/proxies.md` explains how proxies load, before and now.
Why: matt: "outline to me exactly how the proxies are loaded into camoufox ... we cannot open the browser unless the proxies are attached, unless they're signing in ... if it shows that I am in one country when a listing is meant to go into another country ... never allowed to happen". Before this, log-cli had no proxy at all. This machine's IP geolocates to VN, so every launch would have shown the Galway accounts in Vietnam. Listaro had no country checks either and went direct when an account had no proxy (research in docs/proxies.md).
Checked: `bun run check`: naming gate ok, tsc ok, 244 pass. Real runs through a local CONNECT proxy (exit 116.105.162.81, VN):
- `log proxy check` gave `noProxy` with no file, `proxyCountryMismatch` for a file saying IE, passed for a file saying VN, and gave `proxyUnreachable` for a dead port.
- `log publish` against the fixture stopped at `blocked · proxyCountryMismatch` (IE file) before any window opened, and ran the full dry run to `done` with the VN file.
- A "Galway, Ireland" listing on the VN account was refused with `listingCountryMismatch`.
Not checked: a real residential proxy, the 407 path against a real authenticated proxy, and that the browser's own traffic went through the proxy (the fixture is a local file; only the gate's exit check went through it).
