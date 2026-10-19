# CometRightSideHeaderCardsQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 9 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1321 | 1 | 200 | 4031 ms | 20576 ms | — |
| publish | Marketplace location: Reading 19601 US | 1 | 200 | 467 ms | 5685 ms | — |
| publish | Uploading 5 photo(s) | 1 | 200 | 508 ms | 891 ms | — |
| inspect | step 16: goto /marketplace/create/item | 1 | 200 | 1528 ms | 13473 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T122 | 1 | 200 | 403 ms | 1240 ms | — |
| inspect | step 2: wait 20s | 1 | 200 | 374 ms | 21004 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T120 | 2 | 200 | 407–456 ms | 10094–90182 ms | — |
| publish | Opening /marketplace/create/item | 1 | 200 | 1245 ms | 11860 ms | — |

<!-- facts:end -->

## What it does

Cards in the home page's right column.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
