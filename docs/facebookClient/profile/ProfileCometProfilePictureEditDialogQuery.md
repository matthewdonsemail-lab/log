# ProfileCometProfilePictureEditDialogQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `27308360595486690` |
| Path | `/api/graphql/` |
| Sends | `scale` |
| Reads | `viewer....ProfileCometSelfProfilePictureMediaPicker_page`, `viewer....ProfileCometSelfProfilePictureMediaPicker_viewer`, `viewer.actor`, `...useFXIMCometProfilePhotoSyncReminderOnSaveHandler_fxim` |
| Called from | `ProfileCometProfilePictureEditDialog.react` |
| rea | `ev_a1594c4525f5cabce6e10584b06177b3d354c7298036ae632d76e561f54bb565` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 3: clickRole menuitem "…" | 2 | 200 | 378–800 ms | 577–606 ms | — |
| inspect | step 3: click e1096 | 1 | 200 | 399 ms | 791 ms | — |

<!-- facts:end -->

## What it does

Loads the "Choose profile picture" dialog (Upload Photo, Add Frame, earlier photos) when "Profile picture actions" → "Choose profile picture" is clicked.

## What our machine does with it

Step 3 of the `profileSetup` flow (`log flow run profileSetup`, rule 31): the click on menuitem "Choose profile picture" fires it; the next step waits for button "Upload Photo" in the dialog it draws.

## What can go wrong

If it fails, the dialog never draws and step 4 times out looking for "Upload Photo": the run ends at s04 with nothing changed.
