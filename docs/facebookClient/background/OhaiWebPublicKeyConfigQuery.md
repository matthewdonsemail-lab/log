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

Seen 43 time(s) in 35 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| connect | Page: loggedIn /marketplace/selling/ "…" | 6 | 200 | 315–479 ms | 1540–6579 ms | — |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1321 | 1 | 200 | 5252 ms | 16484 ms | — |
| inspect | step 3: goto /marketplace/item/<id>/ | 1 | 200 | 6406 ms | 12071 ms | — |
| inspect | step 10: goto /marketplace/item/<id>/ | 1 | 200 | 5548 ms | 11431 ms | — |
| publish | Marketplace location: Reading 19601 US | 2 | 200 | 354–470 ms | 1134–41036 ms | — |
| publish | Opening /marketplace/create/item | 10 | 200 | 297–380 ms | 7653–14651 ms | — |
| inspect | step 1: goto /marketplace/ | 7 | 200 | 320–506 ms | 7271–19670 ms | — |
| inspect | step 16: goto /marketplace/create/item | 1 | 200 | 367 ms | 5549 ms | — |
| connect | Page: loggedIn /marketplace/selling/ | 5 | -1, 200 | -1–494 ms | 2752–6413 ms | — |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1223 | 1 | 200 | 481 ms | 9683 ms | — |
| inspect | step 2: waitRole link "…" | 1 | 200 | 568 ms | 13196 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T121 | 1 | 200 | 515 ms | 436 ms | — |
| flow | step 1: goto /me | 2 | 200 | 379–479 ms | 8233–14658 ms | — |
| connect | Auto-login: typing the email. | 1 | 200 | 342 ms | 3864 ms | — |
| inspect | step 1: goto /me | 1 | 200 | 582 ms | 13240 ms | — |
| inspect | step 2: click e53 | 1 | 200 | 404 ms | 8398 ms | — |
| publish | Category: Miscellaneous | 1 | 200 | 326 ms | 912 ms | — |

<!-- facts:end -->

## What it does

Fetches a public key the page uses to encrypt some data it sends (likely for Messenger or logging).

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
