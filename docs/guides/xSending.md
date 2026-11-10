# xSending

Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 55). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Current scope

This guide describes the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "discord/channelReply" })` | Answering someone in a Discord chat or channel | "message the guy in <chat> who just mentioned me", "reply to <someone> in <chat>", "explain what I'm trying to do to <someone> in <chat>", "answer him in the general" |
| `getGuide({ useCase: "discord/memeReply" })` | Replying with a meme in a Discord chat | "respond with memes in the <chat>", "drop a meme in <chat> about that", "read <chat> and meme it" |
| `getGuide({ useCase: "inbox/bossMaxxing" })` | Bossmaxxing: giving out tasks to the team | "bossmaxxing", "give out the tasks", "send <person> the task in <group> and tag them", "tell <person> about everything I researched and give them an outline", "triage the jobs across the team", "walk <person> through setting up <tool>", "help <person> get set up like we did with <other person>" |
| `getGuide({ useCase: "inbox/reaLooksmaxxing" })` | /rea-looksmaxxing: moneymaxx like a creator | "/rea-looksmaxxing how clavicular gets paid", "moneymaxx like <creator>", "how does <creator> get paid" |
| `getGuide({ useCase: "inbox/reactions" })` | Reacting to a message | "react to that", "heart his message", "put a 😂 on what she said", "send a reaction to <person>" |
| `getGuide({ useCase: "inbox/voiceNote" })` | Sending a voice note | "send <person> a voice note saying …", "voice note him that …", "send a vn to the group saying …" |
| `getGuide({ useCase: "instagram/dmReply" })` | Reading and answering an Instagram DM | "read my instagram dms", "what did <someone> say on instagram", "reply to <someone> on instagram", "send <someone> a meme on instagram" |
| `getGuide({ useCase: "slack/dmReply" })` | Reading and answering a Slack DM | "read the messages with <someone> on slack", "reply to <someone> on slack", "what did <someone> say in <workspace>" |
| `getGuide({ useCase: "twitter/affiliateMarketing" })` | Affiliate marketing through your DMs | see the page |
| `getGuide({ useCase: "twitter/collabMaxxing" })` | Collab maxxing: turn open conversations into collabs | "position a collab first then be like just a few quid so i can make a video about it", "start network maxxing and collab maxxing and trying to see what hes doing get him to reveal it all", "follow up on deepman and the other people, small commitment from deals, not just new people but already open convos", "respond with the collabmaxxing", "selling the outcome", "let him name it", "check in with lior whats good there he is keen but isnt liquid", "just be nice to them there the poor people", "ask ben if i could become a contributor", "look on my twitter for missed opportunities". |
| `getGuide({ useCase: "twitter/dmInbox" })` | Reading the DM inbox: who is waiting on you | see the page |
| `getGuide({ useCase: "twitter/engagementReplies" })` | Answering the people who engaged with your posts | see the page |
| `getGuide({ useCase: "twitter/engagerDms" })` | DMing the people who liked or reposted your post | see the page |
| `getGuide({ useCase: "twitter/followUps" })` | Following up in your own voice | "follow up with these, not for anything in particular, just warming up the relationship", "say it was cool to meet him", "ask him for some advice on what he's doing", "take him up on the doc he offered". |
| `getGuide({ useCase: "twitter/getTheAction" })` | Getting people to do the thing: retweet, like, try it | "get me all them people who liked it ... yo cool to see that you liked that, would you give that a wee retweet", "notifications: people who like, comment, reply", "go through all the people there who need a message", "get them to retweet the thing", "would you do me a favour and give it a wee retweet", "I need them to retweet it so I can get some inbound leads", "I don't know what they're even talking about, explain the context", "make them do the action I need", "get the full context of everything on the account at the time of sending the message". |
| `getGuide({ useCase: "twitter/managerMaxxing" })` | Manager maxxing: the managers of the biggest Kick streamers | "manager maxxing", "find every kick streamer's manager on twitter", "reply guy the kick managers with memes", "the managers that engaged, send them their tweet, a message and a voice note". |
| `getGuide({ useCase: "twitter/networkMaxing" })` | Network maxing: grow the network, the niche map | "all them people messaging me, just message them something nice, get the ball moving with the networking", "we're not even trying to get anything out of these people, network max", "throw some new people in the mixer", "network max ... look at the nicheMap", "the whole point of it is to expand our network, which is the niche map", "follow them before you cold message them, and like the tweet you send them". |
| `getGuide({ useCase: "twitter/nicheMapRegion" })` | A new region of the niche map, then outbound to it | "for getting accepted into YC ... make a new area of the niche map through the systems we've already made ... the YC world and the funds' world, based on the 26 batch", "the YC stuff in and around the boat.dev people and the people involved in GTM tools", "pull all of my new followers ... set a budget of like 60$", "start with the 43", "not just treg but the actual index that we did already". |
| `getGuide({ useCase: "twitter/recruiting" })` | Recruiting on X with a reply queue | see the page |
| `getGuide({ useCase: "twitter/replyGuyFunnel" })` | Reply guy, then the DM, then the ask | "reply guy them first and foremost", "send a meme to the tweet then forward the tweet to them as an opener", "message the people who are new to following me", "get it in front of them", "funnel them into doing an action". |
| `getGuide({ useCase: "twitter/topicReplies" })` | Replying to everyone posting about one topic | see the page |

## The tools in this guide

| Tool | What it does |
|---|---|
| `voice` | Gate a draft against matt's own writing guide with SubQ before it is… |
| `voiceAiIndex` | Build the AI tells index with Jina and measure matt's own messages… |
| `voiceIndex` | Build matt's voice per chat and person from the conversations log… |
| `twitterReply` | Reply to one post on X with approved copy, on the direct-API engine |
| `twitterReplyLive` | Reply to one post on X with approved copy, on the…, live on X |
| `twitterQuote` | Quote one post on X with approved copy, on the direct-API engine |
| `twitterQuoteLive` | Quote one post on X with approved copy, on the…, live on X |
| `twitterPost` | Make one original post on X with approved copy and optional media |
| `twitterPostLive` | Make one original post on X with approved copy and…, live on X |
| `twitterLike` | Like one post on X, on the direct-API engine |
| `twitterLikeLive` | Like one post on X, on the direct-API engine, live on X |
| `twitterListShow` | List the X account's lists with their ids and member counts, sending… |
| `twitterListCreate` | Make an X list on the account |
| `twitterListCreateLive` | Make an X list on the account, live on X |
| `twitterListAdd` | Put one person on one of the account's X lists |
| `twitterListAddLive` | Put one person on one of the account's X lists, live on X |
| `twitterRepost` | Repost one post on X, on the direct-API engine |
| `twitterRepostLive` | Repost one post on X, on the direct-API engine, live on X |
| `twitterFollow` | Follow one person on X, on the direct-API engine |
| `twitterFollowLive` | Follow one person on X, on the direct-API engine, live on X |
| `twitterDm` | Send one approved direct message on X, on the direct-API engine |
| `twitterDmLive` | Send one approved direct message on X, on the…, live on X |
| `twitterReact` | React to a X message with an emoji, on the direct-API engine |
| `twitterReactLive` | React to a X message with an emoji, on the direct-API…, live on X |
| `twitterQueueBuild` | Build a queue file pairing each target with one unique approved line… |
| `twitterQueueShow` | Show a queue |
| `twitterQueueCheck` | Check every pending item's target and house style |
| `twitterQueueStatus` | Count a queue's items by status |
| `twitterQueueApprove` | Record who approved the queue as it stands now |
| `twitterQueuePlan` | Draw a random time for every like and reply inside a window… |
| `twitterQueueRun` | Run a queue's plan as an XState machine |
| `twitterQueueRunLive` | Run a queue's plan as an XState machine, live on X |
| `twitterQueueAdd` | Add approved dms, replies or quotes to an account's queue, even while… |
| `twitterQueueNudge` | Tell a running queue to send its next replies now |
| `twitterQueueEdit` | Put new copy on a pending or held queue item |
| `twitterVoice` | Send a voice note in matt's cloned voice as Twitter's own voice note… |
| `twitterVoiceLive` | Send a voice note in matt's cloned voice as Twitter's…, live on X |

## The work, step by step: xPosting

From `skills/xPosting/SKILL.md`.

## xPosting

One page for everything an X account does. Each account in Twenty runs the
same setup. The other skills and docs hold the detail. This page says which
one to open, and where a new workflow or style goes.

### 1. Set up an account (once per account)

| Step | Command | Where it lands |
| --- | --- | --- |
| Copy `auth_token`, `ct0` and `twid` from a browser signed in to x.com (DevTools → Application → Cookies → `https://x.com`) | none | your clipboard only |
| Save them, checked with X first | `log twitter cookies save --account <handle> [--style house] [--name "<label>"]` in a terminal (a masked Clack prompt; never a flag, never over MCP) | Twenty `socialAccounts`: a TWITTER row with `accountName` = handle, `cookies`, `sessionState`, `copyStyle` |
| Check it any time | `log twitter session check --account <handle>` (MCP `twitterSession`) | `sessionState` in Twenty, and the governor in `~/.logCli/twitter/<handle>` |
| X Chat PIN, to read encrypted DMs | `log twitter chat pin --account <handle>` in a terminal | `socialAccounts.messengerPin` |

