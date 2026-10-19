# CometHomeContactsContainerQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 5 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T122 | 1 | 200 | 350 ms | 1203 ms | — |
| inspect | step 2: wait 20s | 1 | 200 | 747 ms | 20993 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T120 | 2 | 200 | 312–380 ms | 10047–90169 ms | — |
| publish | Opening /marketplace/create/item | 1 | 200 | 1049 ms | 11852 ms | — |

<!-- facts:end -->

## What it does

The home page's contacts column: friends.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
