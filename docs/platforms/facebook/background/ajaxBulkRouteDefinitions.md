# ajaxBulkRouteDefinitions

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/bulk-route-definitions/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_e642c5ea830afe2876447a54b55015ae0e0f3c5ada04188796278a671712d802` |

Seen 67 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id>/ | 18 | 200 | 394–532 ms | 1996–5234 ms | — |
| inspect | step 10: goto /groups/<id>/ | 5 | 200 | 401–610 ms | 1347–3431 ms | — |
| inspect | step 11: goto /groups/<id>/ | 5 | 200 | 402–494 ms | 995–3106 ms | — |
| inspect | step 4: goto /groups/<id>/ | 6 | 200 | 374–452 ms | 1024–3161 ms | — |
| inspect | step 1: goto / | 7 | 200 | 323–406 ms | 6079–7410 ms | — |
| inspect | step 2: type e20 | 4 | 200 | 307–345 ms | 164–1892 ms | — |
| inspect | step 3: press Enter | 7 | 200 | 340–396 ms | 563–6316 ms | — |
| inspect | step 4: click e1506 | 3 | 200 | 333–378 ms | 2140–2734 ms | — |
| inspect | step 5: click e2647 | 5 | 200 | 316–376 ms | 1142–3540 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T212 | 2 | 200 | 394–543 ms | 115–2192 ms | — |
| inspect | step 6: back | 2 | 200 | 328–347 ms | 832–2715 ms | — |
| inspect | step 7: click e2606 | 3 | 200 | 341–346 ms | 7364–7860 ms | — |

<!-- facts:end -->

## What it does

Prefetches the code and route data for links on the page (`/marketplace/selling/`, `/notifications`...), so a click opens fast. Its payload includes the signed-in actor id.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
