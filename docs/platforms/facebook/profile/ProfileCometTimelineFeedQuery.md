# ProfileCometTimelineFeedQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `39455371677441618` |
| Path | `/api/graphql/` |
| Sends | `afterTime`, `beforeTime`, `count`, `feedLocation`, `feedbackSource`, `focusCommentID`, `memorializedSplitTimeFilter`, `omitPinnedPost`, `postedBy`, `privacy`, `privacySelectorRenderLocation`, `referringStoryRenderLocation`, `renderLocation`, `runWithContinuationKey`, `scale`, `shouldShowProfilePinnedPost`, `stream_count`, `taggedInOnly`, `trackingCode`, `useDefaultActor`, `userID`, `__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_reactor_facepilerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_social_bubblesrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_post_permalink_white_space_clickrelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider`, `__relay_internal__pv__TestPilotShouldIncludeDemoAdUseCaserelayprovider`, `__relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider`, `__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__CometFeedShareMedia_shouldPrefetchShareImagerelayprovider`, `__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__IsMergQAPollsrelayprovider`, `__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFIShareActionMigrationrelayprovider`, `__relay_internal__pv__CometUFISingleLineUFIrelayprovider`, `__relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider`, `__relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider`, `__relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider`, `__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider`, `__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider` |
| Reads | — |
| Called from | `ProfileCometTimeline.react` |
| rea | `ev_39691107976f01281b8d227447e2fdcd6764c690f92666b0755b5a56fef3013d` |

Seen 3 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | POST 200 /ajax/bulk-route-definitions/ (752 ms) | 1 | 200 | 407 ms | 5069 ms | — |
| host | step 9: saveState | 1 | 200 | 390 ms | 1536 ms | — |
| inspect | step 7: goto / | 1 | 200 | 1004 ms | 118257 ms | — |

<!-- facts:end -->

## What it does

Loads the posts on a profile's timeline (paged by `count`, `afterTime`/`beforeTime`, `postedBy`). Fired as the own profile loaded, 5 s after `/me`, in about 0.4 s.

## What our machine does with it

Nothing: no machine posts to or reads the timeline. Its sighting only shows the profile loaded fully.

## What can go wrong

Nothing for our runs; an error only leaves the timeline empty.
