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
| rea | `ev_0b2cc9b99182cd7370ff9ff11c8ca2ec224c407d5dd02c15b1aa55916f4eead6` |

Seen 5 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | scroll: +476px in 12 wheel steps, 562 ms | 1 | 200 | 2448 ms | 2885 ms | — |
| warmup | scroll: +301px in 7 wheel steps, 282 ms | 1 | 200 | 4779 ms | 3624 ms | — |
| warmup | scroll: +408px in 11 wheel steps, 547 ms | 1 | 200 | 2702 ms | 3572 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 2545 ms | 484794 ms | — |
| warmup | openAny: read /marketplace/item/<id>/ | 1 | 200 | 2513 ms | 135 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/warmup/20261023T074930_61594063207669**, openAny: read /marketplace/item/<id>/: 200, 2513 ms

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
    "cursor": "{\"basic\":{\"item_index\":1,\"feed_slice_number\":1,\"ss_version\":17179869185},\"ads\":{\"items_since_last_ad\":0,\"items_retrieved\":2,\"ad_index\":1,\"ad_slot\":1,\"dynamic_gap_rule\":0,\"counted_organic_items\":0,\"average_organic_score\":0,\"is_dynamic_gap_rule_set\":false,\"first_organic_score\":0,\"is_dynamic_initial_gap_set\":false,\"iterated_organic_items\":1,\"top_organic_score\":0,\"feed_slice_number\":0,\"feed_retrieved_… (1707 chars)",
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
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.84726-6/858553357_1595844581848390_7234823353784418412_n.jpg?stp=c0.151.261.261a_dst-jpg_p261x260_tt6&_nc_cat=101&ccb=1-7&_nc_sid=92e707&_nc_ohc=tGtfI9Pz9wYQ7kNvwGFvvZp&_nc_oc=AdpWgV6U7Z6B2lh3X4MI-VpCMPjS7zFtzl2jpeJ6TXJtXNgGWsOIPXRMVNxBU7QGBB0&_nc_zt=14&_nc_ht=scontent-phl2-1.xx&_nc_gid=tOQ99i6pgY_XtNu4jLl_aA&_nc_ss=792a8&oh=00_AQOXwKVy8KVKjdZwxjd9TlFwdyF… (431 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1792742091617,
        "time_at_flush_ms": 1792742093414
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
          "id": "43a35d1f-20ad-4cdf-a320-444ea09429e9",
          "__typename": "MarketplaceFeedGeneralListingObject",
          "story_key": "658086245427356838",
          "story_type": "GENERAL_LISTING",
          "tracking": "{\"qid\":\"-5930910096585816716\",\"mf_story_key\":\"658086245427356838\",\"top_level_post_id\":\"658086245427356838\",\"commerce_rank_obj\":\"{\\\"target_id\\\":658086245427356838,\\\"target_type\\\":6,\\\"primary_position\\\":1,\\\"ranking_signature\\\":0,\\\"ranking_region\\\":null,\\\"ranking_request_id\\\":null,\\\"commerce_channel\\\":1000,\\\"value\\\":0,\\\"upsell_type\\\":112,\\\"candidate_retrieval_source_map\\\":{\\\"29973708892218453\\\":3001,… (728 chars)",
          "__isMarketplaceFeedGeneralListingData": "MarketplaceFeedGeneralListingObject",
          "entity_id": "1639126257652413",
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
          "id": "68fa7c66-b4dc-44fb-ab35-b866bc637edc",
          "__typename": "MarketplaceFeedGeneralListingObject",
          "story_key": "658086245427356838",
          "story_type": "GENERAL_LISTING",
          "tracking": "{\"qid\":\"-5930910096585816716\",\"mf_story_key\":\"658086245427356838\",\"top_level_post_id\":\"658086245427356838\",\"commerce_rank_obj\":\"{\\\"target_id\\\":658086245427356838,\\\"target_type\\\":6,\\\"primary_position\\\":1,\\\"ranking_signature\\\":0,\\\"ranking_region\\\":null,\\\"ranking_request_id\\\":null,\\\"commerce_channel\\\":1000,\\\"value\\\":0,\\\"upsell_type\\\":112,\\\"candidate_retrieval_source_map\\\":{\\\"29973708892218453\\\":3001,… (728 chars)",
          "__isMarketplaceFeedGeneralListingData": "MarketplaceFeedGeneralListingObject",
          "entity_id": "1663912965382566",
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
        3
      ],
      "data": {
        "node": {
          "id": "3ed60e4f-8ca3-4532-8f2b-f80af044b5ca",
          "__typename": "MarketplaceFeedGeneralListingObject",
          "story_key": "658086245427356838",
          "story_type": "GENERAL_LISTING",
          "tracking": "{\"qid\":\"-5930910096585816716\",\"mf_story_key\":\"658086245427356838\",\"top_level_post_id\":\"658086245427356838\",\"commerce_rank_obj\":\"{\\\"target_id\\\":658086245427356838,\\\"target_type\\\":6,\\\"primary_position\\\":1,\\\"ranking_signature\\\":0,\\\"ranking_region\\\":null,\\\"ranking_request_id\\\":null,\\\"commerce_channel\\\":1000,\\\"value\\\":0,\\\"upsell_type\\\":112,\\\"candidate_retrieval_source_map\\\":{\\\"29973708892218453\\\":3001,… (728 chars)",
          "__isMarketplaceFeedGeneralListingData": "MarketplaceFeedGeneralListingObject",
          "entity_id": "1526321598781672",
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
