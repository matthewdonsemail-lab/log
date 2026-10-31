# FXAccountsCenterSubscriptionsRouteResolverQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `25971034499189586` |
| Path | `/api/graphql/` |
| Sends | `id` |
| Reads | — |
| Called from | `FXAccountsCenterSubscriptionsRouteResolver` |
| rea | `ev_f3fb63fcd9b16d264a560c30cb33acd9b8ba0681e1f9e3e0cba0c2b63a947dec` |

Seen 4 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 9: goto /profiles/<id>/name | 3 | 200 | 505–1617 ms | 3001–10117 ms | — |
| inspect | step 14: goto /profiles/<id>/name | 1 | 200 | 597 ms | 3970 ms | — |

<!-- facts:end -->

## What it does

One of Accounts Center's route resolvers: when /profiles/<id>/name opens, Accounts Center resolves every section it can show (profiles, security, payments, ads, subscriptions...). This one: Subscriptions.

## What our machine does with it

Nothing waits for it: step 9 of the `profileSetup` flow (`log flow run profileSetup`, rule 31) opens the page, and step 10 waits for the "First name" field itself.

## What can go wrong

Harmless on its own. If the name page stops loading, these are the first requests to compare against the recording.
