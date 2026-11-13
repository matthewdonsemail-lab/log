# reddit

A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 55). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Current scope

This guide describes the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "inbox/signIn" })` | Signing an account in: checking it, then the live browser | "sign in to my account", "is my x account logged in", "check my accounts", "log me back into instagram", "my session expired", "check the status of my accounts", "open the browser so I can sign in" |
| `getGuide({ useCase: "reddit/contributorMaxxing" })` | Contributor maxxing: finding talented builders through what they share | "contributormaxxing", "find talented people who are out there who are interested in the same things that we're interested in", "use our reddit to load up gotomarketengineering", "find people who are posting on github inside of that subreddit", "find me all of the best githubs that have been posted in the past 7 days" |

## The tools in this guide

| Tool | What it does |
|---|---|
| `redditSessionCheck` | Check that Reddit still accepts one account's saved session, sending… |
| `redditReadSubreddits` | Find subreddits by words, with their members and what each is about |
| `redditReadPosts` | A subreddit's newest posts back a number of days, each with its… |
| `redditReadHome` | The account's home feed, one page, each post with its links |
| `redditReadPost` | One post with its comments, each comment with the id a reply takes |
| `redditPost` | Post a text post to a subreddit |
| `redditPostLive` | Post a text post to a subreddit, live on Reddit |
| `redditReply` | Comment on a post or reply to one of its comments |
| `redditReplyLive` | Comment on a post or reply to one of its comments, live on Reddit |
| `redditVote` | Vote on a post or comment |
| `redditVoteLive` | Vote on a post or comment, live on Reddit |

## Every tool, in full

### `redditSessionCheck`

Check that Reddit still accepts one account's saved session, sending nothing.
Check that Reddit still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty
log reddit session check --account <accountName> [--json]
Checks that Reddit still accepts the account's saved session, on the direct-API engine (no browser). Sends nothing.
Reddit's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/signIn" }), getGuide({ useCase: "reddit/contributorMaxxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "reddit" }) (A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting).
AGENTS.md (log://agents): rules 175, 63, 2, 73, 83, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `redditReadSubreddits`

Find subreddits by words, with their members and what each is about.
Find subreddits, and read a subreddit's newest posts with their links, through the account's direct-API engine
log reddit read subreddits --account <accountName> --query <words> [--json]
Reads Reddit through the account's direct-API engine (no browser), paced as reads. Sends nothing.
home is the account's home feed, one page. post is one post with its comments (--limit, default 50), each comment with the id log reddit reply takes to answer it.
subreddits finds communities by words. posts reads a subreddit's newest posts back --days (default 7), each with every link in it;
--linksTo keeps only the posts linking to that host (github.com) and ranks them by score, then comments. A 429 stops the read and keeps what was read (rule 94).
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "reddit/contributorMaxxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "reddit" }) (A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting).
AGENTS.md (log://agents): rules 8, 53, 63, 2, 73, 94, 109, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `redditReadPosts`

A subreddit's newest posts back a number of days, each with its links, optionally only those linking to one host.
Find subreddits, and read a subreddit's newest posts with their links, through the account's direct-API engine
log reddit read posts --account <accountName> --subreddit <name> [--days <n>] [--linksTo <host>] [--json]
Reads Reddit through the account's direct-API engine (no browser), paced as reads. Sends nothing.
home is the account's home feed, one page. post is one post with its comments (--limit, default 50), each comment with the id log reddit reply takes to answer it.
subreddits finds communities by words. posts reads a subreddit's newest posts back --days (default 7), each with every link in it;
--linksTo keeps only the posts linking to that host (github.com) and ranks them by score, then comments. A 429 stops the read and keeps what was read (rule 94).
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "reddit/contributorMaxxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "reddit" }) (A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting).
AGENTS.md (log://agents): rules 8, 53, 63, 2, 73, 94, 109, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `redditReadHome`

The account's home feed, one page, each post with its links.
Find subreddits, and read a subreddit's newest posts with their links, through the account's direct-API engine
log reddit read home --account <accountName> [--json]
Reads Reddit through the account's direct-API engine (no browser), paced as reads. Sends nothing.
home is the account's home feed, one page. post is one post with its comments (--limit, default 50), each comment with the id log reddit reply takes to answer it.
subreddits finds communities by words. posts reads a subreddit's newest posts back --days (default 7), each with every link in it;
--linksTo keeps only the posts linking to that host (github.com) and ranks them by score, then comments. A 429 stops the read and keeps what was read (rule 94).
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "reddit" }) (A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting).
AGENTS.md (log://agents): rules 8, 53, 63, 2, 73, 94, 109, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `redditReadPost`

One post with its comments, each comment with the id a reply takes.
Find subreddits, and read a subreddit's newest posts with their links, through the account's direct-API engine
log reddit read post --account <accountName> --url <permalink> [--limit <n>] [--json]
Reads Reddit through the account's direct-API engine (no browser), paced as reads. Sends nothing.
home is the account's home feed, one page. post is one post with its comments (--limit, default 50), each comment with the id log reddit reply takes to answer it.
subreddits finds communities by words. posts reads a subreddit's newest posts back --days (default 7), each with every link in it;
--linksTo keeps only the posts linking to that host (github.com) and ranks them by score, then comments. A 429 stops the read and keeps what was read (rule 94).
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "reddit" }) (A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting).
AGENTS.md (log://agents): rules 8, 53, 63, 2, 73, 94, 109, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `redditPost`

Post a text post to a subreddit; a dry run unless --live.
Post a text post to a subreddit through the account's direct-API engine; a dry run unless --live
log reddit post --account <accountName> --subreddit <name> --title <title> [--text <markdown>] [--flair <flair>] [--approvedBy <who>] [--live] [--json]
Posts a text post to a subreddit through the account's direct-API engine (no browser). A dry run unless --live, which needs --approvedBy (rule 8).
Reddit's composer asks for a reCAPTCHA Enterprise token, solved by 2Captcha (rule 10). The governor counts it as a write; Reddit's answer decides, and a refusal stops it with nothing retried (rule 94).
Fill the named fields; each value goes through whole. What acts on Reddit is `redditPostLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "reddit" }) (A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting).
AGENTS.md (log://agents): rules 8, 41, 63, 2, 73, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `redditPostLive`

Post a text post to a subreddit; a dry run unless --live.
Live on Reddit: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Post a text post to a subreddit through the account's direct-API engine; a dry run unless --live
log reddit post --account <accountName> --subreddit <name> --title <title> [--text <markdown>] [--flair <flair>] [--approvedBy <who>] [--live] [--json]
Posts a text post to a subreddit through the account's direct-API engine (no browser). A dry run unless --live, which needs --approvedBy (rule 8).
Reddit's composer asks for a reCAPTCHA Enterprise token, solved by 2Captcha (rule 10). The governor counts it as a write; Reddit's answer decides, and a refusal stops it with nothing retried (rule 94).
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "reddit" }) (A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting).
AGENTS.md (log://agents): rules 8, 41, 63, 2, 73, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `redditReply`

Comment on a post or reply to one of its comments; a dry run unless --live.
Comment on a Reddit post or reply to one of its comments through the account's direct-API engine; a dry run unless --live
log reddit reply --account <accountName> --url <post permalink> --text <text> [--comment <t1_id>] [--approvedBy <who>] [--live] [--json]
Comments on a post, or replies to one of its comments (--comment, an id from log reddit read post), through the account's direct-API engine (no browser).
A dry run unless --live, which needs --approvedBy (rule 8). Reddit asks for a reCAPTCHA Enterprise token, solved by 2Captcha (rule 10). A refusal stops it with nothing retried (rule 94).
Fill the named fields; each value goes through whole. What acts on Reddit is `redditReplyLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "reddit" }) (A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting).
AGENTS.md (log://agents): rules 8, 41, 63, 2, 73, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `redditReplyLive`

Comment on a post or reply to one of its comments; a dry run unless --live.
Live on Reddit: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Comment on a Reddit post or reply to one of its comments through the account's direct-API engine; a dry run unless --live
log reddit reply --account <accountName> --url <post permalink> --text <text> [--comment <t1_id>] [--approvedBy <who>] [--live] [--json]
Comments on a post, or replies to one of its comments (--comment, an id from log reddit read post), through the account's direct-API engine (no browser).
A dry run unless --live, which needs --approvedBy (rule 8). Reddit asks for a reCAPTCHA Enterprise token, solved by 2Captcha (rule 10). A refusal stops it with nothing retried (rule 94).
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "reddit" }) (A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting).
AGENTS.md (log://agents): rules 8, 41, 63, 2, 73, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `redditVote`

Vote on a post or comment; a dry run unless --live.
Vote on a Reddit post or comment through the account's direct-API engine; a dry run unless --live
log reddit vote --account <accountName> (--url <post permalink> | --target <t3_id|t1_id>) [--direction up|down|none] [--approvedBy <who>] [--live] [--json]
Votes on a post or comment through the account's direct-API engine (no browser): up (the default), down, or none to take a vote back.
A dry run unless --live, which needs --approvedBy (rule 8). The governor counts it as a write; a refusal stops it with nothing retried (rule 94).
Fill the named fields; each value goes through whole. What acts on Reddit is `redditVoteLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "reddit" }) (A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting).
AGENTS.md (log://agents): rules 8, 63, 2, 73, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `redditVoteLive`

Vote on a post or comment; a dry run unless --live.
Live on Reddit: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Vote on a Reddit post or comment through the account's direct-API engine; a dry run unless --live
log reddit vote --account <accountName> (--url <post permalink> | --target <t3_id|t1_id>) [--direction up|down|none] [--approvedBy <who>] [--live] [--json]
Votes on a post or comment through the account's direct-API engine (no browser): up (the default), down, or none to take a vote back.
A dry run unless --live, which needs --approvedBy (rule 8). The governor counts it as a write; a refusal stops it with nothing retried (rule 94).
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "reddit" }) (A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting).
AGENTS.md (log://agents): rules 8, 63, 2, 73, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From the current AGENTS.md (`log://agents`). Historical citations are consolidated; archived instructions do not override the active scope.

**Rule 2.** 2026-10-18 · Put platform code under src/<platform>/<area>/<domain>; shared code stays in its shared library/domain. Use index.ts, types.ts, client.ts, machine.ts and helpers where appropriate. Keep scripts and Python in domain folders.

**Rule 8.** 2026-10-18 · Platform actions require the user authorization their tool defines. Send, post, react, join, edit and delete only when authorized; preserve explicit live confirmation, governor and account gates. Ordinary reads do not need new approval.

**Rule 30.** 2026-10-19 · Complete the authorized task. Do not repeatedly request confirmation already given. Distinguish implemented behavior, proposed contracts and unverified assumptions.

**Rule 38.** 2026-10-19 · Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless Matt raises them.

**Rule 39.** 2026-10-19 · Use only the scope, options and intent Matt stated or implied. Do not add unrelated alternatives to research, comparisons, plans or implementation.

**Rule 40.** 2026-10-19 · Do not propose physical infrastructure unless Matt asks. His available implementation scope is hosted/cloud environments and the tools already selected.

**Rule 41.** 2026-10-19 · Paid work must stay within the authorized task and spend. Ask before adding a paid operation he did not authorize; do not substitute a new paid provider implicitly.

**Rule 53.** 2026-10-20 · Verify current external facts from sources. Use the connected tools and applicable guide first for platform/account work; do not invent provider capabilities or production infrastructure from memory.

**Rule 63.** 2026-10-22 · Platform commands are log <platform> <command> <what>. Shared commands remain shared. Preserve the naming boundary described in docs/commandNaming.md.

**Rule 73.** 2026-10-23 · For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence. Use the existing REA/SubQ reading workflow when applicable, report the unknown state, write Point/Evidence/Explain and the fix, then name the state. Preserve paid-work scope. This runtime analysis does not add SubQ to commit/CI gates.

**Rule 83.** 2026-10-25 · New platforms use the existing scaffold, shared account/session boundary, command/catalog wiring, platform documentation and spec anchors. Native hosted scaffolds must not recreate a Twenty dependency.

**Rule 94.** 2026-10-29 · Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies. A refusal, failed send, 429, block, disable, captcha or cooldown stops that run/account until Matt authorizes continuation. Do not retry through refusals. Bulk reading and sending are separate sessions; cold DMs stay a few a day, minutes apart, and opening a DM counts as a write.

**Rule 109.** 2026-11-01 · Read the full relevant chat and current private context before drafting or sending. Include media/transcript/attachment context and pending queued actions; hold a send if required context cannot be obtained. Follow the selected channel's voice and task-brief contract. Cold outreach excludes existing conversations through the current prior-conversation check; bypass it only when Matt asks.

**Rule 175.** 2026-11-11 · Use existing log.db and platform-agnostic engine contracts for native schemas. Do not copy Twenty agency prefixes or CRM/SMS structures. Old listing/campaign functionality is deferred. Add only missing account/credential and hosted execution contracts; preserve existing identity, message, queue, job and governor authorities.
