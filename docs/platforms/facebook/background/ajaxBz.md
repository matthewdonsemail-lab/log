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
| rea | `ev_8c0ff583050eb8ba627ebc33d1c3396e4d2397cd8c074453a9ba13afb8daafea` |

Seen 152 time(s) in 13 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | step 1: goto /marketplace/selling/ | 42 | -1, 200 | -1–1415 ms | 3578–13611 ms | — |
| host | GET 200 /nw/ (319 ms) | 1 | -1 | -1 ms | 2587 ms | — |
| host | step 4: goto /login/ | 16 | -1, 200 | -1–373 ms | 37–12686 ms | — |
| host | GET 200 /nw/ (344 ms) | 1 | -1 | -1 ms | 3711 ms | — |
| host | step 7: signIn | 1 | -1 | -1 ms | 2322 ms | — |
| host | signIn: email typed | 3 | -1, 200 | -1–1577 ms | 1896–2020 ms | — |
| host | signIn: password typed; submitting with Enter | 15 | -1, 200 | -1–797 ms | 69–17116 ms | — |
| host | GET 200 /nw/ (355 ms) | 3 | -1 | -1 ms | 392–2265 ms | — |
| host | step 2: pageText | 3 | -1 | -1 ms | 835–5356 ms | — |
| host | step 4: goto /marketplace/selling/ | 6 | -1 | -1 ms | 58–2707 ms | — |
| host | step 5: pageText | 4 | -1, 200 | -1–362 ms | 1313–5767 ms | — |
| host | step 7: goto /marketplace/selling/ | 6 | -1 | -1 ms | 57–3042 ms | — |
| host | step 8: pageText | 2 | -1, 200 | -1–353 ms | 1241–5159 ms | — |
| connect | Opening Marketplace > Selling. | 7 | -1 | -1 ms | 7239–9789 ms | — |
| connect | Page: loginForm /marketplace/selling/ "…" | 1 | -1 | -1 ms | 573 ms | — |
| connect | submitCredentials failed: crashed Error | 1 | -1 | -1 ms | 1666 ms | — |
| connect | Auto-login: submitting (Enter). | 2 | -1 | -1 ms | 26–102 ms | — |
| inspect | step 27: click e1541 | 1 | 200 | 1489 ms | 37737 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 1403 ms | 80871 ms | — |
| inspect | step 3: goto /marketplace/inbox | 3 | 200, 0 | 0–501 ms | 589944–1455304 ms | — |
| warmup | step 17: dwell 2-4s | 1 | 200 | 377 ms | 80196 ms | — |
| inspect | step 3: click e356 | 1 | 200 | 348 ms | 16302 ms | — |
| host | step 13: code | 1 | 200 | 360 ms | 8434 ms | — |
| host | code failed: RuntimeError: controlMissing: no visible textbox "…" | 1 | 200 | 375 ms | 5140 ms | — |
| host | step 20: code | 1 | 200 | 1542 ms | 6077 ms | — |
| host | code: typed the current authenticator code; submitting with Enter | 2 | 200, -1 | -1–436 ms | 2625–3103 ms | — |
| inspect | step 1: goto /login/ | 5 | 200 | 506–2835 ms | 8286–17100 ms | — |
| inspect | step 2: signIn | 1 | 200 | 3011 ms | 2117 ms | — |
| inspect | signIn: email typed | 1 | 200 | 845 ms | 1847 ms | — |
| inspect | signIn: password typed; submitting with Enter | 3 | 200, 0 | 0–840 ms | 1023–11159 ms | — |
| host | step 6: saveState | 1 | -1 | -1 ms | 3280 ms | — |
| host | signIn failed: RuntimeError: the element kept moving under the cursor: the point is on Por | 1 | -1 | -1 ms | 38521 ms | — |
| host | POST 0 /ajax/bz (0 ms) | 1 | -1 | -1 ms | 4826 ms | — |
| host | signIn failed: RuntimeError: the element kept moving under the cursor: the point is on DIV | 2 | -1 | -1 ms | 16493–29852 ms | — |
| host | step 8: goto /marketplace/selling/ | 6 | -1 | -1 ms | 40–1783 ms | — |
| host | step 10: saveState | 1 | -1 | -1 ms | 2007 ms | — |
| host | step 11: goto /login/ | 3 | -1 | -1 ms | 663–1669 ms | — |
| host | step 13: saveState | 1 | -1 | -1 ms | 1917 ms | — |

<!-- facts:end -->

## What it does

Telemetry: the page's error and event logging, batched.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
