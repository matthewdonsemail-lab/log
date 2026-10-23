# ajaxBz

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/bz` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_70efc081c67ed7332e21c5498e2db53c87d1066c637ab8bfc22fe41d543c7021` |

Seen 58 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | step 1: goto /marketplace/selling/ | 15 | -1 | -1 ms | 5723–9570 ms | — |
| host | GET 200 /nw/ (319 ms) | 1 | -1 | -1 ms | 2587 ms | — |
| host | step 4: goto /login/ | 3 | -1 | -1 ms | 59–5778 ms | — |
| host | GET 200 /nw/ (344 ms) | 1 | -1 | -1 ms | 3711 ms | — |
| host | step 7: signIn | 1 | -1 | -1 ms | 2322 ms | — |
| host | signIn: email typed | 1 | -1 | -1 ms | 1997 ms | — |
| host | signIn: password typed; submitting with Enter | 2 | -1 | -1 ms | 1037–4859 ms | — |
| host | GET 200 /nw/ (355 ms) | 3 | -1 | -1 ms | 392–2265 ms | — |
| host | step 2: pageText | 1 | -1 | -1 ms | 835 ms | — |
| host | step 4: goto /marketplace/selling/ | 6 | -1 | -1 ms | 58–2707 ms | — |
| host | step 5: pageText | 1 | -1 | -1 ms | 1528 ms | — |
| host | step 7: goto /marketplace/selling/ | 6 | -1 | -1 ms | 57–3042 ms | — |
| host | step 8: pageText | 1 | -1 | -1 ms | 1241 ms | — |
| connect | Opening Marketplace > Selling. | 7 | -1 | -1 ms | 7239–9789 ms | — |
| connect | Page: loginForm /marketplace/selling/ "…" | 1 | -1 | -1 ms | 573 ms | — |
| connect | submitCredentials failed: crashed Error | 1 | -1 | -1 ms | 1666 ms | — |
| connect | Auto-login: submitting (Enter). | 2 | -1 | -1 ms | 26–102 ms | — |
| inspect | step 27: click e1541 | 1 | 200 | 1489 ms | 37737 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 1403 ms | 80871 ms | — |
| inspect | step 3: goto /marketplace/inbox | 3 | 200, 0 | 0–501 ms | 589944–1455304 ms | — |

<!-- facts:end -->

## What it does

Telemetry: the page's error and event logging, batched.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
