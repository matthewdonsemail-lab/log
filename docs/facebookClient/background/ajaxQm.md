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
| rea | `ev_5a868e88094489f9152e54cf6c06833679ecdfeb9dffddf5d9f9fabd280635b9` |

Seen 64 time(s) in 38 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /marketplace/ | 11 | -1 | -1 ms | 1503–4086 ms | — |
| connect | Opening Marketplace > Selling. | 7 | -1 | -1 ms | 1634–3673 ms | — |
| connect | Page: loginForm /marketplace/selling/ "…" | 1 | -1 | -1 ms | 337 ms | — |
| connect | Auto-login: answered automatedBehaviour. | 8 | -1 | -1 ms | 1106–3991 ms | — |
| connect | Page: loggedIn /marketplace/selling/ | 4 | -1 | -1 ms | 611–4358 ms | — |
| flow | step 1: goto /me | 2 | -1 | -1 ms | 2798–3067 ms | — |
| flow | step 9: goto /profiles/<id>/name | 2 | -1 | -1 ms | 1525–4967 ms | — |
| connect | Auto-login: typing the email. | 3 | -1 | -1 ms | 546–3262 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 2 | -1 | -1 ms | 1423–2139 ms | — |
| inspect | step 1: goto /me | 3 | -1 | -1 ms | 2837–6273 ms | — |
| inspect | step 14: goto /profiles/<id>/name | 1 | -1 | -1 ms | 1638 ms | — |
| inspect | step 1: goto /marketplace/you/selling | 2 | -1 | -1 ms | 2844–2846 ms | — |
| inspect | step 2: click e53 | 2 | -1 | -1 ms | 2511–3151 ms | — |
| inspect | GET 200 /nw/ (285 ms) | 1 | -1 | -1 ms | 1771 ms | — |
| profile | Opening the profile (facebook.com/me). | 1 | 200 | 315 ms | 2142 ms | — |
| publish | Opening /marketplace/create/item | 12 | -1, 200 | -1–290 ms | 1643–8396 ms | — |
| connect | Auto-login: submitting (Enter). | 2 | -1 | -1 ms | 2976–3138 ms | — |

<!-- facts:end -->

## What it does

Telemetry: quick metrics from the page. Seen aborted (status -1) when a page navigates away mid-send, which is normal.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
