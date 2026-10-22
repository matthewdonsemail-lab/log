# CometHomeContactsContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28451034771148738` |
| Path | `/api/graphql/` |
| Sends | `numContactsToFetch`, `scale` |
| Reads | — |
| Called from | `CometHomeContactsContainer.react` |
| rea | `ev_e995d66efcc3f1441f66a4a1830248686b9e9528015dfffb1ae7ad809a2f133c` |

Seen 9 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 654 ms | 13575 ms | A server error field_exception occured. Check server logs for details. |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 682 ms | 12042 ms | A server error field_exception occured. Check server logs for details. |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 980 ms | 7074 ms | A server error field_exception occured. Check server logs for details. |
| warmup | step 11: goto /marketplace/ | 1 | 200 | 625 ms | 8615 ms | A server error field_exception occured. Check server logs for details. |
| warmup | step 17: goto /marketplace/ | 1 | 200 | 566 ms | 12051 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 24: clickRole button "…" | 1 | 200 | 609 ms | 1258011 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 3: clickRole button "…" | 1 | 200 | 623 ms | 5487 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 417 ms | 8261 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 96: clickRole button "…" | 1 | 200 | 389 ms | 1305463 ms | A server error field_exception occured. Check server logs for details. |

<!-- facts:end -->

## What it does

The home page's contacts column: friends.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
