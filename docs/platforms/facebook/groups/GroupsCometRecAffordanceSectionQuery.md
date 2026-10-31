# GroupsCometRecAffordanceSectionQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `28703923735944398` |
| Path | `/api/graphql/` |
| Sends | `groupID`, `scale`, `__relay_internal__pv__GroupsCometGYSJUnifiedUnitCardImageHeightrelayprovider` |
| Reads | — |
| Called from | `GroupsCometRecAffordanceSection.react` |
| rea | `ev_2ca05c619aa890cd1f94b08308e7255ae8282b77f757b96b1f04e2462ff13ad1` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: clickRole button "…" | 1 | 200 | 397 ms | 1877 ms | — |

<!-- facts:end -->

## What it does

A group page's recommendations section (`GroupsCometRecAffordanceSection.react`): it loads, by `groupID`, the cards of other groups Facebook suggests next to this one. In run 20261020T101203 it fired 1.9 s after the Join click, 397 ms, 200.

## What our machine does with it

No machine waits for it or reads it. It fires in the background of the Join step; the join machine decides from the join mutation and the page (`readJoinOptions`), not from the suggestions.

## What can go wrong

Only a 200 has been seen in our runs. If it failed, only Facebook's suggestion cards would be missing; the join step's checks don't depend on it.
