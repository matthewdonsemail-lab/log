# useCometMarketplaceListingCreateMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | publishing |
| Kind | mutation |
| doc_id | `9551550371629242` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `marketplace_listing_create.listing`, `marketplace_listing_create.boosted_component` |
| Called from | `useCometMarketplaceListingCreateMutation` |
| rea | `ev_9b09bc743ecfcdaaf9245c052c78813cdc1ea6ffecabbeede3a18621e77a9635` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Marketplace location: Reading 19601 US | 1 | 200 | 6401 ms | 16766 ms | — |
| inspect | step 25: click e1241 | 1 | 200 | 5731 ms | 1960 ms | — |
| flow | step 15: clickRole button "…" | 1 | 200 | 8038 ms | 822 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T110738_<userId:1>**, step 25: click e1241: 200, 5731 ms

Sent:

```json
{
  "qpl_active_flow_ids": "138820675",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useCometMarketplaceListingCreateMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "actor_id": "<userId:1>",
      "client_mutation_id": "6",
      "attribution_id_v2": "CometMarketplaceComposerRoot.react,comet.marketplace.composer,unexpected,1792667868932,525104,<id:1>,,;CometMarketplaceComposerRoot.react,comet.marketplace.composer,via_cold_start,1792667592330,780780,<id:1>,,",
      "audience": {
        "marketplace": {
          "marketplace_id": "<id:2>"
        }
      },
      "data": {
        "client_application": null,
        "common": {
          "attribute_data_json": "{\"condition\":\"new\"}",
          "category_id": "<id:3>",
          "commerce_shipping_carrier": null,
          "commerce_shipping_carriers": [],
          "comparable_price": "null",
          "cost_per_additional_item": null,
          "delivery_types": [
            "IN_PERSON"
          ],
          "description": {
            "text": "<messageText>"
          },
          "draft_type": null,
          "hidden_from_friends_visibility": "VISIBLE_TO_EVERYONE",
          "is_personalization_required": null,
          "is_photo_order_set_by_seller": false,
          "is_preview": false,
          "item_price": {
            "currency": "USD",
            "price": "99"
          },
          "latitude": "<coordinate>",
          "listing_email_id": null,
          "longitude": "<coordinate>",
          "min_acceptable_checkout_offer_price": "null",
          "personalization_info": null,
          "product_hashtag_names": [],
          "quantity": null,
          "shipping_calculation_logic_version": null,
          "shipping_cost_option": "BUYER_PAID_SHIPPING",
          "shipping_cost_range_lower_cost": null,
          "shipping_cost_range_upper_cost": null,
          "shipping_label_price": "0",
          "shipping_label_rate_code": null,
          "shipping_label_rate_type": null,
          "shipping_offered": false,
          "shipping_options_data": [],
          "shipping_package_weight": null,
          "shipping_price": "null",
          "shipping_service_type": null,
          "sku": "",
          "source_type": "marketplace_unknown",
          "suggested_hashtag_names": [],
          "surface": "composer",
          "title": "<messageText>",
          "variants": [],
          "video_ids": [],
          "xpost_target_ids": [],
          "comments_disabled": false,
          "photo_ids": [
            "<id:4>",
            "<id:5>"
          ]
        }
      },
      "vin_autofill_summary": null
    }
  },
  "doc_id": "9551550371629242",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=138820675"
  ]
}
```

Answered:

```json
{
  "data": {
    "marketplace_listing_create": {
      "listing": {
        "__typename": "GroupCommerceProductItem",
        "id": "<id:6>",
        "story": {
          "url": "https://www.facebook.com/marketplace/item/1425935622848350/",
          "id": "UzpfSTYxNTk0MDYzMjA3NjY5OlZLOjE0MjU5MzU2MjI4NDgzNTA="
        },
        "story_id": "UzpfSTYxNTk0MDYzMjA3NjY5OlZLOjE0MjU5MzU2MjI4NDgzNTA=",
        "product_item": {
          "id": "<id:7>"
        }
      },
      "boosted_component": null
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667894445,
      "time_at_flush_ms": 1792667898926
    },
    "is_final": true
  }
}
```

