# xSending

Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, lists, queues and voice notes.

Load next, when the work needs it: getGuide({ topic: "voiceGate" }) (The voice gate every send as the owner passes on every platform: a draft checked against the owner's own writing before it goes out, and the voice and AI-tells indexes behind it); getGuide({ topic: "inbox" }) (Every platform's chats as one inbox: listing and reading them, who waits on a reply, claiming a chat before acting in it, and every action's log); getGuide({ topic: "xInbox" }) (Reading an X account's DMs and X Chat as one inbox, synced by sequence id, and watching X Chat live).

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "inbox/bossMaxxing" })` | Bossmaxxing: giving out tasks to the team | "bossmaxxing", "give out the tasks", "send <person> the task in <group> and tag them", "tell <person> about everything I researched and give them an outline", "triage the jobs across the team", "walk <person> through setting up <tool>", "help <person> get set up like we did with <other person>" |
| `getGuide({ useCase: "inbox/reaLooksmaxxing" })` | /rea-looksmaxxing: moneymaxx like a creator | "/rea-looksmaxxing how clavicular gets paid", "moneymaxx like <creator>", "how does <creator> get paid" |
| `getGuide({ useCase: "inbox/reactions" })` | Reacting to a message | "react to that", "heart his message", "put a 😂 on what she said", "send a reaction to <person>" |
| `getGuide({ useCase: "inbox/voiceNote" })` | Sending a voice note | "send <person> a voice note saying …", "voice note him that …", "send a vn to the group saying …" |
| `getGuide({ useCase: "twitter/affiliateMarketing" })` | Affiliate marketing through your DMs | "answer the people asking about <tool> in my dms with my affiliate link", "turn the dms about <tool> into affiliate money", "follow up everyone who asked about the tool", "get me onto <company>'s affiliate program and book the call". |
| `getGuide({ useCase: "twitter/collabMaxxing" })` | Collab maxxing: turn open conversations into collabs | "position a collab first then be like just a few quid so i can make a video about it", "start network maxxing and collab maxxing and trying to see what hes doing get him to reveal it all", "follow up on <someone> and the other people, small commitment from deals, not just new people but already open convos", "respond with the collabmaxxing", "selling the outcome", "let him name it", "check in with <someone> whats good there he is keen but isnt liquid", "just be nice to them there the poor people", "ask <someone> if i could become a contributor", "look on my twitter for missed opportunities". |
| `getGuide({ useCase: "twitter/dmInbox" })` | Reading the DM inbox: who is waiting on you | "who is waiting on me", "check my x dms", "go through my twitter inbox and tell me who needs a reply", "who am I waiting on in my dms". |
| `getGuide({ useCase: "twitter/engagementReplies" })` | Answering the people who engaged with your posts | "reply to everyone who commented on my last tweet", "answer the comments on my post", "reply to the people who replied to my tweet with the follow-up link". |
| `getGuide({ useCase: "twitter/engagerDms" })` | DMing the people who liked or reposted your post | "dm everyone who liked my post", "message the people who retweeted my tweet", "dm the likers and reposters of <post url> pitching <what>". |
| `getGuide({ useCase: "twitter/followUps" })` | Following up in your own voice | "follow up with these, not for anything in particular, just warming up the relationship", "say it was cool to meet him", "ask him for some advice on what he's doing", "take him up on the doc he offered". |
| `getGuide({ useCase: "twitter/getTheAction" })` | Getting people to do the thing: retweet, like, try it | "get me all them people who liked it ... yo cool to see that you liked that, would you give that a wee retweet", "notifications: people who like, comment, reply", "go through all the people there who need a message", "get them to retweet the thing", "would you do me a favour and give it a wee retweet", "I need them to retweet it so I can get some inbound leads", "I don't know what they're even talking about, explain the context", "make them do the action I need", "get the full context of everything on the account at the time of sending the message". |
| `getGuide({ useCase: "twitter/managerMaxxing" })` | Manager maxxing: the managers of the biggest Kick streamers | "manager maxxing", "find every kick streamer's manager on twitter", "reply guy the kick managers with memes", "the managers that engaged, send them their tweet, a message and a voice note". |
| `getGuide({ useCase: "twitter/networkMaxing" })` | Network maxing: grow the network, the niche map | "all them people messaging me, just message them something nice, get the ball moving with the networking", "we're not even trying to get anything out of these people, network max", "throw some new people in the mixer", "network max ... look at the nicheMap", "the whole point of it is to expand our network, which is the niche map", "follow them before you cold message them, and like the tweet you send them". |
| `getGuide({ useCase: "twitter/nicheMapRegion" })` | A new region of the niche map, then outbound to it | "for getting accepted into YC ... make a new area of the niche map through the systems we've already made ... the YC world and the funds' world, based on the 26 batch", "the YC stuff in and around the boat.dev people and the people involved in GTM tools", "pull all of my new followers ... set a budget of like 60$", "start with the 43", "not just treg but the actual index that we did already". |
| `getGuide({ useCase: "twitter/recruiting" })` | Recruiting on X with a reply queue | "recruit for the <role> role on x", "find people looking for work on twitter and reply with the job link", "hire a <role> through tweet replies". |
| `getGuide({ useCase: "twitter/replyGuyFunnel" })` | Reply guy, then the DM, then the ask | "reply guy them first and foremost", "send a meme to the tweet then forward the tweet to them as an opener", "message the people who are new to following me", "get it in front of them", "funnel them into doing an action". |
| `getGuide({ useCase: "twitter/topicReplies" })` | Replying to everyone posting about one topic | "reply to everyone tweeting about <topic>", "find everyone posting about <topic> on x and reply with my article", "reply to the people talking about <topic> with my video". |

## The tools in this guide

Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.

| Tool | What it does | Usage |
|---|---|---|
| `twitterReply` | Reply to one post on X with approved copy, on the direct-API engine | `log twitter reply --account <accountName> --tweet <postUrl> --text "<copy>" [--media <file>[,<file>]] [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]` |
| `twitterReplyLive` | Reply to one post on X with approved copy, on the…, live on X | `log twitter reply --account <accountName> --tweet <postUrl> --text "<copy>" [--media <file>[,<file>]] [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]` |
| `twitterQuote` | Quote one post on X with approved copy, on the direct-API engine | `log twitter quote --account <accountName> --tweet <postUrl> --text "<copy>" [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]` |
| `twitterQuoteLive` | Quote one post on X with approved copy, on the…, live on X | `log twitter quote --account <accountName> --tweet <postUrl> --text "<copy>" [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]` |
| `twitterPost` | Make one original post on X with approved copy and optional media | `log twitter post --account <accountName> --text "<copy>" [--media <file>[,<file>]] [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]` |
| `twitterPostLive` | Make one original post on X with approved copy and…, live on X | `log twitter post --account <accountName> --text "<copy>" [--media <file>[,<file>]] [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]` |
| `twitterLike` | Like one post on X, on the direct-API engine | `log twitter like --account <accountName> --tweet <postUrl> [--approvedBy <who>] [--force] [--live] [--json]` |
| `twitterLikeLive` | Like one post on X, on the direct-API engine, live on X | `log twitter like --account <accountName> --tweet <postUrl> [--approvedBy <who>] [--force] [--live] [--json]` |
| `twitterListShow` | List the X account's lists with their ids and member counts, sending… | `log twitter list show --account <accountName> [--json]` |
| `twitterListCreate` | Make an X list on the account | `log twitter list create --account <accountName> --name <name> [--description <text>] [--private] [--approvedBy <who>] [--live] [--json]` |
| `twitterListCreateLive` | Make an X list on the account, live on X | `log twitter list create --account <accountName> --name <name> [--description <text>] [--private] [--approvedBy <who>] [--live] [--json]` |
| `twitterListAdd` | Put one person on one of the account's X lists | `log twitter list add --account <accountName> --list <name\|id> --handle <handle>\|--userId <id> [--approvedBy <who>] [--live] [--json]` |
| `twitterListAddLive` | Put one person on one of the account's X lists, live on X | `log twitter list add --account <accountName> --list <name\|id> --handle <handle>\|--userId <id> [--approvedBy <who>] [--live] [--json]` |
| `twitterRepost` | Repost one post on X, on the direct-API engine | `log twitter repost --account <accountName> --tweet <postUrl> [--approvedBy <who>] [--force] [--live] [--json]` |
| `twitterRepostLive` | Repost one post on X, on the direct-API engine, live on X | `log twitter repost --account <accountName> --tweet <postUrl> [--approvedBy <who>] [--force] [--live] [--json]` |
| `twitterFollow` | Follow one person on X, on the direct-API engine | `log twitter follow --account <accountName> --userId <id> [--approvedBy <who>] [--force] [--live] [--json]` |
| `twitterFollowLive` | Follow one person on X, on the direct-API engine, live on X | `log twitter follow --account <accountName> --userId <id> [--approvedBy <who>] [--force] [--live] [--json]` |
| `twitterDm` | Send one approved direct message on X, on the direct-API engine | `log twitter dm --account <accountName> --userId <id> --text "<copy>" [--media <file\|url>] [--approvedBy <who>] [--skipStyleCheck] [--asOne] [--overGate] [--force] [--live] [--json]` |
| `twitterDmLive` | Send one approved direct message on X, on the…, live on X | `log twitter dm --account <accountName> --userId <id> --text "<copy>" [--media <file\|url>] [--approvedBy <who>] [--skipStyleCheck] [--asOne] [--overGate] [--force] [--live] [--json]` |
| `twitterReact` | React to a X message with an emoji, on the direct-API engine | `log twitter react --account <accountName> --chat <chat> --message <id> --emoji <emoji> [--remove] [--approvedBy <who>] [--live] [--json]` |
| `twitterReactLive` | React to a X message with an emoji, on the direct-API…, live on X | `log twitter react --account <accountName> --chat <chat> --message <id> --emoji <emoji> [--remove] [--approvedBy <who>] [--live] [--json]` |
| `twitterQueueBuild` | Build a queue file pairing each target with one unique approved line… | `log twitter queue build --targets <targets.json> [--variations <a.json,b.json>] --out <queue.json> --account <accountName> [--action reply\|quote\|dm\|voice] [--seed <n>]` |
| `twitterQueueShow` | Show a queue | `log twitter queue show <queue.json> [--json]` |
| `twitterQueueCheck` | Check every pending item's target and house style | `log twitter queue check <queue.json> [--skipXChatCheck] [--json]` |
| `twitterQueueStatus` | Count a queue's items by status | `log twitter queue status <queue.json> [--json]` |
| `twitterQueueApprove` | Record who approved the queue as it stands now | `log twitter queue approve <queue.json> --by <who>` |
| `twitterQueuePlan` | Draw a random time for every like and reply inside a window… | `log twitter queue plan <queue.json> --window <5h\|90m> [--limit <n>] [--start <time>] [--minGap <s>] [--like] [--likeChance <0-1>]` |
| `twitterQueueRun` | Run a queue's plan as an XState machine | `log twitter queue run <queue.json> [--alertChannel <uuid>] [--alertReplyTo <eventId>] [--alertMention <hex,hex>] [--force] [--keepOpen] [--live]` |
| `twitterQueueRunLive` | Run a queue's plan as an XState machine, live on X | `log twitter queue run <queue.json> [--alertChannel <uuid>] [--alertReplyTo <eventId>] [--alertMention <hex,hex>] [--force] [--keepOpen] [--live]` |
| `twitterQueueAdd` | Add approved dms, replies or quotes to an account's queue, even while… | `log twitter queue add <queue.json> --targets <targets.json> --by <who> [--action reply\|quote\|dm\|voice] [--window <2h\|90m>] [--minGap <s>]` |
| `twitterQueueNudge` | Tell a running queue to send its next replies now | `log twitter queue nudge <queue.json> [--replies <n>]` |
| `twitterQueueEdit` | Put new copy on a pending or held queue item | `log twitter queue edit <queue.json> --n <n> --text "<new copy>" --by <who> [--window <30m>]` |
| `twitterVoice` | Send a voice note in the owner's cloned voice as Twitter's own voice… | `log twitter voice --account <accountName> --with <with> --text "<what the owner says>" [--provider inworld\|fishAudio] [--mattsWords] [--translationOf "<what it translates>" --language <code>] [--approvedBy <who>] [--live] [--json]` |
| `twitterVoiceLive` | Send a voice note in the owner's cloned voice as…, live on X | `log twitter voice --account <accountName> --with <with> --text "<what the owner says>" [--provider inworld\|fishAudio] [--mattsWords] [--translationOf "<what it translates>" --language <code>] [--approvedBy <who>] [--live] [--json]` |

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
- Twenty: Notes → "Social posting playbook" in your own Twenty.
- Knowledge base: `log kb search "social posting playbook"`.

Post the original with `log twitter post --account <handle> --text "<copy>" --media <video.mp4>` (MCP `twitterPost`, `twitterPostLive`).
It is a dry run first: it checks the copy against the account's style, and checks the file's type and size,
without contacting X. `--live --approvedBy <who>` uploads the file and posts.
A video is uploaded in chunks, and the post is made only once X's own processing says succeeded.
It takes one video or gif, or up to 4 images. Everything after the post goes through log-cli as well:
the replies to its comments, the quote an hour later, and the DMs to the people who liked it.

### 3. Reaching people: `log twitter`

**Send what X's own client sends.** Every GraphQL call uses
X's live operation ids and feature switches, read from X's signed-in
client with `log twitter session webClient --account <a>` into
`~/.logCli/twitter/xOperations.json`. Run it again when X ships a new
main.js. What X's composer sends is in `docs/platforms/x/compose.md`.

**The account stays live in context.** While its X Chat watch
runs, the account reads X's own badge counts every 2 minutes, the way
x.com does, and reads the new notifications when the count rises. Each
Claude session gets what is new in a `>>> X LIVE` block. A reply, quote
or mention there is someone talking to the owner: read them and answer.
How it works: `docs/platforms/x/live.md`.

**Full context before every message (rule 109).** Before you write to
anyone, and again right before it goes out, know everything between them
and the account at that moment, never only the dm thread:

- `twitterDms` { account, with: "<handle>" } gives their whole thread (old
  DMs and X Chat, read from X itself, so it also holds what the owner sent them
  from the owner's phone or anywhere outside log) **and** what they did on the
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
  lines goes out one message per line, with the owner's usual gap between them,
  and the queue sends dms the same way (rule 90); `--asOne` only when the owner
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
  it drops people the account has already talked to on X Chat (rule 109).
- **One session per account (rule 105):** every X call goes through the
  account's one engine host (`python/twitterApi/host.py`). The first call starts
  it; every call after, from the CLI, MCP, hooks, the queue or the X Chat watch,
  is answered by that same session (one client, one connection, one transaction
  key), one call at a time: a send 4 to 11 s after the last call, a read 0.8
  to 2.5 s. The answer's
  `xSession` names it (pid, since, calls), and the hook's account line shows it.
  A second session can't start. If the host can't be reached the call is
  refused (`xSessionHostDown`) and nothing is sent: read
  `~/.logCli/twitter/<account>/host.log`, never work around it. More than one
  send goes through the queue, never a hand-rolled loop (rule 105). The whole
  contract: [docs/specs/xSession.md](../../docs/specs/xSession.md).
- **Pacing:** 240 writes a day per account, kept by the account's governor.
  `--force` goes past it only when the owner says so (rule 86). See
  [docs/specs/writeBudgets.md](../../docs/specs/writeBudgets.md).

### 3b. The growth loop (how the owner grows @matthewsoldit)

What worked for the owner (`log kb show memory:-buzz/listeningkit-real-state`): a
text post about treg ("$10 -> 30 conversations") did 205K views and 1,182
likes, and the account's followers went from 308 to 352 in four days. The owner then turned
the attention into conversations. Every account runs the same loop, in this
order:

| # | When | What | How |
| --- | --- | --- | --- |
| 1 | Post day | One original post. The text carries it (a video open counts almost nothing). One best post per feed window, when the audience is online, never several in a row | the social posting playbook (section 2), sent by hand |
| 2 | The first 2 hours | Answer every comment. Unanswered questions are the best openers. Replies between mutuals score highest | `docs/useCases/twitter/engagementReplies.md`: treg comments read, then a queue of replies |
| 3 | About 1 hour after | Quote a matching trend, never before your own post | playbook "Riding a trend", `log twitter quote` |
| 4 | The next days | DM the people who liked or reposted it, opening with one of their own tweets, then one informal line | `docs/useCases/twitter/engagerDms.md` (the cold DM way), queue `action: dm` |
| 5 | Every day | Reply to people posting about your topic, one line about their post backed by your own fact, inside the account's 240 writes a day | `docs/useCases/twitter/topicReplies.md`, the queue's `limit` |
| 6 | Always | Answer whoever writes back. Never send a cold template to someone you already talk to | `log twitter dms --account <a> [--with <handle>]`, `chat watch` (needs the X Chat PIN), rule 109 |
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
| your main account | its plan in the knowledge base (`log kb search "<account> plan"`) | the product, the people it is for, the follower atlas |
| a teammate's account | the teammate's own social growth plan | positioning, content pillars and their ratio, the hook and CTA banks, the 30-day and 90-day plans, DM openers, leads in Twenty, the weekly review |

Where they disagree, the X discipline wins on X. The plan's comment
prompts ("comment your AI stack") read as engagement bait there, so on X
ask a real question in the post instead. A cold DM opens the cold DM way
(their own tweet first). The plan's DM opener is for someone who has
already commented.

**Voice.** `log voice` gates drafts against the owner's own writing. Its guide
and the owner's saved conversations are on the owner's machine, so on any other account it
judges by the owner's voice. For an account of your own, write in its
`copyStyle`, and keep each line about the other person's post.

### 4. Copy styles

Every send and every queue check holds its copy to the account's
`copyStyle` (Twenty `socialAccounts.copyStyle`; empty means `house`):

| Style | Rules |
| --- | --- |
| `house` | The owner's: lowercase only, no commas, semicolons, full stops, em or en dashes. URLs are exempt |

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
  engine (`DIRECT_ROUTES`, `COMMAND_RULES`), never a browser.

Then run `log kb sync`. This skill, the use cases and the docs go into
Twenty's knowledge base and its Redis search, and every agent finds them
with `log kb search`.

## The rules these tools fall under

Each by its number and first line. The full text is in AGENTS.md (`log://agents`); the core rules are in full in `getGuide({ topic: "logMcpInstructions" })`.

