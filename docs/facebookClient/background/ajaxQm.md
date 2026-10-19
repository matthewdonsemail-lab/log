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
| rea | `ev_5bee8bac109273dd2b1630de0e43a0c730549523f08b21408d80e39b9bc8e0f3` |

Seen 26 time(s) in 16 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Opening /marketplace/create/item | 12 | -1, 200 | -1–290 ms | 1643–8396 ms | — |
| connect | Opening Marketplace > Selling. | 4 | -1 | -1 ms | 1634–3673 ms | — |
| connect | Auto-login: submitting (Enter). | 2 | -1 | -1 ms | 2976–3138 ms | — |
| connect | Page: loggedIn /marketplace/selling/ | 2 | -1 | -1 ms | 611–788 ms | — |
| connect | Auto-login: typing the email. | 1 | -1 | -1 ms | 695 ms | — |
| connect | Auto-login: answered automatedBehaviour. | 4 | -1 | -1 ms | 1106–2053 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 1 | -1 | -1 ms | 1423 ms | — |

<!-- facts:end -->

## What it does

Telemetry: quick metrics from the page. Seen aborted (status -1) when a page navigates away mid-send, which is normal.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
