# FXAccountsCenterPersonalCentralIdentityDialogV2Query

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `26340622508960905` |
| Path | `/api/graphql/` |
| Sends | `identity_id`, `interface`, `platform`, `scale` |
| Reads | — |
| Called from | `FXAccountsCenterPersonalCentralIdentityDialogV2.react` |
| rea | `ev_db7f6ed0a549a1eb468bf9ce512e287ce7553d3c8a0100f128e6a958c4479a78` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 13: clickRole button "…" | 2 | 200 | 524–1164 ms | 2758–6053 ms | — |
| inspect | now on /profiles/<id>/name "…" after 2328 ms; 0 request(s) | 1 | 200 | 520 ms | 1482 ms | — |

<!-- facts:end -->

## What it does

Loads the profile's identity card in Accounts Center (name, username, avatar) after the name is saved.

## What our machine does with it

Nothing: it follows `useFXIMUpdateNameMutation`.

## What can go wrong

Harmless; it shows the new name.
