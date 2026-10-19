# ajaxBz

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/bz` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_c06aafd6651edd80b023c22473d2b0584c33cd5d37efd1de388b4627fda6e5b7` |

Seen 34 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| connect | Opening Marketplace > Selling. | 22 | -1 | -1 ms | 5887–11459 ms | — |
| connect | Auto-login: typing the email. | 3 | -1 | -1 ms | 773–1568 ms | — |
| connect | Auto-login: typing the password. | 3 | -1 | -1 ms | 988–2864 ms | — |
| connect | Auto-login: submitting (Enter). | 6 | -1 | -1 ms | 26–121 ms | — |

<!-- facts:end -->

## What it does

Telemetry: the page's error and event logging, batched.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
