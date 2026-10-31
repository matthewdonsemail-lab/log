# MarketplaceCometBrowseFeedLightPaginationQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28980683528217734` |
| Path | `/api/graphql/` |
| Sends | `buyLocation`, `count`, `cursor`, `imageWidth`, `includePDPRelevantListings`, `mediaType`, `pdpListingId`, `radius`, `refinement`, `scale`, `sizing`, `useSDFPath`, `__relay_internal__pv__MarketplacePDPShouldShowLowerPriceItemsrelayprovider`, `__relay_internal__pv__CometMarketplaceShouldShowTopPicksStrikethroughrelayprovider`, `__relay_internal__pv__GHLShouldChangeMarketplaceSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__MarketplaceCometAdmodulerelayprovider`, `__relay_internal__pv__CometMarketplaceShouldShowFeedShippingIconrelayprovider` |
| Reads | `...MarketplaceCometBrowseFeedLight_dataConnection` |
| Called from | `MarketplaceCometBrowseFeedLight_dataConnection.graphql` |
| rea | `ev_b53e00f78191e77f3b562b17718f5e1adb4c8f231f171e2bcadd5d97b863d6b1` |

Seen 8 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | scroll: +476px in 12 wheel steps, 562 ms | 1 | 200 | 2448 ms | 2885 ms | — |
| warmup | scroll: +301px in 7 wheel steps, 282 ms | 1 | 200 | 4779 ms | 3624 ms | — |
| warmup | scroll: +408px in 11 wheel steps, 547 ms | 1 | 200 | 2702 ms | 3572 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 2545 ms | 484794 ms | — |
| warmup | openAny: read /marketplace/item/<id>/ | 1 | 200 | 2513 ms | 135 ms | — |
| host | step 24: scroll 3-5 x 400-700px | 1 | 200 | 1734 ms | 225 ms | — |
| host | scroll: +511px in 12 wheel steps, 465 ms | 1 | 200 | 2254 ms | 2221 ms | — |
| host | scroll: +517px in 13 wheel steps, 761 ms | 1 | 200 | 1840 ms | 2048 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, step 24: scroll 3-5 x 400-700px: 200, 1734 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceCometBrowseFeedLightPaginationQuery",
  "server_timestamps": "true",
  "variables": {
    "buyLocation": {
      "latitude": 50.6759,
      "longitude": -120.33898
    },
    "count": 5,
    "cursor": "{\"basic\":{\"item_index\":1,\"feed_slice_number\":1,\"ss_version\":4294967298},\"ads\":{\"items_since_last_ad\":0,\"items_retrieved\":2,\"ad_index\":1,\"ad_slot\":1,\"dynamic_gap_rule\":0,\"counted_organic_items\":0,\"average_organic_score\":0,\"is_dynamic_gap_rule_set\":false,\"first_organic_score\":0,\"is_dynamic_initial_gap_set\":false,\"iterated_organic_items\":1,\"top_organic_score\":0,\"feed_slice_number\":0,\"feed_retrieved_i… (1715 chars)",
    "imageWidth": 256,
    "includePDPRelevantListings": false,
    "mediaType": "image/jpeg",
    "pdpListingId": "",
    "radius": 65000,
    "refinement": null,
    "scale": 1,
    "sizing": "cover-fill-cropped",
    "useSDFPath": true,
    "__relay_internal__pv__MarketplacePDPShouldShowLowerPriceItemsrelayprovider": false,
    "__relay_internal__pv__CometMarketplaceShouldShowTopPicksStrikethroughrelayprovider": false,
    "__relay_internal__pv__GHLShouldChangeMarketplaceSponsoredDataFieldNamerelayprovider": true,
    "__relay_internal__pv__MarketplaceCometAdmodulerelayprovider": true,
    "__relay_internal__pv__CometMarketplaceShouldShowFeedShippingIconrelayprovider": false
  },
  "doc_id": "28980683528217734"
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
          "uri": "https://scontent.fyvr3-1.fna.fbcdn.net/v/t39.84726-6/859392018_962932573103703_1200915558473180130_n.jpg (459 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1793038211952,
        "time_at_flush_ms": 1793038213398
      },
      "is_final": false
    }
  },
  "followingParts": 17,
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
          "id": "6d3f8395-86e0-498a-9128-8a1c660ae2bd",
          "__typename": "MarketplaceFeedGeneralListingObject",
          "story_key": "2186473426569639048",
          "story_type": "GENERAL_LISTING",
          "tracking": "{\"qid\":\"-5910560887176171870\",\"mf_story_key\":\"2186473426569639048\",\"top_level_post_id\":\"2186473426569639048\",\"commerce_rank_obj\":\"{\\\"target_id\\\":2186473426569639048,\\\"target_type\\\":6,\\\"primary_position\\\":1,\\\"ranking_signature\\\":6651350480402212947,\\\"ranking_region\\\":\\\"prn\\\",\\\"ranking_request_id\\\":9202150970575630851,\\\"commerce_channel\\\":501,\\\"value\\\":0.002012581564486,\\\"upsell_type\\\":129,\\\"candida… (779 chars)",
          "__isMarketplaceFeedGeneralListingData": "MarketplaceFeedGeneralListingObject",
          "entity_id": "1669379474624250",
          "data": "(4 fields)",
          "listing": "(4 fields)",
          "tile_video": null,
          "is_partner_listing": false,
          "strikethrough_price": null,
          "photo": "(3 fields)",
          "badge_bottom_left": null,
          "entity": "(6 fields)"
        },
        "cursor": "\""
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)"
        ],
        "is_final": false
      }
    },
    {
      "label": "MarketplaceCometBrowseFeedLight_dataConnection$stream$MarketplaceBrowseFeedLight_marketplace_home_feed",
      "path": [
        "marketplace_home_feed",
        "edges",
        2
      ],
      "data": {
        "node": {
          "id": "f3751482-c379-41c2-a950-ff0926a48cdf",
          "__typename": "MarketplaceFeedGeneralListingObject",
          "story_key": "2186473426569639048",
          "story_type": "GENERAL_LISTING",
          "tracking": "{\"qid\":\"-5910560887176171870\",\"mf_story_key\":\"2186473426569639048\",\"top_level_post_id\":\"2186473426569639048\",\"commerce_rank_obj\":\"{\\\"target_id\\\":2186473426569639048,\\\"target_type\\\":6,\\\"primary_position\\\":1,\\\"ranking_signature\\\":6651350480402212947,\\\"ranking_region\\\":\\\"prn\\\",\\\"ranking_request_id\\\":9202150970575630851,\\\"commerce_channel\\\":501,\\\"value\\\":0.002012581564486,\\\"upsell_type\\\":129,\\\"candida… (779 chars)",
          "__isMarketplaceFeedGeneralListingData": "MarketplaceFeedGeneralListingObject",
          "entity_id": "1090606617016519",
          "data": "(4 fields)",
          "listing": "(4 fields)",
          "tile_video": null,
          "is_partner_listing": false,
          "strikethrough_price": null,
          "photo": "(3 fields)",
          "badge_bottom_left": null,
          "entity": "(6 fields)"
        },
        "cursor": "\""
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)"
        ],
        "is_final": false
      }
    },
    {
      "label": "MarketplaceCometBrowseFeedLight_dataConnection$stream$MarketplaceBrowseFeedLight_marketplace_home_feed",
      "path": [
        "marketplace_home_feed",
        "edges",
        3
      ],
      "data": {
        "node": {
          "id": "43f397d7-d71d-4e3a-b61c-3008558dcf50",
          "__typename": "MarketplaceFeedGeneralListingObject",
          "story_key": "2186473426569639048",
          "story_type": "GENERAL_LISTING",
          "tracking": "{\"qid\":\"-5910560887176171870\",\"mf_story_key\":\"2186473426569639048\",\"top_level_post_id\":\"2186473426569639048\",\"commerce_rank_obj\":\"{\\\"target_id\\\":2186473426569639048,\\\"target_type\\\":6,\\\"primary_position\\\":1,\\\"ranking_signature\\\":6651350480402212947,\\\"ranking_region\\\":\\\"prn\\\",\\\"ranking_request_id\\\":9202150970575630851,\\\"commerce_channel\\\":501,\\\"value\\\":0.002012581564486,\\\"upsell_type\\\":129,\\\"candida… (779 chars)",
          "__isMarketplaceFeedGeneralListingData": "MarketplaceFeedGeneralListingObject",
          "entity_id": "1121904473548449",
          "data": "(4 fields)",
          "listing": "(4 fields)",
          "tile_video": null,
          "is_partner_listing": false,
          "strikethrough_price": null,
          "photo": "(3 fields)",
          "badge_bottom_left": null,
          "entity": "(6 fields)"
        },
        "cursor": "\""
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)"
        ],
        "is_final": false
      }
    }
  ]
}
```

**runs/host/20261026T180628_61594285317994**, scroll: +511px in 12 wheel steps, 465 ms: 200, 2254 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceCometBrowseFeedLightPaginationQuery",
  "server_timestamps": "true",
  "variables": {
    "buyLocation": {
      "latitude": 50.6759,
      "longitude": -120.33898
    },
    "count": 5,
    "cursor": "{\"basic\":{\"item_index\":1,\"feed_slice_number\":1,\"ss_version\":4294967302},\"ads\":{\"items_since_last_ad\":0,\"items_retrieved\":2,\"ad_index\":1,\"ad_slot\":1,\"dynamic_gap_rule\":0,\"counted_organic_items\":0,\"average_organic_score\":0,\"is_dynamic_gap_rule_set\":false,\"first_organic_score\":0,\"is_dynamic_initial_gap_set\":false,\"iterated_organic_items\":1,\"top_organic_score\":0,\"feed_slice_number\":0,\"feed_retrieved_i… (1711 chars)",
    "imageWidth": 256,
    "includePDPRelevantListings": false,
    "mediaType": "image/jpeg",
    "pdpListingId": "",
    "radius": 65000,
    "refinement": null,
    "scale": 1,
    "sizing": "cover-fill-cropped",
    "useSDFPath": true,
    "__relay_internal__pv__MarketplacePDPShouldShowLowerPriceItemsrelayprovider": false,
    "__relay_internal__pv__CometMarketplaceShouldShowTopPicksStrikethroughrelayprovider": false,
    "__relay_internal__pv__GHLShouldChangeMarketplaceSponsoredDataFieldNamerelayprovider": true,
    "__relay_internal__pv__MarketplaceCometAdmodulerelayprovider": true,
    "__relay_internal__pv__CometMarketplaceShouldShowFeedShippingIconrelayprovider": false
  },
  "doc_id": "28980683528217734"
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
          "uri": "https://scontent.fyvr3-1.fna.fbcdn.net/v/t39.84726-6/866718233_1857489581917838_4188528458858796706_n.jpg (460 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1793038342002,
        "time_at_flush_ms": 1793038343869
      },
      "is_final": false
    }
  },
  "followingParts": 18,
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
          "id": "b74b0f64-6b96-471f-b421-b5c5eefe8d5d",
          "__typename": "MarketplaceFeedGeneralListingObject",
          "story_key": "2999193310807558784",
          "story_type": "GENERAL_LISTING",
          "tracking": "{\"qid\":\"-5910551884815583289\",\"mf_story_key\":\"2999193310807558784\",\"top_level_post_id\":\"2999193310807558784\",\"commerce_rank_obj\":\"{\\\"target_id\\\":2999193310807558784,\\\"target_type\\\":6,\\\"primary_position\\\":1,\\\"ranking_signature\\\":6651350480402212947,\\\"ranking_region\\\":\\\"prn\\\",\\\"ranking_request_id\\\":6219487028433266974,\\\"commerce_channel\\\":501,\\\"value\\\":0.001799935552602,\\\"upsell_type\\\":129,\\\"candida… (780 chars)",
          "__isMarketplaceFeedGeneralListingData": "MarketplaceFeedGeneralListingObject",
          "entity_id": "1797820328092675",
          "data": "(4 fields)",
          "listing": "(4 fields)",
          "tile_video": null,
          "is_partner_listing": false,
          "strikethrough_price": null,
          "photo": "(3 fields)",
          "badge_bottom_left": null,
          "entity": "(6 fields)"
        },
        "cursor": "\""
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)"
        ],
        "is_final": false
      }
    },
    {
      "label": "MarketplaceCometBrowseFeedLight_dataConnection$stream$MarketplaceBrowseFeedLight_marketplace_home_feed",
      "path": [
        "marketplace_home_feed",
        "edges",
        2
      ],
      "data": {
        "node": {
          "id": "a2fad1b3-bbf9-4379-92be-616b3af44d79",
          "__typename": "MarketplaceFeedGeneralListingObject",
          "story_key": "2999193310807558784",
          "story_type": "GENERAL_LISTING",
          "tracking": "{\"qid\":\"-5910551884815583289\",\"mf_story_key\":\"2999193310807558784\",\"top_level_post_id\":\"2999193310807558784\",\"commerce_rank_obj\":\"{\\\"target_id\\\":2999193310807558784,\\\"target_type\\\":6,\\\"primary_position\\\":1,\\\"ranking_signature\\\":6651350480402212947,\\\"ranking_region\\\":\\\"prn\\\",\\\"ranking_request_id\\\":6219487028433266974,\\\"commerce_channel\\\":501,\\\"value\\\":0.001799935552602,\\\"upsell_type\\\":129,\\\"candida… (780 chars)",
          "__isMarketplaceFeedGeneralListingData": "MarketplaceFeedGeneralListingObject",
          "entity_id": "911933708663857",
          "data": "(4 fields)",
          "listing": "(4 fields)",
          "tile_video": null,
          "is_partner_listing": false,
          "strikethrough_price": "(1 fields)",
          "photo": "(3 fields)",
          "badge_bottom_left": null,
          "entity": "(6 fields)"
        },
        "cursor": "\""
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)"
        ],
        "is_final": false
      }
    },
    {
      "label": "MarketplaceCometBrowseFeedLight_dataConnection$stream$MarketplaceBrowseFeedLight_marketplace_home_feed",
      "path": [
        "marketplace_home_feed",
        "edges",
        3
      ],
      "data": {
        "node": {
          "id": "120251269041260546:IN_MEMORY_MARKETPLACE_FEED_STORY_ENT:EntMarketplaceFeedAdStory:2129662951",
          "__typename": "MarketplaceFeedAdStory",
          "story_key": "7983408597372515677",
          "story_type": "AD",
          "tracking": "{\"qid\":\"-5910551884815583289\",\"mf_story_key\":\"7983408597372515677\",\"commerce_rank_obj\":\"{\\\"target_id\\\":120251269041260546,\\\"target_type\\\":4,\\\"primary_position\\\":0,\\\"ranking_signature\\\":0,\\\"commerce_channel\\\":501,\\\"value\\\":343.65136265755,\\\"is_prefetch\\\":false}\"}",
          "story_attachment_style": "large_single_video_tile",
          "story": "(12 fields)",
          "ad_impression_client_token": "(taken out)",
          "ad_id_string": "120251269041260546",
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
    }
  ]
}
```

