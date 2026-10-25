# svcShredditStylingOverrides

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | community |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/styling-overrides` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script0.js:44 anonymous` |
| rea | `ev_12bce587ea2b77c3b78c6903f14b7897a0e8b62e18d85f1a74650c915d8a117b` |

Seen 7 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 3468 ms | 3475 ms | — |
| inspect | step 3: goto /r/AskReddit/ | 1 | 200 | 536 ms | 4662 ms | — |
| inspect | step 5: goto /search/ | 1 | 200 | 338 ms | 1324 ms | — |
| inspect | step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th | 1 | 200 | 332 ms | 1059 ms | — |
| inspect | step 10: goto /user/Maleficent-Try-8338/ | 1 | 200 | 591 ms | 1268 ms | — |
| inspect | step 11: goto /notifications | 1 | 200 | 305 ms | 1591 ms | — |
| inspect | step 12: goto /r/popular/ | 1 | 200 | 333 ms | 803 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 200, 3468 ms

Sent:

```json
{
  "query": {
    "v": "0"
  },
  "body": null
}
```

Answered:

```json
[]
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 200, 536 ms

Sent:

```json
{
  "query": {
    "v": "0"
  },
  "body": null
}
```

Answered:

```json
[]
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 5: goto /search/: 200, 338 ms

Sent:

```json
{
  "query": {
    "v": "0"
  },
  "body": null
}
```

Answered:

```json
[]
```

<!-- facts:end -->

## What it does

This call is part of the page's ad-block check. The slice first asks `nu()` whether an ad blocker and acceptable ads are on, packs the result into `v` with `lu({isAdblockEnabled, isEyeoPartnered, isAcceptableAdsEnabled})`, and fetches `/svc/shreddit/styling-overrides/?v=…` (rea `ev_12bce587…`, whose one finding is this endpoint). In every recorded call we sent `v=0` and got back an empty list, so no styling was changed. It fired on every page we opened.

## What our machine does with it

log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, with no Reddit client vendored yet) and `log inspect` in the account's AdsPower browser with no proxy (rule 84). Nothing waits on this call yet: inspect records it and names it in each step's `exchanges.json`, and SubQ reads it with the rest of the step. If log-cli acts on Reddit, `v=0` is worth keeping an eye on: it is what the page reports about ad blocking in our AdsPower browser, and a different value would mean the browser started to look different.

## What can go wrong

All seven recorded calls answered 200, the first in 3468 ms and the rest in 305-591 ms. The fetch sits in a `try` with an empty `catch`, so a failure is ignored completely and never stops the page or a run.
