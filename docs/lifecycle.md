# The account lifecycle

Every Facebook account in log moves through one state machine, from the day it
is imported to the days its host watches it. The machine says what the account
has done, what it still needs, and where to go back to after an interruption.
Its main idea: **the account's browser opens once per local day and stays
open, and every step happens inside it.** Read this when you onboard an
account or want to know why a host is in the state it is in.

```bash
log facebook lifecycle                     # every account: status, state, what onboarding has left
log facebook lifecycle --account <name>    # one account, with its standing
log facebook lifecycle states              # the machine's own state tree
log facebook lifecycle states --write      # regenerates the tree at the end of this page
```

The machine is `lifecycleMachine` (XState) in `src/marketplace/lifecycle/`.

## Two lanes

**Onboarding** gets a new account ready:

`proxying → opening → next → signingIn → checkingAccount → settingProfile → settingName → settingLocation → warming → attached`

`next` is a router: it picks the first step not done yet. So an account loaded
from Twenty starts where it is, and an interruption comes back to the exact
step it left.

**Host** looks after a ready account every day:

`opening → watching ⇄ checking`, and `ACT → acting`

- Acting is meant to run a publish or a reply in a tab of the open browser,
  never in a browser of its own. It is not built yet (see below).
- At the end of the day the host goes `overnight`: it closes the browser for
  `endOfActiveHours`, waits for the account's morning, and reopens.

## The warm-up: one day, in the browser that stays open

After the profile (photo and cover), the name and the Marketplace location,
the account runs five warm-up activities in order, spaced through one day
(`activityGapMs`, default 2.5 hours):

| Activity | What it does |
| --- | --- |
| `feedBrowse` | Home feed, 4-7 scrolls, 2-3 likes (only with `liveActions`), a look at Marketplace |
| `marketplaceBrowse` | Marketplace, 3-5 scrolls, opens 2-4 listings and reads each |
| `createAccessCheck` | Opens /marketplace/create/item and checks the page stays (posting allowed) |
| `sellingVisit` | Marketplace, 4-7 scrolls, then Marketplace > Selling |
| `messagesVisit` | The same as `sellingVisit`, then Messages |

How they run:

- Each activity is a flow, recorded once in a visible `log inspect` session
  (`log facebook warmup stages record`).
- The warm-up machine runs the flows in one open browser
  (`log facebook warmup stages run`).
- Every step goes into the stage log (`log facebook warmup stages log --follow`).
- The step types are `scroll 4-7 300-600` (wheel ticks, not jumps),
  `openAny /marketplace/item/ 2-4` (random listings, read, then back),
  `clickAny button ^Like$ 2-3` (live, with `--likes` only) and `dwell 3-5`.
  Their ranges are drawn fresh on every run.

The warm-up ends when every activity has run **and** a whole day
(`warmupMs`, default 24 hours) has passed since it began. Then the account is
`attached` and `warmedAt` is set.

Compared with the warm-up this was based on:

- It is wired up: the lifecycle runs it, nothing has to remember to.
- Profile, name and location are set first.
- Any step can raise an account issue, such as a checkpoint.
- An action only ever closes its own tab.
- No listing is published until the account is attached.

## Interruptions, and where each one goes back to

| Outcome of any step | Goes to | Then |
| --- | --- | --- |
| `needsLogin` issue (login wall, session expired) | `onboarding.signingIn`, in the same browser | `next`, back to where it was |
| `checkpoint` issue (checkpoint, video selfie) | `needsPerson`, with the window kept open for a person | `PERSON_DONE` → `checkingAccount` → `next` |
| `limited` issue (rate limited) | `cooling`: closed for `rateLimited`, rested for `limitedRestMs` | `opening` |
| `restricted` issue (for example "everything you manage is restricted") | closed for `restricted` → `restricted` (final) | kept in Twenty |
| `banned` issue (account disabled) | closed → `banned` (final) | kept in Twenty |
| a retryable error | the same step once more after `retryMs` | then `stuck` |
| `browserGone` in the host (crash, window closed) | `crashed` (close logged) → `opening` | one reopen a day; a second goes to `stuck` (`opensSpent`) |
| `PAUSE` / `RESUME` | `paused` | `opening` |
| `SHUTDOWN` | closed for `shutdown` → `stopped` | — |
| `LOST` | closed for `accountLost` → `lost` | — |

**Every close has a reason** (`CloseReason`), kept in `context.browser.closes`.
Opens are counted per local day: one, plus one reopen after a crash
(`OPENS_PER_DAY = 2`).

## What Twenty records

These fields on `socialAccounts` are all additions; none replaces an older
field.

