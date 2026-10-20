# FXAccountsCenterYourAccountPageRouteResolverQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `25476192715316281` |
| Path | `/api/graphql/` |
| Sends | `params` |
| Reads | — |
| Called from | `FXAccountsCenterYourAccountPageRouteResolver` |
| rea | `ev_f297d51776441cbe6c761ac2d666df2848ac101c02646a8dc30b6abefce74ddc` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 9: goto /profiles/<id>/name | 2 | 200 | 336–749 ms | 3517–9789 ms | — |
| inspect | step 14: goto /profiles/<id>/name | 1 | 200 | 467 ms | 4638 ms | — |

<!-- facts:end -->

## What it does

One of Accounts Center's route resolvers: when /profiles/<id>/name opens, Accounts Center resolves every section it can show (profiles, security, payments, ads, subscriptions...). This one: Your Account Page.

## What our machine does with it

Nothing waits for it: step 9 of the `profileSetup` flow (`log flow run profileSetup`, rule 31) opens the page, and step 10 waits for the "First name" field itself.

## What can go wrong

Harmless on its own. If the name page stops loading, these are the first requests to compare against the recording.
