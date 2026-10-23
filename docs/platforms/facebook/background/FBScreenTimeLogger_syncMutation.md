# FBScreenTimeLogger_syncMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `28969188822673160` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `screen_time_sync.aggs` |
| Called from | `FBScreenTimeLogger.react` |
| rea | `ev_9c20c08fbf4c14d62fa5b772be9b8dc2f4b32b06aa445a78cfb8f8ea86ba73c3` |

Seen 67 time(s) in 20 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | scroll: +388px in 10 wheel steps, 1109 ms | 1 | 200 | 496 ms | 145 ms | — |
| warmup | step 13: goto /marketplace/create/item | 1 | 200 | 503 ms | 6848 ms | — |
| warmup | step 23: goto /marketplace/you/selling | 1 | 200 | 631 ms | 16495 ms | — |
| warmup | scroll: +531px in 14 wheel steps, 765 ms | 1 | 200 | 514 ms | 8077 ms | — |
| inspect | scroll: +800px in 18 wheel steps, 781 ms | 6 | 200 | 421–2294 ms | 151337–1651976 ms | — |
| inspect | step 13: wait 8s | 1 | 200 | 542 ms | 26897 ms | — |
| inspect | step 23: press Escape | 1 | 200 | 633 ms | 5741 ms | — |
| inspect | step 39: snapshot | 1 | 200 | 2124 ms | 4241 ms | — |
| inspect | step 22: dwell 21.38s | 1 | 200 | 764 ms | 20848 ms | — |
| inspect | post: "…", 50 words, 0 image(s), scrolled 742 px | 1 | 200 | 912 ms | 443 ms | — |
| inspect | openAny: read /marketplace/item/<id>/ | 1 | 200 | 538 ms | 6418 ms | — |
| inspect | step 31: clickRole button "…" | 1 | 200 | 660 ms | 96068 ms | — |
| inspect | post: "…", 106 words, 1 image(s) | 1 | 200 | 845 ms | 5619 ms | — |
| inspect | scroll: +783px in 18 wheel steps, 797 ms | 2 | 200 | 539–704 ms | 216636–516909 ms | — |
| inspect | step 64: clickRole button "…" | 1 | 200 | 497 ms | 1245 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 3 | 200 | 396–426 ms | 219147–519435 ms | — |
| inspect | step 20: clickRole button "…" | 1 | 200 | 447 ms | 4790 ms | — |
| inspect | step 24: clickRole button "…" | 6 | 200 | 426–5897 ms | 266562–1767309 ms | — |
| inspect | step 17: scrollIn heading "…" 2-3 x 300-500px | 1 | 200 | 412 ms | 36 ms | — |
| inspect | step 44: dwell 18s | 1 | 200 | 474 ms | 790 ms | — |
| inspect | step 82: dwell 1s | 1 | 200 | 425 ms | 5069 ms | — |
| inspect | step 96: clickRole button "…" | 6 | 200 | 386–1201 ms | 184115–1686233 ms | — |
| inspect | step 1: goto /messages/ | 1 | 200 | 662 ms | 7270 ms | — |
| inspect | step 11: goto /marketplace/create/item | 1 | 200 | 1332 ms | 11562 ms | — |
| inspect | step 25: click e1241 | 1 | 200 | 464 ms | 10781 ms | — |
| inspect | type failed: TimeoutError: Locator.press_sequentially: Timeout 30000ms exceeded. | 1 | 200 | 1542 ms | 40440 ms | — |
| inspect | step 5: wait 5s | 2 | 200 | 491–494 ms | 216260–516495 ms | — |
| inspect | step 11: goto /marketplace/inbox | 1 | 200 | 524 ms | 26832 ms | — |
| inspect | step 3: goto /marketplace/inbox | 9 | 200 | 497–1377 ms | 223677–1728919 ms | — |
| inspect | step 4: goto /marketplace/inbox | 6 | 200 | 572–2282 ms | 252472–1753170 ms | — |
| inspect | step 6: goto /marketplace/inbox | 5 | 200 | 434–874 ms | 11719–1213257 ms | — |

<!-- facts:end -->

## What it does

Logs time spent on screen.

## What our machine does with it

Nothing. The flow generator ignores it as a confirmation.

## What can go wrong

Harmless.
