# FXAccountsCenterIdentityPhotoEditorDialogRouteResolverQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `29096276570020893` |
| Path | `/api/graphql/` |
| Sends | `identity_id` |
| Reads | — |
| Called from | `FXAccountsCenterIdentityPhotoEditorDialogRouteResolver` |
| rea | `ev_b7e02bc68f295caa97728276e52c2115b94b0f48b9c4637033921ff54ace38f8` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 13: clickRole button "…" | 1 | 200 | 1224 ms | 8551 ms | — |

<!-- facts:end -->

## What it does

Accounts Center resolving its profile-photo editor dialog after the name was saved.

## What our machine does with it

Nothing; it follows `useFXIMUpdateNameMutation` when Accounts Center redraws the identity card (name, username, photo).

## What can go wrong

Harmless.
