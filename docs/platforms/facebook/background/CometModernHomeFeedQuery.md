# CometModernHomeFeedQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29152597714334312` |
| Path | `/api/graphql/` |
| Sends | `RELAY_INCREMENTAL_DELIVERY`, `connectionClass`, `experimentalValues`, `feedClientSession`, `feedEndCursor`, `feedInitialFetchSize`, `feedLocation`, `feedStyle`, `feedbackSource`, `focusCommentID`, `orderby`, `privacySelectorRenderLocation`, `recentVPVs`, `referringStoryRenderLocation`, `refreshMode`, `renderLocation`, `scale`, `shouldChangeBRSLabelFieldName`, `shouldObfuscateCategoryField`, `shouldUseBRSLabelFieldNameV1`, `shouldUseBRSLabelFieldNameV2`, `useDefaultActor`, `__relay_internal__pv__GHLShouldChangeSponsoredAuctionDistanceFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldUseSponsoredAuctionLabelFieldNameV1relayprovider`, `__relay_internal__pv__GHLShouldUseSponsoredAuctionLabelFieldNameV2relayprovider`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider`, `__relay_internal__pv__CometAdsSlotFillLoggingEnabledrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_reactor_facepilerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_social_bubblesrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_post_permalink_white_space_clickrelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider`, `__relay_internal__pv__TestPilotShouldIncludeDemoAdUseCaserelayprovider`, `__relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider`, `__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__CometFeedShareMedia_shouldPrefetchShareImagerelayprovider`, `__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__IsMergQAPollsrelayprovider`, `__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFIShareActionMigrationrelayprovider`, `__relay_internal__pv__CometUFISingleLineUFIrelayprovider`, `__relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider`, `__relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider`, `__relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider`, `__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider`, `__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider` |
| Reads | `viewer....CometNewsFeed_viewerConnection`, `viewer....CometNewsFeed_viewer` |
| Called from | `CometModernHomeFeed.react` |
| rea | `ev_da1ad268ca4313684c468a445e5871c03800873299ca1b002b8c950ea0b4fff9` |

Seen 26 time(s) in 18 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 3005 ms | 13560 ms | — |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 3128 ms | 12028 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 2579 ms | 7044 ms | — |
| warmup | step 11: goto /marketplace/ | 2 | 200 | 3025–3899 ms | 8602–15100 ms | — |
| warmup | step 17: goto /marketplace/ | 1 | 200 | 2931 ms | 12038 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 2948 ms | 1258004 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 2988 ms | 5480 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 3485 ms | 8254 ms | — |
| inspect | step 4: snapshot | 1 | 200 | 3390 ms | 335 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 3090 ms | 6667 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 5114 ms | 103686 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 1 | 200 | 4065 ms | 5691 ms | — |
| inspect | step 4: goto /marketplace/inbox | 1 | 200 | 3883 ms | 558511 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 4472 ms | 59455 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 3384 ms | 11536 ms | — |
| inspect | step 6: goto /marketplace/inbox | 1 | 200 | 4442 ms | 1708095 ms | — |
| inspect | openAny: read /marketplace/item/<id>/ | 1 | 200 | 3647 ms | 15206 ms | — |
| warmup | step 14: goto /marketplace/ | 1 | 200 | 2362 ms | 7187 ms | — |
| inspect | scroll: +386px in 10 wheel steps, 531 ms | 1 | 200 | 3658 ms | 18334 ms | — |
| host | expected ProfileCometProfilePictureSetMutation: sent | 1 | 200 | 4431 ms | 45795 ms | — |
| host | setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9 | 1 | 200 | 3483 ms | 219881 ms | — |
| inspect | step 1: goto /marketplace/status | 1 | 200 | 7960 ms | 12030 ms | — |
| inspect | step 4: goto /marketplace/status | 1 | 200 | 3208 ms | 9206 ms | — |
| host | step 32: goto /marketplace/ | 1 | 200 | 2469 ms | 12646 ms | — |
| host | step 38: goto /marketplace/you/selling | 1 | 200 | 2945 ms | 17036 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, step 32: goto /marketplace/: 200, 2469 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometModernHomeFeedQuery",
  "server_timestamps": "true",
  "variables": {
    "RELAY_INCREMENTAL_DELIVERY": true,
    "connectionClass": "EXCELLENT",
    "feedbackSource": 1,
    "feedInitialFetchSize": 4,
    "feedLocation": "NEWSFEED",
    "feedStyle": "DEFAULT",
    "orderby": [
      "TOP_STORIES"
    ],
    "privacySelectorRenderLocation": "COMET_STREAM",
    "recentVPVs": [],
    "refreshMode": "COLD_START",
    "renderLocation": "homepage_stream",
    "scale": 1,
    "shouldChangeBRSLabelFieldName": false,
    "shouldObfuscateCategoryField": true,
    "shouldUseBRSLabelFieldNameV1": false,
    "shouldUseBRSLabelFieldNameV2": false,
    "useDefaultActor": false,
    "__relay_internal__pv__GHLShouldChangeSponsoredAuctionDistanceFieldNamerelayprovider": true,
    "__relay_internal__pv__GHLShouldUseSponsoredAuctionLabelFieldNameV1relayprovider": true,
    "__relay_internal__pv__GHLShouldUseSponsoredAuctionLabelFieldNameV2relayprovider": false,
    "__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider": true,
    "__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider": true,
    "__relay_internal__pv__CometAdsSlotFillLoggingEnabledrelayprovider": true,
    "__relay_internal__pv__CometFeedStory_enable_reactor_facepilerelayprovider": false,
    "__relay_internal__pv__CometFeedStory_enable_social_bubblesrelayprovider": false,
    "__relay_internal__pv__CometFeedStory_enable_post_permalink_white_space_clickrelayprovider": false,
    "__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider": true,
    "__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider": false,
    "__relay_internal__pv__IsWorkUserrelayprovider": false,
    "__relay_internal__pv__TestPilotShouldIncludeDemoAdUseCaserelayprovider": false,
    "__relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider": true,
    "__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider": true,
    "__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider": true,
    "__relay_internal__pv__CometFeedShareMedia_shouldPrefetchShareImagerelayprovider": true,
    "__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider": false,
    "__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider": false,
    "__relay_internal__pv__IsMergQAPollsrelayprovider": false,
    "__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider": true,
    "__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider": false,
    "__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider": "AUTO_TRANSLATE",
    "__relay_internal__pv__CometUFIShareActionMigrationrelayprovider": true,
    "__relay_internal__pv__CometUFISingleLineUFIrelayprovider": true,
    "__relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider": true,
    "__relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider": true,
    "__relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider": 206,
    "__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider": false,
    "__relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider": false,
    "__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider": true
  },
  "doc_id": "29152597714334312"
}
```

