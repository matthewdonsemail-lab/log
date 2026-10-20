# CometHomeContactsContainerQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 5 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | POST 200 /ajax/bulk-route-definitions/ (489 ms) | 1 | 200 | 495 ms | 222 ms | — |
| inspect | page has 63 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T234 | 1 | 200 | 653 ms | 28676 ms | — |
| inspect | step 9: snapshot | 1 | 200 | 504 ms | 268 ms | — |
| inspect | page has 79 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T212 | 2 | 200 | 333–341 ms | 7192–14221 ms | — |

<!-- facts:end -->

## What it does

The home page's contacts column: friends.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
