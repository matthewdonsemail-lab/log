# ajaxRouteDefinition

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/route-definition/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_2cc284eb516f0beefa9fd6d08ce43290191409c99d9e18dffb465f686bcdd604` |

Seen 10 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | rea read step 11_clickroleButtonNextCard: exit 0, ev_189e7df832ac014018be21a4d2fe3eb4b862d | 2 | 200 | 1301–1496 ms | 1702–1704 ms | — |
| inspect | rea read step 20_clickroleButtonNextCard: exit 0, ev_b8ad981adedd3a055cbb6fd651deb9976e71e | 2 | 200 | 875–1135 ms | 1837–1838 ms | — |
| inspect | step 8: clickAny 1 x link /see owner profile$/ | 2 | 200 | 1125–2019 ms | 2767–2769 ms | — |
| inspect | step 19: clickAny 1 x link /see owner profile$/ | 2 | 200 | 863–1649 ms | 2864–2867 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 2 | 200 | 1980–2160 ms | 4652–4653 ms | — |

<!-- facts:end -->

## What it does

Fetches the code and data for a page the client navigates to without a full reload (the profile after a save).

## What our machine does with it

Nothing.

## What can go wrong

Harmless; part of every in-app navigation.
