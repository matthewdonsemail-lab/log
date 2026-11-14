# facebookBrowser

A Facebook account's browser for its day: preflight, opening and signing in, the host and its lifecycle, the profile and Messenger PIN, its accounts and the account checks.

Load next, when the work needs it: getGuide({ topic: "accountBrowser" }) (An account's one browser on any platform: opening it through its gates, inspecting a page step by step, where every open browser is, the live view for signing in, AdsPower profiles and local accounts); getGuide({ topic: "facebookFlows" }) (Facebook's recorded flows and its warm-up, each a facebookFlow tool run as steps in the account's open browser).

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "facebook/marketplaceListings" })` | From accounts to live Marketplace listings | "post a marketplace listing in <town>", "get listings up on facebook marketplace in every town", "set up the facebook accounts and publish the listings", "take the marketplace listing down". |

## The tools in this guide

Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.

| Tool | What it does | Usage |
|---|---|---|
| `facebookAccounts` | List the Facebook accounts | `log facebook accounts [--json]` |
| `facebookAccountShow` | One account's record | `log facebook account show <accountName> [--json]` |
| `facebookAccountResave` | Save a run's device and session that Twenty didn't take | `log facebook account resave <accountName> --from <folder>   (a run's device and session Twenty didn't take: ~/.logCli/runs/unsaved/...)` |
| `facebookAccountResetOpens` | Restart today's count of launches and host opens, only when the owner… | `log facebook account resetOpens <accountName\|all> [--reason <text>]   (today's launches and host opens count from now; nothing is deleted)` |
| `facebookAccountStatus` | Set an account's status | `log facebook account status <accountName> <ACTIVE\|WARMING\|LIMITED\|PAUSED\|NEEDS_LOGIN\|CHECKPOINT\|RESTRICTED\|BANNED\|DEAD\|DEACTIVATED> [--reason <code>] [--detail <text>]` |
| `facebookLifecycle` | Each Facebook account's place in its lifecycle | `log facebook lifecycle [--account <name>] [--json]` |
| `facebookLifecycleStates` | The lifecycle machine's state tree | `log facebook lifecycle states [--write]   (the machine's state tree; --write regenerates docs/lifecycle.md)` |
| `facebookLifecycleStatesLive` | The lifecycle machine's state tree, live on Facebook | `log facebook lifecycle states [--write]   (the machine's state tree; --write regenerates docs/lifecycle.md)` |
| `facebookPreflight` | Before any browser opens, check each Facebook account will get through | `log facebook preflight [--account <accountName>] [--homes <US,CA>] [--noProxy] [--apply] [--json]` |
| `facebookPreflightLive` | Before any browser opens, check each Facebook account…, live on Facebook | `log facebook preflight [--account <accountName>] [--homes <US,CA>] [--noProxy] [--apply] [--json]` |
| `facebookDoctor` | Check python, facebook-camofox-client, Camoufox, Twenty, and which… | `log facebook doctor [--json]` |
| `facebookConnect` | Sign a Facebook account in through its proxy | `log facebook connect --account <accountName> [--noPrompt] [--wait <seconds>] [--bypass] [--now]` |
| `facebookProfileSetup` | Set a Facebook account's profile picture and cover photo from its… | `log facebook profile setup --account <accountName> [--live] [--bypass] [--json]` |
| `facebookProfileSetupLive` | Set a Facebook account's profile picture and cover…, live on Facebook | `log facebook profile setup --account <accountName> [--live] [--bypass] [--json]` |
| `facebookHostStart` | Run the account's lifecycle in one open browser through its active… | `log facebook host start --account <accountName> [--live] [--likes] [--bypass] [--now] [--gapSeconds <n>] [--watchMinutes <n>]   (--live: profile, name, location; --likes: the warm-up's likes)` |
| `facebookHostStartLive` | Run the account's lifecycle in one open browser…, live on Facebook | `log facebook host start --account <accountName> [--live] [--likes] [--bypass] [--now] [--gapSeconds <n>] [--watchMinutes <n>]   (--live: profile, name, location; --likes: the warm-up's likes)` |
| `facebookHostSend` | Send an event to the account's running host | `log facebook host send --account <accountName> <PERSON_DONE\|PAUSE\|RESUME\|SHUTDOWN\|LOST>` |
| `facebookHostStatus` | Where each host is | `log facebook host status [--account <accountName>]` |
| `facebookCheck` | Check one account in its open browser | `log facebook check --account <accountName> [--bypass] [--json]   (in the account's open browser: Marketplace status, each listing's state and clicks in the last 14 days on Selling into Twenty, the seller inbox's chats; nothing clicked)` |
| `facebookScan` | Read Marketplace > Selling live for one account and update its… | `log facebook scan --account <accountName> [--json] [--bypass]` |
| `facebookStatus` | Open one Marketplace item page live and classify its status | `log facebook status <listingId> --account <accountName> [--json] [--bypass]` |
| `facebookWatch` | Run the Marketplace listing monitor | `log facebook watch --account <accountName> [--checks <n>] [--interval <minutes>] [--json] [--bypass]` |

## The work, step by step: facebookInspect

From `skills/facebookInspect/SKILL.md`.

## facebookInspect

The shared way to inspect a page (one launch, one step at a time, readings,
goals and findings) is `skills/inspect/SKILL.md`. This is what only applies
on Facebook.

### The routine on Facebook

```bash
## terminal 1 (or Monitor): the browser stays open until `do stop` or 30 idle minutes
log inspect start --account <a> --url https://www.facebook.com/me 2>&1 | tee <log>

## terminal 2: one step at a time
log inspect do snapshot
log inspect do goto https://www.facebook.com/me
log inspect do click e12 --live        # only when the owner asked
log inspect do stop
```

### Worked examples

A goal, in plain words:

```bash
log inspect start --account <a> --goal "Set the Marketplace location to Bethlehem, Pennsylvania" --detach
```

The goal is judged across the session: on Bethlehem's likes run ("Like 2 to
3 posts"), the first like reads "not reached" (100%) and the second
"reached" (78%).

A finding, as P.E.E.:

```bash
log inspect finding --account <a> --step 04_setlocationBethlehemPa \
  --point "Typing Bethlehem, PA saved the location in the West Bank." \
  --explain "Facebook matched PA to the West Bank, and the account was already in Lima, so the search ranked from Peru."
```

and its fix, once the goal is reached:
`log inspect finding --account <a> --fixes 1 --fix "Typed the state out in full."`

The West Bank step's SubQ reading was about 49,000 tokens.

### Request docs

Rebuild Facebook's request docs after recording or changing a page:
`log capture docs`.

### The mouse on Facebook

- Facebook's page sends requests all the time; the cursor must not freeze
  for them, only for the first ~2.5 s after a navigation.
- The humanMouse recordings (`skills/humanMouse/SKILL.md`) were made with
  `--url https://www.facebook.com/marketplace/`.

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
   `marketplaceLocationWrong`; both go to a person (the owner decides).
   **The account check reads Marketplace status from its answer**:
   `/marketplace/status`'s `CometMarketplaceStatusContentContainerQuery`
   (`marketplaceAccessOf`). A ban, selling not `ELIGIBLE`, an enforcement or a
   profile not `GOOD` is the issue `suspended` (`accessProblem`); only when that
   answer didn't load is the page text read instead.
4. **Writes need the owner:** `--live` for profile, name and Marketplace location
   (rule 8); `--likes` for the warm-up's likes.
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
`log facebook poll --request` reads in the browser the host holds (rule 105).

Run `start` through Monitor (rule 26). A restart reads
`~/.logCli/runs/host/<a>/progress.json` and resumes: the warm-up activities
done, today's opens; a fresh browser opens and the router walks to the next
step. Too soon after the last launch (rule 35), the host waits the gap out.

A save Twenty refused keeps the run's device and session in
`~/.logCli/runs/unsaved/` (login removed): `log facebook account resave <a> --from <dir>`.

`opensSpent` or `launchBudgetSpent` ends the day. Only when the owner asks, close
every browser (`log facebook host send --account <a> SHUTDOWN`), then run `log facebook account
resetOpens <a>|all --reason "<why>"`. It deletes nothing.

Code: `src/facebook/marketplace/host` (the runner), `src/cli/host` (the steps),
`src/platformKit/lifecycle` (the machine). Doc: `docs/lifecycle.md`.

### The check (every watch round)

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
   conversations.

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
`twoStepNoAuthApp`, for the owner). On the picker (`twoStepMethodPicker`) it chooses
"Authentication app", then Continue, and the code is typed from Twenty as
usual. Mountain Top, host 20261024T222706, steps 12-26.

