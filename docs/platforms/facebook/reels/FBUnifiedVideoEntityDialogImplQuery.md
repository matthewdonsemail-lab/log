# FBUnifiedVideoEntityDialogImplQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | reels |
| Kind | query |
| doc_id | `29652989050968472` |
| Path | `/api/graphql/` |
| Sends | `entityId`, `scale`, `useDefaultActor`, `__relay_internal__pv__FBUnifiedVideoEntityProfileAudioGridFirstPageSizerelayprovider`, `__relay_internal__pv__FBUnifiedVideoEntityProfileHeaderAudio_comet_reels_audio_dialog_saverelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaContentContainer_comet_video_document_picture_in_picture_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaContentContainer_enable_chapters_pill_gkrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextUnifiedVideorelayprovider`, `__relay_internal__pv__FBUnifiedVideoCometVideoMedia_comet_photosensitive_content_warning_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaHeaderControls_enable_chapters_pill_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_organic_ad_cta_on_comet_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_meta_ai_pill_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_ai_embodiment_chat_pill_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_video_augment_pills_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoPlayerScrubber_fb_comet_vpv_heatmap_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoDescriptionWithEntities_comet_translations_revamp_sync_caption_with_audio_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoFeedbackBar_comet_reels_save_button_gkrelayprovider`, `__relay_internal__pv__usePushPipEngagementCounts_comet_video_document_picture_in_picture_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMenu_fb_reels_ranking_debug_tool_gkrelayprovider`, `__relay_internal__pv__CometAudioLanguageUtils_comet_translations_revamp_preferred_languages_gkrelayprovider` |
| Reads | — |
| Called from | `FBUnifiedVideoEntityDialogImpl.react` |
| rea | `ev_86c55860632301261adc729568972b8c68698dd7f99a2d2b9710325b4f021afc` |

Seen 13 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | clickAny: 1 link /see owner profile$/ | 2 | 200 | 1028–1405 ms | 1638–154192 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 1995 ms | 1616965 ms | — |
| inspect | step 9: goto /reel/<id> | 1 | 200 | 1969 ms | 5894 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 1082 ms | 2621 ms | — |
| inspect | step 17: scrollIn heading "…" 2-3 x 300-500px | 1 | 200 | 485 ms | 63 ms | — |
| inspect | step 22: goto /reel/ | 1 | 200 | 2642 ms | 2445 ms | — |
| inspect | step 35: clickRole button "…" | 1 | 200 | 1156 ms | 8432 ms | — |
| inspect | step 38: dwell 3s | 1 | 200 | 1164 ms | 9 ms | — |
| inspect | step 54: clickRole button "…" | 1 | 200 | 824 ms | 70 ms | — |
| inspect | step 72: clickRole button "…" | 1 | 200 | 1355 ms | 3452 ms | — |
| inspect | step 88: clickRole button "…" | 1 | 200 | 1347 ms | 5028 ms | — |
| inspect | step 96: clickRole button "…" | 1 | 200 | 949 ms | 393792 ms | — |

<!-- facts:end -->

## What it does

Loads the data for the video player's entity dialog by `entityId` (`FBUnifiedVideoEntityDialogImpl.react`); the doc lists no fields read. It fired at many Reels steps: gotos to /reel/, clickRole buttons, a dwell, a comments `scrollIn` and the `see owner profile` link.

## What our machine does with it

Nothing. The Reels warm-up (`src/warmup/facebook`) checks each step against the page's URL and snapshot (`checkStep`), never against this response, and no code refers to it.

## What can go wrong

None seen: 12 calls, all 200 in 485-2642 ms. If the step fails anyway, `checkStep` reports it as an issue: `log facebook warmup reel record` goes on and outlines it, a `run` stops there, and a checkpoint or login page ends it as `blocked`.
