# RTWebCallBlockSettingHooksQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 64 time(s) in 20 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 1: goto / | 2 | 200 | 371–1016 ms | 7478–21291 ms | — |
| warmup | step 4: goto /marketplace/ | 2 | 200 | 405–477 ms | 4027–5361 ms | — |
| warmup | step 7: goto /marketplace/ | 2 | 200 | 363–515 ms | 3058–5555 ms | — |
| warmup | step 11: goto /marketplace/ | 2 | 200 | 415–505 ms | 3061–15132 ms | — |
| warmup | step 13: goto /marketplace/create/item | 2 | 200 | 352–391 ms | 3042–10379 ms | — |
| warmup | step 15: goto /marketplace/ | 2 | 200 | 350–354 ms | 2861–3126 ms | — |
| warmup | step 17: goto /marketplace/ | 2 | 200 | 340–388 ms | 2346–3722 ms | — |
| warmup | step 19: goto /marketplace/you/selling | 2 | 200 | 358–432 ms | 2327–8384 ms | — |
| warmup | step 21: goto /marketplace/ | 2 | 200 | 399–568 ms | 3818–4638 ms | — |
| warmup | step 23: goto /marketplace/you/selling | 2 | 200 | 449–552 ms | 2022–2187 ms | — |
| warmup | step 25: goto /messages/ | 2 | 200 | 363–463 ms | 2249–3857 ms | — |
| inspect | step 1: goto /groups/<id>/ | 5 | 200 | 356–421 ms | 3751–7188 ms | — |
| inspect | step 8: goto /groups/<id>/permalink/<id>/ | 1 | 200 | 391 ms | 6548 ms | — |
| inspect | step 1: goto /profile.php | 1 | 200 | 410 ms | 7644 ms | — |
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
| inspect | step 1: goto /messages/ | 1 | 200 | 341 ms | 2996 ms | — |
| inspect | step 1: goto /marketplace/ | 1 | 200 | 763 ms | 10177 ms | — |
| inspect | step 2: setLocation Bethlehem, Pennsylvania | 1 | 200 | 402 ms | 3238 ms | — |
| inspect | step 5: setLocation Bethlehem, Pennsylvania | 1 | 200 | 819 ms | 3816 ms | — |
| inspect | step 11: goto /marketplace/create/item | 1 | 200 | 818 ms | 2830 ms | — |
| inspect | step 1: goto /marketplace/create/item | 1 | 200 | 484 ms | 10111 ms | — |
| inspect | step 4: setLocation Bethlehem, PA | 1 | 200 | 695 ms | 5339 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 391 ms | 2910 ms | — |
| inspect | step 13: setLocation 18015 | 1 | 200 | 377 ms | 4502 ms | — |

<!-- facts:end -->

## What it does

Messenger calling: whether incoming calls are blocked.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
