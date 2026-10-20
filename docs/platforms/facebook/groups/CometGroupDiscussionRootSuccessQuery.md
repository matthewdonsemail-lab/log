# CometGroupDiscussionRootSuccessQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `39368242346156279` |
| Path | `/api/graphql/` |
| Sends | `autoCreateChatDialog`, `autoOpenChat`, `creative_provider_id`, `feedLocation`, `feedType`, `feedbackSource`, `filter_topic_id`, `focusCommentID`, `groupID`, `hasHoistStories`, `hoistStories`, `hoistStoriesCount`, `hoistedSectionHeaderType`, `privacySelectorRenderLocation`, `referringStoryRenderLocation`, `regular_stories_count`, `regular_stories_cursor`, `regular_stories_stream_initial_count`, `renderLocation`, `scale`, `shouldDeferMainFeed`, `shouldShowBSGAgeVerificationBanner`, `sortingSetting`, `threadID`, `useDefaultActor`, `__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_reactor_facepilerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_social_bubblesrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_post_permalink_white_space_clickrelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider`, `__relay_internal__pv__TestPilotShouldIncludeDemoAdUseCaserelayprovider`, `__relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider`, `__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__CometFeedShareMedia_shouldPrefetchShareImagerelayprovider`, `__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__IsMergQAPollsrelayprovider`, `__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFIShareActionMigrationrelayprovider`, `__relay_internal__pv__CometUFISingleLineUFIrelayprovider`, `__relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider`, `__relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider`, `__relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider`, `__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider`, `__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider`, `__relay_internal__pv__GroupsCometGroupChatLazyLoadLastMessageSnippetrelayprovider`, `__relay_internal__pv__groups_comet_use_glvrelayprovider` |
| Reads | — |
| Called from | `CometGroupDiscussionRoot.Success.react` |
| rea | `ev_150925a527780189f04e2c934bb20ea5c52d57e92b40c415f08145290f0cb102` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 42: clickRole tab "…" | 1 | 200 | 4814 ms | 849 ms | — |

<!-- facts:end -->

## What it does

Loads a group's discussion feed (`CometGroupDiscussionRoot.Success.react`) by `groupID`, with the feed's sort, story counts and cursor. It fired 1891 ms after step 5 (click e2647) and 6108 ms after step 7 (click e2606), each time a group page opened in that `log inspect` session.

## What our machine does with it

Nothing. `groupJoin` reads the membership from the group page's own HTML (`viewer_join_state`, `readJoinOptions`) and the Join or Joined button from the snapshot (`readGroupPage`), never from this feed. No code refers to it.

## What can go wrong

None seen: both calls 200, in 990-1577 ms. If the feed failed to load, the Join button and the page's HTML would still decide. If the step fails anyway, `groupJoin` stops on the page, not on this request: a checkpoint or login page (`pageProblem`) or a failed step gives `groupPageNotOpened` or `groupJoinNotConfirmed`.
