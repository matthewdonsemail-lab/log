# profileCoverCometUpload

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | photos |
| Kind | endpoint |
| doc_id | — |
| Path | `/profile/cover/comet_upload/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_66a76962a850a8cf758c45ffa7f242dcd2ab7138b9b43a3bcf3867497d16f38b` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | upload: photo2.jpg handed to the file chooser | 2 | 200 | 1923–4496 ms | 280–575 ms | — |
| inspect | upload: photo2.jpg handed to the file chooser | 1 | 200 | 3519 ms | 459 ms | — |

<!-- facts:end -->

## What it does

Uploads the chosen file for the cover photo.

## What our machine does with it

Fired by step 7 of the `profileSetup` flow (`log flow run profileSetup`, rule 31) (upload through "Upload photo").

## What can go wrong

A failed upload leaves no Save changes button; step 8 fails.
