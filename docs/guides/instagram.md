# instagram

An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 55). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Current scope

This guide describes the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "inbox/bossMaxxing" })` | Bossmaxxing: giving out tasks to the team | "bossmaxxing", "give out the tasks", "send <person> the task in <group> and tag them", "tell <person> about everything I researched and give them an outline", "triage the jobs across the team", "walk <person> through setting up <tool>", "help <person> get set up like we did with <other person>" |
| `getGuide({ useCase: "inbox/reaLooksmaxxing" })` | /rea-looksmaxxing: moneymaxx like a creator | "/rea-looksmaxxing how clavicular gets paid", "moneymaxx like <creator>", "how does <creator> get paid" |
| `getGuide({ useCase: "inbox/reactions" })` | Reacting to a message | "react to that", "heart his message", "put a 😂 on what she said", "send a reaction to <person>" |
| `getGuide({ useCase: "inbox/scopeAJob" })` | Scoping a job out of someone in a DM | "probe <person> so we can scope out what the task is", "scope it out with him", "find out what he actually wants done", "go through and then scope it out". |
| `getGuide({ useCase: "inbox/voiceNote" })` | Sending a voice note | "send <person> a voice note saying …", "voice note him that …", "send a vn to the group saying …" |
| `getGuide({ useCase: "instagram/dmReply" })` | Reading and answering an Instagram DM | "read my instagram dms", "what did <someone> say on instagram", "reply to <someone> on instagram", "send <someone> a meme on instagram" |

## The tools in this guide

| Tool | What it does |
|---|---|
| `instagramSessionCheck` | Check that Instagram still accepts one account's saved session… |
| `instagramDms` | An Instagram account's DM threads, or one thread's messages with… |
| `instagramSend` | Send text and a photo to an Instagram DM |
| `instagramSendLive` | Send text and a photo to an Instagram DM, live on Instagram |
| `instagramWatch` | Every Instagram DM as Instagram's realtime connection pushes it… |
| `instagramReact` | React to a Instagram message with an emoji, on the direct-API engine |
| `instagramReactLive` | React to a Instagram message with an emoji, on the…, live on Instagram |
| `instagramVoice` | Send a voice note in matt's cloned voice as Instagram's own voice… |
| `instagramVoiceLive` | Send a voice note in matt's cloned voice as…, live on Instagram |

## The work, step by step: instagram

From `skills/instagram/SKILL.md`.

## instagram

Instagram is worked over the MCP, on the direct-API engine (`python/instagramApi`,
vendor/instagrapi), never in the account's AdsPower browser (rule 128).

### Hard boundaries

1. **Never the browser.** Every Instagram action is an MCP tool: `instagramDms`,
   `instagramSend` / `instagramSendLive`, `instagramWatch`,
   `instagramSessionCheck`. An action the engine doesn't have yet is built on the
   engine first (rule 128).
2. **One session per account.** Every call goes through the account's one
   session host (`python/instagramApi/host.py`): one client signed in once, one
   realtime connection. Never start a second process for it. A call that can't
   reach the host is refused with `instagramSessionHostDown` (rule 129).
3. **Claim the chat before drafting** with `inboxClaim` (rule 133); a chat
   another session holds is left to it, and the send releases the claim.
4. **Read them first.** Read the person's whole thread before drafting
   (`instagramDms` { with }), rule 109.
5. **Gate every draft** with `voice` { to, with, context, text } until it passes.
6. **Send once, and stop if they write.** A multi-line draft goes out one
   message per line, and the send stops the moment they write back
   (`>>> INTERRUPTED`): answer them, never resend (rules 90, 130). Any refusal
   stops the run (rule 94).
7. **Live needs matt.** `instagramSendLive` needs `approvedBy` and
   `confirmLive: true` (rule 8).

### The routine

```text
instagramSessionCheck { account }                    the session is still good
instagramDms { account }                             the threads, newest first, ● unread
instagramDms { account, with: "<handle|thread>" }    one thread, oldest first; kept for log search and the voice index
voice { to, with, context }                          how matt writes there
voice { to, with, context, text }                    gate the draft
instagramSendLive { account, with, text, approvedBy: "matt", confirmLive: true }
instagramSendLive { account, with, photo: "<file>", text, ... }   a meme goes as a photo
```

### The live side

The inbox hook keeps `log instagram watch` running for every signed-in Instagram
account. It holds Instagram's own realtime connection (MQTT to
edge-mqtt.facebook.com, the DM sync subscribed) on the session host, and every
new DM lands in `~/.logCli/inbox/pending.jsonl` and reaches the agent as
`>>> NEW INSTAGRAM MESSAGE` (rule 123). An agent following a conversation keeps a
Monitor on that file (rule 130).

### Where things are

- Commands: `src/cli/instagram/index.ts`. Session: `src/instagram/account/session`.
- Engine and host: `python/instagramApi/engine.py`, `python/instagramApi/host.py`.
- Transport: every HTTP call through curl_cffi (`check:instagramTransport`); the
  realtime MQTT socket is the one exception.
- Use cases: `docs/useCases/instagram/dmReply.md`, `newPlatform.md`.
- Spec: `docs/specs/instagram.md`. Platform page: `docs/platforms/instagram/README.md`.

## Every tool, in full

### `instagramSessionCheck`

Check that Instagram still accepts one account's saved session, sending nothing.
Check that Instagram still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty
log instagram session check --account <accountName> [--json]
Checks that Instagram still accepts the account's saved session, on the direct-API engine (instagrapi, no browser). Sends nothing.
Instagram's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/reaLooksmaxxing" }), getGuide({ useCase: "instagram/dmReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "instagram" }) (An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch).
AGENTS.md (log://agents): rules 175, 63, 2, 73, 83, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `instagramDms`

An Instagram account's DM threads, or one thread's messages with --with, sending nothing.
Read an Instagram account's DMs: its threads, or one thread's messages with --with, on the direct-API engine, sending nothing
log instagram dms --account <accountName> [--with <handle|thread name|thread id>] [--limit <n>] [--json]
Without --with, lists the account's Instagram DM threads, newest first: who each is with, its last message and whether it is unread. With --with, reads that one thread's latest messages, oldest first.
On the direct-API engine (vendor/instagrapi, direct_threads and direct_thread, no browser). Sends nothing, and marks nothing seen.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/bossMaxxing" }), getGuide({ useCase: "inbox/reaLooksmaxxing" }), getGuide({ useCase: "inbox/reactions" }), getGuide({ useCase: "inbox/scopeAJob" }), getGuide({ useCase: "inbox/voiceNote" }), getGuide({ useCase: "instagram/dmReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "instagram" }) (An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch).
AGENTS.md (log://agents): rules 175, 63, 2, 73, 83, 94, 138, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `instagramSend`

Send text and a photo to an Instagram DM; a dry run unless --live.
Send text and a photo to an Instagram DM, on the direct-API engine; a dry run unless --live
log instagram send --account <accountName> --with <handle|thread name|thread id> [--text "<message>"] [--photo <file>] [--asOne] [--approvedBy <who>] [--live] [--json]
Sends to an Instagram DM on the direct-API engine (vendor/instagrapi, no browser): --with is matched to one thread by handle, name or id, or to a new DM with that handle. --photo sends a picture first (direct_send_photo), then the text one message per line (rule 90), --asOne as one message.
Without --live it is a dry run and Instagram is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). Instagram's answer decides: each message comes back with its id, anything else stops the run with nothing retried (rule 94). The copy is read for what AI chat interfaces leave in text first (rule 111).
Fill the named fields; each value goes through whole. What acts on Instagram is `instagramSendLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "instagram" }) (An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 90, 94, 137, 105, 133, 109, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `instagramSendLive`

Send text and a photo to an Instagram DM; a dry run unless --live.
Live on Instagram: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Send text and a photo to an Instagram DM, on the direct-API engine; a dry run unless --live
log instagram send --account <accountName> --with <handle|thread name|thread id> [--text "<message>"] [--photo <file>] [--asOne] [--approvedBy <who>] [--live] [--json]
Sends to an Instagram DM on the direct-API engine (vendor/instagrapi, no browser): --with is matched to one thread by handle, name or id, or to a new DM with that handle. --photo sends a picture first (direct_send_photo), then the text one message per line (rule 90), --asOne as one message.
Without --live it is a dry run and Instagram is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). Instagram's answer decides: each message comes back with its id, anything else stops the run with nothing retried (rule 94). The copy is read for what AI chat interfaces leave in text first (rule 111).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/bossMaxxing" }), getGuide({ useCase: "inbox/reaLooksmaxxing" }), getGuide({ useCase: "instagram/dmReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "instagram" }) (An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 90, 94, 137, 105, 133, 109, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `instagramWatch`

