# MarketplacePDPContainerQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28633625649641172` |
| Path | `/api/graphql/` |
| Sends | `adId`, `enableJobEmployerActionBar`, `enableJobSeekerActionBar`, `feedLocation`, `feedbackSource`, `focusCommentID`, `imageContext`, `referralCode`, `referralSurfaceString`, `scale`, `shouldFetchLoggedOutSimilarListings`, `targetId`, `useDefaultActor`, `__relay_internal__pv__MarketplacePDPCometSimilarListingsrelayprovider`, `__relay_internal__pv__MarketplacePDPShouldShowRelatedSearchesrelayprovider`, `__relay_internal__pv__MarketplacePDPShouldShowLoggedOutSellerTrustrelayprovider`, `__relay_internal__pv__ShouldUpdateMarketplaceBoostListingBoostedStatusrelayprovider`, `__relay_internal__pv__MarketplacePDPIsLoggedOutrelayprovider`, `__relay_internal__pv__CometUFIShareActionMigrationrelayprovider`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider`, `__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__CometUFISingleLineUFIrelayprovider`, `__relay_internal__pv__MarketplacePDPShouldShowBSGRecommendationsrelayprovider`, `__relay_internal__pv__MarketplacePDPJobShouldShowSharedGroupsSectionrelayprovider`, `__relay_internal__pv__MarketplacePDPJobIsShareToGroupsEnabledOnCometrelayprovider` |
| Reads | `viewer....MarketplaceCometFeatureAccessProvider_viewer`, `viewer.marketplace_product_details_page` |
| Called from | `MarketplacePDPContainer.react` |
| rea | `ev_28b1d168c67e1529c4c2028a977c37bd097e7641c767224cd108f7e209720e9e` |

Seen 3 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | scroll: -577px in 13 wheel steps, 859 ms | 1 | 200 | 1028 ms | 2391 ms | — |
| inspect | scroll: +978px in 22 wheel steps, 1531 ms | 1 | 200 | 1078 ms | 821 ms | — |
| inspect | step 25: openAny 1-3 x /marketplace/item/ | 1 | 200 | 969 ms | 1233 ms | — |

<!-- facts:end -->

## What it does

Loads a Marketplace listing's page (PDP): the listing itself (`viewer.marketplace_product_details_page`) and what the viewer may do on Marketplace (`MarketplaceCometFeatureAccessProvider_viewer`), from `targetId`. It fired 3 times in 2 runs, 0.8-2.0 s into the step that opened a listing.

## What our machine does with it

The feed warm-up's `openListings` (`openAny /marketplace/item/`) opens the listing that sends it; the step passes on the listing's URL, not on this response. It is the first request that says the listing page has content, so it is what a settle on the listing (instead of a fixed wait) would wait for.

## What can go wrong

None seen: all three answered 200 in 969-1078 ms. A slow answer only delays the listing's content; the step does not read it.
