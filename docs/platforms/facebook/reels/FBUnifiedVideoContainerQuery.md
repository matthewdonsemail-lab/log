# FBUnifiedVideoContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 30 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /reel/ | 4 | 200 | 1007–3015 ms | 2974–7361 ms | — |
| inspect | step 7: clickRole button "…" | 1 | 200 | 1132 ms | 362 ms | — |
| inspect | step 13: clickRole button "…" | 1 | 200 | 4128 ms | 368 ms | — |
| inspect | step 20: clickRole button "…" | 1 | 200 | 1253 ms | 417 ms | — |
| inspect | step 28: clickRole button "…" | 1 | 200 | 3456 ms | 370 ms | — |
| inspect | step 37: clickRole button "…" | 2 | 200 | 1188–3499 ms | 364–1186 ms | — |
| inspect | step 44: clickRole button "…" | 1 | 200 | 3089 ms | 367 ms | — |
| inspect | step 51: clickRole button "…" | 1 | 200 | 1026 ms | 377 ms | — |
| inspect | step 56: clickRole button "…" | 1 | 200 | 3336 ms | 407 ms | — |
| inspect | step 63: clickRole button "…" | 1 | 200 | 1058 ms | 463 ms | — |
| inspect | step 69: clickRole button "…" | 1 | 200 | 3029 ms | 430 ms | — |
| inspect | step 71: goto /reel/ | 1 | 200 | 3110 ms | 3721 ms | — |
| inspect | step 9: clickRole button "…" | 1 | 200 | 1155 ms | 1068 ms | — |
| inspect | step 14: goto /reel/<id> | 1 | 200 | 2028 ms | 3533 ms | — |
| inspect | step 19: clickRole button "…" | 1 | 200 | 1058 ms | 2361 ms | — |
| inspect | step 23: goto /reel/<id> | 1 | 200 | 2399 ms | 1940 ms | — |
| inspect | step 9: goto /reel/<id> | 1 | 200 | 1533 ms | 3049 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 1115 ms | 2082 ms | — |
| inspect | step 20: goto /reel/<id> | 1 | 200 | 1749 ms | 2416 ms | — |
| inspect | step 22: goto /reel/ | 1 | 200 | 2519 ms | 2175 ms | — |
| inspect | step 29: clickRole button "…" | 1 | 200 | 1914 ms | 2539 ms | — |
| inspect | step 53: goto /reel/ | 1 | 200 | 1282 ms | 4886 ms | — |
| inspect | step 65: clickRole button "…" | 1 | 200 | 1032 ms | 2013 ms | — |
| inspect | step 80: clickRole button "…" | 1 | 200 | 3174 ms | 1202 ms | — |
| inspect | step 8: goto /reel/<id> | 1 | 200 | 1261 ms | 4436 ms | — |
| inspect | step 15: clickRole button "…" | 1 | 200 | 1130 ms | 1291 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T080801_61594063207669**, step 1: goto /reel/: 200, 1315 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "FBUnifiedVideoContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "count": 5,
    "cursor": "eyJjdXJzb3IiOiJGUUlWREJzQlhBSVZBQmdmY0RGOFJtZEJWMjlpY1hCd2NtazNNRTAyYTBGU1lta3hPV2wwUkZGQlBRQWJBVlVBQWhVQ0FBPT0iLCJjb3VudCI6MSwiaGx0IjoxNzkyNzQyODk3fQ",
    "scale": 1,
    "should_include_comet_reels_seo_llm_content": false,
    "should_use_stream": true,
    "stream_initial_count": 1,
    "useDefaultActor": false,
    "video_feed_context_data": {
      "arltw_feed_section_type": "FB_SHORTS_CHAINING",
      "in_session_watched_video": null,
      "is_async_ads_enabled": true,
      "is_async_ads_headload_coupling_enabled": true,
      "player_behavior": "UNIFIED_PLAYER_VDD",
      "real_time_ranking_context_data": {
        "recent_vpvs_v2": []
      },
      "request_type": "NORMAL",
      "seed_video_id": null,
      "shorts_search_params": {},
      "surface_type": "FEED_VIDEO_DEEP_DIVE",
      "tracking_code": "",
      "video_channel_entry_point": "NEWSFEED",
      "client_viewer_session_id": "3b01b990-9736-4449-a4a7-1e2ee732f7da"
    },
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
  "doc_id": "29227112143560769"
}
```

Answered:

```json
{
  "first": {
    "data": {
      "viewer": {
        "video_feed_unit_feed": "(1 fields)"
      }
    },
    "extensions": {
      "all_video_dash_prefetch_representations": [
        "(4 fields)"
      ],
      "server_metadata": {
        "request_start_time_ms": 1792742903462,
        "time_at_flush_ms": 1792742903812
      },
      "is_final": false,
      "sr_payload": {
        "ddd": "(4 fields)"
      }
    }
  },
  "followingParts": 20,
  "parts": [
    {
      "label": "VideoPlayerRelay_video$defer$InstreamVideoAdBreaksPlayer_video",
      "path": [
        "viewer",
        "video_feed_unit_feed",
        "edges",
        0,
        "node",
        "attachments",
        "… 2 more"
      ],
      "data": {
        "id": "1607183873661381",
        "instream_extra_config": "(1 fields)",
        "instream_video_ad_breaks_comet": "(4 fields)"
      },
      "extensions": {
        "prefetch_uris_v2": "(2 items)",
        "all_video_dash_prefetch_representations": "(1 items)",
        "is_final": false,
        "sr_payload": "(1 fields)"
      }
    },
    {
      "label": "FBUnifiedVideoMediaContentContainer_reels$defer$FBUnifiedVideoMediaFooter_footer_eAnYh",
      "path": [
        "viewer",
        "video_feed_unit_feed",
        "edges",
        0,
        "node"
      ],
      "data": {
        "sponsored_data": null,
        "click_tracking_linkshim_cb": "AUA51ZF6s2niIHDYAKipAEpkjeqq5b5YwIUeUu31189PPidYqLB6lxFG0hZpCsbAldG7oo3kYwnSziXC98imR6kkfcKLmP44mdF9YoIDeubKIJGwEsd-VJ0vbckyx8cXodF_YimTYb9H_tOpvsfSVadL4vpYrdVzSlPdcROJDM8zr-IuP9m71V53embSAisSpnB7dw3q5ME6745hUKto1P5qmwUw3RyNCxCxXLE",
        "encrypted_click_tracking": "AZgjwJNNu0nQLcX7uKfu3FT9c8Yd4j0d1EvOP6GNBjD6rCu8LxOFbWK1bUy9f_-Ts84INSmU3B2DeDHeZPlNRakYDfDt3ST1knLj3gu-g7uMTmSe9TH828yW3YlrntkHfCaRgOYYer6wSmsr39NlzrjlJpO8J3_92-SwSawl0Ng9Iv2Sr5P0hREVceFm2DqLowiTnk9g",
        "encrypted_tracking": "AZgMK2VwINZ8p3Ppdy0TMcRfdU3V2I7fbQBUunuaJ1cIaIB1_vrY-Z55z_s699QrmFoFo-NP8DL2mfs32IuuX467nnshS5am5XOFgxa9BqmkdSgeqEmPZk5zr_HCV7eGrH1ctBi9V1YINGzO1eVyiYtMSDRLkgawvTv9mZGJNxINjJRdsXtkZzih08h4slPUT9PdTIJSFBnEHaPulK-YmYQG-ymIQVMXEAsUn15En7YkM1V9AyB2aSbfRh8T4xMMvIm6RCTIzaRDnOl3C4r36iOk5v5HAg1uXVU52kAVEEbjloNEEaJBRhv5rimIeN0t0R3ii-Xnu_a_3Jbos7SfqEUjlJFOZLL_d1eGx9QsqdiGmucw9egptV7PAC0cjnIOFuEia06YJ2fqSZru… (2148 chars)",
        "attachments": "(1 items)",
        "inform_treatment_for_community_notes": null,
        "privacy_scope": "(5 fields)",
        "actors": "(1 items)",
        "ai_generated_self_disclosure_renderer": null,
        "music_attribution_metadata_renderer": "(3 fields)",
        "id": "UzpfSUZTOjE6LTU5MzA4NTQ3MDIzMjI2MjYxOTM6ZUp3VCs3SDEwYzMzVXhwWk5HWEVZRXhSTnJFUEIyWWNXM1ZRVit6UHoxTnJlY1V1WGIreGx0ZFNScVNCU1kzQkZDeGs5bTNML28yR2NCMXBVUFdyUmQyWVlHSjkwandyNm1DY1U0eE05NWk2bnJmOTIvTHVGdXM3WnBqd08rNmtkU3diZGo5ZHNucmZhbzRqeVMwdE4vczN2RFIrczVxUjZkcHhSb1pEQmlvTFpqSXl6T0RXbUdZSjA3RnRIeVBEcHpPTWJGM1NrODZ4OUVpTFNjRWtSTUF1a21iMCtOYk1wRitTV0JCZm1wZVpscG1hRWwrU24xWWFYNXlSWDFRU241WmZsQnRmbHBtU21o… (520 chars)",
        "post_id": "1128457519779196",
        "tracking": "{\"qid\":\"-5930854702322626193\",\"mf_story_key\":\"1128457519779196\",\"top_level_post_id\":\"1128457519779196\",\"content_owner_id_new\":\"100078448742456\",\"page_id\":\"113960531206402\",\"story_location\":125,\"story_attachment_style\":\"video_autoplay\",\"view_time\":1792742897,\"filter\":\"fb_shorts\",\"video_id\":\"1607183873661381\",\"sty\":128,\"mf_objid\":\"1128457519779196\",\"ent_attachement_type\":\"VideoAttachment\",\"app_id\":\"… (1581 chars)",
        "creation_time": 1792630398,
        "creator_collaboration": null,
        "shouldUseCollabsFollowButton": false,
        "is_reshare": false,
        "sponsor_relationship": 0,
        "should_show_affiliate_commission_eligible_label_m2": false,
        "branded_content_post_info": null,
        "media_attribution_elements": "(0 items)",
        "feedback": "(2 fields)",
        "message": "(2 fields)",
        "comet_affiliate_reels_eyebrow": null,
        "translated_message_for_viewer": null,
        "to": null,
        "ai_generated_detected_info": "(3 fields)"
      },
      "extensions": {
        "prefetch_uris_v2": "(2 items)",
        "all_video_dash_prefetch_representations": "(1 items)",
        "is_final": false
      }
    },
    {
      "label": "FBUnifiedVideoMediaTransitionContainer_video$defer$FBUnifiedVideoFeedbackBar_feedback",
      "path": [
        "viewer",
        "video_feed_unit_feed",
        "edges",
        0,
        "node"
      ],
      "data": {
        "id": "UzpfSUZTOjE6LTU5MzA4NTQ3MDIzMjI2MjYxOTM6ZUp3VCs3SDEwYzMzVXhwWk5HWEVZRXhSTnJFUEIyWWNXM1ZRVit6UHoxTnJlY1V1WGIreGx0ZFNScVNCU1kzQkZDeGs5bTNML28yR2NCMXBVUFdyUmQyWVlHSjkwandyNm1DY1U0eE05NWk2bnJmOTIvTHVGdXM3WnBqd08rNmtkU3diZGo5ZHNucmZhbzRqeVMwdE4vczN2RFIrczVxUjZkcHhSb1pEQmlvTFpqSXl6T0RXbUdZSjA3RnRIeVBEcHpPTWJGM1NrODZ4OUVpTFNjRWtSTUF1a21iMCtOYk1wRitTV0JCZm1wZVpscG1hRWwrU24xWWFYNXlSWDFRU241WmZsQnRmbHBtU21o… (520 chars)",
        "video": "(1 fields)",
        "attachments": "(1 items)",
        "feedback": "(5 fields)",
        "fb_reel_react_button": "(4 fields)",
        "click_tracking_linkshim_cb": "AUBrQtaj_OIYfp8hqxDtUwISzUvgUp43q1gKrn6axrV1IecyVZFjxDkMapHxmgCDOXYPQw284vram7nNkqEXQhf6KNB24QVlLsOdZcoluno78oSY6fgcfLwiZf6MgfWmVpX6ALzVpTYv7fbx5luIh7Lu1k6Rr33txqIUBpibyPlAm7nwZ9Qs70Ty2uiJFeev71yWcRabXkSYqGGqGEvKJsA6XC_gaUjAUot84fs",
        "encrypted_click_tracking": "AZi4q9iAkKAhFK6OQqSo2vbGzBUALjPAior-cWODP-OZxPr07fxrZxXjtZ0O0JtYUdOVnJPp2d3ZFkl5p7g077DR1T8U4vh48uLOaaKzZ3CsUUZ21DzFocNJGmIsWGA4fdHSTVwBWW2VJTyh5SE-nQLN0to15AIcJfiDttGR1VhBGV41kjejF2JLRymxp3QrXsLtxveN",
        "encrypted_tracking": "AZj-D9qmTRycQ6aAXY8VChniQS-XA9Xd-LYJzEQsJeeHZR7Hg-ZowoV-IZdgBgHhERbCL5uZovdVZSM9xuQyd1G6yIyNLNifWxrh5D2Sx0EKZIyMM5x7w0uo90oaMvbWJKnwYNHPZSHpgWHdv873BeQx1Ys9f8JsahbJQDDmzB2ou06RmXuM8JVkClJPh35ggib7N5AtgF0jxJCKI2T4VkP-lCn3lDPZw-_WlwQsIIgjnhitDMj9DpNyXbEY9d8uLGeh6cW2ix-bI8lCkgerfyvvtFGIv2UIk6OQ5YmNa7I9mK9yCAVT-Gfb0zy5JiFuzLQarXoOs_kztKhfEYjDV6M_k244EJbVjjCcDq4bpacVxNz67AbAF2iwtyaCEnY9_GlRS7TZ2AWqEpo9… (2148 chars)",
        "sponsored_data": null,
        "post_id": "1128457519779196",
        "tracking": "{\"qid\":\"-5930854702322626193\",\"mf_story_key\":\"1128457519779196\",\"top_level_post_id\":\"1128457519779196\",\"content_owner_id_new\":\"100078448742456\",\"page_id\":\"113960531206402\",\"story_location\":125,\"story_attachment_style\":\"video_autoplay\",\"view_time\":1792742897,\"filter\":\"fb_shorts\",\"video_id\":\"1607183873661381\",\"sty\":128,\"mf_objid\":\"1128457519779196\",\"ent_attachement_type\":\"VideoAttachment\",\"app_id\":\"… (1581 chars)",
        "url": "https://www.facebook.com/reel/1607183873661381/",
        "comet_unified_video_menu_trigger": "(4 fields)"
      },
      "extensions": {
        "prefetch_uris_v2": "(2 items)",
        "all_video_dash_prefetch_representations": "(1 items)",
        "is_final": false
      }
    }
  ]
}
```

**runs/inspect/20261023T080801_61594063207669**, step 8: goto /reel/<id>: 200, 1261 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "FBUnifiedVideoContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "count": 5,
    "cursor": "eyJjdXJzb3IiOiJGUVFWREJzQlhBSVZCQmdmY0RGOFJtZEJWM1l2ZVdRcmNtNXFlazAyYTBGU1lrOHlaR2wwUkZGQlBRQWJBVlVBQkJVQUFBPT0iLCJjb3VudCI6MSwiaGx0IjoxNzkyNzQzMDE1fQ",
    "scale": 1,
    "should_include_comet_reels_seo_llm_content": false,
    "should_use_stream": true,
    "stream_initial_count": 0,
    "useDefaultActor": false,
    "video_feed_context_data": {
      "arltw_feed_section_type": "FB_SHORTS_CHAINING",
      "in_session_watched_video": null,
      "is_async_ads_enabled": true,
      "is_async_ads_headload_coupling_enabled": true,
      "player_behavior": "UNIFIED_PLAYER_VDD",
      "real_time_ranking_context_data": {
        "recent_vpvs_v2": []
      },
      "request_type": "NORMAL",
      "seed_video_id": "1607183873661381",
      "shorts_search_params": {},
      "surface_type": "FEED_VIDEO_DEEP_DIVE",
      "tracking_code": "",
      "video_channel_entry_point": "NEWSFEED"
    },
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
  "doc_id": "29227112143560769"
}
```

