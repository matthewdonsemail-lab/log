---
name: host
description: Run an account's whole lifecycle (rule 35) in ONE browser kept open for its day - log facebook host start opens it once, signs in by the session cookie, checks the account, sets profile/name/location (--live), runs the warm-up and watches, saving progress on every change so a restart resumes at the exact next step. Use when matt says host, keep it open, run the account, resume, or the persistent browser.
---

# host

## Hard boundaries

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

## The routine

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

## The check (every watch round, rule 69)

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
