# OhaiWebPublicKeyConfigQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `26996952523264441` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | — |
| Called from | `OhaiWebPublicKeyConfig` |
| rea | `ev_786baf260253294e0033320946363519208e8dffae26d32768956add42a7d013` |

Seen 29 time(s) in 27 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| connect | Page: loggedIn /marketplace/selling/ | 5 | -1, 200 | -1–494 ms | 2752–6413 ms | — |
| inspect | step 1: goto /marketplace/ | 6 | 200 | 320–419 ms | 7271–19670 ms | — |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1223 | 1 | 200 | 481 ms | 9683 ms | — |
| inspect | step 2: waitRole link "…" | 1 | 200 | 568 ms | 13196 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T121 | 1 | 200 | 515 ms | 436 ms | — |
| flow | step 1: goto /me | 2 | 200 | 379–479 ms | 8233–14658 ms | — |
| connect | Auto-login: typing the email. | 1 | 200 | 342 ms | 3864 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 2 | 200 | 317–413 ms | 4008–4294 ms | — |
| inspect | step 1: goto /me | 1 | 200 | 582 ms | 13240 ms | — |
| inspect | step 2: click e53 | 1 | 200 | 404 ms | 8398 ms | — |
| publish | Opening /marketplace/create/item | 7 | 200 | 297–369 ms | 7862–14651 ms | — |
| publish | Category: Miscellaneous | 1 | 200 | 326 ms | 912 ms | — |

<!-- facts:end -->

## What it does

Fetches a public key the page uses to encrypt some data it sends (likely for Messenger or logging).

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
