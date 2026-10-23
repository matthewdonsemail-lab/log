# CometMarketplaceYouFeedItemCommentListQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `39199556659689737` |
| Path | `/api/graphql/` |
| Sends | `feedLocation`, `feedbackSource`, `focusCommentID`, `listingId`, `scale`, `shouldIncludeProductFeedback`, `useDefaultActor`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider` |
| Reads | `viewer....useMarketplaceCanCrossPostListing_viewer`, `viewer.listing` |
| Called from | `CometMarketplaceYouFeedItemCommentList.react`, `MarketplaceYourListingInteractions.react` |
| rea | `ev_130bb68b7f167375394ecb9729978eb7b6ccdeb2f9eb9cdca06838a2fc84c556` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 1857 ms | 1369471 ms | — |

<!-- facts:end -->

## What it does

The comments and buyer interactions on one of the seller's listings (`listingId`, `focusCommentID`, `feedbackSource`), shown inside the listing's dialog on Selling (`MarketplaceYourListingInteractions`). It fired when Bethlehem's listing was opened in the browser, 23 minutes into the open inbox step.

## What our machine does with it

Nothing reads it yet. If buyers ask on the listing itself rather than in chats, this is where those questions would be read from; mapping it needs a recording with a real comment (rule 29).

## What can go wrong

Seen only with 200, on a listing with no comments. Failing, it only empties the dialog's interactions.
