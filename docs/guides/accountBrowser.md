# accountBrowser

An account's one browser on any platform: opening it through its gates, inspecting a page step by step, where every open browser is, the live view for signing in, AdsPower profiles and local accounts.

Load next, when the work needs it: getGuide({ topic: "sessions" }) (Whether each account's saved session still works, from the platform's own answer, with the next step to sign it back in; and log's own sign-in for a team (login, logout, whoami)); getGuide({ topic: "flows" }) (Recorded flows and the warm-up on any platform: a recording turned into steps that run in the account's open browser, each step checked against the call it must cause); getGuide({ topic: "facebookBrowser" }) (A Facebook account's browser for its day: preflight, opening and signing in, the host and its lifecycle, the profile and Messenger PIN, its accounts and the account checks).

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "discord/groupChatRead" })` | Reading a Discord group chat without Twenty | "read the <group> chat over the last <N> hours", "what did <someone> set up in <group>" |
| `getGuide({ useCase: "facebook/marketplaceListings" })` | From accounts to live Marketplace listings | "post a marketplace listing in <town>", "get listings up on facebook marketplace in every town", "set up the facebook accounts and publish the listings", "take the marketplace listing down". |
| `getGuide({ useCase: "inbox/signIn" })` | Signing an account in: checking it, then the live browser | "sign in to my account", "is my x account logged in", "check my accounts", "log me back into instagram", "my session expired", "check the status of my accounts", "open the browser so I can sign in" |
| `getGuide({ useCase: "instagram/newPlatform" })` | Bringing a new platform up, then vendoring its client | "make a new platform via the MCP for <platform>", "open <platform> in AdsPower", "find me via the gh api the most likely to go into the vendor", "make it work" |
| `getGuide({ useCase: "slack/dmReply" })` | Reading and answering a Slack DM | "read the messages with <someone> on slack", "reply to <someone> on slack", "what did <someone> say in <workspace>" |

## The tools in this guide

Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.

| Tool | What it does | Usage |
|---|---|---|
| `adsPower` | AdsPower: Local API status, its profiles, and one profile per Twenty… | `log adsPower <status\|profiles\|sync> [--apply] [--account <a>] [--homes <US,IE>] [--json]` |
| `localAccount` | Accounts kept in a local file instead of Twenty | `log localAccount <add\|list\|pull> [--platform <p>] [--account <a>] [--adsPower <id>] [--proxy <url>] [--home <CC>] [--refresh] [--json]` |
| `inspectStart` | Open the account's browser through every gate and keep it open | `log inspect start --account <accountName> [--goal <text>] [--url <the platform's own page>] [--bypass] [--now] [--noIdleMouse] [--detach]   (one session per account: two accounts can be open at once; --detach runs it as its own process and returns once it is open)` |
| `inspectDo` | Send one step to the open browser | `log inspect do <goto <url>\|snapshot\|back\|wait [s]\|click <ref>\|type <ref> <text>\|press <key>\|upload <ref> <file>\|highlight <role> <name>\|solve\|signIn\|code\|pin\|stop> [--live] [--goal <text>] [--timeout <s>] [--json] [--account <accountName>]   (--account picks the session when more than one is open; every step's internal API calls are read, and a step no known state names is read by SubQ against the goal, rule 73)` |
| `inspectDoLive` | Send one step to the open browser, live on the platform | `log inspect do <goto <url>\|snapshot\|back\|wait [s]\|click <ref>\|type <ref> <text>\|press <key>\|upload <ref> <file>\|highlight <role> <name>\|solve\|signIn\|code\|pin\|stop> [--live] [--goal <text>] [--timeout <s>] [--json] [--account <accountName>]   (--account picks the session when more than one is open; every step's internal API calls are read, and a step no known state names is read by SubQ against the goal, rule 73)` |
| `inspectRead` | Read a recorded step again | `log inspect read <stepFolder> --account <accountName> [--goal <text>] [--json]   (read a recorded step again: its internal API calls, the page and the earlier steps, by SubQ when no known state names it)` |
| `inspectMap` | The recorded steps as states and transitions | `log inspect map [<runDir>] [--all]  (the recorded steps as states and transitions: flow.md, machine.json; default the latest run; --all collates every run)` |
| `inspectGoal` | The session's goal, whether a step's reading says it is reached, and… | `log inspect goal [--set <text>] [--account <accountName>] [--json]   (the session's goal, whether a step's reading says it is reached, and its P.E.E. findings: what went wrong, the evidence, why, and how it was fixed; rule 73)` |
| `inspectFinding` | Write a P.E.E | `log inspect finding --step <step> --point <text> --explain <text> [--evidence <text>] [--account <accountName>]   (a step that went wrong: Point, the issue in one sentence; Evidence, quoted from the step's reading, plus your own; Explain, why the evidence shows it and what caused it)` |
| `inspectSessions` | The open sessions | `log inspect sessions   (the open sessions)` |
| `browsers` | Where every open browser is, and what resolves its page | `log browsers [--json]   (every open browser: its step and page, the known page state it sits on, the call that resolves it, and what only the owner can clear)` |
| `browserView` | The account's live browser | `log browser view --account <accountName> [--json]   (the account's live browser: whether it needs a person to sign in, the page state and its revision; when log runs on the person's own machine the sign-in is in the browser window there, and from a remote runtime an MCP Apps host shows it inline through browserView)` |

## The work, step by step: inspect

From `skills/inspect/SKILL.md`.

## inspect

The order is: open the page, look at it, then write the code (rules 25, 29).
This is camofox-mcp's model (accessibility snapshots with element refs) on
log-cli's own launch, in the account's own browser (rules 35, 44).

### Hard boundaries

1. **One launch, every gate** (rules 19, 35): headed, proxy in
   country, the account's device and locale, the self-check, the raw HAR, the
   launch budget. `--bypass` only for the owner's runs outside waking hours.
2. **Read-only unless the owner asked** (rule 8): `goto`, `snapshot`, `back`,
   `wait` read; `click`, `type`, `press` act on the platform and need `--live`
   (over MCP, `inspectDoLive` with confirmLive).
3. **Live** (rule 26): run `start` through Monitor; every step prints as it
   happens.
4. One session per account: two accounts can be open at once, and `--account`
   picks the session (`log inspect sessions` lists them).

### The routine

```bash
## terminal 1 (or Monitor): the browser stays open until `do stop` or 30 idle minutes
log inspect start --account <a> --url <url> 2>&1 | tee <log>

## terminal 2: one step at a time
log inspect do snapshot
log inspect do goto <url>
log inspect do click e12 --live        # only when the owner asked
log inspect do stop
```

Each `do` prints where the page is, the requests the step made to the platform
(GraphQL by name, redirects with their target), rea's Evidence ID, and the
page's elements with their refs. Everything is kept in order in
`~/.logCli/runs/inspect/<time>_<a>/steps/NN_<action>/`: `snapshot.yml`,
`screenshot.png`, `network.har`, `rea.json`.

### Reading every step (rule 73)

What each part must do is in the spec, [docs/specs/inspectRuleOne.md](../../docs/specs/inspectRuleOne.md).

Give the session its goal when you open it, in plain words:

```bash
log inspect start --account <a> --goal "<what the session must get done>" --detach
```

Every `do` then reads its own step:

- **The internal API, by code:** each call the step triggered, what was
  sent and what came back, in seconds from the step's first request. It's
  printed under "Internal API in this step" and kept in the step folder as
  `exchanges.json` and `exchanges.md`. A repeated call shows only what
  changed since its last call (the query as it was typed, letter by letter,
  with each answer). Code loading and cross-site media are left out.
- **A step no known page state names** goes to SubQ with everything around
  it: the goal, the account, what we did (the mouse, how long it took),
  every call, the page text, the screenshot and the earlier steps. SubQ
  says what it means. The reading comes first in the result, starting with
  `>>> UNKNOWN STATE`, and the page-state hook puts it into your context.
  **Name that state before the flow goes on.**
- **The goal is judged across the session, not one step.** Each earlier
  step carries what the platform saved in it (its mutations that answered
  OK), and `goalSoFar` counts them since the goal was set, this step
  included. "Like 2 to 3 posts" is reached only once 2 likes are saved.
  A goal set with `inspect goal --set` counts only the steps after it.
- `--goal` on one `do` overrides the session's goal for that step.
- `log inspect read <run>/steps/NN_action --account <a> --goal "..."`
  reads a recorded step again (over MCP: `inspectRead`).

Each reading is one SubQ call ($0.04 per million input tokens).
`reading.json` and `readingState.json` hold the answers and exactly what
was sent.

### Keep going until the goal is reached, and write what went wrong (rule 73)

With a goal set, the turn isn't over until a step's reading says the goal
is reached. The page-state hook holds the Stop and says what's missing:

1. **A step went wrong** (its reading: wrong result, stopped by the
   platform, unclear, or SubQ failed). Write its finding before the next
   step, as P.E.E.:

   ```bash
   log inspect finding --account <a> --step <NN_action> \
     --point "<the issue, in one sentence>" \
     --explain "<why the evidence shows it, and what caused it>"
   ```

   - **Point:** the issue, in one sentence.
   - **Evidence:** filled in from the step's reading (each call SubQ
     flagged, with what was sent and what came back). `--evidence` adds
     your own.
   - **Explain:** why the evidence shows it, and what caused it.
