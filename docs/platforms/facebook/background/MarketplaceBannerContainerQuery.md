# MarketplaceBannerContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `36336015646043762` |
| Path | `/api/graphql/` |
| Sends | `params`, `scale` |
| Reads | `...MarketplaceBannerContainer_query` |
| Called from | `MarketplaceBannerContainer.react` |
| rea | `ev_381968d1c5011cfe91ef811cd87425592611ae2bb16d48689a668caffe2209d4` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: click e191 | 1 | 200 | 1283 ms | 2972 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 716 ms | 479391 ms | — |

<!-- facts:end -->

## What it does

The banner at the top of Marketplace's home (`MarketplaceBannerContainer.react`), loaded by `params`. It fired as Marketplace's home loaded (step 4).

## What our machine does with it

Nothing reads it: it is part of Marketplace's home loading.

## What can go wrong

None seen: one call, 200 in 1283 ms. A failure would only hide the banner.
