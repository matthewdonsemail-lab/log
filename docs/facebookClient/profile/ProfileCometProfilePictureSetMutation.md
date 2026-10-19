# ProfileCometProfilePictureSetMutation

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | mutation |
| doc_id | `29015178351504159` |
| Path | `/api/graphql/` |
| Sends | `input`, `isPage`, `isProfile`, `scale`, `__relay_internal__pv__ProfileGeminiIsCoinFlipEnabledrelayprovider` |
| Reads | `profile_picture_set.profile`, `profile_picture_set.viewer` |
| Called from | `ProfileCometProfilePictureSetMutation` |
| rea | `ev_409b69ae26722c3e8c9f70e8efae9b924fb93ae509d12e86b5289bc3f4d7a34c` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 5: clickRole button "…" | 1 | 200 | 5542 ms | 742 ms | — |
| inspect | step 6: click e1262 | 1 | 200 | 3395 ms | 646 ms | — |

<!-- facts:end -->

## What it does

Saves the uploaded, cropped photo as the profile picture. 3.4 s on Lancaster, 5.5 s on Bethlehem.

## What our machine does with it

Confirms step 5 of the `profileSetup` flow (`log flow run profileSetup`, rule 31): the Save click waits for this request; until it is seen the step is not done.

## What can go wrong

Not seen within the wait: the step fails (`expected request … was not sent`) and the run stops; the picture may or may not be set, so read the step's screenshot before running again.
