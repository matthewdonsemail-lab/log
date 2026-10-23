# CometMarketplaceLeftRailNavigationContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `39413521514929752` |
| Path | `/api/graphql/` |
| Sends | `buyLocation`, `category_ranking_enabled`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__MarketplaceJobsSubtabFiltersCometrelayprovider`, `hide_l2_cats` |
| Reads | `...CometMarketplaceLeftRailNavigation_query` |
| Called from | `CometMarketplaceLeftRailNavigationContainer.react` |
| rea | `ev_a3f518ca5cd3399f6c39de02362bd62e28dd8a82451cecaa92129e250dbd95be` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 15: click e1354 | 1 | 200 | 413 ms | 2350 ms | — |
| inspect | step 4: click e191 | 1 | 200 | 1244 ms | 2960 ms | — |

<!-- facts:end -->

## What it does

Redraws Marketplace's left rail (Browse all, Inbox, Marketplace status, Buying, Selling, Location) after a navigation or a location change.

## What our machine does with it

Nothing; it follows `CometMarketplaceSetBuyLocationMutation` when the location dialog is applied.

## What can go wrong

Harmless.
