# discord

A Discord account: its session, chats, reading, the live gateway watch, sending and deleting its own messages.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "discord/groupChatRead" })` | Reading a Discord group chat without Twenty | "read the <group> chat over the last <N> hours", "what did <someone> set up in <group>" |
| `getGuide({ useCase: "discord/memeReply" })` | Replying with a meme in a Discord chat | "respond with memes in the <chat>", "drop a meme in <chat> about that", "read <chat> and meme it" |
| `getGuide({ useCase: "twitter/collabMaxxing" })` | Collab maxxing: turn open conversations into collabs | "position a collab first then be like just a few quid so i can make a video about it", "start network maxxing and collab maxxing and trying to see what hes doing get him to reveal it all", "follow up on deepman and the other people, small commitment from deals, not just new people but already open convos", "respond with the collabmaxxing", "selling the outcome", "let him name it", "check in with lior whats good there he is keen but isnt liquid", "just be nice to them there the poor people", "ask ben if i could become a contributor", "look on my twitter for missed opportunities". |

## The tools in this guide

| Tool | What it does |
|---|---|
| `discordSessionCheck` | Check that Discord still accepts one account's saved session, sending… |
| `discordChats` | The account's DMs and group DMs, with their ids |
| `discordRead` | A chat's latest messages, oldest first, sending nothing |
| `discordWatch` | Every Discord message as Discord pushes it, over the gateway, sending… |
| `discordSend` | Send one message on Discord, on the direct-API engine |
| `discordSendLive` | Send one message on Discord, on the direct-API engine, live on Discord |
| `discordDelete` | Delete the account's own Discord messages by id, on the direct-API… |
| `discordDeleteLive` | Delete the account's own Discord messages by id, on…, live on Discord |

## Every tool, in full

### `discordSessionCheck`

Check that Discord still accepts one account's saved session, sending nothing.
Check that Discord still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty
log discord session check --account <accountName> [--json]
Checks that Discord still accepts the account's saved session, on the direct-API engine (no browser). Sends nothing.
Discord's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/groupChatRead" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, chats, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 13, 63, 64, 73, 83, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `discordChats`

The account's DMs and group DMs, with their ids.
List the account's DMs and group DMs with their ids, on the direct-API engine, sending nothing
log discord chats --account <accountName> [--json]
Lists the account's DMs and group DMs with their ids, names and members, on the direct-API engine (no browser). Sends nothing.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/groupChatRead" }), getGuide({ useCase: "twitter/collabMaxxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, chats, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 13, 63, 64, 73, 83, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `discordRead`

A chat's latest messages, oldest first, sending nothing.
Read a Discord chat or channel's latest messages, on the direct-API engine, sending nothing
log discord read --account <accountName> --channel <channelId|chat name> [--limit <n>] [--after <messageId>] [--json]
Reads a DM, group DM or server channel's latest messages, oldest first, on the direct-API engine (no browser): who sent each, when, whether a bot, what it replies to, its text and embeds. --after keeps only what came after that message (a bot's answer to ours). Sends nothing.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/groupChatRead" }), getGuide({ useCase: "discord/memeReply" }), getGuide({ useCase: "twitter/collabMaxxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, chats, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 13, 63, 64, 73, 83, 94, 126, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `discordWatch`

Every Discord message as Discord pushes it, over the gateway, sending nothing.
Watch the account's Discord messages as Discord pushes them over its gateway, nothing polled, sending nothing
log discord watch --account <accountName> [--channel <channelId|chat name>] [--seconds <s>] [--inbox] [--json]
Opens the account's Discord gateway on the direct-API engine (wss://gateway.discord.gg, no browser) and prints every message the moment Discord pushes it, nothing polled. --channel keeps only one chat or channel; --seconds stops after that long (at least 5), otherwise it runs until stopped. --inbox hands each new DM, group message, mention of the account or reply to it from someone else to the inbox hook, which puts it in front of the agent with what to do next. Sends nothing.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, chats, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 13, 26, 63, 64, 73, 83, 94, 126, 131, 132, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `discordSend`

Send one message on Discord, on the direct-API engine; a dry run unless --live.
Send one message to a Discord DM, group or channel, on the direct-API engine; a dry run unless --live
log discord send --account <accountName> --channel <channelId|chat name> --text "<message>" [--asOne] [--approvedBy <who>] [--live] [--json]
Sends one message to a DM, a group DM (by its id or its name, from log discord chats) or a server channel (by its id), on the direct-API engine (no browser).
A draft written on several lines goes out one message per line, wherever it is sent (matt, 2026-10-28: stop sending as one). A one-line draft is split the way matt writes in that chat, from his own messages there (log voice index): how many he sends in a row and how many words each runs to, cut at the draft's own line breaks or punctuation, else the nearest space, and sent with his usual gap between them; a chat where he mostly sends one gets one. --asOne always sends one. Without --live it is a dry run and Discord is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). Discord's answer decides: a message id is sent, none is a drop. The account's governor counts it as a write. Before anything is sent, dry run or --live, the copy is read for what AI chat interfaces leave in text (rule 111): hidden characters, odd spaces or pasted Claude HTML refuse it with aiArtifacts, and the reading is printed and kept in --json.
Fill the named fields; each value goes through whole. What acts on Discord is `discordSendLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, chats, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 8, 13, 63, 64, 73, 83, 90, 91, 94, 122, 130, 133, 134, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `discordSendLive`

