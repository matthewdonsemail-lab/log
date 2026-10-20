# CometModernHomeFeedQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28853390814299999` |
| Path | `/api/graphql/` |
| Sends | `RELAY_INCREMENTAL_DELIVERY`, `connectionClass`, `experimentalValues`, `feedClientSession`, `feedEndCursor`, `feedInitialFetchSize`, `feedLocation`, `feedStyle`, `feedbackSource`, `focusCommentID`, `orderby`, `privacySelectorRenderLocation`, `recentVPVs`, `referringStoryRenderLocation`, `refreshMode`, `renderLocation`, `scale`, `shouldChangeBRSLabelFieldName`, `shouldObfuscateCategoryField`, `shouldUseBRSLabelFieldNameV1`, `shouldUseBRSLabelFieldNameV2`, `useDefaultActor`, `__relay_internal__pv__GHLShouldChangeSponsoredAuctionDistanceFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldUseSponsoredAuctionLabelFieldNameV1relayprovider`, `__relay_internal__pv__GHLShouldUseSponsoredAuctionLabelFieldNameV2relayprovider`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider`, `__relay_internal__pv__CometAdsSlotFillLoggingEnabledrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_reactor_facepilerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_social_bubblesrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_post_permalink_white_space_clickrelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider`, `__relay_internal__pv__TestPilotShouldIncludeDemoAdUseCaserelayprovider`, `__relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider`, `__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__CometFeedShareMedia_shouldPrefetchShareImagerelayprovider`, `__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__IsMergQAPollsrelayprovider`, `__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFIShareActionMigrationrelayprovider`, `__relay_internal__pv__CometUFISingleLineUFIrelayprovider`, `__relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider`, `__relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider`, `__relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider`, `__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider`, `__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider` |
| Reads | `viewer....CometNewsFeed_viewerConnection`, `viewer....CometNewsFeed_viewer` |
| Called from | `CometModernHomeFeed.react` |
| rea | `ev_3ce25c6049c186515af5b71ab505638faf9a17d16c166222c126862c227e8871` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | POST 200 /ajax/bulk-route-definitions/ (489 ms) | 1 | 200 | 2549 ms | 214 ms | — |
| inspect | page has 63 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T234 | 1 | 200 | 2656 ms | 28666 ms | — |
| inspect | step 9: snapshot | 1 | 200 | 3517 ms | 260 ms | — |

<!-- facts:end -->

## What it does

The home feed's first stories.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