The cookies are saved only when X answers loggedIn for that same handle. A
refused or wrong-account paste saves nothing. Each check merges X's refreshed
cookies back into the row. The cookies live in Twenty only, and are never
printed, committed or put in the knowledge base.

### 2. Original posts: the social posting playbook

Every original post (a video) follows the **Social posting playbook**:
record in Cap, caption with Cap's Parakeet model, cut in FilmCraft by the
awesome-video-editing rules, export at -16 LUFS, then post by the X
discipline (original first, the first 2 hours, the first likes, answer every
comment, the quote an hour later).

- Repo: `listeningkit-frontend`, `docs/okf/operations/social-posting-playbook.md`
  (branch `docs/social-posting-playbook`).
- Twenty: Notes → "Social posting playbook (ListeningKit)", in node02's
  Twenty (`a9afec1f-50e0-45a7-a51f-0f1bbf70e94c`) and the legacy one
  (`a41908eb-adc7-4b40-a0c5-b8fa31c522e5`).
- Knowledge base: `log kb search "social posting playbook"`.

Post the original with `log twitter post --account <handle> --text "<copy>" --media <video.mp4>` (MCP `twitterPost`, `twitterPostLive`).
It is a dry run first: it checks the copy against the account's style, and checks the file's type and size,
without contacting X. `--live --approvedBy <who>` uploads the file and posts.
A video is uploaded in chunks, and the post is made only once X's own processing says succeeded.
It takes one video or gif, or up to 4 images. Everything after the post goes through log-cli as well:
the replies to its comments, the quote an hour later, and the DMs to the people who liked it.

### 3. Reaching people: `log twitter`

**Send what X's own client sends (rule 113).** Every GraphQL call uses
X's live operation ids and feature switches, read from X's signed-in
client with `log twitter session webClient --account <a>` into
`~/.logCli/twitter/xOperations.json`. Run it again when X ships a new
main.js. What X's composer sends is in `docs/platforms/x/compose.md`.

**The account stays live in context (rule 115).** While its X Chat watch
runs, the account reads X's own badge counts every 2 minutes, the way
x.com does, and reads the new notifications when the count rises. Each
Claude session gets what is new in a `>>> X LIVE` block. A reply, quote
or mention there is someone talking to matt: read them and answer.
How it works: `docs/platforms/x/live.md`.

**Full context before every message (rule 109).** Before you write to
anyone, and again right before it goes out, know everything between them
and the account at that moment, never only the dm thread:

- `twitterDms` { account, with: "<handle>" } gives their whole thread (old
  DMs and X Chat, read from X itself, so it also holds what matt sent them
  from his phone or anywhere outside log) **and** what they did on the
  account's posts: likes, retweets, replies (with what they said), quotes,
  mentions and follows, newest first, from a fresh notifications read.
- Draft from all of it. Someone who already retweeted gets thanked for it,
  never asked to retweet; someone who replied gets their reply answered.
- The queue reads it all again right before each send and holds the item
  (status `held`, with what changed) if anything happened since it was
  drafted. A held item is redrafted from the new context, gated with
  `voice`, and put back with `twitterQueueEdit`. A queue file is never edited
  by hand, and nothing is sent around the queue to get past a hold.

Each job has its own page in `docs/useCases/twitter/`: topic replies,
answering the people who comment on your posts, DMs to the people who like
or repost them, affiliate follow-ups, recruiting, the inbox and followers.
The parts every page uses:

- **Finding:** treg's X search, profile and posts reads (rule 53). X itself is never used to search.
- **One send:** `log twitter reply|quote|like|dm --account <handle> …` is a
  dry run. `--live --approvedBy <who>` sends it. A dm drafted on several
  lines goes out one message per line, with matt's usual gap between them,
  and the queue sends dms the same way (rule 90); `--asOne` only when matt
  asks. A drop stops the rest, and nothing is resent (rule 94).
- **Reading the inbox:** `log twitter dms --account <handle>` syncs: the
  first read takes the whole inbox once (about 20 s) and keeps it in
  `~/.logCli/twitter/<handle>/inboxSync.json`; every read after asks X only
  for what is newer than the newest event held (one request when nothing is
  new, about 1.3 s in the engine) and decrypts only what is new. Each read
  keeps its conversations for `log search` and updates the index in the
  background with only the chunks that changed. `--full` reads everything
  again. The live watcher (`log twitter chat watch --inbox`) writes each
  pushed message into the same store, and the SessionStart hook says who is
  waiting from it with nothing fetched.
- **More than one:** the queue: `log twitter queue build → show → check →
  approve → plan → run → run --live`. It spaces sends at random, at least
  minGap apart, and any refusal from X stops the run with the item pending
  (rule 94, [docs/specs/xQueue.md](../../docs/specs/xQueue.md)). Before any DM
  it drops people the account has already talked to on X Chat (rule 87).
- **One session per account (rule 105):** every X call goes through the
  account's one engine host (`python/twitterApi/host.py`). The first call starts
  it; every call after, from the CLI, MCP, hooks, the queue or the X Chat watch,
  is answered by that same session (one client, one connection, one transaction
  key), one call at a time: a send 4 to 11 s after the last call, a read 0.8
  to 2.5 s (rules 104, 110). The answer's
  `xSession` names it (pid, since, calls), and the hook's account line shows it.
  A second session can't start. If the host can't be reached the call is
  refused (`xSessionHostDown`) and nothing is sent: read
  `~/.logCli/twitter/<account>/host.log`, never work around it. More than one
  send goes through the queue, never a hand-rolled loop (rule 104). The whole
  contract: [docs/specs/xSession.md](../../docs/specs/xSession.md).
- **Pacing:** 240 writes a day per account, kept by the account's governor.
  `--force` goes past it only when the owner says so (rule 86). See
  [docs/specs/writeBudgets.md](../../docs/specs/writeBudgets.md).

### 3b. The growth loop (how matt grows @matthewsoldit)

What worked for matt (`log kb show memory:-buzz/listeningkit-real-state`): a
text post about treg ("$10 -> 30 conversations") did 205K views and 1,182
likes, and his followers went from 308 to 352 in four days. He then turned
the attention into conversations. Every account runs the same loop, in this
order:

