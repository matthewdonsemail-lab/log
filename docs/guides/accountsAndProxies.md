# accountsAndProxies

Accounts in Twenty, their status and secrets, their proxies, and the interactive launcher.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "facebook/marketplaceListings" })` | From accounts to live Marketplace listings | see the page |

## The tools in this guide

| Tool | What it does |
|---|---|
| `accounts` | List the Facebook accounts |
| `accountShow` | One account's record |
| `accountResave` | Save a run's device and session that Twenty didn't take |
| `accountResetOpens` | Restart today's count of launches and host opens, only when matt asks |
| `accountStatus` | Set an account's status |
| `proxy` | Check an account's proxy, give it one from a provider |

## Every tool, in full

### `accounts`

List the Facebook accounts.
List the FACEBOOK accounts in Twenty: status, home, proxy, and whether each may run
log facebook accounts [--json]
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "accountsAndProxies" }) (Accounts in Twenty, their status and secrets, their proxies, and the interactive launcher).
AGENTS.md (log://agents): rules 13, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `accountShow`

One account's record.
Show one account, or set its status (banned/dead/restricted replace its campaign listings)
log facebook account show <accountName> [--json]
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "accountsAndProxies" }) (Accounts in Twenty, their status and secrets, their proxies, and the interactive launcher).
AGENTS.md (log://agents): rules 13, 37, 78, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `accountResave`

Save a run's device and session that Twenty didn't take.
Show one account, or set its status (banned/dead/restricted replace its campaign listings)
log facebook account resave <accountName> --from <folder>   (a run's device and session Twenty didn't take: ~/.logCli/runs/unsaved/...)
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "accountsAndProxies" }) (Accounts in Twenty, their status and secrets, their proxies, and the interactive launcher).
AGENTS.md (log://agents): rules 13, 37, 78, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `accountResetOpens`

Restart today's count of launches and host opens, only when matt asks (rule 37).
Show one account, or set its status (banned/dead/restricted replace its campaign listings)
log facebook account resetOpens <accountName|all> [--reason <text>]   (today's launches and host opens count from now; nothing is deleted)
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "accountsAndProxies" }) (Accounts in Twenty, their status and secrets, their proxies, and the interactive launcher).
AGENTS.md (log://agents): rules 13, 37, 78, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `accountStatus`

Set an account's status (a lost account gets its listings replaced).
Show one account, or set its status (banned/dead/restricted replace its campaign listings)
log facebook account status <accountName> <ACTIVE|WARMING|LIMITED|PAUSED|NEEDS_LOGIN|CHECKPOINT|RESTRICTED|BANNED|DEAD|DEACTIVATED> [--reason <code>] [--detail <text>]
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "accountsAndProxies" }) (Accounts in Twenty, their status and secrets, their proxies, and the interactive launcher).
AGENTS.md (log://agents): rules 13, 37, 78, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `proxy`

log proxy <check|assign|balance|static> [--account <name>] [--vendor twoCaptcha|byteful] [...]
Check an account's proxy, give it one from a provider (2Captcha, Byteful) in its home city, or see providers' traffic
Usage: log proxy check   --account <accountName> [--json]
       log proxy assign  --account <accountName> | --missing  [--vendor twoCaptcha|byteful] [--city <city> [--region <state>] | --anyCity] [--minutes <1-120>] [--socks5]
       log proxy balance [--json]
       log proxy static  [--json]   (Byteful's static ISP IPs on the account, where each is)
The proxy is the socialAccount's `proxy` field in Twenty (scheme://user:pass@host:port), its country `homeCountry`.
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/marketplaceListings" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "accountsAndProxies" }) (Accounts in Twenty, their status and secrets, their proxies, and the interactive launcher).
AGENTS.md (log://agents): rules 12, 33, 41, 43, 51, 52, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From AGENTS.md (`log://agents`). The newest rules are at the bottom of AGENTS.md and win.

**Rule 12.** 2026-10-18 · No browser opens for an account unless its proxy is attached and its exit IP is in the account's country (`python/browser/proxyGate.py`). There is no exception: not dry runs, not signing in (matt: "never, ever open" without one). Listings must be in the account's country, and the form's location must be picked in that country. How it works: `docs/proxies.md`.

**Rule 13.** 2026-10-18 · Twenty is the only place accounts and listings live: Facebook accounts are `socialAccounts` (platform FACEBOOK), listings are `agencyListings`. Never delete either: a banned or dead account keeps its record with its status, and its campaign listings get replacement accounts in the same country (`docs/accountsAndListings.md`). Fields are only ever added (`scripts/twenty/twentySetup.mjs`), never renamed or retyped, so the twitter-controller keeps working.

