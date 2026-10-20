# useGroupsCometHeaderControlsQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `9729658597069783` |
| Path | `/api/graphql/` |
| Sends | `group_id` |
| Reads | `group.is_recommendation_unit_available` |
| Called from | `useGroupsCometHeaderControls` |
| rea | `ev_d129cd3704f7ae030035d74926e60b5d8c707b2673aaeacddf97c74d6cd3eb78` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: clickRole button "…" | 1 | 200 | 535 ms | 1332 ms | — |

<!-- facts:end -->

## What it does

The group header's controls (`useGroupsCometHeaderControls`): by `group_id`, it reads whether a recommendation unit is available for the group (`group.is_recommendation_unit_available`), which decides what the header shows after a Join. In run 20261020T101203 it fired 1.3 s after the Join click, 535 ms, 200.

## What our machine does with it

No machine waits for it or reads it. It fires in the background of the Join step; the join machine reads the join mutation, the questions query and the snapshot.

## What can go wrong

Only a 200 has been seen in our runs. If it failed, the header controls would render without the recommendation unit; the join step's checks don't depend on it.
