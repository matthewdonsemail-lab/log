# CometMarketplaceLeftRailNavigationContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29041861158765204` |
| Path | `/api/graphql/` |
| Sends | `buyLocation`, `category_ranking_enabled`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__MarketplaceJobsSubtabFiltersCometrelayprovider`, `hide_l2_cats` |
| Reads | `...CometMarketplaceLeftRailNavigation_query` |
| Called from | `CometMarketplaceLeftRailNavigationContainer.react` |
| rea | `ev_b5c70f37beae311f024c299c61fd6b02b1124c17587ff80c895fdc4befc585c9` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 15: click e1354 | 1 | 200 | 413 ms | 2350 ms | — |

<!-- facts:end -->

## What it does

Redraws Marketplace's left rail (Browse all, Inbox, Marketplace status, Buying, Selling, Location) after a navigation or a location change.

## What our machine does with it

Nothing; it follows `CometMarketplaceSetBuyLocationMutation` when the location dialog is applied.

## What can go wrong

Harmless.
