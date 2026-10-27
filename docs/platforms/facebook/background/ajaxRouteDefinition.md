# ajaxRouteDefinition

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/route-definition/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_ad4faa4ee06f9f7047a83035e82226ea07cbd4cb203ef0b5d645187a3563ec94` |

Seen 40 time(s) in 12 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /profile.php | 2 | 200 | 935–1029 ms | 7265–7287 ms | — |
| inspect | step 12: clickAny 1 x link /see owner profile$/ | 2 | 200 | 1301–1496 ms | 2966–2968 ms | — |
| inspect | step 21: clickAny 1 x link /see owner profile$/ | 2 | 200 | 875–1135 ms | 2572–2573 ms | — |
| inspect | step 8: clickAny 1 x link /see owner profile$/ | 2 | 200 | 1125–2019 ms | 2767–2769 ms | — |
| inspect | step 19: clickAny 1 x link /see owner profile$/ | 2 | 200 | 863–1649 ms | 2864–2867 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 4 | 200 | 813–2191 ms | 178–4653 ms | — |
| inspect | step 10: click e1174 | 1 | 200 | 5110 ms | 1523 ms | — |
| inspect | step 25: click e1241 | 1 | 200 | 7484 ms | 7701 ms | — |
| inspect | step 4: setLocation Bethlehem, PA | 1 | 200 | 3860 ms | 17661 ms | — |
| inspect | step 13: setLocation 18015 | 1 | 200 | 4291 ms | 15359 ms | — |
| inspect | step 1: goto /me | 2 | 200 | 749–862 ms | 6218–6220 ms | — |
| inspect | step 7: click e1395 | 2 | 200 | 791–832 ms | 11645–11648 ms | — |
| host | step 7: goto /me | 2 | 200 | 1165–1280 ms | 3718–3771 ms | — |
| host | step 12: goto /me | 2 | 200 | 984–1034 ms | 3870–3877 ms | — |
| host | step 17: goto /me | 2 | 200 | 990–1063 ms | 3028–3031 ms | — |
| host | step 21: clickRole button "…" | 1 | 200 | 1032 ms | 7865 ms | — |
| flow | setLocation: 'Mountain Top, Pennsylvania' is suggestion 1 of 2 | 2 | 200 | 2195–3050 ms | 5012–6707 ms | — |
| host | step 32: goto /me | 2 | 200 | 538–1419 ms | 5716–5753 ms | — |
| host | step 39: clickRole button "…" | 1 | 200 | 857 ms | 3823 ms | — |
| host | setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9 | 2 | 200 | 2195–4545 ms | 5140–644742 ms | — |
| host | step 5: goto /me | 2 | 200 | 375–393 ms | 4188 ms | — |
| host | step 11: clickRole button "…" | 1 | 200 | 478 ms | 3971 ms | — |
| host | setLocation: 'Kamloops, British Columbia' is suggestion 1 of 9 | 1 | 200 | 3716 ms | 3333 ms | — |

<!-- facts:end -->

## What it does

Fetches the code and data for a page the client navigates to without a full reload (the profile after a save).

## What our machine does with it

Nothing.

## What can go wrong

Harmless; part of every in-app navigation.