Send one message on Discord, on the direct-API engine; a dry run unless --live.
Live on Discord: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Send one message to a Discord DM, group or channel, on the direct-API engine; a dry run unless --live
log discord send --account <accountName> --channel <channelId|chat name> --text "<message>" [--asOne] [--approvedBy <who>] [--live] [--json]
Sends one message to a DM, a group DM (by its id or its name, from log discord chats) or a server channel (by its id), on the direct-API engine (no browser).
A draft written on several lines goes out one message per line, wherever it is sent (matt, 2026-10-28: stop sending as one). A one-line draft is split the way matt writes in that chat, from his own messages there (log voice index): how many he sends in a row and how many words each runs to, cut at the draft's own line breaks or punctuation, else the nearest space, and sent with his usual gap between them; a chat where he mostly sends one gets one. --asOne always sends one. Without --live it is a dry run and Discord is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). Discord's answer decides: a message id is sent, none is a drop. The account's governor counts it as a write. Before anything is sent, dry run or --live, the copy is read for what AI chat interfaces leave in text (rule 111): hidden characters, odd spaces or pasted Claude HTML refuse it with aiArtifacts, and the reading is printed and kept in --json.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/memeReply" }), getGuide({ useCase: "twitter/collabMaxxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, chats, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 8, 13, 63, 64, 73, 83, 90, 91, 94, 122, 130, 133, 134, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `discordDelete`