2. **The goal isn't reached yet.** Take the next inspect step towards it.
3. **The goal is reached.** Say how each finding was fixed:
   `log inspect finding --account <a> --fixes 1 --fix "<what fixed it>"`

`log inspect goal --account <a>` shows the goal, whether it's
reached, and every finding. The run keeps them as `goalFindings.md`. What
only a person can clear (an ID, a video selfie) never holds the turn: say it
to the owner.

Then write the code from it: the selectors and the order of clicks come from
`snapshot.yml`, the waits from what `network.har` shows the page asking for.
Rebuild the platform's request docs after.

Facebook's pages, worked examples, request docs and sign-in: `skills/facebookInspect/SKILL.md` (the facebookBrowser guide).

## The work, step by step: adsPower

From `skills/adsPower/SKILL.md`.

## adsPower

### Hard boundaries

1. **Twenty stays the source.** An AdsPower profile is the browser for one
   `socialAccounts` row, linked by `adsPowerProfileId`. The Twenty row is never deleted; a DEACTIVATED
   account, or one whose home is not in `LOG_ADSPOWER_HOMES`, gives its profile back (deleted from
   AdsPower, `adsPowerProfileId` cleared).
2. **No secret in AdsPower at rest.** Profiles are made with no proxy, password or 2FA key.
   `python/browser/browserDriver.py` puts the proxy on only to open, after the gate, and clears it at close.
