# slack

A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "slack/dmReply" })` | Reading and answering a Slack DM | "read the messages with <someone> on slack", "reply to <someone> on slack", "what did <someone> say in <workspace>" |

## The tools in this guide

| Tool | What it does |
|---|---|
| `slackSessionCheck` | Check that Slack still accepts one account's saved session, sending… |
| `slackWorkspaces` | The workspaces the account is signed in to, with their domains |
| `slackChats` | The account's DMs and group DMs in a workspace, with their ids |
| `slackRead` | A Slack chat's latest messages, oldest first, sending nothing |
| `slackWatch` | Every Slack event as the workspace's websocket pushes it, sending… |
| `slackSend` | Send a message on Slack, on the direct-API engine |
| `slackSendLive` | Send a message on Slack, on the direct-API engine, live on Slack |

## Every tool, in full

### `slackSessionCheck`

Check that Slack still accepts one account's saved session, sending nothing.
Check that Slack still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to its row
log slack session check --account <accountName> [--workspace <domain>] [--json]
Checks that Slack still accepts the account's saved d cookie, on the direct-API engine (vendor/gabrielSlack, no browser): the workspaces it is signed in to, and with --workspace who it is there (auth.test). Sends nothing.
Slack's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "slack/dmReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "slack" }) (A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending).
AGENTS.md (log://agents): rules 13, 63, 64, 73, 83, 125, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `slackWorkspaces`

The workspaces the account is signed in to, with their domains.
List the workspaces a Slack account is signed in to, on the direct-API engine, sending nothing
log slack workspaces --account <accountName> [--json]
Lists the workspaces the account's d cookie is signed in to, on the direct-API engine (Slack's own cookie exchange, vendor/gabrielSlack, no browser): each one's id, name and domain, the domain being what --workspace takes. Sends nothing.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "slack/dmReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "slack" }) (A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending).
AGENTS.md (log://agents): rules 13, 63, 64, 73, 83, 125, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `slackChats`

The account's DMs and group DMs in a workspace, with their ids.
List a Slack account's DMs and group DMs in a workspace with their ids, on the direct-API engine, sending nothing
log slack chats --account <accountName> [--workspace <domain>] [--limit <n>] [--json]
Lists the account's DMs and group DMs in one workspace with their ids and who they are with, newest first, on the direct-API engine (vendor/gabrielSlack, conversations.list, no browser). Sends nothing.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "slack/dmReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "slack" }) (A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending).
AGENTS.md (log://agents): rules 13, 63, 64, 73, 83, 94, 125, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `slackRead`

A Slack chat's latest messages, oldest first, sending nothing.
Read a Slack chat's latest messages, on the direct-API engine, sending nothing
log slack read --account <accountName> --chat <chatId|who it is with> [--workspace <domain>] [--limit <n>] [--json]
Reads a DM, group DM or channel's latest messages, oldest first, on the direct-API engine (vendor/gabrielSlack, conversations.history, no browser): who sent each, when, its text and its thread. Sends nothing, and marks nothing read.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "slack/dmReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "slack" }) (A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending).
AGENTS.md (log://agents): rules 13, 63, 64, 73, 83, 94, 125, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `slackWatch`

Every Slack event as the workspace's websocket pushes it, sending nothing.
Watch a Slack workspace's events as its websocket pushes them, nothing polled, sending nothing
log slack watch --account <accountName> [--workspace <domain>] [--chat <chatId|who it is with>] [--seconds <s>] [--inbox] [--json]
Opens each workspace's own websocket on the direct-API engine (vendor/gabrielSlack, wss-primary.slack.com, no browser), every workspace the session is signed in to unless --workspace names one, and prints each message, typing, read marker, reaction and draft the moment Slack pushes it, nothing polled. --chat keeps one chat; --seconds stops after that long (at least 5), otherwise it runs until stopped. --inbox hands each new DM, group message or mention of the account from someone else to the inbox hook, which puts it in front of the agent with what to do next (rule 123). Sends nothing.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "slack" }) (A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending).
AGENTS.md (log://agents): rules 13, 26, 63, 64, 73, 83, 94, 123, 125, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `slackSend`

Send a message on Slack, on the direct-API engine; a dry run unless --live.
Send a message to a Slack DM, group or channel, on the direct-API engine; a dry run unless --live
log slack send --account <accountName> --chat <chatId|who it is with> --text "<message>" [--workspace <domain>] [--asOne] [--approvedBy <who>] [--live] [--json]
Sends a message to a Slack DM, group DM or channel (by its id, or who it is with from log slack chats), on the direct-API engine (vendor/gabrielSlack, chat.postMessage, no browser).
A draft written on several lines goes out one message per line (rule 90); a one-line draft is split the way matt writes in that chat (log voice index), and --asOne always sends one. Without --live it is a dry run and Slack is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). Slack's answer decides: a ts is sent, anything else stops the run with nothing retried (rule 94). The governor counts each message as a write. The copy is read for what AI chat interfaces leave in text first (rule 111): hidden characters, odd spaces or pasted Claude HTML refuse it with aiArtifacts.
Fill the named fields; each value goes through whole. What acts on Slack is `slackSendLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "slack" }) (A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending).
AGENTS.md (log://agents): rules 8, 13, 63, 64, 73, 83, 90, 94, 111, 125, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `slackSendLive`

Send a message on Slack, on the direct-API engine; a dry run unless --live.
Live on Slack: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Send a message to a Slack DM, group or channel, on the direct-API engine; a dry run unless --live
log slack send --account <accountName> --chat <chatId|who it is with> --text "<message>" [--workspace <domain>] [--asOne] [--approvedBy <who>] [--live] [--json]
Sends a message to a Slack DM, group DM or channel (by its id, or who it is with from log slack chats), on the direct-API engine (vendor/gabrielSlack, chat.postMessage, no browser).
A draft written on several lines goes out one message per line (rule 90); a one-line draft is split the way matt writes in that chat (log voice index), and --asOne always sends one. Without --live it is a dry run and Slack is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). Slack's answer decides: a ts is sent, anything else stops the run with nothing retried (rule 94). The governor counts each message as a write. The copy is read for what AI chat interfaces leave in text first (rule 111): hidden characters, odd spaces or pasted Claude HTML refuse it with aiArtifacts.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "slack/dmReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "slack" }) (A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending).
AGENTS.md (log://agents): rules 8, 13, 63, 64, 73, 83, 90, 94, 111, 125, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From AGENTS.md (`log://agents`). The newest rules are at the bottom of AGENTS.md and win.

**Rule 8.** 2026-10-18 · Read-only on Facebook. Nothing is posted, edited or deleted unless matt asks for it.

**Rule 13.** 2026-10-18 · Twenty is the only place accounts and listings live: Facebook accounts are `socialAccounts` (platform FACEBOOK), listings are `agencyListings`. Never delete either: a banned or dead account keeps its record with its status, and its campaign listings get replacement accounts in the same country (`docs/accountsAndListings.md`). Fields are only ever added (`scripts/twenty/twentySetup.mjs`), never renamed or retyped, so the twitter-controller keeps working.

**Rule 26.** 2026-10-19 · matt: "I always want to see what is going on." Every process that runs over time writes a progress line per stage as it happens (never only at the end) and to a log file in its folder. Agents run long commands so the lines stream live (Claude Code: Monitor, never piped through `tail`/`head`).

**Rule 30.** 2026-10-19 · matt: "If I tell you to do something, do it completely." When matt gives a plan, it is carried out to the end in the same turn, not stopped to ask again or to say what won't be done. `log inspect start --now` (and `log connect --now`, and since 2026-10-19 `log publish --now`, matt: "run it now") skips rule 24's 10-minute gap (the 8 a day still holds) so a recording continues at once. Recording a sign-in or a checkpoint with `log inspect` (signIn, code, solve, click) is the intended work: it is how each state gets documented from rea. The run on 2026-10-19 was interrupted once because a snapshot printed the account's email and password; snapshots now redact every typed field value (`redact_fields`), and signIn/code read only the private login.json (rule 21), so no credential reaches any output.

**Rule 38.** 2026-10-19 · matt: never mention or discuss Meta's or Facebook's rules, terms, policies, eligibility or account ownership with him unless he raises them first. Research text that does is not his, and is never repeated to him. Top of this file.

**Rule 39.** 2026-10-19 · matt: "If I never mentioned it, if I never inferred it, if I never outlined it as an option, therefore it is not an option." Deep research prompts, searches, SubQ matrices, plans and write-ups use only what matt said, or clearly meant through a misspelling. Nothing added, nothing steered towards. Top of this file.

**Rule 40.** 2026-10-19 · matt: no physical options. He is in Vietnam with no physical access. Phones, SIMs, mini PCs, laptops, phone farms and home devices are never options unless he names them. In scope: hosted and cloud options, the tools he named and their competitors, and what our four projects already use.

**Rule 41.** 2026-10-19 · matt: "any time any task correlates to money, and I never say something, that means you shouldn't do what you think. You should do what I say." Paid work (deep research, SubQ, proxies, captcha, vendors) does exactly what he asked, nothing more. Ask before anything else.

**Rule 63.** 2026-10-22 · matt: the platform comes first. Every command that acts on one platform is `log <platform> <command> …` (`log facebook warmup reel`, `log facebook join group`); there is no form without it. The poll is `log facebook poll <group> <account> <how long to poll>`. Old forms are refused with the form they became. This replaces rule 60's `log warmup <platform> <activity>` and settles issue #20. OpenMagpie's worker is `log facebook poll --request` (it was `read group --worker`), a read in the account's open browser. `bun run check:docs` refuses a usage line without the platform first. Top of this file; the table is `docs/commandNaming.md`.

**Rule 64.** 2026-10-22 · matt: the code is by platform first, as the commands are, "because each has different approaches": `src/<platform>/<area>/<domain>`. Facebook's groups are `src/facebook/group/{join,read,answer}` (were `src/group/…`, rule 45) and its warm-up `src/facebook/warmup/activities` and `src/facebook/warmup/stages` (were `src/warmup/facebook` and `src/warmup/facebookStages`, rule 49). What every platform's warm-up draws from stays shared: `src/warmup/persona`, `src/warmup/viewer`. Each area has an `index.ts` (`check:naming`). Top of this file.

**Rule 73.** 2026-10-23 · matt: "IT MUST ALWAYS READ THEM." The number one rule of the stack, above rule 30 and every other: Facebook's internal API answers are the decision-making factor of what and when something is relevant, and the deterministic factor of the system. Every browser step reads the internal API answers it triggers and the requests it sent, keeps them past the prune, and decides on them, never on a page loading, a timer or the step having run. The MCP instructions put it first. Inspect steps read theirs since rule 74, and every flow, warm-up and host step on AdsPower that makes a call since 2026-10-23; the Camoufox-only machines don't yet (#35). Top of this file.

**Rule 83.** 2026-10-25 · matt: a new platform is made with one command, written normally: `log new platform <name>` (MCP `newPlatform`). It writes the platform's account session on the shared `src/platformKit/session`, `log <name> session check` with its MCP tool, a direct-API engine in `python/<name>Api` on the shared `python/platformKit/engine.py`, and `docs/platforms/<name>/README.md`, and wires it into the repo by editing each file through its syntax tree (`PLATFORMS`, `PLATFORM_LABELS`, `COMMANDS`, `createContext`, `CommandContext`, `DIRECT_ROUTES`, `COMMAND_RULES`), checking every edit landed before anything is written. Without `--apply` it only lists what it would do; nothing is overwritten; it names what Twenty is missing (the `socialAccounts.platform` option) and never changes Twenty. Routes and rules are keyed by the platform-qualified name (`commandKey`: `read`, `twitterSession`, `redditSession`), so two platforms' commands never share one. lefthook's `platforms` (`bun run check:platforms`, pre-commit and pre-push) refuses a platform missing its label, src, command, engine, session route, rules or docs. `src/scaffold/platform`, `src/cli/new`.

**Rule 90.** 2026-10-28 · matt: "stop sending as one." A message drafted on several lines goes out one message per line, in every chat, whatever matt's habit there (`splitPlan`, `src/voice/pairs`). Only `--asOne` sends it as one, and only when matt asks for that. A one-line draft is still split the way he writes in that chat.

**Rule 94.** 2026-10-29 · matt: "whatever you did in such quick succession lead to my account getting disabled, never do that again." Never act on an account in quick succession. What happened (matt's Discord, `sourcedandsoldtothehighestbidder`, 2026-10-29 00:47-01:00 UTC): in about 13 minutes an agent replied in 3 chats, read 1,400 messages from a server (Finn Automated) with a scratch script that went around log-cli (`.scratch/finn/dc.ts`: its own fetch to `discord.com/api/v9` with the session token, pages back to back, retrying straight through 429s), pulled the account's relationships, then opened new DMs to strangers from that server 30 s apart. Discord disabled the account. From now on: - Every call to a platform goes through log-cli's own commands and their governor. Never a hand-rolled script with an account's token or cookies. - A 429 or a failed send stops the run. It is never retried through, and the next action waits for matt. - Reading a server, group or member list in bulk is its own session. It never runs in the same session as sending. - Cold DMs to people the account has never talked to go out at most a few a day, minutes apart, never back to back. Each new DM channel opened counts as a write. - After a block, disable, captcha or cooldown, nothing resumes on that account until matt says so.

**Rule 111.** 2026-11-02 · matt: find GitHub repos "good for claude watermarking ... so we're able to pass it through context into the sends so that we can see how likely it is to be watermarked". Claude's own watermark is statistical (word choice under a secret key) and Anthropic's text detector is private preview, so no public repo can score it (`RESEARCH/CLAUDE_WATERMARK_REPOS_2026_11_02.md`). What can be read is what AI chat interfaces leave in text: `OfirYC/claude-watermark-checker` is vendored at `vendor/claudeArtifactDetector` (MIT, no dependencies) and every send's copy is read by it (`watermarkReadingOf`, `src/twitter/copy/watermark`): `clean`, `stylistic` (curly quotes, em dashes) or `artifacts` (zero-width or other hidden characters, odd spaces, pasted Claude HTML), with `statistical: unknown` always said. `planSend` refuses a send with artifacts (`aiArtifacts`) and carries the reading in its plan; `log voice` shows it and fails a draft with artifacts; a direct send and each queue send log it.

**Rule 123.** 2026-11-03 · matt: "make it a rule all platforms need the web socket hooks stuff there". Every platform log-cli talks to gets the live hooks X and Discord have. Its account's one session holds the platform's own push channel open: X Chat's socket, Discord's gateway, Slack's `wss-primary.slack.com`. That is never a poll from a second client. The inbox hook starts that watcher for every account and puts each new message, mention and reply in front of the agent with what to do (`>>> NEW MESSAGE`), per session (rules 105, 108, 115). It also stops a watcher running older code, skips an account cooling off, and stops on any refusal (rule 94). A platform isn't done until its watcher is in the inbox hook (`scripts/hooks/inbox.ts`, `src/inbox/watch`), starting with Slack. Reddit and LinkedIn aren't built yet. Spec: `docs/specs/agentHooks.md` (REQ-HOOKS-12).

**Rule 125.** 2026-11-03 · matt: "Check slack via cli it needs to be swapped to use curl_cffi same as X". Slack goes out looking like a browser, the way X (rule 81) and LinkedIn (rule 102) do. `vendor/gabrielSlack` reaches Slack, its web API, its cookie exchange and its websocket (`wss-primary.slack.com`), only through `gabriel/core/transport.py`: one curl_cffi `AsyncSession` made by `new_session`, pinned to one impersonation target (`IMPERSONATE`, `chrome150`), sending that target's own user agent (`USER_AGENT`, which the client's default metadata uses), never httpx, websockets, aiohttp, requests or a socket of its own. It keeps no cookies between calls: the d cookie is sent on each one. gabriel's own login CLI, which drove Chrome through httpx and websockets, is removed. `python/checks/slackTransport.py` maps every transport touchpoint by syntax tree (`--map`), rewrites what has a curl_cffi equivalent (`--apply`) and refuses the rest (`--check`, `bun run check:slackTransport`, pre-commit and pre-push). Spec: `docs/specs/slack.md` (REQ-SLACK-05).
