# GroupsEntityScopedCometTypeaheadDialogQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `24240167975570263` |
| Path | `/api/graphql/` |
| Sends | `entityID` |
| Reads | — |
| Called from | `GroupsEntityScopedCometTypeaheadDialog.react` |
| rea | `ev_fda608ecc0f1e7e7108ed8ec0bac589115e9a29da38449fc6dcce6d25ffae4a9` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 12: clickRole button "…" | 1 | 200 | 367 ms | 851 ms | — |

<!-- facts:end -->

## What it does

The "Search within this group" dialog (`GroupsEntityScopedCometTypeaheadDialog.react`): it loads, by `entityID` (the group), what the search box scoped to that group needs before anything is typed. In run 20261020T153648 step 12 it fired 0.9 s after the click, 367 ms, 200, beside `useGroupsEntityScopedRecentSearchAndExploreDataSourceQuery` (the recent searches) and `withSearchCometTypeaheadSERPWarmCallDecoratorQuery`.

## What our machine does with it

No machine waits for it or reads it. The flow [`groupHeaderMenus`](../flows/groupHeaderMenus.md) opens the search and closes it with Escape; nothing is typed, so no search query was sent.

## What can go wrong

Only a 200 has been seen, in one run. If it failed, the search dialog would not open; nothing on Facebook changes.
