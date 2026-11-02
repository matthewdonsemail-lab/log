---
title: "Account lifecycle"
---

# Account lifecycle

Every account runs one lifecycle machine (`lifecycleMachine`, XState) that holds one browser open for the account's day: an onboarding lane (proxy, sign-in, account check, profile, name, location, a day's warm-up) and a host lane (open, watching, acting, resting). The browser opens once a local day, every action is a tab in it, and it closes only for a logged reason. An open browser that lands on a `/checkpoint` page deactivates its account. Rules 35 and 82.

## Routing

### REQ-LIFE-01: An account's status picks where the machine starts

A banned account goes to `banned`, a dead one to `lost`, a deactivated one to `deactivated`, a restricted one to `restricted` and a paused one to `paused`, without opening a browser. An account with no proxy starts by getting one, and any other starts by opening its browser. Rule 35.

## One browser a day

### REQ-LIFE-02: The browser is opened only when it is not already open

Before each lane's work, the machine opens the browser only when it is closed. When it is open, the lane goes on in the same browser. Rule 35.

### REQ-LIFE-03: The browser opens at most twice a local day

The browser opens at most `OPENS_PER_DAY` (2) times a day: once, and once more after a crash. When the opens are spent, the machine stops in `stuck` with `opensSpent` and opens nothing. A new day puts the count back to 0. Rule 35.

### REQ-LIFE-04: An action runs in the open browser

An action sent to the host (`ACT`) runs while the browser stays open, and the host goes back to watching it afterwards. No action opens a browser of its own. Rule 35.

## Closing

### REQ-LIFE-05: Every close is logged with its reason

Every close goes through the browser close with a reason (`CloseReason`), and the reason and the time are added to `browser.closes`, even when the close itself fails. Rule 35.

### REQ-LIFE-06: The end of the active hours closes the browser until morning

When a check says the day is over, the browser closes for `endOfActiveHours`, the machine waits for the account's next active hours, starts a new day and opens it again. Rule 35.

### REQ-LIFE-07: Shutdown and a lost account close the browser

`SHUTDOWN` closes the browser for `shutdown` and stops the machine. `LOST` closes it for `accountLost` and ends in `lost`. Rule 35.

### REQ-LIFE-08: A restriction or a ban closes the browser

A restricted issue closes the browser for `restricted` and ends in `restricted`. A banned issue closes it for `restricted` and ends in `banned`. Rule 35.

### REQ-LIFE-09: A crash is logged and the browser is opened again

When the host finds the browser gone (`browserGone`), a `crash` close is logged and the host opens the browser again, which counts against the day's opens. Rule 35.

## Onboarding lane

### REQ-LIFE-10: Onboarding runs its steps in order in the open browser

Onboarding goes through sign-in, the account check, the profile, the name when one is wanted, the location and the warm-up, in that order, skipping the ones already done, before the account moves to the host lane. Rule 35.

### REQ-LIFE-11: The warm-up takes a day

The warm-up runs each of the five warm-up activities once, with a gap between them, and the account moves to the host lane only once every activity is done and the warm-up day (`warmupMs`, 24 hours) has passed. While it waits, it checks the account on the watch interval. Rule 35.

### REQ-LIFE-12: A sign-out goes back to signing in, twice at most

When a step finds the account signed out, the machine goes back to signing in, in the same browser. Two sign-ins in a row that end signed out stop it in `stuck` with `signInSpent`. Rule 35.

## Checkpoints

### REQ-LIFE-13: A checkpoint page deactivates the account

While an account's browser is open, every page it lands on is read from its run's `navigations.jsonl`. The moment one is a `/checkpoint` page, the account is set to DEACTIVATED in Twenty with the reason `checkpointed`, its listings are marked lost, and the page and the time go in the detail. Rule 82.

### REQ-LIFE-14: Every open account browser is watched for a checkpoint

The checkpoint watch runs for every session that holds an account's browser open: `log inspect start`, and the sessions the host, a flow run and the warm-up stages open. It runs between steps as well as during them, and is stopped when the session ends. Rule 82.

### REQ-LIFE-15: An account already deactivated is left as it is

When the account is already DEACTIVATED, the watch changes nothing. When saving the status to Twenty fails, the watch says so and tries again. Rule 82.
