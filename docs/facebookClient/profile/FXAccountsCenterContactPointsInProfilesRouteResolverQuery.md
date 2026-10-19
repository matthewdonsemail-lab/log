# FXAccountsCenterContactPointsInProfilesRouteResolverQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `24648808718130740` |
| Path | `/api/graphql/` |
| Sends | `id` |
| Reads | — |
| Called from | `FXAccountsCenterContactPointsInProfilesRouteResolver` |
| rea | `ev_0742b4d59d3cead9bdaa1338900353fb9ddf2cf9c9dae7526c971947075e0165` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 9: goto /profiles/<id>/name | 1 | 200 | 353 ms | 2939 ms | — |
| inspect | step 14: goto /profiles/<id>/name | 1 | 200 | 592 ms | 3971 ms | — |

<!-- facts:end -->

## What it does

One of Accounts Center's route resolvers: when /profiles/<id>/name opens, Accounts Center resolves every section it can show (profiles, security, payments, ads, subscriptions...). This one: Contact Points In Profiles.

## What our machine does with it

Nothing waits for it: step 9 of the `profileSetup` flow (`log flow run profileSetup`, rule 31) opens the page, and step 10 waits for the "First name" field itself.

## What can go wrong

Harmless on its own. If the name page stops loading, these are the first requests to compare against the recording.
