# log-cli

The command line for ListeningKit's Facebook Marketplace work. Accounts and
listings live in Twenty (`socialAccounts`, `agencyListings`), reached through
the same generated GraphQL client blaster and the dialer use. log-cli checks an
account may run (proxy in its home country, rule 12), drives Camoufox through
facebook-camofox-client and its own publish session, and writes every result
back to Twenty.

Built the same way as the Rank CLI from the Nebius hackathon: a command registry
that generates its own usage, commands that return results rather than
printing, and a [Clack](https://github.com/bombshell-dev/clack) guided menu
(`log launch`) on top of the scriptable commands.

## Run it

```bash
bun install
cp .env.example .env.local     # TWENTY_BASE_URL, TWENTY_API_KEY, CAPTCHA_KRAKEN_API_KEY, 2CAPTCHA_API_KEY
bun run launch                 # guided menu (needs a terminal)
bun bin/log.ts accounts        # FACEBOOK accounts in Twenty, and whether each may run
bun bin/log.ts listings --status READY
bun bin/log.ts publish --listing <agencyListingId>        # dry run
```

Every command takes `--json` and never prompts, so scripts and agents can use it.

Every command, its flags, its MCP tool and the hooks that fire on it are listed in
[Commands, MCP tools and hooks](#commands-mcp-tools-and-hooks) below, generated from the code.

How accounts, statuses, replacement and campaigns work: `docs/accountsAndListings.md`.
How proxies load and are checked: `docs/proxies.md`. Where accounts are bought:
`docs/vendors/`. Every error code: `docs/errorCatalog.md`.

<!-- surface:start · written by `bun run docs:build` from the code. Not edited by hand. -->
## Commands, MCP tools and hooks

Every command is a CLI command (`bun bin/log.ts <command>`) and, unless it only works in a terminal, an MCP tool of the same name on the `log` server.
The same hooks fire whether it runs from a shell or over MCP, and both write the same live log, `~/.logCli/mcp/<day>.log`.
This section and `docs/diagrams/*.mmd` are generated from the code (`COMMANDS`, `AGENT_HOOKS`, `PAGE_STATES`, the saved flows) by `bun run docs:build`.
`bun run check:docs` (lefthook pre-commit and pre-push) refuses a commit where they differ (rule 56).

### How a call reaches log-cli

From a shell or over MCP, both run the same commands through `runCli`, write the same live log, and pass through the same hooks.

```mermaid
flowchart LR
  agent["Agent (Claude Code, Codex)"]
  matt["matt, in a terminal"]
  shell["Bash / PowerShell / Monitor"]
  mcp["MCP server log: 27 command tools + saved flows"]
  bin["bin/log.ts"]
  runCli["runCli: 29 commands (COMMANDS)"]
  live[("~/.logCli/mcp/day.log: the live log")]
  browser["The account's browser (one per day, rule 35)"]
  agent --> shell
  matt --> bin
  shell --> bin
  agent -->|mcp__log__tool| mcp
  bin --> runCli
  mcp -->|runToolCall| runCli
  runCli --> browser
  bin -->|cli:command lines| live
  mcp -->|tool lines| live
  live -.->|tail -f, under Monitor| agent
  pre0{{"PreToolUse: liveLogs.ts"}} -.->|before| shell
  post0{{"PostToolUse: pageState.ts"}} -.->|after| agent
  turn0{{"SessionStart: pageState.ts"}} -.-> agent
  turn1{{"UserPromptSubmit: pageState.ts"}} -.-> agent
  turn2{{"Stop: pageState.ts"}} -.-> agent
  browser -.->|each step's snapshot| post0
```

Source: [`docs/diagrams/surface.mmd`](docs/diagrams/surface.mmd).

### Every command

Every command also takes `--proxyMs <ms>` (this run's proxy speed limit, rule 33). `--live` acts on Facebook and over MCP needs `confirmLive: true`; `--bypass` needs `confirmBypass: true` (rules 8, 10, 20).

| Command | What it does | Flags | MCP tool | Hooks: shell · MCP | Live log | Rules |
| --- | --- | --- | --- | --- | --- | --- |
| [`log launch`](#log-launch) | Guided Clack menu over the listings, accounts and live commands | `--json` | terminal only: prompts in a terminal (Clack). Call the commands it wraps directly. | PreToolUse, PostToolUse · n/a | no | 30, 38, 39, 40, 41 |
| [`log listings`](#log-listings) | List the Twenty listings, by status, account or campaign | `--status <STATUS>` `--account <accountName>` `--campaign <campaignId>` `--json` | `listings` | PreToolUse, PostToolUse · PostToolUse | no | 13, 30, 38, 39, 40, 41 |
| [`log listing`](#log-listing) | Show one Twenty listing, or create one for an account from a JSON file | `--json` `--account <accountName>` `--file <listing.json>` | `listing` | PreToolUse, PostToolUse · PostToolUse | no | 13, 30, 38, 39, 40, 41 |
| [`log accounts`](#log-accounts) | List the FACEBOOK accounts in Twenty: status, home, proxy, and whether each may run | `--json` | `accounts` | PreToolUse, PostToolUse · PostToolUse | no | 13, 30, 38, 39, 40, 41 |
| [`log account`](#log-account) | Show one account, or set its status (banned/dead/restricted replace its campaign listings) | `--json` `--from <folder>` `--reason <text>` `--detail <text>` | `account` | PreToolUse, PostToolUse · PostToolUse | no | 13, 37, 30, 38, 39, 40, 41 |
| [`log adsPower`](#log-adspower) | AdsPower: Local API status, its profiles, and one profile per Twenty account (sync) | `--json` `--apply` `--account <accountName>` | `adsPower` | PreToolUse, PostToolUse · PostToolUse | no | 42, 44, 30, 38, 39, 40, 41 |
| [`log lifecycle`](#log-lifecycle) | Each account's place in its lifecycle (rule 35): status, state, what onboarding has left; `states` prints the machine | `--account <name>` `--json` `--write` | `lifecycle` | PreToolUse, PostToolUse · PostToolUse | no | 35, 30, 38, 39, 40, 41 |
| [`log doctor`](#log-doctor) | Check python, facebook-camofox-client, Camoufox, Twenty, and which accounts may run | `--json` | `doctor` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 12, 30, 38, 39, 40, 41 |
| [`log connect`](#log-connect) | Sign a Facebook account in through its proxy (the connect machine), save its cookies to Twenty | `--account <accountName>` `--noPrompt` `--wait <seconds>` `--bypass` `--now` | `connect` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 12, 18, 21, 23, 24, 30, 38, 39, 40, 41 |
| [`log profile`](#log-profile) | Set an account's profile picture and cover photo from Twenty (dry run unless --live, rule 28) | `--account <accountName>` `--live` `--bypass` `--json` | `profile` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 28, 30, 38, 39, 40, 41 |
| [`log host`](#log-host) | Run an account's lifecycle in ONE browser kept open for its day, resuming where it left (rule 35); send it events; read its progress | `--account <accountName>` `--live` `--likes` `--bypass` `--gapMinutes <n>` `--watchMinutes <n>` | `host` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 18, 35, 30, 38, 39, 40, 41 |
| [`log inspect`](#log-inspect) | Drive one gated Camoufox a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29) | `--account <accountName>` `--url <https://www.facebook.com/...>` `--bypass` `--now` `--noIdleMouse` `--detach` `--all` `--live` `--timeout <s>` `--json` | `inspect` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 12, 17, 22, 24, 26, 29, 30, 35, 48, 54, 55, 30, 38, 39, 40, 41 |
| [`log flow`](#log-flow) | Recorded inspect runs as flows: docs, an XState machine per flow, run on any account (rule 31) | `--name <name>` `--summary <text>` `--rename` `--account <accountName>` `--set <param>` `--live` `--bypass` `--now` `--json` | `flow` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 29, 31, 30, 38, 39, 40, 41 |
| [`log warmup`](#log-warmup) | The warm-up, by platform and activity (`log warmup facebook reel`: the browser opened primed with it, each step checked, the outline written, rule 49), and Listaro's five activities (record, run, feed, rule 36) | `--account <accountName>` `--only` `--likes` `--bypass` `--now` `--gapMinutes <n>` `--lines <n>` `--follow` `--seconds <n>` `--live` `--reels` `--watch` `--skip` `--comments` `--profile` `--seed <n>` `--json` `--persona` `--newPersona` `--trafficMb` `--posts` | `warmup` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 18, 20, 25, 26, 29, 32, 35, 36, 49, 50, 51, 54, 55, 30, 38, 39, 40, 41 |
| [`log join`](#log-join) | Join a Facebook group as one account, in its open browser: read the gate, --live presses Join; every step patches agencyGroups.joinSubmission (rule 45) | `--account <accountName>` `--group <group url, id or name>` `--live` `--json` `--show` `--answer` `--set <n>` `--agree` `--fill` `--submit` `--bypass` | `join` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 10, 18, 20, 25, 26, 29, 35, 45, 30, 38, 39, 40, 41 |
| [`log scan`](#log-scan) | Read Marketplace > Selling live for one account and update its listings in Twenty | `--account <accountName>` `--json` `--bypass` | `scan` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 12, 18, 22, 30, 38, 39, 40, 41 |
| [`log status`](#log-status) | Open one Marketplace item page live and classify its status | `--account <accountName>` `--json` `--bypass` | `status` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 12, 18, 22, 30, 38, 39, 40, 41 |
| [`log watch`](#log-watch) | Run the listing monitor (XState) for one account and print every step | `--account <accountName>` `--checks <n>` `--interval <minutes>` `--json` `--bypass` | `watch` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 6, 18, 30, 38, 39, 40, 41 |
| [`log proxy`](#log-proxy) | Check an account's proxy, give it one from a provider (2Captcha, Byteful) in its home city, or see providers' traffic | `--account <accountName>` `--json` `--missing` `--vendor` `--city <city>` `--region <state>` `--anyCity` `--minutes <1-120>` `--socks5` | `proxy` | PreToolUse, PostToolUse · PostToolUse | no | 12, 33, 41, 43, 51, 52, 30, 38, 39, 40, 41 |
| [`log publish`](#log-publish) | Post one Twenty listing (dry run unless --live), printing every machine step | `--listing <agencyListingId>` `--live` `--json` `--formUrl <url>` `--bypass` `--now` | `publish` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 10, 12, 18, 22, 24, 30, 38, 39, 40, 41 |
| [`log campaign`](#log-campaign) | Put one ad on N accounts in one place, replace lost accounts, publish the campaign | `--campaign <agencyCampaignId>` `--from <agencyListingId>` `--accounts <n>` `--live` `--bypass` `--json` | `campaign` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 13, 18, 30, 38, 39, 40, 41 |
| [`log conversations`](#log-conversations) | List buyers' Marketplace conversations in Twenty, newest first, by account or listing | `--account <name>` `--listing <agencyListingId>` `--json` | `conversations` | PreToolUse, PostToolUse · PostToolUse | no | 34, 30, 38, 39, 40, 41 |
| [`log conversation`](#log-conversation) | One conversation: show its messages, mark read, set its lead status, link its listing, or store a scanned thread | `--json` `--listing <agencyListingId>` `--account <name>` `--file <threads.json>` | `conversation` | PreToolUse, PostToolUse · PostToolUse | no | 34, 30, 38, 39, 40, 41 |
| [`log errors`](#log-errors) | List every error code: meaning, retryable, where each machine ends up | `--layer <account|listing|photo|form|captcha|runtime|twenty|proxyVendor|auth|profile>` `--code <code>` `--json` `--markdown` | `errors` | PreToolUse, PostToolUse · PostToolUse | no | 25, 30, 38, 39, 40, 41 |
| [`log graph`](#log-graph) | Print a machine's states and transitions as a Mermaid diagram | none | `graph` | PreToolUse, PostToolUse · PostToolUse | no | 6, 25, 30, 38, 39, 40, 41 |
| [`log capture`](#log-capture) | Read a run's raw HAR (any browser driver) and its scripts with offline rea; --docs builds the Facebook client docs. No browser. | `--har <path>` `--out <dir>` `--noRea` `--json` `--settle <runCaptureDir>` `--docs` | `capture` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 19, 22, 26, 27, 46, 48, 30, 38, 39, 40, 41 |
| [`log login`](#log-login) | Sign in with Twenty through blaster's web app (OAuth), like `blaster login` | `--webUrl <url>` `--apiUrl <url>` `--token <accessToken>` `--json` | terminal only: opens a browser for Twenty OAuth and waits for it. Run `bun bin/log.ts login` in a terminal. | PreToolUse, PostToolUse · n/a | no | 30, 38, 39, 40, 41 |
| [`log logout`](#log-logout) | Forget the stored Twenty session | `--apiUrl <url>` `--json` | `logout` | PreToolUse, PostToolUse · PostToolUse | no | 30, 38, 39, 40, 41 |
| [`log whoami`](#log-whoami) | Show who is signed in, refreshing the session if it expired | `--apiUrl <url>` `--json` | `whoami` | PreToolUse, PostToolUse · PostToolUse | no | 30, 38, 39, 40, 41 |

### Saved flows: MCP tools of their own (rule 31)

| MCP tool | Runs | What it does | Params | Steps |
| --- | --- | --- | --- | --- |
| `flowProfileSetup` | `log flow run profileSetup` | Give an account its profile picture, cover photo and name, as recorded on Lancaster 2026-10-19 (rule 28): profile picture menu, Choose profile picture, Upload Photo, Save; Add Cover Photo, Upload photo, Save changes; Accounts Center name, Review change, Done. | `profilePhoto`, `coverPhoto`, `firstName`, `lastName` | gotome → clickProfilePictureActions → clickChooseProfilePicture → uploadUploadPhoto → clickSave → clickAddCoverPhoto → uploadUploadPhoto → clickSaveChanges → gotoprofilesName → fillFirstName → fillSurname → clickReviewChange → clickDone |

### Every command, CLI and MCP

Each command is a CLI command and, unless terminal-only, an MCP tool of the same name; the long-running ones write the live log. Saved flows are MCP tools that run `log flow run`.

```mermaid
flowchart TB
  cli["log (CLI)"]
  mcp["MCP server log"]
  live[("live log")]
  terminal["terminal only"]
  c_launch["launch"]
  cli --> c_launch
  c_launch -.- terminal
  c_listings["listings"]
  cli --> c_listings
  mcp --> c_listings
  c_listing["listing"]
  cli --> c_listing
  mcp --> c_listing
  c_accounts["accounts"]
  cli --> c_accounts
  mcp --> c_accounts
  c_account["account"]
  cli --> c_account
  mcp --> c_account
  c_adsPower["adsPower"]
  cli --> c_adsPower
  mcp --> c_adsPower
  c_lifecycle["lifecycle"]
  cli --> c_lifecycle
  mcp --> c_lifecycle
  c_doctor["doctor"]
  cli --> c_doctor
  mcp --> c_doctor
  c_doctor --> live
  c_connect["connect"]
  cli --> c_connect
  mcp --> c_connect
  c_connect --> live
  c_profile["profile"]
  cli --> c_profile
  mcp --> c_profile
  c_profile --> live
  c_host["host"]
  cli --> c_host
  mcp --> c_host
  c_host --> live
  c_inspect["inspect"]
  cli --> c_inspect
  mcp --> c_inspect
  c_inspect --> live
  c_flow["flow"]
  cli --> c_flow
  mcp --> c_flow
  c_flow --> live
  c_warmup["warmup"]
  cli --> c_warmup
  mcp --> c_warmup
  c_warmup --> live
  c_join["join"]
  cli --> c_join
  mcp --> c_join
  c_join --> live
  c_scan["scan"]
  cli --> c_scan
  mcp --> c_scan
  c_scan --> live
  c_status["status"]
  cli --> c_status
  mcp --> c_status
  c_status --> live
  c_watch["watch"]
  cli --> c_watch
  mcp --> c_watch
  c_watch --> live
  c_proxy["proxy"]
  cli --> c_proxy
  mcp --> c_proxy
  c_publish["publish"]
  cli --> c_publish
  mcp --> c_publish
  c_publish --> live
  c_campaign["campaign"]
  cli --> c_campaign
  mcp --> c_campaign
  c_campaign --> live
  c_conversations["conversations"]
  cli --> c_conversations
  mcp --> c_conversations
  c_conversation["conversation"]
  cli --> c_conversation
  mcp --> c_conversation
  c_errors["errors"]
  cli --> c_errors
  mcp --> c_errors
  c_graph["graph"]
  cli --> c_graph
  mcp --> c_graph
  c_capture["capture"]
  cli --> c_capture
  mcp --> c_capture
  c_capture --> live
  c_login["login"]
  cli --> c_login
  c_login -.- terminal
  c_logout["logout"]
  cli --> c_logout
  mcp --> c_logout
  c_whoami["whoami"]
  cli --> c_whoami
  mcp --> c_whoami
  f_profileSetup["flowProfileSetup: flow run profileSetup"]
  mcp --> f_profileSetup
  f_profileSetup --> c_flow
```

Source: [`docs/diagrams/commands.mmd`](docs/diagrams/commands.mmd).

### The hooks (rule 55)

One list (`src/agentHooks/registry`) writes Claude Code's `.claude/settings.json` and Codex's `.codex/hooks.json`. How to add one: `skills/agentHooks/SKILL.md`.

| Event | Matcher | Script | What it does |
| --- | --- | --- | --- |
| SessionStart | `startup\|resume\|clear\|compact` | [`scripts/hooks/pageState.ts`](scripts/hooks/pageState.ts) | where every open browser is, the moment a session starts or comes back from compaction |
| UserPromptSubmit | every turn | [`scripts/hooks/pageState.ts`](scripts/hooks/pageState.ts) | where every open browser is, with each of matt's prompts |
| PreToolUse | `Bash\|PowerShell\|Monitor` | [`scripts/hooks/liveLogs.ts`](scripts/hooks/liveLogs.ts) | a log-cli run that would hide its lines (piped through tail or head) is refused before it starts; a long one off a Monitor is told to start one (rule 26) |
| PostToolUse | `Bash\|PowerShell\|Monitor\|mcp__log__.*` | [`scripts/hooks/pageState.ts`](scripts/hooks/pageState.ts) | a browser landed on a known state (checkpoint, captcha, prompt) or a step failed: its resolver, at once |
| Stop | every turn | [`scripts/hooks/pageState.ts`](scripts/hooks/pageState.ts) | the turn does not end while a browser sits on a state log-cli can resolve (rule 54) |

Around every turn, whatever is called: SessionStart, UserPromptSubmit, Stop.

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
  matt->>Agent: a prompt
  Agent->>Hook: UserPromptSubmit
  Note over Hook: where every open browser is, with each of matt's prompts
  loop each tool call
    Agent->>Hook: PreToolUse
    Note over Hook: a log-cli run that would hide its lines (piped through tail or head) is refused before it starts; a long one off a Monitor is told to start one (rule 26)
    alt a log run piped through tail/head
      Hook-->>Agent: refused (exit 2), run it live
    else
      Agent->>Tool: the call
      Tool-->>Agent: its result
      Agent->>Hook: PostToolUse
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
  textCaptcha["textCaptcha: a text captcha (#quot;Enter the text from the image#quot;)"]
  page --> textCaptcha
  textCaptcha -->|"log inspect do solve --live --account #lt;a#gt;"| nexttextCaptcha(["next state"])
  checkpointStart["checkpointStart: a checkpoint's first page (#quot;confirm that you're human to use your account#quot;)"]
  page --> checkpointStart
  checkpointStart -->|"click Continue"| nextcheckpointStart(["next state"])
  automatedBehaviour["automatedBehaviour: #quot;We suspect automated behaviour#quot;"]
  page --> automatedBehaviour
  automatedBehaviour -->|"dismiss it, as Listaro did"| nextautomatedBehaviour(["next state"])
  rememberPassword["rememberPassword: the #quot;Remember password#quot; prompt"]
  page --> rememberPassword
  rememberPassword -->|"click #quot;Not now#quot;"| nextrememberPassword(["next state"])
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

#### log listings

List the Twenty listings, by status, account or campaign MCP tool: `listings` (`args` takes the same arguments).

```text
log listings [--status <STATUS>] [--account <accountName>] [--campaign <campaignId>] [--json]
```

#### log listing

Show one Twenty listing, or create one for an account from a JSON file MCP tool: `listing` (`args` takes the same arguments).

```text
log listing <agencyListingId> [--json]
log listing create --account <accountName> --file <listing.json> [--json]
The file: title, description, price, priceCurrency, category, condition (new|usedLikeNew|usedGood|usedFair), photos (paths or URLs), locationQuery, locationCity, locationCountry, locationPostalCode (the zip: Facebook finds a US city by it).
```

#### log accounts

List the FACEBOOK accounts in Twenty: status, home, proxy, and whether each may run MCP tool: `accounts` (`args` takes the same arguments).

```text
log accounts [--json]
```

#### log account

Show one account, or set its status (banned/dead/restricted replace its campaign listings) MCP tool: `account` (`args` takes the same arguments).

```text
log account show <accountName> [--json]
log account resave <accountName> --from <folder>   (a run's device and session Twenty didn't take: ~/.logCli/runs/unsaved/...)
log account resetOpens <accountName|all> [--reason <text>]   (today's launches and host opens count from now; nothing is deleted)
log account status <accountName> <ACTIVE|WARMING|LIMITED|PAUSED|NEEDS_LOGIN|CHECKPOINT|RESTRICTED|BANNED|DEAD> [--reason <code>] [--detail <text>]
```

#### log adsPower

AdsPower: Local API status, its profiles, and one profile per Twenty account (sync) MCP tool: `adsPower` (`args` takes the same arguments).

```text
log adsPower status
log adsPower profiles [--json]
log adsPower sync [--apply] [--account <accountName>] [--json]   (dry run unless --apply)
```

#### log lifecycle

Each account's place in its lifecycle (rule 35): status, state, what onboarding has left; `states` prints the machine MCP tool: `lifecycle` (`args` takes the same arguments).

```text
log lifecycle [--account <name>] [--json]
log lifecycle states [--write]   (the machine's state tree; --write regenerates docs/lifecycle.md)
```

#### log doctor

Check python, facebook-camofox-client, Camoufox, Twenty, and which accounts may run MCP tool: `doctor` (`args` takes the same arguments).

```text
log doctor [--json]
```

#### log connect

Sign a Facebook account in through its proxy (the connect machine), save its cookies to Twenty MCP tool: `connect` (`args` takes the same arguments).

```text
log connect --account <accountName> [--noPrompt] [--wait <seconds>] [--bypass] [--now]
```

#### log profile

Set an account's profile picture and cover photo from Twenty (dry run unless --live, rule 28) MCP tool: `profile` (`args` takes the same arguments).

```text
log profile setup --account <accountName> [--live] [--bypass] [--json]
```

#### log host

Run an account's lifecycle in ONE browser kept open for its day, resuming where it left (rule 35); send it events; read its progress MCP tool: `host` (`args` takes the same arguments).

```text
log host start --account <accountName> [--live] [--likes] [--bypass] [--gapMinutes <n>] [--watchMinutes <n>]   (--live: profile, name, location; --likes: the warm-up's likes)
log host send --account <accountName> <PERSON_DONE|PAUSE|RESUME|SHUTDOWN|LOST>
log host status [--account <accountName>]
```

#### log inspect

Drive one gated Camoufox a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29) MCP tool: `inspect` (`args` takes the same arguments).

```text
log inspect start --account <accountName> [--url <https://www.facebook.com/...>] [--bypass] [--now] [--noIdleMouse] [--detach]   (one session per account: two accounts can be open at once; --detach runs it as its own process and returns once it is open)
log inspect map [<runDir>] [--all]  (the recorded steps as states and transitions: flow.md, machine.json; default the latest run; --all collates every run)
log inspect do <goto <url>|snapshot|back|wait [s]|click <ref>|type <ref> <text>|press <key>|upload <ref> <file>|highlight <role> <name>|solve|signIn|code|stop> [--live] [--timeout <s>] [--json] [--account <accountName>]   (--account picks the session when more than one is open)
log inspect sessions   (the open sessions)
```

#### log flow

Recorded inspect runs as flows: docs, an XState machine per flow, run on any account (rule 31) MCP tool: `flow` (`args` takes the same arguments).

```text
log flow fromInspect <runDir> --name <name> [--summary <text>] [--rename text1=firstName]...
log flow docs <name> | list | show <name>
log flow run <name> --account <accountName> [--set <param>=<value>]... [--live] [--bypass] [--now] [--json]
```

#### log warmup

The warm-up, by platform and activity (`log warmup facebook reel`: the browser opened primed with it, each step checked, the outline written, rule 49), and Listaro's five activities (record, run, feed, rule 36) MCP tool: `warmup` (`args` takes the same arguments).

```text
log warmup plan
log warmup record --account <accountName> [--only feedBrowse,marketplaceBrowse] [--likes] [--bypass] [--now]
log warmup run --account <accountName> [--only …] [--likes] [--gapMinutes <n>] [--bypass] [--now]
log warmup feed [--account <accountName>] [--lines <n>] [--follow [--seconds <n>]]
log warmup <platform> <activity> [--account <a>] [--live] [--likes] [--bypass] [--now]   (record: the account's browser opened primed with the activity, each step checked, the outline written)
log warmup <platform> <activity> plan [--reels 8-20] [--watch 4-25] [--skip 0.6] [--comments 0.3] [--profile 0.15] [--likes] [--seed <n>] [--json]
log warmup <platform> <activity> run --account <a> [plan flags] [--live] [--likes] [--bypass]   (a drawn session, stopped at the first step that doesn't do what it should)
log warmup <platform> <activity> run --account <a> --persona [--newPersona] [--reels 8-20] [--trafficMb 1024] [--live] [--likes] [--bypass]   (the persona's For you feed: SubQ reads each reel, the orderer plans it from the pack and real viewer, rule 50)
log warmup facebook feed run --account <a> --persona [--posts 8-15] [--trafficMb 1024] [--live] [--likes] [--bypass]   (the home feed post by post: SubQ reads each post, a glance or a read and a like where the persona would, then Marketplace and listings)
log warmup <platform> persona --account <a> [--newPersona] [--seed <n>]   (the account's behaviour profile and real viewer, from the datasets; no browser, no SubQ)
Platforms: facebook. Facebook activities: reel, feed.
```

#### log join

Join a Facebook group as one account, in its open browser: read the gate, --live presses Join; every step patches agencyGroups.joinSubmission (rule 45) MCP tool: `join` (`args` takes the same arguments).

```text
log join group --account <accountName> --group <group url, id or name> [--live] [--json]
log join group --account <accountName> --group <g> --show
log join group --account <accountName> --group <g> --answer [--set <n>=<value>]... [--agree]   (Clack steps over the group's questions, or the same answers given here; saved to Twenty, never sent)
log join group --account <accountName> --group <g> --fill [--live [--submit]]   (the draft into the group's dialog, step by step)
Every step in the browser runs inside the account's local hours (rule 18); --bypass skips that for one run, only when matt asked (rule 20).
The account's browser must be open (log inspect start --account <a>, or log host start): a join is a step in it (rule 35).
```

#### log scan

Read Marketplace > Selling live for one account and update its listings in Twenty MCP tool: `scan` (`args` takes the same arguments).

```text
log scan --account <accountName> [--json] [--bypass]
```

#### log status

Open one Marketplace item page live and classify its status MCP tool: `status` (`args` takes the same arguments).

```text
log status <listingId> --account <accountName> [--json] [--bypass]
```

#### log watch

Run the listing monitor (XState) for one account and print every step MCP tool: `watch` (`args` takes the same arguments).

```text
log watch --account <accountName> [--checks <n>] [--interval <minutes>] [--json] [--bypass]
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

#### log publish

Post one Twenty listing (dry run unless --live), printing every machine step MCP tool: `publish` (`args` takes the same arguments).

```text
log publish --listing <agencyListingId> [--live] [--json] [--formUrl <url>] [--bypass] [--now]
Dry run unless --live: fills and checks everything, never clicks Publish.
The listing, its account and the account's proxy all come from Twenty.
--bypass skips only the account's waking hours (rule 18); every other gate still runs.
--now skips only the 10-minute launch gap (rule 24); the 8 launches a day still hold.
```

#### log campaign

Put one ad on N accounts in one place, replace lost accounts, publish the campaign MCP tool: `campaign` (`args` takes the same arguments).

```text
log campaign fill --campaign <agencyCampaignId> --from <agencyListingId> --accounts <n>
log campaign heal --campaign <agencyCampaignId>
log campaign run  --campaign <agencyCampaignId> [--live] [--bypass]
log campaign show --campaign <agencyCampaignId> [--json]
```

#### log conversations

List buyers' Marketplace conversations in Twenty, newest first, by account or listing MCP tool: `conversations` (`args` takes the same arguments).

```text
log conversations [--account <name>] [--listing <agencyListingId>] [--json]
```

#### log conversation

One conversation: show its messages, mark read, set its lead status, link its listing, or store a scanned thread MCP tool: `conversation` (`args` takes the same arguments).

```text
log conversation show <id> [--json]
log conversation read <id>
log conversation lead <id> <NEW|CONTACTED|QUALIFIED|BOOKED|LOST|SPAM>
log conversation link <id> --listing <agencyListingId>
log conversation record --account <name> --file <threads.json>
```

#### log errors

List every error code: meaning, retryable, where each machine ends up MCP tool: `errors` (`args` takes the same arguments).

```text
log errors [--layer <account|listing|photo|form|captcha|runtime|twenty|proxyVendor|auth|profile>] [--code <code>] [--json] [--markdown]
```

#### log graph

Print a machine's states and transitions as a Mermaid diagram MCP tool: `graph` (`args` takes the same arguments).

```text
log graph <publish|monitor>
```

#### log capture

Read a run's raw HAR (any browser driver) and its scripts with offline rea; --docs builds the Facebook client docs. No browser. MCP tool: `capture` (`args` takes the same arguments).

```text
log capture --har <path> [--out <dir>] [--noRea] [--json]
log capture --settle <runCaptureDir>  (what each run starts in the background: rea reads its capture, split per step)
log capture --docs [--noRea]  (every run's requests → docs/platforms/facebook/, one doc per request, rea reading each one's slice)
The HAR is the one Playwright writes from Camoufox. It is copied raw, and rea reads it. No browser opens.
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

<!-- surface:end -->

## Twenty

- `scripts/twentySetup.mjs` adds the fields log-cli needs (additive only; prints
  the plan, `--apply` creates them).
- `bun run twenty:client` regenerates `src/twenty/graphql/generated` from the live
  workspace (twenty-client-sdk), the same way blaster (`pnpm twenty:client`) and the
  dialer (`bun run api:client`) do. `bun run twenty:client:check` fails when it is stale.
- Tests never call Twenty: they inject `marketplaceFixture()`, an in-memory Twenty.

## The listing monitor (`log watch`)

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

`log watch` prints each event and state through XState's inspect API
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

## The browser: AdsPower, with Camoufox kept (rule 42)

The direction from 2026-10-19: accounts move to **AdsPower**, Listaro's browser and
SubQ's pick on our recorded issues. **Camoufox stays** and can be used again later.
Twenty's `socialAccounts` logic doesn't change.

The browser is a driver (`src/browser/driver`). One XState machine runs every
account's session, whichever browser it uses: prepare, gate, start, self-check,
open, close. A browser can't open without its proxy gate (rule 12), and isn't open
before its self-check (rule 17). Another browser is added by writing one more
driver.

```bash
bun bin/log.ts adsPower status          # AdsPower's Local API answers
bun bin/log.ts adsPower profiles        # its profiles, and the Twenty account of each
bun bin/log.ts adsPower sync            # dry run: one profile per Facebook account
bun bin/log.ts adsPower sync --apply    # make them, link each in socialAccounts.adsPowerProfileId
```

A profile holds no proxy, password or 2FA key: those stay in Twenty. Both browsers are
opened by one Python layer (`python/browserDriver.py`), which hands every session the same
Playwright context. So the proxy gate, the self-check, the session HAR, the human mouse and
scroll, the flows and the warm-up are the same on either. `docs/browsers.md` is the parity
table, and `bun run check:browsers` (pre-commit) keeps it. Setup and what's next:
`docs/adsPower.md`. Across servers: `docs/deployment.md`.

## Live mode (Camoufox)

`doctor`, `connect`, `scan`, `status` and `watch` launch Camoufox through
[facebook-camofox-client](https://github.com/PRACE1/facebook-camofox-client)
(`python/logWorker.py`); `publish` drives its own session
(`python/publishSession.py`). Before either starts, the account must pass the
account check, and at launch `python/proxyGate.py` checks the proxy exits in the
account's home country (rule 12). The proxy and cookies come from Twenty, are
written to a private temp folder for the run, and are deleted afterwards.
Every launch is headed, humanized, with the cursor shown (rule 11).

Setup, once:

```bash
git clone https://github.com/PRACE1/facebook-camofox-client ../facebook-camofox-client
pip install -e ../facebook-camofox-client
python -m camoufox fetch          # downloads the Camoufox browser
bun bin/log.ts doctor
```

## Record a procedure, then run it anywhere (`log inspect`, `log flow`)

`log inspect` drives one gated, headed Camoufox a step at a time and records
every step (snapshot, screenshot, HAR, rea). `log flow fromInspect` turns that
recording into a flow: its docs, an XState machine, `log flow run <name>` for
any account, and an MCP tool of its own (`flowProfileSetup`). The whole
pipeline, the actions, the saved flows and what the recordings showed:
`docs/recordToFlow.md`. Every request Facebook's pages made: `docs/platforms/facebook/`.

## Layout

```text
bin/log.ts                      entrypoint
src/twenty/graphql/             the generated Twenty client (generated/), its seam, an in-memory Twenty for tests
src/marketplace/socialAccount/  Facebook accounts in Twenty, the account check (checkRunnable)
src/marketplace/agencyListing/  listings in Twenty, run write-back, dashboard sync
src/marketplace/replacement/    losing an account, replacements, campaign fill
src/marketplace/publish/        the XState publish machine
src/marketplace/monitor/        the XState listing monitor + relist rules
src/marketplace/listing/        the listeningkit-hackathon listing machine port (+ its seed)
src/browser/driver/             the browser-agnostic session machine and capability list (rules 42, 44)
src/browser/camoufox/           Camoufox's driver and capability row
src/browser/adsPower/           AdsPower: Local API client (from Listaro), profile sync, its driver and capability row
src/browser/run/                one run's private proxy/cookie files, the launch budget (every browser)
src/browser/proxy/              the proxy check's result types (every browser)
src/browser/inspect/            log inspect: one open browser driven a step at a time (every browser)
src/browser/flow/               recordings → flows, their XState machines, the page states (every browser)
src/camofox/device/             Camoufox's one device per account (rule 15)
src/camofox/worker/             spawns python/logWorker.py
src/camofox/session/            drives python/publishSession.py step by step
src/captcha/router/             CaptchaKraken → 2Captcha → a person
src/errors/catalog/             every error code, once
src/cli/*                       the commands
src/agentHooks/                 the agent hooks (Claude Code, Codex) and what each decides (rule 55)
src/surface/                    the catalog of commands, MCP tools and hooks; the README section and diagrams (rule 56)
python/proxyGate.py             no launch unless the proxy exits in the home country
python/visibleBrowser.py        headed, humanized, cursor shown
```

See `docs/namingConventions.md`. Run `bun run check` for the naming gate, typecheck and tests.

## License

MIT
