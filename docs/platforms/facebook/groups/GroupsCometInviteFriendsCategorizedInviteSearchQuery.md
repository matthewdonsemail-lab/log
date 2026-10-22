# GroupsCometInviteFriendsCategorizedInviteSearchQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `23947758888181573` |
| Path | `/api/graphql/` |
| Sends | `after_cursor`, `category_source_id`, `category_type`, `count`, `id`, `keyword`, `scale`, `selected_group_ids` |
| Reads | `node....GroupsCometInviteFriendsSearchColumnSocialContext_group` |
| Called from | `GroupsCometInviteFriendsSearchColumnSocialContext_group.graphql` |
| rea | `ev_5a0b1096636fa4c8fff20d0934bf86f2405cc7d410159c37bb8d4491fbf815bc` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 18: clickRole button "…" | 1 | 200 | 544 ms | 2976 ms | — |

<!-- facts:end -->

## What it does

The friend list inside the Invite dialog (`GroupsCometInviteFriendsSearchColumnSocialContext_group`): a page of the account's friends to pick from (`count`, `after_cursor`, `keyword` empty). In run 20261020T153648 step 18 it fired 3.0 s after the Invite click, 544 ms, 200.

## What our machine does with it

No machine waits for it or reads it. The flow [`groupHeaderMenus`](../flows/groupHeaderMenus.md) closes the dialog with Escape; no one is picked or invited (rule 8).

## What can go wrong

Only a 200 has been seen, in one run. If it failed, the dialog would show no friends; nothing is sent.
