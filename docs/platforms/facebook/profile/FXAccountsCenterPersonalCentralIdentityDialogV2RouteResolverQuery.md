# FXAccountsCenterPersonalCentralIdentityDialogV2RouteResolverQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `9662354087186434` |
| Path | `/api/graphql/` |
| Sends | `entrypoint`, `id` |
| Reads | — |
| Called from | `FXAccountsCenterPersonalCentralIdentityDialogV2RouteResolver` |
| rea | `ev_2872f274fac3ffd912799886da4eda0dfb3f8bc8b8c2ebd692e261ee8e7344a1` |

Seen 6 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 9: goto /profiles/<id>/name | 2 | 200 | 366–1510 ms | 2939–8230 ms | — |
| flow | step 13: clickRole button "…" | 2 | 200 | 328–676 ms | 2389–5329 ms | — |
| inspect | step 14: goto /profiles/<id>/name | 1 | 200 | 583 ms | 3971 ms | — |
| inspect | a step (older run, split by its report lines) | 1 | 200 | 423 ms | 1007 ms | — |

<!-- facts:end -->

## What it does

One of Accounts Center's route resolvers: when /profiles/<id>/name opens, Accounts Center resolves every section it can show (profiles, security, payments, ads, subscriptions...). This one: Personal Central Identity Dialog V2.

## What our machine does with it

Nothing waits for it: step 9 of the `profileSetup` flow (`log flow run profileSetup`, rule 31) opens the page, and step 10 waits for the "First name" field itself.

## What can go wrong

Harmless on its own. If the name page stops loading, these are the first requests to compare against the recording.
