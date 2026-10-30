# facebookGroups

Facebook groups: joining and answering their questions, reading posts and members, and serving OpenMagpie's polls.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "facebook/groups" })` | Listening to local Facebook groups | see the page |

## The tools in this guide

| Tool | What it does |
|---|---|
| `join` | Join a Facebook group as one account, in its open browser |
| `joinLive` | Join a Facebook group as one account, in its open…, live on Facebook |
| `readGroup` | Read a Facebook group's new posts and the comments of the new posts… |
| `readGroupLive` | Read a Facebook group's new posts and the comments of…, live on Facebook |
| `readMembers` | Read a Facebook group's newest members |
| `poll` | Poll a Facebook group from one account, in its open browser, for a… |

## Every tool, in full

### `join`

log facebook join group --account <a> --group <g> [--live] | --show | --answer [--set n=v]... [--agree] | --fill [--live [--submit]] [--bypass] [--json]
Join a Facebook group as one account, in its open browser: read the gate, --live presses Join; every step patches agencyGroups.joinSubmission (rule 45)
Usage: log facebook join group --account <accountName> --group <group url, id or name> [--live] [--json]
       log facebook join group --account <accountName> --group <g> --show
       log facebook join group --account <accountName> --group <g> --answer [--set <n>=<value>]... [--agree]   (Clack steps over the group's questions, or the same answers given here; saved to Twenty, never sent)
       log facebook join group --account <accountName> --group <g> --fill [--live [--submit]]   (the draft into the group's dialog, step by step)
Every step in the browser runs inside the account's local hours (rule 18); --bypass skips that for one run, only when matt asked (rule 20).
The account's browser must be open (log inspect start --account <a>, or log facebook host start): a join is a step in it (rule 35).
Needs the account's browser open first: inspectStart { account, detach: true }. Then, in order:
1. join group --account <a> --group <url|id> : reads the group page (Facebook's viewer_join_state from the page itself), clicks nothing. Run again later to check pending → accepted.
2. joinLive: join group … --live (confirmLive) : presses Join; the questions, rules and join path go to agencyGroups.joinSubmission.options.
3. join group … --answer --set 1=<option label or text> --set 2=… --agree : the answers (the Clack stepper needs a terminal; --set is the same over MCP). Saved to Twenty, not sent.
4. join group … --fill (dry run), then joinLive: --fill --live --submit (confirmLive) : the answers into the group's dialog, Submit confirmed by Facebook (QUESTIONNAIRE_COMPLETED). --show reads the row at any time.
Pass the arguments after the command name in `args`, e.g. ["--json"]. It never takes --live: that is `joinLive`. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/groups" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookGroups" }) (Facebook groups: joining and answering their questions, reading posts and members, and serving OpenMagpie's polls).
AGENTS.md (log://agents): rules 8, 10, 18, 20, 25, 26, 29, 35, 45, 64, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `joinLive`

log facebook join group --account <a> --group <g> [--live] | --show | --answer [--set n=v]... [--agree] | --fill [--live [--submit]] [--bypass] [--json]
Live on Facebook: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Join a Facebook group as one account, in its open browser: read the gate, --live presses Join; every step patches agencyGroups.joinSubmission (rule 45)
Usage: log facebook join group --account <accountName> --group <group url, id or name> [--live] [--json]
       log facebook join group --account <accountName> --group <g> --show
       log facebook join group --account <accountName> --group <g> --answer [--set <n>=<value>]... [--agree]   (Clack steps over the group's questions, or the same answers given here; saved to Twenty, never sent)
       log facebook join group --account <accountName> --group <g> --fill [--live [--submit]]   (the draft into the group's dialog, step by step)
Every step in the browser runs inside the account's local hours (rule 18); --bypass skips that for one run, only when matt asked (rule 20).
The account's browser must be open (log inspect start --account <a>, or log facebook host start): a join is a step in it (rule 35).
Needs the account's browser open first: inspectStart { account, detach: true }. Then, in order:
1. join group --account <a> --group <url|id> : reads the group page (Facebook's viewer_join_state from the page itself), clicks nothing. Run again later to check pending → accepted.
2. joinLive: join group … --live (confirmLive) : presses Join; the questions, rules and join path go to agencyGroups.joinSubmission.options.
3. join group … --answer --set 1=<option label or text> --set 2=… --agree : the answers (the Clack stepper needs a terminal; --set is the same over MCP). Saved to Twenty, not sent.
4. join group … --fill (dry run), then joinLive: --fill --live --submit (confirmLive) : the answers into the group's dialog, Submit confirmed by Facebook (QUESTIONNAIRE_COMPLETED). --show reads the row at any time.
Pass the arguments after the command name in `args`, with --live. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/groups" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookGroups" }) (Facebook groups: joining and answering their questions, reading posts and members, and serving OpenMagpie's polls).
AGENTS.md (log://agents): rules 8, 10, 18, 20, 25, 26, 29, 35, 45, 64, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `readGroup`

Read a Facebook group's new posts and the comments of the new posts, on the direct-API engine first (no browser) or else in the account's open browser; only the group's cursor is saved to Twenty.
Read a Facebook group's new posts and their comments, or its newest members, as one account, by hand: posts on the direct-API engine first, else in its open browser; only the group's cursor is saved to Twenty (#27, rule 65), the members to a file
log facebook read group --account <accountName> --group <group url or id> [--scrolls <n>] [--commentPosts <n>] [--live] [--bypass] [--json]
log facebook read group --account <accountName> --group <g> --show [--json]
Reads the group's new posts (since its cursor in Twenty) and the comments of the new posts that have some. Only the cursor is saved to Twenty (rule 65); --show prints it.
Without --live, on a numeric group id, it runs on the direct-API engine first (fbk groups.feed_read, no browser) when the account has a saved session and a proxy in its home country: Facebook's own page decides, not accountStatus (loggedIn reads; checkpoint stops and deactivates; anything else hands over to the browser). The result goes to socialAccounts.sessionState.
--scrolls: feed scrolls at most (default 6). --commentPosts: posts whose comments are read at most (default 5; 0 reads none).
--worker (OpenMagpie's call) is refused here: it became its own command, log facebook poll (its usage).
--live: each post's comments are switched to Newest first (two clicks, rule 8); without it nothing is clicked and the page's Most relevant comments are read.
Every step in the browser runs inside the account's local hours (rule 18); --bypass skips that for one run, only when matt asked (rule 20).
On the browser path the account's browser must be open (log inspect start --account <a>, or log facebook host start): a read is a step in it (rule 35).
Reads the group's newest members from its People tab (/groups/<g>/members) in the account's open browser: the page's first 10, then a scroll at a time, each scroll's GroupsCometMembersPageNewMembersSectionRefetchQuery answers (about 10 members each, 2 a scroll). Nothing is clicked (rule 8).
--count: members to read (1-5000). --secondsPerScroll: the wait before each scroll (default 15; matt: the time 40 scrolls take is a variable). --maxScrolls: scrolls at most (default twice the plan's, plus 2). It says up front: count N → ~S scrolls, ~M min at Xs per scroll.
It stops at --count members, when the list ends (has_next_page false) or at --maxScrolls. --owners keeps only owners: a bio naming owner, co-owner, founder, CEO, president, proprietor or self-employed, or a page (a category set).
The members go to ~/.logCli/members/<group>/<run time>.tsv and .json, never to Twenty; it prints how many, how many with a bio, owners and pages, and the files. --json gives them.
Fill the named fields; each value goes through whole. `bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked. What acts on Facebook is `readGroupLive`.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/groups" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookGroups" }) (Facebook groups: joining and answering their questions, reading posts and members, and serving OpenMagpie's polls).
AGENTS.md (log://agents): rules 8, 13, 18, 20, 22, 25, 26, 29, 35, 45, 54, 63, 64, 65, 73, 77, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `readGroupLive`

Read a Facebook group's new posts and the comments of the new posts, on the direct-API engine first (no browser) or else in the account's open browser; only the group's cursor is saved to Twenty.
Live on Facebook: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Read a Facebook group's new posts and their comments, or its newest members, as one account, by hand: posts on the direct-API engine first, else in its open browser; only the group's cursor is saved to Twenty (#27, rule 65), the members to a file
log facebook read group --account <accountName> --group <group url or id> [--scrolls <n>] [--commentPosts <n>] [--live] [--bypass] [--json]
log facebook read group --account <accountName> --group <g> --show [--json]
Reads the group's new posts (since its cursor in Twenty) and the comments of the new posts that have some. Only the cursor is saved to Twenty (rule 65); --show prints it.
Without --live, on a numeric group id, it runs on the direct-API engine first (fbk groups.feed_read, no browser) when the account has a saved session and a proxy in its home country: Facebook's own page decides, not accountStatus (loggedIn reads; checkpoint stops and deactivates; anything else hands over to the browser). The result goes to socialAccounts.sessionState.
--scrolls: feed scrolls at most (default 6). --commentPosts: posts whose comments are read at most (default 5; 0 reads none).
--worker (OpenMagpie's call) is refused here: it became its own command, log facebook poll (its usage).
--live: each post's comments are switched to Newest first (two clicks, rule 8); without it nothing is clicked and the page's Most relevant comments are read.
Every step in the browser runs inside the account's local hours (rule 18); --bypass skips that for one run, only when matt asked (rule 20).
On the browser path the account's browser must be open (log inspect start --account <a>, or log facebook host start): a read is a step in it (rule 35).
Reads the group's newest members from its People tab (/groups/<g>/members) in the account's open browser: the page's first 10, then a scroll at a time, each scroll's GroupsCometMembersPageNewMembersSectionRefetchQuery answers (about 10 members each, 2 a scroll). Nothing is clicked (rule 8).
--count: members to read (1-5000). --secondsPerScroll: the wait before each scroll (default 15; matt: the time 40 scrolls take is a variable). --maxScrolls: scrolls at most (default twice the plan's, plus 2). It says up front: count N → ~S scrolls, ~M min at Xs per scroll.
It stops at --count members, when the list ends (has_next_page false) or at --maxScrolls. --owners keeps only owners: a bio naming owner, co-owner, founder, CEO, president, proprietor or self-employed, or a page (a category set).
The members go to ~/.logCli/members/<group>/<run time>.tsv and .json, never to Twenty; it prints how many, how many with a bio, owners and pages, and the files. --json gives them.
Fill the named fields; each value goes through whole. `bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookGroups" }) (Facebook groups: joining and answering their questions, reading posts and members, and serving OpenMagpie's polls).
AGENTS.md (log://agents): rules 8, 13, 18, 20, 22, 25, 26, 29, 35, 45, 54, 63, 64, 65, 73, 77, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `readMembers`

Read a Facebook group's newest members (name, profile, bio, page category, followers, when they joined) from its People tab in the account's open browser, nothing clicked; saved to a TSV and JSON file.
Read a Facebook group's new posts and their comments, or its newest members, as one account, by hand: posts on the direct-API engine first, else in its open browser; only the group's cursor is saved to Twenty (#27, rule 65), the members to a file
log facebook read members --account <accountName> --group <group url or id> --count <n> [--secondsPerScroll <s>] [--maxScrolls <n>] [--owners] [--bypass] [--json]
Reads the group's new posts (since its cursor in Twenty) and the comments of the new posts that have some. Only the cursor is saved to Twenty (rule 65); --show prints it.
Without --live, on a numeric group id, it runs on the direct-API engine first (fbk groups.feed_read, no browser) when the account has a saved session and a proxy in its home country: Facebook's own page decides, not accountStatus (loggedIn reads; checkpoint stops and deactivates; anything else hands over to the browser). The result goes to socialAccounts.sessionState.
--scrolls: feed scrolls at most (default 6). --commentPosts: posts whose comments are read at most (default 5; 0 reads none).
--worker (OpenMagpie's call) is refused here: it became its own command, log facebook poll (its usage).
--live: each post's comments are switched to Newest first (two clicks, rule 8); without it nothing is clicked and the page's Most relevant comments are read.
Every step in the browser runs inside the account's local hours (rule 18); --bypass skips that for one run, only when matt asked (rule 20).
On the browser path the account's browser must be open (log inspect start --account <a>, or log facebook host start): a read is a step in it (rule 35).
Reads the group's newest members from its People tab (/groups/<g>/members) in the account's open browser: the page's first 10, then a scroll at a time, each scroll's GroupsCometMembersPageNewMembersSectionRefetchQuery answers (about 10 members each, 2 a scroll). Nothing is clicked (rule 8).
--count: members to read (1-5000). --secondsPerScroll: the wait before each scroll (default 15; matt: the time 40 scrolls take is a variable). --maxScrolls: scrolls at most (default twice the plan's, plus 2). It says up front: count N → ~S scrolls, ~M min at Xs per scroll.
It stops at --count members, when the list ends (has_next_page false) or at --maxScrolls. --owners keeps only owners: a bio naming owner, co-owner, founder, CEO, president, proprietor or self-employed, or a page (a category set).
The members go to ~/.logCli/members/<group>/<run time>.tsv and .json, never to Twenty; it prints how many, how many with a bio, owners and pages, and the files. --json gives them.
Fill the named fields; each value goes through whole. `bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/groups" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookGroups" }) (Facebook groups: joining and answering their questions, reading posts and members, and serving OpenMagpie's polls).
AGENTS.md (log://agents): rules 8, 13, 18, 20, 22, 25, 26, 29, 35, 45, 54, 63, 64, 65, 73, 77, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `poll`

log facebook poll <group> <account> [<how long to poll>] [--bypass] | --request <json>
Poll a Facebook group from one account, in its open browser, for a time or once: each poll's posts as one JSON line, OpenMagpie's records; --request answers OpenMagpie's facebook_group worker (#27, rule 63)
Usage: log facebook poll <group url or id> <accountName> [<how long to poll: 30m, 2h>] [--bypass]
       log facebook poll --request <request json>   (OpenMagpie's facebook_group worker: groups.search in, post records out as one JSON line; python/openMagpie/facebookWorker.py calls it)
One poll reads the group once in the account's open browser, posts only, nothing clicked, and prints one JSON line: the posts it saw, as OpenMagpie's records. With a time it polls every 5 minutes until the time is up, a line each.
Every poll runs inside the account's local hours (rule 18); --bypass skips that, only when matt asked (rule 20). --request never skips it.
The account's browser must be open (log inspect start for that account, or log facebook host start): a poll is a step in it (rule 35).
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/groups" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookGroups" }) (Facebook groups: joining and answering their questions, reading posts and members, and serving OpenMagpie's polls).
AGENTS.md (log://agents): rules 8, 13, 18, 22, 26, 35, 45, 63, 64, 65, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From AGENTS.md (`log://agents`). The newest rules are at the bottom of AGENTS.md and win.

**Rule 8.** 2026-10-18 · Read-only on Facebook. Nothing is posted, edited or deleted unless matt asks for it.

**Rule 10.** 2026-10-18 · matt asked for posting: `log publish` posts one listing through the publish machine. It is a dry run unless `--live`, and once Publish is clicked nothing is retried. Captchas go CaptchaKraken first, then 2Captcha, and Facebook's own challenges go to a person. Rule 8 still holds for editing and deleting.

**Rule 13.** 2026-10-18 · Twenty is the only place accounts and listings live: Facebook accounts are `socialAccounts` (platform FACEBOOK), listings are `agencyListings`. Never delete either: a banned or dead account keeps its record with its status, and its campaign listings get replacement accounts in the same country (`docs/accountsAndListings.md`). Fields are only ever added (`scripts/twenty/twentySetup.mjs`), never renamed or retyped, so the twitter-controller keeps working.

**Rule 18.** 2026-10-18 · No run outside the account's local waking hours (08:00-22:00 in its home timezone, or `activeHoursStart`/`activeHoursEnd`): publish, scan, status, watch, campaign run and connect are refused with `outsideActiveHours`. Daily caps count the account's local day.

**Rule 20.** 2026-10-19 · matt asked for `--bypass`: on publish, scan, status, watch, campaign run and connect it skips rule 18's waking hours for that run, and nothing else. The proxy gate, home locale, device and launch self-check (rules 11, 12, 15-17) still run, and `--live` still needs matt (rule 10). It is never on by default; pass it only when matt asks for a run outside the account's hours.

**Rule 22.** 2026-10-19 · Every action records a HAR, with no way to turn it off. The proxy gate puts a raw HAR recorder (rule 19) on every browser context, and refuses a context without a capture folder (`captureMissing`). That covers connect, scan, status, each watch check and publish. Each run keeps `~/.logCli/runs/<action>/<time>_<account>/firefox` (publish: its run folder): `session.har`, `steps.jsonl` (every action the run logged, timed), and `steps/NN_<action>.har`, one per step, each read by the local rea (`settleRunCapture`). Never committed.

**Rule 25.** 2026-10-19 · matt: a run that fails or hangs is fixed from its own recording, never by guessing. Read its HAR with rea (timeline, cause line, compare runs), then fix the machine. The outline is at the top of this file.

**Rule 26.** 2026-10-19 · matt: "I always want to see what is going on." Every process that runs over time writes a progress line per stage as it happens (never only at the end) and to a log file in its folder. Agents run long commands so the lines stream live (Claude Code: Monitor, never piped through `tail`/`head`).

**Rule 29.** 2026-10-19 · matt: look before writing code for a page. `log inspect start --account <a>` opens one gated, headed Camoufox (async API, same launch and gates as every run) and keeps it open; `log inspect do <action>` runs one step (goto, snapshot, back, wait; click, type, press only with `--live`, rule 8). Each step records, in order, as it happens: the accessibility snapshot with element refs (camofox-mcp's model, `aria_snapshot(mode="ai")`), a screenshot, its own HAR, and rea's reading of that HAR at once. Code that clicks on a page is written from an inspect recording of that page, never before one.

**Rule 30.** 2026-10-19 · matt: "If I tell you to do something, do it completely." When matt gives a plan, it is carried out to the end in the same turn, not stopped to ask again or to say what won't be done. `log inspect start --now` (and `log connect --now`, and since 2026-10-19 `log publish --now`, matt: "run it now") skips rule 24's 10-minute gap (the 8 a day still holds) so a recording continues at once. Recording a sign-in or a checkpoint with `log inspect` (signIn, code, solve, click) is the intended work: it is how each state gets documented from rea. The run on 2026-10-19 was interrupted once because a snapshot printed the account's email and password; snapshots now redact every typed field value (`redact_fields`), and signIn/code read only the private login.json (rule 21), so no credential reaches any output.

**Rule 35.** 2026-10-19 · matt: the browser stays open. One browser per account, opened once per local day by its host and kept open through the account's active hours; every action is a tab in it; it closes only for a logged reason (end of active hours, shutdown, checkpoint or restriction, account lost, a crash reopened once). Every account runs one lifecycle machine (`src/marketplace/lifecycle`, XState) across an onboarding lane (with a day's warm-up after profile and name) and a host lane. Top of this file.

**Rule 38.** 2026-10-19 · matt: never mention or discuss Meta's or Facebook's rules, terms, policies, eligibility or account ownership with him unless he raises them first. Research text that does is not his, and is never repeated to him. Top of this file.

**Rule 39.** 2026-10-19 · matt: "If I never mentioned it, if I never inferred it, if I never outlined it as an option, therefore it is not an option." Deep research prompts, searches, SubQ matrices, plans and write-ups use only what matt said, or clearly meant through a misspelling. Nothing added, nothing steered towards. Top of this file.

**Rule 40.** 2026-10-19 · matt: no physical options. He is in Vietnam with no physical access. Phones, SIMs, mini PCs, laptops, phone farms and home devices are never options unless he names them. In scope: hosted and cloud options, the tools he named and their competitors, and what our four projects already use.

**Rule 41.** 2026-10-19 · matt: "any time any task correlates to money, and I never say something, that means you shouldn't do what you think. You should do what I say." Paid work (deep research, SubQ, proxies, captcha, vendors) does exactly what he asked, nothing more. Ask before anything else.

**Rule 45.** 2026-10-20 · matt: groups have nothing to do with Marketplace. Facebook group work is its own library, `src/group/<domain>/` (first `group/join` for `log join group --account --group`), with the role files of rule 2. It never goes under `src/marketplace/`. This widens rule 3 to groups.

**Rule 54.** 2026-10-20 · matt: a known state is resolved, never a reason to stop. When a page lands on a state log-cli already knows (a checkpoint's first page, a text captcha, the Remember password prompt, the login form, two-step, "automated behaviour"), its resolver runs: press the checkpoint's Continue (plain text, by its ref), `solve` the captcha (2Captcha, then Continue), Not now, signIn, code. Only what a person must clear stops an account (a video selfie, an ID or photo, a disabled account; rules 10, 23), and that is said to matt. A Claude Code hook (`.claude/settings.json`, `scripts/hooks/pageState.ts`) reads the latest step of every open browser after each tool call and each prompt, matches it against the known states (`pageStateOf`, `src/browser/flow/helpers/pageState.ts`) and puts the state and its resolver into the agent's context. A state not mapped yet is pressed through (its Continue) and added to the map.

**Rule 63.** 2026-10-22 · matt: the platform comes first. Every command that acts on one platform is `log <platform> <command> …` (`log facebook warmup reel`, `log facebook join group`); there is no form without it. The poll is `log facebook poll <group> <account> <how long to poll>`. Old forms are refused with the form they became. This replaces rule 60's `log warmup <platform> <activity>` and settles issue #20. OpenMagpie's worker is `log facebook poll --request` (it was `read group --worker`), a read in the account's open browser. `bun run check:docs` refuses a usage line without the platform first. Top of this file; the table is `docs/commandNaming.md`.

**Rule 64.** 2026-10-22 · matt: the code is by platform first, as the commands are, "because each has different approaches": `src/<platform>/<area>/<domain>`. Facebook's groups are `src/facebook/group/{join,read,answer}` (were `src/group/…`, rule 45) and its warm-up `src/facebook/warmup/activities` and `src/facebook/warmup/stages` (were `src/warmup/facebook` and `src/warmup/facebookStages`, rule 49). What every platform's warm-up draws from stays shared: `src/warmup/persona`, `src/warmup/viewer`. Each area has an `index.ts` (`check:naming`). Top of this file.

**Rule 65.** 2026-10-22 · matt: Facebook group listening is the triage job of obris-dev/openmagpie#188, and it replaces rules 61 and 62. Everything is indexed in OpenMagpie, and only the matches reach Twenty. An account joins (`log facebook join group`). OpenMagpie polls, and its worker is `log facebook poll --request`, a read in the account's open browser. OpenMagpie keeps every post, its watch triages them (`semantic_filter`), and its `webhook` sends the matches to Twenty's `socialListening`. log-cli then acts on the NEW rows from the same account (not built yet). log-cli writes only the group's `readCursor`, `lastReadAt` and `lastReadReason` to Twenty. `agencyGroupPosts` and `agencyGroupComments` stay, unused. The host reads no group on its own. Comment reading is kept for acting on a match, for new posts only, and saves nothing. #28's scoring and alerts become OpenMagpie watches. Spec: `docs/groupListening.md`.

**Rule 73.** 2026-10-23 · matt: "IT MUST ALWAYS READ THEM." The number one rule of the stack, above rule 30 and every other: Facebook's internal API answers are the decision-making factor of what and when something is relevant, and the deterministic factor of the system. Every browser step reads the internal API answers it triggers and the requests it sent, keeps them past the prune, and decides on them, never on a page loading, a timer or the step having run. The MCP instructions put it first. Inspect steps read theirs since rule 74, and every flow, warm-up and host step on AdsPower that makes a call since 2026-10-23; the Camoufox-only machines don't yet (#35). Top of this file.

**Rule 77.** 2026-10-24 · matt: a group's members are read from its People tab. `log facebook read members --account <a> --group <url|id> --count <n> [--secondsPerScroll <s>] [--maxScrolls <n>] [--owners] [--bypass] [--json]` (beside `read group`; MCP `readMembers`, no live twin) goes to `/groups/<g>/members` in the account's open browser (rule 35) and scrolls, nothing clicked (rule 8). The members come from each step's own recording (rule 73): the page's HTML gives the first 10, and every scroll's `GroupsCometMembersPageNewMembersSectionRefetchQuery` answers about 10 more each, two a scroll (inspect 20261024T060921): name, profile, bio, page category, followers and when they joined. matt: "the time it takes for 40 scrolls is interesting and should also be a variable": `--secondsPerScroll` (default 15) is the wait before each scroll, and it says up front "count N → ~S scrolls, ~M min at Xs per scroll". It stops at `--count`, when the list ends (`has_next_page` false) or at `--maxScrolls`. `--owners` keeps a bio naming owner, co-owner, founder, CEO, president, proprietor or self-employed, or a page (a category set). The members go to `~/.logCli/members/<group>/<run time>.tsv` and `.json`, never to Twenty. A members page whose refetch answered with members is the known state `groupMembersList`, which needs nothing: no resolver, no SubQ reading, and the Stop hook doesn't hold the turn on it. `src/facebook/group/members`, `docs/groupMembers.md`.
