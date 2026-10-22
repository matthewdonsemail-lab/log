# FBUnifiedVideoRootWithEntrypointQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | reels |
| Kind | query |
| doc_id | `39362542370056198` |
| Path | `/api/graphql/` |
| Sends | `count`, `initial_node_id`, `isAggregationProfileViewerOrShouldShowReelsForPage`, `page_id`, `root_video_id`, `scale`, `shouldIncludeInitialNodeFetch`, `shouldShowReelsForPage`, `shouldShowReelsForUser`, `should_include_comet_reels_seo_llm_content`, `should_use_stream`, `stream_initial_count`, `useDefaultActor`, `user_id`, `video_feed_context_data`, `__relay_internal__pv__FBUnifiedVideoMediaContentContainer_comet_video_document_picture_in_picture_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaContentContainer_enable_chapters_pill_gkrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextUnifiedVideorelayprovider`, `__relay_internal__pv__FBUnifiedVideoCometVideoMedia_comet_photosensitive_content_warning_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaHeaderControls_enable_chapters_pill_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_organic_ad_cta_on_comet_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_meta_ai_pill_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_ai_embodiment_chat_pill_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_video_augment_pills_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoPlayerScrubber_fb_comet_vpv_heatmap_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoDescriptionWithEntities_comet_translations_revamp_sync_caption_with_audio_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoFeedbackBar_comet_reels_save_button_gkrelayprovider`, `__relay_internal__pv__usePushPipEngagementCounts_comet_video_document_picture_in_picture_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMenu_fb_reels_ranking_debug_tool_gkrelayprovider`, `__relay_internal__pv__CometAudioLanguageUtils_comet_translations_revamp_preferred_languages_gkrelayprovider` |
| Reads | `viewer.actor` |
| Called from | `FBUnifiedVideoRootWithEntrypoint.react` |
| rea | `ev_efecfaf4b1626f5631a80618b3ce7481212611829b7bb70ce4f0f9e5177f6dc8` |

Seen 7 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | scroll: +700px in 15 wheel steps, 969 ms | 1 | 200 | 2050 ms | 3152 ms | — |
| inspect | scroll: +799px in 19 wheel steps, 1313 ms | 1 | 200 | 2173 ms | 9154 ms | — |
| inspect | post: "…", 103 words, 0 image(s), scrolled 58 px | 2 | 200 | 2277–2370 ms | 7233–9536 ms | — |
| inspect | scroll: +700px in 16 wheel steps, 1140 ms | 2 | 200 | 2874–4099 ms | 14677–20546 ms | — |
| inspect | clickRole failed: RuntimeError: no visible button "…" | 1 | 200 | 1547 ms | 79232 ms | — |

<!-- facts:end -->

## What it does

The Reels viewer's root (`FBUnifiedVideoRootWithEntrypoint.react`): with `root_video_id`, `initial_node_id` and `count`, it loads the reel being opened and the first reels after it, and reads the viewer (`viewer.actor`). In run 20261020T082836 it fired once, around the Unmute step, 1.5 s, 200.

## What our machine does with it

No machine waits for it or reads it. The Reels warm-up (`src/warmup/facebook`) checks each step on the page: a reel's URL (`/reel/\d+`) after openReels and each swipe, the Unmute button gone after unmute (`checkStep`).

## What can go wrong

Only a 200 has been seen in our runs. If it failed, the reel wouldn't load and the step's own check (the URL, the Unmute button) would say so, stopping the session with that step's issue.
