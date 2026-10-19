# useFXIMUpdateNameMutation

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `9538143859625836` |
| Path | `/api/graphql/` |
| Sends | `client_mutation_id`, `family_device_id`, `identity_ids`, `full_name`, `first_name`, `middle_name`, `last_name`, `interface` |
| Reads | — |
| Called from | `useFXIMUpdateName` |
| rea | `ev_0cb10e66e3b1d3f88e333bbb826fc7a9fbef67de807436e86a26073912dafea0` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 13: clickRole button "…" | 2 | 200 | 1539–4359 ms | 424–539 ms | — |
| inspect | step 23: click e317 | 1 | 200 | 2389 ms | 505 ms | — |

<!-- facts:end -->

## What it does

Saves the new name on the profile. 2.4 s on Lancaster, 1.5 s on Bethlehem.

## What our machine does with it

Confirms step 13 of the `profileSetup` flow (`log flow run profileSetup`, rule 31) (Done). After it the name cannot be changed again for 60 days.

## What can go wrong

Not seen: the step fails; the name page's own state says whether it saved.
