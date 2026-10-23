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

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Marketplace location: Reading 19601 US | 1 | 200 | 6401 ms | 16766 ms | — |
| inspect | step 25: click e1241 | 1 | 200 | 5731 ms | 1960 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T110738_61594063207669**, step 25: click e1241: 200, 5731 ms

Sent:

```json
{
  "qpl_active_flow_ids": "138820675",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useCometMarketplaceListingCreateMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "actor_id": "61594063207669",
      "client_mutation_id": "6",
      "attribution_id_v2": "CometMarketplaceComposerRoot.react,comet.marketplace.composer,unexpected,1792667868932,525104,1606854132932955,,;CometMarketplaceComposerRoot.react,comet.marketplace.composer,via_cold_start,1792667592330,780780,1606854132932955,,",
      "audience": {
        "marketplace": {
          "marketplace_id": "1663689853903557"
        }
      },
      "data": {
        "client_application": null,
        "common": {
          "attribute_data_json": "{\"condition\":\"new\"}",
          "category_id": "895487550471874",
          "commerce_shipping_carrier": null,
          "commerce_shipping_carriers": [],
          "comparable_price": "null",
          "cost_per_additional_item": null,
          "delivery_types": [
            "IN_PERSON"
          ],
          "description": {
            "text": "Junk removal and full cleanouts in Bethlehem and nearby.\n\nHouses, apartments, garages, basements, sheds, storage units, hoarder cleanouts.\n\nWe load it, haul it and sweep up. Furniture, appliances, bags, debris.\n\nFrom $99 for small loads. Message a photo of the job for a quote."
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
          "latitude": 40.6262,
          "listing_email_id": null,
          "longitude": -75.3757,
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
          "title": "Junk Removal & Cleanouts: Houses, Garages, Basements",
          "variants": [],
          "video_ids": [],
          "xpost_target_ids": [],
          "comments_disabled": false,
          "photo_ids": [
            "122127505023468773",
            "122127505173468773"
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
        "id": "1425935622848350",
        "story": {
          "url": "https://www.facebook.com/marketplace/item/1425935622848350/",
          "id": "UzpfSTYxNTk0MDYzMjA3NjY5OlZLOjE0MjU5MzU2MjI4NDgzNTA="
        },
        "story_id": "UzpfSTYxNTk0MDYzMjA3NjY5OlZLOjE0MjU5MzU2MjI4NDgzNTA=",
        "product_item": {
          "id": "28800458926283039"
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

<!-- facts:end -->

## What it does

The Publish click itself: creates the Marketplace listing and returns `marketplace_listing_create.listing.id` (the item id) and its story URL.

## What our machine does with it

The publish session listens for its answer and keeps the id (`created_listing_id`), so the id never depends on the Selling page having drawn the new card. Reading's first listing, 4095105027293522, 2026-10-19 13:25:58. The listing can still be held for review afterwards: the Selling page's `integrity_status_indicator` says so, and the run writes UNDER_REVIEW.

## What can go wrong

Once this is sent nothing is retried (rule 10). No answer, or no id in it: the run looks on Selling; failing that it ends `unconfirmedId` for a person to check.
