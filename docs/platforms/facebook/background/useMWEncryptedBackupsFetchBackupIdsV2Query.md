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

Seen 33 time(s) in 15 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id>/ | 5 | 200 | 341–435 ms | 3700–7157 ms | — |
| inspect | step 8: goto /groups/<id>/permalink/<id>/ | 1 | 200 | 372 ms | 6413 ms | — |
| inspect | step 1: goto /profile.php | 1 | 200 | 444 ms | 7432 ms | — |
| inspect | step 25: goto /groups/<id>/questions | 1 | 200 | 384 ms | 6521 ms | — |
| inspect | step 4: goto /groups/<id>/permalink/<id>/ | 1 | 200 | 352 ms | 5801 ms | — |
| inspect | step 1: goto /groups/<id> | 1 | 200 | 352 ms | 7118 ms | — |
| inspect | step 1: goto / | 5 | 200 | 423–552 ms | 7000–9249 ms | — |
| inspect | step 7: goto / | 1 | 200 | 454 ms | 4907 ms | — |
| inspect | step 34: goto /marketplace/ | 1 | 200 | 507 ms | 6008 ms | — |
| inspect | step 38: goto /marketplace/ | 1 | 200 | 587 ms | 7809 ms | — |
| inspect | step 22: goto /marketplace/ | 1 | 200 | 572 ms | 6188 ms | — |
| inspect | step 27: goto / | 1 | 200 | 471 ms | 5193 ms | — |
| inspect | step 4: goto /marketplace/ | 1 | 200 | 461 ms | 5260 ms | — |
| inspect | step 1: goto /reel/ | 3 | 200 | 320–361 ms | 3347–4263 ms | — |
| inspect | step 71: goto /reel/ | 1 | 200 | 337 ms | 3941 ms | — |
| inspect | step 14: goto /reel/<id> | 1 | 200 | 1021 ms | 4953 ms | — |
| inspect | step 23: goto /reel/<id> | 1 | 200 | 336 ms | 4926 ms | — |
| inspect | step 9: goto /reel/<id> | 1 | 200 | 933 ms | 6007 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 626 ms | 5227 ms | — |
| inspect | step 20: goto /reel/<id> | 1 | 200 | 817 ms | 2811 ms | — |
| inspect | step 22: goto /reel/ | 1 | 200 | 2263 ms | 2912 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 1 | 200 | 2016 ms | 5683 ms | — |
| inspect | step 53: goto /reel/ | 1 | 200 | 359 ms | 5571 ms | — |

<!-- facts:end -->

## What it does

Messenger's encrypted chat backup ids.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