Answered:

```json
{
  "first": {
    "data": {
      "viewer": {
        "video_feed_unit_feed": "(1 fields)"
      }
    },
    "extensions": {
      "server_metadata": {
        "request_start_time_ms": 1792743020108,
        "time_at_flush_ms": 1792743020385
      },
      "is_final": false
    }
  },
  "followingParts": 21,
  "parts": [
    {
      "label": "FBUnifiedVideoContainer_reels$stream$FBUnifiedVideoContainer_video_feed_unit_feed",
      "path": [
        "viewer",
        "video_feed_unit_feed",
        "edges",
        0
      ],
      "data": {
        "node": "(11 fields)",
        "cursor": null
      },
      "extensions": {
        "all_video_dash_prefetch_representations": "(1 items)",
        "is_final": false,
        "sr_payload": "(1 fields)"
      }
    },
    {
      "label": "VideoPlayerRelay_video$defer$InstreamVideoAdBreaksPlayer_video",
      "path": [
        "viewer",
        "video_feed_unit_feed",
        "edges",
        0,
        "node",
        "attachments",
        "… 2 more"
      ],
      "data": {
        "id": "1369485747896897",
        "instream_extra_config": "(1 fields)",
        "instream_video_ad_breaks_comet": "(4 fields)"
      },
      "extensions": {
        "prefetch_uris_v2": "(2 items)",
        "all_video_dash_prefetch_representations": "(1 items)",
        "is_final": false,
        "sr_payload": "(1 fields)"
      }
    },
    {
      "label": "FBUnifiedVideoMediaContentContainer_reels$defer$FBUnifiedVideoMediaFooter_footer_eAnYh",
      "path": [
        "viewer",
        "video_feed_unit_feed",
        "edges",
        0,
        "node"
      ],
      "data": {
        "sponsored_data": null,
        "click_tracking_linkshim_cb": "AUA7ypNiKb4gIjlrjkV4JpszdWU83i5kiomzVrGy_NL_m_SHk39m6YzJpuVrbEeg0AO66fvpXQJFo5GXLi8OG8qoLsgsh6sswZ1FfmMQ1bBCBtM22ZkRZSC2F4NWkBmOFk2uLSHvJP_5wfykaCB2FIPUf5O4-i9zFAYN2fTWQ243WLMHojmRPdiOmQTY5D8TPUZ8ImhZHcLcSMxiF6z__GV1sYvrBUvJOkZvZdc",
        "encrypted_click_tracking": "AZgdK8lTe4MvEpeUbgrKEHgWK-dvRZ1BuSUquYBhd5tHA6El_Y69lxqBRfyK2_zA_wXIXuxDWhdAEOyyJ_DysixihKhA6sk1Ez-_Z90DmKULUDwy9PEa-AKLfPmjlsFE__RS2ntBVkNdghFRTeMpTheh2RH8FZrplCdS-rsRppn7zkMdZWCJYCbrxMwGG3WH1-uMnss8",
        "encrypted_tracking": "AZjcvGyhuKwVcupW3rCiisOk9iMkV_xmQstJ7sTKOTw8JbC4h_3BPPFxgHJ-JDn9qkRatCF7iPfae9MDgT68BKTx04WCcWqF7VgyX7ZYJPIl03jn_wxadY2HoKYscFP-BDSeUFd-3HfoLfFVN9GOAtYzqRVZsTVfOLPQiLEmIrjBcpJclM_3stlDxzh-03B1Me2_caf5Jd1q-jHwc30hFRc8EK1d03cogaVJLbevTrjiGGKkCdf_cV2NbM0nHOGPn5EY0Y0idGM-OfXNW1oYy2GDcRG6FpyD3dy6YXX0Dbs6PhPDyQveFvm0zF4JsumnbDtCsFjY6wH1aTx_Gd_LuiU2IhlFgJFJSHL8cdezIWM-jkVsw3tFHnsbtKHkvm9yYpJwWMvA_RtRTljZ… (2235 chars)",
        "attachments": "(1 items)",
        "inform_treatment_for_community_notes": null,
        "privacy_scope": "(5 fields)",
        "actors": "(1 items)",
        "ai_generated_self_disclosure_renderer": null,
        "music_attribution_metadata_renderer": "(3 fields)",
        "id": "UzpfSUZTOjE6LTU5MzA4NDY1OTM2NDY1NzUzOTI6ZUp3VFc3QjY1cHRGSjE2emFNcUl3WmlpYkdLclhpMy9mUHFBcnRpaCtSZVg4NHE5dVh4akxhK2xqRWdEa3hxREtWakk3TTJQbnU3cG15M2dldEtnT2xhTHVqSEJ4RDZkWVdSYk1KT1I0UlFqMHoybXBzNWRQNDQvZXNmeWpoa21mZTA0SThNNmxnMjdueTVadlc4MXg1SGtPUmVlL3BpOTlpclRJUU9WYmZzWUdXWndhN3pqcnBwbUNWUCtaalVqMDRvNkdLOUxlbFZIVG8vMEU2WSthUllwbUtBSTFGWFNqQjVUR3BpWVV2UGd6cE5tOUp6WHlDd0djd1FEZzdoRHdRTUdFRkJsa21aMGc1… (452 chars)",
        "post_id": "1362437022624464",
        "tracking": "{\"qid\":\"-5930846593646575392\",\"mf_story_key\":\"1362437022624464\",\"top_level_post_id\":\"1362437022624464\",\"content_owner_id_new\":\"100065745369749\",\"page_id\":\"750643774796814\",\"story_location\":125,\"story_attachment_style\":\"video_autoplay\",\"view_time\":1792743015,\"filter\":\"fb_shorts\",\"video_id\":\"1369485747896897\",\"sty\":128,\"mf_objid\":\"1362437022624464\",\"ent_attachement_type\":\"VideoAttachment\",\"app_id\":\"… (1646 chars)",
        "creation_time": 1786390497,
        "creator_collaboration": null,
        "shouldUseCollabsFollowButton": false,
        "is_reshare": false,
        "sponsor_relationship": 0,
        "should_show_affiliate_commission_eligible_label_m2": false,
        "branded_content_post_info": null,
        "media_attribution_elements": "(0 items)",
        "feedback": "(2 fields)",
        "message": "(2 fields)",
        "comet_affiliate_reels_eyebrow": null,
        "translated_message_for_viewer": null,
        "to": null,
        "ai_generated_detected_info": "(3 fields)"
      },
      "extensions": {
        "prefetch_uris_v2": "(2 items)",
        "all_video_dash_prefetch_representations": "(1 items)",
        "is_final": false
      }
    }
  ]
}
```

