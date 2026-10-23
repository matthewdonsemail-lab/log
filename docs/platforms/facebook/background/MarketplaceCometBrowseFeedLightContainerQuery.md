# MarketplaceCometBrowseFeedLightContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29127585736873863` |
| Path | `/api/graphql/` |
| Sends | `buyLocation`, `count`, `cursor`, `imageWidth`, `includePDPRelevantListings`, `mediaType`, `pdpListingId`, `radius`, `scale`, `sizing`, `useSDFPath`, `__relay_internal__pv__MarketplacePDPShouldShowLowerPriceItemsrelayprovider`, `__relay_internal__pv__CometMarketplaceShouldShowTopPicksStrikethroughrelayprovider`, `__relay_internal__pv__GHLShouldChangeMarketplaceSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__MarketplaceCometAdmodulerelayprovider`, `__relay_internal__pv__CometMarketplaceShouldShowFeedShippingIconrelayprovider` |
| Reads | `...MarketplaceCometBrowseFeedLight_dataConnection` |
| Called from | `MarketplaceCometBrowseFeedLightContainer.react` |
| rea | `ev_6262d6e01798f9af0af9be94bbffcf8baacc740da92854281e63d2bc6babc557` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 15: click e1354 | 1 | 200 | 4374 ms | 2366 ms | — |
| inspect | step 4: click e191 | 1 | 200 | 4827 ms | 2965 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 4341 ms | 479387 ms | — |

<!-- facts:end -->

## What it does

Loads the Marketplace browse feed (the listings grid) for the current location.

## What our machine does with it

Nothing; it fires on every Marketplace page load and after a location change. Its listings show where the account's Marketplace location is (Pittsburgh's were Harare, Zimbabwe).

## What can go wrong

Harmless.