| # | When | What | How |
| --- | --- | --- | --- |
| 1 | Post day | One original post. The text carries it (a video open counts almost nothing). One best post per feed window, when the audience is online, never several in a row | the social posting playbook (section 2), sent by hand |
| 2 | The first 2 hours | Answer every comment. Unanswered questions are the best openers. Replies between mutuals score highest | `docs/useCases/twitter/engagementReplies.md`: treg comments read, then a queue of replies |
| 3 | About 1 hour after | Quote a matching trend, never before your own post | playbook "Riding a trend", `log twitter quote` |
| 4 | The next days | DM the people who liked or reposted it, opening with one of their own tweets, then one informal line | `docs/useCases/twitter/engagerDms.md` (the cold DM way), queue `action: dm` |
| 5 | Every day | Reply to people posting about your topic, one line about their post backed by your own fact, inside the account's 240 writes a day | `docs/useCases/twitter/topicReplies.md`, the queue's `limit` |
| 6 | Always | Answer whoever writes back. Never send a cold template to someone you already talk to | `log twitter dms --account <a> [--with <handle>]`, `chat watch` (needs the X Chat PIN), rule 87 |
| 7 | Weekly | Score the followers (treg profiles and their posts), and talk to the best ones by hand | `docs/useCases/twitter/followers.md`, treg `anyapi.x.user.profile` |
| 8 | Always | Leads from posts and DMs go into Twenty | `agencyProspects` |

Finding people and posts is always treg (`treg call anyapi.x.search.posts
--file q.json`, `anyapi.x.user.profile`, `treg.x.user.posts`). On Windows,
pass `--file` rather than `--data`, and set `PYTHONUTF8=1`. A big treg sweep
costs money: say the price first.

**Each account's own plan.** The loop is how to post and follow up. What an
account posts about comes from its own plan:

| Account | Plan | What it sets |
| --- | --- | --- |
| @matthewsoldit | `log kb show memory:-buzz/listeningkit-real-state` | ListeningKit, treg and Go Getters. The follower atlas |
| @deepman_1 | Mandeep + InferenceSaver Social Growth Plan: `inferencesaver` repo, `docs/project/social-growth-plan.md` | positioning ("I test AI tools, coding agents, and API infrastructure so builders can save money and build faster"), 5 content pillars, a 70/20/10 ratio (helpful, build in public, InferenceSaver), the hook and CTA banks, the 30-day and 90-day plans, DM openers (stack review, soft pitch, demo invite), leads in Twenty, the weekly review |

Where they disagree, the X discipline wins on X. The plan's comment
prompts ("comment your AI stack") read as engagement bait there, so on X
ask a real question in the post instead. A cold DM opens the cold DM way
(their own tweet first). The plan's DM opener is for someone who has
already commented.

**Voice.** `log voice` gates drafts against matt's own writing. Its guide
and his saved conversations are on matt's machine, so on any other account it
judges by matt's voice. For an account of your own, write in its
`copyStyle`, and keep each line about the other person's post.

### 4. Copy styles

Every send and every queue check holds its copy to the account's
`copyStyle` (Twenty `socialAccounts.copyStyle`; empty means `house`):

| Style | Rules |
| --- | --- |
| `house` | matt's: lowercase only, no commas, semicolons, full stops, em or en dashes. URLs are exempt |

To give an account another style, set `copyStyle` in Twenty, or pass
`--style` to `cookies save`. A send names the style that failed and why.
`--skipStyleCheck` skips the check only when the owner approved the copy
word for word.

### 5. Adding to this setup (for the next agent)

Add each new piece in the same place every time, so every account gets it:

- **A new copy style:** add one entry to `COPY_STYLES` in
  `src/twitter/copy/style/client.ts` (its `name`, `summary` and a
  `problems(text)` check), with a test in `style.test.ts` and a row in the
  table above. Accounts pick it up through `copyStyle`.
- **A new X workflow** (a job like topic replies): write
  `docs/useCases/twitter/<job>.md` in the same shape as the others (what to
  read, which tools in order, what counts as done), and add its row to
  `docs/useCases/twitter/README.md`.
- **A posting or editing rule** (recording, captions, the cut, the export,
  when and how to post): change the social posting playbook, in the repo and
  the Twenty note together. Then link anything new from section 2 here.
- **A new X command:** `src/cli/twitter/helpers/<name>.ts` on the direct-API
  engine (`DIRECT_ROUTES`, `COMMAND_RULES`), never a browser (rule 80).

Then run `log kb sync`. This skill, the use cases and the docs go into
Twenty's knowledge base and its Redis search, and every agent finds them
with `log kb search`.

## Every tool, in full

### `voice`

Gate a draft against matt's own writing guide with SubQ before it is sent, sending nothing.
Gate a draft against matt's own writing guide with SubQ before anything is sent as him, sending nothing
log voice --to <handle> [--text "<draft>"] [--context "<what they said>"] [--with <person or chat>] [--spoken] [--json]
Gates a draft before anything is sent as matt (his rule, 2026-10-27): SubQ reads it against matt's own writing guide (GUIDES/MATT_WRITING_STYLE.md, built from 256 of his tweets) and the dms he wrote himself, and answers whether it sounds like he typed it (voice, 0.8 to pass), whether it answers what they said (--context) or something specific about them, whether it reads like a mate texting, and, to someone matt has never talked with, whether it is only a relevant opener with no ask or pitch (openerOnly, matt 2026-10-31). A phrase matt never says (hit home, big swing, spot on, felt that…) fails it outright. Sends nothing.
--with names the chat or person the way matt says it ("the log group", "jilly", a handle): log finds matt's real replies to things like --context, from that chat first, then that person, then that platform, then anywhere, and how he writes there (length, case, punctuation, his words). Without --text it shows them to draft from; with --text the gate also asks whether the draft reads like his real replies there (toThem, 0.7 to pass). Every gate also reads his nearest real replies, closest wording and style across all his conversations, every platform, beside the chat's own, never the writing guide alone.
--spoken gates a voice note: it is graded as said out loud, so its length and punctuation never count against it, and it must build on what they are talking about across the whole chat, adding to it, never repeating what matt already told them (buildsOn, 0.7 to pass, rule 149). Every voice note send is gated this way.
Exit 0 when it passes, 1 when it doesn't: rewrite and gate again.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/channelReply" }), getGuide({ useCase: "discord/memeReply" }), getGuide({ useCase: "inbox/reaLooksmaxxing" }), getGuide({ useCase: "inbox/voiceNote" }), getGuide({ useCase: "instagram/dmReply" }), getGuide({ useCase: "slack/dmReply" }), getGuide({ useCase: "twitter/collabMaxxing" }), getGuide({ useCase: "twitter/dmInbox" }), getGuide({ useCase: "twitter/engagerDms" }), getGuide({ useCase: "twitter/followUps" }), getGuide({ useCase: "twitter/getTheAction" }), getGuide({ useCase: "twitter/managerMaxxing" }), getGuide({ useCase: "twitter/networkMaxing" }), getGuide({ useCase: "twitter/nicheMapRegion" }), getGuide({ useCase: "twitter/replyGuyFunnel" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 30, 39, 41, 63, 2, 109, 137, 142, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `voiceAiIndex`

