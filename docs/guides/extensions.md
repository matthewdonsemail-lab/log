# extensions

Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 55). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Current scope

This guide describes the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.

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
AGENTS.md (log://agents): rules 41, 94, 142, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `memelordTemplate`

One Memelord template by its id: name, media url, text slots and what it means.
The Memelord extension: search memes for a moment, read one template, see what is trending, list the image tools (free tools only)
log memelord template <id> [--json]   (one template: its name, media url, text slots and what it means)
Search ranks what it finds by matt's taste (--noTaste turns it off): SubQ reads each template's picture against the styles he named (deep fried, larping, streamer reacts like FlightReacts, Zias and Bloo, shitposts) and the memes he has sent, and the taste line leads the answer.
Memelord is an extension (docs/extensions/memelord.md): only its four free discovery tools are reachable from log, so nothing here spends money (rule 41). The key is MEMELORD_API_KEY in .env.local. A meme goes out on Discord as its media url on a line of its own, which Discord shows inline.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 41, 94, 142, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `memelordTrending`

Memelord's trending templates right now, each with its cultural context.
The Memelord extension: search memes for a moment, read one template, see what is trending, list the image tools (free tools only)
log memelord trending [--limit <n>] [--media image|video] [--json]   (what is trending now, with its cultural context)
Search ranks what it finds by matt's taste (--noTaste turns it off): SubQ reads each template's picture against the styles he named (deep fried, larping, streamer reacts like FlightReacts, Zias and Bloo, shitposts) and the memes he has sent, and the taste line leads the answer.
Memelord is an extension (docs/extensions/memelord.md): only its four free discovery tools are reachable from log, so nothing here spends money (rule 41). The key is MEMELORD_API_KEY in .env.local. A meme goes out on Discord as its media url on a line of its own, which Discord shows inline.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/memeReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 41, 94, 142, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `memelordTools`

Memelord's catalog of one-shot image tools (face swaps, filters, generators); log lists them and never runs them.
The Memelord extension: search memes for a moment, read one template, see what is trending, list the image tools (free tools only)
log memelord tools [--category imageToImage|imageTextToImage|textToImage] [--json]   (the catalog of one-shot image tools; log never runs them)
Search ranks what it finds by matt's taste (--noTaste turns it off): SubQ reads each template's picture against the styles he named (deep fried, larping, streamer reacts like FlightReacts, Zias and Bloo, shitposts) and the memes he has sent, and the taste line leads the answer.
Memelord is an extension (docs/extensions/memelord.md): only its four free discovery tools are reachable from log, so nothing here spends money (rule 41). The key is MEMELORD_API_KEY in .env.local. A meme goes out on Discord as its media url on a line of its own, which Discord shows inline.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 41, 94, 142, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `memelordTaste`

matt's meme taste: the styles he named and the memes he has sent, each read by SubQ from its picture; --build makes it from a file of his X media posts.
The Memelord extension: search memes for a moment, read one template, see what is trending, list the image tools (free tools only)
log memelord taste [--build --from <posts.json>] [--json]   (matt's meme taste: the styles he named and the memes he has sent, each read by SubQ from its picture; --build reads a file of his X media posts)
Search ranks what it finds by matt's taste (--noTaste turns it off): SubQ reads each template's picture against the styles he named (deep fried, larping, streamer reacts like FlightReacts, Zias and Bloo, shitposts) and the memes he has sent, and the taste line leads the answer.
Memelord is an extension (docs/extensions/memelord.md): only its four free discovery tools are reachable from log, so nothing here spends money (rule 41). The key is MEMELORD_API_KEY in .env.local. A meme goes out on Discord as its media url on a line of its own, which Discord shows inline.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 41, 94, 142, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `tregSearch`

Find a treg endpoint by what you want done: each one's id, what it does and its price.
The treg extension: find an endpoint by the job, read it, and call it with the key injected server-side (free ones run, priced ones only when matt asked)
log treg search "<what you want done>" [--limit <n>] [--json]   (treg's catalog, found by the job: each endpoint's id, what it does and its price)
treg is an extension (docs/extensions/treg.md): every lookup comes from an external source through it (rule 53), and nothing that costs money runs unless matt asked (rule 41). It runs the treg CLI on this machine (TREG_BIN moves it); treg's balance is in log balance.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 41, 53, 163, 142, 164, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `tregGet`

One treg endpoint in full: its price, its params and a call that works.
The treg extension: find an endpoint by the job, read it, and call it with the key injected server-side (free ones run, priced ones only when matt asked)
log treg get <endpointId> [--json]   (one endpoint in full: its price, its params and a call that works)
treg is an extension (docs/extensions/treg.md): every lookup comes from an external source through it (rule 53), and nothing that costs money runs unless matt asked (rule 41). It runs the treg CLI on this machine (TREG_BIN moves it); treg's balance is in log balance.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "web/competitorTraffic" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 41, 53, 163, 142, 164, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `tregCall`

Call a treg endpoint, the key injected server-side: a free one runs, a priced one is a dry run saying its price unless live with approvedBy.
The treg extension: find an endpoint by the job, read it, and call it with the key injected server-side (free ones run, priced ones only when matt asked)
log treg call <endpointId> [--params '<json object>'] [--path <path>] [--method <GET|POST>] [--data '<body>'] [--await] [--maxItems <n>] [--fields <a,b>] [--where <key=value>] [--raw] [--approvedBy <who>] [--live] [--json]   (calls it through treg, the key injected server-side: a free endpoint runs; a priced one is a dry run that says its price unless --live with --approvedBy; the answer drops treg's raw copy unless --raw, and --maxItems, --fields and --where trim every list in it)
treg is an extension (docs/extensions/treg.md): every lookup comes from an external source through it (rule 53), and nothing that costs money runs unless matt asked (rule 41). It runs the treg CLI on this machine (TREG_BIN moves it); treg's balance is in log balance.
Fill the named fields; each value goes through whole. What acts on Facebook is `tregCallLive`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "reddit/contributorMaxxing" }), getGuide({ useCase: "web/competitorTraffic" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 41, 53, 163, 142, 164, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `tregCallLive`

Call a treg endpoint, the key injected server-side: a free one runs, a priced one is a dry run saying its price unless live with approvedBy.
Live spends money (a priced lookup) but changes nothing on any account, so it is read-only and can run alongside other calls. Call it only when matt asked for that spend, with approvedBy and confirmLive: true (rule 41).
The treg extension: find an endpoint by the job, read it, and call it with the key injected server-side (free ones run, priced ones only when matt asked)
log treg call <endpointId> [--params '<json object>'] [--path <path>] [--method <GET|POST>] [--data '<body>'] [--await] [--maxItems <n>] [--fields <a,b>] [--where <key=value>] [--raw] [--approvedBy <who>] [--live] [--json]   (calls it through treg, the key injected server-side: a free endpoint runs; a priced one is a dry run that says its price unless --live with --approvedBy; the answer drops treg's raw copy unless --raw, and --maxItems, --fields and --where trim every list in it)
treg is an extension (docs/extensions/treg.md): every lookup comes from an external source through it (rule 53), and nothing that costs money runs unless matt asked (rule 41). It runs the treg CLI on this machine (TREG_BIN moves it); treg's balance is in log balance.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 41, 53, 163, 142, 164, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `balance`

Every paid provider log calls (SubQ, Jina, Inworld, Fish Audio, AssemblyAI, Parallel, treg, 2Captcha, Byteful): its balance, or its last answer when it has no balance API, and which are out of credit.
Every paid provider log calls, with what is left and which are out of credit
log balance [--provider <name>] [--json]
Every paid provider log calls, with what is left: subq, jina, inworld, fishAudio, assemblyAi, parallel, treg, twoCaptcha, byteful.
A provider with a balance API (Jina, Fish Audio, treg, 2Captcha, Byteful) is read from it. One without one (SubQ, Inworld, AssemblyAI, Parallel) shows its last answer to a real call, which log keeps for every call (the ledger table in ~/.logCli/log.db (kind providerAnswer)). A provider that answered it is out of credit shows outOfCredit, so a failing voice note or gate is seen as money, not a bug.
Reading balances spends nothing (rule 41). Topping up is matt's: never done from log.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 41, 73, 94, 164, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `cloneVoice`

matt's voice cloned once on the voice provider from his own voice notes; without --apply it lists the recordings it would use.
matt's voice, cloned once per provider (Inworld or Fish Audio) from his own voice notes, and words said in it to a local file
log clone voice [--provider inworld|fishAudio] [--from <file>[,<file>]] [--apply] [--replace] [--json]   (matt's voice, cloned once per provider from his own voice notes, or from recordings of his own he names with --from, each one's words read from a .txt beside it; without --apply it lists the recordings it would use; --replace makes it again and keeps the old voice id under previous)
Voice cloning is provider-agnostic (docs/extensions/voiceClone.md): the provider is --provider, else LOG_VOICE_PROVIDER in .env.local, else inworld. Each provider is an extension of its own (src/extensions/inworld, src/extensions/fishAudio) behind one interface (src/extensions/voiceClone). The clone is made only from the voice notes matt sent himself (fromMe in the conversation store or his ownMessage in the .db), the shortest first, within the provider's limit (Inworld 3 to 30 s, Fish 10 to 60 s). Each provider's voice id is kept in log.db. A clone speaks with the provider's preferred model (Inworld inworld-tts-2, which takes emotion tags), else its cheapest, unless --model says otherwise, at LOG_VOICE_SPEED (default 1.15). The clone is made in matt's accent: LOG_VOICE_ACCENT (default Irish) as its description and LOG_VOICE_LANGUAGE (default en-IE, en-GB when Inworld refuses it) as its language, with each sample's AssemblyAI transcript when ~/.logCli/transcripts has one; no accent instruction is sent with the text. Every spoken file is shaped like matt's own voice notes (his room tone from his notes, phone squash, mic drift, saturation; breaths on inworld-tts-2) and listened back with AssemblyAI: a lexicon word said wrong is refused spokenMismatch, an acronym not in the lexicon pronunciationUnknown. A voice note goes out only when matt asks for one: log discord voice, log instagram voice or log slack voice (rules 142, 143, 145, 146, 147).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/voiceNote" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 39, 41, 94, 163, 142, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `cloneSpeak`

Say words in matt's cloned voice, to a local audio file under ~/.logCli/voiceNotes; plays and sends nothing.
matt's voice, cloned once per provider (Inworld or Fish Audio) from his own voice notes, and words said in it to a local file
log clone speak --text "<words>" [--provider inworld|fishAudio] [--model <model>] [--format mp3|wav] [--json]   (the words in his cloned voice, to a file under ~/.logCli/voiceNotes; nothing is played or sent)
Voice cloning is provider-agnostic (docs/extensions/voiceClone.md): the provider is --provider, else LOG_VOICE_PROVIDER in .env.local, else inworld. Each provider is an extension of its own (src/extensions/inworld, src/extensions/fishAudio) behind one interface (src/extensions/voiceClone). The clone is made only from the voice notes matt sent himself (fromMe in the conversation store or his ownMessage in the .db), the shortest first, within the provider's limit (Inworld 3 to 30 s, Fish 10 to 60 s). Each provider's voice id is kept in log.db. A clone speaks with the provider's preferred model (Inworld inworld-tts-2, which takes emotion tags), else its cheapest, unless --model says otherwise, at LOG_VOICE_SPEED (default 1.15). The clone is made in matt's accent: LOG_VOICE_ACCENT (default Irish) as its description and LOG_VOICE_LANGUAGE (default en-IE, en-GB when Inworld refuses it) as its language, with each sample's AssemblyAI transcript when ~/.logCli/transcripts has one; no accent instruction is sent with the text. Every spoken file is shaped like matt's own voice notes (his room tone from his notes, phone squash, mic drift, saturation; breaths on inworld-tts-2) and listened back with AssemblyAI: a lexicon word said wrong is refused spokenMismatch, an acronym not in the lexicon pronunciationUnknown. A voice note goes out only when matt asks for one: log discord voice, log instagram voice or log slack voice (rules 142, 143, 145, 146, 147).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/voiceNote" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "extensions" }) (Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup).
AGENTS.md (log://agents): rules 39, 41, 94, 163, 142, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From the current AGENTS.md (`log://agents`). Historical citations are consolidated; archived instructions do not override the active scope.

**Rule 30.** 2026-10-19 · Complete the authorized task. Do not repeatedly request confirmation already given. Distinguish implemented behavior, proposed contracts and unverified assumptions.

**Rule 38.** 2026-10-19 · Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless Matt raises them.

**Rule 39.** 2026-10-19 · Use only the scope, options and intent Matt stated or implied. Do not add unrelated alternatives to research, comparisons, plans or implementation.

**Rule 40.** 2026-10-19 · Do not propose physical infrastructure unless Matt asks. His available implementation scope is hosted/cloud environments and the tools already selected.

**Rule 41.** 2026-10-19 · Paid work must stay within the authorized task and spend. Ask before adding a paid operation he did not authorize; do not substitute a new paid provider implicitly.

**Rule 53.** 2026-10-20 · Verify current external facts from sources. Use the connected tools and applicable guide first for platform/account work; do not invent provider capabilities or production infrastructure from memory.

**Rule 73.** 2026-10-23 · For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence. Use the existing REA/SubQ reading workflow when applicable, report the unknown state, write Point/Evidence/Explain and the fix, then name the state. Preserve paid-work scope. This runtime analysis does not add SubQ to commit/CI gates.

**Rule 94.** 2026-10-29 · Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies. A refusal, failed send, 429, block, disable, captcha or cooldown stops that run/account until Matt authorizes continuation. Do not retry through refusals. Bulk reading and sending are separate sessions; cold DMs stay a few a day, minutes apart, and opening a DM counts as a write.

**Rule 142.** 2026-11-05 · Send a cloned voice note only when Matt asks, through the platform's native voice-note tool and existing provider adapter. Use his authorized words, requested language/translation and pronunciation checks. Follow the voice-note guide for exact behavior; do not turn historical sample/model choices into a new global deployment requirement.

**Rule 163.** 2026-11-07 · Agent Log actions go through Log MCP tools; never work around a stale or unavailable MCP with shell Log commands or scratch clients. Terminal-only credential prompts remain for Matt. Expose discoverable command contracts through the existing Log catalog: search the job, get exact inputs, then call. Keep tool descriptions concise and accurate to the current implementation.

**Rule 164.** 2026-11-07 · Use existing provider balance/status and timing diagnostics when needed. Do not buy credit or change paid providers merely because a call failed.
