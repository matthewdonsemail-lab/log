# extensions

Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "discord/memeReply" })` | Replying with a meme in a Discord chat | "respond with memes in the <chat>", "drop a meme in <chat> about that", "read <chat> and meme it" |
| `getGuide({ useCase: "inbox/voiceNote" })` | Sending a voice note | "send <person> a voice note saying …", "voice note him that …", "send a vn to the group saying …" |
| `getGuide({ useCase: "instagram/dmReply" })` | Reading and answering an Instagram DM | "read my instagram dms", "what did <someone> say on instagram", "reply to <someone> on instagram", "send <someone> a meme on instagram" |
| `getGuide({ useCase: "reddit/contributorMaxxing" })` | Contributor maxxing: finding talented builders through what they share | "contributormaxxing", "find talented people who are out there who are interested in the same things that we're interested in", "use our reddit to load up gotomarketengineering", "find people who are posting on github inside of that subreddit", "find me all of the best githubs that have been posted in the past 7 days" |
| `getGuide({ useCase: "twitter/getTheAction" })` | Getting people to do the thing: retweet, like, try it | "get me all them people who liked it ... yo cool to see that you liked that, would you give that a wee retweet", "notifications: people who like, comment, reply", "go through all the people there who need a message", "get them to retweet the thing", "would you do me a favour and give it a wee retweet", "I need them to retweet it so I can get some inbound leads", "I don't know what they're even talking about, explain the context", "make them do the action I need", "get the full context of everything on the account at the time of sending the message". |
| `getGuide({ useCase: "twitter/managerMaxxing" })` | Manager maxxing: the managers of the biggest Kick streamers | "manager maxxing", "find every kick streamer's manager on twitter", "reply guy the kick managers with memes", "the managers that engaged, send them their tweet, a message and a voice note". |
| `getGuide({ useCase: "twitter/replyGuyFunnel" })` | Reply guy, then the DM, then the ask | "reply guy them first and foremost", "send a meme to the tweet then forward the tweet to them as an opener", "message the people who are new to following me", "get it in front of them", "funnel them into doing an action". |
| `getGuide({ useCase: "web/competitorTraffic" })` | Competitor traffic: finding how to rank on your competitors' names | "find out all of our competitors", "what are we lacking", "go through the bhw mcp and see what they're saying", "compare this month to last month", "find who in my messages has a website for a backlink", "competitor pages that backlink to us", "make affiliate money through it", "run it through subq matrices", "do some deeper research" |

## The tools in this guide

| Tool | What it does |
|---|---|
| `memelordSearch` | Search Memelord's template library |
| `memelordTemplate` | One Memelord template by its id |
| `memelordTrending` | Memelord's trending templates right now, each with its cultural… |
| `memelordTools` | Memelord's catalog of one-shot image tools |
| `memelordTaste` | matt's meme taste |
| `tregSearch` | Find a treg endpoint by what you want done |
| `tregGet` | One treg endpoint in full |
| `tregCall` | Call a treg endpoint, the key injected server-side |
| `tregCallLive` | Call a treg endpoint, the key injected server-side, live on Facebook |
| `balance` | Every paid provider log calls |
| `cloneVoice` | matt's voice cloned once on the voice provider from his own voice… |
| `cloneSpeak` | Say words in matt's cloned voice, to a local audio file under… |

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

## The work, step by step: voiceClone

From `skills/voiceClone/SKILL.md`.

## voiceClone

log holds one voice: matt's, cloned from the voice notes he sent himself,
on a voice provider (Inworld by default, Fish Audio as the other). log uses
it to send voice notes he asks for, as each platform's own voice note.

### Hard boundaries

- **Only when matt asks.** A voice note goes out only when he says to send
  one. Never on the agent's own initiative, never as a reply style.
- **Only his voice, only from text.** The clone is made from his own voice
  notes (fromMe), never anyone else's. Every send takes text and makes the
  audio itself; an audio file is never accepted.
- **Free first.** Inworld clones for free with about 70 free speech minutes;
  each provider's cheapest model is the default. Anything that costs money
  is matt's call (rule 41).
- **His words.** If the voice gate refuses what matt asked to say, tell him;
  never rewrite his words yourself.
- **Like any send.** Gated (rule 137), claimed (rule 133), counted as a write,
  and a refusal stops with nothing retried (rule 94).

### The routine

1. No clone yet on the provider: `cloneVoice` lists the recordings it would
   use; `cloneVoice` with apply makes it once. `cloneSpeak` says a test line.
2. Read the chat, take what matt asked to say, gate it with `voice`.
3. Dry run with `discordVoice`, `instagramVoice` or `slackVoice`.
4. Send with the `…Live` tool, approvedBy matt.
5. Tell matt the words, the length and where it went.

The provider is `provider`, else `LOG_VOICE_PROVIDER`, else inworld. X has no
voice note path. Docs: `docs/extensions/voiceClone.md`,
`docs/useCases/inbox/voiceNote.md`, spec `docs/specs/voiceClone.md`.

## The work, step by step: tregExtension

From `skills/tregExtension/SKILL.md`.

## tregExtension

### The loop

1. **Search by the job.** `tregSearch` { query: ["<what you want done>"] }. Pick one of the endpoints it returns. Never guess an id.
2. **Read it.** `tregGet` { id } shows its price and its params, and a call that works.
3. **Call it.** `tregCall` { id, params: "<json object>" }.
   - A free endpoint answers straight away.
   - A priced one comes back as a dry run with its price. Run it only when matt asked for that spend: `tregCallLive` { id, params, approvedBy: "matt", confirmLive: true }.
4. **Name the source.** Say which endpoint the answer came from (rule 53).

### Hard boundaries

- Nothing that costs money runs unless matt asked for it (rule 41).
- Every call goes through these tools, never a hand-run `treg` from a shell for log's work (rule 106).
- treg's balance: `balance`. How long a call took: `timing` { call }.

Docs: `docs/extensions/treg.md`. Spec: `docs/specs/treg.md`.

## Every tool, in full

### `memelordSearch`

Search Memelord's template library (memes, videos, stickers) by meaning or keyword, for a meme that fits the moment.
The Memelord extension: search memes for a moment, read one template, see what is trending, list the image tools (free tools only)
log memelord search "<what the moment is>" [--type meme|video|sticker] [--method context|combined|media|fulltext|fuzzy] [--limit <n>] [--json]
Search ranks what it finds by matt's taste (--noTaste turns it off): SubQ reads each template's picture against the styles he named (deep fried, larping, streamer reacts like FlightReacts, Zias and Bloo, shitposts) and the memes he has sent, and the taste line leads the answer.
Memelord is an extension (docs/extensions/memelord.md): only its four free discovery tools are reachable from log, so nothing here spends money (rule 41). The key is MEMELORD_API_KEY in .env.local. A meme goes out on Discord as its media url on a line of its own, which Discord shows inline.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/memeReply" }), getGuide({ useCase: "instagram/dmReply" }), getGuide({ useCase: "twitter/getTheAction" }), getGuide({ useCase: "twitter/managerMaxxing" }), getGuide({ useCase: "twitter/replyGuyFunnel" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 41, 94, 119, 120, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `memelordTemplate`

One Memelord template by its id: name, media url, text slots and what it means.
The Memelord extension: search memes for a moment, read one template, see what is trending, list the image tools (free tools only)
log memelord template <id> [--json]   (one template: its name, media url, text slots and what it means)
Search ranks what it finds by matt's taste (--noTaste turns it off): SubQ reads each template's picture against the styles he named (deep fried, larping, streamer reacts like FlightReacts, Zias and Bloo, shitposts) and the memes he has sent, and the taste line leads the answer.
Memelord is an extension (docs/extensions/memelord.md): only its four free discovery tools are reachable from log, so nothing here spends money (rule 41). The key is MEMELORD_API_KEY in .env.local. A meme goes out on Discord as its media url on a line of its own, which Discord shows inline.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 41, 94, 119, 120, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `memelordTrending`

Memelord's trending templates right now, each with its cultural context.
The Memelord extension: search memes for a moment, read one template, see what is trending, list the image tools (free tools only)
log memelord trending [--limit <n>] [--media image|video] [--json]   (what is trending now, with its cultural context)
Search ranks what it finds by matt's taste (--noTaste turns it off): SubQ reads each template's picture against the styles he named (deep fried, larping, streamer reacts like FlightReacts, Zias and Bloo, shitposts) and the memes he has sent, and the taste line leads the answer.
Memelord is an extension (docs/extensions/memelord.md): only its four free discovery tools are reachable from log, so nothing here spends money (rule 41). The key is MEMELORD_API_KEY in .env.local. A meme goes out on Discord as its media url on a line of its own, which Discord shows inline.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/memeReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 41, 94, 119, 120, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `memelordTools`

Memelord's catalog of one-shot image tools (face swaps, filters, generators); log lists them and never runs them.
The Memelord extension: search memes for a moment, read one template, see what is trending, list the image tools (free tools only)
log memelord tools [--category imageToImage|imageTextToImage|textToImage] [--json]   (the catalog of one-shot image tools; log never runs them)
Search ranks what it finds by matt's taste (--noTaste turns it off): SubQ reads each template's picture against the styles he named (deep fried, larping, streamer reacts like FlightReacts, Zias and Bloo, shitposts) and the memes he has sent, and the taste line leads the answer.
Memelord is an extension (docs/extensions/memelord.md): only its four free discovery tools are reachable from log, so nothing here spends money (rule 41). The key is MEMELORD_API_KEY in .env.local. A meme goes out on Discord as its media url on a line of its own, which Discord shows inline.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 41, 94, 119, 120, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `memelordTaste`

matt's meme taste: the styles he named and the memes he has sent, each read by SubQ from its picture; --build makes it from a file of his X media posts.
The Memelord extension: search memes for a moment, read one template, see what is trending, list the image tools (free tools only)
log memelord taste [--build --from <posts.json>] [--json]   (matt's meme taste: the styles he named and the memes he has sent, each read by SubQ from its picture; --build reads a file of his X media posts)
Search ranks what it finds by matt's taste (--noTaste turns it off): SubQ reads each template's picture against the styles he named (deep fried, larping, streamer reacts like FlightReacts, Zias and Bloo, shitposts) and the memes he has sent, and the taste line leads the answer.
Memelord is an extension (docs/extensions/memelord.md): only its four free discovery tools are reachable from log, so nothing here spends money (rule 41). The key is MEMELORD_API_KEY in .env.local. A meme goes out on Discord as its media url on a line of its own, which Discord shows inline.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 41, 94, 119, 120, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `tregSearch`

Find a treg endpoint by what you want done: each one's id, what it does and its price.
The treg extension: find an endpoint by the job, read it, and call it with the key injected server-side (free ones run, priced ones only when matt asked)
log treg search "<what you want done>" [--limit <n>] [--json]   (treg's catalog, found by the job: each endpoint's id, what it does and its price)
treg is an extension (docs/extensions/treg.md): every lookup comes from an external source through it (rule 53), and nothing that costs money runs unless matt asked (rule 41). It runs the treg CLI on this machine (TREG_BIN moves it); treg's balance is in log balance.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 41, 53, 106, 119, 166, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `tregGet`

One treg endpoint in full: its price, its params and a call that works.
The treg extension: find an endpoint by the job, read it, and call it with the key injected server-side (free ones run, priced ones only when matt asked)
log treg get <endpointId> [--json]   (one endpoint in full: its price, its params and a call that works)
treg is an extension (docs/extensions/treg.md): every lookup comes from an external source through it (rule 53), and nothing that costs money runs unless matt asked (rule 41). It runs the treg CLI on this machine (TREG_BIN moves it); treg's balance is in log balance.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "web/competitorTraffic" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 41, 53, 106, 119, 166, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `tregCall`

Call a treg endpoint, the key injected server-side: a free one runs, a priced one is a dry run saying its price unless live with approvedBy.
The treg extension: find an endpoint by the job, read it, and call it with the key injected server-side (free ones run, priced ones only when matt asked)
log treg call <endpointId> [--params '<json object>'] [--path <path>] [--method <GET|POST>] [--data '<body>'] [--await] [--maxItems <n>] [--fields <a,b>] [--where <key=value>] [--raw] [--approvedBy <who>] [--live] [--json]   (calls it through treg, the key injected server-side: a free endpoint runs; a priced one is a dry run that says its price unless --live with --approvedBy; the answer drops treg's raw copy unless --raw, and --maxItems, --fields and --where trim every list in it)
treg is an extension (docs/extensions/treg.md): every lookup comes from an external source through it (rule 53), and nothing that costs money runs unless matt asked (rule 41). It runs the treg CLI on this machine (TREG_BIN moves it); treg's balance is in log balance.
Fill the named fields; each value goes through whole. What acts on Facebook is `tregCallLive`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "reddit/contributorMaxxing" }), getGuide({ useCase: "web/competitorTraffic" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 41, 53, 106, 119, 166, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `tregCallLive`

Call a treg endpoint, the key injected server-side: a free one runs, a priced one is a dry run saying its price unless live with approvedBy.
Live on Facebook: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
The treg extension: find an endpoint by the job, read it, and call it with the key injected server-side (free ones run, priced ones only when matt asked)
log treg call <endpointId> [--params '<json object>'] [--path <path>] [--method <GET|POST>] [--data '<body>'] [--await] [--maxItems <n>] [--fields <a,b>] [--where <key=value>] [--raw] [--approvedBy <who>] [--live] [--json]   (calls it through treg, the key injected server-side: a free endpoint runs; a priced one is a dry run that says its price unless --live with --approvedBy; the answer drops treg's raw copy unless --raw, and --maxItems, --fields and --where trim every list in it)
treg is an extension (docs/extensions/treg.md): every lookup comes from an external source through it (rule 53), and nothing that costs money runs unless matt asked (rule 41). It runs the treg CLI on this machine (TREG_BIN moves it); treg's balance is in log balance.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 41, 53, 106, 119, 166, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `balance`

Every paid provider log calls (SubQ, Jina, Inworld, Fish Audio, AssemblyAI, Parallel, treg, 2Captcha, Byteful): its balance, or its last answer when it has no balance API, and which are out of credit.
Every paid provider log calls, with what is left and which are out of credit
log balance [--provider <name>] [--json]
Every paid provider log calls, with what is left: subq, jina, inworld, fishAudio, assemblyAi, parallel, treg, twoCaptcha, byteful.
A provider with a balance API (Jina, Fish Audio, treg, 2Captcha, Byteful) is read from it. One without one (SubQ, Inworld, AssemblyAI, Parallel) shows its last answer to a real call, which log keeps for every call (~/.logCli/billing/answers.jsonl). A provider that answered it is out of credit shows outOfCredit, so a failing voice note or gate is seen as money, not a bug.
Reading balances spends nothing (rule 41). Topping up is matt's: never done from log.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 41, 73, 94, 164, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `cloneVoice`

matt's voice cloned once on the voice provider from his own voice notes; without --apply it lists the recordings it would use.
matt's voice, cloned once per provider (Inworld or Fish Audio) from his own voice notes, and words said in it to a local file
log clone voice [--provider inworld|fishAudio] [--from <file>[,<file>]] [--apply] [--replace] [--json]   (matt's voice, cloned once per provider from his own voice notes, or from recordings of his own he names with --from, each one's words read from a .txt beside it; without --apply it lists the recordings it would use; --replace makes it again and keeps the old voice id under previous)
Voice cloning is provider-agnostic (docs/extensions/voiceClone.md): the provider is --provider, else LOG_VOICE_PROVIDER in .env.local, else inworld. Each provider is an extension of its own (src/extensions/inworld, src/extensions/fishAudio) behind one interface (src/extensions/voiceClone). The clone is made only from the voice notes matt sent himself (fromMe in the conversation store or his ownMessage in the .db), the shortest first, within the provider's limit (Inworld 3 to 30 s, Fish 10 to 60 s). Each provider's voice id is kept in ~/.logCli/voice/clone.json. A clone speaks with the provider's preferred model (Inworld inworld-tts-2, which takes emotion tags), else its cheapest, unless --model says otherwise, at LOG_VOICE_SPEED (default 1.15). The clone is made in matt's accent: LOG_VOICE_ACCENT (default Irish) as its description and LOG_VOICE_LANGUAGE (default en-IE, en-GB when Inworld refuses it) as its language, with each sample's AssemblyAI transcript when ~/.logCli/transcripts has one; no accent instruction is sent with the text. Every spoken file is shaped like matt's own voice notes (his room tone from his notes, phone squash, mic drift, saturation; breaths on inworld-tts-2) and listened back with AssemblyAI: a lexicon word said wrong is refused spokenMismatch, an acronym not in the lexicon pronunciationUnknown. A voice note goes out only when matt asks for one: log discord voice, log instagram voice or log slack voice (rules 142, 143, 145, 146, 147).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/voiceNote" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 39, 41, 94, 106, 119, 142, 143, 145, 146, 147, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `cloneSpeak`

Say words in matt's cloned voice, to a local audio file under ~/.logCli/voiceNotes; plays and sends nothing.
matt's voice, cloned once per provider (Inworld or Fish Audio) from his own voice notes, and words said in it to a local file
log clone speak --text "<words>" [--provider inworld|fishAudio] [--model <model>] [--format mp3|wav] [--json]   (the words in his cloned voice, to a file under ~/.logCli/voiceNotes; nothing is played or sent)
Voice cloning is provider-agnostic (docs/extensions/voiceClone.md): the provider is --provider, else LOG_VOICE_PROVIDER in .env.local, else inworld. Each provider is an extension of its own (src/extensions/inworld, src/extensions/fishAudio) behind one interface (src/extensions/voiceClone). The clone is made only from the voice notes matt sent himself (fromMe in the conversation store or his ownMessage in the .db), the shortest first, within the provider's limit (Inworld 3 to 30 s, Fish 10 to 60 s). Each provider's voice id is kept in ~/.logCli/voice/clone.json. A clone speaks with the provider's preferred model (Inworld inworld-tts-2, which takes emotion tags), else its cheapest, unless --model says otherwise, at LOG_VOICE_SPEED (default 1.15). The clone is made in matt's accent: LOG_VOICE_ACCENT (default Irish) as its description and LOG_VOICE_LANGUAGE (default en-IE, en-GB when Inworld refuses it) as its language, with each sample's AssemblyAI transcript when ~/.logCli/transcripts has one; no accent instruction is sent with the text. Every spoken file is shaped like matt's own voice notes (his room tone from his notes, phone squash, mic drift, saturation; breaths on inworld-tts-2) and listened back with AssemblyAI: a lexicon word said wrong is refused spokenMismatch, an acronym not in the lexicon pronunciationUnknown. A voice note goes out only when matt asks for one: log discord voice, log instagram voice or log slack voice (rules 142, 143, 145, 146, 147).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/voiceNote" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 39, 41, 94, 106, 119, 142, 143, 145, 146, 147, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From AGENTS.md (`log://agents`). The newest rules are at the bottom of AGENTS.md and win.

