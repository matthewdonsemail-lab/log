# discord

A Discord account: its session, DMs and group DMs, servers with their channels, forums, posts and threads, server search, reading, the live gateway watch, sending and deleting its own messages.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 55). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Current scope

This guide describes the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.

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
| `getGuide({ useCase: "inbox/scopeAJob" })` | Scoping a job out of someone in a DM | "probe <person> so we can scope out what the task is", "scope it out with him", "find out what he actually wants done", "go through and then scope it out". |
| `getGuide({ useCase: "inbox/triage" })` | Triage: scoping someone's job and handing it to whoever does it | "triage this", "scope it out with him and pass it to <person>", "inform <person> of what the job is and what he needs to do", "we've already scoped the work with the client, hand it over", "this is a triage job", "don't tell him anyone else is doing it" |
| `getGuide({ useCase: "inbox/voiceNote" })` | Sending a voice note | "send <person> a voice note saying …", "voice note him that …", "send a vn to the group saying …" |
| `getGuide({ useCase: "twitter/collabMaxxing" })` | Collab maxxing: turn open conversations into collabs | "position a collab first then be like just a few quid so i can make a video about it", "start network maxxing and collab maxxing and trying to see what hes doing get him to reveal it all", "follow up on <someone> and the other people, small commitment from deals, not just new people but already open convos", "respond with the collabmaxxing", "selling the outcome", "let him name it", "check in with <someone> whats good there he is keen but isnt liquid", "just be nice to them there the poor people", "ask <someone> if i could become a contributor", "look on my twitter for missed opportunities". |

## The tools in this guide

| Tool | What it does |
|---|---|
| `discordSessionCheck` | Check that Discord still accepts one account's saved session, sending… |
| `discordChats` | The account's DMs and group DMs, with their ids |
| `discordServers` | The servers the account is in |
| `discordChannels` | One server's channels by category, each with its kind |
| `discordPosts` | A forum's posts |
| `discordSearch` | Search a whole server with Discord's own search |
| `discordRead` | A chat's latest messages, oldest first, sending nothing |
| `discordWatch` | Every Discord message as Discord pushes it, over the gateway, sending… |
| `discordSend` | Send one message on Discord, on the direct-API engine |
| `discordSendLive` | Send one message on Discord, on the direct-API engine, live on Discord |
| `discordDelete` | Delete the account's own Discord messages by id, on the direct-API… |
| `discordDeleteLive` | Delete the account's own Discord messages by id, on…, live on Discord |
| `discordReact` | React to a Discord message with an emoji, on the direct-API engine |
| `discordReactLive` | React to a Discord message with an emoji, on the…, live on Discord |
| `discordVoice` | Send a voice note in matt's cloned voice as Discord's own voice note… |
| `discordVoiceLive` | Send a voice note in matt's cloned voice as Discord's…, live on Discord |

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

## Every tool, in full

### `discordSessionCheck`

Check that Discord still accepts one account's saved session, sending nothing.
Check that Discord still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty
log discord session check --account <accountName> [--json]
Checks that Discord still accepts the account's saved session, on the direct-API engine (no browser). Sends nothing.
Discord's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/groupChatRead" }), getGuide({ useCase: "inbox/reaLooksmaxxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, DMs and group DMs, servers with their channels, forums, posts and threads, server search, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 175, 63, 2, 73, 83, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `discordChats`

The account's DMs and group DMs, with their ids.
List the account's DMs and group DMs with their ids, on the direct-API engine, sending nothing
log discord chats --account <accountName> [--json]
Lists the account's DMs and group DMs with their ids, names and members, on the direct-API engine (no browser). Sends nothing.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/groupChatRead" }), getGuide({ useCase: "discord/serverReply" }), getGuide({ useCase: "inbox/bossMaxxing" }), getGuide({ useCase: "twitter/collabMaxxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, DMs and group DMs, servers with their channels, forums, posts and threads, server search, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 175, 63, 2, 73, 83, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `discordServers`

