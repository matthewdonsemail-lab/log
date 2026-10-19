# FXAccountsCenterBirthdayRouteResolverQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `26858654473730040` |
| Path | `/api/graphql/` |
| Sends | `id` |
| Reads | — |
| Called from | `FXAccountsCenterBirthdayRouteResolver` |
| rea | `ev_456ab1ec3c706706ddefabc99ffa27f3b67dd2f399885750f9c052d5850448a7` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 9: goto /profiles/<id>/name | 1 | 200 | 337 ms | 2940 ms | — |
| inspect | step 14: goto /profiles/<id>/name | 1 | 200 | 575 ms | 3974 ms | — |

<!-- facts:end -->

## What it does

One of Accounts Center's route resolvers: when /profiles/<id>/name opens, Accounts Center resolves every section it can show (profiles, security, payments, ads, subscriptions...). This one: Birthday.

## What our machine does with it

Nothing waits for it: step 9 of the `profileSetup` flow (`log flow run profileSetup`, rule 31) opens the page, and step 10 waits for the "First name" field itself.

## What can go wrong

Harmless on its own. If the name page stops loading, these are the first requests to compare against the recording.
