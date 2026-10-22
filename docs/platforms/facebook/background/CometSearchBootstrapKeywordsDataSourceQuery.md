# CometSearchBootstrapKeywordsDataSourceQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27797631676573850` |
| Path | `/api/graphql/` |
| Sends | `first` |
| Reads | `viewer.bootstrap_keywords` |
| Called from | `CometSearchBootstrapKeywordsDataSource.query` |
| rea | `ev_5cb62e3a7cd21788732d77960d11bcea0adc8730aaaa23e6a78c097c1c44c7a6` |

Seen 63 time(s) in 19 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 1: goto / | 2 | 200 | 428–1023 ms | 6735–21288 ms | — |
| warmup | step 4: goto /marketplace/ | 2 | 200 | 382–508 ms | 4021–5355 ms | — |
| warmup | step 7: goto /marketplace/ | 2 | 200 | 496–508 ms | 2920–5509 ms | — |
| warmup | step 11: goto /marketplace/ | 2 | 200 | 389–540 ms | 3056–14934 ms | — |
| warmup | step 13: goto /marketplace/create/item | 2 | 200 | 382–394 ms | 3037–9723 ms | — |
| warmup | step 15: goto /marketplace/ | 2 | 200 | 367–368 ms | 2855–3120 ms | — |
| warmup | step 17: goto /marketplace/ | 2 | 200 | 348–403 ms | 2227–3719 ms | — |
| warmup | step 19: goto /marketplace/you/selling | 2 | 200 | 413–504 ms | 2324–7811 ms | — |
| warmup | step 21: goto /marketplace/ | 2 | 200 | 398–411 ms | 3743–4633 ms | — |
| warmup | step 23: goto /marketplace/you/selling | 2 | 200 | 584–586 ms | 1987–2184 ms | — |
| warmup | step 25: goto /messages/ | 2 | 200 | 406–568 ms | 2160–3426 ms | — |
| inspect | step 1: goto /groups/<id>/ | 4 | 200 | 371–428 ms | 3759–7185 ms | — |
| inspect | step 8: goto /groups/<id>/permalink/<id>/ | 1 | 200 | 465 ms | 7031 ms | — |
| inspect | step 1: goto /profile.php | 1 | 200 | 425 ms | 7450 ms | — |
| inspect | step 25: goto /groups/<id>/questions | 1 | 200 | 414 ms | 6533 ms | — |
| inspect | step 4: goto /groups/<id>/permalink/<id>/ | 1 | 200 | 556 ms | 7197 ms | — |
| inspect | step 1: goto /groups/<id> | 1 | 200 | 364 ms | 7210 ms | — |
| inspect | step 1: goto / | 5 | 200 | 458–534 ms | 6491–8720 ms | — |
| inspect | step 7: goto / | 1 | 200 | 466 ms | 4918 ms | — |
| inspect | step 34: goto /marketplace/ | 1 | 200 | 495 ms | 5841 ms | — |
| inspect | step 38: goto /marketplace/ | 1 | 200 | 813 ms | 7818 ms | — |
| inspect | step 22: goto /marketplace/ | 1 | 200 | 516 ms | 6090 ms | — |
| inspect | step 27: goto / | 1 | 200 | 472 ms | 3177 ms | — |
| inspect | step 4: goto /marketplace/ | 1 | 200 | 503 ms | 5697 ms | — |
| inspect | step 1: goto /reel/ | 3 | 200 | 347–391 ms | 3276–3898 ms | — |
| inspect | step 71: goto /reel/ | 1 | 200 | 338 ms | 3839 ms | — |
| inspect | step 14: goto /reel/<id> | 1 | 200 | 1402 ms | 4123 ms | — |
| inspect | step 23: goto /reel/<id> | 1 | 200 | 488 ms | 2166 ms | — |
| inspect | step 9: goto /reel/<id> | 1 | 200 | 1565 ms | 3485 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 403 ms | 2368 ms | — |
| inspect | step 20: goto /reel/<id> | 1 | 200 | 423 ms | 2623 ms | — |
| inspect | step 22: goto /reel/ | 1 | 200 | 2547 ms | 2568 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 1 | 200 | 696 ms | 4939 ms | — |
| inspect | step 53: goto /reel/ | 1 | 200 | 370 ms | 5585 ms | — |
| inspect | step 1: goto /messages/ | 1 | 200 | 373 ms | 2958 ms | — |
| inspect | step 1: goto /marketplace/ | 1 | 200 | 643 ms | 8895 ms | — |
| inspect | step 2: setLocation Bethlehem, Pennsylvania | 1 | 200 | 433 ms | 3235 ms | — |
| inspect | step 5: setLocation Bethlehem, Pennsylvania | 1 | 200 | 864 ms | 3766 ms | — |
| inspect | step 11: goto /marketplace/create/item | 1 | 200 | 653 ms | 2827 ms | — |
| inspect | step 1: goto /marketplace/create/item | 1 | 200 | 696 ms | 9548 ms | — |
| inspect | step 4: setLocation Bethlehem, PA | 1 | 200 | 711 ms | 5357 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 391 ms | 2666 ms | — |
| inspect | step 13: setLocation 18015 | 1 | 200 | 393 ms | 4315 ms | — |

<!-- facts:end -->

## What it does

Preloads search suggestions for the search box. Loads on every signed-in page.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
