# FBReelHashtagSearchResultsQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28370228809316719` |
| Path | `/api/graphql/` |
| Sends | `args`, `count`, `cursor`, `scale`, `useDefaultActor`, `__relay_internal__pv__FBUnifiedVideoMediaContentContainer_comet_video_document_picture_in_picture_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaContentContainer_enable_chapters_pill_gkrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextUnifiedVideorelayprovider`, `__relay_internal__pv__FBUnifiedVideoCometVideoMedia_comet_photosensitive_content_warning_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaHeaderControls_enable_chapters_pill_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_organic_ad_cta_on_comet_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_meta_ai_pill_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_ai_embodiment_chat_pill_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_video_augment_pills_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoPlayerScrubber_fb_comet_vpv_heatmap_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoDescriptionWithEntities_comet_translations_revamp_sync_caption_with_audio_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoFeedbackBar_comet_reels_save_button_gkrelayprovider`, `__relay_internal__pv__usePushPipEngagementCounts_comet_video_document_picture_in_picture_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__FBUnifiedVideoMenu_fb_reels_ranking_debug_tool_gkrelayprovider`, `__relay_internal__pv__CometAudioLanguageUtils_comet_translations_revamp_preferred_languages_gkrelayprovider` |
| Reads | `...FBReelHashtagSearchResults_paginatedSearchQuery` |
| Called from | `FBReelHashtagSearchResults.react` |
| rea | `ev_3ef714540a23ef82c40a5d13339e2663b055d23d569c643010201605ba744874` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 35: clickRole button "…" | 1 | 200 | 2108 ms | 4757 ms | — |

<!-- facts:end -->

## What it does

Loads a page of Reels results for a hashtag (`FBReelHashtagSearchResults_paginatedSearchQuery`), paged by `count` and `cursor`. It fired once, 4757 ms after step 35 (a clickRole button step), next to `FBUnifiedVideoHashtagSearchDialogSnippetQuery`, so a hashtag's results dialog opened in that step.

## What our machine does with it

Nothing. No step of the Reels warm-up opens a hashtag (`src/warmup/facebook/helpers/reel.ts`). The Reels warm-up (`src/warmup/facebook`) checks each step against the page's URL and snapshot (`checkStep`), never against this response, and no code refers to it.

## What can go wrong

None seen: one call, 200 in 2108 ms. A hashtag dialog over the reel can leave a step's expectation unmet (the URL or the snapshot not what it should be); `checkStep` then names what didn't happen. If the step fails anyway, `checkStep` reports it as an issue: `log warmup facebook reel record` goes on and outlines it, a `run` stops there, and a checkpoint or login page ends it as `blocked`.
