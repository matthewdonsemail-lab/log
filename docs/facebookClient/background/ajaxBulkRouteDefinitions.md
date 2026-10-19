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
| rea | `ev_ffc2455a215f86b6a0d99bedb95b86a91d08bc880676fa013332126ced318044` |

Seen 254 time(s) in 39 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| connect | Opening Marketplace > Selling. | 21 | 200 | 306–601 ms | 4893–9942 ms | — |
| connect | Auto-login: answered automatedBehaviour. | 3 | 200 | 320–409 ms | 4954–5499 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 23 | 200, -1 | -1–678 ms | 51–6805 ms | — |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1321 | 7 | 200 | 835–5398 ms | 14853–36774 ms | — |
| inspect | step 3: goto /marketplace/item/<id>/ | 6 | 200 | 4220–8646 ms | 6370–15012 ms | — |
| inspect | step 10: goto /marketplace/item/<id>/ | 7 | 200 | 3481–9743 ms | 4716–15006 ms | — |
| publish | Opening /marketplace/create/item | 29 | 200 | 329–2390 ms | 6722–29626 ms | — |
| publish | Marketplace location: Reading 19601 US | 7 | 200 | 371–2119 ms | 1166–41194 ms | — |
| publish | Category: Miscellaneous | 4 | 200 | 347–415 ms | 882–5702 ms | — |
| inspect | step 1: goto /marketplace/ | 55 | 200 | 316–1459 ms | 5489–19818 ms | — |
| inspect | POST 200 CometMarketplaceLeftRailNavigationContainerQuery (418 ms) | 3 | 200 | 402–502 ms | 2083–2091 ms | — |
| inspect | step 16: goto /marketplace/create/item | 2 | 200 | 531–788 ms | 4390–5993 ms | — |
| connect | Page: unknown /marketplace/selling/ | 3 | 200 | 448–1752 ms | 3915–3920 ms | — |
| connect | Page: loggedIn /marketplace/selling/ | 18 | 200 | 314–654 ms | 1384–7499 ms | — |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1223 | 9 | 200 | 484–1650 ms | 2663–12737 ms | — |
| inspect | step 2: waitRole link "…" | 8 | 200 | 510–1405 ms | 2743–13954 ms | — |
| inspect | POST 0 /ajax/qm/ (0 ms) | 2 | 200 | 443–757 ms | 2875–3346 ms | — |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1216 | 5 | 200 | 692–2687 ms | 63–3586 ms | — |
| inspect | step 2: wait 10s | 1 | 200 | 5344 ms | 2882 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T121 | 1 | 200 | 835 ms | 767 ms | — |
| inspect | POST 200 /ajax/bulk-route-definitions/ (850 ms) | 2 | 200 | 436–604 ms | 3619–3620 ms | — |
| flow | step 1: goto /me | 12 | 200 | 347–501 ms | 6771–16216 ms | — |
| flow | step 5: clickRole button "…" | 2 | 200 | 341–353 ms | 6855–11299 ms | — |
| flow | step 8: clickRole button "…" | 2 | 200 | 378–480 ms | 3216–6337 ms | — |
| connect | Signed in; session written for Twenty. | 1 | -1 | -1 ms | 998 ms | — |
| connect | says: (no text) / buttons: none | 3 | 200 | 325–413 ms | 2422–2426 ms | — |
| connect | Auto-login: typing the email. | 3 | 200 | 364–368 ms | 2633–3412 ms | — |
| inspect | step 1: goto /me | 6 | 200 | 345–490 ms | 11657–14218 ms | — |
| inspect | now on /profile.php "…" after 2734 ms; 0 request(s) | 1 | 200 | 300 ms | 1980 ms | — |
| inspect | POST 200 /ajax/webstorage/process_keys/ (302 ms) | 1 | 200 | 475 ms | 533 ms | — |
| inspect | step 2: click e53 | 3 | 200 | 409–556 ms | 6225–8786 ms | — |
| inspect | step 1: goto /marketplace/you/selling | 3 | 200 | 409–768 ms | 6076–6088 ms | — |
| inspect | step 2: click e675 | 1 | 200 | 295 ms | 977 ms | — |

<!-- facts:end -->

## What it does

Prefetches the code and route data for links on the page (`/marketplace/selling/`, `/notifications`...), so a click opens fast. Its payload includes the signed-in actor id.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
