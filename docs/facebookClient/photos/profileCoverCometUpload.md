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
| rea | `ev_a631404acd6a1c9379e8fd595ae67fa4e530ad136dd93319d71de689beb89e89` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | upload: photo2.jpg handed to the file chooser | 1 | 200 | 1923 ms | 280 ms | — |
| inspect | upload: photo2.jpg handed to the file chooser | 1 | 200 | 3519 ms | 459 ms | — |

<!-- facts:end -->

## What it does

Uploads the chosen file for the cover photo.

## What our machine does with it

Fired by step 7 of the `profileSetup` flow (`log flow run profileSetup`, rule 31) (upload through "Upload photo").

## What can go wrong

A failed upload leaves no Save changes button; step 8 fails.
