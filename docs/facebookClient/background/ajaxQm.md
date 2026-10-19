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
| rea | `ev_ffc2455a215f86b6a0d99bedb95b86a91d08bc880676fa013332126ced318044` |

Seen 95 time(s) in 47 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| connect | Opening Marketplace > Selling. | 10 | -1 | -1 ms | 1634–3993 ms | — |
| connect | Auto-login: typing the email. | 4 | -1 | -1 ms | 546–3262 ms | — |
| connect | Auto-login: answered automatedBehaviour. | 16 | -1 | -1 ms | 1106–5600 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 5 | -1 | -1 ms | 1423–4424 ms | — |
| connect | Auto-login: submitting (Enter). | 3 | -1 | -1 ms | 2976–5737 ms | — |
| inspect | step 1: goto /marketplace/ | 13 | -1 | -1 ms | 1503–4086 ms | — |
| inspect | step 2: goto /marketplace/item/<id>/ | 1 | -1 | -1 ms | 5575 ms | — |
| inspect | step 3: goto /marketplace/item/<id>/ | 1 | -1 | -1 ms | 4247 ms | — |
| inspect | step 7: goto /marketplace/you/ | 1 | -1 | -1 ms | 2090 ms | — |
| inspect | step 8: goto /marketplace/status/ | 1 | -1 | -1 ms | 1455 ms | — |
| inspect | step 10: goto /marketplace/item/<id>/ | 1 | -1 | -1 ms | 1749 ms | — |
| publish | Opening /marketplace/create/item | 16 | -1, 200 | -1–290 ms | 1643–8396 ms | — |
| publish | Marketplace location: Reading 19601 US | 1 | -1 | -1 ms | 34907 ms | — |
| inspect | step 16: goto /marketplace/create/item | 1 | -1 | -1 ms | 962 ms | — |
| connect | Page: loginForm /marketplace/selling/ "…" | 2 | -1 | -1 ms | 337–773 ms | — |
| connect | Page: loggedIn /marketplace/selling/ | 5 | -1 | -1 ms | 611–5840 ms | — |
| flow | step 1: goto /me | 2 | -1 | -1 ms | 2798–3067 ms | — |
| flow | step 9: goto /profiles/<id>/name | 2 | -1 | -1 ms | 1525–4967 ms | — |
| inspect | step 1: goto /me | 3 | -1 | -1 ms | 2837–6273 ms | — |
| inspect | step 14: goto /profiles/<id>/name | 1 | -1 | -1 ms | 1638 ms | — |
| inspect | step 1: goto /marketplace/you/selling | 2 | -1 | -1 ms | 2844–2846 ms | — |
| inspect | step 2: click e53 | 2 | -1 | -1 ms | 2511–3151 ms | — |
| inspect | GET 200 /nw/ (285 ms) | 1 | -1 | -1 ms | 1771 ms | — |
| profile | Opening the profile (facebook.com/me). | 1 | 200 | 315 ms | 2142 ms | — |

<!-- facts:end -->

## What it does

Telemetry: quick metrics from the page. Seen aborted (status -1) when a page navigates away mid-send, which is normal.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
