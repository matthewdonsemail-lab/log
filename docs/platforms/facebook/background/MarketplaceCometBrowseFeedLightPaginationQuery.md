# MarketplaceCometBrowseFeedLightPaginationQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27655263074150438` |
| Path | `/api/graphql/` |
| Sends | `buyLocation`, `count`, `cursor`, `imageWidth`, `includePDPRelevantListings`, `mediaType`, `pdpListingId`, `radius`, `refinement`, `scale`, `sizing`, `useSDFPath`, `__relay_internal__pv__MarketplacePDPShouldShowLowerPriceItemsrelayprovider`, `__relay_internal__pv__CometMarketplaceShouldShowTopPicksStrikethroughrelayprovider`, `__relay_internal__pv__GHLShouldChangeMarketplaceSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__MarketplaceCometAdmodulerelayprovider`, `__relay_internal__pv__CometMarketplaceShouldShowFeedShippingIconrelayprovider` |
| Reads | `...MarketplaceCometBrowseFeedLight_dataConnection` |
| Called from | `MarketplaceCometBrowseFeedLight_dataConnection.graphql` |
| rea | `ev_39467785ac779ed1db987a1df7fe6a2b6ac26588c33f988211911bebe2503a6a` |

Seen 4 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | scroll: +476px in 12 wheel steps, 562 ms | 1 | 200 | 2448 ms | 2885 ms | — |
| warmup | scroll: +301px in 7 wheel steps, 282 ms | 1 | 200 | 4779 ms | 3624 ms | — |
| warmup | scroll: +408px in 11 wheel steps, 547 ms | 1 | 200 | 2702 ms | 3572 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 2545 ms | 484794 ms | — |

<!-- facts:end -->

## What it does

Loads the next page of Marketplace's browse feed (the listings grid) when the view nears the bottom.

## What our machine does with it

Nothing. It fired when the idle mouse's loops reached the lower part of the Marketplace page and the feed loaded more. A person scrolling causes the same.

## What can go wrong

Harmless, but a sign the page is still live and reacting to the cursor. Its listings are where the account's Marketplace location shows (Bethlehem's feed was Lima, Peru).
