# MarketplaceCometBrowseFeedLightContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29127585736873863` |
| Path | `/api/graphql/` |
| Sends | `buyLocation`, `count`, `cursor`, `imageWidth`, `includePDPRelevantListings`, `mediaType`, `pdpListingId`, `radius`, `scale`, `sizing`, `useSDFPath`, `__relay_internal__pv__MarketplacePDPShouldShowLowerPriceItemsrelayprovider`, `__relay_internal__pv__CometMarketplaceShouldShowTopPicksStrikethroughrelayprovider`, `__relay_internal__pv__GHLShouldChangeMarketplaceSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__MarketplaceCometAdmodulerelayprovider`, `__relay_internal__pv__CometMarketplaceShouldShowFeedShippingIconrelayprovider` |
| Reads | `...MarketplaceCometBrowseFeedLight_dataConnection` |
| Called from | `MarketplaceCometBrowseFeedLightContainer.react` |
| rea | `ev_9d17b548b204b307cb95ad803f4b967c825e9448023378fbadbf2a51583bab63` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 15: click e1354 | 1 | 200 | 4374 ms | 2366 ms | — |
| inspect | step 4: click e191 | 1 | 200 | 4827 ms | 2965 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 4341 ms | 479387 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T155857_<userId:1>**, step 3: goto /marketplace/inbox: 200, 4341 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceCometBrowseFeedLightContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "buyLocation": {
      "latitude": "<coordinate>",
      "longitude": "<coordinate>"
    },
    "count": 1,
    "cursor": null,
    "imageWidth": 256,
    "mediaType": "image/jpeg",
    "radius": 65000,
    "scale": 1,
    "sizing": "cover-fill-cropped",
    "useSDFPath": true,
    "__relay_internal__pv__MarketplacePDPShouldShowLowerPriceItemsrelayprovider": false,
    "__relay_internal__pv__CometMarketplaceShouldShowTopPicksStrikethroughrelayprovider": false,
    "__relay_internal__pv__GHLShouldChangeMarketplaceSponsoredDataFieldNamerelayprovider": true,
    "__relay_internal__pv__MarketplaceCometAdmodulerelayprovider": true,
    "__relay_internal__pv__CometMarketplaceShouldShowFeedShippingIconrelayprovider": false
  },
  "doc_id": "29127585736873863"
}
```

Answered:

```json
{
  "first": {
    "data": {
      "marketplace_home_feed": {
        "edges": [
          "(2 fields)"
        ]
      }
    },
    "extensions": {
      "prefetch_uris_v2": [
        {
          "uri": "<mediaUrl> (449 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "<mediaUrl> (453 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "<mediaUrl> (429 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "<mediaUrl> (429 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "<mediaUrl> (454 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "<mediaUrl> (429 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        "… 14 more"
      ],
      "server_metadata": {
        "request_start_time_ms": 1792685337152,
        "time_at_flush_ms": 1792685338181
      },
      "is_final": false
    }
  },
  "followingParts": 3,
  "parts": [
    {
      "label": "MarketplaceCometBrowseFeedLight_dataConnection$stream$MarketplaceBrowseFeedLight_marketplace_home_feed",
      "path": [
        "marketplace_home_feed",
        "edges",
        1
      ],
      "data": {
        "node": {
          "id": "<id:1>:IN_MEMORY_MARKETPLACE_FEED_STORY_ENT:EntMarketplaceFeedAdStory:826419681",
          "__typename": "MarketplaceFeedAdStory",
          "story_key": "<id:2>",
          "story_type": "AD",
          "tracking": "{\"qid\":\"-5934810194876610109\",\"mf_story_key\":\"<id:2>\",\"commerce_rank_obj\":\"{\\\"target_id\\\":<id:1>,\\\"target_type\\\":4,\\\"primary_position\\\":0,\\\"ranking_signature\\\":0,\\\"commerce_channel\\\":501,\\\"value\\\":142.73214264999,\\\"is_prefetch\\\":false}\"}",
          "story_attachment_style": "large_single_video_tile",
          "story": "(12 fields)",
          "ad_impression_client_token": "(taken out)",
          "ad_id_string": "<id:1>",
          "is_hidden": false,
          "is_demo": false,
          "transparency_ad_info": "(1 fields)",
          "product_item": null
        },
        "cursor": "\""
      },
      "extensions": {
        "all_video_dash_prefetch_representations": [
          "(4 fields)"
        ],
        "is_final": false,
        "sr_payload": {
          "ddd": "(4 fields)"
        }
      }
    },
    {
      "label": "MarketplaceCometBrowseFeedLight_dataConnection$defer$MarketplaceBrowseFeedLight_marketplace_home_feed$page_info",
      "path": [
        "marketplace_home_feed"
      ],
      "data": {
        "page_info": {
          "end_cursor": "{\"basic\":{\"item_index\":1,\"feed_slice_number\":1,\"ss_version\":4294967296},\"ads\":{\"items_since_last_ad\":0,\"items_retrieved\":2,\"ad_index\":1,\"ad_slot\":1,\"dynamic_gap_rule\":0,\"counted_organic_items\":0,\"average_organic_score\":0,\"is_dynamic_gap_rule_set\":false,\"first_organic_score\":0,\"is_dynamic_initial_gap_set\":false,\"iterated_organic_items\":1,\"top_organic_score\":0,\"feed_slice_number\":0,\"feed_retrieved_i… (1705 chars)",
          "has_next_page": true
        }
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "… 14 more"
        ],
        "all_video_dash_prefetch_representations": [
          "(4 fields)"
        ],
        "is_final": false
      }
    },
    {
      "label": "VideoPlayerRelay_video$defer$InstreamVideoAdBreaksPlayer_video",
      "path": [
        "marketplace_home_feed",
        "edges",
        1,
        "node",
        "story",
        "attachments",
        "… 2 more"
      ],
      "data": {
        "id": "<id:3>",
        "instream_extra_config": {
          "instream_halo_delay_time_seconds": 22
        },
        "instream_video_ad_breaks_comet": null
      },
      "extensions": {
        "all_video_dash_prefetch_representations": [
          "(4 fields)"
        ],
        "is_final": true
      }
    }
  ]
}
```

**runs/inspect/20261022T110738_<userId:1>**, step 4: click e191: 200, 4827 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceCometBrowseFeedLightContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "buyLocation": {
      "latitude": "<coordinate>",
      "longitude": "<coordinate>"
    },
    "count": 1,
    "cursor": null,
    "imageWidth": 256,
    "mediaType": "image/jpeg",
    "radius": 65000,
    "scale": 1,
    "sizing": "cover-fill-cropped",
    "useSDFPath": true,
    "__relay_internal__pv__MarketplacePDPShouldShowLowerPriceItemsrelayprovider": false,
    "__relay_internal__pv__CometMarketplaceShouldShowTopPicksStrikethroughrelayprovider": false,
    "__relay_internal__pv__GHLShouldChangeMarketplaceSponsoredDataFieldNamerelayprovider": true,
    "__relay_internal__pv__MarketplaceCometAdmodulerelayprovider": true,
    "__relay_internal__pv__CometMarketplaceShouldShowFeedShippingIconrelayprovider": false
  },
  "doc_id": "29127585736873863"
}
```

Answered:

```json
{
  "first": {
    "data": {
      "marketplace_home_feed": {
        "edges": [
          "(2 fields)"
        ]
      }
    },
    "extensions": {
      "prefetch_uris_v2": [
        {
          "uri": "<mediaUrl> (453 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "<mediaUrl> (449 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "<mediaUrl> (454 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "<mediaUrl> (448 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "<mediaUrl> (448 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "<mediaUrl> (448 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        "… 14 more"
      ],
      "server_metadata": {
        "request_start_time_ms": 1792667424529,
        "time_at_flush_ms": 1792667426185
      },
      "is_final": false
    }
  },
  "followingParts": 3,
  "parts": [
    {
      "label": "MarketplaceCometBrowseFeedLight_dataConnection$stream$MarketplaceBrowseFeedLight_marketplace_home_feed",
      "path": [
        "marketplace_home_feed",
        "edges",
        1
      ],
      "data": {
        "node": {
          "id": "<id:1>:IN_MEMORY_MARKETPLACE_FEED_STORY_ENT:EntMarketplaceFeedAdStory:11853141",
          "__typename": "MarketplaceFeedAdStory",
          "story_key": "<id:4>",
          "story_type": "AD",
          "tracking": "{\"qid\":\"-5936041173641534037\",\"mf_story_key\":\"<id:4>\",\"commerce_rank_obj\":\"{\\\"target_id\\\":<id:1>,\\\"target_type\\\":4,\\\"primary_position\\\":0,\\\"ranking_signature\\\":0,\\\"commerce_channel\\\":501,\\\"value\\\":83.293845104781,\\\"is_prefetch\\\":false}\"}",
          "story_attachment_style": "large_single_video_tile",
          "story": "(12 fields)",
          "ad_impression_client_token": "(taken out)",
          "ad_id_string": "<id:1>",
          "is_hidden": false,
          "is_demo": false,
          "transparency_ad_info": "(1 fields)",
          "product_item": null
        },
        "cursor": "\""
      },
      "extensions": {
        "all_video_dash_prefetch_representations": [
          "(4 fields)"
        ],
        "is_final": false,
        "sr_payload": {
          "ddd": "(4 fields)"
        }
      }
    },
    {
      "label": "MarketplaceCometBrowseFeedLight_dataConnection$defer$MarketplaceBrowseFeedLight_marketplace_home_feed$page_info",
      "path": [
        "marketplace_home_feed"
      ],
      "data": {
        "page_info": {
          "end_cursor": "{\"basic\":{\"item_index\":1,\"feed_slice_number\":1,\"ss_version\":4294967296},\"ads\":{\"items_since_last_ad\":0,\"items_retrieved\":2,\"ad_index\":1,\"ad_slot\":1,\"dynamic_gap_rule\":0,\"counted_organic_items\":0,\"average_organic_score\":0,\"is_dynamic_gap_rule_set\":false,\"first_organic_score\":0,\"is_dynamic_initial_gap_set\":false,\"iterated_organic_items\":1,\"top_organic_score\":0,\"feed_slice_number\":0,\"feed_retrieved_i… (1705 chars)",
          "has_next_page": true
        }
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "(5 fields)",
          "… 14 more"
        ],
        "all_video_dash_prefetch_representations": [
          "(4 fields)"
        ],
        "is_final": false
      }
    },
    {
      "label": "VideoPlayerRelay_video$defer$InstreamVideoAdBreaksPlayer_video",
      "path": [
        "marketplace_home_feed",
        "edges",
        1,
        "node",
        "story",
        "attachments",
        "… 2 more"
      ],
      "data": {
        "id": "<id:3>",
        "instream_extra_config": {
          "instream_halo_delay_time_seconds": 22
        },
        "instream_video_ad_breaks_comet": null
      },
      "extensions": {
        "all_video_dash_prefetch_representations": [
          "(4 fields)"
        ],
        "is_final": true
      }
    }
  ]
}
```

<!-- facts:end -->

## What it does

Loads the Marketplace browse feed (the listings grid) for the current location.

## What our machine does with it

Nothing; it fires on every Marketplace page load and after a location change. Its listings show where the account's Marketplace location is (Pittsburgh's were Harare, Zimbabwe).

## What can go wrong

Harmless.
