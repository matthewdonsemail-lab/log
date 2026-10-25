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

Status 2026-10-19: built: step 5 per request (`log capture --docs`,
`docs/platforms/facebook/`, rule 27: syntax-tree slices, rea about 4 s each),
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
    quick swipes. Save, follow and share aren't built.
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
54. 2026-10-20 · matt: a known state is resolved, never a reason to stop.
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
    acts on the NEW rows from the same account (not built yet). log-cli writes
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

## Checks

- Run `bun run check` before pushing: no comments (rule 70), naming gate, `tsc --noEmit`, `bun test`.
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
  pre-commit runs the `log.md` gate (rule 5, `skills/commitLog/SKILL.md`);
  pre-push runs naming, typecheck, tests and the Facebook client docs gate
  (rule 27). Never `--no-verify`.
