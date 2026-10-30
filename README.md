# log-cli

## Rule one: if we don't know, we do this

The number one rule of log-cli, above everything below. We already know most
of the states a platform can be in. When a step lands somewhere we don't know:

1. **Read the internal API.** Every step's internal API calls are taken out
   of its recording by code: what we sent and what came back, in seconds from
   our action (`exchanges.json`, `exchanges.md`). The answers decide, never the
   screen, a timer, or the fact that a step ran. What we sent counts as much
   as the answer (`viewer_coordinates` placed Bethlehem's search in Lima).
2. **Collate everything about that moment.** The goal, the account (home,
   platform, browser, the proxy's exit), what we did (the action, the mouse,
   how long it took), every internal API call, the page, the screenshot and
   the earlier steps, together, never in silos.
3. **Ask SubQ what it means.** Not what to do next: was the goal met, does
   everything fit the account, should something never have come up, does the
   page agree with the API, did our action cause it, and what each call says
   about the goal.
4. **Say it loudly.** The reading comes first in the step's result
   (`>>> UNKNOWN STATE`) and goes into the agent's context through the hook.
5. **Keep going until the goal is reached.** The Stop hook holds the turn
   until a step's reading says the goal is met.
6. **Write what went wrong as P.E.E.** Point (the issue, one sentence),
   Evidence (quoted from the step's reading), Explain (why it shows it, what
   caused it), and, once the goal is reached, how it was fixed
   (`log inspect finding`, `goalFindings.md`).
7. **Name the state,** so next time it is known and nobody has to find it
   out again.

The same on every platform. In practice:

```bash
bun bin/log.ts inspect start --account <a> --goal "Set the Marketplace location to Bethlehem, Pennsylvania" --detach
bun bin/log.ts inspect do <action>                                  # reads the step; >>> UNKNOWN STATE when we don't know
bun bin/log.ts inspect finding --account <a> --step <step> --point "<the issue>" --explain "<why, and what caused it>"
bun bin/log.ts inspect finding --account <a> --fixes 1 --fix "<how it was fixed>"
bun bin/log.ts inspect goal --account <a>                           # the goal, whether it is reached, every finding
```

AGENTS.md rules 73-76.

The command line for ListeningKit's social accounts, on every platform they
live on. Accounts live in Twenty as `socialAccounts` (one row per account, its
platform, session and proxy), Marketplace listings as `agencyListings`, reached
through the same generated GraphQL client blaster and the dialer use. Every
result is written back to Twenty.

log-cli is **platform-agnostic**. Three platforms so far:

- **Facebook:** Marketplace listings (publish, check, campaigns) and groups
  (join, read, poll, members), on its direct API (fbk, `vendor/fbk`) first and
  the account's browser behind it, always through a proxy in the account's
  home country (rule 12).
- **X:** session checks, follows, replies, quotes, likes, DMs and a reply
  queue, on its direct API only (twikit, `vendor/twikit`), with no proxy and no
  browser (rule 80).
- **Reddit:** the session check on its direct API (rdvwr, `vendor/rdvwr`), and
  `log inspect` in the account's browser with no proxy (rule 84).

A command that acts on one platform names it first (`log facebook publish`,
`log twitter reply`, `log reddit session check`, rule 63). A new platform is
one command, `log new platform <name>` (rule 83). Every platform's internal
calls go through rea, their code as well as their network (rule 85), into
`docs/platforms/<platform>/`.

log-cli is **browser-agnostic** too. Each account's browser is a driver picked
from Twenty: **AdsPower** first (one profile per account, Listaro's browser),
Camoufox kept, and more browser providers to come, each one more driver
(`src/browser/<name>`). Every driver opens through the same gates: the proxy
the platform needs (rules 12, 84), the launch self-check (rule 17), a raw HAR
of everything (rule 22), and one human mouse (rule 32). Which platform runs
where, and which commands run on the account's browser, is in
[The platforms](#the-platforms) and [The browser layer](#the-browser-layer)
below, generated from the code.

Built the same way as the Rank CLI from the Nebius hackathon: a command registry
that generates its own usage, commands that return results rather than
printing, and a [Clack](https://github.com/bombshell-dev/clack) guided menu
(`log launch`) on top of the scriptable commands.

## Use cases

What log-cli is built to do, with every step's command and MCP tool and what decides each step worked: [everything on X](docs/useCases/twitter/README.md) (recruiting, topic replies, answering engagers, DMing likers, the DM inbox, follower checks), [from accounts to live Marketplace listings](docs/useCases/facebook/marketplaceListings.md) and [listening to local Facebook groups](docs/useCases/facebook/groups.md). The index is [docs/useCases](docs/useCases/README.md).

## Run it

```bash
bun install
cp .env.example .env.local     # TWENTY_BASE_URL, TWENTY_API_KEY, LOG_PYTHON, CAPTCHA_KRAKEN_API_KEY, 2CAPTCHA_API_KEY, BYTEFUL_*
bun run launch                 # guided menu (needs a terminal)
bun bin/log.ts facebook accounts                              # Facebook accounts in Twenty, and whether each may run
bun bin/log.ts facebook listings --status READY
bun bin/log.ts facebook publish --listing <agencyListingId>   # dry run
bun bin/log.ts twitter session check --account <accountName>  # X: is the saved session still signed in
bun bin/log.ts reddit session check --account <accountName>   # Reddit: the same
```

`LOG_PYTHON` points at the Python with the vendored clients' dependencies
(curl_cffi and the rest); the direct-API engines and their tests run on it.

Every command takes `--json` and never prompts, so scripts and agents can use it.

Every command, its flags, its MCP tool and the hooks that fire on it are listed in
[Commands, MCP tools and hooks](#commands-mcp-tools-and-hooks) below, generated from the code.

How accounts, statuses, replacement and campaigns work: `docs/accountsAndListings.md`.
How proxies load and are checked: `docs/proxies.md`. Where accounts are bought:
`docs/vendors/`. Every error code: `docs/errorCatalog.md`.

<!-- surface:start · written by `bun run docs:build` from the code. Not edited by hand. -->
## Commands, MCP tools and hooks

log-cli is platform-agnostic: 5 platforms so far, Facebook (23 commands of its own), X (13 commands of its own), Reddit (1 command of its own), Discord (5 commands of its own), LinkedIn (2 commands of its own), and a new one is made by `log new platform <name>` (rule 83). A command that acts on one platform names it first, `log <platform> <command> …` (`log facebook listings`, `log twitter session`, `log reddit session`, `log discord session`, `log linkedin session`), in every form; one that works on any platform takes none (the Platform column, rule 63).
Each command runs on the platform's direct API first where it has one, and on the account's browser otherwise (the Engine and Browser columns). log-cli is browser-agnostic too: each account's browser is a driver (AdsPower first, Camoufox kept, more browser providers to come), and every driver opens through the same gates.
Every command is a CLI command (`bun bin/log.ts [<platform>] <command>`) and, unless it only works in a terminal, an MCP tool on the `log` server (Facebook's take the command's name, every other platform's start with the platform: `twitterReply`, `redditSessionCheck`).
The same hooks fire whether it runs from a shell or over MCP, and both write the same live log, `~/.logCli/mcp/<day>.log`.
This section and `docs/diagrams/*.mmd` are generated from the code (`COMMANDS`, `AGENT_HOOKS`, `PAGE_STATES`, the saved flows) by `bun run docs:build`.
`bun run check:docs` (lefthook pre-commit and pre-push) refuses a commit where they differ (rule 56).

### The platforms

log-cli is platform-agnostic: each platform is a row in `PLATFORMS` and `PLATFORM_SITES` (`src/cli/runner/helpers/platforms.ts`), with its direct-API client from `DIRECT_ROUTES` (`src/directApi/engine`) and its browser path, with or without a proxy. A new one is made by `log new platform <name>` (rule 83).

```mermaid
flowchart LR
  twenty[("Twenty socialAccounts: one row per account, its platform, session and proxy")]
  api["The platform's internal API: its own answer decides (rule 73)"]
  drivers["The account's browser: AdsPower or Camoufox, through the driver (The browser layer)"]
  p_facebook["Facebook (FACEBOOK): 23 commands of its own"]
  twenty --> p_facebook
  p_facebook -->|"direct API: facebook read"| e_fbk["fbk (vendor/fbk): the saved session, a governor per account"]
  e_fbk --> api
  p_facebook -->|"browser: facebook doctor, facebook connect, facebook profile, facebook host, #lt;platform#gt; warmup, facebook join, facebook read, facebook poll, facebook check, facebook scan, facebook status, facebook watch, facebook publish, facebook campaign"| b_facebook["Facebook's browser path: its proxy in the account's home country (rule 12)"]
  b_facebook --> drivers
  p_twitter["X (TWITTER): 13 commands of its own"]
  twenty --> p_twitter
  p_twitter -->|"direct API: twitter session, twitter follows, twitter dms, twitter chat, twitter cookies, twitter followers, twitter reply, twitter quote, twitter post, twitter like, twitter follow, twitter dm, twitter queue"| e_twikit["twikit (vendor/twikit): the saved session, a governor per account"]
  e_twikit --> api
  p_twitter -.->|"no browser path (rule 80)"| nob_twitter["X runs on its direct API only"]
  p_reddit["Reddit (REDDIT): 1 command of its own"]
  twenty --> p_reddit
  p_reddit -->|"direct API: reddit session"| e_rdvwr["rdvwr (vendor/rdvwr): the saved session, a governor per account"]
  e_rdvwr --> api
  p_reddit -->|"browser: the any-platform commands"| b_reddit["Reddit's browser path: no proxy: this machine's own exit, the profile's timezone follows it (rule 84)"]
  b_reddit --> drivers
  p_discord["Discord (DISCORD): 5 commands of its own"]
  twenty --> p_discord
  p_discord -->|"direct API: discord session, discord chats, discord read, discord watch, discord send"| e_endcord["endcord (vendor/endcord): the saved session, a governor per account"]
  e_endcord --> api
  p_discord -->|"browser: the any-platform commands"| b_discord["Discord's browser path: no proxy: this machine's own exit, the profile's timezone follows it (rule 84)"]
  b_discord --> drivers
  p_linkedin["LinkedIn (LINKEDIN): 2 commands of its own"]
  twenty --> p_linkedin
  p_linkedin -->|"direct API: linkedin session, linkedin cookies"| e_openLinkedinApi["openLinkedinApi (vendor/openLinkedinApi): the saved session, a governor per account"]
  e_openLinkedinApi --> api
  p_linkedin -->|"browser: the any-platform commands"| b_linkedin["LinkedIn's browser path: no proxy: this machine's own exit, the profile's timezone follows it (rule 84)"]
  b_linkedin --> drivers
  anyB["Any platform with a browser path: inspect, flow"]
  anyB --> b_facebook
  anyB --> b_reddit
  anyB --> b_discord
  anyB --> b_linkedin
  anyN["Any platform, no browser: launch, adsPower, proxy, errors, graph, runs, browsers, job, mcp, login, logout, whoami, voice, search, kb, new"]
  anyN -.-> twenty
  newP["log new platform name: one more platform, wired whole (rule 83)"] -.-> twenty
  drivers --> api
```

Source: [`docs/diagrams/platforms.mmd`](docs/diagrams/platforms.mmd).

### The browser layer

log-cli is browser-agnostic: each account's browser is a driver picked from Twenty, AdsPower first, and every driver opens through the same gates. Whether the gate needs a proxy is the platform's (`PLATFORM_SITES`). From `BROWSER_DRIVERS` (`src/browser/driver`) and `commandBrowser` (`src/browser/run`).

```mermaid
flowchart LR
  twenty["Twenty socialAccounts: platform, browserDriver, adsPowerProfileId"]
  pick{"driverNameOf"}
  gates["Every driver: the proxy gate (Facebook: a proxy in the home country, rule 12. Reddit, Discord, LinkedIn: no proxy, rule 84), self-check, HAR, human mouse (rules 17, 22, 32)"]
  session["One Playwright context: python/browser/browserDriver.py"]
  twenty --> pick
  pick -->|"browserDriver camoufox, or no profile"| d_camoufox["camoufox"]
  pick -->|"a linked profile, or browserDriver adsPower"| d_adsPower["adsPower"]
  d_camoufox --> gates
  d_adsPower --> gates
  more["Next browser provider: one more driver (src/browser/name), rule 44"] -.-> gates
  gates --> session
  account["On the account's browser: facebook host, inspect, flow, #lt;platform#gt; warmup, facebook join, facebook read, facebook poll, facebook check, discord read"]
  camoufox["Camoufox only, not on the driver yet: facebook doctor, facebook connect, facebook profile, facebook scan, facebook status, facebook watch, facebook publish, facebook campaign, discord watch"]
  session --> account
  camoufox -.->|"launches Camoufox itself"| d_camoufox
  nobrowser["No browser path: X (direct API only, rule 80)"] -.-x pick
```

Source: [`docs/diagrams/browsers.mmd`](docs/diagrams/browsers.mmd).

- **The account's browser, through the driver:** `facebook host`, `inspect`, `flow`, `<platform> warmup`, `facebook join`, `facebook read`, `facebook poll`, `facebook check`, `discord read`. They run on whichever browser the account uses: AdsPower when it has a linked profile (`socialAccounts.adsPowerProfileId`), Camoufox otherwise, or what `socialAccounts.browserDriver` says.
- **Camoufox only, not on the driver yet:** `facebook doctor`, `facebook connect`, `facebook profile`, `facebook scan`, `facebook status`, `facebook watch`, `facebook publish`, `facebook campaign`, `discord watch`. They launch Camoufox themselves (facebook-camofox-client's worker, or the publish, connect and profile sessions), so on an AdsPower account they don't open its AdsPower profile. Moving one onto the driver is moving it into `OPENER_ACTIONS` (`src/browser/run`).
- **No browser:** `launch`, `facebook listings`, `facebook listing`, `facebook accounts`, `facebook account`, `adsPower`, `facebook lifecycle`, `facebook preflight`, `proxy`, `facebook conversations`, `facebook conversation`, `facebook messenger`, `errors`, `graph`, `facebook capture`, `runs`, `browsers`, `job`, `mcp`, `login`, `logout`, `whoami`, `twitter session`, `twitter follows`, `twitter dms`, `twitter chat`, `twitter cookies`, `voice`, `search`, `kb`, `twitter followers`, `twitter reply`, `twitter quote`, `twitter post`, `twitter like`, `twitter follow`, `twitter dm`, `twitter queue`, `new`, `reddit session`, `discord session`, `discord chats`, `discord send`, `linkedin session`, `linkedin cookies`.
- **No browser path at all:** X. Its accounts run on the direct API only (rule 80).

Each browser's capabilities, built or not: [`docs/browsers.md`](docs/browsers.md) (generated, `bun run check:browsers`). AdsPower's setup: [`docs/adsPower.md`](docs/adsPower.md).

### Engines: the direct API first, the browser behind it

A command on the direct-API engine calls the platform's internal API with the account's saved session, paced by its own governor, and opens no browser. Each platform has its own vendored client: Facebook through fbk (`vendor/fbk`), X through twikit (`vendor/twikit`), Reddit through rdvwr (`vendor/rdvwr`), Discord through endcord (`vendor/endcord`), LinkedIn through openLinkedinApi (`vendor/openLinkedinApi`). Every one reaches the network through one curl_cffi session (`check:twikitTransport`, `check:rdvwrTransport`). Which engine runs each command is code (`DIRECT_ROUTES` and `commandEngine` in `src/directApi/engine`), and this section, the Engine column and every MCP tool's description are generated from it (5 clients, 22 commands).

**Facebook.** Facebook's own page decides, not accountStatus: loggedIn reads; checkpoint stops and deactivates the account; loggedOut or accountWarning hands over to the browser path. Each account has its own governor (gaps of 4 s or more, 120 an hour, 500 a day, 40 writes a day, a 15-minute pause on a soft block, 6 hours on a checkpoint) and its result is written to socialAccounts.sessionState.

- `log facebook read`: the direct-API engine first (fbk groups.feed_read, no browser) for read group without --live on a numeric group id, when the account has a saved c_user + xs session, a proxy in its home country and is inside its hours (--bypass skips the hours).

**X.** X's own answer decides: the session check's HTTP status first (401 or 403 is loggedOut, 200 or 404 loggedIn), then the call's own answer, read into one event (sent, dropped, throttled, dailyLimit, gone, automated, duplicate, sessionDead, restricted). Each account has its own governor under ~/.logCli/twitter/<account> (sends count as writes, 40 a day), refreshed cookies are merged back into its Twenty row, and the session state is written to socialAccounts.sessionState.

- `log twitter session`: the direct-API engine only (twikit, vendored in vendor/twikit, account.ping for the session check; no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter follows`: the direct-API engine only (twikit, vendored in vendor/twikit, friendships.show for the follows read; no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter dms`: the direct-API engine only (twikit, vendored in vendor/twikit, messages.inbox for the dms read (the inbox, or one conversation); no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter chat`: the direct-API engine only (twikit, vendored in vendor/twikit, xchat.unlock_xchat for the chat pin (the PIN is checked against Juicebox before it is saved), chat watch (X pushes each message over wss://chat-ws.x.com, nothing polled); no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter cookies`: the direct-API engine only (twikit, vendored in vendor/twikit, account.ping for the cookies save (the cookies are checked with X before they are saved); no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter followers`: the direct-API engine only (twikit, vendored in vendor/twikit, friendships.followers for the followers read; no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter reply`: the direct-API engine only (twikit, vendored in vendor/twikit, tweets.create_tweet for the reply; no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter quote`: the direct-API engine only (twikit, vendored in vendor/twikit, tweets.create_tweet for the quote; no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter post`: the direct-API engine only (twikit, vendored in vendor/twikit, tweets.create_tweet for the post (media uploaded first with upload_media); no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter like`: the direct-API engine only (twikit, vendored in vendor/twikit, tweets.favorite_tweet for the like; no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter follow`: the direct-API engine only (twikit, vendored in vendor/twikit, users.follow_user for the follow; no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter dm`: the direct-API engine only (twikit, vendored in vendor/twikit, messages.send_dm for the dm; no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter queue`: the direct-API engine only (twikit, vendored in vendor/twikit, tweets.create_tweet for the queue run --live (each like and reply); no browser and no proxy: X accounts call X directly, rule 80).

**Reddit.** Reddit's own answer decides. Each account has its own governor under ~/.logCli/reddit/<account>, refreshed cookies are merged back into its Twenty row, and the session state is written to socialAccounts.sessionState.

- `log reddit session`: the direct-API engine only (rdvwr, vendored in vendor/rdvwr, account.ping for the session check; no browser).

**Discord.** Discord's own answer decides. Each account has its own governor under ~/.logCli/discord/<account>, refreshed cookies are merged back into its Twenty row, and the session state is written to socialAccounts.sessionState.

- `log discord session`: the direct-API engine only (endcord, vendored in vendor/endcord, account.ping for the session check; no browser).
- `log discord chats`: the direct-API engine only (endcord, vendored in vendor/endcord, messages.get_dms for the chats (the DMs and group DMs); no browser).
- `log discord read`: the direct-API engine only (endcord, vendored in vendor/endcord, messages.get_messages for the read (a chat or channel, paged with before); no browser).
- `log discord watch`: the direct-API engine only (endcord, vendored in vendor/endcord, gateway.Gateway for the watch (Discord pushes each message over wss://gateway.discord.gg, nothing polled); no browser).
- `log discord send`: the direct-API engine only (endcord, vendored in vendor/endcord, messages.send_message for the send --live; no browser).

**LinkedIn.** LinkedIn's own answer decides. Each account has its own governor under ~/.logCli/linkedin/<account>, refreshed cookies are merged back into its Twenty row, and the session state is written to socialAccounts.sessionState.

- `log linkedin session`: the direct-API engine only (openLinkedinApi, vendored in vendor/openLinkedinApi, account.ping for the session check; no browser).
- `log linkedin cookies`: the direct-API engine only (openLinkedinApi, vendored in vendor/openLinkedinApi, account.ping for the cookies save (the cookies are checked with LinkedIn before they are saved); no browser).

### How a call reaches log-cli

From a shell or over MCP, both run the same commands through `runCli`, write the same live log, and pass through the same hooks. `commandEngine` sends each command to the platform's direct API or to the account's browser.

```mermaid
flowchart LR
  agent["Agent (Claude Code, Codex)"]
  matt["matt, in a terminal"]
  shell["Bash / PowerShell / Monitor"]
  mcp["MCP server log: 112 command tools + saved flows"]
  bin["bin/log.ts"]
  runCli["runCli: 63 commands (COMMANDS)"]
  live[("~/.logCli/mcp/day.log: the live log")]
  engine{"commandEngine: DIRECT_ROUTES"}
  direct["Direct-API engine: fbk, twikit, rdvwr, endcord, openLinkedinApi (vendor/), the account's saved session, a governor per account"]
  browser["The account's browser (one per day, rule 35)"]
  api["The platform's internal API: its answer decides (rule 73)"]
  twenty[("Twenty: socialAccounts.sessionState, refreshed cookies")]
  agent --> shell
  matt --> bin
  shell --> bin
  agent -->|mcp__log__tool| mcp
  bin --> runCli
  mcp -->|runToolCall| runCli
  runCli --> engine
  engine -->|direct API| direct
  engine -->|browser| browser
  direct --> api
  browser --> api
  direct --> twenty
  bin -->|cli:command lines| live
  mcp -->|tool lines| live
  live -.->|tail -f, under Monitor| agent
  pre0{{"PreToolUse: liveLogs.ts"}} -.->|before| shell
  post0{{"PostToolUse: inbox.ts"}} -.->|after| agent
  post1{{"PostToolUse: pageState.ts"}} -.->|after| agent
  turn0{{"SessionStart: pageState.ts"}} -.-> agent
  turn1{{"UserPromptSubmit: pageState.ts"}} -.-> agent
  turn2{{"SessionStart: storage.ts"}} -.-> agent
  turn3{{"UserPromptSubmit: storage.ts"}} -.-> agent
  turn4{{"SessionStart: engines.ts"}} -.-> agent
  turn5{{"UserPromptSubmit: engines.ts"}} -.-> agent
  turn6{{"SessionStart: knowledge.ts"}} -.-> agent
  turn7{{"SessionStart: inbox.ts"}} -.-> agent
  turn8{{"UserPromptSubmit: inbox.ts"}} -.-> agent
  turn9{{"Stop: pageState.ts"}} -.-> agent
  browser -.->|each step's snapshot| post0
```

Source: [`docs/diagrams/surface.mmd`](docs/diagrams/surface.mmd).

### Every command

Every command also takes `--proxyMs <ms>` (this run's proxy speed limit, rule 33). `--live` acts on the platform and over MCP needs `confirmLive: true`; `--bypass` needs `confirmBypass: true` (rules 8, 10, 20).

| Command | What it does | Platform | Flags | Engine | Browser | MCP tool | Hooks: shell · MCP | Live log | Rules |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [`log launch`](#log-launch) | Guided Clack menu over the listings, accounts and live commands | any (none) | `--json` | none | none | terminal only: prompts in a terminal (Clack). Call the commands it wraps directly. | PreToolUse, PostToolUse · n/a | no | 30, 38, 39, 40, 41 |
| [`log facebook listings`](#log-facebook-listings) | List the Twenty listings, by status, account or campaign | `facebook` first | `--status <STATUS>` `--account <accountName>` `--campaign <campaignId>` `--json` | none | none | `listings` | PreToolUse, PostToolUse · PostToolUse | no | 13, 30, 38, 39, 40, 41 |
| [`log facebook listing`](#log-facebook-listing) | Show one Twenty listing, or create one for an account from a JSON file | `facebook` first | `--json` `--account <accountName>` `--file <listing.json>` `--apply` `--live` `--bypass` `--now` | none | none | `listing`, `listingCreate`, `listingRemove`, `listingRemoveLive`, `listingSweep`, `listingLint` | PreToolUse, PostToolUse · PostToolUse | no | 13, 71, 72, 30, 38, 39, 40, 41 |
| [`log facebook accounts`](#log-facebook-accounts) | List the FACEBOOK accounts in Twenty: status, home, proxy, and whether each may run | `facebook` first | `--json` | none | none | `accounts` | PreToolUse, PostToolUse · PostToolUse | no | 13, 30, 38, 39, 40, 41 |
| [`log facebook account`](#log-facebook-account) | Show one account, or set its status (banned/dead/restricted replace its campaign listings) | `facebook` first | `--json` `--from <folder>` `--reason <text>` `--detail <text>` | none | none | `accountShow`, `accountResave`, `accountResetOpens`, `accountStatus` | PreToolUse, PostToolUse · PostToolUse | no | 13, 37, 78, 30, 38, 39, 40, 41 |
| [`log adsPower`](#log-adspower) | AdsPower: Local API status, its profiles, and one profile per Twenty account (sync) | any (none) | `--json` `--apply` `--account <accountName>` `--homes <US,IE>` | none | none | `adsPower` | PreToolUse, PostToolUse · PostToolUse | no | 42, 44, 78, 84, 30, 38, 39, 40, 41 |
| [`log facebook lifecycle`](#log-facebook-lifecycle) | Each account's place in its lifecycle (rule 35): status, state, what onboarding has left; `states` prints the machine | `facebook` first | `--account <name>` `--json` `--write` | none | none | `lifecycle` | PreToolUse, PostToolUse · PostToolUse | no | 35, 30, 38, 39, 40, 41 |
| [`log facebook preflight`](#log-facebook-preflight) | Before any browser opens, check each account will get through: home timezone, hours, proxy speed and country, the account's browser and its kernel, launches and host opens left, no session left open, its picture on disk | `facebook` first | `--account <accountName>` `--homes <US,CA>` `--noProxy` `--apply` `--json` | none | none | `preflight` | PreToolUse, PostToolUse · PostToolUse | no | 12, 18, 24, 33, 35, 37, 79, 30, 38, 39, 40, 41 |
| [`log facebook doctor`](#log-facebook-doctor) | Check python, facebook-camofox-client, Camoufox, Twenty, and which accounts may run | `facebook` first | `--json` | browser | Camoufox only | `doctor` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 12, 30, 38, 39, 40, 41 |
| [`log facebook connect`](#log-facebook-connect) | Sign a Facebook account in through its proxy (the connect machine), save its cookies to Twenty | `facebook` first | `--account <accountName>` `--noPrompt` `--wait <seconds>` `--bypass` `--now` | browser | Camoufox only | `connect` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 12, 18, 21, 23, 24, 73, 30, 38, 39, 40, 41 |
| [`log facebook profile`](#log-facebook-profile) | Set an account's profile picture and cover photo from Twenty (dry run unless --live, rule 28) | `facebook` first | `--account <accountName>` `--live` `--bypass` `--json` | browser | Camoufox only | `profile`, `profileLive` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 28, 73, 30, 38, 39, 40, 41 |
| [`log facebook host`](#log-facebook-host) | Run an account's lifecycle in ONE browser kept open for its day, resuming where it left (rule 35); send it events; read its progress | `facebook` first | `--account <accountName>` `--live` `--likes` `--bypass` `--now` `--gapSeconds <n>` `--watchMinutes <n>` | browser | the account's | `hostStart`, `hostStartLive`, `hostSend`, `hostStatus` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 18, 35, 73, 79, 30, 38, 39, 40, 41 |
| [`log inspect`](#log-inspect) | Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29) | any (none) | `--account <accountName>` `--goal <text>` `--url <https://www.facebook.com/... or the platform's own page>` `--bypass` `--now` `--noIdleMouse` `--detach` `--all` `--live` `--timeout <s>` `--json` `--set <text>` `--step <step>` `--point <text>` `--explain <text>` `--evidence <text>` `--fixes <n>` `--fix <text>` | browser | the account's | `inspectStart`, `inspectDo`, `inspectDoLive`, `inspectRead`, `inspectMap`, `inspectGoal`, `inspectFinding`, `inspectSessions` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 12, 17, 22, 24, 26, 29, 30, 35, 48, 54, 55, 68, 72, 73, 74, 75, 82, 84, 30, 38, 39, 40, 41 |
| [`log flow`](#log-flow) | Recorded inspect runs as flows: docs, an XState machine per flow, run on any account (rule 31) | any (none) | `--name <name>` `--summary <text>` `--rename` `--account <accountName>` `--set <param>` `--live` `--bypass` `--now` `--json` | browser | the account's | `flow`, `flowLive` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 29, 31, 68, 72, 73, 79, 30, 38, 39, 40, 41 |
| [`log <platform> warmup`](#log-platform-warmup) | The warm-up, by platform and activity: `log facebook warmup reel\|feed\|stages` (the account's browser primed with the activity, each step checked, the outline written; rules 49, 60) | `<platform>` first | `--account <a>` `--live` `--likes` `--bypass` `--now` `--json` `--newPersona` `--seed <n>` `--reels` `--watch` `--skip` `--comments` `--profile` `--persona` `--trafficMb` `--posts` `--only` `--gapSeconds <n>` `--lines <n>` `--follow` `--seconds <n>` | browser | the account's | `warmup`, `warmupLive` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 18, 20, 25, 26, 29, 32, 35, 36, 49, 50, 51, 54, 55, 60, 64, 73, 30, 38, 39, 40, 41 |
| [`log facebook join`](#log-facebook-join) | Join a Facebook group as one account, in its open browser: read the gate, --live presses Join; every step patches agencyGroups.joinSubmission (rule 45) | `facebook` first | `--account <accountName>` `--group <group url, id or name>` `--live` `--json` `--show` `--answer` `--set <n>` `--agree` `--fill` `--submit` `--bypass` | browser | the account's | `join`, `joinLive` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 10, 18, 20, 25, 26, 29, 35, 45, 64, 73, 30, 38, 39, 40, 41 |
| [`log facebook read`](#log-facebook-read) | Read a Facebook group's new posts and their comments, or its newest members, as one account, by hand: posts on the direct-API engine first, else in its open browser; only the group's cursor is saved to Twenty (#27, rule 65), the members to a file | `facebook` first | `--account <accountName>` `--group <group url or id>` `--scrolls <n>` `--commentPosts <n>` `--live` `--bypass` `--json` `--show` `--worker` `--count <n>` `--secondsPerScroll <s>` `--maxScrolls <n>` `--owners` | direct API first | the account's | `readGroup`, `readGroupLive`, `readMembers` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 13, 18, 20, 22, 25, 26, 29, 35, 45, 54, 63, 64, 65, 73, 77, 30, 38, 39, 40, 41 |
| [`log facebook poll`](#log-facebook-poll) | Poll a Facebook group from one account, in its open browser, for a time or once: each poll's posts as one JSON line, OpenMagpie's records; --request answers OpenMagpie's facebook_group worker (#27, rule 63) | `facebook` first | `--bypass` `--request <request json>` | browser | the account's | `poll` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 13, 18, 22, 26, 35, 45, 63, 64, 65, 73, 30, 38, 39, 40, 41 |
| [`log facebook check`](#log-facebook-check) | Check one account in its open browser: may it still sell, each listing's state on Selling (into Twenty), and its seller inbox's chats | `facebook` first | `--account <accountName>` `--bypass` `--json` | browser | the account's | `check` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 13, 18, 22, 29, 35, 69, 73, 30, 38, 39, 40, 41 |
| [`log facebook scan`](#log-facebook-scan) | Read Marketplace > Selling live for one account and update its listings in Twenty | `facebook` first | `--account <accountName>` `--json` `--bypass` | browser | Camoufox only | `scan` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 12, 18, 22, 73, 30, 38, 39, 40, 41 |
| [`log facebook status`](#log-facebook-status) | Open one Marketplace item page live and classify its status | `facebook` first | `--account <accountName>` `--json` `--bypass` | browser | Camoufox only | `status` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 12, 18, 22, 73, 30, 38, 39, 40, 41 |
| [`log facebook watch`](#log-facebook-watch) | Run the listing monitor (XState) for one account and print every step | `facebook` first | `--account <accountName>` `--checks <n>` `--interval <minutes>` `--json` `--bypass` | browser | Camoufox only | `watch` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 6, 18, 73, 30, 38, 39, 40, 41 |
| [`log proxy`](#log-proxy) | Check an account's proxy, give it one from a provider (2Captcha, Byteful) in its home city, or see providers' traffic | any (none) | `--account <accountName>` `--json` `--missing` `--vendor` `--city <city>` `--region <state>` `--anyCity` `--minutes <1-120>` `--socks5` | none | none | `proxy` | PreToolUse, PostToolUse · PostToolUse | no | 12, 33, 41, 43, 51, 52, 30, 38, 39, 40, 41 |
| [`log facebook publish`](#log-facebook-publish) | Post one Twenty listing (dry run unless --live), printing every machine step | `facebook` first | `--listing <agencyListingId>` `--live` `--json` `--formUrl <url>` `--bypass` `--now` | browser | Camoufox only | `publish`, `publishLive` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 10, 12, 18, 22, 24, 68, 72, 73, 30, 38, 39, 40, 41 |
| [`log facebook campaign`](#log-facebook-campaign) | Put one ad on N accounts in one place, replace lost accounts, publish the campaign | `facebook` first | `--campaign <agencyCampaignId>` `--from <agencyListingId>` `--accounts <n>` `--live` `--bypass` `--json` | browser | Camoufox only | `campaign`, `campaignLive` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 13, 18, 71, 72, 30, 38, 39, 40, 41 |
| [`log facebook conversations`](#log-facebook-conversations) | List buyers' Marketplace conversations in Twenty, newest first, by account or listing | `facebook` first | `--account <name>` `--listing <agencyListingId>` `--json` | none | none | `conversations` | PreToolUse, PostToolUse · PostToolUse | no | 34, 30, 38, 39, 40, 41 |
| [`log facebook conversation`](#log-facebook-conversation) | One conversation: show its messages, mark read, set its lead status, link its listing, or store a scanned thread | `facebook` first | `--json` `--listing <agencyListingId>` `--account <name>` `--file <threads.json>` | none | none | `conversationShow`, `conversationRead`, `conversationLead`, `conversationLink`, `conversationRecord` | PreToolUse, PostToolUse · PostToolUse | no | 34, 30, 38, 39, 40, 41 |
| [`log facebook messenger`](#log-facebook-messenger) | Messenger's PIN for the account's encrypted chats: asked in a Clack prompt, kept in Twenty, never printed | `facebook` first | `--account <accountName>` `--show` | none | none | terminal only: asks matt for the Messenger PIN in a Clack prompt (masked). He runs `bun bin/log.ts facebook messenger pin --account <a>` in a terminal. | PreToolUse, PostToolUse · n/a | no | 8, 21, 29, 54, 63, 67, 30, 38, 39, 40, 41 |
| [`log errors`](#log-errors) | List every error code: meaning, retryable, where each machine ends up | any (none) | `--layer <account|listing|photo|form|captcha|runtime|twenty|proxyVendor|auth|profile>` `--code <code>` `--json` `--markdown` | none | none | `errors` | PreToolUse, PostToolUse · PostToolUse | no | 25, 30, 38, 39, 40, 41 |
| [`log graph`](#log-graph) | Print a machine's states and transitions as a Mermaid diagram | any (none) | none | none | none | `graph` | PreToolUse, PostToolUse · PostToolUse | no | 6, 25, 30, 38, 39, 40, 41 |
| [`log facebook capture`](#log-facebook-capture) | Read a run's raw HAR (any browser driver) and its scripts with offline rea; --docs builds every platform's client docs, rea reading each request's code. No browser. | `facebook` first | `--har <path>` `--out <dir>` `--noRea` `--json` `--settle <runCaptureDir>` `--docs` | none | none | `capture` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 19, 22, 26, 27, 46, 48, 85, 30, 38, 39, 40, 41 |
| [`log runs`](#log-runs) | The recorded runs on this machine, and pruning the ones rea settled and the request docs hold, keeping each one's findings and domains | any (none) | `--json` `--before <YYYY-MM-DD>` `--apply` | none | none | `runsList`, `runsExchanges`, `runsPrune`, `runsSpace` | PreToolUse, PostToolUse · PostToolUse | no | 19, 22, 25, 27, 66, 73, 30, 38, 39, 40, 41 |
| [`log browsers`](#log-browsers) | Where every open browser is: its page, the known page state it sits on, the call that resolves it, and what only matt can clear (rules 54-55) | any (none) | `--json` | none | none | `browsers` | PreToolUse, PostToolUse · PostToolUse | no | 29, 35, 54, 55, 30, 38, 39, 40, 41 |
| [`log job`](#log-job) | Follow or stop a long MCP run: each runs as a job when it outlasts its call's wait | any (none) | `--afterLine <n>` `--waitMs <ms>` `--json` | none | none | `jobStatus`, `jobCancel`, `jobList` | PreToolUse, PostToolUse · PostToolUse | no | 10, 26, 35, 30, 38, 39, 40, 41 |
| [`log mcp`](#log-mcp) | This server's MCP sign-ins over OAuth (through Twenty, the owner only): list the clients, revoke them | any (none) | `--json` | none | none | terminal only: manages who may sign in to this server's MCP (OAuth through Twenty). matt runs `bun bin/log.ts mcp clients` or `mcp revoke <clientId\|all>` in a terminal on the server. | PreToolUse, PostToolUse · n/a | no | 21, 47, 30, 38, 39, 40, 41 |
| [`log login`](#log-login) | Sign in with Twenty through blaster's web app (OAuth), like `blaster login` | any (none) | `--webUrl <url>` `--apiUrl <url>` `--token <accessToken>` `--json` | none | none | terminal only: opens a browser for Twenty OAuth and waits for it. Run `bun bin/log.ts login` in a terminal. | PreToolUse, PostToolUse · n/a | no | 30, 38, 39, 40, 41 |
| [`log logout`](#log-logout) | Forget the stored Twenty session | any (none) | `--apiUrl <url>` `--json` | none | none | `logout` | PreToolUse, PostToolUse · PostToolUse | no | 30, 38, 39, 40, 41 |
| [`log whoami`](#log-whoami) | Show who is signed in, refreshing the session if it expired | any (none) | `--apiUrl <url>` `--json` | none | none | `whoami` | PreToolUse, PostToolUse · PostToolUse | no | 30, 38, 39, 40, 41 |
| [`log twitter session`](#log-twitter-session) | Check that X still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty | `twitter` first | `--account <accountName>` `--json` | direct API only | none | `twitterSessionCheck` | PreToolUse, PostToolUse · PostToolUse | no | 13, 21, 26, 63, 64, 73, 80, 81, 30, 38, 39, 40, 41 |
| [`log twitter follows`](#log-twitter-follows) | Read whether handles follow an X account and it follows them, on the direct-API engine, sending nothing | `twitter` first | `--account <accountName>` `--handles <handle,handle…>` `--json` | direct API only | none | `twitterFollows` | PreToolUse, PostToolUse · PostToolUse | no | 13, 53, 63, 64, 73, 80, 81, 30, 38, 39, 40, 41 |
| [`log twitter dms`](#log-twitter-dms) | Read an X account's direct messages and who is waiting on a reply, on the direct-API engine, sending nothing | `twitter` first | `--account <accountName>` `--limit <n>` `--waiting` `--with <handle>` `--conversation <id>` `--full` `--json` | direct API only | none | `twitterDms` | PreToolUse, PostToolUse · PostToolUse | no | 13, 63, 64, 73, 80, 81, 88, 94, 30, 38, 39, 40, 41 |
| [`log twitter chat`](#log-twitter-chat) | X Chat's PIN for the account's encrypted DMs: asked in a Clack prompt, kept in Twenty, never printed | `twitter` first | `--account <accountName>` `--show` `--seconds <n>` `--inbox` `--json` | direct API only | none | terminal only: asks matt for the X Chat PIN in a Clack prompt (masked). He runs `bun bin/log.ts twitter chat pin --account <a>` in a terminal. | PreToolUse, PostToolUse · n/a | no | 13, 21, 26, 63, 64, 73, 80, 81, 88, 94, 30, 38, 39, 40, 41 |
| [`log twitter cookies`](#log-twitter-cookies) | Add or refresh an X account in Twenty: its session cookies from a masked prompt, checked against X, and its copy style | `twitter` first | `--account <handle>` `--style <copyStyle>` `--name <label>` | direct API only | none | terminal only: asks for an account's session cookies in a Clack prompt (masked) and checks them with the platform before saving. Run `bun bin/log.ts twitter cookies save --account <handle>` or `bun bin/log.ts linkedin cookies save --account <publicId>` in a terminal. | PreToolUse, PostToolUse · n/a | no | 13, 21, 63, 64, 73, 80, 81, 30, 38, 39, 40, 41 |
| [`log voice`](#log-voice) | Gate a draft against matt's own writing guide with SubQ before anything is sent as him, sending nothing | any (none) | `--to <handle>` `--text` `--context` `--with <person or chat>` `--json` | none | none | `voice`, `voiceIndex` | PreToolUse, PostToolUse · PostToolUse | no | 30, 39, 41, 63, 64, 30, 38, 39, 40, 41 |
| [`log search`](#log-search) | Hybrid search across every conversation (BM25 keyword + vector meaning, fused with RRF), and building its indexes | any (none) | `--limit <n>` `--platform <p>` `--account <a>` `--with <handle>` `--after <YYYY-MM-DD>` `--json` `--saved` `--rebuild` `--rounds <n>` | none | none | `search`, `searchIndex`, `searchBench` | PreToolUse, PostToolUse · PostToolUse | no | 13, 26, 63, 64, 88, 89, 30, 38, 39, 40, 41 |
| [`log kb`](#log-kb) | The knowledge base: search it, sync every source into Twenty and Redis, remember a note, show an article | any (none) | `--kind <kind>` `--limit <n>` `--json` `--noAccounts` `--title <t>` `--tags <a,b>` | none | none | `kbSearch`, `kbSync`, `kbRemember`, `kbShow` | PreToolUse, PostToolUse · PostToolUse | no | 13, 26, 30, 93, 30, 38, 39, 40, 41 |
| [`log twitter followers`](#log-twitter-followers) | Read an X account's own followers on the direct-API engine, sending nothing | `twitter` first | `--account <accountName>` `--limit <n>` `--json` | direct API only | none | `twitterFollowers` | PreToolUse, PostToolUse · PostToolUse | no | 13, 63, 64, 73, 80, 81, 30, 38, 39, 40, 41 |
| [`log twitter reply`](#log-twitter-reply) | Reply to one post on X with approved copy, on the direct-API engine; a dry run unless --live | `twitter` first | `--account <accountName>` `--tweet <postUrl>` `--text` `--approvedBy <who>` `--skipStyleCheck` `--force` `--live` `--json` | direct API only | none | `twitterReply`, `twitterReplyLive` | PreToolUse, PostToolUse · PostToolUse | no | 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 30, 38, 39, 40, 41 |
| [`log twitter quote`](#log-twitter-quote) | Quote one post on X with approved copy, on the direct-API engine; a dry run unless --live | `twitter` first | `--account <accountName>` `--tweet <postUrl>` `--text` `--approvedBy <who>` `--skipStyleCheck` `--force` `--live` `--json` | direct API only | none | `twitterQuote`, `twitterQuoteLive` | PreToolUse, PostToolUse · PostToolUse | no | 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 30, 38, 39, 40, 41 |
| [`log twitter post`](#log-twitter-post) | Make one original post on X with approved copy and optional media (a video, a gif or up to 4 images), on the direct-API engine; a dry run unless --live | `twitter` first | `--account <accountName>` `--text` `--media <file>` `--approvedBy <who>` `--skipStyleCheck` `--force` `--live` `--json` | direct API only | none | `twitterPost`, `twitterPostLive` | PreToolUse, PostToolUse · PostToolUse | no | 8, 13, 63, 64, 73, 80, 81, 86, 94, 30, 38, 39, 40, 41 |
| [`log twitter like`](#log-twitter-like) | Like one post on X, on the direct-API engine; a dry run unless --live | `twitter` first | `--account <accountName>` `--tweet <postUrl>` `--approvedBy <who>` `--force` `--live` `--json` | direct API only | none | `twitterLike`, `twitterLikeLive` | PreToolUse, PostToolUse · PostToolUse | no | 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 30, 38, 39, 40, 41 |
| [`log twitter follow`](#log-twitter-follow) | Follow one person on X, on the direct-API engine; a dry run unless --live | `twitter` first | `--account <accountName>` `--userId <id>` `--approvedBy <who>` `--force` `--live` `--json` | direct API only | none | `twitterFollow`, `twitterFollowLive` | PreToolUse, PostToolUse · PostToolUse | no | 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 30, 38, 39, 40, 41 |
| [`log twitter dm`](#log-twitter-dm) | Send one approved direct message on X, on the direct-API engine; a dry run unless --live | `twitter` first | `--account <accountName>` `--userId <id>` `--text` `--approvedBy <who>` `--skipStyleCheck` `--asOne` `--force` `--live` `--json` | direct API only | none | `twitterDm`, `twitterDmLive` | PreToolUse, PostToolUse · PostToolUse | no | 8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 30, 38, 39, 40, 41 |
| [`log twitter queue`](#log-twitter-queue) | Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine | `twitter` first | `--targets <targets.json>` `--variations <a.json,b.json>` `--out <queue.json>` `--account <accountName>` `--action` `--seed <n>` `--json` `--skipXChatCheck` `--by <who>` `--window <5h|90m>` `--limit <n>` `--start <time>` `--minGap <s>` `--like` `--likeChance <0-1>` `--alertChannel <uuid>` `--alertReplyTo <eventId>` `--alertMention <hex,hex>` `--force` `--live` `--replies <n>` | direct API only | none | `twitterQueueBuild`, `twitterQueueShow`, `twitterQueueCheck`, `twitterQueueStatus`, `twitterQueueApprove`, `twitterQueuePlan`, `twitterQueueRun`, `twitterQueueRunLive`, `twitterQueueNudge` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87, 94, 30, 38, 39, 40, 41 |
| [`log new`](#log-new) | Make a new platform (session, command, MCP tool, engine, docs), wired into the repo through its syntax tree | any (none) | `--label <shown name>` `--twentyPlatform <ENUM>` `--library <vendor/folder>` `--sessionCookies <a,b>` `--cookieDomain <.site.com>` `--hosts <a.com,b.com>` `--home <https://…>` `--noProxy` `--noBrowser` `--apply` `--json` | none | none | `newPlatform` | PreToolUse, PostToolUse · PostToolUse | no | 1, 2, 63, 64, 83, 30, 38, 39, 40, 41 |
| [`log reddit session`](#log-reddit-session) | Check that Reddit still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty | `reddit` first | `--account <accountName>` `--json` | direct API only | none | `redditSessionCheck` | PreToolUse, PostToolUse · PostToolUse | no | 13, 63, 64, 73, 83, 30, 38, 39, 40, 41 |
| [`log discord session`](#log-discord-session) | Check that Discord still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty | `discord` first | `--account <accountName>` `--json` | direct API only | none | `discordSessionCheck` | PreToolUse, PostToolUse · PostToolUse | no | 13, 63, 64, 73, 83, 94, 30, 38, 39, 40, 41 |
| [`log discord chats`](#log-discord-chats) | List the account's DMs and group DMs with their ids, on the direct-API engine, sending nothing | `discord` first | `--account <accountName>` `--json` | direct API only | none | `discordChats` | PreToolUse, PostToolUse · PostToolUse | no | 13, 63, 64, 73, 83, 94, 30, 38, 39, 40, 41 |
| [`log discord read`](#log-discord-read) | Read a Discord chat or channel's latest messages, on the direct-API engine, sending nothing | `discord` first | `--account <accountName>` `--channel <channelId|chat name>` `--limit <n>` `--after <messageId>` `--json` | direct API only | the account's | `discordRead` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 13, 63, 64, 73, 83, 94, 30, 38, 39, 40, 41 |
| [`log discord watch`](#log-discord-watch) | Watch the account's Discord messages as Discord pushes them over its gateway, nothing polled, sending nothing | `discord` first | `--account <accountName>` `--channel <channelId|chat name>` `--seconds <s>` `--inbox` `--json` | direct API only | Camoufox only | `discordWatch` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 13, 26, 63, 64, 73, 83, 94, 30, 38, 39, 40, 41 |
| [`log discord send`](#log-discord-send) | Send one message to a Discord DM, group or channel, on the direct-API engine; a dry run unless --live | `discord` first | `--account <accountName>` `--channel <channelId|chat name>` `--text` `--asOne` `--approvedBy <who>` `--live` `--json` | direct API only | none | `discordSend`, `discordSendLive` | PreToolUse, PostToolUse · PostToolUse | no | 8, 13, 63, 64, 73, 83, 90, 91, 94, 30, 38, 39, 40, 41 |
| [`log linkedin session`](#log-linkedin-session) | Check that LinkedIn still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty | `linkedin` first | `--account <accountName>` `--json` | direct API only | none | `linkedinSessionCheck` | PreToolUse, PostToolUse · PostToolUse | no | 13, 63, 64, 73, 83, 30, 38, 39, 40, 41 |
| [`log linkedin cookies`](#log-linkedin-cookies) | Add or refresh a LinkedIn account in Twenty: its session cookies from a masked prompt, checked against LinkedIn | `linkedin` first | `--account <publicId>` `--name <label>` | direct API only | none | terminal only: asks for an account's session cookies in a Clack prompt (masked) and checks them with the platform before saving. Run `bun bin/log.ts twitter cookies save --account <handle>` or `bun bin/log.ts linkedin cookies save --account <publicId>` in a terminal. | PreToolUse, PostToolUse · n/a | no | 13, 21, 63, 64, 73, 83, 30, 38, 39, 40, 41 |

### Saved flows: MCP tools of their own (rule 31)

| MCP tool | Runs | What it does | Params | Steps |
| --- | --- | --- | --- | --- |
| `flowDeletePost`, `flowDeletePostLive` | `log flow run deletePost` | Delete the newest post on the account's own profile: its Actions menu, Move to bin, Move (useCometTrashPostMutation; Facebook empties the bin after 30 days). Writes on Facebook (--live). | none | gotoprofilePhp → clickActionsForThisPost → clickMoveToBinItems → clickMove |
| `flowFacebookLanguageEnglish`, `flowFacebookLanguageEnglishLive` | `log flow run facebookLanguageEnglish` | Switch the account's Facebook language to English (US): Settings, Language and region, Account language, English (US), OK; decided by useCometUSFScrollablePickerMutation answering en_US. Recorded on Scranton 2026-10-25 from Arabic. | none | gotosettings → click → clickEnglishUs → click |
| `flowGroupHeaderMenus`, `flowGroupHeaderMenusLive` | `log flow run groupHeaderMenus` | Open and close the group header's search, More menu, Joined menu, Invite dialog and Share sheet; nothing inside them is picked | `groupId` | gotogroups → clickSearchWithinThisGroup → pressEscape → clickMore → pressEscape → clickJoined → pressEscape → clickInvite → pressEscape → clickShareGroup → pressEscape |
| `flowGroupMembers`, `flowGroupMembersLive` | `log flow run groupMembers` | Open a group's People tab and scroll it read-only so Facebook loads the member list (bio line, page category) for extraction | none | gotogroupsJunkremovalwinners → gotogroupsJunkremovalwinnersMembers → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll |
| `flowGroupPostComments`, `flowGroupPostCommentsLive` | `log flow run groupPostComments` | On a group's Open questions tab, open a post's comments, switch the sort to All comments and scroll them; read-only | `groupId` | gotogroupsQuestions → clickLeaveAComment → clickMostRelevant → clickAllCommentsShowAll → scroll |
| `flowGroupPostDialog`, `flowGroupPostDialogLive` | `log flow run groupPostDialog` | On a group's Discussion feed, open a post in its dialog with Leave a comment (the comment box takes focus, nothing is typed) and close it | `groupId` | gotogroups → clickLeaveAComment → clickClose |
| `flowGroupTabs`, `flowGroupTabsLive` | `log flow run groupTabs` | Open each tab of a group the account is in (Featured, Open questions, People, Events, Media, Files, About) and come back to Discussion; read-only | `groupId` | gotogroups → clickFeatured → clickOpenQuestions → clickPeople → clickEvents → clickMedia → clickFiles → clickAbout → clickDiscussion |
| `flowMarketplaceListingDelete`, `flowMarketplaceListingDeleteLive` | `log flow run marketplaceListingDelete` | Delete one Marketplace listing from the Selling page: its More options menu, Delete listing, Delete, then "No, haven't sold" on Facebook's survey. Recorded on Bethlehem, 2026-10-23 (listing 1425935622848350). | `listingTitle`, `listingId` | gotomarketplaceYouSelling → clickMoreOptions → clickDeleteListing → clickDelete → clickNoHavenTSold → clickNext |
| `flowMarketplaceListingPublish`, `flowMarketplaceListingPublishLive` | `log flow run marketplaceListingPublish` | Publish one Marketplace listing in the account's open AdsPower browser: set the Marketplace location (City, State written out), open Create, two photos, title, price, category Miscellaneous, condition New, description, Next, Publish, close the Boost offer. Recorded on Bethlehem 2026-10-22 (listing 1425935622848350, held for review). | `location`, `photo1`, `photo2`, `title`, `price`, `description` | gotomarketplace → setLocation → gotomarketplaceCreateItem → uploadAddPhotosOrDrag → uploadAddPhoto → fillTitle → fillPrice → clickCategory → clickMiscellaneous → clickCondition → clickNew → fillDescription → clickNext → clickPublish → clickClose |
| `flowMessengerPinCreate`, `flowMessengerPinCreateLive` | `log flow run messengerPinCreate` | Messenger's Create a PIN: open /messages/, press Create PIN, type the account's PIN from Twenty, then again to confirm (rule 67). Recorded on Bethlehem 2026-10-22. | none | gotomessages → clickCreatePin → pin → pin |
| `flowPostComment`, `flowPostCommentLive` | `log flow run postComment` | Comment on the newest post on the account's own profile: type in its Write a comment box, Post comment (useCometUFICreateCommentMutation). Writes on Facebook (--live). | `comment` | gotoprofilePhp → fillWriteAComment → clickPostComment |
| `flowProfilePhotoPost`, `flowProfilePhotoPostLive` | `log flow run profilePhotoPost` | Post a photo on the account's own profile: Photo/video hands the file to the chooser, the upload finishes, Post, wait for ComposerStoryCreateMutation. Writes on Facebook (--live). | `photo` | gotoprofilePhp → uploadPhotoVideo → clickPost |
| `flowProfilePost`, `flowProfilePostLive` | `log flow run profilePost` | Post text on the account's own profile: open the composer, type the text, Post, wait for ComposerStoryCreateMutation. Writes on Facebook (--live). | `text` | gotoprofilePhp → clickWhatSOnYour → fillWhatSOnYour → clickPost |
| `flowProfileSetup`, `flowProfileSetupLive` | `log flow run profileSetup` | Give an account its profile picture, cover photo and name, as recorded on Lancaster 2026-10-19 (rule 28): profile picture menu, Choose profile picture, Upload Photo, Save; Add Cover Photo, Upload photo, Save changes; Accounts Center name, Review change, Done. | `profilePhoto`, `coverPhoto`, `firstName`, `lastName` | gotome → clickProfilePictureActions → clickChooseProfilePicture → uploadUploadPhoto → clickSave → clickAddCoverPhoto → uploadUploadPhoto → clickSaveChanges → gotoprofilesName → fillFirstName → fillSurname → clickReviewChange → clickDone |
| `flowWarmupCreateAccessCheck`, `flowWarmupCreateAccessCheckLive` | `log flow run warmupCreateAccessCheck` | Warm-up createAccessCheck: Listaro's runStage3, account-warmup.ts:181-209, recorded on 61594063207669 2026-10-22 (rule 35). | none | gotomarketplace → dwell → gotomarketplaceCreateItem → dwell → gotomarketplace → scroll |
| `flowWarmupFeedBrowse`, `flowWarmupFeedBrowseLive` | `log flow run warmupFeedBrowse` | Warm-up feedBrowse: Listaro's runStage1, account-warmup.ts:92-130, recorded on 61594063207669 2026-10-22 (rule 35). | none | goto → dwell → scroll → gotomarketplace → dwell → scroll |
| `flowWarmupMarketplaceBrowse`, `flowWarmupMarketplaceBrowseLive` | `log flow run warmupMarketplaceBrowse` | Warm-up marketplaceBrowse: Listaro's runStage2, account-warmup.ts:135-174, recorded on 61594063207669 2026-10-22 (rule 35). | none | gotomarketplace → dwell → scroll → openAny |
| `flowWarmupMessagesVisit`, `flowWarmupMessagesVisitLive` | `log flow run warmupMessagesVisit` | Warm-up messagesVisit: Listaro's runStage4or5 (stage 5), account-warmup.ts:214-246, recorded on 61594063207669 2026-10-22 (rule 35). | none | gotomarketplace → scroll → gotomarketplaceYouSelling → dwell → gotomessages → dwell → scroll |
| `flowWarmupSellingVisit`, `flowWarmupSellingVisitLive` | `log flow run warmupSellingVisit` | Warm-up sellingVisit: Listaro's runStage4or5 (stage 4), account-warmup.ts:214-246, recorded on 61594063207669 2026-10-22 (rule 35). | none | gotomarketplace → scroll → gotomarketplaceYouSelling → dwell |

### Every command, CLI and MCP

Each command is a CLI command and, unless terminal-only, an MCP tool; the long-running ones write the live log. Grouped by platform: a platform's command is `log <platform> <command>` (rule 63). Saved flows are MCP tools that run `log flow run`.

```mermaid
flowchart TB
  cli["log (CLI)"]
  mcp["MCP server log"]
  live[("live log")]
  terminal["terminal only"]
  subgraph g_any["Any platform"]
    c_launch["launch"]
    c_adsPower["adsPower"]
    c_inspect["inspect"]
    c_flow["flow"]
    c_proxy["proxy"]
    c_errors["errors"]
    c_graph["graph"]
    c_runs["runs"]
    c_browsers["browsers"]
    c_job["job"]
    c_mcp["mcp"]
    c_login["login"]
    c_logout["logout"]
    c_whoami["whoami"]
    c_voice["voice"]
    c_search["search"]
    c_kb["kb"]
    c_new["new"]
  end
  subgraph g_byArgument["Platform named first"]
    c_warmup["#lt;platform#gt; warmup"]
  end
  subgraph g_facebook["Facebook"]
    c_listings["listings"]
    c_listing["listing"]
    c_accounts["accounts"]
    c_account["account"]
    c_lifecycle["lifecycle"]
    c_preflight["preflight"]
    c_doctor["doctor"]
    c_connect["connect"]
    c_profile["profile"]
    c_host["host"]
    c_join["join"]
    c_read["read"]
    c_poll["poll"]
    c_check["check"]
    c_scan["scan"]
    c_status["status"]
    c_watch["watch"]
    c_publish["publish"]
    c_campaign["campaign"]
    c_conversations["conversations"]
    c_conversation["conversation"]
    c_messenger["messenger"]
    c_capture["capture"]
  end
  subgraph g_twitter["X"]
    c_twitterSession["session"]
    c_twitterFollows["follows"]
    c_twitterDms["dms"]
    c_twitterChat["chat"]
    c_twitterCookies["cookies"]
    c_twitterFollowers["followers"]
    c_twitterReply["reply"]
    c_twitterQuote["quote"]
    c_twitterPost["post"]
    c_twitterLike["like"]
    c_twitterFollow["follow"]
    c_twitterDm["dm"]
    c_twitterQueue["queue"]
  end
  subgraph g_reddit["Reddit"]
    c_redditSession["session"]
  end
  subgraph g_discord["Discord"]
    c_discordSession["session"]
    c_discordChats["chats"]
    c_discordRead["read"]
    c_discordWatch["watch"]
    c_discordSend["send"]
  end
  subgraph g_linkedin["LinkedIn"]
    c_linkedinSession["session"]
    c_linkedinCookies["cookies"]
  end
  cli --> c_launch
  c_launch -.- terminal
  cli --> c_listings
  mcp --> c_listings
  cli --> c_listing
  mcp --> c_listing
  cli --> c_accounts
  mcp --> c_accounts
  cli --> c_account
  mcp --> c_account
  cli --> c_adsPower
  mcp --> c_adsPower
  cli --> c_lifecycle
  mcp --> c_lifecycle
  cli --> c_preflight
  mcp --> c_preflight
  cli --> c_doctor
  mcp --> c_doctor
  c_doctor --> live
  cli --> c_connect
  mcp --> c_connect
  c_connect --> live
  cli --> c_profile
  mcp --> c_profile
  c_profile --> live
  cli --> c_host
  mcp --> c_host
  c_host --> live
  cli --> c_inspect
  mcp --> c_inspect
  c_inspect --> live
  cli --> c_flow
  mcp --> c_flow
  c_flow --> live
  cli --> c_warmup
  mcp --> c_warmup
  c_warmup --> live
  cli --> c_join
  mcp --> c_join
  c_join --> live
  cli --> c_read
  mcp --> c_read
  c_read --> live
  cli --> c_poll
  mcp --> c_poll
  c_poll --> live
  cli --> c_check
  mcp --> c_check
  c_check --> live
  cli --> c_scan
  mcp --> c_scan
  c_scan --> live
  cli --> c_status
  mcp --> c_status
  c_status --> live
  cli --> c_watch
  mcp --> c_watch
  c_watch --> live
  cli --> c_proxy
  mcp --> c_proxy
  cli --> c_publish
  mcp --> c_publish
  c_publish --> live
  cli --> c_campaign
  mcp --> c_campaign
  c_campaign --> live
  cli --> c_conversations
  mcp --> c_conversations
  cli --> c_conversation
  mcp --> c_conversation
  cli --> c_messenger
  c_messenger -.- terminal
  cli --> c_errors
  mcp --> c_errors
  cli --> c_graph
  mcp --> c_graph
  cli --> c_capture
  mcp --> c_capture
  c_capture --> live
  cli --> c_runs
  mcp --> c_runs
  cli --> c_browsers
  mcp --> c_browsers
  cli --> c_job
  mcp --> c_job
  cli --> c_mcp
  c_mcp -.- terminal
  cli --> c_login
  c_login -.- terminal
  cli --> c_logout
  mcp --> c_logout
  cli --> c_whoami
  mcp --> c_whoami
  cli --> c_twitterSession
  mcp --> c_twitterSession
  cli --> c_twitterFollows
  mcp --> c_twitterFollows
  cli --> c_twitterDms
  mcp --> c_twitterDms
  cli --> c_twitterChat
  c_twitterChat -.- terminal
  cli --> c_twitterCookies
  c_twitterCookies -.- terminal
  cli --> c_voice
  mcp --> c_voice
  cli --> c_search
  mcp --> c_search
  cli --> c_kb
  mcp --> c_kb
  cli --> c_twitterFollowers
  mcp --> c_twitterFollowers
  cli --> c_twitterReply
  mcp --> c_twitterReply
  cli --> c_twitterQuote
  mcp --> c_twitterQuote
  cli --> c_twitterPost
  mcp --> c_twitterPost
  cli --> c_twitterLike
  mcp --> c_twitterLike
  cli --> c_twitterFollow
  mcp --> c_twitterFollow
  cli --> c_twitterDm
  mcp --> c_twitterDm
  cli --> c_twitterQueue
  mcp --> c_twitterQueue
  c_twitterQueue --> live
  cli --> c_new
  mcp --> c_new
  cli --> c_redditSession
  mcp --> c_redditSession
  cli --> c_discordSession
  mcp --> c_discordSession
  cli --> c_discordChats
  mcp --> c_discordChats
  cli --> c_discordRead
  mcp --> c_discordRead
  c_discordRead --> live
  cli --> c_discordWatch
  mcp --> c_discordWatch
  c_discordWatch --> live
  cli --> c_discordSend
  mcp --> c_discordSend
  cli --> c_linkedinSession
  mcp --> c_linkedinSession
  cli --> c_linkedinCookies
  c_linkedinCookies -.- terminal
  f_deletePost["flowDeletePost: flow run deletePost"]
  mcp --> f_deletePost
  f_deletePost --> c_flow
  f_facebookLanguageEnglish["flowFacebookLanguageEnglish: flow run facebookLanguageEnglish"]
  mcp --> f_facebookLanguageEnglish
  f_facebookLanguageEnglish --> c_flow
  f_groupHeaderMenus["flowGroupHeaderMenus: flow run groupHeaderMenus"]
  mcp --> f_groupHeaderMenus
  f_groupHeaderMenus --> c_flow
  f_groupMembers["flowGroupMembers: flow run groupMembers"]
  mcp --> f_groupMembers
  f_groupMembers --> c_flow
  f_groupPostComments["flowGroupPostComments: flow run groupPostComments"]
  mcp --> f_groupPostComments
  f_groupPostComments --> c_flow
  f_groupPostDialog["flowGroupPostDialog: flow run groupPostDialog"]
  mcp --> f_groupPostDialog
  f_groupPostDialog --> c_flow
  f_groupTabs["flowGroupTabs: flow run groupTabs"]
  mcp --> f_groupTabs
  f_groupTabs --> c_flow
  f_marketplaceListingDelete["flowMarketplaceListingDelete: flow run marketplaceListingDelete"]
  mcp --> f_marketplaceListingDelete
  f_marketplaceListingDelete --> c_flow
  f_marketplaceListingPublish["flowMarketplaceListingPublish: flow run marketplaceListingPublish"]
  mcp --> f_marketplaceListingPublish
  f_marketplaceListingPublish --> c_flow
  f_messengerPinCreate["flowMessengerPinCreate: flow run messengerPinCreate"]
  mcp --> f_messengerPinCreate
  f_messengerPinCreate --> c_flow
  f_postComment["flowPostComment: flow run postComment"]
  mcp --> f_postComment
  f_postComment --> c_flow
  f_profilePhotoPost["flowProfilePhotoPost: flow run profilePhotoPost"]
  mcp --> f_profilePhotoPost
  f_profilePhotoPost --> c_flow
  f_profilePost["flowProfilePost: flow run profilePost"]
  mcp --> f_profilePost
  f_profilePost --> c_flow
  f_profileSetup["flowProfileSetup: flow run profileSetup"]
  mcp --> f_profileSetup
  f_profileSetup --> c_flow
  f_warmupCreateAccessCheck["flowWarmupCreateAccessCheck: flow run warmupCreateAccessCheck"]
  mcp --> f_warmupCreateAccessCheck
  f_warmupCreateAccessCheck --> c_flow
  f_warmupFeedBrowse["flowWarmupFeedBrowse: flow run warmupFeedBrowse"]
  mcp --> f_warmupFeedBrowse
  f_warmupFeedBrowse --> c_flow
  f_warmupMarketplaceBrowse["flowWarmupMarketplaceBrowse: flow run warmupMarketplaceBrowse"]
  mcp --> f_warmupMarketplaceBrowse
  f_warmupMarketplaceBrowse --> c_flow
  f_warmupMessagesVisit["flowWarmupMessagesVisit: flow run warmupMessagesVisit"]
  mcp --> f_warmupMessagesVisit
  f_warmupMessagesVisit --> c_flow
  f_warmupSellingVisit["flowWarmupSellingVisit: flow run warmupSellingVisit"]
  mcp --> f_warmupSellingVisit
  f_warmupSellingVisit --> c_flow
```

Source: [`docs/diagrams/commands.mmd`](docs/diagrams/commands.mmd).

### The hooks (rule 55)

One list (`src/agentHooks/registry`) writes Claude Code's `.claude/settings.json` and Codex's `.codex/hooks.json`. How to add one: `skills/agentHooks/SKILL.md`.

| Event | Matcher | Script | What it does |
| --- | --- | --- | --- |
| SessionStart | `startup\|resume\|clear\|compact` | [`scripts/hooks/pageState.ts`](scripts/hooks/pageState.ts) | where every open browser is, the moment a session starts or comes back from compaction |
| UserPromptSubmit | every turn | [`scripts/hooks/pageState.ts`](scripts/hooks/pageState.ts) | where every open browser is, with each of matt's prompts |
| SessionStart | `startup\|resume\|clear\|compact` | [`scripts/hooks/storage.ts`](scripts/hooks/storage.ts) | ~/.logCli/runs over 2 GB or the disk nearly full: said with `log runs prune` before AdsPower refuses to start |
| UserPromptSubmit | every turn | [`scripts/hooks/storage.ts`](scripts/hooks/storage.ts) | the same storage check with each of matt's prompts (measured at most every 15 minutes) |
| SessionStart | `startup\|resume\|clear\|compact` | [`scripts/hooks/engines.ts`](scripts/hooks/engines.ts) | which commands run on the direct-API engine (from DIRECT_ROUTES) and each account's session state and governor use, so a session coming back from compaction knows the engines; and, loudly, when the log MCP server runs older code than the checkout |
| UserPromptSubmit | every turn | [`scripts/hooks/engines.ts`](scripts/hooks/engines.ts) | the same engine line with matt's prompt, only when an account's session state, its governor use or the MCP server's freshness changed |
| SessionStart | `startup\|resume\|clear\|compact` | [`scripts/hooks/knowledge.ts`](scripts/hooks/knowledge.ts) | the knowledge base is there and how to search it and save to it, with how many chunks Redis holds, so a session looks things up before it guesses (rule 93) |
| SessionStart | `startup\|resume\|clear\|compact` | [`scripts/hooks/inbox.ts`](scripts/hooks/inbox.ts) | anyone who wrote to a signed-in account's inbox since the last look (every platform's inbox, incl. X Chat, read in the background every 4 to 8 minutes), said loudly so a reply is never missed; and, from each X account's local inbox store with no network, who wrote last and is waiting on a reply |
| UserPromptSubmit | every turn | [`scripts/hooks/inbox.ts`](scripts/hooks/inbox.ts) | the same inbox check with each of matt's prompts: a poll starts when one is due, and new messages from the last poll are put in front of the agent |
| PostToolUse | `Bash\|PowerShell\|Monitor\|mcp__log__.*` | [`scripts/hooks/inbox.ts`](scripts/hooks/inbox.ts) | the same inbox check after a log tool or shell call, so a reply that lands mid-task is said at once |
| PreToolUse | `Bash\|PowerShell\|Monitor` | [`scripts/hooks/liveLogs.ts`](scripts/hooks/liveLogs.ts) | a log-cli run that would hide its lines (piped through tail or head) is refused before it starts; a long one off a Monitor is told to start one (rule 26) |
| PostToolUse | `Bash\|PowerShell\|Monitor\|mcp__log__.*` | [`scripts/hooks/pageState.ts`](scripts/hooks/pageState.ts) | a browser landed on a known state (checkpoint, captcha, prompt) or a step failed: its resolver, at once |
| Stop | every turn | [`scripts/hooks/pageState.ts`](scripts/hooks/pageState.ts) | the turn does not end while a browser sits on a state log-cli can resolve (rule 54) |

Around every turn, whatever is called: SessionStart (pageState.ts, storage.ts, engines.ts, knowledge.ts, inbox.ts), UserPromptSubmit (pageState.ts, storage.ts, engines.ts, inbox.ts), Stop (pageState.ts).

### The hooks in one turn

Written from `AGENT_HOOKS` (`src/agentHooks/registry`); the same list gives Claude Code's `.claude/settings.json` and Codex's `.codex/hooks.json`.

```mermaid
sequenceDiagram
  participant matt
  participant Agent
  participant Hook as log-cli hooks
  participant Tool as Bash / PowerShell / Monitor / mcp__log__*
  Agent->>Hook: SessionStart
  Note over Hook: where every open browser is, the moment a session starts or comes back from compaction
  Note over Hook: ~/.logCli/runs over 2 GB or the disk nearly full: said with `log runs prune` before AdsPower refuses to start
  Note over Hook: which commands run on the direct-API engine (from DIRECT_ROUTES) and each account's session state and governor use, so a session coming back from compaction knows the engines#59; and, loudly, when the log MCP server runs older code than the checkout
  Note over Hook: the knowledge base is there and how to search it and save to it, with how many chunks Redis holds, so a session looks things up before it guesses (rule 93)
  Note over Hook: anyone who wrote to a signed-in account's inbox since the last look (every platform's inbox, incl. X Chat, read in the background every 4 to 8 minutes), said loudly so a reply is never missed#59; and, from each X account's local inbox store with no network, who wrote last and is waiting on a reply
  matt->>Agent: a prompt
  Agent->>Hook: UserPromptSubmit
  Note over Hook: where every open browser is, with each of matt's prompts
  Note over Hook: the same storage check with each of matt's prompts (measured at most every 15 minutes)
  Note over Hook: the same engine line with matt's prompt, only when an account's session state, its governor use or the MCP server's freshness changed
  Note over Hook: the same inbox check with each of matt's prompts: a poll starts when one is due, and new messages from the last poll are put in front of the agent
  loop each tool call
    Agent->>Hook: PreToolUse
    Note over Hook: a log-cli run that would hide its lines (piped through tail or head) is refused before it starts#59; a long one off a Monitor is told to start one (rule 26)
    alt a log run piped through tail/head
      Hook-->>Agent: refused (exit 2), run it live
    else
      Agent->>Tool: the call
      Tool-->>Agent: its result
      Agent->>Hook: PostToolUse
    Note over Hook: the same inbox check after a log tool or shell call, so a reply that lands mid-task is said at once
    Note over Hook: a browser landed on a known state (checkpoint, captcha, prompt) or a step failed: its resolver, at once
    end
  end
  Agent->>Hook: Stop
  Note over Hook: the turn does not end while a browser sits on a state log-cli can resolve (rule 54)
  alt a browser sits on a state log-cli clears
    Hook-->>Agent: decision block, with the state's resolver
  else nothing to clear, or a person's state
    Agent-->>matt: the answer
  end
```

Source: [`docs/diagrams/hooks.mmd`](docs/diagrams/hooks.mmd).

### Known page states (rule 54)

From `PAGE_STATES` (`src/browser/flow/helpers/pageState.ts`), first match wins. The hooks report each with its resolver; only a person's state stops the account.

```mermaid
flowchart LR
  page["A step lands on a page"]
  person["Stop the account, tell matt"]
  disabled["disabled: the account is disabled"]
  page --> disabled
  disabled --> person
  videoSelfie["videoSelfie: Facebook's video selfie check"]
  page --> videoSelfie
  videoSelfie --> person
  identityVerificationHold["identityVerificationHold: Facebook holds the listings until a person confirms their identity (Selling: #quot;Confirm your identity to publish this and any future listings#quot;#59; MarketplaceYourListingDialogQuery: INTEGRITY_NEEDS_VERIFICATION_VH)"]
  page --> identityVerificationHold
  identityVerificationHold --> person
  textCaptcha["textCaptcha: a text captcha (#quot;Enter the text from the image#quot;)"]
  page --> textCaptcha
  textCaptcha -->|"log inspect do solve --live --account #lt;a#gt;"| nexttextCaptcha(["next state"])
  checkpointStart["checkpointStart: a checkpoint's first page (#quot;confirm that you're human to use your account#quot;)"]
  page --> checkpointStart
  checkpointStart -->|"click Continue"| nextcheckpointStart(["next state"])
  automatedBehaviour["automatedBehaviour: #quot;We suspect automated behaviour#quot;"]
  page --> automatedBehaviour
  automatedBehaviour -->|"dismiss it, as Listaro did"| nextautomatedBehaviour(["next state"])
  browserNotificationsNotice["browserNotificationsNotice: Facebook's browser-notifications notice over the page: its text covers its own Close, so nothing under it can be pressed (Hazleton, host 20261024T211541 steps 08-13)"]
  page --> browserNotificationsNotice
  browserNotificationsNotice -->|"press Escape"| nextbrowserNotificationsNotice(["next state"])
  pastNoticeDialog["pastNoticeDialog: Facebook's #quot;What happened#quot; dialog about a limit on the account that has ended (#quot;Ended on #lt;date#gt;#quot;), over the page (Hazleton, host 20261024T211541 step 14)"]
  page --> pastNoticeDialog
  pastNoticeDialog -->|"press Escape"| nextpastNoticeDialog(["next state"])
  messengerPinCreate["messengerPinCreate: Messenger's #quot;Create a PIN to access your chats on any device#quot;: the inbox stays behind it (Bethlehem, warm-up 20261022T092119 steps 25-27)"]
  page --> messengerPinCreate
  messengerPinCreate -->|"run the recorded flow with the PIN from Twenty"| nextmessengerPinCreate(["next state"])
  messengerPinEnter["messengerPinEnter: Messenger asks for the account's PIN to open its chats here (a PIN set before, met on another browser or device). Mapped 2026-10-22 before its first recording"]
  page --> messengerPinEnter
  messengerPinEnter -->|"type the PIN from Twenty"| nextmessengerPinEnter(["next state"])
  marketplacePartnerListings["marketplacePartnerListings: Marketplace's #quot;Discover more when you shop#quot; (partner shops, shown where the Marketplace location is in Europe#59; Bethlehem was sent to Granada by a bare zip, 20261022T110738 step 2)"]
  page --> marketplacePartnerListings
  marketplacePartnerListings -->|"press its Update by ref"| nextmarketplacePartnerListings(["next state"])
  marketplaceCreateLimitReached["marketplaceCreateLimitReached: Marketplace's create page answers that this account may not post now: its HTML says `marketplace_new_seller_can_post_item: false` and the page shows #quot;Limit reached#quot; (Bethlehem, inspect 20261023T045453 step 01#59; the same field was true on 2026-10-22, runs 20261022T105341 and 20261022T110738)"]
  page --> marketplaceCreateLimitReached
  marketplaceCreateLimitReached --> person
  marketplacePartnerFeed["marketplacePartnerFeed: Marketplace answers with partner shops' listings (`product_details_type: PARTNER_LISTING`, a `partner_brand_name` and a `partner_listing_location`), from Europe though the account is in the US (Bethlehem, inspect 20261023T045453 step 03: Catawiki in Italy and buycycle-es, while `buy_location` was Bethlehem, Pennsylvania)"]
  page --> marketplacePartnerFeed
  marketplacePartnerFeed -->|"read the Marketplace location from its own answer"| nextmarketplacePartnerFeed(["next state"])
  marketplaceDeleteSurvey["marketplaceDeleteSurvey: Marketplace's #quot;Did you sell this item?#quot; survey, shown after a listing is deleted (the delete is already done: `useCometMarketplaceForSaleItemDeleteMutation` answered its id#59; Bethlehem, inspect 20261023T173652 step 05)"]
  page --> marketplaceDeleteSurvey
  marketplaceDeleteSurvey -->|"click radio #quot;No, haven't sold#quot;"| nextmarketplaceDeleteSurvey(["next state"])
  groupMembersList["groupMembersList: a group's People tab answered with more of its newest members: `GroupsCometMembersPageNewMembersSectionRefetchQuery` gave `new_members` edges, about 10 a call, each a profile with its bio, page category, followers and when they joined (61594063207669, inspect 20261024T060921 steps 04-21)"]
  page --> groupMembersList
  groupMembersList -->|"nothing to resolve"| nextgroupMembersList(["carry on"])
  rememberPassword["rememberPassword: the #quot;Remember password#quot; prompt"]
  page --> rememberPassword
  rememberPassword -->|"click #quot;Not now#quot;"| nextrememberPassword(["next state"])
  twoStepMethodPicker["twoStepMethodPicker: Facebook's two-step method picker (#quot;Choose a way to confirm it's you#quot;: Passkey, Authentication app, Backup code)#59; `TwoStepVerificationChallengePickerDialogQuery` lists them as `PASSKEY`, `TOTP`, `BACKUP_CODES` (Mountain Top, host 20261024T222706 step 15)"]
  page --> twoStepMethodPicker
  twoStepMethodPicker -->|"choose #quot;Authentication app#quot;"| nexttwoStepMethodPicker(["next state"])
  twoStepPasskey["twoStepPasskey: Facebook asks for a passkey (#quot;Use face scan, fingerprint or screen lock to confirm it's you#quot;): no code box on the page, so `code` finds nothing (Mountain Top, host 20261024T222706 steps 08-14)"]
  page --> twoStepPasskey
  twoStepPasskey -->|"press #quot;Try another way#quot;"| nexttwoStepPasskey(["next state"])
  twoStepCode["twoStepCode: two-step: the code field"]
  page --> twoStepCode
  twoStepCode -->|"log inspect do code --live --account #lt;a#gt;"| nexttwoStepCode(["next state"])
  loginForm["loginForm: the login form"]
  page --> loginForm
  loginForm -->|"log inspect do signIn --live --account #lt;a#gt;"| nextloginForm(["next state"])
  checkpoint["checkpoint: a Facebook checkpoint not mapped yet"]
  page --> checkpoint
  checkpoint -->|"take a snapshot, read the page, press its Continue/next control to see the next state"| nextcheckpoint(["next state"])
```

Source: [`docs/diagrams/pageStates.mmd`](docs/diagrams/pageStates.mmd).

### Each command's usage

#### log launch

Guided Clack menu over the listings, accounts and live commands Terminal only: prompts in a terminal (Clack). Call the commands it wraps directly.

```text
log launch [--json]
```

#### log facebook listings

List the Twenty listings, by status, account or campaign MCP tools: `listings`, one per form, with named fields.

```text
log facebook listings [--status <STATUS>] [--account <accountName>] [--campaign <campaignId>] [--json]
```

#### log facebook listing

Show one Twenty listing, or create one for an account from a JSON file MCP tools: `listing`, `listingCreate`, `listingRemove`, `listingRemoveLive`, `listingSweep`, `listingLint`, one per form, with named fields.

```text
log facebook listing <agencyListingId> [--json]
log facebook listing create --account <accountName> --file <listing.json> [--json]
log facebook listing sweep [--apply] [--json]   (every listing whose account is blocked (checkpoint, restricted, banned, dead, deactivated, or a wrong password) is marked ACCOUNT_LOST, and a campaign's copy goes to another account; a dry run unless --apply)
log facebook listing lint --file <listing.json> [--json]   (the copy rules on the file's copy versions, and whether it would publish; nothing is saved)
log facebook listing remove <agencyListingId|facebookListingId> [--live] [--bypass] [--now] [--json]   (delete it on Facebook through the recorded flow marketplaceListingDelete, then REMOVED in Twenty; a dry run unless --live)
The file: title, description, price, priceCurrency, category, condition (new|usedLikeNew|usedGood|usedFair), photos (paths or URLs), locationQuery ('City, State' with the state written out, 'Bethlehem, Pennsylvania', or 'City, Country': an abbreviation, zip or number is refused, rule 72), locationCity, locationCountry, locationPostalCode (kept, never typed), copyVersions ([{ id, title, description }], written by skills/listingCopy; the first is the ad's own title and description; each copy of the ad picks the one least like what is live in its city).
```

#### log facebook accounts

List the FACEBOOK accounts in Twenty: status, home, proxy, and whether each may run MCP tools: `accounts`, one per form, with named fields.

```text
log facebook accounts [--json]
```

#### log facebook account

Show one account, or set its status (banned/dead/restricted replace its campaign listings) MCP tools: `accountShow`, `accountResave`, `accountResetOpens`, `accountStatus`, one per form, with named fields.

```text
log facebook account show <accountName> [--json]
log facebook account resave <accountName> --from <folder>   (a run's device and session Twenty didn't take: ~/.logCli/runs/unsaved/...)
log facebook account resetOpens <accountName|all> [--reason <text>]   (today's launches and host opens count from now; nothing is deleted)
log facebook account status <accountName> <ACTIVE|WARMING|LIMITED|PAUSED|NEEDS_LOGIN|CHECKPOINT|RESTRICTED|BANNED|DEAD|DEACTIVATED> [--reason <code>] [--detail <text>]
```

#### log adsPower

AdsPower: Local API status, its profiles, and one profile per Twenty account (sync) MCP tool: `adsPower` (`args` takes the same arguments).

```text
log adsPower status
log adsPower profiles [--json]
log adsPower sync [--apply] [--account <accountName>] [--homes <US,IE>] [--json]   (dry run unless --apply; a DEACTIVATED account, or one whose home isn't in --homes or LOG_ADSPOWER_HOMES, gives its profile back first)
```

#### log facebook lifecycle

Each account's place in its lifecycle (rule 35): status, state, what onboarding has left; `states` prints the machine MCP tool: `lifecycle` (`args` takes the same arguments).

```text
log facebook lifecycle [--account <name>] [--json]
log facebook lifecycle states [--write]   (the machine's state tree; --write regenerates docs/lifecycle.md)
```

#### log facebook preflight

Before any browser opens, check each account will get through: home timezone, hours, proxy speed and country, the account's browser and its kernel, launches and host opens left, no session left open, its picture on disk MCP tool: `preflight` (`args` takes the same arguments).

```text
log facebook preflight [--account <accountName>] [--homes <US,CA>] [--noProxy] [--apply] [--json]
Before any browser opens: each account's home timezone, waking hours, proxy (country and speed), AdsPower profile and browser kernel, today's launches and host opens, a session left open, and its profile picture on disk.
--apply downloads the SunBrowser kernel each profile's user agent needs when it is missing, and waits for it. Nothing opens on Facebook.
```

#### log facebook doctor

Check python, facebook-camofox-client, Camoufox, Twenty, and which accounts may run MCP tool: `doctor` (`args` takes the same arguments).

```text
log facebook doctor [--json]
```

#### log facebook connect

Sign a Facebook account in through its proxy (the connect machine), save its cookies to Twenty MCP tool: `connect` (`args` takes the same arguments).

```text
log facebook connect --account <accountName> [--noPrompt] [--wait <seconds>] [--bypass] [--now]
```

#### log facebook profile

Set an account's profile picture and cover photo from Twenty (dry run unless --live, rule 28) MCP tool: `profile, profileLive` (`args` takes the same arguments).

```text
log facebook profile setup --account <accountName> [--live] [--bypass] [--json]
```

#### log facebook host

Run an account's lifecycle in ONE browser kept open for its day, resuming where it left (rule 35); send it events; read its progress MCP tools: `hostStart`, `hostStartLive`, `hostSend`, `hostStatus`, one per form, with named fields.

```text
log facebook host start --account <accountName> [--live] [--likes] [--bypass] [--now] [--gapSeconds <n>] [--watchMinutes <n>]   (--live: profile, name, location; --likes: the warm-up's likes)
log facebook host send --account <accountName> <PERSON_DONE|PAUSE|RESUME|SHUTDOWN|LOST>
log facebook host status [--account <accountName>]
```

#### log inspect

Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29) MCP tools: `inspectStart`, `inspectDo`, `inspectDoLive`, `inspectRead`, `inspectMap`, `inspectGoal`, `inspectFinding`, `inspectSessions`, one per form, with named fields.

```text
log inspect start --account <accountName> [--goal <text>] [--url <https://www.facebook.com/... or the platform's own page>] [--bypass] [--now] [--noIdleMouse] [--detach]   (one session per account: two accounts can be open at once; --detach runs it as its own process and returns once it is open)
log inspect map [<runDir>] [--all]  (the recorded steps as states and transitions: flow.md, machine.json; default the latest run; --all collates every run)
log inspect do <goto <url>|snapshot|back|wait [s]|click <ref>|type <ref> <text>|press <key>|upload <ref> <file>|highlight <role> <name>|solve|signIn|code|pin|stop> [--live] [--goal <text>] [--timeout <s>] [--json] [--account <accountName>]   (--account picks the session when more than one is open; every step's internal API calls are read, and a step no known state names is read by SubQ against the goal, rules 73-74)
log inspect read <stepFolder> --account <accountName> [--goal <text>] [--json]   (read a recorded step again: its internal API calls, the page and the earlier steps, by SubQ when no known state names it)
log inspect goal [--set <text>] [--account <accountName>] [--json]   (the session's goal, whether a step's reading says it is reached, and its P.E.E. findings: what went wrong, the evidence, why, and how it was fixed; rule 75)
log inspect finding --step <step> --point <text> --explain <text> [--evidence <text>] [--account <accountName>]   (a step that went wrong: Point, the issue in one sentence; Evidence, quoted from the step's reading, plus your own; Explain, why the evidence shows it and what caused it)
log inspect finding --fixes <n> --fix <text> [--account <accountName>]   (how finding n was fixed)
log inspect sessions   (the open sessions)
```

#### log flow

Recorded inspect runs as flows: docs, an XState machine per flow, run on any account (rule 31) MCP tool: `flow, flowLive` (`args` takes the same arguments).

```text
log flow fromInspect <runDir> --name <name> [--summary <text>] [--rename text1=firstName]...
log flow docs <name> | list | show <name>
log flow run <name> --account <accountName> [--set <param>=<value>]... [--live] [--bypass] [--now] [--json]
```

#### log <platform> warmup

The warm-up, by platform and activity: `log facebook warmup reel|feed|stages` (the account's browser primed with the activity, each step checked, the outline written; rules 49, 60) MCP tool: `warmup, warmupLive` (`args` takes the same arguments).

```text
log <platform> warmup <activity> [--account <a>] [--live] [--likes] [--bypass] [--now]   (record: the account's browser opened primed with the activity, each step checked, the outline written)
log <platform> warmup <activity> plan [--json]   (the activity's steps and what each must do)
log <platform> warmup persona --account <a> [--newPersona] [--seed <n>]   (the account's behaviour profile and real viewer, from the datasets; no browser, no SubQ)
log facebook warmup reel plan [--reels 8-20] [--watch 4-25] [--skip 0.6] [--comments 0.3] [--profile 0.15] [--likes] [--seed <n>] [--json]   (a drawn Reels session)
log facebook warmup reel run --account <a> [reel plan flags] [--live] [--likes] [--bypass]   (a drawn session, stopped at the first step that doesn't do what it should)
log facebook warmup reel run --account <a> --persona [--newPersona] [--reels 8-20] [--trafficMb 1024] [--live] [--likes] [--bypass]   (the persona's For you feed: SubQ reads each reel, the orderer plans it from the pack and real viewer, rule 50)
log facebook warmup feed run --account <a> --persona [--posts 8-15] [--trafficMb 1024] [--live] [--likes] [--bypass]   (the home feed post by post: SubQ reads each post, a glance or a read and a like where the persona would, then Marketplace and listings)
Platforms: facebook. Facebook activities: reel, feed, stages.
log facebook warmup stages plan
log facebook warmup stages record --account <accountName> [--only feedBrowse,marketplaceBrowse] [--likes] [--bypass] [--now]
log facebook warmup stages run --account <accountName> [--only …] [--likes] [--gapSeconds <n>] [--bypass] [--now]
log facebook warmup stages log [--account <accountName>] [--lines <n>] [--follow [--seconds <n>]]
```

#### log facebook join

Join a Facebook group as one account, in its open browser: read the gate, --live presses Join; every step patches agencyGroups.joinSubmission (rule 45) MCP tool: `join, joinLive` (`args` takes the same arguments).

```text
log facebook join group --account <accountName> --group <group url, id or name> [--live] [--json]
log facebook join group --account <accountName> --group <g> --show
log facebook join group --account <accountName> --group <g> --answer [--set <n>=<value>]... [--agree]   (Clack steps over the group's questions, or the same answers given here; saved to Twenty, never sent)
log facebook join group --account <accountName> --group <g> --fill [--live [--submit]]   (the draft into the group's dialog, step by step)
Every step in the browser runs inside the account's local hours (rule 18); --bypass skips that for one run, only when matt asked (rule 20).
The account's browser must be open (log inspect start --account <a>, or log facebook host start): a join is a step in it (rule 35).
```

#### log facebook read

Read a Facebook group's new posts and their comments, or its newest members, as one account, by hand: posts on the direct-API engine first, else in its open browser; only the group's cursor is saved to Twenty (#27, rule 65), the members to a file MCP tools: `readGroup`, `readGroupLive`, `readMembers`, one per form, with named fields.

```text
log facebook read group --account <accountName> --group <group url or id> [--scrolls <n>] [--commentPosts <n>] [--live] [--bypass] [--json]
log facebook read group --account <accountName> --group <g> --show [--json]
Reads the group's new posts (since its cursor in Twenty) and the comments of the new posts that have some. Only the cursor is saved to Twenty (rule 65); --show prints it.
Without --live, on a numeric group id, it runs on the direct-API engine first (fbk groups.feed_read, no browser) when the account has a saved session and a proxy in its home country: Facebook's own page decides, not accountStatus (loggedIn reads; checkpoint stops and deactivates; anything else hands over to the browser). The result goes to socialAccounts.sessionState.
--scrolls: feed scrolls at most (default 6). --commentPosts: posts whose comments are read at most (default 5; 0 reads none).
--worker (OpenMagpie's call) is refused here: it became its own command, log facebook poll (its usage).
--live: each post's comments are switched to Newest first (two clicks, rule 8); without it nothing is clicked and the page's Most relevant comments are read.
Every step in the browser runs inside the account's local hours (rule 18); --bypass skips that for one run, only when matt asked (rule 20).
On the browser path the account's browser must be open (log inspect start --account <a>, or log facebook host start): a read is a step in it (rule 35).
log facebook read members --account <accountName> --group <group url or id> --count <n> [--secondsPerScroll <s>] [--maxScrolls <n>] [--owners] [--bypass] [--json]
Reads the group's newest members from its People tab (/groups/<g>/members) in the account's open browser: the page's first 10, then a scroll at a time, each scroll's GroupsCometMembersPageNewMembersSectionRefetchQuery answers (about 10 members each, 2 a scroll). Nothing is clicked (rule 8).
--count: members to read (1-5000). --secondsPerScroll: the wait before each scroll (default 15; matt: the time 40 scrolls take is a variable). --maxScrolls: scrolls at most (default twice the plan's, plus 2). It says up front: count N → ~S scrolls, ~M min at Xs per scroll.
It stops at --count members, when the list ends (has_next_page false) or at --maxScrolls. --owners keeps only owners: a bio naming owner, co-owner, founder, CEO, president, proprietor or self-employed, or a page (a category set).
The members go to ~/.logCli/members/<group>/<run time>.tsv and .json, never to Twenty; it prints how many, how many with a bio, owners and pages, and the files. --json gives them.
```

#### log facebook poll

Poll a Facebook group from one account, in its open browser, for a time or once: each poll's posts as one JSON line, OpenMagpie's records; --request answers OpenMagpie's facebook_group worker (#27, rule 63) MCP tool: `poll` (`args` takes the same arguments).

```text
log facebook poll <group url or id> <accountName> [<how long to poll: 30m, 2h>] [--bypass]
log facebook poll --request <request json>   (OpenMagpie's facebook_group worker: groups.search in, post records out as one JSON line; python/openMagpie/facebookWorker.py calls it)
One poll reads the group once in the account's open browser, posts only, nothing clicked, and prints one JSON line: the posts it saw, as OpenMagpie's records. With a time it polls every 5 minutes until the time is up, a line each.
Every poll runs inside the account's local hours (rule 18); --bypass skips that, only when matt asked (rule 20). --request never skips it.
The account's browser must be open (log inspect start for that account, or log facebook host start): a poll is a step in it (rule 35).
```

#### log facebook check

Check one account in its open browser: may it still sell, each listing's state on Selling (into Twenty), and its seller inbox's chats MCP tools: `check`, one per form, with named fields.

```text
log facebook check --account <accountName> [--bypass] [--json]   (in the account's open browser: Marketplace status, each listing's state and clicks in the last 14 days on Selling into Twenty, the seller inbox's chats; nothing clicked)
```

#### log facebook scan

Read Marketplace > Selling live for one account and update its listings in Twenty MCP tool: `scan` (`args` takes the same arguments).

```text
log facebook scan --account <accountName> [--json] [--bypass]
```

#### log facebook status

Open one Marketplace item page live and classify its status MCP tool: `status` (`args` takes the same arguments).

```text
log facebook status <listingId> --account <accountName> [--json] [--bypass]
```

#### log facebook watch

Run the listing monitor (XState) for one account and print every step MCP tool: `watch` (`args` takes the same arguments).

```text
log facebook watch --account <accountName> [--checks <n>] [--interval <minutes>] [--json] [--bypass]
```

#### log proxy

Check an account's proxy, give it one from a provider (2Captcha, Byteful) in its home city, or see providers' traffic MCP tool: `proxy` (`args` takes the same arguments).

```text
log proxy check   --account <accountName> [--json]
log proxy assign  --account <accountName> | --missing  [--vendor twoCaptcha|byteful] [--city <city> [--region <state>] | --anyCity] [--minutes <1-120>] [--socks5]
log proxy balance [--json]
log proxy static  [--json]   (Byteful's static ISP IPs on the account, where each is)
The proxy is the socialAccount's `proxy` field in Twenty (scheme://user:pass@host:port), its country `homeCountry`.
```

#### log facebook publish

Post one Twenty listing (dry run unless --live), printing every machine step MCP tools: `publish`, `publishLive`, one per form, with named fields.

```text
log facebook publish --listing <agencyListingId> [--live] [--json] [--formUrl <url>] [--bypass] [--now]
Dry run unless --live: fills and checks everything, never clicks Publish.
The listing, its account and the account's proxy all come from Twenty.
--bypass skips only the account's waking hours (rule 18); every other gate still runs.
--now skips only the 10-minute launch gap (rule 24); the 8 launches a day still hold.
```

#### log facebook campaign

Put one ad on N accounts in one place, replace lost accounts, publish the campaign MCP tool: `campaign, campaignLive` (`args` takes the same arguments).

```text
log facebook campaign fill --campaign <agencyCampaignId> --from <agencyListingId> --accounts <n>
log facebook campaign heal --campaign <agencyCampaignId>
log facebook campaign run  --campaign <agencyCampaignId> [--live] [--bypass]
log facebook campaign show --campaign <agencyCampaignId> [--json]
```

#### log facebook conversations

List buyers' Marketplace conversations in Twenty, newest first, by account or listing MCP tools: `conversations`, one per form, with named fields.

```text
log facebook conversations [--account <name>] [--listing <agencyListingId>] [--json]
```

#### log facebook conversation

One conversation: show its messages, mark read, set its lead status, link its listing, or store a scanned thread MCP tools: `conversationShow`, `conversationRead`, `conversationLead`, `conversationLink`, `conversationRecord`, one per form, with named fields.

```text
log facebook conversation show <id> [--json]
log facebook conversation read <id>
log facebook conversation lead <id> <NEW|CONTACTED|QUALIFIED|BOOKED|LOST|SPAM>
log facebook conversation link <id> --listing <agencyListingId>
log facebook conversation record --account <name> --file <threads.json>
```

#### log facebook messenger

Messenger's PIN for the account's encrypted chats: asked in a Clack prompt, kept in Twenty, never printed Terminal only: asks matt for the Messenger PIN in a Clack prompt (masked). He runs `bun bin/log.ts facebook messenger pin --account <a>` in a terminal.

```text
log facebook messenger pin --account <accountName> [--show]   (a Clack prompt asks for the 6-digit PIN twice, masked, and keeps it in Twenty; --show says only whether one is set)
```

#### log errors

List every error code: meaning, retryable, where each machine ends up MCP tools: `errors`, one per form, with named fields.

```text
log errors [--layer <account|listing|photo|form|captcha|runtime|twenty|proxyVendor|auth|profile>] [--code <code>] [--json] [--markdown]
```

#### log graph

Print a machine's states and transitions as a Mermaid diagram MCP tool: `graph` (`args` takes the same arguments).

```text
log graph <publish|monitor>
```

#### log facebook capture

Read a run's raw HAR (any browser driver) and its scripts with offline rea; --docs builds every platform's client docs, rea reading each request's code. No browser. MCP tool: `capture` (`args` takes the same arguments).

```text
log facebook capture --har <path> [--out <dir>] [--noRea] [--json]
log facebook capture --settle <runCaptureDir>  (what each run starts in the background: rea reads its capture, split per step)
log facebook capture --docs [--noRea]  (every run's requests → docs/platforms/<platform>/, one doc per request, rea reading each one's slice: Facebook's by its modules, every other platform with a browser path by the call sites its bundles hold for each request)
The HAR is the one Playwright writes from Camoufox. It is copied raw, and rea reads it. No browser opens.
```

#### log runs

The recorded runs on this machine, and pruning the ones rea settled and the request docs hold, keeping each one's findings and domains MCP tools: `runsList`, `runsExchanges`, `runsPrune`, `runsSpace`, one per form, with named fields.

```text
log runs [list] [--json]   (every recorded run: its size, settled by rea, in the request docs, and why it is kept or that it may go)
log runs exchanges   (takes every recorded step's internal API calls, what was sent and what came back, out of its HAR into exchanges.json, for every run still on disk; prune does it first too)
log runs prune [--before <YYYY-MM-DD>] [--apply]   (deletes each analysed run, started before the day when given, after taking out every step's exchanges, keeping its findings.md, steps.jsonl, settle.json, every step's exchanges.json, reading.json and readingState.json, its goalFindings and its requests by domain; a dry run unless --apply)
log runs space   (the size of ~/.logCli/runs and the disk's free space, as the storage hook says them)
```

#### log browsers

Where every open browser is: its page, the known page state it sits on, the call that resolves it, and what only matt can clear (rules 54-55) MCP tools: `browsers`, one per form, with named fields.

```text
log browsers [--json]   (every open browser: its step and page, the known page state it sits on, the call that resolves it, and what only matt can clear)
```

#### log job

Follow or stop a long MCP run: each runs as a job when it outlasts its call's wait MCP tools: `jobStatus`, `jobCancel`, `jobList`, one per form, with named fields.

```text
log job status <jobId> [--afterLine <n>] [--waitMs <ms>] [--json]   (a long MCP run: its status, the lines after afterLine, and its result once it ends; waits up to waitMs, default 10000, for something new)
log job cancel <jobId>   (stops it at its next browser step; never once Publish is clicked, rule 10)
log job list [--json]   (the latest jobs)
```

#### log mcp

This server's MCP sign-ins over OAuth (through Twenty, the owner only): list the clients, revoke them Terminal only: manages who may sign in to this server's MCP (OAuth through Twenty). matt runs `bun bin/log.ts mcp clients` or `mcp revoke <clientId|all>` in a terminal on the server.

```text
log mcp clients [--json]   (who signed in to this server's MCP over OAuth: each client, when it was last used, its live tokens, and whether this server has an owner)
log mcp revoke <clientId|all>   (the client's tokens stop working at once; it must sign in through Twenty again)
```

#### log login

Sign in with Twenty through blaster's web app (OAuth), like `blaster login` Terminal only: opens a browser for Twenty OAuth and waits for it. Run `bun bin/log.ts login` in a terminal.

```text
log login [--webUrl <url>] [--apiUrl <url>] [--token <accessToken>] [--json]
```

#### log logout

Forget the stored Twenty session MCP tool: `logout` (`args` takes the same arguments).

```text
log logout [--apiUrl <url>] [--json]
```

#### log whoami

Show who is signed in, refreshing the session if it expired MCP tool: `whoami` (`args` takes the same arguments).

```text
log whoami [--apiUrl <url>] [--json]
```

#### log twitter session

Check that X still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty MCP tools: `twitterSessionCheck`, one per form, with named fields.

```text
log twitter session check --account <accountName> [--json]
Checks that X still accepts the account's saved session, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Sends nothing.
X's own answer decides: the session check's HTTP status (401 or 403 loggedOut, 200 or 404 loggedIn), then the account's profile read (suspended or locked: restricted). The result goes to socialAccounts.sessionState, and X's refreshed cookies are merged back into the row.
```

#### log twitter follows

Read whether handles follow an X account and it follows them, on the direct-API engine, sending nothing MCP tools: `twitterFollows`, one per form, with named fields.

```text
log twitter follows --account <accountName> --handles <handle,handle…> [--json]
Reads, for each handle, whether it follows the account and whether the account follows it, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Sends nothing.
X's own answer decides: one friendships/show read per handle, 1.5 s apart, after the session check. Handles come from treg research or matt, never a guess (rule 53).
```

#### log twitter dms

Read an X account's direct messages and who is waiting on a reply, on the direct-API engine, sending nothing MCP tools: `twitterDms`, one per form, with named fields.

```text
log twitter dms --account <accountName> [--limit <n>] [--waiting] [--with <handle>] [--conversation <id>] [--full] [--json]
Reads the account's X direct messages on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Sends nothing and marks nothing read.
Without --conversation it syncs the inbox the way X's own chat app does (dm-core): the first read takes the whole X Chat inbox (GetInitialXChatPageQuery, then GetInboxPageRequestQuery pages) and the old DM inbox (dm/inbox_initial_state, then dm/inbox_timeline pages, 1.5 s apart) and keeps them in ~/.logCli/twitter/<account>/inboxSync.json with the newest event's sequence id; every read after that asks X only for what is newer (GetMessageEventsPageQuery from that sequence id, beside one dm/inbox_initial_state), unlocks the PIN and decrypts only when something is new, opening just those conversations' keys (GetInboxPageConversationDataQuery), and keeps each event once by its id. --full reads everything again. Each read saves its conversations for log search and updates the search index in the background with only the chunks that changed. It then lists the newest conversations first, one row per person (their old DM thread and X Chat thread merged): who, when, the last message from either and whether it was yours. --waiting keeps only the ones whose last message isn't yours, the people waiting on a reply. --conversation <id> reads one conversation's messages, oldest first: a legacy id (two user ids joined by a dash) through dm/conversation, an X Chat id (joined by a colon) the same way --with reads it, never the whole inbox.
--with <handle> reads everything with one person by their handle and nobody else: their user id, their legacy thread (dm/conversation) and their X Chat thread (read the way X's own chat app opens a chat, from its dm-core: GetInboxPageConversationDataQuery for that one conversation, then GetConversationPageQuery from the oldest message held, its fetchOlderMessages, up to 5 pages 1.5 s apart while X says there is more), merged into one timeline, oldest first, a message mirrored into both shown once. It never reads the whole inbox. A 429 stops the read with nothing retried, as X's app does (it retries only 5xx), and pauses the account's governor (rule 94). X Chat (encrypted DMs) is opened with the account's X Chat PIN from Twenty (`log twitter chat pin`), recovered through Juicebox by the vendored chat-xdk; without a PIN its text stays encrypted. An old DM thread (<a>-<b>) and its X Chat thread (<a>:<b>) with one person are one conversation: X shows them in the same place, and a dm sent through the old DM API shows in their X Chat too. A sent answer is delivered whichever conversation id it names: never resend it and never call it the wrong inbox. X's own answer decides: the session check first, then the inbox's answer. --limit is how many conversations (or messages) to show, default 20, at most 200.
```

#### log twitter chat

X Chat's PIN for the account's encrypted DMs: asked in a Clack prompt, kept in Twenty, never printed Terminal only: asks matt for the X Chat PIN in a Clack prompt (masked). He runs `bun bin/log.ts twitter chat pin --account <a>` in a terminal.

```text
log twitter chat pin --account <accountName> [--show]
log twitter chat watch --account <accountName> [--seconds <n>] [--inbox] [--json]
Saves the account's X Chat PIN (the 4-digit code X asks for to open encrypted DMs) to Twenty, asked twice in a masked Clack prompt and never printed or passed as a flag. It is checked first: the direct-API engine (no browser, no proxy, rule 80) unlocks the account's keys with it through Juicebox (a wrong PIN uses one of X's limited guesses), and only a PIN that opens them is saved. `log twitter dms` uses it to recover the account's X Chat keys through Juicebox (vendor/chatXdk) and read the encrypted messages. --show says only whether one is set.
watch keeps one socket open to X Chat, the way X's own chat app does (read with rea from X's shipped code, issue #68): a token from GenerateXChatTokenMutation, wss://chat-ws.x.com/ws, a KeepAlive every 30 s, a fresh token and a new socket when it drops. X pushes each message the moment it lands, so nothing is polled and no inbox read can hit X's 429. Each message is decrypted with the saved PIN and printed as it arrives (who, when, what they said). --inbox also hands each new message from someone else to the inbox hook, which puts it in front of the agent with what to do next. --seconds stops it after that long; without it, it watches until stopped.
```

#### log twitter cookies

Add or refresh an X account in Twenty: its session cookies from a masked prompt, checked against X, and its copy style Terminal only: asks for an account's session cookies in a Clack prompt (masked) and checks them with the platform before saving. Run `bun bin/log.ts twitter cookies save --account <handle>` or `bun bin/log.ts linkedin cookies save --account <publicId>` in a terminal.

```text
log twitter cookies save --account <handle> [--style <copyStyle>] [--name <label>]
Saves an X account's session to Twenty from a masked Clack prompt: its auth_token and ct0 cookies, copied from a browser signed in to x.com, never passed as flags or printed. They are checked first: the direct-API engine (no browser, no proxy, rule 80) pings X with them, and only cookies X accepts for that same handle are saved. A handle Twenty doesn't have yet gets a new TWITTER socialAccounts row (rule 13); one it has gets its cookies replaced. --style sets the account's copyStyle, the writing style every send and queue check holds its copy to (empty: house). The account's governor starts under ~/.logCli/twitter/<handle>.
```

#### log voice

Gate a draft against matt's own writing guide with SubQ before anything is sent as him, sending nothing MCP tools: `voice`, `voiceIndex`, one per form, with named fields.

```text
log voice --to <handle> [--text "<draft>"] [--context "<what they said>"] [--with <person or chat>] [--json]
log voice index [--json]   (builds matt's voice from every conversation log search already saved, reading nothing new: each of his replies paired with what was said just before it, embedded with log search's own model, and a profile per chat, person and platform counted from his own messages)
Gates a draft before anything is sent as matt (his rule, 2026-10-27): SubQ reads it against matt's own writing guide (GUIDES/MATT_WRITING_STYLE.md, built from 256 of his tweets) and the dms he wrote himself, and answers whether it sounds like he typed it (voice, 0.8 to pass), whether it answers what they said (--context) or something specific about them, and whether it reads like a mate texting. A phrase matt never says (hit home, big swing, spot on, felt that…) fails it outright. Sends nothing.
--with names the chat or person the way matt says it ("the log group", "jilly", a handle): log finds matt's real replies to things like --context, from that chat first, then that person, then that platform, then anywhere, and how he writes there (length, case, punctuation, his words). Without --text it shows them to draft from; with --text the gate also asks whether the draft reads like his real replies there (toThem, 0.7 to pass).
Exit 0 when it passes, 1 when it doesn't: rewrite and gate again.
```

#### log search

Hybrid search across every conversation (BM25 keyword + vector meaning, fused with RRF), and building its indexes MCP tools: `search`, `searchIndex`, `searchBench`, one per form, with named fields.

```text
log search "<query>" [--limit <n>] [--platform <p>] [--account <a>] [--with <handle>] [--after <YYYY-MM-DD>] [--json]
log search index [--platform <twitter|discord>] [--account <a>] [--saved] [--rebuild]   (only the chunks that are new or changed are embedded, and the ones gone are removed, so the index stays deduplicated; --rebuild embeds everything again. --saved indexes the conversations already kept, reading nothing; otherwise reads every conversation through the platform's engine: X's DMs with X Chat decrypted with the saved PIN, and every Discord DM and group (its whole history, up to 20,000 messages each), keeps them in ~/.logCli/conversations, and builds the keyword and meaning indexes in ~/.logCli/search)
log search bench [--rounds <n>]   (times realistic queries on the built index, cold and warm, and prints p50, p95 and p99 beside a plain linear scan)
Hybrid search across every conversation: BM25 keyword ranking (bm25s) and meaning ranking (verso-db HNSW over local all-MiniLM-L6-v2 embeddings) run in parallel and are fused with reciprocal rank fusion. Each hit names the conversation, who it was with, when, and the messages it covers.
```

#### log kb

The knowledge base: search it, sync every source into Twenty and Redis, remember a note, show an article MCP tools: `kbSearch`, `kbSync`, `kbRemember`, `kbShow`, one per form, with named fields.

```text
log kb search "<query>" [--kind <kind>] [--limit <n>] [--json]
log kb sync [--noAccounts] [--json]   (collects AGENTS.md rules and sections, skills, docs, infra notes, every Claude memory file, the known page states and the accounts from log-cli's Twenty, writes them to the knowledge base in ListeningKit's Twenty, and indexes what changed into Redis)
log kb remember "<text>" [--title <t>] [--tags <a,b>] [--json]   (saves an agent memory as a note in Twenty and Redis at once)
log kb show <key> [--json]   (one article in full, e.g. rule:73, skill:inspect, pageState:messengerPinCreate)
Kinds: rule, section, skill, doc, infra, memory, pageState, account, note. Twenty (node02, over the tailnet) holds every article and can be edited there; Redis 8 holds the search index: BM25 keyword and HNSW meaning (local all-MiniLM-L6-v2) fused with reciprocal rank fusion. Secrets are scrubbed before anything is written.
```

#### log twitter followers

Read an X account's own followers on the direct-API engine, sending nothing MCP tools: `twitterFollowers`, one per form, with named fields.

```text
log twitter followers --account <accountName> [--limit <n>] [--json]
Reads the account's own followers on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80), newest first: handle, name, bio, location, follower and post counts, whether they take DMs. Sends nothing.
X's own answer decides: the session check first, then X's followers list, 100 a page, 1.5 s apart. --limit is how many to read, default 200, at most 4000.
```

#### log twitter reply

Reply to one post on X with approved copy, on the direct-API engine; a dry run unless --live MCP tools: `twitterReply`, `twitterReplyLive`, one per form, with named fields.

```text
log twitter reply --account <accountName> --tweet <postUrl> --text "<copy>" [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]
Reply to one post on X with approved copy, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (40 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's create answer decides: a tweet id is sent, an empty result is a drop (nothing posted, usually the author's reply limits). Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
```

#### log twitter quote

Quote one post on X with approved copy, on the direct-API engine; a dry run unless --live MCP tools: `twitterQuote`, `twitterQuoteLive`, one per form, with named fields.

```text
log twitter quote --account <accountName> --tweet <postUrl> --text "<copy>" [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]
Quote one post on X with approved copy, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (40 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's create answer decides: a tweet id is sent, an empty result is a drop. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
```

#### log twitter post

Make one original post on X with approved copy and optional media (a video, a gif or up to 4 images), on the direct-API engine; a dry run unless --live MCP tools: `twitterPost`, `twitterPostLive`, one per form, with named fields.

```text
log twitter post --account <accountName> --text "<copy>" [--media <file>[,<file>]] [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]
Make one original post on X with approved copy and optional media (a video, a gif or up to 4 images), on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (40 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
Each file is uploaded first (a video in chunks, then X's own processing status must say succeeded before the post is made), then the post is created with the media ids. X's create answer decides: a tweet id is sent, an empty result is a drop and nothing was posted. A file X refuses stops it before anything is posted. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
```

#### log twitter like

Like one post on X, on the direct-API engine; a dry run unless --live MCP tools: `twitterLike`, `twitterLikeLive`, one per form, with named fields.

```text
log twitter like --account <accountName> --tweet <postUrl> [--approvedBy <who>] [--force] [--live] [--json]
Like one post on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (40 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's favorite answer decides: Done (or already liked, code 139) is sent. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
```

#### log twitter follow

Follow one person on X, on the direct-API engine; a dry run unless --live MCP tools: `twitterFollow`, `twitterFollowLive`, one per form, with named fields.

```text
log twitter follow --account <accountName> --userId <id> [--approvedBy <who>] [--force] [--live] [--json]
Follow one person on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (40 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's follow answer decides: the followed user back is sent, already following is sent too. Follow before a cold dm: nobody gets a cold message from an account that doesn't follow them. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
```

#### log twitter dm

Send one approved direct message on X, on the direct-API engine; a dry run unless --live MCP tools: `twitterDm`, `twitterDmLive`, one per form, with named fields.

```text
log twitter dm --account <accountName> --userId <id> --text "<copy>" [--approvedBy <who>] [--skipStyleCheck] [--asOne] [--force] [--live] [--json]
Send one approved direct message on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (40 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
A draft written on several lines goes out one message per line, and a one-line draft is split the way matt writes in that chat (log voice index), with his usual gap between them; --asOne sends it as one, only when matt asked (rule 90). X's answer decides: a conversation id is sent, none is a drop, and a drop stops the rest: what was sent stays sent, nothing is retried (rule 94). An old DM thread (<a>-<b>) and its X Chat thread (<a>:<b>) with one person are one conversation: X shows them in the same place, and a dm sent through the old DM API shows in their X Chat too. A sent answer is delivered whichever conversation id it names: never resend it and never call it the wrong inbox. A refusal before X is called (styleFailed, a dry run) sent nothing, so that dm is sent once its copy is fixed. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
```

#### log twitter queue

Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine MCP tools: `twitterQueueBuild`, `twitterQueueShow`, `twitterQueueCheck`, `twitterQueueStatus`, `twitterQueueApprove`, `twitterQueuePlan`, `twitterQueueRun`, `twitterQueueRunLive`, `twitterQueueNudge`, one per form, with named fields.

```text
log twitter queue build --targets <targets.json> [--variations <a.json,b.json>] --out <queue.json> --account <accountName> [--action reply|quote|dm] [--seed <n>]
log twitter queue show <queue.json> [--json]
log twitter queue check <queue.json> [--skipXChatCheck] [--json]
log twitter queue status <queue.json> [--json]
log twitter queue approve <queue.json> --by <who>
log twitter queue plan <queue.json> --window <5h|90m> [--limit <n>] [--start <time>] [--minGap <s>] [--like] [--likeChance <0-1>]
log twitter queue run <queue.json> [--alertChannel <uuid>] [--alertReplyTo <eventId>] [--alertMention <hex,hex>] [--force] [--live]
log twitter queue nudge <queue.json> [--replies <n>]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now.
run walks the plan as an XState machine (planned, waiting, liking, replying, cooling, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: a block or throttle cools off (15 min doubling to 4 h, or X's reset time, 24 h on the daily limit 344) and retries the post once at the end; a deleted post or replies off (385/433) is skipped; a dead session or 5 cool-offs in a row halts it and, with --alertChannel, tags matt in buzz. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers and the run's own cool-offs still apply.
```

#### log new

Make a new platform (session, command, MCP tool, engine, docs), wired into the repo through its syntax tree MCP tools: `newPlatform`, one per form, with named fields.

```text
log new platform <name> [--label <shown name>] [--twentyPlatform <ENUM>] [--library <vendor/folder>] [--sessionCookies <a,b>] [--cookieDomain <.site.com>] [--hosts <a.com,b.com>] [--home <https://…>] [--noProxy] [--noBrowser] [--apply] [--json]
Makes a new platform for log-cli: its account session on the shared platformKit, `log <name> session check` with its MCP tool, a direct-API engine in python/<name>Api on the shared Python kit, and docs/platforms/<name>. The repo is wired by editing each file through its syntax tree (PLATFORMS, PLATFORM_LABELS, COMMANDS, COMMAND_INDEX, createContext, CommandContext, DIRECT_ROUTES, COMMAND_RULES), and every edit is checked to have landed before anything is written.
Without --apply it lists what it would write and change, and writes nothing. Nothing is overwritten: an existing platform or file is refused. It says what Twenty is missing (the socialAccounts.platform option) but never changes Twenty. Then fill in the engine's actions and add the platform's families as commands (rule 83).
```

#### log reddit session

Check that Reddit still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty MCP tools: `redditSessionCheck`, one per form, with named fields.

```text
log reddit session check --account <accountName> [--json]
Checks that Reddit still accepts the account's saved session, on the direct-API engine (no browser). Sends nothing.
Reddit's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.
```

#### log discord session

Check that Discord still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty MCP tools: `discordSessionCheck`, one per form, with named fields.

```text
log discord session check --account <accountName> [--json]
Checks that Discord still accepts the account's saved session, on the direct-API engine (no browser). Sends nothing.
Discord's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.
```

#### log discord chats

List the account's DMs and group DMs with their ids, on the direct-API engine, sending nothing MCP tools: `discordChats`, one per form, with named fields.

```text
log discord chats --account <accountName> [--json]
Lists the account's DMs and group DMs with their ids, names and members, on the direct-API engine (no browser). Sends nothing.
```

#### log discord read

Read a Discord chat or channel's latest messages, on the direct-API engine, sending nothing MCP tools: `discordRead`, one per form, with named fields.

```text
log discord read --account <accountName> --channel <channelId|chat name> [--limit <n>] [--after <messageId>] [--json]
Reads a DM, group DM or server channel's latest messages, oldest first, on the direct-API engine (no browser): who sent each, when, whether a bot, what it replies to, its text and embeds. --after keeps only what came after that message (a bot's answer to ours). Sends nothing.
```

#### log discord watch

Watch the account's Discord messages as Discord pushes them over its gateway, nothing polled, sending nothing MCP tools: `discordWatch`, one per form, with named fields.

```text
log discord watch --account <accountName> [--channel <channelId|chat name>] [--seconds <s>] [--inbox] [--json]
Opens the account's Discord gateway on the direct-API engine (wss://gateway.discord.gg, no browser) and prints every message the moment Discord pushes it, nothing polled. --channel keeps only one chat or channel; --seconds stops after that long (at least 5), otherwise it runs until stopped. --inbox hands each new DM, group message, mention of the account or reply to it from someone else to the inbox hook, which puts it in front of the agent with what to do next. Sends nothing.
```

#### log discord send

Send one message to a Discord DM, group or channel, on the direct-API engine; a dry run unless --live MCP tools: `discordSend`, `discordSendLive`, one per form, with named fields.

```text
log discord send --account <accountName> --channel <channelId|chat name> --text "<message>" [--asOne] [--approvedBy <who>] [--live] [--json]
Sends one message to a DM, a group DM (by its id or its name, from log discord chats) or a server channel (by its id), on the direct-API engine (no browser).
A draft written on several lines goes out one message per line, wherever it is sent (matt, 2026-10-28: stop sending as one). A one-line draft is split the way matt writes in that chat, from his own messages there (log voice index): how many he sends in a row and how many words each runs to, cut at the draft's own line breaks or punctuation, else the nearest space, and sent with his usual gap between them; a chat where he mostly sends one gets one. --asOne always sends one. Without --live it is a dry run and Discord is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). Discord's answer decides: a message id is sent, none is a drop. The account's governor counts it as a write.
```

#### log linkedin session

Check that LinkedIn still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty MCP tools: `linkedinSessionCheck`, one per form, with named fields.

```text
log linkedin session check --account <accountName> [--json]
Checks that LinkedIn still accepts the account's saved session, on the direct-API engine (openLinkedinApi, no browser). Sends nothing.
LinkedIn's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.
```

#### log linkedin cookies

Add or refresh a LinkedIn account in Twenty: its session cookies from a masked prompt, checked against LinkedIn Terminal only: asks for an account's session cookies in a Clack prompt (masked) and checks them with the platform before saving. Run `bun bin/log.ts twitter cookies save --account <handle>` or `bun bin/log.ts linkedin cookies save --account <publicId>` in a terminal.

```text
log linkedin cookies save --account <publicId> [--name <label>]
Saves a LinkedIn account's session to Twenty from a masked Clack prompt: its li_at and JSESSIONID cookies, copied from a browser signed in to linkedin.com, never passed as flags or printed. --account is the profile's public id, the part after linkedin.com/in/.
They are checked first: the direct-API engine (openLinkedinApi, no browser, no proxy) reads /voyager/api/me with them, and only cookies LinkedIn accepts for that same profile are saved. A profile Twenty doesn't have yet gets a new LINKEDIN socialAccounts row (rule 13); one it has gets its cookies replaced.
```

<!-- surface:end -->

## Twenty

- `scripts/twenty/twentySetup.mjs` adds the fields log-cli needs (additive only; prints
  the plan, `--apply` creates them).
- `bun run twenty:client` regenerates `src/twenty/graphql/generated` from the live
  workspace (twenty-client-sdk), the same way blaster (`pnpm twenty:client`) and the
  dialer (`bun run api:client`) do. `bun run twenty:client:check` fails when it is stale.
- Tests never call Twenty: they inject `marketplaceFixture()`, an in-memory Twenty.

## The listing monitor (`log facebook watch`)

`src/marketplace/monitor/machine.ts` is an XState v5 machine:

```text
checking --ok-----------> evaluating --> waiting --after poll--> checking
   |                          '-- checks done --> done
   |--rateLimited--> resting --after 24h--> checking
   |--other account issue--> blocked
   '--error--> failed --first try--> retrying --after 5s--> checking
                 |-- same error 3x in a row --> tripped
                 '-- otherwise --> waiting
```

`log facebook watch` prints each event and state through XState's inspect API
(`src/observability/trace`). `--json` streams them as NDJSON, one line per step,
with the result on the last line. `--checks 0` runs until Ctrl+C.

Where the rules come from:

| Rule | Source |
| --- | --- |
| Removal reasons, never repost on policy/ban/checkpoint, 2 reposts, 1h then 3h cooldown, RETRY_EXHAUSTED | facebook-camofox-client `domain_marketplace/relist.py` |
| One quick retry for transient errors, circuit breaker at 3 same errors, 24h rest when limited | Listaro `agent/src/poll-loop.ts`, `api/agent/result/route.ts`, `process-posts` |
| Don't call listings removed when the page showed none (or under 3 of 3+) | Listaro `src/lib/listing-checker.ts:790-797` |
| No second repost while one is queued | Listaro `listing-checker.ts:868-886` |
| Page text to account issue (ban, checkpoint, limit, login) | Listaro `poster.ts`, `process-posts`, `facebook-auto-login.ts`, one issue per signal |

It only decides. Nothing is posted.

## Signing in (`log login`)

The same OAuth flow as `blaster login` (blaster `packages/blaster-cli/src/cli/login.ts`).
Twenty is the identity provider, and blaster's hosted web app
(`https://blaster.listeningkit.com`) runs the sign-in page.

1. `log login` makes a state nonce and a PKCE challenge, then starts a one-shot server on `127.0.0.1`.
2. It opens `<webUrl>/login?state=…&code_challenge=…&exchange=…`. You sign in to Twenty there.
3. The web app POSTs the tokens back to the loopback. log-cli only accepts them if state and challenge match this run.
4. The token is checked through blaster's API (`GET /api/auth/me`) and saved in `~/.logCli/auth/`
   (`LOG_HOME` moves it). `log whoami` refreshes it through `POST /api/auth/refresh` when it expires.

`--token <accessToken>` is the paste path for headless terminals. `--webUrl` / `--apiUrl`
(or `LOG_WEB_URL` / `LOG_API_URL`) point at a local blaster. The CLI never holds the
OAuth client secret.

## Browser setup

The browser layer, which commands run where, and each browser's capabilities are
generated from the code: [The browser layer](#the-browser-layer) above and
[`docs/browsers.md`](docs/browsers.md). A new browser provider is one more
driver: its domain `src/browser/<name>` (capability row, driver, tests), its
Python opener in `python/browser/browserDriver.py` and its column in
`docs/browsers.md`; `bun run check:browsers` (pre-commit) refuses one missing a
piece (rule 44). A profile holds no proxy, password or 2FA key: those stay in
Twenty, and the proxy goes on only to open and comes off at close.

### AdsPower setup

```bash
bun bin/log.ts adsPower status          # AdsPower's Local API answers
bun bin/log.ts adsPower profiles        # its profiles, and the Twenty account of each
bun bin/log.ts adsPower sync            # dry run: one profile per account on a platform with a browser path (rule 84)
bun bin/log.ts adsPower sync --apply    # make them, link each in socialAccounts.adsPowerProfileId
```

More: [`docs/adsPower.md`](docs/adsPower.md). Across servers: [`docs/deployment.md`](docs/deployment.md).

### Camoufox setup

Camoufox runs the accounts without an AdsPower profile, and the commands not on
the driver yet launch it themselves, through
[facebook-camofox-client](https://github.com/PRACE1/facebook-camofox-client)
(`python/session/logWorker.py`) or their own sessions
(`python/session/publishSession.py`, `connectSession.py`, `profileSession.py`).

```bash
git clone https://github.com/PRACE1/facebook-camofox-client ../facebook-camofox-client
pip install -e ../facebook-camofox-client
python -m camoufox fetch          # downloads the Camoufox browser
bun bin/log.ts facebook doctor
```

Whichever browser runs, the account must pass the account check first, its
proxy and cookies come from Twenty into a private temp folder for the run and
are deleted afterwards, and every launch is headed with the cursor shown
(rule 11).

## Record a procedure, then run it anywhere (`log inspect`, `log flow`)

`log inspect` drives the account's browser (AdsPower or Camoufox, through the
driver), gated and headed, a step at a time, and records every step (snapshot,
screenshot, HAR, rea). `log flow fromInspect` turns that
recording into a flow: its docs, an XState machine, `log flow run <name>` for
any account, and an MCP tool of its own (`flowProfileSetup`). The whole
pipeline, the actions, the saved flows and what the recordings showed:
`docs/recordToFlow.md`. It works on every platform with a browser path
(Facebook, Reddit, rule 84), and every request a platform's pages made is
documented, read by rea from its code, in `docs/platforms/<platform>/`
(`log facebook capture --docs`, rule 85).

## Layout

```text
bin/log.ts                      entrypoint
src/cli/*                       the commands, `log [<platform>] <command>` (rule 63)
src/cli/runner/helpers/platforms.ts  PLATFORMS and PLATFORM_SITES: every platform, its hosts, proxy and browser path
src/facebook/                   Facebook's own areas: group/ (join, read, members, answer), marketplace/ (check, copy, location), warmup/ (rule 64)
src/twitter/                    X: account/ (session), copy/, post/send (reply, quote, like, dm), queue/
src/reddit/                     Reddit: account/session
src/platformKit/                what every platform's account session shares (find, gate, run the engine, record)
src/scaffold/platform/          `log new platform <name>`: writes and wires a new platform (rule 83)
src/directApi/engine/           DIRECT_ROUTES, commandEngine, the direct-API engine runner and governors
src/twenty/graphql/             the generated Twenty client (generated/), its seam, an in-memory Twenty for tests
src/marketplace/socialAccount/  accounts in Twenty, the account check (checkRunnable)
src/marketplace/agencyListing/  listings in Twenty, run write-back, dashboard sync
src/marketplace/replacement/    losing an account, replacements, campaign fill
src/marketplace/publish/        the XState publish machine
src/marketplace/monitor/        the XState listing monitor + relist rules
src/marketplace/lifecycle/      each account's lifecycle machine (rule 35)
src/marketplace/listing/        the listeningkit-hackathon listing machine port (+ its seed)
src/warmup/                     what every platform's warm-up draws from: persona/, viewer/
src/browser/driver/             the browser-agnostic session machine and capability list (rules 42, 44)
src/browser/camoufox/           Camoufox's driver and capability row (kept)
src/browser/adsPower/           AdsPower: Local API client (from Listaro), profile sync, its driver and capability row
src/browser/run/                one run's private proxy/cookie files, the launch budget (every browser)
src/browser/proxy/              the proxy check's result types (every browser)
src/browser/inspect/            log inspect: one open browser driven a step at a time (every browser, every platform)
src/browser/flow/               recordings → flows, their XState machines, the page states (every browser)
src/camofox/                    what only Camoufox needs: its device per account (rule 15), its worker and sync sessions
src/proxyVendor/                proxy providers: twoCaptcha/, byteful/, traffic budgets (rules 51, 52)
src/rea/                        rea's readings: capture/, platformClient/ (every platform's calls and their code, rule 85)
src/subq/                       SubQ's readings of steps we don't know (rule 74)
src/captcha/router/             CaptchaKraken → 2Captcha → a person
src/errors/catalog/             every error code, once
src/agentHooks/                 the agent hooks (Claude Code, Codex) and what each decides (rule 55)
src/surface/                    the catalog of commands, MCP tools and hooks; the README section and diagrams (rule 56)
vendor/fbk/                     Facebook's direct-API client
vendor/twikit/                  X's direct-API client, on curl_cffi (rule 81)
vendor/rdvwr/                   Reddit's direct-API client, one pinned curl_cffi session (check:rdvwrTransport)
vendor/twitterController/       the X controller being ported
python/directApi/               Facebook's direct-API engine (fbk)
python/twitterApi/              X's engine (twikit)
python/redditApi/               Reddit's engine (rdvwr)
python/platformKit/             what every platform's engine shares
python/browser/                 every driver's opener (browserDriver.py), the proxy gate, the HAR recorder, headed launch
python/session/                 the processes TypeScript runs: inspect, connect, publish, profile, the worker
python/human/                   the cursor and the wheel, fitted to matt's hand (rule 32)
docs/platforms/<platform>/      every platform's internal requests, by domain, read by rea (rules 27, 48, 85)
```

See `docs/namingConventions.md`. Run `bun run check` for the naming gate, typecheck and tests.

## License

MIT