The servers the account is in.
List the Discord servers the account is in, on the direct-API engine, sending nothing
log discord servers --account <accountName> [--json]
Lists the Discord servers the account is in, by name, on the direct-API engine (no browser). One request. Sends nothing. A server is not a group DM: a group DM is a private chat in log discord chats, while a server holds channels, forums and threads (log discord channels).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/forumPosts" }), getGuide({ useCase: "discord/serverReply" }), getGuide({ useCase: "discord/serverSearch" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, DMs and group DMs, servers with their channels, forums, posts and threads, server search, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 175, 63, 2, 73, 83, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `discordChannels`

One server's channels by category, each with its kind.
List one Discord server's channels by category and kind (text, forum, media, voice), on the direct-API engine, sending nothing
log discord channels --account <accountName> --server <server name> [--json]
Lists one server's channels by category, each with its kind (text, announcement, forum, media, voice, stage), its tags and when its last message came, on the direct-API engine (no browser). One request. Sends nothing. A text or announcement channel is read with log discord read and the channel "<server> #<channel>"; a forum or media channel holds posts, listed with log discord posts.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/forumPosts" }), getGuide({ useCase: "discord/serverReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, DMs and group DMs, servers with their channels, forums, posts and threads, server search, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 175, 63, 2, 73, 83, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `discordPosts`

A forum's posts (or a channel's threads), newest first, with each one's opening message.
List the posts in a Discord forum (or a channel's threads) with each one's opening message, on the direct-API engine, sending nothing
log discord posts --account <accountName> --channel "<server> #<forum>" [--limit <n>] [--archived <true|false>] [--json]
Lists the posts in a forum or media channel (or the threads under a text channel), newest activity first, on the direct-API engine (no browser): each post's title, who opened it, when, its tags, how many replies, whether it is closed, and its opening message. 25 a request, at most 200. Sends nothing. Each post is then read by its name with log discord read and the channel "<server> #<forum> > <post title>".
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/forumPosts" }), getGuide({ useCase: "discord/serverReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, DMs and group DMs, servers with their channels, forums, posts and threads, server search, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 175, 63, 2, 73, 83, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `discordSearch`

Search a whole server with Discord's own search.
Search a whole Discord server (channels, forum posts and threads) with Discord's own search, on the direct-API engine, sending nothing
log discord search --account <accountName> --server <server name> --query "<words>" [--channel "<server> #<channel>"] [--from <name>] [--limit <n>] [--json]
Searches a whole server with Discord's own search, every channel, forum post and thread at once, on the direct-API engine (no browser): each hit's time, channel or post, who wrote it and its text, newest first. 25 a request, at most 200. --channel keeps one channel, --from one person (by name, matched to who wrote in the hits). Sends nothing. The fast way to find an old conversation in a server: no channel has to be read back.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/forumPosts" }), getGuide({ useCase: "discord/serverReply" }), getGuide({ useCase: "discord/serverSearch" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, DMs and group DMs, servers with their channels, forums, posts and threads, server search, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 175, 63, 2, 73, 83, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `discordRead`

A chat's latest messages, oldest first, sending nothing.
Read a Discord chat or channel's latest messages, on the direct-API engine, sending nothing
log discord read --account <accountName> --channel <channelId|chat name> [--limit <n>] [--after <messageId>] [--noMedia] [--json]
Reads a DM, group DM, server channel or forum post's latest messages, oldest first, on the direct-API engine (no browser): who sent each, when, whether a bot, what it replies to, its text and embeds. A server channel is "<server> #<channel>" and a forum post "<server> #<forum> > <post title>" (from log discord posts), both read live from Discord. --after keeps only what came after that message (a bot's answer to ours). --noMedia reads text only, without saving images or transcribing voice notes, for a fast pass over a busy channel. Sends nothing.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/channelReply" }), getGuide({ useCase: "discord/forumPosts" }), getGuide({ useCase: "discord/groupChatRead" }), getGuide({ useCase: "discord/memeReply" }), getGuide({ useCase: "discord/serverReply" }), getGuide({ useCase: "discord/serverSearch" }), getGuide({ useCase: "inbox/bossMaxxing" }), getGuide({ useCase: "inbox/reaLooksmaxxing" }), getGuide({ useCase: "inbox/reactions" }), getGuide({ useCase: "inbox/scopeAJob" }), getGuide({ useCase: "inbox/triage" }), getGuide({ useCase: "inbox/voiceNote" }), getGuide({ useCase: "twitter/collabMaxxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, DMs and group DMs, servers with their channels, forums, posts and threads, server search, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 175, 63, 2, 73, 83, 94, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `discordWatch`

