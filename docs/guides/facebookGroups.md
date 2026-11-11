# facebookGroups

Facebook groups: joining and answering their questions, reading posts and members, and serving OpenMagpie's polls.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 55). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Current scope

This guide describes the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.

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
AGENTS.md (log://agents): rules 8, 35, 25, 26, 29, 175, 2, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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
AGENTS.md (log://agents): rules 8, 35, 25, 26, 29, 175, 2, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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
AGENTS.md (log://agents): rules 8, 175, 35, 19, 25, 26, 29, 63, 2, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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
AGENTS.md (log://agents): rules 8, 175, 35, 19, 25, 26, 29, 63, 2, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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
AGENTS.md (log://agents): rules 8, 175, 35, 19, 25, 26, 29, 63, 2, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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
AGENTS.md (log://agents): rules 8, 175, 35, 19, 26, 63, 2, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From the current AGENTS.md (`log://agents`). Historical citations are consolidated; archived instructions do not override the active scope.

**Rule 2.** 2026-10-18 · Put platform code under src/<platform>/<area>/<domain>; shared code stays in its shared library/domain. Use index.ts, types.ts, client.ts, machine.ts and helpers where appropriate. Keep scripts and Python in domain folders.

**Rule 8.** 2026-10-18 · Platform actions require the user authorization their tool defines. Send, post, react, join, edit and delete only when authorized; preserve explicit live confirmation, governor and account gates. Ordinary reads do not need new approval.

**Rule 19.** 2026-10-18 · Every browser action records its raw HAR and timed step evidence, with no switch to disable capture. Raw private captures may contain credentials. Keep them in the selected private runtime/browser-host storage, never in git, central payload logs or user-facing output. Retention/pruning must preserve required analysis evidence.

**Rule 25.** 2026-10-19 · Fix failed or unfamiliar behavior from its own recorded action/request/response timeline. Identify the first response deciding the outcome, compare evidence, then change the machine. Do not infer success from a screen, timer or completed tool call.

**Rule 26.** 2026-10-19 · Stream progress while work runs, one meaningful line per stage, with the run log retained. Explain stages in plain words; do not leave the user waiting silently for a final buffered result.

**Rule 29.** 2026-10-19 · Record a browser page with the existing inspect tool before implementing actions on it. Preserve per-step snapshots, screenshots, HAR and the reading of the internal calls.

**Rule 30.** 2026-10-19 · Complete the authorized task. Do not repeatedly request confirmation already given. Distinguish implemented behavior, proposed contracts and unverified assumptions.

**Rule 35.** 2026-10-19 · Browser work uses one account browser through its active day, with actions as tabs/steps; close only for a logged lifecycle reason. Preserve existing proxy-country, locale/timezone, device/profile, headed visibility, capture, active-hours and launch-budget gates. Keep checkpoint stops and account-specific constraints in the browser/flow guides. Do not create a fresh browser per action.

**Rule 38.** 2026-10-19 · Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless Matt raises them.

**Rule 39.** 2026-10-19 · Use only the scope, options and intent Matt stated or implied. Do not add unrelated alternatives to research, comparisons, plans or implementation.

**Rule 40.** 2026-10-19 · Do not propose physical infrastructure unless Matt asks. His available implementation scope is hosted/cloud environments and the tools already selected.

**Rule 41.** 2026-10-19 · Paid work must stay within the authorized task and spend. Ask before adding a paid operation he did not authorize; do not substitute a new paid provider implicitly.

**Rule 63.** 2026-10-22 · Platform commands are log <platform> <command> <what>. Shared commands remain shared. Preserve the naming boundary described in docs/commandNaming.md.

**Rule 73.** 2026-10-23 · For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence. Use the existing REA/SubQ reading workflow when applicable, report the unknown state, write Point/Evidence/Explain and the fix, then name the state. Preserve paid-work scope. This runtime analysis does not add SubQ to commit/CI gates.

**Rule 175.** 2026-11-11 · Use existing log.db and platform-agnostic engine contracts for native schemas. Do not copy Twenty agency prefixes or CRM/SMS structures. Old listing/campaign functionality is deferred. Add only missing account/credential and hosted execution contracts; preserve existing identity, message, queue, job and governor authorities.
