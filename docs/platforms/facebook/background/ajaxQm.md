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
| rea | `ev_4bb3e0322d035f08a136122015975f24f87a85da63b2a5a25f606a6b131115e2` |

Seen 11 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /reel/ | 2 | 200 | 415–439 ms | 1415–1504 ms | — |
| inspect | step 14: goto /reel/<id> | 1 | 200 | 357 ms | 635 ms | — |
| inspect | step 23: goto /reel/<id> | 1 | 200 | 367 ms | 631 ms | — |
| inspect | step 9: goto /reel/<id> | 1 | 200 | 1078 ms | 1250 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 358 ms | 583 ms | — |
| inspect | step 20: goto /reel/<id> | 1 | 200 | 494 ms | 1118 ms | — |
| inspect | step 22: goto /reel/ | 2 | 200 | 348–611 ms | 30–694 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 1 | 200 | 4072 ms | 3657 ms | — |
| inspect | step 53: goto /reel/ | 1 | 200 | 468 ms | 1021 ms | — |

<!-- facts:end -->

## What it does

Telemetry: quick metrics from the page. Seen aborted (status -1) when a page navigates away mid-send, which is normal.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
