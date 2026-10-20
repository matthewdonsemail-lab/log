# ajaxWebstorageProcessKeys

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | login |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/webstorage/process_keys/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_25fc1ee636b73211d5140233f0bf618d0306c5783e37d26e006e6985d39ea3c8` |

Seen 12 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 6: dwell 51.57s | 1 | 200 | 339 ms | 16729 ms | — |
| inspect | step 17: dwell 29.77s | 1 | 200 | 308 ms | 17099 ms | — |
| inspect | rea read step 35_clickroleButtonNextCard: exit 0, ev_90ee2643c24bb0f54850c02468cfedb372d9f | 1 | 200 | 329 ms | 11946 ms | — |
| inspect | rea read step 71_gotoHttpsWwwFacebook: exit 0, ev_28bf5eb1b3cc1a6716e2040dd53ac05c19eeaed7 | 1 | 200 | 321 ms | 9895 ms | — |
| inspect | step 44: dwell 18s | 1 | 200 | 345 ms | 12469 ms | — |
| inspect | page has 45 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T052 | 6 | 200 | 328–496 ms | 4427–1278544 ms | — |
| inspect | now on /reel/<id> "…" after 3046 ms; 0 request(s) | 1 | 200 | 387 ms | 1495 ms | — |

<!-- facts:end -->

## What it does

The page tells Facebook which of its keys it holds in browser storage. Seen only on checkpoint and captcha pages (one run).

## What our machine does with it

Nothing. Browser storage is saved back to Twenty after a run (only while it still holds a Facebook login).

## What can go wrong

Only seen inside checkpoints, so it may be part of how Facebook checks the browser during one. Not enough sightings yet to say more; read it again if a checkpoint repeats.
