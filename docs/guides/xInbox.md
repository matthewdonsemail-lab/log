# xInbox

Reading an X account's DMs and X Chat as one inbox, synced by sequence id, and watching X Chat live.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 55). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Current scope

This guide describes the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "discord/channelReply" })` | Answering someone in a Discord DM or group DM | "reply to <someone> on discord", "reply to <someone> in <group>", "explain what I'm trying to do to <someone> in <group>", "answer the group" |
| `getGuide({ useCase: "discord/serverReply" })` | Replying in a Discord server channel | "reply to <someone> in <server>", "answer him in the general", "message the guy in <server> #<channel> who mentioned me", "reply in the <server> server", "find what <someone> said in <server> and answer it" |
| `getGuide({ useCase: "inbox/bossMaxxing" })` | Bossmaxxing: giving out tasks to the team | "bossmaxxing", "give out the tasks", "send <person> the task in <group> and tag them", "tell <person> about everything I researched and give them an outline", "triage the jobs across the team", "walk <person> through setting up <tool>", "help <person> get set up like we did with <other person>" |
| `getGuide({ useCase: "inbox/reaLooksmaxxing" })` | /rea-looksmaxxing: moneymaxx like a creator | "/rea-looksmaxxing how clavicular gets paid", "moneymaxx like <creator>", "how does <creator> get paid" |
| `getGuide({ useCase: "inbox/reactions" })` | Reacting to a message | "react to that", "heart his message", "put a 😂 on what she said", "send a reaction to <person>" |
| `getGuide({ useCase: "inbox/voiceNote" })` | Sending a voice note | "send <person> a voice note saying …", "voice note him that …", "send a vn to the group saying …" |
| `getGuide({ useCase: "twitter/affiliateMarketing" })` | Affiliate marketing through your DMs | see the page |
| `getGuide({ useCase: "twitter/collabMaxxing" })` | Collab maxxing: turn open conversations into collabs | "position a collab first then be like just a few quid so i can make a video about it", "start network maxxing and collab maxxing and trying to see what hes doing get him to reveal it all", "follow up on <someone> and the other people, small commitment from deals, not just new people but already open convos", "respond with the collabmaxxing", "selling the outcome", "let him name it", "check in with <someone> whats good there he is keen but isnt liquid", "just be nice to them there the poor people", "ask <someone> if i could become a contributor", "look on my twitter for missed opportunities". |
| `getGuide({ useCase: "twitter/dmInbox" })` | Reading the DM inbox: who is waiting on you | see the page |
| `getGuide({ useCase: "twitter/engagerDms" })` | DMing the people who liked or reposted your post | see the page |
| `getGuide({ useCase: "twitter/followUps" })` | Following up in your own voice | "follow up with these, not for anything in particular, just warming up the relationship", "say it was cool to meet him", "ask him for some advice on what he's doing", "take him up on the doc he offered". |
| `getGuide({ useCase: "twitter/getTheAction" })` | Getting people to do the thing: retweet, like, try it | "get me all them people who liked it ... yo cool to see that you liked that, would you give that a wee retweet", "notifications: people who like, comment, reply", "go through all the people there who need a message", "get them to retweet the thing", "would you do me a favour and give it a wee retweet", "I need them to retweet it so I can get some inbound leads", "I don't know what they're even talking about, explain the context", "make them do the action I need", "get the full context of everything on the account at the time of sending the message". |
| `getGuide({ useCase: "twitter/managerMaxxing" })` | Manager maxxing: the managers of the biggest Kick streamers | "manager maxxing", "find every kick streamer's manager on twitter", "reply guy the kick managers with memes", "the managers that engaged, send them their tweet, a message and a voice note". |
| `getGuide({ useCase: "twitter/networkMaxing" })` | Network maxing: grow the network, the niche map | "all them people messaging me, just message them something nice, get the ball moving with the networking", "we're not even trying to get anything out of these people, network max", "throw some new people in the mixer", "network max ... look at the nicheMap", "the whole point of it is to expand our network, which is the niche map", "follow them before you cold message them, and like the tweet you send them". |
| `getGuide({ useCase: "twitter/replyGuyFunnel" })` | Reply guy, then the DM, then the ask | "reply guy them first and foremost", "send a meme to the tweet then forward the tweet to them as an opener", "message the people who are new to following me", "get it in front of them", "funnel them into doing an action". |
| `getGuide({ useCase: "twitter/whoNeedsYou" })` | Finding who needs something from you, or who matters | "look through my messages and find someone who clearly needs something off me", "summarise everything on my twitter, how likely is it we make money", "who's worth following up". |
| `getGuide({ useCase: "web/competitorTraffic" })` | Competitor traffic: finding how to rank on your competitors' names | "find out all of our competitors", "what are we lacking", "go through the bhw mcp and see what they're saying", "compare this month to last month", "find who in my messages has a website for a backlink", "competitor pages that backlink to us", "make affiliate money through it", "run it through subq matrices", "do some deeper research" |

## The tools in this guide

| Tool | What it does |
|---|---|
| `inboxClaim` | Claim a chat for this session before drafting or sending in it, so no… |
| `inboxRelease` | Release this session's claim on a chat when it is done with it |
| `inboxResume` | matt's go-ahead after a refused catch-up |
| `inboxWaiting` | Who wrote last on every platform, from log.db in time order |
| `inboxClaims` | Every live claim |
| `inboxActions` | The log of every claim, refusal, send and release, oldest first, to… |
| `twitterDms` | Read an X account's direct messages, newest conversations first… |

## The work, step by step: xchatReplies

From `skills/xchatReplies/SKILL.md`.

## xchatReplies

X's own chat app never polls: it holds one socket and X pushes every message
down it (`docs/platforms/x/xchat/live.md`, issue #68). log does the same, so
replies show up the second they land and no inbox read ever hits X's 429.

### Hard boundaries

1. **Never poll the inbox to find replies.** The inbox hook keeps
   `log twitter chat watch --inbox` running per signed-in X account. Read a
   thread only to answer it.
2. **Claim the chat before drafting** (rule 133): `log inbox claim --platform
   twitter --account <a> --chat <conversation id> --event <event id>` (MCP
   `inboxClaim`), and read `log inbox actions --chat <id>` to see what was
   already done there. Another session holding it means leave it; the send
   releases the claim.
3. **Read everything with the person first:** `log twitter dms --account
   <a> --with <handle>` (the old DM thread and X Chat are one conversation,
   rule 88).
3. **Draft from matt's guide, with his facts only.** Read
   `C:/Users/tester/.buzz/GUIDES/MATT_WRITING_STYLE.md` before drafting. Lowercase,
   no commas or full stops, his words, almost never end on a question, no
   praise-then-pitch, nothing he didn't say (rules 39-41).
4. **Gate every draft:** `log voice --to <handle> --text "<draft>"
   --context "<what they said>"`. Rewrite until it says PASS.
5. **Show matt and send only when he says**, unless he has handed you the
   conversation (2026-10-28: "let the ai take over the conversation"). Then
   gate each reply and send it, and stop the moment he says it's over.

### The routine

```bash
## who wrote: the hook says it, pushed by X. To watch by hand:
log twitter chat watch --account matthewsoldit --seconds 600
## read them
log twitter dms --account matthewsoldit --with <handle>
## gate the draft
log voice --to <handle> --text "<draft>" --context "<what they said>"
## send, once matt says
log twitter dm --account matthewsoldit --userId <id> --text "<draft>" --approvedBy matt --live
```

### When it goes wrong

- `(could not open: … no matching key found …)`: the conversation's key
  wasn't primed. The watch re-reads the newest inbox page once and retries;
  if it still fails, restart the watch (it primes every key at start).
- `socket closed` / `connectFailed`: the watch takes a new token and
  reconnects on its own (2 s, doubling to 60 s).
- Nothing arriving: check `~/.logCli/inbox/twitter/<a>/watch.log` and
  `watch.pid`; delete the pid file and the next hook starts a fresh watch.
- X changed its code: re-read it with rea, the steps are in
  `docs/platforms/x/xchat/live.md`.

## Every tool, in full

### `inboxClaim`

Claim a chat for this session before drafting or sending in it, so no other session acts on it.
Claim a chat before acting on it, release it, list the live claims, and read the log of every action taken in a chat
log inbox claim --platform <twitter|discord|slack|instagram> --account <a> --chat <conversationId|handle> [--event <eventId>] [--json]
Only the session that claims a chat acts on it (rule 133). Every message the push channels bring in has an event id (shown in >>> NEW MESSAGE). claim takes the chat for this session for 10 minutes before you draft or send; a second session is refused (chatClaimedElsewhere). Every send claims the chat itself and releases it once it is sent, interrupted or failed, so two sessions never answer the same chat. A claim held by a session that ended frees itself. resume is matt's go-ahead after a refused catch-up (rule 94): the account's gap opens again and its owner catches up through its own session within 30 s; only when matt says so. claims lists who holds what; actions is the log of every claim, refusal, send and release, oldest first, to search what was already done in a chat before acting. waiting is who wrote last on every platform, read from log.db and nothing else: each chat's messages in time order (never the order they were stored in, since a backfill stores older messages later), one person's chats judged together (an X user's old DM and X Chat), a message mirrored into the other side counted once as whoever sent it first, reactions, read markers and call notices never counted as the last word. It lists the people waiting on a reply, then apart the ones who reacted to your last message (a follow-up), newest first unless --oldest.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/channelReply" }), getGuide({ useCase: "discord/serverReply" }), getGuide({ useCase: "inbox/bossMaxxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xInbox" }) (Reading an X account's DMs and X Chat as one inbox, synced by sequence id, and watching X Chat live).
AGENTS.md (log://agents): rules 94, 105, 109, 133, 134, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `inboxRelease`

Release this session's claim on a chat when it is done with it.
Claim a chat before acting on it, release it, list the live claims, and read the log of every action taken in a chat
log inbox release --platform <p> --account <a> --chat <conversationId|handle> [--json]
Only the session that claims a chat acts on it (rule 133). Every message the push channels bring in has an event id (shown in >>> NEW MESSAGE). claim takes the chat for this session for 10 minutes before you draft or send; a second session is refused (chatClaimedElsewhere). Every send claims the chat itself and releases it once it is sent, interrupted or failed, so two sessions never answer the same chat. A claim held by a session that ended frees itself. resume is matt's go-ahead after a refused catch-up (rule 94): the account's gap opens again and its owner catches up through its own session within 30 s; only when matt says so. claims lists who holds what; actions is the log of every claim, refusal, send and release, oldest first, to search what was already done in a chat before acting. waiting is who wrote last on every platform, read from log.db and nothing else: each chat's messages in time order (never the order they were stored in, since a backfill stores older messages later), one person's chats judged together (an X user's old DM and X Chat), a message mirrored into the other side counted once as whoever sent it first, reactions, read markers and call notices never counted as the last word. It lists the people waiting on a reply, then apart the ones who reacted to your last message (a follow-up), newest first unless --oldest.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/serverReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xInbox" }) (Reading an X account's DMs and X Chat as one inbox, synced by sequence id, and watching X Chat live).
AGENTS.md (log://agents): rules 94, 105, 109, 133, 134, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `inboxResume`

matt's go-ahead after a refused catch-up: the account catches up again through its own session (rule 94), only when matt says so.
Claim a chat before acting on it, release it, list the live claims, and read the log of every action taken in a chat
log inbox resume --platform <p> --account <a> --by matt [--json]
Only the session that claims a chat acts on it (rule 133). Every message the push channels bring in has an event id (shown in >>> NEW MESSAGE). claim takes the chat for this session for 10 minutes before you draft or send; a second session is refused (chatClaimedElsewhere). Every send claims the chat itself and releases it once it is sent, interrupted or failed, so two sessions never answer the same chat. A claim held by a session that ended frees itself. resume is matt's go-ahead after a refused catch-up (rule 94): the account's gap opens again and its owner catches up through its own session within 30 s; only when matt says so. claims lists who holds what; actions is the log of every claim, refusal, send and release, oldest first, to search what was already done in a chat before acting. waiting is who wrote last on every platform, read from log.db and nothing else: each chat's messages in time order (never the order they were stored in, since a backfill stores older messages later), one person's chats judged together (an X user's old DM and X Chat), a message mirrored into the other side counted once as whoever sent it first, reactions, read markers and call notices never counted as the last word. It lists the people waiting on a reply, then apart the ones who reacted to your last message (a follow-up), newest first unless --oldest.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/voiceNote" }), getGuide({ useCase: "twitter/dmInbox" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xInbox" }) (Reading an X account's DMs and X Chat as one inbox, synced by sequence id, and watching X Chat live).
AGENTS.md (log://agents): rules 94, 105, 109, 133, 134, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `inboxWaiting`

Who wrote last on every platform, from log.db in time order: the people waiting on a reply, and apart the ones who reacted to your last message.
Claim a chat before acting on it, release it, list the live claims, and read the log of every action taken in a chat
log inbox waiting [--platform <p>] [--account <a>] [--limit <n>] [--oldest] [--json]
Only the session that claims a chat acts on it (rule 133). Every message the push channels bring in has an event id (shown in >>> NEW MESSAGE). claim takes the chat for this session for 10 minutes before you draft or send; a second session is refused (chatClaimedElsewhere). Every send claims the chat itself and releases it once it is sent, interrupted or failed, so two sessions never answer the same chat. A claim held by a session that ended frees itself. resume is matt's go-ahead after a refused catch-up (rule 94): the account's gap opens again and its owner catches up through its own session within 30 s; only when matt says so. claims lists who holds what; actions is the log of every claim, refusal, send and release, oldest first, to search what was already done in a chat before acting. waiting is who wrote last on every platform, read from log.db and nothing else: each chat's messages in time order (never the order they were stored in, since a backfill stores older messages later), one person's chats judged together (an X user's old DM and X Chat), a message mirrored into the other side counted once as whoever sent it first, reactions, read markers and call notices never counted as the last word. It lists the people waiting on a reply, then apart the ones who reacted to your last message (a follow-up), newest first unless --oldest.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "xInbox" }) (Reading an X account's DMs and X Chat as one inbox, synced by sequence id, and watching X Chat live).
AGENTS.md (log://agents): rules 94, 105, 109, 133, 134, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `inboxClaims`

Every live claim: which session holds which chat, and until when.
Claim a chat before acting on it, release it, list the live claims, and read the log of every action taken in a chat
log inbox claims [--json]
Only the session that claims a chat acts on it (rule 133). Every message the push channels bring in has an event id (shown in >>> NEW MESSAGE). claim takes the chat for this session for 10 minutes before you draft or send; a second session is refused (chatClaimedElsewhere). Every send claims the chat itself and releases it once it is sent, interrupted or failed, so two sessions never answer the same chat. A claim held by a session that ended frees itself. resume is matt's go-ahead after a refused catch-up (rule 94): the account's gap opens again and its owner catches up through its own session within 30 s; only when matt says so. claims lists who holds what; actions is the log of every claim, refusal, send and release, oldest first, to search what was already done in a chat before acting. waiting is who wrote last on every platform, read from log.db and nothing else: each chat's messages in time order (never the order they were stored in, since a backfill stores older messages later), one person's chats judged together (an X user's old DM and X Chat), a message mirrored into the other side counted once as whoever sent it first, reactions, read markers and call notices never counted as the last word. It lists the people waiting on a reply, then apart the ones who reacted to your last message (a follow-up), newest first unless --oldest.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "xInbox" }) (Reading an X account's DMs and X Chat as one inbox, synced by sequence id, and watching X Chat live).
AGENTS.md (log://agents): rules 94, 105, 109, 133, 134, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `inboxActions`

The log of every claim, refusal, send and release, oldest first, to see what was already done in a chat.
Claim a chat before acting on it, release it, list the live claims, and read the log of every action taken in a chat
log inbox actions [--platform <p>] [--account <a>] [--chat <conversationId|handle>] [--limit <n>] [--json]
Only the session that claims a chat acts on it (rule 133). Every message the push channels bring in has an event id (shown in >>> NEW MESSAGE). claim takes the chat for this session for 10 minutes before you draft or send; a second session is refused (chatClaimedElsewhere). Every send claims the chat itself and releases it once it is sent, interrupted or failed, so two sessions never answer the same chat. A claim held by a session that ended frees itself. resume is matt's go-ahead after a refused catch-up (rule 94): the account's gap opens again and its owner catches up through its own session within 30 s; only when matt says so. claims lists who holds what; actions is the log of every claim, refusal, send and release, oldest first, to search what was already done in a chat before acting. waiting is who wrote last on every platform, read from log.db and nothing else: each chat's messages in time order (never the order they were stored in, since a backfill stores older messages later), one person's chats judged together (an X user's old DM and X Chat), a message mirrored into the other side counted once as whoever sent it first, reactions, read markers and call notices never counted as the last word. It lists the people waiting on a reply, then apart the ones who reacted to your last message (a follow-up), newest first unless --oldest.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "xInbox" }) (Reading an X account's DMs and X Chat as one inbox, synced by sequence id, and watching X Chat live).
AGENTS.md (log://agents): rules 94, 105, 109, 133, 134, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterDms`