**Rule 30.** 2026-10-19 · matt: "If I tell you to do something, do it completely." When matt gives a plan, it is carried out to the end in the same turn, not stopped to ask again or to say what won't be done. `log inspect start --now` (and `log connect --now`, and since 2026-10-19 `log publish --now`, matt: "run it now") skips rule 24's 10-minute gap (the 8 a day still holds) so a recording continues at once. Recording a sign-in or a checkpoint with `log inspect` (signIn, code, solve, click) is the intended work: it is how each state gets documented from rea. The run on 2026-10-19 was interrupted once because a snapshot printed the account's email and password; snapshots now redact every typed field value (`redact_fields`), and signIn/code read only the private login.json (rule 21), so no credential reaches any output.

**Rule 38.** 2026-10-19 · matt: never mention or discuss Meta's or Facebook's rules, terms, policies, eligibility or account ownership with him unless he raises them first. Research text that does is not his, and is never repeated to him. Top of this file.

**Rule 39.** 2026-10-19 · matt: "If I never mentioned it, if I never inferred it, if I never outlined it as an option, therefore it is not an option." Deep research prompts, searches, SubQ matrices, plans and write-ups use only what matt said, or clearly meant through a misspelling. Nothing added, nothing steered towards. Top of this file.

**Rule 40.** 2026-10-19 · matt: no physical options. He is in Vietnam with no physical access. Phones, SIMs, mini PCs, laptops, phone farms and home devices are never options unless he names them. In scope: hosted and cloud options, the tools he named and their competitors, and what our four projects already use.

