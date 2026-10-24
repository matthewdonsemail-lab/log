# ProfileCometTimelineFeedRefetchQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `29136684006021408` |
| Path | `/api/graphql/` |
| Sends | `afterTime`, `beforeTime`, `count`, `cursor`, `feedLocation`, `feedbackSource`, `focusCommentID`, `memorializedSplitTimeFilter`, `omitPinnedPost`, `postedBy`, `privacy`, `privacySelectorRenderLocation`, `referringStoryRenderLocation`, `renderLocation`, `run_with_continuation_key`, `scale`, `stream_count`, `taggedInOnly`, `trackingCode`, `useDefaultActor`, `id`, `__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_reactor_facepilerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_social_bubblesrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_post_permalink_white_space_clickrelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider`, `__relay_internal__pv__TestPilotShouldIncludeDemoAdUseCaserelayprovider`, `__relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider`, `__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__CometFeedShareMedia_shouldPrefetchShareImagerelayprovider`, `__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__IsMergQAPollsrelayprovider`, `__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFIShareActionMigrationrelayprovider`, `__relay_internal__pv__CometUFISingleLineUFIrelayprovider`, `__relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider`, `__relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider`, `__relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider`, `__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider`, `__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider` |
| Reads | `node....ProfileCometTimelineFeed_user` |
| Called from | `ProfileCometTimelineFeed_user.graphql` |
| rea | `ev_12fef5363140ff57523a63cea520f21f2f439b71288e01ff1e4da9056f0fcca2` |

