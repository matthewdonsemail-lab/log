# logMcpInstructions

Step-by-step guide to the log MCP: every core rule in full, which guide covers which work, and how runs, jobs, browsers and refusals report back.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases: the work the owner asks for, tool by tool

This is how the owner works. Each use case is something the owner asks for again and again, written as its steps in order, each step naming its tool and what counts as done. When the owner asks for work a use case covers, read that use case and follow it step by step instead of improvising. Work no use case covers yet, done for the owner more than once, gets a page of its own in docs/useCases/<platform>/.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "discord/groupChatRead" })` | Reading a Discord group chat without Twenty | "read the <group> chat over the last <N> hours", "what did <someone> set up in <group>" |
| `getGuide({ useCase: "facebook/groups" })` | Listening to local Facebook groups | see the page |
| `getGuide({ useCase: "facebook/marketplaceListings" })` | From accounts to live Marketplace listings | see the page |
| `getGuide({ useCase: "twitter/affiliateMarketing" })` | Affiliate marketing through your DMs | see the page |
| `getGuide({ useCase: "twitter/dmInbox" })` | Reading the DM inbox: who is waiting on you | see the page |
| `getGuide({ useCase: "twitter/engagementReplies" })` | Answering the people who engaged with your posts | see the page |
| `getGuide({ useCase: "twitter/engagerDms" })` | DMing the people who liked or reposted your post | see the page |
| `getGuide({ useCase: "twitter/followUps" })` | Following up in your own voice | "follow up with these, not for anything in particular, just warming up the relationship", "say it was cool to meet him", "ask him for some advice on what he's doing", "take him up on the doc he offered". |
| `getGuide({ useCase: "twitter/followers" })` | Checking who really follows you | see the page |
| `getGuide({ useCase: "twitter/networkMaxing" })` | Network maxing: grow the network, the niche map | "all them people messaging me, just message them something nice, get the ball moving with the networking", "we're not even trying to get anything out of these people, network max", "throw some new people in the mixer", "network max ... look at the nicheMap", "the whole point of it is to expand our network, which is the niche map", "follow them before you cold message them, and like the tweet you send them". |
| `getGuide({ useCase: "twitter/recruiting" })` | Recruiting on X with a reply queue | see the page |
| `getGuide({ useCase: "twitter/topicReplies" })` | Replying to everyone posting about one topic | see the page |
| `getGuide({ useCase: "twitter/whoNeedsYou" })` | Finding who needs something from you, or who matters | "look through my messages and find someone who clearly needs something off me", "summarise everything on my twitter, how likely is it we make money", "who's worth following up". |

## Rule one: if we don't know, we do this

This is the number one rule of the whole stack, above every other rule in
this file. We already know most of the states a platform can be in. When a
step lands somewhere we don't know:

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

It works the same on every platform: every platform's client triggers
internal APIs nobody documents, and our job is to find what our action
caused. It runs in `log inspect` (`--goal`, `inspect goal`, `inspect
finding`, `inspect read`), where flows are made to be run again and again.

- **Why:** on 2026-10-22 Bethlehem's warm-up loaded `/marketplace/create/item`
  twice; its HTML said `sell_location: Barranco, 15063, PE` both times, and the
  warm-up passed. Then "Bethlehem, PA" saved the West Bank, and every step said
  ok. Read this way, SubQ said wrong result (93%) and pointed at Lima and the
  West Bank in Facebook's own answers.
- **Status 2026-10-23:** built for `log inspect` (PR #36). The page states
  `marketplaceCreateLimitReached` and `marketplacePartnerFeed` are decided by
  Facebook's answers. Every warm-up step that makes a call is decided by its
  answer: the five stage flows (the create page's
  `marketplace_new_seller_can_post_item` and `sell_location`, `buy_location`,
  the feed's account, paging, listings) and the Reels and feed activities,
  likes included, in `log flow run`, the stage runner and the host. The
  publish flow checks the create page and the listing id in the create
  answer; the profile flow its three saves; every other flow step that waits
  on a call checks its answer (delete, comment, posts, the Messenger PIN, the
  group tabs and share). On AdsPower (the account's browser: inspect, flow,
  warm-up, host, and join, read, poll and check in it) the host's account
  check reads Marketplace status from its answer, and join, read, poll and
  check already decided on theirs. Only the host's sign-in still decides on
  Facebook's sign-in cookies and the URL. The Camoufox-only commands aren't
  the primary path (#35).

Rules 73-76.

## The core rules, in full

The `log` tools run log-cli: Facebook accounts (Twenty socialAccounts) and what they do on Facebook (Marketplace listings, groups).
Its rules are matt's, in AGENTS.md (read the resource log://agents; the newest rules are at the bottom and win). The core of them:
1. Rule one, above every other: if we don't know, we do this. Read the step's internal API (what we sent and what came back; the answers decide, never the screen, a timer or the step having run); collate everything about the moment (goal, account, what we did, every call, the page, the screenshot, the earlier steps); ask SubQ what it means; say it loudly; keep going until the goal is reached; write what went wrong as P.E.E. (point, evidence, explain) with how it was fixed; and name the state so next time it is known. In `inspect`: `goal`, `inspectFinding`, `inspectGoal`, `inspectRead` (rules 73-76).
2. When matt says to do something, do it completely, in the same turn: not stopped to ask again, not narrowed to what you think (rule 30).
3. Only what matt said: never add options, scope, context or spending he didn't ask for; paid work does exactly what he said (rules 39-41).
4. Never mention or discuss Meta's or Facebook's rules, terms or account ownership with matt unless he raises them (rule 38).
5. Read-only on Facebook unless matt asked: anything that posts, joins, answers, clicks or edits is its own `…Live` tool (`publishLive`, `inspectDoLive`, `hostStartLive`, `joinLive`, `warmupLive`, `flow…Live`), annotated destructive, and needs confirmLive: true; every other tool never acts on Facebook and refuses live (rules 8, 10). Outside an account's local hours only with --bypass and confirmBypass: true, when matt asked (rules 18, 20).
6. One browser per account for its day, every action a step in it: open it with `inspectStart` (account, detach: true), never a launch per action; at most 8 opens a day, 10 minutes apart (rules 24, 35).
7. Every browser opens through its gates: proxy in the account's country, the self-check (its languages must start with the pinned ones; extras after them are allowed), headed, recorded (rules 11, 12, 17, 22, 92).
8. A run that fails is fixed from its own recording (its HAR read with rea), never by guessing; code that clicks a page is written from a recording of that page (rules 25, 29).
9. matt sees everything as it happens (rule 26). Before any call that takes more than a few seconds (a browser open, a join, a fill, a publish, a capture), start a Monitor on its live log, `tail -f ~/.logCli/mcp/<day>.log` (UTC day, `YYYY-MM-DD`), so every line shows in the client while it runs, and say in plain words what each stage means. Never wait silently for the result. A client without a shell (a claude.ai connector, Duet) reads each result's `progress` (every streamed line, timed) instead. Every result also says where every open browser is (`browsers`), the call that resolves its known page state (`next`: make it, do not stop, rule 54) and what only matt can clear (`needsMatt`); `browsers` is a tool too. A long run that outlasts its call's wait (`waitMs`, default 20 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine } until it ends, stop it with `jobCancel` (at its next browser step, never past Publish, rule 10); one job holds an account at a time (`accountBusy`, rule 35).
10. What a platform's client sends is documented per platform, then domain: `docs/platforms/<platform>/<domain>/<request>.md` (Facebook: `docs/platforms/facebook/`, groups in `groups/`), built by `capture --docs` from the runs' recordings (rule 27). A new platform or domain is explored with `inspect` first and gets its own folder (rule 29). Every platform's calls go through rea, their code as well as their network: `capture --docs` finds each call's code in that platform's own bundles by syntax tree and rea reads it, never Facebook's alone (rule 85).
11. Accounts live locally, in ~/.logCli/localAccounts.json (`localAccount` add, pull, list; `LOG_ACCOUNTS=local` in .env.local), each pulled one keeping its Twenty id so listings and groups still find it; listings and groups live in Twenty: never delete a row, fields are only added (rules 13, 14, 97).
12. Names are camelCase (rule 1) and say what a thing does, never which browser runs it (rule 46). Groups are their own library (rule 45). The warm-up is by platform and activity (`facebook warmup reel`): each activity's steps say what they must do, and every run outlines the ones that didn't (rule 49). The Reels warm-up with --persona builds the persona's For you feed: SubQ reads each reel from its frame (theirs or not), and the action orderer plans it from the persona pack (every dataset a trait) and its real KuaiRand-1K viewer, longer and more engaged on their kind as measured on real viewers, one action per reel, only what the run allows (rule 50). Proxy traffic is money: each account has a 24-hour traffic budget (1 GB), checked before and during a warm-up and written to ~/.logCli/proxyTraffic.jsonl (rule 51). Proxies are provider-agnostic: Twenty keeps one proxy URL per account from any provider (2Captcha, Byteful); `proxy assign --vendor byteful` checks before it saves, and log-cli never buys (rule 52). Anything that has to be found (a group, a provider, a fact) comes from an external search, TinyFish through treg, never memory; a suggestion names its source (rule 53). A known page state (a checkpoint's first page, a text captcha, a prompt, the login form) is resolved, never a reason to stop: press its Continue, solve the captcha; only a video selfie, ID or disabled account goes to matt (rule 54). The agent's hooks (Claude Code and Codex, one list) say where every open browser is after each call and keep the turn going while one sits on a state log-cli resolves; the terminal CLI writes the same live log as these tools (rule 55). Every tool's description carries its command's full usage, the same the README lists (rule 56). What every browser uses is under src/browser, never named for one browser (rules 46, 57). No loose files: python/ and scripts/ hold domain folders only (rule 58). log-cli is browser-agnostic, AdsPower first: a command runs on the account's browser through the driver, or on Camoufox only while it isn't on the driver yet (rule 59). It is platform-agnostic too: Facebook is the first platform, every command declares its platform, and what is scoped by platform names it in every form (`warmup facebook reel|feed|stages`, never `warmup run`) (rule 60).
13. Facebook group listening is obris-dev/openmagpie#188's triage job: an account joins (`facebook join group`), OpenMagpie polls with `facebook poll --request` (a read in the account's open browser), keeps every post, triages them with its watch, and sends only the matches to Twenty's socialListening. log-cli writes only the group's cursor to Twenty; `facebook read group` (`readGroup`) reads by hand and saves nothing else (rule 65). `facebook read members` (`readMembers`) reads a group's newest members (name, profile, bio, page category, followers, when they joined) from its People tab in the account's open browser, nothing clicked: it says up front `count N → ~S scrolls, ~M min at Xs per scroll`, waits `secondsPerScroll` (default 15) before each scroll, stops at `count`, the list's end or `maxScrolls`, `owners` keeps owners (a bio naming owner, co-owner, founder, CEO, president, proprietor or self-employed, or a page), and the members go to ~/.logCli/members/<group>/<run time>.tsv and .json, never to Twenty. A members page whose refetch answered with members is the known state `groupMembersList`: nothing to resolve (rule 77).
14. The platform comes first in every command that acts on one: `log <platform> <command> …` (`log facebook connect`, `log facebook warmup reel`, `log facebook poll <group> <account> <how long to poll>`); there is no form without it, and an old form is refused with the one it became. Most tools are one form of a command each (`inspectStart`, `inspectDo`, `accountShow`, `runsPrune`…) and take named fields, each value passed whole; the rest take `args`, what follows the command (the warm-up's start with its platform) (rule 63). The code is laid out the same way, `src/<platform>/<area>/<domain>`: `src/facebook/group/…`, `src/facebook/warmup/…`; what any platform uses stays shared (rule 64).
15. Code carries no comments and no docstrings: names, types, tests, skills and docs say what it does; `check:noComments` refuses a commit or push with one (rule 70).
16. An ad on more than one listing in a city carries copy versions (`copyVersions`, written by skills/listingCopy): at least as many as its live listings there, never fewer than 3, titles differing by half their words; each copy takes the one least like what's live; `listing lint` checks them, `campaign fill` refuses too few (rule 71).
17. A Marketplace location is typed by name, never abbreviated: "City, State" with the state written out ("Bethlehem, Pennsylvania") or "City, Country". An abbreviation ("Bethlehem, PA" was offered only as the West Bank), a zip or a number (a bare zip offered Granada, Spain) is refused with `locationAbbreviated` before anything is typed: in a listing's locationQuery, `inspectDo setLocation`, a flow's `location`, publish and the host (rule 72).
18. In `inspect`, every step reads its internal API calls (what was sent and what came back) into exchanges.json; a step no known state names is read by SubQ with the goal (`goal`), the account, what we did, every call, the page, the screenshot and the earlier steps, for what it means. Its reading comes first in the result (`>>> UNKNOWN STATE`): name that state before the flow goes on. `inspectRead` reads a recorded step again (rule 74).
19. An inspect session has a goal (`goal` on `inspectStart`, or `inspectGoal` with `set`), and the turn is not over until a step's reading says it is reached. A step that went wrong gets its P.E.E. finding before the next step, with `inspectFinding`: point (the issue, one sentence), explain (why the evidence shows it, what caused it); the evidence is quoted from the step's reading. Once reached, each finding says how it was fixed (`fixes`, `fix`). What only a person can clear is said to matt (rule 75).
20. Flows are deterministic: a control is one scored match by role and name (accessible name, aria-label, label, text or placeholder, case ignored) inside the dialog the step names (`within`), never a guess (`controlAmbiguous`, `controlMissing`, `controlDisabled`); every step waits for the call it must cause and checks its answer before the next fires; before its first click a flow clears the known overlays (the browser-notifications notice, an ended "What happened" notice) with Escape, each checked, or stops with `overlayNotCleared`. Run `preflight` before opening accounts: it says what would stop each one (timezone, hours, proxy, kernel, opens left, a session left open, its picture) and `--apply` fetches a missing kernel (rule 79).
21. X (Twitter) is a platform of its own, `log twitter <command>`, on the direct-API engine only: twikit (vendor/twikit) with the account's saved cookies from Twenty, no browser and no proxy. X accounts call X directly, as twitter-controller does. X's own answer decides (`socialAccounts.sessionState`), each account has its own governor, and refreshed cookies are merged back (rule 80). We maintain vendor/twikit ourselves: its transport is curl_cffi (impersonating Safari), never httpx (`check:twikitTransport`, rule 81). When matt says to send anyway, `force` goes past the account's governor (its pause and caps) for that call or run only; X's answer still decides (rule 86).
22. A new platform is made whole with `log new platform <name>` (`newPlatform`): its session, `log <name> session check`, its engine and docs, wired into the repo through the syntax tree; a dry run until `apply`, and `check:platforms` refuses one half wired (rule 83).
23. `inspect` and the account's browser work on every platform with a browser path: `PLATFORM_SITES` says its hosts, home and whether it needs a proxy. Facebook always does (rule 12); a platform marked no-proxy (Reddit) opens direct on this machine's exit (rule 84).
24. The knowledge base is in ListeningKit's Twenty and searched through Redis: before guessing at a rule, a skill, a page state, an account, node02 or what an earlier session learned, search it with `kb search` (keyword and meaning at once); save what a session learned with `kb remember`; `kb sync` refreshes it from the repo, the memory files and log-cli's Twenty. Nothing secret is ever written to it (rule 93).
25. Never act on an account in quick succession: every platform call goes through log-cli's own commands and their governor, never a hand-rolled script with an account's token or cookies; a 429 or a failed send stops the run with nothing retried and the next action waits for matt; a bulk read of a server, group or member list is its own session, never in the same one as sending; cold DMs go out a few a day, minutes apart, each new DM channel counted as a write; after a block, disable, captcha or cooldown nothing resumes on that account until matt says so. One person's X Chat is opened as X's app opens it (`twitterDms` with `with`), never by reading the whole inbox (rule 94).
26. The work matt asks for again and again is a use case (docs/useCases/<platform>/<page>.md): how he asks for it, then its steps, each naming its tool. When he asks for work a use case covers, read it with `getGuide({ useCase })` and follow it step by step, never improvise; each tool names the use cases that call it. The pre-commit review asks SubQ whether this session's work left a page stale or uncovered (rule 95).
27. An X account makes up to 240 writes a day (sends, likes, reposts, follows), Discord 60, every other platform 40; X's own answer (344) still stops it (rules 96, 101).
28. A first message to someone matt has never talked with is the opener only: about them and what they posted, always relevant, never the ask (no pitch, no "you using treg", no call); the ask waits until they answer, and `voice` fails a first message with one (rule 98).
29. Network maxing grows matt's network, which is his niche map: new people come from it first (real roles, closest first, not yet talked to), and every message is about them and what they're doing, never what he sells (rule 99).
30. A reaction to matt's message, or their read receipt past it, means they opened it: `twitterDms` { waiting: true, limit: "200" } lists it apart as a follow-up to send (about them and what they're doing, never the opener again, never the ask), not a reply they're waiting on (rule 100).
31. LinkedIn is reached only through vendor/openLinkedinApi's one curl_cffi Session pinned to Chrome (`IMPERSONATE`), never plain `requests`, and every call goes through the account's governor; a LinkedIn account writes at most 10 times a day (rule 102).
32. More than one send on an account goes through the queue (`twitterQueueBuild`, plan, run), whose random times space them like a person; never a hand-rolled loop of sends and never helpers reading or sending on the same account in parallel. The X engine takes one call per account at a time (`engine.lock`, `accountBusy` after 15 min), spaces each 4 to 11 s after the last, and keeps the transaction key for 3 hours instead of loading x.com before every call (rule 104).
33. One X session per account, always: every X call (CLI, MCP, hooks, queue, X Chat watch) goes through that account's one engine host (`python/twitterApi/host.py`), which holds one twikit client, one connection and one transaction key, as X's own web app holds one page. A second session can't start (`host.lock`); if the host can't be reached the call is refused loudly (`xSessionHostDown`) and nothing is sent. Never open another session or hand-roll a script to get around it. The hook's account line shows the open session (rule 105).
34. Every log action goes through these MCP tools, never a hand-run `log …` or `bun bin/log.ts …` from a shell (the shell hook refuses one); only the terminal-only prompts are run in a terminal, by matt. Before changing log-cli code, read what is already changed and uncommitted (the hook says it loudly: `>>> UNCOMMITTED LOCAL CHANGES`) and never overwrite, revert, stage, publish or ship someone else's uncommitted work without matt (rule 106).
35. An account has one queue and one run for everything it sends: dms, reply-guy replies and answers together. Put more in with `twitterQueueAdd` (even while it runs: each is fitted between what is planned, minGap apart) and keep it going with `keepOpen` on `twitterQueueRunLive`; never a second queue or run for the same account (rule 107).
A refusal names its error code and what to do (`errors` tool). Each tool's description ends with the AGENTS.md rules it falls under.

## Which guide for which work

Each tool's description names its guide. Load it with `getGuide({ topic })` before first using that tool.

| Topic | What it covers |
|---|---|
| `facebookBrowser` | An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks |
| `facebookFlows` | Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause |
| `facebookMarketplace` | Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations |
| `facebookGroups` | Facebook groups: joining and answering their questions, reading posts and members, and serving OpenMagpie's polls |
| `xInbox` | Reading an X account's DMs and X Chat as one inbox, synced by sequence id, and watching X Chat live |
| `xSending` | Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send |
| `xAccount` | An X account's session: saving and checking its cookies, and who follows whom |
| `discord` | A Discord account: its session, chats, reading, the live gateway watch and sending |
| `reddit` | A Reddit account's session |
| `linkedin` | A LinkedIn account's session: saving its cookies from a masked prompt and checking them with LinkedIn |
| `accountsAndProxies` | Accounts in Twenty, their status and secrets, their proxies, and the interactive launcher |
| `runsAndEvidence` | What runs leave behind: run folders and pruning, captures and request docs, error codes, jobs and the MCP server itself |
| `knowledgeAndSearch` | Finding context: the knowledge base and the conversation search, keyword and meaning at once |
| `newPlatform` | Making a new platform whole with one command, and where every new file goes |

## How a run reports back

- With a shell (Claude Code, Codex): Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
- Without one (claude.ai, Duet): Runs for seconds to minutes: every line it streams comes back in the result's `progress` (with its time), and the result says where every open browser is (`browsers`, `next`, `needsMatt`) (rules 26, 54). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
- Every result also says where every open browser is (`browsers`), the call that resolves its known page state (`next`: make it, don't stop, rule 54) and what only matt can clear (`needsMatt`).
- A refusal names its error code; the `errors` tool says what each one means and what to do.

## The work, step by step: logCli

From `skills/logCli/SKILL.md`.

## logCli

Run from the repo root (`REPOS/log-cli`). Every command takes `--json`, and
none of them prompt unless you run `log launch` in a terminal.

### Hard boundaries

1. **Read-only on Facebook, except `log facebook publish --live`.** `scan`, `status` and
   `watch` only read. `connect` only saves cookies. `publish` is a dry run
   unless `--live` (AGENTS.md rule 10). Nothing is edited or deleted on Facebook.
2. **Twenty is the source (rule 13).** Accounts are `socialAccounts` (FACEBOOK),
   listings are `agencyListings`. Never delete either: banned or dead accounts
   keep their record (`log facebook account status`). Never print cookies, proxies,
   passwords or 2FA secrets; `log` never selects password, email or totpSecret,
   except `connect --noPrompt`'s auto-login (rule 21).
3. **Marketplace only.** No X, Reddit, keywords or communities.
4. **Camoufox is always visible.** Every launch is headed, with humanize on and
   the cursor shown (AGENTS.md rule 11). There is no `--headless`. Run it where
   a screen can show the window.
5. **No browser without the account's proxy (rule 12).** The proxy is the
   socialAccount's `proxy`, its country `homeCountry`. No exception: not dry
   runs, not `connect`. `docs/proxies.md`.
6. **One device, one locale, checked, in local hours (rules 15-18).** An
   account's first launch makes its device (`deviceProfile` in Twenty), and
   every launch replays it. The locale comes from `HOME_COUNTRIES`. The gate's
   self-check closes the browser before Facebook if the timezone, locale or exit
   IP is off. Nothing runs outside 08:00-22:00 in the account's home timezone
   (`activeHoursStart`/`activeHoursEnd` to change it). `--bypass` skips the hours for one run when matt
   asks (rule 20), and nothing else. From Vietnam, Ireland's
   day is 14:00-04:00 ICT. Never clear `deviceProfile` without matt; after a
   Camoufox upgrade, re-run the live leak checks (`docs/proxies.md`).

### Environment

- Bun, Python 3.12 with `facebook-camofox-client` installed
  (`pip install -e ../facebook-camofox-client`), and the Camoufox browser
  (`python -m camoufox fetch`).
- `log-cli/.env.local` (git-ignored): `TWENTY_BASE_URL`, `TWENTY_API_KEY`,
  `CAPTCHA_KRAKEN_API_KEY`, `2CAPTCHA_API_KEY`. `LOG_PYTHON` picks the interpreter.
- After adding Twenty fields: `node scripts/twenty/twentySetup.mjs --apply`, then
  `bun run twenty:client` (the generated client, rule 14).

### Commands

```bash
bun run launch                                          # Clack menu over everything below

