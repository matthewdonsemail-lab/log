# CometNotificationsDropdownQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29240849615602606` |
| Path | `/api/graphql/` |
| Sends | `count`, `environment`, `scale` |
| Reads | `viewer....CometNotificationsListWrapper_viewer` |
| Called from | `CometNotificationsDropdown.react` |
| rea | `ev_ab1965911932cb7fcf25b222bf92e0487c624ad5aa06bc6a0e5e7860bc09d85a` |

Seen 38 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /reel/ | 2 | 200 | 844–899 ms | 2297–2542 ms | — |
| inspect | page has 44 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T062 | 2 | 200 | 784–1248 ms | 165–1191 ms | — |
| inspect | rea read step 17_dwell080s: exit 0, ev_65100b4eb6e212aed7c9824c2c80ca8172d5a866337566e928f | 1 | 200 | 800 ms | 164 ms | — |
| inspect | rea read step 18_clickroleButtonNextCard: exit 0, ev_33faffe301518f4ece688324618192249fe69 | 1 | 200 | 759 ms | 4020 ms | — |
| inspect | rea read step 24_clickroleButtonNextCard: exit 0, ev_08bd0b0aa3e491db75fd341d53b6ccf63883a | 28 | 200 | 700–7278 ms | 31458–1243792 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 1123 ms | 1062 ms | — |
| inspect | step 22: goto /reel/ | 1 | 200 | 843 ms | 1783 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 1 | 200 | 1954 ms | 4811 ms | — |
| inspect | step 53: goto /reel/ | 1 | 200 | 1385 ms | 4961 ms | — |

<!-- facts:end -->

## What it does

The notifications menu's contents. Loads on every signed-in page.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
