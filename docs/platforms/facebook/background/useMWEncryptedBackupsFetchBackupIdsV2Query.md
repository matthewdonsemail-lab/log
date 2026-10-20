# useMWEncryptedBackupsFetchBackupIdsV2Query

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `25220416984279164` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `...EBFetchBackupIdsSharedFragment` |
| Called from | `useMWEncryptedBackupsFetchBackupIdsV2` |
| rea | `ev_16df7daca80a72c8f44b7a489690336b7def96e564429f0639a122f48023372a` |

Seen 7 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id>/ | 3 | 200 | 406–440 ms | 3417–3752 ms | — |
| inspect | step 10: goto /groups/<id>/ | 1 | 200 | 571 ms | 2791 ms | — |
| inspect | step 11: goto /groups/<id>/ | 1 | 200 | 451 ms | 2552 ms | — |
| inspect | step 4: goto /groups/<id>/ | 1 | 200 | 388 ms | 2114 ms | — |
| inspect | step 1: goto / | 1 | 200 | 347 ms | 6661 ms | — |

<!-- facts:end -->

## What it does

Messenger's encrypted chat backup ids.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
