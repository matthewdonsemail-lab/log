# GroupsCometJoinedActionMenuQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `26405903522403661` |
| Path | `/api/graphql/` |
| Sends | `groupID` |
| Reads | `group.id`, `group.leave_action`, `group.if_viewer_can_change_follow_setting`, `group.viewer_join_state` |
| Called from | `GroupsCometJoinedActionMenu.react` |
| rea | `ev_069520cf5af89f8e626dbd496c95fdac703256e351ce27691443d1f2e17fd13b` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 16: clickRole button "…" | 1 | 200 | 412 ms | 2069 ms | — |

<!-- facts:end -->

## What it does

The Joined button's menu (`GroupsCometJoinedActionMenu.react`): by `groupID` it reads the account's membership (`viewer_join_state`), whether it can change following, and the leave action. The menu showed Manage notifications, Unfollow group and Leave group. In run 20261020T153648 step 16 it fired 2.1 s after the click, 412 ms, 200.

## What our machine does with it

No machine waits for it. `viewer_join_state` is what a membership check could read (a member sees Joined, a non-member Join, which is `log facebook join group`), but nothing reads it yet. The flow [`groupHeaderMenus`](../flows/groupHeaderMenus.md) opens the menu and closes it with Escape; no item is picked (rule 8).

## What can go wrong

Only a 200 has been seen, in one run. If it failed, the menu would open with fewer items or not at all; nothing changes on Facebook until an item is picked, which no flow does.