3. **Same as Camoufox** (rule 44). An AdsPower session goes through the same gate and
   self-check (rule 35), session HAR (rule 19), human mouse and scroll. `docs/browsers.md`
   lists what's built; `bun run check:browsers` keeps every browser in step.
4. **Camoufox stays.** With `browserDriver` empty, an account with a linked profile opens on AdsPower
   and one without opens on Camoufox. Never remove it.
5. **Never print `ADSPOWER_API_KEY`.** It lives in `.env.local` and the local-scope MCP config.

### Environment

- The AdsPower app is running here: `log adsPower status` says "up".
- `.env.local` has `ADSPOWER_HOST` (default `http://local.adspower.net:50325`) and `ADSPOWER_API_KEY`.
- AdsPower's MCP server (`adspower-local-api`) is added at local scope. AdsPower's own skill is
  reinstalled with `npx skills add https://github.com/adspower/adspower-browser --skill adspower-browser`
  (vendor kebab-case names, git-ignored by rule 1).

### Commands

```bash
log adsPower status                 # the Local API answers
log adsPower profiles               # AdsPower's profiles, and the Twenty account of each
log adsPower sync                   # dry run: release / create / relink / linked / skip per account
log adsPower sync --apply           # give back DEACTIVATED and out-of-home profiles, make the missing ones, link them in Twenty
log adsPower sync --apply --homes US  # this run's homes (default LOG_ADSPOWER_HOMES)
log adsPower sync --apply --account <accountName>
```

