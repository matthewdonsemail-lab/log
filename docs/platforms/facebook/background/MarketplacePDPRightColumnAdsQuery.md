# MarketplacePDPRightColumnAdsQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27876163185349836` |
| Path | `/api/graphql/` |
| Sends | `adsRelatedTo`, `browseContext`, `count`, `cursor`, `scale`, `__relay_internal__pv__GHLShouldChangeMarketplaceSponsoredDataFieldNamerelayprovider` |
| Reads | `viewer.marketplace_feed_stories` |
| Called from | `MarketplacePDPRightColumnAds.react` |
| rea | `ev_60c1ff17945c01c64f962c11cd4de230589c6861a2a0e6b369989fa6b189d159` |

Seen 3 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | scroll: -577px in 13 wheel steps, 859 ms | 1 | 200 | 2056 ms | 2392 ms | — |
| inspect | scroll: +978px in 22 wheel steps, 1531 ms | 1 | 200 | 1783 ms | 823 ms | — |
| inspect | step 25: openAny 1-3 x /marketplace/item/ | 1 | 200 | 1762 ms | 1236 ms | — |

<!-- facts:end -->

## What it does

Loads the sponsored listings in a Marketplace listing page's right column (`viewer.marketplace_feed_stories`, `adsRelatedTo` the listing open). It fired 3 times in 2 runs, 0.8-2.0 s into the step that opened a listing, with the listing's own requests.

## What our machine does with it

Nothing in our machines reads it; it comes with every listing `openListings` opens.

## What can go wrong

None seen: all three answered 200, the slowest of a listing's requests at 1762-2056 ms. Nothing waits on it.
