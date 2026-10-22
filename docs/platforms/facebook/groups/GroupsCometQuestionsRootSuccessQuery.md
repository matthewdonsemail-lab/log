# GroupsCometQuestionsRootSuccessQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `27785256361150672` |
| Path | `/api/graphql/` |
| Sends | `feedLocation`, `feedbackSource`, `focusCommentID`, `groupID`, `privacySelectorRenderLocation`, `referringStoryRenderLocation`, `renderLocation`, `scale`, `useDefaultActor`, `__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_reactor_facepilerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_social_bubblesrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_post_permalink_white_space_clickrelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider`, `__relay_internal__pv__TestPilotShouldIncludeDemoAdUseCaserelayprovider`, `__relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider`, `__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__CometFeedShareMedia_shouldPrefetchShareImagerelayprovider`, `__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__IsMergQAPollsrelayprovider`, `__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFIShareActionMigrationrelayprovider`, `__relay_internal__pv__CometUFISingleLineUFIrelayprovider`, `__relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider`, `__relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider`, `__relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider`, `__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider`, `__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider` |
| Reads | — |
| Called from | `GroupsCometQuestionsRootSuccess.react` |
| rea | `ev_774e2e10f24ec0393d459f2e4e0c7612b45818af368059629dcdefd9672be74c` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: clickRole tab "…" | 1 | 200 | 3376 ms | 1087 ms | — |

<!-- facts:end -->

## What it does

The Open questions tab (`GroupsCometQuestionsRootSuccess.react`, `/groups/<id>/questions`): by `groupID` it loads the group's question posts as a feed with the usual story fields, so each question carries its first comments already. In run 20261020T153648 step 4 it fired 1.1 s after the tab click and took 3376 ms, 200.

## What our machine does with it

No machine waits for it or reads it. The group read (`src/group/read`) stays on the Discussion tab and never opens this one. The flow [`groupTabs`](../flows/groupTabs.md) clicks the tab and waits for no request: a page-load query isn't a confirming request, only a mutation is (`confirmingRequest`). The flow [`groupPostComments`](../flows/groupPostComments.md) starts on this tab: there "Leave a comment" opens the comments inline under the post, not in a dialog, and needs no request of its own.

## What can go wrong

Only a 200 has been seen, in one run. If it failed, the tab would show Facebook's own error panel instead of its content; the flow's click would still pass, and nothing on Facebook changes, since it only reads.
