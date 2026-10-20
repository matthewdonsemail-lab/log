# CometHomeContentQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28262615193401316` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | — |
| Called from | `CometHomeContent.react` |
| rea | `ev_c39813b09a6d101ec07e15decbcfc3b7d00474b5f7b79ea04cace0fb088e78a8` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | POST 200 /ajax/bulk-route-definitions/ (489 ms) | 1 | 200 | 476 ms | 224 ms | — |
| inspect | page has 63 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T234 | 1 | 200 | 407 ms | 28679 ms | — |
| inspect | step 9: snapshot | 1 | 200 | 480 ms | 270 ms | — |

<!-- facts:end -->

## What it does

The home page's main content.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
