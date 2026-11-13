# xAccount

An X account's session: saving and checking its cookies, who follows whom, and its notifications (who liked, reposted, replied to, quoted or followed it).

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 55). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Current scope

This guide describes the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "inbox/reaLooksmaxxing" })` | /rea-looksmaxxing: moneymaxx like a creator | "/rea-looksmaxxing how clavicular gets paid", "moneymaxx like <creator>", "how does <creator> get paid" |
| `getGuide({ useCase: "inbox/signIn" })` | Signing an account in: checking it, then the live browser | "sign in to my account", "is my x account logged in", "check my accounts", "log me back into instagram", "my session expired", "check the status of my accounts", "open the browser so I can sign in" |
| `getGuide({ useCase: "twitter/affiliateMarketing" })` | Affiliate marketing through your DMs | see the page |
| `getGuide({ useCase: "twitter/engagementReplies" })` | Answering the people who engaged with your posts | see the page |
| `getGuide({ useCase: "twitter/engagerDms" })` | DMing the people who liked or reposted your post | see the page |
| `getGuide({ useCase: "twitter/followers" })` | Checking who really follows you | see the page |
| `getGuide({ useCase: "twitter/getTheAction" })` | Getting people to do the thing: retweet, like, try it | "get me all them people who liked it ... yo cool to see that you liked that, would you give that a wee retweet", "notifications: people who like, comment, reply", "go through all the people there who need a message", "get them to retweet the thing", "would you do me a favour and give it a wee retweet", "I need them to retweet it so I can get some inbound leads", "I don't know what they're even talking about, explain the context", "make them do the action I need", "get the full context of everything on the account at the time of sending the message". |
| `getGuide({ useCase: "twitter/managerMaxxing" })` | Manager maxxing: the managers of the biggest Kick streamers | "manager maxxing", "find every kick streamer's manager on twitter", "reply guy the kick managers with memes", "the managers that engaged, send them their tweet, a message and a voice note". |
| `getGuide({ useCase: "twitter/nicheMapRegion" })` | A new region of the niche map, then outbound to it | "for getting accepted into YC ... make a new area of the niche map through the systems we've already made ... the YC world and the funds' world, based on the 26 batch", "the YC stuff in and around the boat.dev people and the people involved in GTM tools", "pull all of my new followers ... set a budget of like 60$", "start with the 43", "not just treg but the actual index that we did already". |
| `getGuide({ useCase: "twitter/notifications" })` | Seeing who engaged with your posts | see the page |
| `getGuide({ useCase: "twitter/recruiting" })` | Recruiting on X with a reply queue | see the page |
| `getGuide({ useCase: "twitter/replyGuyFunnel" })` | Reply guy, then the DM, then the ask | "reply guy them first and foremost", "send a meme to the tweet then forward the tweet to them as an opener", "message the people who are new to following me", "get it in front of them", "funnel them into doing an action". |
| `getGuide({ useCase: "twitter/topicReplies" })` | Replying to everyone posting about one topic | see the page |

## The tools in this guide

| Tool | What it does |
|---|---|
| `twitterSessionCheck` | Check that X still accepts one account's saved session, sending… |
| `twitterSessionWebClient` | Save X's signed-in web client |
| `twitterFollows` | Read whether each handle follows the account and the account follows… |
| `twitterFollowers` | Read an X account's own followers, newest first, sending nothing |
| `twitterNotifications` | Read who liked, reposted, replied to, quoted or followed an X… |

## Every tool, in full

### `twitterSessionCheck`

Check that X still accepts one account's saved session, sending nothing.
Check that X still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty
log twitter session check --account <accountName> [--json]
Checks that X still accepts the account's saved session, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Sends nothing.
X's own answer decides: the session check's HTTP status (401 or 403 loggedOut, 200 or 404 loggedIn), then the account's profile read (suspended or locked: restricted). The result goes to socialAccounts.sessionState, and X's refreshed cookies are merged back into the row.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/reaLooksmaxxing" }), getGuide({ useCase: "inbox/signIn" }), getGuide({ useCase: "twitter/affiliateMarketing" }), getGuide({ useCase: "twitter/engagementReplies" }), getGuide({ useCase: "twitter/engagerDms" }), getGuide({ useCase: "twitter/followers" }), getGuide({ useCase: "twitter/notifications" }), getGuide({ useCase: "twitter/recruiting" }), getGuide({ useCase: "twitter/topicReplies" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xAccount" }) (An X account's session: saving and checking its cookies, who follows whom, and its notifications (who liked, reposted, replied to, quoted or followed it)).
AGENTS.md (log://agents): rules 175, 35, 26, 63, 2, 73, 83, 105, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterSessionWebClient`

