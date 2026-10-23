# useCIXLogMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `24438951589125380` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `cix_log.__typename` |
| Called from | `useCIXLogMutation` |
| rea | `ev_861b046d2fca8f66f0fb54a8cbcb72051f984ac968338f63fa57bbc89194bb2d` |

Seen 12 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | scroll: +127px in 4 wheel steps, 125 ms | 1 | 200 | 359 ms | 4540 ms | — |
| warmup | scroll: -605px in 14 wheel steps, 687 ms | 1 | 200 | 379 ms | 2410 ms | — |
| warmup | scroll: +459px in 11 wheel steps, 500 ms | 1 | 200 | 368 ms | 1144 ms | — |
| warmup | openAny: read /marketplace/item/<id>/ | 1 | 200 | 375 ms | 4240 ms | — |
| warmup | scroll: -756px in 16 wheel steps, 656 ms | 1 | 200 | 383 ms | 1781 ms | — |
| inspect | step 22: clickRole button "…" | 1 | 200 | 583 ms | 3161 ms | — |
| inspect | scroll: -577px in 13 wheel steps, 859 ms | 1 | 200 | 503 ms | 3589 ms | — |
| inspect | scroll: +978px in 22 wheel steps, 1531 ms | 1 | 200 | 468 ms | 1992 ms | — |
| inspect | step 25: openAny 1-3 x /marketplace/item/ | 1 | 200 | 486 ms | 4053 ms | — |
| warmup | scroll: +213px in 7 wheel steps, 453 ms | 1 | 200 | 445 ms | 290 ms | — |
| warmup | scroll: -1034px in 22 wheel steps, 1032 ms | 1 | 200 | 384 ms | 1573 ms | — |
| warmup | scroll: +981px in 24 wheel steps, 1672 ms | 1 | 200 | 392 ms | 3051 ms | — |

<!-- facts:end -->

## What it does

A logging call from Facebook's client: it sends `input` and reads only `cix_log.__typename`. It fired 3 times in 2 runs, 1.5-3.2 s into scrolls of the Marketplace browse feed, with `CometMarketplaceSetProductItemSeenStateMutation`.

## What our machine does with it

Nothing in our machines reads it; it comes with the feed warm-up's `scrollMarketplace`.

## What can go wrong

None seen: all three answered 200 in 468-503 ms. Nothing waits on it.
