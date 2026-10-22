# useGroupsEntityScopedRecentSearchAndExploreDataSourceQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `26563731339911635` |
| Path | `/api/graphql/` |
| Sends | `filter`, `first`, `scale`, `search_scope_entity_id` |
| Reads | `viewer.recent_searches`, `group.is_work_entity`, `group.if_viewer_can_see_self_group_activity`, `group.default_actor` |
| Called from | `useGroupsEntityScopedRecentSearchAndExploreDataSource` |
| rea | `ev_1e212d555c3827ac4db55e29be937e3b7ef5d65dc1a6c483149be3895fdc0cc3` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 12: clickRole button "…" | 1 | 200 | 375 ms | 1063 ms | — |

<!-- facts:end -->

## What it does

The empty state of "Search within this group": the account's recent searches in this group and whether it can see its own group activity (`search_scope_entity_id` is the group). In run 20261020T153648 step 12 it fired 1.1 s after the click, 375 ms, 200.

## What our machine does with it

No machine waits for it or reads it. The flow [`groupHeaderMenus`](../flows/groupHeaderMenus.md) opens the search and closes it with Escape; nothing is searched.

## What can go wrong

Only a 200 has been seen, in one run. If it failed, the dialog would show no recent searches; nothing changes.
