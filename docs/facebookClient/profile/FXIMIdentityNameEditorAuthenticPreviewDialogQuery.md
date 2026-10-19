# FXIMIdentityNameEditorAuthenticPreviewDialogQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `26302360049350115` |
| Path | `/api/graphql/` |
| Sends | `first_name`, `last_name`, `middle_name`, `platform`, `scale` |
| Reads | — |
| Called from | `FXIMIdentityNameEditorAuthenticPreviewDialog.react` |
| rea | `ev_6def84c3bc051cc4e8f37c4691933c7ab7c352a7f8491d7c091892961d66994c` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 12: clickRole button "…" | 2 | 200 | 503–908 ms | 1297–1581 ms | — |
| inspect | step 21: click e208 | 1 | 200 | 465 ms | 1781 ms | — |

<!-- facts:end -->

## What it does

Loads the "Preview Your New Name" step: the name orders to choose from ("Bethlehem Trash" / "Trash Bethlehem").

## What our machine does with it

Fired by step 12 of the `profileSetup` flow (`log flow run profileSetup`, rule 31) (Review change); step 13 then clicks Done, keeping the order Facebook selects first.

## What can go wrong

If the name check refused the name, this does not load and Done never appears: the run stops at s13.