Delete the account's own Discord messages by id, on the direct-API engine; a dry run unless --live.
Delete the account's own Discord messages by id, on the direct-API engine; a dry run unless --live
log discord delete --account <accountName> --channel <channelId|chat name> --message <messageId>[,<messageId>...] [--approvedBy <who>] [--live] [--json]
Deletes the account's own messages by id (from log discord read) in a DM, group DM or server channel, on the direct-API engine (no browser): a duplicate or a mistake. Each message is read first and only deleted when the account sent it; someone else's is refused with notOwnMessage. Without --live it is a dry run that reads each message and deletes nothing. --live deletes, only when matt asked, and needs --approvedBy (rule 8). Discord's answer decides (204 is deleted). Each delete counts as a write, they go 4 s apart, and the first refusal stops the run with nothing retried (rule 94).
Fill the named fields; each value goes through whole. What acts on Discord is `discordDeleteLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, chats, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 8, 13, 63, 64, 73, 83, 94, 122, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `discordDeleteLive`

Delete the account's own Discord messages by id, on the direct-API engine; a dry run unless --live.
Live on Discord: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Delete the account's own Discord messages by id, on the direct-API engine; a dry run unless --live
log discord delete --account <accountName> --channel <channelId|chat name> --message <messageId>[,<messageId>...] [--approvedBy <who>] [--live] [--json]
Deletes the account's own messages by id (from log discord read) in a DM, group DM or server channel, on the direct-API engine (no browser): a duplicate or a mistake. Each message is read first and only deleted when the account sent it; someone else's is refused with notOwnMessage. Without --live it is a dry run that reads each message and deletes nothing. --live deletes, only when matt asked, and needs --approvedBy (rule 8). Discord's answer decides (204 is deleted). Each delete counts as a write, they go 4 s apart, and the first refusal stops the run with nothing retried (rule 94).
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, chats, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 8, 13, 63, 64, 73, 83, 94, 122, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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

**Rule 91.** 2026-10-28 · matt: "make it 60." A Discord account sends up to 60 messages a day, not 40 (`WRITES_PER_DAY`, `src/directApi/engine`, handed to the engine's governor in each run's spec). Every other platform keeps 40. `FBK_GOVERNOR_MUTATION_DAILY` still overrides it for one run when matt asks. The hook's status line shows each account's own limit.

**Rule 94.** 2026-10-29 · matt: "whatever you did in such quick succession lead to my account getting disabled, never do that again." Never act on an account in quick succession. What happened (matt's Discord, `sourcedandsoldtothehighestbidder`, 2026-10-29 00:47-01:00 UTC): in about 13 minutes an agent replied in 3 chats, read 1,400 messages from a server (Finn Automated) with a scratch script that went around log-cli (`.scratch/finn/dc.ts`: its own fetch to `discord.com/api/v9` with the session token, pages back to back, retrying straight through 429s), pulled the account's relationships, then opened new DMs to strangers from that server 30 s apart. Discord disabled the account. From now on: - Every call to a platform goes through log-cli's own commands and their governor. Never a hand-rolled script with an account's token or cookies. - A 429 or a failed send stops the run. It is never retried through, and the next action waits for matt. - Reading a server, group or member list in bulk is its own session. It never runs in the same session as sending. - Cold DMs to people the account has never talked to go out at most a few a day, minutes apart, never back to back. Each new DM channel opened counts as a write. - After a block, disable, captcha or cooldown, nothing resumes on that account until matt says so.

**Rule 122.** 2026-11-03 · matt: "bump discord to 120". A Discord account sends up to 120 messages a day, not 60 (this replaces rule 91's number; `WRITES_PER_DAY`, `src/directApi/engine`, handed to the engine's governor in each run's spec). Rule 94 still holds: a 429 or any refusal stops the run, and cold DMs to strangers stay a few a day, minutes apart. X keeps 240, LinkedIn 10, every other platform 40. Spec: `docs/specs/writeBudgets.md` (REQ-BUDGET-01).

**Rule 126.** 2026-11-03 · matt: every voice note he was sent or sent, transcribed with AssemblyAI, and "inside of the discord layer we have that and then the social media platforms at large, how can we detect when we have audio". Audio is detected once, in the shared message layer (`python/platformKit/media.py`, `src/platformKit/media`), never per platform: a content type of `audio/*` or `video/ogg`, an extension (`.ogg .oga .opus .m4a .mp3 .wav .aac .webm`), or the platform's own flag (Discord's voice-message flag 8192 with its duration and waveform, X Chat's audio media, Slack's `slack_audio` file). Every platform's messages keep their attachments, and an audio one adds `(audio: <name>)` to the text. Whatever is audio goes through one AssemblyAI path (`log transcribe`, MCP `transcribe`; `src/media/voiceNotes`): kept once by its file's hash in `~/.logCli/transcripts`, written into the conversation store as `(voice note: "<what was said>")` so search, voice and SubQ see it, and done as they come in `discordRead`, `twitterDms`, `slackRead` and the inbox. Files come only through the platform's own engine and session (X's one session, Discord's sound search, Slack's own transport), and any refusal stops the run (rule 94). The key is `ASSEMBLYAI_API_KEY` or `ASSEMBLY_AI_KEY` (`.env.local`, `~/.buzz/.env.local` or `~/filmcraft/.env.local`), never printed. `log new platform` writes the attachments into a new platform's message shape, and `check:platforms` refuses an engine whose messages drop them. Spec: `docs/specs/voiceNotes.md`.

**Rule 130.** 2026-11-04 · matt: "we need to make it so we have a monitor on there that will then listen for the new info coming over via the websocket, because look, he responded halfway through ... he just asked something, it breaks the flow". On 2026-11-03 Abel wrote "is this ai" on Discord while an 8-line send was going out, and lines 6 to 8 went on top of his question. A message sent one line at a time stops the moment they write: before each line after the first, the send reads what the platform's push channel put in the inbox for that chat since the send began (`incomingSince`, `src/inbox/watch`, from `pending.jsonl`), and if they wrote, the rest is held and the answer leads with `>>> INTERRUPTED`: what they said and the lines not sent (`interruptedLines`). It holds for `log discord send`, `log slack send`, `log twitter dm` (old DMs and X Chat), the queue's dms and `log instagram send` (in its engine). What was sent stays sent, nothing is resent, and they are answered first (rule 109). An agent following a conversation keeps a Monitor on `~/.logCli/inbox/pending.jsonl` so each push wakes it. Spec: `docs/specs/messageSplit.md` (REQ-SPLIT-08).

**Rule 131.** 2026-11-04 · matt: "WE NEED TO LOUDLY ALERT THAT THIS CANNOT HAPPEN ... WE CAN ONLY HAVE ONE PROCESS PER ACTUAL THING". On 2026-11-04 every watcher was running two or three times (X Chat for both X accounts, Discord and Slack): each new Claude session's hook started them again, the cleanup only killed the pid in `watch.pid`, which the new one had overwritten, and the doubled X watchers polled X's badge counts in bunches until X answered 429 on both accounts. One watcher process per account per platform, always, and every Claude session subscribes to it through the inbox (`pending.jsonl`), never by starting its own. Each watcher takes `watch.lock` (exclusive create, its pid) before it opens anything (`claimWatcher`, `src/inbox/watch`); a second one is refused with `watcherAlreadyRunning` and exits, and the refusal goes to `~/.logCli/inbox/alerts.jsonl`, which the inbox hook puts first in the agent's context (`>>> ONE PROCESS PER ACCOUNT, NEVER TWO`) to be told to matt. A dead holder's lock is taken over, only the holder releases it, the hook never starts a watcher while a live one holds the lock, and the stale-code cleanup stops the holder as well as the pid file's process. Tests run the Instagram engine inline (`LOG_INSTAGRAM_HOST=inline` in the preload) so they never leave a real session host behind. Spec: `docs/specs/agentHooks.md` (REQ-HOOKS-13).

**Rule 132.** 2026-11-04 · matt: "this is what I expect to happen with all platforms": a singleton primary with an exclusive lock and a multi-subscriber relay. On every platform (X Chat, Discord, Slack, Instagram) the first watch to take an account's `watch.lock` is its one owner (`ownOrAttach`, `src/inbox/relay`): it opens the platform's push connection, writes `session.json` (pid, hostname, started, a heartbeat every 5 s, status connecting, streaming, reconnecting or error, its relay port and token, and how many are attached), writes the inbox (`pending.jsonl`) as its only writer, and sends every event to every attached subscriber over its local relay (127.0.0.1, the token first). `log <platform> watch` is the attach command: when an owner is live, a watch attaches to its relay and streams the same events without opening anything, so the hooks, a Monitor, Codex or another agent all see one stream; an inbox watch (`--inbox`) that loses is refused loudly (rule 131). An owner whose heartbeat is quiet for 60 s is stopped and alerted (`>>> ONE PROCESS PER ACCOUNT`, `hungOwner`), and the next start becomes the owner; when the owner closes, its session file goes with it. Spec: `docs/specs/agentHooks.md` (REQ-HOOKS-14).

**Rule 133.** 2026-11-04 · matt, to deepman: "whenever the agent wants to perform an action based on the streamed event information, it must first claim the relevant event ... only the session that successfully claims an event should be allowed to perform the corresponding action. Once the action has been executed through the state machine, the lock is released ... every time an action is executed, the system should also index and persist the associated information". Every message a push channel brings in has an event id (`eventIdOf`, shown in the hook's `>>> CLAIM BEFORE YOU ACT` beside who holds its chat). A session claims a chat before it drafts (`log inbox claim`, MCP `inboxClaim`, 10 minutes, renewed by claiming again; `claimChat`, `src/inbox/claims`, an exclusive claim file per chat, the session being its MCP server's process), and a second session is refused (`chatClaimedElsewhere`). Every send (`log discord send`, `log slack send`, `log twitter dm`, the queue's dms, `log instagram send`) claims the chat itself first (`guardSend`) and releases it once it is sent, interrupted or failed, so two sessions never answer the same chat. An X chat is one chat whether it is named by the person's id or the X Chat pair. A claim held by a session that ended, or past its time, frees itself. Every claim, renewal, refusal, send, interruption, failure and release is written to `~/.logCli/inbox/actions.jsonl`, read with `log inbox actions --chat <id>` (MCP `inboxActions`) before acting; `log inbox claims` lists who holds what. Spec: `docs/specs/agentHooks.md` (REQ-HOOKS-15).

**Rule 134.** 2026-11-04 · matt: "Yes, go", moving the inbox's state out of loose files into one SQLite database, `~/.logCli/log.db` (`LOG_DB` moves it; `src/inbox/store`, WAL, every write in a `BEGIN IMMEDIATE` transaction). The owner appends every event its push channel brings in to `events` with a sequence number, once (`appendEvent`, by its event id), and each session reads from its own cursor (`cursors`), so nothing is shown twice or lost between sessions; `pending.jsonl` is imported once and no longer written. An event type nobody has catalogued is stored with its raw payload and raised loudly (`unknownEventType`, `eventTypes`), to be named from rea, the docs and SubQ (rule one). The one owner per account (rules 131, 132) is a row in `owners` (pid, hostname, heartbeat, status, relay port and token, subscribers, a generation that rises with each new owner), never `session.json`, and a relay subscriber that falls more than 1 MB behind is dropped rather than slowing the owner. Claims (rule 133) are rows in `claims`, each with its chat's next generation, and a send checks before every part after the first that its claim is still the one held (`stillHeld`); a session whose claim was taken over stops, and the rest is held. Every claim, send and release goes to `actions` in the same transaction as the change it records, with what was done in the chat before it (`stateBefore`), and what was done is searchable with the events (`searchIndex`, FTS5). Each event's moments are timed (`timings`: received, appended, relayed, claimed, actionStart, confirmed, indexed). Alerts are rows in `alerts`. Spec: `docs/specs/agentHooks.md` (REQ-HOOKS-16).
