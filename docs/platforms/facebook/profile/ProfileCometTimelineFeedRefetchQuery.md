# ProfileCometTimelineFeedRefetchQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `27938457129160881` |
| Path | `/api/graphql/` |
| Sends | `afterTime`, `beforeTime`, `count`, `cursor`, `feedLocation`, `feedbackSource`, `focusCommentID`, `id`, `memorializedSplitTimeFilter`, `omitPinnedPost`, `postedBy`, `privacy`, `privacySelectorRenderLocation`, `referringStoryRenderLocation`, `renderLocation`, `run_with_continuation_key`, `scale`, `stream_count`, `taggedInOnly`, `trackingCode`, `useDefaultActor`, `__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_reactor_facepilerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_social_bubblesrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_post_permalink_white_space_clickrelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider`, `__relay_internal__pv__TestPilotShouldIncludeDemoAdUseCaserelayprovider`, `__relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider`, `__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__CometFeedShareMedia_shouldPrefetchShareImagerelayprovider`, `__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__IsMergQAPollsrelayprovider`, `__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFIShareActionMigrationrelayprovider`, `__relay_internal__pv__CometUFISingleLineUFIrelayprovider`, `__relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider`, `__relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider`, `__relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider`, `__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider`, `__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider` |
| Reads | `node....ProfileCometTimelineFeed_user` |
| Called from | `ProfileCometTimelineFeed_user.graphql` |
| rea | `ev_10700decc0a4c6407f669bfb19e481323e095dc537726bb3fc56562c8bc3fbda` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /profile.php | 1 | 200 | 607 ms | 6708 ms | — |

<!-- facts:end -->

## What it does

Reloads the posts on a profile's timeline (`ProfileCometTimelineFeed_user`), by the profile's `id`, a `count` and a `cursor`, with time bounds. It fired on run 20261020T162343 as Bethlehem's own profile loaded (607 ms).

## What our machine does with it

It is the profile's equivalent of the group feed query: the posts our flows make (and the comments on them) appear in it, so reading an account's own posts back after `profilePost` would read this answer, as `src/group/read` reads the group feed's.

## What can go wrong

None seen.
