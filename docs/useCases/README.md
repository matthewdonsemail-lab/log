# Use cases

What log-cli is built to do, one page each, by platform. Each page gives the idea, the steps in order, the command and MCP tool for every step, what decides that a step worked, and the lessons that shaped it. They're here so anyone can see the parts and put them together for their own idea. Every page can be run from a fresh context: say "go on <the page>" and what the round is for.

| Platform | Use case | What it does |
| --- | --- | --- |
| X | [All X use cases, and the parts they share](twitter/README.md) | start here for anything on X: the queue, the rules, and how to run a page from a fresh context |
| X | [Recruiting on X with a reply queue](twitter/recruiting.md) | finds people posting that they want work, replies to each in their language, sent slowly after you approve |
| X | [Replying to everyone posting about one topic](twitter/topicReplies.md) | one reply per person about their own post, backed by facts you can stand behind |
| X | [Answering the people who engaged with your posts](twitter/engagementReplies.md) | answers commenters under your post, or on a fresh post of theirs |
| X | [Seeing who engaged with your posts](twitter/notifications.md) | every like, repost, reply, quote and follow from the account's notifications, new and historical, kept locally, sends nothing |
| X | [DMing the people who liked or reposted your post](twitter/engagerDms.md) | ranks the likers, you pick, one opening line each, sent as a dm queue |
| X | [Reading the DM inbox](twitter/dmInbox.md) | who is waiting on you and what they asked, sends nothing |
| X | [Affiliate marketing through your DMs](twitter/affiliateMarketing.md) | follows up every conversation about a tool you use, with your affiliate credit where it helps, and books the partner call |
| X | [Checking who really follows you](twitter/followers.md) | a live follows check before anyone is called a follower |
| X | [Finding who needs something from you, or who matters](twitter/whoNeedsYou.md) | reads every conversation for what it's about and sorts people by need, importance and how close to money, sends nothing |
| X | [Following up in your own voice](twitter/followUps.md) | drafts each follow-up from how you write to that person, gates it, and sends one message per line after you say yes |
| X | [Network maxing: grow the network, the niche map](twitter/networkMaxing.md) | gets to know everyone who messaged and new people from the niche map, each conversation about them and what they're doing, never a pitch |
| X | [Collab maxxing: turn open conversations into collabs](twitter/collabMaxxing.md) | turns the people already talking to the owner, and the missed openings, into collabs: scope, position the open-source collab, then the small ask, with money always the owner's call |
| X | [A new region of the niche map, then outbound to it](twitter/nicheMapRegion.md) | adds a new world to the niche map, runs it through the pipeline, then opens on the warmest of it |
| X | [Getting people to do the thing](twitter/getTheAction.md) | explains each conversation in a line, then a reply that answers them and asks for the one action (retweet, like, try it) |
| Facebook | [From accounts to live Marketplace listings](facebook/marketplaceListings.md) | one local profile per town, each posting a listing, clicks counted into Twenty |
| Facebook | [Listening to local Facebook groups](facebook/groups.md) | joins local groups and passes the posts asking for the service to Twenty |
| Discord | [Reading a Discord group chat without Twenty](discord/groupChatRead.md) | catches up on a group over the last few hours with a local account, sends nothing |
| Discord | [Replying with a meme in a Discord chat](discord/memeReply.md) | reads the chat, finds a Memelord meme that fits the moment, gates it and sends it inline |
| Slack | [Reading and answering a Slack DM](slack/dmReply.md) | finds the chat by who it is with, reads it, drafts in matt's voice, gates it and sends it one line at a time |
| Instagram | [Reading and answering an Instagram DM](instagram/dmReply.md) | reads the thread, drafts in matt's voice or picks a meme, gates it and sends it through the engine, never the browser |
| Every chat | [Reacting to a message](inbox/reactions.md) | reacts with an emoji on X, Discord, Slack or Instagram through the platform's own engine, claimed and counted as a write |
| Every chat | [Sending a voice note](inbox/voiceNote.md) | only when matt asks: his words said in his cloned voice and sent as Discord's, Instagram's or Slack's own voice note, gated and claimed like a send |
| Instagram | [Bringing a new platform up, then vendoring its client](instagram/newPlatform.md) | makes the platform, opens it in the account's browser to sign in, reads its client's calls with rea, then vendors the GitHub client that speaks them |

## The parts every use case is built from

- **An account in Twenty** (`socialAccounts`): its home, its session, its status. Or a local account in `~/.logCli/localAccounts.json` (`log localAccount add`), which wins over a Twenty row of the same name; `LOG_ACCOUNTS=local` leaves Twenty out.
- **An engine:** the direct API where there is one (twikit for X, fbk for Facebook reads), the account's own browser otherwise. The [reference](../reference.md)'s Engines section says which command uses which.
- **The platform's own answer decides:** every step reads what the platform sent back, never the screen or a timer.
- **A dry run first:** anything that acts on a platform does nothing without `--live`, and over MCP it is a separate `…Live` tool that needs `confirmLive`.
- **Pacing:** each account has its own governor, local hours and limits.

A new use case gets its own page here, under its platform: `docs/useCases/<platform>/<useCase>.md`. The log MCP serves each page as `getGuide({ useCase: "<platform>/<useCase>" })`, names it on every tool the page names, and the pre-commit review asks SubQ whether a session left a page stale or work uncovered ([MCP server](../specs/mcpServer.md)). Pages describe the method, never the owner's own accounts, people, prices, links or files: examples use placeholders like `<account>`, `<role link>` and `@someone`.
