# xSending

Sending as an X account: dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send.

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
| `getGuide({ useCase: "twitter/networkMaxing" })` | Network maxing: warm everyone up, then bring new people in | "all them people messaging me, just message them something nice, get the ball moving with the networking", "we're not even trying to get anything out of these people, network max", "throw some new people in the mixer", "follow them before you cold message them, and like the tweet you send them". |
| `getGuide({ useCase: "twitter/recruiting" })` | Recruiting on X with a reply queue | see the page |
| `getGuide({ useCase: "twitter/topicReplies" })` | Replying to everyone posting about one topic | see the page |

## The tools in this guide

| Tool | What it does |
|---|---|
| `voice` | Gate a draft against matt's own writing guide with SubQ before it is… |
| `voiceIndex` | Build matt's voice per chat and person from the conversations log… |
| `twitterReply` | Reply to one post on X with approved copy, on the direct-API engine |
| `twitterReplyLive` | Reply to one post on X with approved copy, on the…, live on X |
| `twitterQuote` | Quote one post on X with approved copy, on the direct-API engine |
| `twitterQuoteLive` | Quote one post on X with approved copy, on the…, live on X |
| `twitterLike` | Like one post on X, on the direct-API engine |
| `twitterLikeLive` | Like one post on X, on the direct-API engine, live on X |
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
| `twitterQueueNudge` | Tell a running queue to send its next replies now |

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
| Save them, checked with X first | `bun bin/log.ts twitter cookies save --account <handle> [--style house] [--name "<label>"]` in a terminal (a masked Clack prompt; never a flag, never over MCP) | Twenty `socialAccounts`: a TWITTER row with `accountName` = handle, `cookies`, `sessionState`, `copyStyle` |
| Check it any time | `log twitter session check --account <handle>` (MCP `twitterSession`) | `sessionState` in Twenty, and the governor in `~/.logCli/twitter/<handle>` |
| X Chat PIN, to read encrypted DMs | `bun bin/log.ts twitter chat pin --account <handle>` in a terminal | `socialAccounts.messengerPin` |

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

log-cli doesn't post originals yet. They go out by hand from the X app or
web, or through Postiz once it is signed in. Everything after the post goes
through log-cli: the replies to its comments, the quote, and the DMs to the
people who liked it.

### 3. Reaching people: `log twitter`

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
- **Pacing:** 40 writes a day per account, kept by the account's governor.
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
Gates a draft before anything is sent as matt (his rule, 2026-10-27): SubQ reads it against matt's own writing guide (GUIDES/MATT_WRITING_STYLE.md, built from 256 of his tweets) and the dms he wrote himself, and answers whether it sounds like he typed it (voice, 0.8 to pass), whether it answers what they said (--context) or something specific about them, and whether it reads like a mate texting. A phrase matt never says (hit home, big swing, spot on, felt that…) fails it outright. Sends nothing.
--with names the chat or person the way matt says it ("the log group", "jilly", a handle): log finds matt's real replies to things like --context, from that chat first, then that person, then that platform, then anywhere, and how he writes there (length, case, punctuation, his words). Without --text it shows them to draft from; with --text the gate also asks whether the draft reads like his real replies there (toThem, 0.7 to pass).
Exit 0 when it passes, 1 when it doesn't: rewrite and gate again.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/followUps" }), getGuide({ useCase: "twitter/networkMaxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 30, 39, 41, 63, 64, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `voiceIndex`

Build matt's voice per chat and person from the conversations log search saved.
Gate a draft against matt's own writing guide with SubQ before anything is sent as him, sending nothing
log voice index [--json]   (builds matt's voice from every conversation log search already saved, reading nothing new: each of his replies paired with what was said just before it, embedded with log search's own model, and a profile per chat, person and platform counted from his own messages)
Gates a draft before anything is sent as matt (his rule, 2026-10-27): SubQ reads it against matt's own writing guide (GUIDES/MATT_WRITING_STYLE.md, built from 256 of his tweets) and the dms he wrote himself, and answers whether it sounds like he typed it (voice, 0.8 to pass), whether it answers what they said (--context) or something specific about them, and whether it reads like a mate texting. A phrase matt never says (hit home, big swing, spot on, felt that…) fails it outright. Sends nothing.
--with names the chat or person the way matt says it ("the log group", "jilly", a handle): log finds matt's real replies to things like --context, from that chat first, then that person, then that platform, then anywhere, and how he writes there (length, case, punctuation, his words). Without --text it shows them to draft from; with --text the gate also asks whether the draft reads like his real replies there (toThem, 0.7 to pass).
Exit 0 when it passes, 1 when it doesn't: rewrite and gate again.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 30, 39, 41, 63, 64, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterReply`

