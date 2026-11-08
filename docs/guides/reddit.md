# reddit

A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
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
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "reddit/contributorMaxxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "reddit" }) (A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting).
AGENTS.md (log://agents): rules 13, 63, 64, 73, 83, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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
AGENTS.md (log://agents): rules 8, 53, 63, 64, 73, 94, 110, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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
AGENTS.md (log://agents): rules 8, 53, 63, 64, 73, 94, 110, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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
AGENTS.md (log://agents): rules 8, 53, 63, 64, 73, 94, 110, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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
AGENTS.md (log://agents): rules 8, 53, 63, 64, 73, 94, 110, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `redditPost`

Post a text post to a subreddit; a dry run unless --live.
Post a text post to a subreddit through the account's direct-API engine; a dry run unless --live
log reddit post --account <accountName> --subreddit <name> --title <title> [--text <markdown>] [--flair <flair>] [--approvedBy <who>] [--live] [--json]
Posts a text post to a subreddit through the account's direct-API engine (no browser). A dry run unless --live, which needs --approvedBy (rule 8).
Reddit's composer asks for a reCAPTCHA Enterprise token, solved by 2Captcha (rule 10). The governor counts it as a write; Reddit's answer decides, and a refusal stops it with nothing retried (rule 94).
Fill the named fields; each value goes through whole. What acts on Reddit is `redditPostLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "reddit" }) (A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting).
AGENTS.md (log://agents): rules 8, 10, 41, 63, 64, 73, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `redditPostLive`

Post a text post to a subreddit; a dry run unless --live.
Live on Reddit: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Post a text post to a subreddit through the account's direct-API engine; a dry run unless --live
log reddit post --account <accountName> --subreddit <name> --title <title> [--text <markdown>] [--flair <flair>] [--approvedBy <who>] [--live] [--json]
Posts a text post to a subreddit through the account's direct-API engine (no browser). A dry run unless --live, which needs --approvedBy (rule 8).
Reddit's composer asks for a reCAPTCHA Enterprise token, solved by 2Captcha (rule 10). The governor counts it as a write; Reddit's answer decides, and a refusal stops it with nothing retried (rule 94).
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "reddit" }) (A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting).
AGENTS.md (log://agents): rules 8, 10, 41, 63, 64, 73, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `redditReply`

Comment on a post or reply to one of its comments; a dry run unless --live.
Comment on a Reddit post or reply to one of its comments through the account's direct-API engine; a dry run unless --live
log reddit reply --account <accountName> --url <post permalink> --text <text> [--comment <t1_id>] [--approvedBy <who>] [--live] [--json]
Comments on a post, or replies to one of its comments (--comment, an id from log reddit read post), through the account's direct-API engine (no browser).
A dry run unless --live, which needs --approvedBy (rule 8). Reddit asks for a reCAPTCHA Enterprise token, solved by 2Captcha (rule 10). A refusal stops it with nothing retried (rule 94).
Fill the named fields; each value goes through whole. What acts on Reddit is `redditReplyLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "reddit" }) (A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting).
AGENTS.md (log://agents): rules 8, 10, 41, 63, 64, 73, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `redditReplyLive`

Comment on a post or reply to one of its comments; a dry run unless --live.
Live on Reddit: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Comment on a Reddit post or reply to one of its comments through the account's direct-API engine; a dry run unless --live
log reddit reply --account <accountName> --url <post permalink> --text <text> [--comment <t1_id>] [--approvedBy <who>] [--live] [--json]
Comments on a post, or replies to one of its comments (--comment, an id from log reddit read post), through the account's direct-API engine (no browser).
A dry run unless --live, which needs --approvedBy (rule 8). Reddit asks for a reCAPTCHA Enterprise token, solved by 2Captcha (rule 10). A refusal stops it with nothing retried (rule 94).
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "reddit" }) (A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting).
AGENTS.md (log://agents): rules 8, 10, 41, 63, 64, 73, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `redditVote`

Vote on a post or comment; a dry run unless --live.
Vote on a Reddit post or comment through the account's direct-API engine; a dry run unless --live
log reddit vote --account <accountName> (--url <post permalink> | --target <t3_id|t1_id>) [--direction up|down|none] [--approvedBy <who>] [--live] [--json]
Votes on a post or comment through the account's direct-API engine (no browser): up (the default), down, or none to take a vote back.
A dry run unless --live, which needs --approvedBy (rule 8). The governor counts it as a write; a refusal stops it with nothing retried (rule 94).
Fill the named fields; each value goes through whole. What acts on Reddit is `redditVoteLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "reddit" }) (A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting).
AGENTS.md (log://agents): rules 8, 63, 64, 73, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `redditVoteLive`

Vote on a post or comment; a dry run unless --live.
Live on Reddit: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Vote on a Reddit post or comment through the account's direct-API engine; a dry run unless --live
log reddit vote --account <accountName> (--url <post permalink> | --target <t3_id|t1_id>) [--direction up|down|none] [--approvedBy <who>] [--live] [--json]
Votes on a post or comment through the account's direct-API engine (no browser): up (the default), down, or none to take a vote back.
A dry run unless --live, which needs --approvedBy (rule 8). The governor counts it as a write; a refusal stops it with nothing retried (rule 94).
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "reddit" }) (A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting).
AGENTS.md (log://agents): rules 8, 63, 64, 73, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From AGENTS.md (`log://agents`). The newest rules are at the bottom of AGENTS.md and win.

**Rule 8.** 2026-10-18 · Read-only on Facebook. Nothing is posted, edited or deleted unless matt asks for it.

**Rule 10.** 2026-10-18 · matt asked for posting: `log publish` posts one listing through the publish machine. It is a dry run unless `--live`, and once Publish is clicked nothing is retried. Captchas go CaptchaKraken first, then 2Captcha, and Facebook's own challenges go to a person. Rule 8 still holds for editing and deleting.

**Rule 13.** 2026-10-18 · Twenty is the only place accounts and listings live: Facebook accounts are `socialAccounts` (platform FACEBOOK), listings are `agencyListings`. Never delete either: a banned or dead account keeps its record with its status, and its campaign listings get replacement accounts in the same country (`docs/accountsAndListings.md`). Fields are only ever added (`scripts/twenty/twentySetup.mjs`), never renamed or retyped, so the twitter-controller keeps working.

**Rule 30.** 2026-10-19 · matt: "If I tell you to do something, do it completely." When matt gives a plan, it is carried out to the end in the same turn, not stopped to ask again or to say what won't be done. `log inspect start --now` (and `log connect --now`, and since 2026-10-19 `log publish --now`, matt: "run it now") skips rule 24's 10-minute gap (the 8 a day still holds) so a recording continues at once. Recording a sign-in or a checkpoint with `log inspect` (signIn, code, solve, click) is the intended work: it is how each state gets documented from rea. The run on 2026-10-19 was interrupted once because a snapshot printed the account's email and password; snapshots now redact every typed field value (`redact_fields`), and signIn/code read only the private login.json (rule 21), so no credential reaches any output.

**Rule 38.** 2026-10-19 · matt: never mention or discuss Meta's or Facebook's rules, terms, policies, eligibility or account ownership with him unless he raises them first. Research text that does is not his, and is never repeated to him. Top of this file.

**Rule 39.** 2026-10-19 · matt: "If I never mentioned it, if I never inferred it, if I never outlined it as an option, therefore it is not an option." Deep research prompts, searches, SubQ matrices, plans and write-ups use only what matt said, or clearly meant through a misspelling. Nothing added, nothing steered towards. Top of this file.

**Rule 40.** 2026-10-19 · matt: no physical options. He is in Vietnam with no physical access. Phones, SIMs, mini PCs, laptops, phone farms and home devices are never options unless he names them. In scope: hosted and cloud options, the tools he named and their competitors, and what our four projects already use.

**Rule 41.** 2026-10-19 · matt: "any time any task correlates to money, and I never say something, that means you shouldn't do what you think. You should do what I say." Paid work (deep research, SubQ, proxies, captcha, vendors) does exactly what he asked, nothing more. Ask before anything else.

**Rule 53.** 2026-10-20 · matt: when something has to be found (a group to join, a provider, a price, a fact), it comes from an external source, never from memory or a guess: search with TinyFish through treg (`treg call tinyfish.web.search`, `tinyfish.web.fetch`, free) as the basis for every lookup, and pull the actual candidates from it. A suggestion names where it came from (the page, the search), and a pick is one of what the search returned.

**Rule 63.** 2026-10-22 · matt: the platform comes first. Every command that acts on one platform is `log <platform> <command> …` (`log facebook warmup reel`, `log facebook join group`); there is no form without it. The poll is `log facebook poll <group> <account> <how long to poll>`. Old forms are refused with the form they became. This replaces rule 60's `log warmup <platform> <activity>` and settles issue #20. OpenMagpie's worker is `log facebook poll --request` (it was `read group --worker`), a read in the account's open browser. `bun run check:docs` refuses a usage line without the platform first. Top of this file; the table is `docs/commandNaming.md`.

**Rule 64.** 2026-10-22 · matt: the code is by platform first, as the commands are, "because each has different approaches": `src/<platform>/<area>/<domain>`. Facebook's groups are `src/facebook/group/{join,read,answer}` (were `src/group/…`, rule 45) and its warm-up `src/facebook/warmup/activities` and `src/facebook/warmup/stages` (were `src/warmup/facebook` and `src/warmup/facebookStages`, rule 49). What every platform's warm-up draws from stays shared: `src/warmup/persona`, `src/warmup/viewer`. Each area has an `index.ts` (`check:naming`). Top of this file.

**Rule 73.** 2026-10-23 · matt: "IT MUST ALWAYS READ THEM." The number one rule of the stack, above rule 30 and every other: Facebook's internal API answers are the decision-making factor of what and when something is relevant, and the deterministic factor of the system. Every browser step reads the internal API answers it triggers and the requests it sent, keeps them past the prune, and decides on them, never on a page loading, a timer or the step having run. The MCP instructions put it first. Inspect steps read theirs since rule 74, and every flow, warm-up and host step on AdsPower that makes a call since 2026-10-23; the Camoufox-only machines don't yet (#35). Top of this file.

**Rule 83.** 2026-10-25 · matt: a new platform is made with one command, written normally: `log new platform <name>` (MCP `newPlatform`). It writes the platform's account session on the shared `src/platformKit/session`, `log <name> session check` with its MCP tool, a direct-API engine in `python/<name>Api` on the shared `python/platformKit/engine.py`, and `docs/platforms/<name>/README.md`, and wires it into the repo by editing each file through its syntax tree (`PLATFORMS`, `PLATFORM_LABELS`, `COMMANDS`, `createContext`, `CommandContext`, `DIRECT_ROUTES`, `COMMAND_RULES`), checking every edit landed before anything is written. Without `--apply` it only lists what it would do; nothing is overwritten; it names what Twenty is missing (the `socialAccounts.platform` option) and never changes Twenty. Routes and rules are keyed by the platform-qualified name (`commandKey`: `read`, `twitterSession`, `redditSession`), so two platforms' commands never share one. lefthook's `platforms` (`bun run check:platforms`, pre-commit and pre-push) refuses a platform missing its label, src, command, engine, session route, rules or docs. `src/scaffold/platform`, `src/cli/new`.

**Rule 94.** 2026-10-29 · matt: "whatever you did in such quick succession lead to my account getting disabled, never do that again." Never act on an account in quick succession. What happened (matt's Discord, `sourcedandsoldtothehighestbidder`, 2026-10-29 00:47-01:00 UTC): in about 13 minutes an agent replied in 3 chats, read 1,400 messages from a server (Finn Automated) with a scratch script that went around log-cli (`.scratch/finn/dc.ts`: its own fetch to `discord.com/api/v9` with the session token, pages back to back, retrying straight through 429s), pulled the account's relationships, then opened new DMs to strangers from that server 30 s apart. Discord disabled the account. From now on: - Every call to a platform goes through log-cli's own commands and their governor. Never a hand-rolled script with an account's token or cookies. - A 429 or a failed send stops the run. It is never retried through, and the next action waits for matt. - Reading a server, group or member list in bulk is its own session. It never runs in the same session as sending. - Cold DMs to people the account has never talked to go out at most a few a day, minutes apart, never back to back. Each new DM channel opened counts as a write. - After a block, disable, captcha or cooldown, nothing resumes on that account until matt says so.

**Rule 110.** 2026-11-02 · matt: "we need to be faster with the mcp commands ... why is it taking so long for something which is not even something that should take long". Reads on an X account are spaced 0.8 to 2.5 s after the last call (`READ_SPACING_SECONDS`: inbox, a person's thread, notifications and their pages, follows, followers), the way X's own app fires reads back to back when a screen opens; only sends keep rule 104's 4 to 11 s (`SPACING_SECONDS`). Still one call per account at a time through its one session (rules 104, 105). Reading a person's full context (rule 109) pulls notifications only when they weren't synced in the last 2 minutes (`notificationsFresh`). A queue run never sends two things closer than its minGap, and items added to it keep that gap.
