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
| rea | `ev_262d88fab3be7aa47300d07ddd7f69a8108be9bd772dc983116781db97cc2690` |

Seen 76 time(s) in 18 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 1: goto /me | 6 | 200 | 347–481 ms | 6771–10017 ms | — |
| flow | step 5: clickRole button "…" | 1 | 200 | 341 ms | 6855 ms | — |
| flow | step 8: clickRole button "…" | 1 | 200 | 378 ms | 3216 ms | — |
| connect | says: (no text) / buttons: none | 3 | 200 | 325–413 ms | 2422–2426 ms | — |
| connect | Auto-login: typing the email. | 3 | 200 | 364–368 ms | 2633–3412 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 9 | -1, 200 | -1–579 ms | 72–4433 ms | — |
| inspect | step 1: goto /me | 6 | 200 | 345–490 ms | 11657–14218 ms | — |
| inspect | now on /profile.php "…" after 2734 ms; 0 request(s) | 1 | 200 | 300 ms | 1980 ms | — |
| inspect | POST 200 /ajax/webstorage/process_keys/ (302 ms) | 1 | 200 | 475 ms | 533 ms | — |
| inspect | step 2: click e53 | 3 | 200 | 409–556 ms | 6225–8786 ms | — |
| inspect | step 1: goto /marketplace/you/selling | 3 | 200 | 409–768 ms | 6076–6088 ms | — |
| inspect | step 2: click e675 | 1 | 200 | 295 ms | 977 ms | — |
| publish | Opening /marketplace/create/item | 19 | 200 | 329–1648 ms | 7276–29626 ms | — |
| connect | Opening Marketplace > Selling. | 9 | 200 | 321–415 ms | 6821–9816 ms | — |
| connect | Page: loggedIn /marketplace/selling/ | 8 | 200 | 314–560 ms | 2497–6233 ms | — |
| publish | Category: Miscellaneous | 2 | 200 | 411–415 ms | 882–941 ms | — |

<!-- facts:end -->

## What it does

Prefetches the code and route data for links on the page (`/marketplace/selling/`, `/notifications`...), so a click opens fast. Its payload includes the signed-in actor id.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
