# CometMarketplaceBoostListingPostPublishNuxDialogQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | publishing |
| Kind | query |
| doc_id | `25465988359761944` |
| Path | `/api/graphql/` |
| Sends | `listingID`, `scale`, `__relay_internal__pv__ShouldUpdateMarketplaceBoostListingBoostedStatusrelayprovider` |
| Reads | `viewer....CometMarketplaceBoostListingButton_viewer`, `viewer.listing` |
| Called from | `CometMarketplaceBoostListingPostPublishNuxDialog.react` |
| rea | `ev_532ce4cf56bca38d3123d4452a4f0a065ca00a7563ccc92a35f6165b6888146e` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 25: click e1241 | 1 | 200 | 594 ms | 15265 ms | — |

<!-- facts:end -->

## What it does

The "Boost your listing" offer shown right after a listing is published (`CometMarketplaceBoostListingPostPublishNuxDialog.react`): by `listingID` it loads the listing and the account's Boost button state. In Bethlehem's publish (inspect 20261022T110738) it fired 15 s after Publish was clicked, once the page had moved to Selling.

## What our machine does with it

Nothing waits for it. Boosting turns the listing into a paid ad, so the `marketplaceListingPublish` flow never presses Promote (rule 41); its last step closes the dialog with Close. The listing is already created by `useCometMarketplaceListingCreateMutation` before this dialog loads.

## What can go wrong

None seen: one call, 200 in 594 ms. If it failed there would be no Boost dialog, and the flow's Close step would find nothing to close; the listing itself is unaffected.
