# FBUnifiedVideoContainerQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | reels |
| Kind | query |
| doc_id | `29227112143560769` |
| Path | `/api/graphql/` |
| Sends | `count`, `cursor`, `scale`, `should_include_comet_reels_seo_llm_content`, `should_use_stream`, `stream_initial_count`, `useDefaultActor`, `video_feed_context_data`, `__relay_internal__pv__FBUnifiedVideoMediaContentContainer_comet_video_document_picture_in_picture_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaContentContainer_enable_chapters_pill_gkrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextUnifiedVideorelayprovider`, `__relay_internal__pv__FBUnifiedVideoCometVideoMedia_comet_photosensitive_content_warning_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaHeaderControls_enable_chapters_pill_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_organic_ad_cta_on_comet_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_meta_ai_pill_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_ai_embodiment_chat_pill_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_video_augment_pills_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoPlayerScrubber_fb_comet_vpv_heatmap_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoDescriptionWithEntities_comet_translations_revamp_sync_caption_with_audio_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoFeedbackBar_comet_reels_save_button_gkrelayprovider`, `__relay_internal__pv__usePushPipEngagementCounts_comet_video_document_picture_in_picture_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMenu_fb_reels_ranking_debug_tool_gkrelayprovider`, `__relay_internal__pv__CometAudioLanguageUtils_comet_translations_revamp_preferred_languages_gkrelayprovider` |
| Reads | `viewer....FBUnifiedVideoContainer_reels` |
| Called from | `FBUnifiedVideoContainer_reels.graphql` |
| rea | `ev_e0f416e05899b25acdf92584bfaa3ab0f3705c0b194d01f500c834c0c5a17a4d` |

Seen 15 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /reel/ | 2 | 200 | 2512–3015 ms | 2974–3004 ms | — |
| inspect | rea read step 08_clickroleButtonNextCard: exit 0, ev_f6a7635960b1919bdfac52d21fd673ed4dc6c | 1 | 200 | 1155 ms | 261 ms | — |
| inspect | rea read step 13_dwell600s: exit 0, ev_e8922deafb7ba9951a51bda6f8cd82b5b68c41db19bfe0cd164 | 1 | 200 | 2028 ms | 634 ms | — |
| inspect | rea read step 18_clickroleButtonNextCard: exit 0, ev_33faffe301518f4ece688324618192249fe69 | 1 | 200 | 1058 ms | 1658 ms | — |
| inspect | step 23: goto /reel/<id> | 1 | 200 | 2399 ms | 1940 ms | — |
| inspect | step 9: goto /reel/<id> | 1 | 200 | 1533 ms | 3049 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 1115 ms | 2082 ms | — |
| inspect | step 20: goto /reel/<id> | 1 | 200 | 1749 ms | 2416 ms | — |
| inspect | step 22: goto /reel/ | 1 | 200 | 2519 ms | 2175 ms | — |
| inspect | step 29: clickRole button "…" | 1 | 200 | 1914 ms | 2539 ms | — |
| inspect | step 37: clickRole button "…" | 1 | 200 | 3499 ms | 1186 ms | — |
| inspect | step 53: goto /reel/ | 1 | 200 | 1282 ms | 4886 ms | — |
| inspect | step 65: clickRole button "…" | 1 | 200 | 1032 ms | 2013 ms | — |
| inspect | step 80: clickRole button "…" | 1 | 200 | 3174 ms | 1202 ms | — |

<!-- facts:end -->

## What it does

Loads the Reels feed in Facebook's unified video player (`FBUnifiedVideoContainer_reels`), paged by `count` and `cursor`, with the `video_feed_context_data` it sends. It fired on every goto /reel/ (2-5 s after the step started) and after some `Next card` clicks, so it loads the first reels and fetches more as the feed moves on.

## What our machine does with it

No state reads it. The Reels warm-up checks where it landed instead: `openReels` expects the URL to match `/reel/\d+`, and each `swipe` (`Next card`) expects the URL to change to the next reel (`checkStep`).

## What can go wrong

None seen: 15 calls, all 200 in 1032-3499 ms. If the feed did not load, `openReels` would not reach a `/reel/<id>` URL or a swipe would leave the URL unchanged, and `checkStep` names it. If the step fails anyway, `checkStep` reports it as an issue: `log warmup facebook reel record` goes on and outlines it, a `run` stops there, and a checkpoint or login page ends it as `blocked`.
