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
| rea | `ev_e642c5ea830afe2876447a54b55015ae0e0f3c5ada04188796278a671712d802` |

Seen 8 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id>/ | 3 | 200 | 456–531 ms | 1629–1953 ms | — |
| inspect | step 10: goto /groups/<id>/ | 1 | 200 | 790 ms | 748 ms | — |
| inspect | step 11: goto /groups/<id>/ | 1 | 200 | 528 ms | 825 ms | — |
| inspect | step 4: goto /groups/<id>/ | 1 | 200 | 422 ms | 717 ms | — |
| inspect | step 1: goto / | 2 | 200 | 463–2744 ms | 1570–4460 ms | — |

<!-- facts:end -->

## What it does

Telemetry: quick metrics from the page. Seen aborted (status -1) when a page navigates away mid-send, which is normal.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