## Twenty data
log facebook accounts                                  # FACEBOOK accounts, and whether each may run
log facebook account show galwayOne
log facebook account status galwayOne BANNED --reason accountDisabled   # kept; campaign listings replaced
log facebook listings [--status READY] [--account galwayOne] [--campaign <id>]
log facebook listing <agencyListingId>
log facebook listing create --account galwayOne --file ad.json   # a READY row, checked like publish checks it

## sign in to log itself (Twenty OAuth through blaster's web app, same as `blaster login`)
log login | whoami | logout

## proxies (rule 12): check before anything else
log proxy check --account galwayOne           # exit IP + country, no browser, saved to Twenty
log proxy assign --account galwayOne          # a 2Captcha proxy in its home city, checked, then saved
log proxy assign --missing                    # every FACEBOOK account without a proxy
log proxy assign --account lancasterOne --region pennsylvania   # pin the state; exits over 100 km from home are retried, then proxyTooFar
log proxy balance                             # 2Captcha traffic left

## live (launches Camoufox through the proxy)
log facebook doctor                                    # setup check, which accounts may run
log facebook connect --account galwayOne               # the connect machine; a person signs in in the window, cookies saved to Twenty
log facebook connect --account galwayOne --noPrompt    # the same, auto-login typing Twenty's details (rule 21), up to --wait 600 s
log facebook scan --account galwayOne                  # Marketplace > Selling, written back to the listings
log facebook status <facebookListingId> --account galwayOne

