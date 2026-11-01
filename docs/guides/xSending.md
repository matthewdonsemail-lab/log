# xSending

Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "twitter/affiliateMarketing" })` | Affiliate marketing through your DMs | see the page |
| `getGuide({ useCase: "twitter/dmInbox" })` | Reading the DM inbox: who is waiting on you | see the page |
| `getGuide({ useCase: "twitter/engagementReplies" })` | Answering the people who engaged with your posts | see the page |
| `getGuide({ useCase: "twitter/engagerDms" })` | DMing the people who liked or reposted your post | see the page |
| `getGuide({ useCase: "twitter/followUps" })` | Following up in your own voice | "follow up with these, not for anything in particular, just warming up the relationship", "say it was cool to meet him", "ask him for some advice on what he's doing", "take him up on the doc he offered". |
| `getGuide({ useCase: "twitter/getTheAction" })` | Getting people to do the thing: retweet, like, try it | "get me all them people who liked it ... yo cool to see that you liked that, would you give that a wee retweet", "notifications: people who like, comment, reply", "go through all the people there who need a message", "get them to retweet the thing", "would you do me a favour and give it a wee retweet", "I need them to retweet it so I can get some inbound leads", "I don't know what they're even talking about, explain the context", "make them do the action I need", "get the full context of everything on the account at the time of sending the message". |
| `getGuide({ useCase: "twitter/networkMaxing" })` | Network maxing: grow the network, the niche map | "all them people messaging me, just message them something nice, get the ball moving with the networking", "we're not even trying to get anything out of these people, network max", "throw some new people in the mixer", "network max ... look at the nicheMap", "the whole point of it is to expand our network, which is the niche map", "follow them before you cold message them, and like the tweet you send them". |
| `getGuide({ useCase: "twitter/recruiting" })` | Recruiting on X with a reply queue | see the page |
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
| `twitterRepost` | Repost one post on X, on the direct-API engine |
| `twitterRepostLive` | Repost one post on X, on the direct-API engine, live on X |
| `twitterFollow` | Follow one person on X, on the direct-API engine |
| `twitterFollowLive` | Follow one person on X, on the direct-API engine, live on X |
| `twitterDm` | Send one approved direct message on X, on the direct-API engine |
| `twitterDmLive` | Send one approved direct message on X, on the…, live on X |
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
  approve → plan → run → run --live`. It spaces sends at random and backs off
  when X throttles. Before any DM it drops people the account has already
  talked to on X Chat (rule 87).
- **One session per account (rule 105):** every X call goes through the
  account's one engine host (`python/twitterApi/host.py`). The first call starts
  it; every call after, from the CLI, MCP, hooks, the queue or the X Chat watch,
  is answered by that same session (one client, one connection, one transaction
  key), one call at a time, 4 to 11 s apart (rule 104). The answer's
  `xSession` names it (pid, since, calls), and the hook's account line shows it.
  A second session can't start. If the host can't be reached the call is
  refused (`xSessionHostDown`) and nothing is sent: read
  `~/.logCli/twitter/<account>/host.log`, never work around it. More than one
  send goes through the queue, never a hand-rolled loop (rule 104).
- **Pacing:** 240 writes a day per account, kept by the account's governor.
  `--force` goes past it only when the owner says so (rule 86).

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
| 5 | Every day | Reply to people posting about your topic, one line about their post backed by your own fact, inside 40 writes a day | `docs/useCases/twitter/topicReplies.md`, the queue's `limit` |
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
log voice --to <handle> [--text "<draft>"] [--context "<what they said>"] [--with <person or chat>] [--json]
Gates a draft before anything is sent as matt (his rule, 2026-10-27): SubQ reads it against matt's own writing guide (GUIDES/MATT_WRITING_STYLE.md, built from 256 of his tweets) and the dms he wrote himself, and answers whether it sounds like he typed it (voice, 0.8 to pass), whether it answers what they said (--context) or something specific about them, whether it reads like a mate texting, and, to someone matt has never talked with, whether it is only a relevant opener with no ask or pitch (openerOnly, matt 2026-10-31). A phrase matt never says (hit home, big swing, spot on, felt that…) fails it outright. Sends nothing.
--with names the chat or person the way matt says it ("the log group", "jilly", a handle): log finds matt's real replies to things like --context, from that chat first, then that person, then that platform, then anywhere, and how he writes there (length, case, punctuation, his words). Without --text it shows them to draft from; with --text the gate also asks whether the draft reads like his real replies there (toThem, 0.7 to pass).
Exit 0 when it passes, 1 when it doesn't: rewrite and gate again.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/engagerDms" }), getGuide({ useCase: "twitter/followUps" }), getGuide({ useCase: "twitter/getTheAction" }), getGuide({ useCase: "twitter/networkMaxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 30, 39, 41, 63, 64, 98, 112, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `voiceAiIndex`