Answered:

```json
{
  "first": {
    "data": {
      "viewer": {
        "news_feed": {
          "edges": "(1 items)"
        },
        "actor": {
          "__typename": "User",
          "name": "Halima Ndjzn",
          "id": "61594285317994"
        },
        "can_have_friends": true,
        "all_friends": {
          "friend_count": 0
        },
        "is_fb_employee": false,
        "rack_qrt_called_during_first_story": false,
        "injected_stories": null
      }
    },
    "extensions": {
      "prefetch_uris_v2": [
        {
          "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/760434761_27873855612276295_9047649971810608122_n.jpg (467 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent.fyvr3-1.fna.fbcdn.net/v/t39.30808-6/861069674_28938005685861277_3550473545109325617_n.jpg (467 chars)",
          "label": null,
          "width": 680,
          "height": null,
          "surface": "comet_home_feed_image"
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1793038330981,
        "time_at_flush_ms": 1793038332547
      },
      "is_final": false,
      "sr_payload": {
        "ddd": {
          "hsrp": "(2 fields)",
          "jsmods": "(3 fields)",
          "allResources": "(7 items)",
          "tieredResources": "(3 fields)"
        }
      }
    }
  },
  "followingParts": 18,
  "parts": [
    {
      "label": "CometNewsFeed_viewerConnection$stream$CometNewsFeed_viewer_news_feed",
      "path": [
        "viewer",
        "news_feed",
        "edges",
        1
      ],
      "data": {
        "brs_content_label": null,
        "cat_sensitive": {
          "enc": null,
          "cat": "FB_SHORTS"
        },
        "deduplication_key": "-9057986082811160850",
        "min_gap_type_index_string": "12",
        "sposnsor_new_distac_action": null,
        "top_story_cache_score": 0,
        "is_ad_eligible_for_ad_pod": false,
        "node": {
          "__typename": "ShowcaseFeedUnit",
          "__isNode": "ShowcaseFeedUnit",
          "id": "UzpfSVNob3djYXNlX1NGVjoyOmVKeXRsMTFRRTFjVXgvZnVocWdFV3JSazFWeG1XanRUcDYzQjJXeXltNnd2blRxYUVSOTRzVS9hbVF6R1pLUmpnVUYwYWgrWTJBKzA2UnF0MmlSOEZCVVJJNGtwS3ZXN2dhWVpiRFBVYW9ZeVNQRmpGQm1sdUNLbEtYN1VkbmF6ZHhPbVBIU2d5VXZ5UCtmbW52Lzl6Ymw3UWg1dVBqUjB3WHVtL1NsNGd5ZUhlaUsrWS91Zm5pQzBhdkw4cnZpWnVLdUFkTmVPSGM5ZGttTU56YzBKdkV6M0w0cGM4STJHUG5WblhYbWxadFZKTzM3NWxmYXNSTVhOMGNQUGs3N09tbWJRVTZIOGlKY0hlTElvdXowQjhKcDZn… (2936 chars)",
          "__isFeedUnit": "ShowcaseFeedUnit",
          "tracking": "{\"qid\":\"-5910552709473123613\",\"mf_story_key\":\"-9057986082811160850\",\"filter\":\"h_nor\",\"sty\":1445,\"story_set_type\":25,\"mf_objid\":\"122149493901088051\",\"viewstate_id\":\"-9057986082811160850\",\"pos\":2,\"partial_response_callsite_id\":-1,\"actrs\":\"61582641546077\",\"fb_shorts_surface\":\"FBShorts_SurfaceType::IFU_TRAY\",\"fb_shorts_ifu_tray_index\":1,\"fb_shorts_ifu_tray_position\":2,\"feed_unified_request_id\":\"-59105… (446 chars)",
          "debug_info": null,
          "showcase_story_type": "SHOWCASE_SHORT_VIDEO",
          "showcase_item": "(6 items)",
          "__module_operation_CometFeedUnitContainerSection_feedUnit": "(1 fields)",
          "__module_component_CometFeedUnitContainerSection_feedUnit": "(1 fields)",
          "__isTrackableFeedUnit": "ShowcaseFeedUnit",
          "trackingdata": "(1 fields)"
        },
        "feed_backend_data": {
          "qid": "-5910552709473123613",
          "original_qid": "-5910552709473123613",
          "vsid": "-9057986082811160850",
          "vspos": 2,
          "should_recent_vpv_fetch_tracking_data": false,
          "serialized_payloads": "GwZGGubUvpeplPuxA8YB4F3sATL8AxjCAcoWtAMGGwFIwAEEbm9uZRsDSbbmAwbe5gMGhOcDBgA="
        },
        "cursor": "FQQVAhsBXAIVBBhcTVRjNU16QXpPRE16TURveE56a3pNRE00TXpNd09qSTZMVGt3TlRjNU9EWXdPREk0TVRFeE5qQTROVEE2TURvdE5Ua3hNRFUxTWpjd09UUTNNekV5TXpZeE16bz0AGwJVHAIYBBUAAA=="
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)"
        ],
        "all_video_dash_prefetch_representations": [
          "(4 fields)",
          "(4 fields)",
          "(4 fields)",
          "(4 fields)",
          "(4 fields)",
          "(4 fields)"
        ],
        "is_final": false,
        "sr_payload": {
          "ddd": "(4 fields)"
        }
      }
    },
    {
      "label": "VideoPlayerRelay_video$defer$InstreamVideoAdBreaksPlayer_video",
      "path": [
        "viewer",
        "news_feed",
        "edges",
        1,
        "node",
        "showcase_item",
        "… 6 more"
      ],
      "data": {
        "id": "2204102610505702",
        "instream_extra_config": {
          "instream_halo_delay_time_seconds": 10
        },
        "instream_video_ad_breaks_comet": null
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)"
        ],
        "all_video_dash_prefetch_representations": [
          "(4 fields)",
          "(4 fields)",
          "(4 fields)",
          "(4 fields)",
          "(4 fields)",
          "(4 fields)"
        ],
        "is_final": false
      }
    },
    {
      "label": "VideoPlayerRelay_video$defer$InstreamVideoAdBreaksPlayer_video",
      "path": [
        "viewer",
        "news_feed",
        "edges",
        1,
        "node",
        "showcase_item",
        "… 6 more"
      ],
      "data": {
        "id": "2675229056239717",
        "instream_extra_config": {
          "instream_halo_delay_time_seconds": 21
        },
        "instream_video_ad_breaks_comet": null
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)"
        ],
        "all_video_dash_prefetch_representations": [
          "(4 fields)",
          "(4 fields)",
          "(4 fields)",
          "(4 fields)",
          "(4 fields)",
          "(4 fields)"
        ],
        "is_final": false
      }
    }
  ]
}
```

