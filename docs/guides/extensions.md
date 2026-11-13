# extensions

Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, the owner's cloned voice (Inworld or Fish Audio) for the voice notes they ask for, every paid provider's balance, and treg's catalog of endpoints for every lookup.

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

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

Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.

| Tool | What it does | Usage |
|---|---|---|
| `memelordSearch` | Search Memelord's template library | `log memelord search "<what the moment is>" [--type meme\|video\|sticker] [--method context\|combined\|media\|fulltext\|fuzzy] [--limit <n>] [--json]` |
| `memelordTemplate` | One Memelord template by its id | `log memelord template <id> [--json]   (one template: its name, media url, text slots and what it means)` |
| `memelordTrending` | Memelord's trending templates right now, each with its cultural… | `log memelord trending [--limit <n>] [--media image\|video] [--json]   (what is trending now, with its cultural context)` |
| `memelordTools` | Memelord's catalog of one-shot image tools | `log memelord tools [--category imageToImage\|imageTextToImage\|textToImage] [--json]   (the catalog of one-shot image tools; log never runs them)` |
| `memelordTaste` | the owner's meme taste | `log memelord taste [--build --from <posts.json>] [--json]   (the owner's meme taste: the styles they named and the memes they have sent, each read by SubQ from its picture; --build reads a file of their X media posts)` |
| `tregSearch` | Find a treg endpoint by what you want done | `log treg search "<what you want done>" [--limit <n>] [--json]   (treg's catalog, found by the job: each endpoint's id, what it does and its price)` |
| `tregGet` | One treg endpoint in full | `log treg get <endpointId> [--json]   (one endpoint in full: its price, its params and a call that works)` |
| `tregCall` | Call a treg endpoint, the key injected server-side | `log treg call <endpointId> [--params '<json object>'] [--path <path>] [--method <GET\|POST>] [--data '<body>'] [--await] [--maxItems <n>] [--fields <a,b>] [--where <key=value>] [--raw] [--approvedBy <who>] [--live] [--json]   (calls it through treg, the key injected server-side: a free endpoint runs; a priced one is a dry run that says its price unless --live with --approvedBy; the answer drops treg's raw copy unless --raw, and --maxItems, --fields and --where trim every list in it)` |
| `tregCallLive` | Call a treg endpoint, the key injected server-side, live on the platform | `log treg call <endpointId> [--params '<json object>'] [--path <path>] [--method <GET\|POST>] [--data '<body>'] [--await] [--maxItems <n>] [--fields <a,b>] [--where <key=value>] [--raw] [--approvedBy <who>] [--live] [--json]   (calls it through treg, the key injected server-side: a free endpoint runs; a priced one is a dry run that says its price unless --live with --approvedBy; the answer drops treg's raw copy unless --raw, and --maxItems, --fields and --where trim every list in it)` |
| `balance` | Every paid provider log calls | `log balance [--provider <name>] [--json]` |
| `cloneVoice` | the owner's voice cloned once on the voice provider from their own… | `log clone voice [--provider inworld\|fishAudio] [--from <file>[,<file>]] [--apply] [--replace] [--json]   (the owner's voice, cloned once per provider from their own voice notes, or from recordings of their own they name with --from, each one's words read from a .txt beside it; without --apply it lists the recordings it would use; --replace makes it again and keeps the old voice id under previous)` |
| `cloneSpeak` | Say words in the owner's cloned voice, to a local audio file under… | `log clone speak --text "<words>" [--provider inworld\|fishAudio] [--model <model>] [--format mp3\|wav] [--json]   (the words in his cloned voice, to a file under ~/.logCli/voiceNotes; nothing is played or sent)` |

## The work, step by step: memelord

From `skills/memelord/SKILL.md`.

## memelord

Memelord is log's first extension: a library of meme templates, video clips
and stickers, found by meaning. log reaches only its four free discovery
tools, so nothing here costs money (rule 41).

### Hard boundaries

- **Only where it carries the chat on.** A chat waiting on them (they owe a
  reply, or they promised something) can take a meme that nudges it; a chat
  where the owner's last messages are still unanswered never gets one stacked on top.
- **Free tools only.** `memelordSearch`, `memelordTemplate`, `memelordTrending`
  and `memelordTools`. Nothing that generates, edits or runs a model is
  reachable from log, and `memelordTools` lists the image tools without ever
  running one.
- **The chat comes first.** Read it before picking anything (rule 109): a meme
  answers what was just said, in the way that chat already jokes.
- **Every send is gated** (`voice` with the chat) and paced by the account's
  governor (rule 94). One meme at a time; never a run of them.
- **A price, a promise or a meeting is the owner's**. A meme can laugh
  about money; it never names a price for the owner.

### The loop

1. Read the chat: `discordRead` { account, channel, limit: 25 }. Note the
   chat's id from the first line (`… in <channelId>`).
2. Find the moment: the last thing said that a person would answer with a
   reaction (a question to the group, a joke, a win, a fail).
3. Search: `memelordSearch` { query: [the moment in a few words] }. The
   answer leads with the owner's taste and ranks by it (deep fried, larping,
   streamer reacts like FlightReacts, Zias and Bloo, shitposts, and the memes
   the owner has sent): pick from the top, a clean corporate meme is never the owner's. Short
   queries match best: a long sentence often returns one result or none. Use
   `method: "combined"` to add keyword matching, `type: "meme"` for a still
   image, `"video"` for a clip. `memelordTrending` gives what is current, each
   with what it means.
