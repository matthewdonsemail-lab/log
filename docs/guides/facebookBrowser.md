# facebookBrowser

An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "discord/groupChatRead" })` | Reading a Discord group chat without Twenty | "read the <group> chat over the last <N> hours", "what did <someone> set up in <group>" |
| `getGuide({ useCase: "facebook/marketplaceListings" })` | From accounts to live Marketplace listings | see the page |
| `getGuide({ useCase: "twitter/engagementReplies" })` | Answering the people who engaged with your posts | see the page |

## The tools in this guide

| Tool | What it does |
|---|---|
| `adsPower` | AdsPower: Local API status, its profiles, and one profile per Twenty… |
| `localAccount` | Accounts kept in a local file instead of Twenty |
| `lifecycle` | Each account's place in its lifecycle |
| `preflight` | Before any browser opens, check each account will get through |
| `doctor` | Check python, facebook-camofox-client, Camoufox, Twenty, and which… |
| `connect` | Sign a Facebook account in through its proxy |
| `profile` | Set an account's profile picture and cover photo from Twenty |
| `profileLive` | Set an account's profile picture and cover photo from…, live on Facebook |
| `hostStart` | Run the account's lifecycle in one open browser through its active… |
| `hostStartLive` | Run the account's lifecycle in one open browser…, live on Facebook |
| `hostSend` | Send an event to the account's running host |
| `hostStatus` | Where each host is |
| `inspectStart` | Open the account's browser through every gate and keep it open |
| `inspectDo` | Send one step to the open browser |
| `inspectDoLive` | Send one step to the open browser, live on Facebook |
| `inspectRead` | Read a recorded step again |
| `inspectMap` | The recorded steps as states and transitions |
| `inspectGoal` | The session's goal, whether a step's reading says it is reached, and… |
| `inspectFinding` | Write a P.E.E |
| `inspectSessions` | The open sessions |
| `check` | Check one account in its open browser |
| `scan` | Read Marketplace > Selling live for one account and update its… |
| `status` | Open one Marketplace item page live and classify its status |
| `watch` | Run the listing monitor |
| `browsers` | Where every open browser is, and what resolves its page |
| `logout` | Forget the stored Twenty session |
| `whoami` | Show who is signed in, refreshing the session if it expired |

## The work, step by step: inspect

From `skills/inspect/SKILL.md`.

## inspect

The order is: open the page, look at it, then write the code (rules 25, 29).
This is camofox-mcp's model (https://github.com/redf0x1/camofox-mcp:
accessibility snapshots with element refs) on log-cli's own launch. camofox-mcp
itself can't be used here: its browser server is headless-only on Windows
(rule 11) and launches outside the proxy gate (rule 12).

### Hard boundaries

1. **One launch, every gate** (rules 11-12, 15-18, 22, 24): headed, proxy in
   country, the account's device and locale, the self-check, the raw HAR, the
   launch budget. `--bypass` only for matt's runs outside waking hours.
2. **Read-only unless matt asked** (rule 8): `goto`, `snapshot`, `back`,
   `wait` read; `click`, `type`, `press` act on Facebook and need `--live`
   (over MCP, `inspectDoLive` with confirmLive).
3. **Live** (rule 26): run `start` through Monitor; every step prints as it
   happens.
4. One session at a time (`~/.logCli/runs/inspect/current.json`).

### The routine

```bash
## terminal 1 (or Monitor): the browser stays open until `do stop` or 30 idle minutes
bun bin/log.ts inspect start --account <a> --url https://www.facebook.com/me 2>&1 | tee <log>

## terminal 2: one step at a time
bun bin/log.ts inspect do snapshot
bun bin/log.ts inspect do goto https://www.facebook.com/me
bun bin/log.ts inspect do click e12 --live        # only when matt asked
bun bin/log.ts inspect do stop
```

Each `do` prints where the page is, the requests the step made to Facebook
(GraphQL by name, redirects with their target), rea's Evidence ID, and the
page's elements with their refs. Everything is kept in order in
`~/.logCli/runs/inspect/<time>_<a>/steps/NN_<action>/`: `snapshot.yml`,
`screenshot.png`, `network.har`, `rea.json`.

### Reading every step (rules 73-74)

Give the session its goal when you open it, in plain words:

```bash
bun bin/log.ts inspect start --account <a> --goal "Set the Marketplace location to Bethlehem, Pennsylvania" --detach
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
  included. "Like 2 to 3 posts" is reached only once 2 likes are saved:
  on Bethlehem's likes run, the first like now reads "not reached" (100%)
  and the second "reached" (78%). A goal set with `inspect goal --set`
  counts only the steps after it.
- `--goal` on one `do` overrides the session's goal for that step.
- `bun bin/log.ts inspect read <run>/steps/NN_action --account <a> --goal "..."`
  reads a recorded step again (over MCP: `inspectRead`).

Each reading is one SubQ call ($0.04 per million input tokens; the West Bank
step was about 49,000 tokens). `reading.json` and `readingState.json` hold
the answers and exactly what was sent.

### Keep going until the goal is reached, and write what went wrong (rule 75)

With a goal set, the turn isn't over until a step's reading says the goal
is reached. The page-state hook holds the Stop and says what's missing:

1. **A step went wrong** (its reading: wrong result, stopped by the
   platform, unclear, or SubQ failed). Write its finding before the next
   step, as P.E.E.:

   ```bash
   bun bin/log.ts inspect finding --account <a> --step 04_setlocationBethlehemPa \
     --point "Typing Bethlehem, PA saved the location in the West Bank." \
     --explain "Facebook matched PA to the West Bank, and the account was already in Lima, so the search ranked from Peru."
   ```

   - **Point:** the issue, in one sentence.
   - **Evidence:** filled in from the step's reading (each call SubQ
     flagged, with what was sent and what came back). `--evidence` adds
     your own.
   - **Explain:** why the evidence shows it, and what caused it.
2. **The goal isn't reached yet.** Take the next inspect step towards it.
3. **The goal is reached.** Say how each finding was fixed:
   `bun bin/log.ts inspect finding --account <a> --fixes 1 --fix "Typed the state out in full (rule 72)."`

`bun bin/log.ts inspect goal --account <a>` shows the goal, whether it's
reached, and every finding. The run keeps them as `goalFindings.md`. What
only a person can clear (an ID, a video selfie) never holds the turn: say it
to matt.

Then write the code from it: the selectors and the order of clicks come from
`snapshot.yml`, the waits from what `network.har` shows the page asking for.
Rebuild the Facebook client docs after (rule 27): `capture --docs`.

## The work, step by step: host

From `skills/host/SKILL.md`.

## host

### Hard boundaries

1. **One browser per account per local day** (rule 35). The host opens it
   through every gate; every step is a command to it; it closes only for a
   logged reason (end of day, shutdown, restriction, lost, crash).
2. **Signed in means the session cookies** (`c_user` and `xs`), never the
   page's wording. Signed out with no form: `/login/`. Two failed sign-ins in a
   row go to a person (`signInSpent`), never round again.
