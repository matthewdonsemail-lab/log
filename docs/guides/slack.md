# slack

A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 55). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Current scope

This guide describes the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "inbox/bossMaxxing" })` | Bossmaxxing: giving out tasks to the team | "bossmaxxing", "give out the tasks", "send <person> the task in <group> and tag them", "tell <person> about everything I researched and give them an outline", "triage the jobs across the team", "walk <person> through setting up <tool>", "help <person> get set up like we did with <other person>" |
| `getGuide({ useCase: "inbox/reactions" })` | Reacting to a message | "react to that", "heart his message", "put a 😂 on what she said", "send a reaction to <person>" |
| `getGuide({ useCase: "inbox/scopeAJob" })` | Scoping a job out of someone in a DM | "probe <person> so we can scope out what the task is", "scope it out with him", "find out what he actually wants done", "go through and then scope it out". |
| `getGuide({ useCase: "inbox/triage" })` | Triage: scoping someone's job and handing it to whoever does it | "triage this", "scope it out with him and pass it to <person>", "inform <person> of what the job is and what he needs to do", "we've already scoped the work with the client, hand it over", "this is a triage job", "don't tell him anyone else is doing it" |
| `getGuide({ useCase: "inbox/voiceNote" })` | Sending a voice note | "send <person> a voice note saying …", "voice note him that …", "send a vn to the group saying …" |
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
| `slackReact` | React to a Slack message with an emoji, on the direct-API engine |
| `slackReactLive` | React to a Slack message with an emoji, on the…, live on Slack |
| `slackVoice` | Send a voice note in matt's cloned voice as Slack's own voice note… |
| `slackVoiceLive` | Send a voice note in matt's cloned voice as Slack's…, live on Slack |

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
AGENTS.md (log://agents): rules 175, 63, 2, 73, 83, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `slackWorkspaces`

The workspaces the account is signed in to, with their domains.
List the workspaces a Slack account is signed in to, on the direct-API engine, sending nothing
log slack workspaces --account <accountName> [--json]
Lists the workspaces the account's d cookie is signed in to, on the direct-API engine (Slack's own cookie exchange, vendor/gabrielSlack, no browser): each one's id, name and domain, the domain being what --workspace takes. Sends nothing.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "slack/dmReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "slack" }) (A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending).
AGENTS.md (log://agents): rules 175, 63, 2, 73, 83, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `slackChats`

The account's DMs and group DMs in a workspace, with their ids.
List a Slack account's DMs and group DMs in a workspace with their ids, on the direct-API engine, sending nothing
log slack chats --account <accountName> [--workspace <domain>] [--limit <n>] [--json]
Lists the account's DMs and group DMs in one workspace with their ids and who they are with, newest first, on the direct-API engine (vendor/gabrielSlack, conversations.list, no browser). Sends nothing.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/bossMaxxing" }), getGuide({ useCase: "slack/dmReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "slack" }) (A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending).
AGENTS.md (log://agents): rules 175, 63, 2, 73, 83, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `slackRead`

A Slack chat's latest messages, oldest first, sending nothing.
Read a Slack chat's latest messages, on the direct-API engine, sending nothing
log slack read --account <accountName> --chat <chatId|who it is with> [--workspace <domain>] [--limit <n>] [--json]
Reads a DM, group DM or channel's latest messages, oldest first, on the direct-API engine (vendor/gabrielSlack, conversations.history, no browser): who sent each, when, its text and its thread. Sends nothing, and marks nothing read.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/bossMaxxing" }), getGuide({ useCase: "inbox/reactions" }), getGuide({ useCase: "inbox/scopeAJob" }), getGuide({ useCase: "inbox/triage" }), getGuide({ useCase: "inbox/voiceNote" }), getGuide({ useCase: "slack/dmReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "slack" }) (A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending).
AGENTS.md (log://agents): rules 175, 63, 2, 73, 83, 94, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `slackWatch`

Every Slack event as the workspace's websocket pushes it, sending nothing.
Watch a Slack workspace's events as its websocket pushes them, nothing polled, sending nothing
log slack watch --account <accountName> [--workspace <domain>] [--chat <chatId|who it is with>] [--seconds <s>] [--inbox] [--json]
Opens each workspace's own websocket on the direct-API engine (vendor/gabrielSlack, wss-primary.slack.com, no browser), every workspace the session is signed in to unless --workspace names one, and prints each message, typing, read marker, reaction and draft the moment Slack pushes it, nothing polled. --chat keeps one chat; --seconds stops after that long (at least 5), otherwise it runs until stopped. --inbox hands each new DM, group message or mention of the account from someone else to the inbox hook, which puts it in front of the agent with what to do next (rule 123). Sends nothing.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "slack" }) (A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending).
AGENTS.md (log://agents): rules 175, 26, 63, 2, 73, 83, 94, 123, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `slackSend`

Send a message on Slack, on the direct-API engine; a dry run unless --live.
Send a message to a Slack DM, group or channel, on the direct-API engine; a dry run unless --live
log slack send --account <accountName> --chat <chatId|who it is with> --text "<message>" [--workspace <domain>] [--asOne] [--approvedBy <who>] [--live] [--json]
Sends a message to a Slack DM, group DM or channel (by its id, or who it is with from log slack chats), on the direct-API engine (vendor/gabrielSlack, chat.postMessage, no browser).
A draft written on several lines goes out one message per line (rule 90); a one-line draft is split the way matt writes in that chat (log voice index), and --asOne always sends one. Without --live it is a dry run and Slack is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). Slack's answer decides: a ts is sent, anything else stops the run with nothing retried (rule 94). The governor counts each message as a write. The copy is read for what AI chat interfaces leave in text first (rule 111): hidden characters, odd spaces or pasted Claude HTML refuse it with aiArtifacts.
Fill the named fields; each value goes through whole. What acts on Slack is `slackSendLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "slack" }) (A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 90, 94, 137, 105, 133, 134, 109, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `slackSendLive`

Send a message on Slack, on the direct-API engine; a dry run unless --live.
Live on Slack: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Send a message to a Slack DM, group or channel, on the direct-API engine; a dry run unless --live
log slack send --account <accountName> --chat <chatId|who it is with> --text "<message>" [--workspace <domain>] [--asOne] [--approvedBy <who>] [--live] [--json]
Sends a message to a Slack DM, group DM or channel (by its id, or who it is with from log slack chats), on the direct-API engine (vendor/gabrielSlack, chat.postMessage, no browser).
A draft written on several lines goes out one message per line (rule 90); a one-line draft is split the way matt writes in that chat (log voice index), and --asOne always sends one. Without --live it is a dry run and Slack is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). Slack's answer decides: a ts is sent, anything else stops the run with nothing retried (rule 94). The governor counts each message as a write. The copy is read for what AI chat interfaces leave in text first (rule 111): hidden characters, odd spaces or pasted Claude HTML refuse it with aiArtifacts.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/bossMaxxing" }), getGuide({ useCase: "slack/dmReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "slack" }) (A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 90, 94, 137, 105, 133, 134, 109, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `slackReact`

