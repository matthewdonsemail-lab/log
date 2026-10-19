# ajaxReactComposerAttachmentsPhotoUpload

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | photos |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/react_composer/attachments/photo/upload` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_d305da21137d63aca31dfc5058cf39457cd998d7acb5a918458dd87a81cf164e` |

Seen 34 time(s) in 8 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Uploading 5 photo(s) | 30 | 200 | 1646–7281 ms | 421–9350 ms | — |
| publish | Uploading 2 photo(s) | 4 | 200 | 1336–2672 ms | 353–724 ms | — |

<!-- facts:end -->

## What it does

Uploads one photo (`upload.facebook.com/ajax/react_composer/attachments/photo/upload`). One request per photo, 1.3-7.3 s each; they start from 0.4 s to 9.4 s into the upload step.

## What our machine does with it

The publish machine sets the files, then waits on Facebook's own `N/10` counter (never a sleep). Each counter step is one of these finishing.

## What can go wrong

A slow proxy shows here first: 7 s for one photo. A non-200 means that photo is missing from the listing and the counter stops short: the machine must not go on to Publish. Not yet seen failing.
