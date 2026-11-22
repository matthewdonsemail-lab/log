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
| Network | [Relationship state machine](network/relationshipMachine.md) | draws where you stand with someone, the route to them through people you know, or your whole network by state, each move labelled with its tool |
| Network | [Who to talk to next](network/whoToTalkTo.md) | asks the Relate graph who in your network to talk to next and why, then hands the picks to networkMaxing's first DMs |
| X | [Network maxing: grow the network, the niche map](twitter/networkMaxing.md) | gets to know everyone who messaged and new people from the niche map, each conversation about them and what they're doing, never a pitch |
| X | [Collab maxxing: turn open conversations into collabs](twitter/collabMaxxing.md) | turns the people already talking to the owner, and the missed openings, into collabs: scope, position the open-source collab, then the small ask, with money always the owner's call |
| X | [A new region of the niche map, then outbound to it](twitter/nicheMapRegion.md) | adds a new world to the niche map, runs it through the pipeline, then opens on the warmest of it |
| X | [Reply guy, then the DM, then the ask](twitter/replyGuyFunnel.md) | replies to each new person's post with a meme, opens a DM on that post, builds on what they say, then the ask, no two messages alike |
| X | [Getting people to do the thing](twitter/getTheAction.md) | explains each conversation in a line, then a reply that answers them and asks for the one action (retweet, like, try it) |
| Facebook | [From accounts to live Marketplace listings](facebook/marketplaceListings.md) | one local profile per town, each posting a listing, clicks counted into Twenty |
| Facebook | [Listening to local Facebook groups](facebook/groups.md) | joins local groups and passes the posts asking for the service to Twenty |
| Discord | [Reading a Discord group chat without Twenty](discord/groupChatRead.md) | catches up on a group over the last few hours with a local account, sends nothing |
| Discord | [Replying with a meme in a Discord chat](discord/memeReply.md) | reads the chat, finds a [Memelord](https://www.memelord.com/sign-up?ref=kfwut9wc) meme that fits the moment, gates it and sends it inline |
| Slack | [Reading and answering a Slack DM](slack/dmReply.md) | finds the chat by who it is with, reads it, drafts in the owner's voice, gates it and sends it one line at a time |
| Instagram | [Reading and answering an Instagram DM](instagram/dmReply.md) | reads the thread, drafts in the owner's voice or picks a meme, gates it and sends it through the engine, never the browser |
| LinkedIn | [Posting on LinkedIn, and liking or taking a post down](linkedin/posts.md) | posts text, an image or mentions as LinkedIn's own composer does, likes a post or deletes one of the account's, each after a dry run and the owner's yes |
| LinkedIn | [Growing a LinkedIn network and reading its inbox](linkedin/network.md) | invites the people LinkedIn suggests, one at a time and slowly, and reads the inbox and its conversations without marking them seen |
| Every chat | [Reacting to a message](inbox/reactions.md) | reacts with an emoji on X, Discord, Slack or Instagram through the platform's own engine, claimed and counted as a write |
| Every chat | [/rea-looksmaxxing: moneymaxx like a creator](inbox/reaLooksmaxxing.md) | finds a creator's most viral clips through [treg](https://treg.to/?ref=matthewdonse-aebsh), decodes the formula, posts it through your accounts and funnels the replies and DMs into your offer; also an installable skill |
| Web | [Competitor traffic: finding how to rank on your competitors' names](web/competitorTraffic.md) | what competitors rank for, their affiliate programmes, what BlackHatWorld says works this month, who in your DMs has a site to link from, then a SubQ-ranked order, all read-only |
| Every chat | [Bossmaxxing: giving out tasks to the team](inbox/bossMaxxing.md) | reads each person's chat, triages every job across the team, sends each task as a brief with a live monitor on, and walks people through setups one step at a time |
| Every chat | [Bots](people/bots.md) | asks each platform that keeps an automated flag for its own answer and records it, so a bot with an ordinary name leaves the network view while its own page still answers |
| Every chat | [Sending a voice note](inbox/voiceNote.md) | only when the owner asks: the owner's words said in the owner's cloned voice and sent as Discord's, Instagram's or Slack's own voice note, gated and claimed like a send |
| Every chat | [Showing it as a view: generative UI in the chat](inbox/showMe.md) | builds a view for the question (stats, charts, people, a page per person) from log.db and draws it in the chat, or as text where the host can't, sends nothing |
| Every platform | [Signing an account in: checking it, then the live browser](inbox/signIn.md) | checks the session through the platform's answer and, when it needs a person, opens the account's own browser, streamed live into the chat (MCP Apps hosts, Hermes Desktop) on your machine or a remote runtime |
| Instagram | [Bringing a new platform up, then vendoring its client](instagram/newPlatform.md) | makes the platform, opens it in the account's browser to sign in, reads its client's calls with rea, then vendors the GitHub client that speaks them |
| log itself | [Turning a hand-rolled one-off into a log tool](log/toolFromOneOff.md) | the hook labels a one-off data read or action and advises, never blocks; `toolScaffold` writes it as a command and MCP tool with its use case, reloaded and compared with the one-off before the commit |
| X | [Manager maxxing: the managers of the biggest Kick streamers](twitter/managerMaxxing.md) | the managers of the biggest Kick streamers: found on X, replied to for a few days, then a first DM to the ones who engaged |
| Discord | [Answering someone in a Discord DM or group DM](discord/channelReply.md) | answers what someone said to the account in a Discord DM or group DM, gated and sent after the owner's yes |
| Discord | [Replying in a Discord server channel](discord/serverReply.md) | answers a mention, a reply or a question in a channel of a server the owner is part of |
| Discord | [First DMs from a Discord channel](discord/coldOutbound.md) | messages the people who talked to the owner in a channel, one gated DM each, and sends a friend request when Discord won't open the DM |
| Discord | [Finding a conversation in a Discord server](discord/serverSearch.md) | finds what someone said in a server with Discord's own search, then reads around it, sends nothing |
| Discord | [Going through a Discord forum for posts worth answering](discord/forumPosts.md) | lists a server forum's posts and says which are worth answering and why, sends nothing |
| Reddit | [Contributor maxxing: finding talented builders through what they share](reddit/contributorMaxxing.md) | finds builders through the GitHub repos they post in a subreddit, ranked, reads only |
| TikTok | [Posting a video on TikTok, and deleting it](tiktok/post.md) | posts one video with a caption, or deletes one of the account's posts, on the direct-API engine |
| Every chat | [Triage: scoping someone's job and handing it to whoever does it](inbox/triage.md) | reads what someone needs built, gets the scope out of them and hands it to whoever does it |
| Every chat | [Scoping a job out of someone in a DM](inbox/scopeAJob.md) | gets the scope of a job out of someone in a DM |
| Every chat | [Working the warm people in your dms](inbox/warmPeople.md) | works the people already in the owner's DMs, by who they are and where they are |
| Every chat | [Someone's messages on every platform, found by name, newest first](inbox/saidBy.md) | someone's messages on every platform, found by name, newest first |
| Every chat | [Teaching log who your people are](inbox/labelQueue.md) | asks the owner about the chats the local labeller is least sure of, then trains on the answers |
| Every chat | [Do people answer what log sends?](inbox/outcomes.md) | compares how people answer what log sent with what the owner typed himself, reads only |
| Every chat | [Ignoring a server or a chat](inbox/ignoreServer.md) | stops the live push alerting on a server or chat; its messages are still stored |
| Every chat | [Quieting the live push](inbox/quietPush.md) | quiets the live push for as many minutes as the owner says |
| Every platform | [Resetting an account's governor count](inbox/governorReset.md) | puts an account's daily governor count back to 0 when the owner says so, kept as a log.db ledger row |
| log itself | [Moving accounts to another browser](log/browserMove.md) | moves accounts to another browser with their signed-in session, done when the platform says signed in |
| log itself | [Encrypted account store](log/secretStore.md) | shows what is sealed and what is still plain, and tells the owner when no recovery passphrase is set |
| log itself | [Local models](log/localModels.md) | shows which local models this release pins and fetches the missing ones after the owner's yes |
| log itself | [Tool health](log/toolHealth.md) | how log's own tools are doing from the calls log.db stores, with a fix for each flag, reads only |
| log itself | [Update log](log/updateLog.md) | updates log to the newest release after the owner's yes and picks up where it left off |

## The parts every use case is built from

- **An account in Twenty** (`socialAccounts`): its home, its session, its status. Or a local account in `~/.logCli/localAccounts.json` (`log localAccount add`), which wins over a Twenty row of the same name; `LOG_ACCOUNTS=local` leaves Twenty out.
- **An engine:** the direct API where there is one (twikit for X, fbk for Facebook reads), the account's own browser otherwise. The [reference](../reference.md)'s Engines section says which command uses which.
- **The platform's own answer decides:** every step reads what the platform sent back, never the screen or a timer.
- **A dry run first:** anything that acts on a platform does nothing without `--live`, and over MCP it is a separate `…Live` tool that needs `confirmLive`.
- **Pacing:** each account has its own governor, local hours and limits.

A new use case gets its own page here, under its platform: `docs/useCases/<platform>/<useCase>.md`. The log MCP serves each page as `getGuide({ useCase: "<platform>/<useCase>" })`, names it on every tool the page names, and the pre-commit review asks SubQ whether a session left a page stale or work uncovered ([MCP server](../specs/mcpServer.md)). Pages describe the method, never the owner's own accounts, people, prices, links or files: examples use placeholders like `<account>`, `<role link>` and `@someone`.

### Private blocks

Wrap anything that must not reach the website or the installable skills in a private block:

```markdown
<!-- private -->
The owner's own words or an anecdote that only makes sense to the team.
<!-- /private -->
```

`bun run skills:build` (`scripts/docs/syncSiteSkills.mjs`) drops every private block before it writes `site/apps/web/public/.well-known/skills/` and `.claude/skills/`, and the site docs sync drops them from the docs site. A marker left open fails the build. The skill sync then runs the privacy scan (`src/privacy/scan`) on what it writes and fails on a hit (in pre-commit, `--staged` scans only the skills whose source page is staged; pre-push scans them all). The source page is still in this public repo, so a private block is for context that is fine to be public but not useful on the site: real people's names, handles, DMs and money never go in a tracked file at all, private block or not. Use an anonymised example instead (rule 178). `bun run check:privacy` catches secrets, private hosts, emails, phones and the terms in your private denylist (`~/.logCli/privacy/denylist.txt`, or `LOG_PRIVACY_DENYLIST`).

## Related

- Up: [log's README](../../README.md)
- Start here: [Install](../install.md) · [Add an account](../accounts.md) · [Connect your agent](../mcp.md) · [What log does, and what it never does](../trust.md)
- [What log does on each platform](../platformGuides/x.md) · [Every command and tool](../reference.md)
