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

Seen 10 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /reel/ | 2 | 200 | 339–361 ms | 3347–3390 ms | — |
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
