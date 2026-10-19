# ajaxBulkRouteDefinitions

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/bulk-route-definitions/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_3ac696d9ca5b73b85be25c3eb0a04d8e07223fff4eb281ffe30fb79f8510e011` |

Seen 48 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | step 1: goto /marketplace/selling/ | 6 | 200 | 390–483 ms | 5918–5952 ms | — |
| host | signIn: password typed; submitting with Enter | 9 | 200 | 370–670 ms | 11079–24337 ms | — |
| host | step 10: goto /marketplace/selling/ | 5 | 200 | 348–530 ms | 3680–5531 ms | — |
| host | step 12: goto /me | 7 | 200 | 356–453 ms | 3945–6359 ms | — |
| host | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\host\20261019T163027 | 2 | 200 | 377–461 ms | 15537–30341 ms | — |
| host | step 4: goto /marketplace/selling/ | 4 | 200 | 368–449 ms | 1605–1934 ms | — |
| host | step 7: goto /marketplace/selling/ | 4 | 200 | 409–452 ms | 1934–2247 ms | — |
| connect | Opening Marketplace > Selling. | 3 | 200 | 394–511 ms | 7411–7417 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 8 | -1, 200 | -1–499 ms | 1386–4959 ms | — |

<!-- facts:end -->

## What it does

Prefetches the code and route data for links on the page (`/marketplace/selling/`, `/notifications`...), so a click opens fast. Its payload includes the signed-in actor id.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
