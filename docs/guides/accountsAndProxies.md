# accountsAndProxies

Accounts in Twenty, their status and secrets, their proxies, and the interactive launcher.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 55). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Current scope

This guide describes the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "facebook/marketplaceListings" })` | From accounts to live Marketplace listings | see the page |
| `getGuide({ useCase: "inbox/signIn" })` | Signing an account in: checking it, then the live browser | "sign in to my account", "is my x account logged in", "check my accounts", "log me back into instagram", "my session expired", "check the status of my accounts", "open the browser so I can sign in" |

## The tools in this guide

| Tool | What it does |
|---|---|
| `facebookAccounts` | List the Facebook accounts |
| `facebookAccountShow` | One account's record |
| `facebookAccountResave` | Save a run's device and session that Twenty didn't take |
| `facebookAccountResetOpens` | Restart today's count of launches and host opens, only when matt asks |
| `facebookAccountStatus` | Set an account's status |
| `proxy` | Check an account's proxy, give it one from a provider |
| `sessionsCheck` | Check every account's saved session through its platform's own answer |

## Every tool, in full

### `facebookAccounts`

List the Facebook accounts.
List the FACEBOOK accounts in Twenty: status, home, proxy, and whether each may run
log facebook accounts [--json]
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "accountsAndProxies" }) (Accounts in Twenty, their status and secrets, their proxies, and the interactive launcher).
AGENTS.md (log://agents): rules 175, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `facebookAccountShow`

One account's record.
Show one account, or set its status (banned/dead/restricted replace its campaign listings)
log facebook account show <accountName> [--json]
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "accountsAndProxies" }) (Accounts in Twenty, their status and secrets, their proxies, and the interactive launcher).
AGENTS.md (log://agents): rules 175, 35, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `facebookAccountResave`

Save a run's device and session that Twenty didn't take.
Show one account, or set its status (banned/dead/restricted replace its campaign listings)
log facebook account resave <accountName> --from <folder>   (a run's device and session Twenty didn't take: ~/.logCli/runs/unsaved/...)
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "accountsAndProxies" }) (Accounts in Twenty, their status and secrets, their proxies, and the interactive launcher).
AGENTS.md (log://agents): rules 175, 35, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `facebookAccountResetOpens`

Restart today's count of launches and host opens, only when matt asks (rule 37).
Show one account, or set its status (banned/dead/restricted replace its campaign listings)
log facebook account resetOpens <accountName|all> [--reason <text>]   (today's launches and host opens count from now; nothing is deleted)
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "accountsAndProxies" }) (Accounts in Twenty, their status and secrets, their proxies, and the interactive launcher).
AGENTS.md (log://agents): rules 175, 35, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `facebookAccountStatus`

Set an account's status (a lost account gets its listings replaced).
Show one account, or set its status (banned/dead/restricted replace its campaign listings)
log facebook account status <accountName> <ACTIVE|WARMING|LIMITED|PAUSED|NEEDS_LOGIN|CHECKPOINT|RESTRICTED|BANNED|DEAD|DEACTIVATED> [--reason <code>] [--detail <text>]
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "accountsAndProxies" }) (Accounts in Twenty, their status and secrets, their proxies, and the interactive launcher).
AGENTS.md (log://agents): rules 175, 35, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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
AGENTS.md (log://agents): rules 35, 41, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `sessionsCheck`

Check every account's saved session through its platform's own answer (a 401 means sign in again), with the next step to sign each one back in.
Check every account's saved session through its platform's own answer, with the next step to sign each one back in
log sessions check [--platform <p>] [--account <accountName>] [--json]
Checks every account's saved session through its platform's own check (X, Discord, Instagram, Slack, Reddit, LinkedIn), one account after another, and says for each: signed in, needs signing in (a 401, or no session saved), stopped (the platform refused: nothing retries, rule 94) or unknown. An account that needs signing in comes with its next step: its own browser opened on the platform's sign-in page for the owner (log inspect start; closing it saves the new session), or X's cookie prompt. Facebook is checked in its browser, and a deactivated account is skipped. Each result is also the console's last check for that account, so the console, the CLI and the MCP tool sessionsCheck say the same. Sends nothing.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/signIn" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "accountsAndProxies" }) (Accounts in Twenty, their status and secrets, their proxies, and the interactive launcher).
AGENTS.md (log://agents): rules 25, 73, 94, 163, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From the current AGENTS.md (`log://agents`). Historical citations are consolidated; archived instructions do not override the active scope.

**Rule 25.** 2026-10-19 · Fix failed or unfamiliar behavior from its own recorded action/request/response timeline. Identify the first response deciding the outcome, compare evidence, then change the machine. Do not infer success from a screen, timer or completed tool call.

**Rule 30.** 2026-10-19 · Complete the authorized task. Do not repeatedly request confirmation already given. Distinguish implemented behavior, proposed contracts and unverified assumptions.

**Rule 35.** 2026-10-19 · Browser work uses one account browser through its active day, with actions as tabs/steps; close only for a logged lifecycle reason. Preserve existing proxy-country, locale/timezone, device/profile, headed visibility, capture, active-hours and launch-budget gates. Keep checkpoint stops and account-specific constraints in the browser/flow guides. Do not create a fresh browser per action.

**Rule 38.** 2026-10-19 · Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless Matt raises them.

**Rule 39.** 2026-10-19 · Use only the scope, options and intent Matt stated or implied. Do not add unrelated alternatives to research, comparisons, plans or implementation.

**Rule 40.** 2026-10-19 · Do not propose physical infrastructure unless Matt asks. His available implementation scope is hosted/cloud environments and the tools already selected.

**Rule 41.** 2026-10-19 · Paid work must stay within the authorized task and spend. Ask before adding a paid operation he did not authorize; do not substitute a new paid provider implicitly.

**Rule 73.** 2026-10-23 · For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence. Use the existing REA/SubQ reading workflow when applicable, report the unknown state, write Point/Evidence/Explain and the fix, then name the state. Preserve paid-work scope. This runtime analysis does not add SubQ to commit/CI gates.

**Rule 94.** 2026-10-29 · Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies. A refusal, failed send, 429, block, disable, captcha or cooldown stops that run/account until Matt authorizes continuation. Do not retry through refusals. Bulk reading and sending are separate sessions; cold DMs stay a few a day, minutes apart, and opening a DM counts as a write.

**Rule 163.** 2026-11-07 · Agent Log actions go through Log MCP tools; never work around a stale or unavailable MCP with shell Log commands or scratch clients. Terminal-only credential prompts remain for Matt. Expose discoverable command contracts through the existing Log catalog: search the job, get exact inputs, then call. Keep tool descriptions concise and accurate to the current implementation.

**Rule 175.** 2026-11-11 · Use existing log.db and platform-agnostic engine contracts for native schemas. Do not copy Twenty agency prefixes or CRM/SMS structures. Old listing/campaign functionality is deferred. Add only missing account/credential and hosted execution contracts; preserve existing identity, message, queue, job and governor authorities.
