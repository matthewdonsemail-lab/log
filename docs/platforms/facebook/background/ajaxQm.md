# ajaxQm

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/qm/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_2bf6699551383f9ce8dbe17a0840942f44b115a3011e91a42cac57a9ed275ac6` |

Seen 61 time(s) in 20 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 1: goto / | 2 | 200 | 403–887 ms | 1709–15140 ms | — |
| warmup | step 4: goto /marketplace/ | 2 | 200 | 409–5839 ms | 1202–6461 ms | — |
| warmup | step 7: goto /marketplace/ | 2 | 200 | 423–424 ms | 813–1995 ms | — |
| warmup | step 11: goto /marketplace/ | 2 | 200 | 383–417 ms | 768–11799 ms | — |
| warmup | step 13: goto /marketplace/create/item | 2 | 200 | 443–554 ms | 1059–1694 ms | — |
| warmup | step 15: goto /marketplace/ | 2 | 200 | 447–529 ms | 783–807 ms | — |
| warmup | step 17: goto /marketplace/ | 2 | 200 | 442–487 ms | 686–776 ms | — |
| warmup | step 19: goto /marketplace/you/selling | 2 | 200 | 588–2810 ms | 1303–6561 ms | — |
| warmup | step 21: goto /marketplace/ | 2 | 200 | 465–487 ms | 789–947 ms | — |
| warmup | step 23: goto /marketplace/you/selling | 2 | 200 | 460–831 ms | 752–820 ms | — |
| warmup | step 25: goto /messages/ | 2 | 200 | 506–598 ms | 677–769 ms | — |
| inspect | step 1: goto /groups/<id>/ | 5 | 200 | 414–8934 ms | 1640–10709 ms | — |
| inspect | step 8: goto /groups/<id>/permalink/<id>/ | 1 | 200 | 503 ms | 747 ms | — |
| inspect | step 1: goto /profile.php | 1 | 200 | 468 ms | 2145 ms | — |
| inspect | step 1: goto / | 8 | 200 | 431–2879 ms | 1957–4779 ms | — |
| inspect | step 25: goto /groups/<id>/questions | 1 | 200 | 431 ms | 736 ms | — |
| inspect | step 4: goto /groups/<id>/permalink/<id>/ | 1 | 200 | 7439 ms | 7856 ms | — |
| inspect | step 1: goto /groups/<id> | 1 | 200 | 673 ms | 1809 ms | — |
| inspect | step 7: goto / | 1 | 200 | 544 ms | 1020 ms | — |
| inspect | step 34: goto /marketplace/ | 1 | 200 | 7107 ms | 7782 ms | — |
| inspect | step 38: goto /marketplace/ | 2 | 200 | 482–2441 ms | 970–11572 ms | — |
| inspect | step 22: goto /marketplace/ | 1 | 200 | 548 ms | 1536 ms | — |
| inspect | step 27: goto / | 1 | 200 | 886 ms | 770 ms | — |
| inspect | step 4: goto /marketplace/ | 1 | 200 | 7230 ms | 7678 ms | — |
| inspect | step 1: goto /reel/ | 3 | 200 | 415–497 ms | 1357–1504 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 2 | 200 | 301–4072 ms | 366–3657 ms | — |
| inspect | step 71: goto /reel/ | 1 | 200 | 338 ms | 2483 ms | — |
| inspect | step 14: goto /reel/<id> | 1 | 200 | 357 ms | 635 ms | — |
| inspect | step 23: goto /reel/<id> | 1 | 200 | 367 ms | 631 ms | — |
| inspect | step 9: goto /reel/<id> | 1 | 200 | 1078 ms | 1250 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 358 ms | 583 ms | — |
| inspect | step 20: goto /reel/<id> | 1 | 200 | 494 ms | 1118 ms | — |
| inspect | step 22: goto /reel/ | 2 | 200 | 348–611 ms | 30–694 ms | — |
| inspect | step 53: goto /reel/ | 1 | 200 | 468 ms | 1021 ms | — |

<!-- facts:end -->

## What it does

Telemetry: quick metrics from the page. Seen aborted (status -1) when a page navigates away mid-send, which is normal.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
