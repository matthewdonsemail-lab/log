---
name: warmup
description: Record and run the account warm-up (rule 36) - Listaro's five activities (feed, Marketplace browse, create-page check, Selling, Messages), each recorded once with log inspect in a headed session, turned into a flow and an XState machine, then run in one open browser with a stage log: `log facebook warmup stages` (rule 60). Use when matt says warm up, warm-up, record the warm-up, or wants to watch it.
---

# warmup

## Hard boundaries

1. **Recorded, never written blind** (rule 29). `log facebook warmup stages record` drives the
   inspect session headed, every step saved (snapshot, screenshot, HAR, rea),
   and builds each flow from that recording. `log facebook warmup stages run` refuses an
   activity whose flow isn't recorded (`flowNotRecorded`).
2. **One browser** (rule 35). Record and run both open one session and do every
   activity inside it.
3. **Likes act on Facebook** (rule 8): `clickAny button ^Like$` only runs with
   `--likes`, when matt asks. Everything else reads. **A like passes on
   Facebook's answer** (rule 73), not on the "Remove Like" button: the step
   waits for `CometUFIFeedbackReactMutation` and passes only when it answers
   2xx with the reaction we sent saved (`expect.answers`, `answerIssue`). A
   step's answers are read from its own recording and kept as
   `exchanges.json`. Other steps get `expect.answers` the same way, written
   from that request's doc ("What it sent and what came back").
4. **Live and watched** (rule 26): run through Monitor; every step goes to the
   stage log as it happens.
5. **Stops on the wrong page.** Every step's landing page is checked
   (`pageProblem`): a checkpoint, a login wall or another section ends the
   activity (`blocked`), and the account's issue is written to Twenty. Erie,
   2026-10-19, scrolled a checkpoint page for a minute before this.
6. **Scrolls like a hand** (`python/human/scrollMotion.py`, ported from the Robotic
   VSL repo): bell-curve wheel steps, overshoot and recoil, mid-pauses. No
   `scrollBy` or `scroll_into_view_if_needed` anywhere.

## The routine

```bash
log facebook warmup stages plan                                        # the five scripts, recorded or not
log facebook warmup stages record --account <a> --now                  # one headed session: each script, then each flow
log facebook warmup stages run --account <a> --gapMinutes 2 --now      # watched run: the machine runs each flow in turn
log facebook warmup stages log --account <a> --follow                 # the stage log, live
```

`--gapMinutes` defaults to 150 (five activities across the account's day);
use 1-5 when matt is watching. `--only feedBrowse,sellingVisit` limits it.

After recording, read each activity's steps with rea (rule 25) and rebuild the
request docs (`log facebook capture --docs`, rule 27) before pushing.

All five are flows since 2026-10-22 (Bethlehem: recorded, then run 27/27 steps):
`src/browser/flow/definitions/warmup*.json`, docs in
`docs/platforms/facebook/flows/warmup*.md`. A record that fails part-way still
saves the activities that finished before it.

Doc: `docs/lifecycle.md` (the warm-up section); scripts:
`src/facebook/warmup/stages/helpers/scripts.ts`.

## By platform: Facebook Reels, for a persona (rules 49-51)

```bash
bun scripts/datasets/buildReelViewers.ts                        # once: 980 real viewers from KuaiRand-1K (~/.logCli/datasets)
bun scripts/datasets/buildInterestEffect.ts                     # once: the interest effect, from KuaiRand-Pure's random log
log facebook warmup persona --account <a>              # the persona, its real viewer and its pack (every dataset a trait)
log proxy balance                                      # 2Captcha traffic left, before a run
log facebook warmup reel run --account <a> --persona --live [--likes] [--trafficMb 1024]
```

- Each reel, the moment it lands, is read by SubQ from its frame (theirs or
  not, what it is, the one action they'd pick); the orderer (`planReel`)
  plans the watch from the real viewer's plays (their kind from their median
  up, the rest from it down, scaled by the measured effect) and at most one
  action. Watch every line live (rule 26): `= reel N: THEIRS|not theirs; watch …`.
- Reels streams video through the proxy: about 4.5 MB a reel (2026-10-20).
  A run is refused when the account used its `--trafficMb` (default 1 GB) in
  the last 24 hours, checks every 5 reels and stops at it; each run's use goes
  to `~/.logCli/proxyTraffic.jsonl`.
- The creator's profile opens in its own tab: back to the reel closes it
  (`closeTab`). Stop a run with the browser left open (rule 35); if a session
  dies, close its AdsPower profile and clear its proxy, then log the close.