## the monitor (XState), every step printed live
log facebook watch --account galwayOne [--checks 0 --interval 240] [--json]

## publish one Twenty listing (XState), every step printed live. Dry run unless --live
log facebook publish --listing <agencyListingId>
log facebook publish --listing <agencyListingId> --live
## against the local copy of the create form (no Facebook)
log facebook publish --listing <id> --formUrl file:///$PWD/python/fixtures/createItem.html

## campaigns: one ad on N accounts in one place (docs/accountsAndListings.md)
log facebook campaign fill --campaign <id> --from <agencyListingId> --accounts 10
log facebook campaign run --campaign <id> [--live]
log facebook campaign heal --campaign <id>
```

### As an MCP server

`bin/logMcp.ts` (`bun run mcp`) serves every command as an MCP tool over
stdio, registered as `log` in the repo's `.mcp.json`, so in Claude Code they
show up as `mcp__log__<tool>`. A command that declares its input
(`Command.input`, one flag spec per form) is one tool per form, named for the
command and its words (`inspectStart`, `inspectDo`, `accountShow`,
`runsPrune`…), and takes named fields: the spec gives each its kind, what is
required and the enum values, and the tool turns them back into the argv the
terminal would run (`argvOfInput`), each value whole. The command parses with
`parserSpecOf` of the same spec, so the usage, the parser and the schema can't
drift (`check:docs`). A command without one is still one tool taking `args`
(what goes after `log <command>`). Every tool returns the command's stdout,
stderr and exit code, through `runCli`, so every gate above still applies.

- What acts on Facebook is a tool of its own, named `<tool>Live`
  (`publishLive`, `inspectDoLive`, `hostStartLive`, `joinLive`, `warmupLive`,
  `flow<Name>Live`): a form's single live flag is implied (`publishLive` runs
  `--live`), several stay fields (`hostStartLive`: `live`, `likes`), and an
  args tool takes them in `args`. Every live tool needs `confirmLive: true`;
  every other tool refuses live and names its live twin. `bypass` needs
  `confirmBypass: true`. Set them only when matt asked (rules 8, 10, 20).
- Every result, refusals too, says where every open browser is: `browsers`,
  `next` (the tool call that resolves a known page state: make it, rule 54),
  `needsMatt` and `progress` (each streamed line with its time), and its text
  starts with the same in a line or two. A client with a shell (Claude Code,
  Codex, by its `clientInfo` name) is told to Monitor the live log for long
  runs; any other client is told to read `progress` and `browsers`. The client's
  name is written to the live log when it connects.
- A long tool (`LONG_RUNNING`, and every flow) runs as a job
  (`src/mcp/jobs`, `~/.logCli/mcp/jobs/<id>.json` and `.jsonl`): the call
  waits `waitMs` (default 20 s, at most 50 s) and returns the result if the run
  ended, or the job (`exit` -1, `job.id`, the lines so far). `jobStatus`
  (`log job status <id> --afterLine <n>`) waits for new lines and returns the
  result once it ends; `jobCancel` stops it before its next browser step
  (`sendInspect`), never once Publish is clicked (rule 10); `jobList` lists
  them. One job holds an account at a time (`accountBusy`). Jobs live on disk,
  so any server or the terminal can follow them; a job whose server stopped
  is `lost`.
- Over HTTP (`--http`), Claude's connectors (claude.ai, Duet) sign in with OAuth
  through Twenty when `LOG_MCP_PUBLIC_URL` is set: the server is its own authorization
  server (`src/mcp/oauth`: discovery, `/oauth/register`, `/oauth/authorize`, Twenty's
  callback, `/oauth/token`), and only the Twenty user of this server's `log login` gets a
  token. `log mcp clients|revoke` (terminal only) manage them. How it is deployed:
  `docs/deployment.md`.
- Every tool carries a `title` and MCP annotations from its command's
  `effect` (`read`, `write`, `delete`, `browser`, on the command and its
  forms): reads are read-only and idempotent, a browser on Facebook is
  open-world, a prune is destructive, and every live tool is destructive and
  open-world, so a client can ask before each live call
  (`src/mcp/server/helpers/toolAnnotations.ts`).
- `connect` always runs `--noPrompt` as a tool. It is the connect machine
  (`marketplace/connect/machine.ts`): every page is read as a kind (loggedIn,
  loginForm, twoStepCode, twoStepMethod, trustDevice, automatedBehaviour,
  cookieBanner, findAccount, checkpoint, captcha, wrongPassword, disabled...)
  and printed as a state, until signed in or `--wait` s. Each page takes
  Listaro's path (rule 23). `launch` and `login`
  aren't tools, because they wait on a person at the terminal and stdin is the
  MCP channel.
- Taking an account from NEEDSLOGIN to a dry run: `skills/accountToDryRun`.
- It loads `log-cli/.env.local` itself, whatever folder it is started from.
- **Every action records a HAR (rule 22).** Each connect, scan, status,
  watch check and publish writes `session.har`, its timed `steps.jsonl`, and
  one rea-read HAR per step under `~/.logCli/runs/...`
  (`skills/reaCapture`).
- **Every log line is visible.** The worker's and publish session's stderr
  go through `observability/processLog`. As a tool, each line (with the
  command's own output) is in the result under `log:`, is sent as an MCP log
  notification, and is appended live to `~/.logCli/mcp/<day>.log`
  (`LOG_MCP_DIR` to move it). The terminal CLI (`bin/log.ts`) appends
  its own lines there too, as `cli:<command>` (rule 55). Watch a long call
  (`connect`, `publish`) with `tail -f ~/.logCli/mcp/<day>.log`. Lines name actions and page paths only,
  never credentials or query strings.

### Reading the results

Every code is in the error catalog: `log errors` lists them, `log errors --code <code>`
explains one (meaning, retryable, where each machine ends, what to do), and
`docs/errorCatalog.md` has them all with the machine diagrams. After changing
`src/errors/catalog/types.ts`, run `bun run errors:export`.

| You see | Means | Do |
| --- | --- | --- |
| `neverConnected` | No saved session for that account | `log facebook connect --account <accountId>` |
| `loginWall` / `sessionExpired` | Facebook wants a fresh login | `log facebook connect` again |
| `checkpointed`, `suspended` | Account problem; the monitor stops at `blocked` | Tell matt, don't retry |
| `wrongPassword` | connect: Facebook said Twenty's password is wrong | Fix it in Twenty, then `log facebook connect` |
| `signInNotFinished` | connect: `--wait` ran out; the output names the last page | Finish that page in the window, or a longer `--wait` |
| `tripped` | Same error 3 times in a row | Read the trace, fix the cause, run again |
| Repost `yes (#n)` | A takedown that's within the repost budget | Decision only; nothing was posted |

## The rules these tools fall under, in full

From AGENTS.md (`log://agents`). The newest rules are at the bottom of AGENTS.md and win.

**Rule 1.** 2026-10-18 · camelCase everywhere, never kebab-case: files, folders, values, ids, statuses, error codes, usage text. Other systems' kebab-case is converted once, at the boundary. `bun run check:naming` enforces it.

**Rule 8.** 2026-10-18 · Read-only on Facebook. Nothing is posted, edited or deleted unless matt asks for it.

**Rule 10.** 2026-10-18 · matt asked for posting: `log publish` posts one listing through the publish machine. It is a dry run unless `--live`, and once Publish is clicked nothing is retried. Captchas go CaptchaKraken first, then 2Captcha, and Facebook's own challenges go to a person. Rule 8 still holds for editing and deleting.

**Rule 11.** 2026-10-18 · Camoufox is never headless. Every launch is headed so the window can be watched, with humanize on and the cursor shown (`python/browser/visibleBrowser.py`). There is no flag to turn it off. `camofox/session/visible.test.ts` enforces it.

**Rule 12.** 2026-10-18 · No browser opens for an account unless its proxy is attached and its exit IP is in the account's country (`python/browser/proxyGate.py`). There is no exception: not dry runs, not signing in (matt: "never, ever open" without one). Listings must be in the account's country, and the form's location must be picked in that country. How it works: `docs/proxies.md`.

**Rule 13.** 2026-10-18 · Twenty is the only place accounts and listings live: Facebook accounts are `socialAccounts` (platform FACEBOOK), listings are `agencyListings`. Never delete either: a banned or dead account keeps its record with its status, and its campaign listings get replacement accounts in the same country (`docs/accountsAndListings.md`). Fields are only ever added (`scripts/twenty/twentySetup.mjs`), never renamed or retyped, so the twitter-controller keeps working.

**Rule 14.** 2026-10-18 · Twenty is reached through the generated GraphQL client, the same one blaster and the dialer use (`bun run twenty:client`, `src/twenty/graphql/generated`). Regenerate it after any field change.

**Rule 17.** 2026-10-18 · Launch self-check: before any page loads, the gate checks in the page and a worker that the timezone is the exit IP's, the language and Intl locale are the pinned locale, and the browser's exit IP is the checked one. Any mismatch closes the browser before Facebook loads.

**Rule 18.** 2026-10-18 · No run outside the account's local waking hours (08:00-22:00 in its home timezone, or `activeHoursStart`/`activeHoursEnd`): publish, scan, status, watch, campaign run and connect are refused with `outsideActiveHours`. Daily caps count the account's local day.

**Rule 20.** 2026-10-19 · matt asked for `--bypass`: on publish, scan, status, watch, campaign run and connect it skips rule 18's waking hours for that run, and nothing else. The proxy gate, home locale, device and launch self-check (rules 11, 12, 15-17) still run, and `--live` still needs matt (rule 10). It is never on by default; pass it only when matt asks for a run outside the account's hours.

**Rule 22.** 2026-10-19 · Every action records a HAR, with no way to turn it off. The proxy gate puts a raw HAR recorder (rule 19) on every browser context, and refuses a context without a capture folder (`captureMissing`). That covers connect, scan, status, each watch check and publish. Each run keeps `~/.logCli/runs/<action>/<time>_<account>/firefox` (publish: its run folder): `session.har`, `steps.jsonl` (every action the run logged, timed), and `steps/NN_<action>.har`, one per step, each read by the local rea (`settleRunCapture`). Never committed.

**Rule 24.** 2026-10-19 · matt: "fix them issues now" (the launch budget from RESEARCH/LOG_CLI_RUN_CAPTURES_2026_10_19.md). One account's browser opens on Facebook at most 8 times per local day, dry runs counted, at least 10 minutes apart. A launch counts once it passed the gate ("Self-check passed" in its `steps.jsonl`). Refused before anything opens: `launchTooSoon`, `launchBudgetSpent` (`browser/run/helpers/launchBudget.ts`). `--bypass` doesn't skip it; only a publish against the saved fixture form (`--formUrl file://...`) isn't counted. A publish meets a login wall or checkpoint in its own browser (the connect steps run there), never in a second launch.

**Rule 25.** 2026-10-19 · matt: a run that fails or hangs is fixed from its own recording, never by guessing. Read its HAR with rea (timeline, cause line, compare runs), then fix the machine. The outline is at the top of this file.

**Rule 26.** 2026-10-19 · matt: "I always want to see what is going on." Every process that runs over time writes a progress line per stage as it happens (never only at the end) and to a log file in its folder. Agents run long commands so the lines stream live (Claude Code: Monitor, never piped through `tail`/`head`).

**Rule 27.** 2026-10-19 · matt: every request Facebook's client makes in our runs is documented by domain in `docs/platforms/facebook/<domain>/<request>.md`: what it sends and reads, which step fires it, how fast, what errors it returns, and why it matters to our machines. Built by `log capture --docs`: our syntax-tree parse cuts each request's modules out of Facebook's bundles, rea reads each slice (seconds, not the whole bundle). lefthook's pre-push (`check:facebookClientDocs`) refuses a push while a request is undocumented, unread by rea, has its reasoning unwritten, or a run is newer than the docs.

**Rule 29.** 2026-10-19 · matt: look before writing code for a page. `log inspect start --account <a>` opens one gated, headed Camoufox (async API, same launch and gates as every run) and keeps it open; `log inspect do <action>` runs one step (goto, snapshot, back, wait; click, type, press only with `--live`, rule 8). Each step records, in order, as it happens: the accessibility snapshot with element refs (camofox-mcp's model, `aria_snapshot(mode="ai")`), a screenshot, its own HAR, and rea's reading of that HAR at once. Code that clicks on a page is written from an inspect recording of that page, never before one.

**Rule 30.** 2026-10-19 · matt: "If I tell you to do something, do it completely." When matt gives a plan, it is carried out to the end in the same turn, not stopped to ask again or to say what won't be done. `log inspect start --now` (and `log connect --now`, and since 2026-10-19 `log publish --now`, matt: "run it now") skips rule 24's 10-minute gap (the 8 a day still holds) so a recording continues at once. Recording a sign-in or a checkpoint with `log inspect` (signIn, code, solve, click) is the intended work: it is how each state gets documented from rea. The run on 2026-10-19 was interrupted once because a snapshot printed the account's email and password; snapshots now redact every typed field value (`redact_fields`), and signIn/code read only the private login.json (rule 21), so no credential reaches any output.

**Rule 35.** 2026-10-19 · matt: the browser stays open. One browser per account, opened once per local day by its host and kept open through the account's active hours; every action is a tab in it; it closes only for a logged reason (end of active hours, shutdown, checkpoint or restriction, account lost, a crash reopened once). Every account runs one lifecycle machine (`src/marketplace/lifecycle`, XState) across an onboarding lane (with a day's warm-up after profile and name) and a host lane. Top of this file.

**Rule 38.** 2026-10-19 · matt: never mention or discuss Meta's or Facebook's rules, terms, policies, eligibility or account ownership with him unless he raises them first. Research text that does is not his, and is never repeated to him. Top of this file.

**Rule 39.** 2026-10-19 · matt: "If I never mentioned it, if I never inferred it, if I never outlined it as an option, therefore it is not an option." Deep research prompts, searches, SubQ matrices, plans and write-ups use only what matt said, or clearly meant through a misspelling. Nothing added, nothing steered towards. Top of this file.

**Rule 40.** 2026-10-19 · matt: no physical options. He is in Vietnam with no physical access. Phones, SIMs, mini PCs, laptops, phone farms and home devices are never options unless he names them. In scope: hosted and cloud options, the tools he named and their competitors, and what our four projects already use.

**Rule 41.** 2026-10-19 · matt: "any time any task correlates to money, and I never say something, that means you shouldn't do what you think. You should do what I say." Paid work (deep research, SubQ, proxies, captcha, vendors) does exactly what he asked, nothing more. Ask before anything else.

**Rule 45.** 2026-10-20 · matt: groups have nothing to do with Marketplace. Facebook group work is its own library, `src/group/<domain>/` (first `group/join` for `log join group --account --group`), with the role files of rule 2. It never goes under `src/marketplace/`. This widens rule 3 to groups.

**Rule 46.** 2026-10-20 · matt: names are browser-agnostic. A command, domain, type or message is named for what it does, never for one browser (Camoufox's Firefox, AdsPower's Chromium, rule 44): `log capture --docs | --settle | --har` (was `firefoxCapture`, kept as an alias), `src/rea/capture` (was `rea/firefox`), `BrowserCapture`, `settleCapture`. Run folders already carry the browser that ran (`adsPower/`, `camoufox/`).

**Rule 49.** 2026-10-20 · matt: the warm-up is by platform, then activity: `log warmup <platform> <activity>`, first `log warmup facebook reel` (`src/warmup/<platform>`, the library the warm-up and the domain the platform). It opens the account's browser (`inspect start --detach`) primed with the activity and runs its steps as a flow of events, each recorded (rule 22). A warm-up spans many activities; each is a unit of its own, so it is watched alone, and every step says what it must achieve (a swipe changes the reel's URL, the comments show their heading): each run writes the outline of the steps that didn't (`warmup_<platform>_<activity>.json`), and the steps are fixed from that recording (rule 25). Reels: sound on first (they start muted: nobody watches a reel with the audio off); most reels get a glance and a skip, often a few in a row, and only some are watched (`--skip`, default 0.6); on those: Next card, the comments opened, scrolled (the wheel over the panel, `scrollIn`) and closed, the creator's profile, a like only with --likes (rule 8); a session is drawn from ranges (`plan`). Its requests are in `docs/platforms/facebook/reels/` (rule 48).