Every Discord message as Discord pushes it, over the gateway, sending nothing.
Watch the account's Discord messages as Discord pushes them over its gateway, nothing polled, sending nothing
log discord watch --account <accountName> [--channel <channelId|chat name>] [--seconds <s>] [--inbox] [--json]
Opens the account's Discord gateway on the direct-API engine (wss://gateway.discord.gg, no browser) and prints every message the moment Discord pushes it, nothing polled. --channel keeps only one chat or channel; --seconds stops after that long (at least 5), otherwise it runs until stopped. --inbox hands each new DM, group message, mention of the account or reply to it from someone else to the inbox hook, which puts it in front of the agent with what to do next. Sends nothing.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, DMs and group DMs, servers with their channels, forums, posts and threads, server search, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 175, 26, 63, 2, 73, 83, 94, 138, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `discordSend`

Send one message on Discord, on the direct-API engine; a dry run unless --live.
Send one message to a Discord DM, group or channel, on the direct-API engine; a dry run unless --live
log discord send --account <accountName> --channel <channelId|chat name> --text "<message>" [--asOne] [--overGate] [--approvedBy <who>] [--live] [--json]
Sends one message to a DM, a group DM (by its id or its name, from log discord chats) or a server channel (by its id), on the direct-API engine (no browser).
--brief says the message hands someone a task, not a casual reply: the gate reads it as a brief instead of matt's chat voice (rule 162), asking SubQ whether it says clearly what to do, why, what done looks like and by when, kindly, and how to ask when stuck, with the attached files read beside it. The sameness, AI artifact and scrambler checks still run.
--file attaches files (a guide, a spreadsheet) to the last message, uploaded through the account's own session: only files under OUTBOX or ~/.logCli, at most 10 MB each, refused before anything is sent otherwise (fileRefused).
A draft written on several lines goes out one message per line, wherever it is sent (matt, 2026-10-28: stop sending as one). A one-line draft is split the way matt writes in that chat, from his own messages there (log voice index): how many he sends in a row and how many words each runs to, cut at the draft's own line breaks or punctuation, else the nearest space, and sent with his usual gap between them; a chat where he mostly sends one gets one. --asOne always sends one. Without --live it is a dry run and Discord is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). Discord's answer decides: a message id is sent, none is a drop. The account's governor counts it as a write. Before anything is sent, dry run or --live, the copy is read for what AI chat interfaces leave in text (rule 111): hidden characters, odd spaces or pasted Claude HTML refuse it with aiArtifacts, and the reading is printed and kept in --json. --overGate sends it over the voice gate's refusal when matt said to send that exact message: the gate's SubQ read is skipped and the AI artifact check still runs (rule 152). A link to an X post (x.com or twitter.com) is sent as fixupx.com, so Discord embeds the post with its video (matt, 2026-11-13).
Fill the named fields; each value goes through whole. What acts on Discord is `discordSendLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, DMs and group DMs, servers with their channels, forums, posts and threads, server search, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 90, 94, 105, 133, 134, 109, 137, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `discordSendLive`

Send one message on Discord, on the direct-API engine; a dry run unless --live.
Live on Discord: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Send one message to a Discord DM, group or channel, on the direct-API engine; a dry run unless --live
log discord send --account <accountName> --channel <channelId|chat name> --text "<message>" [--asOne] [--overGate] [--approvedBy <who>] [--live] [--json]
Sends one message to a DM, a group DM (by its id or its name, from log discord chats) or a server channel (by its id), on the direct-API engine (no browser).
--brief says the message hands someone a task, not a casual reply: the gate reads it as a brief instead of matt's chat voice (rule 162), asking SubQ whether it says clearly what to do, why, what done looks like and by when, kindly, and how to ask when stuck, with the attached files read beside it. The sameness, AI artifact and scrambler checks still run.
--file attaches files (a guide, a spreadsheet) to the last message, uploaded through the account's own session: only files under OUTBOX or ~/.logCli, at most 10 MB each, refused before anything is sent otherwise (fileRefused).
A draft written on several lines goes out one message per line, wherever it is sent (matt, 2026-10-28: stop sending as one). A one-line draft is split the way matt writes in that chat, from his own messages there (log voice index): how many he sends in a row and how many words each runs to, cut at the draft's own line breaks or punctuation, else the nearest space, and sent with his usual gap between them; a chat where he mostly sends one gets one. --asOne always sends one. Without --live it is a dry run and Discord is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). Discord's answer decides: a message id is sent, none is a drop. The account's governor counts it as a write. Before anything is sent, dry run or --live, the copy is read for what AI chat interfaces leave in text (rule 111): hidden characters, odd spaces or pasted Claude HTML refuse it with aiArtifacts, and the reading is printed and kept in --json. --overGate sends it over the voice gate's refusal when matt said to send that exact message: the gate's SubQ read is skipped and the AI artifact check still runs (rule 152). A link to an X post (x.com or twitter.com) is sent as fixupx.com, so Discord embeds the post with its video (matt, 2026-11-13).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/channelReply" }), getGuide({ useCase: "discord/memeReply" }), getGuide({ useCase: "discord/serverReply" }), getGuide({ useCase: "inbox/bossMaxxing" }), getGuide({ useCase: "inbox/reaLooksmaxxing" }), getGuide({ useCase: "inbox/scopeAJob" }), getGuide({ useCase: "inbox/triage" }), getGuide({ useCase: "twitter/collabMaxxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, DMs and group DMs, servers with their channels, forums, posts and threads, server search, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 90, 94, 105, 133, 134, 109, 137, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `discordDelete`

Delete the account's own Discord messages by id, on the direct-API engine; a dry run unless --live.
Delete the account's own Discord messages by id, on the direct-API engine; a dry run unless --live
log discord delete --account <accountName> --channel <channelId|chat name> --message <messageId>[,<messageId>...] [--approvedBy <who>] [--live] [--json]
Deletes the account's own messages by id (from log discord read) in a DM, group DM or server channel, on the direct-API engine (no browser): a duplicate or a mistake. Each message is read first and only deleted when the account sent it; someone else's is refused with notOwnMessage. Without --live it is a dry run that reads each message and deletes nothing. --live deletes, only when matt asked, and needs --approvedBy (rule 8). Discord's answer decides (204 is deleted). Each delete counts as a write, they go 4 s apart, and the first refusal stops the run with nothing retried (rule 94).
Fill the named fields; each value goes through whole. What acts on Discord is `discordDeleteLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, DMs and group DMs, servers with their channels, forums, posts and threads, server search, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `discordDeleteLive`