Build the AI tells index with Jina and measure matt's own messages against it.
Gate a draft against matt's own writing guide with SubQ before anything is sent as him, sending nothing
log voice aiIndex [--json]   (builds the AI tells index: every literal phrase in vendor/aiTells, tbhb/vale-ai-tells first and then the other lists, embedded with Jina (JINA_API_KEY), with matt's own replies from the voice index measured against it for his p50 and p99 closeness, and the vale rules he uses himself muted; rule 112)
Gates a draft before anything is sent as matt (his rule, 2026-10-27): SubQ reads it against matt's own writing guide (GUIDES/MATT_WRITING_STYLE.md, built from 256 of his tweets) and the dms he wrote himself, and answers whether it sounds like he typed it (voice, 0.8 to pass), whether it answers what they said (--context) or something specific about them, whether it reads like a mate texting, and, to someone matt has never talked with, whether it is only a relevant opener with no ask or pitch (openerOnly, matt 2026-10-31). A phrase matt never says (hit home, big swing, spot on, felt that…) fails it outright. Sends nothing.
--with names the chat or person the way matt says it ("the log group", "jilly", a handle): log finds matt's real replies to things like --context, from that chat first, then that person, then that platform, then anywhere, and how he writes there (length, case, punctuation, his words). Without --text it shows them to draft from; with --text the gate also asks whether the draft reads like his real replies there (toThem, 0.7 to pass).
Exit 0 when it passes, 1 when it doesn't: rewrite and gate again.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 30, 39, 41, 63, 64, 98, 112, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `voiceIndex`

Build matt's voice per chat and person from the conversations log search saved.
Gate a draft against matt's own writing guide with SubQ before anything is sent as him, sending nothing
log voice index [--json]   (builds matt's voice from every conversation log search already saved, reading nothing new: each of his replies paired with what was said just before it, embedded with log search's own model, and a profile per chat, person and platform counted from his own messages)
Gates a draft before anything is sent as matt (his rule, 2026-10-27): SubQ reads it against matt's own writing guide (GUIDES/MATT_WRITING_STYLE.md, built from 256 of his tweets) and the dms he wrote himself, and answers whether it sounds like he typed it (voice, 0.8 to pass), whether it answers what they said (--context) or something specific about them, whether it reads like a mate texting, and, to someone matt has never talked with, whether it is only a relevant opener with no ask or pitch (openerOnly, matt 2026-10-31). A phrase matt never says (hit home, big swing, spot on, felt that…) fails it outright. Sends nothing.
--with names the chat or person the way matt says it ("the log group", "jilly", a handle): log finds matt's real replies to things like --context, from that chat first, then that person, then that platform, then anywhere, and how he writes there (length, case, punctuation, his words). Without --text it shows them to draft from; with --text the gate also asks whether the draft reads like his real replies there (toThem, 0.7 to pass).
Exit 0 when it passes, 1 when it doesn't: rewrite and gate again.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 30, 39, 41, 63, 64, 98, 112, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterReply`

Reply to one post on X with approved copy, on the direct-API engine; a dry run unless --live.
Reply to one post on X with approved copy, on the direct-API engine; a dry run unless --live
log twitter reply --account <accountName> --tweet <postUrl> --text "<copy>" [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]
Reply to one post on X with approved copy, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's create answer decides: a tweet id is sent, an empty result is a drop (nothing posted, usually the author's reply limits). Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole. What acts on X is `twitterReplyLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 104, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterReplyLive`

