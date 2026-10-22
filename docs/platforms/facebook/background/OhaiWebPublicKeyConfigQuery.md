# OhaiWebPublicKeyConfigQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `26996952523264441` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | — |
| Called from | `OhaiWebPublicKeyConfig` |
| rea | `ev_786baf260253294e0033320946363519208e8dffae26d32768956add42a7d013` |

Seen 64 time(s) in 20 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 1: goto / | 2 | 200 | 338–718 ms | 7237–20791 ms | — |
| warmup | step 4: goto /marketplace/ | 2 | 200 | 383–533 ms | 3907–5132 ms | — |
| warmup | step 7: goto /marketplace/ | 2 | 200 | 419–424 ms | 2999–5480 ms | — |
| warmup | step 11: goto /marketplace/ | 2 | 200 | 383–387 ms | 2979–14937 ms | — |
| warmup | step 13: goto /marketplace/create/item | 2 | 200 | 357–406 ms | 2599–10247 ms | — |
| warmup | step 15: goto /marketplace/ | 2 | 200 | 345–353 ms | 2685–3045 ms | — |
| warmup | step 17: goto /marketplace/ | 2 | 200 | 339–390 ms | 2229–3589 ms | — |
| warmup | step 19: goto /marketplace/you/selling | 2 | 200 | 376 ms | 2290–8265 ms | — |
| warmup | step 21: goto /marketplace/ | 2 | 200 | 360–370 ms | 3744–4488 ms | — |
| warmup | step 23: goto /marketplace/you/selling | 2 | 200 | 514–544 ms | 1989–2108 ms | — |
| warmup | step 25: goto /messages/ | 2 | 200 | 403–638 ms | 2061–3145 ms | — |
| inspect | step 1: goto /groups/<id>/ | 5 | 200 | 336–391 ms | 3558–6960 ms | — |
| inspect | step 8: goto /groups/<id>/permalink/<id>/ | 1 | 200 | 370 ms | 5502 ms | — |
| inspect | step 1: goto /profile.php | 1 | 200 | 396 ms | 7509 ms | — |
| inspect | step 25: goto /groups/<id>/questions | 1 | 200 | 540 ms | 5772 ms | — |
| inspect | step 4: goto /groups/<id>/permalink/<id>/ | 1 | 200 | 349 ms | 5502 ms | — |
| inspect | step 1: goto /groups/<id> | 1 | 200 | 354 ms | 6943 ms | — |
| inspect | step 1: goto / | 5 | 200 | 467–582 ms | 6556–8723 ms | — |
| inspect | step 7: goto / | 1 | 200 | 580 ms | 4381 ms | — |
| inspect | step 34: goto /marketplace/ | 1 | 200 | 515 ms | 5926 ms | — |
| inspect | step 38: goto /marketplace/ | 1 | 200 | 846 ms | 7746 ms | — |
| inspect | step 22: goto /marketplace/ | 1 | 200 | 469 ms | 6146 ms | — |
| inspect | step 27: goto / | 1 | 200 | 464 ms | 5159 ms | — |
| inspect | step 4: goto /marketplace/ | 1 | 200 | 647 ms | 5532 ms | — |
| inspect | step 1: goto /reel/ | 3 | 200 | 339–358 ms | 3193–4211 ms | — |
| inspect | step 71: goto /reel/ | 1 | 200 | 323 ms | 3846 ms | — |
| inspect | step 14: goto /reel/<id> | 1 | 200 | 1035 ms | 4918 ms | — |
| inspect | step 23: goto /reel/<id> | 1 | 200 | 360 ms | 4869 ms | — |
| inspect | step 9: goto /reel/<id> | 1 | 200 | 940 ms | 5978 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 630 ms | 5195 ms | — |
| inspect | step 20: goto /reel/<id> | 1 | 200 | 358 ms | 2721 ms | — |
| inspect | step 22: goto /reel/ | 1 | 200 | 2420 ms | 2624 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 1 | 200 | 1307 ms | 5461 ms | — |
| inspect | step 53: goto /reel/ | 1 | 200 | 340 ms | 5471 ms | — |
| inspect | step 1: goto /messages/ | 1 | 200 | 352 ms | 2825 ms | — |
| inspect | step 1: goto /marketplace/ | 1 | 200 | 809 ms | 10119 ms | — |
| inspect | step 2: setLocation Bethlehem, Pennsylvania | 1 | 200 | 445 ms | 3174 ms | — |
| inspect | step 5: setLocation Bethlehem, Pennsylvania | 1 | 200 | 939 ms | 3650 ms | — |
| inspect | step 11: goto /marketplace/create/item | 1 | 200 | 582 ms | 2597 ms | — |
| inspect | step 1: goto /marketplace/create/item | 1 | 200 | 468 ms | 9934 ms | — |
| inspect | step 4: setLocation Bethlehem, PA | 1 | 200 | 682 ms | 5262 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 373 ms | 2784 ms | — |
| inspect | step 13: setLocation 18015 | 1 | 200 | 380 ms | 4434 ms | — |

<!-- facts:end -->

## What it does

Fetches a public key the page uses to encrypt some data it sends (likely for Messenger or logging).

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