Delete the account's own Discord messages by id, on the direct-API engine; a dry run unless --live.
Live on Discord: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Delete the account's own Discord messages by id, on the direct-API engine; a dry run unless --live
log discord delete --account <accountName> --channel <channelId|chat name> --message <messageId>[,<messageId>...] [--approvedBy <who>] [--live] [--json]
Deletes the account's own messages by id (from log discord read) in a DM, group DM or server channel, on the direct-API engine (no browser): a duplicate or a mistake. Each message is read first and only deleted when the account sent it; someone else's is refused with notOwnMessage. Without --live it is a dry run that reads each message and deletes nothing. --live deletes, only when matt asked, and needs --approvedBy (rule 8). Discord's answer decides (204 is deleted). Each delete counts as a write, they go 4 s apart, and the first refusal stops the run with nothing retried (rule 94).
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, DMs and group DMs, servers with their channels, forums, posts and threads, server search, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `discordReact`

React to a Discord message with an emoji, on the direct-API engine; a dry run unless --live.
React to a Discord message with an emoji, on the direct-API engine; a dry run unless --live
log discord react --account <accountName> --channel <channel> --message <id> --emoji <emoji> [--remove] [--approvedBy <who>] [--live] [--json]
Reacts to one message with an emoji, on the direct-API engine (vendor/endcord, no browser), or takes the account's own reaction off with --remove. Discord takes any emoji, a name (joy, fire, eyes) turned into it, or a server's own emoji as name:id.
Without --live it is a dry run and nothing is contacted. --live reacts, only when matt asked, and needs --approvedBy (rule 8). The chat is claimed first, as for a send, and released once it is done (rule 133). The platform's own answer decides (rule 73), the governor counts it as a write, and a refusal stops with nothing retried (rule 94).
Fill the named fields; each value goes through whole. What acts on Discord is `discordReactLive`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/reactions" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, DMs and group DMs, servers with their channels, forums, posts and threads, server search, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 94, 133, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `discordReactLive`

