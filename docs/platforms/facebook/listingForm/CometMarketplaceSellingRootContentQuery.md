# CometMarketplaceSellingRootContentQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | listingForm |
| Kind | query |
| doc_id | `28536703559357267` |
| Path | `/api/graphql/` |
| Sends | `includeSellerCompliance`, `scale` |
| Reads | `viewer....MarketplaceCometFeatureAccessProvider_viewer`, `viewer....MarketplaceYourAccountLeftRail_viewer`, `viewer....useYouSubNavConfig_viewer`, `viewer....useCometMarketplaceSellingRootHeader_viewer` |
| Called from | `CometMarketplaceSellingRootContent.react` |
| rea | `ev_a8fc692ec81fda7e31eaa01f9cb8f5fedf563c1195f890aaccc01e8a4d29106e` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 452 ms | 494386 ms | — |

<!-- facts:end -->

## What it does

The Selling area's frame: the left rail (`MarketplaceYourAccountLeftRail`), its sub-navigation and header, the account's Marketplace feature access (`MarketplaceCometFeatureAccessProvider`) and, with `includeSellerCompliance`, the seller-compliance state. It fires when a Selling page is opened in the browser (here while the inbox step was open, 8 minutes in).

## What our machine does with it

Nothing reads it yet. Whether the account may sell is read from `/marketplace/status` (`CometMarketplaceStatusContentContainerQuery`), which says it directly; this query's feature access could back it up if that page ever fails to load.

## What can go wrong

Seen only with 200. A missing or failed answer would leave the Selling frame empty, and the listings query beside it is what the check depends on.
