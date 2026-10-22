# GroupsCometMembersRootQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `28867072972902824` |
| Path | `/api/graphql/` |
| Sends | `groupID`, `scale` |
| Reads | `group.feature_intervention`, `group....GroupsCometMembersSummaryTwoColumnWrapper_group` |
| Called from | `GroupsCometMembersRoot.react` |
| rea | `ev_dcb24232437fe3b659e57bb0a80242aad3d8e1db7a6ec3a6f86fc3f7b4aa048a` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 6: clickRole tab "…" | 1 | 200 | 1340 ms | 2075 ms | — |

<!-- facts:end -->

## What it does

The People tab (`GroupsCometMembersRoot.react`, `/groups/<id>/members`): by `groupID` it loads the member count, the admins and moderators, and members with things in common with the account. In run 20261020T153648 step 6 it fired 2.1 s after the tab click, 1340 ms, 200 (the first click, step 5, was refused by the cursor check: a hover card had covered the tab, and nothing was pressed).

## What our machine does with it

No machine waits for it or reads it. The group read (`src/group/read`) stays on the Discussion tab and never opens this one. The flow [`groupTabs`](../flows/groupTabs.md) clicks the tab and waits for no request: a page-load query isn't a confirming request, only a mutation is (`confirmingRequest`). The tab's Follow buttons and member actions are writes and were not pressed.

## What can go wrong

Only a 200 has been seen, in one run. If it failed, the tab would show Facebook's own error panel instead of its content; the flow's click would still pass, and nothing on Facebook changes, since it only reads.
