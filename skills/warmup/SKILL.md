---
name: warmup
description: Record and run the account warm-up (rule 36) - Listaro's five activities (feed, Marketplace browse, create-page check, Selling, Messages), each recorded once with log inspect in a headed session, turned into a flow and an XState machine, then run in one open browser with an activity feed. Use when matt says warm up, warm-up, record the warm-up, or wants to watch it.
---

# warmup

## Hard boundaries

1. **Recorded, never written blind** (rule 29). `log warmup record` drives the
   inspect session headed, every step saved (snapshot, screenshot, HAR, rea),
   and builds each flow from that recording. `log warmup run` refuses an
   activity whose flow isn't recorded (`flowNotRecorded`).
2. **One browser** (rule 35). Record and run both open one session and do every
   activity inside it.
3. **Likes act on Facebook** (rule 8): `clickAny button ^Like$` only runs with
   `--likes`, when matt asks. Everything else reads.
4. **Live and watched** (rule 26): run through Monitor; every step goes to the
   activity feed as it happens.

## The routine

```bash
log warmup plan                                        # the five scripts, recorded or not
log warmup record --account <a> --now                  # one headed session: each script, then each flow
log warmup run --account <a> --gapMinutes 2 --now      # watched run: the machine runs each flow in turn
log warmup feed --account <a> --follow                 # the activity feed, live
```

`--gapMinutes` defaults to 150 (five activities across the account's day);
use 1-5 when matt is watching. `--only feedBrowse,sellingVisit` limits it.

After recording, read each activity's steps with rea (rule 25) and rebuild the
request docs (`log firefoxCapture --docs`, rule 27) before pushing.

Doc: `docs/lifecycle.md` (the warm-up section); scripts:
`src/marketplace/warmup/helpers/scripts.ts`.
