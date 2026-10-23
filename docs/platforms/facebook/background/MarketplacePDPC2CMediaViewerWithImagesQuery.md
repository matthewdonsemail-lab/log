# MarketplacePDPC2CMediaViewerWithImagesQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `10059604367394414` |
| Path | `/api/graphql/` |
| Sends | `imageContext`, `targetId` |
| Reads | `viewer.marketplace_product_details_page` |
| Called from | `MarketplacePDPC2CMediaViewerWithImagesQuery.react` |
| rea | `ev_d19547c947d1ed9edc723be26989de28ee93ca5425cd34a5443cfad49621a338` |

Seen 13 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | scroll: +127px in 4 wheel steps, 125 ms | 1 | 200 | 1332 ms | 2117 ms | — |
| warmup | scroll: -605px in 14 wheel steps, 687 ms | 1 | 200 | 377 ms | 1686 ms | — |
| warmup | step 10: openAny 2-4 x /marketplace/item/ | 2 | 200 | 1316–1393 ms | 248–2097 ms | — |
| warmup | openAny: read /marketplace/item/<id>/ | 1 | 200 | 390 ms | 3299 ms | — |
| warmup | scroll: -756px in 16 wheel steps, 656 ms | 1 | 200 | 410 ms | 684 ms | — |
| inspect | scroll: -577px in 13 wheel steps, 859 ms | 1 | 200 | 524 ms | 2389 ms | — |
| inspect | scroll: +978px in 22 wheel steps, 1531 ms | 1 | 200 | 527 ms | 819 ms | — |
| inspect | step 25: openAny 1-3 x /marketplace/item/ | 1 | 200 | 499 ms | 1231 ms | — |
| inspect | scroll: +161px in 5 wheel steps, 250 ms | 1 | 200 | 462 ms | 1884 ms | — |
| inspect | scroll: -161px in 5 wheel steps, 172 ms | 1 | 200 | 413 ms | 697 ms | — |
| warmup | scroll: -1034px in 22 wheel steps, 1032 ms | 1 | 200 | 448 ms | 797 ms | — |
| warmup | scroll: +981px in 24 wheel steps, 1672 ms | 1 | 200 | 392 ms | 2043 ms | — |

<!-- facts:end -->

## What it does

Loads a Marketplace listing's photos for its media viewer (`viewer.marketplace_product_details_page`, from `targetId`): the gallery with the photo Next control. It fired 3 times in 2 runs, 0.8-2.0 s into the step that opened a listing (`openAny 1-3 x /marketplace/item/`).

## What our machine does with it

The feed warm-up's `openListings` step opens the listing that sends it. The machine does not wait for it. It is the request the planned photo-by-photo look at a listing (open, Next through the photos, close) would wait on, once that page is recorded with `log inspect` (rule 29).

## What can go wrong

None seen: all three answered 200 in 499-527 ms. If it failed, the listing would show no photos; `openAny` still passes on the listing's URL.