Read an X account's direct messages, newest conversations first, sending nothing.
Read an X account's direct messages and who is waiting on a reply, on the direct-API engine, sending nothing
log twitter dms --account <accountName> [--limit <n>] [--waiting] [--with <handle>] [--conversation <id>] [--full] [--force] [--json]
Reads the account's X direct messages on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Sends nothing and marks nothing read.
Without --conversation it syncs the inbox the way X's own chat app does (dm-core): the first read takes the whole X Chat inbox (GetInitialXChatPageQuery, then GetInboxPageRequestQuery pages) and the old DM inbox (dm/inbox_initial_state, then dm/inbox_timeline pages, 1.5 s apart) and keeps them in ~/.logCli/twitter/<account>/inboxSync.json with the newest event's sequence id; every read after that asks X only for what is newer (GetMessageEventsPageQuery from that sequence id, beside one dm/inbox_initial_state), unlocks the PIN and decrypts only when something is new, opening just those conversations' keys (GetInboxPageConversationDataQuery), and keeps each event once by its id. --full reads everything again. Each read saves its conversations for log search and updates the search index in the background with only the chunks that changed. It then lists the newest conversations first, one row per person (their old DM thread and X Chat thread merged): who, when, the last message from either and whether it was yours. --waiting keeps only the ones whose last message isn't yours, the people waiting on a reply, and lists apart the ones that opened your last message, by reacting to it or reading it without replying (read receipts, where the person keeps them on): so each is a follow-up to send, not a reply they're waiting on (--json: followUps). --conversation <id> reads one conversation's messages, oldest first: a legacy id (two user ids joined by a dash) through dm/conversation, an X Chat id (joined by a colon) the same way --with reads it, never the whole inbox.
--with <handle> reads everything with one person by their handle and nobody else: their user id, their legacy thread (dm/conversation) and their X Chat thread (read the way X's own chat app opens a chat, from its dm-core: GetInboxPageConversationDataQuery for that one conversation, then GetConversationPageQuery from the oldest message held, its fetchOlderMessages, up to 5 pages 1.5 s apart while X says there is more), merged into one timeline, oldest first, a message mirrored into both shown once. It never reads the whole inbox. A 429 stops the read with nothing retried, as X's app does (it retries only 5xx), and pauses the account's governor (rule 94). X Chat (encrypted DMs) is opened with the account's X Chat PIN from Twenty (`log twitter chat pin`), recovered through Juicebox by the vendored chat-xdk; without a PIN its text stays encrypted. An old DM thread (<a>-<b>) and its X Chat thread (<a>:<b>) with one person are one conversation: X shows them in the same place, and a dm sent through the old DM API shows in their X Chat too. A sent answer is delivered whichever conversation id it names: never resend it and never call it the wrong inbox. X's own answer decides: the session check first, then the inbox's answer. --limit is how many conversations (or messages) to show, default 20, at most 200.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/bossMaxxing" }), getGuide({ useCase: "inbox/reaLooksmaxxing" }), getGuide({ useCase: "inbox/reactions" }), getGuide({ useCase: "twitter/affiliateMarketing" }), getGuide({ useCase: "twitter/collabMaxxing" }), getGuide({ useCase: "twitter/dmInbox" }), getGuide({ useCase: "twitter/engagerDms" }), getGuide({ useCase: "twitter/followUps" }), getGuide({ useCase: "twitter/getTheAction" }), getGuide({ useCase: "twitter/managerMaxxing" }), getGuide({ useCase: "twitter/networkMaxing" }), getGuide({ useCase: "twitter/replyGuyFunnel" }), getGuide({ useCase: "twitter/whoNeedsYou" }), getGuide({ useCase: "web/competitorTraffic" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xInbox" }) (Reading an X account's DMs and X Chat as one inbox, synced by sequence id, and watching X Chat live).
AGENTS.md (log://agents): rules 175, 63, 2, 73, 83, 89, 94, 109, 105, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From the current AGENTS.md (`log://agents`). Historical citations are consolidated; archived instructions do not override the active scope.

**Rule 2.** 2026-10-18 · Put platform code under src/<platform>/<area>/<domain>; shared code stays in its shared library/domain. Use index.ts, types.ts, client.ts, machine.ts and helpers where appropriate. Keep scripts and Python in domain folders.

**Rule 30.** 2026-10-19 · Complete the authorized task. Do not repeatedly request confirmation already given. Distinguish implemented behavior, proposed contracts and unverified assumptions.

**Rule 38.** 2026-10-19 · Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless Matt raises them.

**Rule 39.** 2026-10-19 · Use only the scope, options and intent Matt stated or implied. Do not add unrelated alternatives to research, comparisons, plans or implementation.

**Rule 40.** 2026-10-19 · Do not propose physical infrastructure unless Matt asks. His available implementation scope is hosted/cloud environments and the tools already selected.

**Rule 41.** 2026-10-19 · Paid work must stay within the authorized task and spend. Ask before adding a paid operation he did not authorize; do not substitute a new paid provider implicitly.

**Rule 63.** 2026-10-22 · Platform commands are log <platform> <command> <what>. Shared commands remain shared. Preserve the naming boundary described in docs/commandNaming.md.

**Rule 73.** 2026-10-23 · For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence. Use the existing REA/SubQ reading workflow when applicable, report the unknown state, write Point/Evidence/Explain and the fix, then name the state. Preserve paid-work scope. This runtime analysis does not add SubQ to commit/CI gates.

**Rule 83.** 2026-10-25 · New platforms use the existing scaffold, shared account/session boundary, command/catalog wiring, platform documentation and spec anchors. Native hosted scaffolds must not recreate a Twenty dependency.

**Rule 89.** 2026-10-26 · Find conversational context by scoped search and existing private records. Do not reread every thread for a single person or task.

**Rule 94.** 2026-10-29 · Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies. A refusal, failed send, 429, block, disable, captcha or cooldown stops that run/account until Matt authorizes continuation. Do not retry through refusals. Bulk reading and sending are separate sessions; cold DMs stay a few a day, minutes apart, and opening a DM counts as a write.

**Rule 105.** 2026-11-01 · One platform/account owns one continuous engine session and push connection. Reads, writes, queues and watches share that owner through existing relay/serialization. Never open a parallel client to bypass the owner or its governor.

**Rule 109.** 2026-11-01 · Read the full relevant chat and current private context before drafting or sending. Include media/transcript/attachment context and pending queued actions; hold a send if required context cannot be obtained. Follow the selected channel's voice and task-brief contract. Cold outreach excludes existing conversations through the current prior-conversation check; bypass it only when Matt asks.

**Rule 133.** 2026-11-04 · Claim a chat before acting; consult recent actions, preserve claim generation and check it before subsequent message parts. A lost claim stops the remaining send. Release when done; retain claim/action evidence in the existing private store.

**Rule 134.** 2026-11-04 · Existing workspace log.db is the native private record/coordination foundation. Preserve events, stable identities, chats/messages, attachments/interactions, claims/owners/cursors, queues/jobs, media/search and records/state. Keep current WAL/migration/version semantics and transaction boundaries; unknown events retain source payload and are surfaced for analysis. Only proven projections are rebuildable.

**Rule 138.** 2026-11-04 · Media and voice-note context uses the existing private media descriptions and transcripts. Do not claim to have understood undescribed media. Preserve hash-based deduplication, private storage and the one describer process.

**Rule 175.** 2026-11-11 · Use existing log.db and platform-agnostic engine contracts for native schemas. Do not copy Twenty agency prefixes or CRM/SMS structures. Old listing/campaign functionality is deferred. Add only missing account/credential and hosted execution contracts; preserve existing identity, message, queue, job and governor authorities.
