# facebookBrowser

An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 55). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Current scope

This guide describes the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "discord/groupChatRead" })` | Reading a Discord group chat without Twenty | "read the <group> chat over the last <N> hours", "what did <someone> set up in <group>" |
| `getGuide({ useCase: "facebook/marketplaceListings" })` | From accounts to live Marketplace listings | see the page |
| `getGuide({ useCase: "inbox/signIn" })` | Signing an account in: checking it, then the live browser | "sign in to my account", "is my x account logged in", "check my accounts", "log me back into instagram", "my session expired", "check the status of my accounts", "open the browser so I can sign in" |
| `getGuide({ useCase: "instagram/newPlatform" })` | Bringing a new platform up, then vendoring its client | "make a new platform via the MCP for <platform>", "open <platform> in AdsPower", "find me via the gh api the most likely to go into the vendor", "make it work" |
| `getGuide({ useCase: "slack/dmReply" })` | Reading and answering a Slack DM | "read the messages with <someone> on slack", "reply to <someone> on slack", "what did <someone> say in <workspace>" |

## The tools in this guide

| Tool | What it does |
|---|---|
| `adsPower` | AdsPower: Local API status, its profiles, and one profile per Twenty… |
| `localAccount` | Accounts kept in a local file instead of Twenty |
| `facebookLifecycle` | Each account's place in its lifecycle |
| `facebookPreflight` | Before any browser opens, check each account will get through |
| `facebookDoctor` | Check python, facebook-camofox-client, Camoufox, Twenty, and which… |
| `facebookConnect` | Sign a Facebook account in through its proxy |
| `facebookProfile` | Set an account's profile picture and cover photo from Twenty |
| `facebookProfileLive` | Set an account's profile picture and cover photo from…, live on Facebook |
| `facebookHostStart` | Run the account's lifecycle in one open browser through its active… |
| `facebookHostStartLive` | Run the account's lifecycle in one open browser…, live on Facebook |
| `facebookHostSend` | Send an event to the account's running host |
| `facebookHostStatus` | Where each host is |
| `inspectStart` | Open the account's browser through every gate and keep it open |
| `inspectDo` | Send one step to the open browser |
| `inspectDoLive` | Send one step to the open browser, live on the platform |
| `inspectRead` | Read a recorded step again |
| `inspectMap` | The recorded steps as states and transitions |
| `inspectGoal` | The session's goal, whether a step's reading says it is reached, and… |
| `inspectFinding` | Write a P.E.E |
| `inspectSessions` | The open sessions |
| `facebookCheck` | Check one account in its open browser |
| `facebookScan` | Read Marketplace > Selling live for one account and update its… |
| `facebookStatus` | Open one Marketplace item page live and classify its status |
| `facebookWatch` | Run the listing monitor |
| `browsers` | Where every open browser is, and what resolves its page |
| `browserView` | The account's live browser |
| `logout` | Forget the stored Twenty session |
| `whoami` | Show who is signed in, refreshing the session if it expired |

## The work, step by step: inspect

From `skills/inspect/SKILL.md`.

## inspect

The order is: open the page, look at it, then write the code (rules 25, 29).
This is camofox-mcp's model (accessibility snapshots with element refs) on
log-cli's own launch, in the account's own browser (rules 44, 84).

### Hard boundaries

1. **One launch, every gate** (rules 11-12, 15-18, 22, 24): headed, proxy in
   country, the account's device and locale, the self-check, the raw HAR, the
   launch budget. `--bypass` only for matt's runs outside waking hours.
2. **Read-only unless matt asked** (rule 8): `goto`, `snapshot`, `back`,
   `wait` read; `click`, `type`, `press` act on the platform and need `--live`
   (over MCP, `inspectDoLive` with confirmLive).
3. **Live** (rule 26): run `start` through Monitor; every step prints as it
   happens.
4. One session per account: two accounts can be open at once, and `--account`
   picks the session (`log inspect sessions` lists them).

### The routine

```bash
## terminal 1 (or Monitor): the browser stays open until `do stop` or 30 idle minutes
log inspect start --account <a> --url https://www.facebook.com/me 2>&1 | tee <log>

