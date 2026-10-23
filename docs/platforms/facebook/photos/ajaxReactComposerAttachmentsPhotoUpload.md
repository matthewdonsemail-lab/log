# ajaxReactComposerAttachmentsPhotoUpload

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | photos |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/react_composer/attachments/photo/upload` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_75a8b0abe7503b1457d00b428d7bb9f43970a8ac125a37b072efbfe25dfa446a` |

Seen 5 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | upload: garbageRoom.jpg handed to the file chooser | 1 | 200 | 5129 ms | 3163 ms | — |
| inspect | upload: before.png handed to the file chooser | 2 | 200 | 4818–8502 ms | 1323–1358 ms | — |
| inspect | upload: after.png handed to the file chooser | 2 | 200 | 4708–5957 ms | 1313–1444 ms | — |

<!-- facts:end -->

## What it does

Uploads one photo (`upload.facebook.com/ajax/react_composer/attachments/photo/upload`). One request per photo, 1.3-7.3 s each; they start from 0.4 s to 9.4 s into the upload step.

## What our machine does with it

The publish machine sets the files, then waits on Facebook's own `N/10` counter (never a sleep). Each counter step is one of these finishing.

## What can go wrong

A slow proxy shows here first: 7 s for one photo. A non-200 means that photo is missing from the listing and the counter stops short: the machine must not go on to Publish. Not yet seen failing.
