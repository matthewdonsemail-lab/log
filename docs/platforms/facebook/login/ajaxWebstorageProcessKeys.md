# ajaxWebstorageProcessKeys

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | login |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/webstorage/process_keys/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_70efc081c67ed7332e21c5498e2db53c87d1066c637ab8bfc22fe41d543c7021` |

Seen 36 time(s) in 11 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 11: goto /marketplace/ | 1 | 200 | 1806 ms | 9634 ms | — |
| inspect | step 2: clickRole button "…" | 1 | 200 | 678 ms | 11786 ms | — |
| inspect | step 22: dwell 21.38s | 1 | 200 | 477 ms | 19087 ms | — |
| inspect | step 8: dwell 23.53s | 1 | 200 | 542 ms | 15207 ms | — |
| inspect | scroll: +1397px in 29 wheel steps, 1765 ms | 1 | 200 | 1963 ms | 15734 ms | — |
| inspect | step 6: dwell 51.57s | 1 | 200 | 339 ms | 16729 ms | — |
| inspect | step 17: dwell 29.77s | 1 | 200 | 308 ms | 17099 ms | — |
| inspect | step 36: dwell 15.58s | 1 | 200 | 329 ms | 12170 ms | — |
| inspect | step 72: clickRole button "…" | 1 | 200 | 321 ms | 15304 ms | — |
| inspect | step 44: dwell 18s | 1 | 200 | 345 ms | 12469 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 4 | 200 | 328–496 ms | 15782–425825 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 387 ms | 4544 ms | — |
| inspect | step 96: clickRole button "…" | 2 | 200 | 348–351 ms | 39352–1289363 ms | — |
| inspect | step 2: setLocation Bethlehem, Pennsylvania | 1 | 200 | 889 ms | 13271 ms | — |
| inspect | step 3: click e | 1 | 200 | 629 ms | 13511 ms | — |
| inspect | step 26: wait 8s | 1 | 200 | 400 ms | 8699 ms | — |
| inspect | step 27: click e1541 | 1 | 200 | 457 ms | 8217 ms | — |
| inspect | step 5: wait 5s | 3 | 200 | 395–482 ms | 969–300966 ms | — |
| inspect | step 10: goto /marketplace/you/selling | 1 | 200 | 1026 ms | 16771 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 3 | 200 | 449–619 ms | 18731–34720 ms | — |
| inspect | step 3: goto /marketplace/inbox | 6 | 200 | 503–1552 ms | 509982–1675374 ms | — |
| inspect | step 3: goto /marketplace/you/selling | 1 | 200 | 979 ms | 17064 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 380 ms | 15668 ms | — |

<!-- facts:end -->

## What it does

The page tells Facebook which of its keys it holds in browser storage. Seen only on checkpoint and captcha pages (one run).

## What our machine does with it

Nothing. Browser storage is saved back to Twenty after a run (only while it still holds a Facebook login).

## What can go wrong

Only seen inside checkpoints, so it may be part of how Facebook checks the browser during one. Not enough sightings yet to say more; read it again if a checkpoint repeats.
