# xAccount

An X account's session: saving and checking its cookies, who follows whom, and its notifications (who liked, reposted, replied to, quoted or followed it).

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "inbox/reaLooksmaxxing" })` | /rea-looksmaxxing: moneymaxx like a creator | "/rea-looksmaxxing how clavicular gets paid", "moneymaxx like <creator>", "how does <creator> get paid" |
| `getGuide({ useCase: "twitter/affiliateMarketing" })` | Affiliate marketing through your DMs | "answer the people asking about <tool> in my dms with my affiliate link", "turn the dms about <tool> into affiliate money", "follow up everyone who asked about the tool", "get me onto <company>'s affiliate program and book the call". |
| `getGuide({ useCase: "twitter/engagementReplies" })` | Answering the people who engaged with your posts | "reply to everyone who commented on my last tweet", "answer the comments on my post", "reply to the people who replied to my tweet with the follow-up link". |
| `getGuide({ useCase: "twitter/engagerDms" })` | DMing the people who liked or reposted your post | "dm everyone who liked my post", "message the people who retweeted my tweet", "dm the likers and reposters of <post url> pitching <what>". |
| `getGuide({ useCase: "twitter/followers" })` | Checking who really follows you | "does <someone> follow me", "check who really follows me on x", "is <someone> following me on twitter", "check these people follow me before the slide says so". |
| `getGuide({ useCase: "twitter/getTheAction" })` | Getting people to do the thing: retweet, like, try it | "get me all them people who liked it ... yo cool to see that you liked that, would you give that a wee retweet", "notifications: people who like, comment, reply", "go through all the people there who need a message", "get them to retweet the thing", "would you do me a favour and give it a wee retweet", "I need them to retweet it so I can get some inbound leads", "I don't know what they're even talking about, explain the context", "make them do the action I need", "get the full context of everything on the account at the time of sending the message". |
| `getGuide({ useCase: "twitter/managerMaxxing" })` | Manager maxxing: the managers of the biggest Kick streamers | "manager maxxing", "find every kick streamer's manager on twitter", "reply guy the kick managers with memes", "the managers that engaged, send them their tweet, a message and a voice note". |
| `getGuide({ useCase: "twitter/nicheMapRegion" })` | A new region of the niche map, then outbound to it | "for getting accepted into YC ... make a new area of the niche map through the systems we've already made ... the YC world and the funds' world, based on the 26 batch", "the YC stuff in and around the boat.dev people and the people involved in GTM tools", "pull all of my new followers ... set a budget of like 60$", "start with the 43", "not just treg but the actual index that we did already". |
| `getGuide({ useCase: "twitter/notifications" })` | Seeing who engaged with your posts | "check my x notifications", "who liked my tweet", "who engaged with my post since <date>", "pull my twitter notifications". |
| `getGuide({ useCase: "twitter/recruiting" })` | Recruiting on X with a reply queue | "recruit for the <role> role on x", "find people looking for work on twitter and reply with the job link", "hire a <role> through tweet replies". |
| `getGuide({ useCase: "twitter/replyGuyFunnel" })` | Reply guy, then the DM, then the ask | "reply guy them first and foremost", "send a meme to the tweet then forward the tweet to them as an opener", "message the people who are new to following me", "get it in front of them", "funnel them into doing an action". |
| `getGuide({ useCase: "twitter/topicReplies" })` | Replying to everyone posting about one topic | "reply to everyone tweeting about <topic>", "find everyone posting about <topic> on x and reply with my article", "reply to the people talking about <topic> with my video". |

## The tools in this guide

Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.

| Tool | What it does | Usage |
|---|---|---|
| `twitterSessionCheck` | Check that X still accepts one account's saved session, sending… | `log twitter session check --account <accountName> [--json]` |
| `twitterSessionWebClient` | Save X's signed-in web client | `log twitter session webClient --account <accountName> [--json]   (loads x.com/home through the account's one X session, as twikit already does to sign its calls, and saves the page and every script it lists from abs.twimg.com to ~/.logCli/twitter/<account>/webClient/<time>, reads spaced 0.8 to 2.5 s, so rea can read X's own signed-in client: what its composer sends; rule 105)` |
| `twitterFollows` | Read whether each handle follows the account and the account follows… | `log twitter follows --account <accountName> --handles <handle,handle…> [--json]` |
| `twitterFollowers` | Read an X account's own followers, newest first, sending nothing | `log twitter followers --account <accountName> [--limit <n>] [--json]` |
| `twitterNotifications` | Read who liked, reposted, replied to, quoted or followed an X… | `log twitter notifications --account <accountName> [--type likes\|reposts\|replies\|quotes\|follows\|all] [--since <date>] [--post <id\|url>] [--full] [--pages <n>] [--stored] [--limit <n>] [--json]` |

## The rules these tools fall under

Each by its number and first line. The full text is in AGENTS.md (`log://agents`); the core rules are in full in `getGuide({ topic: "logMcpInstructions" })`.

- **Rule 26.** Stream progress while work runs, one meaningful line per stage, with the run log retained.
- **Rule 30.** Complete the authorized task.
- **Rule 35.** Browser work uses one account browser through its active day, with actions as tabs/steps; close only for a logged lifecycle reason.
- **Rule 38.** Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless the owner raises them.
- **Rule 39.** Use only the scope, options and intent the owner stated or implied.
- **Rule 40.** Do not propose physical infrastructure unless the owner asks.
- **Rule 41.** Paid work must stay within the authorized task and spend.
- **Rule 53.** Verify current external facts from sources.
- **Rule 73.** For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence.
- **Rule 94.** Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies.
- **Rule 105.** One platform/account owns one continuous engine session and push connection.
