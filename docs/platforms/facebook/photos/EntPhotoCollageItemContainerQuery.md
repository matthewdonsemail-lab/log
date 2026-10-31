# EntPhotoCollageItemContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | photos |
| Kind | query |
| doc_id | `9831027213684486` |
| Path | `/api/graphql/` |
| Sends | `id`, `scale` |
| Reads | `node` |
| Called from | `EntPhotoCollageItemContainer.react` |
| rea | `ev_419dbaa7bf65cd0a31ebaad2ad3a070e1eefc5a2ee0345af9dcf5714b9f6e8ae` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | upload: garbageRoom.jpg handed to the file chooser | 1 | 200 | 371 ms | 6901 ms | — |

<!-- facts:end -->

## What it does

Loads the uploaded photo's preview in the composer (`node`, by the uploaded photo's id), once the upload finished on run 20261020T162343 (371 ms).

## What our machine does with it

Not waited for by our machines; it is how the composer shows the photo before Post.

## What can go wrong

None seen.
