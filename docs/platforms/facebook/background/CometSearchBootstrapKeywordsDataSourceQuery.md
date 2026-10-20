# CometSearchBootstrapKeywordsDataSourceQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27797631676573850` |
| Path | `/api/graphql/` |
| Sends | `first` |
| Reads | — |
| Called from | — |
| rea | not read yet |

Seen 24 time(s) in 9 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id> | 1 | 200 | 364 ms | 7210 ms | — |
| inspect | step 1: goto / | 5 | 200 | 458–534 ms | 6491–8720 ms | — |
| inspect | step 7: goto / | 1 | 200 | 466 ms | 4918 ms | — |
| inspect | rea read step 33_dwell028s: exit 0, ev_d164a9c78021b1afb8ce6c5a24456a0d8f46efdbc7c54440f7f | 1 | 200 | 495 ms | 3174 ms | — |
| inspect | step 38: goto /marketplace/ | 1 | 200 | 813 ms | 7818 ms | — |
| inspect | rea read step 21_dwell078s: exit 0, ev_87a54a6ea91a3418cb413686bdc6108f946bdf45884c8230e49 | 1 | 200 | 516 ms | 3526 ms | — |
| inspect | step 27: goto / | 1 | 200 | 472 ms | 3177 ms | — |
| inspect | step 4: goto /marketplace/ | 1 | 200 | 503 ms | 5697 ms | — |
| inspect | step 1: goto /reel/ | 3 | 200 | 347–391 ms | 3276–3898 ms | — |
| inspect | step 71: goto /reel/ | 1 | 200 | 338 ms | 3839 ms | — |
| inspect | rea read step 13_dwell600s: exit 0, ev_e8922deafb7ba9951a51bda6f8cd82b5b68c41db19bfe0cd164 | 1 | 200 | 1402 ms | 1224 ms | — |
| inspect | step 23: goto /reel/<id> | 1 | 200 | 488 ms | 2166 ms | — |
| inspect | step 9: goto /reel/<id> | 1 | 200 | 1565 ms | 3485 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 403 ms | 2368 ms | — |
| inspect | step 20: goto /reel/<id> | 1 | 200 | 423 ms | 2623 ms | — |
| inspect | step 22: goto /reel/ | 1 | 200 | 2547 ms | 2568 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 1 | 200 | 696 ms | 4939 ms | — |
| inspect | step 53: goto /reel/ | 1 | 200 | 370 ms | 5585 ms | — |

<!-- facts:end -->

## What it does

Preloads search suggestions for the search box. Loads on every signed-in page.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