**runs/inspect/20261023T080801_61594063207669**, step 15: clickRole button "…": 200, 1130 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "FBUnifiedVideoContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "count": 5,
    "cursor": "eyJjdXJzb3IiOiJGUTRWREJzQlhBSVZEaGhEY0RGOFJtZHZWM1l2ZVdRcmNtNXFlazAyYTBGU1lrOHlaR2wwUkZKblUySlhPWGxhTWtaMVpESkdjMlJIT1hWWk1qa3hZbTVTTlU5QlVuUmtNbU40UVVFOVBRQWJBVlVBRGhVQ0tCSnRiM0puWVc1M1lXeDBiMjVqYjNWdWRIa1lCRzEzWnpFQSIsImNvdW50Ijo2LCJobHQiOjE3OTI3NDMwMTV9",
    "scale": 1,
    "should_include_comet_reels_seo_llm_content": false,
    "should_use_stream": true,
    "stream_initial_count": 0,
    "useDefaultActor": false,
    "video_feed_context_data": {
      "arltw_feed_section_type": "FB_SHORTS_CHAINING",
      "in_session_watched_video": null,
      "is_async_ads_enabled": true,
      "is_async_ads_headload_coupling_enabled": true,
      "player_behavior": "UNIFIED_PLAYER_VDD",
      "real_time_ranking_context_data": {
        "recent_vpvs_v2": []
      },
      "request_type": "NORMAL",
      "seed_video_id": "1607183873661381",
      "shorts_search_params": {},
      "surface_type": "FEED_VIDEO_DEEP_DIVE",
      "tracking_code": "",
      "video_channel_entry_point": "NEWSFEED"
    },
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
  "doc_id": "29227112143560769"
}
```

Answered:

```json
{
  "first": {
    "data": {
      "viewer": {
        "video_feed_unit_feed": "(1 fields)"
      }
    },
    "extensions": {
      "server_metadata": {
        "request_start_time_ms": 1792743104142,
        "time_at_flush_ms": 1792743104473
      },
      "is_final": false
    }
  },
  "followingParts": 17,
  "parts": [
    {
      "label": "FBUnifiedVideoContainer_reels$stream$FBUnifiedVideoContainer_video_feed_unit_feed",
      "path": [
        "viewer",
        "video_feed_unit_feed",
        "edges",
        0
      ],
      "data": {
        "node": "(11 fields)",
        "cursor": null
      },
      "extensions": {
        "all_video_dash_prefetch_representations": "(1 items)",
        "is_final": false,
        "sr_payload": "(1 fields)"
      }
    },
    {
      "label": "VideoPlayerRelay_video$defer$InstreamVideoAdBreaksPlayer_video",
      "path": [
        "viewer",
        "video_feed_unit_feed",
        "edges",
        0,
        "node",
        "attachments",
        "… 2 more"
      ],
      "data": {
        "id": "1111556267957137",
        "instream_extra_config": "(1 fields)",
        "instream_video_ad_breaks_comet": null
      },
      "extensions": {
        "prefetch_uris_v2": "(1 items)",
        "all_video_dash_prefetch_representations": "(1 items)",
        "is_final": false,
        "sr_payload": "(1 fields)"
      }
    },
    {
      "label": "FBUnifiedVideoMediaContentContainer_reels$defer$FBUnifiedVideoMediaFooter_footer_eAnYh",
      "path": [
        "viewer",
        "video_feed_unit_feed",
        "edges",
        0,
        "node"
      ],
      "data": {
        "sponsored_data": null,
        "click_tracking_linkshim_cb": "AUDU5wMYfmKJO8Wx8yHxN8Kctsm1bK-zowf6lhnTU_dTYKmJtDsjsbuzfQZS8vFDK94p6Fq5pla01kh5QcV2-QqpmBAHjconhlbqPZYHpseuB91rEb-Nsd2j3g0dIKBA6WVKD5G5IPZiOrJPgb6-Se39IGWVY21VZov0oIDVd8jt2fvs_8jdi0BFs-RbQ4k6T7Uy6HudDI1ESQsPNGzi2ZBKpbPa46vcUdehE_SjZF53shNa",
        "encrypted_click_tracking": "AZgYNLjNxqtqn_vfZ5q3ryhz1bl2KJs5tbizJcrD8AlnZmt9njpuL2xJCQMccsnIcKOUWCzanUEOGKbRoGRpcDNp7dGp_qOy_I5By4R-qBhBUGE__8CPFVqFOjOX0Ss6ZYNBEoshafvIs_VYjEUgL9W8OchKLhFCI86E4oydAawkjC1hQ9mwPmuSb4L_mGJSAb_xk_NI6jZDkuDMNQ",
        "encrypted_tracking": "AZggUDWgve_XEnV_DqbpYRsrCvjZZzc8Yh3ec79N_ZoBzVBLzkNHcJ40J662lLeb4Q5XqyBntRu2mzEXhPU_hI4qJfuoVUDyB8DvSkDB9Fm59eHapae50owh8bihCyowBVu1LNnnTw2DrKC0O1aotqowFmQeSqjjlOaX7uK1f3poYOzKLTZOEYoVGYO3oXBLH2k1awh6sU5nHSQ8Nx_J2kiFjOn58hOewXkFh_lXD5EdGgaMsIKTKl3HpzfwoVhCx5begIAAGwW8jn8o0pvErts8l8Qqj409P7jVUFwtAZnuSYPYx1E20ZDtvOoBocGJ8BNOWUA1bY30twYdozEGIO-706gM3qICR_ZwL64FrWvIH26fNz87cTg0Nn-VcaFlsmqw9EvL5BfXgC21… (2179 chars)",
        "attachments": "(1 items)",
        "inform_treatment_for_community_notes": null,
        "privacy_scope": "(5 fields)",
        "actors": "(1 items)",
        "ai_generated_self_disclosure_renderer": null,
        "music_attribution_metadata_renderer": "(3 fields)",
        "id": "UzpfSUZTOjE6LTU5MzA4NDY1OTM2NDY1NzUzOTI6ZUp3VDIvSC8zYUl2RHo5c1pOYVVFWU96UmRuRTFuUnQyRE92VVViczBjUkphM25GRmx5L3NaYlhVa2FrZ1VtTndSUXNaTFpnNTVQblcwUVFldEtnT2xhTHVqSEJCVmZVd1ptZnpqQ3luV0prdXNlMDZOMi80OTE3ZnpLL1k0Ykx2Vm5OeUxTT3BVWHlrQUhETkV1NDZMWjlqQXd6dUZuZWNYTWRTVDR5NWVhR3RaUGZzRnc3enNqUUpmMWpEV2VQTkZPZk5OT0NtWXdNVW5BTkloQTNTVE42Zkd0bXNpeEpMSWhQTGtwTkxNbk16NHRQS2kwcHljK0x6OHlMTDg3SUx5cUpUOHN2eW8wdnkw… (532 chars)",
        "post_id": "122126637573464028",
        "tracking": "{\"qid\":\"-5930846593646575392\",\"mf_story_key\":\"122126637573464028\",\"top_level_post_id\":\"122126637573464028\",\"content_owner_id_new\":\"61593920864918\",\"page_id\":\"1363726926816546\",\"story_location\":125,\"story_attachment_style\":\"fb_shorts_creation\",\"view_time\":1792743015,\"filter\":\"fb_shorts\",\"video_id\":\"1111556267957137\",\"sty\":128,\"mf_objid\":\"122126637573464028\",\"ent_attachement_type\":\"FBShortsStoryAtta… (1604 chars)",
        "creation_time": 1792164977,
        "creator_collaboration": null,
        "shouldUseCollabsFollowButton": false,
        "is_reshare": false,
        "sponsor_relationship": 0,
        "should_show_affiliate_commission_eligible_label_m2": false,
        "branded_content_post_info": null,
        "media_attribution_elements": "(0 items)",
        "feedback": "(2 fields)",
        "message": null,
        "comet_affiliate_reels_eyebrow": null,
        "translated_message_for_viewer": null,
        "to": null,
        "ai_generated_detected_info": "(3 fields)"
      },
      "extensions": {
        "prefetch_uris_v2": "(2 items)",
        "all_video_dash_prefetch_representations": "(1 items)",
        "is_final": false,
        "sr_payload": "(1 fields)"
      }
    }
  ]
}
```

<!-- facts:end -->

## What it does

Loads the Reels feed in Facebook's unified video player (`FBUnifiedVideoContainer_reels`), paged by `count` and `cursor`, with the `video_feed_context_data` it sends. It fired on every goto /reel/ (2-5 s after the step started) and after some `Next card` clicks, so it loads the first reels and fetches more as the feed moves on.

## What our machine does with it

No state reads it. The Reels warm-up checks where it landed instead: `openReels` expects the URL to match `/reel/\d+`, and each `swipe` (`Next card`) expects the URL to change to the next reel (`checkStep`).

## What can go wrong

None seen: 15 calls, all 200 in 1032-3499 ms. If the feed did not load, `openReels` would not reach a `/reel/<id>` URL or a swipe would leave the URL unchanged, and `checkStep` names it. If the step fails anyway, `checkStep` reports it as an issue: `log facebook warmup reel record` goes on and outlines it, a `run` stops there, and a checkpoint or login page ends it as `blocked`.
