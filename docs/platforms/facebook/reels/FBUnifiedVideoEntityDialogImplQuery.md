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

Seen 15 time(s) in 4 run(s).

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
| inspect | step 8: goto /reel/<id> | 1 | 200 | 1072 ms | 10414 ms | — |
| inspect | step 20: dwell 2s | 1 | 200 | 1046 ms | 146932 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T080801_61594063207669**, step 8: goto /reel/<id>: 200, 1072 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "FBUnifiedVideoEntityDialogImplQuery",
  "server_timestamps": "true",
  "variables": {
    "scale": 1,
    "useDefaultActor": false,
    "entityId": "28907750262178382",
    "__relay_internal__pv__FBUnifiedVideoEntityProfileAudioGridFirstPageSizerelayprovider": 4,
    "__relay_internal__pv__FBUnifiedVideoEntityProfileHeaderAudio_comet_reels_audio_dialog_saverelayprovider": true,
    "__relay_internal__pv__FBUnifiedVideoMediaContentContainer_comet_video_document_picture_in_picture_gkrelayprovider": false,
    "__relay_internal__pv__FBUnifiedVideoMediaContentContainer_enable_chapters_pill_gkrelayprovider": false,
    "__relay_internal__pv__ShouldEnableBakedInTextUnifiedVideorelayprovider": false,
    "__relay_internal__pv__FBUnifiedVideoCometVideoMedia_comet_photosensitive_content_warning_gkrelayprovider": false,
    "__relay_internal__pv__FBUnifiedVideoMediaHeaderControls_enable_chapters_pill_gkrelayprovider": false,
    "__relay_internal__pv__FBUnifiedVideoMediaFooter_comet_enable_reels_ads_gkrelayprovider": true,
    "__relay_internal__pv__FBUnifiedVideoMediaFooter_organic_ad_cta_on_comet_gkrelayprovider": false,
    "__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_meta_ai_pill_gkrelayprovider": true,
    "__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_ai_embodiment_chat_pill_gkrelayprovider": false,
    "__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_video_augment_pills_gkrelayprovider": true,
    "__relay_internal__pv__FBUnifiedVideoPlayerScrubber_fb_comet_vpv_heatmap_gkrelayprovider": false,
    "__relay_internal__pv__FBUnifiedVideoDescriptionWithEntities_comet_translations_revamp_sync_caption_with_audio_gkrelayprovider": false,
    "__relay_internal__pv__FBUnifiedVideoFeedbackBar_comet_reels_save_button_gkrelayprovider": false,
    "__relay_internal__pv__usePushPipEngagementCounts_comet_video_document_picture_in_picture_gkrelayprovider": false,
    "__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider": true,
    "__relay_internal__pv__FBUnifiedVideoMenu_fb_reels_ranking_debug_tool_gkrelayprovider": false,
    "__relay_internal__pv__CometAudioLanguageUtils_comet_translations_revamp_preferred_languages_gkrelayprovider": false
  },
  "doc_id": "29652989050968472"
}
```

Answered:

```json
{
  "first": {
    "data": {
      "node": "(11 fields)"
    },
    "extensions": {
      "prefetch_uris_v2": "(2 items)",
      "all_video_dash_prefetch_representations": "(1 items)",
      "server_metadata": "(2 fields)",
      "is_final": false,
      "sr_payload": "(1 fields)"
    }
  },
  "followingParts": 3,
  "parts": [
    {
      "label": "FBUnifiedVideoMediaContentContainer_reels$defer$FBUnifiedVideoMediaFooter_footer_eAnYh",
      "path": "(5 items)",
      "data": "(27 fields)",
      "extensions": "(4 fields)"
    },
    {
      "label": "FBUnifiedVideoMediaTransitionContainer_video$defer$FBUnifiedVideoFeedbackBar_feedback",
      "path": "(5 items)",
      "data": "(13 fields)",
      "extensions": "(3 fields)"
    },
    {
      "label": "VideoPlayerRelay_video$defer$InstreamVideoAdBreaksPlayer_video",
      "path": "(7 items)",
      "data": "(3 fields)",
      "extensions": "(4 fields)"
    }
  ]
}
```

**runs/inspect/20261023T080801_61594063207669**, step 20: dwell 2s: 200, 1046 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "FBUnifiedVideoEntityDialogImplQuery",
  "server_timestamps": "true",
  "variables": {
    "scale": 1,
    "useDefaultActor": false,
    "entityId": "39533688859578633",
    "__relay_internal__pv__FBUnifiedVideoEntityProfileAudioGridFirstPageSizerelayprovider": 4,
    "__relay_internal__pv__FBUnifiedVideoEntityProfileHeaderAudio_comet_reels_audio_dialog_saverelayprovider": true,
    "__relay_internal__pv__FBUnifiedVideoMediaContentContainer_comet_video_document_picture_in_picture_gkrelayprovider": false,
    "__relay_internal__pv__FBUnifiedVideoMediaContentContainer_enable_chapters_pill_gkrelayprovider": false,
    "__relay_internal__pv__ShouldEnableBakedInTextUnifiedVideorelayprovider": false,
    "__relay_internal__pv__FBUnifiedVideoCometVideoMedia_comet_photosensitive_content_warning_gkrelayprovider": false,
    "__relay_internal__pv__FBUnifiedVideoMediaHeaderControls_enable_chapters_pill_gkrelayprovider": false,
    "__relay_internal__pv__FBUnifiedVideoMediaFooter_comet_enable_reels_ads_gkrelayprovider": true,
    "__relay_internal__pv__FBUnifiedVideoMediaFooter_organic_ad_cta_on_comet_gkrelayprovider": false,
    "__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_meta_ai_pill_gkrelayprovider": true,
    "__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_ai_embodiment_chat_pill_gkrelayprovider": false,
    "__relay_internal__pv__FBUnifiedVideoMediaFooter_enable_video_augment_pills_gkrelayprovider": true,
    "__relay_internal__pv__FBUnifiedVideoPlayerScrubber_fb_comet_vpv_heatmap_gkrelayprovider": false,
    "__relay_internal__pv__FBUnifiedVideoDescriptionWithEntities_comet_translations_revamp_sync_caption_with_audio_gkrelayprovider": false,
    "__relay_internal__pv__FBUnifiedVideoFeedbackBar_comet_reels_save_button_gkrelayprovider": false,
    "__relay_internal__pv__usePushPipEngagementCounts_comet_video_document_picture_in_picture_gkrelayprovider": false,
    "__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider": true,
    "__relay_internal__pv__FBUnifiedVideoMenu_fb_reels_ranking_debug_tool_gkrelayprovider": false,
    "__relay_internal__pv__CometAudioLanguageUtils_comet_translations_revamp_preferred_languages_gkrelayprovider": false
  },
  "doc_id": "29652989050968472"
}
```

