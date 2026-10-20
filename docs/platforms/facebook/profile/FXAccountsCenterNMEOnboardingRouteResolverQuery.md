# FXAccountsCenterNMEOnboardingRouteResolverQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `27228655200056317` |
| Path | `/api/graphql/` |
| Sends | `id`, `entrypoint` |
| Reads | — |
| Called from | `FXAccountsCenterNMEOnboardingRouteResolver` |
| rea | `ev_83afc87699e047cbae824b01d0aff821b4a7a09d36da1996318ba98b1fad4e4c` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 9: goto /profiles/<id>/name | 2 | 200 | 467–1862 ms | 3034–8244 ms | — |

<!-- facts:end -->

## What it does

One of Accounts Center's route resolvers: when /profiles/<id>/name opens, Accounts Center resolves every section it can show (profiles, security, payments, ads, subscriptions...). This one: N M E Onboarding.

## What our machine does with it

Nothing waits for it: step 9 of the `profileSetup` flow (`log flow run profileSetup`, rule 31) opens the page, and step 10 waits for the "First name" field itself.

## What can go wrong

Harmless on its own. If the name page stops loading, these are the first requests to compare against the recording.
