# AGENTS.md — log-cli

## Rule one: if we don't know, we do this (matt, 2026-10-23)

This is the number one rule of the whole stack, above every other rule in
this file. We already know most of the states a platform can be in. When a
step lands somewhere we don't know:

1. **Read the internal API.** Every step's internal API calls are taken out
   of its recording by code: what we sent and what came back, in seconds from
   our action (`exchanges.json`, `exchanges.md`). The answers decide, never the
   screen, a timer, or the fact that a step ran. What we sent counts as much
   as the answer (`viewer_coordinates` placed Bethlehem's search in Lima).
2. **Collate everything about that moment.** The goal, the account (home,
   platform, browser, the proxy's exit), what we did (the action, the mouse,
   how long it took), every internal API call, the page, the screenshot and
   the earlier steps, together, never in silos.
3. **Ask SubQ what it means.** Not what to do next: was the goal met, does
   everything fit the account, should something never have come up, does the
   page agree with the API, did our action cause it, and what each call says
   about the goal.
4. **Say it loudly.** The reading comes first in the step's result
   (`>>> UNKNOWN STATE`) and goes into the agent's context through the hook.
5. **Keep going until the goal is reached.** The Stop hook holds the turn
   until a step's reading says the goal is met.
6. **Write what went wrong as P.E.E.** Point (the issue, one sentence),
   Evidence (quoted from the step's reading), Explain (why it shows it, what
   caused it), and, once the goal is reached, how it was fixed
   (`log inspect finding`, `goalFindings.md`).
7. **Name the state,** so next time it is known and nobody has to find it
   out again.

It works the same on every platform: every platform's client triggers
internal APIs nobody documents, and our job is to find what our action
caused. It runs in `log inspect` (`--goal`, `inspect goal`, `inspect
finding`, `inspect read`), where flows are made to be run again and again.

- **Why:** on 2026-10-22 Bethlehem's warm-up loaded `/marketplace/create/item`
  twice; its HTML said `sell_location: Barranco, 15063, PE` both times, and the
  warm-up passed. Then "Bethlehem, PA" saved the West Bank, and every step said
  ok. Read this way, SubQ said wrong result (93%) and pointed at Lima and the
  West Bank in Facebook's own answers.
- **Status 2026-10-23:** built for `log inspect` (PR #36). The page states
  `marketplaceCreateLimitReached` and `marketplacePartnerFeed` are decided by
  Facebook's answers. Every warm-up step that makes a call is decided by its
  answer: the five stage flows (the create page's
  `marketplace_new_seller_can_post_item` and `sell_location`, `buy_location`,
  the feed's account, paging, listings) and the Reels and feed activities,
  likes included, in `log flow run`, the stage runner and the host. The
  publish flow checks the create page and the listing id in the create
  answer; the profile flow its three saves; every other flow step that waits
  on a call checks its answer (delete, comment, posts, the Messenger PIN, the
  group tabs and share). On AdsPower (the account's browser: inspect, flow,
  warm-up, host, and join, read, poll and check in it) the host's account
  check reads Marketplace status from its answer, and join, read, poll and
  check already decided on theirs. Only the host's sign-in still decides on
  Facebook's sign-in cookies and the URL. The Camoufox-only commands aren't
  the primary path (#35).

Rules 73-76.

## The platform comes first: `log <platform> <command> …` (matt, 2026-10-22)

This is the shape of every command, at the start of this file because it
was broken across the CLI.

- **The platform is the first word after `log`:** `log <platform> <command>
  <what> …`, e.g. `log facebook warmup reel`, `log facebook join group`.
  There is no form without it.
- **The poll is `log facebook poll <group> <account> <how long to poll>`**,
  not a flag on another command.
- **Old forms are refused** with the form they became, as rule 60 did for
  the warm-up.
- **A command that works on any platform** (`inspect`, `flow`, `proxy`,
  `errors`, `login`…) takes none.
- **The code is laid out the same way:** `src/<platform>/<area>/<domain>`,
  because each platform has its own approach: `src/facebook/group/join`,
  `src/facebook/group/read`, `src/facebook/warmup/activities`,
  `src/facebook/warmup/stages`. What any platform uses stays shared
  (`src/warmup/persona`, `src/warmup/viewer`). Rule 64.

The full table, every command old and new: `docs/commandNaming.md`. Rule 63.

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
restart. Acting (publish and replies as a tab) is not built yet ([#42](https://github.com/matthewdonsemail-lab/log/issues/42)), so `publish`
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

Status 2026-10-19: built: step 5 per request (`log capture --docs`,
`docs/platforms/facebook/`, rule 27: syntax-tree slices, rea about 4 s each),
and the per-step request timings that steps 2-3 need (in each doc). Settle no
longer reads the whole bundle. Not built yet ([#45](https://github.com/matthewdonsemail-lab/log/issues/45)): the per-run timeline file, the
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
5. 2026-10-18 · Every commit adds a log entry (since rule 116, in the day's
   `log/<date>.md`, indexed from `log.md`). On commit, the hook
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
    (`python/browser/visibleBrowser.py`). There is no flag to turn it off.
    `camofox/session/visible.test.ts` enforces it.
12. 2026-10-18 · No browser opens for an account unless its proxy is attached
    and its exit IP is in the account's country (`python/browser/proxyGate.py`). There
    is no exception: not dry runs, not signing in (matt: "never, ever open"
    without one). Listings must be in the account's country, and the form's
    location must be picked in that country. How it works: `docs/proxies.md`.
13. 2026-10-18 · Twenty is the only place accounts and listings live: Facebook
    accounts are `socialAccounts` (platform FACEBOOK), listings are
    `agencyListings`. Never delete either: a banned or dead account keeps its
    record with its status, and its campaign listings get replacement accounts
    in the same country (`docs/accountsAndListings.md`). Fields are only ever
    added (`scripts/twenty/twentySetup.mjs`), never renamed or retyped, so the
    twitter-controller keeps working.
14. 2026-10-18 · Twenty is reached through the generated GraphQL client, the
    same one blaster and the dialer use (`bun run twenty:client`,
    `src/twenty/graphql/generated`). Regenerate it after any field change.
15. 2026-10-18 · One device per account: its first launch makes one Windows
    Camoufox identity (screen, GPU, fonts, voices, audio seed, geolocation)
    stored in `socialAccounts.deviceProfile`, and every launch
    replays it exactly (`python/device/deviceProfile.py`). Never regenerated or
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
    page (`python/login/autoLogin.py`). They are read only by
    `twenty.loginSecrets`, for that run, into the run folder's `login.json`
    (0600, deleted with it), and are never printed or logged. Every vendor
    order in `docs/vendors/*.txt` (git-ignored) is imported with all its fields
    by `scripts/twenty/importVendorAccounts.mjs`, which shows each field only as
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
    `launchTooSoon`, `launchBudgetSpent` (`browser/run/helpers/launchBudget.ts`).
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
    documented by domain in `docs/platforms/facebook/<domain>/<request>.md`:
    what it sends and reads, which step fires it, how fast, what errors it
    returns, and why it matters to our machines. Built by
    `log capture --docs`: our syntax-tree parse cuts each request's
    modules out of Facebook's bundles, rea reads each slice (seconds, not the
    whole bundle). lefthook's pre-push (`check:facebookClientDocs`) refuses a
    push while a request is undocumented, unread by rea, has its reasoning
    unwritten, or a run is newer than the docs.
28. 2026-10-19 · matt asked for profile setup: `log profile setup --account
    <a>` sets the account's profile picture and cover photo from Twenty
    (`socialAccounts.profilePhoto`, `coverPhoto`; a URL or path, fetched
    through the account's proxy and varied, `media/photo`), both in one run
    (matt's choice), through the profile machine (`marketplace/profile`,
    `python/session/profileSession.py`). A dry run unless `--live`; the dry run
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
    `src/browser/flow/definitions/<name>.json`); `log flow docs` writes its
    documentation (`docs/platforms/facebook/flows/<name>.md`, linked to each
    request's doc); `createFlowMachine` makes it an XState machine; `log flow
    run <name> --account <a> --set …` runs it on any account (dry run
    unless `--live`), recording every step again; and every saved flow is an
    MCP tool of its own (`flowProfileSetup`). The docs gate requires each
    flow's doc.
32. 2026-10-19 · matt: the cursor moves as his own hand does, measured, not
    guessed. `python/human/recordMouse.py` recorded his mouse on a Facebook page
    (60 s, ~/.logCli/mouse/20261019T192448.json); `python/human/humanMouse.py` is
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
    `scripts/twenty/twentySetup.mjs`). A conversation is keyed on the account and
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
    `python/browser/browserDriver.py` opens either and hands every session the same
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
45. 2026-10-20 · matt: groups have nothing to do with Marketplace. Facebook
    group work is its own library, `src/group/<domain>/` (first `group/join`
    for `log join group --account --group`), with the role files of rule 2.
    It never goes under `src/marketplace/`. This widens rule 3 to groups.
46. 2026-10-20 · matt: names are browser-agnostic. A command, domain, type or
    message is named for what it does, never for one browser (Camoufox's
    Firefox, AdsPower's Chromium, rule 44): `log capture --docs | --settle |
    --har` (was `firefoxCapture`, kept as an alias), `src/rea/capture`
    (was `rea/firefox`), `BrowserCapture`, `settleCapture`. Run folders
    already carry the browser that ran (`adsPower/`, `camoufox/`).
47. 2026-10-20 · matt: the MCP server carries AGENTS.md, so every agent on
    the tools works by the same rules. Its `instructions` (sent at initialize,
    into the model's context) are this file's core, each with its rule number,
    rule 30 first: when matt says to do something, it is done completely.
    AGENTS.md itself is the resource `log://agents`, and every tool's
    description ends with the rules it falls under and points back to it
    (`src/mcp/server/helpers/agentRules.ts`). A test fails on a cited rule
    that isn't here, a tool with no rules, or a rule newer than
    `RULES_REVIEWED_THROUGH`: a new rule is distilled into the MCP in the
    same commit that adds it.
48. 2026-10-20 · matt: what a platform's client does is documented by
    platform first, then domain: `docs/platforms/<platform>/<domain>/<request>.md`
    (was `docs/facebookClient/`; Facebook is `docs/platforms/facebook/`, and its
    group requests have a `groups` domain of their own). A new platform or
    domain is explored with `log inspect` and gets its own folder beside
    Facebook's. Over MCP, any call that runs long is watched live: the caller
    starts a Monitor on `~/.logCli/mcp/<day>.log` before it (rule 26), as the
    server's instructions and each long tool's description say.
49. 2026-10-20 · matt: the warm-up is by platform, then activity: `log
    warmup <platform> <activity>`, first `log warmup facebook reel`
    (`src/warmup/<platform>`, the library the warm-up and the domain the
    platform). It opens the account's browser (`inspect start --detach`)
    primed with the activity and runs its steps as a flow of events, each
    recorded (rule 22). A warm-up spans many activities; each is a unit of its
    own, so it is watched alone, and every step says what it must achieve (a
    swipe changes the reel's URL, the comments show their heading): each run
    writes the outline of the steps that didn't (`warmup_<platform>_<activity>.json`),
    and the steps are fixed from that recording (rule 25). Reels: sound on first
    (they start muted: nobody watches a reel with the audio off); most reels
    get a glance and a skip, often a few in a row, and only some are watched
    (`--skip`, default 0.6); on those: Next
    card, the comments opened, scrolled (the wheel over the panel, `scrollIn`)
    and closed, the creator's profile, a like only with --likes (rule 8); a
    session is drawn from ranges (`plan`). Its requests are in
    `docs/platforms/facebook/reels/` (rule 48).
50. 2026-10-20 · matt: the Reels warm-up builds the persona's For you
    feed by engaging with what it would engage with, from the datasets (the
    persona-conditioned Reels handoff he collated;
    `~/.logCli/datasets/SOURCES.md`). `log warmup facebook reel run
    --persona` keeps one persona per account (the three datasets he named),
    one real viewer from KuaiRand-1K (`src/warmup/viewer`, matched to the
    persona's scroll speed) and one persona pack (`buildPersonaPack`): every
    dataset gives a trait, said in its provenance, real or synthetic,
    including what the persona is into (`interests`). Each reel, the moment
    it lands, is read by SubQ from its frame (matt: SubQ analyses the
    images), with the caption and the persona: what it is, whether it is
    this persona's kind of content, the one action they'd pick. The action
    orderer (`planReel`, deterministic from the seed) then plans it: the
    watch is the viewer's next real play scaled by the interest effect
    measured on KuaiRand-Pure's random log (their kind ×1.10-1.67, outside
    ×0.90-0.99; likes ×1.28 against ×0.95, comments ×1.40 against ×0.93,
    `scripts/datasets/buildInterestEffect.ts`), and at most one action (U = p ×
    interest effect × segment weight × attention fit, a like cooldown of 3
    reels, only what the run allows, rule 8), a close call settled by the
    read's pick. The watch counts from when the reel landed, so SubQ's answer
    is the glance. rea still reads each step at once without holding up the
    next (`reaLater`, rule 29); a dwell doesn't wait for the network, a swipe
    only for the next reel's URL, and the cursor rests on Next card between
    quick swipes. Save, follow and share aren't built ([#46](https://github.com/matthewdonsemail-lab/log/issues/46)).
51. 2026-10-20 · matt: proxy traffic is money. Reels ran 2Captcha's traffic
    out (about 4.5 MB a reel through the residential proxy), so each account
    has a budget of its own traffic for 24 hours, 1 GB by default
    (`--trafficMb`). A warm-up reads 2Captcha's counter before and after,
    refuses to start over the budget (`trafficBudgetSpent`), checks every 5
    reels and stops at it, and writes each run's use to
    `~/.logCli/proxyTraffic.jsonl` (`src/proxyVendor/traffic`).
52. 2026-10-20 · matt: proxies are provider-agnostic, and Byteful is added
    beside 2Captcha (this widens rule 43). Twenty keeps one `proxy` URL per
    account, whichever provider it came from. The provider is read from its
    host (`vendorOfProxy`, `src/proxyVendor/vendor`), and each provider is a
    domain of its own (`src/proxyVendor/twoCaptcha`, `src/proxyVendor/byteful`).
    `log proxy assign --vendor byteful` takes a sticky (24 h) Byteful
    residential proxy in the account's city and checks it (home country,
    100 km, speed) before saving, as for 2Captcha. `log proxy balance` shows
    every provider set up, and `log proxy static` lists Byteful's static IPs
    with where each is. A traffic-billed proxy is metered by its own provider
    (rule 51); a static IP is not. log-cli never buys from a provider (rule
    41). Docs: `docs/proxyVendors/`; Byteful's own docs and API spec are in
    `RESEARCH/MARKETPLACE_PROVIDERS/proxies/byteful/`.
53. 2026-10-20 · matt: when something has to be found (a group to join, a
    provider, a price, a fact), it comes from an external source, never from
    memory or a guess: search with TinyFish through treg (`treg call
    tinyfish.web.search`, `tinyfish.web.fetch`, free) as the basis for every
    lookup, and pull the actual candidates from it. A suggestion names where
    it came from (the page, the search), and a pick is one of what the search
    returned.
54. 2026-10-20 · (checkpoints: replaced by rule 118, matt 2026-11-02) matt: a known state is resolved, never a reason to stop.
    When a page lands on a state log-cli already knows (a checkpoint's first
    page, a text captcha, the Remember password prompt, the login form, two-step,
    "automated behaviour"), its resolver runs: press the checkpoint's Continue
    (plain text, by its ref), `solve` the captcha (2Captcha, then Continue),
    Not now, signIn, code. Only what a person must clear stops an account (a
    video selfie, an ID or photo, a disabled account; rules 10, 23), and that is
    said to matt. A Claude Code hook (`.claude/settings.json`,
    `scripts/hooks/pageState.ts`) reads the latest step of every open browser
    after each tool call and each prompt, matches it against the known states
    (`pageStateOf`, `src/browser/flow/helpers/pageState.ts`) and puts the state
    and its resolver into the agent's context. A state not mapped yet is
    pressed through (its Continue) and added to the map.
55. 2026-10-20 · matt: the CLI, the MCP tools, the agent hooks and the live
    log line up, and a commit is refused when they don't. One hook list
    (`src/agentHooks/registry`) writes both hosts' files, Claude Code's
    `.claude/settings.json` and Codex's `.codex/hooks.json`: SessionStart and
    UserPromptSubmit say where every open browser is; PostToolUse (Bash,
    PowerShell, Monitor, every `mcp__log__` tool) gives a known state its
    resolver, and a failed step is an unconfirmed page (snapshot, then
    resolve); Stop keeps the turn going while a browser sits on a state log-cli
    resolves itself (rule 54), never on a person's state, and never twice on
    the same unchanged one; PreToolUse refuses a log run piped through
    tail/head (rule 26). The terminal CLI writes the same live log as the MCP,
    `~/.logCli/mcp/<day>.log`, so one Monitor shows a run however it started.
    lefthook's `agentHooks` (`bun run check:agentHooks`, pre-commit and
    pre-push) refuses drift: both hosts' files, every command an MCP tool or
    terminal-only, every MCP tool hooked, every hook script answering its
    events, every resolver a real command (`skills/agentHooks/SKILL.md`).
56. 2026-10-20 · matt: the README says what every command, MCP tool and
    hook does, with Mermaid diagrams kept as `.mmd` files, all generated from
    the code. Each command carries its full usage (`Command.usage`), so its
    flags are in one place: the terminal's usage, its MCP tool's description
    and the README's table (command, what it does, flags, MCP tool, the hooks
    that fire on it from a shell and over MCP, live log, rules) all come from
    it. `src/surface` builds the catalog (`catalog`), the diagrams
    (`docs/diagrams/surface|commands|hooks|pageStates.mmd`) and the README's
    section between the surface markers; `bun run docs:build` writes them.
    lefthook's `docs` (`bun run check:docs`, pre-commit and pre-push) refuses
    a README or `.mmd` that differs from the code, and a command that parses a
    flag its usage doesn't name, or names one it doesn't parse.
57. 2026-10-20 · matt: what every browser uses lives under `src/browser`,
    named for what it is, never under a browser's name (rule 46). `flow`,
    `inspect`, `run` and `proxy` moved from `src/camofox/` to `src/browser/`,
    beside `driver`, `adsPower` and `camoufox`: they drive AdsPower and
    Camoufox alike (rule 44). `src/camofox/` keeps only what is Camoufox's
    own: `device`, `session`, `worker`. The `browserParity` check allows
    these shared domains (`SHARED_DOMAINS`) and nothing else that isn't a
    browser.
58. 2026-10-20 · matt: no loose files. `python/` and `scripts/` hold domain
    folders only, as `src/` holds `{library}/{domain}/`. Python:
    `browser/` (browserDriver, adsPowerBrowser, visibleBrowser, proxyGate,
    harRecorder), `human/` (humanMouse, scrollMotion, recordMouse),
    `session/` (inspect, connect, publish, profile sessions, logWorker),
    `login/` (autoLogin), `device/` (deviceProfile), `errors/` (errorCodes,
    errorCatalog.json), `fixtures/`; each is a package (`__init__.py`), imports
    are by package (`from browser import proxyGate`), and a script run
    directly puts `python/` on its path. Scripts: `checks/`, `commitLog/`,
    `datasets/`, `docs/`, `hooks/`, `twenty/`. lefthook's `layout` (`bun run
    check:layout`, pre-commit and pre-push) refuses a file loose at the top of
    either, tracked or new, and a Python domain without its `__init__.py`.
59. 2026-10-20 · matt: the README describes log-cli as it is: browser-agnostic,
    working through AdsPower first, with more browser providers to come, each
    one more driver. Which browser each command runs on is code
    (`commandBrowser` in `src/browser/run`: the account's browser through the
    driver, Camoufox only while not on the driver yet, or none), and the
    README's Browsers section, its Browser column and `docs/diagrams/browsers.mmd`
    are generated from it. `check:docs` parses every diagram with Mermaid,
    as GitHub does, and refuses one that doesn't parse (a `;` in a note broke
    the hooks diagram on GitHub), a command summary that names one browser
    (unless it is that browser's own command or Camoufox-only), and a README
    heading outside the generated section that names one browser.
60. 2026-10-20 · matt: log-cli is platform-agnostic as well as
    browser-agnostic. Facebook (Marketplace and groups) is the first platform,
    and what is scoped by platform names it in every form: `log warmup
    <platform> <activity>`, with no form that skips the platform. Listaro's five
    Facebook activities are the Facebook activity `stages`: `log warmup facebook
    stages plan|record|run|log` (was `log warmup plan|record|run|feed`; those
    are refused with the form they became), their code in
    `src/warmup/facebookStages` (was `src/marketplace/warmup`), and their log
    the stage log (`~/.logCli/runs/warmup/stageLog.jsonl`, was the "activity
    feed", which clashed with the Facebook feed activity). Every command
    declares its platform (`Command.platform`: `facebook`, `any` or
    `byArgument`, a typecheck error without one), the README shows it in its
    Platform column, and `check:docs` refuses a `byArgument` command with a
    usage line that doesn't name the platform. The Facebook-only commands that
    don't yet take the platform in their name are listed in issue #20
    (github.com/matthewdonsemail-lab/log-cli/issues/20), to be scoped as matt
    decides.
61. 2026-10-22 · (replaced by rule 65, matt 2026-10-22) matt: a Facebook group's posts and comments are read with
    `log read group --account <a> --group <g>` (beside `log join group`) and
    live in Twenty in objects of their own, for Facebook groups only:
    `agencyGroupPosts` on the group's `agencyGroups` row, `agencyGroupComments`
    on the post (`scripts/twenty/twentySetup.mjs`, additive, rule 13). A read
    is a step in the account's open browser (rule 35): the posts and comments
    come from each step's own HAR (rule 22), only what is newer than the row's
    `readCursor` is kept, a post is opened again only when its comment count
    grew, and the cursor moves only after the posts and comments are saved
    (`src/group/read`, `docs/groupRead.md`). Nothing is clicked unless
    `--live`, which switches each post's comments to Newest (rule 8).
62. 2026-10-22 · (replaced by rule 65, matt 2026-10-22) matt: "a firehose!" log-cli reads the groups on its own
    and pours what it finds into Twenty; nothing has to ask it. The host
    (`log host start`, rule 35) reads, in every watch check, each group its
    account is a member of that is due (`--groupMinutes`, default 60, 0 reads
    none), in the browser it holds, inside the account's hours, nothing
    clicked (rule 8). A checkpoint or a sign-out on a group page is the
    account's issue. Whatever wants the posts reads Twenty: OpenMagpie's
    worker (`log read group --worker`, obris-dev/openmagpie#178) answers from
    Twenty at once and opens no browser, saying which groups no host has read
    lately (`groupNotReadYet`, `groupReadStale`).
63. 2026-10-22 · matt: the platform comes first. Every command that acts
    on one platform is `log <platform> <command> …` (`log facebook warmup
    reel`, `log facebook join group`); there is no form without it. The poll
    is `log facebook poll <group> <account> <how long to poll>`. Old forms
    are refused with the form they became. This replaces rule 60's
    `log warmup <platform> <activity>` and settles issue #20. OpenMagpie's
    worker is `log facebook poll --request` (it was `read group --worker`),
    a read in the account's open browser. `bun run check:docs` refuses a
    usage line without the platform first. Top of this file; the table is
    `docs/commandNaming.md`.
64. 2026-10-22 · matt: the code is by platform first, as the commands are,
    "because each has different approaches": `src/<platform>/<area>/<domain>`.
    Facebook's groups are `src/facebook/group/{join,read,answer}` (were
    `src/group/…`, rule 45) and its warm-up `src/facebook/warmup/activities`
    and `src/facebook/warmup/stages` (were `src/warmup/facebook` and
    `src/warmup/facebookStages`, rule 49). What every platform's warm-up
    draws from stays shared: `src/warmup/persona`, `src/warmup/viewer`. Each
    area has an `index.ts` (`check:naming`). Top of this file.
65. 2026-10-22 · matt: Facebook group listening is the triage job of
    obris-dev/openmagpie#188, and it replaces rules 61 and 62. Everything is
    indexed in OpenMagpie, and only the matches reach Twenty. An account joins
    (`log facebook join group`). OpenMagpie polls, and its worker is `log
    facebook poll --request`, a read in the account's open browser. OpenMagpie
    keeps every post, its watch triages them (`semantic_filter`), and its
    `webhook` sends the matches to Twenty's `socialListening`. log-cli then
    acts on the NEW rows from the same account (not built yet, [#40](https://github.com/matthewdonsemail-lab/log/issues/40)). log-cli writes
    only the group's `readCursor`, `lastReadAt` and `lastReadReason` to
    Twenty. `agencyGroupPosts` and `agencyGroupComments` stay, unused. The host
    reads no group on its own. Comment reading is kept for acting on a match,
    for new posts only, and saves nothing. #28's scoring and alerts become
    OpenMagpie watches. Spec: `docs/groupListening.md`.
66. 2026-10-22 · matt: the runs never fill the disk again. A run is deleted
    once it is analysed: rea settled it (`settle.json`) and the request docs
    hold its requests (`log facebook capture --docs`). The docs build folds
    each request's facts into `~/.logCli/rea/clientFacts.json`, so a doc keeps
    every row its pruned runs gave and only adds. `log runs` lists them, `log runs prune
    --apply` deletes them and keeps each one's findings.md, steps.jsonl,
    settle.json and requests by domain (`~/.logCli/runs/kept`,
    `runs/pruned.jsonl`). An agent hook (`scripts/hooks/storage.ts`) says so
    when `~/.logCli/runs` passes 2 GB or the disk has under 5 GB free. Tests
    never write into the real runs (`scripts/tests/preload.ts`).
    `skills/runs/SKILL.md`.
67. 2026-10-22 · matt: Messenger's "Create a PIN to access your chats on any
    device" blocks the inbox, so it is flagged and passed. It is a page state
    only matt clears (`messengerPinCreate`): he gives the account's 6-digit PIN
    once, in a Clack prompt (`log facebook messenger pin --account <a>`,
    masked, twice), kept in Twenty's `socialAccounts.messengerPin` with the
    account's other secrets and never printed. `log inspect do pin --live`
    types it from the run's private login.json (rule 21). The Create PIN
    screens were recorded with `log inspect` on Bethlehem (rule 29) and made
    the flow `messengerPinCreate` (`log flow run messengerPinCreate --account
    <a> --live`).
68. 2026-10-22 · matt: the Marketplace location is typed as "City, State"
    with the state written out in full ("Bethlehem, Pennsylvania", never
    "PA"): "Bethlehem, PA" was offered only as the West Bank, and a bare zip
    offered Granada, Spain first (Bethlehem, inspect 20261022T105341 and
    20261022T110738). `setLocation` writes a US state code out, picks the
    option Facebook's own answer names as the place typed, clicks it, and
    sets nothing when none matches. A listing is published from the account's
    open AdsPower browser by the recorded flow `marketplaceListingPublish`
    (location, Create, photos, title, price, category, condition,
    description, Next, Publish; never Boost, rule 41), not by a second
    browser. "Discover more when you shop" (partner listings, a European
    location) is a known page state, pressed through with Update.
69. 2026-10-22 · matt: once a listing is live, the account is checked on a
    schedule. The host's check (every watch round, in the browser it holds)
    reads Marketplace status (may it still sell: anything but full access is
    the account's `suspended` issue), each listing's state on Selling into
    Twenty (active, being reviewed, sold, rejected), and the seller inbox's
    chats, each from its step's own recording, nothing clicked.
    `log facebook check --account <a>` runs it once by hand. A chat's
    fields are mapped from the first recording of a real one (rule 29); until
    then chats are counted and kept as sent. `src/facebook/marketplace/check`. The page-state hook resolves it with that flow when the
    account's PIN is in Twenty, and flags it to matt only when it isn't (the
    session records a yes or no when it opens, never the PIN). "Enter your
    PIN" (`messengerPinEnter`) is mapped the same way: the PIN is typed from
    Twenty and each step recorded until it is a flow.
70. 2026-10-22 · matt: no code comments, because they cause context rot in
    the system designs. Code carries no comments and no docstrings: TS, JS
    and Python, line, block, JSDoc, `#` and docstrings alike. What a thing
    does is said by its name, its types, its tests, its skill and its docs,
    never by a comment beside it. lefthook's `noComments` (`bun run
    check:noComments`, pre-commit and pre-push,
    `scripts/checks/checkNoComments.ts`, Python through
    `python/checks/comments.py`) refuses any tracked code file that has one;
    `--strip` removes them. Generated code is exempt. `lefthook.yml` itself
    carries none.
71. 2026-10-23 · matt: an ad says the same thing several ways. An ad that
    goes out on more than one listing in a city carries copy versions
    (`agencyListings.copyVersions`, title-and-description pairs written by
    `skills/listingCopy`), at least as many as the listings it will have live
    in that city and never fewer than 3, every two titles differing by at least
    half their words (the city's not counted). Each copy (`campaign fill`,
    `heal`) takes the version least like what is live in its city and records
    it in `copyVersionId`; a replacement skips the lost copy's version.
    `log facebook listing lint`, `listing create` and `campaign fill` refuse a
    version that breaks a checkable copy rule, and `campaign fill` refuses too
    few (`notEnoughCopyVersions`). `src/facebook/marketplace/copy`.

72. 2026-10-23 · matt: a Marketplace location is never abbreviated. It is
    typed as "City, State" with the state written out ("Bethlehem,
    Pennsylvania") or "City, Country" ("Galway, Ireland"): "Bethlehem, PA"
    was offered only as the West Bank, and a bare zip offered Granada, Spain
    first (rule 68). A check blocks before any action: a place with an
    acronym, a state code, a zip or any number, or no state or country is
    refused with `locationAbbreviated` (`placeProblem`,
    `src/facebook/marketplace/location`; `python/location/placeName.py` in the
    sessions), in a listing's `locationQuery` (`listing create`, `lint`,
    `publish`, `campaign fill`), `log inspect do setLocation`, a flow's
    `location`, and the host's setLocation, which types the listing's
    `locationQuery` and never a zip. A written-out state counts as the US for
    the country check.
73. 2026-10-23 · matt: "IT MUST ALWAYS READ THEM." The number one rule of
    the stack, above rule 30 and every other: Facebook's internal API answers
    are the decision-making factor of what and when something is relevant,
    and the deterministic factor of the system. Every browser step reads the
    internal API answers it triggers and the requests it sent, keeps them
    past the prune, and decides on them, never on a page loading, a timer or
    the step having run. The MCP instructions put it first. Inspect steps
    read theirs since rule 74, and every flow, warm-up and host step on
    AdsPower that makes a call since 2026-10-23; the Camoufox-only
    machines don't yet (#35). Top of this file.
74. 2026-10-23 · matt: in the inspect flow, a state we can't decide is
    read by SubQ with everything around it, and said loudly to the agent.
    Only `log inspect` does this, because it is where flows are made to be
    run again and again. Every inspect step's internal API calls are taken
    out of its recording by code, with what was sent and what came back, in
    seconds from the step's first request (`exchanges.json`,
    `exchanges.md`). A step no known state names (`pageStateOf`) is
    collated into one bundle: the goal (`--goal`), the account (home,
    platform, browser, the proxy's exit), what we did (the action, the
    mouse, how long it took), every internal API call, the page text, the
    screenshot and the earlier steps. SubQ's Decisions API
    (`subq-snap-1.1`, up to 128 questions, a 384K-token context) is asked
    what it means, not what to do next: whether the goal was met, whether
    everything fits the account, whether something should never have come
    up, whether the page agrees with the API, whether our action caused it,
    and what each call says about the goal. The reading is printed first in
    the step's result and put into the agent's context by the page-state
    hook (`>>> UNKNOWN STATE`), so it is named before the flow goes on. The
    same works on any platform. `log inspect read <stepFolder>` reads a
    recorded step again. `src/subq/stepReading`.
75. 2026-10-23 · matt: the loud events trigger a Claude hook, and the model
    keeps going until the goal is done, with what went wrong written down as
    P.E.E. An inspect session has a goal (`--goal` on `start`, or `log
    inspect goal --set`). The goal is reached when a step's SubQ reading says
    so (`goalMet` at least 0.5). Until then the page-state hook's Stop event
    holds the turn ("Keep going with the next inspect step"), and puts the
    goal into the agent's context after each tool call when it changes. A
    step whose reading says it went wrong (wrong result, stopped by the
    platform, unclear, or SubQ failed) needs its finding before the next step:
    **Point**, the issue in one sentence; **Evidence**, quoted from the step's
    reading (the calls SubQ flagged, with what was sent and what came back),
    plus any of your own; **Explain**, why the evidence shows it and what
    caused it (`log inspect finding --step --point --explain`). Once the goal
    is reached, the turn is held until every finding says how it was fixed
    (`log inspect finding --fixes <n> --fix`). They are kept in the run as
    `goalFindings.jsonl` and `goalFindings.md`; `log inspect goal` shows them.
    What only a person can clear never holds the turn: it is said to matt.
    The hook holds the turn once per unchanged state, never twice on the
    same one. `src/browser/inspect/helpers/goal.ts`.
76. 2026-10-23 · matt: "make it the number one rule of AGENTS.md and
    README.md: if we don't know, we do this." When a step lands somewhere we
    don't know: read the internal API (rule 73), collate everything about the
    moment, ask SubQ what it means (rule 74), say it loudly, keep going until
    the goal is reached, write what went wrong as P.E.E. with its fix (rule
    75), and name the state. It is the first section of AGENTS.md, the first
    section of README.md and the first MCP instruction. Top of this file.
77. 2026-10-24 · matt: a group's members are read from its People tab.
    `log facebook read members --account <a> --group <url|id> --count <n>
    [--secondsPerScroll <s>] [--maxScrolls <n>] [--owners] [--bypass]
    [--json]` (beside `read group`; MCP `readMembers`, no live twin) goes
    to `/groups/<g>/members` in the account's open browser (rule 35) and
    scrolls, nothing clicked (rule 8). The members come from each step's own
    recording (rule 73): the page's HTML gives the first 10, and every
    scroll's `GroupsCometMembersPageNewMembersSectionRefetchQuery` answers
    about 10 more each, two a scroll (inspect 20261024T060921): name,
    profile, bio, page category, followers and when they joined. matt: "the
    time it takes for 40 scrolls is interesting and should also be a
    variable": `--secondsPerScroll` (default 15) is the wait before each
    scroll, and it says up front "count N → ~S scrolls, ~M min at Xs per
    scroll". It stops at `--count`, when the list ends (`has_next_page`
    false) or at `--maxScrolls`. `--owners` keeps a bio naming owner,
    co-owner, founder, CEO, president, proprietor or self-employed, or a
    page (a category set). The members go to
    `~/.logCli/members/<group>/<run time>.tsv` and `.json`, never to Twenty.
    A members page whose refetch answered with members is the known state
    `groupMembersList`, which needs nothing: no resolver, no SubQ reading,
    and the Stop hook doesn't hold the turn on it. `src/facebook/group/members`,
    `docs/groupMembers.md`.
78. 2026-10-24 · matt: a deactivated account gives its AdsPower profile
    back, and another account takes the slot (AdsPower holds 22). When an
    account is DEACTIVATED, by `log facebook account status <a> DEACTIVATED`
    or in Twenty, its profile is deleted from AdsPower and
    `adsPowerProfileId` cleared; the account's row stays (rule 13). The status
    command does it at once and runs the sync, so an account waiting for a
    profile is given the freed one. `log adsPower sync --apply` releases
    first, then makes profiles, so a status set in Twenty is caught there.
    matt: "I just want to do Pennsylvania": only accounts whose home is in
    `LOG_ADSPOWER_HOMES` (`.env.local`, `US`; or `--homes`) hold a profile,
    and the others give theirs back the same way. Nothing else about them
    changes. `src/browser/adsPower`, `docs/adsPower.md`.
79. 2026-10-25 · matt: "we can't do that in production, that's why we
    need it deterministic." A flow step never depends on a page's exact
    wording or a person stepping in. A control is picked by one scored match
    (`python/browser/controlMatch.py`): its role, then its name as the
    accessible name, aria-label, label, text or placeholder, case and
    spacing ignored, inside the dialog the step names (`within`, taken from
    the recording's snapshot) or an open dialog over the page behind it;
    two equal matches are refused (`controlAmbiguous`), none is
    `controlMissing`, a disabled one is waited for (`controlDisabled`). Every
    step waits for the call it must cause (`expect`: a mutation, a plain
    endpoint such as `profilePictureUpload`, or a dialog query) and checks
    its answer (rule 73) before the next one fires. `log facebook preflight`
    says before any browser opens what would stop each account (home
    timezone, hours, proxy country and speed, the browser kernel, launches
    and host opens left, a session left open, its picture on disk); `--apply`
    downloads a missing kernel and the host waits for one. A session whose
    process is gone is dropped. Snapshot excerpts of each page version are
    test fixtures (`python/fixtures/controls/`). Before a flow's first click
    it clears the known overlays with Escape, each checked: the
    browser-notifications notice (gone from the page) and an ended "What
    happened" notice (`useAccountStatusClearEnrollmentEntryPointActionMutation`
    answers `xfb_ixt_gateway_clear_flow: true`); one that stays stops the
    flow with `overlayNotCleared`.

80. 2026-10-25 · matt: X (Twitter) is log-cli's second platform, built
    around a vendored client the way Facebook's direct API is built around
    fbk: twikit (`vendor/twikit`, unclecode's fork) and twitter-controller
    (`vendor/twitterController`, the code being ported). Its commands are
    `log twitter <command>` (`src/twitter/<area>/<domain>`,
    `python/twitterApi/engine.py`), declared `directApiOnly` in
    `DIRECT_ROUTES`. matt: "No: X accounts call X directly as the controller
    does today": no proxy is required or used for an X account, and rule 12
    stays Facebook's. X's own answer decides (`socialAccounts.sessionState`:
    loggedIn, loggedOut, restricted), each account has its own governor under
    `~/.logCli/twitter/<account>`, and X's refreshed cookies are merged back
    into the row. Discovery stays treg's (rule 53). First command: `log
    twitter session check`. Plan: `docs/twitterPlatform.md`.
81. 2026-10-25 · matt: we own `vendor/twikit` and keep it up to date
    ourselves, since nobody upstream maintains it. Its HTTP transport is
    curl_cffi, the way `vendor/fbk` does it, never httpx: `self.http` is a
    curl_cffi `AsyncSession` pinned to one impersonation target
    (`IMPERSONATE`, `safari17_0`, matching twikit's Safari user agent),
    redirects not followed (as httpx did), the proxy kept in the session's
    `proxies`, media chunks sent as a `CurlMime`. Only the transport changed.
    `python/checks/twikitTransport.py` finds every httpx touchpoint by syntax
    tree (`--map`), rewrites the ones with a curl_cffi equivalent (`--apply`)
    and refuses any left (`--check`, `bun run check:twikitTransport`,
    pre-commit and pre-push); `vendor/twikit/tests/test_transport.py` holds
    the behaviour.

82. 2026-10-25 · matt: "we need to make it auto switch when that happens to
    checkpointed", and later the same day "if I said it got checkpointed then
    we just deactivate it". An open browser reports every page it lands on
    (`navigations.jsonl` in its run), and the session behind it sets the
    account to DEACTIVATED in Twenty, reason `checkpointed`, the moment one
    is a `/checkpoint` page, between steps as well as during them, with the
    page and the time as the detail; its listings are marked lost, as the
    direct-API engine does. Its AdsPower profile is given back by the next
    `log adsPower sync --apply` (rule 78), never from under the open browser.
    An account already DEACTIVATED is left as it is.
    `src/cli/inspect/helpers/watchCheckpoint.ts`.

83. 2026-10-25 · matt: a new platform is made with one command, written
    normally: `log new platform <name>` (MCP `newPlatform`). It writes the
    platform's account session on the shared `src/platformKit/session`,
    `log <name> session check` with its MCP tool, a direct-API engine in
    `python/<name>Api` on the shared `python/platformKit/engine.py`, and
    `docs/platforms/<name>/README.md`, and wires it into the repo by editing
    each file through its syntax tree (`PLATFORMS`, `PLATFORM_LABELS`,
    `COMMANDS`, `createContext`, `CommandContext`, `DIRECT_ROUTES`,
    `COMMAND_RULES`), checking every edit landed before anything is written.
    Without `--apply` it only lists what it would do; nothing is overwritten;
    it names what Twenty is missing (the `socialAccounts.platform` option) and
    never changes Twenty. Routes and rules are keyed by the platform-qualified
    name (`commandKey`: `read`, `twitterSession`, `redditSession`), so two
    platforms' commands never share one. lefthook's `platforms` (`bun run
    check:platforms`, pre-commit and pre-push) refuses a platform missing its
    label, src, command, engine, session route, rules or docs.
    `src/scaffold/platform`, `src/cli/new`.

84. 2026-10-25 · matt: `log inspect` and the account's AdsPower browser
    work on every platform, not only Facebook, so a new platform is explored
    the same way (rules 29, 48). One table says what each platform is,
    `PLATFORM_SITES` (`src/cli/runner/helpers/platforms.ts`): its Twenty
    value, cookie domain, hosts, home page, whether it needs a proxy and
    whether it has a browser path. Facebook needs its proxy (rule 12,
    unchanged; the gate refuses a direct run for it); X has no browser path
    (rule 80). matt, for Reddit: "no proxy, like X": a platform marked
    `proxy: none` opens its AdsPower profile with no proxy, the gate reads
    this machine's own exit and the profile's timezone follows it; an account
    with no home runs in en-US on the machine's timezone. `log inspect` goes
    only to known platforms' hosts, opens on the account's platform home,
    carries the account's own cookies in, and names each internal call by
    Facebook's friendly name or a GraphQL `operationName`/`operation`, else
    its path. `log adsPower sync` gives a profile to every browser platform's
    accounts (a no-proxy one needs no home). A row whose `accountName` is
    empty is found by its `name`. `log new platform` writes the platform's
    row (`--hosts`, `--home`, `--noProxy`, `--noBrowser`), and
    `check:platforms` refuses a platform without one.

85. 2026-10-25 · matt: "THE WHOLE POINT IS TO GO THROUGH REA." Every
    platform's internal calls go through rea, their code as well as their
    network, never Facebook's alone. `log facebook capture --docs` builds
    every browser platform's request docs (`docs/platforms/<platform>/`):
    it takes each run's calls to that platform's hosts (`PLATFORM_SITES`),
    names each by its GraphQL operation or its path without ids, finds the
    code that sends it in the platform's own bundles by syntax tree (an
    operation by its exact name, a path where it is fetched), and rea reads
    each call's slice (`src/rea/platformClient`). A call whose code isn't in
    the bundles keeps its step's rea reading. The docs gate
    (`check:facebookClientDocs`) refuses a platform's doc that rea hasn't
    read or whose reasoning isn't written. The first Reddit run: 39 calls,
    33 read from their code, the other 6 from their step.

86. 2026-10-26 · matt: "if I say to do something it can force past it."
    An X send can go past the account's governor (its pause after a block,
    its hourly, daily and write caps) when matt says so: `--force` on `log
    twitter reply|quote|like|dm` and `log twitter queue run` (MCP `force`).
    Only for that call or that run, only when matt asked; never by default.
    X's own answer still decides (rule 73) and the queue's own cool-offs
    still apply. The answer says what it went past (`forcedPast`). The
    governor still counts the request.

87. 2026-10-26 · matt: a cold dm never goes to someone he has already
    spoken to. X's newer encrypted Chat is a separate inbox that `log
    twitter dms` (twikit's legacy `dm/inbox_initial_state`) can't see, so a
    "never messaged" filter built on it is wrong: on 2026-10-26 a 40-person
    treg dm run reached 7 people matt already knew. `log twitter queue check`
    on a dm queue now reads the account's own X Chat inbox
    (`api.x.com/graphql` GetInitialXChatPageQuery, then paged with
    GetInboxPageRequestQuery; the account's session, no PIN, who and when are
    readable, the text isn't) and drops (status skipped, `priorConversation`)
    every pending dm whose recipient the account already has a conversation
    with. `--skipXChatCheck` bypasses it only when matt asks. The X Chat reads live in `vendor/twikit` (rule 81:
    `client.get_xchat_conversations()`, endpoints in `twikit/client/gql.py`), so
    the knowledge is in the client, not hand-rolled; the engine action
    `xchatContacts` (`python/twitterApi/engine.py`) calls it, read-only.
    `docs/platforms/x/xchat` / `RESEARCH/X_CHAT_ENCRYPTED_INBOX_API_2026-10-26.md`.

88. 2026-10-26 · matt: "DONT OPEN IT IN MY CHROME WE FUCKING BUILT IT OUT
    BECAUSE THE vendor/twikit hasnt been updated." X Chat (encrypted DMs) is
    read through log only, in the same shapes as the legacy DMs, never by
    opening x.com in a browser. X's own encryption SDK is vendored at
    `vendor/chatXdk` (xdevplatform/chat-xdk v0.5.2: its Rust source and the
    prebuilt Python wheel, installed from there). `vendor/twikit` reads the
    account's keys and Juicebox token map (`GetPublicKeysQuery`), unlocks them
    with the account's X Chat PIN (`client.unlock_xchat`) and decrypts every
    conversation's events (`client.get_xchat_messages`). The PIN is saved by
    matt once in a masked Clack prompt, `log twitter chat pin --account <a>`,
    kept in Twenty (`socialAccounts.messengerPin` on the X row) and handed to
    the engine only in the run's private folder. `log twitter dms` fills each
    X Chat thread's last message, and `--with <handle>` merges a person's
    legacy and X Chat threads into one timeline. Nobody is answered on X
    without reading their X Chat side first.

89. 2026-10-26 · matt: finding context in conversations is a search, never
    reading every thread. `log search "<query>"` (MCP `search`) runs BM25
    (bm25s) and meaning search (verso-db HNSW over local all-MiniLM-L6-v2
    embeddings, `@huggingface/transformers`) in parallel and fuses them with
    reciprocal rank fusion, with `--platform`, `--account`, `--with` and
    `--after` filters. `log search index` reads every conversation through
    the platform's engine in one export read (X Chat decrypted with the saved
    PIN, rule 88), keeps them in `~/.logCli/conversations` and the indexes in
    `~/.logCli/search`, which survive restarts. `log search bench` prints
    p50, p95 and p99, cold and warm, beside a linear scan.
    `src/search/conversations`.

90. 2026-10-28 · matt: "stop sending as one." A message drafted on several
    lines goes out one message per line, in every chat, whatever matt's
    habit there (`splitPlan`, `src/voice/pairs`). Only `--asOne` sends it as
    one, and only when matt asks for that. A one-line draft is still split
    the way he writes in that chat.

91. 2026-10-28 · matt: "make it 60." A Discord account sends up to 60
    messages a day, not 40 (`WRITES_PER_DAY`, `src/directApi/engine`,
    handed to the engine's governor in each run's spec). Every other
    platform keeps 40. `FBK_GOVERNOR_MUTATION_DAILY` still overrides it for
    one run when matt asks. The hook's status line shows each account's own
    limit.

92. 2026-10-25 · matt: the self-check's languages are checked by order.
    AdsPower's browser (SunBrowser 154) adds `en-US, en-GB` after the
    profile's own languages, whatever the profile says (Kamloops,
    2026-10-24: `en-CA, en, en-US, en-GB`, three starts refused). The
    self-check passes when `navigator.languages` starts with the pinned
    languages (`en-CA, en`), in page and worker, so the account's language
    still comes first; extras after them are allowed. `language`, Intl and
    the number locale are still exactly the pinned locale (rules 16-17).

93. 2026-10-27 · matt: "we need to build a knowledge base inside of it",
    all of it, agent memory too, with Redis. The knowledge base lives in
    ListeningKit's Twenty on node02 (`knowledgeArticles`: key, kind, body,
    source, tags, author, content hash; reached over the tailnet at
    `node02.tail4fcf85.ts.net`, never through the public login gate) and is
    searched through Redis 8 on node02 (`kb-redis`, the search module's
    `kbIdx`: BM25 keyword and HNSW meaning over local all-MiniLM-L6-v2,
    fused with reciprocal rank fusion). `log kb sync` collects AGENTS.md's
    rules and sections, every skill, every doc (`docs/infra/` as infra, never
    `docs/vendors`), every Claude memory file, the known page states and the
    accounts from log-cli's Twenty (no credential, proxy URL or cookie),
    writes what changed to Twenty and re-indexes what changed into Redis; an
    article a person writes or edits in Twenty is indexed on the next sync.
    `log kb search "<query>" [--kind]` is how an agent finds context, `log kb
    remember "<text>"` saves an agent memory to both at once, `log kb show
    <key>` reads one in full. Secrets are scrubbed before anything is written
    (named keys, URLs with a login, JWTs, private keys, long random strings).
    The logins are files in `~/.config/listeningkit/`, never in the repo or
    the knowledge base. `src/knowledge/base`, `docs/knowledgeBase.md`.

94. 2026-10-29 · matt: "whatever you did in such quick succession lead to
    my account getting disabled, never do that again." Never act on an
    account in quick succession. What happened (matt's Discord,
    `sourcedandsoldtothehighestbidder`, 2026-10-29 00:47-01:00 UTC): in
    about 13 minutes an agent replied in 3 chats, read 1,400 messages
    from a server (Finn Automated) with a scratch script that went
    around log-cli (`.scratch/finn/dc.ts`: its own fetch to
    `discord.com/api/v9` with the session token, pages back to back,
    retrying straight through 429s), pulled the account's
    relationships, then opened new DMs to strangers from that server
    30 s apart. Discord disabled the account. From now on:
    - Every call to a platform goes through log-cli's own commands and
      their governor. Never a hand-rolled script with an account's
      token or cookies.
    - A 429 or a failed send stops the run. It is never retried
      through, and the next action waits for matt.
    - Reading a server, group or member list in bulk is its own session.
      It never runs in the same session as sending.
    - Cold DMs to people the account has never talked to go out at most
      a few a day, minutes apart, never back to back. Each new DM
      channel opened counts as a write.
    - After a block, disable, captcha or cooldown, nothing resumes on
      that account until matt says so.

95. 2026-10-30 · matt: the tool definitions fill the agent's context
    with how matt works, so every agent knows how to do every job. The
    work matt asks for again and again is written as use cases,
    `docs/useCases/<platform>/<page>.md`: each one says how he asks for
    it, then its steps in order, each naming its tool and what counts as
    done. The log MCP serves them like Paper's MCP serves its guides:
    short instructions that say to load `getGuide({ topic:
    "logMcpInstructions" })` first (it lists every use case and how matt
    asks for it), `getGuide({ useCase: "<platform>/<page>" })` for one
    page, and every tool's description naming the use cases that call
    it and its guide. When matt asks for work a use case covers, the
    agent follows that page, never improvises. Every tool declares
    `anthropic/maxResultSizeChars` so a guide arrives whole. lefthook's
    pre-commit `useCases` (`bun run check:useCases`,
    `src/useCases/review`) takes this session's transcript (matt's asks
    and the tools called) and asks SubQ, for every page, whether it is
    still the right way to do that work, stale or should move, and
    whether the session did repeatable work no page covers. A stale page
    or uncovered work stops the commit until the page is updated or
    written and staged.

96. 2026-10-31 · matt: "the new twitter budget 90". An X account makes up
    to 90 writes a day (dms, replies, quotes, likes, reposts, follows,
    posts), not 40 (`WRITES_PER_DAY`, `src/directApi/engine`, handed to the
    X engine's governor in each run's spec). Discord keeps 60, every other
    platform 40. X's own answer still decides: a 344 (its daily limit) stops
    the run, and nothing more goes out until matt says so. `log twitter
    repost` (MCP `twitterRepost`, `twitterRepostLive`) reposts one post,
    a write like the others.

97. 2026-10-31 · matt: "the ability to have everything done locally".
    Accounts live in a local file, `~/.logCli/localAccounts.json`
    (`LOG_LOCAL_ACCOUNTS` moves it), on every platform, and this narrows
    rule 13 for accounts only. `log localAccount pull` copies every
    Twenty account in, cookies and login included, each keeping its
    Twenty id so its listings and groups still find it; `add` makes one
    Twenty never had (with its AdsPower profile); `list` shows them.
    `LOG_ACCOUNTS=local` (`.env.local`) leaves Twenty out of accounts
    entirely, and a session a run captures or refreshes is saved back to
    the file. Listings, groups and conversations stay in Twenty.

98. 2026-10-31 · matt: "So the opener always relevant. Don't just go in
    for the jugular. Go in with the opener." A first message to someone
    matt has never talked with is the opener and nothing else: about them
    and something they posted (or reposted, or that they reposted him),
    always relevant, and never the ask: no pitch, no "you using treg yet",
    no call, no link to his own stuff. The ask waits until they have
    answered. `log voice` fails a first message with an ask in it
    (`openerOnly`, `src/twitter/copy/voice`), and someone with nothing
    relevant to open on isn't messaged yet. `docs/useCases/twitter/engagerDms.md`,
    `networkMaxing.md`, `GUIDES/MATT_WRITING_STYLE.md`.

99. 2026-10-31 · matt: "network maxing is basically making it so the
    conversation will be getting to know about them and what they're
    doing. But the whole point of it is to expand our network, which is
    the niche map." Network maxing grows the niche map (the people around
    the communities and creators in his niche, with their role, whether
    they follow him and how close they are). New people come from it
    first: real roles, closest first, not yet talked to. Every message is
    about them and what they're doing, never what matt sells (rule 98 for
    the opener). Where the map lives is in the agent memory, not in the
    repo. `docs/useCases/twitter/networkMaxing.md`.

100. 2026-10-31 · matt: "reactions are indicators of open messages, so we
    can then add that as a thing we can follow up on", then "for our already
    opened messages". When someone's last event is a reaction to matt's
    message, or their read receipt is past his last message (X Chat's
    read-marker events, the old DM API's `last_read_event_id`), they opened
    it and didn't type back: it isn't a reply waiting on him, it's a
    follow-up to send. `log twitter dms --waiting` lists those apart
    (`reactedOnly`, `openedNoReply`, `followUpDue`, `src/twitter/dm/person`;
    `openedByThem` on each thread; `--json` gives `followUps`), and the follow-up
    is the network-maxing kind: about them and what they're doing, never the
    opener again and never the ask. `docs/useCases/twitter/networkMaxing.md`
    ("Everyone who reacted"), `dmInbox.md`.

101. 2026-10-31 · matt: "increase it to be 240 writes to twitter". An X
    account makes up to 240 writes a day, not 90 (this replaces rule 96's
    number; `WRITES_PER_DAY`, `src/directApi/engine`). X's own answer still
    decides: a 344 stops the run and nothing more goes out until matt says
    so. Discord keeps 60, every other platform 40.

102. 2026-10-30 · mandeep: LinkedIn goes out looking like a browser, the
    way X does (rule 81). `vendor/openLinkedinApi` reaches LinkedIn only
    through one curl_cffi `Session` in `open_linkedin_api/transport.py`,
    pinned to one impersonation target (`IMPERSONATE`, `chrome150`, the
    closest to the Chrome its cookies come from), sending the target's own
    user agent, never the library's fixed one or plain `requests`.
    `python/checks/linkedinTransport.py` refuses anything else (`bun run
    check:linkedinTransport`, pre-commit and pre-push). Every LinkedIn call
    runs through the account's governor (`python/platformKit/engine.py`), and
    a LinkedIn account writes at most 10 times a day (`WRITES_PER_DAY`), not
    40 (rule 91).

103. 2026-10-31 · matt: log-cli moves into the public log repo, and we work
    there. log-cli on GitHub is archived. "The readme is specifically for how
    to set up": why use it, what it's for, how to install and use it, and how
    we use it, about this project and nothing else of ours. Everything
    technical lives in `docs/`, a page per subject: the generated reference
    (`docs/reference.md`, from `bun run docs:build`, which replaces rule 56's
    README section), the guides, the use cases, the platforms, MCP setup
    (`docs/mcp.md`) and the Mermaid diagrams (`docs/diagrams`). Rule one stays
    first in AGENTS.md and the MCP instructions, no longer in the README
    (this narrows rule 76). The docs site at log.listeningkit.com/docs is
    Fumadocs, built from `docs/` on every site build
    (`scripts/docs/syncSiteDocs.mjs`). lefthook's `siteDocs` (`bun run
    check:siteDocs`, pre-commit and pre-push) refuses a page without a title
    or a link to a file that doesn't exist, beside `docs`. log is installed
    as the npm package `@listeningkit/log` and runs as `log` and `logMcp`:
    docs, skills and messages say `log …`, never `bun bin/log.ts`. "We don't
    use Convex at all": no Convex, and no dashboard. The site is the landing
    page plus the docs.

104. 2026-11-01 · matt: "the timing stuff there i saw you hand rolled the
    outbound stuff when it should be queued and it has to have random
    intervals, but the bundle itself actually reveals more information".
    On 2026-11-01 matthewsoldit got a soft block, then X's 226 ("looks
    automated") on a reply. The live log showed 8 thread reads fired in
    0.2 s by two parallel helpers while sends went out from a hand-written
    loop, and every `log twitter` call was a fresh client that loaded
    x.com's home page and its signer before acting, so a 3-line dm was 3
    cold starts in 9 s. X's own web client (`sign.o` in its x-web bundle,
    read 2026-11-01) loads the page once and signs every call from it.
    From now on: more than one send goes through the queue (`log twitter
    queue build|plan|run`, random times), never a hand-rolled loop and
    never helpers reading or sending on one account in parallel. The X
    engine takes one call per account at a time (`engine.lock`, refused
    with `accountBusy` after 15 min), waits 4 to 11 s after the last call,
    and keeps the transaction key in `clientTransaction.json` for 3 hours
    (`python/twitterApi/engine.py`, `vendor/twikit` `ClientTransaction.state`
    and `restore`).

105. 2026-11-01 · matt: "we cannot be opening multiple sessions there,
    that defeats the core purpose of what we use this tool for ... it
    should always be one, and then it needs to loudly create issues". An X
    account has one session, always. Every X call (CLI, MCP, hooks, the
    queue, the X Chat watch) goes through the account's one engine host
    (`python/twitterApi/host.py`, started on the first call, closed after
    30 idle minutes or when the engine code changes): one twikit client,
    one connection, one cookie jar and one transaction key, the way X's
    own web app keeps one page and signs every call from it (x-web
    `startup-dynamic`, read with rea 2026-11-01). A second host can't
    start (`host.lock`); a call that can't reach the host is refused with
    `xSessionHostDown` and sends nothing, never falls back to a session of
    its own. The hook's account line shows the open session (pid, since,
    calls). `LOG_TWITTER_HOST=inline` runs the old way, for tests only.

106. 2026-11-01 · matt: "when doing stuff like changing the code or
    anything, ensure that there hasn't been any changes to it locally, like
    to the engine ... you're not allowed hand-rolled commands, it always has
    to be through the MCP basically". Two things, enforced by the hooks:
    - **Through the MCP only.** Every log action an agent takes goes through
      the log MCP tools (`mcp__log__…`), never a hand-run `log …` or `bun
      bin/log.ts …` from a shell. The PreToolUse hook (`liveLogs`,
      `handRunDenial` in `src/agentHooks/liveLog`) refuses one and names the
      MCP instead. Only the terminal-only prompts (`TERMINAL_ONLY`: launch,
      login, mcp, chat pin, cookies save, messenger pin) are run in a
      terminal, by matt. A stale MCP server is said to matt (restart the
      app), never worked around.
    - **Local changes first.** Before changing code, check what is already
      changed and uncommitted in the checkout. The engines hook says it
      loudly at session start and whenever it changes (`>>> UNCOMMITTED
      LOCAL CHANGES`, `localChangesLine` in `src/mcp/freshness`): read each
      one's diff, and never overwrite, revert, stage, publish or ship
      someone else's uncommitted work without matt.

107. 2026-11-01 · matt: "the queue connects to the one process, and it
    can do these at the same time, yet it's only on one". An account has one
    queue, and everything it sends goes into it: the dms, the reply-guy
    replies and the answers to people who message, together (each item
    keeps its own action). `log twitter queue add <queue> --targets <file>
    --action dm|reply|quote --by <who>` puts more in, even while it runs:
    the run takes them in as it waits and fits each one between what is
    planned, at least the queue's minGap apart, and one due sooner than the
    send it waits on goes first. `queue run --keepOpen` keeps the run going
    once it has sent everything, taking in what is added, until it is
    cancelled. So one run sends all of an account's work through its one X
    session (rule 105), never a second queue or run beside it.
    `src/twitter/queue` (`addToQueue`, `fitTimes`, `takeIncoming`,
    `mergeAdded`).

108. 2026-11-01 · matt: "if something doesn't seem to be working, you need
    to fix it", "make sure it's always up to date", and "if someone responds
    to me ... you have full authority to be able to send a follow-up message
    to them if it is in the context of the right thing to do with that said
    conversation". Three things:
    - **Fix it, don't report it.** Something broken is never told to matt
      as a fact and left. Find the cause and fix it in the same turn. Only
      when the fix needs something from him, say exactly what (a restart, a
      login, a key, a yes), and say that first.
    - **Nothing runs stale.** The inbox hook runs a silent cleanup on every
      event: a queue lock whose run died is cleared (and `queue run`, `add`
      and `nudge` take it over themselves), and an inbox watcher started
      before the newest code is stopped and started again
      (`stopStaleWatchers`, `clearDeadQueueLocks`, `src/inbox/watch`). An X
      session host closes when any of its code changes (`python/twitterApi`,
      `python/platformKit`, `vendor/twikit`), even while an X Chat watch is
      open on it, so the next call runs the new code. A read receipt X Chat
      can't verify is a read marker, never a message (`unopened_of`,
      `vendor/twikit`).
    - **Answer straight away.** When someone answers matt, a reply that
      answers what they said and fits that conversation is drafted, gated
      and sent at once, then matt is told what they said and what went out.
      Only a meeting, a promise, a price or money, or a conversation that
      can't be placed waits for him. Hook times are in matt's own clock.

109. 2026-11-01 · matt: "before you do an action with someone, you need to
    figure out the context of that person ... if they liked something, if
    they commented on something, if they replied to them recently, if I
    send them a message outside of the tool". Full context at the time of
    sending, every time, through the tool:
    - **Before drafting,** `log twitter dms --with <handle>` (MCP
      `twitterDms` { with }) gives the whole thread, read from X so it holds
      what matt sent from anywhere, and what that person did on the
      account's posts (likes, retweets, replies with their words, quotes,
      mentions, follows), from a fresh notifications read
      (`activityOf`, `src/twitter/dm/person`). Someone who already did the
      action is thanked for it, never asked for it.
    - **Right before each send,** the queue run reads both again and holds
      the item (status `held`, `heldFor` saying what changed) when anything
      happened since it was drafted (`draftedAt`): a message either way, a
      like, retweet, reply, quote, mention or follow
      (`contextChangesSince`, `contextChanged` in `src/twitter/queue/run`).
    - **A held item** is redrafted from the new context, gated, and put back
      with `log twitter queue edit <queue> --n --text --by` (MCP
      `twitterQueueEdit`). A queue file is never edited by hand, and nothing
      is sent around the queue to get past a hold (rule 106).

110. 2026-11-02 · matt: "we need to be faster with the mcp commands ... why
    is it taking so long for something which is not even something that
    should take long". Reads on an X account are spaced 0.8 to 2.5 s after
    the last call (`READ_SPACING_SECONDS`: inbox, a person's thread,
    notifications and their pages, follows, followers), the way X's own app
    fires reads back to back when a screen opens; only sends keep rule 104's
    4 to 11 s (`SPACING_SECONDS`). Still one call per account at a time
    through its one session (rules 104, 105). Reading a person's full
    context (rule 109) pulls notifications only when they weren't synced in
    the last 2 minutes (`notificationsFresh`). A queue run never sends two
    things closer than its minGap, and items added to it keep that gap.

111. 2026-11-02 · matt: find GitHub repos "good for claude watermarking ...
    so we're able to pass it through context into the sends so that we can
    see how likely it is to be watermarked". Claude's own watermark is
    statistical (word choice under a secret key) and Anthropic's text
    detector is private preview, so no public repo can score it
    (`RESEARCH/CLAUDE_WATERMARK_REPOS_2026_11_02.md`). What can be read is
    what AI chat interfaces leave in text: `OfirYC/claude-watermark-checker`
    is vendored at `vendor/claudeArtifactDetector` (MIT, no dependencies)
    and every send's copy is read by it (`watermarkReadingOf`,
    `src/twitter/copy/watermark`): `clean`, `stylistic` (curly quotes, em
    dashes) or `artifacts` (zero-width or other hidden characters, odd
    spaces, pasted Claude HTML), with `statistical: unknown` always said.
    `planSend` refuses a send with artifacts (`aiArtifacts`) and carries the
    reading in its plan; `log voice` shows it and fails a draft with
    artifacts; a direct send and each queue send log it.

112. 2026-11-02 · matt: "there is definitely a dictionary of the common
    phrases which we can then have a p99 p50 search across to basically see
    and match the likelihood of this here to the common AI phrase ... use
    tbhb/vale-ai-tells". The voice gate also reads a draft for AI phrasing.
    The lists live in `vendor/aiTells` (`SOURCES.md`): tbhb/vale-ai-tells
    first (its 130 rules run on the draft exactly as Vale would), then
    FeedHive/ai-slop-detector, SanderFrentz/ai-vocabulary,
    SicariusSicariiStuff/SLOP_Detector, real AI-written samples, and
    fsu-nlp/lexa-index's words Claude and GPT overuse. `log voice aiIndex`
    embeds every literal phrase with Jina (`jina-embeddings-v3`,
    `JINA_API_KEY` in `.env.local`) and measures matt's own replies from the
    voice index against them: his p50 and p99 closeness, and the vale rules
    he uses himself in over 2% of his messages, which are muted. Each draft
    is cut into lines and word windows, every chunk's closest AI phrase found
    by cosine, the closest reranked with `jina-reranker-v2-base-multilingual`,
    and the draft fails when a vale rule hits or it sits closer to AI
    phrasing than matt's own p99. `src/voice/aiTells`. A phrase vale flags
    that matt says himself in 5 or more of his own messages ("to be honest",
    "for example") is his voice and never fails a draft (`mattsOwnPhrases`).
    Phrases people quote on X as AI tells (treg's X search,
    `vendor/aiTells/xComplaints`) are indexed only when they sit close in
    meaning (cosine 0.6) to a curated phrase.

113. 2026-11-02 · matt: "what is hitting the session ... call the rea bundle
    checker for the exact actions and outline it and then force it to then
    be part of the MCP guides so we can then stop doing this handrolling".
    On 2026-11-02 matthewsoldit had 30 X session starts and 67 X Chat socket
    reconnects in an evening, then X's 226 on a reply: the stale-watcher
    cleanup (rule 108) restarted the X Chat watcher on every code edit, and
    each restart reopened X's chat socket, fetched the keys again and paged
    the inbox, and during a governor cool-off the watcher was started again
    on every hook. Now the watcher is restarted only when the engine's own
    code changes (`python/`, `vendor/twikit`), never while the account's
    governor is cooling off (`coolingDown`, `src/inbox/watch`), and a call
    to a session that is restarting waits for the new one (`connect_host`).
    What X's own signed-in client does is read with rea from its own
    scripts, never guessed: `log twitter session webClient --account <a>`
    (MCP `twitterSessionWebClient`) loads x.com/home through the account's
    one session, as twikit already does to sign its calls, and saves the
    page and its scripts for rea. What it shows about a reply is written in
    `docs/platforms/x/compose.md` and the xPosting skill, and the engine
    sends what X's client sends. Read on 2026-11-02: twikit called 22 of
    X's operations by old ids (CreateTweet `SiM_cAu…` where X's client
    sends `l4hk8uVG…`) with the wrong feature switches (21 where X sends
    39). Now `webClient` writes X's live operation table and switch values
    to `~/.logCli/twitter/xOperations.json`, every session loads it, and
    each GraphQL call takes X's live id and exactly X's switches with X's
    values (`live_call`). A closing session drops its open connections and
    exits at once, so an open X Chat watch can't hold it half-closed.

114. 2026-11-02 · matt: "the queue will always need to be in context ... are
    we using the queue as a monitor or as a background pid that then isn't
    being inserted into context via the hooks into the agent context?" A
    queue run is a job inside the MCP server, and until now nothing put what
    it did in front of the agent: a held item sat unredrafted until someone
    read the log. The queue hook (`scripts/hooks/queue.ts`, on SessionStart,
    every prompt and every log tool or shell call) reads every queue's log
    since the last look (`newQueueEvents`, `src/twitter/queue/events`) and
    puts each held item, send, cool-off with X's answer, stop and start into
    the agent's context (`>>> QUEUE`), saying what to do: a held item is
    redrafted from what changed, gated and put back (rule 109); a cool-off or
    stop means nothing more goes out until matt says so (rule 94).

115. 2026-11-02 · matt: "go through the actual bundle itself for the actual
    client ... pass the live context into the actual context ... persistent
    realtime context ... scoped per session". X's own client stays live with
    its notification refresher (`bundle.Notifications`, module 726194, read
    with rea through the account's one session, `log twitter session
    webClient`, which now also saves the DM, X Chat and notification chunks
    the page loads on demand): every 30 s while the tab is in front, and only
    every 120 s while its push is subscribed, it reads `ViewerBadgeCounts`
    with `x-twitter-polling: true`, then the DM updates, and the notifications
    when the count rises. The account's X Chat watch (the socket is our push)
    now does the same through the one session: `ViewerBadgeCounts` with that
    header every 120 s, and when `ntab_unread_count` rises, one page of new
    notifications (`badge_poll`, `python/twitterApi/engine.py`). Each count
    and each new like, retweet, reply, quote, mention or follow goes to
    `~/.logCli/twitter/<account>/live.jsonl`. The X live hook
    (`scripts/hooks/xLive.ts`, SessionStart, every prompt, every log tool or
    shell call) puts it in front of the agent (`>>> X LIVE`,
    `src/twitter/live/feed`), each Claude session with its own offsets
    (`src/agentHooks/sessionOffsets`, keyed by the hook's `session_id`), so
    two sessions both see every event once. The queue hook (rule 114) reads
    per session the same way. A refused read stops the poll and is said to
    matt (rule 94).

116. 2026-11-02 · matt: "we have the lefthook stuff there but we don't have
    the log.md? ... see what the CI is". Two things were half done. The log
    was one 1.6 MB `log.md`, which GitHub won't show, so on GitHub it looked
    missing: it is now one file per day, `log/<date>.md` (the day in UTC),
    and `log.md` is the index of every day with its commit count, newest
    first; the commit hook writes each entry into the day's file and keeps
    the index current (`scripts/commitLog/commitLog.mjs`, rule 5). And there
    was no CI: every gate ran only in lefthook on matt's machine. Now
    `.github/workflows/check.yml` runs `bun run check` (every lefthook gate,
    the typecheck and the tests) on every push to main and every pull
    request, on Windows like matt's machine, with the engines' Python set up
    from the vendored packages.

117. 2026-11-02 · matt: "our code and the use cases and everything are
    stale ... there's no proper order to the madness ... it needs to be part
    of the CI gate", with jev-spec run on SubQ ("we use SubQ in jev ... ask
    way more questions with the new model"). The rules above are written by
    date; the specs put them in order by domain. Each domain has
    `docs/specs/<domain>.md` (what the rules require as they stand today,
    one `REQ-<PREFIX>-NN` per behaviour, the latest rule winning) and
    `src/specs/<domain>/index.ts` (the files that implement it and one
    literal SubQ question per requirement, plus one for behaviour the spec
    doesn't describe). jev-spec (`jevSpec.config.ts`, `patches/` lifting its
    120,000-character cap to SubQ's 384K-token window) sends each domain's
    spec and code to SubQ's Decisions API (`subq-snap-1.1`) in one request
    and fails when an answer misses its threshold. Every question is probed:
    it passes on the code as it is and fails on a copy broken on purpose.
    lefthook's `specs` (`bun run check:specs`) checks the domains a commit
    touches before it lands and every domain before a push, and CI runs it
    in `bun run check` with the `SUBQ_API_KEY` secret and refuses to pass
    without one. A new rule goes into its domain's spec and questions in the
    commit that adds it; a spec without its questions, or questions without
    their spec, stop the commit. `docs/specs/README.md` lists every domain.

118. 2026-11-02 · matt: "yes do all 5", settling the five places where the
    spec gate (rule 117) found the rules disagreeing with each other or
    with the code. The newer, stricter rule wins wherever it protects an
    account:
    - **A refused send stops the queue (rule 94 over the queue's own
      cool-offs).** When X refuses a send (a 429, its 226 or 344, a soft
      block, the governor), the queue run stops with X's answer, the item
      stays pending and nothing goes out until matt starts a run again. A
      dropped connection is not a refusal and may still be retried. This
      replaces the cool-offs that ended on their own (rule 114 now reports
      a stop, never a cool-off that resumes). A send whose context can't
      be read right before it (rule 109) is held, never sent on half of it.
    - **A checkpoint deactivates the account (rule 82 over rule 54).** No
      checkpoint page is pressed through: `checkpointStart` and any other
      `/checkpoint` page are a stop with no resolver, the browser's
      checkpoint watch sets the account DEACTIVATED (reason `checkpointed`),
      and the lifecycle closes the browser with the reason `checkpoint` and
      ends in `deactivated`. A video selfie or ID check still waits for matt.
    - **A group read also saves the group's identity (narrows rule 65).**
      Beside `readCursor`, `lastReadAt` and `lastReadReason`, a read writes
      the group's `facebookGroupId` and `groupUrl` when it finds the real
      id, since `poll --request` finds groups by it. Posts and comments
      still never go to Twenty.
    - **Discord follows rules 94 and 111.** `log discord send` reads every
      message's copy for AI artifacts and refuses `aiArtifacts`, as X does,
      and a 429 or any refusal while reading Discord stops the whole read,
      keeping what was read.
    - **The exit IP may move within the country (narrows rule 17).** On an
      attached browser a residential proxy can change IP between the gate's
      check and the browser opening, so a new exit is accepted when it is in
      the account's country and on the same timezone; otherwise it is
      refused with `browserExitIpMismatch`.
    Each is in its domain's spec and checked by SubQ (`docs/specs/`).

119. 2026-11-02 · matt: extensions, "things that we think are going to make
    the experience of using social media more human", first Memelord ("we
    will only use these": `search_memes`, `get_meme_template`,
    `get_trending_memes`, `list_image_tools`, all free). An extension is an
    outside service log reaches through its own command and MCP tools, never
    by hand (rule 106), documented in its own docs area, `docs/extensions/`
    (a tab of its own on the docs site). Memelord's client
    (`src/extensions/memelord`) knows only those four GET endpoints of
    `https://www.memelord.com/api/v1`, with `MEMELORD_API_KEY` as a bearer
    token; nothing that generates, edits or runs a model has a path in log
    (rule 41). `log memelord search|template|trending|tools` (MCP
    `memelordSearch`, `memelordTemplate`, `memelordTrending`,
    `memelordTools`, the `extensions` guide, the `memelord` skill) answers
    each template with its media url. A meme goes out on Discord as that url
    on a line of its own, which Discord shows inline: read the chat, pick the
    moment, search, gate it with `voice`, send it by the chat's id
    (`docs/useCases/discord/memeReply.md`). First sent 2026-11-02 to the log
    group: Floyd Mayweather's Cash Stacks, on "how much shall i charge".
    Spec: `docs/specs/memelord.md`.

120. 2026-11-02 · matt: "start creating meme taste ... injecting into the
    context the kind of memes that we need": deep fried memes, memes about
    larping, streamer reaction clips like FlightReacts, Zias and Bloo, and
    shitposts, "those are the type of memes that I think are bangers", and "a
    meme index for taste ... over the type of memes we've done before". His
    taste lives in `~/.logCli/memes/taste.json` (`src/extensions/memeTaste`):
    `log memelord taste --build --from <posts.json>` reads every picture in
    his X media posts (treg `tikhub.x.twitter-web-fetch-user-media`, which matt
    said to spend on) and asks SubQ, from the picture, whether it is a meme
    and which of his styles it is (`TASTE_STYLES`, or other), keeping the
    memes. `log memelord search` scores each template's picture against his
    taste with SubQ (`tasteFit`) and ranks by it, `--noTaste` keeping
    Memelord's order, and every answer leads with his taste
    (`tasteSummary`), so the agent picking a meme has it in context.
    `log memelord taste` (MCP `memelordTaste`) shows it. Spec:
    `docs/specs/memelord.md` (REQ-MEME-09, REQ-MEME-10).

121. 2026-11-03 · matt: "those accounts are too big, a person who is too
    large isn't worth it yet, sub 1500 is ideal". A reply goes only to an
    author with 1500 followers or fewer. Reply-guy targets come from the
    niche map under 1500 followers. Before a reply likes, follows or sends
    anything, the engine reads the author's follower count
    (`author_too_big`, `MAX_AUTHOR_FOLLOWERS` in `python/twitterApi/engine.py`),
    and a larger author gets nothing (`authorTooBig`). The queue marks that
    item skipped (`TOO BIG`) and goes on: it is not a refusal (rule 118).
    A reply matt asks for by name goes out whatever the author's size, with
    `force` (rule 86), as his reply to @sporadica (222k) did on 2026-11-03.
    Every reply that does go out likes the post and follows the author
    first. Spec: `docs/specs/xQueue.md` (REQ-QUEUE-15).

122. 2026-11-03 · matt: "bump discord to 120". A Discord account sends up
    to 120 messages a day, not 60 (this replaces rule 91's number;
    `WRITES_PER_DAY`, `src/directApi/engine`, handed to the engine's governor
    in each run's spec). Rule 94 still holds: a 429 or any refusal stops the
    run, and cold DMs to strangers stay a few a day, minutes apart. X keeps
    240, LinkedIn 10, every other platform 40. Spec:
    `docs/specs/writeBudgets.md` (REQ-BUDGET-01).

123. 2026-11-03 · matt: "make it a rule all platforms need the web socket
    hooks stuff there". Every platform log-cli talks to gets the live hooks X
    and Discord have. Its account's one session holds the platform's own push
    channel open: X Chat's socket, Discord's gateway, Slack's
    `wss-primary.slack.com`. That is never a poll from a second client. The
    inbox hook starts that watcher for every account and puts each new
    message, mention and reply in front of the agent with what to do
    (`>>> NEW MESSAGE`), per session (rules 105, 108, 115). It also stops a
    watcher running older code, skips an account cooling off, and stops on any
    refusal (rule 94). A platform isn't done until its watcher is in the inbox
    hook (`scripts/hooks/inbox.ts`, `src/inbox/watch`), starting with Slack.
    Reddit and LinkedIn aren't built yet. Spec: `docs/specs/agentHooks.md`
    (REQ-HOOKS-12).

124. 2026-11-03 · matt: "on creation of a new platform we need to auto
    build anchors as well". `log new platform <name>` writes the platform's
    spec with the rest of the platform: `docs/specs/<name>.md` and
    `src/specs/<name>/index.ts`. The spec has one requirement each for the
    session, the engine, the platform's own answer recorded, and the wiring,
    each with its SubQ question. Every anchor is on what the command just
    wrote, so the spec gate (rule 117) proves the new platform from its first
    commit. As the platform grows, its new behaviour goes into that spec with
    its anchors. Spec: `docs/specs/platformScaffold.md` (REQ-PLATFORM-14).

125. 2026-11-03 · matt: "Check slack via cli it needs to be swapped to use
    curl_cffi same as X". Slack goes out looking like a browser, the way X
    (rule 81) and LinkedIn (rule 102) do. `vendor/gabrielSlack` reaches Slack,
    its web API, its cookie exchange and its websocket (`wss-primary.slack.com`),
    only through `gabriel/core/transport.py`: one curl_cffi `AsyncSession` made
    by `new_session`, pinned to one impersonation target (`IMPERSONATE`,
    `chrome150`), sending that target's own user agent (`USER_AGENT`, which the
    client's default metadata uses), never httpx, websockets, aiohttp, requests
    or a socket of its own. It keeps no cookies between calls: the d cookie is
    sent on each one. gabriel's own login CLI, which drove Chrome through httpx
    and websockets, is removed. `python/checks/slackTransport.py` maps every
    transport touchpoint by syntax tree (`--map`), rewrites what has a curl_cffi
    equivalent (`--apply`) and refuses the rest (`--check`, `bun run
    check:slackTransport`, pre-commit and pre-push). Spec: `docs/specs/slack.md`
    (REQ-SLACK-05).

126. 2026-11-03 · matt: every voice note he was sent or sent, transcribed
    with AssemblyAI, and "inside of the discord layer we have that and then
    the social media platforms at large, how can we detect when we have
    audio". Audio is detected once, in the shared message layer
    (`python/platformKit/media.py`, `src/platformKit/media`), never per
    platform: a content type of `audio/*` or `video/ogg`, an extension
    (`.ogg .oga .opus .m4a .mp3 .wav .aac .webm`), or the platform's own flag
    (Discord's voice-message flag 8192 with its duration and waveform, X
    Chat's audio media, Slack's `slack_audio` file). Every platform's
    messages keep their attachments, and an audio one adds `(audio: <name>)`
    to the text. Whatever is audio goes through one AssemblyAI path (`log
    transcribe`, MCP `transcribe`; `src/media/voiceNotes`): kept once by its
    file's hash in `~/.logCli/transcripts`, written into the conversation
    store as `(voice note: "<what was said>")` so search, voice and SubQ see
    it, and done as they come in `discordRead`, `twitterDms`, `slackRead`
    and the inbox. Files come only through the platform's own engine and
    session (X's one session, Discord's sound search, Slack's own
    transport), and any refusal stops the run (rule 94). The key is
    `ASSEMBLYAI_API_KEY` or `ASSEMBLY_AI_KEY` (`.env.local`,
    `~/.buzz/.env.local` or `~/filmcraft/.env.local`), never printed.
    `log new platform` writes the attachments into a new platform's message
    shape, and `check:platforms` refuses an engine whose messages drop them.
    Spec: `docs/specs/voiceNotes.md`.

127. 2026-11-03 · matt: "the watermarking has began ... research the saying
    'is wild' no one says that", then "B is the only right option ... we're
    writing across everything i said and how i write it", and "install this
    and add it to the subq" (novatechflow/ai-watermark-scrambler). The voice
    gate passed "yc and a pageant in the same week is wild" because nothing
    compared a draft with what matt has actually written. His 66,116 messages
    never say "is wild", and another account's reply had used the same line
    word for word three hours earlier. Now the gate also measures his phrasing
    (`src/voice/phrases`): every reply in the voice index is cut into word
    pairs, a draft's share of pairs he has written at least twice (leaving
    out words from what they said) is set against his own 10th percentile,
    measured over his replies with each one's own pairs left out
    (`phrases.json`, built with the voice index), and a draft below it fails
    with the pairs he never wrote named. The vendored scrambler
    (`vendor/aiWatermarkScrambler`, Apache-2.0, layer A `inspect_text.py`)
    reads every draft for invisible and lookalike characters, and a hit
    fails it. Both readings go to SubQ with the draft. Its layer B rewrite
    needs a local model (Ollama or vLLM), which this machine doesn't have,
    so it isn't wired. Spec: `docs/specs/voiceGate.md` (REQ-VOICE-07, 08).

128. 2026-11-04 · matt: "you're not meant to open up the browser", after a
    meme went to someone on Instagram through the account's AdsPower browser.
    Instagram is worked through the direct-API engine on vendor/instagrapi,
    over the MCP, and the browser is never used for an Instagram action:
    `log instagram dms` reads the threads or one thread, `log instagram send`
    sends text and photos (a meme goes as `--photo`, a dry run unless `--live`
    with `--approvedBy`), and `log instagram watch` holds Instagram's own
    realtime connection (MQTT to edge-mqtt.facebook.com, the DM sync
    subscribed), which the inbox hook starts for every signed-in Instagram
    account so each new DM reaches the agent (`>>> NEW INSTAGRAM MESSAGE`,
    rule 123). An action the engine doesn't have yet is built on it, never
    done in the browser. Every HTTP call goes through curl_cffi: instagrapi's
    private and public transports are both set to curl (`curl-adapter` for
    the public one), and `check:instagramTransport` (pre-commit and pre-push)
    refuses anything else; the realtime MQTT socket isn't HTTP and is the one
    exception. Spec: `docs/specs/instagram.md` (REQ-INSTAGRAM-05 to 08).

129. 2026-11-04 · matt: "it will always be one continuous [session] so we
    can't have cold start stuff ... we can't open multiple python processes
    for this because that is going to fuck up our accounts". An Instagram
    account has one session, always, the way an X account does (rule 105).
    Every Instagram call (CLI, MCP, the inbox hook's watch) goes through the
    account's one session host (`python/instagramApi/host.py`, started on the
    first call, closed after 30 idle minutes or when the engine or instagrapi
    changes): one process, one instagrapi client signed in once from the
    saved `sessionid` and reused by every call after (`reused` in its answer),
    and one realtime connection to edge-mqtt.facebook.com that every watch
    listens on. Calls other than the watch run one at a time. A second host
    can't start (`host.lock`); a call that can't reach the host is refused
    with `instagramSessionHostDown` and sends nothing, never falling back to a
    session of its own. Every answer carries `instagramSession` (pid, calls,
    since). `LOG_INSTAGRAM_HOST=inline` runs the old way, for tests only.
    Spec: `docs/specs/instagram.md` (REQ-INSTAGRAM-09).

130. 2026-11-04 · matt: "we need to make it so we have a monitor on there
    that will then listen for the new info coming over via the websocket,
    because look, he responded halfway through ... he just asked something,
    it breaks the flow". On 2026-11-03 Abel wrote "is this ai" on Discord
    while an 8-line send was going out, and lines 6 to 8 went on top of his
    question. A message sent one line at a time stops the moment they write:
    before each line after the first, the send reads what the platform's
    push channel put in the inbox for that chat since the send began
    (`incomingSince`, `src/inbox/watch`, from `pending.jsonl`), and if they
    wrote, the rest is held and the answer leads with `>>> INTERRUPTED`:
    what they said and the lines not sent (`interruptedLines`). It holds for
    `log discord send`, `log slack send`, `log twitter dm` (old DMs and X
    Chat), the queue's dms and `log instagram send` (in its engine). What was
    sent stays sent, nothing is resent, and they are answered first (rule
    109). An agent following a conversation keeps a Monitor on
    `~/.logCli/inbox/pending.jsonl` so each push wakes it. Spec:
    `docs/specs/messageSplit.md` (REQ-SPLIT-08).

131. 2026-11-04 · matt: "WE NEED TO LOUDLY ALERT THAT THIS CANNOT HAPPEN
    ... WE CAN ONLY HAVE ONE PROCESS PER ACTUAL THING". On 2026-11-04 every
    watcher was running two or three times (X Chat for both X accounts,
    Discord and Slack): each new Claude session's hook started them again,
    the cleanup only killed the pid in `watch.pid`, which the new one had
    overwritten, and the doubled X watchers polled X's badge counts in
    bunches until X answered 429 on both accounts. One watcher process per
    account per platform, always, and every Claude session subscribes to it
    through the inbox (`pending.jsonl`), never by starting its own. Each
    watcher takes `watch.lock` (exclusive create, its pid) before it opens
    anything (`claimWatcher`, `src/inbox/watch`); a second one is refused
    with `watcherAlreadyRunning` and exits, and the refusal goes to
    `~/.logCli/inbox/alerts.jsonl`, which the inbox hook puts first in the
    agent's context (`>>> ONE PROCESS PER ACCOUNT, NEVER TWO`) to be told to
    matt. A dead holder's lock is taken over, only the holder releases it,
    the hook never starts a watcher while a live one holds the lock, and the
    stale-code cleanup stops the holder as well as the pid file's process.
    Tests run the Instagram engine inline (`LOG_INSTAGRAM_HOST=inline` in the
    preload) so they never leave a real session host behind. Spec:
    `docs/specs/agentHooks.md` (REQ-HOOKS-13).

132. 2026-11-04 · matt: "this is what I expect to happen with all
    platforms": a singleton primary with an exclusive lock and a
    multi-subscriber relay. On every platform (X Chat, Discord, Slack,
    Instagram) the first watch to take an account's `watch.lock` is its one
    owner (`ownOrAttach`, `src/inbox/relay`): it opens the platform's push
    connection, writes `session.json` (pid, hostname, started, a heartbeat
    every 5 s, status connecting, streaming, reconnecting or error, its relay
    port and token, and how many are attached), writes the inbox
    (`pending.jsonl`) as its only writer, and sends every event to every
    attached subscriber over its local relay (127.0.0.1, the token first).
    `log <platform> watch` is the attach command: when an owner is live, a
    watch attaches to its relay and streams the same events without opening
    anything, so the hooks, a Monitor, Codex or another agent all see one
    stream; an inbox watch (`--inbox`) that loses is refused loudly (rule
    131). An owner whose heartbeat is quiet for 60 s is stopped and alerted
    (`>>> ONE PROCESS PER ACCOUNT`, `hungOwner`), and the next start becomes
    the owner; when the owner closes, its session file goes with it.
    Spec: `docs/specs/agentHooks.md` (REQ-HOOKS-14).

133. 2026-11-04 · matt, to deepman: "whenever the agent wants to perform
    an action based on the streamed event information, it must first claim
    the relevant event ... only the session that successfully claims an
    event should be allowed to perform the corresponding action. Once the
    action has been executed through the state machine, the lock is
    released ... every time an action is executed, the system should also
    index and persist the associated information". Every message a push
    channel brings in has an event id (`eventIdOf`, shown in the hook's
    `>>> CLAIM BEFORE YOU ACT` beside who holds its chat). A session claims
    a chat before it drafts (`log inbox claim`, MCP `inboxClaim`, 10 minutes,
    renewed by claiming again; `claimChat`, `src/inbox/claims`, an exclusive
    claim file per chat, the session being its MCP server's process), and a
    second session is refused (`chatClaimedElsewhere`). Every send (`log
    discord send`, `log slack send`, `log twitter dm`, the queue's dms, `log
    instagram send`) claims the chat itself first (`guardSend`) and releases
    it once it is sent, interrupted or failed, so two sessions never answer
    the same chat. An X chat is one chat whether it is named by the person's
    id or the X Chat pair. A claim held by a session that ended, or past its
    time, frees itself. Every claim, renewal, refusal, send, interruption,
    failure and release is written to `~/.logCli/inbox/actions.jsonl`, read
    with `log inbox actions --chat <id>` (MCP `inboxActions`) before acting;
    `log inbox claims` lists who holds what. Spec: `docs/specs/agentHooks.md`
    (REQ-HOOKS-15).

134. 2026-11-04 · matt: "Yes, go", moving the inbox's state out of loose
    files into one SQLite database, `~/.logCli/log.db` (`LOG_DB` moves it;
    `src/inbox/store`, WAL, every write in a `BEGIN IMMEDIATE` transaction).
    The owner appends every event its push channel brings in to `events`
    with a sequence number, once (`appendEvent`, by its event id), and each
    session reads from its own cursor (`cursors`), so nothing is shown twice
    or lost between sessions; `pending.jsonl` is imported once and no longer
    written. An event type nobody has catalogued is stored with its raw
    payload and raised loudly (`unknownEventType`, `eventTypes`), to be named
    from rea, the docs and SubQ (rule one). The one owner per account
    (rules 131, 132) is a row in `owners` (pid, hostname, heartbeat, status,
    relay port and token, subscribers, a generation that rises with each new
    owner), never `session.json`, and a relay subscriber that falls more
    than 1 MB behind is dropped rather than slowing the owner. Claims (rule
    133) are rows in `claims`, each with its chat's next generation, and a
    send checks before every part after the first that its claim is still
    the one held (`stillHeld`); a session whose claim was taken over stops,
    and the rest is held. Every claim, send and release goes to `actions` in
    the same transaction as the change it records, with what was done in
    the chat before it (`stateBefore`), and what was done is searchable with
    the events (`searchIndex`, FTS5). Each event's moments are timed
    (`timings`: received, appended, relayed, claimed, actionStart,
    confirmed, indexed). Alerts are rows in `alerts`. Spec:
    `docs/specs/agentHooks.md` (REQ-HOOKS-16).

135. 2026-11-04 · matt (through his side session): missing context "is
    filled by catching up, never by every caller re-reading the client".
    Each account's owner keeps the platform's own last position in the .db
    (`positions`: X Chat's sequence id, Discord's last message id per DM,
    Slack's last ts per chat, Instagram's last activity). A gap opens
    (`gaps`: from, to, reason, status) when an owner takes over from a
    stopped or dead one (from its last heartbeat), when the first owner
    starts on an account that already has events (from the newest), or when
    the push channel drops. While a gap is open the account is behind, and
    one catch-up job inside the owner (`catchUpRunner`, `src/inbox/catchUp`)
    pulls only the delta through the account's own session and governor,
    paced like reads (0.8 to 2.5 s): X's delta sync after its saved sequence
    id, Discord's DMs after each one's saved message id, Slack's history
    after each chat's saved ts (`oldest`), and Instagram's threads active
    since its last activity. What it pulls is appended to `events` like live
    pushes, marked `source: catchUp`, and the gap closes. A send (Discord,
    Slack, X dm and the queue's sends, Instagram) waits up to 90 s for the
    account to catch up (`waitCaughtUp`) and never reads the platform
    itself; still behind, it is refused with `accountBehind`. A refused
    catch-up (a 429 or any refusal) stops, keeps the account behind, alerts
    (`catchUpRefused`), and nothing resumes until matt says so (rule 94).
    Discord's gateway RESUME is not used yet. Spec:
    `docs/specs/agentHooks.md` (REQ-HOOKS-17).

136. 2026-11-04 · matt: "these must be completed", with the direction that
    the context before a send comes from the .db, not from a fresh platform
    read. This changes rule 109's last read: right before each queued send,
    the run reads that person's messages both ways and what they did on the
    account's posts from the .db (`chatContextOf`, `src/inbox/context`),
    once the account has caught up (rule 135), and holds the item when
    anything happened since its draft, as before. X is not read for it. The
    platform is read only by the catch-up job, by backfill (history from
    before the push channel existed) and by discovery (unknown event types).
    Every owner stores the account's own messages (`ownMessage`) as well as
    theirs, and X's notifications arrive through the owner's badge poll
    (rule 115). Spec: `docs/specs/fullContext.md` (REQ-CONTEXT-04, 10).

137. 2026-11-04 · matt: keep every part of the voice gate ("necessary") and
    run it "as the whole voice process on the new .db", required inside every
    send, only at send time, scoped to that send, quiet; then "Yes, both" to
    jina-embeddings-v5-omni and the local media model. The voice gate is one
    step (`gateSend`, `src/cli/twitter/helpers/voice.ts`) inside `log discord
    send`, `log slack send`, `log twitter dm`, the queue's sends and `log
    instagram send`, after the account has caught up (rule 135) and before
    the chat is claimed (rule 133): a draft that fails is refused with
    `voiceGateFailed` whether or not `log voice` ran first, and in the X queue
    the item is held to be rewritten with `twitterQueueEdit`. All five checks
    stay: SubQ's read of matt's voice, the AI tells index with its reranker
    (rule 112), his own phrasing (rule 127), the watermark checker (rule 111)
    and the scrambler (rule 127). It reads the chat's context from the .db
    (rule 136), embeds it, ranks it against the moment being answered
    (cosine, then `jina-reranker-v3.5`) and gives SubQ the top moments in full
    (`rankedContext`, `thisConversationRankedForThisMoment`). Only embeddings
    are kept, in the .db (`embeddings`: the text's hash, model, dimensions and
    vector, each made once), with the AI tells index's phrase list and matt's
    baseline (`aiIndexes`); every result is worked out fresh for each send,
    never saved. Jina is `jina-embeddings-v5-omni-small` at 1024 dimensions
    (`text-matching`), and an index made with another model is rebuilt. The
    local embedder stays loaded in its process. A pass is one line; a fail
    names only what failed and why. Spec: `docs/specs/voiceGate.md`
    (REQ-VOICE-09 to 11), `docs/specs/aiTells.md` (REQ-AITELLS-05, 10, 12).

138. 2026-11-04 · matt: "a smaller local model" turns every piece of media
    into "a text representation", labelled with what it is, after a message
    went out answering only the text around a video someone sent; then "Yes,
    both" to downloading it. One media describer per machine (`log media
    describer`, `src/media/describer`), started by the inbox hook and locked
    like an owner (rule 131, a second is refused), loads
    `onnx-community/LFM2.5-VL-450M-ONNX` once (SubQ's pick, q4, on the
    transformers.js runtime log already uses) and keeps it warm. Every image,
    meme, gif and video a watch receives goes into the .db's `media` queue
    (`enqueueAttachments`). The describer takes one at a time, describes a
    video from three frames (ffmpeg), labels each description with its kind,
    stores it with its `jina-embeddings-v5-omni-small` vector, beats every 5
    s, and stops loudly past its memory ceiling (`describerMemory`). The
    queue holds 20 at most: past that, an item is marked not described yet
    and alerted (`mediaQueueFull`). Media with no description is shown as
    `[video clip.mp4 not described yet: …]` in the inbox hook and in the
    voice gate's ranked context, so nobody replies to it blind; a description
    reaches both in its place. Audio stays with AssemblyAI (rule 126). A
    file the platform engine hasn't saved locally yet is listed as not
    described, with why. `log media describe <path>` queues one local file,
    and `log media status` shows the queue. Spec:
    `docs/specs/mediaDescriber.md`.

139. 2026-11-04 · matt: "Yes, do it here", having the engines save the
    images and videos the describer needs (rule 138). Each platform engine
    keeps a local copy of every image, gif and video someone sends, fetched
    through the account's own session, at most 50 MB, in its media folder
    (`is_visual`, `python/platformKit/media.py`): Slack's watch through its
    authenticated session (`file_of`, `saved_visuals`), Instagram's
    realtime watch through instagrapi's private session on curl_cffi, never
    its plain-requests downloads (`media_ref_of`, `saved_media`, under the
    engine's one-call lock), and X Chat through the files its one session
    already decrypts and saves. Each watch passes the saved path with the
    attachment, so the describer gets it at once; a fetch that fails is
    listed with why. Discord's watch keeps them too (matt, "Yes, do it
    here", once its engine's uncommitted work was committed as his), for the
    messages that reach the inbox only (DMs, mentions and replies to the
    account), through its REST session as it already does for voice notes
    (`with_visuals`, `visual_file_of`). Spec: `docs/specs/mediaDescriber.md`
    (REQ-MEDIA-06).

140. 2026-11-04 · matt: "we're able to send reactions as well, across all of
    the clients. We need to be able to send reactions to messages as well."
    Every chat platform reacts to a message with an emoji through its own
    engine and its one session, never the browser: `log twitter react`,
    `log discord react`, `log slack react` and `log instagram react` (MCP
    `twitterReact`, `discordReact`, `slackReact`, `instagramReact`, each with
    its `…Live` twin), `--remove` taking the account's own reaction off. Each
    calls the platform's own reaction call: X's DM reaction mutation in
    `vendor/twikit` (an X Chat id is tried as the same pair, and X's answer
    decides), endcord's `send_reaction`, Slack's `reactions.add` (by name;
    the common emoji are turned into their names, `python/platformKit/reactions.py`)
    and instagrapi's `direct_send_reaction`. A dry run unless `--live` with
    `--approvedBy` (rule 8). The chat is claimed first and released after, as
    for a send (rule 133), the governor counts it as a write, the platform's
    answer decides (rule 73), and a refusal stops with nothing retried (rule
    94). `src/cli/react`. Spec: `docs/specs/reactions.md`.

141. 2026-11-04 · matt: "We're able to add people to a list, like the
    actual Twitter lists ... make a new Twitter list called Go-Getters". An X
    account's own lists are worked through its one session (rule 105) on
    vendor/twikit's list calls, sent with X's live operation ids (rule 113):
    `log twitter list show` lists them with their ids and member counts,
    `list create --name` makes one (a list of that name already there is
    answered as it is, never made twice), and `list add --list <name|id>
    --handle|--userId` puts one person on one (MCP `twitterList…`). create
    and add are dry runs unless `--live` with `--approvedBy` (rule 8), each a
    write the governor counts; X's answer decides (rule 73) and a refusal
    stops (rule 94). `src/cli/twitter/helpers/list.ts`. Spec:
    `docs/specs/xLists.md`.

142. 2026-11-05 · matt: "make it so that we can send audio, like upload
    natively into the platform, voice notes ... directly into the actual
    clients themselves ... we need to voice clone ourselves from audio ...
    it will then be an extension, like we have for the meme board stuff",
    with Fish Audio (hosted) his pick. A voice note only ever goes out when
    matt asks for one, in his cloned voice, as the platform's own voice
    note: never on the agent's own initiative and never any other audio.
    Fish Audio is an extension (`src/extensions/fishAudio`,
    `docs/extensions/fishAudio.md`): `log fish clone` makes his voice model
    once from the voice notes he sent himself (fromMe in the conversation
    store or his `ownMessage` in the .db; Discord voice messages and
    Instagram voice clips the engines kept, 10 to 60 s in all; nobody
    else's voice), a dry run listing them unless `--apply`, its id kept in
    `~/.logCli/voice/fishClone.json`; `log fish speak --text` says words in
    it to a file under `~/.logCli/voiceNotes` and sends nothing, on the free
    `s2.1-pro-free` model unless `--model`. `log discord voice`, `log
    instagram voice` and `log slack voice` take text only (an audio file is
    refused with `voiceNoteInvalid`), are dry runs unless `--live` with
    `--approvedBy` (rule 8), wait for the account to catch up (rule 135),
    run the text through the voice gate (rule 137), make it with the clone,
    convert it with ffmpeg (Discord ogg/opus, sent as a voice message with
    flags 8192, its waveform and duration; Instagram AAC in .m4a through
    instagrapi's `direct_send_voice`, its upload on curl_cffi under the
    one-call lock, rule 129; Slack AAC in .m4a through
    `files.getUploadURLExternal`, the upload on gabriel's curl_cffi
    transport and `files.completeUploadExternal`, rule 125), claim the chat
    (rule 133), count as a write, and stop on any refusal (rule 94). An
    engine sends only a file log made under `~/.logCli/voiceNotes`. X isn't
    built: twikit has no audio send and no vendored code or doc shows X's
    DM voice upload, so nothing is guessed. `src/cli/voiceNote`. Spec:
    `docs/specs/voiceClone.md` (was `fishVoice.md`).

143. 2026-11-05 · matt: "the voice cloning and the voice note stuff will be
    agnostic", after Fish Audio refused the clone without API credit (403,
    model creation limit 0/0) and he had none to put in. The voice layer is
    provider-agnostic, the way proxies are (rule 52): `src/extensions/
    voiceClone` holds one interface (its models, cheapest model, clone
    limits, the reference format it takes, clone and speak), and each
    provider is an extension of its own: `src/extensions/inworld` (the
    default: instant cloning free, about 70 free speech minutes, wav
    references 3 to 30 s, `inworld-tts-2-flash`, `INWORLD_API_KEY`) and
    `src/extensions/fishAudio`. The provider is `--provider`, else
    `LOG_VOICE_PROVIDER` in `.env.local`, else inworld. `log fish clone|speak`
    became `log clone voice|speak` (MCP `cloneVoice`, `cloneSpeak`); `log fish`
    is refused with the form it became (rule 63's pattern). Each provider's
    clone is kept in `~/.logCli/voice/clone.json`, keyed by provider, made
    once. `log discord|instagram|slack voice` take `--provider` and call only
    the shared layer, never a provider. Everything else in rule 142 holds.
    Spec: `docs/specs/voiceClone.md`.

144. 2026-11-05 · matt: "bro fuckign send th efuckign shit", after the voice
    gate refused three times the voice note he dictated to deepman word for
    word ("my phone screen is broken the phone is fine like theres two big
    green lines going down the side of it and that but it still works thank
    the lord"). The gate grades speech as typed text and as a reply (voice
    0.06 to 0.48, inContext 0.21), so it can't read a voice note in his own
    spoken words. `--mattsWords` on `log discord|instagram|slack voice`
    (MCP `mattsWords`) says the text is matt's own words, dictated by him
    for this voice note: the voice gate's SubQ read is skipped, and the AI
    artifact check (`watermarkReadingOf`) still runs and refuses
    `aiArtifacts`. Only when matt gave the exact words; words the agent
    drafted are always gated (rule 137). Sent live 2026-11-05 08:04 UTC,
    Discord message 1567811929500811294. Spec: `docs/specs/voiceClone.md`
    (REQ-VOICE-CLONE-10).

145. 2026-11-05 · matt: "Yes, re-clone it", because the Inworld clone was made
    with `languageCode` en-US, which pulled his voice towards an American
    accent, and he is Northern Irish. The voice is cloned and spoken in his
    accent: `LOG_VOICE_ACCENT` (`.env.local`, default Northern Irish) and
    `LOG_VOICE_LANGUAGE` (default en-IE, sent again as en-GB when Inworld
    answers `INVALID_ARGUMENT`). The clone sends that language, a
    description naming the accent and each sample's AssemblyAI transcript
    from `~/.logCli/transcripts` when there is one (none is paid for: TTS-2
    makes its own), and keeps the language Inworld accepted. `log clone voice
    --apply --replace` (MCP `replace`) makes it again over the old one, which
    stays in the clone file under `previous`, never deleted. Speech sends the
    clone's language; on `inworld-tts-2` the text starts with `[say it in a
    <accent> accent]`, an instruction Inworld removes before synthesis, and
    `inworld-tts-2-flash`, which ignores steering, gets none. Spec:
    `docs/specs/voiceClone.md` (REQ-VOICE-CLONE-11). (Its accent steer was
    replaced by rule 147, matt 2026-11-05.)

146. 2026-11-05 · matt: "the second one but why does it speak so slowly" and
    "use the discord audio for the samples". The clone speaks at
    `LOG_VOICE_SPEED` (`.env.local`, default 1.15, kept between 0.8 and 1.5),
    sent as Inworld's `speakingRate`, and a clone made on Inworld speaks with
    `inworld-tts-2` (the provider's `preferred` model, which takes emotion
    tags), not the cheapest. `log clone voice --from <file>[,<file>]` clones
    from recordings of matt's own that he names instead of his voice notes,
    each one's words read from a `.txt` of the same name beside it. Spec:
    `docs/specs/voiceClone.md` (REQ-VOICE-CLONE-12).

147. 2026-11-05 · matt: "ITS IRISH", none of the accent-steered clips
    sounded like him, "11_script_long272_b ... was pretty good", then "go
    through my voice notes ... analyse it", "it still doesn't have that
    distortion", and "op is real like op not o p ... make it the gate for the
    voice ... or it won't pass". A voice note sounds like his own voice notes
    and says what was written, measured both times:
    - **The clone** is Inworld instant cloning from one continuous 30 s of
      his own Discord voice note (`matt-long272_b`, 2:30 into his 4.5 minute
      note), the accent `Irish` (`LOG_VOICE_ACCENT`). No accent instruction
      is sent with the text: the clone carries the accent. On
      `inworld-tts-2` breaths are put in (`[breathe]` at the start and once
      at least 8 words have gone by, `withBreaths`).
    - **Shaped like his notes** (`processLikeMatt`,
      `src/extensions/voiceClone/helpers/realism.ts`), every number measured
      from five of his real Discord voice notes against the clone: phone
      squash (`dynaudnorm`), the phone mic's own tone curve measured from
      his notes (`REALISM.phoneCurve`: its low cut under 160 Hz, its dip
      around 2 to 3 kHz and its dull top over 5 kHz), his slow mic
      drift (1.9 dB), tone sway as the phone moves, phone-mic saturation on
      loud words, and his own room tone taken from the gaps in his own voice
      notes (never a sound effect), laid 22 dB under the voice so it lands
      where his do (30 to 33 dB). Seeded by the text, so the same words come
      out the same.
    - **Listened back** (`readSpoken`, `spoken.ts`): the shaped note is
      transcribed with AssemblyAI's word timings and lined up with the text.
      A word in the spoken lexicon (`SPOKEN_LEXICON`: `op` said as a word,
      written `OP` for the clone, since a lower-case `op` came out as "up")
      must be heard as itself, as one word under 400 ms; spelled out, heard
      as something else, or more than a quarter of the words different, and
      it is refused with `spokenMismatch`, naming what was heard. An acronym
      the lexicon doesn't have is refused before anything is spoken
      (`pronunciationUnknown`): how matt says it is never guessed. A note
      that can't be listened back is never sent (`spokenCheckFailed`).
    It runs in `log clone speak` and every `log discord|instagram|slack
    voice`. This replaces rule 145's accent steer. Spec:
    `docs/specs/voiceClone.md` (REQ-VOICE-CLONE-13, 14).

148. 2026-11-05 · matt: "send it in chinese aswell", then "ADD A BYPASS
    PERMISSION FOR IT BECAUSE OFC IT WONT MATCH UP", after the voice gate
    scored the Chinese translation of a voice note it had passed in English
    at 0.13: it compares a draft with matt's own writing, which is English.
    `--translationOf "<the original>"` on `log discord|instagram|slack voice`
    (MCP `translationOf`) says the text is a translation matt asked for: the
    voice gate grades the original words instead of the translation, both are
    read for AI artifacts, and it needs `--language <code>` (zh-CN, es-ES
    ...), the language the clone speaks it in instead of the clone's own
    (Inworld's `language`). With en-IE the clone said the Chinese with two
    words wrong; with zh-CN it said them right. It is only for a translation
    matt asked for, never paired with `--mattsWords`. The listen-back check
    (rule 147) reads Chinese, Japanese and Korean one character at a time
    (`wordsOf`), so a translated note is checked too. Spec:
    `docs/specs/voiceClone.md` (REQ-VOICE-CLONE-15).

149. 2026-11-05 · matt: "it keeps doing this weird exhale at the beginning
    ... the lengths of the things are always like 5 seconds", then "READ THE
    CONVERSATION ... I'M ASKING YOU TO RESPOND AT LENGTH ... BUILDING ON
    WHAT HE'S SAYING AS A 40 SECOND VOICE NOTE IN ENGLISH, YET YOU'RE JUST
    RE-EXPLAINING SOMETHING I ALREADY SAID". Three things:
    - **No breath at the start.** `withBreaths` never opens a note with
      `[breathe]` (that was the exhale). A breath goes in only between
      sentences (`.!?` and the Chinese `。！？`), after a gap of 8 to 18
      spoken words drawn from the text's own seed (`BREATH_WORDS`; a
      Chinese character counts half), so no two notes breathe alike.
    - **The pace drifts.** Each note is spoken at `LOG_VOICE_SPEED` moved by
      up to 7% from its text's seed (`paceOf`, `PACE_JITTER`), within the
      speed range.
    - **A voice note is written at the length matt asks for and builds on
      the whole conversation.** Read the whole chat first, then write to
      the length asked (a 40 s note is about 100 to 110 words), taking what
      they are talking about further and adding to it, never re-explaining
      what matt already told them. Note lengths vary: not every note is
      three short lines. The voice gate grades a voice note as spoken
      (`spoken`, set by every `log discord|instagram|slack voice` and by
      `log voice --spoken`): its length and punctuation never count against
      it, `offProfile` (his typed habits in the chat) isn't applied, and a
      new question, `buildsOn` (0.7 to pass), refuses a note that repeats
      what matt already said or ignores what they are talking about. Its
      voice question reads how matt actually talks first: the transcripts of
      his own voice notes from before the clone existed (`howMattTalks`,
      `mattsOwnVoiceNotes`), never his typing alone and never a note the
      clone made.
    Spec: `docs/specs/voiceGate.md` (REQ-VOICE-13),
    `docs/specs/voiceClone.md` (REQ-VOICE-CLONE-16).

150. 2026-11-05 · matt: "Yes, resume both", after the catch-up on
    matthewsoldit (X Chat's PIN unlock, Juicebox "Transient error") and on
    Discord was refused and every send was held with `accountBehind`. Rule 94
    said nothing resumes until matt says so, but nothing could take his word.
    `log inbox resume --platform <p> --account <a> --by matt` (MCP
    `inboxResume`) is that word: a refused gap opens again with who resumed
    it and what was refused before (`resumeGap`, alert `gapResumed`), and the
    owner, which now looks at its gap every 30 s (`RECHECK_GAP_MS`), catches
    up again through its own session. Only when matt says so, never on the
    agent's own; a second refusal stops it again. And so the X voice note can
    be read from X's own client (rule 113), `log twitter session webClient`
    also saves X Chat's own app, which x.com only frames: it reads
    `chat.x.com/embed-v1.json`, the build's `remoteEntry.js` and every script
    the manifest lists (English only), spaced as reads through the one
    session, into the save's `xchat/` folder (`save_xchat_build`). Spec:
    `docs/specs/agentHooks.md` (REQ-HOOKS-18), `docs/specs/xSession.md`
    (REQ-XSESSION-15).

151. 2026-11-05 · matt: "build the voice nots on X from X's own client so
    we'll figure out how it's done via the bundle itself ... and then we'll
    add it into the vendor itself", then "Yes, build it". An X voice note is
    an X Chat voice message, sent the way X Chat's own app sends one, read
    from its own code: `log twitter session webClient` now saves X Chat's
    whole app, following each script's imports (rule 150), so its engine,
    `dm-core` (Kotlin compiled to JS), is saved too. In it: the recorder makes
    `audio/mp4`; the file is encrypted with the conversation key
    (chat-xdk `encrypt_stream`); `InitializeXChatMediaUploadMutation`
    (`6M543IPabOfZm7-yyIczdw`) answers a `media_hash_key` and `resume_id`; the
    parts are POSTed as `application/octet-stream` to
    `ton.x.com/i/ton/data/xchat_media/<conversation>/<media_hash_key>?concurrent=true&resumeId=<id>&partNumber=<n>`
    from 0; `FinalizeXChatMediaUploadMutation` (`3O4jPQ2hwW9LbqCc-wFmqA`) closes
    it; and `SendMessageCreateMutation` (`TWRPP7gnKwV_R8-tE-Dd3Q`) sends chat-xdk's
    `encrypt_message` (its `encrypted_content` and `encoded_event_signature`)
    with one attachment, media type AUDIO (4) and `duration_millis`. This is in
    `vendor/twikit` (`xchat_latest_key`, `upload_xchat_media`,
    `send_xchat_message`, `send_xchat_voice`; the operations in
    `client/gql.py`), so twikit can now send in X Chat. `log twitter voice
    --account <a> --with <handle|id> --text "…"` (MCP `twitterVoice`,
    `twitterVoiceLive`) is the voice note command on X, the same as on Discord,
    Instagram and Slack (rules 142 to 149): made in matt's cloned voice, AAC in
    .m4a, gated, claimed, a dry run unless `--live` with `--approvedBy`, and
    sent by the engine action `xchatVoice` through the account's one session,
    X Chat opened with the saved PIN (rule 88; `xchatPinMissing` when there is
    none). The engine sends only a voice note log made under
    `~/.logCli/voiceNotes`. chat-xdk mints the message's own id, so the upload
    carries an id of its own, as X's official upload takes none. This
    replaces rule 142's "X isn't built". Spec: `docs/specs/voiceClone.md`
    (REQ-VOICE-CLONE-09), `docs/specs/xChat.md` (REQ-XCHAT-11).

152. 2026-11-05 · matt: "Send it anyway", after the voice gate inside `log
    twitter dm` refused a short dm to @AjeetVermai that he had asked for. The
    gate inside every send (rule 137) had no way to take his word over it.
    `--overGate` on `log twitter dm` (MCP `overGate`) is that word: the gate's
    SubQ read is skipped for that dm, and the AI artifact check still runs and
    refuses `aiArtifacts` (rule 111). Only when matt said to send that exact
    message over the gate's refusal, never on the agent's own, and never for a
    queue. The send says it went over the gate. The same day the gate found a
    person named only by user id by their handle (`handleOfUserId`), so it reads
    their chat. Spec: `docs/specs/voiceGate.md` (REQ-VOICE-14).

153. 2026-11-05 · matt: "say idk to matt in the groupchat", then "Yes, wire
    it". log sends text into an X Chat group: `log twitter dm --userId
    g<digits>` (the group's id) goes to the engine, which opens X Chat with the
    account's saved PIN and sends it with twikit's `send_xchat_message`
    (`xchat_group_text`), the way X Chat's own app sends (rule 151). With no PIN
    it is refused `xchatPinMissing`. A person's id must still be digits, and
    only a dm takes a group id. `log twitter voice --with g<digits>` sends a
    voice note into the group the same way, and it was sent there live on
    2026-11-05. X Chat ties a media upload to the message that carries it: the
    upload and the message share one message id (chat-xdk's `encrypt_message`
    takes `message_id`, rebuilt into `vendor/chatXdk/wheels`), Initialize is sent
    without a content type, and each part is posted to the `resume_upload_url`
    Initialize answers, as raw `application/octet-stream` with the bearer, the
    `auth_token` and `ct0` cookies and the CSRF token (stephancill/stupid-social's
    working client). Building the URL ourselves was refused 401 every time. Spec:
    `docs/specs/xChat.md` (REQ-XCHAT-12).

154. 2026-11-05 · matt: "no ever showing me UUIDs". Nobody is ever shown to
    matt as an id, on any platform: every person in a list, a thread, a hook
    line or a write-up is named by their username (and display name where the
    platform has one). An id with no name is looked up through the account's
    own session before anything is shown (X's user lookup, Discord's, Slack's
    and Instagram's own), the name is kept so it is never looked up twice, and
    one that still can't be named is listed with why, never shown as the bare
    id. On X, `name_people` names every person in the inbox list from any
    conversation that already knows them or from X's lookup, and
    `remember_handles` keeps them; twikit reads a user's name from X's newer
    `core` block. A platform isn't done until its lists name everyone. matt
    then: "make it as part of the state machine". Naming is a stage of every
    event's life in the inbox (`named`, between appended and relayed): an
    event that names its sender teaches the .db's `people` table who that id
    is (`rememberPerson`), an event that arrives with only an id is named from
    it (`personOf`) before it is stored, and every label read back for matt
    goes through `namedLabel`, which never returns an id: one nobody has named
    yet reads "someone not named yet". Spec: `docs/specs/xChat.md`
    (REQ-XCHAT-13), `docs/specs/agentHooks.md` (REQ-HOOKS-19).

155. 2026-11-05 · matt: "who the fuck is it reading to ... we need a context
    for the voice notes as well, like we do for the sends, across all of the
    voice notes, a unified system", after a voice note for the #general
    channel of paulchrisluke's server was written to Paul ("you just got back
    on X") when nobody but matt had typed there since 11 October; and "it
    hasn't got any context, it doesn't show what channel it's in". Three
    things:
    - **The room.** Every send and voice note gives the voice gate the same
      picture of where it goes (`roomOf`, `src/voice/room`): the chat's kind
      (a DM, a group, a server channel), who else has spoken in the last 24
      hours, when the last of them did, how many of matt's messages end the
      chat, and who it must be addressed to (`addressTo`). Discord reads the
      chat's last 20 messages through the engine for it (`roomFromRead`,
      inside the gate, `readRoom`); every other platform builds it from the
      chat in the .db. SubQ reads it as `theRoom` and answers `fitsTheRoom`
      (0.7 to pass): a channel or group where nobody else has spoken lately
      is talked to as a whole, never one person as if they were mid-talk.
    - **Chats by name.** A Discord, Slack or Instagram tool call that names
      its chat by a bare id is refused by a PreToolUse hook
      (`scripts/hooks/chatNames.ts`, `chatNameVerdict`) and told to pass the
      name, so matt sees where every call goes: a person, a group, or a server
      channel as "<server> #<channel>".
    - **Servers are found, never asked for.** The Discord watcher saves every
      server and text channel the account is in from the gateway's READY
      (`save_servers_from`), and the chat list includes them, so "paulchrisluke
      #general" is matched like a DM. A cold read of the list reads each server
      1.5 s apart and skips one that doesn't answer.
    Spec: `docs/specs/voiceGate.md` (REQ-VOICE-15), `docs/specs/agentHooks.md`
    (REQ-HOOKS-20).

156. 2026-11-05 · matt: "let's do some cold outbound sending them their
    tweets then send a voice note after like a real brief one and then just
    literally lock that in". Cold outbound on X is two touches through the
    account's one queue (rules 104, 107): first the opener (their own recent
    tweet forwarded, then one line about it, rule 98), then a brief voice
    note in matt's cloned voice that goes one step further, a question about
    what they posted, never the ask. The voice note is a queue action of its
    own, `voice` (`QUEUE_ACTIONS`, `toAPerson`): its text is said with the
    clone (`voiceNoteDeps.render`), gated as speech (`spoken`), and sent as an
    X Chat voice message by the engine's `xchatVoice` with the saved PIN
    (rules 151, 153), its chat claimed like a dm (rule 133). A dm or voice
    item keeps the tweet it opens on (`postText`), and the send-time gate
    judges it against that tweet (`said`), as it does a reply's. The voice
    notes go into the same queue once the openers have gone out, so each
    lands after its own opener. Targets come from the niche map: mutuals
    under 1500 followers with a recent original post, not already talked to
    (rules 99, 121, 87). Spec: `docs/specs/xQueue.md` (REQ-QUEUE-16).

157. 2026-11-07 · matt: "a lot of the time I notice this whenever you make a
    queue, all of the things and the messages in the thing are exactly the
    same ... if you put a haha and you say that and then it reads like me",
    and "the guides are not being consistently called for actions ... it's
    meant to re-inject the context into it so then it guides it in the right
    way". On 2026-11-07, 32 share-asks went out from @matthewsoldit: the 18
    to people he talks to each ended "just put this out <link> / could you
    share it its open sourced haha" with only the first line changed, and 14
    new followers got one line word for word, while the play he meant (reply
    to their post with a meme, forward that post as the opener, wait, build on
    what they say, then the ask) was never loaded. Two things:
    - **No two messages read alike.** A send is refused with `sameAsSent` when
      half or more of its word pairs (links left out) are already in a message
      the account sent anyone in the last 24 hours, read from the .db
      (`sameAsSent`, `src/voice/sameness`), and `queue check` refuses a queue
      item that repeats an earlier item the same way. The voice gate reads
      each message alone, so a "lad" and a "haha" passed a run of near-copies;
      this runs before the gate, so `overGate` doesn't skip it.
    - **The play stays in context.** Loading a use case with `getGuide({
      useCase })` makes it the MCP session's play: every log tool's answer
      ends with the step it is and the step that comes next, from the page's
      own steps table, and one the play doesn't use says so
      (`src/mcp/server/helpers/activePlay.ts`). A send as matt
      (`twitterDmLive`, `twitterReplyLive`, `twitterQuoteLive`,
      `twitterQueueRunLive`, `twitterVoiceLive`, `discordSendLive`,
      `slackSendLive`, `instagramSendLive`) is refused with `playMissing`
      while no play is loaded, naming the use cases that call it.
    Specs: `docs/specs/voiceGate.md` (REQ-VOICE-16), `docs/specs/mcpServer.md`
    (REQ-MCP-15).

158. 2026-11-07 · matt: "how do the guides get CALLED when I say something
    ... do i have to invoke it or is it inferred", then "we need to have a
    context engine ... one command that installs all of the skills ... the
    use cases need to be injected as well ... you don't even try to look ...
    you don't try to search ... I need to have variations". A use case was
    only ever found if the agent thought to look. Now it is put in front of
    it three ways:
    - **Every use case is a skill.** `bun run skills:build`
      (`scripts/docs/syncSiteSkills.mjs`) turns each
      `docs/useCases/<platform>/<page>.md` into the skill
      `log-<platform>-<page>`: its description is the page's title and lead,
      its `when_to_use` is the page's own "How the owner asks for it" (the
      title when a page has none, never words matt didn't say), and its body
      says to load the play with `getGuide({ useCase })` first (rule 157).
      They are written to `.claude/skills/` (so a session in this repo has
      them) and published at `/.well-known/skills/`, and `install.sh --skills
      all` (`--skillsOnly` for someone who already has log, `LOG_SKILLS=all`
      on Windows) installs every one. `check:siteSkills` refuses a skill out
      of step with its page.
    - **The prompt is matched to a play.** A UserPromptSubmit hook
      (`scripts/hooks/useCases.ts`, `matchPlays` in `src/useCases/router`)
      compares matt's message with every page's asks and title by content
      words, and when one scores 0.6 or more it puts `>>> PLAY MATCH` in the
      agent's context, naming the play (and a runner-up) and saying to load
      it with `getGuide` before anything else. Nothing is said when nothing
      matches.
    - **A refusal says where to look.** When the voice gate or `sameAsSent`
      refuses a draft, the refusal ends with the steps to rewrite it from
      evidence, not memory (`rewriteSteps`, `src/cli/twitter/helpers/voice.ts`):
      `voice` with no text for that person's thread and matt's real replies,
      `search` for what he has said on it before, then a draft unlike
      anything sent today.
    Specs: `docs/specs/mcpServer.md` (REQ-MCP-16), `docs/specs/voiceGate.md`
    (REQ-VOICE-17).

159. 2026-11-07 · matt: "we've got naming conventions, yet we don't have
    hook conventions ... someone's already made a router ... we need to be
    able to benchmark the re-injection ... a lean, fast P99, P95 injection
    layer ... I type very quickly with spelling mistakes". Before this, the
    word router from rule 158 matched 8% of his real prompts, mostly wrongly.
    It also fired on task notifications, and 8 `bun` hooks ran on every
    prompt (210 to 520 ms each). Now the context layer has conventions
    (`docs/contextLayer.md`) and runs as one service:
    - **One warm service per machine.** `scripts/contextLayer/service.ts`
      (`src/contextLayer/service`) keeps MiniLM and the route index loaded on
      `127.0.0.1:47317` (`LOG_CONTEXT_PORT`). The per-prompt hook is one curl
      to it (`service` on an `AgentHook`, `serviceHookCommand`), and the `bun`
      script after `||` only starts the service.
    - **The router hears typos.** It follows aurelio-labs/semantic-router's
      method (`src/useCases/router`):
      - each word is corrected against the playbooks' own vocabulary
        (`correctTypos`, one edit from 4 letters, two from 8);
      - a long prompt is read as overlapping 14-word windows;
      - each play is scored on its 5 closest asks, his own labelled prompts
        among them;
      - 70% meaning, 30% words.

      At 0.63 and above it names the play (`>>> PLAY MATCH`). From 0.4375 it
      lists the 3 closest, and the agent says which it follows or "none"
      before any tool (`>>> MAYBE A PLAY`). Below that it says nothing. Task
      notifications and system text are never routed (`isPrompt`).
    - **The play comes back after compaction.** SessionStart (`startup`,
      `resume`, `clear`, `compact`) reads the session's own transcript for the
      last play it loaded and the last step it ran (`sessionPlayOf`), then
      puts it back with each step marked done or to do (`>>> ACTIVE PLAY`,
      `playReminder`).
    - **Benchmarked, never assumed.** `bun scripts/useCases/benchRouter.ts`
      scores the router 5-fold on matt's 420 labelled prompts
      (`~/.logCli/contextLayer/labelledPrompts.json`, kept on matt's machine and never committed because the repo is public: his words, typos
      kept, 107 plays and 313 "none"). It reports plays caught, wrong fires on
      "none", the right play in the top 3, and p50/p95/p99. On 2026-11-07:
      - the old word matcher caught 21% of plays and fired wrongly on 7.3%;
      - the router caught 23% at 2.9% wrong fires, and had the right play in
        its top 3 for 64%;
      - p50/p95/p99 were 12/36/47 ms in the service, and the hook took 26 to
        43 ms end to end.

      Every hook writes a timing line to
      `~/.logCli/contextLayer/timings.jsonl`. A change that lowers plays
      caught or breaks the budget doesn't ship.
    Spec: `docs/specs/mcpServer.md` (REQ-MCP-17).

160. 2026-11-07 · matt: "it keeps rereading all of my conversations on
    social media. It shouldn't ever call that ... that's meant to read from
    the database ... If it needs to read it, it re-indexes and plays catch
    up ... or it's routed into just reading directly against the database,
    which achieves P99". On 2026-11-07, `discordRead` took p50 91 s and
    `twitterDms` p50 11 s (p95 69 s). Both went to the platform on every
    call, and every Discord lookup by name listed all its chats first, while
    each account's owner was already keeping the .db current. Now a read
    for one chat or person decides where its answer comes from
    (`readSourceFor`, `src/inbox/dbRead`):
    - **the .db,** when the owner is live, the account has caught up, and
      the chat has been backfilled once (`markBackfilled`) or the .db holds
      as many messages as asked for;
    - **the platform, once, to fill the .db,** when the chat was never
      backfilled, when no owner is live, or for a Discord server channel,
      which the watcher keeps only mentions and replies from;
    - **a refusal, never a platform read,** when the catch-up was refused
      (rule 94).

    `log discord read` and `log twitter dms --with` work this way. The X
    read decides before the X session is opened, and `--full` or `--force`
    still reads X. A Discord chat named by its name is found in the kept
    chat list (`findInChatList`, fresh for 6 hours), and Discord is listed
    only for a name the list doesn't have: read, send, delete, react and
    voice. Every read says where its answer came from. On the top 20 chats:
    - Discord from the .db: p50/p95/p99 of 0.6/1.7/2.6 ms, 12 of 20 already
      answerable;
    - X from the .db: 25/33/40 ms, 3 of 20 already, and each other one
      after its first read.

    `bun scripts/inbox/benchDbRead.ts` measures it. Spec:
    `docs/specs/fullContext.md` (REQ-CONTEXT-11).

161. 2026-11-07 · matt: "why isnt it faster ... its just sitting there on
    1m 23s", then "Yes, fix all three". A two-line Discord send to Luke took
    46 s, measured from the live log:
    - the gate read the chat from Discord for its picture of the room (3 s);
    - SubQ gated a draft that had just passed (3 s);
    - the second line went out 33 s after the first, because the send's
      8 s line gap was followed by the account's governor drawing its own
      lognormal gap (mean 12 s, long tail) before the same request.

    Now:
    - **The room comes from the .db.** On a Discord DM or group whose .db is
      current (rule 160), the gate's room is built from `chatMessages`, not
      read from Discord.
    - **A fresh pass isn't asked for again.** A pass is kept by the draft's
      exact text (`recordPass`, `src/voice/passes`), from `log voice` or a
      send. The send gate reuses it (`recentPass`) when it is under 10
      minutes old and nothing has come in on the chat since. The sameness
      check still runs every time.
    - **The line gap is the gap.** Every line after the first goes as a
      continuation (`continuesSend`). For it, the governor
      (`python/platformKit/engine.py`) draws at its 4 s floor instead of
      its 12 s mean. Its floor, hourly, daily and write caps, its cooldown
      and rule 94's stop on any refusal stay exactly as they are, and the
      first line keeps the full gap.

    Spec: `docs/specs/messageSplit.md` (REQ-SPLIT-09),
    `docs/specs/voiceGate.md` (REQ-VOICE-18).

162. 2026-11-07 · matt: "sometimes what you're doing is giving out a task.
    It's not the same thing as like casually talking with someone ... those
    way of doing it is rude. It's not clear. It's not informative", then
    "make a document, send the documents over ... We need to maybe make
    that". Two things:
    - **A task is a brief.** A message that hands someone work goes with
      `--brief` (MCP `brief`) on `log discord send`, and the gate reads it as
      a brief instead of matt's chat voice (`gateBrief`, `readBrief`,
      `src/voice/brief`). SubQ answers five questions, each 0.7 to pass:
      `clear` (what to do, in order, any term explained), `why` (what the
      work is for), `doneWhen` (what they hand back and by when), `kind`
      (warm and informative in matt's register, never curt, bossy or a bare
      order) and `steerable` (how to ask or say they're stuck), plus
      `fitsTheRoom`. It reads the chat's ranked moments and the attached
      files beside the draft. The sameness check and the scrambler still run.
    - **Files go with it.** `--file <path>[,<path>]` (MCP `file`) attaches
      files to the last message, uploaded through the account's own session
      (endcord's attachment upload, `attached_files`,
      `python/discordApi/engine.py`): only files under OUTBOX or ~/.logCli,
      at most 10 MB each, else `fileRefused` before anything is sent.
    The same day, the Discord and Slack catch-up stopped reading the .db's
    backfill markers (`backfill:<chat>`) as chats to catch up.
    Spec: `docs/specs/voiceGate.md` (REQ-VOICE-19).

## Checks

- Run `bun run check` before pushing: no comments (rule 70), naming gate, the spec gate on SubQ (rule 117), `tsc --noEmit`, `bun test`.
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
  (`marketplace/connect`) driving `python/session/connectSession.py` one step at a
  time, like publish. Tests inject `worker` and `connectSession` into the
  context and never launch a browser.
- Read-only on Facebook, except `connect`, which only signs in and saves a session, and
  `log publish --live` (rule 10). Don't add editing or deleting without matt
  asking.
- Cookies, browser storage, proxies, devices and 2FA secrets live in Twenty
  only. A run writes the account's proxy, device file and session
  (cookies + localStorage) to a private temp folder for the Python
  (`browser/run`) and deletes it afterwards. After the run the session the
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
  pre-commit runs the log gate (rule 5, `skills/commitLog/SKILL.md`);
  pre-push runs naming, typecheck, tests and the Facebook client docs gate
  (rule 27). Never `--no-verify`.
