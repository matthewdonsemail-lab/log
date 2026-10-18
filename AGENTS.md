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
5. 2026-10-18 · Every commit adds a `log.md` entry. On commit, the hook
   parses the staged code into an abstract syntax tree (AST) and writes what was
   added, changed or removed into the entry. The agent then writes What changed,
   Why and Checked from that AST. The hook blocks the commit until that's
   done, and rejects an AST block that doesn't match the code. Never
   `--no-verify`. "AST" means abstract syntax tree, never a line prefix.
6. 2026-10-18 · Processes that run over time are XState machines that can be
   started and watched from the CLI (`log watch`, `observability/trace`).
7. 2026-10-18 · How the work is done is written down as skills in
   `skills/<camelCaseName>/SKILL.md` (the twitter-controller layout), indexed
   in `skills.md`. When a routine changes, update its skill in the same
   commit.
8. 2026-10-18 · Read-only on Facebook. Nothing is posted, edited or deleted
   unless matt asks for it.
9. 2026-10-18 · Captchas are solved with CaptchaKraken's hosted API
   (matt has credits). The key goes in `.env.local`, with the template in `.env.example`.
   `open-typesafe-camoufox` is stale, so don't port from it. How posting works,
   with sources, is in `docs/listingPublish/`.
10. 2026-10-18 · matt asked for posting: `log publish` posts one listing
    through the publish machine. It is a dry run unless `--live`, and once
    Publish is clicked nothing is retried. Captchas go CaptchaKraken first,
    then 2Captcha, and Facebook's own challenges go to a person. Rule 8 still
    holds for editing and deleting.
11. 2026-10-18 · Camoufox is never headless. Every launch is headed so the
    window can be watched, with humanize on and the cursor shown
    (`python/visibleBrowser.py`). There is no flag to turn it off.
    `camofox/session/visible.test.ts` enforces it.
12. 2026-10-18 · No browser opens for an account unless its proxy is attached
    and its exit IP is in the account's country (`python/proxyGate.py`). There
    is no exception: not dry runs, not signing in (matt: "never, ever open"
    without one). Listings must be in the account's country, and the form's
    location must be picked in that country. How it works: `docs/proxies.md`.
13. 2026-10-18 · Twenty is the only place accounts and listings live: Facebook
    accounts are `socialAccounts` (platform FACEBOOK), listings are
    `agencyListings`. Never delete either: a banned or dead account keeps its
    record with its status, and its campaign listings get replacement accounts
    in the same country (`docs/accountsAndListings.md`). Fields are only ever
    added (`scripts/twentySetup.mjs`), never renamed or retyped, so the
    twitter-controller keeps working.
14. 2026-10-18 · Twenty is reached through the generated GraphQL client, the
    same one blaster and the dialer use (`bun run twenty:client`,
    `src/twenty/graphql/generated`). Regenerate it after any field change.
15. 2026-10-18 · One device per account: its first launch makes one Windows
    Camoufox identity (screen, GPU, fonts, voices, audio seed, geolocation)
    stored in `socialAccounts.deviceProfile`, and every launch
    replays it exactly (`python/deviceProfile.py`). Never regenerated or
    printed; an unreadable one is refused (`deviceProfileInvalid`).
16. 2026-10-18 · The locale is pinned per home country at launch, from one
    table (`HOME_COUNTRIES` in `src/marketplace/home/types.ts`: IE en-IE, GB
    en-GB...). navigator, Accept-Language and Intl agree in pages and workers.
    A country not in the table is refused (`noHomeLocale`).
17. 2026-10-18 · Launch self-check: before any page loads, the gate checks in
    the page and a worker that the timezone is the exit IP's, the language and
    Intl locale are the pinned locale, and the browser's exit IP is the
    checked one. Any mismatch closes the browser before Facebook loads.
18. 2026-10-18 · No run outside the account's local waking hours (08:00-22:00
    in its home timezone, or `activeHoursStart`/`activeHoursEnd`): publish,
    scan, status, watch, campaign run and connect are refused with
    `outsideActiveHours`. Daily caps count the account's local day.
19. 2026-10-18 · Captures are kept raw for analysis. The HAR `log publish`
    records from Camoufox keeps every cookie, header, token and body: nothing
    is stripped, because rea, SubQ and the matrices need it. It is only for
    matt's own development machine: it stays in the run folder
    (`~/.logCli/publish/<run>/firefox`) and is never committed
    (`skills/reaCapture/SKILL.md`). The REA work is based on live runs.

## Checks

- Run `bun run check` before pushing: naming gate, `tsc --noEmit`, `bun test`.
- Naming: `docs/namingConventions.md`. camelCase everywhere, never kebab-case,
  `{library}/{domain}/` with `index.ts`, `types.ts`, `client.ts`, `machine.ts`,
  `helpers/`.

## Scope

- Facebook Marketplace only: listings and the Facebook accounts that publish
  them. X, Reddit, keywords and communities from listeningkit-hackathon are out
  of scope until asked for.
- Data comes from Twenty through `marketplace/socialAccount`,
  `marketplace/agencyListing` and `marketplace/replacement`, over
  `twenty/graphql`. Commands get it from `context.twenty`; tests inject
  `marketplaceFixture()` (an in-memory Twenty) and never call the network.
- The listeningkit-hackathon seed (`context.load()`) stays only for the
  listing machine port below.
- `marketplace/listing/types.ts` and `machine.ts` are ports of
  `apps/web/src/lib/listings/types.ts` and `machine.ts`. Keep them in step
  with the source.

## Live mode

- `doctor`, `login`, `scan`, `status` go through `camofox/worker` and launch
  a real Camoufox browser. Tests always inject `worker` into the context and
  never launch a browser.
- Read-only on Facebook, except `login`, which only saves a session, and
  `log publish --live` (rule 10). Don't add editing or deleting without matt
  asking.
- Cookies, browser storage, proxies, devices and 2FA secrets live in Twenty
  only. A run writes the account's proxy, device file and session
  (cookies + localStorage) to a private temp folder for the Python
  (`camofox/run`) and deletes it afterwards. After the run the session the
  browser left is saved back (only while it still holds a Facebook login),
  and a newly made device is saved once. Never commit, print or paste them;
  `log` never selects password, email or totpSecret at all. The proxy
  username's first part is the 2Captcha password: it is masked too.
  The exception is the raw capture HAR (rule 19), which keeps the session
  cookies and tokens in the local run folder for analysis.

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
