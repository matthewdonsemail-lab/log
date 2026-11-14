# instagram

An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch.

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

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

Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.

| Tool | What it does | Usage |
|---|---|---|
| `instagramSessionCheck` | Check that Instagram still accepts one account's saved session… | `log instagram session check --account <accountName> [--json]` |
| `instagramDms` | An Instagram account's DM threads, or one thread's messages with… | `log instagram dms --account <accountName> [--with <handle\|thread name\|thread id>] [--limit <n>] [--json]` |
| `instagramSend` | Send text and a photo to an Instagram DM | `log instagram send --account <accountName> --with <handle\|thread name\|thread id> [--text "<message>"] [--photo <file>] [--asOne] [--approvedBy <who>] [--live] [--json]` |
| `instagramSendLive` | Send text and a photo to an Instagram DM, live on Instagram | `log instagram send --account <accountName> --with <handle\|thread name\|thread id> [--text "<message>"] [--photo <file>] [--asOne] [--approvedBy <who>] [--live] [--json]` |
| `instagramWatch` | Every Instagram DM as Instagram's realtime connection pushes it… | `log instagram watch --account <accountName> [--seconds <s>] [--inbox] [--json]` |
| `instagramReact` | React to a Instagram message with an emoji, on the direct-API engine | `log instagram react --account <accountName> --thread <thread> --message <id> --emoji <emoji> [--remove] [--approvedBy <who>] [--live] [--json]` |
| `instagramReactLive` | React to a Instagram message with an emoji, on the…, live on Instagram | `log instagram react --account <accountName> --thread <thread> --message <id> --emoji <emoji> [--remove] [--approvedBy <who>] [--live] [--json]` |
| `instagramVoice` | Send a voice note in the owner's cloned voice as Instagram's own… | `log instagram voice --account <accountName> --with <with> --text "<what the owner says>" [--provider inworld\|fishAudio] [--mattsWords] [--translationOf "<what it translates>" --language <code>] [--approvedBy <who>] [--live] [--json]` |
| `instagramVoiceLive` | Send a voice note in the owner's cloned voice as…, live on Instagram | `log instagram voice --account <accountName> --with <with> --text "<what the owner says>" [--provider inworld\|fishAudio] [--mattsWords] [--translationOf "<what it translates>" --language <code>] [--approvedBy <who>] [--live] [--json]` |

## The work, step by step: instagram

From `skills/instagram/SKILL.md`.

## instagram

Instagram is worked over the MCP, on the direct-API engine (`python/instagramApi`,
vendor/instagrapi), never in the account's AdsPower browser.

### Hard boundaries

1. **Never the browser.** Every Instagram action is an MCP tool: `instagramDms`,
   `instagramSend` / `instagramSendLive`, `instagramWatch`,
   `instagramSessionCheck`. An action the engine doesn't have yet is built on the
   engine first.
2. **One session per account.** Every call goes through the account's one
   session host (`python/instagramApi/host.py`): one client signed in once, one
   realtime connection. Never start a second process for it. A call that can't
   reach the host is refused with `instagramSessionHostDown` (rule 105).
3. **Claim the chat before drafting** with `inboxClaim` (rule 133); a chat
   another session holds is left to it, and the send releases the claim.
4. **Read them first.** Read the person's whole thread before drafting
   (`instagramDms` { with }), rule 109.
5. **Gate every draft** with `voice` { to, with, context, text } until it passes.
6. **Send once, and stop if they write.** A multi-line draft goes out one
   message per line, and the send stops the moment they write back
   (`>>> INTERRUPTED`): answer them, never resend (rule 90). Any refusal
   stops the run (rule 94).
7. **Live needs the owner.** `instagramSendLive` needs `approvedBy` and
   `confirmLive: true` (rule 8).

### The routine

```text
instagramSessionCheck { account }                    the session is still good
instagramDms { account }                             the threads, newest first, ● unread
instagramDms { account, with: "<handle|thread>" }    one thread, oldest first; kept for log search and the voice index
voice { to, with, context }                          how the owner writes there
voice { to, with, context, text }                    gate the draft
instagramSendLive { account, with, text, approvedBy: "<owner>", confirmLive: true }
instagramSendLive { account, with, photo: "<file>", text, ... }   a meme goes as a photo
```

### The live side

The inbox hook keeps `log instagram watch` running for every signed-in Instagram
account. It holds Instagram's own realtime connection (MQTT to
edge-mqtt.facebook.com, the DM sync subscribed) on the session host, and every
new DM lands in `~/.logCli/inbox/pending.jsonl` and reaches the agent as
`>>> NEW INSTAGRAM MESSAGE` (rule 123). An agent following a conversation keeps a
Monitor on that file.

### Where things are

- Commands: `src/cli/instagram/index.ts`. Session: `src/instagram/account/session`.
- Engine and host: `python/instagramApi/engine.py`, `python/instagramApi/host.py`.
- Transport: every HTTP call through curl_cffi (`check:instagramTransport`); the
  realtime MQTT socket is the one exception.
- Use cases: `docs/useCases/instagram/dmReply.md`, `newPlatform.md`.
- Spec: `docs/specs/instagram.md`. Platform page: `docs/platforms/instagram/README.md`.

## The rules these tools fall under

Each by its number and first line. The full text is in AGENTS.md (`log://agents`); the core rules are in full in `getGuide({ topic: "logMcpInstructions" })`.

- **Rule 8.** Platform actions require the user authorization their tool defines.
- **Rule 26.** Stream progress while work runs, one meaningful line per stage, with the run log retained.
- **Rule 30.** Complete the authorized task.
- **Rule 38.** Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless the owner raises them.
- **Rule 39.** Use only the scope, options and intent the owner stated or implied.
- **Rule 40.** Do not propose physical infrastructure unless the owner asks.
- **Rule 41.** Paid work must stay within the authorized task and spend.
- **Rule 73.** For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence.
- **Rule 90.** Preserve platform message splitting: draft lines send as separate messages unless the owner explicitly requests the supported asOne behavior.
- **Rule 94.** Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies.
- **Rule 105.** One platform/account owns one continuous engine session and push connection.
- **Rule 109.** Read the full relevant chat and current private context before drafting or sending.
- **Rule 123.** Platforms use their existing push/watch path to keep private records current.
- **Rule 133.** Claim a chat before acting; consult recent actions, preserve claim generation and check it before subsequent message parts.
- **Rule 137.** Preserve current context-aware voice and AI-artifact gates for messages sent as the owner.
- **Rule 138.** Media and voice-note context uses the existing private media descriptions and transcripts.
- **Rule 142.** Send a cloned voice note only when the owner asks, through the platform's native voice-note tool and existing provider adapter.
