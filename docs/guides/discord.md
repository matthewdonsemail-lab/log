# discord

A Discord account: its session, DMs and group DMs, servers with their channels, forums, posts and threads, server search, reading, the live gateway watch, sending and deleting its own messages.

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "discord/channelReply" })` | Answering someone in a Discord DM or group DM | "reply to <someone> on discord", "reply to <someone> in <group>", "explain what I'm trying to do to <someone> in <group>", "answer the group" |
| `getGuide({ useCase: "discord/forumPosts" })` | Going through a Discord forum for posts worth answering | "look at the <server> forum and find the one about <problem>", "go through the forum in <server> and tell me which posts to respond to", "list the posts in <server> #<forum>", "find posts in <server> asking for help with <thing>" |
| `getGuide({ useCase: "discord/groupChatRead" })` | Reading a Discord group chat without Twenty | "read the <group> chat over the last <N> hours", "what did <someone> set up in <group>" |
| `getGuide({ useCase: "discord/memeReply" })` | Replying with a meme in a Discord chat | "respond with memes in the <chat>", "drop a meme in <chat> about that", "read <chat> and meme it" |
| `getGuide({ useCase: "discord/serverReply" })` | Replying in a Discord server channel | "reply to <someone> in <server>", "answer him in the general", "message the guy in <server> #<channel> who mentioned me", "reply in the <server> server", "find what <someone> said in <server> and answer it" |
| `getGuide({ useCase: "discord/serverSearch" })` | Finding a conversation in a Discord server | "find the conversation I had with <someone> in <server> about <thing>", "what did <someone> say in <server> about <thing>", "search <server> for <words>", "read through the <server> server and find <thing>" |
| `getGuide({ useCase: "inbox/bossMaxxing" })` | Bossmaxxing: giving out tasks to the team | "bossmaxxing", "give out the tasks", "send <person> the task in <group> and tag them", "tell <person> about everything I researched and give them an outline", "triage the jobs across the team", "walk <person> through setting up <tool>", "help <person> get set up like we did with <other person>" |
| `getGuide({ useCase: "inbox/reaLooksmaxxing" })` | /rea-looksmaxxing: moneymaxx like a creator | "/rea-looksmaxxing how clavicular gets paid", "moneymaxx like <creator>", "how does <creator> get paid" |
| `getGuide({ useCase: "inbox/reactions" })` | Reacting to a message | "react to that", "heart his message", "put a 😂 on what she said", "send a reaction to <person>" |
| `getGuide({ useCase: "inbox/voiceNote" })` | Sending a voice note | "send <person> a voice note saying …", "voice note him that …", "send a vn to the group saying …" |
| `getGuide({ useCase: "twitter/collabMaxxing" })` | Collab maxxing: turn open conversations into collabs | "position a collab first then be like just a few quid so i can make a video about it", "start network maxxing and collab maxxing and trying to see what hes doing get him to reveal it all", "follow up on <someone> and the other people, small commitment from deals, not just new people but already open convos", "respond with the collabmaxxing", "selling the outcome", "let him name it", "check in with <someone> whats good there he is keen but isnt liquid", "just be nice to them there the poor people", "ask <someone> if i could become a contributor", "look on my twitter for missed opportunities". |

## The tools in this guide

Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.

| Tool | What it does | Usage |
|---|---|---|
| `discordSessionCheck` | Check that Discord still accepts one account's saved session, sending… | `log discord session check --account <accountName> [--json]` |
| `discordChats` | The account's DMs and group DMs, with their ids | `log discord chats --account <accountName> [--json]` |
| `discordServers` | The servers the account is in | `log discord servers --account <accountName> [--json]` |
| `discordChannels` | One server's channels by category, each with its kind | `log discord channels --account <accountName> --server <server name> [--json]` |
| `discordPosts` | A forum's posts | `log discord posts --account <accountName> --channel "<server> #<forum>" [--limit <n>] [--archived <true\|false>] [--json]` |
| `discordSearch` | Search a whole server with Discord's own search | `log discord search --account <accountName> --server <server name> --query "<words>" [--channel "<server> #<channel>"] [--from <name>] [--limit <n>] [--json]` |
| `discordRead` | A chat's latest messages, oldest first, sending nothing | `log discord read --account <accountName> --channel <channelId\|chat name> [--limit <n>] [--after <messageId>] [--noMedia] [--json]` |
| `discordWatch` | Every Discord message as Discord pushes it, over the gateway, sending… | `log discord watch --account <accountName> [--channel <channelId\|chat name>] [--seconds <s>] [--inbox] [--json]` |
| `discordSend` | Send one message on Discord, on the direct-API engine | `log discord send --account <accountName> --channel <channelId\|chat name> --text "<message>" [--asOne] [--overGate] [--approvedBy <who>] [--live] [--json]` |
| `discordSendLive` | Send one message on Discord, on the direct-API engine, live on Discord | `log discord send --account <accountName> --channel <channelId\|chat name> --text "<message>" [--asOne] [--overGate] [--approvedBy <who>] [--live] [--json]` |
| `discordDelete` | Delete the account's own Discord messages by id, on the direct-API… | `log discord delete --account <accountName> --channel <channelId\|chat name> --message <messageId>[,<messageId>...] [--approvedBy <who>] [--live] [--json]` |
| `discordDeleteLive` | Delete the account's own Discord messages by id, on…, live on Discord | `log discord delete --account <accountName> --channel <channelId\|chat name> --message <messageId>[,<messageId>...] [--approvedBy <who>] [--live] [--json]` |
| `discordReact` | React to a Discord message with an emoji, on the direct-API engine | `log discord react --account <accountName> --channel <channel> --message <id> --emoji <emoji> [--remove] [--approvedBy <who>] [--live] [--json]` |
| `discordReactLive` | React to a Discord message with an emoji, on the…, live on Discord | `log discord react --account <accountName> --channel <channel> --message <id> --emoji <emoji> [--remove] [--approvedBy <who>] [--live] [--json]` |
| `discordVoice` | Send a voice note in the owner's cloned voice as Discord's own voice… | `log discord voice --account <accountName> --channel <channel> --text "<what the owner says>" [--provider inworld\|fishAudio] [--mattsWords] [--translationOf "<what it translates>" --language <code>] [--approvedBy <who>] [--live] [--json]` |
| `discordVoiceLive` | Send a voice note in the owner's cloned voice as…, live on Discord | `log discord voice --account <accountName> --channel <channel> --text "<what the owner says>" [--provider inworld\|fishAudio] [--mattsWords] [--translationOf "<what it translates>" --language <code>] [--approvedBy <who>] [--live] [--json]` |

## The work, step by step: discordServers

From `skills/discordServers/SKILL.md`.

## discordServers

A Discord server is not a group DM. A group DM is a private chat of a few people, listed by `discordChats` and kept whole in log.db. A server is someone else's space: it holds channels of several kinds, some of which hold posts or threads, and log.db keeps only the mentions of the account and replies to it from it. So a server is always read live from Discord, through the tools below, each one a request or a few.

### What a server holds

| Thing | What it is | How it is named | Listed by | Read by |
| --- | --- | --- | --- | --- |
| Server | The whole space: an owner, mods, rules, members | its name, `"pennyserver"` | `discordServers` | `discordChannels`, `discordSearch` |
| Category | A heading that groups channels; holds no messages | its name, shown above its channels | `discordChannels` | nothing to read |
| Text channel | A room of messages in time order | `"<server> #<channel>"` | `discordChannels` (`text`) | `discordRead` |
| Announcement channel | A text channel only some can post in, others follow it | `"<server> #<channel>"` | `discordChannels` (`announcement`) | `discordRead` |
| Forum channel | Holds posts, never loose messages; each post is its own conversation with a title, tags and an opening message | `"<server> #<forum>"` | `discordChannels` (`forum`, with its tags) | `discordPosts` lists its posts |
| Media channel | A forum whose posts open with an image or video | `"<server> #<channel>"` | `discordChannels` (`media`) | `discordPosts` |
| Post | One conversation inside a forum or media channel: a title, who opened it, tags, an opening message, then replies | `"<server> #<forum> > <post title>"` | `discordPosts` | `discordRead` |
| Thread | A side conversation started from a message in a text channel | `"<server> #<channel> > <thread title>"` | `discordPosts` on the text channel | `discordRead` |
| Voice or stage channel | Live talk; holds no text the tools read | `"<server> #<channel>"` | `discordChannels` (`voice`, `stage`) | nothing to read |
| Message | One message in a channel, post or thread: its author, time, text, what it replies to | its id, from a read | `discordRead`, `discordSearch` | `discordRead` around it |
| Attachment | An image, video, file or voice note on a message | its name | `discordRead` | `discordRead` saves images and transcribes voice notes; `noMedia` skips both |

### Finding things fast

- **Know what's there:** `discordServers`, then `discordChannels` { server } shows every channel by category and kind in one request.
- **Find a conversation:** `discordSearch` { server, query } searches every channel, post and thread at once with Discord's own search, and names where each hit is. Add `channel` to keep one channel and `from` to keep one person. Never read a channel back hundreds of messages to look for something search can find.
- **Work a forum:** `discordPosts` { channel: "<server> #<forum>" } lists its posts newest activity first, with each one's title, author, tags, replies and opening message, so most posts are judged without opening them. Read the ones worth it with `discordRead` { channel: "<server> #<forum> > <post title>" }.
- **Skim a busy channel:** `discordRead` with `noMedia` reads text only. Without it, every image is saved and every voice note transcribed first, which took most of a minute for 400 messages of "pennyserver #general".
- **Never run a script over saved output.** Every answer above is plain text made for reading. When it isn't enough, the tool is missing a flag: add it to the tool, don't filter a dump.

### Hard boundaries

1. Reading sends nothing. Answering in a server is [serverReply](../../docs/useCases/discord/serverReply.md); every send keeps its gates (rules 8, 94, 137).
2. Every request counts on the account's governor. A 429 or a refusal stops the run and the account pauses; nothing retries (rule 94).
3. A server channel, post or thread is named, never passed by its id (rule 154).
4. A server is its owner's room. Its rules hold: no selling or promoting where the owner said not to.

Code: `python/discordApi/engine.py` (`servers_of`, `channels_of`, `posts_of`, `search_of`), `src/cli/discord/index.ts` (`discordServersCommand`, `discordChannelsCommand`, `discordPostsCommand`, `discordSearchCommand`). Plays: [forumPosts](../../docs/useCases/discord/forumPosts.md), [serverSearch](../../docs/useCases/discord/serverSearch.md), [serverReply](../../docs/useCases/discord/serverReply.md).

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
- **Rule 133.** Claim a chat before acting; consult recent actions, preserve claim generation and check it before subsequent message parts.
- **Rule 134.** Existing workspace log.db is the native private record/coordination foundation.
- **Rule 137.** Preserve current context-aware voice and AI-artifact gates for messages sent as the owner.
- **Rule 138.** Media and voice-note context uses the existing private media descriptions and transcripts.
- **Rule 142.** Send a cloned voice note only when the owner asks, through the platform's native voice-note tool and existing provider adapter.
