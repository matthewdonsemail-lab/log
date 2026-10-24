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
| rea | `ev_115730b4ac8c47f6922201d9452d5fe5b45d8f0086285216bf40009f9303cb0a` |

Seen 20 time(s) in 13 run(s).

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

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/warmup/20261023T074930_61594063207669**, step 11: goto /marketplace/: 200, 3025 ms

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
    "__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider": false
  },
  "doc_id": "28651572944522952"
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
          "name": "Bethlehem Trash",
          "id": "61594063207669"
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
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/462209792_1682975165831226_6278810203753941575_n.jpg?stp=cp0_dst-jpg_tt6&cstp=mx943x960&ctp=s24x24&_nc_cat=100&ccb=1-7&_nc_sid=e99d92&_nc_ohc=87DnGcAiuIgQ7kNvwEwlbTw&_nc_oc=AdrlwDuB4MzCswEUIdlAJosoN8LPdbTXjHYu6zl-79xjJH1cQZyMqcPEnIF6d-u0-xM&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=eaXKiHlAjH6fVNiVk1jP_g&_nc_ss=792a8&oh=00_AQNKAb_uRgPq99a16wmZIg… (436 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/486386928_1805101740285234_8116276554609323478_n.jpg?stp=dst-jpg_tt6&cstp=mx665x660&ctp=p526x296&_nc_cat=106&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=JuxsfWzUbPwQ7kNvwELgCy4&_nc_oc=AdqlCYnIUsLlKlmM64w44IqdJv1SYB47K5s4FUyVYKwwsvDoePN30bYwtXqdubKSWM0&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=eaXKiHlAjH6fVNiVk1jP_g&_nc_ss=792a8&oh=00_AQO9LYQl5ztdMLi6vGQnxTwa… (434 chars)",
          "label": null,
          "width": 680,
          "height": null,
          "surface": "comet_home_feed_image"
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1792742237948,
        "time_at_flush_ms": 1792742239142
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
  "followingParts": 10,
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
        "deduplication_key": "-449853844466607017",
        "min_gap_type_index_string": "12",
        "sposnsor_new_distac_action": null,
        "top_story_cache_score": 0,
        "is_ad_eligible_for_ad_pod": false,
        "node": {
          "__typename": "ShowcaseFeedUnit",
          "__isNode": "ShowcaseFeedUnit",
          "id": "UzpfSVNob3djYXNlX1NGVjoyOmVKeWwxMjFNRTJjY0FQQjdLUlVwYkdyZ2REeEUwVTNqQXJocjczcnQ4V0ZiekNScUZ2ZkJKVXZVcE1QYVJoSUZVcXZSZlNBd0JVMjlOVWJaQ2Rsa3hOY3F0UXBXbzh3WDdDb2dRUVIwdnN1bVRsVEVFM3hocUVTV2UzclBBeWdmRm9BdjEvLy9lZnI4Ly9manVlZGdXcnhITnhSMmxwNk8vVlJpYWc5V1hyeFQrNmFTVHRBekoyK1g3eXdzU0dLcWI3UWNqRXNabStFZlA4czN4WFJqS3RHYWU3L2xydzN0bSs4MzdTWXY1K0lwc2tSU1BmTmlncTBrVmZRTFNRRnFibTBSdFdTK2tlTlRCYU5aNUZtQk03RVdR… (3052 chars)",
          "__isFeedUnit": "ShowcaseFeedUnit",
          "tracking": "{\"qid\":\"-5930900063348384100\",\"mf_story_key\":\"-449853844466607017\",\"filter\":\"h_nor\",\"sty\":1445,\"story_set_type\":25,\"mf_objid\":\"122150360469351267\",\"viewstate_id\":\"-449853844466607017\",\"pos\":2,\"partial_response_callsite_id\":-1,\"actrs\":\"61590538032990\",\"fb_shorts_surface\":\"FBShorts_SurfaceType::IFU_TRAY\",\"fb_shorts_ifu_tray_index\":1,\"fb_shorts_ifu_tray_position\":2,\"feed_unified_request_id\":\"-5930900… (444 chars)",
          "debug_info": null,
          "showcase_story_type": "SHOWCASE_SHORT_VIDEO",
          "showcase_item": "(6 items)",
          "__module_operation_CometFeedUnitContainerSection_feedUnit": "(1 fields)",
          "__module_component_CometFeedUnitContainerSection_feedUnit": "(1 fields)",
          "__isTrackableFeedUnit": "ShowcaseFeedUnit",
          "trackingdata": "(1 fields)"
        },
        "feed_backend_data": {
          "qid": "-5930900063348384100",
          "original_qid": "-5930900063348384100",
          "vsid": "-449853844466607017",
          "vspos": 2,
          "should_recent_vpv_fetch_tracking_data": false,
          "serialized_payloads": "GwZGGsatsc/hxvuxA8YBsOcC7AEy/AMYwgHKFrQDBhsBSMABBG5vbmUbA0m25gMG3uYDBoTnAwYA"
        },
        "cursor": "FQQVAhsBXAIVBBhcTVRjNU1qYzBNakl6TnpveE56a3lOelF5TWpNM09qSTZMVFEwT1RnMU16ZzBORFEyTmpZd056QXhOem93T2kwMU9UTXdPVEF3TURZek16UTRNemcwTVRBd09nPT0AGwJVAgIYBBUAAA=="
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
        "id": "887981457637849",
        "instream_extra_config": {
          "instream_halo_delay_time_seconds": 2
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
        "id": "979797588449358",
        "instream_extra_config": {
          "instream_halo_delay_time_seconds": 26
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

**runs/warmup/20261023T074930_61594063207669**, step 14: goto /marketplace/: 200, 2362 ms

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
    "__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider": false
  },
  "doc_id": "28651572944522952"
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
          "name": "Bethlehem Trash",
          "id": "61594063207669"
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
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/529746677_24667720239520157_119063301246289542_n.jpg?stp=c0.0.720.720a_cp0_dst-jpg_tt6&cstp=mx720x720&ctp=s24x24&_nc_cat=110&ccb=1-7&_nc_sid=e99d92&_nc_ohc=MsjEjb-BA18Q7kNvwF2Ce28&_nc_oc=AdoYT8f50sFlrlqsKmgX13HS-O8rE7Y0vZr9Cw3mIlO3pnodE1Q47tmWU7RuP-2PRq0&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=mZF80tCibFxm7uW2DUWLFw&_nc_ss=792a8&oh=00_AQOVsIc9… (450 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1792742396554,
        "time_at_flush_ms": 1792742397919
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
  "followingParts": 10,
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
        "deduplication_key": "-8984038748765657249",
        "min_gap_type_index_string": "12",
        "sposnsor_new_distac_action": null,
        "top_story_cache_score": 0,
        "is_ad_eligible_for_ad_pod": false,
        "node": {
          "__typename": "ShowcaseFeedUnit",
          "__isNode": "ShowcaseFeedUnit",
          "id": "UzpfSVNob3djYXNlX1NGVjoyOmVKeXRsMnRzVTJVWXg4OTdUcWxJTjROa08ycmZSaWVLd2JqRmMzb3U3ZUdMbCtnQ3hHQWlmZ0tUWmh1dExORnRLY1dvSDViTnlWaktzVTYzSElxWE9lYkVidXZLTG9VSWcxbm1sSXZMYU9vY055V0tDQUxqTUJIbnhoWXc1L0srM1JBVHM5bCtPWDJlOS9MODMxLyt6M3RLSHpnVFBmVHVoVlB0RStCUm1SNytycmFwTGpYWlNXVmI2WS8yZFZ5cXFuVFFpZTJIMnpNZnV6TS9lamNkZWNCNThrRWlWWFl6SlhkKzhlNVBnODFncUF4UFVXUkFqcTFZRUU4QnN2cERRRUp5K1RmVjVFc3JXWTdQRlZsQjRobVJj… (3096 chars)",
          "__isFeedUnit": "ShowcaseFeedUnit",
          "tracking": "{\"qid\":\"-5930889130855999672\",\"mf_story_key\":\"-8984038748765657249\",\"filter\":\"h_nor\",\"sty\":1445,\"story_set_type\":25,\"mf_objid\":\"122150556111344875\",\"viewstate_id\":\"-8984038748765657249\",\"pos\":2,\"partial_response_callsite_id\":-1,\"actrs\":\"61590346272526\",\"fb_shorts_surface\":\"FBShorts_SurfaceType::IFU_TRAY\",\"fb_shorts_ifu_tray_index\":1,\"fb_shorts_ifu_tray_position\":2,\"feed_unified_request_id\":\"-59308… (446 chars)",
          "debug_info": null,
          "showcase_story_type": "SHOWCASE_SHORT_VIDEO",
          "showcase_item": "(6 items)",
          "__module_operation_CometFeedUnitContainerSection_feedUnit": "(1 fields)",
          "__module_component_CometFeedUnitContainerSection_feedUnit": "(1 fields)",
          "__isTrackableFeedUnit": "ShowcaseFeedUnit",
          "trackingdata": "(1 fields)"
        },
        "feed_backend_data": {
          "qid": "-5930889130855999672",
          "original_qid": "-5930889130855999672",
          "vsid": "-8984038748765657249",
          "vspos": 2,
          "should_recent_vpv_fetch_tracking_data": false,
          "serialized_payloads": "GwZGGtbTkKKT0vuxA8YB8KsB7AEy/AMYwgHKFrQDBhsBSMABBG5vbmUbA0m25gMG3uYDBoTnAwYA"
        },
        "cursor": "FQQVAhsBXAIVBBhcTVRjNU1qYzBNak01TmpveE56a3lOelF5TXprMk9qSTZMVGc1T0RRd016ZzNORGczTmpVMk5UY3lORGs2TURvdE5Ua3pNRGc0T1RFek1EZzFOVGs1T1RZM01qbz0AGwJVAgIYBBUAAA=="
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
        "id": "1773834653844232",
        "instream_extra_config": {
          "instream_halo_delay_time_seconds": 15000
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
        "id": "1062280313159672",
        "instream_extra_config": {
          "instream_halo_delay_time_seconds": 3
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

**runs/inspect/20261024T060921_61594063207669**, scroll: +386px in 10 wheel steps, 531 ms: 200, 3658 ms

Sent:

```json
{
  "qpl_active_flow_ids": "431626709",
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
    "__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider": false
  },
  "doc_id": "29152597714334312",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=431626709"
  ]
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
          "name": "Bethlehem Trash",
          "id": "61594063207669"
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
          "uri": "https://scontent-xxc1-1.xx.fbcdn.net/v/t39.30808-1/506455007_9961606340561180_15147271089376521_n.jpg?stp=cp0_dst-jpg_tt6&cstp=mx960x960&ctp=s40x40&_nc_cat=1&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=R7CRmU4__V0Q7kNvwEE66P8&_nc_oc=Adr7soHoB16oMM9Ed3g0cv9WnvZp9R9JD0eapeTKvH0AR_9SUveEluNwJiq-UZ30eN4&_nc_zt=24&_nc_ht=scontent-xxc1-1.xx&_nc_gid=1szW6yWIcVA85ngWoXbG4Q&_nc_ss=792a8&oh=00_AQPwKDBFjwEMt0vdRnEtBrt6xI… (432 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        }
      ],
      "all_video_dash_prefetch_representations": [
        {
          "initial_representation_ids": "(0 items)",
          "representations": "(7 items)",
          "video_id": "1539696108174417",
          "nextgendash": true
        },
        {
          "initial_representation_ids": "(0 items)",
          "representations": "(7 items)",
          "video_id": "1539696108174417",
          "nextgendash": true
        },
        {
          "initial_representation_ids": "(0 items)",
          "representations": "(7 items)",
          "video_id": "1539696108174417",
          "nextgendash": true
        },
        {
          "initial_representation_ids": "(0 items)",
          "representations": "(7 items)",
          "video_id": "1539696108174417",
          "nextgendash": true
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1792822379554,
        "time_at_flush_ms": 1792822380713
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
      "label": "VideoPlayerCometFeedStoryControlsImplNotLive_video$defer$CometAudioLanguageUtils_dubtrackMapping",
      "path": [
        "viewer",
        "news_feed",
        "edges",
        0,
        "node",
        "attachments",
        "… 4 more"
      ],
      "data": {
        "dubbed_track_mapping": []
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)"
        ],
        "all_video_dash_prefetch_representations": [
          "(4 fields)",
          "(4 fields)",
          "(4 fields)",
          "(4 fields)"
        ],
        "is_final": false
      }
    },
    {
      "label": "VideoPlayerCometFeedStoryControlsImplNotLive_video$defer$CometAudioLanguageUtils_dubtrackMapping",
      "path": [
        "viewer",
        "news_feed",
        "edges",
        0,
        "node",
        "attachments",
        "… 9 more"
      ],
      "data": {
        "dubbed_track_mapping": []
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)"
        ],
        "all_video_dash_prefetch_representations": [
          "(4 fields)",
          "(4 fields)",
          "(4 fields)",
          "(4 fields)"
        ],
        "is_final": false
      }
    },
    {
      "label": "VideoPlayerCometFeedStoryControlsImplNotLive_video$defer$CometAudioLanguageUtils_dubtrackMapping",
      "path": [
        "viewer",
        "news_feed",
        "edges",
        0,
        "node",
        "comet_sections",
        "… 7 more"
      ],
      "data": {
        "dubbed_track_mapping": []
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)"
        ],
        "all_video_dash_prefetch_representations": [
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

<!-- facts:end -->

## What it does

The home feed's first stories.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