Run `sync --apply` through Monitor (rule 26): it prints one line per account as it goes.
A `skip` is a banned or dead account, one with no home country in `HOME_COUNTRIES`, or one outside the
homes that holds no profile. What the sync must do: `docs/specs/adsPower.md`.
A failed create usually means the plan's profile limit: the AdsPower plan must hold at least as many profiles as accounts.

### Adding another browser

Write a `BrowserDriver` (`src/browser/driver/types.ts`): prepare, gate, start, selfCheck, stop.
Add its name to `BROWSER_DRIVERS`. The machine already enforces the order, so the new browser
can't skip the gate or the self-check. Details: `docs/adsPower.md`.

## The work, step by step: humanMouse

From `skills/humanMouse/SKILL.md`.

## humanMouse

The cursor is fitted to a recording of the owner's own hand, and every change is
checked with the same analyser that measured them.

### Hard boundaries

1. **Measured, not guessed.** A motion change comes from a number in a
   recording (theirs or ours), never from how it "should" look.
2. **One module drives every session** (`python/human/humanMouse.py`): the async
   inspect/flow sessions (idle loop, preempted by any step) and the sync
   publish/connect/profile sessions (`look()` before a step, `human_click`).
   Nothing clicks with Playwright's own `.click()` in an account session.
3. **humanize stays on**, capped per hop (`own_trajectory=True`).
   Nothing is injected into the page.
4. **Run it live** (rule 26), through Monitor.

### The loop

```bash
## 1. their hand: open a page with our cursor still, record 60 s, analyse
log inspect start --account <a> --url <url> --noIdleMouse --proxyMs 12000
python python/human/recordMouse.py 60                 # "GO": the owner uses the window; prints the summary
##   -> ~/.logCli/mouse/<time>.json and .analysis.json

## 2. ours: a session with the idle loop, a long wait step, the same analyser
log inspect start --account <a> --url <url> --now --proxyMs 12000
log inspect do wait 60
python python/human/recordMouse.py --analyze ~/.logCli/runs/inspect/<run>/steps/02_wait60s/mouseSamples.json
```

Compare: moves, move ms, px per 100 ms, straightness, side px, overshoot
share, where the speed peaks, stillness between moves, share still. Change
the constants in `humanMouse.py` (`duration_for`, `reach`, `loops`,
`rest_for`, `look_for`) toward their numbers, re-measure. The owner's 2026-10-19
recording: 15 moves/60 s, 0.42-0.45 s for 400-800 px, speed peak at 0.34 of
the move, 7/15 overshoot, median pause 0.2 s, still 14-25 %.

### What the recordings taught

- Each `page.mouse.move()` costs ~60 ms of round trip however small the hop;
  with humanize's default curve on top it was 100-530 ms. Draw the
  trajectory ourselves at ~15 Hz and keep humanize's per-hop cap at 20 ms.
- A chain of small moves stutters: each starts and stops. One Bezier walked
  with one velocity profile is a gesture.

What the mouse learned on Facebook's pages: `skills/facebookInspect/SKILL.md` (the facebookBrowser guide).

## The rules these tools fall under

Each by its number and first line. The full text is in AGENTS.md (`log://agents`); the core rules are in full in `getGuide({ topic: "logMcpInstructions" })`.

- **Rule 8.** Platform actions require the user authorization their tool defines.
- **Rule 19.** Every browser action records its raw HAR and timed step evidence, with no switch to disable capture.
- **Rule 26.** Stream progress while work runs, one meaningful line per stage, with the run log retained.
- **Rule 29.** Record a browser page with the existing inspect tool before implementing actions on it.
- **Rule 30.** Complete the authorized task.
- **Rule 35.** Browser work uses one account browser through its active day, with actions as tabs/steps; close only for a logged lifecycle reason.
- **Rule 38.** Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless the owner raises them.
- **Rule 39.** Use only the scope, options and intent the owner stated or implied.
- **Rule 40.** Do not propose physical infrastructure unless the owner asks.
- **Rule 41.** Paid work must stay within the authorized task and spend.
- **Rule 44.** Keep browser-independent actions on the shared Playwright layer.
- **Rule 73.** For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence.
- **Rule 94.** Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies.
- **Rule 105.** One platform/account owns one continuous engine session and push connection.