React to a Slack message with an emoji, on the direct-API engine; a dry run unless --live.
React to a Slack message with an emoji, on the direct-API engine; a dry run unless --live
log slack react --account <accountName> --chat <chat> --message <id> --emoji <emoji> [--workspace <workspace>] [--remove] [--approvedBy <who>] [--live] [--json]
Reacts to one message with an emoji, on the direct-API engine (vendor/gabrielSlack, reactions.add and reactions.remove, no browser), or takes the account's own reaction off with --remove. Slack reacts by name (joy, fire, eyes, or a workspace's own); the common emoji are turned into their names, and one it doesn't know is refused with reactInvalid, so give its name. Already reacted counts as done.
Without --live it is a dry run and nothing is contacted. --live reacts, only when matt asked, and needs --approvedBy (rule 8). The chat is claimed first, as for a send, and released once it is done (rule 133). The platform's own answer decides (rule 73), the governor counts it as a write, and a refusal stops with nothing retried (rule 94).
Fill the named fields; each value goes through whole. What acts on Slack is `slackReactLive`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/reactions" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "slack" }) (A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 94, 133, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `slackReactLive`

React to a Slack message with an emoji, on the direct-API engine; a dry run unless --live.
Live on Slack: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
React to a Slack message with an emoji, on the direct-API engine; a dry run unless --live
log slack react --account <accountName> --chat <chat> --message <id> --emoji <emoji> [--workspace <workspace>] [--remove] [--approvedBy <who>] [--live] [--json]
Reacts to one message with an emoji, on the direct-API engine (vendor/gabrielSlack, reactions.add and reactions.remove, no browser), or takes the account's own reaction off with --remove. Slack reacts by name (joy, fire, eyes, or a workspace's own); the common emoji are turned into their names, and one it doesn't know is refused with reactInvalid, so give its name. Already reacted counts as done.
Without --live it is a dry run and nothing is contacted. --live reacts, only when matt asked, and needs --approvedBy (rule 8). The chat is claimed first, as for a send, and released once it is done (rule 133). The platform's own answer decides (rule 73), the governor counts it as a write, and a refusal stops with nothing retried (rule 94).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/reactions" }), getGuide({ useCase: "slack/dmReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "slack" }) (A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 94, 133, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `slackVoice`

