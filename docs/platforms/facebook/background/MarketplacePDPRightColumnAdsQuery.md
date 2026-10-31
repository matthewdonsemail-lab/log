# MarketplacePDPRightColumnAdsQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27876163185349836` |
| Path | `/api/graphql/` |
| Sends | `adsRelatedTo`, `browseContext`, `count`, `cursor`, `scale`, `__relay_internal__pv__GHLShouldChangeMarketplaceSponsoredDataFieldNamerelayprovider` |
| Reads | `viewer.marketplace_feed_stories` |
| Called from | `MarketplacePDPRightColumnAds.react` |
| rea | `ev_0f261acc79d73221fb5f208587c946094d6a81c596ff48ce44b839a75db41734` |

Seen 15 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | scroll: +127px in 4 wheel steps, 125 ms | 1 | 200 | 3017 ms | 2121 ms | — |
| warmup | scroll: -605px in 14 wheel steps, 687 ms | 1 | 200 | 1685 ms | 1694 ms | — |
| warmup | step 10: openAny 2-4 x /marketplace/item/ | 2 | 200 | 2725–3827 ms | 251–2099 ms | — |
| warmup | openAny: read /marketplace/item/<id>/ | 1 | 200 | 1492 ms | 3303 ms | — |
| warmup | scroll: -756px in 16 wheel steps, 656 ms | 1 | 200 | 2050 ms | 689 ms | — |
| inspect | scroll: -577px in 13 wheel steps, 859 ms | 1 | 200 | 2056 ms | 2392 ms | — |
| inspect | scroll: +978px in 22 wheel steps, 1531 ms | 1 | 200 | 1783 ms | 823 ms | — |
| inspect | step 25: openAny 1-3 x /marketplace/item/ | 1 | 200 | 1762 ms | 1236 ms | — |
| inspect | scroll: +161px in 5 wheel steps, 250 ms | 1 | 200 | 1918 ms | 1885 ms | — |
| inspect | scroll: -161px in 5 wheel steps, 172 ms | 1 | 200 | 1987 ms | 702 ms | — |
| warmup | scroll: -1034px in 22 wheel steps, 1032 ms | 1 | 200 | 1932 ms | 802 ms | — |
| warmup | scroll: +981px in 24 wheel steps, 1672 ms | 1 | 200 | 1839 ms | 2047 ms | — |
| host | scroll: -553px in 12 wheel steps, 499 ms | 1 | 200 | 1398 ms | 610 ms | — |
| host | scroll: +617px in 15 wheel steps, 789 ms | 1 | 200 | 985 ms | 838 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, scroll: -553px in 12 wheel steps, 499 ms: 200, 1398 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplacePDPRightColumnAdsQuery",
  "server_timestamps": "true",
  "variables": {
    "adsRelatedTo": "1818774979262678",
    "browseContext": "PDP_RELATED_ADS_FEED",
    "count": 1,
    "cursor": "",
    "scale": 1,
    "__relay_internal__pv__GHLShouldChangeMarketplaceSponsoredDataFieldNamerelayprovider": true
  },
  "doc_id": "27876163185349836"
}
```

Answered:

```json
{
  "first": {
    "data": {
      "viewer": {
        "marketplace_feed_stories": {
          "edges": [
            {
              "node": "(10 fields)"
            }
          ]
        }
      }
    },
    "extensions": {
      "all_video_dash_prefetch_representations": [
        {
          "initial_representation_ids": [],
          "representations": [
            {
              "representation_id": "1824353692183163v",
              "mime_type": "video/mp4",
              "codecs": "av01.0.04M.08.0.111",
              "base_url": "https://video.fyvr3-1.fna.fbcdn.net/o1/v/t2/f2/m366/AQNys13xCpuPJR22s3CnguLNK4Rze9Fby1HZRYtuMxz6E94jwiBh5eJUdHPvLi02kUWPsHr8dJ3Udghu5wKK_b_evDjtAymJ-ttKGS8.mp4 (815 chars)",
              "bandwidth": 137521,
              "height": 540,
              "width": 540,
              "playback_resolution_mos": "0:100,360:63.1,480:58.5,720:51.5,1080:49.4",
              "playback_resolution_csvqm": "0:100,360:92.8,480:89.3,720:82,1080:73.9",
              "segments": "(3 items)"
            },
            {
              "representation_id": "1824353678849831v",
              "mime_type": "video/mp4",
              "codecs": "av01.0.04M.08.0.111",
              "base_url": "https://video.fyvr4-1.fna.fbcdn.net/o1/v/t2/f2/m366/AQPfCEXw_SR_1cIc7ds6ZbrL2GlJR1YcDLom2DLpZAypUnDDUWbTUtLCrQsMLjbstYm_0i2Eh5kzWIA4hKzEi6GKtuHYBoKVEy0A8Is.mp4 (823 chars)",
              "bandwidth": 195157,
              "height": 720,
              "width": 720,
              "playback_resolution_mos": "0:100,360:69.1,480:64.8,720:60.3,1080:57.6",
              "playback_resolution_csvqm": "0:100,360:95.6,480:94.2,720:90.7,1080:84.6",
              "segments": "(3 items)"
            },
            {
              "representation_id": "1824353675516498v",
              "mime_type": "video/mp4",
              "codecs": "av01.0.04M.08.0.111",
              "base_url": "https://video.fyvr3-1.fna.fbcdn.net/o1/v/t2/f2/m366/AQOaVmKeW2NFrukXmV-R4IhNXe0SKLDMMdLwEuxOSk0IIyotoZ4JJxmh3X4RbgxaJCTEuiLhgHuSR753dEvnk0srlJkrfJ7RD3TGGQE.mp4 (823 chars)",
              "bandwidth": 243458,
              "height": 720,
              "width": 720,
              "playback_resolution_mos": "0:100,360:73.1,480:69.2,720:64.6,1080:61.5",
              "playback_resolution_csvqm": "0:100,360:96.7,480:95.6,720:93.5,1080:88.1",
              "segments": "(3 items)"
            },
            {
              "representation_id": "1824353695516496v",
              "mime_type": "video/mp4",
              "codecs": "av01.0.04M.08.0.111",
              "base_url": "https://video.fyvr4-1.fna.fbcdn.net/o1/v/t2/f2/m366/AQPSVAYOZEEldr5JNJSvfHoeiJGmuBik3FgN9POoUo9tva7RjX4jEqzD_BRFVoKdgXNI16DGPwCEU6QK2jtAHcuf6EQQw_gXKaAqk0I.mp4 (823 chars)",
              "bandwidth": 327833,
              "height": 720,
              "width": 720,
              "playback_resolution_mos": "0:100,360:77.9,480:74.5,720:70.1,1080:66.5",
              "playback_resolution_csvqm": "0:100,360:97.9,480:97.2,720:95.8,1080:92.4",
              "segments": "(3 items)"
            },
            {
              "representation_id": "1824353685516497v",
              "mime_type": "video/mp4",
              "codecs": "av01.0.04M.08.0.111",
              "base_url": "https://video.fyvr4-1.fna.fbcdn.net/o1/v/t2/f2/m366/AQPDJD_xUkJ_7RzSDEqFGsvohmzj3pFfgknvv0mf6iO2rItPKeUkkhFtojGK3Kw7tQQFyF-SZqm7mBf-zOkLXY1_TeDm_SB2kE3oZ-A.mp4 (795 chars)",
              "bandwidth": 390021,
              "height": 720,
              "width": 720,
              "playback_resolution_mos": "0:100,360:81,480:76.8,720:72.6,1080:68.9",
              "playback_resolution_csvqm": "0:100,360:98.4,480:98.01,720:97.1,1080:94.1",
              "segments": "(3 items)"
            },
            {
              "representation_id": "1824353668849832v",
              "mime_type": "video/mp4",
              "codecs": "av01.0.04M.08.0.111",
              "base_url": "https://video.fyvr3-1.fna.fbcdn.net/o1/v/t2/f2/m366/AQMTV2K2vKej_4kDHKB81EXZjkV1N6l6bnXS5CHlJkpR70lHNyTJck-QwL-0FCHaSh1bZbX9q1lhjGy6Dv641j-aNb4Dxwf-Ccql6es.mp4 (823 chars)",
              "bandwidth": 456446,
              "height": 720,
              "width": 720,
              "playback_resolution_mos": "0:100,360:83.2,480:78.7,720:74.4,1080:70.5",
              "playback_resolution_csvqm": "0:100,360:98.64,480:98.43,720:97.8,1080:95.2",
              "segments": "(3 items)"
            },
            "… 5 more"
          ],
          "video_id": "937263719207841",
          "nextgendash": true
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1793038228922,
        "time_at_flush_ms": 1793038230145
      },
      "is_final": false,
      "sr_payload": {
        "ddd": {
          "hsrp": {
            "hblp": {
              "consistency": "(1 fields)",
              "rsrcMap": "(1 fields)",
              "indexUpgrades": "(0 fields)"
            }
          },
          "jsmods": {
            "require": [
              "(1 items)",
              "(1 items)",
              "(1 items)",
              "(1 items)",
              "(1 items)",
              "(1 items)",
              "… 5 more"
            ]
          },
          "allResources": [
            "csr:_1l_0_lJ"
          ],
          "tieredResources": {
            "r": [
              "csr:_1l_0_lJ"
            ],
            "rdfds": [],
            "rds": []
          }
        }
      }
    }
  },
  "followingParts": 1,
  "parts": [
    {
      "label": "VideoPlayerRelay_video$defer$InstreamVideoAdBreaksPlayer_video",
      "path": [
        "viewer",
        "marketplace_feed_stories",
        "edges",
        0,
        "node",
        "story",
        "… 3 more"
      ],
      "data": {
        "id": "937263719207841",
        "instream_extra_config": {
          "instream_halo_delay_time_seconds": 23
        },
        "instream_video_ad_breaks_comet": null
      },
      "extensions": {
        "all_video_dash_prefetch_representations": [
          {
            "initial_representation_ids": [],
            "representations": [
              "(10 fields)",
              "(10 fields)",
              "(10 fields)",
              "(10 fields)",
              "(10 fields)",
              "(10 fields)",
              "… 5 more"
            ],
            "video_id": "937263719207841",
            "nextgendash": true
          }
        ],
        "is_final": true
      }
    }
  ]
}
```

**runs/host/20261026T180628_61594285317994**, scroll: +617px in 15 wheel steps, 789 ms: 200, 985 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplacePDPRightColumnAdsQuery",
  "server_timestamps": "true",
  "variables": {
    "adsRelatedTo": "2249546198922840",
    "browseContext": "PDP_RELATED_ADS_FEED",
    "count": 1,
    "cursor": "",
    "scale": 1,
    "__relay_internal__pv__GHLShouldChangeMarketplaceSponsoredDataFieldNamerelayprovider": true
  },
  "doc_id": "27876163185349836"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_feed_stories": {
        "edges": [
          {
            "node": {
              "__typename": "MarketplaceFeedAdStory",
              "story": {
                "sp": {
                  "sponsored_label_redesign_eligible": true,
                  "ad_id": "120247618366970759",
                  "page_id": "378433955560372"
                },
                "id": "UzpfSTM5MTMxMzg2NzY3MzE2NDpTY2FfSTM3ODQzMzk1NTU2MDM3MmNhMTQ0MTExNjgxMTM4MDk4MjphY2ExY2F7aWNhMDtzY2E5MWNhIkFJQEFRSlA4SDVXY2M2dnVlcGJYRUlCOERGeWUyc01ZZjdfa1I3X2JLdlhuMjZ2eHA0VlZaMXpSa0MtN1VjYzJ5TFBpSzcxUEhoM0YxakRtejEtV3ZZZ2s3OHdieCI7fQ==",
                "tracking": "{\"adid\":\"120247618366970759\",\"qid\":\"-5910558962977832244\",\"mf_story_key\":\"7791895694081474905\",\"is_sponsored\":1,\"ei\":\"AI\\u0040AQJP8H5Wc6vuepbXEIB8DFye2sMYf7_kR7_bKvXn26vxp4VVZ1zRkC-7Uc2yLPiK71PHh3F1jDmz1-WvYgk78wbx\",\"top_level_post_id\":\"1441116811380982\",\"content_owner_id_new\":\"100064480308558\",\"call_to_action_type\":\"LEARN_MORE\",\"page_id\":\"378433955560372\",\"story_location\":9,\"story_attachment_styl… (1097 chars)",
                "attachments": [
                  {
                    "url": "…",
                    "action_links": "…",
                    "style_list": "…",
                    "cta_screen_renderer": "…",
                    "media": "…",
                    "subattachments": "…",
                    "title_with_entities": "…",
                    "all_subattachments": "…"
                  }
                ],
                "click_tracking_linkshim_cb": "AUCy4Uw0ElHtltonamo3JbLFHU1ZP7tRrZhWd_e3fJfJaxQ4fupoZCm4Zp5Zs9fv364A32aFHKLxEsEY2EvPuwg7LWEgbO63yCk-fXAtlXG94VmNPr-ZjNmsdwqViVqDeifnvAe_TANuXax0Fo186h0X4nkTmEFXZozbBDWAgEU5C7hoUTn5y6vta5SeTMMOeEYQfMvni7ymPyWVkd7hWv4aTPELuTJJWCfdrh-6nY9XjVyXl7mfz-W2__LDM-GpYcUm0xz1gP43bsXWKGsj7VJ-UofAFGOMaXZ2P-PI9YsJjiR-MNrgpwJH8-uMqlGAEIg5V79zfJfE7wYiJ9UPlR0",
                "client_view_config": {
                  "can_delay_log_impression": true,
                  "use_banzai_signal_imp": true,
                  "use_banzai_vital_imp": true
                },
                "encrypted_click_tracking": "AZhtzKpzev_Nww8P8k3NzoybmX--1egKiq9oH65jVDJ5fImgVDVpQxcKkbPFqBzQ6Z_Sy1kYbs6GQSx8bcxZQZ64vtm6xGRNu_RJDuwhRLAFmQuvbUC-ILt5NGl9Jinc_5S7scClzYey2KyVyKwVXqnO4Ic4hMiBMk1R_Zp0n7nCykzQP2VovNF-fE_4ypnVFgqdk3Y4omqHZ2h0iIKM0kJJXLEcyFknscRrjWggJ4hMZHcILi5Ze0q8NfnFGYZAStKmmHR0dpDIbtdXftYoXVy41jBCqMeQlWiWOqjeAe0faFlwHCG1PHve",
                "encrypted_tracking": "AZgqd9Q9vZSrJAmFK_zcS1CVAdUHvHPlohsVwN8YU_dqaBtXCLmF4OsZjt3qyDWjFBVUe8PqV9diZaxBetzM5LzGe3R54Bz1ZylJxiEBumt-7Yhdf909Cgisf3GCcD_OyMYeQ1H77-juUvm_oKR2Xc9Vewp7UfPAbQpIAI9BPS6M9YQXDdhiqbf4kRarnkPMx0LHh1KlTJRyfT0pk6cIqbo9I-jytSsms7ilN5ScfWn_NncTos-9t-k4dGae-zgr4MuB-Ax8l4N700cxA485g8-q0wmji5BRwTdXn_oP6jp5yhDrrGq6HENwu9TVSDWDKecXFPquX1O-uu5q-Xws7TlThgARkWyjoIxdQUAegCRqrRNIQP80aMXrQZoSHqE9oJFz2k0Fke7tLCTY… (1503 chars)",
                "viewability_config": [
                  8,
                  5
                ],
                "actors": [
                  {
                    "__typename": "…",
                    "name": "…",
                    "profile_picture": "…",
                    "id": "…"
                  }
                ],
                "transparency_ad_info": {
                  "menu_label": "About this ad"
                },
                "genai_transparency_ads_info": {
                  "genai_transparency_ui_experience_content_overflow_menu": null,
                  "genai_transparency_ui_experience_content": null
                }
              },
              "ad_impression_client_token": "(taken out)",
              "ad_id_string": "120247618366970759",
              "is_hidden": false,
              "story_attachment_style": "large_single_image_tile",
              "is_demo": false,
              "transparency_ad_info": {
                "should_display_ad_info": true
              },
              "product_item": null,
              "id": "120247618366970759:IN_MEMORY_MARKETPLACE_FEED_STORY_ENT:EntMarketplaceFeedAdStory:451829627"
            }
          }
        ]
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038239705,
      "time_at_flush_ms": 1793038240521
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hblp": {
            "consistency": {
              "rev": 1051718708
            },
            "rsrcMap": {
              "csr:_1x_0_nf": {
                "type": "csr",
                "src": ":1,337,9,12,8,2,7,51,10,11,13",
                "c": 1
              }
            },
            "indexUpgrades": {}
          }
        },
        "jsmods": {
          "require": [
            [
              "CometFeedStoryVideoCTAScreenLinkOpenCallToAction_actionLink$normalization.graphql"
            ],
            [
              "CometFeedStoryVideoCTAScreenLinkOpenCallToAction.react"
            ],
            [
              "emptyFunction",
              "thatReturns",
              [
                "RequireDeferredReference"
              ],
              [
                [
                  {
                    "__dr": "…"
                  },
                  {
                    "__dr": "…"
                  }
                ]
              ]
            ],
            [
              "RequireDeferredReference",
              "unblock",
              [],
              [
                [
                  "CometFeedStoryVideoCTAScreenLinkOpenCallToAction_actionLink$normalization.graphql",
                  "CometFeedStoryVideoCTAScreenLinkOpenCallToAction.react"
                ],
                "sd"
              ]
            ],
            [
              "RequireDeferredReference",
              "unblock",
              [],
              [
                [
                  "CometFeedStoryVideoCTAScreenLinkOpenCallToAction_actionLink$normalization.graphql",
                  "CometFeedStoryVideoCTAScreenLinkOpenCallToAction.react"
                ],
                "css"
              ]
            ]
          ]
        },
        "allResources": [
          "csr:_1x_0_nf"
        ],
        "tieredResources": {
          "r": [
            "csr:_1x_0_nf"
          ],
          "rdfds": [],
          "rds": []
        }
      }
    }
  }
}
```

<!-- facts:end -->

## What it does

Loads the sponsored listings in a Marketplace listing page's right column (`viewer.marketplace_feed_stories`, `adsRelatedTo` the listing open). It fired 3 times in 2 runs, 0.8-2.0 s into the step that opened a listing, with the listing's own requests.

## What our machine does with it

Nothing in our machines reads it; it comes with every listing `openListings` opens.

## What can go wrong

None seen: all three answered 200, the slowest of a listing's requests at 1762-2056 ms. Nothing waits on it.
