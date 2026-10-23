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
| rea | `ev_0c2339980e57a3eba861020b7a9574cd8e636d3ae647fcaed1d57a654880b374` |

Seen 18 time(s) in 6 run(s).

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

<!-- facts:end -->

## What it does

Fetches the code and data for a page the client navigates to without a full reload (the profile after a save).

## What our machine does with it

Nothing.

## What can go wrong

Harmless; part of every in-app navigation.