Reply to one post on X with approved copy, on the direct-API engine; a dry run unless --live.
Reply to one post on X with approved copy, on the direct-API engine; a dry run unless --live
log twitter reply --account <accountName> --tweet <postUrl> --text "<copy>" [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]
Reply to one post on X with approved copy, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (40 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's create answer decides: a tweet id is sent, an empty result is a drop (nothing posted, usually the author's reply limits). Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole. What acts on X is `twitterReplyLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterReplyLive`

Reply to one post on X with approved copy, on the direct-API engine; a dry run unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Reply to one post on X with approved copy, on the direct-API engine; a dry run unless --live
log twitter reply --account <accountName> --tweet <postUrl> --text "<copy>" [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]
Reply to one post on X with approved copy, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (40 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's create answer decides: a tweet id is sent, an empty result is a drop (nothing posted, usually the author's reply limits). Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQuote`

Quote one post on X with approved copy, on the direct-API engine; a dry run unless --live.
Quote one post on X with approved copy, on the direct-API engine; a dry run unless --live
log twitter quote --account <accountName> --tweet <postUrl> --text "<copy>" [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]
Quote one post on X with approved copy, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (40 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's create answer decides: a tweet id is sent, an empty result is a drop. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole. What acts on X is `twitterQuoteLive`.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQuoteLive`