**Rule 50.** 2026-10-20 · matt: the Reels warm-up builds the persona's For you feed by engaging with what it would engage with, from the datasets (the persona-conditioned Reels handoff he collated; `~/.logCli/datasets/SOURCES.md`). `log warmup facebook reel run --persona` keeps one persona per account (the three datasets he named), one real viewer from KuaiRand-1K (`src/warmup/viewer`, matched to the persona's scroll speed) and one persona pack (`buildPersonaPack`): every dataset gives a trait, said in its provenance, real or synthetic, including what the persona is into (`interests`). Each reel, the moment it lands, is read by SubQ from its frame (matt: SubQ analyses the images), with the caption and the persona: what it is, whether it is this persona's kind of content, the one action they'd pick. The action orderer (`planReel`, deterministic from the seed) then plans it: the watch is the viewer's next real play scaled by the interest effect measured on KuaiRand-Pure's random log (their kind ×1.10-1.67, outside ×0.90-0.99; likes ×1.28 against ×0.95, comments ×1.40 against ×0.93, `scripts/datasets/buildInterestEffect.ts`), and at most one action (U = p × interest effect × segment weight × attention fit, a like cooldown of 3 reels, only what the run allows, rule 8), a close call settled by the read's pick. The watch counts from when the reel landed, so SubQ's answer is the glance. rea still reads each step at once without holding up the next (`reaLater`, rule 29); a dwell doesn't wait for the network, a swipe only for the next reel's URL, and the cursor rests on Next card between quick swipes. Save, follow and share aren't built.