React to a Discord message with an emoji, on the direct-API engine; a dry run unless --live.
Live on Discord: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
React to a Discord message with an emoji, on the direct-API engine; a dry run unless --live
log discord react --account <accountName> --channel <channel> --message <id> --emoji <emoji> [--remove] [--approvedBy <who>] [--live] [--json]
Reacts to one message with an emoji, on the direct-API engine (vendor/endcord, no browser), or takes the account's own reaction off with --remove. Discord takes any emoji, a name (joy, fire, eyes) turned into it, or a server's own emoji as name:id.
Without --live it is a dry run and nothing is contacted. --live reacts, only when matt asked, and needs --approvedBy (rule 8). The chat is claimed first, as for a send, and released once it is done (rule 133). The platform's own answer decides (rule 73), the governor counts it as a write, and a refusal stops with nothing retried (rule 94).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/reactions" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, DMs and group DMs, servers with their channels, forums, posts and threads, server search, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 94, 133, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `discordVoice`

Send a voice note in matt's cloned voice as Discord's own voice note, from text; a dry run unless --live.
Send a voice note in matt's cloned voice as Discord's own voice note, from text; a dry run unless --live
log discord voice --account <accountName> --channel <channel> --text "<what matt says>" [--provider inworld|fishAudio] [--mattsWords] [--translationOf "<what it translates>" --language <code>] [--approvedBy <who>] [--live] [--json]
Sends a voice note in matt's cloned voice (the voice provider, log clone voice) as discord's own voice note: a voice message (flags 8192, its waveform and duration), the bubble Discord's own app records. It takes text only, never an audio file: the words are said in his voice, converted with ffmpeg to ogg/opus and uploaded on the direct-API engine through the account's one session (vendor/endcord, no browser).
A voice note goes out only when matt asks for one (rule 142). The provider is --provider, else LOG_VOICE_PROVIDER, else inworld; the command only ever calls the shared voice layer (rule 143). Without --live it is a dry run: nothing is generated and nothing is contacted. --live needs --approvedBy (rule 8). It says and converts the note while the account catches up (rule 135) and the text goes through the voice gate every send runs (rule 137), so a note that passes goes out without waiting for it to be made; one the gate refuses is never sent. It then claims the chat (rule 133) and releases it after. The governor counts it as a write, the platform's answer decides (rule 73), and a refusal stops with nothing retried (rule 94).
--mattsWords says the text is matt's own words, dictated by him for this voice note: the voice gate's read is skipped, since it grades speech as typed text and as a reply, while the AI artifact check still runs and refuses aiArtifacts (rule 144).
--translationOf "<what it translates>" says the text is a translation, only when matt asked for one: the voice gate grades those original words (his own language, which the gate reads) instead of the translation, which it can't match to his writing; both are read for AI artifacts. --language <code> (zh-CN, es-ES ...) is the language the clone speaks it in, instead of the clone's own, and it is needed with --translationOf (rule 148).
Fill the named fields; each value goes through whole. What acts on Discord is `discordVoiceLive`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/voiceNote" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, DMs and group DMs, servers with their channels, forums, posts and threads, server search, reading, the live gateway watch, sending and deleting its own messages).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 94, 133, 109, 137, 142, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `discordVoiceLive`