## terminal 2: one step at a time
log inspect do snapshot
log inspect do goto https://www.facebook.com/me
log inspect do click e12 --live        # only when matt asked
log inspect do stop
```

Each `do` prints where the page is, the requests the step made to the platform
(GraphQL by name, redirects with their target), rea's Evidence ID, and the
page's elements with their refs. Everything is kept in order in
`~/.logCli/runs/inspect/<time>_<a>/steps/NN_<action>/`: `snapshot.yml`,
`screenshot.png`, `network.har`, `rea.json`.

### Reading every step (rules 73-74)

What each part must do is in the spec, [docs/specs/inspectRuleOne.md](../../docs/specs/inspectRuleOne.md).

Give the session its goal when you open it, in plain words:

```bash
log inspect start --account <a> --goal "Set the Marketplace location to Bethlehem, Pennsylvania" --detach
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
- `log inspect read <run>/steps/NN_action --account <a> --goal "..."`
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
   log inspect finding --account <a> --step 04_setlocationBethlehemPa \
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
   `log inspect finding --account <a> --fixes 1 --fix "Typed the state out in full (rule 72)."`

`log inspect goal --account <a>` shows the goal, whether it's
reached, and every finding. The run keeps them as `goalFindings.md`. What
only a person can clear (an ID, a video selfie) never holds the turn: say it
to matt.

Then write the code from it: the selectors and the order of clicks come from
`snapshot.yml`, the waits from what `network.har` shows the page asking for.
Rebuild the request docs after (rules 27, 85): `log facebook capture --docs`.

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
3. **Final is final.** Restricted, banned, lost and deactivated: the record stays in Twenty
   (rule 13); nothing resumes them. A `/checkpoint` page is never pressed through: the
   checkpoint watch sets the account DEACTIVATED and the machine closes the browser for
   `checkpoint` and ends in `deactivated` (rules 82, 118). Only a video selfie or ID waits in
   `needsPerson`.
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

Full description: `docs/lifecycle.md`. Requirements: `docs/specs/accountLifecycle.md`.

## The work, step by step: adsPower

From `skills/adsPower/SKILL.md`.

## adsPower

### Hard boundaries

1. **Twenty stays the source** (rule 13). An AdsPower profile is the browser for one
   `socialAccounts` row, linked by `adsPowerProfileId`. The Twenty row is never deleted; a DEACTIVATED
   account, or one whose home is not in `LOG_ADSPOWER_HOMES`, gives its profile back (deleted from
   AdsPower, `adsPowerProfileId` cleared, rule 78).
2. **No secret in AdsPower at rest.** Profiles are made with no proxy, password or 2FA key.
   `python/browser/browserDriver.py` puts the proxy on only to open, after the gate, and clears it at close.
3. **Same as Camoufox** (rule 44). An AdsPower session goes through the same gate (rule 12),
   self-check (rule 17), session HAR (rule 22), human mouse and scroll. `docs/browsers.md`
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
log adsPower sync --apply --homes US  # this run's homes (default LOG_ADSPOWER_HOMES, rule 78)
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
log inspect start --account <a> --url https://www.facebook.com/marketplace/ --noIdleMouse --proxyMs 12000
python python/human/recordMouse.py 60                 # "GO": matt uses the window; prints the summary
##   -> ~/.logCli/mouse/<time>.json and .analysis.json

## 2. ours: a session with the idle loop, a long wait step, the same analyser
log inspect start --account <a> --url https://www.facebook.com/marketplace/ --now --proxyMs 12000
log inspect do wait 60
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

