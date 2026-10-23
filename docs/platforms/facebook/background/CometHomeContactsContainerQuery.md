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
| rea | `ev_1382c6aaad8caec306d87c00b9b241ef1e74ac91f09082d75f7694f794713881` |

Seen 22 time(s) in 12 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 654 ms | 13575 ms | A server error field_exception occured. Check server logs for details. |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 682 ms | 12042 ms | A server error field_exception occured. Check server logs for details. |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 980 ms | 7074 ms | A server error field_exception occured. Check server logs for details. |
| warmup | step 11: goto /marketplace/ | 2 | 200 | 625–747 ms | 8615–15112 ms | A server error field_exception occured. Check server logs for details. |
| warmup | step 17: goto /marketplace/ | 1 | 200 | 566 ms | 12051 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 24: clickRole button "…" | 1 | 200 | 609 ms | 1258011 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 3: clickRole button "…" | 1 | 200 | 623 ms | 5487 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 417 ms | 8261 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 96: clickRole button "…" | 1 | 200 | 389 ms | 1305463 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 4: snapshot | 1 | 200 | 715 ms | 351 ms | A server error field_exception occured. Check server logs for details. |
| inspect | pin: typed the account's Messenger PIN | 1 | 200 | 757 ms | 566 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 929 ms | 6691 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 5: wait 5s | 1 | 200 | 670 ms | 103700 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 2: goto /marketplace/you/selling | 1 | 200 | 713 ms | 5708 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 4: goto /marketplace/inbox | 2 | 200 | 924–967 ms | 558526–564751 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 1670 ms | 59468 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 2678 ms | 11555 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 6: goto /marketplace/inbox | 1 | 200 | 950 ms | 1708112 ms | A server error field_exception occured. Check server logs for details. |
| inspect | openAny: read /marketplace/item/<id>/ | 1 | 200 | 829 ms | 15219 ms | A server error field_exception occured. Check server logs for details. |
| warmup | step 14: goto /marketplace/ | 1 | 200 | 648 ms | 7202 ms | A server error field_exception occured. Check server logs for details. |

<!-- facts:end -->

## What it does

The home page's contacts column: friends.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
