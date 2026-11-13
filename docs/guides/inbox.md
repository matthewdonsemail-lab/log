# inbox

Every platform's chats as one inbox: who is waiting on a reply, claiming a chat before acting in it, releasing it, and the log of every action taken.

Load next, when the work needs it: getGuide({ topic: "voiceGate" }) (The voice gate every send as the owner passes on every platform: a draft checked against the owner's own writing before it goes out, and the voice and AI-tells indexes behind it).

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "discord/channelReply" })` | Answering someone in a Discord DM or group DM | "reply to <someone> on discord", "reply to <someone> in <group>", "explain what I'm trying to do to <someone> in <group>", "answer the group" |
| `getGuide({ useCase: "discord/serverReply" })` | Replying in a Discord server channel | "reply to <someone> in <server>", "answer him in the general", "message the guy in <server> #<channel> who mentioned me", "reply in the <server> server", "find what <someone> said in <server> and answer it" |
| `getGuide({ useCase: "inbox/bossMaxxing" })` | Bossmaxxing: giving out tasks to the team | "bossmaxxing", "give out the tasks", "send <person> the task in <group> and tag them", "tell <person> about everything I researched and give them an outline", "triage the jobs across the team", "walk <person> through setting up <tool>", "help <person> get set up like we did with <other person>" |
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
| `inboxClaims` | Every live claim | `log inbox claims [--json]` |
| `inboxActions` | The log of every claim, refusal, send and release, oldest first, to… | `log inbox actions [--platform <p>] [--account <a>] [--chat <conversationId\|handle>] [--limit <n>] [--json]` |

## The rules these tools fall under

Each by its number and first line. The full text is in AGENTS.md (`log://agents`); the core rules are in full in `getGuide({ topic: "logMcpInstructions" })`.

- **Rule 30.** Complete the authorized task.
- **Rule 38.** Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless the owner raises them.
- **Rule 39.** Use only the scope, options and intent the owner stated or implied.
- **Rule 40.** Do not propose physical infrastructure unless the owner asks.
- **Rule 41.** Paid work must stay within the authorized task and spend.
- **Rule 94.** Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies.
- **Rule 105.** One platform/account owns one continuous engine session and push connection.
- **Rule 109.** Read the full relevant chat and current private context before drafting or sending.
- **Rule 133.** Claim a chat before acting; consult recent actions, preserve claim generation and check it before subsequent message parts.
- **Rule 134.** Existing workspace log.db is the native private record/coordination foundation.
- **Rule 138.** Media and voice-note context uses the existing private media descriptions and transcripts.
