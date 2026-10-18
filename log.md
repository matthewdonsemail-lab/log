# log

One entry per commit, newest at the bottom. The pre-commit hook adds the
template; the agent fills in every `AST:` line before the commit goes
through. Never edit old entries. Add a new one.

## 2026-10-18 04:01Z · main · 1407332

Files: the whole first cut (`bin/`, `src/marketplace/`, `src/cli/`, `scripts/checkNamingConventions.mjs`, `docs/namingConventions.md`)

AST: What changed: created log-cli. It loads log's Facebook Marketplace seed (6 listings, 3 accounts, the listing state machine), has the rank-cli command registry, and `log launch` as a Clack menu.
AST: Why: matt asked for log-cli built from listeningkit-hackathon data and the Nebius rank CLI, Marketplace only, camelCase `{library}/{domain}/` naming.
AST: Checked: `bun run check` (naming, typecheck, 24 tests); every command run against the seed.

## 2026-10-18 05:09Z · feat/liveMarketplace · 5b314ee

Files: `python/logWorker.py`, `src/camofox/worker/`, `src/cli/live/`, `src/cli/launch/`, `README.md`, `AGENTS.md`

AST: What changed: added `log doctor`, `login`, `scan` and `status`. They launch Camoufox through facebook-camofox-client via `python/logWorker.py`, with one saved session per account.
AST: Why: log-cli only read the seed and never launched a browser. matt pointed at the old setup: inferencesaver `facebook-client.mjs` and Listaro.
AST: Checked: 33 tests; `doctor` is all green on matt's PC; `scan` launched Camoufox and reported the login wall for an empty session.

## 2026-10-18 05:22Z · feat/xstateMonitor · df2ca4b

Files: `src/marketplace/monitor/`, `src/observability/trace/`, `src/cli/watch/`, `src/marketplace/account/helpers/classifySignal.ts`, `package.json`

AST: What changed: added xstate 5.33.3, a listing monitor machine (check, quick retry, circuit breaker, 24h rest, blocked, relist decisions) and `log watch`, which prints every step through XState inspect.
AST: Why: matt asked for XState so the process can be started from the CLI and watched, using Listaro's retry and account-status rules next to facebook-camofox-client's relist rules.
AST: Checked: 51 tests; real `log watch` runs stopped at `blocked` with `never_connected`, then with `session_expired`.

## 2026-10-18 05:22Z · feat/xstateMonitor · fa8972d

Files: `README.md`, `AGENTS.md`

AST: What changed: documented the monitor, and restored README after a bad Windows-encoding write emptied it in df2ca4b.
AST: Why: the README was empty in the previous commit.
AST: Checked: README diff against the first commit only adds lines.

## 2026-10-18 05:32Z · feat/commitLogAndRules

Files: `.githooks/pre-commit`, `AGENTS.md`, `README.md`, `docs/namingConventions.md`, `package.json`, `python/logWorker.py`, `scripts/checkNamingConventions.mjs`, `scripts/commitLog.mjs`, `scripts/commitLog.test.ts`, `skills.md`, `skills/captureRule/SKILL.md`, `skills/commitLog/SKILL.md`, `skills/logCli/SKILL.md`, `src/camofox/worker/helpers/fromCamofoxStatus.ts`, `src/camofox/worker/helpers/index.ts`, `src/camofox/worker/helpers/toListingStatus.ts`, `src/cli/launch/launch.test.ts`, `src/cli/listing/index.ts`, `src/cli/live/index.ts`, `src/cli/live/live.test.ts`, `src/cli/runner/cli.test.ts`, `src/cli/watch/helpers/toCheckOutcome.ts`, `src/cli/watch/index.ts`, `src/cli/watch/watch.test.ts`, `src/marketplace/account/client.ts`, `src/marketplace/account/types.ts`, `src/marketplace/listing/client.test.ts`, `src/marketplace/listing/client.ts`, `src/marketplace/listing/machine.test.ts`, `src/marketplace/listing/machine.ts`, `src/marketplace/listing/types.ts`, `src/marketplace/monitor/machine.test.ts`

AST: What changed: every value is camelCase now (statuses `underReviewDuplicate`/`loginWall`, account ids `fbGalwayRubbish`, worker codes `noSession`, usage `<listingId>`), and camofox kebab statuses are converted at the worker boundary. The naming gate rejects kebab-case string values and kebab file names in skills/python/scripts. Added log.md with this pre-commit gate, the AGENTS.md hard-rules list, and skills/ (logCli, commitLog, captureRule) indexed in skills.md.
AST: Why: matt: kebab-case was still in the repo after he said camelCase only; every commit must add to log.md with AST lines the agent fills in; his rules go into AGENTS.md as hard facts; routines become a skills directory like twitter-controller.
AST: Checked: `bun run check` (naming gate OK, typecheck, 54 pass); planted `'no-session'` in src and the gate failed on it; this commit went through the hook: the first try was blocked and the template was added.
