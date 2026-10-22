# GroupsCometFilesTabRootQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `23889300290699369` |
| Path | `/api/graphql/` |
| Sends | `groupDocsFileName`, `groupID`, `orderby`, `scale` |
| Reads | `group....GroupsCometSharedFilesSection_group` |
| Called from | `GroupsCometFilesTabRoot.react` |
| rea | `ev_971164af79e8ba27ef101ad526d59e929aa810ad07712c193b505555dbc29222` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 9: clickRole tab "…" | 1 | 200 | 679 ms | 744 ms | — |

<!-- facts:end -->

## What it does

The Files tab (`GroupsCometFilesTabRoot.react`, `/groups/<id>/files/files`): by `groupID`, a file name filter and an order it loads the group's shared files. In run 20261020T153648 step 9 it fired 0.7 s after the tab click, 679 ms, 200 (this group has no files listed).

## What our machine does with it

No machine waits for it or reads it. The group read (`src/facebook/group/read`) stays on the Discussion tab and never opens this one. The flow [`groupTabs`](../flows/groupTabs.md) clicks the tab and waits for no request: a page-load query isn't a confirming request, only a mutation is (`confirmingRequest`).

## What can go wrong

Only a 200 has been seen, in one run. If it failed, the tab would show Facebook's own error panel instead of its content; the flow's click would still pass, and nothing on Facebook changes, since it only reads.