3. **Every page is checked for where it landed** (`pageProblem`): a checkpoint,
   a sign-out or a restriction is the step's outcome and goes to Twenty.
   **The warm-up decides each step on Facebook's answer** (rule 73): it waits
   for the step's call and applies its flow's `answers` with the account's
   home. The create page answering `marketplace_new_seller_can_post_item:
   false` is the issue `marketplaceMayNotPost`, and a location outside home
   `marketplaceLocationWrong`; both go to a person (matt decides).
   **The account check reads Marketplace status from its answer**:
   `/marketplace/status`'s `CometMarketplaceStatusContentContainerQuery`
   (`marketplaceAccessOf`). A ban, selling not `ELIGIBLE`, an enforcement or a
   profile not `GOOD` is the issue `suspended` (`accessProblem`); only when that
   answer didn't load is the page text read instead.
4. **Writes need matt:** `--live` for profile, name and Marketplace location
   (rules 8, 28); `--likes` for the warm-up's likes.
5. **Stop with SHUTDOWN, never by killing it,** so the browser closes for its
   reason and the session and device are saved (`log facebook host send ... SHUTDOWN`,
   or Ctrl+C).

### The routine

```bash
log facebook host start --account <a> [--live] [--likes] --gapSeconds 10 --watchMinutes 2   # watched; default 10 s / 12 min
log facebook check --account <a> [--bypass]   # the host's check once, by hand, in the open browser
log facebook host status [--account <a>]          # state, warm-up done, opens today, every close and its reason
log facebook host send --account <a> PERSON_DONE  # after clearing a checkpoint by hand in the window
log facebook host send --account <a> SHUTDOWN
```

The host reads no Facebook group on its own: OpenMagpie polls, and its worker
`log facebook poll --request` reads in the browser the host holds (rule 65).

Run `start` through Monitor (rule 26). A restart reads
`~/.logCli/runs/host/<a>/progress.json` and resumes: the warm-up activities
done, today's opens; a fresh browser opens and the router walks to the next
step. Too soon after the last launch (rule 24), the host waits the gap out.

A save Twenty refused keeps the run's device and session in
`~/.logCli/runs/unsaved/` (login removed): `log facebook account resave <a> --from <dir>`.

`opensSpent` or `launchBudgetSpent` ends the day. Only when matt asks, close
every browser (`log facebook host send --account <a> SHUTDOWN`), then run `log facebook account
resetOpens <a>|all --reason "<why>"` (rule 37). It deletes nothing.

Code: `src/marketplace/host` (the runner), `src/cli/host` (the steps),
`src/marketplace/lifecycle` (the machine). Doc: `docs/lifecycle.md`.

### The check (every watch round, rule 69)

Each round the host opens three pages in the browser it holds, reading each
from its step's own recording, nothing clicked:

1. `/marketplace/status`: may the account still sell (`access_state_title`,
   `is_marketplace_access_banned`, `profile_status`, `sell_on_marketplace`).
   Anything but full access is the account's `suspended` issue.
2. `/marketplace/you/selling`: each listing's state (active, being reviewed,
   sold, rejected) and its clicks into Twenty's `agencyListings` (status,
   `clicksCount`, `lastCheckedAt`). The clicks are the page's "N clicks on
   listing": how many times people opened the listing's details page in the last
   14 days, preloaded in the page's own HTML by
   `CometMarketplaceYouSellingFastContentContainerQuery` as the listing's
   `listing_insights.insights[0].count` (Bethlehem, inspect 20261023T000744,
   step 02).
3. `/marketplace/inbox?targetTab=SELLER`: the seller chats. None: said so. Some:
   counted and kept as Facebook sent them in the run folder, until a recording of
   a real chat maps a thread's fields (rule 29) and they go to Twenty's
   conversations (rule 34).

`log facebook check --account <a>` runs the same once.
Code: `src/facebook/marketplace/check`.

### Before the host opens (rule 79)

Run `log facebook preflight [--homes US] [--account <a>]` first. It opens no
browser and says, per account, what would stop it: no home timezone
(`noHomeTimezone`), outside its hours, the proxy's country and speed against
this run's `--proxyMs`, no AdsPower profile, the SunBrowser kernel the
profile's own user agent needs not downloaded (`adsPowerKernelMissing`: ua_auto
starts the Chrome version in the profile's user agent, read from AdsPower's
`/browser-profile/ua`, so Scranton needs 154 while Exeter needs 156; `--apply`
downloads each missing one once and waits), today's
launches and host opens spent, a live session holding it (a session whose
process is gone is dropped), and its profile picture not on this machine.
Exit 1 when any account is blocked. The host itself waits for its profile's
kernel while it is still downloading, before it opens, and `host start --now` skips the 10-minute
launch gap only (rule 30).

### Two-step when Facebook asks for a passkey

Some accounts land on "Use face scan, fingerprint or screen lock to confirm
it's you" (`twoStepPasskey`) instead of the code box. The host presses "Try
another way", waits for `TwoStepVerificationChallengePickerDialogQuery`, and
goes on only when its answer lists `TOTP` not disabled (`authAppOffered`; else
`twoStepNoAuthApp`, for matt). On the picker (`twoStepMethodPicker`) it chooses
"Authentication app", then Continue, and the code is typed from Twenty as
usual (rule 21). Mountain Top, host 20261024T222706, steps 12-26.

### The Marketplace location is the account's home

