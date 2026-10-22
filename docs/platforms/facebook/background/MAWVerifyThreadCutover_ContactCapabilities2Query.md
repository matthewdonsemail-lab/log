# MAWVerifyThreadCutover_ContactCapabilities2Query

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `9948369021930229` |
| Path | `/api/graphql/` |
| Sends | `id` |
| Reads | `user.message_capabilities2_str` |
| Called from | `MAWVerifyThreadCutover` |
| rea | `ev_2ef4fcf81840e4c44dfd19b7c86b9e3e65429109c06595cfc96262bcea9f2bc2` |

Seen 55 time(s) in 17 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 1: goto / | 2 | 200 | 349–584 ms | 7315–20961 ms | — |
| warmup | step 4: goto /marketplace/ | 2 | 200 | 398 ms | 4115–5425 ms | — |
| warmup | step 7: goto /marketplace/ | 2 | 200 | 356–390 ms | 3640–5793 ms | — |
| warmup | step 11: goto /marketplace/ | 2 | 200 | 394–416 ms | 3172–15231 ms | — |
| warmup | step 13: goto /marketplace/create/item | 2 | 200 | 350–368 ms | 3066–10443 ms | — |
| warmup | step 15: goto /marketplace/ | 2 | 200 | 357–368 ms | 2911–3209 ms | — |
| warmup | step 17: goto /marketplace/ | 2 | 200 | 344–432 ms | 2462–3835 ms | — |
| warmup | step 19: goto /marketplace/you/selling | 2 | 200 | 358–382 ms | 2530–8438 ms | — |
| warmup | step 21: goto /marketplace/ | 2 | 200 | 433–517 ms | 3863–4750 ms | — |
| warmup | step 23: goto /marketplace/you/selling | 2 | 200 | 371–771 ms | 2336–2482 ms | — |
| warmup | step 25: goto /messages/ | 2 | 200 | 388–435 ms | 2757–3737 ms | — |
| inspect | step 1: goto /groups/<id>/ | 5 | 200 | 361–412 ms | 3689–6555 ms | — |
| inspect | step 8: goto /groups/<id>/permalink/<id>/ | 1 | 200 | 377 ms | 6895 ms | — |
| inspect | step 25: goto /groups/<id>/questions | 1 | 200 | 363 ms | 6445 ms | — |
| inspect | step 4: goto /groups/<id>/permalink/<id>/ | 1 | 200 | 357 ms | 7132 ms | — |
| inspect | step 1: goto /groups/<id> | 1 | 200 | 358 ms | 7157 ms | — |
| inspect | step 1: goto / | 5 | 200 | 501–553 ms | 6626–8849 ms | — |
| inspect | step 7: goto / | 1 | 200 | 500 ms | 4963 ms | — |
| inspect | step 34: goto /marketplace/ | 1 | 200 | 524 ms | 6129 ms | — |
| inspect | step 38: goto /marketplace/ | 1 | 200 | 734 ms | 7900 ms | — |
| inspect | step 22: goto /marketplace/ | 1 | 200 | 573 ms | 6267 ms | — |
| inspect | step 27: goto / | 1 | 200 | 549 ms | 5270 ms | — |
| inspect | step 4: goto /marketplace/ | 1 | 200 | 444 ms | 5803 ms | — |
| inspect | step 1: goto /reel/ | 3 | 200 | 339–353 ms | 3408–4338 ms | — |
| inspect | step 71: goto /reel/ | 1 | 200 | 328 ms | 4281 ms | — |
| inspect | step 14: goto /reel/<id> | 1 | 200 | 1714 ms | 4163 ms | — |
| inspect | step 23: goto /reel/<id> | 1 | 200 | 328 ms | 5005 ms | — |
| inspect | step 9: goto /reel/<id> | 1 | 200 | 401 ms | 5863 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 585 ms | 5360 ms | — |
| inspect | step 20: goto /reel/<id> | 1 | 200 | 2124 ms | 2852 ms | — |
| inspect | step 22: goto /reel/ | 1 | 200 | 3661 ms | 2982 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 1 | 200 | 2065 ms | 5570 ms | — |
| inspect | step 53: goto /reel/ | 1 | 200 | 381 ms | 5835 ms | — |
| inspect | step 1: goto /messages/ | 1 | 200 | 360 ms | 3368 ms | — |

<!-- facts:end -->

## What it does

Messenger's end-to-end encrypted chat: checks what the contacts' clients support.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
