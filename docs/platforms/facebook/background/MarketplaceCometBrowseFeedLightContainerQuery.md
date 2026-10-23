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
          "uri": "https://scontent-lga3-1.xx.fbcdn.net/v/t45.5328-4/792705720_3291896437666761_6608927264699573403_n.jpg?stp=c158.0.964.964a_dst-jpg_tt6&cstp=mx964x964&ctp=s261x260&_nc_cat=110&ccb=1-7&_nc_sid=7ea8df&_nc_ohc=DOuB7k-FvMoQ7kNvwFuDt0J&_nc_oc=Adq4jKv2PjLwdPZlvSfg-5rZNi-fy4ZhakYiF-ZWZmK3C1vqAxfwUp0RIC5cKijrH1A&_nc_zt=23&_nc_ht=scontent-lga3-1.xx&_nc_gid=sWb3kAQ-geJNYbrO0wiQlw&_nc_ss=792a8&oh=00_AQNr_gW2t… (449 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-lga3-2.xx.fbcdn.net/v/t45.5328-4/825331279_1107805111679275_6933076528485965959_n.jpg?stp=c0.330.3000.3000a_dst-jpg_tt6&cstp=mx3000x3000&ctp=s261x260&_nc_cat=107&ccb=1-7&_nc_sid=7ea8df&_nc_ohc=t2C16CClS9UQ7kNvwGd7vKd&_nc_oc=AdpSDyJFwY97S9Prrij5byfyYC7jK9G2rv-t4zDjNWEKO-v9iHeUTJxqHOqRIlV8U8s&_nc_zt=23&_nc_ht=scontent-lga3-2.xx&_nc_gid=sWb3kAQ-geJNYbrO0wiQlw&_nc_ss=792a8&oh=00_AQMft… (453 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-lga3-2.xx.fbcdn.net/v/t45.5328-4/857707952_1153535390363224_1249299151427696707_n.jpg?stp=c0.43.261.261a_dst-jpg_p261x260_tt6&_nc_cat=107&ccb=1-7&_nc_sid=247b10&_nc_ohc=U2ZBTHNAZB0Q7kNvwG4cb9A&_nc_oc=AdrUttFrO6f2z-acT9t-xrik6Y1A-UkNX7ueNLGQcfy857XTadeSBLgwK9Q_vlwp1o8&_nc_zt=23&_nc_ht=scontent-lga3-2.xx&_nc_gid=sWb3kAQ-geJNYbrO0wiQlw&_nc_ss=792a8&oh=00_AQNpTwHlGShFE1dcZ3QDBDKiwO00U… (429 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-lga3-1.xx.fbcdn.net/v/t45.5328-4/825284948_1070647075726010_7259050604123215370_n.jpg?stp=c43.0.260.260a_dst-jpg_p261x260_tt6&_nc_cat=109&ccb=1-7&_nc_sid=247b10&_nc_ohc=taxxsswOcGkQ7kNvwF-8Jkf&_nc_oc=AdpT7cPr_439lWEoycWBaNNNm4vs042S-E_LLXEd0RtD-Y-0WaJIEZLcGWVVSmEoFZ8&_nc_zt=23&_nc_ht=scontent-lga3-1.xx&_nc_gid=sWb3kAQ-geJNYbrO0wiQlw&_nc_ss=792a8&oh=00_AQM144FVyJoz4Lx6uBJKnmYfhS_BF… (429 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-lga3-3.xx.fbcdn.net/v/t45.5328-4/798589946_28765747766366253_5841133203145583122_n.jpg?stp=c892.0.2296.2296a_dst-jpg_tt6&cstp=mx2296x2296&ctp=s261x260&_nc_cat=106&ccb=1-7&_nc_sid=7ea8df&_nc_ohc=gOvy75mWh6AQ7kNvwFcbMc8&_nc_oc=AdrB-nziwicLlwTYy5tx9-MeuT558dScN7jSmihx-bKTTlkN6zPvlL66WmZihgNCowA&_nc_zt=23&_nc_ht=scontent-lga3-3.xx&_nc_gid=sWb3kAQ-geJNYbrO0wiQlw&_nc_ss=792a8&oh=00_AQN8… (454 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-lga3-2.xx.fbcdn.net/v/t45.5328-4/852101236_2204837723468461_3402126919315690121_n.jpg?stp=c0.25.261.261a_dst-jpg_p261x260_tt6&_nc_cat=101&ccb=1-7&_nc_sid=247b10&_nc_ohc=BDDMhAfR6twQ7kNvwFamrfC&_nc_oc=AdqavevhUcfoecPUiigB0Ws_uSXWerUsuNmMdrLzxoHDCC1zX8LhzBwE3o8Swm2oJWU&_nc_zt=23&_nc_ht=scontent-lga3-2.xx&_nc_gid=sWb3kAQ-geJNYbrO0wiQlw&_nc_ss=792a8&oh=00_AQMkblvYy2kYWckhOzIeoM99Ada24… (429 chars)",
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
          "ad_impression_client_token": "AI@AQK9nga3RECNBEYyvmetijvyxxMngtbgWSdSawDs3E0OGE-S1jvfbcstvPVgK_DceJp_7sFPgakQUNMhUkmTNN2Z",
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
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/821178588_4563241127337366_7168015474036199596_n.jpg?stp=c200.0.1200.1200a_dst-jpg_tt6&cstp=mx1200x1200&ctp=s261x260&_nc_cat=105&ccb=1-7&_nc_sid=7ea8df&_nc_ohc=oAUd-DgdixMQ7kNvwGf8XiD&_nc_oc=Adpsh-Tz7PpM65HbwNXAGDP2vd9Q177ScaLm1WZUf33-zZaJlz4ax5UaXvwl8NHsV4c&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=wtFdqWUN-qSmBspWSjxW7g&_nc_ss=792a8&oh=00_AQNmg… (453 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/856583545_28732861209675642_3535474348993802822_n.jpg?stp=c0.58.525.525a_dst-jpg_tt6&cstp=mx525x525&ctp=s261x260&_nc_cat=106&ccb=1-7&_nc_sid=7ea8df&_nc_ohc=g0lGeF5JOVsQ7kNvwF1bUU2&_nc_oc=AdpNcCO7DaMuvrx4zI9NO2NzOtBL_pxu-WYWpHXaPSNgv4Vt9UMTYFOWDys4qevS96w&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=wtFdqWUN-qSmBspWSjxW7g&_nc_ss=792a8&oh=00_AQModquTs… (449 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/798589946_28765747766366253_5841133203145583122_n.jpg?stp=c892.0.2296.2296a_dst-jpg_tt6&cstp=mx2296x2296&ctp=s261x260&_nc_cat=106&ccb=1-7&_nc_sid=7ea8df&_nc_ohc=gOvy75mWh6AQ7kNvwGPAKX2&_nc_oc=Adp5RX7yw_UtyGe-VuIi4HQPoMRZl2HmT9v2O6XYQqEm7wo79QAWV9q0vXpVrYWKVaw&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=wtFdqWUN-qSmBspWSjxW7g&_nc_ss=792a8&oh=00_AQMI… (454 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/845832759_1428507518727010_7975235107897927002_n.jpg?stp=c0.58.525.525a_dst-jpg_tt6&cstp=mx525x525&ctp=s261x260&_nc_cat=106&ccb=1-7&_nc_sid=7ea8df&_nc_ohc=uXC3VimDJ5MQ7kNvwE2dFuB&_nc_oc=Adoc7lcWYjqhodSXrZA9Y2X2Yp3VZByLzuDJ2YZutSuQuFPSbwSpk9TYczrFLuScnk4&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=wtFdqWUN-qSmBspWSjxW7g&_nc_ss=792a8&oh=00_AQMkebVb4b… (448 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/855166534_4230998330369910_8961199944737311324_n.jpg?stp=c0.58.525.525a_dst-jpg_tt6&cstp=mx525x525&ctp=s261x260&_nc_cat=101&ccb=1-7&_nc_sid=7ea8df&_nc_ohc=hkf6SynSbGwQ7kNvwHstLl-&_nc_oc=Adrcq1a7cZkAazuIljz8zuML7xNhlLn6PJzkddgGwPn6tDf2aXTGHHdHc6d1ezIsoR8&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=wtFdqWUN-qSmBspWSjxW7g&_nc_ss=792a8&oh=00_AQMI_6SvmF… (448 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/853286697_1806506914008863_6981065559839165275_n.jpg?stp=c0.45.564.564a_dst-jpg_tt6&cstp=mx564x564&ctp=s261x260&_nc_cat=107&ccb=1-7&_nc_sid=7ea8df&_nc_ohc=2uU4lZPBjwMQ7kNvwH8HSRY&_nc_oc=AdrQgvvDAQRRpmmHSTkgUr-r8HuyIE4Iz0cQKTSfrSV2AzN8dl_9-7QqliXf8fZynRI&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=wtFdqWUN-qSmBspWSjxW7g&_nc_ss=792a8&oh=00_AQOMNwY2go… (448 chars)",
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
          "ad_impression_client_token": "AI@AQLXo_jH2Ecp-SYQXSYk3EQ1xHPwQOhWuFT0snC2Io-uz0TUSvn9HraOi8xlXgf1TsZX6BzUWD_8bFIjfezS04P_",
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
