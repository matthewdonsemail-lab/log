# ProfileCometTimelineFeedQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `39455371677441618` |
| Path | `/api/graphql/` |
| Sends | `afterTime`, `beforeTime`, `count`, `feedLocation`, `feedbackSource`, `focusCommentID`, `memorializedSplitTimeFilter`, `omitPinnedPost`, `postedBy`, `privacy`, `privacySelectorRenderLocation`, `referringStoryRenderLocation`, `renderLocation`, `runWithContinuationKey`, `scale`, `shouldShowProfilePinnedPost`, `stream_count`, `taggedInOnly`, `trackingCode`, `useDefaultActor`, `userID`, `__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_reactor_facepilerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_social_bubblesrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_post_permalink_white_space_clickrelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider`, `__relay_internal__pv__TestPilotShouldIncludeDemoAdUseCaserelayprovider`, `__relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider`, `__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__CometFeedShareMedia_shouldPrefetchShareImagerelayprovider`, `__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__IsMergQAPollsrelayprovider`, `__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFIShareActionMigrationrelayprovider`, `__relay_internal__pv__CometUFISingleLineUFIrelayprovider`, `__relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider`, `__relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider`, `__relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider`, `__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider`, `__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider` |
| Reads | — |
| Called from | `ProfileCometTimeline.react` |
| rea | `ev_39691107976f01281b8d227447e2fdcd6764c690f92666b0755b5a56fef3013d` |

