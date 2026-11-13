# Reference: every command, MCP tool and hook

Generated from the code by `bun run docs:build`, so it always matches what `log` does. The README covers why and how to start; this is the full list.

<!-- surface:start · written by `bun run docs:build` from the code. Not edited by hand. -->
## Commands, MCP tools and hooks

log-cli is platform-agnostic: 7 platforms so far, Facebook (23 commands of its own), X (18 commands of its own), Reddit (5 commands of its own), Discord (12 commands of its own), LinkedIn (2 commands of its own), Slack (9 commands of its own), Instagram (6 commands of its own), and a new one is made by `log new platform <name>` (rule 83). A command that acts on one platform names it first, `log <platform> <command> …` (`log facebook listings`, `log twitter session`, `log reddit session`, `log discord session`, `log linkedin session`, `log slack session`, `log instagram session`), in every form; one that works on any platform takes none (the Platform column, rule 63).
Each command runs on the platform's direct API first where it has one, and on the account's browser otherwise (the Engine and Browser columns). log-cli is browser-agnostic too: each account's browser is a driver (AdsPower first, Camoufox kept, more browser providers to come), and every driver opens through the same gates.
Every command is a CLI command (`log [<platform>] <command>`) and, unless it only works in a terminal, an MCP tool on the `log` server (Facebook's take the command's name, every other platform's start with the platform: `twitterReply`, `redditSessionCheck`).
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
  p_facebook -->|"browser: facebook doctor, facebook connect, facebook profile, facebook host, facebook join, facebook read, facebook poll, facebook check, facebook scan, facebook status, facebook watch, facebook publish, facebook campaign"| b_facebook["Facebook's browser path: its proxy in the account's home country (rule 12)"]
  b_facebook --> drivers
  p_twitter["X (TWITTER): 18 commands of its own"]
  twenty --> p_twitter
  p_twitter -->|"direct API: twitter session, twitter follows, twitter dms, twitter chat, twitter cookies, twitter followers, twitter notifications, twitter reply, twitter quote, twitter post, twitter like, twitter list, twitter repost, twitter follow, twitter dm, twitter react, twitter queue, twitter voice"| e_twikit["twikit (vendor/twikit): the saved session, a governor per account"]
  e_twikit --> api
  p_twitter -.->|"no browser path (rule 80)"| nob_twitter["X runs on its direct API only"]
  p_reddit["Reddit (REDDIT): 5 commands of its own"]
  twenty --> p_reddit
  p_reddit -->|"direct API: reddit session, reddit read, reddit post, reddit reply, reddit vote"| e_reverseChud["reverseChud (vendor/reverseChud): the saved session, a governor per account"]
  e_reverseChud --> api
  p_reddit -->|"browser: the any-platform commands"| b_reddit["Reddit's browser path: no proxy: this machine's own exit, the profile's timezone follows it (rule 84)"]
  b_reddit --> drivers
  p_discord["Discord (DISCORD): 12 commands of its own"]
  twenty --> p_discord
  p_discord -->|"direct API: discord session, discord chats, discord servers, discord channels, discord posts, discord search, discord read, discord watch, discord send, discord delete, discord react, discord voice"| e_endcord["endcord (vendor/endcord): the saved session, a governor per account"]
  e_endcord --> api
  p_discord -->|"browser: the any-platform commands"| b_discord["Discord's browser path: no proxy: this machine's own exit, the profile's timezone follows it (rule 84)"]
  b_discord --> drivers
  p_linkedin["LinkedIn (LINKEDIN): 2 commands of its own"]
  twenty --> p_linkedin
  p_linkedin -->|"direct API: linkedin session, linkedin cookies"| e_openLinkedinApi["openLinkedinApi (vendor/openLinkedinApi): the saved session, a governor per account"]
  e_openLinkedinApi --> api
  p_linkedin -->|"browser: the any-platform commands"| b_linkedin["LinkedIn's browser path: no proxy: this machine's own exit, the profile's timezone follows it (rule 84)"]
  b_linkedin --> drivers
  p_slack["Slack (SLACK): 9 commands of its own"]
  twenty --> p_slack
  p_slack -->|"direct API: slack session, slack workspaces, slack chats, slack read, slack watch, slack send, slack cookies, slack react, slack voice"| e_gabrielSlack["gabrielSlack (vendor/gabrielSlack): the saved session, a governor per account"]
  e_gabrielSlack --> api
  p_slack -->|"browser: the any-platform commands"| b_slack["Slack's browser path: no proxy: this machine's own exit, the profile's timezone follows it (rule 84)"]
  b_slack --> drivers
  p_instagram["Instagram (INSTAGRAM): 6 commands of its own"]
  twenty --> p_instagram
  p_instagram -->|"direct API: instagram session, instagram dms, instagram send, instagram watch, instagram react, instagram voice"| e_instagrapi["instagrapi (vendor/instagrapi): the saved session, a governor per account"]
  e_instagrapi --> api
  p_instagram -->|"browser: the any-platform commands"| b_instagram["Instagram's browser path: no proxy: this machine's own exit, the profile's timezone follows it (rule 84)"]
  b_instagram --> drivers
  anyB["Any platform with a browser path: inspect, flow, #lt;platform#gt; warmup"]
  anyB --> b_facebook
  anyB --> b_reddit
  anyB --> b_discord
  anyB --> b_linkedin
  anyB --> b_slack
  anyB --> b_instagram
  anyN["Any platform, no browser: launch, console, adsPower, localAccount, proxy, errors, graph, runs, storage, timing, inbox, media, browsers, browser, report, job, mcp, login, logout, whoami, voice, search, kb, runtime, memelord, treg, balance, governor, sessions, chats, messages, clone, transcribe, new"]
  anyN -.-> twenty
  newP["log new platform name: one more platform, wired whole (rule 83)"] -.-> twenty
  drivers --> api
```

Source: [`docs/diagrams/platforms.mmd`](diagrams/platforms.mmd).

### The browser layer

log-cli is browser-agnostic: each account's browser is a driver picked from Twenty, AdsPower first, and every driver opens through the same gates. Whether the gate needs a proxy is the platform's (`PLATFORM_SITES`). From `BROWSER_DRIVERS` (`src/browser/driver`) and `commandBrowser` (`src/browser/run`).

```mermaid
flowchart LR
  twenty["Twenty socialAccounts: platform, browserDriver, adsPowerProfileId"]
  pick{"driverNameOf"}
  gates["Every driver: the proxy gate (Facebook: a proxy in the home country, rule 12. Reddit, Discord, LinkedIn, Slack, Instagram: no proxy, rule 84), self-check, HAR, human mouse (rules 17, 22, 32)"]
  session["One Playwright context: python/browser/browserDriver.py"]
  twenty --> pick
  pick -->|"browserDriver camoufox, or no profile"| d_camoufox["camoufox"]
  pick -->|"a linked profile, or browserDriver adsPower"| d_adsPower["adsPower"]
  d_camoufox --> gates
  d_adsPower --> gates
  more["Next browser provider: one more driver (src/browser/name), rule 44"] -.-> gates
  gates --> session
  account["On the account's browser: facebook host, inspect, flow, #lt;platform#gt; warmup, facebook join, facebook read, facebook poll, facebook check, reddit read, discord read, slack read"]
  camoufox["Camoufox only, not on the driver yet: facebook doctor, facebook connect, facebook profile, facebook scan, facebook status, facebook watch, facebook publish, facebook campaign, discord watch, slack watch, instagram watch"]
  session --> account
  camoufox -.->|"launches Camoufox itself"| d_camoufox
  nobrowser["No browser path: X (direct API only, rule 80)"] -.-x pick
```

Source: [`docs/diagrams/browsers.mmd`](diagrams/browsers.mmd).

- **The account's browser, through the driver:** `facebook host`, `inspect`, `flow`, `<platform> warmup`, `facebook join`, `facebook read`, `facebook poll`, `facebook check`, `reddit read`, `discord read`, `slack read`. They run on whichever browser the account uses: AdsPower when it has a linked profile (`socialAccounts.adsPowerProfileId`), Camoufox otherwise, or what `socialAccounts.browserDriver` says.
- **Camoufox only, not on the driver yet:** `facebook doctor`, `facebook connect`, `facebook profile`, `facebook scan`, `facebook status`, `facebook watch`, `facebook publish`, `facebook campaign`, `discord watch`, `slack watch`, `instagram watch`. They launch Camoufox themselves (facebook-camofox-client's worker, or the publish, connect and profile sessions), so on an AdsPower account they don't open its AdsPower profile. Moving one onto the driver is moving it into `OPENER_ACTIONS` (`src/browser/run`).
- **No browser:** `launch`, `console`, `facebook listings`, `facebook listing`, `facebook accounts`, `facebook account`, `adsPower`, `localAccount`, `facebook lifecycle`, `facebook preflight`, `proxy`, `facebook conversations`, `facebook conversation`, `facebook messenger`, `errors`, `graph`, `facebook capture`, `runs`, `storage`, `timing`, `inbox`, `media`, `browsers`, `browser`, `report`, `job`, `mcp`, `login`, `logout`, `whoami`, `twitter session`, `twitter follows`, `twitter dms`, `twitter chat`, `twitter cookies`, `voice`, `search`, `kb`, `runtime`, `memelord`, `treg`, `balance`, `governor`, `sessions`, `chats`, `messages`, `clone`, `transcribe`, `twitter followers`, `twitter notifications`, `twitter reply`, `twitter quote`, `twitter post`, `twitter like`, `twitter list`, `twitter repost`, `twitter follow`, `twitter dm`, `twitter react`, `twitter queue`, `new`, `reddit session`, `reddit post`, `reddit reply`, `reddit vote`, `discord session`, `discord chats`, `discord servers`, `discord channels`, `discord posts`, `discord search`, `discord send`, `discord delete`, `discord react`, `discord voice`, `linkedin session`, `linkedin cookies`, `slack session`, `slack workspaces`, `slack chats`, `slack send`, `slack cookies`, `slack react`, `slack voice`, `instagram session`, `instagram dms`, `instagram send`, `instagram react`, `instagram voice`, `twitter voice`.
- **No browser path at all:** X. Its accounts run on the direct API only (rule 80).

Each browser's capabilities, built or not: [`docs/browsers.md`](browsers.md) (generated, `bun run check:browsers`). AdsPower's setup: [`docs/adsPower.md`](adsPower.md).

### Engines: the direct API first, the browser behind it

A command on the direct-API engine calls the platform's internal API with the account's saved session, paced by its own governor, and opens no browser. Each platform has its own vendored client: Facebook through fbk (`vendor/fbk`), X through twikit (`vendor/twikit`), Reddit through reverseChud (`vendor/reverseChud`), Discord through endcord (`vendor/endcord`), LinkedIn through openLinkedinApi (`vendor/openLinkedinApi`), Slack through gabrielSlack (`vendor/gabrielSlack`), Instagram through instagrapi (`vendor/instagrapi`). Every one reaches the network through one pinned browser-impersonating session: curl_cffi for the Python clients (`check:twikitTransport`), wreq-js for reverseChud (`check:reverseChudTransport`). Which engine runs each command is code (`DIRECT_ROUTES` and `commandEngine` in `src/directApi/engine`), and this section, the Engine column and every MCP tool's description are generated from it (7 clients, 53 commands).

**Facebook.** Facebook's own page decides, not accountStatus: loggedIn reads; checkpoint stops and deactivates the account; loggedOut or accountWarning hands over to the browser path. Each account has its own governor (gaps of 4 s or more, 120 an hour, 500 a day, 40 writes a day, a 15-minute pause on a soft block, 6 hours on a checkpoint) and its result is written to socialAccounts.sessionState.

- `log facebook read`: the direct-API engine first (fbk groups.feed_read, no browser) for read group without --live on a numeric group id, when the account has a saved c_user + xs session, a proxy in its home country and is inside its hours (--bypass skips the hours).

**X.** X's own answer decides: the session check's HTTP status first (401 or 403 is loggedOut, 200 or 404 loggedIn), then the call's own answer, read into one event (sent, dropped, throttled, dailyLimit, gone, automated, duplicate, sessionDead, restricted). Each account has its own governor under ~/.logCli/twitter/<account> (sends count as writes, 240 a day), refreshed cookies are merged back into its Twenty row, and the session state is written to socialAccounts.sessionState.

- `log twitter session`: the direct-API engine only (twikit, vendored in vendor/twikit, account.ping for the session check; no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter follows`: the direct-API engine only (twikit, vendored in vendor/twikit, friendships.show for the follows read; no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter dms`: the direct-API engine only (twikit, vendored in vendor/twikit, messages.inbox for the dms read (the inbox, or one conversation); no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter chat`: the direct-API engine only (twikit, vendored in vendor/twikit, xchat.unlock_xchat for the chat pin (the PIN is checked against Juicebox before it is saved), chat watch (X pushes each message over wss://chat-ws.x.com, nothing polled); no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter cookies`: the direct-API engine only (twikit, vendored in vendor/twikit, account.ping for the cookies save (the cookies are checked with X before they are saved); no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter followers`: the direct-API engine only (twikit, vendored in vendor/twikit, friendships.followers for the followers read; no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter notifications`: the direct-API engine only (twikit, vendored in vendor/twikit, notifications.get_notifications_page for the notifications read (new, or back through the history with --full); no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter reply`: the direct-API engine only (twikit, vendored in vendor/twikit, tweets.create_tweet for the reply; no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter quote`: the direct-API engine only (twikit, vendored in vendor/twikit, tweets.create_tweet for the quote; no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter post`: the direct-API engine only (twikit, vendored in vendor/twikit, tweets.create_tweet for the post (media uploaded first with upload_media); no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter like`: the direct-API engine only (twikit, vendored in vendor/twikit, tweets.favorite_tweet for the like; no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter list`: the direct-API engine only (twikit, vendored in vendor/twikit, lists.get_lists, create_list, add_list_member for the list show, list create --live, list add --live; no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter repost`: the direct-API engine only (twikit, vendored in vendor/twikit, tweets.retweet for the repost; no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter follow`: the direct-API engine only (twikit, vendored in vendor/twikit, users.follow_user for the follow; no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter dm`: the direct-API engine only (twikit, vendored in vendor/twikit, messages.send_dm for the dm; no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter react`: the direct-API engine only (twikit, vendored in vendor/twikit, messages.add_reaction_to_message for the react --live (--remove takes it off); no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter queue`: the direct-API engine only (twikit, vendored in vendor/twikit, tweets.create_tweet for the queue run --live (each like and reply); no browser and no proxy: X accounts call X directly, rule 80).
- `log twitter voice`: the direct-API engine only (twikit, vendored in vendor/twikit, messages.SendMessageCreateMutation for the voice --live (a voice note in the voice cloned from matt, encrypted with chat-xdk and sent as an X Chat AUDIO attachment); no browser and no proxy: X accounts call X directly, rule 80).

**Reddit.** Reddit's own answer decides. Each account has its own governor under ~/.logCli/reddit/<account>, refreshed cookies are merged back into its Twenty row, and the session state is written to socialAccounts.sessionState.

- `log reddit session`: the direct-API engine only (reverseChud, vendored in vendor/reverseChud, account.ping for the session check; no browser).
- `log reddit read`: the direct-API engine only (reverseChud, vendored in vendor/reverseChud, account.posts for the subreddits, posts, the home feed and one post; no browser).
- `log reddit post`: the direct-API engine only (reverseChud, vendored in vendor/reverseChud, posts.create for the a text post; no browser).
- `log reddit reply`: the direct-API engine only (reverseChud, vendored in vendor/reverseChud, posts.reply for the a comment or reply; no browser).
- `log reddit vote`: the direct-API engine only (reverseChud, vendored in vendor/reverseChud, posts.vote for the a vote; no browser).

**Discord.** Discord's own answer decides. Each account has its own governor under ~/.logCli/discord/<account>, refreshed cookies are merged back into its Twenty row, and the session state is written to socialAccounts.sessionState.

- `log discord session`: the direct-API engine only (endcord, vendored in vendor/endcord, account.ping for the session check; no browser).
- `log discord chats`: the direct-API engine only (endcord, vendored in vendor/endcord, messages.get_dms for the chats (the DMs and group DMs); no browser).
- `log discord servers`: the direct-API engine only (endcord, vendored in vendor/endcord, account.get_guilds for the servers (the servers the account is in); no browser).
- `log discord channels`: the direct-API engine only (endcord, vendored in vendor/endcord, messages.get_channels for the channels (one server, by category and kind); no browser).
- `log discord posts`: the direct-API engine only (endcord, vendored in vendor/endcord, messages.get_threads for the posts (a forum or media channel, threads/search); no browser).
- `log discord search`: the direct-API engine only (endcord, vendored in vendor/endcord, messages.search for the search (a whole server, messages/search); no browser).
- `log discord read`: the direct-API engine only (endcord, vendored in vendor/endcord, messages.get_messages for the read (a chat or channel, paged with before); no browser).
- `log discord watch`: the direct-API engine only (endcord, vendored in vendor/endcord, gateway.Gateway for the watch (Discord pushes each message over wss://gateway.discord.gg, nothing polled); no browser).
- `log discord send`: the direct-API engine only (endcord, vendored in vendor/endcord, messages.send_message for the send --live; no browser).
- `log discord delete`: the direct-API engine only (endcord, vendored in vendor/endcord, messages.delete_message for the delete --live (only the account own messages, each read first); no browser).
- `log discord react`: the direct-API engine only (endcord, vendored in vendor/endcord, messages.send_reaction for the react --live (--remove takes it off); no browser).
- `log discord voice`: the direct-API engine only (endcord, vendored in vendor/endcord, messages.send_voice_message for the voice --live (a voice note in the voice cloned from matt, flags 8192); no browser).

**LinkedIn.** LinkedIn's own answer decides. Each account has its own governor under ~/.logCli/linkedin/<account>, refreshed cookies are merged back into its Twenty row, and the session state is written to socialAccounts.sessionState.

- `log linkedin session`: the direct-API engine only (openLinkedinApi, vendored in vendor/openLinkedinApi, account.ping for the session check; no browser).
- `log linkedin cookies`: the direct-API engine only (openLinkedinApi, vendored in vendor/openLinkedinApi, account.ping for the cookies save (the cookies are checked with LinkedIn before they are saved); no browser).

**Slack.** Slack's own answer decides. Each account has its own governor under ~/.logCli/slack/<account>, refreshed cookies are merged back into its Twenty row, and the session state is written to socialAccounts.sessionState.

- `log slack session`: the direct-API engine only (gabrielSlack, vendored in vendor/gabrielSlack, account.exchange_cookie for the session check (and auth.test with --workspace); no browser).
- `log slack workspaces`: the direct-API engine only (gabrielSlack, vendored in vendor/gabrielSlack, account.exchange_cookie for the workspaces (the ones the d cookie is signed in to); no browser).
- `log slack chats`: the direct-API engine only (gabrielSlack, vendored in vendor/gabrielSlack, messages.conversations.list for the chats (the DMs and group DMs); no browser).
- `log slack read`: the direct-API engine only (gabrielSlack, vendored in vendor/gabrielSlack, messages.conversations.history for the read (a chat, paged by cursor); no browser).
- `log slack watch`: the direct-API engine only (gabrielSlack, vendored in vendor/gabrielSlack, websocket.connect for the watch (Slack pushes each event over wss-primary.slack.com, nothing polled); no browser).
- `log slack send`: the direct-API engine only (gabrielSlack, vendored in vendor/gabrielSlack, messages.chat.postMessage for the send --live; no browser).
- `log slack cookies`: the direct-API engine only (gabrielSlack, vendored in vendor/gabrielSlack, account.exchange_cookie for the cookies save (the d cookie is checked with Slack before it is saved); no browser).
- `log slack react`: the direct-API engine only (gabrielSlack, vendored in vendor/gabrielSlack, messages.reactions.add for the react --live (--remove takes it off); no browser).
- `log slack voice`: the direct-API engine only (gabrielSlack, vendored in vendor/gabrielSlack, messages.files.completeUploadExternal for the voice --live (a voice note in the voice cloned from matt, uploaded then shared); no browser).

**Instagram.** Instagram's own answer decides. Each account has its own governor under ~/.logCli/instagram/<account>, refreshed cookies are merged back into its Twenty row, and the session state is written to socialAccounts.sessionState.

- `log instagram session`: the direct-API engine only (instagrapi, vendored in vendor/instagrapi, account.ping for the session check; no browser).
- `log instagram dms`: the direct-API engine only (instagrapi, vendored in vendor/instagrapi, messages.direct_threads for the dms (the inbox, or one thread with --with); no browser).
- `log instagram send`: the direct-API engine only (instagrapi, vendored in vendor/instagrapi, messages.direct_send for the send --live (text one message per line, and --photo through direct_send_photo); no browser).
- `log instagram watch`: the direct-API engine only (instagrapi, vendored in vendor/instagrapi, websocket.realtime_connect for the watch (Instagram pushes each DM over its realtime MQTT, edge-mqtt.facebook.com, nothing polled); no browser).
- `log instagram react`: the direct-API engine only (instagrapi, vendored in vendor/instagrapi, messages.direct_send_reaction for the react --live (--remove takes it off); no browser).
- `log instagram voice`: the direct-API engine only (instagrapi, vendored in vendor/instagrapi, messages.direct_send_voice for the voice --live (a voice note in the voice cloned from matt, its upload on curl_cffi); no browser).

### How a call reaches log-cli

From a shell or over MCP, both run the same commands through `runCli`, write the same live log, and pass through the same hooks. `commandEngine` sends each command to the platform's direct API or to the account's browser.

```mermaid
flowchart LR
  agent["Agent (Claude Code, Codex)"]
  matt["matt, in a terminal"]
  shell["Bash / PowerShell / Monitor"]
  mcp["MCP server log: 209 command tools + saved flows"]
  bin["bin/log.ts"]
  runCli["runCli: 112 commands (COMMANDS)"]
  live[("~/.logCli/mcp/day.log: the live log")]
  engine{"commandEngine: DIRECT_ROUTES"}
  direct["Direct-API engine: fbk, twikit, reverseChud, endcord, openLinkedinApi, gabrielSlack, instagrapi (vendor/), the account's saved session, a governor per account"]
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
  pre0{{"PreToolUse: chatNames.ts"}} -.->|before| shell
  pre1{{"PreToolUse: liveLogs.ts"}} -.->|before| shell
  post0{{"PostToolUse: inbox.ts"}} -.->|after| agent
  post1{{"PostToolUse: queue.ts"}} -.->|after| agent
  post2{{"PostToolUse: xLive.ts"}} -.->|after| agent
  post3{{"PostToolUse: pageState.ts"}} -.->|after| agent
  turn0{{"SessionStart: pageState.ts"}} -.-> agent
  turn1{{"UserPromptSubmit: pageState.ts"}} -.-> agent
  turn2{{"SessionStart: storage.ts"}} -.-> agent
  turn3{{"UserPromptSubmit: storage.ts"}} -.-> agent
  turn4{{"SessionStart: engines.ts"}} -.-> agent
  turn5{{"UserPromptSubmit: engines.ts"}} -.-> agent
  turn6{{"SessionStart: knowledge.ts"}} -.-> agent
  turn7{{"SessionStart: inbox.ts"}} -.-> agent
  turn8{{"UserPromptSubmit: inbox.ts"}} -.-> agent
  turn9{{"SessionStart: queue.ts"}} -.-> agent
  turn10{{"SessionStart: useCases.ts"}} -.-> agent
  turn11{{"UserPromptSubmit: useCases.ts"}} -.-> agent
  turn12{{"UserPromptSubmit: queue.ts"}} -.-> agent
  turn13{{"SessionStart: xLive.ts"}} -.-> agent
  turn14{{"UserPromptSubmit: xLive.ts"}} -.-> agent
  turn15{{"Stop: pageState.ts"}} -.-> agent
  browser -.->|each step's snapshot| post0
```

Source: [`docs/diagrams/surface.mmd`](diagrams/surface.mmd).

### Every command

Every command also takes `--proxyMs <ms>` (this run's proxy speed limit, rule 33). `--live` acts on the platform and over MCP needs `confirmLive: true`; `--bypass` needs `confirmBypass: true` (rules 8, 10, 20).

| Command | What it does | Platform | Flags | Engine | Browser | MCP tool | Hooks: shell · MCP | Live log | Rules |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [`log launch`](#log-launch) | Start here: a guided menu to set log up (platforms, sign-ins, the account's browser and extensions), add an account, sign it in, check it and connect your agent (and the listing tools when Twenty is set up) | any (none) | `--setup` `--json` | none | none | terminal only: prompts in a terminal (Clack). Call the commands it wraps directly. | PreToolUse, PostToolUse · n/a | no | 30, 38, 39, 40, 41 |
| [`log console`](#log-console) | The local console: this machine's status, accounts, usage, events, AI client config and settings, as an interactive terminal console, as JSON per screen, or as the web console served on loopback (--web) | any (none) | `--web` `--port <n>` `--noOpen` `--json` `--platform <p>` `--days <1|7|30>` `--kind <kind>` `--status <recorded|succeeded|failed|unknown>` `--page <n>` `--pageSize <n>` `--client <claudeCode|codex|opencode>` | none | none | `consoleStart`, `consoleConnections`, `consoleUsage`, `consoleEvents`, `consoleAiClients`, `consoleSettings` | PreToolUse, PostToolUse · PostToolUse | no | 47, 134, 163, 168, 172, 30, 38, 39, 40, 41 |
| [`log facebook listings`](#log-facebook-listings) | List the Twenty listings, by status, account or campaign | `facebook` first | `--status <STATUS>` `--account <accountName>` `--campaign <campaignId>` `--json` | none | none | `facebookListings` | PreToolUse, PostToolUse · PostToolUse | no | 30, 38, 39, 40, 41 |
| [`log facebook listing`](#log-facebook-listing) | Show one Twenty listing, or create one for an account from a JSON file | `facebook` first | `--json` `--account <accountName>` `--file <listing.json>` `--apply` `--live` `--bypass` `--now` | none | none | `facebookListing`, `facebookListingCreate`, `facebookListingRemove`, `facebookListingRemoveLive`, `facebookListingSweep`, `facebookListingLint` | PreToolUse, PostToolUse · PostToolUse | no | 35, 30, 38, 39, 40, 41 |
| [`log facebook accounts`](#log-facebook-accounts) | List the FACEBOOK accounts in Twenty: status, home, proxy, and whether each may run | `facebook` first | `--json` | none | none | `facebookAccounts` | PreToolUse, PostToolUse · PostToolUse | no | 30, 38, 39, 40, 41 |
| [`log facebook account`](#log-facebook-account) | Show one account, or set its status (banned/dead/restricted replace its campaign listings) | `facebook` first | `--json` `--from <folder>` `--reason <text>` `--detail <text>` | none | none | `facebookAccountShow`, `facebookAccountResave`, `facebookAccountResetOpens`, `facebookAccountStatus` | PreToolUse, PostToolUse · PostToolUse | no | 35, 30, 38, 39, 40, 41 |
| [`log adsPower`](#log-adspower) | AdsPower: Local API status, its profiles, and one profile per Twenty account (sync) | any (none) | `--json` `--apply` `--account <accountName>` `--homes <US,IE>` | none | none | `adsPower` | PreToolUse, PostToolUse · PostToolUse | no | 35, 44, 30, 38, 39, 40, 41 |
| [`log localAccount`](#log-localaccount) | Accounts kept in a local file instead of Twenty: add one, with the account's browser profile, pull every Twenty account in, or list them | any (none) | `--platform <facebook|twitter|reddit|discord|linkedin|slack>` `--account <accountName>` `--adsPower <profileId>` `--proxy <scheme://user:pass@host:port>` `--home <CC>` `--city <city>` `--json` `--refresh` | none | none | `localAccount` | PreToolUse, PostToolUse · PostToolUse | no | 35, 44, 30, 38, 39, 40, 41 |
| [`log facebook lifecycle`](#log-facebook-lifecycle) | Each account's place in its lifecycle (rule 35): status, state, what onboarding has left; `states` prints the machine | `facebook` first | `--account <name>` `--json` `--write` | none | none | `facebookLifecycle` | PreToolUse, PostToolUse · PostToolUse | no | 35, 30, 38, 39, 40, 41 |
| [`log facebook preflight`](#log-facebook-preflight) | Before any browser opens, check each account will get through: home timezone, hours, proxy speed and country, the account's browser and its kernel, launches and host opens left, no session left open, its picture on disk | `facebook` first | `--account <accountName>` `--homes <US,CA>` `--noProxy` `--apply` `--json` | none | none | `facebookPreflight` | PreToolUse, PostToolUse · PostToolUse | no | 35, 79, 30, 38, 39, 40, 41 |
| [`log facebook doctor`](#log-facebook-doctor) | Check python, facebook-camofox-client, Camoufox, Twenty, and which accounts may run | `facebook` first | `--json` | browser | Camoufox only | `facebookDoctor` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 35, 30, 38, 39, 40, 41 |
| [`log facebook connect`](#log-facebook-connect) | Sign a Facebook account in through its proxy (the connect machine), save its cookies to Twenty | `facebook` first | `--account <accountName>` `--noPrompt` `--wait <seconds>` `--bypass` `--now` | browser | Camoufox only | `facebookConnect` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 35, 73, 30, 38, 39, 40, 41 |
| [`log facebook profile`](#log-facebook-profile) | Set an account's profile picture and cover photo from its account record (dry run unless --live, rule 35) | `facebook` first | `--account <accountName>` `--live` `--bypass` `--json` | browser | Camoufox only | `facebookProfile`, `facebookProfileLive` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 35, 73, 30, 38, 39, 40, 41 |
| [`log facebook host`](#log-facebook-host) | Run an account's lifecycle in ONE browser kept open for its day, resuming where it left (rule 35); send it events; read its progress | `facebook` first | `--account <accountName>` `--live` `--likes` `--bypass` `--now` `--gapSeconds <n>` `--watchMinutes <n>` | browser | the account's | `facebookHostStart`, `facebookHostStartLive`, `facebookHostSend`, `facebookHostStatus` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 35, 73, 79, 30, 38, 39, 40, 41 |
| [`log inspect`](#log-inspect) | Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29) | any (none) | `--account <accountName>` `--goal <text>` `--url <the platform's own page>` `--bypass` `--now` `--noIdleMouse` `--detach` `--all` `--live` `--timeout <s>` `--json` `--set <text>` `--step <step>` `--point <text>` `--explain <text>` `--evidence <text>` `--fixes <n>` `--fix <text>` | browser | the account's | `inspectStart`, `inspectDo`, `inspectDoLive`, `inspectRead`, `inspectMap`, `inspectGoal`, `inspectFinding`, `inspectSessions` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 35, 19, 26, 29, 30, 73, 30, 38, 39, 40, 41 |
| [`log flow`](#log-flow) | Recorded inspect runs as flows: docs, an XState machine per flow, run on any account (rule 31) | any (none) | `--name <name>` `--summary <text>` `--rename` `--account <accountName>` `--set <param>` `--live` `--bypass` `--now` `--json` | browser | the account's | `flow`, `flowLive` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 29, 31, 35, 73, 79, 30, 38, 39, 40, 41 |
| [`log <platform> warmup`](#log-platform-warmup) | The warm-up, by platform and activity: `log <platform> warmup reel\|feed\|stages` (the account's browser primed with the activity, each step checked, the outline written) | `<platform>` first | `--account <a>` `--live` `--likes` `--bypass` `--now` `--json` `--newPersona` `--seed <n>` `--reels` `--watch` `--skip` `--comments` `--profile` `--persona` `--trafficMb` `--posts` `--only` `--gapSeconds <n>` `--lines <n>` `--follow` `--seconds <n>` | browser | the account's | `warmup`, `warmupLive` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 35, 25, 26, 29, 31, 73, 30, 38, 39, 40, 41 |
| [`log facebook join`](#log-facebook-join) | Join a Facebook group as one account, in its open browser: read the gate, --live presses Join; every step patches agencyGroups.joinSubmission | `facebook` first | `--account <accountName>` `--group <group url, id or name>` `--live` `--json` `--show` `--answer` `--set <n>` `--agree` `--fill` `--submit` `--bypass` | browser | the account's | `facebookJoin`, `facebookJoinLive` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 35, 25, 26, 29, 73, 30, 38, 39, 40, 41 |
| [`log facebook read`](#log-facebook-read) | Read a Facebook group's new posts and their comments, or its newest members, as one account, by hand: posts on the direct-API engine first, else in its open browser; only the group's cursor is saved to Twenty, the members to a file | `facebook` first | `--account <accountName>` `--group <group url or id>` `--scrolls <n>` `--commentPosts <n>` `--live` `--bypass` `--json` `--show` `--worker` `--count <n>` `--secondsPerScroll <s>` `--maxScrolls <n>` `--owners` | direct API first | the account's | `facebookReadGroup`, `facebookReadGroupLive`, `facebookReadMembers` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 35, 19, 25, 26, 29, 73, 30, 38, 39, 40, 41 |
| [`log facebook poll`](#log-facebook-poll) | Poll a Facebook group from one account, in its open browser, for a time or once: each poll's posts as one JSON line, OpenMagpie's records; --request answers OpenMagpie's facebook_group worker (#27, rule 63) | `facebook` first | `--bypass` `--request <request json>` | browser | the account's | `facebookPoll` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 35, 19, 26, 73, 30, 38, 39, 40, 41 |
| [`log facebook check`](#log-facebook-check) | Check one account in its open browser: may it still sell, each listing's state on Selling (into Twenty), and its seller inbox's chats | `facebook` first | `--account <accountName>` `--bypass` `--json` | browser | the account's | `facebookCheck` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 35, 19, 29, 73, 30, 38, 39, 40, 41 |
| [`log facebook scan`](#log-facebook-scan) | Read Marketplace > Selling live for one account and update its listings in Twenty | `facebook` first | `--account <accountName>` `--json` `--bypass` | browser | Camoufox only | `facebookScan` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 35, 19, 73, 30, 38, 39, 40, 41 |
| [`log facebook status`](#log-facebook-status) | Open one Marketplace item page live and classify its status | `facebook` first | `--account <accountName>` `--json` `--bypass` | browser | Camoufox only | `facebookStatus` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 35, 19, 73, 30, 38, 39, 40, 41 |
| [`log facebook watch`](#log-facebook-watch) | Run the listing monitor (XState) for one account and print every step | `facebook` first | `--account <accountName>` `--checks <n>` `--interval <minutes>` `--json` `--bypass` | browser | Camoufox only | `facebookWatch` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 35, 73, 30, 38, 39, 40, 41 |
| [`log proxy`](#log-proxy) | Check an account's proxy, give it one from a provider (2Captcha, Byteful) in its home city, or see providers' traffic | any (none) | `--account <accountName>` `--json` `--missing` `--vendor` `--city <city>` `--region <state>` `--anyCity` `--minutes <1-120>` `--socks5` | none | none | `proxy` | PreToolUse, PostToolUse · PostToolUse | no | 35, 41, 30, 38, 39, 40, 41 |
| [`log facebook publish`](#log-facebook-publish) | Post one Twenty listing (dry run unless --live), printing every machine step | `facebook` first | `--listing <agencyListingId>` `--live` `--json` `--formUrl <url>` `--bypass` `--now` | browser | Camoufox only | `facebookPublish`, `facebookPublishLive` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 35, 19, 73, 30, 38, 39, 40, 41 |
| [`log facebook campaign`](#log-facebook-campaign) | Put one ad on N accounts in one place, replace lost accounts, publish the campaign | `facebook` first | `--campaign <agencyCampaignId>` `--from <agencyListingId>` `--accounts <n>` `--live` `--bypass` `--json` | browser | Camoufox only | `facebookCampaign`, `facebookCampaignLive` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 35, 30, 38, 39, 40, 41 |
| [`log facebook conversations`](#log-facebook-conversations) | List buyers' Marketplace conversations in Twenty, newest first, by account or listing | `facebook` first | `--account <name>` `--listing <agencyListingId>` `--json` | none | none | `facebookConversations` | PreToolUse, PostToolUse · PostToolUse | no | 30, 38, 39, 40, 41 |
| [`log facebook conversation`](#log-facebook-conversation) | One conversation: show its messages, mark read, set its lead status, link its listing, or store a scanned thread | `facebook` first | `--json` `--listing <agencyListingId>` `--account <name>` `--file <threads.json>` | none | none | `facebookConversationShow`, `facebookConversationRead`, `facebookConversationLead`, `facebookConversationLink`, `facebookConversationRecord` | PreToolUse, PostToolUse · PostToolUse | no | 30, 38, 39, 40, 41 |
| [`log facebook messenger`](#log-facebook-messenger) | Messenger's PIN for the account's encrypted chats: asked in a Clack prompt, kept in Twenty, never printed | `facebook` first | `--account <accountName>` `--show` | none | none | terminal only: asks matt for the Messenger PIN in a Clack prompt (masked). He runs `log facebook messenger pin --account <a>` in a terminal. | PreToolUse, PostToolUse · n/a | no | 8, 35, 29, 30, 38, 39, 40, 41 |
| [`log errors`](#log-errors) | List every error code: meaning, retryable, where each machine ends up | any (none) | `--layer <account|listing|photo|form|captcha|runtime|twenty|proxyVendor|auth|profile>` `--code <code>` `--json` `--markdown` | none | none | `errors` | PreToolUse, PostToolUse · PostToolUse | no | 25, 30, 38, 39, 40, 41 |
| [`log graph`](#log-graph) | Print a machine's states and transitions as a Mermaid diagram | any (none) | none | none | none | `graph` | PreToolUse, PostToolUse · PostToolUse | no | 25, 30, 38, 39, 40, 41 |
| [`log facebook capture`](#log-facebook-capture) | Read a run's raw HAR (any browser driver) and its scripts with offline rea; --docs builds every platform's client docs, rea reading each request's code. No browser. | `facebook` first | `--har <path>` `--out <dir>` `--noRea` `--json` `--settle <runCaptureDir>` `--docs` | none | none | `facebookCapture` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 19, 26, 73, 30, 38, 39, 40, 41 |
| [`log runs`](#log-runs) | The recorded runs on this machine, and pruning the ones rea settled and the request docs hold, keeping each one's findings and domains | any (none) | `--json` `--before <YYYY-MM-DD>` `--apply` | none | none | `runsList`, `runsExchanges`, `runsPrune`, `runsSpace` | PreToolUse, PostToolUse · PostToolUse | no | 19, 25, 66, 73, 30, 38, 39, 40, 41 |
| [`log storage`](#log-storage) | Check that log.db's typed tables are exactly what its events derive, and rebuild them from the events | any (none) | `--json` `--apply` | none | none | `storageVerify`, `storageRebuild` | PreToolUse, PostToolUse · PostToolUse | no | 73, 134, 30, 38, 39, 40, 41 |
| [`log timing`](#log-timing) | Where the time goes in every call: p50, p95 and p99 per tool and per stage, from the timings every call stores in log.db, or one call as a waterfall | any (none) | `--tool <name>` `--hours <n>` `--stages <n>` `--json` `--call <callId>` | none | none | `timing` | PreToolUse, PostToolUse · PostToolUse | no | 26, 73, 165, 30, 38, 39, 40, 41 |
| [`log inbox`](#log-inbox) | Claim a chat before acting on it, release it, list the live claims, and read the log of every action taken in a chat | any (none) | `--platform <twitter|discord|slack|instagram>` `--account <a>` `--chat <conversationId|handle>` `--event <eventId>` `--json` `--by <who>` `--limit <n>` `--oldest` | none | none | `inboxClaim`, `inboxRelease`, `inboxResume`, `inboxWaiting`, `inboxClaims`, `inboxActions` | PreToolUse, PostToolUse · PostToolUse | no | 94, 105, 109, 133, 134, 138, 30, 38, 39, 40, 41 |
| [`log media`](#log-media) | Turn every image, meme and video into text any model reads, kept in the .db with a small preview, so replies read what was sent | any (none) | `--json` `--wait <seconds>` | none | none | `mediaDescriber`, `mediaDescribe`, `mediaStatus`, `mediaView` | PreToolUse, PostToolUse · PostToolUse | no | 26, 41, 138, 105, 137, 30, 38, 39, 40, 41 |
| [`log browsers`](#log-browsers) | Where every open browser is: its page, the known page state it sits on, the call that resolves it, and what only the owner can clear (rule 35) | any (none) | `--json` | none | none | `browsers` | PreToolUse, PostToolUse · PostToolUse | no | 29, 35, 30, 38, 39, 40, 41 |
| [`log browser`](#log-browser) | One account's live browser: whether it needs a person to sign in, in the window on this machine or inline from a remote runtime | any (none) | `--account <accountName>` `--json` | none | none | `browserView` | PreToolUse, PostToolUse · PostToolUse | no | 8, 19, 35, 94, 105, 30, 38, 39, 40, 41 |
| [`log report`](#log-report) | The numbers behind a report, read from log.db only (who messaged an account and how often, by source), for the MCP report view | any (none) | `--source` `--account <accountName>` `--since <7d|4w|12h|2026-11-01>` `--limit <n>` `--json` | none | none | `reportData` | PreToolUse, PostToolUse · PostToolUse | no | 134, 154, 160, 30, 38, 39, 40, 41 |
| [`log job`](#log-job) | Follow or stop a long MCP run: each runs as a job when it outlasts its call's wait | any (none) | `--afterLine <n>` `--waitMs <ms>` `--json` | none | none | `jobStatus`, `jobCancel`, `jobList` | PreToolUse, PostToolUse · PostToolUse | no | 8, 26, 35, 30, 38, 39, 40, 41 |
| [`log mcp`](#log-mcp) | This server's MCP sign-ins over OAuth (through Twenty, the owner only): list the clients, revoke them | any (none) | `--json` | none | none | terminal only: manages who may sign in to this server's MCP (OAuth through Twenty). matt runs `log mcp clients` or `mcp revoke <clientId\|all>` in a terminal on the server. | PreToolUse, PostToolUse · n/a | no | 35, 47, 167, 30, 38, 39, 40, 41 |
| [`log login`](#log-login) | Only for a team on Twenty: sign in to its Twenty through its sign-in app (OAuth). Local accounts need no sign-in, and without Twenty set up it says so | any (none) | `--webUrl <url>` `--apiUrl <url>` `--token <accessToken>` `--json` | none | none | terminal only: opens a browser for Twenty OAuth and waits for it. Run `log login` in a terminal. | PreToolUse, PostToolUse · n/a | no | 30, 38, 39, 40, 41 |
| [`log logout`](#log-logout) | Forget the stored Twenty session | any (none) | `--apiUrl <url>` `--json` | none | none | `logout` | PreToolUse, PostToolUse · PostToolUse | no | 30, 38, 39, 40, 41 |
| [`log whoami`](#log-whoami) | Show who is signed in, refreshing the session if it expired | any (none) | `--apiUrl <url>` `--json` | none | none | `whoami` | PreToolUse, PostToolUse · PostToolUse | no | 30, 38, 39, 40, 41 |
| [`log twitter session`](#log-twitter-session) | Check that X still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty | `twitter` first | `--account <accountName>` `--json` | direct API only | none | `twitterSessionCheck`, `twitterSessionWebClient` | PreToolUse, PostToolUse · PostToolUse | no | 35, 26, 73, 105, 94, 30, 38, 39, 40, 41 |
| [`log twitter follows`](#log-twitter-follows) | Read whether handles follow an X account and it follows them, on the direct-API engine, sending nothing | `twitter` first | `--account <accountName>` `--handles <handle,handle…>` `--json` | direct API only | none | `twitterFollows` | PreToolUse, PostToolUse · PostToolUse | no | 53, 73, 105, 30, 38, 39, 40, 41 |
| [`log twitter dms`](#log-twitter-dms) | Read an X account's direct messages and who is waiting on a reply, on the direct-API engine, sending nothing | `twitter` first | `--account <accountName>` `--limit <n>` `--waiting` `--with <handle>` `--conversation <id>` `--full` `--force` `--json` | direct API only | none | `twitterDms` | PreToolUse, PostToolUse · PostToolUse | no | 73, 89, 94, 109, 105, 138, 30, 38, 39, 40, 41 |
| [`log twitter chat`](#log-twitter-chat) | X Chat's PIN for the account's encrypted DMs: asked in a Clack prompt, kept in Twenty, never printed | `twitter` first | `--account <accountName>` `--show` `--seconds <n>` `--inbox` `--json` | direct API only | none | terminal only: asks matt for the X Chat PIN in a Clack prompt (masked). He runs `log twitter chat pin --account <a>` in a terminal. | PreToolUse, PostToolUse · n/a | no | 35, 26, 73, 89, 94, 105, 30, 38, 39, 40, 41 |
| [`log twitter cookies`](#log-twitter-cookies) | Add or refresh an X account in Twenty: its session cookies from a masked prompt, checked against X, and its copy style | `twitter` first | `--account <handle>` `--style <copyStyle>` `--name <label>` | direct API only | none | terminal only: asks for an account's session cookies in a Clack prompt (masked) and checks them with the platform before saving: an X account's auth_token, ct0 and twid, a LinkedIn account's, or a Slack account's d. Run `log twitter cookies save --account <handle>`, `log linkedin cookies save --account <publicId>` or `log slack cookies save --account <name>` in a terminal. | PreToolUse, PostToolUse · n/a | no | 35, 73, 105, 30, 38, 39, 40, 41 |
| [`log voice`](#log-voice) | Gate a draft against the owner's own writing guide with SubQ before anything is sent as the owner, sending nothing | any (none) | `--to <handle>` `--text` `--context` `--with <person or chat>` `--spoken` `--json` | none | none | `voice`, `voiceAiIndex`, `voiceIndex` | PreToolUse, PostToolUse · PostToolUse | no | 30, 39, 41, 109, 137, 142, 30, 38, 39, 40, 41 |
| [`log search`](#log-search) | Hybrid search across every conversation (BM25 keyword + vector meaning, fused with RRF), and building its indexes | any (none) | `--limit <n>` `--platform <p>` `--account <a>` `--with <handle>` `--after <YYYY-MM-DD>` `--json` `--saved` `--rebuild` `--rounds <n>` | none | none | `search`, `searchIndex`, `searchBench` | PreToolUse, PostToolUse · PostToolUse | no | 26, 89, 105, 30, 38, 39, 40, 41 |
| [`log kb`](#log-kb) | The knowledge base: search it, sync every source into Twenty and Redis, remember a note, show an article | any (none) | `--kind <kind>` `--limit <n>` `--json` `--noAccounts` `--title <t>` `--tags <a,b>` | none | none | `kbSearch`, `kbSync`, `kbRemember`, `kbShow` | PreToolUse, PostToolUse · PostToolUse | no | 26, 30, 30, 38, 39, 40, 41 |
| [`log runtime`](#log-runtime) | Pair this workspace with hosted log and keep its outbound bridge open, so the team's console and AI clients run their requests here | any (none) | `--origin <https://app.log.listeningkit.com>` `--json` `--token <pairing token>` | none | none | terminal only: pairs this workspace with hosted log and keeps its outbound bridge open as a long-lived service. Run `log runtime init --origin <url>`, `log runtime pair --token <t>` and `log runtime connect` in the workspace's terminal or its service manager. | PreToolUse, PostToolUse · n/a | no | 26, 73, 171, 172, 30, 38, 39, 40, 41 |
| [`log memelord`](#log-memelord) | The Memelord extension: search memes for a moment, read one template, see what is trending, list the image tools (free tools only) | any (none) | `--type` `--method` `--limit <n>` `--json` `--media` `--category` `--build` `--from <posts.json>` `--noTaste` | none | none | `memelordSearch`, `memelordTemplate`, `memelordTrending`, `memelordTools`, `memelordTaste` | PreToolUse, PostToolUse · PostToolUse | no | 41, 94, 142, 30, 38, 39, 40, 41 |
| [`log treg`](#log-treg) | The treg extension: find an endpoint by the job, read it, and call it with the key injected server-side (free ones run, priced ones only when the owner asked) | any (none) | `--limit <n>` `--json` `--params` `--path <path>` `--method <GET|POST>` `--data` `--await` `--maxItems <n>` `--fields <a,b>` `--where <key=value>` `--raw` `--approvedBy <who>` `--live` | none | none | `tregSearch`, `tregGet`, `tregCall`, `tregCallLive` | PreToolUse, PostToolUse · PostToolUse | no | 41, 53, 163, 142, 164, 30, 38, 39, 40, 41 |
| [`log balance`](#log-balance) | Every paid provider log calls, with what is left and which are out of credit | any (none) | `--provider <name>` `--json` | none | none | `balance` | PreToolUse, PostToolUse · PostToolUse | no | 41, 73, 94, 164, 30, 38, 39, 40, 41 |
| [`log governor`](#log-governor) | Read every platform account's governor count, and put one back to 0 when the owner says so, recorded in log.db | any (none) | `--platform <p>` `--json` `--account <accountName|all>` `--by <who>` `--reason <text>` | none | none | `governorShow`, `governorReset` | PreToolUse, PostToolUse · PostToolUse | no | 73, 86, 94, 105, 163, 168, 30, 38, 39, 40, 41 |
| [`log sessions`](#log-sessions) | Check every account's saved session through its platform's own answer, with the next step to sign each one back in | any (none) | `--platform <p>` `--account <accountName>` `--json` | none | none | `sessionsCheck` | PreToolUse, PostToolUse · PostToolUse | no | 25, 73, 94, 163, 30, 38, 39, 40, 41 |
| [`log chats`](#log-chats) | List an account's chats on its own platform, the platform taken from the account | any (none) | `--account <account>` `--space <space>` `--limit <limit>` `--platform <p>` `--json` | none | none | `chatsList` | PreToolUse, PostToolUse · PostToolUse | no | 89, 154, 160, 163, 30, 38, 39, 40, 41 |
| [`log messages`](#log-messages) | Read one chat's messages on the account's own platform, the platform taken from the account | any (none) | `--account <account>` `--chat <chat>` `--space <space>` `--limit <limit>` `--platform <p>` `--json` | none | none | `messagesRead` | PreToolUse, PostToolUse · PostToolUse | no | 89, 154, 160, 163, 30, 38, 39, 40, 41 |
| [`log clone`](#log-clone) | the owner's voice, cloned once per provider (Inworld or Fish Audio) from their own voice notes, and words said in it to a local file | any (none) | `--provider` `--from <file>` `--apply` `--replace` `--json` `--text` `--model <model>` `--format` | none | none | `cloneVoice`, `cloneSpeak` | PreToolUse, PostToolUse · PostToolUse | no | 39, 41, 94, 163, 142, 30, 38, 39, 40, 41 |
| [`log transcribe`](#log-transcribe) | Transcribe every voice note in the saved X and Discord conversations with AssemblyAI, written into the conversation store for search, voice and SubQ | any (none) | `--platform` `--account <a>` `--list` `--noIndex` `--json` | none | none | `transcribe`, `transcribeFile` | PreToolUse, PostToolUse · PostToolUse | no | 26, 41, 89, 94, 105, 163, 138, 30, 38, 39, 40, 41 |
| [`log twitter followers`](#log-twitter-followers) | Read an X account's own followers on the direct-API engine, sending nothing | `twitter` first | `--account <accountName>` `--limit <n>` `--json` | direct API only | none | `twitterFollowers` | PreToolUse, PostToolUse · PostToolUse | no | 73, 105, 30, 38, 39, 40, 41 |
| [`log twitter notifications`](#log-twitter-notifications) | Read who liked, reposted, replied to, quoted or followed an X account, new and historical, kept locally, sending nothing | `twitter` first | `--account <accountName>` `--type` `--since <date>` `--post <id|url>` `--full` `--pages <n>` `--stored` `--limit <n>` `--json` | direct API only | none | `twitterNotifications` | PreToolUse, PostToolUse · PostToolUse | no | 26, 73, 94, 105, 30, 38, 39, 40, 41 |
| [`log twitter reply`](#log-twitter-reply) | Reply to one post on X with approved copy, on the direct-API engine; a dry run unless --live | `twitter` first | `--account <accountName>` `--tweet <postUrl>` `--text` `--media <file>` `--approvedBy <who>` `--skipStyleCheck` `--force` `--live` `--json` | direct API only | none | `twitterReply`, `twitterReplyLive` | PreToolUse, PostToolUse · PostToolUse | no | 8, 53, 73, 86, 94, 105, 109, 30, 38, 39, 40, 41 |
| [`log twitter quote`](#log-twitter-quote) | Quote one post on X with approved copy, on the direct-API engine; a dry run unless --live | `twitter` first | `--account <accountName>` `--tweet <postUrl>` `--text` `--approvedBy <who>` `--skipStyleCheck` `--force` `--live` `--json` | direct API only | none | `twitterQuote`, `twitterQuoteLive` | PreToolUse, PostToolUse · PostToolUse | no | 8, 53, 73, 86, 94, 105, 30, 38, 39, 40, 41 |
| [`log twitter post`](#log-twitter-post) | Make one original post on X with approved copy and optional media (a video, a gif or up to 4 images), on the direct-API engine; a dry run unless --live | `twitter` first | `--account <accountName>` `--text` `--media <file>` `--approvedBy <who>` `--skipStyleCheck` `--force` `--live` `--json` | direct API only | none | `twitterPost`, `twitterPostLive` | PreToolUse, PostToolUse · PostToolUse | no | 8, 73, 86, 94, 105, 30, 38, 39, 40, 41 |
| [`log twitter like`](#log-twitter-like) | Like one post on X, on the direct-API engine; a dry run unless --live | `twitter` first | `--account <accountName>` `--tweet <postUrl>` `--approvedBy <who>` `--force` `--live` `--json` | direct API only | none | `twitterLike`, `twitterLikeLive` | PreToolUse, PostToolUse · PostToolUse | no | 8, 53, 73, 86, 94, 105, 30, 38, 39, 40, 41 |
| [`log twitter list`](#log-twitter-list) | The X account's own lists: show them, make one, put someone on one; changes are dry runs unless --live | `twitter` first | `--account <accountName>` `--json` `--name <name>` `--description <text>` `--private` `--approvedBy <who>` `--live` `--list <name|id>` `--handle <handle>` `--userId <id>` | direct API only | none | `twitterListShow`, `twitterListCreate`, `twitterListCreateLive`, `twitterListAdd`, `twitterListAddLive` | PreToolUse, PostToolUse · PostToolUse | no | 8, 73, 94, 105, 30, 38, 39, 40, 41 |
| [`log twitter repost`](#log-twitter-repost) | Repost one post on X, on the direct-API engine; a dry run unless --live | `twitter` first | `--account <accountName>` `--tweet <postUrl>` `--approvedBy <who>` `--force` `--live` `--json` | direct API only | none | `twitterRepost`, `twitterRepostLive` | PreToolUse, PostToolUse · PostToolUse | no | 8, 53, 73, 86, 94, 105, 30, 38, 39, 40, 41 |
| [`log twitter follow`](#log-twitter-follow) | Follow one person on X, on the direct-API engine; a dry run unless --live | `twitter` first | `--account <accountName>` `--userId <id>` `--approvedBy <who>` `--force` `--live` `--json` | direct API only | none | `twitterFollow`, `twitterFollowLive` | PreToolUse, PostToolUse · PostToolUse | no | 8, 53, 73, 86, 94, 105, 30, 38, 39, 40, 41 |
| [`log twitter dm`](#log-twitter-dm) | Send one approved direct message on X, on the direct-API engine; a dry run unless --live | `twitter` first | `--account <accountName>` `--userId <id>` `--text` `--media <file|url>` `--approvedBy <who>` `--skipStyleCheck` `--asOne` `--overGate` `--force` `--live` `--json` | direct API only | none | `twitterDm`, `twitterDmLive` | PreToolUse, PostToolUse · PostToolUse | no | 8, 53, 73, 86, 94, 109, 105, 137, 133, 138, 30, 38, 39, 40, 41 |
| [`log twitter react`](#log-twitter-react) | React to a X message with an emoji, on the direct-API engine; a dry run unless --live | `twitter` first | `--account <accountName>` `--chat <chat>` `--message <id>` `--emoji <emoji>` `--remove` `--approvedBy <who>` `--live` `--json` | direct API only | none | `twitterReact`, `twitterReactLive` | PreToolUse, PostToolUse · PostToolUse | no | 8, 73, 94, 105, 133, 30, 38, 39, 40, 41 |
| [`log twitter queue`](#log-twitter-queue) | Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine | `twitter` first | `--targets <targets.json>` `--variations <a.json,b.json>` `--out <queue.json>` `--account <accountName>` `--action` `--seed <n>` `--json` `--skipXChatCheck` `--by <who>` `--window <5h|90m>` `--limit <n>` `--start <time>` `--minGap <s>` `--like` `--likeChance <0-1>` `--alertChannel <uuid>` `--alertReplyTo <eventId>` `--alertMention <hex,hex>` `--force` `--keepOpen` `--live` `--replies <n>` `--n <n>` `--text` | direct API only | none | `twitterQueueBuild`, `twitterQueueShow`, `twitterQueueCheck`, `twitterQueueStatus`, `twitterQueueApprove`, `twitterQueuePlan`, `twitterQueueRun`, `twitterQueueRunLive`, `twitterQueueAdd`, `twitterQueueNudge`, `twitterQueueEdit` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 26, 53, 73, 86, 109, 94, 105, 137, 133, 138, 30, 38, 39, 40, 41 |
| [`log new`](#log-new) | Make a new platform (session, command, MCP tool, engine, docs), wired into the repo through its syntax tree | any (none) | `--label <shown name>` `--twentyPlatform <ENUM>` `--library <vendor/folder>` `--sessionCookies <a,b>` `--cookieDomain <.site.com>` `--hosts <a.com,b.com>` `--home <https://…>` `--noProxy` `--noBrowser` `--apply` `--json` | none | none | `newPlatform` | PreToolUse, PostToolUse · PostToolUse | no | 1, 2, 63, 83, 30, 38, 39, 40, 41 |
| [`log reddit session`](#log-reddit-session) | Check that Reddit still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty | `reddit` first | `--account <accountName>` `--json` | direct API only | none | `redditSessionCheck` | PreToolUse, PostToolUse · PostToolUse | no | 73, 30, 38, 39, 40, 41 |
| [`log reddit read`](#log-reddit-read) | Find subreddits, and read a subreddit's newest posts with their links, through the account's direct-API engine | `reddit` first | `--account <accountName>` `--query <words>` `--json` `--subreddit <name>` `--days <n>` `--linksTo <host>` `--url <permalink>` `--limit <n>` | direct API only | the account's | `redditReadSubreddits`, `redditReadPosts`, `redditReadHome`, `redditReadPost` | PreToolUse, PostToolUse · PostToolUse | yes: watch it | 8, 53, 73, 94, 109, 30, 38, 39, 40, 41 |
| [`log reddit post`](#log-reddit-post) | Post a text post to a subreddit through the account's direct-API engine; a dry run unless --live | `reddit` first | `--account <accountName>` `--subreddit <name>` `--title <title>` `--text <markdown>` `--flair <flair>` `--approvedBy <who>` `--live` `--json` | direct API only | none | `redditPost`, `redditPostLive` | PreToolUse, PostToolUse · PostToolUse | no | 8, 41, 73, 94, 30, 38, 39, 40, 41 |
| [`log reddit reply`](#log-reddit-reply) | Comment on a Reddit post or reply to one of its comments through the account's direct-API engine; a dry run unless --live | `reddit` first | `--account <accountName>` `--url <post permalink>` `--text <text>` `--comment <t1_id>` `--approvedBy <who>` `--live` `--json` | direct API only | none | `redditReply`, `redditReplyLive` | PreToolUse, PostToolUse · PostToolUse | no | 8, 41, 73, 94, 30, 38, 39, 40, 41 |
| [`log reddit vote`](#log-reddit-vote) | Vote on a Reddit post or comment through the account's direct-API engine; a dry run unless --live | `reddit` first | `--account <accountName>` `--url <post permalink>` `--target <t3_id|t1_id>` `--direction` `--approvedBy <who>` `--live` `--json` | direct API only | none | `redditVote`, `redditVoteLive` | PreToolUse, PostToolUse · PostToolUse | no | 8, 73, 94, 30, 38, 39, 40, 41 |
| [`log discord session`](#log-discord-session) | Check that Discord still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty | `discord` first | `--account <accountName>` `--json` | direct API only | none | `discordSessionCheck` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | no | 73, 94, 30, 38, 39, 40, 41 |
| [`log discord chats`](#log-discord-chats) | List the account's DMs and group DMs with their ids, on the direct-API engine, sending nothing | `discord` first | `--account <accountName>` `--json` | direct API only | none | `discordChats` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | no | 73, 94, 30, 38, 39, 40, 41 |
| [`log discord servers`](#log-discord-servers) | List the Discord servers the account is in, on the direct-API engine, sending nothing | `discord` first | `--account <accountName>` `--json` | direct API only | none | `discordServers` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | no | 73, 94, 30, 38, 39, 40, 41 |
| [`log discord channels`](#log-discord-channels) | List one Discord server's channels by category and kind (text, forum, media, voice), on the direct-API engine, sending nothing | `discord` first | `--account <accountName>` `--server <server name>` `--json` | direct API only | none | `discordChannels` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | no | 73, 94, 30, 38, 39, 40, 41 |
| [`log discord posts`](#log-discord-posts) | List the posts in a Discord forum (or a channel's threads) with each one's opening message, on the direct-API engine, sending nothing | `discord` first | `--account <accountName>` `--channel` `--limit <n>` `--archived <true|false>` `--json` | direct API only | none | `discordPosts` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | no | 73, 94, 30, 38, 39, 40, 41 |
| [`log discord search`](#log-discord-search) | Search a whole Discord server (channels, forum posts and threads) with Discord's own search, on the direct-API engine, sending nothing | `discord` first | `--account <accountName>` `--server <server name>` `--query` `--channel` `--from <name>` `--limit <n>` `--json` | direct API only | none | `discordSearch` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | no | 73, 94, 30, 38, 39, 40, 41 |
| [`log discord read`](#log-discord-read) | Read a Discord chat or channel's latest messages, on the direct-API engine, sending nothing | `discord` first | `--account <accountName>` `--channel <channelId|chat name>` `--limit <n>` `--after <messageId>` `--noMedia` `--json` | direct API only | the account's | `discordRead` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | yes: watch it | 73, 94, 138, 30, 38, 39, 40, 41 |
| [`log discord watch`](#log-discord-watch) | Watch the account's Discord messages as Discord pushes them over its gateway, nothing polled, sending nothing | `discord` first | `--account <accountName>` `--channel <channelId|chat name>` `--seconds <s>` `--inbox` `--json` | direct API only | Camoufox only | `discordWatch` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | yes: watch it | 26, 73, 94, 138, 105, 30, 38, 39, 40, 41 |
| [`log discord send`](#log-discord-send) | Send one message to a Discord DM, group or channel, on the direct-API engine; a dry run unless --live | `discord` first | `--account <accountName>` `--channel <channelId|chat name>` `--text` `--asOne` `--overGate` `--approvedBy <who>` `--live` `--json` `--brief` `--file` | direct API only | none | `discordSend`, `discordSendLive` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | no | 8, 73, 90, 94, 105, 133, 134, 109, 137, 138, 30, 38, 39, 40, 41 |
| [`log discord delete`](#log-discord-delete) | Delete the account's own Discord messages by id, on the direct-API engine; a dry run unless --live | `discord` first | `--account <accountName>` `--channel <channelId|chat name>` `--message <messageId>` `--approvedBy <who>` `--live` `--json` | direct API only | none | `discordDelete`, `discordDeleteLive` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | no | 8, 73, 94, 30, 38, 39, 40, 41 |
| [`log discord react`](#log-discord-react) | React to a Discord message with an emoji, on the direct-API engine; a dry run unless --live | `discord` first | `--account <accountName>` `--channel <channel>` `--message <id>` `--emoji <emoji>` `--remove` `--approvedBy <who>` `--live` `--json` | direct API only | none | `discordReact`, `discordReactLive` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | no | 8, 73, 94, 133, 30, 38, 39, 40, 41 |
| [`log discord voice`](#log-discord-voice) | Send a voice note in the owner's cloned voice as Discord's own voice note, from text; a dry run unless --live | `discord` first | `--account <accountName>` `--channel <channel>` `--text` `--provider` `--mattsWords` `--translationOf` `--language <code>` `--approvedBy <who>` `--live` `--json` | direct API only | none | `discordVoice`, `discordVoiceLive` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | no | 8, 73, 94, 133, 109, 137, 142, 30, 38, 39, 40, 41 |
| [`log linkedin session`](#log-linkedin-session) | Check that LinkedIn still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty | `linkedin` first | `--account <accountName>` `--json` | direct API only | none | `linkedinSessionCheck` | PreToolUse, PostToolUse · PostToolUse | no | 73, 30, 38, 39, 40, 41 |
| [`log linkedin cookies`](#log-linkedin-cookies) | Add or refresh a LinkedIn account in Twenty: its session cookies from a masked prompt, checked against LinkedIn | `linkedin` first | `--account <publicId>` `--name <label>` | direct API only | none | terminal only: asks for an account's session cookies in a Clack prompt (masked) and checks them with the platform before saving: an X account's auth_token, ct0 and twid, a LinkedIn account's, or a Slack account's d. Run `log twitter cookies save --account <handle>`, `log linkedin cookies save --account <publicId>` or `log slack cookies save --account <name>` in a terminal. | PreToolUse, PostToolUse · n/a | no | 35, 73, 30, 38, 39, 40, 41 |
| [`log slack session`](#log-slack-session) | Check that Slack still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to its row | `slack` first | `--account <accountName>` `--workspace <domain>` `--json` | direct API only | none | `slackSessionCheck` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | no | 73, 30, 38, 39, 40, 41 |
| [`log slack workspaces`](#log-slack-workspaces) | List the workspaces a Slack account is signed in to, on the direct-API engine, sending nothing | `slack` first | `--account <accountName>` `--json` `--workspace` | direct API only | none | `slackWorkspaces` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | no | 73, 30, 38, 39, 40, 41 |
| [`log slack chats`](#log-slack-chats) | List a Slack account's DMs and group DMs in a workspace with their ids, on the direct-API engine, sending nothing | `slack` first | `--account <accountName>` `--workspace <domain>` `--limit <n>` `--json` | direct API only | none | `slackChats` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | no | 73, 94, 30, 38, 39, 40, 41 |
| [`log slack read`](#log-slack-read) | Read a Slack chat's latest messages, on the direct-API engine, sending nothing | `slack` first | `--account <accountName>` `--chat <chatId|who it is with>` `--workspace <domain>` `--limit <n>` `--json` | direct API only | the account's | `slackRead` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | yes: watch it | 73, 94, 138, 30, 38, 39, 40, 41 |
| [`log slack watch`](#log-slack-watch) | Watch a Slack workspace's events as its websocket pushes them, nothing polled, sending nothing | `slack` first | `--account <accountName>` `--workspace <domain>` `--chat <chatId|who it is with>` `--seconds <s>` `--inbox` `--json` | direct API only | Camoufox only | `slackWatch` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | yes: watch it | 26, 73, 94, 123, 105, 30, 38, 39, 40, 41 |
| [`log slack send`](#log-slack-send) | Send a message to a Slack DM, group or channel, on the direct-API engine; a dry run unless --live | `slack` first | `--account <accountName>` `--chat <chatId|who it is with>` `--text` `--workspace <domain>` `--asOne` `--approvedBy <who>` `--live` `--json` | direct API only | none | `slackSend`, `slackSendLive` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | no | 8, 73, 90, 94, 137, 105, 133, 134, 109, 138, 30, 38, 39, 40, 41 |
| [`log slack cookies`](#log-slack-cookies) | Add or refresh a Slack account locally: its d cookie from a masked prompt, checked against Slack | `slack` first | `--account <accountName>` `--name <label>` `--workspace <domain>` | direct API only | none | terminal only: asks for an account's session cookies in a Clack prompt (masked) and checks them with the platform before saving: an X account's auth_token, ct0 and twid, a LinkedIn account's, or a Slack account's d. Run `log twitter cookies save --account <handle>`, `log linkedin cookies save --account <publicId>` or `log slack cookies save --account <name>` in a terminal. | PreToolUse, PostToolUse · n/a | no | 35, 73, 30, 38, 39, 40, 41 |
| [`log slack react`](#log-slack-react) | React to a Slack message with an emoji, on the direct-API engine; a dry run unless --live | `slack` first | `--account <accountName>` `--chat <chat>` `--message <id>` `--emoji <emoji>` `--workspace <workspace>` `--remove` `--approvedBy <who>` `--live` `--json` | direct API only | none | `slackReact`, `slackReactLive` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | no | 8, 73, 94, 133, 30, 38, 39, 40, 41 |
| [`log slack voice`](#log-slack-voice) | Send a voice note in the owner's cloned voice as Slack's own voice note, from text; a dry run unless --live | `slack` first | `--account <accountName>` `--chat <chat>` `--text` `--workspace <workspace>` `--provider` `--mattsWords` `--translationOf` `--language <code>` `--approvedBy <who>` `--live` `--json` | direct API only | none | `slackVoice`, `slackVoiceLive` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | no | 8, 73, 94, 133, 109, 137, 142, 30, 38, 39, 40, 41 |
| [`log instagram session`](#log-instagram-session) | Check that Instagram still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty | `instagram` first | `--account <accountName>` `--json` | direct API only | none | `instagramSessionCheck` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | no | 73, 105, 30, 38, 39, 40, 41 |
| [`log instagram dms`](#log-instagram-dms) | Read an Instagram account's DMs: its threads, or one thread's messages with --with, on the direct-API engine, sending nothing | `instagram` first | `--account <accountName>` `--with <handle|thread name|thread id>` `--limit <n>` `--json` | direct API only | none | `instagramDms` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | no | 73, 94, 138, 105, 30, 38, 39, 40, 41 |
| [`log instagram send`](#log-instagram-send) | Send text and a photo to an Instagram DM, on the direct-API engine; a dry run unless --live | `instagram` first | `--account <accountName>` `--with <handle|thread name|thread id>` `--text` `--photo <file>` `--asOne` `--approvedBy <who>` `--live` `--json` | direct API only | none | `instagramSend`, `instagramSendLive` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | no | 8, 73, 90, 94, 137, 105, 133, 109, 138, 30, 38, 39, 40, 41 |
| [`log instagram watch`](#log-instagram-watch) | Watch an Instagram account's DMs as Instagram's realtime connection pushes them, nothing polled, sending nothing | `instagram` first | `--account <accountName>` `--seconds <s>` `--inbox` `--json` | direct API only | Camoufox only | `instagramWatch` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | yes: watch it | 26, 73, 94, 123, 105, 30, 38, 39, 40, 41 |
| [`log instagram react`](#log-instagram-react) | React to a Instagram message with an emoji, on the direct-API engine; a dry run unless --live | `instagram` first | `--account <accountName>` `--thread <thread>` `--message <id>` `--emoji <emoji>` `--remove` `--approvedBy <who>` `--live` `--json` | direct API only | none | `instagramReact`, `instagramReactLive` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | no | 8, 73, 94, 105, 133, 30, 38, 39, 40, 41 |
| [`log instagram voice`](#log-instagram-voice) | Send a voice note in the owner's cloned voice as Instagram's own voice note, from text; a dry run unless --live | `instagram` first | `--account <accountName>` `--with <with>` `--text` `--provider` `--mattsWords` `--translationOf` `--language <code>` `--approvedBy <who>` `--live` `--json` | direct API only | none | `instagramVoice`, `instagramVoiceLive` | PreToolUse, PostToolUse · PreToolUse, PostToolUse | no | 8, 73, 94, 105, 133, 109, 137, 142, 30, 38, 39, 40, 41 |
| [`log twitter voice`](#log-twitter-voice) | Send a voice note in the owner's cloned voice as Twitter's own voice note, from text; a dry run unless --live | `twitter` first | `--account <accountName>` `--with <with>` `--text` `--provider` `--mattsWords` `--translationOf` `--language <code>` `--approvedBy <who>` `--live` `--json` | direct API only | none | `twitterVoice`, `twitterVoiceLive` | PreToolUse, PostToolUse · PostToolUse | no | 8, 73, 89, 94, 105, 133, 109, 137, 142, 30, 38, 39, 40, 41 |

### Saved flows: MCP tools of their own (rule 31)

| MCP tool | Runs | What it does | Params | Steps |
| --- | --- | --- | --- | --- |
| `facebookFlowDeletePost`, `facebookFlowDeletePostLive` | `log flow run deletePost` | Delete the newest post on the account's own profile: its Actions menu, Move to bin, Move (useCometTrashPostMutation; Facebook empties the bin after 30 days). Writes on Facebook (--live). | none | gotoprofilePhp → clickActionsForThisPost → clickMoveToBinItems → clickMove |
| `facebookFlowLanguageEnglish`, `facebookFlowLanguageEnglishLive` | `log flow run facebookLanguageEnglish` | Switch the account's Facebook language to English (US): Settings, Language and region, Account language, English (US), OK; decided by useCometUSFScrollablePickerMutation answering en_US. Recorded on Scranton 2026-10-25 from Arabic. | none | gotosettings → click → clickEnglishUs → click |
| `facebookFlowGroupHeaderMenus`, `facebookFlowGroupHeaderMenusLive` | `log flow run groupHeaderMenus` | Open and close the group header's search, More menu, Joined menu, Invite dialog and Share sheet; nothing inside them is picked | `groupId` | gotogroups → clickSearchWithinThisGroup → pressEscape → clickMore → pressEscape → clickJoined → pressEscape → clickInvite → pressEscape → clickShareGroup → pressEscape |
| `facebookFlowGroupMembers`, `facebookFlowGroupMembersLive` | `log flow run groupMembers` | Open a group's People tab and scroll it read-only so Facebook loads the member list (bio line, page category) for extraction | none | gotogroupsJunkremovalwinners → gotogroupsJunkremovalwinnersMembers → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll → scroll |
| `facebookFlowGroupPostComments`, `facebookFlowGroupPostCommentsLive` | `log flow run groupPostComments` | On a group's Open questions tab, open a post's comments, switch the sort to All comments and scroll them; read-only | `groupId` | gotogroupsQuestions → clickLeaveAComment → clickMostRelevant → clickAllCommentsShowAll → scroll |
| `facebookFlowGroupPostDialog`, `facebookFlowGroupPostDialogLive` | `log flow run groupPostDialog` | On a group's Discussion feed, open a post in its dialog with Leave a comment (the comment box takes focus, nothing is typed) and close it | `groupId` | gotogroups → clickLeaveAComment → clickClose |
| `facebookFlowGroupTabs`, `facebookFlowGroupTabsLive` | `log flow run groupTabs` | Open each tab of a group the account is in (Featured, Open questions, People, Events, Media, Files, About) and come back to Discussion; read-only | `groupId` | gotogroups → clickFeatured → clickOpenQuestions → clickPeople → clickEvents → clickMedia → clickFiles → clickAbout → clickDiscussion |
| `facebookFlowMarketplaceListingDelete`, `facebookFlowMarketplaceListingDeleteLive` | `log flow run marketplaceListingDelete` | Delete one Marketplace listing from the Selling page: its More options menu, Delete listing, Delete, then "No, haven't sold" on Facebook's survey. Recorded on Bethlehem, 2026-10-23 (listing 1425935622848350). | `listingTitle`, `listingId` | gotomarketplaceYouSelling → clickMoreOptions → clickDeleteListing → clickDelete → clickNoHavenTSold → clickNext |
| `facebookFlowMarketplaceListingPublish`, `facebookFlowMarketplaceListingPublishLive` | `log flow run marketplaceListingPublish` | Publish one Marketplace listing in the account's open AdsPower browser: set the Marketplace location (City, State written out), open Create, two photos, title, price, category Miscellaneous, condition New, description, Next, Publish, close the Boost offer. Recorded on Bethlehem 2026-10-22 (listing 1425935622848350, held for review). | `location`, `photo1`, `photo2`, `title`, `price`, `description` | gotomarketplace → setLocation → gotomarketplaceCreateItem → uploadAddPhotosOrDrag → uploadAddPhoto → fillTitle → fillPrice → clickCategory → clickMiscellaneous → clickCondition → clickNew → fillDescription → clickNext → clickPublish → clickClose |
| `facebookFlowMessengerPinCreate`, `facebookFlowMessengerPinCreateLive` | `log flow run messengerPinCreate` | Messenger's Create a PIN: open /messages/, press Create PIN, type the account's PIN from Twenty, then again to confirm (rule 35). Recorded on Bethlehem 2026-10-22. | none | gotomessages → clickCreatePin → pin → pin |
| `facebookFlowPostComment`, `facebookFlowPostCommentLive` | `log flow run postComment` | Comment on the newest post on the account's own profile: type in its Write a comment box, Post comment (useCometUFICreateCommentMutation). Writes on Facebook (--live). | `comment` | gotoprofilePhp → fillWriteAComment → clickPostComment |
| `facebookFlowProfilePhotoPost`, `facebookFlowProfilePhotoPostLive` | `log flow run profilePhotoPost` | Post a photo on the account's own profile: Photo/video hands the file to the chooser, the upload finishes, Post, wait for ComposerStoryCreateMutation. Writes on Facebook (--live). | `photo` | gotoprofilePhp → uploadPhotoVideo → clickPost |
| `facebookFlowProfilePost`, `facebookFlowProfilePostLive` | `log flow run profilePost` | Post text on the account's own profile: open the composer, type the text, Post, wait for ComposerStoryCreateMutation. Writes on Facebook (--live). | `text` | gotoprofilePhp → clickWhatSOnYour → fillWhatSOnYour → clickPost |
| `facebookFlowProfileSetup`, `facebookFlowProfileSetupLive` | `log flow run profileSetup` | Give an account its profile picture, cover photo and name, as recorded on Lancaster 2026-10-19 (rule 35): profile picture menu, Choose profile picture, Upload Photo, Save; Add Cover Photo, Upload photo, Save changes; Accounts Center name, Review change, Done. | `profilePhoto`, `coverPhoto`, `firstName`, `lastName` | gotome → clickProfilePictureActions → clickChooseProfilePicture → uploadUploadPhoto → clickSave → clickAddCoverPhoto → uploadUploadPhoto → clickSaveChanges → gotoprofilesName → fillFirstName → fillSurname → clickReviewChange → clickDone |
| `facebookFlowWarmupCreateAccessCheck`, `facebookFlowWarmupCreateAccessCheckLive` | `log flow run warmupCreateAccessCheck` | Warm-up createAccessCheck: recorded on 99900000000001 2026-10-22 (rule 35). | none | gotomarketplace → dwell → gotomarketplaceCreateItem → dwell → gotomarketplace → scroll |
| `facebookFlowWarmupFeedBrowse`, `facebookFlowWarmupFeedBrowseLive` | `log flow run warmupFeedBrowse` | Warm-up feedBrowse: recorded on 99900000000001 2026-10-22 (rule 35). | none | goto → dwell → scroll → gotomarketplace → dwell → scroll |
| `facebookFlowWarmupMarketplaceBrowse`, `facebookFlowWarmupMarketplaceBrowseLive` | `log flow run warmupMarketplaceBrowse` | Warm-up marketplaceBrowse: recorded on 99900000000001 2026-10-22 (rule 35). | none | gotomarketplace → dwell → scroll → openAny |
| `facebookFlowWarmupMessagesVisit`, `facebookFlowWarmupMessagesVisitLive` | `log flow run warmupMessagesVisit` | Warm-up messagesVisit: recorded on 99900000000001 2026-10-22 (rule 35). | none | gotomarketplace → scroll → gotomarketplaceYouSelling → dwell → gotomessages → dwell → scroll |
| `facebookFlowWarmupSellingVisit`, `facebookFlowWarmupSellingVisitLive` | `log flow run warmupSellingVisit` | Warm-up sellingVisit: recorded on 99900000000001 2026-10-22 (rule 35). | none | gotomarketplace → scroll → gotomarketplaceYouSelling → dwell |

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
    c_console["console"]
    c_adsPower["adsPower"]
    c_localAccount["localAccount"]
    c_inspect["inspect"]
    c_flow["flow"]
    c_proxy["proxy"]
    c_errors["errors"]
    c_graph["graph"]
    c_runs["runs"]
    c_storage["storage"]
    c_timing["timing"]
    c_inbox["inbox"]
    c_media["media"]
    c_browsers["browsers"]
    c_browser["browser"]
    c_report["report"]
    c_job["job"]
    c_mcp["mcp"]
    c_login["login"]
    c_logout["logout"]
    c_whoami["whoami"]
    c_voice["voice"]
    c_search["search"]
    c_kb["kb"]
    c_runtime["runtime"]
    c_memelord["memelord"]
    c_treg["treg"]
    c_balance["balance"]
    c_governor["governor"]
    c_sessions["sessions"]
    c_chats["chats"]
    c_messages["messages"]
    c_clone["clone"]
    c_transcribe["transcribe"]
    c_new["new"]
  end
  subgraph g_byArgument["Platform named first"]
    c_warmup["#lt;platform#gt; warmup"]
  end
  subgraph g_facebook["Facebook"]
    c_facebookListings["listings"]
    c_facebookListing["listing"]
    c_facebookAccounts["accounts"]
    c_facebookAccount["account"]
    c_facebookLifecycle["lifecycle"]
    c_facebookPreflight["preflight"]
    c_facebookDoctor["doctor"]
    c_facebookConnect["connect"]
    c_facebookProfile["profile"]
    c_facebookHost["host"]
    c_facebookJoin["join"]
    c_facebookRead["read"]
    c_facebookPoll["poll"]
    c_facebookCheck["check"]
    c_facebookScan["scan"]
    c_facebookStatus["status"]
    c_facebookWatch["watch"]
    c_facebookPublish["publish"]
    c_facebookCampaign["campaign"]
    c_facebookConversations["conversations"]
    c_facebookConversation["conversation"]
    c_facebookMessenger["messenger"]
    c_facebookCapture["capture"]
  end
  subgraph g_twitter["X"]
    c_twitterSession["session"]
    c_twitterFollows["follows"]
    c_twitterDms["dms"]
    c_twitterChat["chat"]
    c_twitterCookies["cookies"]
    c_twitterFollowers["followers"]
    c_twitterNotifications["notifications"]
    c_twitterReply["reply"]
    c_twitterQuote["quote"]
    c_twitterPost["post"]
    c_twitterLike["like"]
    c_twitterList["list"]
    c_twitterRepost["repost"]
    c_twitterFollow["follow"]
    c_twitterDm["dm"]
    c_twitterReact["react"]
    c_twitterQueue["queue"]
    c_twitterVoice["voice"]
  end
  subgraph g_reddit["Reddit"]
    c_redditSession["session"]
    c_redditRead["read"]
    c_redditPost["post"]
    c_redditReply["reply"]
    c_redditVote["vote"]
  end
  subgraph g_discord["Discord"]
    c_discordSession["session"]
    c_discordChats["chats"]
    c_discordServers["servers"]
    c_discordChannels["channels"]
    c_discordPosts["posts"]
    c_discordSearch["search"]
    c_discordRead["read"]
    c_discordWatch["watch"]
    c_discordSend["send"]
    c_discordDelete["delete"]
    c_discordReact["react"]
    c_discordVoice["voice"]
  end
  subgraph g_linkedin["LinkedIn"]
    c_linkedinSession["session"]
    c_linkedinCookies["cookies"]
  end
  subgraph g_slack["Slack"]
    c_slackSession["session"]
    c_slackWorkspaces["workspaces"]
    c_slackChats["chats"]
    c_slackRead["read"]
    c_slackWatch["watch"]
    c_slackSend["send"]
    c_slackCookies["cookies"]
    c_slackReact["react"]
    c_slackVoice["voice"]
  end
  subgraph g_instagram["Instagram"]
    c_instagramSession["session"]
    c_instagramDms["dms"]
    c_instagramSend["send"]
    c_instagramWatch["watch"]
    c_instagramReact["react"]
    c_instagramVoice["voice"]
  end
  cli --> c_launch
  c_launch -.- terminal
  cli --> c_console
  mcp --> c_console
  cli --> c_facebookListings
  mcp --> c_facebookListings
  cli --> c_facebookListing
  mcp --> c_facebookListing
  cli --> c_facebookAccounts
  mcp --> c_facebookAccounts
  cli --> c_facebookAccount
  mcp --> c_facebookAccount
  cli --> c_adsPower
  mcp --> c_adsPower
  cli --> c_localAccount
  mcp --> c_localAccount
  cli --> c_facebookLifecycle
  mcp --> c_facebookLifecycle
  cli --> c_facebookPreflight
  mcp --> c_facebookPreflight
  cli --> c_facebookDoctor
  mcp --> c_facebookDoctor
  c_facebookDoctor --> live
  cli --> c_facebookConnect
  mcp --> c_facebookConnect
  c_facebookConnect --> live
  cli --> c_facebookProfile
  mcp --> c_facebookProfile
  c_facebookProfile --> live
  cli --> c_facebookHost
  mcp --> c_facebookHost
  c_facebookHost --> live
  cli --> c_inspect
  mcp --> c_inspect
  c_inspect --> live
  cli --> c_flow
  mcp --> c_flow
  c_flow --> live
  cli --> c_warmup
  mcp --> c_warmup
  c_warmup --> live
  cli --> c_facebookJoin
  mcp --> c_facebookJoin
  c_facebookJoin --> live
  cli --> c_facebookRead
  mcp --> c_facebookRead
  c_facebookRead --> live
  cli --> c_facebookPoll
  mcp --> c_facebookPoll
  c_facebookPoll --> live
  cli --> c_facebookCheck
  mcp --> c_facebookCheck
  c_facebookCheck --> live
  cli --> c_facebookScan
  mcp --> c_facebookScan
  c_facebookScan --> live
  cli --> c_facebookStatus
  mcp --> c_facebookStatus
  c_facebookStatus --> live
  cli --> c_facebookWatch
  mcp --> c_facebookWatch
  c_facebookWatch --> live
  cli --> c_proxy
  mcp --> c_proxy
  cli --> c_facebookPublish
  mcp --> c_facebookPublish
  c_facebookPublish --> live
  cli --> c_facebookCampaign
  mcp --> c_facebookCampaign
  c_facebookCampaign --> live
  cli --> c_facebookConversations
  mcp --> c_facebookConversations
  cli --> c_facebookConversation
  mcp --> c_facebookConversation
  cli --> c_facebookMessenger
  c_facebookMessenger -.- terminal
  cli --> c_errors
  mcp --> c_errors
  cli --> c_graph
  mcp --> c_graph
  cli --> c_facebookCapture
  mcp --> c_facebookCapture
  c_facebookCapture --> live
  cli --> c_runs
  mcp --> c_runs
  cli --> c_storage
  mcp --> c_storage
  cli --> c_timing
  mcp --> c_timing
  cli --> c_inbox
  mcp --> c_inbox
  cli --> c_media
  mcp --> c_media
  cli --> c_browsers
  mcp --> c_browsers
  cli --> c_browser
  mcp --> c_browser
  cli --> c_report
  mcp --> c_report
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
  cli --> c_runtime
  c_runtime -.- terminal
  cli --> c_memelord
  mcp --> c_memelord
  cli --> c_treg
  mcp --> c_treg
  cli --> c_balance
  mcp --> c_balance
  cli --> c_governor
  mcp --> c_governor
  cli --> c_sessions
  mcp --> c_sessions
  cli --> c_chats
  mcp --> c_chats
  cli --> c_messages
  mcp --> c_messages
  cli --> c_clone
  mcp --> c_clone
  cli --> c_transcribe
  mcp --> c_transcribe
  cli --> c_twitterFollowers
  mcp --> c_twitterFollowers
  cli --> c_twitterNotifications
  mcp --> c_twitterNotifications
  cli --> c_twitterReply
  mcp --> c_twitterReply
  cli --> c_twitterQuote
  mcp --> c_twitterQuote
  cli --> c_twitterPost
  mcp --> c_twitterPost
  cli --> c_twitterLike
  mcp --> c_twitterLike
  cli --> c_twitterList
  mcp --> c_twitterList
  cli --> c_twitterRepost
  mcp --> c_twitterRepost
  cli --> c_twitterFollow
  mcp --> c_twitterFollow
  cli --> c_twitterDm
  mcp --> c_twitterDm
  cli --> c_twitterReact
  mcp --> c_twitterReact
  cli --> c_twitterQueue
  mcp --> c_twitterQueue
  c_twitterQueue --> live
  cli --> c_new
  mcp --> c_new
  cli --> c_redditSession
  mcp --> c_redditSession
  cli --> c_redditRead
  mcp --> c_redditRead
  c_redditRead --> live
  cli --> c_redditPost
  mcp --> c_redditPost
  cli --> c_redditReply
  mcp --> c_redditReply
  cli --> c_redditVote
  mcp --> c_redditVote
  cli --> c_discordSession
  mcp --> c_discordSession
  cli --> c_discordChats
  mcp --> c_discordChats
  cli --> c_discordServers
  mcp --> c_discordServers
  cli --> c_discordChannels
  mcp --> c_discordChannels
  cli --> c_discordPosts
  mcp --> c_discordPosts
  cli --> c_discordSearch
  mcp --> c_discordSearch
  cli --> c_discordRead
  mcp --> c_discordRead
  c_discordRead --> live
  cli --> c_discordWatch
  mcp --> c_discordWatch
  c_discordWatch --> live
  cli --> c_discordSend
  mcp --> c_discordSend
  cli --> c_discordDelete
  mcp --> c_discordDelete
  cli --> c_discordReact
  mcp --> c_discordReact
  cli --> c_discordVoice
  mcp --> c_discordVoice
  cli --> c_linkedinSession
  mcp --> c_linkedinSession
  cli --> c_linkedinCookies
  c_linkedinCookies -.- terminal
  cli --> c_slackSession
  mcp --> c_slackSession
  cli --> c_slackWorkspaces
  mcp --> c_slackWorkspaces
  cli --> c_slackChats
  mcp --> c_slackChats
  cli --> c_slackRead
  mcp --> c_slackRead
  c_slackRead --> live
  cli --> c_slackWatch
  mcp --> c_slackWatch
  c_slackWatch --> live
  cli --> c_slackSend
  mcp --> c_slackSend
  cli --> c_slackCookies
  c_slackCookies -.- terminal
  cli --> c_slackReact
  mcp --> c_slackReact
  cli --> c_slackVoice
  mcp --> c_slackVoice
  cli --> c_instagramSession
  mcp --> c_instagramSession
  cli --> c_instagramDms
  mcp --> c_instagramDms
  cli --> c_instagramSend
  mcp --> c_instagramSend
  cli --> c_instagramWatch
  mcp --> c_instagramWatch
  c_instagramWatch --> live
  cli --> c_instagramReact
  mcp --> c_instagramReact
  cli --> c_instagramVoice
  mcp --> c_instagramVoice
  cli --> c_twitterVoice
  mcp --> c_twitterVoice
  f_deletePost["facebookFlowDeletePost: flow run deletePost"]
  mcp --> f_deletePost
  f_deletePost --> c_flow
  f_facebookLanguageEnglish["facebookFlowLanguageEnglish: flow run facebookLanguageEnglish"]
  mcp --> f_facebookLanguageEnglish
  f_facebookLanguageEnglish --> c_flow
  f_groupHeaderMenus["facebookFlowGroupHeaderMenus: flow run groupHeaderMenus"]
  mcp --> f_groupHeaderMenus
  f_groupHeaderMenus --> c_flow
  f_groupMembers["facebookFlowGroupMembers: flow run groupMembers"]
  mcp --> f_groupMembers
  f_groupMembers --> c_flow
  f_groupPostComments["facebookFlowGroupPostComments: flow run groupPostComments"]
  mcp --> f_groupPostComments
  f_groupPostComments --> c_flow
  f_groupPostDialog["facebookFlowGroupPostDialog: flow run groupPostDialog"]
  mcp --> f_groupPostDialog
  f_groupPostDialog --> c_flow
  f_groupTabs["facebookFlowGroupTabs: flow run groupTabs"]
  mcp --> f_groupTabs
  f_groupTabs --> c_flow
  f_marketplaceListingDelete["facebookFlowMarketplaceListingDelete: flow run marketplaceListingDelete"]
  mcp --> f_marketplaceListingDelete
  f_marketplaceListingDelete --> c_flow
  f_marketplaceListingPublish["facebookFlowMarketplaceListingPublish: flow run marketplaceListingPublish"]
  mcp --> f_marketplaceListingPublish
  f_marketplaceListingPublish --> c_flow
  f_messengerPinCreate["facebookFlowMessengerPinCreate: flow run messengerPinCreate"]
  mcp --> f_messengerPinCreate
  f_messengerPinCreate --> c_flow
  f_postComment["facebookFlowPostComment: flow run postComment"]
  mcp --> f_postComment
  f_postComment --> c_flow
  f_profilePhotoPost["facebookFlowProfilePhotoPost: flow run profilePhotoPost"]
  mcp --> f_profilePhotoPost
  f_profilePhotoPost --> c_flow
  f_profilePost["facebookFlowProfilePost: flow run profilePost"]
  mcp --> f_profilePost
  f_profilePost --> c_flow
  f_profileSetup["facebookFlowProfileSetup: flow run profileSetup"]
  mcp --> f_profileSetup
  f_profileSetup --> c_flow
  f_warmupCreateAccessCheck["facebookFlowWarmupCreateAccessCheck: flow run warmupCreateAccessCheck"]
  mcp --> f_warmupCreateAccessCheck
  f_warmupCreateAccessCheck --> c_flow
  f_warmupFeedBrowse["facebookFlowWarmupFeedBrowse: flow run warmupFeedBrowse"]
  mcp --> f_warmupFeedBrowse
  f_warmupFeedBrowse --> c_flow
  f_warmupMarketplaceBrowse["facebookFlowWarmupMarketplaceBrowse: flow run warmupMarketplaceBrowse"]
  mcp --> f_warmupMarketplaceBrowse
  f_warmupMarketplaceBrowse --> c_flow
  f_warmupMessagesVisit["facebookFlowWarmupMessagesVisit: flow run warmupMessagesVisit"]
  mcp --> f_warmupMessagesVisit
  f_warmupMessagesVisit --> c_flow
  f_warmupSellingVisit["facebookFlowWarmupSellingVisit: flow run warmupSellingVisit"]
  mcp --> f_warmupSellingVisit
  f_warmupSellingVisit --> c_flow
```

Source: [`docs/diagrams/commands.mmd`](diagrams/commands.mmd).

### The hooks (rule 55)

One list (`src/agentHooks/registry`) writes Claude Code's `.claude/settings.json` and Codex's `.codex/hooks.json`. How to add one: `skills/agentHooks/SKILL.md`.

| Event | Matcher | Script | What it does |
| --- | --- | --- | --- |
| SessionStart | `startup\|resume\|clear\|compact` | [`scripts/hooks/pageState.ts`](../scripts/hooks/pageState.ts) | where every open browser is, the moment a session starts or comes back from compaction |
| UserPromptSubmit | every turn | [`scripts/hooks/pageState.ts`](../scripts/hooks/pageState.ts) | where every open browser is, with each of the owner's prompts |
| SessionStart | `startup\|resume\|clear\|compact` | [`scripts/hooks/storage.ts`](../scripts/hooks/storage.ts) | ~/.logCli/runs over 2 GB or the disk nearly full: said with `log runs prune` before AdsPower refuses to start |
| UserPromptSubmit | every turn | [`scripts/hooks/storage.ts`](../scripts/hooks/storage.ts) | the same storage check with each of the owner's prompts (measured at most every 15 minutes) |
| SessionStart | `startup\|resume\|clear\|compact` | [`scripts/hooks/engines.ts`](../scripts/hooks/engines.ts) | which commands run on the direct-API engine (from DIRECT_ROUTES) and each account's session state and governor use, so a session coming back from compaction knows the engines; and, loudly, when the log MCP server runs older code than the checkout, and which code files have uncommitted local changes (rule 163) |
| UserPromptSubmit | every turn | [`scripts/hooks/engines.ts`](../scripts/hooks/engines.ts) | the same engine line with the owner's prompt, only when an account's session state, its governor use or the MCP server's freshness changed |
| SessionStart | `startup\|resume\|clear\|compact` | [`scripts/hooks/knowledge.ts`](../scripts/hooks/knowledge.ts) | the knowledge base is there and how to search it and save to it, with how many chunks Redis holds, so a session looks things up before it guesses |
| SessionStart | `startup\|resume\|clear\|compact` | [`scripts/hooks/inbox.ts`](../scripts/hooks/inbox.ts) | anyone who wrote to a signed-in account's inbox since the last look (every platform's inbox, incl. X Chat, read in the background every 4 to 8 minutes, and what each account's live watcher pushed: X Chat's socket, Discord's gateway, Slack's websocket in every workspace, rule 123), said loudly so a reply is never missed; and, from each X account's local inbox store with no network, who wrote last and is waiting on a reply |
| UserPromptSubmit | every turn | [`scripts/hooks/inbox.ts`](../scripts/hooks/inbox.ts) | the same inbox check with each of the owner's prompts: a poll starts when one is due, and new messages from the last poll are put in front of the agent |
| PostToolUse | `Bash\|PowerShell\|Monitor\|mcp__log__.*` | [`scripts/hooks/inbox.ts`](../scripts/hooks/inbox.ts) | the same inbox check after a log tool or shell call, so a reply that lands mid-task is said at once |
| SessionStart | `startup\|resume\|clear\|compact` | [`scripts/hooks/queue.ts`](../scripts/hooks/queue.ts) | what every account's queue did since the last look (held, sent, cooling off, stopped), so a queue is never running out of the agent's sight (rule 109) |
| SessionStart | `startup\|resume\|clear\|compact` | [`scripts/hooks/useCases.ts`](../scripts/hooks/useCases.ts) | the play this session loaded, read from its own transcript, put back with the step it reached when the session comes back from compaction or resumes, and the context layer service started (rule 158) |
| UserPromptSubmit | every turn | [`scripts/hooks/useCases.ts`](../scripts/hooks/useCases.ts) | the play the owner's prompt asks for, matched against every use case's own "How the owner asks for it" phrases and title, named with getGuide to load it before anything is done (rule 158) |
| UserPromptSubmit | every turn | [`scripts/hooks/queue.ts`](../scripts/hooks/queue.ts) | the same queue events with each of the owner's prompts |
| PostToolUse | `Bash\|PowerShell\|Monitor\|mcp__log__.*` | [`scripts/hooks/queue.ts`](../scripts/hooks/queue.ts) | the same queue events after a log tool or shell call, so a held item or a cool-off is acted on at once |
| SessionStart | `startup\|resume\|clear\|compact` | [`scripts/hooks/xLive.ts`](../scripts/hooks/xLive.ts) | what X's own client shows on each X account right now (its unread notifications, DMs and X Chat, read through the account's one session the way x.com polls it), and every new like, retweet, reply, quote, mention or follow since this Claude session last looked (rule 109) |
| UserPromptSubmit | every turn | [`scripts/hooks/xLive.ts`](../scripts/hooks/xLive.ts) | the same X live state with each of the owner's prompts, only what is new for this session |
| PostToolUse | `Bash\|PowerShell\|Monitor\|mcp__log__.*` | [`scripts/hooks/xLive.ts`](../scripts/hooks/xLive.ts) | the same X live state after a log tool or shell call, so a reply on a post is answered mid-task |
| PreToolUse | `mcp__log__(discord\|slack\|instagram).*` | [`scripts/hooks/chatNames.ts`](../scripts/hooks/chatNames.ts) | a Discord, Slack or Instagram call that names its chat by a bare id is refused and told to pass the name (a person, a group, or "<server> #<channel>"), so the owner sees where every call goes (rule 154) |
| PreToolUse | `Bash\|PowerShell\|Monitor` | [`scripts/hooks/liveLogs.ts`](../scripts/hooks/liveLogs.ts) | a log-cli run that would hide its lines (piped through tail or head) is refused before it starts; a long one off a Monitor is told to start one (rule 26); any log action run by hand from a shell is refused and pointed at its MCP tool (rule 163) |
| PostToolUse | `Bash\|PowerShell\|Monitor\|mcp__log__.*` | [`scripts/hooks/pageState.ts`](../scripts/hooks/pageState.ts) | a browser landed on a known state (checkpoint, captcha, prompt) or a step failed: its resolver, at once |
| Stop | every turn | [`scripts/hooks/pageState.ts`](../scripts/hooks/pageState.ts) | the turn does not end while a browser sits on a state log-cli can resolve (rule 35) |

Around every turn, whatever is called: SessionStart (pageState.ts, storage.ts, engines.ts, knowledge.ts, inbox.ts, queue.ts, useCases.ts, xLive.ts), UserPromptSubmit (pageState.ts, storage.ts, engines.ts, inbox.ts, useCases.ts, queue.ts, xLive.ts), Stop (pageState.ts).

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
  Note over Hook: which commands run on the direct-API engine (from DIRECT_ROUTES) and each account's session state and governor use, so a session coming back from compaction knows the engines#59; and, loudly, when the log MCP server runs older code than the checkout, and which code files have uncommitted local changes (rule 163)
  Note over Hook: the knowledge base is there and how to search it and save to it, with how many chunks Redis holds, so a session looks things up before it guesses
  Note over Hook: anyone who wrote to a signed-in account's inbox since the last look (every platform's inbox, incl. X Chat, read in the background every 4 to 8 minutes, and what each account's live watcher pushed: X Chat's socket, Discord's gateway, Slack's websocket in every workspace, rule 123), said loudly so a reply is never missed#59; and, from each X account's local inbox store with no network, who wrote last and is waiting on a reply
  Note over Hook: what every account's queue did since the last look (held, sent, cooling off, stopped), so a queue is never running out of the agent's sight (rule 109)
  Note over Hook: the play this session loaded, read from its own transcript, put back with the step it reached when the session comes back from compaction or resumes, and the context layer service started (rule 158)
  Note over Hook: what X's own client shows on each X account right now (its unread notifications, DMs and X Chat, read through the account's one session the way x.com polls it), and every new like, retweet, reply, quote, mention or follow since this Claude session last looked (rule 109)
  matt->>Agent: a prompt
  Agent->>Hook: UserPromptSubmit
  Note over Hook: where every open browser is, with each of the owner's prompts
  Note over Hook: the same storage check with each of the owner's prompts (measured at most every 15 minutes)
  Note over Hook: the same engine line with the owner's prompt, only when an account's session state, its governor use or the MCP server's freshness changed
  Note over Hook: the same inbox check with each of the owner's prompts: a poll starts when one is due, and new messages from the last poll are put in front of the agent
  Note over Hook: the play the owner's prompt asks for, matched against every use case's own #quot;How the owner asks for it#quot; phrases and title, named with getGuide to load it before anything is done (rule 158)
  Note over Hook: the same queue events with each of the owner's prompts
  Note over Hook: the same X live state with each of the owner's prompts, only what is new for this session
  loop each tool call
    Agent->>Hook: PreToolUse
    Note over Hook: a Discord, Slack or Instagram call that names its chat by a bare id is refused and told to pass the name (a person, a group, or #quot;#lt;server#gt; ##lt;channel#gt;#quot;), so the owner sees where every call goes (rule 154)
    Note over Hook: a log-cli run that would hide its lines (piped through tail or head) is refused before it starts#59; a long one off a Monitor is told to start one (rule 26)#59; any log action run by hand from a shell is refused and pointed at its MCP tool (rule 163)
    alt a log run piped through tail/head
      Hook-->>Agent: refused (exit 2), run it live
    else
      Agent->>Tool: the call
      Tool-->>Agent: its result
      Agent->>Hook: PostToolUse
    Note over Hook: the same inbox check after a log tool or shell call, so a reply that lands mid-task is said at once
    Note over Hook: the same queue events after a log tool or shell call, so a held item or a cool-off is acted on at once
    Note over Hook: the same X live state after a log tool or shell call, so a reply on a post is answered mid-task
    Note over Hook: a browser landed on a known state (checkpoint, captcha, prompt) or a step failed: its resolver, at once
    end
  end
  Agent->>Hook: Stop
  Note over Hook: the turn does not end while a browser sits on a state log-cli can resolve (rule 35)
  alt a browser sits on a state log-cli clears
    Hook-->>Agent: decision block, with the state's resolver
  else nothing to clear, or a person's state
    Agent-->>matt: the answer
  end
```

Source: [`docs/diagrams/hooks.mmd`](diagrams/hooks.mmd).

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
  checkpointStart --> person
  automatedBehaviour["automatedBehaviour: #quot;We suspect automated behaviour#quot;"]
  page --> automatedBehaviour
  automatedBehaviour -->|"dismiss it"| nextautomatedBehaviour(["next state"])
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
  groupMembersList["groupMembersList: a group's People tab answered with more of its newest members: `GroupsCometMembersPageNewMembersSectionRefetchQuery` gave `new_members` edges, about 10 a call, each a profile with its bio, page category, followers and when they joined (99900000000001, inspect 20261024T060921 steps 04-21)"]
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
  checkpoint["checkpoint: a Facebook checkpoint"]
  page --> checkpoint
  checkpoint --> person
```

Source: [`docs/diagrams/pageStates.mmd`](diagrams/pageStates.mmd).

### Each command's usage

#### log launch

Start here: a guided menu to set log up (platforms, sign-ins, the account's browser and extensions), add an account, sign it in, check it and connect your agent (and the listing tools when Twenty is set up) Terminal only: prompts in a terminal (Clack). Call the commands it wraps directly.

```text
log launch [--setup] [--json]
```

#### log console

The local console: this machine's status, accounts, usage, events, AI client config and settings, as an interactive terminal console, as JSON per screen, or as the web console served on loopback (--web) MCP tools: `consoleStart`, `consoleConnections`, `consoleUsage`, `consoleEvents`, `consoleAiClients`, `consoleSettings`, one per form, with named fields.

```text
log console   (an interactive console in this terminal: Start, Connections, Usage, Events, AI clients and Settings, all read on this machine)
log console --web [--port <n>] [--noOpen]   (serves the web console on 127.0.0.1 in local mode and opens /console/start)
log console start [--json]
log console connections [--platform <p>] [--json]
log console usage [--days <1|7|30>] [--json]
log console events [--kind <kind>] [--status <recorded|succeeded|failed|unknown>] [--page <n>] [--pageSize <n>] [--json]
log console aiClients [--client <claudeCode|codex|opencode>] [--json]
log console settings [--json]
Everything is local: no sign-in, no team. Each screen reads the same src/console loader as the web console's /api/console endpoint.
```

#### log facebook listings

List the Twenty listings, by status, account or campaign MCP tools: `facebookListings`, one per form, with named fields.

```text
log facebook listings [--status <STATUS>] [--account <accountName>] [--campaign <campaignId>] [--json]
```

#### log facebook listing

Show one Twenty listing, or create one for an account from a JSON file MCP tools: `facebookListing`, `facebookListingCreate`, `facebookListingRemove`, `facebookListingRemoveLive`, `facebookListingSweep`, `facebookListingLint`, one per form, with named fields.

```text
log facebook listing <agencyListingId> [--json]
log facebook listing create --account <accountName> --file <listing.json> [--json]
log facebook listing sweep [--apply] [--json]   (every listing whose account is blocked (checkpoint, restricted, banned, dead, deactivated, or a wrong password) is marked ACCOUNT_LOST, and a campaign's copy goes to another account; a dry run unless --apply)
log facebook listing lint --file <listing.json> [--json]   (the copy rules on the file's copy versions, and whether it would publish; nothing is saved)
log facebook listing remove <agencyListingId|facebookListingId> [--live] [--bypass] [--now] [--json]   (delete it on Facebook through the recorded flow marketplaceListingDelete, then REMOVED in Twenty; a dry run unless --live)
The file: title, description, price, priceCurrency, category, condition (new|usedLikeNew|usedGood|usedFair), photos (paths or URLs), locationQuery ('City, State' with the state written out, 'Bethlehem, Pennsylvania', or 'City, Country': an abbreviation, zip or number is refused, rule 72), locationCity, locationCountry, locationPostalCode (kept, never typed), copyVersions ([{ id, title, description }], written by skills/listingCopy; the first is the ad's own title and description; each copy of the ad picks the one least like what is live in its city).
```

#### log facebook accounts

List the FACEBOOK accounts in Twenty: status, home, proxy, and whether each may run MCP tools: `facebookAccounts`, one per form, with named fields.

```text
log facebook accounts [--json]
```

#### log facebook account

Show one account, or set its status (banned/dead/restricted replace its campaign listings) MCP tools: `facebookAccountShow`, `facebookAccountResave`, `facebookAccountResetOpens`, `facebookAccountStatus`, one per form, with named fields.

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

#### log localAccount

Accounts kept in a local file instead of Twenty: add one, with the account's browser profile, pull every Twenty account in, or list them MCP tool: `localAccount` (`args` takes the same arguments).

```text
log localAccount add --platform <facebook|twitter|reddit|discord|linkedin|slack> --account <accountName> [--adsPower <profileId>] [--proxy <scheme://user:pass@host:port>] [--home <CC>] [--city <city>]
log localAccount list [--json]
log localAccount pull [--platform <p>] [--refresh] [--json]   (copies every account Twenty has, cookies and login included, into the file; an account already there is kept unless --refresh; each keeps its Twenty id, so listings and groups still find it)
A local account lives in ~/.logCli/localAccounts.json (LOG_LOCAL_ACCOUNTS moves it), not in Twenty. Every command finds it by its accountName, a local row winning over a Twenty row of the same name, and the session a run captures is saved back to the file. LOG_ACCOUNTS=local leaves Twenty out of accounts entirely.
```

#### log facebook lifecycle

Each account's place in its lifecycle (rule 35): status, state, what onboarding has left; `states` prints the machine MCP tool: `facebookLifecycle` (`args` takes the same arguments).

```text
log facebook lifecycle [--account <name>] [--json]
log facebook lifecycle states [--write]   (the machine's state tree; --write regenerates docs/lifecycle.md)
```

#### log facebook preflight

Before any browser opens, check each account will get through: home timezone, hours, proxy speed and country, the account's browser and its kernel, launches and host opens left, no session left open, its picture on disk MCP tool: `facebookPreflight` (`args` takes the same arguments).

```text
log facebook preflight [--account <accountName>] [--homes <US,CA>] [--noProxy] [--apply] [--json]
Before any browser opens: each account's home timezone, waking hours, proxy (country and speed), AdsPower profile and browser kernel, today's launches and host opens, a session left open, and its profile picture on disk.
--apply downloads the SunBrowser kernel each profile's user agent needs when it is missing, and waits for it. Nothing opens on Facebook.
```

#### log facebook doctor

Check python, facebook-camofox-client, Camoufox, Twenty, and which accounts may run MCP tool: `facebookDoctor` (`args` takes the same arguments).

```text
log facebook doctor [--json]
```

#### log facebook connect

Sign a Facebook account in through its proxy (the connect machine), save its cookies to Twenty MCP tool: `facebookConnect` (`args` takes the same arguments).

```text
log facebook connect --account <accountName> [--noPrompt] [--wait <seconds>] [--bypass] [--now]
```

#### log facebook profile

Set an account's profile picture and cover photo from its account record (dry run unless --live, rule 35) MCP tool: `facebookProfile, facebookProfileLive` (`args` takes the same arguments).

```text
log facebook profile setup --account <accountName> [--live] [--bypass] [--json]
```

#### log facebook host

Run an account's lifecycle in ONE browser kept open for its day, resuming where it left (rule 35); send it events; read its progress MCP tools: `facebookHostStart`, `facebookHostStartLive`, `facebookHostSend`, `facebookHostStatus`, one per form, with named fields.

```text
log facebook host start --account <accountName> [--live] [--likes] [--bypass] [--now] [--gapSeconds <n>] [--watchMinutes <n>]   (--live: profile, name, location; --likes: the warm-up's likes)
log facebook host send --account <accountName> <PERSON_DONE|PAUSE|RESUME|SHUTDOWN|LOST>
log facebook host status [--account <accountName>]
```

#### log inspect

Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29) MCP tools: `inspectStart`, `inspectDo`, `inspectDoLive`, `inspectRead`, `inspectMap`, `inspectGoal`, `inspectFinding`, `inspectSessions`, one per form, with named fields.

```text
log inspect start --account <accountName> [--goal <text>] [--url <the platform's own page>] [--bypass] [--now] [--noIdleMouse] [--detach]   (one session per account: two accounts can be open at once; --detach runs it as its own process and returns once it is open)
log inspect map [<runDir>] [--all]  (the recorded steps as states and transitions: flow.md, machine.json; default the latest run; --all collates every run)
log inspect do <goto <url>|snapshot|back|wait [s]|click <ref>|type <ref> <text>|press <key>|upload <ref> <file>|highlight <role> <name>|solve|signIn|code|pin|stop> [--live] [--goal <text>] [--timeout <s>] [--json] [--account <accountName>]   (--account picks the session when more than one is open; every step's internal API calls are read, and a step no known state names is read by SubQ against the goal, rule 73)
log inspect read <stepFolder> --account <accountName> [--goal <text>] [--json]   (read a recorded step again: its internal API calls, the page and the earlier steps, by SubQ when no known state names it)
log inspect goal [--set <text>] [--account <accountName>] [--json]   (the session's goal, whether a step's reading says it is reached, and its P.E.E. findings: what went wrong, the evidence, why, and how it was fixed; rule 73)
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

The warm-up, by platform and activity: `log <platform> warmup reel|feed|stages` (the account's browser primed with the activity, each step checked, the outline written) MCP tool: `warmup, warmupLive` (`args` takes the same arguments).

```text
log <platform> warmup <activity> [--account <a>] [--live] [--likes] [--bypass] [--now]   (record: the account's browser opened primed with the activity, each step checked, the outline written)
log <platform> warmup <activity> plan [--json]   (the activity's steps and what each must do)
log <platform> warmup persona --account <a> [--newPersona] [--seed <n>]   (the account's behaviour profile and real viewer, from the datasets; no browser, no SubQ)
log <platform> warmup reel plan [--reels 8-20] [--watch 4-25] [--skip 0.6] [--comments 0.3] [--profile 0.15] [--likes] [--seed <n>] [--json]   (a drawn Reels session)
log <platform> warmup reel run --account <a> [reel plan flags] [--live] [--likes] [--bypass]   (a drawn session, stopped at the first step that doesn't do what it should)
log <platform> warmup reel run --account <a> --persona [--newPersona] [--reels 8-20] [--trafficMb 1024] [--live] [--likes] [--bypass]   (the persona's For you feed: SubQ reads each reel, the orderer plans it from the pack and real viewer)
log <platform> warmup feed run --account <a> --persona [--posts 8-15] [--trafficMb 1024] [--live] [--likes] [--bypass]   (the home feed post by post: SubQ reads each post, a glance or a read and a like where the persona would, then the listings pages)
Platforms: facebook (reel, feed, stages).
log <platform> warmup stages plan
log <platform> warmup stages record --account <accountName> [--only feedBrowse,marketplaceBrowse] [--likes] [--bypass] [--now]
log <platform> warmup stages run --account <accountName> [--only …] [--likes] [--gapSeconds <n>] [--bypass] [--now]
log <platform> warmup stages log [--account <accountName>] [--lines <n>] [--follow [--seconds <n>]]
```

#### log facebook join

Join a Facebook group as one account, in its open browser: read the gate, --live presses Join; every step patches agencyGroups.joinSubmission MCP tool: `facebookJoin, facebookJoinLive` (`args` takes the same arguments).

```text
log facebook join group --account <accountName> --group <group url, id or name> [--live] [--json]
log facebook join group --account <accountName> --group <g> --show
log facebook join group --account <accountName> --group <g> --answer [--set <n>=<value>]... [--agree]   (Clack steps over the group's questions, or the same answers given here; saved to Twenty, never sent)
log facebook join group --account <accountName> --group <g> --fill [--live [--submit]]   (the draft into the group's dialog, step by step)
Every step in the browser runs inside the account's local hours (rule 18); --bypass skips that for one run, only when matt asked (rule 20).
The account's browser must be open (log inspect start --account <a>, or log facebook host start): a join is a step in it (rule 35).
```

#### log facebook read

Read a Facebook group's new posts and their comments, or its newest members, as one account, by hand: posts on the direct-API engine first, else in its open browser; only the group's cursor is saved to Twenty, the members to a file MCP tools: `facebookReadGroup`, `facebookReadGroupLive`, `facebookReadMembers`, one per form, with named fields.

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

Poll a Facebook group from one account, in its open browser, for a time or once: each poll's posts as one JSON line, OpenMagpie's records; --request answers OpenMagpie's facebook_group worker (#27, rule 63) MCP tool: `facebookPoll` (`args` takes the same arguments).

```text
log facebook poll <group url or id> <accountName> [<how long to poll: 30m, 2h>] [--bypass]
log facebook poll --request <request json>   (OpenMagpie's facebook_group worker: groups.search in, post records out as one JSON line; python/openMagpie/facebookWorker.py calls it)
One poll reads the group once in the account's open browser, posts only, nothing clicked, and prints one JSON line: the posts it saw, as OpenMagpie's records. With a time it polls every 5 minutes until the time is up, a line each.
Every poll runs inside the account's local hours (rule 18); --bypass skips that, only when matt asked (rule 20). --request never skips it.
The account's browser must be open (log inspect start for that account, or log facebook host start): a poll is a step in it (rule 35).
```

#### log facebook check

Check one account in its open browser: may it still sell, each listing's state on Selling (into Twenty), and its seller inbox's chats MCP tools: `facebookCheck`, one per form, with named fields.

```text
log facebook check --account <accountName> [--bypass] [--json]   (in the account's open browser: Marketplace status, each listing's state and clicks in the last 14 days on Selling into Twenty, the seller inbox's chats; nothing clicked)
```

#### log facebook scan

Read Marketplace > Selling live for one account and update its listings in Twenty MCP tool: `facebookScan` (`args` takes the same arguments).

```text
log facebook scan --account <accountName> [--json] [--bypass]
```

#### log facebook status

Open one Marketplace item page live and classify its status MCP tool: `facebookStatus` (`args` takes the same arguments).

```text
log facebook status <listingId> --account <accountName> [--json] [--bypass]
```

#### log facebook watch

Run the listing monitor (XState) for one account and print every step MCP tool: `facebookWatch` (`args` takes the same arguments).

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

Post one Twenty listing (dry run unless --live), printing every machine step MCP tools: `facebookPublish`, `facebookPublishLive`, one per form, with named fields.

```text
log facebook publish --listing <agencyListingId> [--live] [--json] [--formUrl <url>] [--bypass] [--now]
Dry run unless --live: fills and checks everything, never clicks Publish.
The listing, its account and the account's proxy all come from Twenty.
--bypass skips only the account's waking hours (rule 18); every other gate still runs.
--now skips only the 10-minute launch gap (rule 24); the 8 launches a day still hold.
```

#### log facebook campaign

Put one ad on N accounts in one place, replace lost accounts, publish the campaign MCP tool: `facebookCampaign, facebookCampaignLive` (`args` takes the same arguments).

```text
log facebook campaign fill --campaign <agencyCampaignId> --from <agencyListingId> --accounts <n>
log facebook campaign heal --campaign <agencyCampaignId>
log facebook campaign run  --campaign <agencyCampaignId> [--live] [--bypass]
log facebook campaign show --campaign <agencyCampaignId> [--json]
```

#### log facebook conversations

List buyers' Marketplace conversations in Twenty, newest first, by account or listing MCP tools: `facebookConversations`, one per form, with named fields.

```text
log facebook conversations [--account <name>] [--listing <agencyListingId>] [--json]
```

#### log facebook conversation

One conversation: show its messages, mark read, set its lead status, link its listing, or store a scanned thread MCP tools: `facebookConversationShow`, `facebookConversationRead`, `facebookConversationLead`, `facebookConversationLink`, `facebookConversationRecord`, one per form, with named fields.

```text
log facebook conversation show <id> [--json]
log facebook conversation read <id>
log facebook conversation lead <id> <NEW|CONTACTED|QUALIFIED|BOOKED|LOST|SPAM>
log facebook conversation link <id> --listing <agencyListingId>
log facebook conversation record --account <name> --file <threads.json>
```

#### log facebook messenger

Messenger's PIN for the account's encrypted chats: asked in a Clack prompt, kept in Twenty, never printed Terminal only: asks matt for the Messenger PIN in a Clack prompt (masked). He runs `log facebook messenger pin --account <a>` in a terminal.

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

Read a run's raw HAR (any browser driver) and its scripts with offline rea; --docs builds every platform's client docs, rea reading each request's code. No browser. MCP tool: `facebookCapture` (`args` takes the same arguments).

```text
log facebook capture --har <path> [--out <dir>] [--noRea] [--json]
log facebook capture --settle <runCaptureDir>  (what each run starts in the background: rea reads its capture, split per step)
log facebook capture --docs [--noRea]  (every run's requests → docs/platforms/<platform>/, one doc per request, rea reading each one's slice: Facebook's by its modules, every other platform with a browser path by the call sites its bundles hold for each request)
The HAR is the one Playwright writes from the account browser that ran. It is copied raw, and rea reads it. No browser opens.
```

#### log runs

The recorded runs on this machine, and pruning the ones rea settled and the request docs hold, keeping each one's findings and domains MCP tools: `runsList`, `runsExchanges`, `runsPrune`, `runsSpace`, one per form, with named fields.

```text
log runs [list] [--json]   (every recorded run: its size, settled by rea, in the request docs, and why it is kept or that it may go)
log runs exchanges   (takes every recorded step's internal API calls, what was sent and what came back, out of its HAR into exchanges.json, for every run still on disk; prune does it first too)
log runs prune [--before <YYYY-MM-DD>] [--apply]   (deletes each analysed run, started before the day when given, after taking out every step's exchanges, keeping its findings.md, steps.jsonl, settle.json, every step's exchanges.json, reading.json and readingState.json, its goalFindings and its requests by domain; a dry run unless --apply)
log runs space   (the size of ~/.logCli/runs and the disk's free space, as the storage hook says them)
```

#### log storage

Check that log.db's typed tables are exactly what its events derive, and rebuild them from the events MCP tools: `storageVerify`, `storageRebuild`, one per form, with named fields.

```text
log storage verify [--json]   (replays every event in ~/.logCli/log.db into a scratch copy and compares each typed table, row by row, with the live one; nothing is changed)
log storage rebuild [--apply] [--json]   (clears the typed tables (messages, attachments, chats, identities, memberships, interactions) and replays every event into them in order, in one transaction; a verify unless --apply)
The events are the record: every typed row is derived from them, so a rebuild loses nothing (docs/storageAgainstTheBook.md, item 2).
```

#### log timing

Where the time goes in every call: p50, p95 and p99 per tool and per stage, from the timings every call stores in log.db, or one call as a waterfall MCP tools: `timing`, one per form, with named fields.

```text
log timing [--tool <name>] [--hours <n>] [--stages <n>] [--json]   (p50, p95 and p99 for every tool call, and for every stage inside it: the guards, the voice gate, each fetch, the Python start, the session host's queue, lock, spacing and governor, each platform request; newest --hours, default 24)
log timing --call <callId> [--json]   (one call as a waterfall: every stage in order, when it started and how long it took; the id is on the call's ▶ and ■ lines in the live log)
```

#### log inbox

Claim a chat before acting on it, release it, list the live claims, and read the log of every action taken in a chat MCP tools: `inboxClaim`, `inboxRelease`, `inboxResume`, `inboxWaiting`, `inboxClaims`, `inboxActions`, one per form, with named fields.

```text
log inbox claim --platform <twitter|discord|slack|instagram> --account <a> --chat <conversationId|handle> [--event <eventId>] [--json]
log inbox release --platform <p> --account <a> --chat <conversationId|handle> [--json]
log inbox claims [--json]
log inbox resume --platform <p> --account <a> --by <who> [--json]
log inbox actions [--platform <p>] [--account <a>] [--chat <conversationId|handle>] [--limit <n>] [--json]
log inbox waiting [--platform <p>] [--account <a>] [--limit <n>] [--oldest] [--json]
Only the session that claims a chat acts on it (rule 133). Every message the push channels bring in has an event id (shown in >>> NEW MESSAGE). claim takes the chat for this session for 10 minutes before you draft or send; a second session is refused (chatClaimedElsewhere). Every send claims the chat itself and releases it once it is sent, interrupted or failed, so two sessions never answer the same chat. A claim held by a session that ended frees itself. resume is matt's go-ahead after a refused catch-up (rule 94): the account's gap opens again and its owner catches up through its own session within 30 s; only when the owner says so. claims lists who holds what; actions is the log of every claim, refusal, send and release, oldest first, to search what was already done in a chat before acting. waiting is who wrote last on every platform, read from log.db and nothing else: each chat's messages in time order (never the order they were stored in, since a backfill stores older messages later), one person's chats judged together (an X user's old DM and X Chat), a message mirrored into the other side counted once as whoever sent it first, reactions, read markers and call notices never counted as the last word. It lists the people waiting on a reply, then apart the ones who reacted to your last message (a follow-up), newest first unless --oldest.
```

#### log media

Turn every image, meme and video into text any model reads, kept in the .db with a small preview, so replies read what was sent MCP tools: `mediaDescriber`, `mediaDescribe`, `mediaStatus`, `mediaView`, one per form, with named fields.

```text
log media describer [--json]
log media describe <path> [--wait <seconds>] [--json]
log media status [--json]
log media view <id> [--json]
Every image, meme, gif and video sent or received becomes text any model can read, kept in log.db with a small preview (rules 138, 169). describer is the one warm process per machine (the session hook starts it; a second is refused): it loads the vision model once (onnx-community/LFM2.5-VL-450M-ONNX, q4, on this machine's transformers.js, the first of an ordered list that falls back to the next), takes one item at a time from a queue of at most 20 (the overflow waits and is described when there is room), and for each keeps its size, length, hash and a small JPEG preview (a contact sheet of frames for a video), describes an image with its text word for word, and a video scene by scene (ffmpeg scene changes, one keyframe per scene with its on-screen words, its sound transcribed through AssemblyAI) as timestamped lines, labels it, stores its jina-embeddings-v5-omni vector, then deletes the engine's downloaded copy, so no media file is kept. A voice note shows its transcript. describe puts one local file in the queue and waits for its description. status shows the queue. view shows one item's line, and over MCP returns its preview as an image for a model that can see.
```

#### log browsers

Where every open browser is: its page, the known page state it sits on, the call that resolves it, and what only the owner can clear (rule 35) MCP tools: `browsers`, one per form, with named fields.

```text
log browsers [--json]   (every open browser: its step and page, the known page state it sits on, the call that resolves it, and what only the owner can clear)
```

#### log browser

One account's live browser: whether it needs a person to sign in, in the window on this machine or inline from a remote runtime MCP tools: `browserView`, one per form, with named fields.

```text
log browser view --account <accountName> [--json]   (the account's live browser: whether it needs a person to sign in, the page state and its revision; when log runs on the person's own machine the sign-in is in the browser window there, and from a remote runtime an MCP Apps host shows it inline through browserView)
Where the runtime is comes from LOG_BROWSER_VIEW_LOCATION (local or remote), which the stdio MCP, the HTTP MCP and the hosted bridge each set for their own process.
```

#### log report

The numbers behind a report, read from log.db only (who messaged an account and how often, by source), for the MCP report view MCP tools: `reportData`, one per form, with named fields.

```text
log report data --source twitterDmsBySender [--account <accountName>] [--since <7d|4w|12h|2026-11-01>] [--limit <n>] [--json]
The numbers behind a report, read from log.db only: no platform call, no governor use, nothing sent. twitterDmsBySender counts who messaged the account in its one-to-one DMs (the old DM thread and the Chat thread with one person counted as one, a message mirrored into both counted once; group chats left out), most messages first, with each person's first and last message time, the totals and the count per day. It holds only what log.db has: run twitterDms first if the inbox may be behind.
--account keeps one account (default every account the source covers in log.db). --since keeps messages from that date or span on. --limit is how many people to list, default 20, at most 200; the totals count everyone.
Show it with the MCP tool report (getGuide({ topic: "ui" })): an MCP Apps host draws it inline, any other host gets markdown with unicode bars.
```

#### log job

Follow or stop a long MCP run: each runs as a job when it outlasts its call's wait MCP tools: `jobStatus`, `jobCancel`, `jobList`, one per form, with named fields.

```text
log job status <jobId> [--afterLine <n>] [--waitMs <ms>] [--json]   (a long MCP run: its status, the lines after afterLine, and its result once it ends; waits up to waitMs, default 10000, for something new)
log job cancel <jobId>   (stops it at its next browser step; never once Publish is clicked, rule 8)
log job list [--json]   (the latest jobs)
```

#### log mcp

This server's MCP sign-ins over OAuth (through Twenty, the owner only): list the clients, revoke them Terminal only: manages who may sign in to this server's MCP (OAuth through Twenty). matt runs `log mcp clients` or `mcp revoke <clientId|all>` in a terminal on the server.

```text
log mcp clients [--json]   (who signed in to this server's MCP over OAuth: each client, when it was last used, its live tokens, and whether this server has an owner)
log mcp revoke <clientId|all>   (the client's tokens stop working at once; it must sign in through Twenty again)
```

#### log login

Only for a team on Twenty: sign in to its Twenty through its sign-in app (OAuth). Local accounts need no sign-in, and without Twenty set up it says so Terminal only: opens a browser for Twenty OAuth and waits for it. Run `log login` in a terminal.

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

Check that X still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty MCP tools: `twitterSessionCheck`, `twitterSessionWebClient`, one per form, with named fields.

```text
log twitter session check --account <accountName> [--json]
log twitter session webClient --account <accountName> [--json]   (loads x.com/home through the account's one X session, as twikit already does to sign its calls, and saves the page and every script it lists from abs.twimg.com to ~/.logCli/twitter/<account>/webClient/<time>, reads spaced 0.8 to 2.5 s, so rea can read X's own signed-in client: what its composer sends; rule 105)
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
log twitter dms --account <accountName> [--limit <n>] [--waiting] [--with <handle>] [--conversation <id>] [--full] [--force] [--json]
Reads the account's X direct messages on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Sends nothing and marks nothing read.
Without --conversation it syncs the inbox the way X's own chat app does (dm-core): the first read takes the whole X Chat inbox (GetInitialXChatPageQuery, then GetInboxPageRequestQuery pages) and the old DM inbox (dm/inbox_initial_state, then dm/inbox_timeline pages, 1.5 s apart) and keeps them in ~/.logCli/twitter/<account>/inboxSync.json with the newest event's sequence id; every read after that asks X only for what is newer (GetMessageEventsPageQuery from that sequence id, beside one dm/inbox_initial_state), unlocks the PIN and decrypts only when something is new, opening just those conversations' keys (GetInboxPageConversationDataQuery), and keeps each event once by its id. --full reads everything again. Each read saves its conversations for log search and updates the search index in the background with only the chunks that changed. It then lists the newest conversations first, one row per person (their old DM thread and X Chat thread merged): who, when, the last message from either and whether it was yours. --waiting keeps only the ones whose last message isn't yours, the people waiting on a reply, and lists apart the ones that opened your last message, by reacting to it or reading it without replying (read receipts, where the person keeps them on): so each is a follow-up to send, not a reply they're waiting on (--json: followUps). --conversation <id> reads one conversation's messages, oldest first: a legacy id (two user ids joined by a dash) through dm/conversation, an X Chat id (joined by a colon) the same way --with reads it, never the whole inbox.
--with <handle> reads everything with one person by their handle and nobody else: their user id, their legacy thread (dm/conversation) and their X Chat thread (read the way X's own chat app opens a chat, from its dm-core: GetInboxPageConversationDataQuery for that one conversation, then GetConversationPageQuery from the oldest message held, its fetchOlderMessages, up to 5 pages 1.5 s apart while X says there is more), merged into one timeline, oldest first, a message mirrored into both shown once. It never reads the whole inbox. A 429 stops the read with nothing retried, as X's app does (it retries only 5xx), and pauses the account's governor (rule 94). X Chat (encrypted DMs) is opened with the account's X Chat PIN from Twenty (`log twitter chat pin`), recovered through Juicebox by the vendored chat-xdk; without a PIN its text stays encrypted. An old DM thread (<a>-<b>) and its X Chat thread (<a>:<b>) with one person are one conversation: X shows them in the same place, and a dm sent through the old DM API shows in their X Chat too. A sent answer is delivered whichever conversation id it names: never resend it and never call it the wrong inbox. X's own answer decides: the session check first, then the inbox's answer. --limit is how many conversations (or messages) to show, default 20, at most 200.
```

#### log twitter chat

X Chat's PIN for the account's encrypted DMs: asked in a Clack prompt, kept in Twenty, never printed Terminal only: asks matt for the X Chat PIN in a Clack prompt (masked). He runs `log twitter chat pin --account <a>` in a terminal.

```text
log twitter chat pin --account <accountName> [--show]
log twitter chat watch --account <accountName> [--seconds <n>] [--inbox] [--json]
Saves the account's X Chat PIN (the 4-digit code X asks for to open encrypted DMs) to Twenty, asked twice in a masked Clack prompt and never printed or passed as a flag. It is checked first: the direct-API engine (no browser, no proxy, rule 80) unlocks the account's keys with it through Juicebox (a wrong PIN uses one of X's limited guesses), and only a PIN that opens them is saved. `log twitter dms` uses it to recover the account's X Chat keys through Juicebox (vendor/chatXdk) and read the encrypted messages. --show says only whether one is set.
watch keeps one socket open to X Chat, the way X's own chat app does (read with rea from X's shipped code, issue #68): a token from GenerateXChatTokenMutation, wss://chat-ws.x.com/ws, a KeepAlive every 30 s, a fresh token and a new socket when it drops. X pushes each message the moment it lands, so nothing is polled and no inbox read can hit X's 429. Each message is decrypted with the saved PIN and printed as it arrives (who, when, what they said). --inbox also hands each new message from someone else to the inbox hook, which puts it in front of the agent with what to do next. --seconds stops it after that long; without it, it watches until stopped.
```

#### log twitter cookies

Add or refresh an X account in Twenty: its session cookies from a masked prompt, checked against X, and its copy style Terminal only: asks for an account's session cookies in a Clack prompt (masked) and checks them with the platform before saving: an X account's auth_token, ct0 and twid, a LinkedIn account's, or a Slack account's d. Run `log twitter cookies save --account <handle>`, `log linkedin cookies save --account <publicId>` or `log slack cookies save --account <name>` in a terminal.

```text
log twitter cookies save --account <handle> [--style <copyStyle>] [--name <label>]
Saves an X account's session to Twenty from a masked Clack prompt: its auth_token, ct0 and twid cookies (twid carries the account's id), copied from a browser signed in to x.com, never passed as flags or printed. They are checked first: the direct-API engine (no browser, no proxy, rule 80) pings X with them, and only cookies X accepts for that same handle are saved. A handle Twenty doesn't have yet gets a new TWITTER socialAccounts row (rule 13); one it has gets its cookies replaced. --style sets the account's copyStyle, the writing style every send and queue check holds its copy to (empty: house). The account's governor starts under ~/.logCli/twitter/<handle>.
```

#### log voice

Gate a draft against the owner's own writing guide with SubQ before anything is sent as the owner, sending nothing MCP tools: `voice`, `voiceAiIndex`, `voiceIndex`, one per form, with named fields.

```text
log voice --to <handle> [--text "<draft>"] [--context "<what they said>"] [--with <person or chat>] [--spoken] [--json]
log voice aiIndex [--json]   (builds the AI tells index: every literal phrase in vendor/aiTells, tbhb/vale-ai-tells first and then the other lists, embedded with Jina (JINA_API_KEY), with the owner's own replies from the voice index measured against it for their p50 and p99 closeness, and the vale rules they use themselves muted; the gate builds it itself when it is missing or older than the voice index; rule 137)
log voice index [--json]   (builds the owner's voice from every conversation log search already saved, reading nothing new: each of the owner's replies paired with what was said just before it, embedded with log search's own model, and a profile per chat, person and platform counted from the owner's own messages)
Gates a draft before anything is sent as the owner: SubQ reads it against the owner's own writing guide (the owner's writing style file, built from their own posts) and the dms they wrote themselves, and answers whether it sounds like they typed it (voice, 0.8 to pass), whether it answers what they said (--context) or something specific about them, whether it reads like a mate texting, and, to someone the owner has never talked with, whether it is only a relevant opener with no ask or pitch (openerOnly). A phrase the owner never says (hit home, big swing, spot on, felt that…) fails it outright. Sends nothing.
--with names the chat or person the way the owner says it ("the log group", a first name, a handle): log finds the owner's real replies to things like --context, from that chat first, then that person, then that platform, then anywhere, and how they write there (length, case, punctuation, their words). Without --text it shows them to draft from; with --text the gate also asks whether the draft reads like their real replies there (toThem, 0.7 to pass). Every gate also reads their nearest real replies, closest wording and style across all their conversations, every platform, beside the chat's own, never the writing guide alone.
--spoken gates a voice note: it is graded as said out loud, so its length and punctuation never count against it, and it must build on what they are talking about across the whole chat, adding to it, never repeating what the owner already told them (buildsOn, 0.7 to pass, rule 137). Every voice note send is gated this way.
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
Kinds: rule, section, skill, doc, infra, memory, pageState, account, note. Twenty (your own server, reached over a private network) holds every article and can be edited there; Redis 8 holds the search index: BM25 keyword and HNSW meaning (local all-MiniLM-L6-v2) fused with reciprocal rank fusion. Secrets are scrubbed before anything is written.
```

#### log runtime

Pair this workspace with hosted log and keep its outbound bridge open, so the team's console and AI clients run their requests here Terminal only: pairs this workspace with hosted log and keeps its outbound bridge open as a long-lived service. Run `log runtime init --origin <url>`, `log runtime pair --token <t>` and `log runtime connect` in the workspace's terminal or its service manager.

```text
log runtime init --origin <https://app.log.listeningkit.com> [--json]   (makes this workspace's private pairing proof and prints the challenge hash to paste into the console)
log runtime pair --token <pairing token> [--json]   (redeems the console's one-time pairing token and saves the runtime credential privately)
log runtime connect   (keeps the outbound bridge open: runs each signed request from the team's console or AI client here, journals it in log.db, reconnects on its own)
log runtime status [--json]   (which workspace this runtime is paired to, never the credential)
```

#### log memelord

The Memelord extension: search memes for a moment, read one template, see what is trending, list the image tools (free tools only) MCP tools: `memelordSearch`, `memelordTemplate`, `memelordTrending`, `memelordTools`, `memelordTaste`, one per form, with named fields.

```text
log memelord search "<what the moment is>" [--type meme|video|sticker] [--method context|combined|media|fulltext|fuzzy] [--limit <n>] [--json]
log memelord template <id> [--json]   (one template: its name, media url, text slots and what it means)
log memelord trending [--limit <n>] [--media image|video] [--json]   (what is trending now, with its cultural context)
log memelord tools [--category imageToImage|imageTextToImage|textToImage] [--json]   (the catalog of one-shot image tools; log never runs them)
log memelord taste [--build --from <posts.json>] [--json]   (the owner's meme taste: the styles they named and the memes they have sent, each read by SubQ from its picture; --build reads a file of their X media posts)
Search ranks what it finds by matt's taste (--noTaste turns it off): SubQ reads each template's picture against the styles he named (deep fried, larping, streamer reacts like FlightReacts, Zias and Bloo, shitposts) and the memes he has sent, and the taste line leads the answer.
Memelord is an extension (docs/extensions/memelord.md): only its four free discovery tools are reachable from log, so nothing here spends money (rule 41). The key is MEMELORD_API_KEY in .env.local. A meme goes out on Discord as its media url on a line of its own, which Discord shows inline.
```

#### log treg

The treg extension: find an endpoint by the job, read it, and call it with the key injected server-side (free ones run, priced ones only when the owner asked) MCP tools: `tregSearch`, `tregGet`, `tregCall`, `tregCallLive`, one per form, with named fields.

```text
log treg search "<what you want done>" [--limit <n>] [--json]   (treg's catalog, found by the job: each endpoint's id, what it does and its price)
log treg get <endpointId> [--json]   (one endpoint in full: its price, its params and a call that works)
log treg call <endpointId> [--params '<json object>'] [--path <path>] [--method <GET|POST>] [--data '<body>'] [--await] [--maxItems <n>] [--fields <a,b>] [--where <key=value>] [--raw] [--approvedBy <who>] [--live] [--json]   (calls it through treg, the key injected server-side: a free endpoint runs; a priced one is a dry run that says its price unless --live with --approvedBy; the answer drops treg's raw copy unless --raw, and --maxItems, --fields and --where trim every list in it)
treg is an extension (docs/extensions/treg.md): every lookup comes from an external source through it (rule 53), and nothing that costs money runs unless matt asked (rule 41). It runs the treg CLI on this machine (TREG_BIN moves it); treg's balance is in log balance.
```

#### log balance

Every paid provider log calls, with what is left and which are out of credit MCP tools: `balance`, one per form, with named fields.

```text
log balance [--provider <name>] [--json]
Every paid provider log calls, with what is left: subq, jina, inworld, fishAudio, assemblyAi, parallel, treg, twoCaptcha, byteful.
A provider with a balance API (Jina, Fish Audio, treg, 2Captcha, Byteful) is read from it. One without one (SubQ, Inworld, AssemblyAI, Parallel) shows its last answer to a real call, which log keeps for every call (the ledger table in ~/.logCli/log.db (kind providerAnswer)). A provider that answered it is out of credit shows outOfCredit, so a failing voice note or gate is seen as money, not a bug.
Reading balances spends nothing (rule 41). Topping up is matt's: never done from log.
```

#### log governor

Read every platform account's governor count, and put one back to 0 when the owner says so, recorded in log.db MCP tools: `governorShow`, `governorReset`, one per form, with named fields.

```text
log governor show [--platform <p>] [--json]
log governor reset --platform <p> --account <accountName|all> --by <who> [--reason <text>] [--json]
Every platform account's governor counts what it sent X, Discord, Slack, Instagram, Reddit, LinkedIn or Facebook today: requests (500 a day), writes and this hour's requests. show reads them. reset puts an account's requests, writes and hour count back to 0, only when the owner says so (rule 168): the count is written back, read again to prove it holds, and the reset is a row in log.db's ledger (kind governorReset) with who said it and what the count was. A cooldown after a block is kept: nothing resumes on a blocked account until matt says so (rule 94), and the platform's own answer still decides (rule 73).
```

#### log sessions

Check every account's saved session through its platform's own answer, with the next step to sign each one back in MCP tools: `sessionsCheck`, one per form, with named fields.

```text
log sessions check [--platform <p>] [--account <accountName>] [--json]
Checks every account's saved session through its platform's own check (X, Discord, Instagram, Slack, Reddit, LinkedIn), one account after another, and says for each: signed in, needs signing in (a 401, or no session saved), stopped (the platform refused: nothing retries, rule 94) or unknown. An account that needs signing in comes with its next step: its own browser opened on the platform's sign-in page for the owner (log inspect start; closing it saves the new session), or X's cookie prompt. Facebook is checked in its browser, and a deactivated account is skipped. Each result is also the console's last check for that account, so the console, the CLI and the MCP tool sessionsCheck say the same. Sends nothing.
```

#### log chats

List an account's chats on its own platform, the platform taken from the account MCP tools: `chatsList`, one per form, with named fields.

```text
log chats list --account <account> [--space <space>] [--limit <limit>] [--platform <p>] [--json]
list: List an account's chats on its own platform, the platform taken from the account. It runs that platform's own command with the inputs renamed to its flags (chatsList), so the answer is that command's answer.
Platforms: Facebook, X, Discord, Slack, Instagram.
The platform comes from the account: one account by that name gives its platform, two give platformAmbiguous (give --platform), none gives accountNotFound. A platform without the capability answers capabilityMissing with the platforms that have it, and an input its command doesn't take answers inputUnsupported. Nothing is contacted before that. log chats only reads.
```

#### log messages

Read one chat's messages on the account's own platform, the platform taken from the account MCP tools: `messagesRead`, one per form, with named fields.

```text
log messages read --account <account> --chat <chat> [--space <space>] [--limit <limit>] [--platform <p>] [--json]
read: Read one chat's messages on the account's own platform, the platform taken from the account. It runs that platform's own command with the inputs renamed to its flags (messagesRead), so the answer is that command's answer.
Platforms: Facebook, X, Discord, Slack, Instagram.
The platform comes from the account: one account by that name gives its platform, two give platformAmbiguous (give --platform), none gives accountNotFound. A platform without the capability answers capabilityMissing with the platforms that have it, and an input its command doesn't take answers inputUnsupported. Nothing is contacted before that. log messages only reads.
```

#### log clone

the owner's voice, cloned once per provider (Inworld or Fish Audio) from their own voice notes, and words said in it to a local file MCP tools: `cloneVoice`, `cloneSpeak`, one per form, with named fields.

```text
log clone voice [--provider inworld|fishAudio] [--from <file>[,<file>]] [--apply] [--replace] [--json]   (the owner's voice, cloned once per provider from their own voice notes, or from recordings of their own they name with --from, each one's words read from a .txt beside it; without --apply it lists the recordings it would use; --replace makes it again and keeps the old voice id under previous)
log clone speak --text "<words>" [--provider inworld|fishAudio] [--model <model>] [--format mp3|wav] [--json]   (the words in his cloned voice, to a file under ~/.logCli/voiceNotes; nothing is played or sent)
Voice cloning is provider-agnostic (docs/extensions/voiceClone.md): the provider is --provider, else LOG_VOICE_PROVIDER in .env.local, else inworld. Each provider is an extension of its own (src/extensions/inworld, src/extensions/fishAudio) behind one interface (src/extensions/voiceClone). The clone is made only from the voice notes matt sent himself (fromMe in the conversation store or his ownMessage in the .db), the shortest first, within the provider's limit (Inworld 3 to 30 s, Fish 10 to 60 s). Each provider's voice id is kept in log.db. A clone speaks with the provider's preferred model (Inworld inworld-tts-2, which takes emotion tags), else its cheapest, unless --model says otherwise, at LOG_VOICE_SPEED (default 1.15). The clone is made in matt's accent: LOG_VOICE_ACCENT (default Irish) as its description and LOG_VOICE_LANGUAGE (default en-IE, en-GB when Inworld refuses it) as its language, with each sample's AssemblyAI transcript when ~/.logCli/transcripts has one; no accent instruction is sent with the text. Every spoken file is shaped like matt's own voice notes (his room tone from his notes, phone squash, mic drift, saturation; breaths on inworld-tts-2) and listened back with AssemblyAI: a lexicon word said wrong is refused spokenMismatch, an acronym not in the lexicon pronunciationUnknown. A voice note goes out only when matt asks for one: log discord voice, log instagram voice or log slack voice (rules 142, 143, 145, 146, 147).
```

#### log transcribe

Transcribe every voice note in the saved X and Discord conversations with AssemblyAI, written into the conversation store for search, voice and SubQ MCP tools: `transcribe`, `transcribeFile`, one per form, with named fields.

```text
log transcribe [--platform twitter|discord] [--account <a>] [--list] [--noIndex] [--json]
log transcribe file <path> [--json]   (one audio file, transcribed and kept by its hash)
Transcribes every voice note in the saved conversations with AssemblyAI (upload, transcript, polled until done) and writes each into the conversation store as (voice note: "<what was said>") in place of its (audio: <name>) marker, so log search, voice and SubQ matrices see what was said. X voice notes come from the X Chat files the account's one session saved, and a missing one is fetched through that session (the conversation read again, its audio events reopened). Discord voice notes are found with Discord's own sound search, one chat at a time through log's Discord engine, and each file is fetched from its fresh attachment url there; any refusal stops it (rule 94). Each transcript is kept once by its file's hash in ~/.logCli/transcripts, so nothing is sent to AssemblyAI twice. The search index is then updated with what changed (--noIndex skips it).
--list only lists the voice notes the store holds and which have their file, calling nothing. The key is ASSEMBLYAI_API_KEY or ASSEMBLY_AI_KEY (the environment, .env.local, ~/.buzz/.env.local or ~/filmcraft/.env.local), never printed; without it the command refuses with assemblyAiKeyMissing.
```

#### log twitter followers

Read an X account's own followers on the direct-API engine, sending nothing MCP tools: `twitterFollowers`, one per form, with named fields.

```text
log twitter followers --account <accountName> [--limit <n>] [--json]
Reads the account's own followers on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80), newest first: handle, name, bio, location, follower and post counts, whether they take DMs. Sends nothing. Each follower's profile is kept in log.db (identityProfiles), so report draws it later with no X call.
X's own answer decides: the session check first, then X's followers list, 100 a page, 1.5 s apart. --limit is how many to read, default 200, at most 4000.
```

#### log twitter notifications

Read who liked, reposted, replied to, quoted or followed an X account, new and historical, kept locally, sending nothing MCP tools: `twitterNotifications`, one per form, with named fields.

```text
log twitter notifications --account <accountName> [--type likes|reposts|replies|quotes|follows|all] [--since <date>] [--post <id|url>] [--full] [--pages <n>] [--stored] [--limit <n>] [--json]
Reads the account's X notifications on the direct-API engine through its one X session, the engine host (rule 105: no session of its own; no browser, no proxy, rule 80) and keeps them in ~/.logCli/twitter/<account>/notifications.json: one row per person per thing they did (like, repost, reply, quote, follow, mention), with which of the account's posts it was on and when. Sends nothing.
Without --full it reads only what is new: the newest page, then older pages until it meets rows already kept (the first run reads up to 5 pages). --full then pages back through the history from where the last --full stopped, as far as X gives, at most --pages pages a run (default 25). The read is one engine call (rule 104: one call per account at a time); its pages are 40 notifications, 4 to 11 s apart, each through the account's governor; a 429 or a governor stop ends the read and keeps what came.
--stored answers from what is kept, calling nothing. --type, --since, --post and --limit (default 50 shown, at most 5000) narrow what is shown; --json gives the rows, counts by kind and the people who engaged most.
```

#### log twitter reply

Reply to one post on X with approved copy, on the direct-API engine; a dry run unless --live MCP tools: `twitterReply`, `twitterReplyLive`, one per form, with named fields.

```text
log twitter reply --account <accountName> --tweet <postUrl> --text "<copy>" [--media <file>[,<file>]] [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]
Reply to one post on X with approved copy, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's create answer decides: a tweet id is sent, an empty result is a drop (nothing posted, usually the author's reply limits). Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
```

#### log twitter quote

Quote one post on X with approved copy, on the direct-API engine; a dry run unless --live MCP tools: `twitterQuote`, `twitterQuoteLive`, one per form, with named fields.

```text
log twitter quote --account <accountName> --tweet <postUrl> --text "<copy>" [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]
Quote one post on X with approved copy, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's create answer decides: a tweet id is sent, an empty result is a drop. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
```

#### log twitter post

Make one original post on X with approved copy and optional media (a video, a gif or up to 4 images), on the direct-API engine; a dry run unless --live MCP tools: `twitterPost`, `twitterPostLive`, one per form, with named fields.

```text
log twitter post --account <accountName> --text "<copy>" [--media <file>[,<file>]] [--approvedBy <who>] [--skipStyleCheck] [--force] [--live] [--json]
Make one original post on X with approved copy and optional media (a video, a gif or up to 4 images), on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
Each file is uploaded first (a video in chunks, then X's own processing status must say succeeded before the post is made), then the post is created with the media ids. X's create answer decides: a tweet id is sent, an empty result is a drop and nothing was posted. A file X refuses stops it before anything is posted. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
```

#### log twitter like

Like one post on X, on the direct-API engine; a dry run unless --live MCP tools: `twitterLike`, `twitterLikeLive`, one per form, with named fields.

```text
log twitter like --account <accountName> --tweet <postUrl> [--approvedBy <who>] [--force] [--live] [--json]
Like one post on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's favorite answer decides: Done (or already liked, code 139) is sent. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
```

#### log twitter list

The X account's own lists: show them, make one, put someone on one; changes are dry runs unless --live MCP tools: `twitterListShow`, `twitterListCreate`, `twitterListCreateLive`, `twitterListAdd`, `twitterListAddLive`, one per form, with named fields.

```text
log twitter list show --account <accountName> [--json]
log twitter list create --account <accountName> --name <name> [--description <text>] [--private] [--approvedBy <who>] [--live] [--json]
log twitter list add --account <accountName> --list <name|id> --handle <handle>|--userId <id> [--approvedBy <who>] [--live] [--json]
X's own lists, on the direct-API engine (vendor/twikit: ListsManagementPageTimeline, CreateList, ListAddMember), through the account's one session (rule 105). show lists the account's lists with their ids and member counts, sending nothing. create makes a list, and a list of that name already there is answered as it is, never made twice. add puts one person on a list, found by its name or id. create and add are dry runs unless --live, which needs --approvedBy (rule 8). Each is a write the governor counts, X's answer decides (rule 73), and a refusal stops with nothing retried (rule 94).
```

#### log twitter repost

Repost one post on X, on the direct-API engine; a dry run unless --live MCP tools: `twitterRepost`, `twitterRepostLive`, one per form, with named fields.

```text
log twitter repost --account <accountName> --tweet <postUrl> [--approvedBy <who>] [--force] [--live] [--json]
Repost one post on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's retweet answer decides: a created retweet (or already reposted, code 327) is sent. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
```

#### log twitter follow

Follow one person on X, on the direct-API engine; a dry run unless --live MCP tools: `twitterFollow`, `twitterFollowLive`, one per form, with named fields.

```text
log twitter follow --account <accountName> --userId <id> [--approvedBy <who>] [--force] [--live] [--json]
Follow one person on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
X's follow answer decides: the followed user back is sent, already following is sent too. Follow before a cold dm: nobody gets a cold message from an account that doesn't follow them. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
```

#### log twitter dm

Send one approved direct message on X, on the direct-API engine; a dry run unless --live MCP tools: `twitterDm`, `twitterDmLive`, one per form, with named fields.

```text
log twitter dm --account <accountName> --userId <id> --text "<copy>" [--media <file|url>] [--approvedBy <who>] [--skipStyleCheck] [--asOne] [--overGate] [--force] [--live] [--json]
Send one approved direct message on X, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80).
Without --live it is a dry run: the target, the text and its house style are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (240 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.
A draft written on several lines goes out one message per line, and a one-line draft is split the way matt writes in that chat (log voice index), with his usual gap between them; --asOne sends it as one, only when matt asked (rule 90). X's answer decides: a conversation id is sent, none is a drop, and a drop stops the rest: what was sent stays sent, nothing is retried (rule 94). An old DM thread (<a>-<b>) and its X Chat thread (<a>:<b>) with one person are one conversation: X shows them in the same place, and a dm sent through the old DM API shows in their X Chat too. A sent answer is delivered whichever conversation id it names: never resend it and never call it the wrong inbox. A refusal before X is called (styleFailed, a dry run) sent nothing, so that dm is sent once its copy is fixed. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.
```

#### log twitter react

React to a X message with an emoji, on the direct-API engine; a dry run unless --live MCP tools: `twitterReact`, `twitterReactLive`, one per form, with named fields.

```text
log twitter react --account <accountName> --chat <chat> --message <id> --emoji <emoji> [--remove] [--approvedBy <who>] [--live] [--json]
Reacts to one message with an emoji, on the direct-API engine (vendor/twikit, no browser), or takes the account's own reaction off with --remove. X takes any emoji; a name (joy, fire, eyes) is turned into it. It goes through X's own DM reaction mutation (twikit's add_reaction_to_message), so a message only X Chat holds may be refused, and X's answer says so.
Without --live it is a dry run and nothing is contacted. --live reacts, only when matt asked, and needs --approvedBy (rule 8). The chat is claimed first, as for a send, and released once it is done (rule 133). The platform's own answer decides (rule 73), the governor counts it as a write, and a refusal stops with nothing retried (rule 94).
```

#### log twitter queue

Build, approve, plan and run a queue of approved X replies, quotes or dms at random moments, on the direct-API engine MCP tools: `twitterQueueBuild`, `twitterQueueShow`, `twitterQueueCheck`, `twitterQueueStatus`, `twitterQueueApprove`, `twitterQueuePlan`, `twitterQueueRun`, `twitterQueueRunLive`, `twitterQueueAdd`, `twitterQueueNudge`, `twitterQueueEdit`, one per form, with named fields.

```text
log twitter queue build --targets <targets.json> [--variations <a.json,b.json>] --out <queue.json> --account <accountName> [--action reply|quote|dm|voice] [--seed <n>]
log twitter queue show <queue.json> [--json]
log twitter queue check <queue.json> [--skipXChatCheck] [--json]
log twitter queue status <queue.json> [--json]
log twitter queue approve <queue.json> --by <who>
log twitter queue plan <queue.json> --window <5h|90m> [--limit <n>] [--start <time>] [--minGap <s>] [--like] [--likeChance <0-1>]
log twitter queue run <queue.json> [--alertChannel <uuid>] [--alertReplyTo <eventId>] [--alertMention <hex,hex>] [--force] [--keepOpen] [--live]
log twitter queue add <queue.json> --targets <targets.json> --by <who> [--action reply|quote|dm|voice] [--window <2h|90m>] [--minGap <s>]
log twitter queue nudge <queue.json> [--replies <n>]
log twitter queue edit <queue.json> --n <n> --text "<new copy>" --by <who> [--window <30m>]
A queue of approved X replies, quotes or dms, sent one at a time at random moments inside a window, on the direct-API engine (no browser, no proxy: X accounts call X directly, rule 80). Targets come from treg research, never from X (rule 53).
build pairs each target with one unique line from the variations, shuffled; a target that carries its own text (written for that person's post) keeps it. show and status read it; check runs every pending item through the house style and target checks and contacts nothing. approve records who approved it as it stands: a fingerprint of the account and every item's action, target and copy, and any edit afterwards voids it. plan draws every like and reply a time with the system random source, at least --minGap apart (with --like, each post may get a like before or after its reply). nudge tells a running run to send the next replies now. One account has one queue: add puts more in (dms, replies, quotes together), even while it runs, each fitted between what is planned at least minGap apart, and the run takes them in as it waits; run --keepOpen stays running for more, so all of an account's sending is one run through its one X session (rule 105). Right before each send the run reads that person's full context again (their dm thread and X Chat, and what they did on the account's posts from its notifications) and holds the item when anything happened since it was drafted: a message either way, a like, retweet, reply, quote, mention or follow (rule 109). edit puts new copy on a pending or held item (no queue file is ever edited by hand), plans a held one again inside --window, and approves the queue as it then stands.
run walks the plan as an XState machine (planned, waiting, liking, replying, retrying, finished, halted), every transition on the live log: without --live a dry run lists what it would send and when; --live sends, only when matt asked (rule 8). Each answer is X's own event: any refusal (a 429, 226 looks automated, 344 daily limit, a soft block, the governor, a dead session) stops the run at once with X's answer and the time, the item stays pending, and nothing goes out on that account until matt starts a run again (rule 94); with --alertChannel it tags matt in buzz. A deleted post or replies off (385/433) is skipped. A dropped connection with no answer from X is tried again after 1 to 3 min, at most 3 drops in a row. It saves after every step, so running it again resumes. --force sends every event past the account's governor (its pause and caps), only when matt asked (rule 86); X's answers still stop the run.
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

#### log reddit read

Find subreddits, and read a subreddit's newest posts with their links, through the account's direct-API engine MCP tools: `redditReadSubreddits`, `redditReadPosts`, `redditReadHome`, `redditReadPost`, one per form, with named fields.

```text
log reddit read subreddits --account <accountName> --query <words> [--json]
log reddit read posts --account <accountName> --subreddit <name> [--days <n>] [--linksTo <host>] [--json]
log reddit read home --account <accountName> [--json]
log reddit read post --account <accountName> --url <permalink> [--limit <n>] [--json]
Reads Reddit through the account's direct-API engine (no browser), paced as reads. Sends nothing.
home is the account's home feed, one page. post is one post with its comments (--limit, default 50), each comment with the id log reddit reply takes to answer it.
subreddits finds communities by words. posts reads a subreddit's newest posts back --days (default 7), each with every link in it;
--linksTo keeps only the posts linking to that host (github.com) and ranks them by score, then comments. A 429 stops the read and keeps what was read (rule 94).
```

#### log reddit post

Post a text post to a subreddit through the account's direct-API engine; a dry run unless --live MCP tools: `redditPost`, `redditPostLive`, one per form, with named fields.

```text
log reddit post --account <accountName> --subreddit <name> --title <title> [--text <markdown>] [--flair <flair>] [--approvedBy <who>] [--live] [--json]
Posts a text post to a subreddit through the account's direct-API engine (no browser). A dry run unless --live, which needs --approvedBy (rule 8).
Reddit's composer asks for a reCAPTCHA Enterprise token, solved by 2Captcha (rule 10). The governor counts it as a write; Reddit's answer decides, and a refusal stops it with nothing retried (rule 94).
```

#### log reddit reply

Comment on a Reddit post or reply to one of its comments through the account's direct-API engine; a dry run unless --live MCP tools: `redditReply`, `redditReplyLive`, one per form, with named fields.

```text
log reddit reply --account <accountName> --url <post permalink> --text <text> [--comment <t1_id>] [--approvedBy <who>] [--live] [--json]
Comments on a post, or replies to one of its comments (--comment, an id from log reddit read post), through the account's direct-API engine (no browser).
A dry run unless --live, which needs --approvedBy (rule 8). Reddit asks for a reCAPTCHA Enterprise token, solved by 2Captcha (rule 10). A refusal stops it with nothing retried (rule 94).
```

#### log reddit vote

Vote on a Reddit post or comment through the account's direct-API engine; a dry run unless --live MCP tools: `redditVote`, `redditVoteLive`, one per form, with named fields.

```text
log reddit vote --account <accountName> (--url <post permalink> | --target <t3_id|t1_id>) [--direction up|down|none] [--approvedBy <who>] [--live] [--json]
Votes on a post or comment through the account's direct-API engine (no browser): up (the default), down, or none to take a vote back.
A dry run unless --live, which needs --approvedBy (rule 8). The governor counts it as a write; a refusal stops it with nothing retried (rule 94).
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

#### log discord servers

List the Discord servers the account is in, on the direct-API engine, sending nothing MCP tools: `discordServers`, one per form, with named fields.

```text
log discord servers --account <accountName> [--json]
Lists the Discord servers the account is in, by name, on the direct-API engine (no browser). One request. Sends nothing. A server is not a group DM: a group DM is a private chat in log discord chats, while a server holds channels, forums and threads (log discord channels).
```

#### log discord channels

List one Discord server's channels by category and kind (text, forum, media, voice), on the direct-API engine, sending nothing MCP tools: `discordChannels`, one per form, with named fields.

```text
log discord channels --account <accountName> --server <server name> [--json]
Lists one server's channels by category, each with its kind (text, announcement, forum, media, voice, stage), its tags and when its last message came, on the direct-API engine (no browser). One request. Sends nothing. A text or announcement channel is read with log discord read and the channel "<server> #<channel>"; a forum or media channel holds posts, listed with log discord posts.
```

#### log discord posts

List the posts in a Discord forum (or a channel's threads) with each one's opening message, on the direct-API engine, sending nothing MCP tools: `discordPosts`, one per form, with named fields.

```text
log discord posts --account <accountName> --channel "<server> #<forum>" [--limit <n>] [--archived <true|false>] [--json]
Lists the posts in a forum or media channel (or the threads under a text channel), newest activity first, on the direct-API engine (no browser): each post's title, who opened it, when, its tags, how many replies, whether it is closed, and its opening message. 25 a request, at most 200. Sends nothing. Each post is then read by its name with log discord read and the channel "<server> #<forum> > <post title>".
```

#### log discord search

Search a whole Discord server (channels, forum posts and threads) with Discord's own search, on the direct-API engine, sending nothing MCP tools: `discordSearch`, one per form, with named fields.

```text
log discord search --account <accountName> --server <server name> --query "<words>" [--channel "<server> #<channel>"] [--from <name>] [--limit <n>] [--json]
Searches a whole server with Discord's own search, every channel, forum post and thread at once, on the direct-API engine (no browser): each hit's time, channel or post, who wrote it and its text, newest first. 25 a request, at most 200. --channel keeps one channel, --from one person (by name, matched to who wrote in the hits). Sends nothing. The fast way to find an old conversation in a server: no channel has to be read back.
```

#### log discord read

Read a Discord chat or channel's latest messages, on the direct-API engine, sending nothing MCP tools: `discordRead`, one per form, with named fields.

```text
log discord read --account <accountName> --channel <channelId|chat name> [--limit <n>] [--after <messageId>] [--noMedia] [--json]
Reads a DM, group DM, server channel or forum post's latest messages, oldest first, on the direct-API engine (no browser): who sent each, when, whether a bot, what it replies to, its text and embeds. A server channel is "<server> #<channel>" and a forum post "<server> #<forum> > <post title>" (from log discord posts), both read live from Discord. --after keeps only what came after that message (a bot's answer to ours). --noMedia reads text only, without saving images or transcribing voice notes, for a fast pass over a busy channel. Sends nothing.
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
log discord send --account <accountName> --channel <channelId|chat name> --text "<message>" [--asOne] [--overGate] [--approvedBy <who>] [--live] [--json]
Sends one message to a DM, a group DM (by its id or its name, from log discord chats) or a server channel (by its id), on the direct-API engine (no browser).
--brief says the message hands someone a task, not a casual reply: the gate reads it as a brief instead of matt's chat voice (rule 162), asking SubQ whether it says clearly what to do, why, what done looks like and by when, kindly, and how to ask when stuck, with the attached files read beside it. The sameness, AI artifact and scrambler checks still run.
--file attaches files (a guide, a spreadsheet) to the last message, uploaded through the account's own session: only files under OUTBOX or ~/.logCli, at most 10 MB each, refused before anything is sent otherwise (fileRefused).
A draft written on several lines goes out one message per line, wherever it is sent (matt, 2026-10-28: stop sending as one). A one-line draft is split the way matt writes in that chat, from his own messages there (log voice index): how many he sends in a row and how many words each runs to, cut at the draft's own line breaks or punctuation, else the nearest space, and sent with his usual gap between them; a chat where he mostly sends one gets one. --asOne always sends one. Without --live it is a dry run and Discord is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). Discord's answer decides: a message id is sent, none is a drop. The account's governor counts it as a write. Before anything is sent, dry run or --live, the copy is read for what AI chat interfaces leave in text (rule 111): hidden characters, odd spaces or pasted Claude HTML refuse it with aiArtifacts, and the reading is printed and kept in --json. --overGate sends it over the voice gate's refusal when matt said to send that exact message: the gate's SubQ read is skipped and the AI artifact check still runs (rule 152). A link to an X post (x.com or twitter.com) is sent as fixupx.com, so Discord embeds the post with its video (matt, 2026-11-13).
```

#### log discord delete

Delete the account's own Discord messages by id, on the direct-API engine; a dry run unless --live MCP tools: `discordDelete`, `discordDeleteLive`, one per form, with named fields.

```text
log discord delete --account <accountName> --channel <channelId|chat name> --message <messageId>[,<messageId>...] [--approvedBy <who>] [--live] [--json]
Deletes the account's own messages by id (from log discord read) in a DM, group DM or server channel, on the direct-API engine (no browser): a duplicate or a mistake. Each message is read first and only deleted when the account sent it; someone else's is refused with notOwnMessage. Without --live it is a dry run that reads each message and deletes nothing. --live deletes, only when matt asked, and needs --approvedBy (rule 8). Discord's answer decides (204 is deleted). Each delete counts as a write, they go 4 s apart, and the first refusal stops the run with nothing retried (rule 94).
```

#### log discord react

React to a Discord message with an emoji, on the direct-API engine; a dry run unless --live MCP tools: `discordReact`, `discordReactLive`, one per form, with named fields.

```text
log discord react --account <accountName> --channel <channel> --message <id> --emoji <emoji> [--remove] [--approvedBy <who>] [--live] [--json]
Reacts to one message with an emoji, on the direct-API engine (vendor/endcord, no browser), or takes the account's own reaction off with --remove. Discord takes any emoji, a name (joy, fire, eyes) turned into it, or a server's own emoji as name:id.
Without --live it is a dry run and nothing is contacted. --live reacts, only when matt asked, and needs --approvedBy (rule 8). The chat is claimed first, as for a send, and released once it is done (rule 133). The platform's own answer decides (rule 73), the governor counts it as a write, and a refusal stops with nothing retried (rule 94).
```

#### log discord voice

Send a voice note in the owner's cloned voice as Discord's own voice note, from text; a dry run unless --live MCP tools: `discordVoice`, `discordVoiceLive`, one per form, with named fields.

```text
log discord voice --account <accountName> --channel <channel> --text "<what the owner says>" [--provider inworld|fishAudio] [--mattsWords] [--translationOf "<what it translates>" --language <code>] [--approvedBy <who>] [--live] [--json]
Sends a voice note in the owner's cloned voice (the voice provider, log clone voice) as discord's own voice note: a voice message (flags 8192, its waveform and duration), the bubble Discord's own app records. It takes text only, never an audio file: the words are said in his voice, converted with ffmpeg to ogg/opus and uploaded on the direct-API engine through the account's one session (vendor/endcord, no browser).
A voice note goes out only when matt asks for one (rule 142). The provider is --provider, else LOG_VOICE_PROVIDER, else inworld; the command only ever calls the shared voice layer (rule 143). Without --live it is a dry run: nothing is generated and nothing is contacted. --live needs --approvedBy (rule 8). It says and converts the note while the account catches up (rule 135) and the text goes through the voice gate every send runs (rule 137), so a note that passes goes out without waiting for it to be made; one the gate refuses is never sent. It then claims the chat (rule 133) and releases it after. The governor counts it as a write, the platform's answer decides (rule 73), and a refusal stops with nothing retried (rule 94).
--mattsWords says the text is matt's own words, dictated by him for this voice note: the voice gate's read is skipped, since it grades speech as typed text and as a reply, while the AI artifact check still runs and refuses aiArtifacts (rule 144).
--translationOf "<what it translates>" says the text is a translation, only when matt asked for one: the voice gate grades those original words (his own language, which the gate reads) instead of the translation, which it can't match to his writing; both are read for AI artifacts. --language <code> (zh-CN, es-ES ...) is the language the clone speaks it in, instead of the clone's own, and it is needed with --translationOf (rule 148).
```

#### log linkedin session

Check that LinkedIn still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty MCP tools: `linkedinSessionCheck`, one per form, with named fields.

```text
log linkedin session check --account <accountName> [--json]
Checks that LinkedIn still accepts the account's saved session, on the direct-API engine (openLinkedinApi, no browser). Sends nothing.
LinkedIn's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.
```

#### log linkedin cookies

Add or refresh a LinkedIn account in Twenty: its session cookies from a masked prompt, checked against LinkedIn Terminal only: asks for an account's session cookies in a Clack prompt (masked) and checks them with the platform before saving: an X account's auth_token, ct0 and twid, a LinkedIn account's, or a Slack account's d. Run `log twitter cookies save --account <handle>`, `log linkedin cookies save --account <publicId>` or `log slack cookies save --account <name>` in a terminal.

```text
log linkedin cookies save --account <publicId> [--name <label>]
Saves a LinkedIn account's session to Twenty from a masked Clack prompt: its li_at and JSESSIONID cookies, copied from a browser signed in to linkedin.com, never passed as flags or printed. --account is the profile's public id, the part after linkedin.com/in/.
They are checked first: the direct-API engine (openLinkedinApi, no browser, no proxy) reads /voyager/api/me with them, and only cookies LinkedIn accepts for that same profile are saved. A profile Twenty doesn't have yet gets a new LINKEDIN socialAccounts row (rule 13); one it has gets its cookies replaced.
```

#### log slack session

Check that Slack still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to its row MCP tools: `slackSessionCheck`, one per form, with named fields.

```text
log slack session check --account <accountName> [--workspace <domain>] [--json]
Checks that Slack still accepts the account's saved d cookie, on the direct-API engine (vendor/gabrielSlack, no browser): the workspaces it is signed in to, and with --workspace who it is there (auth.test). Sends nothing.
Slack's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.
```

#### log slack workspaces

List the workspaces a Slack account is signed in to, on the direct-API engine, sending nothing MCP tools: `slackWorkspaces`, one per form, with named fields.

```text
log slack workspaces --account <accountName> [--json]
Lists the workspaces the account's d cookie is signed in to, on the direct-API engine (Slack's own cookie exchange, vendor/gabrielSlack, no browser): each one's id, name and domain, the domain being what --workspace takes. Sends nothing.
```

#### log slack chats

List a Slack account's DMs and group DMs in a workspace with their ids, on the direct-API engine, sending nothing MCP tools: `slackChats`, one per form, with named fields.

```text
log slack chats --account <accountName> [--workspace <domain>] [--limit <n>] [--json]
Lists the account's DMs and group DMs in one workspace with their ids and who they are with, newest first, on the direct-API engine (vendor/gabrielSlack, conversations.list, no browser). Sends nothing.
```

#### log slack read

Read a Slack chat's latest messages, on the direct-API engine, sending nothing MCP tools: `slackRead`, one per form, with named fields.

```text
log slack read --account <accountName> --chat <chatId|who it is with> [--workspace <domain>] [--limit <n>] [--json]
Reads a DM, group DM or channel's latest messages, oldest first, on the direct-API engine (vendor/gabrielSlack, conversations.history, no browser): who sent each, when, its text and its thread. Sends nothing, and marks nothing read.
```

#### log slack watch

Watch a Slack workspace's events as its websocket pushes them, nothing polled, sending nothing MCP tools: `slackWatch`, one per form, with named fields.

```text
log slack watch --account <accountName> [--workspace <domain>] [--chat <chatId|who it is with>] [--seconds <s>] [--inbox] [--json]
Opens each workspace's own websocket on the direct-API engine (vendor/gabrielSlack, wss-primary.slack.com, no browser), every workspace the session is signed in to unless --workspace names one, and prints each message, typing, read marker, reaction and draft the moment Slack pushes it, nothing polled. --chat keeps one chat; --seconds stops after that long (at least 5), otherwise it runs until stopped. --inbox hands each new DM, group message or mention of the account from someone else to the inbox hook, which puts it in front of the agent with what to do next (rule 123). Sends nothing.
```

#### log slack send

Send a message to a Slack DM, group or channel, on the direct-API engine; a dry run unless --live MCP tools: `slackSend`, `slackSendLive`, one per form, with named fields.

```text
log slack send --account <accountName> --chat <chatId|who it is with> --text "<message>" [--workspace <domain>] [--asOne] [--approvedBy <who>] [--live] [--json]
Sends a message to a Slack DM, group DM or channel (by its id, or who it is with from log slack chats), on the direct-API engine (vendor/gabrielSlack, chat.postMessage, no browser).
A draft written on several lines goes out one message per line (rule 90); a one-line draft is split the way matt writes in that chat (log voice index), and --asOne always sends one. Without --live it is a dry run and Slack is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). Slack's answer decides: a ts is sent, anything else stops the run with nothing retried (rule 94). The governor counts each message as a write. The copy is read for what AI chat interfaces leave in text first (rule 111): hidden characters, odd spaces or pasted Claude HTML refuse it with aiArtifacts.
```

#### log slack cookies

Add or refresh a Slack account locally: its d cookie from a masked prompt, checked against Slack Terminal only: asks for an account's session cookies in a Clack prompt (masked) and checks them with the platform before saving: an X account's auth_token, ct0 and twid, a LinkedIn account's, or a Slack account's d. Run `log twitter cookies save --account <handle>`, `log linkedin cookies save --account <publicId>` or `log slack cookies save --account <name>` in a terminal.

```text
log slack cookies save --account <accountName> [--name <label>] [--workspace <domain>]
Saves a Slack account's session locally (~/.logCli/localAccounts.json, rule 97) from a masked Clack prompt: its d cookie (xoxd-…), copied from a browser signed in to app.slack.com, never passed as a flag or printed.
It is checked first: the direct-API engine (vendor/gabrielSlack, no browser, no proxy) exchanges it with Slack for the workspaces it is signed in to, and only a cookie Slack accepts is saved. An account log doesn't have yet gets a new local SLACK row; one it has gets its d cookie replaced and keeps the rest.
```

#### log slack react

React to a Slack message with an emoji, on the direct-API engine; a dry run unless --live MCP tools: `slackReact`, `slackReactLive`, one per form, with named fields.

```text
log slack react --account <accountName> --chat <chat> --message <id> --emoji <emoji> [--workspace <workspace>] [--remove] [--approvedBy <who>] [--live] [--json]
Reacts to one message with an emoji, on the direct-API engine (vendor/gabrielSlack, reactions.add and reactions.remove, no browser), or takes the account's own reaction off with --remove. Slack reacts by name (joy, fire, eyes, or a workspace's own); the common emoji are turned into their names, and one it doesn't know is refused with reactInvalid, so give its name. Already reacted counts as done.
Without --live it is a dry run and nothing is contacted. --live reacts, only when matt asked, and needs --approvedBy (rule 8). The chat is claimed first, as for a send, and released once it is done (rule 133). The platform's own answer decides (rule 73), the governor counts it as a write, and a refusal stops with nothing retried (rule 94).
```

#### log slack voice

Send a voice note in the owner's cloned voice as Slack's own voice note, from text; a dry run unless --live MCP tools: `slackVoice`, `slackVoiceLive`, one per form, with named fields.

```text
log slack voice --account <accountName> --chat <chat> --text "<what the owner says>" [--workspace <workspace>] [--provider inworld|fishAudio] [--mattsWords] [--translationOf "<what it translates>" --language <code>] [--approvedBy <who>] [--live] [--json]
Sends a voice note in the owner's cloned voice (the voice provider, log clone voice) as slack's own voice note: an audio file shared into the chat through Slack's own upload (files.getUploadURLExternal, the bytes, files.completeUploadExternal), which Slack plays inline. It takes text only, never an audio file: the words are said in his voice, converted with ffmpeg to AAC in .m4a and uploaded on the direct-API engine through the account's one session (vendor/gabrielSlack on curl_cffi, no browser).
A voice note goes out only when matt asks for one (rule 142). The provider is --provider, else LOG_VOICE_PROVIDER, else inworld; the command only ever calls the shared voice layer (rule 143). Without --live it is a dry run: nothing is generated and nothing is contacted. --live needs --approvedBy (rule 8). It says and converts the note while the account catches up (rule 135) and the text goes through the voice gate every send runs (rule 137), so a note that passes goes out without waiting for it to be made; one the gate refuses is never sent. It then claims the chat (rule 133) and releases it after. The governor counts it as a write, the platform's answer decides (rule 73), and a refusal stops with nothing retried (rule 94).
--mattsWords says the text is matt's own words, dictated by him for this voice note: the voice gate's read is skipped, since it grades speech as typed text and as a reply, while the AI artifact check still runs and refuses aiArtifacts (rule 144).
--translationOf "<what it translates>" says the text is a translation, only when matt asked for one: the voice gate grades those original words (his own language, which the gate reads) instead of the translation, which it can't match to his writing; both are read for AI artifacts. --language <code> (zh-CN, es-ES ...) is the language the clone speaks it in, instead of the clone's own, and it is needed with --translationOf (rule 148).
```

#### log instagram session

Check that Instagram still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty MCP tools: `instagramSessionCheck`, one per form, with named fields.

```text
log instagram session check --account <accountName> [--json]
Checks that Instagram still accepts the account's saved session, on the direct-API engine (instagrapi, no browser). Sends nothing.
Instagram's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.
```

#### log instagram dms

Read an Instagram account's DMs: its threads, or one thread's messages with --with, on the direct-API engine, sending nothing MCP tools: `instagramDms`, one per form, with named fields.

```text
log instagram dms --account <accountName> [--with <handle|thread name|thread id>] [--limit <n>] [--json]
Without --with, lists the account's Instagram DM threads, newest first: who each is with, its last message and whether it is unread. With --with, reads that one thread's latest messages, oldest first.
On the direct-API engine (vendor/instagrapi, direct_threads and direct_thread, no browser). Sends nothing, and marks nothing seen.
```

#### log instagram send

Send text and a photo to an Instagram DM, on the direct-API engine; a dry run unless --live MCP tools: `instagramSend`, `instagramSendLive`, one per form, with named fields.

```text
log instagram send --account <accountName> --with <handle|thread name|thread id> [--text "<message>"] [--photo <file>] [--asOne] [--approvedBy <who>] [--live] [--json]
Sends to an Instagram DM on the direct-API engine (vendor/instagrapi, no browser): --with is matched to one thread by handle, name or id, or to a new DM with that handle. --photo sends a picture first (direct_send_photo), then the text one message per line (rule 90), --asOne as one message.
Without --live it is a dry run and Instagram is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). Instagram's answer decides: each message comes back with its id, anything else stops the run with nothing retried (rule 94). The copy is read for what AI chat interfaces leave in text first (rule 111).
```

#### log instagram watch

Watch an Instagram account's DMs as Instagram's realtime connection pushes them, nothing polled, sending nothing MCP tools: `instagramWatch`, one per form, with named fields.

```text
log instagram watch --account <accountName> [--seconds <s>] [--inbox] [--json]
Opens Instagram's own realtime connection on the direct-API engine (vendor/instagrapi, MQTT to edge-mqtt.facebook.com, subscribed to the DM sync, no browser) and prints each DM the moment Instagram pushes it, nothing polled. --seconds stops after that long (at least 5), otherwise it runs until stopped. --inbox hands each new message from someone else to the inbox hook, which puts it in front of the agent with what to do next (rule 123). Sends nothing.
```

#### log instagram react

React to a Instagram message with an emoji, on the direct-API engine; a dry run unless --live MCP tools: `instagramReact`, `instagramReactLive`, one per form, with named fields.

```text
log instagram react --account <accountName> --thread <thread> --message <id> --emoji <emoji> [--remove] [--approvedBy <who>] [--live] [--json]
Reacts to one message with an emoji, on the direct-API engine (vendor/instagrapi, no browser), or takes the account's own reaction off with --remove. Instagram takes any emoji; a name (joy, fire, heart) is turned into it. It goes through instagrapi's direct_send_reaction (direct_delete_reaction with --remove) in the account's one session (rule 129).
Without --live it is a dry run and nothing is contacted. --live reacts, only when matt asked, and needs --approvedBy (rule 8). The chat is claimed first, as for a send, and released once it is done (rule 133). The platform's own answer decides (rule 73), the governor counts it as a write, and a refusal stops with nothing retried (rule 94).
```

#### log instagram voice

Send a voice note in the owner's cloned voice as Instagram's own voice note, from text; a dry run unless --live MCP tools: `instagramVoice`, `instagramVoiceLive`, one per form, with named fields.

```text
log instagram voice --account <accountName> --with <with> --text "<what the owner says>" [--provider inworld|fishAudio] [--mattsWords] [--translationOf "<what it translates>" --language <code>] [--approvedBy <who>] [--live] [--json]
Sends a voice note in the owner's cloned voice (the voice provider, log clone voice) as instagram's own voice note: a voice clip (instagrapi's direct_send_voice: the audio uploaded to rupload.facebook.com/messenger_audio, then sent as a voice_attachment with its waveform). It takes text only, never an audio file: the words are said in his voice, converted with ffmpeg to AAC in .m4a and uploaded on the direct-API engine through the account's one session (vendor/instagrapi, in the account's one session, no browser).
A voice note goes out only when matt asks for one (rule 142). The provider is --provider, else LOG_VOICE_PROVIDER, else inworld; the command only ever calls the shared voice layer (rule 143). Without --live it is a dry run: nothing is generated and nothing is contacted. --live needs --approvedBy (rule 8). It says and converts the note while the account catches up (rule 135) and the text goes through the voice gate every send runs (rule 137), so a note that passes goes out without waiting for it to be made; one the gate refuses is never sent. It then claims the chat (rule 133) and releases it after. The governor counts it as a write, the platform's answer decides (rule 73), and a refusal stops with nothing retried (rule 94).
--mattsWords says the text is matt's own words, dictated by him for this voice note: the voice gate's read is skipped, since it grades speech as typed text and as a reply, while the AI artifact check still runs and refuses aiArtifacts (rule 144).
--translationOf "<what it translates>" says the text is a translation, only when matt asked for one: the voice gate grades those original words (his own language, which the gate reads) instead of the translation, which it can't match to his writing; both are read for AI artifacts. --language <code> (zh-CN, es-ES ...) is the language the clone speaks it in, instead of the clone's own, and it is needed with --translationOf (rule 148).
```

#### log twitter voice

Send a voice note in the owner's cloned voice as Twitter's own voice note, from text; a dry run unless --live MCP tools: `twitterVoice`, `twitterVoiceLive`, one per form, with named fields.

```text
log twitter voice --account <accountName> --with <with> --text "<what the owner says>" [--provider inworld|fishAudio] [--mattsWords] [--translationOf "<what it translates>" --language <code>] [--approvedBy <who>] [--live] [--json]
Sends a voice note in the owner's cloned voice (the voice provider, log clone voice) as twitter's own voice note: an X Chat voice message: the m4a encrypted with the conversation key (chat-xdk encrypt_stream), uploaded to the conversation's media store (InitializeXChatMediaUploadMutation, the parts POSTed to ton.x.com, FinalizeXChatMediaUploadMutation) and sent as the message's one AUDIO attachment with its duration (SendMessageCreateMutation), as X Chat's own recorder sends it. It takes text only, never an audio file: the words are said in his voice, converted with ffmpeg to AAC in .m4a (audio/mp4, as X Chat records) and uploaded on the direct-API engine through the account's one session (vendor/twikit with vendor/chatXdk, in the account's one X session, X Chat opened with the saved PIN, no browser).
A voice note goes out only when matt asks for one (rule 142). The provider is --provider, else LOG_VOICE_PROVIDER, else inworld; the command only ever calls the shared voice layer (rule 143). Without --live it is a dry run: nothing is generated and nothing is contacted. --live needs --approvedBy (rule 8). It says and converts the note while the account catches up (rule 135) and the text goes through the voice gate every send runs (rule 137), so a note that passes goes out without waiting for it to be made; one the gate refuses is never sent. It then claims the chat (rule 133) and releases it after. The governor counts it as a write, the platform's answer decides (rule 73), and a refusal stops with nothing retried (rule 94).
--mattsWords says the text is matt's own words, dictated by him for this voice note: the voice gate's read is skipped, since it grades speech as typed text and as a reply, while the AI artifact check still runs and refuses aiArtifacts (rule 144).
--translationOf "<what it translates>" says the text is a translation, only when matt asked for one: the voice gate grades those original words (his own language, which the gate reads) instead of the translation, which it can't match to his writing; both are read for AI artifacts. --language <code> (zh-CN, es-ES ...) is the language the clone speaks it in, instead of the clone's own, and it is needed with --translationOf (rule 148).
```

<!-- surface:end -->
