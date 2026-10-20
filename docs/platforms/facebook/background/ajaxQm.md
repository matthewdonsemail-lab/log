# ajaxQm

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/qm/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_6181f0d02a60d00c8c87b8bb715761dc6ca89cbe2b273bc0d89acff41087fe5f` |

Seen 34 time(s) in 14 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id>/ | 4 | 200 | 414–655 ms | 1640–1899 ms | — |
| inspect | step 25: goto /groups/<id>/questions | 1 | 200 | 431 ms | 736 ms | — |
| inspect | step 1: goto / | 6 | 200 | 443–793 ms | 1957–3150 ms | — |
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
