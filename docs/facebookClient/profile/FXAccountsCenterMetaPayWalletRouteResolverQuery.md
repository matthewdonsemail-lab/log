# FXAccountsCenterMetaPayWalletRouteResolverQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `9760897800669508` |
| Path | `/api/graphql/` |
| Sends | `id` |
| Reads | — |
| Called from | `FXAccountsCenterMetaPayWalletRouteResolver` |
| rea | `ev_1116046bfde1de283d35f1b8760021d982506b6bf2a0fc819e40880ad7afb2be` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 9: goto /profiles/<id>/name | 2 | 200 | 482–1341 ms | 2999–8219 ms | — |
| inspect | step 14: goto /profiles/<id>/name | 1 | 200 | 377 ms | 3969 ms | — |

<!-- facts:end -->

## What it does

One of Accounts Center's route resolvers: when /profiles/<id>/name opens, Accounts Center resolves every section it can show (profiles, security, payments, ads, subscriptions...). This one: Meta Pay Wallet.

## What our machine does with it

Nothing waits for it: step 9 of the `profileSetup` flow (`log flow run profileSetup`, rule 31) opens the page, and step 10 waits for the "First name" field itself.

## What can go wrong

Harmless on its own. If the name page stops loading, these are the first requests to compare against the recording.
