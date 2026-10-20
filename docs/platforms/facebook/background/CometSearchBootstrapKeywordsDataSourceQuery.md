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

Seen 12 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
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
