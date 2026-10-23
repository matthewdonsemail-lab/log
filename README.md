# log-cli

The command line for ListeningKit's Facebook Marketplace work. Accounts and
listings live in Twenty (`socialAccounts`, `agencyListings`), reached through
the same generated GraphQL client blaster and the dialer use.

log-cli is **browser-agnostic**. Each account's browser is a driver picked from
Twenty: **AdsPower** first (one profile per account, Listaro's browser),
Camoufox kept, and more browser providers to come, each one more driver
(`src/browser/<name>`). Every driver opens through the same gates: the proxy in
the account's home country (rule 12), the launch self-check (rule 17), a raw HAR
of everything (rule 22), and one human mouse (rule 32). Which commands run on
the account's browser, and which still launch Camoufox themselves, is in
[Browsers](#the-browser-layer) below, generated from the code. Every result is
written back to Twenty.

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

log-cli is browser-agnostic: each account's browser is a driver (AdsPower first, Camoufox kept, more browser providers to come), and every driver opens through the same gates.
It is platform-agnostic too: Facebook (Marketplace and groups) is the first platform. A command that acts on one platform names it first, `log <platform> <command> …` (`log facebook connect`, `log facebook warmup reel`), in every form; one that works on any platform takes none (the Platform column, rule 63).
Every command is a CLI command (`bun bin/log.ts [<platform>] <command>`) and, unless it only works in a terminal, an MCP tool named for the command on the `log` server (a Facebook tool runs `log facebook <command>`).
The same hooks fire whether it runs from a shell or over MCP, and both write the same live log, `~/.logCli/mcp/<day>.log`.
This section and `docs/diagrams/*.mmd` are generated from the code (`COMMANDS`, `AGENT_HOOKS`, `PAGE_STATES`, the saved flows) by `bun run docs:build`.
`bun run check:docs` (lefthook pre-commit and pre-push) refuses a commit where they differ (rule 56).

### The browser layer

log-cli is browser-agnostic: each account's browser is a driver picked from Twenty, AdsPower first, and every driver opens through the same gates. From `BROWSER_DRIVERS` (`src/browser/driver`) and `commandBrowser` (`src/browser/run`).

```mermaid
flowchart LR
  twenty["Twenty socialAccounts: browserDriver, adsPowerProfileId"]
  pick{"driverNameOf"}
  gates["Every driver: proxy gate, self-check, HAR, human mouse (rules 12, 17, 22, 32)"]
  session["One Playwright context: python/browser/browserDriver.py"]
  twenty --> pick
  pick -->|"browserDriver camoufox, or no profile"| d_camoufox["camoufox"]
  pick -->|"a linked profile, or browserDriver adsPower"| d_adsPower["adsPower"]
  d_camoufox --> gates
  d_adsPower --> gates
  more["Next browser provider: one more driver (src/browser/name), rule 44"] -.-> gates
  gates --> session
  account["On the account's browser: host, inspect, flow, warmup, join, read, poll, check"]
  camoufox["Camoufox only, not on the driver yet: doctor, connect, profile, scan, status, watch, publish, campaign"]
  session --> account
  camoufox -.->|"launches Camoufox itself"| d_camoufox
```

Source: [`docs/diagrams/browsers.mmd`](docs/diagrams/browsers.mmd).

- **The account's browser, through the driver:** `host`, `inspect`, `flow`, `warmup`, `join`, `read`, `poll`, `check`. They run on whichever browser the account uses: AdsPower when it has a linked profile (`socialAccounts.adsPowerProfileId`), Camoufox otherwise, or what `socialAccounts.browserDriver` says.
- **Camoufox only, not on the driver yet:** `doctor`, `connect`, `profile`, `scan`, `status`, `watch`, `publish`, `campaign`. They launch Camoufox themselves (facebook-camofox-client's worker, or the publish, connect and profile sessions), so on an AdsPower account they don't open its AdsPower profile. Moving one onto the driver is moving it into `OPENER_ACTIONS` (`src/browser/run`).
- **No browser:** `launch`, `listings`, `listing`, `accounts`, `account`, `adsPower`, `lifecycle`, `proxy`, `conversations`, `conversation`, `messenger`, `errors`, `graph`, `capture`, `runs`, `browsers`, `job`, `mcp`, `login`, `logout`, `whoami`.

Each browser's capabilities, built or not: [`docs/browsers.md`](docs/browsers.md) (generated, `bun run check:browsers`). AdsPower's setup: [`docs/adsPower.md`](docs/adsPower.md).

### How a call reaches log-cli

From a shell or over MCP, both run the same commands through `runCli`, write the same live log, and pass through the same hooks.

```mermaid
flowchart LR
  agent["Agent (Claude Code, Codex)"]
  matt["matt, in a terminal"]
  shell["Bash / PowerShell / Monitor"]
  mcp["MCP server log: 59 command tools + saved flows"]
  bin["bin/log.ts"]
  runCli["runCli: 37 commands (COMMANDS)"]
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
  turn2{{"SessionStart: storage.ts"}} -.-> agent
  turn3{{"UserPromptSubmit: storage.ts"}} -.-> agent
  turn4{{"Stop: pageState.ts"}} -.-> agent
  browser -.->|each step's snapshot| post0
```

Source: [`docs/diagrams/surface.mmd`](docs/diagrams/surface.mmd).

### Every command

Every command also takes `--proxyMs <ms>` (this run's proxy speed limit, rule 33). `--live` acts on Facebook and over MCP needs `confirmLive: true`; `--bypass` needs `confirmBypass: true` (rules 8, 10, 20).

| Command | What it does | Platform | Flags | Browser | MCP tool | Hooks: shell · MCP | Live log | Rules |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [`log launch`](#log-launch) | Guided Clack menu over the listings, accounts and live commands | any (none) | `--json` | none | terminal only: prompts in a terminal (Clack). Call the commands it wraps directly. | PreToolUse, PostToolUse · n/a | no | 30, 38, 39, 40, 41 |
| [`log facebook listings`](#log-facebook-listings) | List the Twenty listings, by status, account or campaign | `facebook` first | `--status <STATUS>` `--account <accountName>` `--campaign <campaignId>` `--json` | none | `listings` | PreToolUse, PostToolUse · PostToolUse | no | 13, 30, 38, 39, 40, 41 |
| [`log facebook listing`](#log-facebook-listing) | Show one Twenty listing, or create one for an account from a JSON file | `facebook` first | `--json` `--account <accountName>` `--file <listing.json>` | none | `listing`, `listingCreate` | PreToolUse, PostToolUse · PostToolUse | no | 13, 30, 38, 39, 40, 41 |
| [`log facebook accounts`](#log-facebook-accounts) | List the FACEBOOK accounts in Twenty: status, home, proxy, and whether each may run | `facebook` first | `--json` | none | `accounts` | PreToolUse, PostToolUse · PostToolUse | no | 13, 30, 38, 39, 40, 41 |
| [`log facebook account`](#log-facebook-account) | Show one account, or set its status (banned/dead/restricted replace its campaign listings) | `facebook` first | `--json` `--from <folder>` `--reason <text>` `--detail <text>` | none | `accountShow`, `accountResave`, `accountResetOpens`, `accountStatus` | PreToolUse, PostToolUse · PostToolUse | no | 13, 37, 30, 38, 39, 40, 41 |
| [`log adsPower`](#log-adspower) | AdsPower: Local API status, its profiles, and one profile per Twenty account (sync) | any (none) | `--json` `--apply` `--account <accountName>` | none | `adsPower` | PreToolUse, PostToolUse · PostToolUse | no | 42, 44, 30, 38, 39, 40, 41 |
| [`log facebook lifecycle`](#log-facebook-lifecycle) | Each account's place in its lifecycle (rule 35): status, state, what onboarding has left; `states` prints the machine | `facebook` first | `--account <name>` `--json` `--write` | none | `lifecycle` | PreToolUse, PostToolUse · PostToolUse | no | 35, 30, 38, 39, 40, 41 |
| [`log facebook doctor`](#log-facebook-doctor) | Check python, facebook-camofox-client, Camoufox, Twenty, and which accounts may run | `facebook` first | `--json` | Camoufox only | `doctor` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 12, 30, 38, 39, 40, 41 |
| [`log facebook connect`](#log-facebook-connect) | Sign a Facebook account in through its proxy (the connect machine), save its cookies to Twenty | `facebook` first | `--account <accountName>` `--noPrompt` `--wait <seconds>` `--bypass` `--now` | Camoufox only | `connect` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 12, 18, 21, 23, 24, 30, 38, 39, 40, 41 |
| [`log facebook profile`](#log-facebook-profile) | Set an account's profile picture and cover photo from Twenty (dry run unless --live, rule 28) | `facebook` first | `--account <accountName>` `--live` `--bypass` `--json` | Camoufox only | `profile`, `profileLive` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 28, 30, 38, 39, 40, 41 |
| [`log facebook host`](#log-facebook-host) | Run an account's lifecycle in ONE browser kept open for its day, resuming where it left (rule 35); send it events; read its progress | `facebook` first | `--account <accountName>` `--live` `--likes` `--bypass` `--gapMinutes <n>` `--watchMinutes <n>` | the account's | `hostStart`, `hostStartLive`, `hostSend`, `hostStatus` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 18, 35, 30, 38, 39, 40, 41 |
| [`log inspect`](#log-inspect) | Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29) | any (none) | `--account <accountName>` `--url <https://www.facebook.com/...>` `--bypass` `--now` `--noIdleMouse` `--detach` `--all` `--live` `--timeout <s>` `--json` | the account's | `inspectStart`, `inspectDo`, `inspectDoLive`, `inspectMap`, `inspectSessions` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 12, 17, 22, 24, 26, 29, 30, 35, 48, 54, 55, 68, 30, 38, 39, 40, 41 |
| [`log flow`](#log-flow) | Recorded inspect runs as flows: docs, an XState machine per flow, run on any account (rule 31) | any (none) | `--name <name>` `--summary <text>` `--rename` `--account <accountName>` `--set <param>` `--live` `--bypass` `--now` `--json` | the account's | `flow`, `flowLive` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 29, 31, 68, 30, 38, 39, 40, 41 |
| [`log <platform> warmup`](#log-platform-warmup) | The warm-up, by platform and activity: `log facebook warmup reel\|feed\|stages` (the account's browser primed with the activity, each step checked, the outline written; rules 49, 60) | `<platform>` first | `--account <a>` `--live` `--likes` `--bypass` `--now` `--json` `--newPersona` `--seed <n>` `--reels` `--watch` `--skip` `--comments` `--profile` `--persona` `--trafficMb` `--posts` `--only` `--gapMinutes <n>` `--lines <n>` `--follow` `--seconds <n>` | the account's | `warmup`, `warmupLive` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 18, 20, 25, 26, 29, 32, 35, 36, 49, 50, 51, 54, 55, 60, 64, 30, 38, 39, 40, 41 |
| [`log facebook join`](#log-facebook-join) | Join a Facebook group as one account, in its open browser: read the gate, --live presses Join; every step patches agencyGroups.joinSubmission (rule 45) | `facebook` first | `--account <accountName>` `--group <group url, id or name>` `--live` `--json` `--show` `--answer` `--set <n>` `--agree` `--fill` `--submit` `--bypass` | the account's | `join`, `joinLive` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 10, 18, 20, 25, 26, 29, 35, 45, 64, 30, 38, 39, 40, 41 |
| [`log facebook read`](#log-facebook-read) | Read a Facebook group's new posts and their comments as one account, in its open browser, by hand; only the group's cursor is saved to Twenty (#27, rule 65) | `facebook` first | `--account <accountName>` `--group <group url or id>` `--scrolls <n>` `--commentPosts <n>` `--live` `--bypass` `--json` `--show` `--worker` | the account's | `read`, `readLive` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 13, 18, 20, 22, 25, 26, 29, 35, 45, 63, 64, 65, 30, 38, 39, 40, 41 |
| [`log facebook poll`](#log-facebook-poll) | Poll a Facebook group from one account, in its open browser, for a time or once: each poll's posts as one JSON line, OpenMagpie's records; --request answers OpenMagpie's facebook_group worker (#27, rule 63) | `facebook` first | `--bypass` `--request <request json>` | the account's | `poll` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 13, 18, 22, 26, 35, 45, 63, 64, 65, 30, 38, 39, 40, 41 |
| [`log facebook check`](#log-facebook-check) | Check one account in its open browser: may it still sell, each listing's state on Selling (into Twenty), and its seller inbox's chats | `facebook` first | `--account <accountName>` `--bypass` `--json` | the account's | `check` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 13, 18, 22, 29, 35, 69, 30, 38, 39, 40, 41 |
| [`log facebook scan`](#log-facebook-scan) | Read Marketplace > Selling live for one account and update its listings in Twenty | `facebook` first | `--account <accountName>` `--json` `--bypass` | Camoufox only | `scan` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 12, 18, 22, 30, 38, 39, 40, 41 |
| [`log facebook status`](#log-facebook-status) | Open one Marketplace item page live and classify its status | `facebook` first | `--account <accountName>` `--json` `--bypass` | Camoufox only | `status` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 12, 18, 22, 30, 38, 39, 40, 41 |
| [`log facebook watch`](#log-facebook-watch) | Run the listing monitor (XState) for one account and print every step | `facebook` first | `--account <accountName>` `--checks <n>` `--interval <minutes>` `--json` `--bypass` | Camoufox only | `watch` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 6, 18, 30, 38, 39, 40, 41 |
| [`log proxy`](#log-proxy) | Check an account's proxy, give it one from a provider (2Captcha, Byteful) in its home city, or see providers' traffic | any (none) | `--account <accountName>` `--json` `--missing` `--vendor` `--city <city>` `--region <state>` `--anyCity` `--minutes <1-120>` `--socks5` | none | `proxy` | PreToolUse, PostToolUse · PostToolUse | no | 12, 33, 41, 43, 51, 52, 30, 38, 39, 40, 41 |
| [`log facebook publish`](#log-facebook-publish) | Post one Twenty listing (dry run unless --live), printing every machine step | `facebook` first | `--listing <agencyListingId>` `--live` `--json` `--formUrl <url>` `--bypass` `--now` | Camoufox only | `publish`, `publishLive` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 10, 12, 18, 22, 24, 68, 30, 38, 39, 40, 41 |
| [`log facebook campaign`](#log-facebook-campaign) | Put one ad on N accounts in one place, replace lost accounts, publish the campaign | `facebook` first | `--campaign <agencyCampaignId>` `--from <agencyListingId>` `--accounts <n>` `--live` `--bypass` `--json` | Camoufox only | `campaign`, `campaignLive` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 13, 18, 30, 38, 39, 40, 41 |
| [`log facebook conversations`](#log-facebook-conversations) | List buyers' Marketplace conversations in Twenty, newest first, by account or listing | `facebook` first | `--account <name>` `--listing <agencyListingId>` `--json` | none | `conversations` | PreToolUse, PostToolUse · PostToolUse | no | 34, 30, 38, 39, 40, 41 |
| [`log facebook conversation`](#log-facebook-conversation) | One conversation: show its messages, mark read, set its lead status, link its listing, or store a scanned thread | `facebook` first | `--json` `--listing <agencyListingId>` `--account <name>` `--file <threads.json>` | none | `conversationShow`, `conversationRead`, `conversationLead`, `conversationLink`, `conversationRecord` | PreToolUse, PostToolUse · PostToolUse | no | 34, 30, 38, 39, 40, 41 |
| [`log facebook messenger`](#log-facebook-messenger) | Messenger's PIN for the account's encrypted chats: asked in a Clack prompt, kept in Twenty, never printed | `facebook` first | `--account <accountName>` `--show` | none | terminal only: asks matt for the Messenger PIN in a Clack prompt (masked). He runs `bun bin/log.ts facebook messenger pin --account <a>` in a terminal. | PreToolUse, PostToolUse · n/a | no | 8, 21, 29, 54, 63, 67, 30, 38, 39, 40, 41 |
| [`log errors`](#log-errors) | List every error code: meaning, retryable, where each machine ends up | any (none) | `--layer <account|listing|photo|form|captcha|runtime|twenty|proxyVendor|auth|profile>` `--code <code>` `--json` `--markdown` | none | `errors` | PreToolUse, PostToolUse · PostToolUse | no | 25, 30, 38, 39, 40, 41 |
| [`log graph`](#log-graph) | Print a machine's states and transitions as a Mermaid diagram | any (none) | none | none | `graph` | PreToolUse, PostToolUse · PostToolUse | no | 6, 25, 30, 38, 39, 40, 41 |
| [`log facebook capture`](#log-facebook-capture) | Read a run's raw HAR (any browser driver) and its scripts with offline rea; --docs builds the Facebook client docs. No browser. | `facebook` first | `--har <path>` `--out <dir>` `--noRea` `--json` `--settle <runCaptureDir>` `--docs` | none | `capture` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 19, 22, 26, 27, 46, 48, 30, 38, 39, 40, 41 |
| [`log runs`](#log-runs) | The recorded runs on this machine, and pruning the ones rea settled and the request docs hold, keeping each one's findings and domains | any (none) | `--json` `--before <YYYY-MM-DD>` `--apply` | none | `runsList`, `runsPrune`, `runsSpace` | PreToolUse, PostToolUse · PostToolUse | no | 19, 22, 25, 27, 66, 30, 38, 39, 40, 41 |
| [`log browsers`](#log-browsers) | Where every open browser is: its page, the known page state it sits on, the call that resolves it, and what only matt can clear (rules 54-55) | any (none) | `--json` | none | `browsers` | PreToolUse, PostToolUse · PostToolUse | no | 29, 35, 54, 55, 30, 38, 39, 40, 41 |
| [`log job`](#log-job) | Follow or stop a long MCP run: each runs as a job when it outlasts its call's wait | any (none) | `--afterLine <n>` `--waitMs <ms>` `--json` | none | `jobStatus`, `jobCancel`, `jobList` | PreToolUse, PostToolUse · PostToolUse | no | 10, 26, 35, 30, 38, 39, 40, 41 |
| [`log mcp`](#log-mcp) | This server's MCP sign-ins over OAuth (through Twenty, the owner only): list the clients, revoke them | any (none) | `--json` | none | terminal only: manages who may sign in to this server's MCP (OAuth through Twenty). matt runs `bun bin/log.ts mcp clients` or `mcp revoke <clientId\|all>` in a terminal on the server. | PreToolUse, PostToolUse · n/a | no | 21, 47, 30, 38, 39, 40, 41 |
| [`log login`](#log-login) | Sign in with Twenty through blaster's web app (OAuth), like `blaster login` | any (none) | `--webUrl <url>` `--apiUrl <url>` `--token <accessToken>` `--json` | none | terminal only: opens a browser for Twenty OAuth and waits for it. Run `bun bin/log.ts login` in a terminal. | PreToolUse, PostToolUse · n/a | no | 30, 38, 39, 40, 41 |
| [`log logout`](#log-logout) | Forget the stored Twenty session | any (none) | `--apiUrl <url>` `--json` | none | `logout` | PreToolUse, PostToolUse · PostToolUse | no | 30, 38, 39, 40, 41 |
| [`log whoami`](#log-whoami) | Show who is signed in, refreshing the session if it expired | any (none) | `--apiUrl <url>` `--json` | none | `whoami` | PreToolUse, PostToolUse · PostToolUse | no | 30, 38, 39, 40, 41 |

### Saved flows: MCP tools of their own (rule 31)

| MCP tool | Runs | What it does | Params | Steps |
| --- | --- | --- | --- | --- |
| `flowDeletePost`, `flowDeletePostLive` | `log flow run deletePost` | Delete the newest post on the account's own profile: its Actions menu, Move to bin, Move (useCometTrashPostMutation; Facebook empties the bin after 30 days). Writes on Facebook (--live). | none | gotoprofilePhp → clickActionsForThisPost → clickMoveToBinItems → clickMove |
| `flowGroupHeaderMenus`, `flowGroupHeaderMenusLive` | `log flow run groupHeaderMenus` | Open and close the group header's search, More menu, Joined menu, Invite dialog and Share sheet; nothing inside them is picked | `groupId` | gotogroups → clickSearchWithinThisGroup → pressEscape → clickMore → pressEscape → clickJoined → pressEscape → clickInvite → pressEscape → clickShareGroup → pressEscape |
| `flowGroupPostComments`, `flowGroupPostCommentsLive` | `log flow run groupPostComments` | On a group's Open questions tab, open a post's comments, switch the sort to All comments and scroll them; read-only | `groupId` | gotogroupsQuestions → clickLeaveAComment → clickMostRelevant → clickAllCommentsShowAll → scroll |
| `flowGroupPostDialog`, `flowGroupPostDialogLive` | `log flow run groupPostDialog` | On a group's Discussion feed, open a post in its dialog with Leave a comment (the comment box takes focus, nothing is typed) and close it | `groupId` | gotogroups → clickLeaveAComment → clickClose |
| `flowGroupTabs`, `flowGroupTabsLive` | `log flow run groupTabs` | Open each tab of a group the account is in (Featured, Open questions, People, Events, Media, Files, About) and come back to Discussion; read-only | `groupId` | gotogroups → clickFeatured → clickOpenQuestions → clickPeople → clickEvents → clickMedia → clickFiles → clickAbout → clickDiscussion |
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
  c_read["read"]
  cli --> c_read
  mcp --> c_read
  c_read --> live
  c_poll["poll"]
  cli --> c_poll
  mcp --> c_poll
  c_poll --> live
  c_check["check"]
  cli --> c_check
  mcp --> c_check
  c_check --> live
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
  c_messenger["messenger"]
  cli --> c_messenger
  c_messenger -.- terminal
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
  c_runs["runs"]
  cli --> c_runs
  mcp --> c_runs
  c_browsers["browsers"]
  cli --> c_browsers
  mcp --> c_browsers
  c_job["job"]
  cli --> c_job
  mcp --> c_job
  c_mcp["mcp"]
  cli --> c_mcp
  c_mcp -.- terminal
  c_login["login"]
  cli --> c_login
  c_login -.- terminal
  c_logout["logout"]
  cli --> c_logout
  mcp --> c_logout
  c_whoami["whoami"]
  cli --> c_whoami
  mcp --> c_whoami
  f_deletePost["flowDeletePost: flow run deletePost"]
  mcp --> f_deletePost
  f_deletePost --> c_flow
  f_groupHeaderMenus["flowGroupHeaderMenus: flow run groupHeaderMenus"]
  mcp --> f_groupHeaderMenus
  f_groupHeaderMenus --> c_flow
  f_groupPostComments["flowGroupPostComments: flow run groupPostComments"]
  mcp --> f_groupPostComments
  f_groupPostComments --> c_flow
  f_groupPostDialog["flowGroupPostDialog: flow run groupPostDialog"]
  mcp --> f_groupPostDialog
  f_groupPostDialog --> c_flow
  f_groupTabs["flowGroupTabs: flow run groupTabs"]
  mcp --> f_groupTabs
  f_groupTabs --> c_flow
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
| PreToolUse | `Bash\|PowerShell\|Monitor` | [`scripts/hooks/liveLogs.ts`](scripts/hooks/liveLogs.ts) | a log-cli run that would hide its lines (piped through tail or head) is refused before it starts; a long one off a Monitor is told to start one (rule 26) |
| PostToolUse | `Bash\|PowerShell\|Monitor\|mcp__log__.*` | [`scripts/hooks/pageState.ts`](scripts/hooks/pageState.ts) | a browser landed on a known state (checkpoint, captcha, prompt) or a step failed: its resolver, at once |
| Stop | every turn | [`scripts/hooks/pageState.ts`](scripts/hooks/pageState.ts) | the turn does not end while a browser sits on a state log-cli can resolve (rule 54) |

Around every turn, whatever is called: SessionStart, UserPromptSubmit, SessionStart, UserPromptSubmit, Stop.

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
  matt->>Agent: a prompt
  Agent->>Hook: UserPromptSubmit
  Note over Hook: where every open browser is, with each of matt's prompts
  Note over Hook: the same storage check with each of matt's prompts (measured at most every 15 minutes)
  loop each tool call
    Agent->>Hook: PreToolUse
    Note over Hook: a log-cli run that would hide its lines (piped through tail or head) is refused before it starts#59; a long one off a Monitor is told to start one (rule 26)
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
  messengerPinCreate["messengerPinCreate: Messenger's #quot;Create a PIN to access your chats on any device#quot;: the inbox stays behind it (Bethlehem, warm-up 20261022T092119 steps 25-27)"]
  page --> messengerPinCreate
  messengerPinCreate -->|"run the recorded flow with the PIN from Twenty"| nextmessengerPinCreate(["next state"])
  messengerPinEnter["messengerPinEnter: Messenger asks for the account's PIN to open its chats here (a PIN set before, met on another browser or device). Mapped 2026-10-22 before its first recording"]
  page --> messengerPinEnter
  messengerPinEnter -->|"type the PIN from Twenty"| nextmessengerPinEnter(["next state"])
  marketplacePartnerListings["marketplacePartnerListings: Marketplace's #quot;Discover more when you shop#quot; (partner shops, shown where the Marketplace location is in Europe#59; Bethlehem was sent to Granada by a bare zip, 20261022T110738 step 2)"]
  page --> marketplacePartnerListings
  marketplacePartnerListings -->|"press its Update by ref"| nextmarketplacePartnerListings(["next state"])
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

#### log facebook listings

List the Twenty listings, by status, account or campaign MCP tools: `listings`, one per form, with named fields.

```text
log facebook listings [--status <STATUS>] [--account <accountName>] [--campaign <campaignId>] [--json]
```

#### log facebook listing

Show one Twenty listing, or create one for an account from a JSON file MCP tools: `listing`, `listingCreate`, one per form, with named fields.

```text
log facebook listing <agencyListingId> [--json]
log facebook listing create --account <accountName> --file <listing.json> [--json]
The file: title, description, price, priceCurrency, category, condition (new|usedLikeNew|usedGood|usedFair), photos (paths or URLs), locationQuery, locationCity, locationCountry, locationPostalCode (the zip: Facebook finds a US city by it).
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
log facebook account status <accountName> <ACTIVE|WARMING|LIMITED|PAUSED|NEEDS_LOGIN|CHECKPOINT|RESTRICTED|BANNED|DEAD> [--reason <code>] [--detail <text>]
```

#### log adsPower

AdsPower: Local API status, its profiles, and one profile per Twenty account (sync) MCP tool: `adsPower` (`args` takes the same arguments).

```text
log adsPower status
log adsPower profiles [--json]
log adsPower sync [--apply] [--account <accountName>] [--json]   (dry run unless --apply)
```

#### log facebook lifecycle

Each account's place in its lifecycle (rule 35): status, state, what onboarding has left; `states` prints the machine MCP tool: `lifecycle` (`args` takes the same arguments).

```text
log facebook lifecycle [--account <name>] [--json]
log facebook lifecycle states [--write]   (the machine's state tree; --write regenerates docs/lifecycle.md)
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
log facebook host start --account <accountName> [--live] [--likes] [--bypass] [--gapMinutes <n>] [--watchMinutes <n>]   (--live: profile, name, location; --likes: the warm-up's likes)
log facebook host send --account <accountName> <PERSON_DONE|PAUSE|RESUME|SHUTDOWN|LOST>
log facebook host status [--account <accountName>]
```

#### log inspect

Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29) MCP tools: `inspectStart`, `inspectDo`, `inspectDoLive`, `inspectMap`, `inspectSessions`, one per form, with named fields.

```text
log inspect start --account <accountName> [--url <https://www.facebook.com/...>] [--bypass] [--now] [--noIdleMouse] [--detach]   (one session per account: two accounts can be open at once; --detach runs it as its own process and returns once it is open)
log inspect map [<runDir>] [--all]  (the recorded steps as states and transitions: flow.md, machine.json; default the latest run; --all collates every run)
log inspect do <goto <url>|snapshot|back|wait [s]|click <ref>|type <ref> <text>|press <key>|upload <ref> <file>|highlight <role> <name>|solve|signIn|code|pin|stop> [--live] [--timeout <s>] [--json] [--account <accountName>]   (--account picks the session when more than one is open)
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
log facebook warmup stages run --account <accountName> [--only …] [--likes] [--gapMinutes <n>] [--bypass] [--now]
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

Read a Facebook group's new posts and their comments as one account, in its open browser, by hand; only the group's cursor is saved to Twenty (#27, rule 65) MCP tool: `read, readLive` (`args` takes the same arguments).

```text
log facebook read group --account <accountName> --group <group url or id> [--scrolls <n>] [--commentPosts <n>] [--live] [--bypass] [--json]
log facebook read group --account <accountName> --group <g> --show [--json]
Reads the group's new posts (since its cursor in Twenty) and the comments of the new posts that have some, in the account's open browser. Only the cursor is saved to Twenty (rule 65); --show prints it.
--scrolls: feed scrolls at most (default 6). --commentPosts: posts whose comments are read at most (default 5; 0 reads none).
--worker (OpenMagpie's call) is refused here: it became its own command, log facebook poll (its usage).
--live: each post's comments are switched to Newest first (two clicks, rule 8); without it nothing is clicked and the page's Most relevant comments are read.
Every step in the browser runs inside the account's local hours (rule 18); --bypass skips that for one run, only when matt asked (rule 20).
The account's browser must be open (log inspect start --account <a>, or log facebook host start): a read is a step in it (rule 35).
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

Read a run's raw HAR (any browser driver) and its scripts with offline rea; --docs builds the Facebook client docs. No browser. MCP tool: `capture` (`args` takes the same arguments).

```text
log facebook capture --har <path> [--out <dir>] [--noRea] [--json]
log facebook capture --settle <runCaptureDir>  (what each run starts in the background: rea reads its capture, split per step)
log facebook capture --docs [--noRea]  (every run's requests → docs/platforms/facebook/, one doc per request, rea reading each one's slice)
The HAR is the one Playwright writes from Camoufox. It is copied raw, and rea reads it. No browser opens.
```

#### log runs

The recorded runs on this machine, and pruning the ones rea settled and the request docs hold, keeping each one's findings and domains MCP tools: `runsList`, `runsPrune`, `runsSpace`, one per form, with named fields.

```text
log runs [list] [--json]   (every recorded run: its size, settled by rea, in the request docs, and why it is kept or that it may go)
log runs prune [--before <YYYY-MM-DD>] [--apply]   (deletes each analysed run, started before the day when given, keeping its findings.md, steps.jsonl, settle.json and its requests by domain; a dry run unless --apply)
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

<!-- surface:end -->

## Twenty

- `scripts/twenty/twentySetup.mjs` adds the fields log-cli needs (additive only; prints
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
bun bin/log.ts adsPower sync            # dry run: one profile per Facebook account
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
bun bin/log.ts doctor
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
src/browser/camoufox/           Camoufox's driver and capability row (kept)
src/browser/adsPower/           AdsPower: Local API client (from Listaro), profile sync, its driver and capability row
src/browser/run/                one run's private proxy/cookie files, the launch budget (every browser)
src/browser/proxy/              the proxy check's result types (every browser)
src/browser/inspect/            log inspect: one open browser driven a step at a time (every browser)
src/browser/flow/               recordings → flows, their XState machines, the page states (every browser)
src/camofox/                    what only Camoufox needs: its device per account (rule 15), its worker and sync sessions
src/captcha/router/             CaptchaKraken → 2Captcha → a person
src/errors/catalog/             every error code, once
src/cli/*                       the commands
src/agentHooks/                 the agent hooks (Claude Code, Codex) and what each decides (rule 55)
src/surface/                    the catalog of commands, MCP tools and hooks; the README section and diagrams (rule 56)
python/browser/                 every driver's opener (browserDriver.py), the proxy gate, the HAR recorder, headed launch
python/session/                 the processes TypeScript runs: inspect, connect, publish, profile, the worker
python/human/                   the cursor and the wheel, fitted to matt's hand (rule 32)
```

See `docs/namingConventions.md`. Run `bun run check` for the naming gate, typecheck and tests.

## License

MIT
