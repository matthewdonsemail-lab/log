# extensions

Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and Fish Audio's clone of matt's voice for the voice notes he asks for.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "discord/memeReply" })` | Replying with a meme in a Discord chat | "respond with memes in the <chat>", "drop a meme in <chat> about that", "read <chat> and meme it" |
| `getGuide({ useCase: "inbox/voiceNote" })` | Sending a voice note | "send <person> a voice note saying …", "voice note him that …", "send a vn to the group saying …" |
| `getGuide({ useCase: "instagram/dmReply" })` | Reading and answering an Instagram DM | "read my instagram dms", "what did <someone> say on instagram", "reply to <someone> on instagram", "send <someone> a meme on instagram" |
| `getGuide({ useCase: "twitter/getTheAction" })` | Getting people to do the thing: retweet, like, try it | "get me all them people who liked it ... yo cool to see that you liked that, would you give that a wee retweet", "notifications: people who like, comment, reply", "go through all the people there who need a message", "get them to retweet the thing", "would you do me a favour and give it a wee retweet", "I need them to retweet it so I can get some inbound leads", "I don't know what they're even talking about, explain the context", "make them do the action I need", "get the full context of everything on the account at the time of sending the message". |

## The tools in this guide

| Tool | What it does |
|---|---|
| `memelordSearch` | Search Memelord's template library |
| `memelordTemplate` | One Memelord template by its id |
| `memelordTrending` | Memelord's trending templates right now, each with its cultural… |
| `memelordTools` | Memelord's catalog of one-shot image tools |
| `memelordTaste` | matt's meme taste |
| `fishClone` | matt's voice model on Fish Audio, made once from his own voice notes |
| `fishSpeak` | Say words in matt's cloned voice, to a local audio file under… |

## The work, step by step: memelord

From `skills/memelord/SKILL.md`.

## memelord

Memelord is log's first extension: a library of meme templates, video clips
and stickers, found by meaning. log reaches only its four free discovery
tools, so nothing here costs money (rule 41).

### Hard boundaries

- **Only where it carries the chat on.** A chat waiting on them (they owe a
  reply, or they promised something) can take a meme that nudges it; a chat
  where matt's last messages are still unanswered never gets one stacked on top.
- **Free tools only.** `memelordSearch`, `memelordTemplate`, `memelordTrending`
  and `memelordTools`. Nothing that generates, edits or runs a model is
  reachable from log, and `memelordTools` lists the image tools without ever
  running one.
- **The chat comes first.** Read it before picking anything (rule 109): a meme
  answers what was just said, in the way that chat already jokes.
- **Every send is gated** (`voice` with the chat) and paced by the account's
  governor (rule 94). One meme at a time; never a run of them.
- **A price, a promise or a meeting is matt's** (rule 108). A meme can laugh
  about money; it never names a price for him.

### The loop

1. Read the chat: `discordRead` { account, channel, limit: 25 }. Note the
   chat's id from the first line (`… in <channelId>`).
2. Find the moment: the last thing said that a person would answer with a
   reaction (a question to the group, a joke, a win, a fail).
3. Search: `memelordSearch` { query: [the moment in a few words] }. The
   answer leads with matt's taste and ranks by it (deep fried, larping,
   streamer reacts like FlightReacts, Zias and Bloo, shitposts, and the memes
   he has sent): pick from the top, a clean corporate meme is never his. Short
   queries match best: a long sentence often returns one result or none. Use
   `method: "combined"` to add keyword matching, `type: "meme"` for a still
   image, `"video"` for a clip. `memelordTrending` gives what is current, each
   with what it means.
4. Pick one whose name and description fit the moment, and take its media
   url (`.webp`/`.png` for an image, `.mp4` for a clip).
5. Gate it: `voice` { to: <chat>, with: <chat>, context: <the moment and the
   meme picked>, text: <the url, and a line if one fits> }.
6. On X, send it as a dm with the meme attached: `twitterDmLive` { account,
   userId, text: <a line or two>, media: <the meme url>, approvedBy: "matt",
   confirmLive: true }. The url is downloaded, uploaded as X dm media and put on
   the first message; the dm's other lines follow it.
7. On Discord, send it by the chat's id, so the engine doesn't list every chat first:
   `discordSendLive` { account, channel: <channelId>, text, approvedBy: "matt",
   confirmLive: true }. A url on a line of its own is a message of its own
   (rule 90), and Discord shows it inline.

### His taste

`memelordTaste` shows it; `memelordTaste` { build: true, from: <posts.json> }
rebuilds it from his X media posts (treg `tikhub.x.twitter-web-fetch-user-media`,
the timeline items of every page, joined in one file). Rebuild when he has
posted a run of new memes.

### Where things are

- Client: `src/extensions/memelord` (the four GET endpoints, the key from
  `MEMELORD_API_KEY` in `.env.local`).
- Command: `log memelord search|template|trending|tools` (`src/cli/memelord`).
- Docs: `docs/extensions/memelord.md`; the use case
  `docs/useCases/discord/memeReply.md`; the spec `docs/specs/memelord.md`.

## The work, step by step: fishAudio

From `skills/fishAudio/SKILL.md`.

## fishAudio

Fish Audio holds one voice: matt's, cloned from the voice notes he sent
himself. log uses it to send voice notes he asks for, as each platform's own
voice note.

### Hard boundaries

- **Only when matt asks.** A voice note goes out only when he says to send
  one. Never on the agent's own initiative, never as a reply style.
- **Only his voice, only from text.** The clone is made from his own voice
  notes (fromMe), never anyone else's. Every send takes text and makes the
  audio itself; an audio file is never accepted.
- **Free model first.** Speech uses `s2.1-pro-free`. `s2.1-pro` costs money,
  and only matt decides to spend (rule 41).
- **Like any send.** Gated (rule 137), claimed (rule 133), counted as a write,
  and a refusal stops with nothing retried (rule 94).

### The routine

1. No clone yet: `fishClone` lists the recordings it would use; `fishClone`
   with apply makes it once. `fishSpeak` says a test line to a file.
2. Read the chat, draft what he says in his words, gate it with `voice`.
3. Dry run with `discordVoice`, `instagramVoice` or `slackVoice`.
4. Send with the `…Live` tool, approvedBy matt.
5. Tell matt the words, the length and where it went.

X has no voice note path. Docs: `docs/extensions/fishAudio.md`,
`docs/useCases/inbox/voiceNote.md`, spec `docs/specs/fishVoice.md`.

## Every tool, in full

### `memelordSearch`

Search Memelord's template library (memes, videos, stickers) by meaning or keyword, for a meme that fits the moment.
The Memelord extension: search memes for a moment, read one template, see what is trending, list the image tools (free tools only)
log memelord search "<what the moment is>" [--type meme|video|sticker] [--method context|combined|media|fulltext|fuzzy] [--limit <n>] [--json]
Search ranks what it finds by matt's taste (--noTaste turns it off): SubQ reads each template's picture against the styles he named (deep fried, larping, streamer reacts like FlightReacts, Zias and Bloo, shitposts) and the memes he has sent, and the taste line leads the answer.
Memelord is an extension (docs/extensions/memelord.md): only its four free discovery tools are reachable from log, so nothing here spends money (rule 41). The key is MEMELORD_API_KEY in .env.local. A meme goes out on Discord as its media url on a line of its own, which Discord shows inline.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/memeReply" }), getGuide({ useCase: "instagram/dmReply" }), getGuide({ useCase: "twitter/getTheAction" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and Fish Audio's clone of matt's voice for the voice notes he asks for).
AGENTS.md (log://agents): rules 41, 94, 119, 120, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `memelordTemplate`

One Memelord template by its id: name, media url, text slots and what it means.
The Memelord extension: search memes for a moment, read one template, see what is trending, list the image tools (free tools only)
log memelord template <id> [--json]   (one template: its name, media url, text slots and what it means)
Search ranks what it finds by matt's taste (--noTaste turns it off): SubQ reads each template's picture against the styles he named (deep fried, larping, streamer reacts like FlightReacts, Zias and Bloo, shitposts) and the memes he has sent, and the taste line leads the answer.
Memelord is an extension (docs/extensions/memelord.md): only its four free discovery tools are reachable from log, so nothing here spends money (rule 41). The key is MEMELORD_API_KEY in .env.local. A meme goes out on Discord as its media url on a line of its own, which Discord shows inline.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and Fish Audio's clone of matt's voice for the voice notes he asks for).
AGENTS.md (log://agents): rules 41, 94, 119, 120, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `memelordTrending`

Memelord's trending templates right now, each with its cultural context.
The Memelord extension: search memes for a moment, read one template, see what is trending, list the image tools (free tools only)
log memelord trending [--limit <n>] [--media image|video] [--json]   (what is trending now, with its cultural context)
Search ranks what it finds by matt's taste (--noTaste turns it off): SubQ reads each template's picture against the styles he named (deep fried, larping, streamer reacts like FlightReacts, Zias and Bloo, shitposts) and the memes he has sent, and the taste line leads the answer.
Memelord is an extension (docs/extensions/memelord.md): only its four free discovery tools are reachable from log, so nothing here spends money (rule 41). The key is MEMELORD_API_KEY in .env.local. A meme goes out on Discord as its media url on a line of its own, which Discord shows inline.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/memeReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and Fish Audio's clone of matt's voice for the voice notes he asks for).
AGENTS.md (log://agents): rules 41, 94, 119, 120, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `memelordTools`

Memelord's catalog of one-shot image tools (face swaps, filters, generators); log lists them and never runs them.
The Memelord extension: search memes for a moment, read one template, see what is trending, list the image tools (free tools only)
log memelord tools [--category imageToImage|imageTextToImage|textToImage] [--json]   (the catalog of one-shot image tools; log never runs them)
Search ranks what it finds by matt's taste (--noTaste turns it off): SubQ reads each template's picture against the styles he named (deep fried, larping, streamer reacts like FlightReacts, Zias and Bloo, shitposts) and the memes he has sent, and the taste line leads the answer.
Memelord is an extension (docs/extensions/memelord.md): only its four free discovery tools are reachable from log, so nothing here spends money (rule 41). The key is MEMELORD_API_KEY in .env.local. A meme goes out on Discord as its media url on a line of its own, which Discord shows inline.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and Fish Audio's clone of matt's voice for the voice notes he asks for).
AGENTS.md (log://agents): rules 41, 94, 119, 120, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `memelordTaste`

matt's meme taste: the styles he named and the memes he has sent, each read by SubQ from its picture; --build makes it from a file of his X media posts.
The Memelord extension: search memes for a moment, read one template, see what is trending, list the image tools (free tools only)
log memelord taste [--build --from <posts.json>] [--json]   (matt's meme taste: the styles he named and the memes he has sent, each read by SubQ from its picture; --build reads a file of his X media posts)
Search ranks what it finds by matt's taste (--noTaste turns it off): SubQ reads each template's picture against the styles he named (deep fried, larping, streamer reacts like FlightReacts, Zias and Bloo, shitposts) and the memes he has sent, and the taste line leads the answer.
Memelord is an extension (docs/extensions/memelord.md): only its four free discovery tools are reachable from log, so nothing here spends money (rule 41). The key is MEMELORD_API_KEY in .env.local. A meme goes out on Discord as its media url on a line of its own, which Discord shows inline.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and Fish Audio's clone of matt's voice for the voice notes he asks for).
AGENTS.md (log://agents): rules 41, 94, 119, 120, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `fishClone`

matt's voice model on Fish Audio, made once from his own voice notes; without --apply it lists the recordings it would use.
The Fish Audio extension: matt's voice cloned once from his own voice notes, and words said in it to a local file
log fish clone [--apply] [--json]   (matt's voice model, made once on Fish Audio from his own voice notes; without --apply it lists the recordings it would use)
Fish Audio is an extension (docs/extensions/fishAudio.md). The clone is made only from the voice notes matt sent himself (fromMe in the conversation store or his ownMessage in the .db): Discord voice messages and Instagram voice clips the engines kept, the shortest first, 10 to 60 s in all. Its model id is kept in ~/.logCli/voice/fishClone.json. Speech uses the free s2.1-pro-free model unless --model says otherwise. The key is FISH_API_KEY in .env.local. A voice note goes out only when matt asks for one: log discord voice, log instagram voice or log slack voice (rule 142).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/voiceNote" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and Fish Audio's clone of matt's voice for the voice notes he asks for).
AGENTS.md (log://agents): rules 39, 41, 94, 106, 119, 142, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `fishSpeak`

Say words in matt's cloned voice, to a local audio file under ~/.logCli/voiceNotes; plays and sends nothing.
The Fish Audio extension: matt's voice cloned once from his own voice notes, and words said in it to a local file
log fish speak --text "<words>" [--model s2.1-pro-free|s2.1-pro] [--format mp3|wav] [--json]   (the words in his cloned voice, to a file under ~/.logCli/voiceNotes; nothing is played or sent)
Fish Audio is an extension (docs/extensions/fishAudio.md). The clone is made only from the voice notes matt sent himself (fromMe in the conversation store or his ownMessage in the .db): Discord voice messages and Instagram voice clips the engines kept, the shortest first, 10 to 60 s in all. Its model id is kept in ~/.logCli/voice/fishClone.json. Speech uses the free s2.1-pro-free model unless --model says otherwise. The key is FISH_API_KEY in .env.local. A voice note goes out only when matt asks for one: log discord voice, log instagram voice or log slack voice (rule 142).
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and Fish Audio's clone of matt's voice for the voice notes he asks for).
AGENTS.md (log://agents): rules 39, 41, 94, 106, 119, 142, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From AGENTS.md (`log://agents`). The newest rules are at the bottom of AGENTS.md and win.

