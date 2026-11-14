# logMcpInstructions

Step-by-step guide to the log MCP: every core rule in full, which guide covers which work, and how runs, jobs, browsers and refusals report back.

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Current scope

The guides describe the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.

## Use cases: the work the owner asks for, tool by tool

This is how the owner works. Each use case is something the owner asks for again and again, written as its steps in order, each step naming its tool and what counts as done. When the owner asks for work a use case covers, read that use case and follow it step by step instead of improvising. Work no use case covers yet, done for the owner more than once, gets a page of its own in docs/useCases/<platform>/.

With no prompt hook, getGuide({ ask }) routes the owner's words to the one that fits; each page's own asks line holds the words it is matched on.

| Use case | What it is |
|---|---|
| `getGuide({ useCase: "discord/channelReply" })` | Answering someone in a Discord DM or group DM |
| `getGuide({ useCase: "discord/forumPosts" })` | Going through a Discord forum for posts worth answering |
| `getGuide({ useCase: "discord/groupChatRead" })` | Reading a Discord group chat without Twenty |
| `getGuide({ useCase: "discord/memeReply" })` | Replying with a meme in a Discord chat |
| `getGuide({ useCase: "discord/serverReply" })` | Replying in a Discord server channel |
| `getGuide({ useCase: "discord/serverSearch" })` | Finding a conversation in a Discord server |
| `getGuide({ useCase: "facebook/groups" })` | Listening to local Facebook groups |
| `getGuide({ useCase: "facebook/marketplaceListings" })` | From accounts to live Marketplace listings |
| `getGuide({ useCase: "inbox/bossMaxxing" })` | Bossmaxxing: giving out tasks to the team |
| `getGuide({ useCase: "inbox/governorReset" })` | Resetting an account's governor count |
| `getGuide({ useCase: "inbox/reaLooksmaxxing" })` | /rea-looksmaxxing: moneymaxx like a creator |
| `getGuide({ useCase: "inbox/reactions" })` | Reacting to a message |
| `getGuide({ useCase: "inbox/scopeAJob" })` | Scoping a job out of someone in a DM |
| `getGuide({ useCase: "inbox/showMe" })` | Showing it as a view: generative UI in the chat |
| `getGuide({ useCase: "inbox/signIn" })` | Signing an account in: checking it, then the live browser |
| `getGuide({ useCase: "inbox/triage" })` | Triage: scoping someone's job and handing it to whoever does it |
| `getGuide({ useCase: "inbox/voiceNote" })` | Sending a voice note |
| `getGuide({ useCase: "instagram/dmReply" })` | Reading and answering an Instagram DM |
| `getGuide({ useCase: "instagram/newPlatform" })` | Bringing a new platform up, then vendoring its client |
| `getGuide({ useCase: "linkedin/network" })` | Growing a LinkedIn network, and reading and answering its inbox |
| `getGuide({ useCase: "linkedin/posts" })` | Posting on LinkedIn, liking or reposting, and taking a post down |
| `getGuide({ useCase: "reddit/contributorMaxxing" })` | Contributor maxxing: finding talented builders through what they share |
| `getGuide({ useCase: "slack/dmReply" })` | Reading and answering a Slack DM |
| `getGuide({ useCase: "twitter/affiliateMarketing" })` | Affiliate marketing through your DMs |
| `getGuide({ useCase: "twitter/collabMaxxing" })` | Collab maxxing: turn open conversations into collabs |
| `getGuide({ useCase: "twitter/dmInbox" })` | Reading the DM inbox: who is waiting on you |
| `getGuide({ useCase: "twitter/engagementReplies" })` | Answering the people who engaged with your posts |
| `getGuide({ useCase: "twitter/engagerDms" })` | DMing the people who liked or reposted your post |
| `getGuide({ useCase: "twitter/followUps" })` | Following up in your own voice |
| `getGuide({ useCase: "twitter/followers" })` | Checking who really follows you |
| `getGuide({ useCase: "twitter/getTheAction" })` | Getting people to do the thing: retweet, like, try it |
| `getGuide({ useCase: "twitter/managerMaxxing" })` | Manager maxxing: the managers of the biggest Kick streamers |
| `getGuide({ useCase: "twitter/networkMaxing" })` | Network maxing: grow the network, the niche map |
| `getGuide({ useCase: "twitter/nicheMapRegion" })` | A new region of the niche map, then outbound to it |
| `getGuide({ useCase: "twitter/notifications" })` | Seeing who engaged with your posts |
| `getGuide({ useCase: "twitter/recruiting" })` | Recruiting on X with a reply queue |
| `getGuide({ useCase: "twitter/replyGuyFunnel" })` | Reply guy, then the DM, then the ask |
| `getGuide({ useCase: "twitter/topicReplies" })` | Replying to everyone posting about one topic |
| `getGuide({ useCase: "twitter/whoNeedsYou" })` | Finding who needs something from you, or who matters |
| `getGuide({ useCase: "web/competitorTraffic" })` | Competitor traffic: finding how to rank on your competitors' names |