- **Rule 8.** Platform actions require the user authorization their tool defines.
- **Rule 26.** Stream progress while work runs, one meaningful line per stage, with the run log retained.
- **Rule 30.** Complete the authorized task.
- **Rule 38.** Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless the owner raises them.
- **Rule 39.** Use only the scope, options and intent the owner stated or implied.
- **Rule 40.** Do not propose physical infrastructure unless the owner asks.
- **Rule 41.** Paid work must stay within the authorized task and spend.
- **Rule 53.** Verify current external facts from sources.
- **Rule 73.** For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence.
- **Rule 86.** Governor, waking-hours, voice-gate and other bypasses apply only when the owner explicitly requests the specific supported override.
- **Rule 89.** Find conversational context by scoped search and existing private records.
- **Rule 94.** Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies.
- **Rule 105.** One platform/account owns one continuous engine session and push connection.
- **Rule 109.** Read the full relevant chat and current private context before drafting or sending.
- **Rule 133.** Claim a chat before acting; consult recent actions, preserve claim generation and check it before subsequent message parts.
- **Rule 137.** Preserve current context-aware voice and AI-artifact gates for messages sent as the owner.
- **Rule 138.** Media and voice-note context uses the existing private media descriptions and transcripts.
- **Rule 142.** Send a cloned voice note only when the owner asks, through the platform's native voice-note tool and existing provider adapter.
