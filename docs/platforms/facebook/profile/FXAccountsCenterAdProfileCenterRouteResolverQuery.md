# FXAccountsCenterAdProfileCenterRouteResolverQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `26058491970480499` |
| Path | `/api/graphql/` |
| Sends | `interface` |
| Reads | — |
| Called from | `FXAccountsCenterAdProfileCenterRouteResolver` |
| rea | `ev_da9b1589f803ae17ac0e2788873e64690c137c904a755e8d755e068c81e3d3dc` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 9: goto /profiles/<id>/name | 2 | 200 | 535–1196 ms | 2995–8213 ms | — |
| inspect | step 14: goto /profiles/<id>/name | 1 | 200 | 384 ms | 3969 ms | — |

<!-- facts:end -->

## What it does

One of Accounts Center's route resolvers: when /profiles/<id>/name opens, Accounts Center resolves every section it can show (profiles, security, payments, ads, subscriptions...). This one: Ad Profile Center.

## What our machine does with it

Nothing waits for it: step 9 of the `profileSetup` flow (`log flow run profileSetup`, rule 31) opens the page, and step 10 waits for the "First name" field itself.

## What can go wrong

Harmless on its own. If the name page stops loading, these are the first requests to compare against the recording.
