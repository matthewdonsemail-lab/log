# ProfileCometAboutAppSectionQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `28872732712336652` |
| Path | `/api/graphql/` |
| Sends | `appSectionFeedKey`, `collectionToken`, `pageID`, `rawSectionToken`, `renderLocation`, `scale`, `sectionToken`, `showReactions`, `useDefaultActor`, `userID`, `__relay_internal__pv__FBProfile_enable_perf_improv_gkrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider`, `__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaContentContainer_comet_video_document_picture_in_picture_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaContentContainer_enable_chapters_pill_gkrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextUnifiedVideorelayprovider`, `__relay_internal__pv__FBUnifiedVideoCometVideoMedia_comet_photosensitive_content_warning_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaHeaderControls_enable_chapters_pill_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_organic_ad_cta_on_comet_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_meta_ai_pill_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_ai_embodiment_chat_pill_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_video_augment_pills_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoPlayerScrubber_fb_comet_vpv_heatmap_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoDescriptionWithEntities_comet_translations_revamp_sync_caption_with_audio_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoFeedbackBar_comet_reels_save_button_gkrelayprovider`, `__relay_internal__pv__usePushPipEngagementCounts_comet_video_document_picture_in_picture_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMenu_fb_reels_ranking_debug_tool_gkrelayprovider`, `__relay_internal__pv__CometAudioLanguageUtils_comet_translations_revamp_preferred_languages_gkrelayprovider` |
| Reads | `user.is_viewer_eligible_for_aggregate_share_to_feed_on_comet`, `user.about_app_sections` |
| Called from | `ProfileCometAboutAppSection.react` |
| rea | `ev_8d791e67d202e82b87375766750b1d234cf58a9260d5e9308a1c8de5280525ac` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | POST 200 /ajax/relay-ef/ (347 ms) | 1 | 200 | 506 ms | 302 ms | — |

<!-- facts:end -->

## What it does

Loads the About section tiles of a profile (`about_app_sections`: work, places lived, contact) as the profile page scrolls to them. Fired twice on the account's own profile during the host's account check, in about 0.5 s.

## What our machine does with it

Nothing yet: the profile machine sets only the photo, cover and name (rule 28), and every other field stays read-only (rule 8). Its sighting shows the own profile rendered past the header.

## What can go wrong

Nothing for our runs; an error only leaves the About tiles empty.
