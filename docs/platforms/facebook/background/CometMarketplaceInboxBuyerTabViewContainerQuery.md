# CometMarketplaceInboxBuyerTabViewContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `37969822235938105` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer....CometMarketplaceInboxBuyerTabView_viewer` |
| Called from | `CometMarketplaceInboxBuyerTabViewContainer.react` |
| rea | `ev_0ba04ccc97b3a36dea9c7d1bc7fd39718afd5d2d4bca50d739399ea6403af44a` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /marketplace/inbox | 1 | 200 | 631 ms | 19340 ms | — |

<!-- facts:end -->

## What it does

The buyer tab of Marketplace's inbox: chats where the account is the buyer (`marketplaceInboxBuyerMessageThreads`). It fired as Bethlehem's inbox loaded and answered with no threads.

## What our machine does with it

Nothing reads it: the account sells, so the check reads only the seller tab (`CometMarketplaceInboxSellerTabThreadViewContainerQuery`).

## What can go wrong

None seen: one call, 200 in 631 ms. Nothing of ours depends on it.
