# MarketplaceCometBrowseFeedLightPaginationQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28980683528217734` |
| Path | `/api/graphql/` |
| Sends | `buyLocation`, `count`, `cursor`, `imageWidth`, `includePDPRelevantListings`, `mediaType`, `pdpListingId`, `radius`, `refinement`, `scale`, `sizing`, `useSDFPath`, `__relay_internal__pv__MarketplacePDPShouldShowLowerPriceItemsrelayprovider`, `__relay_internal__pv__CometMarketplaceShouldShowTopPicksStrikethroughrelayprovider`, `__relay_internal__pv__GHLShouldChangeMarketplaceSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__MarketplaceCometAdmodulerelayprovider`, `__relay_internal__pv__CometMarketplaceShouldShowFeedShippingIconrelayprovider` |
| Reads | `...MarketplaceCometBrowseFeedLight_dataConnection` |
| Called from | `MarketplaceCometBrowseFeedLight_dataConnection.graphql` |
| rea | `ev_0b2cc9b99182cd7370ff9ff11c8ca2ec224c407d5dd02c15b1aa55916f4eead6` |

Seen 5 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | scroll: +476px in 12 wheel steps, 562 ms | 1 | 200 | 2448 ms | 2885 ms | — |
| warmup | scroll: +301px in 7 wheel steps, 282 ms | 1 | 200 | 4779 ms | 3624 ms | — |
| warmup | scroll: +408px in 11 wheel steps, 547 ms | 1 | 200 | 2702 ms | 3572 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 2545 ms | 484794 ms | — |
| warmup | openAny: read /marketplace/item/<id>/ | 1 | 200 | 2513 ms | 135 ms | — |

<!-- facts:end -->

## What it does

Loads the next page of Marketplace's browse feed (the listings grid) when the view nears the bottom.

## What our machine does with it

Nothing. It fired when the idle mouse's loops reached the lower part of the Marketplace page and the feed loaded more. A person scrolling causes the same.

## What can go wrong

Harmless, but a sign the page is still live and reacting to the cursor. Its listings are where the account's Marketplace location shows (Bethlehem's feed was Lima, Peru).
