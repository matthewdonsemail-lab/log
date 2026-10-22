# MarketplaceCometBrowseFeedLightContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28602662802759552` |
| Path | `/api/graphql/` |
| Sends | `buyLocation`, `count`, `cursor`, `imageWidth`, `includePDPRelevantListings`, `mediaType`, `pdpListingId`, `radius`, `scale`, `sizing`, `useSDFPath`, `__relay_internal__pv__CometMarketplaceShouldShowTopPicksStrikethroughrelayprovider`, `__relay_internal__pv__GHLShouldChangeMarketplaceSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__MarketplaceCometAdmodulerelayprovider`, `__relay_internal__pv__CometMarketplaceShouldShowFeedShippingIconrelayprovider` |
| Reads | `...MarketplaceCometBrowseFeedLight_dataConnection` |
| Called from | `MarketplaceCometBrowseFeedLightContainer.react` |
| rea | `ev_83c413e59250868ebd601b09b7d587209f5e7d646d60ded20f7458f27abc10c5` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 15: click e1354 | 1 | 200 | 4374 ms | 2366 ms | — |

<!-- facts:end -->

## What it does

Loads the Marketplace browse feed (the listings grid) for the current location.

## What our machine does with it

Nothing; it fires on every Marketplace page load and after a location change. Its listings show where the account's Marketplace location is (Pittsburgh's were Harare, Zimbabwe).

## What can go wrong

Harmless.
