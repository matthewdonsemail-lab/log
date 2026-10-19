# ajaxRelayEf

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/relay-ef/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_75108ee372ec9c9d025d813c6833d70f123d6da89d0f0b5eef5eeaba1d70bfda` |

Seen 27 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | signIn: password typed; submitting with Enter | 6 | 200 | 355–1145 ms | 20387–25185 ms | — |
| host | mouse: 5 wander, 5 flick, 2 approach; 5 idle drift move(s) | 2 | 200 | 346–356 ms | 48–219 ms | — |
| host | POST 200 /ajax/bulk-route-definitions/ (752 ms) | 2 | 200 | 399–422 ms | 2442–4521 ms | — |
| host | POST 200 ProfileCometTimelineListViewRootQuery (660 ms) | 1 | 200 | 346 ms | 1123 ms | — |
| host | step 10: goto /marketplace/selling/ | 6 | 200 | 339–367 ms | 5664–7657 ms | — |
| host | step 12: goto /me | 5 | 200 | 339–407 ms | 6087–13597 ms | — |
| host | POST 200 /ajax/bulk-route-definitions/ (1106 ms) | 2 | 200 | 341–390 ms | 2185–2731 ms | — |
| host | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\host\20261019T163027 | 2 | 200 | 346–461 ms | 18408–19067 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 1 | 200 | 399 ms | 6113 ms | — |

<!-- facts:end -->

## What it does

Relay's error/event flush: the GraphQL client reporting on itself.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