Quote one post on X with approved copy, on the direct-API engine; a dry run unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Quote one post on X with approved copy, on the direct-API engine; a dry run unless --live
log twitter quote --account <accountName> --tweet <postUrl> --text "<copy>" [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]
Quote one post on X with approved copy, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (40 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's create answer decides: a tweet id is sent, an empty result is a drop. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterLike`

Like one post on X, on the direct-API engine; a dry run unless --live.
Like one post on X, on the direct-API engine; a dry run unless --live
log twitter like --account <accountName> --tweet <postUrl> [--approvedBy <who>] [--force] [--live] [--json]
Like one post on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (40 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's favorite answer decides: Done (or already liked, code 139) is sent. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole. What acts on X is `twitterLikeLive`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/networkMaxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterLikeLive`

Like one post on X, on the direct-API engine; a dry run unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Like one post on X, on the direct-API engine; a dry run unless --live
log twitter like --account <accountName> --tweet <postUrl> [--approvedBy <who>] [--force] [--live] [--json]
Like one post on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (40 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's favorite answer decides: Done (or already liked, code 139) is sent. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/networkMaxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterFollow`

Follow one person on X, on the direct-API engine; a dry run unless --live.
Follow one person on X, on the direct-API engine; a dry run unless --live
log twitter follow --account <accountName> --userId <id> [--approvedBy <who>] [--force] [--live] [--json]
Follow one person on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (40 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's follow answer decides: the followed user back is sent, already following is sent too. Follow before a cold dm: nobody gets a cold message from an account that doesn't follow them. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole. What acts on X is `twitterFollowLive`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/networkMaxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterFollowLive`

Follow one person on X, on the direct-API engine; a dry run unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Follow one person on X, on the direct-API engine; a dry run unless --live
log twitter follow --account <accountName> --userId <id> [--approvedBy <who>] [--force] [--live] [--json]
Follow one person on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (40 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's follow answer decides: the followed user back is sent, already following is sent too. Follow before a cold dm: nobody gets a cold message from an account that doesn't follow them. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/networkMaxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterDm`

Send one approved direct message on X, on the direct-API engine; a dry run unless --live.
Send one approved direct message on X, on the direct-API engine; a dry run unless --live
log twitter dm --account <accountName> --userId <id> --text "<copy>" [--approvedBy <who>] [--skipStyleCheck] [--asOne] [--force] [--live] [--json]
Send one approved direct message on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (40 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
A draft written on several lines goes out one message per line, and a one-line draft is split the way matt writes in that chat (log voice index), with his usual gap between them; --asOne sends it as one, only when matt asked (rule 90). X's answer decides: a conversation id is sent, none is a drop, and a drop stops the rest: what was sent stays sent, nothing is retried (rule 94). An old DM thread (<a>-<b>) and its X Chat thread (<a>:<b>) with one person are one conversation: X shows them in the same place, and a dm sent through the old DM API shows in their X Chat too. A sent answer is delivered whichever conversation id it names: never resend it and never call it the wrong inbox. A refusal before X is called (styleFailed, a dry run) sent nothing, so that dm is sent once its copy is fixed. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole. What acts on X is `twitterDmLive`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/affiliateMarketing" }), getGuide({ useCase: "twitter/dmInbox" }), getGuide({ useCase: "twitter/followUps" }), getGuide({ useCase: "twitter/networkMaxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterDmLive`

Send one approved direct message on X, on the direct-API engine; a dry run unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Send one approved direct message on X, on the direct-API engine; a dry run unless --live
log twitter dm --account <accountName> --userId <id> --text "<copy>" [--approvedBy <who>] [--skipStyleCheck] [--asOne] [--force] [--live] [--json]
Send one approved direct message on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (40 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
A draft written on several lines goes out one message per line, and a one-line draft is split the way matt writes in that chat (log voice index), with his usual gap between them; --asOne sends it as one, only when matt asked (rule 90). X's answer decides: a conversation id is sent, none is a drop, and a drop stops the rest: what was sent stays sent, nothing is retried (rule 94). An old DM thread (<a>-<b>) and its X Chat thread (<a>:<b>) with one person are one conversation: X shows them in the same place, and a dm sent through the old DM API shows in their X Chat too. A sent answer is delivered whichever conversation id it names: never resend it and never call it the wrong inbox. A refusal before X is called (styleFailed, a dry run) sent nothing, so that dm is sent once its copy is fixed. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/affiliateMarketing" }), getGuide({ useCase: "twitter/dmInbox" }), getGuide({ useCase: "twitter/followUps" }), getGuide({ useCase: "twitter/networkMaxing" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueBuild`

Build a queue file pairing each target with one unique approved line, sending nothing.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue build --targets <targets.json> [--variations <a.json,b.json>] --out <queue.json> --account <accountName> [--action reply|quote|dm] [--seed <n>]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now.
run walks the plan as an XState machine (planned, waiting, liking, replying, cooling, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: a block or throttle cools off (15 min doubling to 4 h, or X's reset time, 24 h on the daily limit 344) and retries the post once at the end; a deleted post or replies off (385/433) is skipped; a dead session or 5 cool-offs in a row halts it and, with --alertChannel, tags matt in buzz. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers and the run's own cool-offs still apply.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/engagementReplies" }), getGuide({ useCase: "twitter/engagerDms" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueShow`

Show a queue: who, which post, what copy, and its approval.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue show <queue.json> [--json]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now.
run walks the plan as an XState machine (planned, waiting, liking, replying, cooling, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: a block or throttle cools off (15 min doubling to 4 h, or X's reset time, 24 h on the daily limit 344) and retries the post once at the end; a deleted post or replies off (385/433) is skipped; a dead session or 5 cool-offs in a row halts it and, with --alertChannel, tags matt in buzz. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers and the run's own cool-offs still apply.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueCheck`

Check every pending item's target and house style; for a dm queue, read the account's X Chat inbox and drop anyone already in a conversation.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue check <queue.json> [--skipXChatCheck] [--json]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now.
run walks the plan as an XState machine (planned, waiting, liking, replying, cooling, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: a block or throttle cools off (15 min doubling to 4 h, or X's reset time, 24 h on the daily limit 344) and retries the post once at the end; a deleted post or replies off (385/433) is skipped; a dead session or 5 cool-offs in a row halts it and, with --alertChannel, tags matt in buzz. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers and the run's own cool-offs still apply.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/engagementReplies" }), getGuide({ useCase: "twitter/engagerDms" }), getGuide({ useCase: "twitter/recruiting" }), getGuide({ useCase: "twitter/topicReplies" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueStatus`

Count a queue's items by status.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue status <queue.json> [--json]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now.
run walks the plan as an XState machine (planned, waiting, liking, replying, cooling, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: a block or throttle cools off (15 min doubling to 4 h, or X's reset time, 24 h on the daily limit 344) and retries the post once at the end; a deleted post or replies off (385/433) is skipped; a dead session or 5 cool-offs in a row halts it and, with --alertChannel, tags matt in buzz. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers and the run's own cool-offs still apply.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/recruiting" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueApprove`

Record who approved the queue as it stands now.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue approve <queue.json> --by <who>
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now.
run walks the plan as an XState machine (planned, waiting, liking, replying, cooling, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: a block or throttle cools off (15 min doubling to 4 h, or X's reset time, 24 h on the daily limit 344) and retries the post once at the end; a deleted post or replies off (385/433) is skipped; a dead session or 5 cool-offs in a row halts it and, with --alertChannel, tags matt in buzz. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers and the run's own cool-offs still apply.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueuePlan`

Draw a random time for every like and reply inside a window, contacting nothing.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue plan <queue.json> --window <5h|90m> [--limit <n>] [--start <time>] [--minGap <s>] [--like] [--likeChance <0-1>]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now.
run walks the plan as an XState machine (planned, waiting, liking, replying, cooling, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: a block or throttle cools off (15 min doubling to 4 h, or X's reset time, 24 h on the daily limit 344) and retries the post once at the end; a deleted post or replies off (385/433) is skipped; a dead session or 5 cool-offs in a row halts it and, with --alertChannel, tags matt in buzz. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers and the run's own cool-offs still apply.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/topicReplies" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueRun`

Run a queue's plan as an XState machine; a dry run lists what it would send unless --live.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue run <queue.json> [--alertChannel <uuid>] [--alertReplyTo <eventId>] [--alertMention <hex,hex>] [--force] [--live]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now.
run walks the plan as an XState machine (planned, waiting, liking, replying, cooling, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: a block or throttle cools off (15 min doubling to 4 h, or X's reset time, 24 h on the daily limit 344) and retries the post once at the end; a deleted post or replies off (385/433) is skipped; a dead session or 5 cool-offs in a row halts it and, with --alertChannel, tags matt in buzz. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers and the run's own cool-offs still apply.
Fill the named fields; each value goes through whole. What acts on X is `twitterQueueRunLive`.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueRunLive`

Run a queue's plan as an XState machine; a dry run lists what it would send unless --live.
Live on X: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue run <queue.json> [--alertChannel <uuid>] [--alertReplyTo <eventId>] [--alertMention <hex,hex>] [--force] [--live]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now.
run walks the plan as an XState machine (planned, waiting, liking, replying, cooling, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: a block or throttle cools off (15 min doubling to 4 h, or X's reset time, 24 h on the daily limit 344) and retries the post once at the end; a deleted post or replies off (385/433) is skipped; a dead session or 5 cool-offs in a row halts it and, with --alertChannel, tags matt in buzz. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers and the run's own cool-offs still apply.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `twitterQueueNudge`

Tell a running queue to send its next replies now.
Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine
log twitter queue nudge <queue.json> [--replies <n>]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now.
run walks the plan as an XState machine (planned, waiting, liking, replying, cooling, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: a block or throttle cools off (15 min doubling to 4 h, or X's reset time, 24 h on the daily limit 344) and retries the post once at the end; a deleted post or replies off (385/433) is skipped; a dead session or 5 cool-offs in a row halts it and, with --alertChannel, tags matt in buzz. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers and the run's own cool-offs still apply.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "xSending" }) (Sending as an X account: dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send).
AGENTS.md (log://agents): rules 6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87, 94, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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
