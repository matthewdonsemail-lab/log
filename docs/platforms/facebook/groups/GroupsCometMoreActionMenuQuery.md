# GroupsCometMoreActionMenuQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `28069915542595043` |
| Path | `/api/graphql/` |
| Sends | `groupID`, `scale` |
| Reads | `is_group_age_gated` |
| Called from | `GroupsCometMoreActionMenu.react` |
| rea | `ev_7e104ad89c1a758d5be296c4aa859fb3e7d152cf0578e0821e93114b7379d415` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 14: clickRole button "…" | 1 | 200 | 578 ms | 920 ms | — |

<!-- facts:end -->

## What it does

The header's More menu (`GroupsCometMoreActionMenu.react`): by `groupID` it loads whether the group is age-gated (`is_group_age_gated`) for the menu's items: Your content, Share, Manage notifications, Pin group, Report group. In run 20261020T153648 step 14 it fired 0.9 s after the click, 578 ms, 200.

## What our machine does with it

No machine waits for it or reads it. The flow [`groupHeaderMenus`](../flows/groupHeaderMenus.md) opens the menu and closes it with Escape; no item is picked (rule 8).

## What can go wrong

Only a 200 has been seen, in one run. If it failed, the menu would open with fewer items or not at all; nothing changes on Facebook until an item is picked, which no flow does.
