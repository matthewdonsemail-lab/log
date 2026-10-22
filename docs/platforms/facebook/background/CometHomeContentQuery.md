# CometHomeContentQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28262615193401316` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | — |
| Called from | `CometHomeContent.react` |
| rea | `ev_cf23e67c25aa3ceb49db2a20048e8ce344dfa1f57457ba9df343170946991f9b` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 24: clickRole button "…" | 1 | 200 | 568 ms | 1258015 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 396 ms | 5489 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 412 ms | 8263 ms | — |
| inspect | step 96: clickRole button "…" | 1 | 200 | 493 ms | 1305465 ms | — |

<!-- facts:end -->

## What it does

The home page's main content.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
