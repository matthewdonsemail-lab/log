# FXAccountsCenterProfilesPageV2RouteResolverQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `25028621296822693` |
| Path | `/api/graphql/` |
| Sends | `params` |
| Reads | — |
| Called from | `FXAccountsCenterProfilesPageV2RouteResolver` |
| rea | `ev_99f8f69f21b60969abf0da9379840c47ac5f52d810b8d1b3ec025cabdae10037` |

Seen 6 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 9: goto /profiles/<id>/name | 4 | 200 | 322–945 ms | 2939–10548 ms | — |
| inspect | step 14: goto /profiles/<id>/name | 2 | 200 | 375–578 ms | 3967–5117 ms | — |

<!-- facts:end -->

## What it does

One of Accounts Center's route resolvers: when /profiles/<id>/name opens, Accounts Center resolves every section it can show (profiles, security, payments, ads, subscriptions...). This one: Profiles Page V2.

## What our machine does with it

Nothing waits for it: step 9 of the `profileSetup` flow (`log flow run profileSetup`, rule 31) opens the page, and step 10 waits for the "First name" field itself.

## What can go wrong

Harmless on its own. If the name page stops loading, these are the first requests to compare against the recording.
