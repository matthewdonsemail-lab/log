# CometNewsFeedPaginationQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29004938205805573` |
| Path | `/api/graphql/` |
| Sends | `RELAY_INCREMENTAL_DELIVERY`, `clientQueryId`, `clientSession`, `connectionClass`, `count`, `cursor`, `experimentalValues`, `feedLocation`, `feedStyle`, `feedbackSource`, `focusCommentID`, `orderby`, `privacySelectorRenderLocation`, `recentVPVs`, `referringStoryRenderLocation`, `refreshMode`, `renderLocation`, `scale`, `shouldChangeBRSLabelFieldName`, `shouldObfuscateCategoryField`, `shouldUseBRSLabelFieldNameV1`, `shouldUseBRSLabelFieldNameV2`, `useDefaultActor`, `__relay_internal__pv__GHLShouldChangeSponsoredAuctionDistanceFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldUseSponsoredAuctionLabelFieldNameV1relayprovider`, `__relay_internal__pv__GHLShouldUseSponsoredAuctionLabelFieldNameV2relayprovider`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider`, `__relay_internal__pv__CometAdsSlotFillLoggingEnabledrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_reactor_facepilerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_social_bubblesrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_post_permalink_white_space_clickrelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider`, `__relay_internal__pv__TestPilotShouldIncludeDemoAdUseCaserelayprovider`, `__relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider`, `__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__CometFeedShareMedia_shouldPrefetchShareImagerelayprovider`, `__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__IsMergQAPollsrelayprovider`, `__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFIShareActionMigrationrelayprovider`, `__relay_internal__pv__CometUFISingleLineUFIrelayprovider`, `__relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider`, `__relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider`, `__relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider`, `__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider`, `__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider` |
| Reads | `viewer....CometNewsFeed_viewerConnection` |
| Called from | `CometNewsFeed_viewerConnection.graphql` |
| rea | `ev_47cd3cb116d108d9f1184684f455253912eaa99a8c93350c03d80543c9c9be38` |

Seen 28 time(s) in 8 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 3: scroll 4-7 x 300-600px | 2 | 200 | 3058–3223 ms | 668–946 ms | — |
| warmup | scroll: +533px in 12 wheel steps, 734 ms | 1 | 200 | 1847 ms | 3224 ms | — |
| warmup | scroll: +431px in 10 wheel steps, 422 ms | 1 | 200 | 1447 ms | 3473 ms | — |
| inspect | post: "…", 103 words, 0 image(s), scrolled 58 px | 2 | 200 | 1521–1759 ms | 162–249 ms | — |
| inspect | step 5: nextPost | 1 | 200 | 3922 ms | 1192 ms | — |
| inspect | step 10: nextPost | 2 | 200 | 1646–3791 ms | 313–939 ms | — |
| inspect | step 13: nextPost | 1 | 200 | 1016 ms | 349 ms | — |
| inspect | step 14: nextPost | 1 | 200 | 3333 ms | 1321 ms | — |
| inspect | step 23: likePost Like | 1 | 200 | 1701 ms | 856 ms | — |
| inspect | step 32: nextPost | 1 | 200 | 4230 ms | 1497 ms | — |
| inspect | post: "…", 103 words, 0 image(s), scrolled 70 px | 1 | 200 | 1888 ms | 264 ms | — |
| inspect | step 8: nextPost | 2 | 200 | 1153–1654 ms | 985–992 ms | — |
| inspect | step 16: nextPost | 1 | 200 | 2000 ms | 1070 ms | — |
| inspect | step 22: likePost Like | 1 | 200 | 3600 ms | 984 ms | — |
| inspect | scroll: +1489px in 35 wheel steps, 2750 ms | 1 | 200 | 2616 ms | 2433 ms | — |
| inspect | step 7: nextPost | 1 | 200 | 1310 ms | 1105 ms | — |
| inspect | post: "…", 73 words, 1 image(s), scrolled 757 px | 1 | 200 | 2625 ms | 1086 ms | — |
| inspect | step 12: nextPost | 1 | 200 | 2069 ms | 1288 ms | — |
| inspect | step 28: scroll 1 x 700px | 1 | 200 | 2061 ms | 434 ms | — |
| inspect | step 30: clickRole button "…" | 1 | 200 | 1613 ms | 2299 ms | — |
| inspect | step 4: nextPost | 1 | 200 | 2013 ms | 955 ms | — |
| inspect | step 11: nextPost | 1 | 200 | 3464 ms | 1020 ms | — |
| inspect | step 3: scroll 4-7 x 300-600px | 1 | 200 | 1708 ms | 964 ms | — |
| inspect | post: "…", 123 words, 0 image(s), scrolled 53 px | 1 | 200 | 2937 ms | 302 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T051540_61594063207669**, post: "…", 123 words, 0 image(s), scrolled 53 px: 200, 2937 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometNewsFeedPaginationQuery",
  "server_timestamps": "true",
  "variables": {
    "RELAY_INCREMENTAL_DELIVERY": true,
    "clientQueryId": "d2d9e726-c7c8-4128-94b8-c47b4585631e",
    "clientSession": null,
    "connectionClass": "EXCELLENT",
    "count": 5,
    "cursor": "FQgVAhsBXAIVCBhcTVRjNU1qY3pNalUxT0RveE56a3lOek15TlRVNE9qUTZMVGt3T0RVMU16UXhPVGsyT1RZM09ETTNOREk2TURvdE5Ua3pNVFUyTlRFNU9USTBNVFl4T0RFeE9Ebz0AGwRVHAIUBAIGGAgVAAA=",
    "experimentalValues": null,
    "feedLocation": "NEWSFEED",
    "feedStyle": "DEFAULT",
    "feedbackSource": 1,
    "focusCommentID": null,
    "orderby": [
      "TOP_STORIES"
    ],
    "privacySelectorRenderLocation": "COMET_STREAM",
    "recentVPVs": [
      {
        "client_vpv_token": "6672230a-8cec-438c-83af-1ec27f1a0b12",
        "evt": "vpv",
        "feed_backend_data_serialized_payloads": "GwtGsgMGGuLftY+U3sSyA8YB8KUD7AEmbgLwAwKeAaABALT0ht3d/hv8Axy0AwYitPSG3d3+GxsBSMABA2ZvZhsAAA==",
        "fetch_tracking": false,
        "original_qid": "-5931565199241618118",
        "qid": "-5931565199241618118",
        "timestamp": 1792732563571,
        "vsid": "6728649326570884339",
        "vspos": 1
      }
    ],
    "referringStoryRenderLocation": null,
    "refreshMode": "AUTO",
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
  "doc_id": "29004938205805573"
}
```

