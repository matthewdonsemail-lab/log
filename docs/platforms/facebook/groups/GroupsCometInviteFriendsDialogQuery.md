# GroupsCometInviteFriendsDialogQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `27844394868579385` |
| Path | `/api/graphql/` |
| Sends | `category_source_id`, `category_type`, `groupID`, `keyword`, `name`, `scale`, `selected_group_ids` |
| Reads | `group.if_viewer_cannot_approve_members`, `group.subspace_type`, `group....GroupsCometInviteFriendsSearchColumnSocialContext_group`, `group....GroupsCometInviteFriendsSearchColumnGroupContext_group`, `group....GroupsCometInviteFriendsSearchColumn_group`, `group....GroupsCometInviteDialogContinuousInvitesSection_group` |
| Called from | `GroupsCometInviteFriendsDialog.react` |
| rea | `ev_1d3a30586483a8fc98a9b974e9f17e73cea12f345c43b1b80c31ed922f1ef303` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 18: clickRole button "…" | 1 | 200 | 849 ms | 1333 ms | — |

<!-- facts:end -->

## What it does

The Invite dialog (`GroupsCometInviteFriendsDialog.react`), from the header's Invite button: by `groupID` it loads the dialog's columns and whether the account's invites need an admin's approval (`if_viewer_cannot_approve_members`). In run 20261020T153648 step 18 it fired 1.3 s after the click, 849 ms, 200.

## What our machine does with it

No machine waits for it or reads it. The flow [`groupHeaderMenus`](../flows/groupHeaderMenus.md) opens the dialog and closes it with Escape; sending an invite is a write and was not done (rule 8).

## What can go wrong

Only a 200 has been seen, in one run. If it failed, the dialog would not open; nothing on Facebook changes.