Reply to one post on X with approved copy, on the direct-API engine; a dry run unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Reply to one post on X with approved copy, on the direct-API engine; a dry run unless --live
log twitter reply --account <accountName> --tweet <postUrl> --text "<copy>" [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]
Reply to one post on X with approved copy, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's create answer decides: a tweet id is sent, an empty result is a drop (nothing posted, usually the author's reply limits). Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 104, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQuote`

Quote one post on X with approved copy, on the direct-API engine; a dry run unless --live.
Quote one post on X with approved copy, on the direct-API engine; a dry run unless --live
log twitter quote --account <accountName> --tweet <postUrl> --text "<copy>" [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]
Quote one post on X with approved copy, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's create answer decides: a tweet id is sent, an empty result is a drop. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole. What acts on X is `twitterQuoteLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 104, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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
AGENTS.md (log://agents): rules 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 104, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterPost`

Make one original post on X with approved copy and optional media (a video, a gif or up to 4 images), on the direct-API engine; a dry run unless --live.
Make one original post on X with approved copy and optional media (a video, a gif or up to 4 images), on the direct-API engine; a dry run unless --live
log twitter post --account <accountName> --text "<copy>" [--media <file>[,<file>]] [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]
Make one original post on X with approved copy and optional media (a video, a gif or up to 4 images), on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
Each file is uploaded first (a video in chunks, then X's own processing status must say succeeded before the post is made), then the post is created with the media ids. X's create answer decides: a tweet id is sent, an empty result is a drop and nothing was posted. A file X refuses stops it before anything is posted. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole. What acts on X is `twitterPostLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 13, 63, 64, 73, 80, 81, 86, 94, 104, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterPostLive`

Make one original post on X with approved copy and optional media (a video, a gif or up to 4 images), on the direct-API engine; a dry run unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Make one original post on X with approved copy and optional media (a video, a gif or up to 4 images), on the direct-API engine; a dry run unless --live
log twitter post --account <accountName> --text "<copy>" [--media <file>[,<file>]] [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]
Make one original post on X with approved copy and optional media (a video, a gif or up to 4 images), on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
Each file is uploaded first (a video in chunks, then X's own processing status must say succeeded before the post is made), then the post is created with the media ids. X's create answer decides: a tweet id is sent, an empty result is a drop and nothing was posted. A file X refuses stops it before anything is posted. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 13, 63, 64, 73, 80, 81, 86, 94, 104, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterLike`

Like one post on X, on the direct-API engine; a dry run unless --live.
Like one post on X, on the direct-API engine; a dry run unless --live
log twitter like --account <accountName> --tweet <postUrl> [--approvedBy <who>] [--force] [--live] [--json]
Like one post on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's favorite answer decides: Done (or already liked, code 139) is sent. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole. What acts on X is `twitterLikeLive`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/networkMaxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 104, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterLikeLive`

Like one post on X, on the direct-API engine; a dry run unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Like one post on X, on the direct-API engine; a dry run unless --live
log twitter like --account <accountName> --tweet <postUrl> [--approvedBy <who>] [--force] [--live] [--json]
Like one post on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's favorite answer decides: Done (or already liked, code 139) is sent. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/networkMaxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 104, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterRepost`

Repost one post on X, on the direct-API engine; a dry run unless --live.
Repost one post on X, on the direct-API engine; a dry run unless --live
log twitter repost --account <accountName> --tweet <postUrl> [--approvedBy <who>] [--force] [--live] [--json]
Repost one post on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's retweet answer decides: a created retweet (or already reposted, code 327) is sent. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole. What acts on X is `twitterRepostLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 104, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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
AGENTS.md (log://agents): rules 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 104, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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
AGENTS.md (log://agents): rules 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 104, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterFollowLive`

Follow one person on X, on the direct-API engine; a dry run unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Follow one person on X, on the direct-API engine; a dry run unless --live
log twitter follow --account <accountName> --userId <id> [--approvedBy <who>] [--force] [--live] [--json]
Follow one person on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's follow answer decides: the followed user back is sent, already following is sent too. Follow before a cold dm: nobody gets a cold message from an account that doesn't follow them. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/networkMaxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 104, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterDm`

Send one approved direct message on X, on the direct-API engine; a dry run unless --live.
Send one approved direct message on X, on the direct-API engine; a dry run unless --live
log twitter dm --account <accountName> --userId <id> --text "<copy>" [--approvedBy <who>] [--skipStyleCheck] [--asOne] [--force] [--live] [--json]
Send one approved direct message on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
A draft written on several lines goes out one message per line, and a one-line draft is split the way matt writes in that chat (log voice index), with his usual gap between them; --asOne sends it as one, only when matt asked (rule 90). X's answer decides: a conversation id is sent, none is a drop, and a drop stops the rest: what was sent stays sent, nothing is retried (rule 94). An old DM thread (<a>-<b>) and its X Chat thread (<a>:<b>) with one person are one conversation: X shows them in the same place, and a dm sent through the old DM API shows in their X Chat too. A sent answer is delivered whichever conversation id it names: never resend it and never call it the wrong inbox. A refusal before X is called (styleFailed, a dry run) sent nothing, so that dm is sent once its copy is fixed. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole. What acts on X is `twitterDmLive`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/affiliateMarketing" }), getGuide({ useCase: "twitter/dmInbox" }), getGuide({ useCase: "twitter/followUps" }), getGuide({ useCase: "twitter/networkMaxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 98, 104, 105, 108, 109, 111, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterDmLive`

Send one approved direct message on X, on the direct-API engine; a dry run unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Send one approved direct message on X, on the direct-API engine; a dry run unless --live
log twitter dm --account <accountName> --userId <id> --text "<copy>" [--approvedBy <who>] [--skipStyleCheck] [--asOne] [--force] [--live] [--json]
Send one approved direct message on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
A draft written on several lines goes out one message per line, and a one-line draft is split the way matt writes in that chat (log voice index), with his usual gap between them; --asOne sends it as one, only when matt asked (rule 90). X's answer decides: a conversation id is sent, none is a drop, and a drop stops the rest: what was sent stays sent, nothing is retried (rule 94). An old DM thread (<a>-<b>) and its X Chat thread (<a>:<b>) with one person are one conversation: X shows them in the same place, and a dm sent through the old DM API shows in their X Chat too. A sent answer is delivered whichever conversation id it names: never resend it and never call it the wrong inbox. A refusal before X is called (styleFailed, a dry run) sent nothing, so that dm is sent once its copy is fixed. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/affiliateMarketing" }), getGuide({ useCase: "twitter/dmInbox" }), getGuide({ useCase: "twitter/followUps" }), getGuide({ useCase: "twitter/networkMaxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 98, 104, 105, 108, 109, 111, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueBuild`

Build a queue file pairing each target with one unique approved line, sending nothing.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue build --targets <targets.json> [--variations <a.json,b.json>] --out <queue.json> --account <accountName> [--action reply|quote|dm] [--seed <n>]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, cooling, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: a block or throttle cools off (15 min doubling to 4 h, or X's reset time, 24 h on the daily limit 344) and retries the post once at the end; a deleted post or replies off (385/433) is skipped; a dead session or 5 cool-offs in a row halts it and, with --alertChannel, tags matt in buzz. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers and the run's own cool-offs still apply.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/engagementReplies" }), getGuide({ useCase: "twitter/engagerDms" }), getGuide({ useCase: "twitter/getTheAction" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87, 94, 104, 105, 107, 108, 109, 110, 111, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueShow`

Show a queue: who, which post, what copy, and its approval.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue show <queue.json> [--json]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, cooling, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: a block or throttle cools off (15 min doubling to 4 h, or X's reset time, 24 h on the daily limit 344) and retries the post once at the end; a deleted post or replies off (385/433) is skipped; a dead session or 5 cool-offs in a row halts it and, with --alertChannel, tags matt in buzz. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers and the run's own cool-offs still apply.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87, 94, 104, 105, 107, 108, 109, 110, 111, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueCheck`

Check every pending item's target and house style; for a dm queue, read the account's X Chat inbox and drop anyone already in a conversation.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue check <queue.json> [--skipXChatCheck] [--json]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, cooling, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: a block or throttle cools off (15 min doubling to 4 h, or X's reset time, 24 h on the daily limit 344) and retries the post once at the end; a deleted post or replies off (385/433) is skipped; a dead session or 5 cool-offs in a row halts it and, with --alertChannel, tags matt in buzz. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers and the run's own cool-offs still apply.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/engagementReplies" }), getGuide({ useCase: "twitter/engagerDms" }), getGuide({ useCase: "twitter/recruiting" }), getGuide({ useCase: "twitter/topicReplies" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87, 94, 104, 105, 107, 108, 109, 110, 111, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueStatus`

Count a queue's items by status.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue status <queue.json> [--json]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, cooling, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: a block or throttle cools off (15 min doubling to 4 h, or X's reset time, 24 h on the daily limit 344) and retries the post once at the end; a deleted post or replies off (385/433) is skipped; a dead session or 5 cool-offs in a row halts it and, with --alertChannel, tags matt in buzz. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers and the run's own cool-offs still apply.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/recruiting" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87, 94, 104, 105, 107, 108, 109, 110, 111, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueApprove`

Record who approved the queue as it stands now.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue approve <queue.json> --by <who>
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, cooling, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: a block or throttle cools off (15 min doubling to 4 h, or X's reset time, 24 h on the daily limit 344) and retries the post once at the end; a deleted post or replies off (385/433) is skipped; a dead session or 5 cool-offs in a row halts it and, with --alertChannel, tags matt in buzz. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers and the run's own cool-offs still apply.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/getTheAction" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87, 94, 104, 105, 107, 108, 109, 110, 111, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueuePlan`

Draw a random time for every like and reply inside a window, contacting nothing.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue plan <queue.json> --window <5h|90m> [--limit <n>] [--start <time>] [--minGap <s>] [--like] [--likeChance <0-1>]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, cooling, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: a block or throttle cools off (15 min doubling to 4 h, or X's reset time, 24 h on the daily limit 344) and retries the post once at the end; a deleted post or replies off (385/433) is skipped; a dead session or 5 cool-offs in a row halts it and, with --alertChannel, tags matt in buzz. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers and the run's own cool-offs still apply.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/getTheAction" }), getGuide({ useCase: "twitter/topicReplies" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87, 94, 104, 105, 107, 108, 109, 110, 111, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueRun`

Run a queue's plan as an XState machine; a dry run lists what it would send unless --live.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue run <queue.json> [--alertChannel <uuid>] [--alertReplyTo <eventId>] [--alertMention <hex,hex>] [--force] [--keepOpen] [--live]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, cooling, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: a block or throttle cools off (15 min doubling to 4 h, or X's reset time, 24 h on the daily limit 344) and retries the post once at the end; a deleted post or replies off (385/433) is skipped; a dead session or 5 cool-offs in a row halts it and, with --alertChannel, tags matt in buzz. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers and the run's own cool-offs still apply.
Fill the named fields; each value goes through whole. What acts on X is `twitterQueueRunLive`.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87, 94, 104, 105, 107, 108, 109, 110, 111, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueRunLive`

Run a queue's plan as an XState machine; a dry run lists what it would send unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue run <queue.json> [--alertChannel <uuid>] [--alertReplyTo <eventId>] [--alertMention <hex,hex>] [--force] [--keepOpen] [--live]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, cooling, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: a block or throttle cools off (15 min doubling to 4 h, or X's reset time, 24 h on the daily limit 344) and retries the post once at the end; a deleted post or replies off (385/433) is skipped; a dead session or 5 cool-offs in a row halts it and, with --alertChannel, tags matt in buzz. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers and the run's own cool-offs still apply.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/followUps" }), getGuide({ useCase: "twitter/getTheAction" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87, 94, 104, 105, 107, 108, 109, 110, 111, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueAdd`

Add approved dms, replies or quotes to an account's queue, even while it runs: each is fitted between what is already planned, at least the queue's minGap apart, and sent through the same run and the account's one X session.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue add <queue.json> --targets <targets.json> --by <who> [--action reply|quote|dm] [--window <2h|90m>] [--minGap <s>]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, cooling, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: a block or throttle cools off (15 min doubling to 4 h, or X's reset time, 24 h on the daily limit 344) and retries the post once at the end; a deleted post or replies off (385/433) is skipped; a dead session or 5 cool-offs in a row halts it and, with --alertChannel, tags matt in buzz. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers and the run's own cool-offs still apply.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/followUps" }), getGuide({ useCase: "twitter/getTheAction" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87, 94, 104, 105, 107, 108, 109, 110, 111, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueNudge`

Tell a running queue to send its next replies now.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue nudge <queue.json> [--replies <n>]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, cooling, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: a block or throttle cools off (15 min doubling to 4 h, or X's reset time, 24 h on the daily limit 344) and retries the post once at the end; a deleted post or replies off (385/433) is skipped; a dead session or 5 cool-offs in a row halts it and, with --alertChannel, tags matt in buzz. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers and the run's own cool-offs still apply.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87, 94, 104, 105, 107, 108, 109, 110, 111, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueEdit`

Put new copy on a pending or held queue item (redrafted from the person's full context), plan a held one again and approve the queue as it then stands.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue edit <queue.json> --n <n> --text "<new copy>" --by <who> [--window <30m>]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, cooling, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: a block or throttle cools off (15 min doubling to 4 h, or X's reset time, 24 h on the daily limit 344) and retries the post once at the end; a deleted post or replies off (385/433) is skipped; a dead session or 5 cool-offs in a row halts it and, with --alertChannel, tags matt in buzz. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers and the run's own cool-offs still apply.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/getTheAction" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87, 94, 104, 105, 107, 108, 109, 110, 111, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From AGENTS.md (`log://agents`). The newest rules are at the bottom of AGENTS.md and win.

**Rule 6.** 2026-10-18 · Processes that run over time are XState machines that can be started and watched from the CLI (`log watch`, `observability/trace`).

**Rule 8.** 2026-10-18 · Read-only on Facebook. Nothing is posted, edited or deleted unless matt asks for it.

**Rule 13.** 2026-10-18 · Twenty is the only place accounts and listings live: Facebook accounts are `socialAccounts` (platform FACEBOOK), listings are `agencyListings`. Never delete either: a banned or dead account keeps its record with its status, and its campaign listings get replacement accounts in the same country (`docs/accountsAndListings.md`). Fields are only ever added (`scripts/twenty/twentySetup.mjs`), never renamed or retyped, so the twitter-controller keeps working.

**Rule 26.** 2026-10-19 · matt: "I always want to see what is going on." Every process that runs over time writes a progress line per stage as it happens (never only at the end) and to a log file in its folder. Agents run long commands so the lines stream live (Claude Code: Monitor, never piped through `tail`/`head`).

**Rule 30.** 2026-10-19 · matt: "If I tell you to do something, do it completely." When matt gives a plan, it is carried out to the end in the same turn, not stopped to ask again or to say what won't be done. `log inspect start --now` (and `log connect --now`, and since 2026-10-19 `log publish --now`, matt: "run it now") skips rule 24's 10-minute gap (the 8 a day still holds) so a recording continues at once. Recording a sign-in or a checkpoint with `log inspect` (signIn, code, solve, click) is the intended work: it is how each state gets documented from rea. The run on 2026-10-19 was interrupted once because a snapshot printed the account's email and password; snapshots now redact every typed field value (`redact_fields`), and signIn/code read only the private login.json (rule 21), so no credential reaches any output.

**Rule 38.** 2026-10-19 · matt: never mention or discuss Meta's or Facebook's rules, terms, policies, eligibility or account ownership with him unless he raises them first. Research text that does is not his, and is never repeated to him. Top of this file.

**Rule 39.** 2026-10-19 · matt: "If I never mentioned it, if I never inferred it, if I never outlined it as an option, therefore it is not an option." Deep research prompts, searches, SubQ matrices, plans and write-ups use only what matt said, or clearly meant through a misspelling. Nothing added, nothing steered towards. Top of this file.

**Rule 40.** 2026-10-19 · matt: no physical options. He is in Vietnam with no physical access. Phones, SIMs, mini PCs, laptops, phone farms and home devices are never options unless he names them. In scope: hosted and cloud options, the tools he named and their competitors, and what our four projects already use.

**Rule 41.** 2026-10-19 · matt: "any time any task correlates to money, and I never say something, that means you shouldn't do what you think. You should do what I say." Paid work (deep research, SubQ, proxies, captcha, vendors) does exactly what he asked, nothing more. Ask before anything else.

**Rule 53.** 2026-10-20 · matt: when something has to be found (a group to join, a provider, a price, a fact), it comes from an external source, never from memory or a guess: search with TinyFish through treg (`treg call tinyfish.web.search`, `tinyfish.web.fetch`, free) as the basis for every lookup, and pull the actual candidates from it. A suggestion names where it came from (the page, the search), and a pick is one of what the search returned.

**Rule 63.** 2026-10-22 · matt: the platform comes first. Every command that acts on one platform is `log <platform> <command> …` (`log facebook warmup reel`, `log facebook join group`); there is no form without it. The poll is `log facebook poll <group> <account> <how long to poll>`. Old forms are refused with the form they became. This replaces rule 60's `log warmup <platform> <activity>` and settles issue #20. OpenMagpie's worker is `log facebook poll --request` (it was `read group --worker`), a read in the account's open browser. `bun run check:docs` refuses a usage line without the platform first. Top of this file; the table is `docs/commandNaming.md`.

**Rule 64.** 2026-10-22 · matt: the code is by platform first, as the commands are, "because each has different approaches": `src/<platform>/<area>/<domain>`. Facebook's groups are `src/facebook/group/{join,read,answer}` (were `src/group/…`, rule 45) and its warm-up `src/facebook/warmup/activities` and `src/facebook/warmup/stages` (were `src/warmup/facebook` and `src/warmup/facebookStages`, rule 49). What every platform's warm-up draws from stays shared: `src/warmup/persona`, `src/warmup/viewer`. Each area has an `index.ts` (`check:naming`). Top of this file.

**Rule 73.** 2026-10-23 · matt: "IT MUST ALWAYS READ THEM." The number one rule of the stack, above rule 30 and every other: Facebook's internal API answers are the decision-making factor of what and when something is relevant, and the deterministic factor of the system. Every browser step reads the internal API answers it triggers and the requests it sent, keeps them past the prune, and decides on them, never on a page loading, a timer or the step having run. The MCP instructions put it first. Inspect steps read theirs since rule 74, and every flow, warm-up and host step on AdsPower that makes a call since 2026-10-23; the Camoufox-only machines don't yet (#35). Top of this file.

**Rule 80.** 2026-10-25 · matt: X (Twitter) is log-cli's second platform, built around a vendored client the way Facebook's direct API is built around fbk: twikit (`vendor/twikit`, unclecode's fork) and twitter-controller (`vendor/twitterController`, the code being ported). Its commands are `log twitter <command>` (`src/twitter/<area>/<domain>`, `python/twitterApi/engine.py`), declared `directApiOnly` in `DIRECT_ROUTES`. matt: "No: X accounts call X directly as the controller does today": no proxy is required or used for an X account, and rule 12 stays Facebook's. X's own answer decides (`socialAccounts.sessionState`: loggedIn, loggedOut, restricted), each account has its own governor under `~/.logCli/twitter/<account>`, and X's refreshed cookies are merged back into the row. Discovery stays treg's (rule 53). First command: `log twitter session check`. Plan: `docs/twitterPlatform.md`.

**Rule 81.** 2026-10-25 · matt: we own `vendor/twikit` and keep it up to date ourselves, since nobody upstream maintains it. Its HTTP transport is curl_cffi, the way `vendor/fbk` does it, never httpx: `self.http` is a curl_cffi `AsyncSession` pinned to one impersonation target (`IMPERSONATE`, `safari17_0`, matching twikit's Safari user agent), redirects not followed (as httpx did), the proxy kept in the session's `proxies`, media chunks sent as a `CurlMime`. Only the transport changed. `python/checks/twikitTransport.py` finds every httpx touchpoint by syntax tree (`--map`), rewrites the ones with a curl_cffi equivalent (`--apply`) and refuses any left (`--check`, `bun run check:twikitTransport`, pre-commit and pre-push); `vendor/twikit/tests/test_transport.py` holds the behaviour.

**Rule 86.** 2026-10-26 · matt: "if I say to do something it can force past it." An X send can go past the account's governor (its pause after a block, its hourly, daily and write caps) when matt says so: `--force` on `log twitter reply|quote|like|dm` and `log twitter queue run` (MCP `force`). Only for that call or that run, only when matt asked; never by default. X's own answer still decides (rule 73) and the queue's own cool-offs still apply. The answer says what it went past (`forcedPast`). The governor still counts the request.

**Rule 87.** 2026-10-26 · matt: a cold dm never goes to someone he has already spoken to. X's newer encrypted Chat is a separate inbox that `log twitter dms` (twikit's legacy `dm/inbox_initial_state`) can't see, so a "never messaged" filter built on it is wrong: on 2026-10-26 a 40-person treg dm run reached 7 people matt already knew. `log twitter queue check` on a dm queue now reads the account's own X Chat inbox (`api.x.com/graphql` GetInitialXChatPageQuery, then paged with GetInboxPageRequestQuery; the account's session, no PIN, who and when are readable, the text isn't) and drops (status skipped, `priorConversation`) every pending dm whose recipient the account already has a conversation with. `--skipXChatCheck` bypasses it only when matt asks. The X Chat reads live in `vendor/twikit` (rule 81: `client.get_xchat_conversations()`, endpoints in `twikit/client/gql.py`), so the knowledge is in the client, not hand-rolled; the engine action `xchatContacts` (`python/twitterApi/engine.py`) calls it, read-only. `docs/platforms/x/xchat` / `RESEARCH/X_CHAT_ENCRYPTED_INBOX_API_2026-10-26.md`.

**Rule 94.** 2026-10-29 · matt: "whatever you did in such quick succession lead to my account getting disabled, never do that again." Never act on an account in quick succession. What happened (matt's Discord, `sourcedandsoldtothehighestbidder`, 2026-10-29 00:47-01:00 UTC): in about 13 minutes an agent replied in 3 chats, read 1,400 messages from a server (Finn Automated) with a scratch script that went around log-cli (`.scratch/finn/dc.ts`: its own fetch to `discord.com/api/v9` with the session token, pages back to back, retrying straight through 429s), pulled the account's relationships, then opened new DMs to strangers from that server 30 s apart. Discord disabled the account. From now on: - Every call to a platform goes through log-cli's own commands and their governor. Never a hand-rolled script with an account's token or cookies. - A 429 or a failed send stops the run. It is never retried through, and the next action waits for matt. - Reading a server, group or member list in bulk is its own session. It never runs in the same session as sending. - Cold DMs to people the account has never talked to go out at most a few a day, minutes apart, never back to back. Each new DM channel opened counts as a write. - After a block, disable, captcha or cooldown, nothing resumes on that account until matt says so.

**Rule 98.** 2026-10-31 · matt: "So the opener always relevant. Don't just go in for the jugular. Go in with the opener." A first message to someone matt has never talked with is the opener and nothing else: about them and something they posted (or reposted, or that they reposted him), always relevant, and never the ask: no pitch, no "you using treg yet", no call, no link to his own stuff. The ask waits until they have answered. `log voice` fails a first message with an ask in it (`openerOnly`, `src/twitter/copy/voice`), and someone with nothing relevant to open on isn't messaged yet. `docs/useCases/twitter/engagerDms.md`, `networkMaxing.md`, `GUIDES/MATT_WRITING_STYLE.md`.

**Rule 104.** 2026-11-01 · matt: "the timing stuff there i saw you hand rolled the outbound stuff when it should be queued and it has to have random intervals, but the bundle itself actually reveals more information". On 2026-11-01 matthewsoldit got a soft block, then X's 226 ("looks automated") on a reply. The live log showed 8 thread reads fired in 0.2 s by two parallel helpers while sends went out from a hand-written loop, and every `log twitter` call was a fresh client that loaded x.com's home page and its signer before acting, so a 3-line dm was 3 cold starts in 9 s. X's own web client (`sign.o` in its x-web bundle, read 2026-11-01) loads the page once and signs every call from it. From now on: more than one send goes through the queue (`log twitter queue build|plan|run`, random times), never a hand-rolled loop and never helpers reading or sending on one account in parallel. The X engine takes one call per account at a time (`engine.lock`, refused with `accountBusy` after 15 min), waits 4 to 11 s after the last call, and keeps the transaction key in `clientTransaction.json` for 3 hours (`python/twitterApi/engine.py`, `vendor/twikit` `ClientTransaction.state` and `restore`).

**Rule 105.** 2026-11-01 · matt: "we cannot be opening multiple sessions there, that defeats the core purpose of what we use this tool for ... it should always be one, and then it needs to loudly create issues". An X account has one session, always. Every X call (CLI, MCP, hooks, the queue, the X Chat watch) goes through the account's one engine host (`python/twitterApi/host.py`, started on the first call, closed after 30 idle minutes or when the engine code changes): one twikit client, one connection, one cookie jar and one transaction key, the way X's own web app keeps one page and signs every call from it (x-web `startup-dynamic`, read with rea 2026-11-01). A second host can't start (`host.lock`); a call that can't reach the host is refused with `xSessionHostDown` and sends nothing, never falls back to a session of its own. The hook's account line shows the open session (pid, since, calls). `LOG_TWITTER_HOST=inline` runs the old way, for tests only.

**Rule 107.** 2026-11-01 · matt: "the queue connects to the one process, and it can do these at the same time, yet it's only on one". An account has one queue, and everything it sends goes into it: the dms, the reply-guy replies and the answers to people who message, together (each item keeps its own action). `log twitter queue add <queue> --targets <file> --action dm|reply|quote --by <who>` puts more in, even while it runs: the run takes them in as it waits and fits each one between what is planned, at least the queue's minGap apart, and one due sooner than the send it waits on goes first. `queue run --keepOpen` keeps the run going once it has sent everything, taking in what is added, until it is cancelled. So one run sends all of an account's work through its one X session (rule 105), never a second queue or run beside it. `src/twitter/queue` (`addToQueue`, `fitTimes`, `takeIncoming`, `mergeAdded`).

**Rule 108.** 2026-11-01 · matt: "if something doesn't seem to be working, you need to fix it", "make sure it's always up to date", and "if someone responds to me ... you have full authority to be able to send a follow-up message to them if it is in the context of the right thing to do with that said conversation". Three things: - **Fix it, don't report it.** Something broken is never told to matt as a fact and left. Find the cause and fix it in the same turn. Only when the fix needs something from him, say exactly what (a restart, a login, a key, a yes), and say that first. - **Nothing runs stale.** The inbox hook runs a silent cleanup on every event: a queue lock whose run died is cleared (and `queue run`, `add` and `nudge` take it over themselves), and an inbox watcher started before the newest code is stopped and started again (`stopStaleWatchers`, `clearDeadQueueLocks`, `src/inbox/watch`). An X session host closes when any of its code changes (`python/twitterApi`, `python/platformKit`, `vendor/twikit`), even while an X Chat watch is open on it, so the next call runs the new code. A read receipt X Chat can't verify is a read marker, never a message (`unopened_of`, `vendor/twikit`). - **Answer straight away.** When someone answers matt, a reply that answers what they said and fits that conversation is drafted, gated and sent at once, then matt is told what they said and what went out. Only a meeting, a promise, a price or money, or a conversation that can't be placed waits for him. Hook times are in matt's own clock.

**Rule 109.** 2026-11-01 · matt: "before you do an action with someone, you need to figure out the context of that person ... if they liked something, if they commented on something, if they replied to them recently, if I send them a message outside of the tool". Full context at the time of sending, every time, through the tool: - **Before drafting,** `log twitter dms --with <handle>` (MCP `twitterDms` { with }) gives the whole thread, read from X so it holds what matt sent from anywhere, and what that person did on the account's posts (likes, retweets, replies with their words, quotes, mentions, follows), from a fresh notifications read (`activityOf`, `src/twitter/dm/person`). Someone who already did the action is thanked for it, never asked for it. - **Right before each send,** the queue run reads both again and holds the item (status `held`, `heldFor` saying what changed) when anything happened since it was drafted (`draftedAt`): a message either way, a like, retweet, reply, quote, mention or follow (`contextChangesSince`, `contextChanged` in `src/twitter/queue/run`). - **A held item** is redrafted from the new context, gated, and put back with `log twitter queue edit <queue> --n --text --by` (MCP `twitterQueueEdit`). A queue file is never edited by hand, and nothing is sent around the queue to get past a hold (rule 106).

**Rule 110.** 2026-11-02 · matt: "we need to be faster with the mcp commands ... why is it taking so long for something which is not even something that should take long". Reads on an X account are spaced 0.8 to 2.5 s after the last call (`READ_SPACING_SECONDS`: inbox, a person's thread, notifications and their pages, follows, followers), the way X's own app fires reads back to back when a screen opens; only sends keep rule 104's 4 to 11 s (`SPACING_SECONDS`). Still one call per account at a time through its one session (rules 104, 105). Reading a person's full context (rule 109) pulls notifications only when they weren't synced in the last 2 minutes (`notificationsFresh`). A queue run never sends two things closer than its minGap, and items added to it keep that gap.

**Rule 111.** 2026-11-02 · matt: find GitHub repos "good for claude watermarking ... so we're able to pass it through context into the sends so that we can see how likely it is to be watermarked". Claude's own watermark is statistical (word choice under a secret key) and Anthropic's text detector is private preview, so no public repo can score it (`RESEARCH/CLAUDE_WATERMARK_REPOS_2026_11_02.md`). What can be read is what AI chat interfaces leave in text: `OfirYC/claude-watermark-checker` is vendored at `vendor/claudeArtifactDetector` (MIT, no dependencies) and every send's copy is read by it (`watermarkReadingOf`, `src/twitter/copy/watermark`): `clean`, `stylistic` (curly quotes, em dashes) or `artifacts` (zero-width or other hidden characters, odd spaces, pasted Claude HTML), with `statistical: unknown` always said. `planSend` refuses a send with artifacts (`aiArtifacts`) and carries the reading in its plan; `log voice` shows it and fails a draft with artifacts; a direct send and each queue send log it.

**Rule 112.** 2026-11-02 · matt: "there is definitely a dictionary of the common phrases which we can then have a p99 p50 search across to basically see and match the likelihood of this here to the common AI phrase ... use tbhb/vale-ai-tells". The voice gate also reads a draft for AI phrasing. The lists live in `vendor/aiTells` (`SOURCES.md`): tbhb/vale-ai-tells first (its 130 rules run on the draft exactly as Vale would), then FeedHive/ai-slop-detector, SanderFrentz/ai-vocabulary, SicariusSicariiStuff/SLOP_Detector, real AI-written samples, and fsu-nlp/lexa-index's words Claude and GPT overuse. `log voice aiIndex` embeds every literal phrase with Jina (`jina-embeddings-v3`, `JINA_API_KEY` in `.env.local`) and measures matt's own replies from the voice index against them: his p50 and p99 closeness, and the vale rules he uses himself in over 2% of his messages, which are muted. Each draft is cut into lines and word windows, every chunk's closest AI phrase found by cosine, the closest reranked with `jina-reranker-v2-base-multilingual`, and the draft fails when a vale rule hits or it sits closer to AI phrasing than matt's own p99. `src/voice/aiTells`.