Send a voice note in matt's cloned voice as Slack's own voice note, from text; a dry run unless --live.
Send a voice note in matt's cloned voice as Slack's own voice note, from text; a dry run unless --live
log slack voice --account <accountName> --chat <chat> --text "<what matt says>" [--workspace <workspace>] [--provider inworld|fishAudio] [--mattsWords] [--translationOf "<what it translates>" --language <code>] [--approvedBy <who>] [--live] [--json]
Sends a voice note in matt's cloned voice (the voice provider, log clone voice) as slack's own voice note: an audio file shared into the chat through Slack's own upload (files.getUploadURLExternal, the bytes, files.completeUploadExternal), which Slack plays inline. It takes text only, never an audio file: the words are said in his voice, converted with ffmpeg to AAC in .m4a and uploaded on the direct-API engine through the account's one session (vendor/gabrielSlack on curl_cffi, no browser).
A voice note goes out only when matt asks for one (rule 142). The provider is --provider, else LOG_VOICE_PROVIDER, else inworld; the command only ever calls the shared voice layer (rule 143). Without --live it is a dry run: nothing is generated and nothing is contacted. --live needs --approvedBy (rule 8). It says and converts the note while the account catches up (rule 135) and the text goes through the voice gate every send runs (rule 137), so a note that passes goes out without waiting for it to be made; one the gate refuses is never sent. It then claims the chat (rule 133) and releases it after. The governor counts it as a write, the platform's answer decides (rule 73), and a refusal stops with nothing retried (rule 94).
--mattsWords says the text is matt's own words, dictated by him for this voice note: the voice gate's read is skipped, since it grades speech as typed text and as a reply, while the AI artifact check still runs and refuses aiArtifacts (rule 144).
--translationOf "<what it translates>" says the text is a translation, only when matt asked for one: the voice gate grades those original words (his own language, which the gate reads) instead of the translation, which it can't match to his writing; both are read for AI artifacts. --language <code> (zh-CN, es-ES ...) is the language the clone speaks it in, instead of the clone's own, and it is needed with --translationOf (rule 148).
Fill the named fields; each value goes through whole. What acts on Slack is `slackVoiceLive`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/voiceNote" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "slack" }) (A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 94, 133, 109, 137, 142, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `slackVoiceLive`

Send a voice note in matt's cloned voice as Slack's own voice note, from text; a dry run unless --live.
Live on Slack: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Send a voice note in matt's cloned voice as Slack's own voice note, from text; a dry run unless --live
log slack voice --account <accountName> --chat <chat> --text "<what matt says>" [--workspace <workspace>] [--provider inworld|fishAudio] [--mattsWords] [--translationOf "<what it translates>" --language <code>] [--approvedBy <who>] [--live] [--json]
Sends a voice note in matt's cloned voice (the voice provider, log clone voice) as slack's own voice note: an audio file shared into the chat through Slack's own upload (files.getUploadURLExternal, the bytes, files.completeUploadExternal), which Slack plays inline. It takes text only, never an audio file: the words are said in his voice, converted with ffmpeg to AAC in .m4a and uploaded on the direct-API engine through the account's one session (vendor/gabrielSlack on curl_cffi, no browser).
A voice note goes out only when matt asks for one (rule 142). The provider is --provider, else LOG_VOICE_PROVIDER, else inworld; the command only ever calls the shared voice layer (rule 143). Without --live it is a dry run: nothing is generated and nothing is contacted. --live needs --approvedBy (rule 8). It says and converts the note while the account catches up (rule 135) and the text goes through the voice gate every send runs (rule 137), so a note that passes goes out without waiting for it to be made; one the gate refuses is never sent. It then claims the chat (rule 133) and releases it after. The governor counts it as a write, the platform's answer decides (rule 73), and a refusal stops with nothing retried (rule 94).
--mattsWords says the text is matt's own words, dictated by him for this voice note: the voice gate's read is skipped, since it grades speech as typed text and as a reply, while the AI artifact check still runs and refuses aiArtifacts (rule 144).
--translationOf "<what it translates>" says the text is a translation, only when matt asked for one: the voice gate grades those original words (his own language, which the gate reads) instead of the translation, which it can't match to his writing; both are read for AI artifacts. --language <code> (zh-CN, es-ES ...) is the language the clone speaks it in, instead of the clone's own, and it is needed with --translationOf (rule 148).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/voiceNote" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "slack" }) (A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 94, 133, 109, 137, 142, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From the current AGENTS.md (`log://agents`). Historical citations are consolidated; archived instructions do not override the active scope.

**Rule 2.** 2026-10-18 · Put platform code under src/<platform>/<area>/<domain>; shared code stays in its shared library/domain. Use index.ts, types.ts, client.ts, machine.ts and helpers where appropriate. Keep scripts and Python in domain folders.