**runs/flow/20261024T233053_<userId:2>**, step 15: clickRole button "…": 200, 8038 ms

Sent:

```json
{
  "qpl_active_flow_ids": "138820675",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useCometMarketplaceListingCreateMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "actor_id": "<userId:2>",
      "client_mutation_id": "6",
      "attribution_id_v2": "CometMarketplaceComposerRoot.react,comet.marketplace.composer,unexpected,1792884897226,915172,<id:1>,,;CometMarketplaceComposerRoot.react,comet.marketplace.composer,via_cold_start,1792884729036,574366,<id:1>,,",
      "audience": {
        "marketplace": {
          "marketplace_id": "<id:2>"
        }
      },
      "data": {
        "client_application": null,
        "common": {
          "attribute_data_json": "{\"condition\":\"new\"}",
          "category_id": "<id:3>",
          "commerce_shipping_carrier": null,
          "commerce_shipping_carriers": [],
          "comparable_price": "null",
          "cost_per_additional_item": null,
          "delivery_types": [
            "IN_PERSON"
          ],
          "description": {
            "text": "<messageText>"
          },
          "draft_type": null,
          "hidden_from_friends_visibility": "VISIBLE_TO_EVERYONE",
          "is_personalization_required": null,
          "is_photo_order_set_by_seller": false,
          "is_preview": false,
          "item_price": {
            "currency": "USD",
            "price": "99"
          },
          "latitude": "<coordinate>",
          "listing_email_id": null,
          "longitude": "<coordinate>",
          "min_acceptable_checkout_offer_price": "null",
          "personalization_info": null,
          "product_hashtag_names": [],
          "quantity": null,
          "shipping_calculation_logic_version": null,
          "shipping_cost_option": "BUYER_PAID_SHIPPING",
          "shipping_cost_range_lower_cost": null,
          "shipping_cost_range_upper_cost": null,
          "shipping_label_price": "0",
          "shipping_label_rate_code": null,
          "shipping_label_rate_type": null,
          "shipping_offered": false,
          "shipping_options_data": [],
          "shipping_package_weight": null,
          "shipping_price": "null",
          "shipping_service_type": null,
          "sku": "",
          "source_type": "marketplace_unknown",
          "suggested_hashtag_names": [],
          "surface": "composer",
          "title": "<messageText>",
          "variants": [],
          "video_ids": [],
          "xpost_target_ids": [],
          "comments_disabled": false,
          "photo_ids": [
            "<id:8>",
            "<id:9>"
          ]
        }
      },
      "vin_autofill_summary": null
    }
  },
  "doc_id": "9551550371629242",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=138820675"
  ]
}
```

Answered:

```json
{
  "data": {
    "marketplace_listing_create": {
      "listing": {
        "__typename": "GroupCommerceProductItem",
        "id": "<id:10>",
        "story": {
          "url": "https://www.facebook.com/marketplace/item/28779899605000522/",
          "id": "UzpfSTYxNTkzOTgxMzA3NzIwOlZLOjI4Nzc5ODk5NjA1MDAwNTIy"
        },
        "story_id": "UzpfSTYxNTkzOTgxMzA3NzIwOlZLOjI4Nzc5ODk5NjA1MDAwNTIy",
        "product_item": {
          "id": "<id:11>"
        }
      },
      "boosted_component": null
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792884904815,
      "time_at_flush_ms": 1792884912476
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

The Publish click itself: creates the Marketplace listing and returns `marketplace_listing_create.listing.id` (the item id) and its story URL.

## What our machine does with it

The publish session listens for its answer and keeps the id (`created_listing_id`), so the id never depends on the Selling page having drawn the new card. Reading's first listing, <id:12>, 2026-10-19 13:25:58. The listing can still be held for review afterwards: the Selling page's `integrity_status_indicator` says so, and the run writes UNDER_REVIEW.

## What can go wrong

Once this is sent nothing is retried (rule 10). No answer, or no id in it: the run looks on Selling; failing that it ends `unconfirmedId` for a person to check.
