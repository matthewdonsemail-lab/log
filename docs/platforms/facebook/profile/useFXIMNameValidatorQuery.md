# useFXIMNameValidatorQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `26692801570319630` |
| Path | `/api/graphql/` |
| Sends | `identity_ids`, `first_name`, `last_name`, `middle_name`, `scale`, `platform` |
| Reads | — |
| Called from | `useFXIMNameValidator` |
| rea | `ev_e5bc448d13ac98520a0568e7d3a10b56643c4662f5f19b7227431f8ce1f3a789` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 12: clickRole button "…" | 2 | 200 | 608–924 ms | 636–662 ms | — |
| inspect | step 21: click e208 | 1 | 200 | 484 ms | 1274 ms | — |

<!-- facts:end -->

## What it does

Facebook's name check on Review change: whether the typed first name and surname are allowed (real-name rules, 60-day limit).

## What our machine does with it

Fired by step 12 of the `profileSetup` flow (`log flow run profileSetup`, rule 31). It passed for "Lancaster Trash" and "Bethlehem Trash".

## What can go wrong

A refused name (unusual words, capitals, a change within 60 days) shows an error instead of the preview; the run stops at s13 with nothing changed.