**Rule 51.** 2026-10-20 · matt: proxy traffic is money. Reels ran 2Captcha's traffic out (about 4.5 MB a reel through the residential proxy), so each account has a budget of its own traffic for 24 hours, 1 GB by default (`--trafficMb`). A warm-up reads 2Captcha's counter before and after, refuses to start over the budget (`trafficBudgetSpent`), checks every 5 reels and stops at it, and writes each run's use to `~/.logCli/proxyTraffic.jsonl` (`src/proxyVendor/traffic`).

**Rule 52.** 2026-10-20 · matt: proxies are provider-agnostic, and Byteful is added beside 2Captcha (this widens rule 43). Twenty keeps one `proxy` URL per account, whichever provider it came from. The provider is read from its host (`vendorOfProxy`, `src/proxyVendor/vendor`), and each provider is a domain of its own (`src/proxyVendor/twoCaptcha`, `src/proxyVendor/byteful`). `log proxy assign --vendor byteful` takes a sticky (24 h) Byteful residential proxy in the account's city and checks it (home country, 100 km, speed) before saving, as for 2Captcha. `log proxy balance` shows every provider set up, and `log proxy static` lists Byteful's static IPs with where each is. A traffic-billed proxy is metered by its own provider (rule 51); a static IP is not. log-cli never buys from a provider (rule 41). Docs: `docs/proxyVendors/`; Byteful's own docs and API spec are in `RESEARCH/MARKETPLACE_PROVIDERS/proxies/byteful/`.

**Rule 53.** 2026-10-20 · matt: when something has to be found (a group to join, a provider, a price, a fact), it comes from an external source, never from memory or a guess: search with TinyFish through treg (`treg call tinyfish.web.search`, `tinyfish.web.fetch`, free) as the basis for every lookup, and pull the actual candidates from it. A suggestion names where it came from (the page, the search), and a pick is one of what the search returned.

