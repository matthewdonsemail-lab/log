# CometRightSideHeaderCardsQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29755211854079266` |
| Path | `/api/graphql/` |
| Sends | `refresh_num`, `scale`, `__relay_internal__pv__GHLShouldChangeRHCSideFeedFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeRHCAdsFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeRHCFieldNamerelayprovider` |
| Reads | `viewer....CometRightSideHeaderCards_viewerSideFeed`, `viewer....CometHomeRightSideEgoContainer_egoPanel`, `...PagesCometHomeAdminContainer_query` |
| Called from | `CometRightSideHeaderCards.react` |
| rea | `ev_0ca298c8c568c93036a5e8e8d989f3baf2a29fa5ca4d1fd7a8070819f4515962` |

Seen 19 time(s) in 10 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 626 ms | 13568 ms | — |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 671 ms | 12036 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 990 ms | 7055 ms | — |
| warmup | step 11: goto /marketplace/ | 1 | 200 | 561 ms | 8608 ms | — |
| warmup | step 17: goto /marketplace/ | 1 | 200 | 599 ms | 12045 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 722 ms | 1258021 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 430 ms | 5495 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 441 ms | 8268 ms | — |
| inspect | step 96: clickRole button "…" | 1 | 200 | 580 ms | 1305471 ms | — |
| inspect | step 4: snapshot | 1 | 200 | 714 ms | 344 ms | — |
| inspect | pin: typed the account's Messenger PIN | 1 | 200 | 627 ms | 558 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 649 ms | 6677 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 811 ms | 103690 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 1 | 200 | 723 ms | 5699 ms | — |
| inspect | step 4: goto /marketplace/inbox | 2 | 200 | 651–956 ms | 558519–564742 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 1507 ms | 59461 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 2574 ms | 11547 ms | — |
| inspect | step 6: goto /marketplace/inbox | 1 | 200 | 970 ms | 1708103 ms | — |

<!-- facts:end -->

## What it does

Cards in the home page's right column.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
