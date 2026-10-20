# CometSinglePostDialogContentQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `39729885346602636` |
| Path | `/api/graphql/` |
| Sends | `feedLocation`, `feedbackSource`, `focusCommentID`, `privacySelectorRenderLocation`, `referringStoryRenderLocation`, `renderLocation`, `scale`, `shouldChangeNodeFieldName`, `storyID`, `useDefaultActor`, `__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_reactor_facepilerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_social_bubblesrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_post_permalink_white_space_clickrelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider`, `__relay_internal__pv__TestPilotShouldIncludeDemoAdUseCaserelayprovider`, `__relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider`, `__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__CometFeedShareMedia_shouldPrefetchShareImagerelayprovider`, `__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__IsMergQAPollsrelayprovider`, `__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFIShareActionMigrationrelayprovider`, `__relay_internal__pv__CometUFISingleLineUFIrelayprovider`, `__relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider`, `__relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider`, `__relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider`, `__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider`, `__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider`, `__relay_internal__pv__ProfileCometSeoIsViewerLoggedOutrelayprovider` |
| Reads | — |
| Called from | `CometSinglePostDialogContent.react` |
| rea | `ev_201f80db413ddb9f32756c466afa12132645ff9ecc340dc86d410953f02aea70` |

Seen 6 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T105 | 2 | 200 | 1292–1776 ms | 27–53 ms | — |
| inspect | scroll: +1731px in 35 wheel steps, 2093 ms | 2 | 200 | 1449–1562 ms | 622–882 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T103 | 1 | 200 | 1578 ms | 9529 ms | — |
| inspect | rea read step 14_nextpost: exit 0, ev_6209fcf52acf0f7a90e081fed57af389f95de778645cfd8464dd | 1 | 200 | 1427 ms | 52912 ms | — |

<!-- facts:end -->

## What it does

Loads one post's content into the post dialog (`storyID`, `focusCommentID`): the dialog that opens over the feed when a post's comments are opened. It fired 6 times in 4 runs, on the snapshot and scroll steps right after a post was opened.

## What our machine does with it

The feed warm-up's `openComments` step (`postButton "Leave a comment"`) opens the dialog that sends it; the step passes when the URL changes to the post's permalink (`expect: urlChanges`), not on this response. `scrollComments` then reads the comments it loaded, and `closeComments` returns to the feed.

## What can go wrong

None seen: all six answered 200 in 1292-1776 ms. If it failed, the dialog would show no comments: `scrollComments` would still scroll and `closeComments` still close it, so the run goes on.
