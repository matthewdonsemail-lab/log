# CometPhotoTagLayerQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | photos |
| Kind | query |
| doc_id | `27235156412850779` |
| Path | `/api/graphql/` |
| Sends | `nodeID`, `scale` |
| Reads | `node` |
| Called from | `CometPhotoTagLayer.react` |
| rea | `ev_1a3732549173b6461ce7b1908b39028cd2cd7d3993124cb1cb6093c5675e1698` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | scroll: +705px in 15 wheel steps, 656 ms | 1 | 200 | 1586 ms | 775 ms | — |

<!-- facts:end -->

## What it does

The tags drawn over a photo in the viewer (`CometPhotoTagLayer.react`): by `nodeID` it loads who or what is tagged in it. In run 20261020T153648 step 43 it fired 0.8 s after the step began, 1586 ms, 200, with `CometPhotoRootContentQuery`.

## What our machine does with it

No machine waits for it or reads it. It comes with the photo viewer; see `CometPhotoRootContentQuery`.

## What can go wrong

Only a 200 has been seen, in one run. If it failed, only the photo's tags would be missing.
