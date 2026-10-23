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
| rea | `ev_60c1ff17945c01c64f962c11cd4de230589c6861a2a0e6b369989fa6b189d159` |

Seen 13 time(s) in 6 run(s).

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

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/warmup/20261023T074930_61594063207669**, step 10: openAny 2-4 x /marketplace/item/: 200, 2725 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplacePDPRightColumnAdsQuery",
  "server_timestamps": "true",
  "variables": {
    "adsRelatedTo": "1749699906261391",
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
            "(1 fields)"
          ]
        }
      }
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
            "… 3 more"
          ],
          "video_id": "1114883744850595",
          "nextgendash": true
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1792742062751,
        "time_at_flush_ms": 1792742063952
      },
      "is_final": false,
      "sr_payload": {
        "ddd": {
          "hsrp": {
            "hsdp": "(2 fields)",
            "hblp": "(3 fields)"
          },
          "jsmods": {
            "define": "(7 items)",
            "require": "(7 items)",
            "phd2_indexes": ":137,138,109,110,112,111"
          },
          "allResources": [
            "csr:_1f_0_7K"
          ],
          "tieredResources": {
            "r": "(1 items)",
            "rdfds": "(0 items)",
            "rds": "(0 items)"
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
        "id": "1114883744850595",
        "instream_extra_config": {
          "instream_halo_delay_time_seconds": 15000
        },
        "instream_video_ad_breaks_comet": {
          "mid_rolls": [
            "(3 fields)",
            "(3 fields)"
          ],
          "pre_roll": null,
          "__module_operation_InstreamVideoAdBreaksPlayer_video_instream_video_ad_breaks_comet": {
            "__dr": "InstreamVideoAdBreaksPlayerImpl_adBreaks$normalization.graphql"
          },
          "__module_component_InstreamVideoAdBreaksPlayer_video_instream_video_ad_breaks_comet": {
            "__dr": "InstreamVideoAdBreaksPlayerDeferred.react"
          }
        }
      },
      "extensions": {
        "all_video_dash_prefetch_representations": [
          {
            "initial_representation_ids": "(0 items)",
            "representations": "(7 items)",
            "video_id": "1114883744850595",
            "nextgendash": true
          }
        ],
        "is_final": true,
        "sr_payload": {
          "ddd": {
            "hsrp": "(2 fields)",
            "jsmods": "(3 fields)",
            "allResources": "(3 items)",
            "tieredResources": "(3 fields)"
          }
        }
      }
    }
  ]
}
```

**runs/warmup/20261023T074930_61594063207669**, scroll: -1034px in 22 wheel steps, 1032 ms: 200, 1932 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplacePDPRightColumnAdsQuery",
  "server_timestamps": "true",
  "variables": {
    "adsRelatedTo": "1098292579663100",
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
            "(1 fields)"
          ]
        }
      }
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
            "… 3 more"
          ],
          "video_id": "1114883744850595",
          "nextgendash": true
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1792742073446,
        "time_at_flush_ms": 1792742074800
      },
      "is_final": false,
      "sr_payload": {
        "ddd": {
          "hsrp": {
            "hblp": "(3 fields)"
          },
          "jsmods": {
            "require": "(7 items)"
          },
          "allResources": [
            "csr:_1p_0_cT"
          ],
          "tieredResources": {
            "r": "(1 items)",
            "rdfds": "(0 items)",
            "rds": "(0 items)"
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
        "id": "1114883744850595",
        "instream_extra_config": {
          "instream_halo_delay_time_seconds": 15000
        },
        "instream_video_ad_breaks_comet": {
          "mid_rolls": [
            "(3 fields)",
            "(3 fields)"
          ],
          "pre_roll": null,
          "__module_operation_InstreamVideoAdBreaksPlayer_video_instream_video_ad_breaks_comet": {
            "__dr": "InstreamVideoAdBreaksPlayerImpl_adBreaks$normalization.graphql"
          },
          "__module_component_InstreamVideoAdBreaksPlayer_video_instream_video_ad_breaks_comet": {
            "__dr": "InstreamVideoAdBreaksPlayerDeferred.react"
          }
        }
      },
      "extensions": {
        "all_video_dash_prefetch_representations": [
          {
            "initial_representation_ids": "(0 items)",
            "representations": "(7 items)",
            "video_id": "1114883744850595",
            "nextgendash": true
          }
        ],
        "is_final": true,
        "sr_payload": {
          "ddd": {
            "hsrp": "(1 fields)",
            "jsmods": "(1 fields)",
            "allResources": "(1 items)",
            "tieredResources": "(3 fields)"
          }
        }
      }
    }
  ]
}
```

**runs/warmup/20261023T074930_61594063207669**, scroll: +981px in 24 wheel steps, 1672 ms: 200, 1839 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplacePDPRightColumnAdsQuery",
  "server_timestamps": "true",
  "variables": {
    "adsRelatedTo": "2064512760864293",
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
            "(1 fields)"
          ]
        }
      }
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
            "… 3 more"
          ],
          "video_id": "1114883744850595",
          "nextgendash": true
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1792742086009,
        "time_at_flush_ms": 1792742087221
      },
      "is_final": false,
      "sr_payload": {
        "ddd": {
          "hsrp": {
            "hblp": "(3 fields)"
          },
          "jsmods": {
            "require": "(7 items)"
          },
          "allResources": [
            "csr:_1z_0_od"
          ],
          "tieredResources": {
            "r": "(1 items)",
            "rdfds": "(0 items)",
            "rds": "(0 items)"
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
        "id": "1114883744850595",
        "instream_extra_config": {
          "instream_halo_delay_time_seconds": 15000
        },
        "instream_video_ad_breaks_comet": {
          "mid_rolls": [
            "(3 fields)",
            "(3 fields)"
          ],
          "pre_roll": null,
          "__module_operation_InstreamVideoAdBreaksPlayer_video_instream_video_ad_breaks_comet": {
            "__dr": "InstreamVideoAdBreaksPlayerImpl_adBreaks$normalization.graphql"
          },
          "__module_component_InstreamVideoAdBreaksPlayer_video_instream_video_ad_breaks_comet": {
            "__dr": "InstreamVideoAdBreaksPlayerDeferred.react"
          }
        }
      },
      "extensions": {
        "all_video_dash_prefetch_representations": [
          {
            "initial_representation_ids": "(0 items)",
            "representations": "(7 items)",
            "video_id": "1114883744850595",
            "nextgendash": true
          }
        ],
        "is_final": true,
        "sr_payload": {
          "ddd": {
            "hsrp": "(1 fields)",
            "jsmods": "(1 fields)",
            "allResources": "(1 items)",
            "tieredResources": "(3 fields)"
          }
        }
      }
    }
  ]
}
```

<!-- facts:end -->

## What it does

Loads the sponsored listings in a Marketplace listing page's right column (`viewer.marketplace_feed_stories`, `adsRelatedTo` the listing open). It fired 3 times in 2 runs, 0.8-2.0 s into the step that opened a listing, with the listing's own requests.

## What our machine does with it

Nothing in our machines reads it; it comes with every listing `openListings` opens.

## What can go wrong

None seen: all three answered 200, the slowest of a listing's requests at 1762-2056 ms. Nothing waits on it.
