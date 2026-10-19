# ajaxQm

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/qm/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_3ac696d9ca5b73b85be25c3eb0a04d8e07223fff4eb281ffe30fb79f8510e011` |

Seen 15 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | step 1: goto /marketplace/selling/ | 2 | -1 | -1 ms | 2359–2485 ms | — |
| host | step 4: goto /login/ | 1 | -1 | -1 ms | 523 ms | — |
| host | signIn: password typed; submitting with Enter | 1 | -1 | -1 ms | 5635 ms | — |
| host | step 10: goto /marketplace/selling/ | 1 | -1 | -1 ms | 1375 ms | — |
| host | step 12: goto /me | 1 | -1 | -1 ms | 1680 ms | — |
| host | step 4: goto /marketplace/selling/ | 1 | -1 | -1 ms | 1407 ms | — |
| host | step 7: goto /marketplace/selling/ | 1 | -1 | -1 ms | 1782 ms | — |
| connect | Opening Marketplace > Selling. | 1 | -1 | -1 ms | 1930 ms | — |
| connect | Auto-login: submitting (Enter). | 1 | -1 | -1 ms | 9522 ms | — |
| connect | Auto-login: answered automatedBehaviour. | 2 | -1 | -1 ms | 1657–2321 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 1 | -1 | -1 ms | 2244 ms | — |
| warmup | step 1: goto / | 1 | 200 | 572 ms | 2395 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | -1 | -1 ms | 925 ms | — |

<!-- facts:end -->

## What it does

Telemetry: quick metrics from the page. Seen aborted (status -1) when a page navigates away mid-send, which is normal.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
