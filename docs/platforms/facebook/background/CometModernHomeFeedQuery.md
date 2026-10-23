# CometModernHomeFeedQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28651572944522952` |
| Path | `/api/graphql/` |
| Sends | `RELAY_INCREMENTAL_DELIVERY`, `connectionClass`, `experimentalValues`, `feedClientSession`, `feedEndCursor`, `feedInitialFetchSize`, `feedLocation`, `feedStyle`, `feedbackSource`, `focusCommentID`, `orderby`, `privacySelectorRenderLocation`, `recentVPVs`, `referringStoryRenderLocation`, `refreshMode`, `renderLocation`, `scale`, `shouldChangeBRSLabelFieldName`, `shouldObfuscateCategoryField`, `shouldUseBRSLabelFieldNameV1`, `shouldUseBRSLabelFieldNameV2`, `useDefaultActor`, `__relay_internal__pv__GHLShouldChangeSponsoredAuctionDistanceFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldUseSponsoredAuctionLabelFieldNameV1relayprovider`, `__relay_internal__pv__GHLShouldUseSponsoredAuctionLabelFieldNameV2relayprovider`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider`, `__relay_internal__pv__CometAdsSlotFillLoggingEnabledrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_reactor_facepilerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_social_bubblesrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_post_permalink_white_space_clickrelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider`, `__relay_internal__pv__TestPilotShouldIncludeDemoAdUseCaserelayprovider`, `__relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider`, `__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__CometFeedShareMedia_shouldPrefetchShareImagerelayprovider`, `__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__IsMergQAPollsrelayprovider`, `__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFIShareActionMigrationrelayprovider`, `__relay_internal__pv__CometUFISingleLineUFIrelayprovider`, `__relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider`, `__relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider`, `__relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider`, `__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider`, `__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider` |
| Reads | `viewer....CometNewsFeed_viewerConnection`, `viewer....CometNewsFeed_viewer` |
| Called from | `CometModernHomeFeed.react` |
| rea | `ev_1b460d553cf6534a2af5b25c753e1e08cf72dc0bc41987677951d9a3388a29e3` |

Seen 17 time(s) in 11 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 3005 ms | 13560 ms | — |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 3128 ms | 12028 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 2579 ms | 7044 ms | — |
| warmup | step 11: goto /marketplace/ | 1 | 200 | 3899 ms | 8602 ms | — |
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

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T045453_61594063207669**, openAny: read /marketplace/item/<id>/: 200, 3647 ms

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
        "news_feed": "(1 fields)",
        "actor": "(3 fields)",
        "can_have_friends": true,
        "all_friends": "(1 fields)",
        "is_fb_employee": false,
        "rack_qrt_called_during_first_story": false,
        "injected_stories": null
      }
    },
    "extensions": {
      "prefetch_uris_v2": [
        "(5 fields)",
        "(5 fields)"
      ],
      "server_metadata": {
        "request_start_time_ms": 1792731520743,
        "time_at_flush_ms": 1792731521889
      },
      "is_final": false,
      "sr_payload": {
        "ddd": "(4 fields)"
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
        "cat_sensitive": "(2 fields)",
        "deduplication_key": "-3887795066676390941",
        "min_gap_type_index_string": "10",
        "sposnsor_new_distac_action": null,
        "top_story_cache_score": 0,
        "is_ad_eligible_for_ad_pod": false,
        "node": "(11 fields)",
        "feed_backend_data": "(6 fields)",
        "cursor": "FQQVAhsBXAIVBBhcTVRjNU1qY3pNVFV5TURveE56a3lOek14TlRJd09qSTZMVE00T0RjM09UVXdOalkyTnpZek9UQTVOREU2TURvdE5Ua3pNVFl6TmpVek1EQXlPREExT0RReE9Ebz0AGwJVHAIUBBUAAA=="
      },
      "extensions": {
        "is_final": false,
        "sr_payload": "(1 fields)"
      }
    },
    {
      "label": "CometNewsFeed_viewerConnection$stream$CometNewsFeed_viewer_news_feed",
      "path": [
        "viewer",
        "news_feed",
        "edges",
        2
      ],
      "data": {
        "brs_content_label": null,
        "cat_sensitive": "(2 fields)",
        "deduplication_key": "3130624533748682535",
        "min_gap_type_index_string": "12",
        "sposnsor_new_distac_action": null,
        "top_story_cache_score": 0,
        "is_ad_eligible_for_ad_pod": false,
        "node": "(12 fields)",
        "feed_backend_data": "(6 fields)",
        "cursor": "FQYVAhsBXAIVBhhcTVRjNU1qY3pNVFV5TURveE56a3lOek14TlRJd09qTTZNekV6TURZeU5EVXpNemMwT0RZNE1qVXpOVG93T2kwMU9UTXhOak0yTlRNd01ESTRNRFU0TkRFNE9nPT0AGwNVHAIUBBgGFQAA"
      },
      "extensions": {
        "prefetch_uris_v2": "(6 items)",
        "all_video_dash_prefetch_representations": "(6 items)",
        "is_final": false,
        "sr_payload": "(1 fields)"
      }
    },
    {
      "label": "VideoPlayerRelay_video$defer$InstreamVideoAdBreaksPlayer_video",
      "path": [
        "viewer",
        "news_feed",
        "edges",
        2,
        "node",
        "showcase_item",
        "… 6 more"
      ],
      "data": {
        "id": "2194705858096130",
        "instream_extra_config": "(1 fields)",
        "instream_video_ad_breaks_comet": null
      },
      "extensions": {
        "prefetch_uris_v2": "(6 items)",
        "all_video_dash_prefetch_representations": "(6 items)",
        "is_final": false
      }
    }
  ]
}
```

