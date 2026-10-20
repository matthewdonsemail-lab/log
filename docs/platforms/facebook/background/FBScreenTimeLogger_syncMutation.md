# FBScreenTimeLogger_syncMutation

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 27 time(s) in 8 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
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

<!-- facts:end -->

## What it does

Logs time spent on screen.

## What our machine does with it

Nothing. The flow generator ignores it as a confirmation.

## What can go wrong

Harmless.
