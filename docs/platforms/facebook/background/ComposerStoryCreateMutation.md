# ComposerStoryCreateMutation

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `39388780844101115` |
| Path | `/api/graphql/` |
| Sends | `checkPhotosToReelsUpsellEligibility`, `feedLocation`, `feedbackSource`, `focusCommentID`, `gridMediaWidth`, `groupID`, `input`, `inviteShortLinkKey`, `isEvent`, `isFeed`, `isFunFactPost`, `isFundraiser`, `isGroup`, `isPageNewsFeed`, `isProfileReviews`, `isSocialLearning`, `isTimeline`, `isWorkSharedDraft`, `privacySelectorRenderLocation`, `referringStoryRenderLocation`, `renderLocation`, `scale`, `useDefaultActor`, `__relay_internal__pv__CometUFIShareActionMigrationrelayprovider`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider`, `__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__CometUFISingleLineUFIrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_reactor_facepilerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_social_bubblesrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_post_permalink_white_space_clickrelayprovider`, `__relay_internal__pv__TestPilotShouldIncludeDemoAdUseCaserelayprovider`, `__relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__CometFeedShareMedia_shouldPrefetchShareImagerelayprovider`, `__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__IsMergQAPollsrelayprovider`, `__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider`, `__relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider`, `__relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider`, `__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider`, `__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider`, `__relay_internal__pv__groups_comet_use_glvrelayprovider`, `__relay_internal__pv__GHLShouldChangeSponsoredAuctionDistanceFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldUseSponsoredAuctionLabelFieldNameV1relayprovider`, `__relay_internal__pv__GHLShouldUseSponsoredAuctionLabelFieldNameV2relayprovider` |
| Reads | `story_create.story_id`, `story_create.post_id`, `story_create.publishing_flow`, `story_create.story`, `story_create.logging_token` |
| Called from | `ComposerStoryCreateMutation` |
| rea | `ev_dab5329db7a9064cf5b3fa43609177b52e24171c8e561cd02c228b9303677620` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: clickRole button "…" | 1 | 200 | 3633 ms | 373 ms | — |
| inspect | step 12: clickRole button "…" | 1 | 200 | 3802 ms | 2376 ms | — |

<!-- facts:end -->

## What it does

Creates a post: the composer's text and attachments go in `input`, and the answer carries the new story (`story_create.story_id`, `post_id`, `story`). It fired on run 20261020T162343 when Post was pressed on Bethlehem's own profile, for the text post (3633 ms) and again for the photo post (3802 ms), each about 0.4 s after the click; the composer shows "Posting" until it answers.

## What our machine does with it

The `profilePost` and `profilePhotoPost` flows (`src/browser/flow/definitions/`) wait for it after their Post step (`expect`): the post exists once it answers 200. `story_create.post_id` is the id a later comment, reaction or delete refers to. It is a write on Facebook: those flows run only with `--live` (rule 8).

## What can go wrong

None seen: both answered 200. If it failed, the composer would stay open with the text in it and the flow's Post step would fail on its `expect`, so nothing is counted as posted; a retry would post a second copy only if the first had in fact gone through, so a failed step is checked on the profile before running again.
