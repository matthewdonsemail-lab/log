# AGENTS.md — log-cli

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