| Field | Set when |
| --- | --- |
| `lifecycleState` | the host saves the machine's state as it moves |
| `profileSetAt` | the photo and cover are saved (`log facebook profile setup --live`) |
| `profileNamedAt` | the rename is saved (it can be backfilled from the run's `useFXIMUpdateNameMutation` answer, `"error": null`) |
| `marketplaceLocationAt` | the Marketplace location is confirmed in the home city (it can be backfilled from the run's `CometMarketplaceSetBuyLocationMutation` answer) |
| `warmupStartedAt`, `warmedAt` | the warm-up begins, and the account is attached |

## What runs each step

The machine's actors are steps log already has:

- **proxy:** `log proxy`
- **open:** the gate, the device and the self-check
- **sign-in:** the connect machine
- **account check:** `classifySignal`
- **profile and name:** the profile machine and the `profileSetup` flow
- **location:** `set_marketplace_location`
- **acting:** publish and replies
- **watching:** the account check: Marketplace status, each listing's state on
  Selling, and the seller inbox

## The host

`log facebook host start --account <a>` keeps all of this in one open browser
(`src/marketplace/host`, actors in `src/cli/host/helpers/hostActors.ts`, how-to
in `skills/host/SKILL.md`).

- It saves the machine's snapshot and a resume record
  (`~/.logCli/runs/host/<account>/progress.json`) on every change, so a restart
  picks up where it was (warm-up done, opens today).
- It takes `PERSON_DONE`, `PAUSE`, `RESUME`, `SHUTDOWN` and `LOST` from
  `log facebook host send`.
- Signed in is decided by the `c_user` and `xs` cookies, and the session is
  saved to Twenty as soon as it is.
- Every step's landing page is checked (`pageProblem`: checkpointed,
  loginWall, pageNotReached).

**Not built yet:** `acting` (publish and replies as a tab) answers
`actNotBuilt`. Until it is, the standalone commands still open their own
browser for those, so use them as few times as possible.

The rules behind this are in AGENTS.md.

## The machine's state tree

<!-- generated by `log facebook lifecycle states --write`: edit src/marketplace/lifecycle/machine.ts, not this list -->

- **routing**
  - then → banned | lost | restricted | paused | onboarding.proxying | onboarding.opening
- **onboarding**
  - **proxying**
    - **run**: runs `checkProxy`
      - done → onboarding.opening | issue | onboarding.proxying.waitRetry | stuck
    - **waitRetry**
      - after retry → onboarding.proxying.run
  - **opening**
    - **gate**
      - then → onboarding.next | onboarding.opening.launch | stuck
    - **launch**
      - **run**: runs `openBrowser`
        - done → onboarding.next | issue | onboarding.opening.launch.waitRetry | stuck
      - **waitRetry**
        - after retry → onboarding.opening.launch.run
  - **next**
    - then → onboarding.opening | onboarding.signingIn | onboarding.checkingAccount | onboarding.settingProfile | onboarding.settingName | onboarding.settingLocation | onboarding.warming | onboarding.attached
  - **signingIn**
    - **run**: runs `signIn`
      - done → onboarding.next | issue | onboarding.signingIn.waitRetry | stuck
    - **waitRetry**
      - after retry → onboarding.signingIn.run
  - **checkingAccount**
    - **run**: runs `checkAccount`
      - done → onboarding.next | issue | onboarding.checkingAccount.waitRetry | stuck
    - **waitRetry**
      - after retry → onboarding.checkingAccount.run
  - **settingProfile**
    - **run**: runs `setProfile`
      - done → onboarding.next | issue | onboarding.settingProfile.waitRetry | stuck
    - **waitRetry**
      - after retry → onboarding.settingProfile.run
  - **settingName**
    - **run**: runs `setName`
      - done → onboarding.next | issue | onboarding.settingName.waitRetry | stuck
    - **waitRetry**
      - after retry → onboarding.settingName.run
  - **settingLocation**
    - **run**: runs `setLocation`
      - done → onboarding.next | issue | onboarding.settingLocation.waitRetry | stuck
    - **waitRetry**
      - after retry → onboarding.settingLocation.run
  - **warming**
    - **pick**
      - then → onboarding.attached | onboarding.warming.activity | onboarding.warming.waitingOutDay
    - **activity**
      - **run**: runs `warmupActivity`
        - done → onboarding.overnight | onboarding.warming.gap | issue | onboarding.warming.activity.waitRetry | stuck
      - **waitRetry**
        - after retry → onboarding.warming.activity.run
    - **gap**
      - after activityGap → onboarding.warming.pick
    - **waitingOutDay**
      - after warmupLeft → onboarding.warming.pick
  - **overnight**
    - **close**: runs `closeBrowser`
      - done → onboarding.overnight.rest
    - **rest**: runs `waitForActiveHours`
      - done → onboarding.opening
  - **attached**
    - then → host
- **host**
  - **opening**
    - **gate**
      - then → host.watching | host.opening.launch | stuck
    - **launch**
      - **run**: runs `openBrowser`
        - done → host.watching | issue | host.opening.launch.waitRetry | stuck
      - **waitRetry**
        - after retry → host.opening.launch.run
  - **watching**
    - ACT → host.acting
    - after watchInterval → host.checking
  - **checking**
    - **run**: runs `watchCheck`
      - done → host.overnight | host.watching | issue | host.crashed | host.checking.waitRetry | stuck
    - **waitRetry**
      - after retry → host.checking.run
  - **acting**: runs `act`
    - done → issue | host.watching
  - **crashed**
    - then → host.opening
  - **overnight**
    - **close**: runs `closeBrowser`
      - done → host.overnight.rest
    - **rest**: runs `waitForActiveHours`
      - done → host.opening
- **issue**
  - then → onboarding.signingIn | needsPerson | cooling | restricting | banning
- **needsPerson**
  - PERSON_DONE → onboarding.checkingAccount
- **cooling**
  - **close**: runs `closeBrowser`
    - done → cooling.rest
  - **rest**
    - after limitedRest → onboarding.opening
- **restricting**: runs `closeBrowser`
  - done → restricted
- **banning**: runs `closeBrowser`
  - done → banned
- **losing**: runs `closeBrowser`
  - done → lost
- **stopping**: runs `closeBrowser`
  - done → stopped
- **paused**
  - RESUME → onboarding.opening
- **stuck**
  - PERSON_DONE → onboarding.opening
- **restricted** (final)
- **banned** (final)
- **lost** (final)
- **stopped** (final)
