# FXAccountsCenterIdentityUsernameSettingsDialogRouteResolverQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `31871199219130487` |
| Path | `/api/graphql/` |
| Sends | `entrypoint`, `identity_id` |
| Reads | — |
| Called from | `FXAccountsCenterIdentityUsernameSettingsDialogRouteResolver` |
| rea | `ev_70b268939cafae61f884213477040aeb0c32af8941e2429ec84aeeb8e35f7abf` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 13: clickRole button "…" | 2 | 200 | 346–700 ms | 3372–7281 ms | — |
| inspect | a step (older run, split by its report lines) | 1 | 200 | 399 ms | 2120 ms | — |

<!-- facts:end -->

## What it does

One of Accounts Center's route resolvers: when /profiles/<id>/name opens, Accounts Center resolves every section it can show (profiles, security, payments, ads, subscriptions...). This one: Identity Username Settings Dialog.

## What our machine does with it

Nothing waits for it: step 9 of the `profileSetup` flow (`log flow run profileSetup`, rule 31) opens the page, and step 10 waits for the "First name" field itself.

## What can go wrong

Harmless on its own. If the name page stops loading, these are the first requests to compare against the recording.
