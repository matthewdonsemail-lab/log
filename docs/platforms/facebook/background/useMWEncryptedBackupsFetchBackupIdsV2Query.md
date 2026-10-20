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

Seen 25 time(s) in 10 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id> | 1 | 200 | 352 ms | 7118 ms | — |
| inspect | step 1: goto / | 5 | 200 | 423–552 ms | 7000–9249 ms | — |
| inspect | step 7: goto / | 1 | 200 | 454 ms | 4907 ms | — |
| inspect | rea read step 33_dwell028s: exit 0, ev_d164a9c78021b1afb8ce6c5a24456a0d8f46efdbc7c54440f7f | 1 | 200 | 507 ms | 3341 ms | — |
| inspect | step 38: goto /marketplace/ | 1 | 200 | 587 ms | 7809 ms | — |
| inspect | rea read step 21_dwell078s: exit 0, ev_87a54a6ea91a3418cb413686bdc6108f946bdf45884c8230e49 | 1 | 200 | 572 ms | 3624 ms | — |
| inspect | step 27: goto / | 1 | 200 | 471 ms | 5193 ms | — |
| inspect | step 4: goto /marketplace/ | 1 | 200 | 461 ms | 5260 ms | — |
| inspect | step 1: goto /groups/<id>/ | 1 | 200 | 354 ms | 5840 ms | — |
| inspect | step 1: goto /reel/ | 3 | 200 | 320–361 ms | 3347–4263 ms | — |
| inspect | step 71: goto /reel/ | 1 | 200 | 337 ms | 3941 ms | — |
| inspect | rea read step 13_dwell600s: exit 0, ev_e8922deafb7ba9951a51bda6f8cd82b5b68c41db19bfe0cd164 | 1 | 200 | 1021 ms | 2054 ms | — |
| inspect | rea read step 22_dwell600s: exit 0, ev_59385bb1add05e2efe91692d85b295ae9cd6334beafd2bccb4a | 1 | 200 | 336 ms | 2185 ms | — |
| inspect | step 9: goto /reel/<id> | 1 | 200 | 933 ms | 6007 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 626 ms | 5227 ms | — |
| inspect | step 20: goto /reel/<id> | 1 | 200 | 817 ms | 2811 ms | — |
| inspect | step 22: goto /reel/ | 1 | 200 | 2263 ms | 2912 ms | — |
| inspect | mouse: 1 wander, 1 approach, 1 flick; 1 idle drift move(s) | 1 | 200 | 2016 ms | 572 ms | — |
| inspect | step 53: goto /reel/ | 1 | 200 | 359 ms | 5571 ms | — |

<!-- facts:end -->

## What it does

Messenger's encrypted chat backup ids.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