**runs/inspect/20261023T000744_61594063207669**, step 3: goto /marketplace/inbox: 200, 4472 ms

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
null
```

**runs/inspect/20261023T000744_61594063207669**, step 5: goto /marketplace/you/selling: 200, 3384 ms

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
        "news_feed": "(1 fields)",
        "actor": "(3 fields)",
        "can_have_friends": true,
        "all_friends": "(1 fields)",
        "is_fb_employee": false,
        "rack_qrt_called_during_first_story": false,
        "injected_stories": null
      }
    },
    "extensions": {
      "prefetch_uris_v2": [
        "(5 fields)",
        "(5 fields)"
      ],
      "server_metadata": {
        "request_start_time_ms": 1792715273011,
        "time_at_flush_ms": 1792715273875
      },
      "is_final": false,
      "sr_payload": {
        "ddd": "(4 fields)"
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
        "cat_sensitive": "(2 fields)",
        "deduplication_key": "2361978148206864999",
        "min_gap_type_index_string": "10",
        "sposnsor_new_distac_action": null,
        "top_story_cache_score": 0,
        "is_ad_eligible_for_ad_pod": false,
        "node": "(11 fields)",
        "feed_backend_data": "(6 fields)",
        "cursor": "FQQVAhsBXAIVBBhcTVRjNU1qY3hOVEkzTXpveE56a3lOekUxTWpjek9qSTZNak0yTVRrM09ERTBPREl3TmpnMk5EazVPVG93T2kwMU9UTXlOelV6TURFMU5EazVPVFl3T1RBeE9nPT0AGwJVAgIUBBUAAA=="
      },
      "extensions": {
        "is_final": false,
        "sr_payload": "(1 fields)"
      }
    },
    {
      "label": "CometNewsFeed_viewerConnection$stream$CometNewsFeed_viewer_news_feed",
      "path": [
        "viewer",
        "news_feed",
        "edges",
        2
      ],
      "data": {
        "brs_content_label": null,
        "cat_sensitive": "(2 fields)",
        "deduplication_key": "-279022799994779008",
        "min_gap_type_index_string": "12",
        "sposnsor_new_distac_action": null,
        "top_story_cache_score": 0,
        "is_ad_eligible_for_ad_pod": false,
        "node": "(12 fields)",
        "feed_backend_data": "(6 fields)",
        "cursor": "FQYVAhsBXAIVBhhcTVRjNU1qY3hOVEkzTXpveE56a3lOekUxTWpjek9qTTZMVEkzT1RBeU1qYzVPVGs1TkRjM09UQXdPRG93T2kwMU9UTXlOelV6TURFMU5EazVPVFl3T1RBeE9nPT0AGwNVAgIUBBgGFQAA"
      },
      "extensions": {
        "prefetch_uris_v2": "(6 items)",
        "all_video_dash_prefetch_representations": "(6 items)",
        "is_final": false,
        "sr_payload": "(1 fields)"
      }
    },
    {
      "label": "VideoPlayerRelay_video$defer$InstreamVideoAdBreaksPlayer_video",
      "path": [
        "viewer",
        "news_feed",
        "edges",
        2,
        "node",
        "showcase_item",
        "… 6 more"
      ],
      "data": {
        "id": "1604777394733994",
        "instream_extra_config": "(1 fields)",
        "instream_video_ad_breaks_comet": null
      },
      "extensions": {
        "prefetch_uris_v2": "(6 items)",
        "all_video_dash_prefetch_representations": "(6 items)",
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
