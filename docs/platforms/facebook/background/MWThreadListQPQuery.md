# MWThreadListQPQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `26280754921508865` |
| Path | `/api/graphql/` |
| Sends | `__relay_internal__pv__MWThreadListQP_enableEBWebUXrelayprovider`, `__relay_internal__pv__MWEBNewUserOnboardingShouldLoadUpsellsrelayprovider` |
| Reads | `...MWThreadListQP_query` |
| Called from | `MWThreadListQP.react` |
| rea | `ev_fac3a4787d43e7e54b0b1e89f34f2fe7bb756024faabde3c30ea45217ba1e933` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 524 ms | 1354422 ms | — |

<!-- facts:end -->

## What it does

Promotions shown above Messenger's thread list (`MWThreadListQP`), including the encrypted-backups prompt when it is enabled. It fires when a thread list loads.

## What our machine does with it

Nothing reads it.

## What can go wrong

Seen only with 200. Failing, it only removes the promotion; the thread list itself comes from the inbox query.