The host's setLocation types the account's own home written out
(`homePlace`: its city and the state or province from `CITY_REGIONS`,
`src/marketplace/home/types.ts`, through `fullPlaceName`, so it passes the
acronym check, rule 72): "Mountain Top, Pennsylvania", "Kamloops, British
Columbia". A listing's `locationQuery` is used only for a home with no region.
`log facebook preflight` shows each account's place and refuses one with no
region (`noHomeRegion`). Mountain Top's was Pachuca, Mexico, until it was set
this way (`CometMarketplaceSetBuyLocationMutation` answered city "Mountain
Top", 2026-10-24).

## The work, step by step: lifecycle

From `skills/lifecycle/SKILL.md`.

## lifecycle

### Hard boundaries

1. **The browser stays open.** One open per account per local day (plus one
   crash reopen); every action is a step or a tab inside it; every close has a
   logged reason (top of AGENTS.md, rule 35). Never add a command that opens a
   browser of its own.
2. **The machine is the spec.** Change the lifecycle in
   `src/marketplace/lifecycle/machine.ts` and its tests, then regenerate the
   doc: `log facebook lifecycle states --write`. Never hand-edit the generated tree.
3. **Final is final.** Restricted, banned, lost: the record stays in Twenty
   (rule 13); nothing resumes them.
4. **Live only with matt's go.** Warm-up likes, publish and replies need
   `liveActions` (rule 8).

### The routine

```bash
log facebook lifecycle                       # where every account is, and what it has left
log facebook lifecycle --account <name>      # one, with its standing
log facebook lifecycle states                # the state tree from the machine itself
```

A field the lifecycle reads is added through `scripts/twenty/twentySetup.mjs` and the
client regenerated (rules 13-14). A fact it reads from a past run (a rename, a
location) is backfilled only from that run's recording (rule 25), never guessed.

Full description: `docs/lifecycle.md`.

## The work, step by step: adsPower

From `skills/adsPower/SKILL.md`.

## adsPower

### Hard boundaries

1. **Twenty stays the source** (rule 13). An AdsPower profile is the browser for one
   `socialAccounts` row, linked by `adsPowerProfileId`. Nothing is deleted on either side.
2. **No secret in AdsPower at rest.** Profiles are made with no proxy, password or 2FA key.
   `python/browser/browserDriver.py` puts the proxy on only to open, after the gate, and clears it at close.
3. **Same as Camoufox** (rule 44). An AdsPower session goes through the same gate (rule 12),
   self-check (rule 17), session HAR (rule 22), human mouse and scroll. `docs/browsers.md`
   lists what's built; `bun run check:browsers` keeps every browser in step.
4. **Camoufox stays.** An account with no `browserDriver` keeps Camoufox. Never remove it.
5. **Never print `ADSPOWER_API_KEY`.** It lives in `.env.local` and the local-scope MCP config.

### Environment

- The AdsPower app is running here: `log adsPower status` says "up".
- `.env.local` has `ADSPOWER_HOST` (default `http://local.adspower.net:50325`) and `ADSPOWER_API_KEY`.
- AdsPower's MCP server (`adspower-local-api`) is added at local scope. AdsPower's own skill is
  reinstalled with `npx skills add https://github.com/adspower/adspower-browser --skill adspower-browser`
  (vendor kebab-case names, git-ignored by rule 1).

### Commands

```bash
bun bin/log.ts adsPower status                 # the Local API answers
bun bin/log.ts adsPower profiles               # AdsPower's profiles, and the Twenty account of each
bun bin/log.ts adsPower sync                   # dry run: release / create / relink / linked / skip per account
bun bin/log.ts adsPower sync --apply           # give back DEACTIVATED and out-of-home profiles, make the missing ones, link them in Twenty
bun bin/log.ts adsPower sync --apply --homes US  # this run's homes (default LOG_ADSPOWER_HOMES, rule 78)
bun bin/log.ts adsPower sync --apply --account <accountName>
```

Run `sync --apply` through Monitor (rule 26): it prints one line per account as it goes.
A `skip` is a banned or dead account, or one with no home country in `HOME_COUNTRIES`.
A failed create usually means the plan's profile limit: the AdsPower plan must hold at least as many profiles as accounts.

### Adding another browser

Write a `BrowserDriver` (`src/browser/driver/types.ts`): prepare, gate, start, selfCheck, stop.
Add its name to `BROWSER_DRIVERS`. The machine already enforces the order, so the new browser
can't skip the gate or the self-check. Details: `docs/adsPower.md`.

## The work, step by step: humanMouse

From `skills/humanMouse/SKILL.md`.

## humanMouse

The cursor is fitted to a recording of matt's own hand, and every change is
checked with the same analyser that measured him.

### Hard boundaries

1. **Measured, not guessed.** A motion change comes from a number in a
   recording (his or ours), never from how it "should" look.
2. **One module drives every session** (`python/human/humanMouse.py`): the async
   inspect/flow sessions (idle loop, preempted by any step) and the sync
   publish/connect/profile sessions (`look()` before a step, `human_click`).
   Nothing clicks with Playwright's own `.click()` in a Facebook session.
3. **humanize stays on** (rule 11), capped per hop (`own_trajectory=True`).
   Nothing is injected into the page.
4. **Run it live** (rule 26), through Monitor.

### The loop

```bash
## 1. his hand: open a page with our cursor still, record 60 s, analyse
bun bin/log.ts inspect start --account <a> --url https://www.facebook.com/marketplace/ --noIdleMouse --proxyMs 12000
python python/human/recordMouse.py 60                 # "GO": matt uses the window; prints the summary
##   -> ~/.logCli/mouse/<time>.json and .analysis.json

## 2. ours: a session with the idle loop, a long wait step, the same analyser
bun bin/log.ts inspect start --account <a> --url https://www.facebook.com/marketplace/ --now --proxyMs 12000
bun bin/log.ts inspect do wait 60
python python/human/recordMouse.py --analyze ~/.logCli/runs/inspect/<run>/steps/02_wait60s/mouseSamples.json
```

Compare: moves, move ms, px per 100 ms, straightness, side px, overshoot
share, where the speed peaks, stillness between moves, share still. Change
the constants in `humanMouse.py` (`duration_for`, `reach`, `loops`,
`rest_for`, `look_for`) toward his numbers, re-measure. His 2026-10-19
recording: 15 moves/60 s, 0.42-0.45 s for 400-800 px, speed peak at 0.34 of
the move, 7/15 overshoot, median pause 0.2 s, still 14-25 %.

### What the recordings taught

- Each `page.mouse.move()` costs ~60 ms of round trip however small the hop;
  with humanize's default curve on top it was 100-530 ms. Draw the
  trajectory ourselves at ~15 Hz and keep humanize's per-hop cap at 20 ms.
- A chain of small moves stutters: each starts and stops. One Bezier walked
  with one velocity profile is a gesture.
- Facebook's page sends requests all the time; the cursor must not freeze
  for them, only for the first ~2.5 s after a navigation.

## The work, step by step: profileSetup

From `skills/profileSetup/SKILL.md`.

## profileSetup

Listaro's warm-up guide sets a real-looking profile photo and a cover photo on
days 1-2 of a new account
(`Listaro_backup/content/blog/how-to-post-without-getting-banned.md`). This
does that for one account, both photos in one run (matt's choice).

### Hard boundaries

1. **Dry run first, `--live` only when matt asks** (rules 8, 28). Over MCP,
   `--live` is `profileLive`, with `confirmLive: true`.
2. **Read before clicking** (rule 25). The upload clicks in
   `python/session/profileSession.py` were written before the page was seen. The dry
   run writes every button, link and file input the profile page has to
   `profileFound.txt`; check the patterns (`PROFILE_PICTURE`, `COVER`,
   `UPLOAD`, `SAVE`) against it, and fix them, before the first `--live`.
3. **Only the two photos change.** With `profileName` set, the dry run also reads
   the name page (`nameFound.txt`); the rename itself is built from an inspect
   recording first (rule 29). Bio and every other field stay read-only.
4. **It is a launch** (rule 24): it counts against the 8 a day, 10 minutes
   apart, and needs waking hours (rule 18), the proxy gate (12) and a saved
   session (`log facebook connect` first).
5. **Run it live** (rule 26): through Monitor, every machine state prints.

### The routine

1. Put the photos in Twenty: `socialAccounts.profilePhoto` (a real-looking
   face, not a logo) and `coverPhoto` (business-related is fine), each a URL
   or a local path. URLs are fetched through the account's proxy, never from
   this machine, and every file is varied so its bytes are new
   (`media/photo`).
2. Look first (rule 29): `log inspect start --account <a> --url https://www.facebook.com/me`,
   then `log inspect do snapshot` (skills/inspect). The upload clicks come from that.
3. Dry run:

   ```bash
   bun bin/log.ts facebook profile setup --account <a> 2>&1 | tee <log>
   ```

   It prints each photo as `would upload`, `no photo set in Twenty` or
   `no control for it on the page`, and the run folder
   (`~/.logCli/runs/profile/<time>_<a>/`).
4. Read `profileFound.txt` in that folder and the step HARs (`firefox/steps/`).
   If the picture or cover control isn't the one the patterns match, fix the
   pattern in `python/session/profileSession.py` and its test, commit, and dry run
   again after the launch gap.
5. When matt says go: `--live`. The machine uploads the profile photo, then
   the cover; any failed step stops the run (nothing is retried on
   Facebook). A failed step saves `<item>Failed.txt` with what the page had.
   On success `profileSetAt` is set in Twenty.
6. Rebuild the Facebook client docs (rule 27): the profile requests are new.

   ```bash
   bun bin/log.ts facebook capture --docs
   ```

### Codes

| Code | Means | Do |
| --- | --- | --- |
| `profilePhotoMissing` | `--live` without both photos, or a photo that can't be read | Set both fields in Twenty |
| `profileControlNotFound` | No opener, no "Upload photo" item, no file input | Read `profileFound.txt` / `<item>Failed.txt`, fix the pattern |
| `profileUploadNotSaved` | Save never enabled, or the dialog stayed open | Read the capture; run again after the gap |
| `sessionExpired` | The profile wasn't signed in | `log facebook connect --account <a>` first |

## Every tool, in full

### `adsPower`

log adsPower <status|profiles|sync> [--apply] [--account <a>] [--homes <US,IE>] [--json]
AdsPower: Local API status, its profiles, and one profile per Twenty account (sync)
Usage: log adsPower status
       log adsPower profiles [--json]
       log adsPower sync [--apply] [--account <accountName>] [--homes <US,IE>] [--json]   (dry run unless --apply; a DEACTIVATED account, or one whose home isn't in --homes or LOG_ADSPOWER_HOMES, gives its profile back first)
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/marketplaceListings" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 42, 44, 78, 84, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `localAccount`

log localAccount <add|list|pull> [--platform <p>] [--account <a>] [--adsPower <id>] [--proxy <url>] [--home <CC>] [--refresh] [--json]
Accounts kept in a local file instead of Twenty: add one, with the account's browser profile, pull every Twenty account in, or list them
Usage: log localAccount add --platform <facebook|twitter|reddit|discord> --account <accountName> [--adsPower <profileId>] [--proxy <scheme://user:pass@host:port>] [--home <CC>] [--city <city>]
       log localAccount list [--json]
       log localAccount pull [--platform <p>] [--refresh] [--json]   (copies every account Twenty has, cookies and login included, into the file; an account already there is kept unless --refresh; each keeps its Twenty id, so listings and groups still find it)
A local account lives in ~/.logCli/localAccounts.json (LOG_LOCAL_ACCOUNTS moves it), not in Twenty. Every command finds it by its accountName, a local row winning over a Twenty row of the same name, and the session a run captures is saved back to the file. LOG_ACCOUNTS=local leaves Twenty out of accounts entirely.
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/groupChatRead" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 42, 44, 78, 84, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `lifecycle`

log facebook lifecycle [states [--write]] [--account <name>] [--json]
Each account's place in its lifecycle (rule 35): status, state, what onboarding has left; `states` prints the machine
Usage: log facebook lifecycle [--account <name>] [--json]
       log facebook lifecycle states [--write]   (the machine's state tree; --write regenerates docs/lifecycle.md)
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 35, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `preflight`

log facebook preflight [--account <a>] [--homes <US,CA>] [--noProxy] [--apply] [--json]
Before any browser opens, check each account will get through: home timezone, hours, proxy speed and country, the account's browser and its kernel, launches and host opens left, no session left open, its picture on disk
Usage: log facebook preflight [--account <accountName>] [--homes <US,CA>] [--noProxy] [--apply] [--json]
  Before any browser opens: each account's home timezone, waking hours, proxy (country and speed), AdsPower profile and browser kernel, today's launches and host opens, a session left open, and its profile picture on disk.
  --apply downloads the SunBrowser kernel each profile's user agent needs when it is missing, and waits for it. Nothing opens on Facebook.
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/marketplaceListings" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 12, 18, 24, 33, 35, 37, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `doctor`

log facebook doctor [--json]
Check python, facebook-camofox-client, Camoufox, Twenty, and which accounts may run
Usage: log facebook doctor [--json]
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 12, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `connect`

log facebook connect --account <name> [--noPrompt] [--wait <seconds>] [--bypass] [--now]
Sign a Facebook account in through its proxy (the connect machine), save its cookies to Twenty
Usage: log facebook connect --account <accountName> [--noPrompt] [--wait <seconds>] [--bypass] [--now]
Runs --noPrompt: saved cookies that work end it at once; otherwise it signs in by itself from Twenty's email, password and 2FA secret (rule 21), and anything it can't handle waits for matt in the visible window (up to --wait seconds, default 600). Progress streams to ~/.logCli/mcp/<day>.log.
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/marketplaceListings" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 12, 18, 21, 23, 24, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `profile`

log facebook profile setup --account <name> [--live] [--bypass] [--json]
Set an account's profile picture and cover photo from Twenty (dry run unless --live, rule 28)
Usage: log facebook profile setup --account <accountName> [--live] [--bypass] [--json]
Without --live it only reads the profile and lists its controls in the run's profileFound.txt. profileLive with --live uploads socialAccounts.profilePhoto and coverPhoto in one run (rule 28): only when matt asked.
Pass the arguments after the command name in `args`, e.g. ["--json"]. It never takes --live: that is `profileLive`. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 28, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `profileLive`

log facebook profile setup --account <name> [--live] [--bypass] [--json]
Live on Facebook: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Set an account's profile picture and cover photo from Twenty (dry run unless --live, rule 28)
Usage: log facebook profile setup --account <accountName> [--live] [--bypass] [--json]
Without --live it only reads the profile and lists its controls in the run's profileFound.txt. profileLive with --live uploads socialAccounts.profilePhoto and coverPhoto in one run (rule 28): only when matt asked.
Pass the arguments after the command name in `args`, with --live. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/marketplaceListings" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 28, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `hostStart`

Run the account's lifecycle in one open browser through its active hours.
Run an account's lifecycle in ONE browser kept open for its day, resuming where it left (rule 35); send it events; read its progress
log facebook host start --account <accountName> [--live] [--likes] [--bypass] [--now] [--gapSeconds <n>] [--watchMinutes <n>]   (--live: profile, name, location; --likes: the warm-up's likes)
Fill the named fields; each value goes through whole. `bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked. What acts on Facebook is `hostStartLive`.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 18, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `hostStartLive`

Run the account's lifecycle in one open browser through its active hours.
Live on Facebook: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Run an account's lifecycle in ONE browser kept open for its day, resuming where it left (rule 35); send it events; read its progress
log facebook host start --account <accountName> [--live] [--likes] [--bypass] [--now] [--gapSeconds <n>] [--watchMinutes <n>]   (--live: profile, name, location; --likes: the warm-up's likes)
Fill the named fields; each value goes through whole. `bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/marketplaceListings" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 18, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `hostSend`

Send an event to the account's running host.
Run an account's lifecycle in ONE browser kept open for its day, resuming where it left (rule 35); send it events; read its progress
log facebook host send --account <accountName> <PERSON_DONE|PAUSE|RESUME|SHUTDOWN|LOST>
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 18, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `hostStatus`

Where each host is.
Run an account's lifecycle in ONE browser kept open for its day, resuming where it left (rule 35); send it events; read its progress
log facebook host status [--account <accountName>]
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 18, 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `inspectStart`

Open the account's browser through every gate and keep it open; over MCP always with detach.
Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29)
log inspect start --account <accountName> [--goal <text>] [--url <https://www.facebook.com/... or the platform's own page>] [--bypass] [--now] [--noIdleMouse] [--detach]   (one session per account: two accounts can be open at once; --detach runs it as its own process and returns once it is open)
Opens the account's browser as its own process (detach: true) and returns once the gate and self-check passed. It stays open until `inspectDo` with action stop (or 30 idle minutes).
Fill the named fields; each value goes through whole. `bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/groupChatRead" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 12, 17, 22, 24, 26, 29, 30, 35, 48, 54, 55, 68, 72, 73, 74, 75, 82, 84, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `inspectDo`

Send one step to the open browser; it returns the snapshot (element refs), requests and rea's reading.
Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29)
log inspect do <goto <url>|snapshot|back|wait [s]|click <ref>|type <ref> <text>|press <key>|upload <ref> <file>|highlight <role> <name>|solve|signIn|code|pin|stop> [--live] [--goal <text>] [--timeout <s>] [--json] [--account <accountName>]   (--account picks the session when more than one is open; every step's internal API calls are read, and a step no known state names is read by SubQ against the goal, rules 73-74)
Sends one step to the open session and returns its snapshot (element refs), requests and rea reading. Steps that act on Facebook (click, type, press, solve, signIn, code, pin…) are `inspectDoLive`.
Fill the named fields; each value goes through whole. What acts on Facebook is `inspectDoLive`.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 12, 17, 22, 24, 26, 29, 30, 35, 48, 54, 55, 68, 72, 73, 74, 75, 82, 84, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `inspectDoLive`

Send one step to the open browser; it returns the snapshot (element refs), requests and rea's reading.
Live on Facebook: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29)
log inspect do <goto <url>|snapshot|back|wait [s]|click <ref>|type <ref> <text>|press <key>|upload <ref> <file>|highlight <role> <name>|solve|signIn|code|pin|stop> [--live] [--goal <text>] [--timeout <s>] [--json] [--account <accountName>]   (--account picks the session when more than one is open; every step's internal API calls are read, and a step no known state names is read by SubQ against the goal, rules 73-74)
Sends one step that acts on Facebook to the open session and returns its snapshot (element refs), requests and rea reading.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/groupChatRead" }), getGuide({ useCase: "facebook/marketplaceListings" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 12, 17, 22, 24, 26, 29, 30, 35, 48, 54, 55, 68, 72, 73, 74, 75, 82, 84, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `inspectRead`

Read a recorded step again: its internal API calls with the page, the account and the earlier steps, by SubQ when no known state names it (rules 73-74).
Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29)
log inspect read <stepFolder> --account <accountName> [--goal <text>] [--json]   (read a recorded step again: its internal API calls, the page and the earlier steps, by SubQ when no known state names it)
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 12, 17, 22, 24, 26, 29, 30, 35, 48, 54, 55, 68, 72, 73, 74, 75, 82, 84, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `inspectMap`

The recorded steps as states and transitions (flow.md, machine.json).
Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29)
log inspect map [<runDir>] [--all]  (the recorded steps as states and transitions: flow.md, machine.json; default the latest run; --all collates every run)
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 12, 17, 22, 24, 26, 29, 30, 35, 48, 54, 55, 68, 72, 73, 74, 75, 82, 84, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `inspectGoal`

The session's goal, whether a step's reading says it is reached, and its P.E.E. findings; --set gives the open session its goal (rule 75).
Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29)
log inspect goal [--set <text>] [--account <accountName>] [--json]   (the session's goal, whether a step's reading says it is reached, and its P.E.E. findings: what went wrong, the evidence, why, and how it was fixed; rule 75)
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 12, 17, 22, 24, 26, 29, 30, 35, 48, 54, 55, 68, 72, 73, 74, 75, 82, 84, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `inspectFinding`

Write a P.E.E. finding for a step that went wrong (Point, Evidence from its reading, Explain), or how finding n was fixed (rule 75).
Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29)
log inspect finding --step <step> --point <text> --explain <text> [--evidence <text>] [--account <accountName>]   (a step that went wrong: Point, the issue in one sentence; Evidence, quoted from the step's reading, plus your own; Explain, why the evidence shows it and what caused it)
log inspect finding --fixes <n> --fix <text> [--account <accountName>]   (how finding n was fixed)
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 12, 17, 22, 24, 26, 29, 30, 35, 48, 54, 55, 68, 72, 73, 74, 75, 82, 84, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `inspectSessions`

The open sessions.
Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29)
log inspect sessions   (the open sessions)
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 12, 17, 22, 24, 26, 29, 30, 35, 48, 54, 55, 68, 72, 73, 74, 75, 82, 84, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `check`

Check one account in its open browser.
Check one account in its open browser: may it still sell, each listing's state on Selling (into Twenty), and its seller inbox's chats
log facebook check --account <accountName> [--bypass] [--json]   (in the account's open browser: Marketplace status, each listing's state and clicks in the last 14 days on Selling into Twenty, the seller inbox's chats; nothing clicked)
Fill the named fields; each value goes through whole. `bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/marketplaceListings" }), getGuide({ useCase: "twitter/engagementReplies" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 13, 18, 22, 29, 35, 69, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `scan`

log facebook scan --account <name> [--json] [--bypass]
Read Marketplace > Selling live for one account and update its listings in Twenty
Usage: log facebook scan --account <accountName> [--json] [--bypass]
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 12, 18, 22, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `status`

log facebook status <listingId> --account <name> [--json] [--bypass]
Open one Marketplace item page live and classify its status
Usage: log facebook status <listingId> --account <accountName> [--json] [--bypass]
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 12, 18, 22, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `watch`

log facebook watch --account <name> [--checks <n>] [--interval <min>] [--json] [--bypass]
Run the listing monitor (XState) for one account and print every step
Usage: log facebook watch --account <accountName> [--checks <n>] [--interval <minutes>] [--json] [--bypass]
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 6, 18, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `browsers`

Where every open browser is, and what resolves its page.
Where every open browser is: its page, the known page state it sits on, the call that resolves it, and what only matt can clear (rules 54-55)
log browsers [--json]   (every open browser: its step and page, the known page state it sits on, the call that resolves it, and what only matt can clear)
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 29, 35, 54, 55, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `logout`

log logout [--apiUrl <url>] [--json]
Forget the stored Twenty session
Usage: log logout [--apiUrl <url>] [--json]
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `whoami`

log whoami [--apiUrl <url>] [--json]
Show who is signed in, refreshing the session if it expired
Usage: log whoami [--apiUrl <url>] [--json]
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From AGENTS.md (`log://agents`). The newest rules are at the bottom of AGENTS.md and win.

**Rule 6.** 2026-10-18 · Processes that run over time are XState machines that can be started and watched from the CLI (`log watch`, `observability/trace`).

**Rule 8.** 2026-10-18 · Read-only on Facebook. Nothing is posted, edited or deleted unless matt asks for it.

**Rule 12.** 2026-10-18 · No browser opens for an account unless its proxy is attached and its exit IP is in the account's country (`python/browser/proxyGate.py`). There is no exception: not dry runs, not signing in (matt: "never, ever open" without one). Listings must be in the account's country, and the form's location must be picked in that country. How it works: `docs/proxies.md`.

**Rule 13.** 2026-10-18 · Twenty is the only place accounts and listings live: Facebook accounts are `socialAccounts` (platform FACEBOOK), listings are `agencyListings`. Never delete either: a banned or dead account keeps its record with its status, and its campaign listings get replacement accounts in the same country (`docs/accountsAndListings.md`). Fields are only ever added (`scripts/twenty/twentySetup.mjs`), never renamed or retyped, so the twitter-controller keeps working.

**Rule 17.** 2026-10-18 · Launch self-check: before any page loads, the gate checks in the page and a worker that the timezone is the exit IP's, the language and Intl locale are the pinned locale, and the browser's exit IP is the checked one. Any mismatch closes the browser before Facebook loads.

**Rule 18.** 2026-10-18 · No run outside the account's local waking hours (08:00-22:00 in its home timezone, or `activeHoursStart`/`activeHoursEnd`): publish, scan, status, watch, campaign run and connect are refused with `outsideActiveHours`. Daily caps count the account's local day.

**Rule 21.** 2026-10-19 · matt asked for auto-login: `log connect --noPrompt` (always, over MCP) signs in by itself with the account's Twenty email, password and totpSecret, typing the current authenticator code on the two-step page (`python/login/autoLogin.py`). They are read only by `twenty.loginSecrets`, for that run, into the run folder's `login.json` (0600, deleted with it), and are never printed or logged. Every vendor order in `docs/vendors/*.txt` (git-ignored) is imported with all its fields by `scripts/twenty/importVendorAccounts.mjs`, which shows each field only as `<set>` or `<empty>`.

**Rule 22.** 2026-10-19 · Every action records a HAR, with no way to turn it off. The proxy gate puts a raw HAR recorder (rule 19) on every browser context, and refuses a context without a capture folder (`captureMissing`). That covers connect, scan, status, each watch check and publish. Each run keeps `~/.logCli/runs/<action>/<time>_<account>/firefox` (publish: its run folder): `session.har`, `steps.jsonl` (every action the run logged, timed), and `steps/NN_<action>.har`, one per step, each read by the local rea (`settleRunCapture`). Never committed.

**Rule 23.** 2026-10-19 · matt: "whatever Listaro did we go with that path". `log connect` is the connect machine (`marketplace/connect`), and every sign-in page takes Listaro_backup's path (`src/lib/auto-login`, `src/lib/fb-login-helper.ts`): the cookie banner is accepted, "Find your account" submitted once, "We suspect automated behaviour" dismissed, login captchas solved (rule 10's solvers), two-step and trust-device answered, signed in only with c_user and xs, then the Marketplace check. For connect this narrows rule 10: only identity, photo, video and SMS checkpoints go to a person. `marketplace/connect/machine.test.ts`.

**Rule 24.** 2026-10-19 · matt: "fix them issues now" (the launch budget from RESEARCH/LOG_CLI_RUN_CAPTURES_2026_10_19.md). One account's browser opens on Facebook at most 8 times per local day, dry runs counted, at least 10 minutes apart. A launch counts once it passed the gate ("Self-check passed" in its `steps.jsonl`). Refused before anything opens: `launchTooSoon`, `launchBudgetSpent` (`browser/run/helpers/launchBudget.ts`). `--bypass` doesn't skip it; only a publish against the saved fixture form (`--formUrl file://...`) isn't counted. A publish meets a login wall or checkpoint in its own browser (the connect steps run there), never in a second launch.

**Rule 26.** 2026-10-19 · matt: "I always want to see what is going on." Every process that runs over time writes a progress line per stage as it happens (never only at the end) and to a log file in its folder. Agents run long commands so the lines stream live (Claude Code: Monitor, never piped through `tail`/`head`).

**Rule 28.** 2026-10-19 · matt asked for profile setup: `log profile setup --account <a>` sets the account's profile picture and cover photo from Twenty (`socialAccounts.profilePhoto`, `coverPhoto`; a URL or path, fetched through the account's proxy and varied, `media/photo`), both in one run (matt's choice), through the profile machine (`marketplace/profile`, `python/session/profileSession.py`). A dry run unless `--live`; the dry run lists every control the profile page has in `profileFound.txt`, and the clicks are checked against it before the first `--live` (rule 25). It is a launch like any other (rules 11-12, 15-18, 22, 24). 2026-10-19, matt also chose to rename the profile (`socialAccounts.profileName`, first "Allentown Trash"), knowing Facebook reviews names and allows about one change per 60 days: the dry run reads the name page (`nameFound.txt`), and the rename is built from that recording before any `--live` renames. Bio and every other profile field stay read-only (rule 8).

**Rule 29.** 2026-10-19 · matt: look before writing code for a page. `log inspect start --account <a>` opens one gated, headed Camoufox (async API, same launch and gates as every run) and keeps it open; `log inspect do <action>` runs one step (goto, snapshot, back, wait; click, type, press only with `--live`, rule 8). Each step records, in order, as it happens: the accessibility snapshot with element refs (camofox-mcp's model, `aria_snapshot(mode="ai")`), a screenshot, its own HAR, and rea's reading of that HAR at once. Code that clicks on a page is written from an inspect recording of that page, never before one.

**Rule 30.** 2026-10-19 · matt: "If I tell you to do something, do it completely." When matt gives a plan, it is carried out to the end in the same turn, not stopped to ask again or to say what won't be done. `log inspect start --now` (and `log connect --now`, and since 2026-10-19 `log publish --now`, matt: "run it now") skips rule 24's 10-minute gap (the 8 a day still holds) so a recording continues at once. Recording a sign-in or a checkpoint with `log inspect` (signIn, code, solve, click) is the intended work: it is how each state gets documented from rea. The run on 2026-10-19 was interrupted once because a snapshot printed the account's email and password; snapshots now redact every typed field value (`redact_fields`), and signIn/code read only the private login.json (rule 21), so no credential reaches any output.

**Rule 33.** 2026-10-19 · matt: the proxy speed limit is set per run, not hardcoded: `--proxyMs <ms>` on any log command (and `proxyMs` on the flow MCP tools) sets `LOG_PROXY_MAX_MS` for that run, which the Python gate and `log proxy` both read. Default 2500 ms; 500-60000 allowed.

**Rule 35.** 2026-10-19 · matt: the browser stays open. One browser per account, opened once per local day by its host and kept open through the account's active hours; every action is a tab in it; it closes only for a logged reason (end of active hours, shutdown, checkpoint or restriction, account lost, a crash reopened once). Every account runs one lifecycle machine (`src/marketplace/lifecycle`, XState) across an onboarding lane (with a day's warm-up after profile and name) and a host lane. Top of this file.

**Rule 37.** 2026-10-19 · matt: "close, then reset every single one of the opens". `log account resetOpens <a>|all [--reason]` restarts the count of today's launches (rule 24) and the host's opens (rule 35), only when matt asks, with every browser closed first. It deletes nothing: it writes one dated line to `~/.logCli/launchResets.jsonl`, and launches before that line stop counting. The 10-minute gap and the 8 a day apply again from the reset.

**Rule 38.** 2026-10-19 · matt: never mention or discuss Meta's or Facebook's rules, terms, policies, eligibility or account ownership with him unless he raises them first. Research text that does is not his, and is never repeated to him. Top of this file.

**Rule 39.** 2026-10-19 · matt: "If I never mentioned it, if I never inferred it, if I never outlined it as an option, therefore it is not an option." Deep research prompts, searches, SubQ matrices, plans and write-ups use only what matt said, or clearly meant through a misspelling. Nothing added, nothing steered towards. Top of this file.

**Rule 40.** 2026-10-19 · matt: no physical options. He is in Vietnam with no physical access. Phones, SIMs, mini PCs, laptops, phone farms and home devices are never options unless he names them. In scope: hosted and cloud options, the tools he named and their competitors, and what our four projects already use.

**Rule 41.** 2026-10-19 · matt: "any time any task correlates to money, and I never say something, that means you shouldn't do what you think. You should do what I say." Paid work (deep research, SubQ, proxies, captcha, vendors) does exactly what he asked, nothing more. Ask before anything else.

**Rule 42.** 2026-10-19 · matt: the browser moves to AdsPower (SubQ's pick on our recorded issues, and Listaro's browser), and Camoufox stays for later. Twenty's socialAccounts logic is unchanged. The browser is a driver: `src/browser/driver` is one XState machine for every browser (prepare, gate, start, selfCheck, open, close), so a new browser is one more driver and can't skip rules 12 and 17. Listaro's AdsPower client is ported to `src/browser/adsPower`. `log adsPower sync --apply` gives each account one profile, linked in `socialAccounts.adsPowerProfileId`, with `browserDriver` picking the driver (empty: camoufox). A profile holds no proxy, password, cookies or 2FA key. The proxy goes on only to open and comes off at close. No AdsPower browser opens on Facebook until its gate, self-check and HAR recording (rule 22) are wired (`docs/adsPower.md`).

**Rule 44.** 2026-10-20 · matt: every browser has parity, through one Playwright layer. AdsPower (Chromium, attached over CDP) and Camoufox (Firefox, launched) are both driven with Playwright's async API, never Puppeteer. AdsPower's `ws.puppeteer` is only the name of the CDP websocket it returns. `python/browser/browserDriver.py` opens either and hands every session the same context. So the proxy gate (`gate_attached`), the self-check (`check_attached`), the session HAR (`harRecorder.SessionHar`), HumanMouse, scrollMotion, the flows and the warm-up are the same code on both. This replaces rule 42's "not wired yet". Each browser is a domain of its own, `src/browser/<name>`, holding its capability row, driver and tests. The `browserParity` check in lefthook pre-commit (`bun run check:browsers`) refuses a browser missing its domain, row, driver, tests, Python opener or `docs/browsers.md` column. `notBuilt` is listed, never refused. Listaro's AdsPower rules carry over (`docs/browsers.md`): never close the profile's context, inject no scripts, and let the profile keep its own cookies.

**Rule 48.** 2026-10-20 · matt: what a platform's client does is documented by platform first, then domain: `docs/platforms/<platform>/<domain>/<request>.md` (was `docs/facebookClient/`; Facebook is `docs/platforms/facebook/`, and its group requests have a `groups` domain of their own). A new platform or domain is explored with `log inspect` and gets its own folder beside Facebook's. Over MCP, any call that runs long is watched live: the caller starts a Monitor on `~/.logCli/mcp/<day>.log` before it (rule 26), as the server's instructions and each long tool's description say.

**Rule 54.** 2026-10-20 · matt: a known state is resolved, never a reason to stop. When a page lands on a state log-cli already knows (a checkpoint's first page, a text captcha, the Remember password prompt, the login form, two-step, "automated behaviour"), its resolver runs: press the checkpoint's Continue (plain text, by its ref), `solve` the captcha (2Captcha, then Continue), Not now, signIn, code. Only what a person must clear stops an account (a video selfie, an ID or photo, a disabled account; rules 10, 23), and that is said to matt. A Claude Code hook (`.claude/settings.json`, `scripts/hooks/pageState.ts`) reads the latest step of every open browser after each tool call and each prompt, matches it against the known states (`pageStateOf`, `src/browser/flow/helpers/pageState.ts`) and puts the state and its resolver into the agent's context. A state not mapped yet is pressed through (its Continue) and added to the map.

**Rule 55.** 2026-10-20 · matt: the CLI, the MCP tools, the agent hooks and the live log line up, and a commit is refused when they don't. One hook list (`src/agentHooks/registry`) writes both hosts' files, Claude Code's `.claude/settings.json` and Codex's `.codex/hooks.json`: SessionStart and UserPromptSubmit say where every open browser is; PostToolUse (Bash, PowerShell, Monitor, every `mcp__log__` tool) gives a known state its resolver, and a failed step is an unconfirmed page (snapshot, then resolve); Stop keeps the turn going while a browser sits on a state log-cli resolves itself (rule 54), never on a person's state, and never twice on the same unchanged one; PreToolUse refuses a log run piped through tail/head (rule 26). The terminal CLI writes the same live log as the MCP, `~/.logCli/mcp/<day>.log`, so one Monitor shows a run however it started. lefthook's `agentHooks` (`bun run check:agentHooks`, pre-commit and pre-push) refuses drift: both hosts' files, every command an MCP tool or terminal-only, every MCP tool hooked, every hook script answering its events, every resolver a real command (`skills/agentHooks/SKILL.md`).

**Rule 68.** 2026-10-22 · matt: the Marketplace location is typed as "City, State" with the state written out in full ("Bethlehem, Pennsylvania", never "PA"): "Bethlehem, PA" was offered only as the West Bank, and a bare zip offered Granada, Spain first (Bethlehem, inspect 20261022T105341 and 20261022T110738). `setLocation` writes a US state code out, picks the option Facebook's own answer names as the place typed, clicks it, and sets nothing when none matches. A listing is published from the account's open AdsPower browser by the recorded flow `marketplaceListingPublish` (location, Create, photos, title, price, category, condition, description, Next, Publish; never Boost, rule 41), not by a second browser. "Discover more when you shop" (partner listings, a European location) is a known page state, pressed through with Update.

**Rule 69.** 2026-10-22 · matt: once a listing is live, the account is checked on a schedule. The host's check (every watch round, in the browser it holds) reads Marketplace status (may it still sell: anything but full access is the account's `suspended` issue), each listing's state on Selling into Twenty (active, being reviewed, sold, rejected), and the seller inbox's chats, each from its step's own recording, nothing clicked. `log facebook check --account <a>` runs it once by hand. A chat's fields are mapped from the first recording of a real one (rule 29); until then chats are counted and kept as sent. `src/facebook/marketplace/check`. The page-state hook resolves it with that flow when the account's PIN is in Twenty, and flags it to matt only when it isn't (the session records a yes or no when it opens, never the PIN). "Enter your PIN" (`messengerPinEnter`) is mapped the same way: the PIN is typed from Twenty and each step recorded until it is a flow.

**Rule 72.** 2026-10-23 · matt: a Marketplace location is never abbreviated. It is typed as "City, State" with the state written out ("Bethlehem, Pennsylvania") or "City, Country" ("Galway, Ireland"): "Bethlehem, PA" was offered only as the West Bank, and a bare zip offered Granada, Spain first (rule 68). A check blocks before any action: a place with an acronym, a state code, a zip or any number, or no state or country is refused with `locationAbbreviated` (`placeProblem`, `src/facebook/marketplace/location`; `python/location/placeName.py` in the sessions), in a listing's `locationQuery` (`listing create`, `lint`, `publish`, `campaign fill`), `log inspect do setLocation`, a flow's `location`, and the host's setLocation, which types the listing's `locationQuery` and never a zip. A written-out state counts as the US for the country check.

**Rule 73.** 2026-10-23 · matt: "IT MUST ALWAYS READ THEM." The number one rule of the stack, above rule 30 and every other: Facebook's internal API answers are the decision-making factor of what and when something is relevant, and the deterministic factor of the system. Every browser step reads the internal API answers it triggers and the requests it sent, keeps them past the prune, and decides on them, never on a page loading, a timer or the step having run. The MCP instructions put it first. Inspect steps read theirs since rule 74, and every flow, warm-up and host step on AdsPower that makes a call since 2026-10-23; the Camoufox-only machines don't yet (#35). Top of this file.

**Rule 74.** 2026-10-23 · matt: in the inspect flow, a state we can't decide is read by SubQ with everything around it, and said loudly to the agent. Only `log inspect` does this, because it is where flows are made to be run again and again. Every inspect step's internal API calls are taken out of its recording by code, with what was sent and what came back, in seconds from the step's first request (`exchanges.json`, `exchanges.md`). A step no known state names (`pageStateOf`) is collated into one bundle: the goal (`--goal`), the account (home, platform, browser, the proxy's exit), what we did (the action, the mouse, how long it took), every internal API call, the page text, the screenshot and the earlier steps. SubQ's Decisions API (`subq-snap-1.1`, up to 128 questions, a 384K-token context) is asked what it means, not what to do next: whether the goal was met, whether everything fits the account, whether something should never have come up, whether the page agrees with the API, whether our action caused it, and what each call says about the goal. The reading is printed first in the step's result and put into the agent's context by the page-state hook (`>>> UNKNOWN STATE`), so it is named before the flow goes on. The same works on any platform. `log inspect read <stepFolder>` reads a recorded step again. `src/subq/stepReading`.

**Rule 75.** 2026-10-23 · matt: the loud events trigger a Claude hook, and the model keeps going until the goal is done, with what went wrong written down as P.E.E. An inspect session has a goal (`--goal` on `start`, or `log inspect goal --set`). The goal is reached when a step's SubQ reading says so (`goalMet` at least 0.5). Until then the page-state hook's Stop event holds the turn ("Keep going with the next inspect step"), and puts the goal into the agent's context after each tool call when it changes. A step whose reading says it went wrong (wrong result, stopped by the platform, unclear, or SubQ failed) needs its finding before the next step: **Point**, the issue in one sentence; **Evidence**, quoted from the step's reading (the calls SubQ flagged, with what was sent and what came back), plus any of your own; **Explain**, why the evidence shows it and what caused it (`log inspect finding --step --point --explain`). Once the goal is reached, the turn is held until every finding says how it was fixed (`log inspect finding --fixes <n> --fix`). They are kept in the run as `goalFindings.jsonl` and `goalFindings.md`; `log inspect goal` shows them. What only a person can clear never holds the turn: it is said to matt. The hook holds the turn once per unchanged state, never twice on the same one. `src/browser/inspect/helpers/goal.ts`.

**Rule 78.** 2026-10-24 · matt: a deactivated account gives its AdsPower profile back, and another account takes the slot (AdsPower holds 22). When an account is DEACTIVATED, by `log facebook account status <a> DEACTIVATED` or in Twenty, its profile is deleted from AdsPower and `adsPowerProfileId` cleared; the account's row stays (rule 13). The status command does it at once and runs the sync, so an account waiting for a profile is given the freed one. `log adsPower sync --apply` releases first, then makes profiles, so a status set in Twenty is caught there. matt: "I just want to do Pennsylvania": only accounts whose home is in `LOG_ADSPOWER_HOMES` (`.env.local`, `US`; or `--homes`) hold a profile, and the others give theirs back the same way. Nothing else about them changes. `src/browser/adsPower`, `docs/adsPower.md`.

**Rule 79.** 2026-10-25 · matt: "we can't do that in production, that's why we need it deterministic." A flow step never depends on a page's exact wording or a person stepping in. A control is picked by one scored match (`python/browser/controlMatch.py`): its role, then its name as the accessible name, aria-label, label, text or placeholder, case and spacing ignored, inside the dialog the step names (`within`, taken from the recording's snapshot) or an open dialog over the page behind it; two equal matches are refused (`controlAmbiguous`), none is `controlMissing`, a disabled one is waited for (`controlDisabled`). Every step waits for the call it must cause (`expect`: a mutation, a plain endpoint such as `profilePictureUpload`, or a dialog query) and checks its answer (rule 73) before the next one fires. `log facebook preflight` says before any browser opens what would stop each account (home timezone, hours, proxy country and speed, the browser kernel, launches and host opens left, a session left open, its picture on disk); `--apply` downloads a missing kernel and the host waits for one. A session whose process is gone is dropped. Snapshot excerpts of each page version are test fixtures (`python/fixtures/controls/`). Before a flow's first click it clears the known overlays with Escape, each checked: the browser-notifications notice (gone from the page) and an ended "What happened" notice (`useAccountStatusClearEnrollmentEntryPointActionMutation` answers `xfb_ixt_gateway_clear_flow: true`); one that stays stops the flow with `overlayNotCleared`.

**Rule 82.** 2026-10-25 · matt: "we need to make it auto switch when that happens to checkpointed", and later the same day "if I said it got checkpointed then we just deactivate it". An open browser reports every page it lands on (`navigations.jsonl` in its run), and the session behind it sets the account to DEACTIVATED in Twenty, reason `checkpointed`, the moment one is a `/checkpoint` page, between steps as well as during them, with the page and the time as the detail; its listings are marked lost, as the direct-API engine does. Its AdsPower profile is given back by the next `log adsPower sync --apply` (rule 78), never from under the open browser. An account already DEACTIVATED is left as it is. `src/cli/inspect/helpers/watchCheckpoint.ts`.

**Rule 84.** 2026-10-25 · matt: `log inspect` and the account's AdsPower browser work on every platform, not only Facebook, so a new platform is explored the same way (rules 29, 48). One table says what each platform is, `PLATFORM_SITES` (`src/cli/runner/helpers/platforms.ts`): its Twenty value, cookie domain, hosts, home page, whether it needs a proxy and whether it has a browser path. Facebook needs its proxy (rule 12, unchanged; the gate refuses a direct run for it); X has no browser path (rule 80). matt, for Reddit: "no proxy, like X": a platform marked `proxy: none` opens its AdsPower profile with no proxy, the gate reads this machine's own exit and the profile's timezone follows it; an account with no home runs in en-US on the machine's timezone. `log inspect` goes only to known platforms' hosts, opens on the account's platform home, carries the account's own cookies in, and names each internal call by Facebook's friendly name or a GraphQL `operationName`/`operation`, else its path. `log adsPower sync` gives a profile to every browser platform's accounts (a no-proxy one needs no home). A row whose `accountName` is empty is found by its `name`. `log new platform` writes the platform's row (`--hosts`, `--home`, `--noProxy`, `--noBrowser`), and `check:platforms` refuses a platform without one.