**Rule 30.** 2026-10-19 · matt: "If I tell you to do something, do it completely." When matt gives a plan, it is carried out to the end in the same turn, not stopped to ask again or to say what won't be done. `log inspect start --now` (and `log connect --now`, and since 2026-10-19 `log publish --now`, matt: "run it now") skips rule 24's 10-minute gap (the 8 a day still holds) so a recording continues at once. Recording a sign-in or a checkpoint with `log inspect` (signIn, code, solve, click) is the intended work: it is how each state gets documented from rea. The run on 2026-10-19 was interrupted once because a snapshot printed the account's email and password; snapshots now redact every typed field value (`redact_fields`), and signIn/code read only the private login.json (rule 21), so no credential reaches any output.

**Rule 38.** 2026-10-19 · matt: never mention or discuss Meta's or Facebook's rules, terms, policies, eligibility or account ownership with him unless he raises them first. Research text that does is not his, and is never repeated to him. Top of this file.

**Rule 39.** 2026-10-19 · matt: "If I never mentioned it, if I never inferred it, if I never outlined it as an option, therefore it is not an option." Deep research prompts, searches, SubQ matrices, plans and write-ups use only what matt said, or clearly meant through a misspelling. Nothing added, nothing steered towards. Top of this file.

**Rule 40.** 2026-10-19 · matt: no physical options. He is in Vietnam with no physical access. Phones, SIMs, mini PCs, laptops, phone farms and home devices are never options unless he names them. In scope: hosted and cloud options, the tools he named and their competitors, and what our four projects already use.

