# Use cases

What log-cli is built to do, one page each, by platform. Each page gives the idea, the steps in order, the command and MCP tool for every step, what decides that a step worked, and the lessons that shaped it. They're here so anyone can see the parts and put them together for their own idea. Every page can be run from a fresh context: say "go on <the page>" and what the round is for.

| Platform | Use case | What it does |
| --- | --- | --- |
| X | [All X use cases, and the parts they share](twitter/README.md) | start here for anything on X: the queue, the rules, and how to run a page from a fresh context |
| X | [Recruiting on X with a reply queue](twitter/recruiting.md) | finds people posting that they want work, replies to each in their language, sent slowly after you approve |
| X | [Replying to everyone posting about one topic](twitter/topicReplies.md) | one reply per person about their own post, backed by facts you can stand behind |
| X | [Answering the people who engaged with your posts](twitter/engagementReplies.md) | answers commenters under your post, or on a fresh post of theirs |
| X | [DMing the people who liked or reposted your post](twitter/engagerDms.md) | ranks the likers, you pick, one opening line each, sent as a dm queue |
| X | [Reading the DM inbox](twitter/dmInbox.md) | who is waiting on you and what they asked, sends nothing |
| X | [Checking who really follows you](twitter/followers.md) | a live follows check before anyone is called a follower |
| Facebook | [From accounts to live Marketplace listings](facebook/marketplaceListings.md) | one local profile per town, each posting a listing, clicks counted into Twenty |
| Facebook | [Listening to local Facebook groups](facebook/groups.md) | joins local groups and passes the posts asking for the service to Twenty |

## The parts every use case is built from

- **An account in Twenty** (`socialAccounts`): its home, its session, its status. Nothing else holds accounts.
- **An engine:** the direct API where there is one (twikit for X, fbk for Facebook reads), the account's own browser otherwise. The README's Engines section says which command uses which.
- **The platform's own answer decides:** every step reads what the platform sent back, never the screen or a timer.
- **A dry run first:** anything that acts on a platform does nothing without `--live`, and over MCP it is a separate `…Live` tool that needs `confirmLive`.
- **Pacing:** each account has its own governor, local hours and limits.

A new use case gets its own page here, under its platform: `docs/useCases/<platform>/<useCase>.md`. Pages describe the method, never the owner's own accounts, people, prices, links or files: examples use placeholders like `<account>`, `<role link>` and `@someone`.
