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

Seen 13 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | scroll: +127px in 4 wheel steps, 125 ms | 1 | 200 | 3017 ms | 2121 ms | — |
| warmup | scroll: -605px in 14 wheel steps, 687 ms | 1 | 200 | 1685 ms | 1694 ms | — |
| warmup | step 10: openAny 2-4 x /marketplace/item/ | 2 | 200 | 2725–3827 ms | 251–2099 ms | — |
| warmup | openAny: read /marketplace/item/<id>/ | 1 | 200 | 1492 ms | 3303 ms | — |
| warmup | scroll: -756px in 16 wheel steps, 656 ms | 1 | 200 | 2050 ms | 689 ms | — |
| inspect | scroll: -577px in 13 wheel steps, 859 ms | 1 | 200 | 2056 ms | 2392 ms | — |
| inspect | scroll: +978px in 22 wheel steps, 1531 ms | 1 | 200 | 1783 ms | 823 ms | — |
| inspect | step 25: openAny 1-3 x /marketplace/item/ | 1 | 200 | 1762 ms | 1236 ms | — |
| inspect | scroll: +161px in 5 wheel steps, 250 ms | 1 | 200 | 1918 ms | 1885 ms | — |
| inspect | scroll: -161px in 5 wheel steps, 172 ms | 1 | 200 | 1987 ms | 702 ms | — |
| warmup | scroll: -1034px in 22 wheel steps, 1032 ms | 1 | 200 | 1932 ms | 802 ms | — |
| warmup | scroll: +981px in 24 wheel steps, 1672 ms | 1 | 200 | 1839 ms | 2047 ms | — |

<!-- facts:end -->

## What it does

Loads the sponsored listings in a Marketplace listing page's right column (`viewer.marketplace_feed_stories`, `adsRelatedTo` the listing open). It fired 3 times in 2 runs, 0.8-2.0 s into the step that opened a listing, with the listing's own requests.

## What our machine does with it

Nothing in our machines reads it; it comes with every listing `openListings` opens.

## What can go wrong

None seen: all three answered 200, the slowest of a listing's requests at 1762-2056 ms. Nothing waits on it.
