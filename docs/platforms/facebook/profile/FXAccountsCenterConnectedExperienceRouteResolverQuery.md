# FXAccountsCenterConnectedExperienceRouteResolverQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `9653997741349710` |
| Path | `/api/graphql/` |
| Sends | `id` |
| Reads | — |
| Called from | `FXAccountsCenterConnectedExperienceRouteResolver` |
| rea | `ev_dd3fc180783789039baeece2abe1ddc68b2f8db38583030c42a8ee07ad702fda` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 9: goto /profiles/<id>/name | 2 | 200 | 351–1032 ms | 2988–8203 ms | — |
| inspect | step 14: goto /profiles/<id>/name | 1 | 200 | 387 ms | 3968 ms | — |

<!-- facts:end -->

## What it does

One of Accounts Center's route resolvers: when /profiles/<id>/name opens, Accounts Center resolves every section it can show (profiles, security, payments, ads, subscriptions...). This one: Connected Experience.

## What our machine does with it

Nothing waits for it: step 9 of the `profileSetup` flow (`log flow run profileSetup`, rule 31) opens the page, and step 10 waits for the "First name" field itself.

## What can go wrong

Harmless on its own. If the name page stops loading, these are the first requests to compare against the recording.