## Rule one: if we don't know, we do this

Read the internal request/response evidence and collate the goal, account/runtime, action and timing. Use the scoped REA/SubQ workflow where applicable, report unknown states and record Point/Evidence/Explain. See active rules 25, 29 and 73. A platform refusal or checkpoint remains a stop.

## The core rules, in full

The Log tools use platform-specific engines and governors, with private records in the selected workspace. Current code still has legacy dependencies; the native hosted target is specified separately (rules 171, 172, 175).
1. Rule one: if we do not know, read the internal calls and their evidence, collate the moment, use the applicable REA/SubQ workflow, report the state and record Point/Evidence/Explain (rule 73).
2. When the owner asks, do it completely within the authorized scope (rule 30).
3. Keep current log.db identity/message/media/jobs/queue structures; add only missing native account/credential and hosted execution contracts (rules 134, 175).
4. Hosted control owns identity, team authorization, grants and minimal routing. Private sessions, content and execution stay in the selected persistent runtime (rule 172).
5. Treg is the control reference. Native V1 uses email OTP/team selection and paired outbound routing. AI-provider login and old listing features are outside current implementation scope (rules 171, 175).
6. Read the relevant guide before platform work. Preserve existing authorization, refusal, governor, browser and session gates (rules 8, 35, 94, 105, 158).
7. Use private DB context, current claims and the account owner before sending. Preserve voice/media checks (rules 109, 133, 137, 138, 160).
8. Stream progress. Verify actual outcomes and reconcile uncertain writes rather than blindly replaying them (rules 25, 26, 172).
9. No unrelated scope/spend; no personal secrets in hosted guidance. History is reference, not current authority (rules 39, 41, 47, 176).
10. Discover commands through logSearch, logGet and logCall; use supported reload behavior (rules 163, 167).
Active instructions are in AGENTS.md (log://agents). Every tool also falls under rules 30, 38, 39, 40 and 41. Platform procedures live in scoped guides/specs; superseded citations resolve to current rules.

## Which guide for which work

Each tool's description names its guide. Load it with `getGuide({ topic })` before first using that tool.

| Topic | What it covers |
|---|---|
| `logCatalog` | Finding and running any log command with three tools: logSearch by what you want done, logGet for its inputs and a call that works, logCall to run it |
| `accountBrowser` | An account's one browser on any platform: opening it through its gates, inspecting a page step by step, where every open browser is, the live view for signing in, AdsPower profiles and local accounts |
| `sessions` | Whether each account's saved session still works, from the platform's own answer, with the next step to sign it back in; and log's own sign-in for a team (login, logout, whoami) |
| `flows` | Recorded flows and the warm-up on any platform: a recording turned into steps that run in the account's open browser, each step checked against the call it must cause |
| `inbox` | Every platform's chats as one inbox: listing, reading and watching them, sending, reacting and voice notes, who waits on a reply, claiming a chat before acting in it, and every action's log |
| `voiceGate` | The voice gate every send as the owner passes on every platform: a draft checked against the owner's own writing before it goes out, and the voice and AI-tells indexes behind it |
| `facebookBrowser` | A Facebook account's browser for its day: preflight, opening and signing in, the host and its lifecycle, the profile and Messenger PIN, its accounts and the account checks |
| `facebookFlows` | Facebook's recorded flows and its warm-up, each a facebookFlow tool run as steps in the account's open browser |
| `facebookMarketplace` | Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations |
| `facebookGroups` | Facebook groups: joining and answering their questions, reading posts and members, and serving OpenMagpie's polls |
| `xInbox` | Reading an X account's DMs and X Chat as one inbox, synced by sequence id, and watching X Chat live |
| `xSending` | Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, lists, queues and voice notes |
| `xAccount` | An X account's session: saving and checking its cookies, who follows whom, and its notifications (who liked, reposted, replied to, quoted or followed it) |
| `discord` | A Discord account: its session, DMs and group DMs, servers with their channels, forums, posts and threads, server search, reading, the live gateway watch, sending and deleting its own messages |
| `reddit` | A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting |
| `slack` | A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending |
| `linkedin` | A LinkedIn account: saving its cookies, checking its session, posting or deleting its own posts, inviting people LinkedIn suggests, liking and reposting posts, and reading and writing in its conversations |
| `accountsAndProxies` | Every account in the workspace with its session state, and each account's proxy: checking it, giving it one from a provider in its home city, and providers' traffic; and the interactive launcher that sets log up and adds accounts |
| `runsAndEvidence` | What runs leave behind: run folders and pruning, captures and request docs, error codes, jobs, every call's timings, log.db's typed tables checked and rebuilt from its events, and the MCP server itself |
| `knowledgeAndSearch` | Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it |
| `extensions` | Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, the owner's cloned voice (Inworld or Fish Audio) for the voice notes they ask for, every paid provider's balance, and treg's catalog of endpoints for every lookup |
| `console` | The local console: this machine's log.db, MCP, accounts, usage, events, AI client config, settings and provider keys, read in the terminal, as JSON per screen, or in the web console on loopback with no sign-in |
| `governor` | Every platform account's governor: its daily count of requests and writes, reading it, and putting it back to 0 when the owner says so, recorded in log.db |
| `newPlatform` | Making a new platform whole with one command, and where every new file goes |
| `instagram` | An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch |
| `ui` | Generative UI in the chat: the report tool, where you write a small React view against log's kit (in the spirit of Lynx workspaces) and log draws it with data from log.db, or send just data for a starter view; text everywhere else |

## How a run reports back

<!-- shell -->
- Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so the owner watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
<!-- /shell -->
<!-- noShell -->
- Runs for seconds to minutes: every line it streams comes back in the result's `progress` (with its time), and the result says where every open browser is (`browsers`, `next`, `needsMatt`) (rules 26, 35). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
<!-- /noShell -->
- Every result also says where every open browser is (`browsers`), the call that resolves its known page state (`next`: make it, don't stop, rule 79) and what only the owner can clear (`needsMatt`).
- A refusal names its error code; the `errors` tool says what each one means and what to do.

## The work, step by step: logCli

From `skills/logCli/SKILL.md`.

## Log CLI

### Current scope

Log is platform agnostic. Native hosted development follows AGENTS.md rules 171/172/175 and docs/proposals/listeningKitSchema.md. Existing SQLite and private engine files are the foundation. Treg is the hosted identity/control reference only. Old listing/campaign features are deferred for the native V1.

Current CLI account/session paths still have legacy dependencies. Use the implementation's current guide when operating them; do not claim they already use the proposed native repository. No generated account/CRM object defines the target schema.

### Procedure

1. Read current AGENTS.md and the task's relevant guide/use-case, not the historical rules snapshot.
2. Discover the command with logSearch, read exact inputs with logGet, and call through logCall or its dedicated tool. Shared commands stay shared; platform commands use log <platform> <command>.
3. Resolve the selected account/workspace and its current owner. Context reads use log.db when eligible; live catch-up goes through that owner.
4. Preserve authorization, governor/refusal, browser/profile and claim gates. Live actions need the authorization their tool defines. Do not send messages merely because a read succeeded.
5. Stream long-call progress and read platform answers to decide the result. Preserve private evidence; uncertain writes reconcile before retry.
6. Report the actual result and any missing implementation boundary. Native schema edits alone do not remove current runtime dependencies.

### Secrets and storage

Credentials, sessions, messages and detailed execution stay at the selected private runtime or actual browser host. Never print keys/cookies, commit raw captures or copy private payloads into central metadata. AdsPower installation keys remain separate from Log pairing tokens.

### Historical procedures

The old Marketplace-only guide is retired. Use current platform guides for a specific supported operation. Do not import historical data models into native hosted development.

## The rules these tools fall under, in full

From the current AGENTS.md (`log://agents`). Every other guide cites its rules by number and first line.

**Rule 8.** 2026-10-18 · Platform actions require the user authorization their tool defines. Send, post, react, join, edit and delete only when authorized; preserve explicit live confirmation, governor and account gates. Ordinary reads do not need new approval.

**Rule 25.** 2026-10-19 · Fix failed or unfamiliar behavior from its own recorded action/request/response timeline. Identify the first response deciding the outcome, compare evidence, then change the machine. Do not infer success from a screen, timer or completed tool call.

**Rule 26.** 2026-10-19 · Stream progress while work runs, one meaningful line per stage, with the run log retained. Explain stages in plain words; do not leave the user waiting silently for a final buffered result.

**Rule 30.** 2026-10-19 · Complete the authorized task. Do not repeatedly request confirmation already given. Distinguish implemented behavior, proposed contracts and unverified assumptions.

**Rule 35.** 2026-10-19 · Browser work uses one account browser through its active day, with actions as tabs/steps; close only for a logged lifecycle reason. Preserve existing proxy-country, locale/timezone, device/profile, headed visibility, capture, active-hours and launch-budget gates. Keep checkpoint stops and account-specific constraints in the browser/flow guides. Do not create a fresh browser per action.

**Rule 38.** 2026-10-19 · Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless the owner raises them.

**Rule 39.** 2026-10-19 · Use only the scope, options and intent the owner stated or implied. Do not add unrelated alternatives to research, comparisons, plans or implementation.

**Rule 40.** 2026-10-19 · Do not propose physical infrastructure unless the owner asks. Their available implementation scope is hosted/cloud environments and the tools already selected.

**Rule 41.** 2026-10-19 · Paid work must stay within the authorized task and spend. Ask before adding a paid operation they did not authorize; do not substitute a new paid provider implicitly.

**Rule 47.** 2026-10-20 · CLI, MCP, hooks and guides share the current instructions. Hosted product clients receive appropriately scoped product guidance, not a server owner's personal secrets or memories. A target design does not mean the current MCP/runtime dependencies have already migrated.

**Rule 73.** 2026-10-23 · For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence. Use the existing REA/SubQ reading workflow when applicable, report the unknown state, write Point/Evidence/Explain and the fix, then name the state. Preserve paid-work scope. This runtime analysis does not add SubQ to commit/CI gates.

**Rule 94.** 2026-10-29 · Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies. A refusal, failed send, 429, block, disable, captcha or cooldown stops that run/account until the owner authorizes continuation. Do not retry through refusals. Bulk reading and sending are separate sessions; cold DMs stay a few a day, minutes apart, and opening a DM counts as a write.

**Rule 105.** 2026-11-01 · One platform/account owns one continuous engine session and push connection. Reads, writes, queues and watches share that owner through existing relay/serialization. Never open a parallel client to bypass the owner or its governor.

**Rule 109.** 2026-11-01 · Read the full relevant chat and current private context before drafting or sending. Include media/transcript/attachment context and pending queued actions; hold a send if required context cannot be obtained. Follow the selected channel's voice and task-brief contract. Cold outreach excludes existing conversations through the current prior-conversation check; bypass it only when the owner asks.

**Rule 133.** 2026-11-04 · Claim a chat before acting; consult recent actions, preserve claim generation and check it before subsequent message parts. A lost claim stops the remaining send. Release when done; retain claim/action evidence in the existing private store.

**Rule 134.** 2026-11-04 · Existing workspace log.db is the native private record/coordination foundation. Preserve events, stable identities, chats/messages, attachments/interactions, claims/owners/cursors, queues/jobs, media/search and records/state. Keep current WAL/migration/version semantics and transaction boundaries; unknown events retain source payload and are surfaced for analysis. Only proven projections are rebuildable.

**Rule 137.** 2026-11-04 · Preserve current context-aware voice and AI-artifact gates for messages sent as the owner. Rework refused drafts from the stated cause. Exact-message overrides and dictated/translated voice-note exceptions require the owner's request and preserve remaining artifact checks. Do not treat an exception as permanent permission.

**Rule 138.** 2026-11-04 · Media and voice-note context uses the existing private media descriptions and transcripts. Do not claim to have understood undescribed media. Preserve hash-based deduplication, private storage and the one describer process.

**Rule 158.** 2026-11-07 · Select the relevant guide/use case from the task. Read the guide before using its Log tools and carry context across the full workflow; do not require the owner to remember internal command names.

**Rule 160.** 2026-11-07 · Answer eligible chat reads from log.db when the owner is live, caught up and the needed history is present/backfilled. Otherwise fill the missing scope once through the owner. A refused catch-up is a refusal, never a reason to bypass it with another live read. Report the read source.

**Rule 163.** 2026-11-07 · Agent Log actions go through Log MCP tools; never work around a stale or unavailable MCP with shell Log commands or scratch clients. Terminal-only credential prompts remain for the owner. Expose discoverable command contracts through the existing Log catalog: search the job, get exact inputs, then call. Keep tool descriptions concise and accurate to the current implementation.

**Rule 167.** 2026-11-07 · Use supported MCP/runtime reload behavior for changes. Avoid restarting healthy sessions unnecessarily; never silently interrupt active account work or bypass owner locks.

**Rule 171.** 2026-11-11 · Hosted Log moves away from Twenty. Treg is the reference for the accepted FastAPI/SQLModel/PostgreSQL identity/control service. Its schema does not define private platform data; rule 172 fixes that boundary.

**Rule 172.** 2026-11-11 · The selected persistent cloud workspace owns private accounts, credentials/sessions, messages and execution data in existing SQLite plus protected files. Central storage owns identity, team authorization, scoped grants and minimal routing/recovery metadata only. No durable central private payload/message catalog. Use paired outbound routing, fencing and uncertain-write reconciliation; one selected workspace per team in V1.

**Rule 176.** 2026-11-11 · the owner requested pruning obsolete agent rules. AGENTS.md is the concise active instruction set; prior instructions are archived outside this repository as non-authoritative history. Keep platform procedures in their relevant skills/specs and dated one-off incidents out of global instructions. A historical citation does not restore superseded architecture.
