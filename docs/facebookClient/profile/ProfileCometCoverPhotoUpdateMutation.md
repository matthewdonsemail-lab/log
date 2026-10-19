# ProfileCometCoverPhotoUpdateMutation

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | mutation |
| doc_id | `26648951184714383` |
| Path | `/api/graphql/` |
| Sends | `contextualProfileContext`, `input`, `scale` |
| Reads | `user_update_cover_photo.user` |
| Called from | `ProfileCometCoverPhotoUpdateMutation` |
| rea | `ev_98c5c58e7c28424266c5d67d0b0de87b80a4b503f78dba9725359198d149b5ef` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 8: clickRole button "…" | 2 | 200 | 2436–4382 ms | 718–1878 ms | — |
| inspect | step 12: click e1426 | 1 | 200 | 2658 ms | 411 ms | — |

<!-- facts:end -->

## What it does

Saves the uploaded cover photo at its position. 2.7 s on Lancaster, 2.4 s on Bethlehem.

## What our machine does with it

Confirms step 8 of the `profileSetup` flow (`log flow run profileSetup`, rule 31) (Save changes).

## What can go wrong

Not seen: the step fails and the run stops before the name. A profile that already has a cover shows "Edit cover photo", not "Add Cover Photo": step 6 then fails, and the flow needs a recording of that variant.
