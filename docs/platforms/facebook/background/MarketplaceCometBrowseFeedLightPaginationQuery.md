# MarketplaceCometBrowseFeedLightPaginationQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27655263074150438` |
| Path | `/api/graphql/` |
| Sends | `buyLocation`, `count`, `cursor`, `imageWidth`, `includePDPRelevantListings`, `mediaType`, `pdpListingId`, `radius`, `refinement`, `scale`, `sizing`, `useSDFPath`, `__relay_internal__pv__MarketplacePDPShouldShowLowerPriceItemsrelayprovider`, `__relay_internal__pv__CometMarketplaceShouldShowTopPicksStrikethroughrelayprovider`, `__relay_internal__pv__GHLShouldChangeMarketplaceSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__MarketplaceCometAdmodulerelayprovider`, `__relay_internal__pv__CometMarketplaceShouldShowFeedShippingIconrelayprovider` |
| Reads | `...MarketplaceCometBrowseFeedLight_dataConnection` |
| Called from | `MarketplaceCometBrowseFeedLight_dataConnection.graphql` |
| rea | `ev_0b2cc9b99182cd7370ff9ff11c8ca2ec224c407d5dd02c15b1aa55916f4eead6` |

Seen 4 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | scroll: +476px in 12 wheel steps, 562 ms | 1 | 200 | 2448 ms | 2885 ms | — |
| warmup | scroll: +301px in 7 wheel steps, 282 ms | 1 | 200 | 4779 ms | 3624 ms | — |
| warmup | scroll: +408px in 11 wheel steps, 547 ms | 1 | 200 | 2702 ms | 3572 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 2545 ms | 484794 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T155857_61594063207669**, step 3: goto /marketplace/inbox: 200, 2545 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceCometBrowseFeedLightPaginationQuery",
  "server_timestamps": "true",
  "variables": {
    "buyLocation": {
      "latitude": 40.6262,
      "longitude": -75.3757
    },
    "count": 5,
    "cursor": "{\"basic\":{\"item_index\":1,\"feed_slice_number\":1,\"ss_version\":4294967296},\"ads\":{\"items_since_last_ad\":0,\"items_retrieved\":2,\"ad_index\":1,\"ad_slot\":1,\"dynamic_gap_rule\":0,\"counted_organic_items\":0,\"average_organic_score\":0,\"is_dynamic_gap_rule_set\":false,\"first_organic_score\":0,\"is_dynamic_initial_gap_set\":false,\"iterated_organic_items\":1,\"top_organic_score\":0,\"feed_slice_number\":0,\"feed_retrieved_i… (1705 chars)",
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
  "doc_id": "27655263074150438"
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
          "uri": "https://scontent-lga3-1.xx.fbcdn.net/v/t39.84726-6/859257332_1649964720051705_3868421864767430637_n.jpg?stp=c0.32.261.261a_dst-jpg_p261x260_tt6&_nc_cat=110&ccb=1-7&_nc_sid=92e707&_nc_ohc=JNqnw8g-6HAQ7kNvwG5ZDev&_nc_oc=AdpLim7p9FCACuAVGnHyLIjPS8B0AmTx3VWRp_7yN2U5XqY5OdaoEkp00MeZGIwn-Ao&_nc_zt=14&_nc_ht=scontent-lga3-1.xx&_nc_gid=HqSwTEDl9gDaPIW4-z1quw&_nc_ss=792a8&oh=00_AQPdLxrU-x3opdYeXEOdGxdhBPNB… (430 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1792685342544,
        "time_at_flush_ms": 1792685344318
      },
      "is_final": false
    }
  },
  "followingParts": 21,
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
          "id": "8cac5127-4370-491e-ba99-0d65128b4def",
          "__typename": "MarketplaceFeedGeneralListingObject",
          "story_key": "13873371860956202",
          "story_type": "GENERAL_LISTING",
          "tracking": "{\"qid\":\"-5934809851331956708\",\"mf_story_key\":\"13873371860956202\",\"top_level_post_id\":\"13873371860956202\",\"commerce_rank_obj\":\"{\\\"target_id\\\":13873371860956202,\\\"target_type\\\":6,\\\"primary_position\\\":1,\\\"ranking_signature\\\":0,\\\"ranking_region\\\":null,\\\"ranking_request_id\\\":null,\\\"commerce_channel\\\":1000,\\\"value\\\":0,\\\"upsell_type\\\":127,\\\"candidate_retrieval_source_map\\\":{\\\"29731488016453007\\\":3001,\\\"2… (720 chars)",
          "__isMarketplaceFeedGeneralListingData": "MarketplaceFeedGeneralListingObject",
          "entity_id": "4474993902813945",
          "data": "(4 fields)",
          "listing": "(4 fields)",
          "tile_video": "(1 fields)",
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
          "id": "a1b7ecd0-254f-4af1-8d03-611e24aa33fd",
          "__typename": "MarketplaceFeedGeneralListingObject",
          "story_key": "13873371860956202",
          "story_type": "GENERAL_LISTING",
          "tracking": "{\"qid\":\"-5934809851331956708\",\"mf_story_key\":\"13873371860956202\",\"top_level_post_id\":\"13873371860956202\",\"commerce_rank_obj\":\"{\\\"target_id\\\":13873371860956202,\\\"target_type\\\":6,\\\"primary_position\\\":1,\\\"ranking_signature\\\":0,\\\"ranking_region\\\":null,\\\"ranking_request_id\\\":null,\\\"commerce_channel\\\":1000,\\\"value\\\":0,\\\"upsell_type\\\":127,\\\"candidate_retrieval_source_map\\\":{\\\"29731488016453007\\\":3001,\\\"2… (720 chars)",
          "__isMarketplaceFeedGeneralListingData": "MarketplaceFeedGeneralListingObject",
          "entity_id": "2149356398951521",
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
          "id": "fda7596a-31ab-48f9-afe8-4bd1541adb2d",
          "__typename": "MarketplaceFeedGeneralListingObject",
          "story_key": "13873371860956202",
          "story_type": "GENERAL_LISTING",
          "tracking": "{\"qid\":\"-5934809851331956708\",\"mf_story_key\":\"13873371860956202\",\"top_level_post_id\":\"13873371860956202\",\"commerce_rank_obj\":\"{\\\"target_id\\\":13873371860956202,\\\"target_type\\\":6,\\\"primary_position\\\":1,\\\"ranking_signature\\\":0,\\\"ranking_region\\\":null,\\\"ranking_request_id\\\":null,\\\"commerce_channel\\\":1000,\\\"value\\\":0,\\\"upsell_type\\\":127,\\\"candidate_retrieval_source_map\\\":{\\\"29731488016453007\\\":3001,\\\"2… (720 chars)",
          "__isMarketplaceFeedGeneralListingData": "MarketplaceFeedGeneralListingObject",
          "entity_id": "1404455421395231",
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

<!-- facts:end -->

## What it does

Loads the next page of Marketplace's browse feed (the listings grid) when the view nears the bottom.

## What our machine does with it

Nothing. It fired when the idle mouse's loops reached the lower part of the Marketplace page and the feed loaded more. A person scrolling causes the same.

## What can go wrong

Harmless, but a sign the page is still live and reacting to the cursor. Its listings are where the account's Marketplace location shows (Bethlehem's feed was Lima, Peru).
