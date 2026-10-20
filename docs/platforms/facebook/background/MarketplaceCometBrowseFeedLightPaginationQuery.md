# MarketplaceCometBrowseFeedLightPaginationQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28542656938761266` |
| Path | `/api/graphql/` |
| Sends | `buyLocation`, `count`, `cursor`, `imageWidth`, `includePDPRelevantListings`, `mediaType`, `pdpListingId`, `radius`, `refinement`, `scale`, `sizing`, `useSDFPath`, `__relay_internal__pv__CometMarketplaceShouldShowTopPicksStrikethroughrelayprovider`, `__relay_internal__pv__GHLShouldChangeMarketplaceSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__MarketplaceCometAdmodulerelayprovider`, `__relay_internal__pv__CometMarketplaceShouldShowFeedShippingIconrelayprovider` |
| Reads | `...MarketplaceCometBrowseFeedLight_dataConnection` |
| Called from | `MarketplaceCometBrowseFeedLight_dataConnection.graphql` |
| rea | `ev_c9c7de1b79d034e7f938f30016315a3198c4572df25c449a968387bf049afa7d` |

Seen 10 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /marketplace/ | 4 | 200 | 2082–2951 ms | 6416–7692 ms | — |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1223 | 2 | 200 | 4323–4349 ms | 2864–8120 ms | — |
| inspect | step 2: waitRole link "…" | 2 | 200 | 3828–4805 ms | 3804–8264 ms | — |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1216 | 2 | 200 | 2562–9527 ms | 397–3665 ms | — |

<!-- facts:end -->

## What it does

Loads the next page of Marketplace's browse feed (the listings grid) when the view nears the bottom.

## What our machine does with it

Nothing. It fired when the idle mouse's loops reached the lower part of the Marketplace page and the feed loaded more. A person scrolling causes the same.

## What can go wrong

Harmless, but a sign the page is still live and reacting to the cursor. Its listings are where the account's Marketplace location shows (Bethlehem's feed was Lima, Peru).
