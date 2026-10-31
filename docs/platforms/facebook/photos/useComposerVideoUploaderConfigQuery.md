# useComposerVideoUploaderConfigQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | photos |
| Kind | query |
| doc_id | `9734072893355148` |
| Path | `/api/graphql/` |
| Sends | `actorID`, `entryPoint`, `targetID` |
| Reads | `viewer.comet_composer_video_uploader_config` |
| Called from | `useComposerVideoUploaderConfig` |
| rea | `ev_43e51478f73ac5653f4e10a6464c2536c9382842eb7ac8bcce0c9468f6d2c58a` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | upload: garbageRoom.jpg handed to the file chooser | 1 | 200 | 1533 ms | 45 ms | — |

<!-- facts:end -->

## What it does

Loads the composer's media uploader settings for the account and target (`viewer.comet_composer_video_uploader_config`), sent as Photo/video hands a file to the composer: 45 ms into the upload step on run 20261020T162343 (1533 ms).

## What our machine does with it

The `profilePhotoPost` flow's upload step sends it on its own; nothing waits for it. The photo itself goes up through `/ajax/react_composer/attachments/photo/upload` (5129 ms on the run), before Post is enabled.

## What can go wrong

None seen. If it failed the composer could not take the file, and the flow's Post step would find no photo to post.