**Rule 41.** 2026-10-19 · matt: "any time any task correlates to money, and I never say something, that means you shouldn't do what you think. You should do what I say." Paid work (deep research, SubQ, proxies, captcha, vendors) does exactly what he asked, nothing more. Ask before anything else.

**Rule 94.** 2026-10-29 · matt: "whatever you did in such quick succession lead to my account getting disabled, never do that again." Never act on an account in quick succession. What happened (matt's Discord, `sourcedandsoldtothehighestbidder`, 2026-10-29 00:47-01:00 UTC): in about 13 minutes an agent replied in 3 chats, read 1,400 messages from a server (Finn Automated) with a scratch script that went around log-cli (`.scratch/finn/dc.ts`: its own fetch to `discord.com/api/v9` with the session token, pages back to back, retrying straight through 429s), pulled the account's relationships, then opened new DMs to strangers from that server 30 s apart. Discord disabled the account. From now on: - Every call to a platform goes through log-cli's own commands and their governor. Never a hand-rolled script with an account's token or cookies. - A 429 or a failed send stops the run. It is never retried through, and the next action waits for matt. - Reading a server, group or member list in bulk is its own session. It never runs in the same session as sending. - Cold DMs to people the account has never talked to go out at most a few a day, minutes apart, never back to back. Each new DM channel opened counts as a write. - After a block, disable, captcha or cooldown, nothing resumes on that account until matt says so.

**Rule 106.** 2026-11-01 · matt: "when doing stuff like changing the code or anything, ensure that there hasn't been any changes to it locally, like to the engine ... you're not allowed hand-rolled commands, it always has to be through the MCP basically". Two things, enforced by the hooks: - **Through the MCP only.** Every log action an agent takes goes through the log MCP tools (`mcp__log__…`), never a hand-run `log …` or `bun bin/log.ts …` from a shell. The PreToolUse hook (`liveLogs`, `handRunDenial` in `src/agentHooks/liveLog`) refuses one and names the MCP instead. Only the terminal-only prompts (`TERMINAL_ONLY`: launch, login, mcp, chat pin, cookies save, messenger pin) are run in a terminal, by matt. A stale MCP server is said to matt (restart the app), never worked around. - **Local changes first.** Before changing code, check what is already changed and uncommitted in the checkout. The engines hook says it loudly at session start and whenever it changes (`>>> UNCOMMITTED LOCAL CHANGES`, `localChangesLine` in `src/mcp/freshness`): read each one's diff, and never overwrite, revert, stage, publish or ship someone else's uncommitted work without matt.

**Rule 119.** 2026-11-02 · matt: extensions, "things that we think are going to make the experience of using social media more human", first Memelord ("we will only use these": `search_memes`, `get_meme_template`, `get_trending_memes`, `list_image_tools`, all free). An extension is an outside service log reaches through its own command and MCP tools, never by hand (rule 106), documented in its own docs area, `docs/extensions/` (a tab of its own on the docs site). Memelord's client (`src/extensions/memelord`) knows only those four GET endpoints of `https://www.memelord.com/api/v1`, with `MEMELORD_API_KEY` as a bearer token; nothing that generates, edits or runs a model has a path in log (rule 41). `log memelord search|template|trending|tools` (MCP `memelordSearch`, `memelordTemplate`, `memelordTrending`, `memelordTools`, the `extensions` guide, the `memelord` skill) answers each template with its media url. A meme goes out on Discord as that url on a line of its own, which Discord shows inline: read the chat, pick the moment, search, gate it with `voice`, send it by the chat's id (`docs/useCases/discord/memeReply.md`). First sent 2026-11-02 to the log group: Floyd Mayweather's Cash Stacks, on "how much shall i charge". Spec: `docs/specs/memelord.md`.

**Rule 120.** 2026-11-02 · matt: "start creating meme taste ... injecting into the context the kind of memes that we need": deep fried memes, memes about larping, streamer reaction clips like FlightReacts, Zias and Bloo, and shitposts, "those are the type of memes that I think are bangers", and "a meme index for taste ... over the type of memes we've done before". His taste lives in `~/.logCli/memes/taste.json` (`src/extensions/memeTaste`): `log memelord taste --build --from <posts.json>` reads every picture in his X media posts (treg `tikhub.x.twitter-web-fetch-user-media`, which matt said to spend on) and asks SubQ, from the picture, whether it is a meme and which of his styles it is (`TASTE_STYLES`, or other), keeping the memes. `log memelord search` scores each template's picture against his taste with SubQ (`tasteFit`) and ranks by it, `--noTaste` keeping Memelord's order, and every answer leads with his taste (`tasteSummary`), so the agent picking a meme has it in context. `log memelord taste` (MCP `memelordTaste`) shows it. Spec: `docs/specs/memelord.md` (REQ-MEME-09, REQ-MEME-10).

**Rule 142.** 2026-11-05 · matt: "make it so that we can send audio, like upload natively into the platform, voice notes ... directly into the actual clients themselves ... we need to voice clone ourselves from audio ... it will then be an extension, like we have for the meme board stuff", with Fish Audio (hosted) his pick. A voice note only ever goes out when matt asks for one, in his cloned voice, as the platform's own voice note: never on the agent's own initiative and never any other audio. Fish Audio is an extension (`src/extensions/fishAudio`, `docs/extensions/fishAudio.md`): `log fish clone` makes his voice model once from the voice notes he sent himself (fromMe in the conversation store or his `ownMessage` in the .db; Discord voice messages and Instagram voice clips the engines kept, 10 to 60 s in all; nobody else's voice), a dry run listing them unless `--apply`, its id kept in `~/.logCli/voice/fishClone.json`; `log fish speak --text` says words in it to a file under `~/.logCli/voiceNotes` and sends nothing, on the free `s2.1-pro-free` model unless `--model`. `log discord voice`, `log instagram voice` and `log slack voice` take text only (an audio file is refused with `voiceNoteInvalid`), are dry runs unless `--live` with `--approvedBy` (rule 8), wait for the account to catch up (rule 135), run the text through the voice gate (rule 137), make it with the clone, convert it with ffmpeg (Discord ogg/opus, sent as a voice message with flags 8192, its waveform and duration; Instagram AAC in .m4a through instagrapi's `direct_send_voice`, its upload on curl_cffi under the one-call lock, rule 129; Slack AAC in .m4a through `files.getUploadURLExternal`, the upload on gabriel's curl_cffi transport and `files.completeUploadExternal`, rule 125), claim the chat (rule 133), count as a write, and stop on any refusal (rule 94). An engine sends only a file log made under `~/.logCli/voiceNotes`. X isn't built: twikit has no audio send and no vendored code or doc shows X's DM voice upload, so nothing is guessed. `src/cli/voiceNote`. Spec: `docs/specs/fishVoice.md`.
