# ProfileCometTopAppSectionQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 5 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 12: clickAny 1 x link /see owner profile$/ | 1 | 200 | 1112 ms | 2255 ms | — |
| inspect | step 21: clickAny 1 x link /see owner profile$/ | 1 | 200 | 3910 ms | 1890 ms | — |
| inspect | step 8: clickAny 1 x link /see owner profile$/ | 1 | 200 | 1069 ms | 1918 ms | — |
| inspect | step 19: clickAny 1 x link /see owner profile$/ | 1 | 200 | 1075 ms | 2110 ms | — |
| inspect | step 6: clickAny 1 x link /see owner profile$/ | 1 | 200 | 1618 ms | 2684 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T080801_61594063207669**, step 6: clickAny 1 x link /see owner profile$/: 200, 1618 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "ProfileCometTopAppSectionQuery",
  "server_timestamps": "true",
  "variables": {
    "collectionToken": null,
    "scale": 1,
    "sectionToken": "YXBwX3NlY3Rpb246MTAwMDc4NDQ4NzQyNDU2OjE2ODY4NDg0MTc2ODM3NQ==",
    "useDefaultActor": false,
    "userID": "100078448742456",
    "__relay_internal__pv__FBProfile_enable_perf_improv_gkrelayprovider": true,
    "__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider": false,
    "__relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider": true,
    "__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider": true,
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
  "doc_id": "28515231488168342",
  "fb_api_analytics_tags": [
    "prefetch"
  ]
}
```

Answered:

```json
{
  "first": {
    "data": {
      "node": {
        "__typename": "TimelineAppSection",
        "id": "YXBwX3NlY3Rpb246MTAwMDc4NDQ4NzQyNDU2OjE2ODY4NDg0MTc2ODM3NQ==",
        "section_notice": null,
        "name": "Reels",
        "section_type": "REELS",
        "subtitle": null,
        "url": "https://www.facebook.com/profile.php?id=100078448742456&sk=reels_tab",
        "nav_collections": "(1 fields)",
        "section_actions_renderer": null,
        "all_collections": "(1 fields)",
        "null_state_message": "(7 fields)"
      },
      "user": {
        "timeline_nav_app_sections": "(1 fields)",
        "if_viewer_can_see_profile_paginated_collections_feed": "(4 fields)",
        "id": "100078448742456"
      }
    },
    "extensions": {
      "prefetch_uris_v2": [
        "(5 fields)",
        "(5 fields)",
        "(5 fields)",
        "(5 fields)",
        "(5 fields)",
        "(5 fields)",
        "… 6 more"
      ],
      "all_video_dash_prefetch_representations": [
        "(4 fields)",
        "(4 fields)",
        "(4 fields)",
        "(4 fields)",
        "(4 fields)",
        "(4 fields)",
        "… 4 more"
      ],
      "server_metadata": {
        "request_start_time_ms": 1792742992151,
        "time_at_flush_ms": 1792742992425
      },
      "is_final": false,
      "sr_payload": {
        "ddd": "(4 fields)"
      }
    }
  },
  "followingParts": 70,
  "parts": [
    {
      "label": "FBReelsMediaFooter_footer$defer$CometBrandFundedAffiliateLinkBanner_story",
      "path": [
        "node",
        "all_collections",
        "nodes",
        0,
        "style_renderer",
        "collection",
        "… 5 more"
      ],
      "data": {
        "comet_bf_affiliate_link_data": null
      },
      "extensions": {
        "prefetch_uris_v2": "(7 items)",
        "all_video_dash_prefetch_representations": "(7 items)",
        "is_final": false
      }
    },
    {
      "label": "FBReelsMediaTransitionContainer_video$defer$useFBReelsScrollLogging_reel",
      "path": [
        "node",
        "all_collections",
        "nodes",
        0,
        "style_renderer",
        "collection",
        "… 5 more"
      ],
      "data": {
        "attachments": "(1 items)",
        "tracking": "{\"top_level_post_id\":\"1107265938687642\",\"content_owner_id_new\":\"100078448742456\",\"page_id\":\"113960531206402\",\"story_location\":12,\"story_attachment_style\":\"video_autoplay\",\"video_id\":\"1107265938687642\",\"ent_attachement_type\":\"VideoAttachment\",\"app_id\":\"6628568379\",\"page_insights\":{\"100078448742456\":{\"page_id\":\"100078448742456\",\"page_id_type\":\"page\",\"actor_id\":\"100078448742456\",\"dm\":{\"isShare\":0,\"or… (836 chars)"
      },
      "extensions": {
        "prefetch_uris_v2": "(7 items)",
        "all_video_dash_prefetch_representations": "(7 items)",
        "is_final": false,
        "sr_payload": "(1 fields)"
      }
    },
    {
      "label": "FBReelsMediaTransitionContainer_video$defer$useFBReelsImpressionLogging_reel",
      "path": [
        "node",
        "all_collections",
        "nodes",
        0,
        "style_renderer",
        "collection",
        "… 5 more"
      ],
      "data": {
        "attachments": "(1 items)",
        "tracking": "{\"top_level_post_id\":\"1107265938687642\",\"content_owner_id_new\":\"100078448742456\",\"page_id\":\"113960531206402\",\"story_location\":12,\"story_attachment_style\":\"video_autoplay\",\"video_id\":\"1107265938687642\",\"ent_attachement_type\":\"VideoAttachment\",\"app_id\":\"6628568379\",\"page_insights\":{\"100078448742456\":{\"page_id\":\"100078448742456\",\"page_id_type\":\"page\",\"actor_id\":\"100078448742456\",\"dm\":{\"isShare\":0,\"or… (836 chars)"
      },
      "extensions": {
        "prefetch_uris_v2": "(7 items)",
        "all_video_dash_prefetch_representations": "(7 items)",
        "is_final": false
      }
    }
  ]
}
```

<!-- facts:end -->

## What it does

Loads the tabs under a profile's header (`timeline_nav_app_sections`: Posts, About, Friends, Photos...). Fired once during the host's account check on the own profile, in about 0.4 s.

## What our machine does with it

Nothing: no machine opens the tabs. Its sighting shows the own profile rendered past the header.

## What can go wrong

Nothing for our runs; an error only hides the tab bar.