4. Pick one whose name and description fit the moment, and take its media
   url (`.webp`/`.png` for an image, `.mp4` for a clip).
5. Gate it: `voice` { to: <chat>, with: <chat>, context: <the moment and the
   meme picked>, text: <the url, and a line if one fits> }.
6. On X, send it as a dm with the meme attached: `twitterDmLive` { account,
   userId, text: <a line or two>, media: <the meme url>, approvedBy: "<owner>",
   confirmLive: true }. The url is downloaded, uploaded as X dm media and put on
   the first message; the dm's other lines follow it.
7. On Discord, send it by the chat's id, so the engine doesn't list every chat first:
   `discordSendLive` { account, channel: <channelId>, text, approvedBy: "<owner>",
   confirmLive: true }. A url on a line of its own is a message of its own
   (rule 90), and Discord shows it inline.

### The owner's taste

`memelordTaste` shows it; `memelordTaste` { build: true, from: <posts.json> }
rebuilds it from the owner's X media posts (treg `tikhub.x.twitter-web-fetch-user-media`,
the timeline items of every page, joined in one file). Rebuild when the owner has
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

log holds one voice: the owner's, cloned from the voice notes the owner sent themselves,
on a voice provider (Inworld by default, Fish Audio as the other). log uses
it to send voice notes the owner asks for, as each platform's own voice note.

### Hard boundaries

- **Only when the owner asks.** A voice note goes out only when the owner says to send
  one. Never on the agent's own initiative, never as a reply style.
- **Only the owner's voice, only from text.** The clone is made from the owner's own voice
  notes (fromMe), never anyone else's. Every send takes text and makes the
  audio itself; an audio file is never accepted.
- **Free first.** Inworld clones for free with about 70 free speech minutes;
  each provider's cheapest model is the default. Anything that costs money
  is the owner's call (rule 41).
- **The owner's words.** If the voice gate refuses what the owner asked to say, tell them;
  never rewrite those words yourself.
- **Like any send.** Gated (rule 137), claimed (rule 133), counted as a write,
  and a refusal stops with nothing retried (rule 94).

### The routine

1. No clone yet on the provider: `cloneVoice` lists the recordings it would
   use; `cloneVoice` with apply makes it once. `cloneSpeak` says a test line.
2. Read the chat, take what the owner asked to say, gate it with `voice`.
3. Dry run with `discordVoice`, `instagramVoice` or `slackVoice`.
4. Send with the `…Live` tool, approvedBy <owner>.
5. Tell the owner the words, the length and where it went.

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
   - A priced one comes back as a dry run with its price. Run it only when the owner asked for that spend: `tregCallLive` { id, params, approvedBy: "<owner>", confirmLive: true }.
4. **Name the source.** Say which endpoint the answer came from (rule 53).

### Hard boundaries

- Nothing that costs money runs unless the owner asked for it (rule 41).
- Every call goes through these tools, never a hand-run `treg` from a shell for log's work (rule 163).
- treg's balance: `balance`. How long a call took: `timing` { call }.

Docs: `docs/extensions/treg.md`. Spec: `docs/specs/treg.md`.

## The rules these tools fall under

Each by its number and first line. The full text is in AGENTS.md (`log://agents`); the core rules are in full in `getGuide({ topic: "logMcpInstructions" })`.

- **Rule 30.** Complete the authorized task.
- **Rule 38.** Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless the owner raises them.
- **Rule 39.** Use only the scope, options and intent the owner stated or implied.
- **Rule 40.** Do not propose physical infrastructure unless the owner asks.
- **Rule 41.** Paid work must stay within the authorized task and spend.
- **Rule 53.** Verify current external facts from sources.
- **Rule 73.** For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence.
- **Rule 94.** Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies.
- **Rule 142.** Send a cloned voice note only when the owner asks, through the platform's native voice-note tool and existing provider adapter.
- **Rule 163.** Agent Log actions go through Log MCP tools; never work around a stale or unavailable MCP with shell Log commands or scratch clients.
- **Rule 164.** Use existing provider balance/status and timing diagnostics when needed.