### The Marketplace location is the account's home

The host's setLocation types the account's own home written out
(`homePlace`: its city and the state or province from `CITY_REGIONS`,
`src/platformKit/home/types.ts`, through `fullPlaceName`, so it passes the
acronym check): "Mountain Top, Pennsylvania", "Kamloops, British
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
   `src/platformKit/lifecycle/machine.ts` and its tests, then regenerate the
   doc: `log facebook lifecycle states --write`. Never hand-edit the generated tree.
3. **Final is final.** Restricted, banned, lost and deactivated: the record stays in Twenty;
   nothing resumes them. A `/checkpoint` page is never pressed through: the
   checkpoint watch sets the account DEACTIVATED and the machine closes the browser for
   `checkpoint` and ends in `deactivated`. Only a video selfie or ID waits in
   `needsPerson`.
4. **Live only with the owner's go.** Warm-up likes, publish and replies need
   `liveActions` (rule 8).

### The routine

```bash
log facebook lifecycle                       # where every account is, and what it has left
log facebook lifecycle --account <name>      # one, with its standing
log facebook lifecycle states                # the state tree from the machine itself
```

A field the lifecycle reads is added through `scripts/twenty/twentySetup.mjs` and the
client regenerated. A fact it reads from a past run (a rename, a
location) is backfilled only from that run's recording (rule 25), never guessed.