Build the AI tells index with Jina and measure matt's own messages against it.
Gate a draft against matt's own writing guide with SubQ before anything is sent as him, sending nothing
log voice aiIndex [--json]   (builds the AI tells index: every literal phrase in vendor/aiTells, tbhb/vale-ai-tells first and then the other lists, embedded with Jina (JINA_API_KEY), with matt's own replies from the voice index measured against it for his p50 and p99 closeness, and the vale rules he uses himself muted; the gate builds it itself when it is missing or older than the voice index; rule 112)
Gates a draft before anything is sent as matt (his rule, 2026-10-27): SubQ reads it against matt's own writing guide (GUIDES/MATT_WRITING_STYLE.md, built from 256 of his tweets) and the dms he wrote himself, and answers whether it sounds like he typed it (voice, 0.8 to pass), whether it answers what they said (--context) or something specific about them, whether it reads like a mate texting, and, to someone matt has never talked with, whether it is only a relevant opener with no ask or pitch (openerOnly, matt 2026-10-31). A phrase matt never says (hit home, big swing, spot on, felt that…) fails it outright. Sends nothing.
--with names the chat or person the way matt says it ("the log group", "jilly", a handle): log finds matt's real replies to things like --context, from that chat first, then that person, then that platform, then anywhere, and how he writes there (length, case, punctuation, his words). Without --text it shows them to draft from; with --text the gate also asks whether the draft reads like his real replies there (toThem, 0.7 to pass). Every gate also reads his nearest real replies, closest wording and style across all his conversations, every platform, beside the chat's own, never the writing guide alone.
--spoken gates a voice note: it is graded as said out loud, so its length and punctuation never count against it, and it must build on what they are talking about across the whole chat, adding to it, never repeating what matt already told them (buildsOn, 0.7 to pass, rule 149). Every voice note send is gated this way.
Exit 0 when it passes, 1 when it doesn't: rewrite and gate again.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 30, 39, 41, 63, 2, 109, 137, 142, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `voiceIndex`

Build matt's voice per chat and person from the conversations log search saved.
Gate a draft against matt's own writing guide with SubQ before anything is sent as him, sending nothing
log voice index [--json]   (builds matt's voice from every conversation log search already saved, reading nothing new: each of his replies paired with what was said just before it, embedded with log search's own model, and a profile per chat, person and platform counted from his own messages)
Gates a draft before anything is sent as matt (his rule, 2026-10-27): SubQ reads it against matt's own writing guide (GUIDES/MATT_WRITING_STYLE.md, built from 256 of his tweets) and the dms he wrote himself, and answers whether it sounds like he typed it (voice, 0.8 to pass), whether it answers what they said (--context) or something specific about them, whether it reads like a mate texting, and, to someone matt has never talked with, whether it is only a relevant opener with no ask or pitch (openerOnly, matt 2026-10-31). A phrase matt never says (hit home, big swing, spot on, felt that…) fails it outright. Sends nothing.
--with names the chat or person the way matt says it ("the log group", "jilly", a handle): log finds matt's real replies to things like --context, from that chat first, then that person, then that platform, then anywhere, and how he writes there (length, case, punctuation, his words). Without --text it shows them to draft from; with --text the gate also asks whether the draft reads like his real replies there (toThem, 0.7 to pass). Every gate also reads his nearest real replies, closest wording and style across all his conversations, every platform, beside the chat's own, never the writing guide alone.
--spoken gates a voice note: it is graded as said out loud, so its length and punctuation never count against it, and it must build on what they are talking about across the whole chat, adding to it, never repeating what matt already told them (buildsOn, 0.7 to pass, rule 149). Every voice note send is gated this way.
Exit 0 when it passes, 1 when it doesn't: rewrite and gate again.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 30, 39, 41, 63, 2, 109, 137, 142, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterReply`

Reply to one post on X with approved copy, on the direct-API engine; a dry run unless --live.
Reply to one post on X with approved copy, on the direct-API engine; a dry run unless --live
log twitter reply --account <accountName> --tweet <postUrl> --text "<copy>" [--media <file>[,<file>]] [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]
Reply to one post on X with approved copy, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's create answer decides: a tweet id is sent, an empty result is a drop (nothing posted, usually the author's reply limits). Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole. What acts on X is `twitterReplyLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 53, 63, 2, 73, 83, 86, 94, 105, 109, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterReplyLive`

Reply to one post on X with approved copy, on the direct-API engine; a dry run unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Reply to one post on X with approved copy, on the direct-API engine; a dry run unless --live
log twitter reply --account <accountName> --tweet <postUrl> --text "<copy>" [--media <file>[,<file>]] [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]
Reply to one post on X with approved copy, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's create answer decides: a tweet id is sent, an empty result is a drop (nothing posted, usually the author's reply limits). Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/reaLooksmaxxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 53, 63, 2, 73, 83, 86, 94, 105, 109, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQuote`

Quote one post on X with approved copy, on the direct-API engine; a dry run unless --live.
Quote one post on X with approved copy, on the direct-API engine; a dry run unless --live
log twitter quote --account <accountName> --tweet <postUrl> --text "<copy>" [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]
Quote one post on X with approved copy, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's create answer decides: a tweet id is sent, an empty result is a drop. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole. What acts on X is `twitterQuoteLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 53, 63, 2, 73, 83, 86, 94, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQuoteLive`

Quote one post on X with approved copy, on the direct-API engine; a dry run unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Quote one post on X with approved copy, on the direct-API engine; a dry run unless --live
log twitter quote --account <accountName> --tweet <postUrl> --text "<copy>" [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]
Quote one post on X with approved copy, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's create answer decides: a tweet id is sent, an empty result is a drop. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 53, 63, 2, 73, 83, 86, 94, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterPost`