**runs/host/20261026T180628_61594285317994**, step 38: goto /marketplace/you/selling: 200, 2945 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometModernHomeFeedQuery",
  "server_timestamps": "true",
  "variables": {
    "RELAY_INCREMENTAL_DELIVERY": true,
    "connectionClass": "EXCELLENT",
    "feedbackSource": 1,
    "feedInitialFetchSize": 4,
    "feedLocation": "NEWSFEED",
    "feedStyle": "DEFAULT",
    "orderby": [
      "TOP_STORIES"
    ],
    "privacySelectorRenderLocation": "COMET_STREAM",
    "recentVPVs": [],
    "refreshMode": "COLD_START",
    "renderLocation": "homepage_stream",
    "scale": 1,
    "shouldChangeBRSLabelFieldName": false,
    "shouldObfuscateCategoryField": true,
    "shouldUseBRSLabelFieldNameV1": false,
    "shouldUseBRSLabelFieldNameV2": false,
    "useDefaultActor": false,
    "__relay_internal__pv__GHLShouldChangeSponsoredAuctionDistanceFieldNamerelayprovider": true,
    "__relay_internal__pv__GHLShouldUseSponsoredAuctionLabelFieldNameV1relayprovider": true,
    "__relay_internal__pv__GHLShouldUseSponsoredAuctionLabelFieldNameV2relayprovider": false,
    "__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider": true,
    "__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider": true,
    "__relay_internal__pv__CometAdsSlotFillLoggingEnabledrelayprovider": true,
    "__relay_internal__pv__CometFeedStory_enable_reactor_facepilerelayprovider": false,
    "__relay_internal__pv__CometFeedStory_enable_social_bubblesrelayprovider": false,
    "__relay_internal__pv__CometFeedStory_enable_post_permalink_white_space_clickrelayprovider": false,
    "__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider": true,
    "__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider": false,
    "__relay_internal__pv__IsWorkUserrelayprovider": false,
    "__relay_internal__pv__TestPilotShouldIncludeDemoAdUseCaserelayprovider": false,
    "__relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider": true,
    "__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider": true,
    "__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider": true,
    "__relay_internal__pv__CometFeedShareMedia_shouldPrefetchShareImagerelayprovider": true,
    "__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider": false,
    "__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider": false,
    "__relay_internal__pv__IsMergQAPollsrelayprovider": false,
    "__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider": true,
    "__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider": false,
    "__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider": "AUTO_TRANSLATE",
    "__relay_internal__pv__CometUFIShareActionMigrationrelayprovider": true,
    "__relay_internal__pv__CometUFISingleLineUFIrelayprovider": true,
    "__relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider": true,
    "__relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider": true,
    "__relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider": 206,
    "__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider": false,
    "__relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider": false,
    "__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider": true
  },
  "doc_id": "29152597714334312"
}
```

Answered:

```json
{
  "first": {
    "data": {
      "viewer": {
        "news_feed": {
          "edges": "(1 items)"
        },
        "actor": {
          "__typename": "User",
          "name": "Halima Ndjzn",
          "id": "61594285317994"
        },
        "can_have_friends": true,
        "all_friends": {
          "friend_count": 0
        },
        "is_fb_employee": false,
        "rack_qrt_called_during_first_story": false,
        "injected_stories": null
      }
    },
    "extensions": {
      "prefetch_uris_v2": [
        {
          "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/801938798_10234805655190677_717144495667367879_n.jpg (438 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent.fyvr3-1.fna.fbcdn.net/v/t39.99422-6/861811071_1355638166481948_8168384254718414366_n.png (466 chars)",
          "label": null,
          "width": 680,
          "height": null,
          "surface": "comet_home_feed_image"
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1793038436445,
        "time_at_flush_ms": 1793038438295
      },
      "is_final": false,
      "sr_payload": {
        "ddd": {
          "hsrp": "(2 fields)",
          "jsmods": "(3 fields)",
          "allResources": "(7 items)",
          "tieredResources": "(3 fields)"
        }
      }
    }
  },
  "followingParts": 18,
  "parts": [
    {
      "label": "CometNewsFeed_viewerConnection$stream$CometNewsFeed_viewer_news_feed",
      "path": [
        "viewer",
        "news_feed",
        "edges",
        1
      ],
      "data": {
        "brs_content_label": null,
        "cat_sensitive": {
          "enc": null,
          "cat": "FB_SHORTS"
        },
        "deduplication_key": "4013517879834734671",
        "min_gap_type_index_string": "12",
        "sposnsor_new_distac_action": null,
        "top_story_cache_score": 0,
        "is_ad_eligible_for_ad_pod": false,
        "node": {
          "__typename": "ShowcaseFeedUnit",
          "__isNode": "ShowcaseFeedUnit",
          "id": "UzpfSVNob3djYXNlX1NGVjoyOmVKeWRsbjlNVTFjVXg5OTlyeTNLZ3cwTmZXZ3Z5WFJ4eGgvRjlEYzgvOW1QYUFkbThZKzV2OVNrMGRwR2xna0VkWm43ZzlUcG1IcytPcWY0S09oUUNXS2wyRUNIVEVVTE5wMWlRL3pCQ0dQTTZLYklBTXVqSW1PSVpsdmU2N3NQbUN3aGxuL0s5NTU3ejdtZmMrNDVwU3F2L3ZTMC8xWXNrTCtjcFpwNnl4dTZlNTRvMVNwcXNPTit1NjhsZytwMS8za3VlZVZjYTkwOG5mY05RODlpcktOZ1gvVEhyOGFHTHhkWGc4NEN0SU5qQVQ2V2s5allBZkRpWXdDSGVQYTFZbnpqT3IzUnBMWG96YlRKa0dVMjZqTnAy… (2764 chars)",
          "__isFeedUnit": "ShowcaseFeedUnit",
          "tracking": "{\"qid\":\"-5910545425283849419\",\"mf_story_key\":\"4013517879834734671\",\"filter\":\"h_nor\",\"sty\":1445,\"story_set_type\":25,\"mf_objid\":\"1657422562408731\",\"viewstate_id\":\"4013517879834734671\",\"pos\":2,\"partial_response_callsite_id\":-1,\"actrs\":\"100044230096053\",\"fb_shorts_surface\":\"FBShorts_SurfaceType::IFU_TRAY\",\"fb_shorts_ifu_tray_index\":1,\"fb_shorts_ifu_tray_position\":2,\"feed_unified_request_id\":\"-59105454… (443 chars)",
          "debug_info": null,
          "showcase_story_type": "SHOWCASE_SHORT_VIDEO",
          "showcase_item": "(6 items)",
          "__module_operation_CometFeedUnitContainerSection_feedUnit": "(1 fields)",
          "__module_component_CometFeedUnitContainerSection_feedUnit": "(1 fields)",
          "__isTrackableFeedUnit": "ShowcaseFeedUnit",
          "trackingdata": "(1 fields)"
        },
        "feed_backend_data": {
          "qid": "-5910545425283849419",
          "original_qid": "-5910545425283849419",
          "vsid": "4013517879834734671",
          "vspos": 2,
          "should_recent_vpv_fetch_tracking_data": false,
          "serialized_payloads": "GwZGGrbkmbHY2vEFxgGA9wLsATL8AxjCAcoWtAMGGwFIwAEEbm9uZRsDSbbmAwbe5gMGhOcDBgA="
        },
        "cursor": "FQQVAhsBXAIVBBhcTVRjNU16QXpPRFF6TmpveE56a3pNRE00TkRNMk9qSTZOREF4TXpVeE56ZzNPVGd6TkRjek5EWTNNVG93T2kwMU9URXdOVFExTkRJMU1qZ3pPRFE1TkRFNU9nPT0AGwJVHAIYBBUAAA=="
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)"
        ],
        "all_video_dash_prefetch_representations": [
          "(4 fields)",
          "(4 fields)",
          "(4 fields)",
          "(4 fields)",
          "(4 fields)",
          "(4 fields)"
        ],
        "is_final": false,
        "sr_payload": {
          "ddd": "(4 fields)"
        }
      }
    },
    {
      "label": "VideoPlayerRelay_video$defer$InstreamVideoAdBreaksPlayer_video",
      "path": [
        "viewer",
        "news_feed",
        "edges",
        1,
        "node",
        "showcase_item",
        "… 6 more"
      ],
      "data": {
        "id": "2204102610505702",
        "instream_extra_config": {
          "instream_halo_delay_time_seconds": 10
        },
        "instream_video_ad_breaks_comet": null
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)"
        ],
        "all_video_dash_prefetch_representations": [
          "(4 fields)",
          "(4 fields)",
          "(4 fields)",
          "(4 fields)",
          "(4 fields)",
          "(4 fields)"
        ],
        "is_final": false
      }
    },
    {
      "label": "VideoPlayerRelay_video$defer$InstreamVideoAdBreaksPlayer_video",
      "path": [
        "viewer",
        "news_feed",
        "edges",
        1,
        "node",
        "showcase_item",
        "… 6 more"
      ],
      "data": {
        "id": "1035027539463897",
        "instream_extra_config": {
          "instream_halo_delay_time_seconds": 15000
        },
        "instream_video_ad_breaks_comet": {
          "mid_rolls": "(2 items)",
          "pre_roll": null,
          "__module_operation_InstreamVideoAdBreaksPlayer_video_instream_video_ad_breaks_comet": "(1 fields)",
          "__module_component_InstreamVideoAdBreaksPlayer_video_instream_video_ad_breaks_comet": "(1 fields)"
        }
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)"
        ],
        "all_video_dash_prefetch_representations": [
          "(4 fields)",
          "(4 fields)",
          "(4 fields)",
          "(4 fields)",
          "(4 fields)",
          "(4 fields)"
        ],
        "is_final": false,
        "sr_payload": {
          "ddd": "(4 fields)"
        }
      }
    }
  ]
}
```

<!-- facts:end -->

## What it does

The home feed's first stories.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