Send a voice note in matt's cloned voice as Discord's own voice note, from text; a dry run unless --live.
Live on Discord: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Send a voice note in matt's cloned voice as Discord's own voice note, from text; a dry run unless --live
log discord voice --account <accountName> --channel <channel> --text "<what matt says>" [--provider inworld|fishAudio] [--mattsWords] [--translationOf "<what it translates>" --language <code>] [--approvedBy <who>] [--live] [--json]
Sends a voice note in matt's cloned voice (the voice provider, log clone voice) as discord's own voice note: a voice message (flags 8192, its waveform and duration), the bubble Discord's own app records. It takes text only, never an audio file: the words are said in his voice, converted with ffmpeg to ogg/opus and uploaded on the direct-API engine through the account's one session (vendor/endcord, no browser).
A voice note goes out only when matt asks for one (rule 142). The provider is --provider, else LOG_VOICE_PROVIDER, else inworld; the command only ever calls the shared voice layer (rule 143). Without --live it is a dry run: nothing is generated and nothing is contacted. --live needs --approvedBy (rule 8). It says and converts the note while the account catches up (rule 135) and the text goes through the voice gate every send runs (rule 137), so a note that passes goes out without waiting for it to be made; one the gate refuses is never sent. It then claims the chat (rule 133) and releases it after. The governor counts it as a write, the platform's answer decides (rule 73), and a refusal stops with nothing retried (rule 94).
--mattsWords says the text is matt's own words, dictated by him for this voice note: the voice gate's read is skipped, since it grades speech as typed text and as a reply, while the AI artifact check still runs and refuses aiArtifacts (rule 144).
--translationOf "<what it translates>" says the text is a translation, only when matt asked for one: the voice gate grades those original words (his own language, which the gate reads) instead of the translation, which it can't match to his writing; both are read for AI artifacts. --language <code> (zh-CN, es-ES ...) is the language the clone speaks it in, instead of the clone's own, and it is needed with --translationOf (rule 148).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/voiceNote" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "discord" }) (A Discord account: its session, DMs and group DMs, servers with their channels, forums, posts and threads, server search, reading, the live gateway watch, sending and deleting its own messages).
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

**Rule 133.** 2026-11-04 · Claim a chat before acting; consult recent actions, preserve claim generation and check it before subsequent message parts. A lost claim stops the remaining send. Release when done; retain claim/action evidence in the existing private store.

**Rule 134.** 2026-11-04 · Existing workspace log.db is the native private record/coordination foundation. Preserve events, stable identities, chats/messages, attachments/interactions, claims/owners/cursors, queues/jobs, media/search and records/state. Keep current WAL/migration/version semantics and transaction boundaries; unknown events retain source payload and are surfaced for analysis. Only proven projections are rebuildable.

**Rule 137.** 2026-11-04 · Preserve current context-aware voice and AI-artifact gates for messages sent as Matt. Rework refused drafts from the stated cause. Exact-message overrides and dictated/translated voice-note exceptions require Matt's request and preserve remaining artifact checks. Do not treat an exception as permanent permission.

**Rule 138.** 2026-11-04 · Media and voice-note context uses the existing private media descriptions and transcripts. Do not claim to have understood undescribed media. Preserve hash-based deduplication, private storage and the one describer process.

**Rule 142.** 2026-11-05 · Send a cloned voice note only when Matt asks, through the platform's native voice-note tool and existing provider adapter. Use his authorized words, requested language/translation and pronunciation checks. Follow the voice-note guide for exact behavior; do not turn historical sample/model choices into a new global deployment requirement.

**Rule 175.** 2026-11-11 · Use existing log.db and platform-agnostic engine contracts for native schemas. Do not copy Twenty agency prefixes or CRM/SMS structures. Old listing/campaign functionality is deferred. Add only missing account/credential and hosted execution contracts; preserve existing identity, message, queue, job and governor authorities.
