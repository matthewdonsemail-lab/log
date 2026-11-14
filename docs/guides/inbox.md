# inbox

Every platform's chats as one inbox: listing, reading and watching them, sending, reacting and voice notes, who waits on a reply, claiming a chat before acting in it, and every action's log.

Load next, when the work needs it: getGuide({ topic: "voiceGate" }) (The voice gate every send as the owner passes on every platform: a draft checked against the owner's own writing before it goes out, and the voice and AI-tells indexes behind it).

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "discord/channelReply" })` | Answering someone in a Discord DM or group DM | "reply to <someone> on discord", "reply to <someone> in <group>", "explain what I'm trying to do to <someone> in <group>", "answer the group" |
| `getGuide({ useCase: "discord/serverReply" })` | Replying in a Discord server channel | "reply to <someone> in <server>", "answer him in the general", "message the guy in <server> #<channel> who mentioned me", "reply in the <server> server", "find what <someone> said in <server> and answer it" |
| `getGuide({ useCase: "inbox/bossMaxxing" })` | Bossmaxxing: giving out tasks to the team | "bossmaxxing", "give out the tasks", "send <person> the task in <group> and tag them", "tell <person> about everything I researched and give them an outline", "triage the jobs across the team", "walk <person> through setting up <tool>", "help <person> get set up like we did with <other person>" |
| `getGuide({ useCase: "inbox/reaLooksmaxxing" })` | /rea-looksmaxxing: moneymaxx like a creator | "/rea-looksmaxxing how clavicular gets paid", "moneymaxx like <creator>", "how does <creator> get paid" |
| `getGuide({ useCase: "inbox/reactions" })` | Reacting to a message | "react to that", "heart his message", "put a 😂 on what she said", "send a reaction to <person>" |
| `getGuide({ useCase: "inbox/scopeAJob" })` | Scoping a job out of someone in a DM | "probe <person> so we can scope out what the task is", "scope it out with him", "find out what he actually wants done", "go through and then scope it out". |
| `getGuide({ useCase: "inbox/triage" })` | Triage: scoping someone's job and handing it to whoever does it | "triage this", "scope it out with him and pass it to <person>", "inform <person> of what the job is and what he needs to do", "we've already scoped the work with the client, hand it over", "this is a triage job", "don't tell him anyone else is doing it" |
| `getGuide({ useCase: "inbox/voiceNote" })` | Sending a voice note | "send <person> a voice note saying …", "voice note him that …", "send a vn to the group saying …" |
| `getGuide({ useCase: "twitter/dmInbox" })` | Reading the DM inbox: who is waiting on you | "who is waiting on me", "check my x dms", "go through my twitter inbox and tell me who needs a reply", "who am I waiting on in my dms". |

## The tools in this guide

Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.

| Tool | What it does | Usage |
|---|---|---|
| `inboxClaim` | Claim a chat for this session before drafting or sending in it, so no… | `log inbox claim --platform <twitter\|discord\|slack\|instagram> --account <a> --chat <conversationId\|handle> [--event <eventId>] [--json]` |
| `inboxRelease` | Release this session's claim on a chat when it is done with it | `log inbox release --platform <p> --account <a> --chat <conversationId\|handle> [--json]` |
| `inboxResume` | The owner's go-ahead after a refused catch-up | `log inbox resume --platform <p> --account <a> --by <who> [--json]` |
| `inboxWaiting` | Who wrote last on every platform, from log.db in time order | `log inbox waiting [--platform <p>] [--account <a>] [--limit <n>] [--oldest] [--json]` |
| `inboxPending` | What the account watchers heard since this reader last asked, with… | `log inbox pending --reader <name> [--json]` |
| `inboxClaims` | Every live claim | `log inbox claims [--json]` |
| `inboxActions` | The log of every claim, refusal, send and release, oldest first, to… | `log inbox actions [--platform <p>] [--account <a>] [--chat <conversationId\|handle>] [--limit <n>] [--json]` |
| `chatsList` | List an account's chats on its own platform, the platform taken from… | `log chats list --account <account> [--space <space>] [--limit <limit>] [--platform <p>] [--json]` |
| `messagesRead` | Read one chat's messages on the account's own platform, the platform… | `log messages read --account <account> --chat <chat> [--space <space>] [--limit <limit>] [--platform <p>] [--json]` |
| `messagesWatch` | Listen to an account's messages for a set time as its platform pushes… | `log messages watch --account <account> [--chat <chat>] [--space <space>] [--seconds <seconds>] [--platform <p>] [--json]` |
| `messagesSend` | Send a message as the account on its own platform, the platform taken… | `log messages send --account <account> --chat <chat> --text <text> [--space <space>] [--asOne] [--approvedBy <approvedBy>] [--platform <p>] [--live] [--json]` |
| `messagesSendLive` | Send a message as the account on its own platform…, live on the platform | `log messages send --account <account> --chat <chat> --text <text> [--space <space>] [--asOne] [--approvedBy <approvedBy>] [--platform <p>] [--live] [--json]` |
| `messagesReact` | React to one message as the account on its own platform, the platform… | `log messages react --account <account> --chat <chat> --message <message> --emoji <emoji> [--space <space>] [--approvedBy <approvedBy>] [--platform <p>] [--live] [--json]` |
| `messagesReactLive` | React to one message as the account on its own…, live on the platform | `log messages react --account <account> --chat <chat> --message <message> --emoji <emoji> [--space <space>] [--approvedBy <approvedBy>] [--platform <p>] [--live] [--json]` |
| `watchersStatus` | Each account watcher's state, read from log.db | `log watchers status [--platform <p>] [--account <a>] [--json]` |
| `watchersStart` | Start the watcher of every signed-in account that isn't running… | `log watchers start [--platform <p>] [--account <a>] [--json]` |
| `watchersStop` | Stop the named account watchers and hold them until start names them… | `log watchers stop [--platform <p>] [--account <a>] [--json]` |
| `voiceNotesSend` | Send a voice note in the owner's cloned voice as the account on its… | `log voiceNotes send --account <account> --chat <chat> --text <text> [--space <space>] [--approvedBy <approvedBy>] [--platform <p>] [--live] [--json]` |
| `voiceNotesSendLive` | Send a voice note in the owner's cloned voice as the…, live on the platform | `log voiceNotes send --account <account> --chat <chat> --text <text> [--space <space>] [--approvedBy <approvedBy>] [--platform <p>] [--live] [--json]` |

## The rules these tools fall under

Each by its number and first line. The full text is in AGENTS.md (`log://agents`); the core rules are in full in `getGuide({ topic: "logMcpInstructions" })`.

