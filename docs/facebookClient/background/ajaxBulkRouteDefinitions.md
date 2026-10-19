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
| rea | `ev_5bee8bac109273dd2b1630de0e43a0c730549523f08b21408d80e39b9bc8e0f3` |

Seen 42 time(s) in 13 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Opening /marketplace/create/item | 19 | 200 | 329–1648 ms | 7276–29626 ms | — |
| connect | Opening Marketplace > Selling. | 9 | 200 | 321–415 ms | 6821–9816 ms | — |
| connect | Page: loggedIn /marketplace/selling/ | 8 | 200 | 314–560 ms | 2497–6233 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 4 | 200 | 312–537 ms | 3381–4345 ms | — |
| publish | Category: Miscellaneous | 2 | 200 | 411–415 ms | 882–941 ms | — |

<!-- facts:end -->

## What it does

Prefetches the code and route data for links on the page (`/marketplace/selling/`, `/notifications`...), so a click opens fast. Its payload includes the signed-in actor id.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
