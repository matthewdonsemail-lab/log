# FXAccountsCenterIdentityUsernameEditDialogRouteResolverQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `9392348324209963` |
| Path | `/api/graphql/` |
| Sends | `identity_id` |
| Reads | — |
| Called from | `FXAccountsCenterIdentityUsernameEditDialogRouteResolver` |
| rea | `ev_6d22e7b8d5171ce19f000614650e773190ba3edb56962690b4a80cb3076f5808` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 13: clickRole button "…" | 2 | 200 | 349–734 ms | 3727–7991 ms | — |
| inspect | now on /profiles/<id>/name "…" after 2328 ms; 0 request(s) | 1 | 200 | 431 ms | 2529 ms | — |

<!-- facts:end -->

## What it does

One of Accounts Center's route resolvers: when /profiles/<id>/name opens, Accounts Center resolves every section it can show (profiles, security, payments, ads, subscriptions...). This one: Identity Username Edit Dialog.

## What our machine does with it

Nothing waits for it: step 9 of the `profileSetup` flow (`log flow run profileSetup`, rule 31) opens the page, and step 10 waits for the "First name" field itself.

## What can go wrong

Harmless on its own. If the name page stops loading, these are the first requests to compare against the recording.
