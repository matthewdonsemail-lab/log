# useGroupsCometTypeaheadBootloadDataSourceQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `9778341108915180` |
| Path | `/api/graphql/` |
| Sends | `canUseSections`, `canViewerMessage`, `firstDegreeFilters`, `groupID`, `isAdminsOnly`, `isPhotoTag`, `postID`, `scale` |
| Reads | `comet_group_typeahead_bootload.__typename` |
| Called from | `useGroupsCometTypeaheadBootloadDataSource` |
| rea | `ev_c2ef8a4628a13bebcc27d99e98aee652489e57518d36f840f2d66654133e643d` |

Seen 4 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 40: clickRole textbox "…" | 1 | 200 | 862 ms | 1138 ms | — |
| inspect | scroll: +657px in 17 wheel steps, 1328 ms | 1 | 200 | 957 ms | 3999 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 597 ms | 2524 ms | — |
| inspect | scroll: +1731px in 35 wheel steps, 2093 ms | 1 | 200 | 2190 ms | 3239 ms | — |

<!-- facts:end -->

## What it does

Loads the typeahead data for a group post's comment box (`comet_group_typeahead_bootload`, from `groupID` and `postID`). It fired once, with the two mention requests, 3.2 s into a scroll inside an opened group post.

## What our machine does with it

Nothing in our machines reads it; it comes with a group post's comment box, opened by `openComments` (read only, rule 8).

## What can go wrong

None seen: one answer, 200 in 2190 ms. Nothing waits on it.
