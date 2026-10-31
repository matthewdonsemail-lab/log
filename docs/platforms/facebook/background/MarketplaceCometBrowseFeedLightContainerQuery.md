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

**runs/inspect/20261022T155857_61594063207669**, step 3: goto /marketplace/inbox: 200, 4341 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceCometBrowseFeedLightContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "buyLocation": {
      "latitude": 40.6262,
      "longitude": -75.3757
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
          "uri": "https://scontent-lga3-1.xx.fbcdn.net/v/t45.5328-4/792705720_3291896437666761_6608927264699573403_n.jpg (449 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-lga3-2.xx.fbcdn.net/v/t45.5328-4/825331279_1107805111679275_6933076528485965959_n.jpg (453 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-lga3-2.xx.fbcdn.net/v/t45.5328-4/857707952_1153535390363224_1249299151427696707_n.jpg (429 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-lga3-1.xx.fbcdn.net/v/t45.5328-4/825284948_1070647075726010_7259050604123215370_n.jpg (429 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-lga3-3.xx.fbcdn.net/v/t45.5328-4/798589946_28765747766366253_5841133203145583122_n.jpg (454 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-lga3-2.xx.fbcdn.net/v/t45.5328-4/852101236_2204837723468461_3402126919315690121_n.jpg (429 chars)",
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
          "id": "120250502573310687:IN_MEMORY_MARKETPLACE_FEED_STORY_ENT:EntMarketplaceFeedAdStory:826419681",
          "__typename": "MarketplaceFeedAdStory",
          "story_key": "1783131660348493942",
          "story_type": "AD",
          "tracking": "{\"qid\":\"-5934810194876610109\",\"mf_story_key\":\"1783131660348493942\",\"commerce_rank_obj\":\"{\\\"target_id\\\":120250502573310687,\\\"target_type\\\":4,\\\"primary_position\\\":0,\\\"ranking_signature\\\":0,\\\"commerce_channel\\\":501,\\\"value\\\":142.73214264999,\\\"is_prefetch\\\":false}\"}",
          "story_attachment_style": "large_single_video_tile",
          "story": "(12 fields)",
          "ad_impression_client_token": "(taken out)",
          "ad_id_string": "120250502573310687",
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
        "id": "1786431472192000",
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

**runs/inspect/20261022T110738_61594063207669**, step 4: click e191: 200, 4827 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceCometBrowseFeedLightContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "buyLocation": {
      "latitude": 37.193232725035,
      "longitude": -3.6622435304279
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
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/821178588_4563241127337366_7168015474036199596_n.jpg (453 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/856583545_28732861209675642_3535474348993802822_n.jpg (449 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/798589946_28765747766366253_5841133203145583122_n.jpg (454 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/845832759_1428507518727010_7975235107897927002_n.jpg (448 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/855166534_4230998330369910_8961199944737311324_n.jpg (448 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/853286697_1806506914008863_6981065559839165275_n.jpg (448 chars)",
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
          "id": "120250502573310687:IN_MEMORY_MARKETPLACE_FEED_STORY_ENT:EntMarketplaceFeedAdStory:11853141",
          "__typename": "MarketplaceFeedAdStory",
          "story_key": "9008724415471845301",
          "story_type": "AD",
          "tracking": "{\"qid\":\"-5936041173641534037\",\"mf_story_key\":\"9008724415471845301\",\"commerce_rank_obj\":\"{\\\"target_id\\\":120250502573310687,\\\"target_type\\\":4,\\\"primary_position\\\":0,\\\"ranking_signature\\\":0,\\\"commerce_channel\\\":501,\\\"value\\\":83.293845104781,\\\"is_prefetch\\\":false}\"}",
          "story_attachment_style": "large_single_video_tile",
          "story": "(12 fields)",
          "ad_impression_client_token": "(taken out)",
          "ad_id_string": "120250502573310687",
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
        "id": "1786431472192000",
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