Full description: `docs/lifecycle.md`. Requirements: `docs/specs/accountLifecycle.md`.

## The work, step by step: profileSetup

From `skills/profileSetup/SKILL.md`.

## profileSetup

A new account gets a real-looking profile photo and a cover photo on days 1-2
of its warm-up. This does that for one account, both photos in one run (the owner's choice).

### Hard boundaries

1. **Dry run first, `--live` only when the owner asks** (rule 8). Over MCP,
   `--live` is `facebookProfileLive`, with `confirmLive: true`.
2. **Read before clicking** (rule 25). The upload clicks in
   `python/session/profileSession.py` were written before the page was seen. The dry
   run writes every button, link and file input the profile page has to
   `profileFound.txt`; check the patterns (`PROFILE_PICTURE`, `COVER`,
   `UPLOAD`, `SAVE`) against it, and fix them, before the first `--live`.
3. **Only the two photos change.** With `profileName` set, the dry run also reads
   the name page (`nameFound.txt`); the rename itself is built from an inspect
   recording first (rule 29). Bio and every other field stay read-only.
4. **It is a launch** (rule 35): it counts against the 8 a day, 10 minutes
   apart, and needs waking hours, the proxy gate and a saved
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
5. When the owner says go: `--live`. The machine uploads the profile photo, then
   the cover; any failed step stops the run (nothing is retried on
   Facebook). A failed step saves `<item>Failed.txt` with what the page had.
   On success `profileSetAt` is set in Twenty.
6. Rebuild the Facebook client docs: the profile requests are new.

   ```bash
   log capture docs
   ```

### Codes

| Code | Means | Do |
| --- | --- | --- |
| `profilePhotoMissing` | `--live` without both photos, or a photo that can't be read | Set both fields in Twenty |
| `profileControlNotFound` | No opener, no "Upload photo" item, no file input | Read `profileFound.txt` / `<item>Failed.txt`, fix the pattern |
| `profileUploadNotSaved` | Save never enabled, or the dialog stayed open | Read the capture; run again after the gap |
| `sessionExpired` | The profile wasn't signed in | `log facebook connect --account <a>` first |

## The rules these tools fall under

Each by its number and first line. The full text is in AGENTS.md (`log://agents`); the core rules are in full in `getGuide({ topic: "logMcpInstructions" })`.

- **Rule 8.** Platform actions require the user authorization their tool defines.
- **Rule 19.** Every browser action records its raw HAR and timed step evidence, with no switch to disable capture.
- **Rule 29.** Record a browser page with the existing inspect tool before implementing actions on it.
- **Rule 30.** Complete the authorized task.
- **Rule 35.** Browser work uses one account browser through its active day, with actions as tabs/steps; close only for a logged lifecycle reason.
- **Rule 38.** Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless the owner raises them.
- **Rule 39.** Use only the scope, options and intent the owner stated or implied.
- **Rule 40.** Do not propose physical infrastructure unless the owner asks.
- **Rule 41.** Paid work must stay within the authorized task and spend.
- **Rule 73.** For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence.
- **Rule 79.** Flow controls must match deterministically by the recorded role/name and scope; ambiguous, missing or disabled controls refuse.
