# CometNewsFeedPaginationQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28707202452242216` |
| Path | `/api/graphql/` |
| Sends | `RELAY_INCREMENTAL_DELIVERY`, `clientQueryId`, `clientSession`, `connectionClass`, `count`, `cursor`, `experimentalValues`, `feedLocation`, `feedStyle`, `feedbackSource`, `focusCommentID`, `orderby`, `privacySelectorRenderLocation`, `recentVPVs`, `referringStoryRenderLocation`, `refreshMode`, `renderLocation`, `scale`, `shouldChangeBRSLabelFieldName`, `shouldObfuscateCategoryField`, `shouldUseBRSLabelFieldNameV1`, `shouldUseBRSLabelFieldNameV2`, `useDefaultActor`, `__relay_internal__pv__GHLShouldChangeSponsoredAuctionDistanceFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldUseSponsoredAuctionLabelFieldNameV1relayprovider`, `__relay_internal__pv__GHLShouldUseSponsoredAuctionLabelFieldNameV2relayprovider`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider`, `__relay_internal__pv__CometAdsSlotFillLoggingEnabledrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_reactor_facepilerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_social_bubblesrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_post_permalink_white_space_clickrelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider`, `__relay_internal__pv__TestPilotShouldIncludeDemoAdUseCaserelayprovider`, `__relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider`, `__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__CometFeedShareMedia_shouldPrefetchShareImagerelayprovider`, `__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__IsMergQAPollsrelayprovider`, `__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFIShareActionMigrationrelayprovider`, `__relay_internal__pv__CometUFISingleLineUFIrelayprovider`, `__relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider`, `__relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider`, `__relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider`, `__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider`, `__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider` |
| Reads | `viewer....CometNewsFeed_viewerConnection` |
| Called from | `CometNewsFeed_viewerConnection.graphql` |
| rea | `ev_9fe96aa2843381662dbfa2cba3a667341cea74488d2b81cb77afaa655da4ec32` |

Seen 30 time(s) in 10 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 3: scroll 4-7 x 300-600px | 3 | 200 | 2548–3223 ms | 668–1575 ms | — |
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
| host | step 18: scroll 4-7 x 300-600px | 1 | 200 | 1756 ms | 994 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, step 18: scroll 4-7 x 300-600px: 200, 1756 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometNewsFeedPaginationQuery",
  "server_timestamps": "true",
  "variables": {
    "RELAY_INCREMENTAL_DELIVERY": true,
    "clientQueryId": "e6ba5581-faed-4ee4-9013-0fd5e1f4c14e",
    "clientSession": null,
    "connectionClass": "EXCELLENT",
    "count": 5,
    "cursor": "FQgVAhsBXAIVCBhYTVRjNU16QXpPREV5TlRveE56a3pNRE00TVRJMU9qTTZOVGczTlRVeU9ETTJOekV4TVRBd016ZzNPakE2TFRVNU1UQTFOalkzT1Rjd01EZzFNalF6TVRZNgAbA1UcCAgEGAYVAAA=",
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
        "client_vpv_token": "(taken out)",
        "evt": "vpv",
        "feed_backend_data_serialized_payloads": "GwpGsgMOGo6UmfG78O5j7AEm8AMAngHeAQCc5LiHBPwDHMIB6AS0Aw4inOS4hwQbAUjAAQVncm91cBsDSbbmAwbe5gMWup39rc703QOE5wMWup39rc703QMA",
        "fetch_tracking": false,
        "original_qid": "-5910566797008524316",
        "qid": "-5910566797008524316",
        "timestamp": 1793038130728,
        "vsid": "4836613144453713975",
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
    "__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider": true
  },
  "doc_id": "28707202452242216"
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
        }
      }
    },
    "extensions": {
      "prefetch_uris_v2": [
        {
          "uri": "https://scontent.fyvr3-1.fna.fbcdn.net/v/t39.99422-6/844965894_1429526252613333_6972818291109462005_n.png (479 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent.fyvr3-1.fna.fbcdn.net/v/t39.30808-6/730397906_122118253569274842_7831749617363640922_n.jpg (484 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent.fyvr3-1.fna.fbcdn.net/v/t39.99422-6/842466353_2855839078119996_8288012466051692383_n.png (481 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-6/837569983_1752234870243301_7157932580893354678_n.jpg (479 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-6/734505683_1012598714805185_3184065509239216370_n.jpg (483 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent.fyvr3-1.fna.fbcdn.net/v/t39.30808-6/717419339_1446454694182915_1583599819979607512_n.jpg (481 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        "… 4 more"
      ],
      "server_metadata": {
        "request_start_time_ms": 1793038145484,
        "time_at_flush_ms": 1793038145951
      },
      "is_final": false,
      "sr_payload": {
        "ddd": {
          "hsrp": "(1 fields)",
          "jsmods": "(1 fields)",
          "allResources": "(1 items)",
          "tieredResources": "(3 fields)"
        }
      }
    }
  },
  "followingParts": 37,
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
        "brs_content_label": 80,
        "cat_sensitive": {
          "enc": "0c993732c6e3161cf58d896f5f9e180b29aba26b452d0156832b3c30bf29a422",
          "cat": null
        },
        "deduplication_key": "-1300334411570316459",
        "min_gap_type_index_string": "14",
        "sposnsor_new_distac_action": null,
        "top_story_cache_score": 1990.7341308594,
        "is_ad_eligible_for_ad_pod": false,
        "node": {
          "__typename": "Story",
          "th_dat_spo": null,
          "__isNode": "Story",
          "id": "UzpfSUZTOjE6LTU5MTA1NjY3OTcwMDg1MjQzMTY6ZUp3VHV6cnB6ZG9ERjI1M3EyaktpSDJiY21aUDErL0piS0pzWXRmK2R0eThzVjlYN01EVXlXdDR4VGJjK2JPVzExSkdwSUZKamNFVUxHVEdJTWFRQmxXMG1zbnRpampUUGFaTjM3NHRPdmo5R0pzMG84ZVVCaVltWFVPNGdkSU1EQXppam52c1B6Z3dNRENvQ2trenVrbkJwTXpnRGtobEVHWFJrV1pzNU1zc2ppOU9MWW5Qekl0UFMwMU5ZWlJtd0E0WmVMekVHR0tFaEJnWWtrd1pHQUNOMzBqSA==",
          "__isFeedUnit": "Story",
          "post_id": "1732745831744827",
          "debug_info": null,
          "feedback": "(3 fields)",
          "is_story_civic": null,
          "cache_id": "-7371411713136734489",
          "matched_terms": "(0 items)",
          "creation_time": 1791124832,
          "cix_screen": null,
          "attachments": "(1 items)",
          "future_of_feed_info": "(4 fields)",
          "attached_story": null,
          "bumpers": null,
          "comet_sections": "(14 fields)",
          "encrypted_tracking": "AZhNE83gGsROEAwcm0LTVPv7GlqR9r7lGqGxiYNrIf67KtL8PnK5p8ibBP7vV6HK5xI_-V7zD14B6MJnTHc_G9-ztV0rNxhvzdbLD3I9iQpoZYiYCYlvhB1leKrSx8oaCaHjuYfTNQmEXjzje6XexakTEprIIb8VIYoBeUO6z5rORzlaAD40wqCc-AshALH1hxfICDUHLf-v2wrOvzdJ_c5huZGO4TixpiDLbZKc7SJOH4vY0sfek7aI6SsZ1Cc_Kp1DQkdnLW3fDjqL_EVa14nEv3w_OInm2OUY4R3iMvWTz6xPqSTVahsSQTQ5VIEoKUd2pWwR46hROVgFSyzPc9XD81VnPf5M5IEmC6YD9q7wQFVNcv8gPG_XHbdKpaNJL0iTu-ZfQ9XVk3Ux… (1934 chars)",
          "should_host_actor_link_in_watch": false,
          "permalink_url": "https://www.facebook.com/reel/1844834653363609/",
          "whatsapp_ad_context": null,
          "schema_context": null,
          "click_tracking_linkshim_cb": "AUBmQq1lBPgLRWGJTSdIJN-mG0hQZFtbmVfe2_VsDy7btW4ryFCgeIbsGrio99P6MebY5f53NnmVhwZte5S3Z4Ox-mMqTMVBfORbJhsGMfHVRSfeunzQ6b8yqoo5xj4kS8N-XbVDHCD0cm1CHHM5pQERZEGC3lN6SSNnQkcwEzICEPZ7QSkc6gK8uR5nI4cr2d3aKvk3eMdRj8jqS1iNTx9zUNbkKd-sd_K5KnC8YA",
          "encrypted_click_tracking": "AZh8g7pOpTfq2wEKm-99Spdv6Cm0pBodJeZd-66FkzRWpilYL_cN5QrWNtX6eTuJbiLJZ-l65oJ6BFBI9nekGWIOXn8nHL2O0atO_ikpDSO4XJtgXjWwo3f0N8yauoF42ysjzp3HPaW8nraef5w1XOAKIFVpLKQbSObfvyZCqwBDAxECJt3HNGgrIA6qX7DMtF9pk8GH6FE",
          "serialized_frtp_identifiers": null,
          "can_viewer_see_menu": true,
          "actors": "(1 items)",
          "to": null,
          "work_is_repost": null,
          "work_reposted_story": null,
          "__module_operation_CometFeedUnitContainerSection_feedUnit": "(1 fields)",
          "__module_component_CometFeedUnitContainerSection_feedUnit": "(1 fields)",
          "__isTrackableFeedUnit": "Story",
          "trackingdata": "(1 fields)",
          "viewability_config": "(2 items)",
          "client_view_config": "(3 fields)"
        },
        "feed_backend_data": {
          "qid": "-5910566797008524316",
          "original_qid": "-5910566797008524316",
          "vsid": "-1300334411570316459",
          "vspos": 4,
          "should_recent_vpv_fetch_tracking_data": false,
          "serialized_payloads": "Gw5GsgMGGvaUzLyK+5MGxgGgmQLsASZuAvADAp4BoAEA1v2I2di/LfwDHMIBgAK0AwYi1v2I2di/Lf4DIoAEABsBSMABA2ZvZhsDSbbmA1a87K6R+uuEAYL2zpLx8MECzof9r/mM4wnStIO119L5A+jz+JDG1YgB3uYDNqiCmo3R6MYBgOLcuKGGmQqQzc/K4vyuA4TnAyaogpqN0ejGAYDi3LihhpkKAA=="
        },
        "cursor": "FQwVAhsCXAIVDBhcTVRjNU16QXpPREV5TlRveE56a3pNRE00TVRJMU9qUTZMVEV6TURBek16UTBNVEUxTnpBek1UWTBOVGs2TURvdE5Ua3hNRFUyTmpjNU56QXdPRFV5TkRNeE5qbz0ABhUKGA9wMXxGZ0ltMnR6OHJRMEEAGwNVHAwIChgGFQIVChgGb3JlZ29uGARwcm4yAA=="
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
        "is_final": false,
        "sr_payload": {
          "ddd": "(4 fields)"
        }
      }
    },
    {
      "label": "VideoPlayerCometFeedStoryControlsImplNotLive_video$defer$CometAudioLanguageUtils_dubtrackMapping",
      "path": [
        "viewer",
        "news_feed",
        "edges",
        1,
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
        1,
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
