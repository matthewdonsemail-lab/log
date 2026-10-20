# FXAccountsCenterManageAccountsPageRouteResolverQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `25440293895572873` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | — |
| Called from | `FXAccountsCenterManageAccountsPageRouteResolver` |
| rea | `ev_4f8520d22a0c6562b05933fb25787eb600d806fc137f86c17cc90f29e6ca4590` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 9: goto /profiles/<id>/name | 2 | 200 | 468–1376 ms | 3006–8227 ms | — |
| inspect | step 14: goto /profiles/<id>/name | 1 | 200 | 589 ms | 3970 ms | — |

<!-- facts:end -->

## What it does

One of Accounts Center's route resolvers: when /profiles/<id>/name opens, Accounts Center resolves every section it can show (profiles, security, payments, ads, subscriptions...). This one: Manage Accounts Page.

## What our machine does with it

Nothing waits for it: step 9 of the `profileSetup` flow (`log flow run profileSetup`, rule 31) opens the page, and step 10 waits for the "First name" field itself.

## What can go wrong

Harmless on its own. If the name page stops loading, these are the first requests to compare against the recording.
