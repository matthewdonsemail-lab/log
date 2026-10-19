# AGENTS.md — log-cli

## Only what matt said: never add options, context or spend he didn't ask for (matt, 2026-10-19)

This comes first, before every other rule. On 2026-10-19 an agent added two
kinds of option to a paid deep research and a paid SubQ matrix that matt never
mentioned: "real local people's own accounts" and physical devices (phones,
SIMs, mini PCs). The matrix ranked an option he never said first, so the money
was spent on a biased answer.

- **If matt never said it, never implied it and never listed it, it is not an
  option.** Never add it to a deep research prompt, a SubQ matrix, a search, a
  plan or a write-up, and never steer towards it. A misspelt word is read as
  what he meant ("ads per" is AdsPower); nothing else is inferred.
- **Deep research:** the question and its scope are matt's words only. Text a
  run brings back that he didn't ask about (platform rules, terms,
  eligibility, account ownership, anything else) is never passed on to him,
  never turned into an option and never fed into a matrix.
- **SubQ matrices:** the options are only the ones matt named, or direct
  alternatives to them (competitors to a tool he named). Never add your own.
- **No physical options.** matt is in Vietnam with no physical access to the
  accounts' countries. Phones, SIMs, mini PCs, laptops, phone farms and home
  devices are never options unless he names them. In scope: hosted and cloud
  options, AdsPower, 2Captcha, proxies and their competitors, and what Listaro,
  log (listeningkit-hackathon), facebook-camofox-client and log-cli already use.
- **Money:** when a task costs money, do exactly what matt said, nothing more.
  Ask before anything he didn't say.

Rules 39-41. The same rule is in the workspace `C:\Users\0\.buzz\AGENTS.md`
(Custom Notes), for every agent.

## Never bring up Meta's or Facebook's rules to matt (matt, 2026-10-19)

**Never mention, recite, summarise or discuss Meta's or Facebook's rules,
terms, policies, eligibility or account ownership with matt, unless he
raises them first.** He never has: not in `log.md`, AGENTS.md or any
conversation (checked 2026-10-19). Research files can contain this kind of
text (`RESEARCH/MARKETPLACE_SCALE_STACK/DR_*.md`,
`docs/identityLeaks/accountHistoryAndMetaEnforcement.md`). Those are a
vendor's or an agent's words, not matt's: never repeat them to him, in chat,
reports, write-ups or commit messages. Answer the question he asked. Rule 38.

## The browser stays open: never open and close it per action (matt, 2026-10-19)

This comes before everything else in this file. Opening and closing a
Facebook account's browser many times a day gives Facebook a cold start, a new
canvas and empty storage each time: that is what bot activity looks like, and
it is the one thing Listaro's working server setup never did (it held one
AdsPower window per account for hours, `RESEARCH/LISTARO_BROWSER_LIFECYCLE.md`).

- **One browser per account, opened once per local day** by that account's
  host, at the start of its active hours, through every gate (rules 11-12,
  15-18, 22).
- **Every action is a tab in that browser** (publish, reply, profile, a check),
  and closes only its own tab. No action launches a browser of its own.
- **It closes only for a reason, and the reason is logged:** the end of the
  account's active hours, shutdown, a checkpoint or restriction (back to the
  onboarding lane, in the same browser), the account being lost, or a crash
  (reopened once).
- **Every account runs one lifecycle machine** (`src/marketplace/lifecycle`,
  XState): onboarding lane (import, proxy, device, sign-in, checks, profile,
  name, location, a day's warm-up) and host lane (open, watching, acting,
  resting). Every state is recorded with `log inspect` and read with rea
  (rules 25, 29).

