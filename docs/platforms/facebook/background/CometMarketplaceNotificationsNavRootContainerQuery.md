# CometMarketplaceNotificationsNavRootContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27783648784560601` |
| Path | `/api/graphql/` |
| Sends | `count`, `cursor`, `isCOBMOB`, `scale` |
| Reads | `viewer....CometMarketplaceNotificationsNavRoot_viewer` |
| Called from | `CometMarketplaceNotificationsNavRootContainer.react` |
| rea | `ev_e58f84cfc23339511ca5d0163d1a9cb012c36fd7a2e482589c493777d0a5bf96` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 740 ms | 472595 ms | — |

<!-- facts:end -->

## What it does

Marketplace's notifications list in the side navigation (`count`, `cursor`): offers, messages and listing updates Facebook shows the seller. It fires on Marketplace pages that carry the notifications rail (here on the inbox step, 8 minutes in).

## What our machine does with it

Nothing reads it. A buyer's message is read from the seller inbox (`CometMarketplaceInboxContentContainerQuery`), not from notifications.

## What can go wrong

Seen only with 200. Failing, it only empties the notifications rail; no step waits on it.
