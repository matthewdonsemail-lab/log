# CometMarketplaceYouSellingFastContentContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29188899014069653` |
| Path | `/api/graphql/` |
| Sends | `count`, `cursor`, `order`, `scale`, `shouldDeferInfoSection`, `state`, `status`, `title_search`, `__relay_internal__pv__ShouldUpdateMarketplaceBoostListingBoostedStatusrelayprovider` |
| Reads | `...CometMarketplaceUnifiedYouSellingFastContent_query` |
| Called from | `CometMarketplaceYouSellingFastContentContainer.react` |
| rea | `ev_212cf616ae977ec0669a8e0077a1f11572208e25097749815af33b3cbeb6d22f` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /marketplace/inbox | 2 | 200 | 778–1275 ms | 494388–1361223 ms | — |

<!-- facts:end -->

## What it does

Loads the seller's listings on Marketplace > Selling (`/marketplace/you/selling`), a page at a time (`count`, `cursor`), filtered and sorted by `state`, `status`, `order` and `title_search`. Each listing comes with its title, price, flags (`is_on_marketplace`, `is_sold`, `is_pending`, `is_draft`), its review notice, and `listing_insights.insights[0].count`: the page's "N clicks on listing", how many times people opened the listing's details page in the last 14 days. On a direct load the first page of it is preloaded in the page's own HTML (inspect 20261023T000744, step 02, entry 20); this POST is the same query when the list reloads or pages in the open browser (seen twice while the inbox step sat open, 8 and 23 minutes in).

## What our machine does with it

The Marketplace check (`src/facebook/marketplace/check`, `log facebook check` and the host's watch round) reads it from the Selling step's recording, preloaded or posted: `sellingListingsOf` takes each listing's state into Twenty's `agencyListings.status` and its clicks into `clicksCount` (Bethlehem's: 15, then 19, on 2026-10-23). Nothing waits on it and nothing is clicked.

## What can go wrong

Seen only with 200. If the page loads without it (a login wall, a checkpoint, a slow proxy), the check says "Selling didn't load" and changes nothing in Twenty. A listing without `listing_insights` keeps its last `clicksCount`. Paging past the first page isn't read yet: an account with more listings than the first page holds would miss the rest.