Seen 5 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /profile.php | 1 | 200 | 607 ms | 6708 ms | — |
| inspect | step 7: click e1395 | 1 | 200 | 1007 ms | 10414 ms | — |
| host | step 7: goto /me | 1 | 200 | 621 ms | 3212 ms | — |
| host | step 12: goto /me | 1 | 200 | 533 ms | 2742 ms | — |
| host | step 17: goto /me | 1 | 200 | 661 ms | 2557 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261024T164523_61593843527201**, step 7: click e1395: 200, 1007 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "ProfileCometTimelineFeedRefetchQuery",
  "server_timestamps": "true",
  "variables": {
    "afterTime": null,
    "beforeTime": null,
    "count": 2,
    "cursor": "Cg8Ob3JnYW5pY19jdXJzb3IJAAACREFRSFRHb0tza3ZSU1FlRkhMRE8tN0dXaGR6OGwtT3NDVk5CeFNRbnlSOF9HRkdyUkhSLW9pRExHVjFSa0NWV19TcnRybjFWQUtPQ0laZlpFbmdYTWVGQUFJazBnVkFsTFh0cW5mcVJ6TF80VlRscWxMRkVyYVdKNlZ5Sl9xclFjM2ZENG1tSlh4SDQtb0ZSQXQ2U1BZT1ZULW1rQjZ5b0FkUmYyYWRpb190Wlp6MUtGaUFMNlZsVWI3bVNXdi0wUnNsdEdLM0Q4clV5dGZDeElfd0prcTRMQTU2amtCNW5HQjJ2VVBQTTE2TEdQX1RtcXJzN2V2QzRYal9YVHFrc1FtU0NKTVU4dV9aejYwd3FQbF9ldFZS… (888 chars)",
    "feedLocation": "TIMELINE",
    "feedbackSource": 0,
    "focusCommentID": null,
    "memorializedSplitTimeFilter": null,
    "omitPinnedPost": true,
    "postedBy": null,
    "privacy": null,
    "privacySelectorRenderLocation": "COMET_STREAM",
    "referringStoryRenderLocation": null,
    "renderLocation": "timeline",
    "run_with_continuation_key": true,
    "scale": 1,
    "stream_count": 1,
    "taggedInOnly": null,
    "trackingCode": null,
    "useDefaultActor": false,
    "id": "61593843527201",
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
    "__relay_internal__pv__CometFeedShareMedia_shouldPrefetchShareImagerelayprovider": false,
    "__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider": false,
    "__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider": false,
    "__relay_internal__pv__IsMergQAPollsrelayprovider": false,
    "__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider": true,
    "__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider": false,
    "__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider": "ORIGINAL",
    "__relay_internal__pv__CometUFIShareActionMigrationrelayprovider": true,
    "__relay_internal__pv__CometUFISingleLineUFIrelayprovider": true,
    "__relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider": true,
    "__relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider": true,
    "__relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider": 206,
    "__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider": false,
    "__relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider": true,
    "__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider": false
  },
  "doc_id": "29136684006021408"
}
```

Answered:

```json
{
  "first": {
    "data": {
      "node": {
        "__typename": "User",
        "id": "61593843527201",
        "timeline_list_feed_units": {
          "edges": [
            {
              "node": {
                "__typename": "Story",
                "__isFeedUnit": "Story",
                "debug_info": null,
                "id": "UzpfSTYxNTkzODQzNTI3MjAxOjEyMjEwNTU4NzcxOTQ2MTQ1MDoxMjIxMDU1ODc3MTk0NjE0NTA=",
                "th_dat_spo": null,
                "feedback": "(3 fields)",
                "is_story_civic": null,
                "cache_id": "-531262306220494892",
                "matched_terms": "(0 items)",
                "post_id": "122105587719461450",
                "creation_time": 864975600,
                "cix_screen": null,
                "attachments": "(1 items)",
                "future_of_feed_info": "(4 fields)",
                "attached_story": null,
                "bumpers": null,
                "comet_sections": "(14 fields)",
                "encrypted_tracking": "AZial_0QuuCloNREDKUauhu_sBPkKeg1Vs1VT1F949eRFKLEIVnYfRHS9esAOK-x4xV71qHWBshK8JVgKvG87ygtAuI3W5UJj3s2g9ThO3GZGwaZ36m_cFJ5dsorCV9wNpeXFjUk6bNn_WM1Zp7Hu3reMIAckgVbQuzK_u9PH0LpIuUOJ_cNJtVwwoQEtrGQSom-kPO1y0IH1ZWI-RSRJVPkjQw6ZX3PW6ljAqPIbt4S4f94gjS86hYpVEXjhmBECulZ1eD5hYvjcXY2AxgvhcD4ukIsEba3XRHWIcQmfIfo8_RtdtGQEHlgjEdRhjbxIyXo-BGWu1nGhJAVscS5POp3jqx4EDfQv2eLesMODMBpdGVRCBDbnxEVJB1IjgpV1LaI9KF3giLS_aFi… (599 chars)",
                "should_host_actor_link_in_watch": false,
                "permalink_url": "https://www.facebook.com/permalink.php?story_fbid=pfbid09HcsewaaxL1K7qD2zWYy5ysZsTLDxcceXZSoWbcQnHBFiLKJgq7L4vXqVHCfFQuTl&id=61593843527201",
                "whatsapp_ad_context": null,
                "schema_context": null,
                "click_tracking_linkshim_cb": "AUCGxVFp70IBpm-8H8uAPFEczTW3lw5w-NaPG_Oy_0W-Jumo208IR8SqvZCwcl9qRVheWa4xenoJlTC_Ou-ZpzqJqjyg8fVB3KwYPwBdDTW0oP4QRdrl7MFQ4RKlcNJRc7bEMSePTduZZEeR6NF4LLQobkueOByonQQHVcSC9fQVeIwPFzbsUfqSVU4",
                "encrypted_click_tracking": "AZgR0r0NhPM0zpfUeFCW5wAncjeAAcjBCPgL72t3XfAo8OMRjV2sOgk-Hkf7m8T2S1tt1Pv6uNVc_h2jsbefOXzqBdfcwRVqZc3VcLAuyEfofVpQ2P8eRYhNhIwxmapafvNguEamtqJ1-RhABGmZMN7VVx13",
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
                "client_view_config": "(3 fields)",
                "__isNode": "Story"
              },
              "cursor": "AQHTUXoGBtG_6cu2oiFWkMVCXhWDzxyaWStXY7Iz2lVhB1-o7Syy1BOVAeVx5DyOOTN7Dft-lsjgMOjTnX8KdRMVkOdAM1yZoNyaM02PL3cNE8mqa4YLslhg58jcQNpoGWvfkvDycE1L9Bi9KnB84BJaA3WYG-_maeMooO1BFHzBD1rrzDIi76lxGP7CFYzmB-kJrkh3x8LXjKowHWA6_0qRRNQO1jY8c2MgDzgd-oX2LLLwfH-l8fCO7mA66SJPNoYI7ls1YitCvQqkH5qq45PQ_PqAosArTlB15gsRLegGAu_WjcCF2yK8CEenQn5Dw64-lT1J9Wz39F0jmauiIs3AtCI2XiHCsVwy80wN_5gYdqJXptBrVjfXwg9YCum68ay1JlWrDR0MK3SG… (580 chars)"
            }
          ]
        }
      }
    },
    "extensions": {
      "prefetch_uris_v2": [
        {
          "uri": "https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-1/863613843_122123515995461450_843471129485614990_n.jpg (457 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1792860490629,
        "time_at_flush_ms": 1792860490788
      },
      "is_final": false,
      "sr_payload": {
        "ddd": {
          "hsrp": {
            "hsdp": {
              "clpData": {
                "1878": "(1 fields)",
                "2315": "(1 fields)",
                "3157": "(1 fields)",
                "1744228": "(1 fields)"
              },
              "ixData": {
                "487657": "(7 fields)",
                "491221": "(7 fields)",
                "491223": "(7 fields)",
                "547774": "(7 fields)",
                "547775": "(7 fields)",
                "648667": "(7 fields)",
                "648669": "(7 fields)"
              },
              "qexData": {
                "4917": "(2 fields)",
                "5648": "(2 fields)",
                "5702": "(2 fields)"
              }
            },
            "hblp": {
              "consistency": {
                "rev": 1051607682
              },
              "rsrcMap": {
                "5pGivgN": "(5 fields)",
                "csr:_c_0_E7": "(3 fields)",
                "csr:_c_1_X7": "(3 fields)",
                "SHFOhPx": "(8 fields)",
                "bgU5hjx": "(8 fields)",
                "hLdfgQ6": "(8 fields)"
              },
              "indexUpgrades": {
                "__hsdp": ":3344,3343,2766,2765,93,94,475,476"
              }
            }
          },
          "jsmods": {
            "define": [
              [
                "cr:244",
                "(1 items)",
                "(1 fields)",
                -1
              ],
              [
                "cr:310",
                "(1 items)",
                "(1 fields)",
                -1
              ],
              [
                "cr:564",
                "(1 items)",
                "(1 fields)",
                -1
              ],
              [
                "cr:619",
                "(1 items)",
                "(1 fields)",
                -1
              ],
              [
                "cr:686",
                "(0 items)",
                "(1 fields)",
                -1
              ],
              [
                "cr:734",
                "(0 items)",
                "(1 fields)",
                -1
              ],
              "… 60 more"
            ],
            "require": [
              [
                "CometFeedStoryLifeEventAttachmentStyle_styleTypeRenderer$normalization.graphql"
              ],
              [
                "CometFeedStoryLifeEventAttachmentStyle.react"
              ],
              [
                "CometFeedStoryDefaultContentStrategy_content$normalization.graphql"
              ],
              [
                "CometFeedStoryDefaultContentStrategy.react"
              ],
              [
                "CometFeedStoryDefaultLayoutStrategy_layout$normalization.graphql"
              ],
              [
                "CometFeedStoryDefaultLayoutStrategy.react"
              ],
              "… 79 more"
            ],
            "phd2_indexes": ":3344,3343,2766,2765,93,94,475,476"
          },
          "allResources": [
            "hLdfgQ6",
            "bgU5hjx",
            "5pGivgN",
            "SHFOhPx",
            "csr:_c_0_E7",
            "csr:_c_1_X7"
          ],
          "tieredResources": {
            "r": [
              "hLdfgQ6",
              "bgU5hjx",
              "5pGivgN",
              "SHFOhPx",
              "csr:_c_0_E7"
            ],
            "rdfds": [],
            "rds": [
              "csr:_c_1_X7"
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
        "node",
        "timeline_list_feed_units"
      ],
      "data": {
        "page_info": {
          "has_next_page": false,
          "end_cursor": "Cg8Ob3JnYW5pY19jdXJzb3IJAAACREFRSFRoNTR5YVVqNHFhMElWdGRwa19JWEhjekRRZ2pkblRDN3R0bVRQMTcwZmhiMUtjR0s4dHZTcHloMnBKa0RUWVhHN1hVZjZNRjVVTWpKUFRRUllPZWM4VHpOb3AzY2J1VnV6LTR4dzhSMUlkejNSaUl4RWR2Yk1MMFlGbjVnc0hidnJ0ejR4dUlxRXJTNVFUSVpFQklTZzNHbEx0X2hBZGdzZXpwLWR3X0t2Q3M5alZtekV3VVBmNW5ZWTE0RFVNcms5Sm8wN3ZUWWZndnNXcE1tcVlfSzByZ2dYMmFGWm5uTlZzZ05qb0o3NmFGWmZtUVltR0pkal9hVXg2cm1ucTZheVUwR3NuVHowTE1ldW80c2Np… (888 chars)"
        }
      },
      "extensions": {
        "prefetch_uris_v2": [
          {
            "uri": "https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-1/863613843_122123515995461450_843471129485614990_n.jpg (457 chars)",
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

**runs/host/20261024T211541_61593939852820**, step 7: goto /me: 200, 621 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "ProfileCometTimelineFeedRefetchQuery",
  "server_timestamps": "true",
  "variables": {
    "afterTime": null,
    "beforeTime": null,
    "count": 2,
    "cursor": "Cg8Ob3JnYW5pY19jdXJzb3IJAAACREFRSFRiSnl2akg5ZjFwN0tUZVZPaE9zZVVVeEl0VnhqOTgwcXVaMnhiZXUzQ3ViQUJwYjNYZFpOZEN3MVNpQXAzeEN1X3pnanNFeFBhazdRb3YxaHR2Z3BTVVRrM1pEQjhhSDJkRUVSbGRtWFROYURlSk94cm1uUXM0alhVWTY0Z3NQTjN4TUJpTnFtYk9sYm5VakpuYUdIbXJnVnVteFhWQUZBUGExd3VGeHYyZHF4UlRMdXdYR0ZZTllQWWFWY2xmTVd2RE1FU0ZPNWhPcEJhaHZuY2ZEMTMzaWxadzdhUkY0YlBfYktYUGpVRXVRcjRzUExGc1FENkhOYVJvRnBrck9neEVuaUlOXzQ1T0d3eThGT0xs… (888 chars)",
    "feedLocation": "TIMELINE",
    "feedbackSource": 0,
    "focusCommentID": null,
    "memorializedSplitTimeFilter": null,
    "omitPinnedPost": true,
    "postedBy": null,
    "privacy": null,
    "privacySelectorRenderLocation": "COMET_STREAM",
    "referringStoryRenderLocation": null,
    "renderLocation": "timeline",
    "run_with_continuation_key": true,
    "scale": 1,
    "stream_count": 1,
    "taggedInOnly": null,
    "trackingCode": null,
    "useDefaultActor": false,
    "id": "61593939852820",
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
    "__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider": "ORIGINAL",
    "__relay_internal__pv__CometUFIShareActionMigrationrelayprovider": true,
    "__relay_internal__pv__CometUFISingleLineUFIrelayprovider": true,
    "__relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider": true,
    "__relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider": true,
    "__relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider": 206,
    "__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider": false,
    "__relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider": false,
    "__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider": true
  },
  "doc_id": "29136684006021408"
}
```

Answered:

```json
{
  "first": {
    "data": {
      "node": {
        "__typename": "User",
        "id": "61593939852820",
        "timeline_list_feed_units": {
          "edges": [
            {
              "node": {
                "__typename": "Story",
                "__isFeedUnit": "Story",
                "debug_info": null,
                "id": "UzpfSTYxNTkzOTM5ODUyODIwOjEyMjEwMzM2NzY1OTQ2NDY2MToxMjIxMDMzNjc2NTk0NjQ2NjE=",
                "th_dat_spo": null,
                "feedback": "(3 fields)",
                "is_story_civic": null,
                "cache_id": "5256508423534814779",
                "matched_terms": "(0 items)",
                "post_id": "122103367659464661",
                "creation_time": 862556400,
                "cix_screen": null,
                "attachments": "(1 items)",
                "future_of_feed_info": "(4 fields)",
                "attached_story": null,
                "bumpers": null,
                "comet_sections": "(14 fields)",
                "encrypted_tracking": "AZiVCaYq5MQRkxjIHPcMknF1VMsZfAL-AlwWtzWZRDMTfpePU-882nfSs5_QAx22qXMIYT_19bLktz7-CDsFvpD-jMFupr5H25uW6WagcLda6UWrBLXzWX4rCd_pugnjkOhpJDxEYEXVZoE9wmcVubC6pQW6N02rvva8qwVUIxAjrYWRZAvBE4XucBU8_OXzCJSxlqCLieFjPDe8-zL-bwfKn-UZNByfVqgzVcJ2YyEAyDhPNCmUWxRdwtdNQm24JSBWANxrItLntgS7jsklMnWxJZrE0p6EO7_qAAGnOWHEnmxkcoSYJnXBqChHsfvrUeYeLtKY56a2XSoN65EdNNvOaed9kbafqaZd9U0e0fXfzxTv5H_dqJpfHcriIQ-vcD5cwgGjUfzzdKdV… (599 chars)",
                "should_host_actor_link_in_watch": false,
                "permalink_url": "https://www.facebook.com/permalink.php?story_fbid=pfbid0bB3F1z34LjdoWzeXbLVStHKQSreYHia4PKjt6KZDE2uZt4tYGn2NWwPqQX7cw7yel&id=61593939852820",
                "whatsapp_ad_context": null,
                "schema_context": null,
                "click_tracking_linkshim_cb": "AUCjPrgI_w6WMEkHvRj83eoGES9uj8BLhLccOnEktTBMxbnVU0EtV_Xtr347hIFiodl5fGC9nOeshkVbi4NOHuJ1aCteciohcuLRVKkAujh_E4QYgD-BaMIoOp0WH0Qv_FkwnX_RVkuDatQKku34nf3_FeYa5QLfzOduI1e6IZV3tw-RTfnGIuYFda8",
                "encrypted_click_tracking": "AZjNI_dysiNwDpaMURDj89VUZNZk0zyGnsUWXgwZ6VrldudCx9axESLMcd86gTiggrHQ0ekGYQoIy9E1KPJ06MFKUhlkb60JDUfmbdokpqUki_iy0Pd9j0fPXixykI9yKuVWUYIIcsCSBfMU9Y6VLxc2RMrV",
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
                "client_view_config": "(3 fields)",
                "__isNode": "Story"
              },
              "cursor": "AQHTfPuLIt_dQqQgLsvnBqJ7Ycnnob4zrlDGtXnRvs85Dc1mPKkvZ4MB5HwhxIilv7Lj81uNwUHqWWfz0vRWOM6fVvG9DX4hY1FqZJnglrCXTfASWk1h5SWwW7Acmv98D9aLYER3fQmZFQTumdXD1yXia9QqfWKLwQR61dHKMPkgB8NKDhS3OvfSzTowCVN_bw8h4fMx-CJ-CM_jAjoZmW5wb2KE83gYxWzOIOvJexP1hfMVKybMSIMqS6BWToheYoKMUkLaKutzmYQlfBlLku2vzfHFys-22y9cxp8-jI_DwQfidLneHPTPmm96Kyw-wPk2wf_swNUMcV0jPeb9xsMaEjUTcMd2NQGDCwXcpW_kajZLD-S4RC7gCrGcQ1_Woo5OTTkQZBF2nfyp… (580 chars)"
            }
          ]
        }
      }
    },
    "extensions": {
      "prefetch_uris_v2": [
        {
          "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png (405 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1792876630602,
        "time_at_flush_ms": 1792876630841
      },
      "is_final": false,
      "sr_payload": {
        "ddd": {
          "hsrp": {
            "hsdp": {
              "clpData": {
                "1878": "(1 fields)",
                "2315": "(1 fields)",
                "3157": "(1 fields)",
                "1744228": "(1 fields)"
              },
              "ixData": {
                "487657": "(7 fields)",
                "491221": "(7 fields)",
                "491223": "(7 fields)",
                "547774": "(7 fields)",
                "547775": "(7 fields)",
                "648667": "(7 fields)",
                "648669": "(7 fields)"
              },
              "qexData": {
                "4916": "(2 fields)",
                "4917": "(2 fields)",
                "5648": "(2 fields)",
                "5702": "(2 fields)"
              }
            },
            "hblp": {
              "consistency": {
                "rev": 1051617046
              },
              "rsrcMap": {
                "5pGivgN": "(5 fields)",
                "csr:_5_0_kh": "(3 fields)",
                "csr:_5_1_aJ": "(3 fields)",
                "SHFOhPx": "(8 fields)",
                "hLdfgQ6": "(8 fields)",
                "bgU5hjx": "(8 fields)"
              },
              "indexUpgrades": {
                "__hsdp": ":3303,3304,2749,2750,150,149,93,94,476,477"
              }
            }
          },
          "jsmods": {
            "define": [
              [
                "cr:244",
                "(1 items)",
                "(1 fields)",
                -1
              ],
              [
                "cr:310",
                "(1 items)",
                "(1 fields)",
                -1
              ],
              [
                "cr:564",
                "(1 items)",
                "(1 fields)",
                -1
              ],
              [
                "cr:619",
                "(1 items)",
                "(1 fields)",
                -1
              ],
              [
                "cr:686",
                "(0 items)",
                "(1 fields)",
                -1
              ],
              [
                "cr:734",
                "(0 items)",
                "(1 fields)",
                -1
              ],
              "… 61 more"
            ],
            "require": [
              [
                "CometFeedStoryLifeEventAttachmentStyle_styleTypeRenderer$normalization.graphql"
              ],
              [
                "CometFeedStoryLifeEventAttachmentStyle.react"
              ],
              [
                "CometFeedStoryDefaultContentStrategy_content$normalization.graphql"
              ],
              [
                "CometFeedStoryDefaultContentStrategy.react"
              ],
              [
                "CometFeedStoryDefaultLayoutStrategy_layout$normalization.graphql"
              ],
              [
                "CometFeedStoryDefaultLayoutStrategy.react"
              ],
              "… 79 more"
            ],
            "phd2_indexes": ":3303,3304,2749,2750,150,149,93,94,476,477"
          },
          "allResources": [
            "hLdfgQ6",
            "bgU5hjx",
            "5pGivgN",
            "SHFOhPx",
            "csr:_5_0_kh",
            "csr:_5_1_aJ"
          ],
          "tieredResources": {
            "r": [
              "hLdfgQ6",
              "bgU5hjx",
              "5pGivgN",
              "SHFOhPx",
              "csr:_5_0_kh"
            ],
            "rdfds": [],
            "rds": [
              "csr:_5_1_aJ"
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
        "node",
        "timeline_list_feed_units"
      ],
      "data": {
        "page_info": {
          "has_next_page": false,
          "end_cursor": "Cg8Ob3JnYW5pY19jdXJzb3IJAAACREFRSFRQYmlZV1ZGcFhXbi1KYzhQSEFhUnl4U3k3dXI4azNiQmhJdVNJUEpjUUxCUk1PeWtNTURhTDczNWRFUmxTX0hnQlR0OEIyRXBGeTdVZ2RER25zMUNyeVRxaUxWaWJsdkVJcDVXRV9rbWFmdzV3dGVMNUU3VTE3c19OaFVkNXhBdjc5d0lfM19YQzBKdk1JX2xwZFlQY1E2Z0t6dFhyZzlHV0VEOUtYRXVadlV0U1lkWHlIODZRNTZLUE84YjM5LWRZOGtuYjZEUzFhS0VaSWcxMzRLN1E2S2RMel9MZXlHNWlZRXNwVkExUU9mQm83RV83NnNVSEZSUTlOaEtKM0tBUUVGT2JubXk2ZzZFcWgzSXpo… (888 chars)"
        }
      },
      "extensions": {
        "prefetch_uris_v2": [
          {
            "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png (405 chars)",
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

**runs/host/20261024T211541_61593939852820**, step 12: goto /me: 200, 533 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "ProfileCometTimelineFeedRefetchQuery",
  "server_timestamps": "true",
  "variables": {
    "afterTime": null,
    "beforeTime": null,
    "count": 2,
    "cursor": "Cg8Ob3JnYW5pY19jdXJzb3IJAAACREFRSFROSS1aUnIwcldBbGJxTHNQcXVCQWlrbDFQY2tkMVMtZDR3V1NpbFBud25MUFUybExMTzlXcEhlWnBBbkpEaE1sR3pFaUhKNWM3VG5xb1hrRXhBcnMyeEw5XzNLdl9LUXVfNFpIaWJTQmJqS0dzT3dMQW9iQWNBbDhMOXNqTlI4S2Z2d0ItMjE5LWszZm5XN0lhSldYd3dhWmpmdnE1QU9CR0Z6Qnhla0Q1ZVowUDRaajVzNFFqRkFXdm1KZ01VRkdZZ3lIaU5DRVgwRkZpTlhhSXJEUjFxcVR6OFZfUnRKdGhXbk80YUNWZlg0bmJ1NzRaa0ZiZGY5Q05mM1RrUDdvY2p6Q2F3WWJVWHRHbDhneFNt… (888 chars)",
    "feedLocation": "TIMELINE",
    "feedbackSource": 0,
    "focusCommentID": null,
    "memorializedSplitTimeFilter": null,
    "omitPinnedPost": true,
    "postedBy": null,
    "privacy": null,
    "privacySelectorRenderLocation": "COMET_STREAM",
    "referringStoryRenderLocation": null,
    "renderLocation": "timeline",
    "run_with_continuation_key": true,
    "scale": 1,
    "stream_count": 1,
    "taggedInOnly": null,
    "trackingCode": null,
    "useDefaultActor": false,
    "id": "61593939852820",
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
    "__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider": "ORIGINAL",
    "__relay_internal__pv__CometUFIShareActionMigrationrelayprovider": true,
    "__relay_internal__pv__CometUFISingleLineUFIrelayprovider": true,
    "__relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider": true,
    "__relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider": true,
    "__relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider": 206,
    "__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider": false,
    "__relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider": false,
    "__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider": true
  },
  "doc_id": "29136684006021408"
}
```

Answered:

```json
{
  "first": {
    "data": {
      "node": {
        "__typename": "User",
        "id": "61593939852820",
        "timeline_list_feed_units": {
          "edges": [
            {
              "node": {
                "__typename": "Story",
                "__isFeedUnit": "Story",
                "debug_info": null,
                "id": "UzpfSTYxNTkzOTM5ODUyODIwOjEyMjEwMzM2NzY1OTQ2NDY2MToxMjIxMDMzNjc2NTk0NjQ2NjE=",
                "th_dat_spo": null,
                "feedback": "(3 fields)",
                "is_story_civic": null,
                "cache_id": "5256508423534814779",
                "matched_terms": "(0 items)",
                "post_id": "122103367659464661",
                "creation_time": 862556400,
                "cix_screen": null,
                "attachments": "(1 items)",
                "future_of_feed_info": "(4 fields)",
                "attached_story": null,
                "bumpers": null,
                "comet_sections": "(14 fields)",
                "encrypted_tracking": "AZiZ_O0YGZu0KMdv6DHXW3xiUN3shZ3BwJkfwPOeit4gTJp49ZjOJebIl2ZpnnnIHqchUr0fM3DGKv_DCkScDMXjiMEid5iK_cpazQuxVyN9Vb137rbI3QCZeqqyPrOmkcS-hN7p4jzEJnCTeSL6rrWs07MVmO4WIfaEojNmz2kb77bAq7VNrNjCf-4k709Dmsdmbjdk6GQ_zddNK1QObJrk_6ciAZOPardik7x2le-wm-r0DKoRbawhssnU2BKohVpw5Yo_Ph3hrtrIeQUURnZN-YcaIEl_XMJZ1tOxKm5whP7N8WFF6mbbG5tSiNrvI9Tjt6Z6B19WIJkj5Q87sKzivd-X272hfCpxxzZdbyGTxdYZunm5zOSR2v-g3j8h20-ZKDS7NDZH1DFk… (599 chars)",
                "should_host_actor_link_in_watch": false,
                "permalink_url": "https://www.facebook.com/permalink.php?story_fbid=pfbid0bB3F1z34LjdoWzeXbLVStHKQSreYHia4PKjt6KZDE2uZt4tYGn2NWwPqQX7cw7yel&id=61593939852820",
                "whatsapp_ad_context": null,
                "schema_context": null,
                "click_tracking_linkshim_cb": "AUAJtr9GxtN48OSqORcKkPFqJ18CKKgN2XTg4K5-znw98BADmBpYRUgVKS-eE5qPNKr_-2GSS0MnwewF4qRmY4WTav3EHUgjBKEBQ4F514645doVhvXf5YmPWTJaDw9j9-tUxLmgWcTEuk56iiEJA_8uzCjr6jfWiWLJhZtyWs2BtxQ8uK8WQFQ4D3A",
                "encrypted_click_tracking": "AZiMOiCQCt0CIPNZ6i_8fwVt03abiNkfe2VPSbktyAwpODcLiqDRF9tGf_Kdb7UG_Nh_lC_hvwaiKeaXZkgz8IjhR-IVMqgmMDM27kg1F7aXV3QJVxfCz6yF2NbSVU-Ne65SukKs4SBt00sqhQXz0IiEtDsN",
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
                "client_view_config": "(3 fields)",
                "__isNode": "Story"
              },
              "cursor": "AQHTk19VDfeCtxwwf2FNc10cZLHfNHTuPLPnrtc7bm3huEKrDxINpET5sT6uvo0Una8gPXWgrs3c88RgLssYv4mz9ZDjAD18owtxisX4gQSw2dR5hfV7dHoTOmBgWrzO6G-7mw2Xx5L85MnNAz1rL1YmxMvMqvXyuS3D07TOmzr64HE63s-T2ZqP3ctMzXBS06gR5MJcNYTLdCbL-34LQBPv_4Fe3Z108vQTO93QNn4kBQMldt4d4DyKa3rgmUgntYNCzk2W-WvB4ieb98Lil35_NkV2eWQ_Nuy99SgVHx-oE_pvio0pVxF_CQgEABLG21AtyxwQElnhGHf6sG27_9aDlBU8SEudHP6wAOEsWg0IsJmC43h3M47scWOMQj7AtDY7gEhcgbVP97ma… (580 chars)"
            }
          ]
        }
      }
    },
    "extensions": {
      "prefetch_uris_v2": [
        {
          "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png (405 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1792876753158,
        "time_at_flush_ms": 1792876753343
      },
      "is_final": false,
      "sr_payload": {
        "ddd": {
          "hsrp": {
            "hsdp": {
              "clpData": {
                "1878": "(1 fields)",
                "2315": "(1 fields)",
                "3157": "(1 fields)",
                "1744228": "(1 fields)"
              },
              "ixData": {
                "487657": "(7 fields)",
                "491221": "(7 fields)",
                "491223": "(7 fields)",
                "547774": "(7 fields)",
                "547775": "(7 fields)",
                "648667": "(7 fields)",
                "648669": "(7 fields)"
              },
              "qexData": {
                "4916": "(2 fields)",
                "4917": "(2 fields)",
                "5648": "(2 fields)",
                "5702": "(2 fields)"
              }
            },
            "hblp": {
              "consistency": {
                "rev": 1051617046
              },
              "rsrcMap": {
                "5pGivgN": "(5 fields)",
                "csr:_9_0_n7": "(3 fields)",
                "csr:_9_1_0Y": "(3 fields)",
                "SHFOhPx": "(8 fields)",
                "hLdfgQ6": "(8 fields)",
                "bgU5hjx": "(8 fields)"
              },
              "indexUpgrades": {
                "__hsdp": ":3303,3304,2749,2750,150,149,93,94,476,477"
              }
            }
          },
          "jsmods": {
            "define": [
              [
                "cr:244",
                "(1 items)",
                "(1 fields)",
                -1
              ],
              [
                "cr:310",
                "(1 items)",
                "(1 fields)",
                -1
              ],
              [
                "cr:564",
                "(1 items)",
                "(1 fields)",
                -1
              ],
              [
                "cr:619",
                "(1 items)",
                "(1 fields)",
                -1
              ],
              [
                "cr:686",
                "(0 items)",
                "(1 fields)",
                -1
              ],
              [
                "cr:734",
                "(0 items)",
                "(1 fields)",
                -1
              ],
              "… 61 more"
            ],
            "require": [
              [
                "CometFeedStoryLifeEventAttachmentStyle_styleTypeRenderer$normalization.graphql"
              ],
              [
                "CometFeedStoryLifeEventAttachmentStyle.react"
              ],
              [
                "CometFeedStoryDefaultContentStrategy_content$normalization.graphql"
              ],
              [
                "CometFeedStoryDefaultContentStrategy.react"
              ],
              [
                "CometFeedStoryDefaultLayoutStrategy_layout$normalization.graphql"
              ],
              [
                "CometFeedStoryDefaultLayoutStrategy.react"
              ],
              "… 79 more"
            ],
            "phd2_indexes": ":3303,3304,2749,2750,150,149,93,94,476,477"
          },
          "allResources": [
            "hLdfgQ6",
            "bgU5hjx",
            "5pGivgN",
            "SHFOhPx",
            "csr:_9_0_n7",
            "csr:_9_1_0Y"
          ],
          "tieredResources": {
            "r": [
              "hLdfgQ6",
              "bgU5hjx",
              "5pGivgN",
              "SHFOhPx",
              "csr:_9_0_n7"
            ],
            "rdfds": [],
            "rds": [
              "csr:_9_1_0Y"
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
        "node",
        "timeline_list_feed_units"
      ],
      "data": {
        "page_info": {
          "has_next_page": false,
          "end_cursor": "Cg8Ob3JnYW5pY19jdXJzb3IJAAACREFRSFRlWjBFdTVGZ3RRS2NESDM4UEtxdENRVHZGSDBRcjdoVGQ1MDVQWGJBVkIyOERwZFJPQjdrU1ZmRTZ2T25BZHJZVWppZGQ0Uk9QZjBkanlzdlVKcjVHQjJrZUpVLWEtV3VJaV9VRVI2ZlhSSmdrY01MU1lvTlFoUXM1SlVtYnZLdGdkYTlxaFRBT3E0UDNDME1uWmRpYjFFNFl4NGJsNzZxTDZKLUp6eFBvQVBmWWdfajFkaDY0dFZ2ZDNKcHljbmx0UDZaOEsyLUNBN0Zna2JsZUQ5MTlDZTd5UkJLaVQwV3lwMmhDNkFZcDdGUFg3Z2UyWG9ORjZEYWlvNVdIWDk4cmlRTXJ1QjZvNG5lUHUzdW5k… (888 chars)"
        }
      },
      "extensions": {
        "prefetch_uris_v2": [
          {
            "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png (405 chars)",
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

Reloads the posts on a profile's timeline (`ProfileCometTimelineFeed_user`), by the profile's `id`, a `count` and a `cursor`, with time bounds. It fired on run 20261020T162343 as Bethlehem's own profile loaded (607 ms).

## What our machine does with it

It is the profile's equivalent of the group feed query: the posts our flows make (and the comments on them) appear in it, so reading an account's own posts back after `profilePost` would read this answer, as `src/facebook/group/read` reads the group feed's.

## What can go wrong

None seen.