Save X's signed-in web client (its page and scripts) through the account's one session, for rea to read, sending nothing.
Check that X still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty
log twitter session webClient --account <accountName> [--json]   (loads x.com/home through the account's one X session, as twikit already does to sign its calls, and saves the page and every script it lists from abs.twimg.com to ~/.logCli/twitter/<account>/webClient/<time>, reads spaced 0.8 to 2.5 s, so rea can read X's own signed-in client: what its composer sends; rule 113)
Checks that X still accepts the account's saved session, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Sends nothing.
X's own answer decides: the session check's HTTP status (401 or 403 loggedOut, 200 or 404 loggedIn), then the account's profile read (suspended or locked: restricted). The result goes to socialAccounts.sessionState, and X's refreshed cookies are merged back into the row.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "xAccount" }) (An X account's session: saving and checking its cookies, who follows whom, and its notifications (who liked, reposted, replied to, quoted or followed it)).
AGENTS.md (log://agents): rules 175, 35, 26, 63, 2, 73, 83, 105, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterFollows`

Read whether each handle follows the account and the account follows it, sending nothing.
Read whether handles follow an X account and it follows them, on the direct-API engine, sending nothing
log twitter follows --account <accountName> --handles <handle,handle…> [--json]
Reads, for each handle, whether it follows the account and whether the account follows it, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Sends nothing.
X's own answer decides: one friendships/show read per handle, 1.5 s apart, after the session check. Handles come from treg research or matt, never a guess (rule 53).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/engagerDms" }), getGuide({ useCase: "twitter/followers" }), getGuide({ useCase: "twitter/managerMaxxing" }), getGuide({ useCase: "twitter/nicheMapRegion" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xAccount" }) (An X account's session: saving and checking its cookies, who follows whom, and its notifications (who liked, reposted, replied to, quoted or followed it)).
AGENTS.md (log://agents): rules 175, 53, 63, 2, 73, 83, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterFollowers`

Read an X account's own followers, newest first, sending nothing.
Read an X account's own followers on the direct-API engine, sending nothing
log twitter followers --account <accountName> [--limit <n>] [--json]
Reads the account's own followers on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80), newest first: handle, name, bio, location, follower and post counts, whether they take DMs. Sends nothing.
X's own answer decides: the session check first, then X's followers list, 100 a page, 1.5 s apart. --limit is how many to read, default 200, at most 4000.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/followers" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xAccount" }) (An X account's session: saving and checking its cookies, who follows whom, and its notifications (who liked, reposted, replied to, quoted or followed it)).
AGENTS.md (log://agents): rules 175, 63, 2, 73, 83, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterNotifications`

Read who liked, reposted, replied to, quoted or followed an X account, new and back through its history, sending nothing.
Read who liked, reposted, replied to, quoted or followed an X account, new and historical, kept locally, sending nothing
log twitter notifications --account <accountName> [--type likes|reposts|replies|quotes|follows|all] [--since <date>] [--post <id|url>] [--full] [--pages <n>] [--stored] [--limit <n>] [--json]
Reads the account's X notifications on the direct-API engine through its one X session, the engine host (rule 105: no session of its own; no browser, no proxy, rule 80) and keeps them in ~/.logCli/twitter/<account>/notifications.json: one row per person per thing they did (like, repost, reply, quote, follow, mention), with which of the account's posts it was on and when. Sends nothing.
Without --full it reads only what is new: the newest page, then older pages until it meets rows already kept (the first run reads up to 5 pages). --full then pages back through the history from where the last --full stopped, as far as X gives, at most --pages pages a run (default 25). The read is one engine call (rule 104: one call per account at a time); its pages are 40 notifications, 4 to 11 s apart, each through the account's governor; a 429 or a governor stop ends the read and keeps what came.
--stored answers from what is kept, calling nothing. --type, --since, --post and --limit (default 50 shown, at most 5000) narrow what is shown; --json gives the rows, counts by kind and the people who engaged most.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/reaLooksmaxxing" }), getGuide({ useCase: "twitter/engagerDms" }), getGuide({ useCase: "twitter/getTheAction" }), getGuide({ useCase: "twitter/managerMaxxing" }), getGuide({ useCase: "twitter/notifications" }), getGuide({ useCase: "twitter/replyGuyFunnel" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xAccount" }) (An X account's session: saving and checking its cookies, who follows whom, and its notifications (who liked, reposted, replied to, quoted or followed it)).
AGENTS.md (log://agents): rules 175, 26, 63, 2, 73, 83, 94, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From the current AGENTS.md (`log://agents`). Historical citations are consolidated; archived instructions do not override the active scope.

**Rule 2.** 2026-10-18 · Put platform code under src/<platform>/<area>/<domain>; shared code stays in its shared library/domain. Use index.ts, types.ts, client.ts, machine.ts and helpers where appropriate. Keep scripts and Python in domain folders.

**Rule 26.** 2026-10-19 · Stream progress while work runs, one meaningful line per stage, with the run log retained. Explain stages in plain words; do not leave the user waiting silently for a final buffered result.

**Rule 30.** 2026-10-19 · Complete the authorized task. Do not repeatedly request confirmation already given. Distinguish implemented behavior, proposed contracts and unverified assumptions.

**Rule 35.** 2026-10-19 · Browser work uses one account browser through its active day, with actions as tabs/steps; close only for a logged lifecycle reason. Preserve existing proxy-country, locale/timezone, device/profile, headed visibility, capture, active-hours and launch-budget gates. Keep checkpoint stops and account-specific constraints in the browser/flow guides. Do not create a fresh browser per action.

**Rule 38.** 2026-10-19 · Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless Matt raises them.

**Rule 39.** 2026-10-19 · Use only the scope, options and intent Matt stated or implied. Do not add unrelated alternatives to research, comparisons, plans or implementation.

**Rule 40.** 2026-10-19 · Do not propose physical infrastructure unless Matt asks. His available implementation scope is hosted/cloud environments and the tools already selected.

**Rule 41.** 2026-10-19 · Paid work must stay within the authorized task and spend. Ask before adding a paid operation he did not authorize; do not substitute a new paid provider implicitly.

**Rule 53.** 2026-10-20 · Verify current external facts from sources. Use the connected tools and applicable guide first for platform/account work; do not invent provider capabilities or production infrastructure from memory.

**Rule 63.** 2026-10-22 · Platform commands are log <platform> <command> <what>. Shared commands remain shared. Preserve the naming boundary described in docs/commandNaming.md.

**Rule 73.** 2026-10-23 · For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence. Use the existing REA/SubQ reading workflow when applicable, report the unknown state, write Point/Evidence/Explain and the fix, then name the state. Preserve paid-work scope. This runtime analysis does not add SubQ to commit/CI gates.

**Rule 83.** 2026-10-25 · New platforms use the existing scaffold, shared account/session boundary, command/catalog wiring, platform documentation and spec anchors. Native hosted scaffolds must not recreate a Twenty dependency.

**Rule 94.** 2026-10-29 · Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies. A refusal, failed send, 429, block, disable, captcha or cooldown stops that run/account until Matt authorizes continuation. Do not retry through refusals. Bulk reading and sending are separate sessions; cold DMs stay a few a day, minutes apart, and opening a DM counts as a write.

**Rule 105.** 2026-11-01 · One platform/account owns one continuous engine session and push connection. Reads, writes, queues and watches share that owner through existing relay/serialization. Never open a parallel client to bypass the owner or its governor.

**Rule 175.** 2026-11-11 · Use existing log.db and platform-agnostic engine contracts for native schemas. Do not copy Twenty agency prefixes or CRM/SMS structures. Old listing/campaign functionality is deferred. Add only missing account/credential and hosted execution contracts; preserve existing identity, message, queue, job and governor authorities.
