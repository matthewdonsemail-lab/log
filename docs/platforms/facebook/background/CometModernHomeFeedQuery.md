# CometModernHomeFeedQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28651572944522952` |
| Path | `/api/graphql/` |
| Sends | `RELAY_INCREMENTAL_DELIVERY`, `connectionClass`, `experimentalValues`, `feedClientSession`, `feedEndCursor`, `feedInitialFetchSize`, `feedLocation`, `feedStyle`, `feedbackSource`, `focusCommentID`, `orderby`, `privacySelectorRenderLocation`, `recentVPVs`, `referringStoryRenderLocation`, `refreshMode`, `renderLocation`, `scale`, `shouldChangeBRSLabelFieldName`, `shouldObfuscateCategoryField`, `shouldUseBRSLabelFieldNameV1`, `shouldUseBRSLabelFieldNameV2`, `useDefaultActor`, `__relay_internal__pv__GHLShouldChangeSponsoredAuctionDistanceFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldUseSponsoredAuctionLabelFieldNameV1relayprovider`, `__relay_internal__pv__GHLShouldUseSponsoredAuctionLabelFieldNameV2relayprovider`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider`, `__relay_internal__pv__CometAdsSlotFillLoggingEnabledrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_reactor_facepilerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_social_bubblesrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_post_permalink_white_space_clickrelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider`, `__relay_internal__pv__TestPilotShouldIncludeDemoAdUseCaserelayprovider`, `__relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider`, `__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__CometFeedShareMedia_shouldPrefetchShareImagerelayprovider`, `__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__IsMergQAPollsrelayprovider`, `__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFIShareActionMigrationrelayprovider`, `__relay_internal__pv__CometUFISingleLineUFIrelayprovider`, `__relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider`, `__relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider`, `__relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider`, `__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider`, `__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider` |
| Reads | `viewer....CometNewsFeed_viewerConnection`, `viewer....CometNewsFeed_viewer` |
| Called from | `CometModernHomeFeed.react` |
| rea | `ev_1b460d553cf6534a2af5b25c753e1e08cf72dc0bc41987677951d9a3388a29e3` |

Seen 16 time(s) in 10 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 3005 ms | 13560 ms | — |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 3128 ms | 12028 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 2579 ms | 7044 ms | — |
| warmup | step 11: goto /marketplace/ | 1 | 200 | 3899 ms | 8602 ms | — |
| warmup | step 17: goto /marketplace/ | 1 | 200 | 2931 ms | 12038 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 2948 ms | 1258004 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 2988 ms | 5480 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 3485 ms | 8254 ms | — |
| inspect | step 4: snapshot | 1 | 200 | 3390 ms | 335 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 3090 ms | 6667 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 5114 ms | 103686 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 1 | 200 | 4065 ms | 5691 ms | — |
| inspect | step 4: goto /marketplace/inbox | 1 | 200 | 3883 ms | 558511 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 4472 ms | 59455 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 3384 ms | 11536 ms | — |
| inspect | step 6: goto /marketplace/inbox | 1 | 200 | 4442 ms | 1708095 ms | — |

<!-- facts:end -->

## What it does

The home feed's first stories.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