**Rule 30.** 2026-10-19 · matt: "If I tell you to do something, do it completely." When matt gives a plan, it is carried out to the end in the same turn, not stopped to ask again or to say what won't be done. `log inspect start --now` (and `log connect --now`, and since 2026-10-19 `log publish --now`, matt: "run it now") skips rule 24's 10-minute gap (the 8 a day still holds) so a recording continues at once. Recording a sign-in or a checkpoint with `log inspect` (signIn, code, solve, click) is the intended work: it is how each state gets documented from rea. The run on 2026-10-19 was interrupted once because a snapshot printed the account's email and password; snapshots now redact every typed field value (`redact_fields`), and signIn/code read only the private login.json (rule 21), so no credential reaches any output.

**Rule 33.** 2026-10-19 · matt: the proxy speed limit is set per run, not hardcoded: `--proxyMs <ms>` on any log command (and `proxyMs` on the flow MCP tools) sets `LOG_PROXY_MAX_MS` for that run, which the Python gate and `log proxy` both read. Default 2500 ms; 500-60000 allowed.

**Rule 37.** 2026-10-19 · matt: "close, then reset every single one of the opens". `log account resetOpens <a>|all [--reason]` restarts the count of today's launches (rule 24) and the host's opens (rule 35), only when matt asks, with every browser closed first. It deletes nothing: it writes one dated line to `~/.logCli/launchResets.jsonl`, and launches before that line stop counting. The 10-minute gap and the 8 a day apply again from the reset.

**Rule 38.** 2026-10-19 · matt: never mention or discuss Meta's or Facebook's rules, terms, policies, eligibility or account ownership with him unless he raises them first. Research text that does is not his, and is never repeated to him. Top of this file.

**Rule 39.** 2026-10-19 · matt: "If I never mentioned it, if I never inferred it, if I never outlined it as an option, therefore it is not an option." Deep research prompts, searches, SubQ matrices, plans and write-ups use only what matt said, or clearly meant through a misspelling. Nothing added, nothing steered towards. Top of this file.

**Rule 40.** 2026-10-19 · matt: no physical options. He is in Vietnam with no physical access. Phones, SIMs, mini PCs, laptops, phone farms and home devices are never options unless he names them. In scope: hosted and cloud options, the tools he named and their competitors, and what our four projects already use.

**Rule 41.** 2026-10-19 · matt: "any time any task correlates to money, and I never say something, that means you shouldn't do what you think. You should do what I say." Paid work (deep research, SubQ, proxies, captcha, vendors) does exactly what he asked, nothing more. Ask before anything else.

**Rule 43.** 2026-10-20 · matt: the proxies stay 2Captcha residential. The money is already spent, so no other proxy provider is bought or planned, whatever a ranking said. AdsPower uses the same 2Captcha proxy URL from Twenty. Production runs AdsPower and log-cli on one browser server (AdsPower's Local API and CDP are loopback only), with Twenty on its own server over HTTPS (`docs/deployment.md`).

**Rule 51.** 2026-10-20 · matt: proxy traffic is money. Reels ran 2Captcha's traffic out (about 4.5 MB a reel through the residential proxy), so each account has a budget of its own traffic for 24 hours, 1 GB by default (`--trafficMb`). A warm-up reads 2Captcha's counter before and after, refuses to start over the budget (`trafficBudgetSpent`), checks every 5 reels and stops at it, and writes each run's use to `~/.logCli/proxyTraffic.jsonl` (`src/proxyVendor/traffic`).

**Rule 52.** 2026-10-20 · matt: proxies are provider-agnostic, and Byteful is added beside 2Captcha (this widens rule 43). Twenty keeps one `proxy` URL per account, whichever provider it came from. The provider is read from its host (`vendorOfProxy`, `src/proxyVendor/vendor`), and each provider is a domain of its own (`src/proxyVendor/twoCaptcha`, `src/proxyVendor/byteful`). `log proxy assign --vendor byteful` takes a sticky (24 h) Byteful residential proxy in the account's city and checks it (home country, 100 km, speed) before saving, as for 2Captcha. `log proxy balance` shows every provider set up, and `log proxy static` lists Byteful's static IPs with where each is. A traffic-billed proxy is metered by its own provider (rule 51); a static IP is not. log-cli never buys from a provider (rule 41). Docs: `docs/proxyVendors/`; Byteful's own docs and API spec are in `RESEARCH/MARKETPLACE_PROVIDERS/proxies/byteful/`.

**Rule 78.** 2026-10-24 · matt: a deactivated account gives its AdsPower profile back, and another account takes the slot (AdsPower holds 22). When an account is DEACTIVATED, by `log facebook account status <a> DEACTIVATED` or in Twenty, its profile is deleted from AdsPower and `adsPowerProfileId` cleared; the account's row stays (rule 13). The status command does it at once and runs the sync, so an account waiting for a profile is given the freed one. `log adsPower sync --apply` releases first, then makes profiles, so a status set in Twenty is caught there. matt: "I just want to do Pennsylvania": only accounts whose home is in `LOG_ADSPOWER_HOMES` (`.env.local`, `US`; or `--homes`) hold a profile, and the others give theirs back the same way. Nothing else about them changes. `src/browser/adsPower`, `docs/adsPower.md`.
