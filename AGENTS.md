# AGENTS.md — log-cli

## Hard rules (from matt)

When matt states a rule, add it here as one dated line in the same session,
in the commit that applies it (`skills/captureRule/SKILL.md`). Rules are
facts, not suggestions. Newest at the bottom. Never delete one without matt.

1. 2026-10-18 · camelCase everywhere, never kebab-case: files, folders,
   values, ids, statuses, error codes, usage text. Other systems' kebab-case is
   converted once, at the boundary. `bun run check:naming` enforces it.
2. 2026-10-18 · Code lives in `src/{library}/{domain}/`, using the role files
   (`index.ts`, `types.ts`, `client.ts`, `machine.ts`, `helpers/`).
3. 2026-10-18 · Facebook Marketplace only, until matt widens the scope.
4. 2026-10-18 · Commit and push as matt (`GIT_CONFIG_COUNT=0`). PRs go to
   GitHub `origin`.
5. 2026-10-18 · Every commit adds a `log.md` entry, and the agent fills in its
   `AST:` lines (what changed, why, how it was checked). The pre-commit hook
   blocks the commit until that's done. Never `--no-verify`.
6. 2026-10-18 · Processes that run over time are XState machines that can be
   started and watched from the CLI (`log watch`, `observability/trace`).
7. 2026-10-18 · How the work is done is written down as skills in
   `skills/<camelCaseName>/SKILL.md` (the twitter-controller layout), indexed
   in `skills.md`. When a routine changes, update its skill in the same
   commit.
8. 2026-10-18 · Read-only on Facebook. Nothing is posted, edited or deleted
   unless matt asks for it.

## Checks

- Run `bun run check` before pushing: naming gate, `tsc --noEmit`, `bun test`.
- Naming: `docs/namingConventions.md`. camelCase everywhere, never kebab-case,
  `{library}/{domain}/` with `index.ts`, `types.ts`, `client.ts`, `machine.ts`,
  `helpers/`.

## Scope

- Facebook Marketplace only: listings and the Facebook accounts that publish
  them. X, Reddit, keywords and communities from listeningkit-hackathon are out
  of scope until asked for.
- Data comes through `marketplace/*/client.ts`. Today that is the dashboard's
  seed (`apps/web/src/lib/listings/mock.ts`, `connections/mock.ts` in
  listeningkit-hackathon). Change the client when the live
  facebook-camofox-client lands, never the commands.
- `marketplace/listing/types.ts` and `machine.ts` are ports of
  `apps/web/src/lib/listings/types.ts` and `machine.ts`. Keep them in step
  with the source.

## Live mode

- `doctor`, `login`, `scan`, `status` go through `camofox/worker` and launch
  a real Camoufox browser. Tests always inject `worker` into the context and
  never launch a browser.
- Read-only on Facebook, except `login`, which only saves a session. Don't add
  posting, editing or deleting without matt asking.
- Session files (`~/.logCli/facebook/*.json`) hold live cookies. Never commit,
  print or paste them.

## Monitor (XState v5)

- `marketplace/monitor/machine.ts` is XState v5 (`setup()`, named guards,
  actions and delays). Its only side effect is the `check` actor, which the
  caller provides with `machine.provide`. Tests script `check` outcomes and use
  1ms timings.
- Every new process that runs over time should be a machine run through
  `observability/trace`, so `log` can show each step.
- The monitor decides and never posts. A repost executor is a separate,
  explicit step for matt to ask for.

## CLI shape (from rank-cli)

- Commands return `{ code, stdout, stderr }` and never write to the console
  directly. The runner prints. This keeps them testable.
- Usage is generated from `COMMANDS` in `cli/runner/index.ts`. A new command
  goes in that list.
- `log launch` is a thin Clack wrapper. It only prompts, then delegates to
  the scriptable commands. `--json`, piped output or no TTY never prompt.
  Tests stub `launchDeps`.

## Git

- Commit and push as matt (`GIT_CONFIG_COUNT=0 git ...`), and open PRs on GitHub `origin`.
- `bun install` sets `core.hooksPath` to `.githooks`, so the `log.md` gate
  runs on every commit. The flow is in `skills/commitLog/SKILL.md`.
