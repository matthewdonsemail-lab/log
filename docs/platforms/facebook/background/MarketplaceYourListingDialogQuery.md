# MarketplaceYourListingDialogQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27832601083046297` |
| Path | `/api/graphql/` |
| Sends | `listingId`, `scale`, `shouldShowAllMessagesOnYouFeedCard`, `__relay_internal__pv__ShouldUpdateMarketplaceBoostListingBoostedStatusrelayprovider` |
| Reads | `viewer....MarketplaceYourListingRedesign_viewer`, `viewer.marketplace_listing` |
| Called from | `MarketplaceYourListingDialog.react` |
| rea | `ev_22f59bbae443de234fa40584e0e8711ae894e0e7bcfb42cf6d605e5b3c885bfd` |

Seen 3 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /marketplace/inbox | 3 | 200 | 908–2422 ms | 500580–1365363 ms | — |

<!-- facts:end -->

## What it does

Opens one of the seller's own listings in its dialog on Selling (`listingId`): the listing in full (`viewer.marketplace_listing`), its redesign panel and boost state. Seen three times while Bethlehem's open browser sat on the inbox step (8 to 23 minutes in), when the listing was opened by hand.

## What our machine does with it

Nothing reads it yet. The check gets each listing's state and clicks from the Selling list, which is enough; the dialog is where more of one listing's insights would be read if they are ever needed.

## What can go wrong

Seen only with 200. Failing, the dialog shows empty; no step waits on it.