A new account gets a real-looking profile photo and a cover photo on days 1-2
of its warm-up. This does that for one account, both photos in one run (matt's choice).

### Hard boundaries

1. **Dry run first, `--live` only when matt asks** (rules 8, 28). Over MCP,
   `--live` is `facebookProfileLive`, with `confirmLive: true`.
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
   log facebook profile setup --account <a> 2>&1 | tee <log>
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
   log facebook capture --docs
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
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/marketplaceListings" }), getGuide({ useCase: "instagram/newPlatform" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 35, 44, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `localAccount`

log localAccount <add|list|pull> [--platform <p>] [--account <a>] [--adsPower <id>] [--proxy <url>] [--home <CC>] [--refresh] [--json]
Accounts kept in a local file instead of Twenty: add one, with the account's browser profile, pull every Twenty account in, or list them
Usage: log localAccount add --platform <facebook|twitter|reddit|discord|linkedin|slack> --account <accountName> [--adsPower <profileId>] [--proxy <scheme://user:pass@host:port>] [--home <CC>] [--city <city>]
       log localAccount list [--json]
       log localAccount pull [--platform <p>] [--refresh] [--json]   (copies every account Twenty has, cookies and login included, into the file; an account already there is kept unless --refresh; each keeps its Twenty id, so listings and groups still find it)
A local account lives in ~/.logCli/localAccounts.json (LOG_LOCAL_ACCOUNTS moves it), not in Twenty. Every command finds it by its accountName, a local row winning over a Twenty row of the same name, and the session a run captures is saved back to the file. LOG_ACCOUNTS=local leaves Twenty out of accounts entirely.
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/groupChatRead" }), getGuide({ useCase: "slack/dmReply" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 175, 35, 44, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `facebookLifecycle`

log facebook lifecycle [states [--write]] [--account <name>] [--json]
Each account's place in its lifecycle (rule 35): status, state, what onboarding has left; `states` prints the machine
Usage: log facebook lifecycle [--account <name>] [--json]
       log facebook lifecycle states [--write]   (the machine's state tree; --write regenerates docs/lifecycle.md)
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 35, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `facebookPreflight`

log facebook preflight [--account <a>] [--homes <US,CA>] [--noProxy] [--apply] [--json]
Before any browser opens, check each account will get through: home timezone, hours, proxy speed and country, the account's browser and its kernel, launches and host opens left, no session left open, its picture on disk
Usage: log facebook preflight [--account <accountName>] [--homes <US,CA>] [--noProxy] [--apply] [--json]
  Before any browser opens: each account's home timezone, waking hours, proxy (country and speed), AdsPower profile and browser kernel, today's launches and host opens, a session left open, and its profile picture on disk.
  --apply downloads the SunBrowser kernel each profile's user agent needs when it is missing, and waits for it. Nothing opens on Facebook.
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/marketplaceListings" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 35, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `facebookDoctor`

log facebook doctor [--json]
Check python, facebook-camofox-client, Camoufox, Twenty, and which accounts may run
Usage: log facebook doctor [--json]
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 35, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `facebookConnect`

log facebook connect --account <name> [--noPrompt] [--wait <seconds>] [--bypass] [--now]
Sign a Facebook account in through its proxy (the connect machine), save its cookies to Twenty
Usage: log facebook connect --account <accountName> [--noPrompt] [--wait <seconds>] [--bypass] [--now]
Runs --noPrompt: saved cookies that work end it at once; otherwise it signs in by itself from Twenty's email, password and 2FA secret (rule 21), and anything it can't handle waits for matt in the visible window (up to --wait seconds, default 600). Progress streams to ~/.logCli/mcp/<day>.log.
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/marketplaceListings" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 35, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `facebookProfile`

log facebook profile setup --account <name> [--live] [--bypass] [--json]
Set an account's profile picture and cover photo from Twenty (dry run unless --live, rule 28)
Usage: log facebook profile setup --account <accountName> [--live] [--bypass] [--json]
Without --live it only reads the profile and lists its controls in the run's profileFound.txt. profileLive with --live uploads socialAccounts.profilePhoto and coverPhoto in one run (rule 28): only when matt asked.
Pass the arguments after the command name in `args`, e.g. ["--json"]. It never takes --live: that is `profileLive`. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 35, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `facebookProfileLive`

log facebook profile setup --account <name> [--live] [--bypass] [--json]
Live on Facebook: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Set an account's profile picture and cover photo from Twenty (dry run unless --live, rule 28)
Usage: log facebook profile setup --account <accountName> [--live] [--bypass] [--json]
Without --live it only reads the profile and lists its controls in the run's profileFound.txt. profileLive with --live uploads socialAccounts.profilePhoto and coverPhoto in one run (rule 28): only when matt asked.
Pass the arguments after the command name in `args`, with --live. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/marketplaceListings" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 35, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `facebookHostStart`

Run the account's lifecycle in one open browser through its active hours.
Run an account's lifecycle in ONE browser kept open for its day, resuming where it left (rule 35); send it events; read its progress
log facebook host start --account <accountName> [--live] [--likes] [--bypass] [--now] [--gapSeconds <n>] [--watchMinutes <n>]   (--live: profile, name, location; --likes: the warm-up's likes)
Fill the named fields; each value goes through whole. `bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked. What acts on Facebook is `facebookHostStartLive`.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `facebookHostStartLive`

Run the account's lifecycle in one open browser through its active hours.
Live on Facebook: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Run an account's lifecycle in ONE browser kept open for its day, resuming where it left (rule 35); send it events; read its progress
log facebook host start --account <accountName> [--live] [--likes] [--bypass] [--now] [--gapSeconds <n>] [--watchMinutes <n>]   (--live: profile, name, location; --likes: the warm-up's likes)
Fill the named fields; each value goes through whole. `bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/marketplaceListings" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `facebookHostSend`

Send an event to the account's running host.
Run an account's lifecycle in ONE browser kept open for its day, resuming where it left (rule 35); send it events; read its progress
log facebook host send --account <accountName> <PERSON_DONE|PAUSE|RESUME|SHUTDOWN|LOST>
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `facebookHostStatus`

Where each host is.
Run an account's lifecycle in ONE browser kept open for its day, resuming where it left (rule 35); send it events; read its progress
log facebook host status [--account <accountName>]
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 35, 73, 79, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `inspectStart`

Open the account's browser through every gate and keep it open; over MCP always with detach.
Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29)
log inspect start --account <accountName> [--goal <text>] [--url <https://www.facebook.com/... or the platform's own page>] [--bypass] [--now] [--noIdleMouse] [--detach]   (one session per account: two accounts can be open at once; --detach runs it as its own process and returns once it is open)
Opens the account's browser as its own process (detach: true) and returns once the gate and self-check passed. It stays open until `inspectDo` with action stop (or 30 idle minutes).
Fill the named fields; each value goes through whole. `bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/groupChatRead" }), getGuide({ useCase: "instagram/newPlatform" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 35, 19, 26, 29, 30, 117, 55, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `inspectDo`

Send one step to the open browser; it returns the snapshot (element refs), requests and rea's reading.
Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29)
log inspect do <goto <url>|snapshot|back|wait [s]|click <ref>|type <ref> <text>|press <key>|upload <ref> <file>|highlight <role> <name>|solve|signIn|code|pin|stop> [--live] [--goal <text>] [--timeout <s>] [--json] [--account <accountName>]   (--account picks the session when more than one is open; every step's internal API calls are read, and a step no known state names is read by SubQ against the goal, rules 73-74)
Sends one step to the open session and returns its snapshot (element refs), requests and rea reading. Steps that act on Facebook (click, type, press, solve, signIn, code, pin…) are `inspectDoLive`.
Fill the named fields; each value goes through whole. What acts on the platform is `inspectDoLive`.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/signIn" }), getGuide({ useCase: "instagram/newPlatform" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 35, 19, 26, 29, 30, 117, 55, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `inspectDoLive`

Send one step to the open browser; it returns the snapshot (element refs), requests and rea's reading.
Live on the platform: it acts there (posts, clicks, joins or changes something). Call it only when matt asked for this live run, with confirmLive: true (rules 8, 10).
Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29)
log inspect do <goto <url>|snapshot|back|wait [s]|click <ref>|type <ref> <text>|press <key>|upload <ref> <file>|highlight <role> <name>|solve|signIn|code|pin|stop> [--live] [--goal <text>] [--timeout <s>] [--json] [--account <accountName>]   (--account picks the session when more than one is open; every step's internal API calls are read, and a step no known state names is read by SubQ against the goal, rules 73-74)
Sends one step that acts on Facebook to the open session and returns its snapshot (element refs), requests and rea reading.
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "discord/groupChatRead" }), getGuide({ useCase: "facebook/marketplaceListings" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 35, 19, 26, 29, 30, 117, 55, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `inspectRead`

Read a recorded step again: its internal API calls with the page, the account and the earlier steps, by SubQ when no known state names it (rules 73-74).
Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29)
log inspect read <stepFolder> --account <accountName> [--goal <text>] [--json]   (read a recorded step again: its internal API calls, the page and the earlier steps, by SubQ when no known state names it)
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 35, 19, 26, 29, 30, 117, 55, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `inspectMap`

The recorded steps as states and transitions (flow.md, machine.json).
Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29)
log inspect map [<runDir>] [--all]  (the recorded steps as states and transitions: flow.md, machine.json; default the latest run; --all collates every run)
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 35, 19, 26, 29, 30, 117, 55, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `inspectGoal`

The session's goal, whether a step's reading says it is reached, and its P.E.E. findings; --set gives the open session its goal (rule 75).
Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29)
log inspect goal [--set <text>] [--account <accountName>] [--json]   (the session's goal, whether a step's reading says it is reached, and its P.E.E. findings: what went wrong, the evidence, why, and how it was fixed; rule 75)
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 35, 19, 26, 29, 30, 117, 55, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `inspectFinding`

Write a P.E.E. finding for a step that went wrong (Point, Evidence from its reading, Explain), or how finding n was fixed (rule 75).
Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29)
log inspect finding --step <step> --point <text> --explain <text> [--evidence <text>] [--account <accountName>]   (a step that went wrong: Point, the issue in one sentence; Evidence, quoted from the step's reading, plus your own; Explain, why the evidence shows it and what caused it)
log inspect finding --fixes <n> --fix <text> [--account <accountName>]   (how finding n was fixed)
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 35, 19, 26, 29, 30, 117, 55, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `inspectSessions`

The open sessions.
Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29)
log inspect sessions   (the open sessions)
Fill the named fields; each value goes through whole.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 35, 19, 26, 29, 30, 117, 55, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `facebookCheck`

Check one account in its open browser.
Check one account in its open browser: may it still sell, each listing's state on Selling (into Twenty), and its seller inbox's chats
log facebook check --account <accountName> [--bypass] [--json]   (in the account's open browser: Marketplace status, each listing's state and clicks in the last 14 days on Selling into Twenty, the seller inbox's chats; nothing clicked)
Fill the named fields; each value goes through whole. `bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "facebook/marketplaceListings" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 175, 35, 19, 29, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `facebookScan`

log facebook scan --account <name> [--json] [--bypass]
Read Marketplace > Selling live for one account and update its listings in Twenty
Usage: log facebook scan --account <accountName> [--json] [--bypass]
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 35, 19, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `facebookStatus`

log facebook status <listingId> --account <name> [--json] [--bypass]
Open one Marketplace item page live and classify its status
Usage: log facebook status <listingId> --account <accountName> [--json] [--bypass]
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 35, 19, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `facebookWatch`

log facebook watch --account <name> [--checks <n>] [--interval <min>] [--json] [--bypass]
Run the listing monitor (XState) for one account and print every step
Usage: log facebook watch --account <accountName> [--checks <n>] [--interval <minutes>] [--json] [--bypass]
Pass the arguments after the command name in `args`, e.g. ["--json"]. `--bypass` (outside the account's hours) needs confirmBypass: true, only when matt asked.
Runs for seconds to minutes: start a Monitor on `tail -f ~/.logCli/mcp/<day>.log` before calling, so matt watches it live (rule 26). A run that outlasts the call's wait (`waitMs`, default 20 s, at most 50 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine }, stop it at its next browser step with `jobCancel`.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 6, 35, 73, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `browsers`

Where every open browser is, and what resolves its page.
Where every open browser is: its page, the known page state it sits on, the call that resolves it, and what only matt can clear (rules 54-55)
log browsers [--json]   (every open browser: its step and page, the known page state it sits on, the call that resolves it, and what only matt can clear)
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 29, 35, 55, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `browserView`

The account's live browser: whether it needs a person to sign in, and where they do it.
One account's live browser: whether it needs a person to sign in, in the window on this machine or inline from a remote runtime
log browser view --account <accountName> [--json]   (the account's live browser: whether it needs a person to sign in, the page state and its revision; when log runs on the person's own machine the sign-in is in the browser window there, and from a remote runtime an MCP Apps host shows it inline through browserView)
Where the runtime is comes from LOG_BROWSER_VIEW_LOCATION (local or remote), which the stdio MCP, the HTTP MCP and the hosted bridge each set for their own process.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "inbox/signIn" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "facebookBrowser" }) (An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks).
AGENTS.md (log://agents): rules 8, 19, 35, 94, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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

From the current AGENTS.md (`log://agents`). Historical citations are consolidated; archived instructions do not override the active scope.

**Rule 6.** 2026-10-18 · Processes that run over time use XState machines and observable stages through the existing CLI/trace infrastructure.

**Rule 8.** 2026-10-18 · Platform actions require the user authorization their tool defines. Send, post, react, join, edit and delete only when authorized; preserve explicit live confirmation, governor and account gates. Ordinary reads do not need new approval.

**Rule 19.** 2026-10-18 · Every browser action records its raw HAR and timed step evidence, with no switch to disable capture. Raw private captures may contain credentials. Keep them in the selected private runtime/browser-host storage, never in git, central payload logs or user-facing output. Retention/pruning must preserve required analysis evidence.

**Rule 26.** 2026-10-19 · Stream progress while work runs, one meaningful line per stage, with the run log retained. Explain stages in plain words; do not leave the user waiting silently for a final buffered result.

**Rule 29.** 2026-10-19 · Record a browser page with the existing inspect tool before implementing actions on it. Preserve per-step snapshots, screenshots, HAR and the reading of the internal calls.

**Rule 30.** 2026-10-19 · Complete the authorized task. Do not repeatedly request confirmation already given. Distinguish implemented behavior, proposed contracts and unverified assumptions.

**Rule 35.** 2026-10-19 · Browser work uses one account browser through its active day, with actions as tabs/steps; close only for a logged lifecycle reason. Preserve existing proxy-country, locale/timezone, device/profile, headed visibility, capture, active-hours and launch-budget gates. Keep checkpoint stops and account-specific constraints in the browser/flow guides. Do not create a fresh browser per action.

**Rule 38.** 2026-10-19 · Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless Matt raises them.

**Rule 39.** 2026-10-19 · Use only the scope, options and intent Matt stated or implied. Do not add unrelated alternatives to research, comparisons, plans or implementation.

**Rule 40.** 2026-10-19 · Do not propose physical infrastructure unless Matt asks. His available implementation scope is hosted/cloud environments and the tools already selected.

**Rule 41.** 2026-10-19 · Paid work must stay within the authorized task and spend. Ask before adding a paid operation he did not authorize; do not substitute a new paid provider implicitly.

**Rule 44.** 2026-10-20 · Keep browser-independent actions on the shared Playwright layer. AdsPower is a driver; shared gates, recording, motion and flows must not be forked per browser.

**Rule 55.** 2026-10-20 · Keep CLI commands, MCP catalog/tools, hooks and generated documentation aligned. Change their source and regenerate the affected surfaces; do not hand-edit generated guides.

**Rule 73.** 2026-10-23 · For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence. Use the existing REA/SubQ reading workflow when applicable, report the unknown state, write Point/Evidence/Explain and the fix, then name the state. Preserve paid-work scope. This runtime analysis does not add SubQ to commit/CI gates.

**Rule 79.** 2026-10-25 · Flow controls must match deterministically by the recorded role/name and scope; ambiguous, missing or disabled controls refuse. Await the confirming API answer. Known resolvable states follow their recorded resolver; checkpoints/refusals remain stops.

**Rule 94.** 2026-10-29 · Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies. A refusal, failed send, 429, block, disable, captcha or cooldown stops that run/account until Matt authorizes continuation. Do not retry through refusals. Bulk reading and sending are separate sessions; cold DMs stay a few a day, minutes apart, and opening a DM counts as a write.

**Rule 105.** 2026-11-01 · One platform/account owns one continuous engine session and push connection. Reads, writes, queues and watches share that owner through existing relay/serialization. Never open a parallel client to bypass the owner or its governor.

**Rule 117.** 2026-11-02 · Current behavior belongs in its domain spec with code anchors; generator/wiring changes update that spec and relevant use cases. Distinguish implemented anchors from future design. Rule 170 governs which checks run automatically.

**Rule 175.** 2026-11-11 · Use existing log.db and platform-agnostic engine contracts for native schemas. Do not copy Twenty agency prefixes or CRM/SMS structures. Old listing/campaign functionality is deferred. Add only missing account/credential and hosted execution contracts; preserve existing identity, message, queue, job and governor authorities.