**Rule 8.** 2026-10-18 · Platform actions require the user authorization their tool defines. Send, post, react, join, edit and delete only when authorized; preserve explicit live confirmation, governor and account gates. Ordinary reads do not need new approval.

**Rule 26.** 2026-10-19 · Stream progress while work runs, one meaningful line per stage, with the run log retained. Explain stages in plain words; do not leave the user waiting silently for a final buffered result.

**Rule 30.** 2026-10-19 · Complete the authorized task. Do not repeatedly request confirmation already given. Distinguish implemented behavior, proposed contracts and unverified assumptions.

**Rule 38.** 2026-10-19 · Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless Matt raises them.

**Rule 39.** 2026-10-19 · Use only the scope, options and intent Matt stated or implied. Do not add unrelated alternatives to research, comparisons, plans or implementation.

**Rule 40.** 2026-10-19 · Do not propose physical infrastructure unless Matt asks. His available implementation scope is hosted/cloud environments and the tools already selected.

**Rule 41.** 2026-10-19 · Paid work must stay within the authorized task and spend. Ask before adding a paid operation he did not authorize; do not substitute a new paid provider implicitly.

**Rule 63.** 2026-10-22 · Platform commands are log <platform> <command> <what>. Shared commands remain shared. Preserve the naming boundary described in docs/commandNaming.md.

**Rule 73.** 2026-10-23 · For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence. Use the existing REA/SubQ reading workflow when applicable, report the unknown state, write Point/Evidence/Explain and the fix, then name the state. Preserve paid-work scope. This runtime analysis does not add SubQ to commit/CI gates.

**Rule 83.** 2026-10-25 · New platforms use the existing scaffold, shared account/session boundary, command/catalog wiring, platform documentation and spec anchors. Native hosted scaffolds must not recreate a Twenty dependency.

**Rule 90.** 2026-10-28 · Preserve platform message splitting: draft lines send as separate messages unless Matt explicitly requests the supported asOne behavior.

**Rule 94.** 2026-10-29 · Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies. A refusal, failed send, 429, block, disable, captcha or cooldown stops that run/account until Matt authorizes continuation. Do not retry through refusals. Bulk reading and sending are separate sessions; cold DMs stay a few a day, minutes apart, and opening a DM counts as a write.

**Rule 105.** 2026-11-01 · One platform/account owns one continuous engine session and push connection. Reads, writes, queues and watches share that owner through existing relay/serialization. Never open a parallel client to bypass the owner or its governor.

**Rule 109.** 2026-11-01 · Read the full relevant chat and current private context before drafting or sending. Include media/transcript/attachment context and pending queued actions; hold a send if required context cannot be obtained. Follow the selected channel's voice and task-brief contract. Cold outreach excludes existing conversations through the current prior-conversation check; bypass it only when Matt asks.

**Rule 123.** 2026-11-03 · Platforms use their existing push/watch path to keep private records current. Catch up gaps through the account owner and resume only with valid generation/position; do not poll the whole inbox independently per caller.

**Rule 133.** 2026-11-04 · Claim a chat before acting; consult recent actions, preserve claim generation and check it before subsequent message parts. A lost claim stops the remaining send. Release when done; retain claim/action evidence in the existing private store.

**Rule 134.** 2026-11-04 · Existing workspace log.db is the native private record/coordination foundation. Preserve events, stable identities, chats/messages, attachments/interactions, claims/owners/cursors, queues/jobs, media/search and records/state. Keep current WAL/migration/version semantics and transaction boundaries; unknown events retain source payload and are surfaced for analysis. Only proven projections are rebuildable.

**Rule 137.** 2026-11-04 · Preserve current context-aware voice and AI-artifact gates for messages sent as Matt. Rework refused drafts from the stated cause. Exact-message overrides and dictated/translated voice-note exceptions require Matt's request and preserve remaining artifact checks. Do not treat an exception as permanent permission.

**Rule 138.** 2026-11-04 · Media and voice-note context uses the existing private media descriptions and transcripts. Do not claim to have understood undescribed media. Preserve hash-based deduplication, private storage and the one describer process.

**Rule 142.** 2026-11-05 · Send a cloned voice note only when Matt asks, through the platform's native voice-note tool and existing provider adapter. Use his authorized words, requested language/translation and pronunciation checks. Follow the voice-note guide for exact behavior; do not turn historical sample/model choices into a new global deployment requirement.

**Rule 175.** 2026-11-11 · Use existing log.db and platform-agnostic engine contracts for native schemas. Do not copy Twenty agency prefixes or CRM/SMS structures. Old listing/campaign functionality is deferred. Add only missing account/credential and hosted execution contracts; preserve existing identity, message, queue, job and governor authorities.
