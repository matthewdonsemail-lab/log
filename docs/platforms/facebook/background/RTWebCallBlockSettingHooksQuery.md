# RTWebCallBlockSettingHooksQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `9989124061109700` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | — |
| Called from | `RTWebCallBlockSettingHooks` |
| rea | `ev_1cd240cd88b74ce0c02e6218c665f21c92f2ebe302e100c7ea846dce65f28ad6` |

Seen 30 time(s) in 13 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id>/ | 4 | 200 | 356–401 ms | 3751–6425 ms | — |
| inspect | step 25: goto /groups/<id>/questions | 1 | 200 | 380 ms | 6536 ms | — |
| inspect | step 4: goto /groups/<id>/permalink/<id>/ | 1 | 200 | 506 ms | 6062 ms | — |
| inspect | step 1: goto /groups/<id> | 1 | 200 | 418 ms | 7356 ms | — |
| inspect | step 1: goto / | 5 | 200 | 468–542 ms | 7022–9299 ms | — |
| inspect | step 7: goto / | 1 | 200 | 480 ms | 4926 ms | — |
| inspect | step 34: goto /marketplace/ | 1 | 200 | 583 ms | 6056 ms | — |
| inspect | step 38: goto /marketplace/ | 1 | 200 | 799 ms | 7823 ms | — |
| inspect | step 22: goto /marketplace/ | 1 | 200 | 616 ms | 6214 ms | — |
| inspect | step 27: goto / | 1 | 200 | 497 ms | 5225 ms | — |
| inspect | step 4: goto /marketplace/ | 1 | 200 | 521 ms | 5680 ms | — |
| inspect | step 1: goto /reel/ | 3 | 200 | 340–381 ms | 3376–4292 ms | — |
| inspect | step 71: goto /reel/ | 1 | 200 | 358 ms | 4007 ms | — |
| inspect | step 14: goto /reel/<id> | 1 | 200 | 1005 ms | 4979 ms | — |
| inspect | step 23: goto /reel/<id> | 1 | 200 | 364 ms | 4963 ms | — |
| inspect | step 9: goto /reel/<id> | 1 | 200 | 1008 ms | 6031 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 645 ms | 5250 ms | — |
| inspect | step 20: goto /reel/<id> | 1 | 200 | 1348 ms | 2829 ms | — |
| inspect | step 22: goto /reel/ | 1 | 200 | 3699 ms | 2945 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 1 | 200 | 1921 ms | 5713 ms | — |
| inspect | step 53: goto /reel/ | 1 | 200 | 337 ms | 5594 ms | — |

<!-- facts:end -->

## What it does

Messenger calling: whether incoming calls are blocked.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
