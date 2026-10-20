# ProfileCometTopAppSectionQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `28515231488168342` |
| Path | `/api/graphql/` |
| Sends | `collectionToken`, `renderLocation`, `scale`, `sectionToken`, `useDefaultActor`, `userID`, `__relay_internal__pv__FBProfile_enable_perf_improv_gkrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider`, `__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaContentContainer_comet_video_document_picture_in_picture_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaContentContainer_enable_chapters_pill_gkrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextUnifiedVideorelayprovider`, `__relay_internal__pv__FBUnifiedVideoCometVideoMedia_comet_photosensitive_content_warning_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaHeaderControls_enable_chapters_pill_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_organic_ad_cta_on_comet_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_meta_ai_pill_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_ai_embodiment_chat_pill_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_video_augment_pills_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoPlayerScrubber_fb_comet_vpv_heatmap_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoDescriptionWithEntities_comet_translations_revamp_sync_caption_with_audio_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoFeedbackBar_comet_reels_save_button_gkrelayprovider`, `__relay_internal__pv__usePushPipEngagementCounts_comet_video_document_picture_in_picture_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMenu_fb_reels_ranking_debug_tool_gkrelayprovider`, `__relay_internal__pv__CometAudioLanguageUtils_comet_translations_revamp_preferred_languages_gkrelayprovider` |
| Reads | `node`, `user.timeline_nav_app_sections`, `user.if_viewer_can_see_profile_paginated_collections_feed` |
| Called from | `ProfileCometTopAppSection.react` |
| rea | `ev_9bbbd928975f74b154e7604fb84acb74e7256b6da02fcdceb8730c7a42d19328` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 12: clickAny 1 x link /see owner profile$/ | 1 | 200 | 1112 ms | 2255 ms | — |
| inspect | step 21: clickAny 1 x link /see owner profile$/ | 1 | 200 | 3910 ms | 1890 ms | — |
| inspect | step 8: clickAny 1 x link /see owner profile$/ | 1 | 200 | 1069 ms | 1918 ms | — |
| inspect | step 19: clickAny 1 x link /see owner profile$/ | 1 | 200 | 1075 ms | 2110 ms | — |

<!-- facts:end -->

## What it does

Loads the tabs under a profile's header (`timeline_nav_app_sections`: Posts, About, Friends, Photos...). Fired once during the host's account check on the own profile, in about 0.4 s.

## What our machine does with it

Nothing: no machine opens the tabs. Its sighting shows the own profile rendered past the header.

## What can go wrong

Nothing for our runs; an error only hides the tab bar.