- **Rule 8.** Platform actions require the user authorization their tool defines.
- **Rule 30.** Complete the authorized task.
- **Rule 38.** Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless the owner raises them.
- **Rule 39.** Use only the scope, options and intent the owner stated or implied.
- **Rule 40.** Do not propose physical infrastructure unless the owner asks.
- **Rule 41.** Paid work must stay within the authorized task and spend.
- **Rule 89.** Find conversational context by scoped search and existing private records.
- **Rule 94.** Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies.
- **Rule 105.** One platform/account owns one continuous engine session and push connection.
- **Rule 109.** Read the full relevant chat and current private context before drafting or sending.
- **Rule 123.** Platforms use their existing push/watch path to keep private records current.
- **Rule 133.** Claim a chat before acting; consult recent actions, preserve claim generation and check it before subsequent message parts.
- **Rule 134.** Existing workspace log.db is the native private record/coordination foundation.
- **Rule 137.** Preserve current context-aware voice and AI-artifact gates for messages sent as the owner.
- **Rule 138.** Media and voice-note context uses the existing private media descriptions and transcripts.
- **Rule 142.** Send a cloned voice note only when the owner asks, through the platform's native voice-note tool and existing provider adapter.
- **Rule 154.** Show people/chats by meaningful names and handles; keep routing ids internal unless needed for the specific technical artifact.
- **Rule 160.** Answer eligible chat reads from log.db when the owner is live, caught up and the needed history is present/backfilled.
- **Rule 163.** Agent Log actions go through Log MCP tools; never work around a stale or unavailable MCP with shell Log commands or scratch clients.
