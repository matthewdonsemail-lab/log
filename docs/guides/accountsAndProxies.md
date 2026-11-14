# accountsAndProxies

Each account's proxy: checking it, giving it one from a provider in its home city, and providers' traffic; and the interactive launcher that sets log up and adds accounts.

Load next, when the work needs it: getGuide({ topic: "sessions" }) (Whether each account's saved session still works, from the platform's own answer, with the next step to sign it back in; and log's own sign-in for a team (login, logout, whoami)); getGuide({ topic: "accountBrowser" }) (An account's one browser on any platform: opening it through its gates, inspecting a page step by step, where every open browser is, the live view for signing in, AdsPower profiles and local accounts).

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "facebook/marketplaceListings" })` | From accounts to live Marketplace listings | "post a marketplace listing in <town>", "get listings up on facebook marketplace in every town", "set up the facebook accounts and publish the listings", "take the marketplace listing down". |

## The tools in this guide

Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.

| Tool | What it does | Usage |
|---|---|---|
| `proxyCheck` | Check an account's proxy | `log proxy check   --account <accountName> [--json]` |
| `proxyAssign` | Give an account | `log proxy assign  --account <accountName> \| --missing  [--vendor twoCaptcha\|byteful] [--city <city> [--region <state>] \| --anyCity] [--minutes <1-120>] [--socks5]` |
| `proxyBalance` | Each proxy provider's traffic and balance | `log proxy balance [--json]` |
| `proxyStatic` | The provider's static ISP IPs on the account, and where each is | `log proxy static  [--json]   (Byteful's static ISP IPs on the account, where each is)` |

## The rules these tools fall under

Each by its number and first line. The full text is in AGENTS.md (`log://agents`); the core rules are in full in `getGuide({ topic: "logMcpInstructions" })`.

- **Rule 30.** Complete the authorized task.
- **Rule 35.** Browser work uses one account browser through its active day, with actions as tabs/steps; close only for a logged lifecycle reason.
- **Rule 38.** Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless the owner raises them.
- **Rule 39.** Use only the scope, options and intent the owner stated or implied.
- **Rule 40.** Do not propose physical infrastructure unless the owner asks.
- **Rule 41.** Paid work must stay within the authorized task and spend.