**Rule 41.** 2026-10-19 · matt: "any time any task correlates to money, and I never say something, that means you shouldn't do what you think. You should do what I say." Paid work (deep research, SubQ, proxies, captcha, vendors) does exactly what he asked, nothing more. Ask before anything else.

**Rule 53.** 2026-10-20 · matt: when something has to be found (a group to join, a provider, a price, a fact), it comes from an external source, never from memory or a guess: search with TinyFish through treg (`treg call tinyfish.web.search`, `tinyfish.web.fetch`, free) as the basis for every lookup, and pull the actual candidates from it. A suggestion names where it came from (the page, the search), and a pick is one of what the search returned.

**Rule 73.** 2026-10-23 · matt: "IT MUST ALWAYS READ THEM." The number one rule of the stack, above rule 30 and every other: Facebook's internal API answers are the decision-making factor of what and when something is relevant, and the deterministic factor of the system. Every browser step reads the internal API answers it triggers and the requests it sent, keeps them past the prune, and decides on them, never on a page loading, a timer or the step having run. The MCP instructions put it first. Inspect steps read theirs since rule 74, and every flow, warm-up and host step on AdsPower that makes a call since 2026-10-23; the Camoufox-only machines don't yet (#35). Top of this file.

**Rule 94.** 2026-10-29 · matt: "whatever you did in such quick succession lead to my account getting disabled, never do that again." Never act on an account in quick succession. What happened (matt's Discord, `sourcedandsoldtothehighestbidder`, 2026-10-29 00:47-01:00 UTC): in about 13 minutes an agent replied in 3 chats, read 1,400 messages from a server (Finn Automated) with a scratch script that went around log-cli (`.scratch/finn/dc.ts`: its own fetch to `discord.com/api/v9` with the session token, pages back to back, retrying straight through 429s), pulled the account's relationships, then opened new DMs to strangers from that server 30 s apart. Discord disabled the account. From now on: - Every call to a platform goes through log-cli's own commands and their governor. Never a hand-rolled script with an account's token or cookies. - A 429 or a failed send stops the run. It is never retried through, and the next action waits for matt. - Reading a server, group or member list in bulk is its own session. It never runs in the same session as sending. - Cold DMs to people the account has never talked to go out at most a few a day, minutes apart, never back to back. Each new DM channel opened counts as a write. - After a block, disable, captcha or cooldown, nothing resumes on that account until matt says so.

**Rule 106.** 2026-11-01 · matt: "when doing stuff like changing the code or anything, ensure that there hasn't been any changes to it locally, like to the engine ... you're not allowed hand-rolled commands, it always has to be through the MCP basically". Two things, enforced by the hooks: - **Through the MCP only.** Every log action an agent takes goes through the log MCP tools (`mcp__log__…`), never a hand-run `log …` or `bun bin/log.ts …` from a shell. The PreToolUse hook (`liveLogs`, `handRunDenial` in `src/agentHooks/liveLog`) refuses one and names the MCP instead. Only the terminal-only prompts (`TERMINAL_ONLY`: launch, login, mcp, chat pin, cookies save, messenger pin) are run in a terminal, by matt. A stale MCP server is said to matt (restart the app), never worked around. - **Local changes first.** Before changing code, check what is already changed and uncommitted in the checkout. The engines hook says it loudly at session start and whenever it changes (`>>> UNCOMMITTED LOCAL CHANGES`, `localChangesLine` in `src/mcp/freshness`): read each one's diff, and never overwrite, revert, stage, publish or ship someone else's uncommitted work without matt.

**Rule 119.** 2026-11-02 · matt: extensions, "things that we think are going to make the experience of using social media more human", first Memelord ("we will only use these": `search_memes`, `get_meme_template`, `get_trending_memes`, `list_image_tools`, all free). An extension is an outside service log reaches through its own command and MCP tools, never by hand (rule 106), documented in its own docs area, `docs/extensions/` (a tab of its own on the docs site). Memelord's client (`src/extensions/memelord`) knows only those four GET endpoints of `https://www.memelord.com/api/v1`, with `MEMELORD_API_KEY` as a bearer token; nothing that generates, edits or runs a model has a path in log (rule 41). `log memelord search|template|trending|tools` (MCP `memelordSearch`, `memelordTemplate`, `memelordTrending`, `memelordTools`, the `extensions` guide, the `memelord` skill) answers each template with its media url. A meme goes out on Discord as that url on a line of its own, which Discord shows inline: read the chat, pick the moment, search, gate it with `voice`, send it by the chat's id (`docs/useCases/discord/memeReply.md`). First sent 2026-11-02 to the log group: Floyd Mayweather's Cash Stacks, on "how much shall i charge". Spec: `docs/specs/memelord.md`.

**Rule 120.** 2026-11-02 · matt: "start creating meme taste ... injecting into the context the kind of memes that we need": deep fried memes, memes about larping, streamer reaction clips like FlightReacts, Zias and Bloo, and shitposts, "those are the type of memes that I think are bangers", and "a meme index for taste ... over the type of memes we've done before". His taste lives in `~/.logCli/memes/taste.json` (`src/extensions/memeTaste`): `log memelord taste --build --from <posts.json>` reads every picture in his X media posts (treg `tikhub.x.twitter-web-fetch-user-media`, which matt said to spend on) and asks SubQ, from the picture, whether it is a meme and which of his styles it is (`TASTE_STYLES`, or other), keeping the memes. `log memelord search` scores each template's picture against his taste with SubQ (`tasteFit`) and ranks by it, `--noTaste` keeping Memelord's order, and every answer leads with his taste (`tasteSummary`), so the agent picking a meme has it in context. `log memelord taste` (MCP `memelordTaste`) shows it. Spec: `docs/specs/memelord.md` (REQ-MEME-09, REQ-MEME-10).

**Rule 142.** 2026-11-05 · matt: "make it so that we can send audio, like upload natively into the platform, voice notes ... directly into the actual clients themselves ... we need to voice clone ourselves from audio ... it will then be an extension, like we have for the meme board stuff", with Fish Audio (hosted) his pick. A voice note only ever goes out when matt asks for one, in his cloned voice, as the platform's own voice note: never on the agent's own initiative and never any other audio. Fish Audio is an extension (`src/extensions/fishAudio`, `docs/extensions/fishAudio.md`): `log fish clone` makes his voice model once from the voice notes he sent himself (fromMe in the conversation store or his `ownMessage` in the .db; Discord voice messages and Instagram voice clips the engines kept, 10 to 60 s in all; nobody else's voice), a dry run listing them unless `--apply`, its id kept in `~/.logCli/voice/fishClone.json`; `log fish speak --text` says words in it to a file under `~/.logCli/voiceNotes` and sends nothing, on the free `s2.1-pro-free` model unless `--model`. `log discord voice`, `log instagram voice` and `log slack voice` take text only (an audio file is refused with `voiceNoteInvalid`), are dry runs unless `--live` with `--approvedBy` (rule 8), wait for the account to catch up (rule 135), run the text through the voice gate (rule 137), make it with the clone, convert it with ffmpeg (Discord ogg/opus, sent as a voice message with flags 8192, its waveform and duration; Instagram AAC in .m4a through instagrapi's `direct_send_voice`, its upload on curl_cffi under the one-call lock, rule 129; Slack AAC in .m4a through `files.getUploadURLExternal`, the upload on gabriel's curl_cffi transport and `files.completeUploadExternal`, rule 125), claim the chat (rule 133), count as a write, and stop on any refusal (rule 94). An engine sends only a file log made under `~/.logCli/voiceNotes`. X isn't built: twikit has no audio send and no vendored code or doc shows X's DM voice upload, so nothing is guessed. `src/cli/voiceNote`. Spec: `docs/specs/voiceClone.md` (was `fishVoice.md`).

**Rule 143.** 2026-11-05 · matt: "the voice cloning and the voice note stuff will be agnostic", after Fish Audio refused the clone without API credit (403, model creation limit 0/0) and he had none to put in. The voice layer is provider-agnostic, the way proxies are (rule 52): `src/extensions/ voiceClone` holds one interface (its models, cheapest model, clone limits, the reference format it takes, clone and speak), and each provider is an extension of its own: `src/extensions/inworld` (the default: instant cloning free, about 70 free speech minutes, wav references 3 to 30 s, `inworld-tts-2-flash`, `INWORLD_API_KEY`) and `src/extensions/fishAudio`. The provider is `--provider`, else `LOG_VOICE_PROVIDER` in `.env.local`, else inworld. `log fish clone|speak` became `log clone voice|speak` (MCP `cloneVoice`, `cloneSpeak`); `log fish` is refused with the form it became (rule 63's pattern). Each provider's clone is kept in `~/.logCli/voice/clone.json`, keyed by provider, made once. `log discord|instagram|slack voice` take `--provider` and call only the shared layer, never a provider. Everything else in rule 142 holds. Spec: `docs/specs/voiceClone.md`.

**Rule 145.** 2026-11-05 · matt: "Yes, re-clone it", because the Inworld clone was made with `languageCode` en-US, which pulled his voice towards an American accent, and he is Northern Irish. The voice is cloned and spoken in his accent: `LOG_VOICE_ACCENT` (`.env.local`, default Northern Irish) and `LOG_VOICE_LANGUAGE` (default en-IE, sent again as en-GB when Inworld answers `INVALID_ARGUMENT`). The clone sends that language, a description naming the accent and each sample's AssemblyAI transcript from `~/.logCli/transcripts` when there is one (none is paid for: TTS-2 makes its own), and keeps the language Inworld accepted. `log clone voice --apply --replace` (MCP `replace`) makes it again over the old one, which stays in the clone file under `previous`, never deleted. Speech sends the clone's language; on `inworld-tts-2` the text starts with `[say it in a <accent> accent]`, an instruction Inworld removes before synthesis, and `inworld-tts-2-flash`, which ignores steering, gets none. Spec: `docs/specs/voiceClone.md` (REQ-VOICE-CLONE-11). (Its accent steer was replaced by rule 147, matt 2026-11-05.)

**Rule 146.** 2026-11-05 · matt: "the second one but why does it speak so slowly" and "use the discord audio for the samples". The clone speaks at `LOG_VOICE_SPEED` (`.env.local`, default 1.15, kept between 0.8 and 1.5), sent as Inworld's `speakingRate`, and a clone made on Inworld speaks with `inworld-tts-2` (the provider's `preferred` model, which takes emotion tags), not the cheapest. `log clone voice --from <file>[,<file>]` clones from recordings of matt's own that he names instead of his voice notes, each one's words read from a `.txt` of the same name beside it. Spec: `docs/specs/voiceClone.md` (REQ-VOICE-CLONE-12).

**Rule 147.** 2026-11-05 · matt: "ITS IRISH", none of the accent-steered clips sounded like him, "11_script_long272_b ... was pretty good", then "go through my voice notes ... analyse it", "it still doesn't have that distortion", and "op is real like op not o p ... make it the gate for the voice ... or it won't pass". A voice note sounds like his own voice notes and says what was written, measured both times: - **The clone** is Inworld instant cloning from one continuous 30 s of his own Discord voice note (`matt-long272_b`, 2:30 into his 4.5 minute note), the accent `Irish` (`LOG_VOICE_ACCENT`). No accent instruction is sent with the text: the clone carries the accent. On `inworld-tts-2` breaths are put in (`[breathe]` at the start and once at least 8 words have gone by, `withBreaths`). - **Shaped like his notes** (`processLikeMatt`, `src/extensions/voiceClone/helpers/realism.ts`), every number measured from five of his real Discord voice notes against the clone: phone squash (`dynaudnorm`), the phone mic's own tone curve measured from his notes (`REALISM.phoneCurve`: its low cut under 160 Hz, its dip around 2 to 3 kHz and its dull top over 5 kHz), his slow mic drift (1.9 dB), tone sway as the phone moves, phone-mic saturation on loud words, and his own room tone taken from the gaps in his own voice notes (never a sound effect), laid 22 dB under the voice so it lands where his do (30 to 33 dB). Seeded by the text, so the same words come out the same. - **Listened back** (`readSpoken`, `spoken.ts`): the shaped note is transcribed with AssemblyAI's word timings and lined up with the text. A word in the spoken lexicon (`SPOKEN_LEXICON`: `op` said as a word, written `OP` for the clone, since a lower-case `op` came out as "up") must be heard as itself, as one word under 400 ms; spelled out, heard as something else, or more than a quarter of the words different, and it is refused with `spokenMismatch`, naming what was heard. An acronym the lexicon doesn't have is refused before anything is spoken (`pronunciationUnknown`): how matt says it is never guessed. A note that can't be listened back is never sent (`spokenCheckFailed`). It runs in `log clone speak` and every `log discord|instagram|slack voice`. This replaces rule 145's accent steer. Spec: `docs/specs/voiceClone.md` (REQ-VOICE-CLONE-13, 14).

**Rule 164.** 2026-11-07 · matt: "have a way inside of log to be able to view our balance ... for the extensions as well ... if we have an issue with the actual calls such as voice then it keeps causing issues but it may be because the balance is low". `log balance` (MCP `balance`) shows every paid provider log calls: SubQ, Jina, Inworld, Fish Audio, AssemblyAI, Parallel, treg, 2Captcha and Byteful. Where the provider has a balance API it is read (Jina's tokens, Fish Audio's credit, treg, 2Captcha, Byteful's residential traffic); where it has none, its last answer to a real call decides. The SubQ, Jina, Inworld, Fish Audio and AssemblyAI clients keep every answer in `~/.logCli/billing/answers.jsonl`, and one that says it is out of credit (a 402, insufficient credit, payment required) says so in the failure itself, naming where to top up (`providerOutOfCredit`), so a failing voice note or gate is seen as money, not a bug. Reading a balance spends nothing, and topping up is matt's (rule 41). Spec: `docs/specs/balance.md`.

**Rule 166.** 2026-11-07 · matt: "make it so that we can then call treg as an extension inside of this as well and then write it up into the extensions". treg is an extension like Memelord (rule 119), reached through log's own command and MCP tools, never by hand (rule 106): - **`log treg search "<job>"`** (MCP `tregSearch`) finds an endpoint by what you want done, with each one's price. - **`log treg get <id>`** (MCP `tregGet`) reads one endpoint in full: its price, its params and a call that works. - **`log treg call <id> --params '<json>'`** (MCP `tregCall`) calls it through the treg CLI on this machine, the key injected server-side by treg (`TREG_BIN` moves it). The price is read from `get` before every call. A free endpoint runs. A priced one is a dry run that says its price and the exact command, and runs only with `--live` and `--approvedBy` (MCP `tregCallLive`) when matt asked for that spend (rule 41). Every call is a timed span (rule 165), and treg's balance is in `log balance` (rule 164). It is the way every lookup reaches an external source (rule 53). `src/extensions/treg`, `src/cli/treg`, `docs/extensions/treg.md`. Spec: `docs/specs/treg.md`.