Seen 3 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | POST 200 /ajax/bulk-route-definitions/ (752 ms) | 1 | 200 | 407 ms | 5069 ms | — |
| host | step 9: saveState | 1 | 200 | 390 ms | 1536 ms | — |
| inspect | step 7: goto / | 1 | 200 | 1004 ms | 118257 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T045453_61594063207669**, step 7: goto /: 200, 1004 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "ProfileCometTimelineFeedQuery",
  "server_timestamps": "true",
  "variables": {
    "count": 1,
    "feedbackSource": 0,
    "feedLocation": "TIMELINE",
    "omitPinnedPost": true,
    "privacySelectorRenderLocation": "COMET_STREAM",
    "renderLocation": "timeline",
    "runWithContinuationKey": true,
    "scale": 1,
    "userID": "61556829712306",
    "__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider": true,
    "__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider": true,
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
  "doc_id": "39455371677441618"
}
```

Answered:

```json
{
  "first": {
    "data": {
      "user": {
        "id": "61556829712306",
        "timeline_list_feed_units": {
          "edges": [
            {
              "node": "(37 fields)",
              "cursor": "AQHTYJBrJK3jrkD81c6dK3PXoS9u9NHDZbXrhe1ypRGWQDcS8forfOwNIC1-S2MzK_7u67QK-3BMWIcjM14xCk-bGRvhTdlC_6buWkQwLjPScoD2D7QcFNsqiS9vcJ85A_NfaieU5wGw3PNdR7R5Kd2QOlYfgBpCabNYmVfB09Uf7DjGA27g5WxLSqIjr67MSOfWDLRGv7hv90ocEtBZIhO0V_cLASYVI_Fr_8cUnXldxEcaQJeUW_pFQEU6-4EfbQT19ennZkN5LrCCEkZUjhb1zNtHm7JCkuoGTzX0fL1ypO3fHtHJ5d98-RJwXpFd2DJq_QjrHnw_hRQL7vF1sA7aBdtOpcuRaUq-j_VZAtsI-vtZRjCmgp1NRbrTxhUzlJP2JG1WQLHcwi0W… (580 chars)"
            }
          ]
        },
        "profile_pinned_post": null,
        "ctx_profile_ad4ad_type": "NONE",
        "ctwa_specialized_ad4ad_should_route_to_lwi": null,
        "ctd_ad4ad_dfo_goal": null,
        "promote_uri_for_ctx_profile_ad4ad": null,
        "is_am_landing_eligible_for_wtm_profile_ad4ad": null,
        "post_image_and_caption_profile_ad4ad": [],
        "is_promode_creator": null,
        "top_post_cta_type": null,
        "top_post_id": null,
        "ad4ad_model_for_logging": null,
        "top_post_video_profile_ad4ad": null,
        "dhpc_campaign_name": null,
        "dhpc_promote_uri": null,
        "dhpc_thumbnail_uri": null,
        "dhpc_recommendation_type": null,
        "delegate_page": null,
        "profile_daybreak_ad4ad_enabled": false,
        "profile_daybreak_ad4ad_title": "Try Dream Render with free credits",
        "profile_daybreak_ad4ad_body": "Create engaging AI videos like this for your products. New accounts come with free credits to get started.",
        "profile_daybreak_ad4ad_post_title": "Set a new PR with our latest creations",
        "profile_daybreak_ad4ad_version": 1,
        "profile_daybreak_ad4ad_video": null,
        "profile_daybreak_ad4ad_destination_url": "https://dreamrender.com/?utm_source=fb2dr&utm_campaign=fb_ad4ad_profile_upsell_web&utm_medium=v1"
      }
    },
    "extensions": {
      "prefetch_uris_v2": [
        {
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/840406481_122351384084227657_2181478911876956811_n.jpg?stp=c0.0.736.736a_cp0_dst-jpg_tt6&cstp=mx736x736&ctp=s40x40&_nc_cat=102&ccb=1-7&_nc_sid=e99d92&_nc_ohc=dWRATbNp6I8Q7kNvwEGQ49a&_nc_oc=Adrlwp_BnR4s3q_jF96kRTz5bpTmpjidFscmDGOQyeRCh2nNQSE1pZ4fsCC_6TRZNRA&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=K1aqKYXrfdn6Cdht58iTjA&_nc_ss=792a8&oh=00_AQPUKp… (452 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/840406481_122351384084227657_2181478911876956811_n.jpg?stp=c0.159.736.736a_dst-jpg_tt6&cstp=mx736x736&ctp=s565x565&_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=dWRATbNp6I8Q7kNvwEGQ49a&_nc_oc=Adrlwp_BnR4s3q_jF96kRTz5bpTmpjidFscmDGOQyeRCh2nNQSE1pZ4fsCC_6TRZNRA&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=K1aqKYXrfdn6Cdht58iTjA&_nc_ss=792a8&oh=00_AQMKcj… (452 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1792731782128,
        "time_at_flush_ms": 1792731782279
      },
      "is_final": false,
      "sr_payload": {
        "ddd": {
          "hsrp": {
            "hsdp": {
              "clpData": "(4 fields)",
              "gkxData": "(2 fields)",
              "ixData": "(49 fields)",
              "qexData": "(2 fields)",
              "qplData": "(2 fields)",
              "justknobxData": "(2 fields)"
            },
            "hblp": {
              "consistency": "(1 fields)",
              "rsrcMap": "(3 fields)",
              "indexUpgrades": "(1 fields)"
            }
          },
          "jsmods": {
            "define": [
              "(4 items)",
              "(4 items)",
              "(4 items)",
              "(4 items)",
              "(4 items)",
              "(4 items)",
              "… 62 more"
            ],
            "require": [
              "(1 items)",
              "(1 items)",
              "(1 items)",
              "(1 items)",
              "(1 items)",
              "(1 items)",
              "… 73 more"
            ],
            "phd2_indexes": ":135,136,1806,1805,103,104,959"
          },
          "allResources": [
            "629CxOZ",
            "csr:_28_0_oK",
            "csr:_28_1_ob"
          ],
          "tieredResources": {
            "r": [
              "629CxOZ",
              "csr:_28_0_oK"
            ],
            "rdfds": [],
            "rds": [
              "csr:_28_1_ob"
            ]
          }
        }
      }
    }
  },
  "followingParts": 1,
  "parts": [
    {
      "label": "ProfileCometTimelineFeed_user$defer$ProfileCometTimelineFeed_user_timeline_list_feed_units$page_info",
      "path": [
        "user",
        "timeline_list_feed_units"
      ],
      "data": {
        "page_info": {
          "has_next_page": true,
          "end_cursor": "Cg8Ob3JnYW5pY19jdXJzb3IJAAACREFRSFRiV2wyNEhQWmU5aDBRa29neHRCUG5CSEtpLXNXREd1ZHlpMDd3bTlkWnExUS16OVNCdFhKUXU0cW9tZy1rb3hyVzFwazZSVlBaZDlaNXpJa0lGWUJsQTc5dENKRnVDSWdrZWFfYU1JMmszOTE0OUJJQWpwR05QcGZOaGUwd2x1cmlHSnhldDMyazR1X2k4aXgzQmlxM2NITnN2YkR4cDY2TFhQOGtlQ0ZEX0pna2R5Z2Z2SnlUNlUzY1ktWGI2LWZLdnhlUUhDY3BwZnZJV01ETWVud1R1amZIREc3M1IzdDUzRmZFa0VVOXRjV3IyVDI0QkhmdVh2NTFzY0prWkJrcmNwaDNLR0FzcEtocklzSjNt… (888 chars)"
        }
      },
      "extensions": {
        "prefetch_uris_v2": [
          {
            "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/840406481_122351384084227657_2181478911876956811_n.jpg?stp=c0.0.736.736a_cp0_dst-jpg_tt6&cstp=mx736x736&ctp=s40x40&_nc_cat=102&ccb=1-7&_nc_sid=e99d92&_nc_ohc=dWRATbNp6I8Q7kNvwEGQ49a&_nc_oc=Adrlwp_BnR4s3q_jF96kRTz5bpTmpjidFscmDGOQyeRCh2nNQSE1pZ4fsCC_6TRZNRA&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=K1aqKYXrfdn6Cdht58iTjA&_nc_ss=792a8&oh=00_AQPUKp… (452 chars)",
            "label": null,
            "width": null,
            "height": null,
            "surface": null
          },
          {
            "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/840406481_122351384084227657_2181478911876956811_n.jpg?stp=c0.159.736.736a_dst-jpg_tt6&cstp=mx736x736&ctp=s565x565&_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=dWRATbNp6I8Q7kNvwEGQ49a&_nc_oc=Adrlwp_BnR4s3q_jF96kRTz5bpTmpjidFscmDGOQyeRCh2nNQSE1pZ4fsCC_6TRZNRA&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=K1aqKYXrfdn6Cdht58iTjA&_nc_ss=792a8&oh=00_AQMKcj… (452 chars)",
            "label": null,
            "width": null,
            "height": null,
            "surface": null
          }
        ],
        "is_final": true
      }
    }
  ]
}
```

<!-- facts:end -->

## What it does

Loads the posts on a profile's timeline (paged by `count`, `afterTime`/`beforeTime`, `postedBy`). Fired as the own profile loaded, 5 s after `/me`, in about 0.4 s.

## What our machine does with it

Nothing: no machine posts to or reads the timeline. Its sighting only shows the profile loaded fully.

## What can go wrong

Nothing for our runs; an error only leaves the timeline empty.