Every Instagram DM as Instagram's realtime connection pushes it, sending nothing.
Watch an Instagram account's DMs as Instagram's realtime connection pushes them, nothing polled, sending nothing
log instagram watch --account <accountName> [--seconds <s>] [--inbox] [--json]
Opens Instagram's own realtime connection on the direct-API engine (vendor/instagrapi, MQTT to edge-mqtt.facebook.com, subscribed to the DM sync, no browser) and prints each DM the moment Instagram pushes it, nothing polled. --seconds stops after that long (at least 5), otherwise it runs until stopped. --inbox hands each new message from someone else to the inbox hook, which puts it in front of the agent with what to do next (rule 123). Sends nothing.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "instagram" }) (An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch).
AGENTS.md (log://agents): rules 175, 26, 63, 2, 73, 83, 94, 123, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `instagramReact`

React to a Instagram message with an emoji, on the direct-API engine; a dry run unless --live.
React to a Instagram message with an emoji, on the direct-API engine; a dry run unless --live
log instagram react --account <accountName> --thread <thread> --message <id> --emoji <emoji> [--remove] [--approvedBy <who>] [--live] [--json]
Reacts to one message with an emoji, on the direct-API engine (vendor/instagrapi, no browser), or takes the account's own reaction off with --remove. Instagram takes any emoji; a name (joy, fire, heart) is turned into it. It goes through instagrapi's direct_send_reaction (direct_delete_reaction with --remove) in the account's one session (rule 129).
Without --live it is a dry run and nothing is contacted. --live reacts, only when matt asked, and needs --approvedBy (rule 8). The chat is claimed first, as for a send, and released once it is done (rule 133). The platform's own answer decides (rule 73), the governor counts it as a write, and a refusal stops with nothing retried (rule 94).
Fill the named fields; each value goes through whole. What acts on Instagram is `instagramReactLive`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/reactions" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "instagram" }) (An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 94, 105, 133, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `instagramReactLive`

React to a Instagram message with an emoji, on the direct-API engine; a dry run unless --live.
Live on Instagram: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
React to a Instagram message with an emoji, on the direct-API engine; a dry run unless --live
log instagram react --account <accountName> --thread <thread> --message <id> --emoji <emoji> [--remove] [--approvedBy <who>] [--live] [--json]
Reacts to one message with an emoji, on the direct-API engine (vendor/instagrapi, no browser), or takes the account's own reaction off with --remove. Instagram takes any emoji; a name (joy, fire, heart) is turned into it. It goes through instagrapi's direct_send_reaction (direct_delete_reaction with --remove) in the account's one session (rule 129).
Without --live it is a dry run and nothing is contacted. --live reacts, only when matt asked, and needs --approvedBy (rule 8). The chat is claimed first, as for a send, and released once it is done (rule 133). The platform's own answer decides (rule 73), the governor counts it as a write, and a refusal stops with nothing retried (rule 94).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/reactions" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "instagram" }) (An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 94, 105, 133, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `instagramVoice`

Send a voice note in matt's cloned voice as Instagram's own voice note, from text; a dry run unless --live.
Send a voice note in matt's cloned voice as Instagram's own voice note, from text; a dry run unless --live
log instagram voice --account <accountName> --with <with> --text "<what matt says>" [--provider inworld|fishAudio] [--mattsWords] [--translationOf "<what it translates>" --language <code>] [--approvedBy <who>] [--live] [--json]
Sends a voice note in matt's cloned voice (the voice provider, log clone voice) as instagram's own voice note: a voice clip (instagrapi's direct_send_voice: the audio uploaded to rupload.facebook.com/messenger_audio, then sent as a voice_attachment with its waveform). It takes text only, never an audio file: the words are said in his voice, converted with ffmpeg to AAC in .m4a and uploaded on the direct-API engine through the account's one session (vendor/instagrapi, in the account's one session, no browser).
A voice note goes out only when matt asks for one (rule 142). The provider is --provider, else LOG_VOICE_PROVIDER, else inworld; the command only ever calls the shared voice layer (rule 143). Without --live it is a dry run: nothing is generated and nothing is contacted. --live needs --approvedBy (rule 8). It says and converts the note while the account catches up (rule 135) and the text goes through the voice gate every send runs (rule 137), so a note that passes goes out without waiting for it to be made; one the gate refuses is never sent. It then claims the chat (rule 133) and releases it after. The governor counts it as a write, the platform's answer decides (rule 73), and a refusal stops with nothing retried (rule 94).
--mattsWords says the text is matt's own words, dictated by him for this voice note: the voice gate's read is skipped, since it grades speech as typed text and as a reply, while the AI artifact check still runs and refuses aiArtifacts (rule 144).
--translationOf "<what it translates>" says the text is a translation, only when matt asked for one: the voice gate grades those original words (his own language, which the gate reads) instead of the translation, which it can't match to his writing; both are read for AI artifacts. --language <code> (zh-CN, es-ES ...) is the language the clone speaks it in, instead of the clone's own, and it is needed with --translationOf (rule 148).
Fill the named fields; each value goes through whole. What acts on Instagram is `instagramVoiceLive`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/voiceNote" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "instagram" }) (An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 94, 105, 133, 109, 137, 142, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `instagramVoiceLive`

Send a voice note in matt's cloned voice as Instagram's own voice note, from text; a dry run unless --live.
Live on Instagram: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Send a voice note in matt's cloned voice as Instagram's own voice note, from text; a dry run unless --live
log instagram voice --account <accountName> --with <with> --text "<what matt says>" [--provider inworld|fishAudio] [--mattsWords] [--translationOf "<what it translates>" --language <code>] [--approvedBy <who>] [--live] [--json]
Sends a voice note in matt's cloned voice (the voice provider, log clone voice) as instagram's own voice note: a voice clip (instagrapi's direct_send_voice: the audio uploaded to rupload.facebook.com/messenger_audio, then sent as a voice_attachment with its waveform). It takes text only, never an audio file: the words are said in his voice, converted with ffmpeg to AAC in .m4a and uploaded on the direct-API engine through the account's one session (vendor/instagrapi, in the account's one session, no browser).
A voice note goes out only when matt asks for one (rule 142). The provider is --provider, else LOG_VOICE_PROVIDER, else inworld; the command only ever calls the shared voice layer (rule 143). Without --live it is a dry run: nothing is generated and nothing is contacted. --live needs --approvedBy (rule 8). It says and converts the note while the account catches up (rule 135) and the text goes through the voice gate every send runs (rule 137), so a note that passes goes out without waiting for it to be made; one the gate refuses is never sent. It then claims the chat (rule 133) and releases it after. The governor counts it as a write, the platform's answer decides (rule 73), and a refusal stops with nothing retried (rule 94).
--mattsWords says the text is matt's own words, dictated by him for this voice note: the voice gate's read is skipped, since it grades speech as typed text and as a reply, while the AI artifact check still runs and refuses aiArtifacts (rule 144).
--translationOf "<what it translates>" says the text is a translation, only when matt asked for one: the voice gate grades those original words (his own language, which the gate reads) instead of the translation, which it can't match to his writing; both are read for AI artifacts. --language <code> (zh-CN, es-ES ...) is the language the clone speaks it in, instead of the clone's own, and it is needed with --translationOf (rule 148).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/voiceNote" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "instagram" }) (An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 94, 105, 133, 109, 137, 142, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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

**Rule 137.** 2026-11-04 · Preserve current context-aware voice and AI-artifact gates for messages sent as Matt. Rework refused drafts from the stated cause. Exact-message overrides and dictated/translated voice-note exceptions require Matt's request and preserve remaining artifact checks. Do not treat an exception as permanent permission.

**Rule 138.** 2026-11-04 · Media and voice-note context uses the existing private media descriptions and transcripts. Do not claim to have understood undescribed media. Preserve hash-based deduplication, private storage and the one describer process.

**Rule 142.** 2026-11-05 · Send a cloned voice note only when Matt asks, through the platform's native voice-note tool and existing provider adapter. Use his authorized words, requested language/translation and pronunciation checks. Follow the voice-note guide for exact behavior; do not turn historical sample/model choices into a new global deployment requirement.

**Rule 175.** 2026-11-11 · Use existing log.db and platform-agnostic engine contracts for native schemas. Do not copy Twenty agency prefixes or CRM/SMS structures. Old listing/campaign functionality is deferred. Add only missing account/credential and hosted execution contracts; preserve existing identity, message, queue, job and governor authorities.