Answered:

```json
{
  "first": {
    "data": {
      "node": "(11 fields)"
    },
    "extensions": {
      "prefetch_uris_v2": "(3 items)",
      "all_video_dash_prefetch_representations": "(2 items)",
      "server_metadata": "(2 fields)",
      "is_final": false,
      "sr_payload": "(1 fields)"
    }
  },
  "followingParts": 6,
  "parts": [
    {
      "label": "VideoPlayerRelay_video$defer$InstreamVideoAdBreaksPlayer_video",
      "path": "(7 items)",
      "data": "(3 fields)",
      "extensions": "(4 fields)"
    },
    {
      "label": "FBUnifiedVideoMediaContentContainer_reels$defer$FBUnifiedVideoMediaFooter_footer_eAnYh",
      "path": "(5 items)",
      "data": "(27 fields)",
      "extensions": "(3 fields)"
    },
    {
      "label": "FBUnifiedVideoMediaTransitionContainer_video$defer$FBUnifiedVideoFeedbackBar_feedback",
      "path": "(5 items)",
      "data": "(13 fields)",
      "extensions": "(3 fields)"
    }
  ]
}
```

<!-- facts:end -->

## What it does

Loads the data for the video player's entity dialog by `entityId` (`FBUnifiedVideoEntityDialogImpl.react`); the doc lists no fields read. It fired at many Reels steps: gotos to /reel/, clickRole buttons, a dwell, a comments `scrollIn` and the `see owner profile` link.

## What our machine does with it

Nothing. The Reels warm-up (`src/facebook/warmup/activities`) checks each step against the page's URL and snapshot (`checkStep`), never against this response, and no code refers to it.

## What can go wrong

None seen: 12 calls, all 200 in 485-2642 ms. If the step fails anyway, `checkStep` reports it as an issue: `log facebook warmup reel record` goes on and outlines it, a `run` stops there, and a checkpoint or login page ends it as `blocked`.