Make one original post on X with approved copy and optional media (a video, a gif or up to 4 images), on the direct-API engine; a dry run unless --live.
Make one original post on X with approved copy and optional media (a video, a gif or up to 4 images), on the direct-API engine; a dry run unless --live
log twitter post --account <accountName> --text "<copy>" [--media <file>[,<file>]] [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]
Make one original post on X with approved copy and optional media (a video, a gif or up to 4 images), on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
Each file is uploaded first (a video in chunks, then X's own processing status must say succeeded before the post is made), then the post is created with the media ids. X's create answer decides: a tweet id is sent, an empty result is a drop and nothing was posted. A file X refuses stops it before anything is posted. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole. What acts on X is `twitterPostLive`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/reaLooksmaxxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 86, 94, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterPostLive`

Make one original post on X with approved copy and optional media (a video, a gif or up to 4 images), on the direct-API engine; a dry run unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Make one original post on X with approved copy and optional media (a video, a gif or up to 4 images), on the direct-API engine; a dry run unless --live
log twitter post --account <accountName> --text "<copy>" [--media <file>[,<file>]] [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]
Make one original post on X with approved copy and optional media (a video, a gif or up to 4 images), on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
Each file is uploaded first (a video in chunks, then X's own processing status must say succeeded before the post is made), then the post is created with the media ids. X's create answer decides: a tweet id is sent, an empty result is a drop and nothing was posted. A file X refuses stops it before anything is posted. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/reaLooksmaxxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 86, 94, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterLike`

Like one post on X, on the direct-API engine; a dry run unless --live.
Like one post on X, on the direct-API engine; a dry run unless --live
log twitter like --account <accountName> --tweet <postUrl> [--approvedBy <who>] [--force] [--live] [--json]
Like one post on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's favorite answer decides: Done (or already liked, code 139) is sent. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole. What acts on X is `twitterLikeLive`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/networkMaxing" }), getGuide({ useCase: "twitter/replyGuyFunnel" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 53, 63, 2, 73, 83, 86, 94, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterLikeLive`

Like one post on X, on the direct-API engine; a dry run unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Like one post on X, on the direct-API engine; a dry run unless --live
log twitter like --account <accountName> --tweet <postUrl> [--approvedBy <who>] [--force] [--live] [--json]
Like one post on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's favorite answer decides: Done (or already liked, code 139) is sent. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/networkMaxing" }), getGuide({ useCase: "twitter/nicheMapRegion" }), getGuide({ useCase: "twitter/replyGuyFunnel" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 53, 63, 2, 73, 83, 86, 94, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterListShow`

List the X account's lists with their ids and member counts, sending nothing.
The X account's own lists: show them, make one, put someone on one; changes are dry runs unless --live
log twitter list show --account <accountName> [--json]
X's own lists, on the direct-API engine (vendor/twikit: ListsManagementPageTimeline, CreateList, ListAddMember), through the account's one session (rule 105). show lists the account's lists with their ids and member counts, sending nothing. create makes a list, and a list of that name already there is answered as it is, never made twice. add puts one person on a list, found by its name or id. create and add are dry runs unless --live, which needs --approvedBy (rule 8). Each is a write the governor counts, X's answer decides (rule 73), and a refusal stops with nothing retried (rule 94).
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 94, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterListCreate`

Make an X list on the account; a dry run unless --live.
The X account's own lists: show them, make one, put someone on one; changes are dry runs unless --live
log twitter list create --account <accountName> --name <name> [--description <text>] [--private] [--approvedBy <who>] [--live] [--json]
X's own lists, on the direct-API engine (vendor/twikit: ListsManagementPageTimeline, CreateList, ListAddMember), through the account's one session (rule 105). show lists the account's lists with their ids and member counts, sending nothing. create makes a list, and a list of that name already there is answered as it is, never made twice. add puts one person on a list, found by its name or id. create and add are dry runs unless --live, which needs --approvedBy (rule 8). Each is a write the governor counts, X's answer decides (rule 73), and a refusal stops with nothing retried (rule 94).
Fill the named fields; each value goes through whole. What acts on X is `twitterListCreateLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 94, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterListCreateLive`

Make an X list on the account; a dry run unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
The X account's own lists: show them, make one, put someone on one; changes are dry runs unless --live
log twitter list create --account <accountName> --name <name> [--description <text>] [--private] [--approvedBy <who>] [--live] [--json]
X's own lists, on the direct-API engine (vendor/twikit: ListsManagementPageTimeline, CreateList, ListAddMember), through the account's one session (rule 105). show lists the account's lists with their ids and member counts, sending nothing. create makes a list, and a list of that name already there is answered as it is, never made twice. add puts one person on a list, found by its name or id. create and add are dry runs unless --live, which needs --approvedBy (rule 8). Each is a write the governor counts, X's answer decides (rule 73), and a refusal stops with nothing retried (rule 94).
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 94, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterListAdd`

Put one person on one of the account's X lists; a dry run unless --live.
The X account's own lists: show them, make one, put someone on one; changes are dry runs unless --live
log twitter list add --account <accountName> --list <name|id> --handle <handle>|--userId <id> [--approvedBy <who>] [--live] [--json]
X's own lists, on the direct-API engine (vendor/twikit: ListsManagementPageTimeline, CreateList, ListAddMember), through the account's one session (rule 105). show lists the account's lists with their ids and member counts, sending nothing. create makes a list, and a list of that name already there is answered as it is, never made twice. add puts one person on a list, found by its name or id. create and add are dry runs unless --live, which needs --approvedBy (rule 8). Each is a write the governor counts, X's answer decides (rule 73), and a refusal stops with nothing retried (rule 94).
Fill the named fields; each value goes through whole. What acts on X is `twitterListAddLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 94, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterListAddLive`

Put one person on one of the account's X lists; a dry run unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
The X account's own lists: show them, make one, put someone on one; changes are dry runs unless --live
log twitter list add --account <accountName> --list <name|id> --handle <handle>|--userId <id> [--approvedBy <who>] [--live] [--json]
X's own lists, on the direct-API engine (vendor/twikit: ListsManagementPageTimeline, CreateList, ListAddMember), through the account's one session (rule 105). show lists the account's lists with their ids and member counts, sending nothing. create makes a list, and a list of that name already there is answered as it is, never made twice. add puts one person on a list, found by its name or id. create and add are dry runs unless --live, which needs --approvedBy (rule 8). Each is a write the governor counts, X's answer decides (rule 73), and a refusal stops with nothing retried (rule 94).
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 94, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterRepost`

Repost one post on X, on the direct-API engine; a dry run unless --live.
Repost one post on X, on the direct-API engine; a dry run unless --live
log twitter repost --account <accountName> --tweet <postUrl> [--approvedBy <who>] [--force] [--live] [--json]
Repost one post on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's retweet answer decides: a created retweet (or already reposted, code 327) is sent. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole. What acts on X is `twitterRepostLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 53, 63, 2, 73, 83, 86, 94, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterRepostLive`

Repost one post on X, on the direct-API engine; a dry run unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Repost one post on X, on the direct-API engine; a dry run unless --live
log twitter repost --account <accountName> --tweet <postUrl> [--approvedBy <who>] [--force] [--live] [--json]
Repost one post on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's retweet answer decides: a created retweet (or already reposted, code 327) is sent. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 53, 63, 2, 73, 83, 86, 94, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterFollow`

Follow one person on X, on the direct-API engine; a dry run unless --live.
Follow one person on X, on the direct-API engine; a dry run unless --live
log twitter follow --account <accountName> --userId <id> [--approvedBy <who>] [--force] [--live] [--json]
Follow one person on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's follow answer decides: the followed user back is sent, already following is sent too. Follow before a cold dm: nobody gets a cold message from an account that doesn't follow them. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole. What acts on X is `twitterFollowLive`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/networkMaxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 53, 63, 2, 73, 83, 86, 94, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterFollowLive`

Follow one person on X, on the direct-API engine; a dry run unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Follow one person on X, on the direct-API engine; a dry run unless --live
log twitter follow --account <accountName> --userId <id> [--approvedBy <who>] [--force] [--live] [--json]
Follow one person on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's follow answer decides: the followed user back is sent, already following is sent too. Follow before a cold dm: nobody gets a cold message from an account that doesn't follow them. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/networkMaxing" }), getGuide({ useCase: "twitter/nicheMapRegion" }), getGuide({ useCase: "twitter/replyGuyFunnel" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 53, 63, 2, 73, 83, 86, 94, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterDm`

Send one approved direct message on X, on the direct-API engine; a dry run unless --live.
Send one approved direct message on X, on the direct-API engine; a dry run unless --live
log twitter dm --account <accountName> --userId <id> --text "<copy>" [--media <file|url>] [--approvedBy <who>] [--skipStyleCheck] [--asOne] [--overGate] [--force] [--live] [--json]
Send one approved direct message on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
A draft written on several lines goes out one message per line, and a one-line draft is split the way matt writes in that chat (log voice index), with his usual gap between them; --asOne sends it as one, only when matt asked (rule 90). X's answer decides: a conversation id is sent, none is a drop, and a drop stops the rest: what was sent stays sent, nothing is retried (rule 94). An old DM thread (<a>-<b>) and its X Chat thread (<a>:<b>) with one person are one conversation: X shows them in the same place, and a dm sent through the old DM API shows in their X Chat too. A sent answer is delivered whichever conversation id it names: never resend it and never call it the wrong inbox. A refusal before X is called (styleFailed, a dry run) sent nothing, so that dm is sent once its copy is fixed. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole. What acts on X is `twitterDmLive`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/affiliateMarketing" }), getGuide({ useCase: "twitter/dmInbox" }), getGuide({ useCase: "twitter/followUps" }), getGuide({ useCase: "twitter/networkMaxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 53, 63, 2, 73, 83, 86, 94, 109, 105, 137, 133, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterDmLive`

Send one approved direct message on X, on the direct-API engine; a dry run unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Send one approved direct message on X, on the direct-API engine; a dry run unless --live
log twitter dm --account <accountName> --userId <id> --text "<copy>" [--media <file|url>] [--approvedBy <who>] [--skipStyleCheck] [--asOne] [--overGate] [--force] [--live] [--json]
Send one approved direct message on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
A draft written on several lines goes out one message per line, and a one-line draft is split the way matt writes in that chat (log voice index), with his usual gap between them; --asOne sends it as one, only when matt asked (rule 90). X's answer decides: a conversation id is sent, none is a drop, and a drop stops the rest: what was sent stays sent, nothing is retried (rule 94). An old DM thread (<a>-<b>) and its X Chat thread (<a>:<b>) with one person are one conversation: X shows them in the same place, and a dm sent through the old DM API shows in their X Chat too. A sent answer is delivered whichever conversation id it names: never resend it and never call it the wrong inbox. A refusal before X is called (styleFailed, a dry run) sent nothing, so that dm is sent once its copy is fixed. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/bossMaxxing" }), getGuide({ useCase: "inbox/reaLooksmaxxing" }), getGuide({ useCase: "twitter/affiliateMarketing" }), getGuide({ useCase: "twitter/collabMaxxing" }), getGuide({ useCase: "twitter/dmInbox" }), getGuide({ useCase: "twitter/followUps" }), getGuide({ useCase: "twitter/getTheAction" }), getGuide({ useCase: "twitter/managerMaxxing" }), getGuide({ useCase: "twitter/networkMaxing" }), getGuide({ useCase: "twitter/replyGuyFunnel" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 53, 63, 2, 73, 83, 86, 94, 109, 105, 137, 133, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterReact`

React to a X message with an emoji, on the direct-API engine; a dry run unless --live.
React to a X message with an emoji, on the direct-API engine; a dry run unless --live
log twitter react --account <accountName> --chat <chat> --message <id> --emoji <emoji> [--remove] [--approvedBy <who>] [--live] [--json]
Reacts to one message with an emoji, on the direct-API engine (vendor/twikit, no browser), or takes the account's own reaction off with --remove. X takes any emoji; a name (joy, fire, eyes) is turned into it. It goes through X's own DM reaction mutation (twikit's add_reaction_to_message), so a message only X Chat holds may be refused, and X's answer says so.
Without --live it is a dry run and nothing is contacted. --live reacts, only when matt asked, and needs --approvedBy (rule 8). The chat is claimed first, as for a send, and released once it is done (rule 133). The platform's own answer decides (rule 73), the governor counts it as a write, and a refusal stops with nothing retried (rule 94).
Fill the named fields; each value goes through whole. What acts on X is `twitterReactLive`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/reactions" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 94, 105, 133, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterReactLive`

React to a X message with an emoji, on the direct-API engine; a dry run unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
React to a X message with an emoji, on the direct-API engine; a dry run unless --live
log twitter react --account <accountName> --chat <chat> --message <id> --emoji <emoji> [--remove] [--approvedBy <who>] [--live] [--json]
Reacts to one message with an emoji, on the direct-API engine (vendor/twikit, no browser), or takes the account's own reaction off with --remove. X takes any emoji; a name (joy, fire, eyes) is turned into it. It goes through X's own DM reaction mutation (twikit's add_reaction_to_message), so a message only X Chat holds may be refused, and X's answer says so.
Without --live it is a dry run and nothing is contacted. --live reacts, only when matt asked, and needs --approvedBy (rule 8). The chat is claimed first, as for a send, and released once it is done (rule 133). The platform's own answer decides (rule 73), the governor counts it as a write, and a refusal stops with nothing retried (rule 94).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/reactions" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 94, 105, 133, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueBuild`

Build a queue file pairing each target with one unique approved line, sending nothing.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue build --targets <targets.json> [--variations <a.json,b.json>] --out <queue.json> --account <accountName> [--action reply|quote|dm|voice] [--seed <n>]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, retrying, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: any refusal (a 429, 226 looks automated, 344 daily limit, a soft block, the governor, a dead session) stops the run at once with X's answer and the time, the item stays pending, and nothing goes out on that account until matt starts a run again (rule 94); with --alertChannel it tags matt in buzz. A deleted post or replies off (385/433) is skipped. A dropped connection with no answer from X is tried again after 1 to 3 min, at most 3 drops in a row. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers still stop the run.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/reaLooksmaxxing" }), getGuide({ useCase: "twitter/engagementReplies" }), getGuide({ useCase: "twitter/engagerDms" }), getGuide({ useCase: "twitter/getTheAction" }), getGuide({ useCase: "twitter/managerMaxxing" }), getGuide({ useCase: "twitter/nicheMapRegion" }), getGuide({ useCase: "twitter/replyGuyFunnel" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 2, 73, 83, 86, 109, 94, 105, 137, 133, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueShow`

Show a queue: who, which post, what copy, and its approval.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue show <queue.json> [--json]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, retrying, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: any refusal (a 429, 226 looks automated, 344 daily limit, a soft block, the governor, a dead session) stops the run at once with X's answer and the time, the item stays pending, and nothing goes out on that account until matt starts a run again (rule 94); with --alertChannel it tags matt in buzz. A deleted post or replies off (385/433) is skipped. A dropped connection with no answer from X is tried again after 1 to 3 min, at most 3 drops in a row. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers still stop the run.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 2, 73, 83, 86, 109, 94, 105, 137, 133, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueCheck`

Check every pending item's target and house style; for a dm queue, read the account's X Chat inbox and drop anyone already in a conversation.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue check <queue.json> [--skipXChatCheck] [--json]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, retrying, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: any refusal (a 429, 226 looks automated, 344 daily limit, a soft block, the governor, a dead session) stops the run at once with X's answer and the time, the item stays pending, and nothing goes out on that account until matt starts a run again (rule 94); with --alertChannel it tags matt in buzz. A deleted post or replies off (385/433) is skipped. A dropped connection with no answer from X is tried again after 1 to 3 min, at most 3 drops in a row. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers still stop the run.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/engagementReplies" }), getGuide({ useCase: "twitter/engagerDms" }), getGuide({ useCase: "twitter/managerMaxxing" }), getGuide({ useCase: "twitter/nicheMapRegion" }), getGuide({ useCase: "twitter/recruiting" }), getGuide({ useCase: "twitter/replyGuyFunnel" }), getGuide({ useCase: "twitter/topicReplies" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 2, 73, 83, 86, 109, 94, 105, 137, 133, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueStatus`

Count a queue's items by status.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue status <queue.json> [--json]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, retrying, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: any refusal (a 429, 226 looks automated, 344 daily limit, a soft block, the governor, a dead session) stops the run at once with X's answer and the time, the item stays pending, and nothing goes out on that account until matt starts a run again (rule 94); with --alertChannel it tags matt in buzz. A deleted post or replies off (385/433) is skipped. A dropped connection with no answer from X is tried again after 1 to 3 min, at most 3 drops in a row. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers still stop the run.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/recruiting" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 2, 73, 83, 86, 109, 94, 105, 137, 133, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueApprove`

Record who approved the queue as it stands now.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue approve <queue.json> --by <who>
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, retrying, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: any refusal (a 429, 226 looks automated, 344 daily limit, a soft block, the governor, a dead session) stops the run at once with X's answer and the time, the item stays pending, and nothing goes out on that account until matt starts a run again (rule 94); with --alertChannel it tags matt in buzz. A deleted post or replies off (385/433) is skipped. A dropped connection with no answer from X is tried again after 1 to 3 min, at most 3 drops in a row. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers still stop the run.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/getTheAction" }), getGuide({ useCase: "twitter/managerMaxxing" }), getGuide({ useCase: "twitter/replyGuyFunnel" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 2, 73, 83, 86, 109, 94, 105, 137, 133, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueuePlan`

Draw a random time for every like and reply inside a window, contacting nothing.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue plan <queue.json> --window <5h|90m> [--limit <n>] [--start <time>] [--minGap <s>] [--like] [--likeChance <0-1>]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, retrying, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: any refusal (a 429, 226 looks automated, 344 daily limit, a soft block, the governor, a dead session) stops the run at once with X's answer and the time, the item stays pending, and nothing goes out on that account until matt starts a run again (rule 94); with --alertChannel it tags matt in buzz. A deleted post or replies off (385/433) is skipped. A dropped connection with no answer from X is tried again after 1 to 3 min, at most 3 drops in a row. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers still stop the run.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/reaLooksmaxxing" }), getGuide({ useCase: "twitter/getTheAction" }), getGuide({ useCase: "twitter/managerMaxxing" }), getGuide({ useCase: "twitter/replyGuyFunnel" }), getGuide({ useCase: "twitter/topicReplies" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 2, 73, 83, 86, 109, 94, 105, 137, 133, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueRun`

Run a queue's plan as an XState machine; a dry run lists what it would send unless --live.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue run <queue.json> [--alertChannel <uuid>] [--alertReplyTo <eventId>] [--alertMention <hex,hex>] [--force] [--keepOpen] [--live]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, retrying, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: any refusal (a 429, 226 looks automated, 344 daily limit, a soft block, the governor, a dead session) stops the run at once with X's answer and the time, the item stays pending, and nothing goes out on that account until matt starts a run again (rule 94); with --alertChannel it tags matt in buzz. A deleted post or replies off (385/433) is skipped. A dropped connection with no answer from X is tried again after 1 to 3 min, at most 3 drops in a row. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers still stop the run.
Fill the named fields; each value goes through whole. What acts on X is `twitterQueueRunLive`.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 2, 73, 83, 86, 109, 94, 105, 137, 133, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueRunLive`

Run a queue's plan as an XState machine; a dry run lists what it would send unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue run <queue.json> [--alertChannel <uuid>] [--alertReplyTo <eventId>] [--alertMention <hex,hex>] [--force] [--keepOpen] [--live]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, retrying, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: any refusal (a 429, 226 looks automated, 344 daily limit, a soft block, the governor, a dead session) stops the run at once with X's answer and the time, the item stays pending, and nothing goes out on that account until matt starts a run again (rule 94); with --alertChannel it tags matt in buzz. A deleted post or replies off (385/433) is skipped. A dropped connection with no answer from X is tried again after 1 to 3 min, at most 3 drops in a row. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers still stop the run.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/reaLooksmaxxing" }), getGuide({ useCase: "twitter/collabMaxxing" }), getGuide({ useCase: "twitter/dmInbox" }), getGuide({ useCase: "twitter/followUps" }), getGuide({ useCase: "twitter/getTheAction" }), getGuide({ useCase: "twitter/managerMaxxing" }), getGuide({ useCase: "twitter/networkMaxing" }), getGuide({ useCase: "twitter/replyGuyFunnel" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 2, 73, 83, 86, 109, 94, 105, 137, 133, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueAdd`

Add approved dms, replies or quotes to an account's queue, even while it runs: each is fitted between what is already planned, at least the queue's minGap apart, and sent through the same run and the account's one X session.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue add <queue.json> --targets <targets.json> --by <who> [--action reply|quote|dm|voice] [--window <2h|90m>] [--minGap <s>]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, retrying, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: any refusal (a 429, 226 looks automated, 344 daily limit, a soft block, the governor, a dead session) stops the run at once with X's answer and the time, the item stays pending, and nothing goes out on that account until matt starts a run again (rule 94); with --alertChannel it tags matt in buzz. A deleted post or replies off (385/433) is skipped. A dropped connection with no answer from X is tried again after 1 to 3 min, at most 3 drops in a row. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers still stop the run.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/collabMaxxing" }), getGuide({ useCase: "twitter/dmInbox" }), getGuide({ useCase: "twitter/followUps" }), getGuide({ useCase: "twitter/getTheAction" }), getGuide({ useCase: "twitter/managerMaxxing" }), getGuide({ useCase: "twitter/networkMaxing" }), getGuide({ useCase: "twitter/replyGuyFunnel" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 2, 73, 83, 86, 109, 94, 105, 137, 133, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueNudge`

Tell a running queue to send its next replies now.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue nudge <queue.json> [--replies <n>]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, retrying, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: any refusal (a 429, 226 looks automated, 344 daily limit, a soft block, the governor, a dead session) stops the run at once with X's answer and the time, the item stays pending, and nothing goes out on that account until matt starts a run again (rule 94); with --alertChannel it tags matt in buzz. A deleted post or replies off (385/433) is skipped. A dropped connection with no answer from X is tried again after 1 to 3 min, at most 3 drops in a row. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers still stop the run.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 2, 73, 83, 86, 109, 94, 105, 137, 133, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueEdit`

Put new copy on a pending or held queue item (redrafted from the person's full context), plan a held one again and approve the queue as it then stands.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue edit <queue.json> --n <n> --text "<new copy>" --by <who> [--window <30m>]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, retrying, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: any refusal (a 429, 226 looks automated, 344 daily limit, a soft block, the governor, a dead session) stops the run at once with X's answer and the time, the item stays pending, and nothing goes out on that account until matt starts a run again (rule 94); with --alertChannel it tags matt in buzz. A deleted post or replies off (385/433) is skipped. A dropped connection with no answer from X is tried again after 1 to 3 min, at most 3 drops in a row. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers still stop the run.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/voiceNote" }), getGuide({ useCase: "twitter/getTheAction" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 2, 73, 83, 86, 109, 94, 105, 137, 133, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterVoice`

Send a voice note in matt's cloned voice as Twitter's own voice note, from text; a dry run unless --live.
Send a voice note in matt's cloned voice as Twitter's own voice note, from text; a dry run unless --live
log twitter voice --account <accountName> --with <with> --text "<what matt says>" [--provider inworld|fishAudio] [--mattsWords] [--translationOf "<what it translates>" --language <code>] [--approvedBy <who>] [--live] [--json]
Sends a voice note in matt's cloned voice (the voice provider, log clone voice) as twitter's own voice note: an X Chat voice message: the m4a encrypted with the conversation key (chat-xdk encrypt_stream), uploaded to the conversation's media store (InitializeXChatMediaUploadMutation, the parts POSTed to ton.x.com, FinalizeXChatMediaUploadMutation) and sent as the message's one AUDIO attachment with its duration (SendMessageCreateMutation), as X Chat's own recorder sends it. It takes text only, never an audio file: the words are said in his voice, converted with ffmpeg to AAC in .m4a (audio/mp4, as X Chat records) and uploaded on the direct-API engine through the account's one session (vendor/twikit with vendor/chatXdk, in the account's one X session, X Chat opened with the saved PIN, no browser).
A voice note goes out only when matt asks for one (rule 142). The provider is --provider, else LOG_VOICE_PROVIDER, else inworld; the command only ever calls the shared voice layer (rule 143). Without --live it is a dry run: nothing is generated and nothing is contacted. --live needs --approvedBy (rule 8). It says and converts the note while the account catches up (rule 135) and the text goes through the voice gate every send runs (rule 137), so a note that passes goes out without waiting for it to be made; one the gate refuses is never sent. It then claims the chat (rule 133) and releases it after. The governor counts it as a write, the platform's answer decides (rule 73), and a refusal stops with nothing retried (rule 94).
--mattsWords says the text is matt's own words, dictated by him for this voice note: the voice gate's read is skipped, since it grades speech as typed text and as a reply, while the AI artifact check still runs and refuses aiArtifacts (rule 144).
--translationOf "<what it translates>" says the text is a translation, only when matt asked for one: the voice gate grades those original words (his own language, which the gate reads) instead of the translation, which it can't match to his writing; both are read for AI artifacts. --language <code> (zh-CN, es-ES ...) is the language the clone speaks it in, instead of the clone's own, and it is needed with --translationOf (rule 148).
Fill the named fields; each value goes through whole. What acts on X is `twitterVoiceLive`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/voiceNote" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 89, 94, 105, 133, 109, 137, 142, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterVoiceLive`

Send a voice note in matt's cloned voice as Twitter's own voice note, from text; a dry run unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Send a voice note in matt's cloned voice as Twitter's own voice note, from text; a dry run unless --live
log twitter voice --account <accountName> --with <with> --text "<what matt says>" [--provider inworld|fishAudio] [--mattsWords] [--translationOf "<what it translates>" --language <code>] [--approvedBy <who>] [--live] [--json]
Sends a voice note in matt's cloned voice (the voice provider, log clone voice) as twitter's own voice note: an X Chat voice message: the m4a encrypted with the conversation key (chat-xdk encrypt_stream), uploaded to the conversation's media store (InitializeXChatMediaUploadMutation, the parts POSTed to ton.x.com, FinalizeXChatMediaUploadMutation) and sent as the message's one AUDIO attachment with its duration (SendMessageCreateMutation), as X Chat's own recorder sends it. It takes text only, never an audio file: the words are said in his voice, converted with ffmpeg to AAC in .m4a (audio/mp4, as X Chat records) and uploaded on the direct-API engine through the account's one session (vendor/twikit with vendor/chatXdk, in the account's one X session, X Chat opened with the saved PIN, no browser).
A voice note goes out only when matt asks for one (rule 142). The provider is --provider, else LOG_VOICE_PROVIDER, else inworld; the command only ever calls the shared voice layer (rule 143). Without --live it is a dry run: nothing is generated and nothing is contacted. --live needs --approvedBy (rule 8). It says and converts the note while the account catches up (rule 135) and the text goes through the voice gate every send runs (rule 137), so a note that passes goes out without waiting for it to be made; one the gate refuses is never sent. It then claims the chat (rule 133) and releases it after. The governor counts it as a write, the platform's answer decides (rule 73), and a refusal stops with nothing retried (rule 94).
--mattsWords says the text is matt's own words, dictated by him for this voice note: the voice gate's read is skipped, since it grades speech as typed text and as a reply, while the AI artifact check still runs and refuses aiArtifacts (rule 144).
--translationOf "<what it translates>" says the text is a translation, only when matt asked for one: the voice gate grades those original words (his own language, which the gate reads) instead of the translation, which it can't match to his writing; both are read for AI artifacts. --language <code> (zh-CN, es-ES ...) is the language the clone speaks it in, instead of the clone's own, and it is needed with --translationOf (rule 148).
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/voiceNote" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 175, 63, 2, 73, 83, 89, 94, 105, 133, 109, 137, 142, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From the current AGENTS.md (`log://agents`). Historical citations are consolidated; archived instructions do not override the active scope.

**Rule 2.** 2026-10-18 · Put platform code under src/<platform>/<area>/<domain>; shared code stays in its shared library/domain. Use index.ts, types.ts, client.ts, machine.ts and helpers where appropriate. Keep scripts and Python in domain folders.

**Rule 6.** 2026-10-18 · Processes that run over time use XState machines and observable stages through the existing CLI/trace infrastructure.

**Rule 8.** 2026-10-18 · Platform actions require the user authorization their tool defines. Send, post, react, join, edit and delete only when authorized; preserve explicit live confirmation, governor and account gates. Ordinary reads do not need new approval.

**Rule 26.** 2026-10-19 · Stream progress while work runs, one meaningful line per stage, with the run log retained. Explain stages in plain words; do not leave the user waiting silently for a final buffered result.

**Rule 30.** 2026-10-19 · Complete the authorized task. Do not repeatedly request confirmation already given. Distinguish implemented behavior, proposed contracts and unverified assumptions.

**Rule 38.** 2026-10-19 · Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless Matt raises them.

**Rule 39.** 2026-10-19 · Use only the scope, options and intent Matt stated or implied. Do not add unrelated alternatives to research, comparisons, plans or implementation.

**Rule 40.** 2026-10-19 · Do not propose physical infrastructure unless Matt asks. His available implementation scope is hosted/cloud environments and the tools already selected.

**Rule 41.** 2026-10-19 · Paid work must stay within the authorized task and spend. Ask before adding a paid operation he did not authorize; do not substitute a new paid provider implicitly.

**Rule 53.** 2026-10-20 · Verify current external facts from sources. Use the connected tools and applicable guide first for platform/account work; do not invent provider capabilities or production infrastructure from memory.

**Rule 63.** 2026-10-22 · Platform commands are log <platform> <command> <what>. Shared commands remain shared. Preserve the naming boundary described in docs/commandNaming.md.

**Rule 73.** 2026-10-23 · For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence. Use the existing REA/SubQ reading workflow when applicable, report the unknown state, write Point/Evidence/Explain and the fix, then name the state. Preserve paid-work scope. This runtime analysis does not add SubQ to commit/CI gates.

**Rule 83.** 2026-10-25 · New platforms use the existing scaffold, shared account/session boundary, command/catalog wiring, platform documentation and spec anchors. Native hosted scaffolds must not recreate a Twenty dependency.

**Rule 86.** 2026-10-26 · Governor, waking-hours, voice-gate and other bypasses apply only when Matt explicitly requests the specific supported override. A bypass never implicitly disables unrelated gates.

**Rule 89.** 2026-10-26 · Find conversational context by scoped search and existing private records. Do not reread every thread for a single person or task.

**Rule 94.** 2026-10-29 · Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies. A refusal, failed send, 429, block, disable, captcha or cooldown stops that run/account until Matt authorizes continuation. Do not retry through refusals. Bulk reading and sending are separate sessions; cold DMs stay a few a day, minutes apart, and opening a DM counts as a write.

**Rule 105.** 2026-11-01 · One platform/account owns one continuous engine session and push connection. Reads, writes, queues and watches share that owner through existing relay/serialization. Never open a parallel client to bypass the owner or its governor.

**Rule 109.** 2026-11-01 · Read the full relevant chat and current private context before drafting or sending. Include media/transcript/attachment context and pending queued actions; hold a send if required context cannot be obtained. Follow the selected channel's voice and task-brief contract. Cold outreach excludes existing conversations through the current prior-conversation check; bypass it only when Matt asks.

**Rule 133.** 2026-11-04 · Claim a chat before acting; consult recent actions, preserve claim generation and check it before subsequent message parts. A lost claim stops the remaining send. Release when done; retain claim/action evidence in the existing private store.

**Rule 137.** 2026-11-04 · Preserve current context-aware voice and AI-artifact gates for messages sent as Matt. Rework refused drafts from the stated cause. Exact-message overrides and dictated/translated voice-note exceptions require Matt's request and preserve remaining artifact checks. Do not treat an exception as permanent permission.

**Rule 138.** 2026-11-04 · Media and voice-note context uses the existing private media descriptions and transcripts. Do not claim to have understood undescribed media. Preserve hash-based deduplication, private storage and the one describer process.

**Rule 142.** 2026-11-05 · Send a cloned voice note only when Matt asks, through the platform's native voice-note tool and existing provider adapter. Use his authorized words, requested language/translation and pronunciation checks. Follow the voice-note guide for exact behavior; do not turn historical sample/model choices into a new global deployment requirement.

**Rule 175.** 2026-11-11 · Use existing log.db and platform-agnostic engine contracts for native schemas. Do not copy Twenty agency prefixes or CRM/SMS structures. Old listing/campaign functionality is deferred. Add only missing account/credential and hosted execution contracts; preserve existing identity, message, queue, job and governor authorities.
