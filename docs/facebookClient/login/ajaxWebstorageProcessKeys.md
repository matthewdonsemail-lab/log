# ajaxWebstorageProcessKeys

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | login |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/webstorage/process_keys/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_03e2755e2f43ac7344c4b7e3da888b337679758f267d8e1d0089133d65da19d4` |

Seen 27 time(s) in 13 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: wait 60s | 1 | 200 | 315 ms | 18754 ms | — |
| inspect | step 2: wait 20s | 4 | 200, -1 | -1–1132 ms | 13951–15134 ms | — |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1223 | 1 | 200 | 396 ms | 100010 ms | — |
| flow | POST 200 CometNotificationsDropdownQuery (2480 ms) | 1 | 200 | 540 ms | 4263 ms | — |
| flow | step 13: clickRole button "…" | 1 | 200 | 375 ms | 11477 ms | — |
| flow | step 1: goto /me | 1 | 200 | 315 ms | 18735 ms | — |
| inspect | step 1: goto /me | 1 | 200 | 349 ms | 23358 ms | — |
| inspect | step 5: wait 8s | 1 | 200 | 384 ms | 183 ms | — |
| inspect | step 8: click e | 1 | 200 | 292 ms | 3487 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T111 | 1 | 200 | 297 ms | 2679 ms | — |
| inspect | page has 20 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T111 | 1 | 200 | 288 ms | 2587 ms | — |
| inspect | page has 21 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T111 | 1 | 200 | 1019 ms | 7923 ms | — |
| inspect | page has 15 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T111 | 1 | 200 | 356 ms | 6091 ms | — |
| inspect | page has 5 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1112 | 1 | 200 | 307 ms | 3133 ms | — |
| inspect | POST 200 useMWEncryptedBackupsFetchBackupIdsV2Query (332 ms) | 1 | 200 | 288 ms | 2546 ms | — |
| inspect | page has 61 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T110 | 1 | 200 | 366 ms | 2304 ms | — |
| inspect | page has 56 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T110 | 1 | 200 | 292 ms | 12556 ms | — |
| inspect | page has 7 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1103 | 1 | 200 | 318 ms | 1041 ms | — |
| inspect | step 4: wait 10s | 1 | 200 | 317 ms | 9836 ms | — |
| inspect | step 2: wait 5s | 1 | 200 | 313 ms | 2970 ms | — |
| inspect | page has 5 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1052 | 1 | 200 | 310 ms | 43103 ms | — |
| connect | Page: captcha /checkpoint/<id>/ | 1 | 200 | 310 ms | 4956 ms | — |
| connect | Page: checkpoint /checkpoint/<id>/ | 2 | 200 | 310–332 ms | 2447–3691 ms | — |

<!-- facts:end -->

## What it does

The page tells Facebook which of its keys it holds in browser storage. Seen only on checkpoint and captcha pages (one run).

## What our machine does with it

Nothing. Browser storage is saved back to Twenty after a run (only while it still holds a Facebook login).

## What can go wrong

Only seen inside checkpoints, so it may be part of how Facebook checks the browser during one. Not enough sightings yet to say more; read it again if a checkpoint repeats.
