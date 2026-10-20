# The account lifecycle

AGENTS.md rule 35, and the section at the top of AGENTS.md. Each account has
one XState machine, `lifecycleMachine` in `src/marketplace/lifecycle/`, from
its import to its host watching it every day. **The browser is opened once
per local day and stays open; every step happens inside it.** Plan and
reasons: `PLANS/LOG_CLI_ACCOUNT_LIFECYCLE_PLAN.md`; Listaro's own lifecycle:
`RESEARCH/LISTARO_BROWSER_LIFECYCLE.md`.

```bash
log lifecycle                     # every account: status, state, what onboarding has left
log lifecycle --account <name>    # one, with its standing
log lifecycle states              # the machine's own state tree
log lifecycle states --write      # regenerates the tree at the end of this file
```

## Two lanes

**Onboarding:** `proxying → opening → next → signingIn → checkingAccount →
settingProfile → settingName → settingLocation → warming → attached`.
`next` is a router: it picks the first step not done yet. So an account
loaded from Twenty starts where it is, and an interruption comes back to the
exact step it left.

**Host:** `opening → watching ⇄ checking`, with `ACT → acting`. Acting runs
publish or a reply in a tab of the open browser, never a launch of its own.
At the end of the day the host goes to `overnight`: it closes for
`endOfActiveHours`, waits for the account's morning, and reopens.

## The warm-up (a day, in the browser that stays open)

After the profile (photo and cover, rule 28), the name, and the Marketplace
location, the account runs Listaro's five warm-up activities
(`Listaro_backup/src/lib/account-warmup.ts`), in its stage order, spaced
through one day (`activityGapMs`, default 2.5 h):

| Activity | Listaro | What it does |
| --- | --- | --- |
| `feedBrowse` | stage 1 (`runStage1`, :92-130) | Home feed, 4-7 scrolls, 2-3 likes (only with `liveActions`, rule 8), a look at Marketplace |
| `marketplaceBrowse` | stage 2 (`runStage2`, :135-174) | Marketplace, 3-5 scrolls, opens 2-4 listings and reads each |
| `createAccessCheck` | stage 3 (`runStage3`, :181-209) | Opens /marketplace/create/item and checks it stays (posting allowed) |
| `sellingVisit` | stage 4 (`runStage4or5`, :214-246) | Marketplace, 4-7 scrolls, then Marketplace > Selling |
| `messagesVisit` | stage 5 | Stage 4, then Messages |

Each activity is a flow recorded once in a headed `log inspect` session
(`log warmup facebook stages record`, rule 36) and run by the warm-up machine in one open
browser (`log warmup facebook stages run`), every step in the stage log (`log warmup facebook stages log
--follow`). Warm-up steps are `scroll 4-7 300-600` (wheel ticks, not jumps),
`openAny /marketplace/item/ 2-4` (random listings, read, back), `clickAny
button ^Like$ 2-3` (live, `--likes` only) and `dwell 3-5`, their ranges drawn
on every run. Scripts: `src/marketplace/warmup/helpers/scripts.ts`.

The warm-up ends when every activity has run **and** a whole day
(`warmupMs`, default 24 h) has passed since it began. Then the account is
`attached` and `warmedAt` is set.

What Listaro got wrong, and what this changes:
- **It was never wired up.** No schedule and no button called it.
- **It set no profile, no name and no location.** Here those come first.
- **It never looked for checkpoints.** Here any step can raise an account issue.
- **It closed the borrowed tab** (`account-warmup.ts:343-345`). Here an action only ever closes its own tab.
- **It had posting caps it never enforced.** No listing is published until the account is attached.

## Interruptions, and where each one goes back to

| Outcome of any step | Goes to | Then |
| --- | --- | --- |
| `needsLogin` issue (login wall, session expired) | `onboarding.signingIn`, in the same browser | `next`, back to where it was |
| `checkpoint` issue (checkpoint, video selfie) | `needsPerson`, with the window kept open for a person | `PERSON_DONE` → `checkingAccount` → `next` |
| `limited` issue (rate limited) | `cooling`: closed for `rateLimited`, rested `limitedRestMs` | `opening` |
| `restricted` issue (e.g. Pittsburgh, "everything you manage is restricted") | closed for `restricted` → `restricted` (final) | kept in Twenty (rule 13) |
| `banned` issue (account disabled) | closed → `banned` (final) | kept in Twenty |
| a retryable error | the same step once more after `retryMs` | then `stuck` |
| `browserGone` in the host (crash, window closed) | `crashed` (close logged) → `opening` | one reopen a day; a second one goes to `stuck` (`opensSpent`) |
| `PAUSE` / `RESUME` | `paused` | `opening` |
| `SHUTDOWN` | closed for `shutdown` → `stopped` | — |
| `LOST` | closed for `accountLost` → `lost` | — |

**Every close has a reason** (`CloseReason`), kept in `context.browser.closes`.
Opens are counted per local day: one, plus one reopen after a crash
(`OPENS_PER_DAY = 2`).

## What Twenty records (`socialAccounts`, all additive)

| Field | Set when |
| --- | --- |
| `lifecycleState` | the host saves the machine's state as it moves |
| `profileSetAt` | the photo and cover are saved (`log profile setup --live`) |
| `profileNamedAt` | the rename is saved. Backfilled 2026-10-19 for Bethlehem, Scranton and Lancaster from each run's `useFXIMUpdateNameMutation` answer (`"error": null`) |
| `marketplaceLocationAt` | the Marketplace location is confirmed in the home city. Backfilled for Reading from its `CometMarketplaceSetBuyLocationMutation`, 2026-10-19 17:18 UTC |
| `warmupStartedAt`, `warmedAt` | the warm-up begins, and the account is attached |

## What runs it

The actors are the steps log-cli already has:

- **proxy:** `log proxy`
- **open:** the gate, the device and the self-check
- **sign-in:** the connect machine
- **account check:** `classifySignal`, including `restrictedPolicy`
- **profile and name:** the profile machine and the `profileSetup` flow
- **location:** `set_marketplace_location`
- **acting:** publish and replies
- **watching:** the Selling page review check and the inbox scan (rule 34)

The host keeps them in one open browser: `log host start --account <a>`
(`src/marketplace/host`, actors in `src/cli/host/helpers/hostActors.ts`,
`skills/host/SKILL.md`). It saves the machine's snapshot and a resume record
(`~/.logCli/host/<account>/progress.json`) on every change, so a restart picks
up where it was (warm-up done, opens today), and takes `PERSON_DONE`, `PAUSE`,
`RESUME`, `SHUTDOWN` and `LOST` from `log host send`. Signed in is decided by
the `c_user` and `xs` cookies, and the session is saved to Twenty as soon as
it is. Every step's landing page is checked (`pageProblem`: checkpointed,
loginWall, pageNotReached). Not built yet: `acting` (publish and replies as a
tab) answers `actNotBuilt`, so the standalone commands still open their own
browser for those: use them as few times as possible.

## The machine's state tree

<!-- generated by `log lifecycle states --write`: edit src/marketplace/lifecycle/machine.ts, not this list -->

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
