# GroupsCometPhotosRootQueryContainerQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `34206624742316139` |
| Path | `/api/graphql/` |
| Sends | `count`, `cursor`, `groupID`, `scale` |
| Reads | `group....GroupsCometMediaHeaderActions_group`, `group....GroupsCometMediaPhotosTabGrid_group` |
| Called from | `GroupsCometPhotosRootQueryContainer.react` |
| rea | `ev_d8645eda95670bf1d8f9460fbefd5deedbfbddd49a36917cee30edbaeb5da6df` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 8: clickRole tab "…" | 1 | 200 | 859 ms | 754 ms | — |

<!-- facts:end -->

## What it does

The Media tab (`GroupsCometPhotosRootQueryContainer.react`, `/groups/<id>/media`): by `groupID`, `count` and `cursor` it loads the first page of the group's photos grid and the header's actions (Add Photos/Video). In run 20261020T153648 step 8 it fired 0.8 s after the tab click, 859 ms, 200.

## What our machine does with it

No machine waits for it or reads it. The group read (`src/group/read`) stays on the Discussion tab and never opens this one. The flow [`groupTabs`](../flows/groupTabs.md) clicks the tab and waits for no request: a page-load query isn't a confirming request, only a mutation is (`confirmingRequest`). Its photos open the photo viewer (`CometPhotoRootContentQuery`).

## What can go wrong

Only a 200 has been seen, in one run. If it failed, the tab would show Facebook's own error panel instead of its content; the flow's click would still pass, and nothing on Facebook changes, since it only reads.