Answered:

```json
{
  "first": {
    "data": {
      "viewer": {
        "news_feed": "(1 fields)"
      }
    },
    "extensions": {
      "prefetch_uris_v2": [
        "(5 fields)",
        "(5 fields)"
      ],
      "server_metadata": {
        "request_start_time_ms": 1792732583020,
        "time_at_flush_ms": 1792732584817
      },
      "is_final": false,
      "sr_payload": {
        "ddd": "(4 fields)"
      }
    }
  },
  "followingParts": 5,
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
        "deduplication_key": "4211163629311311073",
        "min_gap_type_index_string": "15",
        "sposnsor_new_distac_action": null,
        "top_story_cache_score": 0,
        "is_ad_eligible_for_ad_pod": false,
        "node": "(9 fields)",
        "feed_backend_data": "(6 fields)",
        "cursor": "FQwVAhsBXAIVDBhcTVRjNU1qY3pNalUxT0RveE56a3lOek15TlRVNE9qWTZOREl4TVRFMk16WXlPVE14TVRNeE1UQTNNem93T2kwMU9UTXhOVFl6TkRneE1qa3dOak0zTlRZeU9nPT0AGwVVHAIUBAIKGAgeDBUCKAh2aXJnaW5pYRgEcnZhMgA="
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
        "brs_content_label": 60,
        "cat_sensitive": "(2 fields)",
        "deduplication_key": "-5429055630327248532",
        "min_gap_type_index_string": "14",
        "sposnsor_new_distac_action": null,
        "top_story_cache_score": 62047.89453125,
        "is_ad_eligible_for_ad_pod": false,
        "node": "(37 fields)",
        "feed_backend_data": "(6 fields)",
        "cursor": "FQ4VAhsBXAIVDhhcTVRjNU1qY3pNalUxT0RveE56a3lOek15TlRVNE9qYzZMVFUwTWprd05UVTJNekF6TWpjeU5EZzFNekk2TURvdE5Ua3pNVFUyTXpRNE1USTVNRFl6TnpVMk1qbz0AGwVVHA4UBAIKGAgeDBUCKAh2aXJnaW5pYRgEcnZhMgA="
      },
      "extensions": {
        "prefetch_uris_v2": "(6 items)",
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
        3
      ],
      "data": {
        "brs_content_label": null,
        "cat_sensitive": "(2 fields)",
        "deduplication_key": "-7223806113887355893",
        "min_gap_type_index_string": "10",
        "sposnsor_new_distac_action": null,
        "top_story_cache_score": 0,
        "is_ad_eligible_for_ad_pod": false,
        "node": "(11 fields)",
        "feed_backend_data": "(6 fields)",
        "cursor": "FRAVAhsBXAIVEBhcTVRjNU1qY3pNalUxT0RveE56a3lOek15TlRVNE9qZzZMVGN5TWpNNE1EWXhNVE00T0Rjek5UVTRPVE02TURvdE5Ua3pNVFUyTXpRNE1USTVNRFl6TnpVMk1qbz0AGwVVHA4UEAIKGAgeDBUCKAh2aXJnaW5pYRgEcnZhMgA="
      },
      "extensions": {
        "is_final": false,
        "sr_payload": "(1 fields)"
      }
    }
  ]
}
```

<!-- facts:end -->

## What it does

Loads the next page of the home feed (`viewer....CometNewsFeed_viewerConnection`), from a `cursor` and `count`, as the viewer scrolls toward the end of what is loaded. It fired 23 times in 5 runs, almost always on `nextPost`, `scroll` and `likePost` steps of the feed warm-up, 0.1-1.3 s after the step began.

## What our machine does with it

The feed warm-up's `readFeed` and `nextPost` steps scroll the home feed (`src/facebook/warmup/activities/helpers/feed.ts`); `nextPost` reads posts from the page (`FEED_POSTS_JS`) and does not wait for this request. When the next post isn't on the page yet, the next scroll brings it in once this request has answered. It matters for speed: its 1.0-4.2 s is the wait behind a `nextPost` that finds no new post at once.

## What can go wrong

None seen: all 23 answered 200, in 1016-4230 ms. A slow answer only delays the next post; if none arrives, `nextPost` fails its step, the hook reports the page as unconfirmed (rule 55), and a snapshot says where it is.
