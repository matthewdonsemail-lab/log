# slack

A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending.

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "inbox/bossMaxxing" })` | Bossmaxxing: giving out tasks to the team | "bossmaxxing", "give out the tasks", "send <person> the task in <group> and tag them", "tell <person> about everything I researched and give them an outline", "triage the jobs across the team", "walk <person> through setting up <tool>", "help <person> get set up like we did with <other person>" |
| `getGuide({ useCase: "inbox/reactions" })` | Reacting to a message | "react to that", "heart his message", "put a 😂 on what she said", "send a reaction to <person>" |
| `getGuide({ useCase: "inbox/voiceNote" })` | Sending a voice note | "send <person> a voice note saying …", "voice note him that …", "send a vn to the group saying …" |
| `getGuide({ useCase: "slack/dmReply" })` | Reading and answering a Slack DM | "read the messages with <someone> on slack", "reply to <someone> on slack", "what did <someone> say in <workspace>" |

## The tools in this guide

Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.

| Tool | What it does | Usage |
|---|---|---|
| `slackSessionCheck` | Check that Slack still accepts one account's saved session, sending… | `log slack session check --account <accountName> [--workspace <domain>] [--json]` |
| `slackWorkspaces` | The workspaces the account is signed in to, with their domains | `log slack workspaces --account <accountName> [--json]` |
| `slackChats` | The account's DMs and group DMs in a workspace, with their ids | `log slack chats --account <accountName> [--workspace <domain>] [--limit <n>] [--json]` |
| `slackRead` | A Slack chat's latest messages, oldest first, sending nothing | `log slack read --account <accountName> --chat <chatId\|who it is with> [--workspace <domain>] [--limit <n>] [--json]` |
| `slackWatch` | Every Slack event as the workspace's websocket pushes it, sending… | `log slack watch --account <accountName> [--workspace <domain>] [--chat <chatId\|who it is with>] [--seconds <s>] [--inbox] [--json]` |
| `slackSend` | Send a message on Slack, on the direct-API engine | `log slack send --account <accountName> --chat <chatId\|who it is with> --text "<message>" [--workspace <domain>] [--asOne] [--approvedBy <who>] [--live] [--json]` |
| `slackSendLive` | Send a message on Slack, on the direct-API engine, live on Slack | `log slack send --account <accountName> --chat <chatId\|who it is with> --text "<message>" [--workspace <domain>] [--asOne] [--approvedBy <who>] [--live] [--json]` |
| `slackReact` | React to a Slack message with an emoji, on the direct-API engine | `log slack react --account <accountName> --chat <chat> --message <id> --emoji <emoji> [--workspace <workspace>] [--remove] [--approvedBy <who>] [--live] [--json]` |
| `slackReactLive` | React to a Slack message with an emoji, on the…, live on Slack | `log slack react --account <accountName> --chat <chat> --message <id> --emoji <emoji> [--workspace <workspace>] [--remove] [--approvedBy <who>] [--live] [--json]` |
| `slackVoice` | Send a voice note in the owner's cloned voice as Slack's own voice… | `log slack voice --account <accountName> --chat <chat> --text "<what the owner says>" [--workspace <workspace>] [--provider inworld\|fishAudio] [--mattsWords] [--translationOf "<what it translates>" --language <code>] [--approvedBy <who>] [--live] [--json]` |
| `slackVoiceLive` | Send a voice note in the owner's cloned voice as…, live on Slack | `log slack voice --account <accountName> --chat <chat> --text "<what the owner says>" [--workspace <workspace>] [--provider inworld\|fishAudio] [--mattsWords] [--translationOf "<what it translates>" --language <code>] [--approvedBy <who>] [--live] [--json]` |

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
- **Rule 134.** Existing workspace log.db is the native private record/coordination foundation.
- **Rule 137.** Preserve current context-aware voice and AI-artifact gates for messages sent as the owner.
- **Rule 138.** Media and voice-note context uses the existing private media descriptions and transcripts.
- **Rule 142.** Send a cloned voice note only when the owner asks, through the platform's native voice-note tool and existing provider adapter.
