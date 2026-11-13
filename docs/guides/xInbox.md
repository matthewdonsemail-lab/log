# xInbox

Reading an X account's DMs and X Chat as one inbox, synced by sequence id, and watching X Chat live.

Load next, when the work needs it: getGuide({ topic: "inbox" }) (Every platform's chats as one inbox: who is waiting on a reply, claiming a chat before acting in it, releasing it, and the log of every action taken); getGuide({ topic: "xSending" }) (Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, lists, queues and voice notes).

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "inbox/bossMaxxing" })` | Bossmaxxing: giving out tasks to the team | "bossmaxxing", "give out the tasks", "send <person> the task in <group> and tag them", "tell <person> about everything I researched and give them an outline", "triage the jobs across the team", "walk <person> through setting up <tool>", "help <person> get set up like we did with <other person>" |
| `getGuide({ useCase: "inbox/reaLooksmaxxing" })` | /rea-looksmaxxing: moneymaxx like a creator | "/rea-looksmaxxing how clavicular gets paid", "moneymaxx like <creator>", "how does <creator> get paid" |
| `getGuide({ useCase: "inbox/reactions" })` | Reacting to a message | "react to that", "heart his message", "put a 😂 on what she said", "send a reaction to <person>" |
| `getGuide({ useCase: "inbox/scopeAJob" })` | Scoping a job out of someone in a DM | "probe <person> so we can scope out what the task is", "scope it out with him", "find out what he actually wants done", "go through and then scope it out". |
| `getGuide({ useCase: "inbox/showMe" })` | Showing it as a view: generative UI in the chat | "show me who has been messaging me", "make a report of my DMs", "chart of who messages me most", "a dashboard of my inbox", "tell me about this person", "show me the people who messaged me this week", "visualise my DMs", "graph my messages" |
| `getGuide({ useCase: "inbox/triage" })` | Triage: scoping someone's job and handing it to whoever does it | "triage this", "scope it out with him and pass it to <person>", "inform <person> of what the job is and what he needs to do", "we've already scoped the work with the client, hand it over", "this is a triage job", "don't tell him anyone else is doing it" |
| `getGuide({ useCase: "twitter/affiliateMarketing" })` | Affiliate marketing through your DMs | "answer the people asking about <tool> in my dms with my affiliate link", "turn the dms about <tool> into affiliate money", "follow up everyone who asked about the tool", "get me onto <company>'s affiliate program and book the call". |
| `getGuide({ useCase: "twitter/collabMaxxing" })` | Collab maxxing: turn open conversations into collabs | "position a collab first then be like just a few quid so i can make a video about it", "start network maxxing and collab maxxing and trying to see what hes doing get him to reveal it all", "follow up on <someone> and the other people, small commitment from deals, not just new people but already open convos", "respond with the collabmaxxing", "selling the outcome", "let him name it", "check in with <someone> whats good there he is keen but isnt liquid", "just be nice to them there the poor people", "ask <someone> if i could become a contributor", "look on my twitter for missed opportunities". |
| `getGuide({ useCase: "twitter/dmInbox" })` | Reading the DM inbox: who is waiting on you | "who is waiting on me", "check my x dms", "go through my twitter inbox and tell me who needs a reply", "who am I waiting on in my dms". |
| `getGuide({ useCase: "twitter/engagerDms" })` | DMing the people who liked or reposted your post | "dm everyone who liked my post", "message the people who retweeted my tweet", "dm the likers and reposters of <post url> pitching <what>". |
| `getGuide({ useCase: "twitter/followUps" })` | Following up in your own voice | "follow up with these, not for anything in particular, just warming up the relationship", "say it was cool to meet him", "ask him for some advice on what he's doing", "take him up on the doc he offered". |
| `getGuide({ useCase: "twitter/getTheAction" })` | Getting people to do the thing: retweet, like, try it | "get me all them people who liked it ... yo cool to see that you liked that, would you give that a wee retweet", "notifications: people who like, comment, reply", "go through all the people there who need a message", "get them to retweet the thing", "would you do me a favour and give it a wee retweet", "I need them to retweet it so I can get some inbound leads", "I don't know what they're even talking about, explain the context", "make them do the action I need", "get the full context of everything on the account at the time of sending the message". |
| `getGuide({ useCase: "twitter/managerMaxxing" })` | Manager maxxing: the managers of the biggest Kick streamers | "manager maxxing", "find every kick streamer's manager on twitter", "reply guy the kick managers with memes", "the managers that engaged, send them their tweet, a message and a voice note". |
| `getGuide({ useCase: "twitter/networkMaxing" })` | Network maxing: grow the network, the niche map | "all them people messaging me, just message them something nice, get the ball moving with the networking", "we're not even trying to get anything out of these people, network max", "throw some new people in the mixer", "network max ... look at the nicheMap", "the whole point of it is to expand our network, which is the niche map", "follow them before you cold message them, and like the tweet you send them". |
| `getGuide({ useCase: "twitter/replyGuyFunnel" })` | Reply guy, then the DM, then the ask | "reply guy them first and foremost", "send a meme to the tweet then forward the tweet to them as an opener", "message the people who are new to following me", "get it in front of them", "funnel them into doing an action". |
| `getGuide({ useCase: "twitter/whoNeedsYou" })` | Finding who needs something from you, or who matters | "look through my messages and find someone who clearly needs something off me", "summarise everything on my twitter, how likely is it we make money", "who's worth following up". |
| `getGuide({ useCase: "web/competitorTraffic" })` | Competitor traffic: finding how to rank on your competitors' names | "find out all of our competitors", "what are we lacking", "go through the bhw mcp and see what they're saying", "compare this month to last month", "find who in my messages has a website for a backlink", "competitor pages that backlink to us", "make affiliate money through it", "run it through subq matrices", "do some deeper research" |

## The tools in this guide

Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.

| Tool | What it does | Usage |
|---|---|---|
| `twitterDms` | Read an X account's direct messages, newest conversations first… | `log twitter dms --account <accountName> [--limit <n>] [--waiting] [--with <handle>] [--conversation <id>] [--full] [--force] [--json]` |

## The work, step by step: xchatReplies

From `skills/xchatReplies/SKILL.md`.

## xchatReplies

X's own chat app never polls: it holds one socket and X pushes every message
down it (`docs/platforms/x/xchat/live.md`, issue #68). log does the same, so
replies show up the second they land and no inbox read ever hits X's 429.

### Hard boundaries

1. **Never poll the inbox to find replies.** The inbox hook keeps
   `log twitter chat watch --inbox` running per signed-in X account. Read a
   thread only to answer it.
2. **Claim the chat before drafting** (rule 133): `log inbox claim --platform
   twitter --account <a> --chat <conversation id> --event <event id>` (MCP
   `inboxClaim`), and read `log inbox actions --chat <id>` to see what was
   already done there. Another session holding it means leave it; the send
   releases the claim.
3. **Read everything with the person first:** `log twitter dms --account
   <a> --with <handle>` (the old DM thread and X Chat are one conversation,
   rule 89).
3. **Draft from the owner's guide, with the owner's facts only.** Read
   `C:/Users/tester/.buzz/GUIDES/MATT_WRITING_STYLE.md` before drafting. Lowercase,
   no commas or full stops, the owner's words, almost never end on a question, no
   praise-then-pitch, nothing the owner didn't say (rules 39-41).
4. **Gate every draft:** `log voice --to <handle> --text "<draft>"
   --context "<what they said>"`. Rewrite until it says PASS.
5. **Show the owner and send only when the owner says**, unless the owner has handed you the
   conversation (2026-10-28: "let the ai take over the conversation"). Then
   gate each reply and send it, and stop the moment the owner says it's over.

### The routine

```bash
## who wrote: the hook says it, pushed by X. To watch by hand:
log twitter chat watch --account matthewsoldit --seconds 600
## read them
log twitter dms --account matthewsoldit --with <handle>
## gate the draft
log voice --to <handle> --text "<draft>" --context "<what they said>"
## send, once the owner says
log twitter dm --account matthewsoldit --userId <id> --text "<draft>" --approvedBy <owner> --live
```

### When it goes wrong

- `(could not open: … no matching key found …)`: the conversation's key
  wasn't primed. The watch re-reads the newest inbox page once and retries;
  if it still fails, restart the watch (it primes every key at start).
- `socket closed` / `connectFailed`: the watch takes a new token and
  reconnects on its own (2 s, doubling to 60 s).
- Nothing arriving: check `~/.logCli/inbox/twitter/<a>/watch.log` and
  `watch.pid`; delete the pid file and the next hook starts a fresh watch.
- X changed its code: re-read it with rea, the steps are in
  `docs/platforms/x/xchat/live.md`.

## The rules these tools fall under

Each by its number and first line. The full text is in AGENTS.md (`log://agents`); the core rules are in full in `getGuide({ topic: "logMcpInstructions" })`.

- **Rule 30.** Complete the authorized task.
- **Rule 38.** Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless the owner raises them.
- **Rule 39.** Use only the scope, options and intent the owner stated or implied.
- **Rule 40.** Do not propose physical infrastructure unless the owner asks.
- **Rule 41.** Paid work must stay within the authorized task and spend.
- **Rule 73.** For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence.
- **Rule 89.** Find conversational context by scoped search and existing private records.
- **Rule 94.** Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies.
- **Rule 105.** One platform/account owns one continuous engine session and push connection.
- **Rule 109.** Read the full relevant chat and current private context before drafting or sending.
- **Rule 138.** Media and voice-note context uses the existing private media descriptions and transcripts.