**Rule 54.** 2026-10-20 · matt: a known state is resolved, never a reason to stop. When a page lands on a state log-cli already knows (a checkpoint's first page, a text captcha, the Remember password prompt, the login form, two-step, "automated behaviour"), its resolver runs: press the checkpoint's Continue (plain text, by its ref), `solve` the captcha (2Captcha, then Continue), Not now, signIn, code. Only what a person must clear stops an account (a video selfie, an ID or photo, a disabled account; rules 10, 23), and that is said to matt. A Claude Code hook (`.claude/settings.json`, `scripts/hooks/pageState.ts`) reads the latest step of every open browser after each tool call and each prompt, matches it against the known states (`pageStateOf`, `src/browser/flow/helpers/pageState.ts`) and puts the state and its resolver into the agent's context. A state not mapped yet is pressed through (its Continue) and added to the map.

**Rule 55.** 2026-10-20 · matt: the CLI, the MCP tools, the agent hooks and the live log line up, and a commit is refused when they don't. One hook list (`src/agentHooks/registry`) writes both hosts' files, Claude Code's `.claude/settings.json` and Codex's `.codex/hooks.json`: SessionStart and UserPromptSubmit say where every open browser is; PostToolUse (Bash, PowerShell, Monitor, every `mcp__log__` tool) gives a known state its resolver, and a failed step is an unconfirmed page (snapshot, then resolve); Stop keeps the turn going while a browser sits on a state log-cli resolves itself (rule 54), never on a person's state, and never twice on the same unchanged one; PreToolUse refuses a log run piped through tail/head (rule 26). The terminal CLI writes the same live log as the MCP, `~/.logCli/mcp/<day>.log`, so one Monitor shows a run however it started. lefthook's `agentHooks` (`bun run check:agentHooks`, pre-commit and pre-push) refuses drift: both hosts' files, every command an MCP tool or terminal-only, every MCP tool hooked, every hook script answering its events, every resolver a real command (`skills/agentHooks/SKILL.md`).

**Rule 56.** 2026-10-20 · matt: the README says what every command, MCP tool and hook does, with Mermaid diagrams kept as `.mmd` files, all generated from the code. Each command carries its full usage (`Command.usage`), so its flags are in one place: the terminal's usage, its MCP tool's description and the README's table (command, what it does, flags, MCP tool, the hooks that fire on it from a shell and over MCP, live log, rules) all come from it. `src/surface` builds the catalog (`catalog`), the diagrams (`docs/diagrams/surface|commands|hooks|pageStates.mmd`) and the README's section between the surface markers; `bun run docs:build` writes them. lefthook's `docs` (`bun run check:docs`, pre-commit and pre-push) refuses a README or `.mmd` that differs from the code, and a command that parses a flag its usage doesn't name, or names one it doesn't parse.

**Rule 57.** 2026-10-20 · matt: what every browser uses lives under `src/browser`, named for what it is, never under a browser's name (rule 46). `flow`, `inspect`, `run` and `proxy` moved from `src/camofox/` to `src/browser/`, beside `driver`, `adsPower` and `camoufox`: they drive AdsPower and Camoufox alike (rule 44). `src/camofox/` keeps only what is Camoufox's own: `device`, `session`, `worker`. The `browserParity` check allows these shared domains (`SHARED_DOMAINS`) and nothing else that isn't a browser.

**Rule 58.** 2026-10-20 · matt: no loose files. `python/` and `scripts/` hold domain folders only, as `src/` holds `{library}/{domain}/`. Python: `browser/` (browserDriver, adsPowerBrowser, visibleBrowser, proxyGate, harRecorder), `human/` (humanMouse, scrollMotion, recordMouse), `session/` (inspect, connect, publish, profile sessions, logWorker), `login/` (autoLogin), `device/` (deviceProfile), `errors/` (errorCodes, errorCatalog.json), `fixtures/`; each is a package (`__init__.py`), imports are by package (`from browser import proxyGate`), and a script run directly puts `python/` on its path. Scripts: `checks/`, `commitLog/`, `datasets/`, `docs/`, `hooks/`, `twenty/`. lefthook's `layout` (`bun run check:layout`, pre-commit and pre-push) refuses a file loose at the top of either, tracked or new, and a Python domain without its `__init__.py`.

**Rule 59.** 2026-10-20 · matt: the README describes log-cli as it is: browser-agnostic, working through AdsPower first, with more browser providers to come, each one more driver. Which browser each command runs on is code (`commandBrowser` in `src/browser/run`: the account's browser through the driver, Camoufox only while not on the driver yet, or none), and the README's Browsers section, its Browser column and `docs/diagrams/browsers.mmd` are generated from it. `check:docs` parses every diagram with Mermaid, as GitHub does, and refuses one that doesn't parse (a `;` in a note broke the hooks diagram on GitHub), a command summary that names one browser (unless it is that browser's own command or Camoufox-only), and a README heading outside the generated section that names one browser.

**Rule 60.** 2026-10-20 · matt: log-cli is platform-agnostic as well as browser-agnostic. Facebook (Marketplace and groups) is the first platform, and what is scoped by platform names it in every form: `log warmup <platform> <activity>`, with no form that skips the platform. Listaro's five Facebook activities are the Facebook activity `stages`: `log warmup facebook stages plan|record|run|log` (was `log warmup plan|record|run|feed`; those are refused with the form they became), their code in `src/warmup/facebookStages` (was `src/marketplace/warmup`), and their log the stage log (`~/.logCli/runs/warmup/stageLog.jsonl`, was the "activity feed", which clashed with the Facebook feed activity). Every command declares its platform (`Command.platform`: `facebook`, `any` or `byArgument`, a typecheck error without one), the README shows it in its Platform column, and `check:docs` refuses a `byArgument` command with a usage line that doesn't name the platform. The Facebook-only commands that don't yet take the platform in their name are listed in issue #20 (github.com/matthewdonsemail-lab/log-cli/issues/20), to be scoped as matt decides.

**Rule 63.** 2026-10-22 · matt: the platform comes first. Every command that acts on one platform is `log <platform> <command> …` (`log facebook warmup reel`, `log facebook join group`); there is no form without it. The poll is `log facebook poll <group> <account> <how long to poll>`. Old forms are refused with the form they became. This replaces rule 60's `log warmup <platform> <activity>` and settles issue #20. OpenMagpie's worker is `log facebook poll --request` (it was `read group --worker`), a read in the account's open browser. `bun run check:docs` refuses a usage line without the platform first. Top of this file; the table is `docs/commandNaming.md`.

**Rule 64.** 2026-10-22 · matt: the code is by platform first, as the commands are, "because each has different approaches": `src/<platform>/<area>/<domain>`. Facebook's groups are `src/facebook/group/{join,read,answer}` (were `src/group/…`, rule 45) and its warm-up `src/facebook/warmup/activities` and `src/facebook/warmup/stages` (were `src/warmup/facebook` and `src/warmup/facebookStages`, rule 49). What every platform's warm-up draws from stays shared: `src/warmup/persona`, `src/warmup/viewer`. Each area has an `index.ts` (`check:naming`). Top of this file.

**Rule 65.** 2026-10-22 · matt: Facebook group listening is the triage job of obris-dev/openmagpie#188, and it replaces rules 61 and 62. Everything is indexed in OpenMagpie, and only the matches reach Twenty. An account joins (`log facebook join group`). OpenMagpie polls, and its worker is `log facebook poll --request`, a read in the account's open browser. OpenMagpie keeps every post, its watch triages them (`semantic_filter`), and its `webhook` sends the matches to Twenty's `socialListening`. log-cli then acts on the NEW rows from the same account (not built yet). log-cli writes only the group's `readCursor`, `lastReadAt` and `lastReadReason` to Twenty. `agencyGroupPosts` and `agencyGroupComments` stay, unused. The host reads no group on its own. Comment reading is kept for acting on a match, for new posts only, and saves nothing. #28's scoring and alerts become OpenMagpie watches. Spec: `docs/groupListening.md`.

**Rule 70.** 2026-10-22 · matt: no code comments, because they cause context rot in the system designs. Code carries no comments and no docstrings: TS, JS and Python, line, block, JSDoc, `#` and docstrings alike. What a thing does is said by its name, its types, its tests, its skill and its docs, never by a comment beside it. lefthook's `noComments` (`bun run check:noComments`, pre-commit and pre-push, `scripts/checks/checkNoComments.ts`, Python through `python/checks/comments.py`) refuses any tracked code file that has one; `--strip` removes them. Generated code is exempt. `lefthook.yml` itself carries none.

**Rule 71.** 2026-10-23 · matt: an ad says the same thing several ways. An ad that goes out on more than one listing in a city carries copy versions (`agencyListings.copyVersions`, title-and-description pairs written by `skills/listingCopy`), at least as many as the listings it will have live in that city and never fewer than 3, every two titles differing by at least half their words (the city's not counted). Each copy (`campaign fill`, `heal`) takes the version least like what is live in its city and records it in `copyVersionId`; a replacement skips the lost copy's version. `log facebook listing lint`, `listing create` and `campaign fill` refuse a version that breaks a checkable copy rule, and `campaign fill` refuses too few (`notEnoughCopyVersions`). `src/facebook/marketplace/copy`.

**Rule 72.** 2026-10-23 · matt: a Marketplace location is never abbreviated. It is typed as "City, State" with the state written out ("Bethlehem, Pennsylvania") or "City, Country" ("Galway, Ireland"): "Bethlehem, PA" was offered only as the West Bank, and a bare zip offered Granada, Spain first (rule 68). A check blocks before any action: a place with an acronym, a state code, a zip or any number, or no state or country is refused with `locationAbbreviated` (`placeProblem`, `src/facebook/marketplace/location`; `python/location/placeName.py` in the sessions), in a listing's `locationQuery` (`listing create`, `lint`, `publish`, `campaign fill`), `log inspect do setLocation`, a flow's `location`, and the host's setLocation, which types the listing's `locationQuery` and never a zip. A written-out state counts as the US for the country check.

**Rule 73.** 2026-10-23 · matt: "IT MUST ALWAYS READ THEM." The number one rule of the stack, above rule 30 and every other: Facebook's internal API answers are the decision-making factor of what and when something is relevant, and the deterministic factor of the system. Every browser step reads the internal API answers it triggers and the requests it sent, keeps them past the prune, and decides on them, never on a page loading, a timer or the step having run. The MCP instructions put it first. Inspect steps read theirs since rule 74, and every flow, warm-up and host step on AdsPower that makes a call since 2026-10-23; the Camoufox-only machines don't yet (#35). Top of this file.

**Rule 74.** 2026-10-23 · matt: in the inspect flow, a state we can't decide is read by SubQ with everything around it, and said loudly to the agent. Only `log inspect` does this, because it is where flows are made to be run again and again. Every inspect step's internal API calls are taken out of its recording by code, with what was sent and what came back, in seconds from the step's first request (`exchanges.json`, `exchanges.md`). A step no known state names (`pageStateOf`) is collated into one bundle: the goal (`--goal`), the account (home, platform, browser, the proxy's exit), what we did (the action, the mouse, how long it took), every internal API call, the page text, the screenshot and the earlier steps. SubQ's Decisions API (`subq-snap-1.1`, up to 128 questions, a 384K-token context) is asked what it means, not what to do next: whether the goal was met, whether everything fits the account, whether something should never have come up, whether the page agrees with the API, whether our action caused it, and what each call says about the goal. The reading is printed first in the step's result and put into the agent's context by the page-state hook (`>>> UNKNOWN STATE`), so it is named before the flow goes on. The same works on any platform. `log inspect read <stepFolder>` reads a recorded step again. `src/subq/stepReading`.

**Rule 75.** 2026-10-23 · matt: the loud events trigger a Claude hook, and the model keeps going until the goal is done, with what went wrong written down as P.E.E. An inspect session has a goal (`--goal` on `start`, or `log inspect goal --set`). The goal is reached when a step's SubQ reading says so (`goalMet` at least 0.5). Until then the page-state hook's Stop event holds the turn ("Keep going with the next inspect step"), and puts the goal into the agent's context after each tool call when it changes. A step whose reading says it went wrong (wrong result, stopped by the platform, unclear, or SubQ failed) needs its finding before the next step: **Point**, the issue in one sentence; **Evidence**, quoted from the step's reading (the calls SubQ flagged, with what was sent and what came back), plus any of your own; **Explain**, why the evidence shows it and what caused it (`log inspect finding --step --point --explain`). Once the goal is reached, the turn is held until every finding says how it was fixed (`log inspect finding --fixes <n> --fix`). They are kept in the run as `goalFindings.jsonl` and `goalFindings.md`; `log inspect goal` shows them. What only a person can clear never holds the turn: it is said to matt. The hook holds the turn once per unchanged state, never twice on the same one. `src/browser/inspect/helpers/goal.ts`.

**Rule 76.** 2026-10-23 · matt: "make it the number one rule of AGENTS.md and README.md: if we don't know, we do this." When a step lands somewhere we don't know: read the internal API (rule 73), collate everything about the moment, ask SubQ what it means (rule 74), say it loudly, keep going until the goal is reached, write what went wrong as P.E.E. with its fix (rule 75), and name the state. It is the first section of AGENTS.md, the first section of README.md and the first MCP instruction. Top of this file.

**Rule 77.** 2026-10-24 · matt: a group's members are read from its People tab. `log facebook read members --account <a> --group <url|id> --count <n> [--secondsPerScroll <s>] [--maxScrolls <n>] [--owners] [--bypass] [--json]` (beside `read group`; MCP `readMembers`, no live twin) goes to `/groups/<g>/members` in the account's open browser (rule 35) and scrolls, nothing clicked (rule 8). The members come from each step's own recording (rule 73): the page's HTML gives the first 10, and every scroll's `GroupsCometMembersPageNewMembersSectionRefetchQuery` answers about 10 more each, two a scroll (inspect 20261024T060921): name, profile, bio, page category, followers and when they joined. matt: "the time it takes for 40 scrolls is interesting and should also be a variable": `--secondsPerScroll` (default 15) is the wait before each scroll, and it says up front "count N → ~S scrolls, ~M min at Xs per scroll". It stops at `--count`, when the list ends (`has_next_page` false) or at `--maxScrolls`. `--owners` keeps a bio naming owner, co-owner, founder, CEO, president, proprietor or self-employed, or a page (a category set). The members go to `~/.logCli/members/<group>/<run time>.tsv` and `.json`, never to Twenty. A members page whose refetch answered with members is the known state `groupMembersList`, which needs nothing: no resolver, no SubQ reading, and the Stop hook doesn't hold the turn on it. `src/facebook/group/members`, `docs/groupMembers.md`.

**Rule 79.** 2026-10-25 · matt: "we can't do that in production, that's why we need it deterministic." A flow step never depends on a page's exact wording or a person stepping in. A control is picked by one scored match (`python/browser/controlMatch.py`): its role, then its name as the accessible name, aria-label, label, text or placeholder, case and spacing ignored, inside the dialog the step names (`within`, taken from the recording's snapshot) or an open dialog over the page behind it; two equal matches are refused (`controlAmbiguous`), none is `controlMissing`, a disabled one is waited for (`controlDisabled`). Every step waits for the call it must cause (`expect`: a mutation, a plain endpoint such as `profilePictureUpload`, or a dialog query) and checks its answer (rule 73) before the next one fires. `log facebook preflight` says before any browser opens what would stop each account (home timezone, hours, proxy country and speed, the browser kernel, launches and host opens left, a session left open, its picture on disk); `--apply` downloads a missing kernel and the host waits for one. A session whose process is gone is dropped. Snapshot excerpts of each page version are test fixtures (`python/fixtures/controls/`). Before a flow's first click it clears the known overlays with Escape, each checked: the browser-notifications notice (gone from the page) and an ended "What happened" notice (`useAccountStatusClearEnrollmentEntryPointActionMutation` answers `xfb_ixt_gateway_clear_flow: true`); one that stays stops the flow with `overlayNotCleared`.

**Rule 80.** 2026-10-25 · matt: X (Twitter) is log-cli's second platform, built around a vendored client the way Facebook's direct API is built around fbk: twikit (`vendor/twikit`, unclecode's fork) and twitter-controller (`vendor/twitterController`, the code being ported). Its commands are `log twitter <command>` (`src/twitter/<area>/<domain>`, `python/twitterApi/engine.py`), declared `directApiOnly` in `DIRECT_ROUTES`. matt: "No: X accounts call X directly as the controller does today": no proxy is required or used for an X account, and rule 12 stays Facebook's. X's own answer decides (`socialAccounts.sessionState`: loggedIn, loggedOut, restricted), each account has its own governor under `~/.logCli/twitter/<account>`, and X's refreshed cookies are merged back into the row. Discovery stays treg's (rule 53). First command: `log twitter session check`. Plan: `docs/twitterPlatform.md`.

**Rule 81.** 2026-10-25 · matt: we own `vendor/twikit` and keep it up to date ourselves, since nobody upstream maintains it. Its HTTP transport is curl_cffi, the way `vendor/fbk` does it, never httpx: `self.http` is a curl_cffi `AsyncSession` pinned to one impersonation target (`IMPERSONATE`, `safari17_0`, matching twikit's Safari user agent), redirects not followed (as httpx did), the proxy kept in the session's `proxies`, media chunks sent as a `CurlMime`. Only the transport changed. `python/checks/twikitTransport.py` finds every httpx touchpoint by syntax tree (`--map`), rewrites the ones with a curl_cffi equivalent (`--apply`) and refuses any left (`--check`, `bun run check:twikitTransport`, pre-commit and pre-push); `vendor/twikit/tests/test_transport.py` holds the behaviour.

**Rule 83.** 2026-10-25 · matt: a new platform is made with one command, written normally: `log new platform <name>` (MCP `newPlatform`). It writes the platform's account session on the shared `src/platformKit/session`, `log <name> session check` with its MCP tool, a direct-API engine in `python/<name>Api` on the shared `python/platformKit/engine.py`, and `docs/platforms/<name>/README.md`, and wires it into the repo by editing each file through its syntax tree (`PLATFORMS`, `PLATFORM_LABELS`, `COMMANDS`, `createContext`, `CommandContext`, `DIRECT_ROUTES`, `COMMAND_RULES`), checking every edit landed before anything is written. Without `--apply` it only lists what it would do; nothing is overwritten; it names what Twenty is missing (the `socialAccounts.platform` option) and never changes Twenty. Routes and rules are keyed by the platform-qualified name (`commandKey`: `read`, `twitterSession`, `redditSession`), so two platforms' commands never share one. lefthook's `platforms` (`bun run check:platforms`, pre-commit and pre-push) refuses a platform missing its label, src, command, engine, session route, rules or docs. `src/scaffold/platform`, `src/cli/new`.

**Rule 84.** 2026-10-25 · matt: `log inspect` and the account's AdsPower browser work on every platform, not only Facebook, so a new platform is explored the same way (rules 29, 48). One table says what each platform is, `PLATFORM_SITES` (`src/cli/runner/helpers/platforms.ts`): its Twenty value, cookie domain, hosts, home page, whether it needs a proxy and whether it has a browser path. Facebook needs its proxy (rule 12, unchanged; the gate refuses a direct run for it); X has no browser path (rule 80). matt, for Reddit: "no proxy, like X": a platform marked `proxy: none` opens its AdsPower profile with no proxy, the gate reads this machine's own exit and the profile's timezone follows it; an account with no home runs in en-US on the machine's timezone. `log inspect` goes only to known platforms' hosts, opens on the account's platform home, carries the account's own cookies in, and names each internal call by Facebook's friendly name or a GraphQL `operationName`/`operation`, else its path. `log adsPower sync` gives a profile to every browser platform's accounts (a no-proxy one needs no home). A row whose `accountName` is empty is found by its `name`. `log new platform` writes the platform's row (`--hosts`, `--home`, `--noProxy`, `--noBrowser`), and `check:platforms` refuses a platform without one.

**Rule 85.** 2026-10-25 · matt: "THE WHOLE POINT IS TO GO THROUGH REA." Every platform's internal calls go through rea, their code as well as their network, never Facebook's alone. `log facebook capture --docs` builds every browser platform's request docs (`docs/platforms/<platform>/`): it takes each run's calls to that platform's hosts (`PLATFORM_SITES`), names each by its GraphQL operation or its path without ids, finds the code that sends it in the platform's own bundles by syntax tree (an operation by its exact name, a path where it is fetched), and rea reads each call's slice (`src/rea/platformClient`). A call whose code isn't in the bundles keeps its step's rea reading. The docs gate (`check:facebookClientDocs`) refuses a platform's doc that rea hasn't read or whose reasoning isn't written. The first Reddit run: 39 calls, 33 read from their code, the other 6 from their step.

**Rule 86.** 2026-10-26 · matt: "if I say to do something it can force past it." An X send can go past the account's governor (its pause after a block, its hourly, daily and write caps) when matt says so: `--force` on `log twitter reply|quote|like|dm` and `log twitter queue run` (MCP `force`). Only for that call or that run, only when matt asked; never by default. X's own answer still decides (rule 73) and the queue's own cool-offs still apply. The answer says what it went past (`forcedPast`). The governor still counts the request.

**Rule 92.** 2026-10-25 · matt: the self-check's languages are checked by order. AdsPower's browser (SunBrowser 154) adds `en-US, en-GB` after the profile's own languages, whatever the profile says (Kamloops, 2026-10-24: `en-CA, en, en-US, en-GB`, three starts refused). The self-check passes when `navigator.languages` starts with the pinned languages (`en-CA, en`), in page and worker, so the account's language still comes first; extras after them are allowed. `language`, Intl and the number locale are still exactly the pinned locale (rules 16-17).

**Rule 93.** 2026-10-27 · matt: "we need to build a knowledge base inside of it", all of it, agent memory too, with Redis. The knowledge base lives in ListeningKit's Twenty on node02 (`knowledgeArticles`: key, kind, body, source, tags, author, content hash; reached over the tailnet at `node02.tail4fcf85.ts.net`, never through the public login gate) and is searched through Redis 8 on node02 (`kb-redis`, the search module's `kbIdx`: BM25 keyword and HNSW meaning over local all-MiniLM-L6-v2, fused with reciprocal rank fusion). `log kb sync` collects AGENTS.md's rules and sections, every skill, every doc (`docs/infra/` as infra, never `docs/vendors`), every Claude memory file, the known page states and the accounts from log-cli's Twenty (no credential, proxy URL or cookie), writes what changed to Twenty and re-indexes what changed into Redis; an article a person writes or edits in Twenty is indexed on the next sync. `log kb search "<query>" [--kind]` is how an agent finds context, `log kb remember "<text>"` saves an agent memory to both at once, `log kb show <key>` reads one in full. Secrets are scrubbed before anything is written (named keys, URLs with a login, JWTs, private keys, long random strings). The logins are files in `~/.config/listeningkit/`, never in the repo or the knowledge base. `src/knowledge/base`, `docs/knowledgeBase.md`.

**Rule 94.** 2026-10-29 · matt: "whatever you did in such quick succession lead to my account getting disabled, never do that again." Never act on an account in quick succession. What happened (matt's Discord, `sourcedandsoldtothehighestbidder`, 2026-10-29 00:47-01:00 UTC): in about 13 minutes an agent replied in 3 chats, read 1,400 messages from a server (Finn Automated) with a scratch script that went around log-cli (`.scratch/finn/dc.ts`: its own fetch to `discord.com/api/v9` with the session token, pages back to back, retrying straight through 429s), pulled the account's relationships, then opened new DMs to strangers from that server 30 s apart. Discord disabled the account. From now on: - Every call to a platform goes through log-cli's own commands and their governor. Never a hand-rolled script with an account's token or cookies. - A 429 or a failed send stops the run. It is never retried through, and the next action waits for matt. - Reading a server, group or member list in bulk is its own session. It never runs in the same session as sending. - Cold DMs to people the account has never talked to go out at most a few a day, minutes apart, never back to back. Each new DM channel opened counts as a write. - After a block, disable, captcha or cooldown, nothing resumes on that account until matt says so.

**Rule 95.** 2026-10-30 · matt: the tool definitions fill the agent's context with how matt works, so every agent knows how to do every job. The work matt asks for again and again is written as use cases, `docs/useCases/<platform>/<page>.md`: each one says how he asks for it, then its steps in order, each naming its tool and what counts as done. The log MCP serves them like Paper's MCP serves its guides: short instructions that say to load `getGuide({ topic: "logMcpInstructions" })` first (it lists every use case and how matt asks for it), `getGuide({ useCase: "<platform>/<page>" })` for one page, and every tool's description naming the use cases that call it and its guide. When matt asks for work a use case covers, the agent follows that page, never improvises. Every tool declares `anthropic/maxResultSizeChars` so a guide arrives whole. lefthook's pre-commit `useCases` (`bun run check:useCases`, `src/useCases/review`) takes this session's transcript (matt's asks and the tools called) and asks SubQ, for every page, whether it is still the right way to do that work, stale or should move, and whether the session did repeatable work no page covers. A stale page or uncovered work stops the commit until the page is updated or written and staged.

**Rule 96.** 2026-10-31 · matt: "the new twitter budget 90". An X account makes up to 90 writes a day (dms, replies, quotes, likes, reposts, follows, posts), not 40 (`WRITES_PER_DAY`, `src/directApi/engine`, handed to the X engine's governor in each run's spec). Discord keeps 60, every other platform 40. X's own answer still decides: a 344 (its daily limit) stops the run, and nothing more goes out until matt says so. `log twitter repost` (MCP `twitterRepost`, `twitterRepostLive`) reposts one post, a write like the others.

**Rule 97.** 2026-10-31 · matt: "the ability to have everything done locally". Accounts live in a local file, `~/.logCli/localAccounts.json` (`LOG_LOCAL_ACCOUNTS` moves it), on every platform, and this narrows rule 13 for accounts only. `log localAccount pull` copies every Twenty account in, cookies and login included, each keeping its Twenty id so its listings and groups still find it; `add` makes one Twenty never had (with its AdsPower profile); `list` shows them. `LOG_ACCOUNTS=local` (`.env.local`) leaves Twenty out of accounts entirely, and a session a run captures or refreshes is saved back to the file. Listings, groups and conversations stay in Twenty.

**Rule 98.** 2026-10-31 · matt: "So the opener always relevant. Don't just go in for the jugular. Go in with the opener." A first message to someone matt has never talked with is the opener and nothing else: about them and something they posted (or reposted, or that they reposted him), always relevant, and never the ask: no pitch, no "you using treg yet", no call, no link to his own stuff. The ask waits until they have answered. `log voice` fails a first message with an ask in it (`openerOnly`, `src/twitter/copy/voice`), and someone with nothing relevant to open on isn't messaged yet. `docs/useCases/twitter/engagerDms.md`, `networkMaxing.md`, `GUIDES/MATT_WRITING_STYLE.md`.

**Rule 99.** 2026-10-31 · matt: "network maxing is basically making it so the conversation will be getting to know about them and what they're doing. But the whole point of it is to expand our network, which is the niche map." Network maxing grows the niche map (the people around the communities and creators in his niche, with their role, whether they follow him and how close they are). New people come from it first: real roles, closest first, not yet talked to. Every message is about them and what they're doing, never what matt sells (rule 98 for the opener). Where the map lives is in the agent memory, not in the repo. `docs/useCases/twitter/networkMaxing.md`.

**Rule 100.** 2026-10-31 · matt: "reactions are indicators of open messages, so we can then add that as a thing we can follow up on", then "for our already opened messages". When someone's last event is a reaction to matt's message, or their read receipt is past his last message (X Chat's read-marker events, the old DM API's `last_read_event_id`), they opened it and didn't type back: it isn't a reply waiting on him, it's a follow-up to send. `log twitter dms --waiting` lists those apart (`reactedOnly`, `openedNoReply`, `followUpDue`, `src/twitter/dm/person`; `openedByThem` on each thread; `--json` gives `followUps`), and the follow-up is the network-maxing kind: about them and what they're doing, never the opener again and never the ask. `docs/useCases/twitter/networkMaxing.md` ("Everyone who reacted"), `dmInbox.md`.

**Rule 101.** 2026-10-31 · matt: "increase it to be 240 writes to twitter". An X account makes up to 240 writes a day, not 90 (this replaces rule 96's number; `WRITES_PER_DAY`, `src/directApi/engine`). X's own answer still decides: a 344 stops the run and nothing more goes out until matt says so. Discord keeps 60, every other platform 40.

**Rule 102.** 2026-10-30 · mandeep: LinkedIn goes out looking like a browser, the way X does (rule 81). `vendor/openLinkedinApi` reaches LinkedIn only through one curl_cffi `Session` in `open_linkedin_api/transport.py`, pinned to one impersonation target (`IMPERSONATE`, `chrome150`, the closest to the Chrome its cookies come from), sending the target's own user agent, never the library's fixed one or plain `requests`. `python/checks/linkedinTransport.py` refuses anything else (`bun run check:linkedinTransport`, pre-commit and pre-push). Every LinkedIn call runs through the account's governor (`python/platformKit/engine.py`), and a LinkedIn account writes at most 10 times a day (`WRITES_PER_DAY`), not 40 (rule 91).

**Rule 104.** 2026-11-01 · matt: "the timing stuff there i saw you hand rolled the outbound stuff when it should be queued and it has to have random intervals, but the bundle itself actually reveals more information". On 2026-11-01 matthewsoldit got a soft block, then X's 226 ("looks automated") on a reply. The live log showed 8 thread reads fired in 0.2 s by two parallel helpers while sends went out from a hand-written loop, and every `log twitter` call was a fresh client that loaded x.com's home page and its signer before acting, so a 3-line dm was 3 cold starts in 9 s. X's own web client (`sign.o` in its x-web bundle, read 2026-11-01) loads the page once and signs every call from it. From now on: more than one send goes through the queue (`log twitter queue build|plan|run`, random times), never a hand-rolled loop and never helpers reading or sending on one account in parallel. The X engine takes one call per account at a time (`engine.lock`, refused with `accountBusy` after 15 min), waits 4 to 11 s after the last call, and keeps the transaction key in `clientTransaction.json` for 3 hours (`python/twitterApi/engine.py`, `vendor/twikit` `ClientTransaction.state` and `restore`).

**Rule 105.** 2026-11-01 · matt: "we cannot be opening multiple sessions there, that defeats the core purpose of what we use this tool for ... it should always be one, and then it needs to loudly create issues". An X account has one session, always. Every X call (CLI, MCP, hooks, the queue, the X Chat watch) goes through the account's one engine host (`python/twitterApi/host.py`, started on the first call, closed after 30 idle minutes or when the engine code changes): one twikit client, one connection, one cookie jar and one transaction key, the way X's own web app keeps one page and signs every call from it (x-web `startup-dynamic`, read with rea 2026-11-01). A second host can't start (`host.lock`); a call that can't reach the host is refused with `xSessionHostDown` and sends nothing, never falls back to a session of its own. The hook's account line shows the open session (pid, since, calls). `LOG_TWITTER_HOST=inline` runs the old way, for tests only.

**Rule 106.** 2026-11-01 · matt: "when doing stuff like changing the code or anything, ensure that there hasn't been any changes to it locally, like to the engine ... you're not allowed hand-rolled commands, it always has to be through the MCP basically". Two things, enforced by the hooks: - **Through the MCP only.** Every log action an agent takes goes through the log MCP tools (`mcp__log__…`), never a hand-run `log …` or `bun bin/log.ts …` from a shell. The PreToolUse hook (`liveLogs`, `handRunDenial` in `src/agentHooks/liveLog`) refuses one and names the MCP instead. Only the terminal-only prompts (`TERMINAL_ONLY`: launch, login, mcp, chat pin, cookies save, messenger pin) are run in a terminal, by matt. A stale MCP server is said to matt (restart the app), never worked around. - **Local changes first.** Before changing code, check what is already changed and uncommitted in the checkout. The engines hook says it loudly at session start and whenever it changes (`>>> UNCOMMITTED LOCAL CHANGES`, `localChangesLine` in `src/mcp/freshness`): read each one's diff, and never overwrite, revert, stage, publish or ship someone else's uncommitted work without matt.

**Rule 107.** 2026-11-01 · matt: "the queue connects to the one process, and it can do these at the same time, yet it's only on one". An account has one queue, and everything it sends goes into it: the dms, the reply-guy replies and the answers to people who message, together (each item keeps its own action). `log twitter queue add <queue> --targets <file> --action dm|reply|quote --by <who>` puts more in, even while it runs: the run takes them in as it waits and fits each one between what is planned, at least the queue's minGap apart, and one due sooner than the send it waits on goes first. `queue run --keepOpen` keeps the run going once it has sent everything, taking in what is added, until it is cancelled. So one run sends all of an account's work through its one X session (rule 105), never a second queue or run beside it. `src/twitter/queue` (`addToQueue`, `fitTimes`, `takeIncoming`, `mergeAdded`).