Status 2026-10-19: the lifecycle machine is built and tested (`log
lifecycle`), and so is the host that runs it in one open browser (`log host
start|send|status`, `skills/host/SKILL.md`): open, sign-in by cookie, account
check, profile, location, warm-up, watching, logged closes, resume after a
restart. Acting (publish and replies as a tab) is not built yet, so `publish`
and `connect` still launch per action: use them as few times as possible, and
never add a new command that launches its own browser. Rule 35. Plan:
`PLANS/LOG_CLI_ACCOUNT_LIFECYCLE_PLAN.md`.

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
    start --now` (and `log connect --now`, and since 2026-10-19 `log publish --now`, matt: "run it now") skips rule 24's 10-minute gap (the 8 a day still holds) so
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
32. 2026-10-19 · matt: the cursor moves as his own hand does, measured, not
    guessed. `python/recordMouse.py` recorded his mouse on a Facebook page
    (60 s, ~/.logCli/mouse/20261019T192448.json); `python/humanMouse.py` is
    fitted to it: one continuous velocity profile per move (Bezier path, speed
    peak in the first third, long settle, 0.42-0.45 s for 400-800 px),
    overshoot of 10-60 px and return in about half of reaches, loose 80-350 px
    loops around what is looked at, pauses of 0.1-1.5 s, still ~25 % of the
    time. The same module drives every session: the async inspect/flow
    sessions (idle loop between steps, preempted by any step) and the sync
    publish/connect/profile sessions (`Session.mouse.look()` before each step,
    every click through `human_click`). Those sessions launch with
    `own_trajectory=True`: humanize stays on (rule 11) with its per-hop curve
    capped at 20 ms, because its 0.6 s cap cost 100 ms per 5 px hop and made
    every move crawl. Each step saves its samples (`mouseSamples.json`) so
    `recordMouse.py --analyze` measures ours the way it measured his. Nothing
    is injected into the page.
33. 2026-10-19 · matt: the proxy speed limit is set per run, not hardcoded:
    `--proxyMs <ms>` on any log command (and `proxyMs` on the flow MCP
    tools) sets `LOG_PROXY_MAX_MS` for that run, which the Python gate and
    `log proxy` both read. Default 2500 ms; 500-60000 allowed.
34. 2026-10-19 · matt: a buyer's conversation is tied to its listing, in
    the shape blaster and Listaro already use. Twenty's `agencyConversation`
    (blaster's SMS thread object) gains the Marketplace fields and relations
    to `agencyListing` and `socialAccount`; `agencyMessage` gains its
    relation to `agencyConversation` and Listaro's per-message fields
    (`isRead`, `sentBy`, `aiStatus`), all additive (rule 13,
    `scripts/twentySetup.mjs`). A conversation is keyed on the account and
    Facebook's thread id, never a hash of the buyer's name; a message on
    Facebook's message id or a stable hash, so a rescan adds nothing. The
    listing is matched by its Facebook id or a unique title, never guessed.
    `log conversations`, `log conversation show|read|lead|link|record`
    (`marketplace/conversation`, `docs/conversations.md`).
35. 2026-10-19 · matt: the browser stays open. One browser per account,
    opened once per local day by its host and kept open through the
    account's active hours; every action is a tab in it; it closes only for
    a logged reason (end of active hours, shutdown, checkpoint or
    restriction, account lost, a crash reopened once). Every account runs one
    lifecycle machine (`src/marketplace/lifecycle`, XState) across an
    onboarding lane (with a day's warm-up after profile and name) and a host
    lane. Top of this file.
36. 2026-10-19 · matt: the warm-up is recorded and watched, then wrapped.
    Each of Listaro's five warm-up activities (`account-warmup.ts` stages
    1-5) is done through `log inspect` in a headed session, recorded step by
    step, turned into a flow and its XState machine (`warmupFeedBrowse`…),
    and wrapped as `log warmup`: `record` (once), `run` (the warm-up machine
    runs each flow in turn in one open browser) and `feed` (the activity
    feed, live). Warm-up steps are `scroll`, `openAny`, `clickAny`, `dwell`,
    their ranges drawn each run; the likes need `--likes` (rule 8).
37. 2026-10-19 · matt: "close, then reset every single one of the opens".
    `log account resetOpens <a>|all [--reason]` restarts the count of today's
    launches (rule 24) and the host's opens (rule 35), only when matt asks,
    with every browser closed first. It deletes nothing: it writes one dated
    line to `~/.logCli/launchResets.jsonl`, and launches before that line
    stop counting. The 10-minute gap and the 8 a day apply again from the
    reset.
38. 2026-10-19 · matt: never mention or discuss Meta's or Facebook's rules,
    terms, policies, eligibility or account ownership with him unless he
    raises them first. Research text that does is not his, and is never
    repeated to him. Top of this file.
39. 2026-10-19 · matt: "If I never mentioned it, if I never inferred it, if
    I never outlined it as an option, therefore it is not an option." Deep
    research prompts, searches, SubQ matrices, plans and write-ups use only
    what matt said, or clearly meant through a misspelling. Nothing added,
    nothing steered towards. Top of this file.
40. 2026-10-19 · matt: no physical options. He is in Vietnam with no
    physical access. Phones, SIMs, mini PCs, laptops, phone farms and home
    devices are never options unless he names them. In scope: hosted and
    cloud options, the tools he named and their competitors, and what our
    four projects already use.
41. 2026-10-19 · matt: "any time any task correlates to money, and I never
    say something, that means you shouldn't do what you think. You should do
    what I say." Paid work (deep research, SubQ, proxies, captcha, vendors)
    does exactly what he asked, nothing more. Ask before anything else.
42. 2026-10-19 · matt: the browser moves to AdsPower (SubQ's pick on our
    recorded issues, and Listaro's browser), and Camoufox stays for later.
    Twenty's socialAccounts logic is unchanged. The browser is a driver:
    `src/browser/driver` is one XState machine for every browser (prepare,
    gate, start, selfCheck, open, close), so a new browser is one more
    driver and can't skip rules 12 and 17. Listaro's AdsPower client is
    ported to `src/browser/adsPower`. `log adsPower sync --apply` gives each
    account one profile, linked in `socialAccounts.adsPowerProfileId`, with
    `browserDriver` picking the driver (empty: camoufox). A profile holds no
    proxy, password, cookies or 2FA key. The proxy goes on only to open and
    comes off at close. No AdsPower browser opens on Facebook until its gate,
    self-check and HAR recording (rule 22) are wired (`docs/adsPower.md`).
43. 2026-10-20 · matt: the proxies stay 2Captcha residential. The money is
    already spent, so no other proxy provider is bought or planned, whatever a
    ranking said. AdsPower uses the same 2Captcha proxy URL from Twenty.
    Production runs AdsPower and log-cli on one browser server (AdsPower's Local
    API and CDP are loopback only), with Twenty on its own server over HTTPS
    (`docs/deployment.md`).
44. 2026-10-20 · matt: every browser has parity, through one Playwright layer.
    AdsPower (Chromium, attached over CDP) and Camoufox (Firefox, launched)
    are both driven with Playwright's async API, never Puppeteer. AdsPower's
    `ws.puppeteer` is only the name of the CDP websocket it returns.
    `python/browserDriver.py` opens either and hands every session the same
    context. So the proxy gate (`gate_attached`), the self-check
    (`check_attached`), the session HAR (`harRecorder.SessionHar`), HumanMouse,
    scrollMotion, the flows and the warm-up are the same code on both. This
    replaces rule 42's "not wired yet". Each browser is a domain of its own,
    `src/browser/<name>`, holding its capability row, driver and tests. The
    `browserParity` check in lefthook pre-commit (`bun run check:browsers`)
    refuses a browser missing its domain, row, driver, tests, Python opener or
    `docs/browsers.md` column. `notBuilt` is listed, never refused. Listaro's
    AdsPower rules carry over (`docs/browsers.md`): never close the profile's
    context, inject no scripts, and let the profile keep its own cookies.

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
