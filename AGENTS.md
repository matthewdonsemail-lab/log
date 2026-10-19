# AGENTS.md — log-cli

## Always run it live, so matt can watch (matt, 2026-10-19)

Every command that takes more than a few seconds (a run, a settle, a docs
build, rea, tests) is run so its lines show up live as they happen, never
only at the end. matt must always be able to see what is going on.

- **Agents (Claude Code):** run it with **Monitor**, as
  `<command> 2>&1 | tee <runFolder>/<name>.log; echo "EXIT ${PIPESTATUS[0]}"`.
  Each line streams into the chat. Never pipe through `tail` or `head`
  (they hold everything back until the end), never run it silent in the
  background.
- **Code:** anything that runs over time logs one line per stage as it
  happens (`context.err`, or the run folder's `.log`), never one summary at
  the end. A step that can take minutes says what it is doing and how far
  along it is (`rea 3/12 ...`).
- Say in chat what each stage means as it comes in, in plain words.

Rule 26 below.

## How we fix problems: read the run, then fix (matt, 2026-10-19)

This is the most important outline in the repo. The machines
(`marketplace/connect`, `marketplace/publish`) already encode most of the
steps. When a run fails, hangs or meets something new, don't guess: every
run records a raw HAR of everything (rule 22), and rea reads it, so we can
see exactly what caused what, then fix the machine.

rea is not a side project. It answers "what caused what" in a run:

> 09:20:13 we pressed Enter on login
> 09:20:14 Facebook answered request X with field Y = "checkpoint"
> 09:20:15 the page redirected to /checkpoint
> So the checkpoint was decided at the login submit, by response X, 1
> second after we pressed Enter.

That tells us what Facebook reacted to, how fast, and what to wait for
instead of guessing.

The loop, every time a run doesn't end the way it should:

1. **Run** the action (`log connect`, `log publish`, ...). It records
   `session.har` and `steps.jsonl` in its run folder.
2. **Timeline first, in seconds.** Per step: when it started, what we did,
   what Facebook sent back, how long it took, what changed on the page.
3. **Cause line for every outcome.** For each stop (login wall, checkpoint,
   captcha, video selfie, `locationNotSet`, a hang), the first Facebook
   response that signalled it, and the time from our action to that signal.
4. **Compare runs.** Same steps, different outcome (e.g. Philadelphia
   checkpointed, Allentown fine): find where they first differ.
5. **Code reading last.** rea's slow script analysis runs after the timeline
   is written, and is used to explain an unfamiliar request or field.
6. **Fix the machine** from what the timeline and cause lines show, then run
   once more and read it again (respecting rule 24's launch budget).

Output: one plain `findings.md` per run, timeline and cause lines at the top.
How: `skills/reaCapture/SKILL.md` (rea tools: `analyze_javascript_application`,
`inspect_web_network_capture`, `inspect_analysis_view`).

Status 2026-10-19: built: step 5 per request (`log firefoxCapture --docs`,
`docs/facebookClient/`, rule 27: syntax-tree slices, rea about 4 s each),
and the per-step request timings that steps 2-3 need (in each doc). Settle no
longer reads the whole bundle. Not built yet: the per-run timeline file, the
automatic cause line, and comparing two runs (step 4).

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
20. 2026-10-19 · matt asked for `--bypass`: on publish, scan, status, watch,
    campaign run and connect it skips rule 18's waking hours for that run, and
    nothing else. The proxy gate, home locale, device and launch self-check
    (rules 11, 12, 15-17) still run, and `--live` still needs matt (rule 10).
    It is never on by default; pass it only when matt asks for a run outside
    the account's hours.
21. 2026-10-19 · matt asked for auto-login: `log connect --noPrompt` (always,
    over MCP) signs in by itself with the account's Twenty email, password
    and totpSecret, typing the current authenticator code on the two-step
    page (`python/autoLogin.py`). They are read only by
    `twenty.loginSecrets`, for that run, into the run folder's `login.json`
    (0600, deleted with it), and are never printed or logged. Every vendor
    order in `docs/vendors/*.txt` (git-ignored) is imported with all its fields
    by `scripts/importVendorAccounts.mjs`, which shows each field only as
    `<set>` or `<empty>`.
22. 2026-10-19 · Every action records a HAR, with no way to turn it off.
    The proxy gate puts a raw HAR recorder (rule 19) on every browser context,
    and refuses a context without a capture folder (`captureMissing`). That
    covers connect, scan, status, each watch check and publish. Each run keeps
    `~/.logCli/runs/<action>/<time>_<account>/firefox` (publish: its run
    folder): `session.har`, `steps.jsonl` (every action the run logged, timed),
    and `steps/NN_<action>.har`, one per step, each read by the local rea
    (`settleRunCapture`). Never committed.
23. 2026-10-19 · matt: "whatever Listaro did we go with that path". `log
    connect` is the connect machine (`marketplace/connect`), and every sign-in
    page takes Listaro_backup's path (`src/lib/auto-login`,
    `src/lib/fb-login-helper.ts`): the cookie banner is accepted, "Find your
    account" submitted once, "We suspect automated behaviour" dismissed,
    login captchas solved (rule 10's solvers), two-step and trust-device
    answered, signed in only with c_user and xs, then the Marketplace check.
    For connect this narrows rule 10: only identity, photo, video and SMS
    checkpoints go to a person. `marketplace/connect/machine.test.ts`.
24. 2026-10-19 · matt: "fix them issues now" (the launch budget from
    RESEARCH/LOG_CLI_RUN_CAPTURES_2026_10_19.md). One account's browser opens
    on Facebook at most 8 times per local day, dry runs counted, at least 10
    minutes apart. A launch counts once it passed the gate ("Self-check
    passed" in its `steps.jsonl`). Refused before anything opens:
    `launchTooSoon`, `launchBudgetSpent` (`camofox/run/helpers/launchBudget.ts`).
    `--bypass` doesn't skip it; only a publish against the saved fixture form
    (`--formUrl file://...`) isn't counted. A publish meets a login wall or
    checkpoint in its own browser (the connect steps run there), never in a
    second launch.
25. 2026-10-19 · matt: a run that fails or hangs is fixed from its own
    recording, never by guessing. Read its HAR with rea (timeline, cause
    line, compare runs), then fix the machine. The outline is at the top of
    this file.
26. 2026-10-19 · matt: "I always want to see what is going on." Every
    process that runs over time writes a progress line per stage as it
    happens (never only at the end) and to a log file in its folder. Agents
    run long commands so the lines stream live (Claude Code: Monitor, never
    piped through `tail`/`head`).
27. 2026-10-19 · matt: every request Facebook's client makes in our runs is
    documented by domain in `docs/facebookClient/<domain>/<request>.md`:
    what it sends and reads, which step fires it, how fast, what errors it
    returns, and why it matters to our machines. Built by
    `log firefoxCapture --docs`: our syntax-tree parse cuts each request's
    modules out of Facebook's bundles, rea reads each slice (seconds, not the
    whole bundle). lefthook's pre-push (`check:facebookClientDocs`) refuses a
    push while a request is undocumented, unread by rea, has its reasoning
    unwritten, or a run is newer than the docs.
28. 2026-10-19 · matt asked for profile setup: `log profile setup --account
    <a>` sets the account's profile picture and cover photo from Twenty
    (`socialAccounts.profilePhoto`, `coverPhoto`; a URL or path, fetched
    through the account's proxy and varied, `media/photo`), both in one run
    (matt's choice), through the profile machine (`marketplace/profile`,
    `python/profileSession.py`). A dry run unless `--live`; the dry run
    lists every control the profile page has in `profileFound.txt`, and the
    clicks are checked against it before the first `--live` (rule 25). It is
    a launch like any other (rules 11-12, 15-18, 22, 24). 2026-10-19, matt
    also chose to rename the profile (`socialAccounts.profileName`, first
    "Allentown Trash"), knowing Facebook reviews names and allows about one
    change per 60 days: the dry run reads the name page (`nameFound.txt`),
    and the rename is built from that recording before any `--live` renames.
    Bio and every other profile field stay read-only (rule 8).
29. 2026-10-19 · matt: look before writing code for a page. `log inspect
    start --account <a>` opens one gated, headed Camoufox (async API, same
    launch and gates as every run) and keeps it open; `log inspect do
    <action>` runs one step (goto, snapshot, back, wait; click, type, press
    only with `--live`, rule 8). Each step records, in order, as it happens:
    the accessibility snapshot with element refs (camofox-mcp's model,
    `aria_snapshot(mode="ai")`), a screenshot, its own HAR, and rea's
    reading of that HAR at once. Code that clicks on a page is written from
    an inspect recording of that page, never before one.
30. 2026-10-19 · matt: "If I tell you to do something, do it completely."
    When matt gives a plan, it is carried out to the end in the same turn,
    not stopped to ask again or to say what won't be done. `log inspect
    start --now` (and `log connect --now`) skips rule 24's 10-minute gap (the 8 a day still holds) so
    a recording continues at once. Recording a sign-in or a checkpoint with
    `log inspect` (signIn, code, solve, click) is the intended work: it is
    how each state gets documented from rea. The run on 2026-10-19 was
    interrupted once because a snapshot printed the account's email and
    password; snapshots now redact every typed field value
    (`redact_fields`), and signIn/code read only the private login.json
    (rule 21), so no credential reaches any output.
31. 2026-10-19 · matt: a recorded procedure becomes the whole pipeline, not
    a one-off. `log inspect` records it (rule 29); `log flow fromInspect`
    turns the recording into a flow definition (each step's element by role
    and name from the snapshot it acted on, each step's confirming request
    from what it sent, rea's Evidence per step,
    `src/camofox/flow/definitions/<name>.json`); `log flow docs` writes its
    documentation (`docs/facebookClient/flows/<name>.md`, linked to each
    request's doc); `createFlowMachine` makes it an XState machine; `log flow
    run <name> --account <a> --set …` runs it on any account (dry run
    unless `--live`), recording every step again; and every saved flow is an
    MCP tool of its own (`flowProfileSetup`). The docs gate requires each
    flow's doc.

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

- `doctor`, `scan`, `status` go through `camofox/worker` and launch a real
  Camoufox browser. `connect` is the connect machine
  (`marketplace/connect`) driving `python/connectSession.py` one step at a
  time, like publish. Tests inject `worker` and `connectSession` into the
  context and never launch a browser.
- Read-only on Facebook, except `connect`, which only signs in and saves a session, and
  `log publish --live` (rule 10). Don't add editing or deleting without matt
  asking.
- Cookies, browser storage, proxies, devices and 2FA secrets live in Twenty
  only. A run writes the account's proxy, device file and session
  (cookies + localStorage) to a private temp folder for the Python
  (`camofox/run`) and deletes it afterwards. After the run the session the
  browser left is saved back (only while it still holds a Facebook login),
  and a newly made device is saved once. Never commit, print or paste them;
  `log` never selects password, email or totpSecret, except
  `twenty.loginSecrets` for `connect`'s auto-login (rule 21) and for
  `publish`'s in-browser sign-in (rule 24), the same private file both times. The proxy
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
- Hooks are lefthook (`lefthook.yml`), installed by `bun install`.
  pre-commit runs the `log.md` gate (rule 5, `skills/commitLog/SKILL.md`);
  pre-push runs naming, typecheck, tests and the Facebook client docs gate
  (rule 27). Never `--no-verify`.
