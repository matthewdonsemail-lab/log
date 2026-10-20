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

Seen 54 time(s) in 11 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id>/ | 2 | 200 | 1129–2133 ms | 4407–6412 ms | — |
| inspect | step 1: goto /groups/<id> | 1 | 200 | 1837 ms | 7273 ms | — |
| inspect | step 1: goto / | 5 | 200 | 1260–1765 ms | 3655–7988 ms | — |
| inspect | step 7: goto / | 1 | 200 | 1674 ms | 2008 ms | — |
| inspect | step 34: goto /marketplace/ | 1 | 200 | 1266 ms | 5241 ms | — |
| inspect | step 38: goto /marketplace/ | 1 | 200 | 1512 ms | 2155 ms | — |
| inspect | step 22: goto /marketplace/ | 1 | 200 | 1586 ms | 2952 ms | — |
| inspect | step 27: goto / | 1 | 200 | 1365 ms | 2346 ms | — |
| inspect | step 4: goto /marketplace/ | 1 | 200 | 1066 ms | 5217 ms | — |
| inspect | step 1: goto /reel/ | 3 | 200 | 844–899 ms | 2297–3569 ms | — |
| inspect | step 71: goto /reel/ | 1 | 200 | 882 ms | 3045 ms | — |
| inspect | step 16: clickRole button "…" | 1 | 200 | 1248 ms | 3727 ms | — |
| inspect | step 17: dwell 0.80s | 1 | 200 | 784 ms | 1315 ms | — |
| inspect | step 18: clickRole button "…" | 1 | 200 | 800 ms | 2665 ms | — |
| inspect | step 19: clickRole button "…" | 1 | 200 | 759 ms | 4723 ms | — |
| inspect | step 24: clickRole button "…" | 28 | 200 | 700–7278 ms | 39233–1251567 ms | — |
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
