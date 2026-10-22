# FBReelsEntityDialogImplQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29594255990177227` |
| Path | `/api/graphql/` |
| Sends | `entityId`, `scale`, `useDefaultActor`, `__relay_internal__pv__FBUnifiedVideoMediaContentContainer_comet_video_document_picture_in_picture_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaContentContainer_enable_chapters_pill_gkrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextUnifiedVideorelayprovider`, `__relay_internal__pv__FBUnifiedVideoCometVideoMedia_comet_photosensitive_content_warning_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaHeaderControls_enable_chapters_pill_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_organic_ad_cta_on_comet_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_meta_ai_pill_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_ai_embodiment_chat_pill_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_video_augment_pills_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoPlayerScrubber_fb_comet_vpv_heatmap_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoDescriptionWithEntities_comet_translations_revamp_sync_caption_with_audio_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoFeedbackBar_comet_reels_save_button_gkrelayprovider`, `__relay_internal__pv__usePushPipEngagementCounts_comet_video_document_picture_in_picture_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMenu_fb_reels_ranking_debug_tool_gkrelayprovider`, `__relay_internal__pv__CometAudioLanguageUtils_comet_translations_revamp_preferred_languages_gkrelayprovider` |
| Reads | — |
| Called from | `FBReelsEntityDialogImpl.react` |
| rea | `ev_f5969ab093dcf8fb0850c1bb82801d9d3e05bcaf68764bc21f414b635f91bece` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | scroll: +700px in 15 wheel steps, 969 ms | 1 | 200 | 819 ms | 3144 ms | — |
| inspect | scroll: +700px in 15 wheel steps, 766 ms | 1 | 200 | 1181 ms | 4178 ms | — |
| inspect | step 5: scroll 2 x 600-800px | 1 | 200 | 716 ms | 559 ms | — |

<!-- facts:end -->

## What it does

Loads a reel's dialog content by `entityId`, for a reel shown in a feed. It fired once, 559 ms into the third scroll of the group read (inspect 20261020T134155), when a reel in the group's feed came into view.

## What our machine does with it

Nothing in our machines reads it; it comes with reels shared into a group's feed. The group read keeps posts from `GroupsCometFeedRegularStoriesPaginationQuery`, not from here.

## What can go wrong

None seen: one answer, 200 in 716 ms. Nothing waits on it.
