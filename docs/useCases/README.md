# Use cases

What log-cli has actually been used for, one page each, by platform. Each page shows a real run, the steps in order, the command and MCP tool for every step, and what decides that a step worked. They're here so anyone can see the parts and put them together for their own idea.

| Platform | Use case | What it does |
| --- | --- | --- |
| X | [Recruiting on X with a reply queue](twitter/recruiting.md) | finds people posting that they want work, replies to each in their language, sent slowly after matt approves |
| Facebook | [From bought accounts to live Marketplace listings](facebook/marketplaceListings.md) | one local profile per town, each posting a listing, clicks counted into Twenty |
| Facebook | [Listening to local Facebook groups](facebook/groups.md) | joins local groups and passes the posts asking for the service to Twenty |

## The parts every use case is built from

- **An account in Twenty** (`socialAccounts`): its home, its session, its status. Nothing else holds accounts.
- **An engine:** the direct API where there is one (twikit for X, fbk for Facebook reads), the account's own browser otherwise. The README's Engines section says which command uses which.
- **The platform's own answer decides:** every step reads what the platform sent back, never the screen or a timer.
- **A dry run first:** anything that acts on a platform does nothing without `--live`, and over MCP it is a separate `…Live` tool that needs `confirmLive`.
- **Pacing:** each account has its own governor, local hours and limits.

A new use case gets its own page here, under its platform: `docs/useCases/<platform>/<useCase>.md`.
