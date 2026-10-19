# profilePictureUpload

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | endpoint |
| doc_id | — |
| Path | `/profile/picture/upload/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_da436d9adf335deb26d8b8a4cd242563b8370475123907f4dbe603c743bdf542` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 4: uploadRole button "…" | 1 | 200 | 2537 ms | 844 ms | — |
| inspect | step 4: upload e1180 | 1 | 200 | 3399 ms | 630 ms | — |

<!-- facts:end -->

## What it does

Uploads the chosen file for the profile picture before it is cropped.

## What our machine does with it

Fired by step 4 of the `profileSetup` flow (`log flow run profileSetup`, rule 31) (upload through "Upload Photo").

## What can go wrong

A failed upload leaves the crop dialog empty; Save never enables and step 5 fails.