**runs/host/20261026T180628_61594285317994**, scroll: +517px in 13 wheel steps, 761 ms: 200, 1840 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceCometBrowseFeedLightPaginationQuery",
  "server_timestamps": "true",
  "variables": {
    "buyLocation": {
      "latitude": 50.6759,
      "longitude": -120.33898
    },
    "count": 5,
    "cursor": "{\"basic\":{\"item_index\":1,\"feed_slice_number\":1,\"ss_version\":4294967304},\"ads\":{\"items_since_last_ad\":0,\"items_retrieved\":2,\"ad_index\":1,\"ad_slot\":1,\"dynamic_gap_rule\":0,\"counted_organic_items\":0,\"average_organic_score\":0,\"is_dynamic_gap_rule_set\":false,\"first_organic_score\":0,\"is_dynamic_initial_gap_set\":false,\"iterated_organic_items\":1,\"top_organic_score\":0,\"feed_slice_number\":0,\"feed_retrieved_i… (1706 chars)",
    "imageWidth": 256,
    "includePDPRelevantListings": false,
    "mediaType": "image/jpeg",
    "pdpListingId": "",
    "radius": 65000,
    "refinement": null,
    "scale": 1,
    "sizing": "cover-fill-cropped",
    "useSDFPath": true,
    "__relay_internal__pv__MarketplacePDPShouldShowLowerPriceItemsrelayprovider": false,
    "__relay_internal__pv__CometMarketplaceShouldShowTopPicksStrikethroughrelayprovider": false,
    "__relay_internal__pv__GHLShouldChangeMarketplaceSponsoredDataFieldNamerelayprovider": true,
    "__relay_internal__pv__MarketplaceCometAdmodulerelayprovider": true,
    "__relay_internal__pv__CometMarketplaceShouldShowFeedShippingIconrelayprovider": false
  },
  "doc_id": "28980683528217734"
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
          "uri": "https://scontent.fyvr3-1.fna.fbcdn.net/v/t39.84726-6/866718233_1857489581917838_4188528458858796706_n.jpg (460 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1793038398765,
        "time_at_flush_ms": 1793038400248
      },
      "is_final": false
    }
  },
  "followingParts": 15,
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
          "id": "6d3bd914-e4a9-4aec-b706-751fe2a895b2",
          "__typename": "MarketplaceFeedGeneralListingObject",
          "story_key": "2999193310807558784",
          "story_type": "GENERAL_LISTING",
          "tracking": "{\"qid\":\"-5910548036553106436\",\"mf_story_key\":\"2999193310807558784\",\"top_level_post_id\":\"2999193310807558784\",\"commerce_rank_obj\":\"{\\\"target_id\\\":2999193310807558784,\\\"target_type\\\":6,\\\"primary_position\\\":1,\\\"ranking_signature\\\":6651350480402212947,\\\"ranking_region\\\":\\\"prn\\\",\\\"ranking_request_id\\\":6101712833838457909,\\\"commerce_channel\\\":501,\\\"value\\\":0.001799935552602,\\\"upsell_type\\\":129,\\\"candida… (780 chars)",
          "__isMarketplaceFeedGeneralListingData": "MarketplaceFeedGeneralListingObject",
          "entity_id": "1797820328092675",
          "data": "(4 fields)",
          "listing": "(4 fields)",
          "tile_video": null,
          "is_partner_listing": false,
          "strikethrough_price": null,
          "photo": "(3 fields)",
          "badge_bottom_left": null,
          "entity": "(6 fields)"
        },
        "cursor": "\""
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)"
        ],
        "is_final": false
      }
    },
    {
      "label": "MarketplaceCometBrowseFeedLight_dataConnection$stream$MarketplaceBrowseFeedLight_marketplace_home_feed",
      "path": [
        "marketplace_home_feed",
        "edges",
        2
      ],
      "data": {
        "node": {
          "id": "3769193b-70a0-4134-bb5b-19eb648cb7a6",
          "__typename": "MarketplaceFeedGeneralListingObject",
          "story_key": "2999193310807558784",
          "story_type": "GENERAL_LISTING",
          "tracking": "{\"qid\":\"-5910548036553106436\",\"mf_story_key\":\"2999193310807558784\",\"top_level_post_id\":\"2999193310807558784\",\"commerce_rank_obj\":\"{\\\"target_id\\\":2999193310807558784,\\\"target_type\\\":6,\\\"primary_position\\\":1,\\\"ranking_signature\\\":6651350480402212947,\\\"ranking_region\\\":\\\"prn\\\",\\\"ranking_request_id\\\":6101712833838457909,\\\"commerce_channel\\\":501,\\\"value\\\":0.001799935552602,\\\"upsell_type\\\":129,\\\"candida… (780 chars)",
          "__isMarketplaceFeedGeneralListingData": "MarketplaceFeedGeneralListingObject",
          "entity_id": "911933708663857",
          "data": "(4 fields)",
          "listing": "(4 fields)",
          "tile_video": null,
          "is_partner_listing": false,
          "strikethrough_price": "(1 fields)",
          "photo": "(3 fields)",
          "badge_bottom_left": null,
          "entity": "(6 fields)"
        },
        "cursor": "\""
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)"
        ],
        "is_final": false
      }
    },
    {
      "label": "MarketplaceCometBrowseFeedLight_dataConnection$stream$MarketplaceBrowseFeedLight_marketplace_home_feed",
      "path": [
        "marketplace_home_feed",
        "edges",
        3
      ],
      "data": {
        "node": {
          "id": "120251901794070294:IN_MEMORY_MARKETPLACE_FEED_STORY_ENT:EntMarketplaceFeedAdStory:2129662951",
          "__typename": "MarketplaceFeedAdStory",
          "story_key": "5107569398747979115",
          "story_type": "AD",
          "tracking": "{\"qid\":\"-5910548036553106436\",\"mf_story_key\":\"5107569398747979115\",\"commerce_rank_obj\":\"{\\\"target_id\\\":120251901794070294,\\\"target_type\\\":4,\\\"primary_position\\\":0,\\\"ranking_signature\\\":0,\\\"commerce_channel\\\":501,\\\"value\\\":291.52154684067,\\\"is_prefetch\\\":false}\"}",
          "story_attachment_style": "large_carousel_tile",
          "story": "(12 fields)",
          "ad_impression_client_token": "(taken out)",
          "ad_id_string": "120251901794070294",
          "is_hidden": false,
          "is_demo": false,
          "transparency_ad_info": "(1 fields)",
          "product_item": null
        },
        "cursor": "\""
      },
      "extensions": {
        "is_final": false,
        "sr_payload": {
          "ddd": "(4 fields)"
        }
      }
    }
  ]
}
```

<!-- facts:end -->

## What it does

Loads the next page of Marketplace's browse feed (the listings grid) when the view nears the bottom.

## What our machine does with it

Nothing. It fired when the idle mouse's loops reached the lower part of the Marketplace page and the feed loaded more. A person scrolling causes the same.

## What can go wrong

Harmless, but a sign the page is still live and reacting to the cursor. Its listings are where the account's Marketplace location shows (Bethlehem's feed was Lima, Peru).
