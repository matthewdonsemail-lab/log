# MarketplaceYourListingDialogQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27832601083046297` |
| Path | `/api/graphql/` |
| Sends | `listingId`, `scale`, `shouldShowAllMessagesOnYouFeedCard`, `__relay_internal__pv__ShouldUpdateMarketplaceBoostListingBoostedStatusrelayprovider` |
| Reads | `viewer....MarketplaceYourListingRedesign_viewer`, `viewer.marketplace_listing` |
| Called from | `MarketplaceYourListingDialog.react` |
| rea | `ev_22f59bbae443de234fa40584e0e8711ae894e0e7bcfb42cf6d605e5b3c885bfd` |

Seen 3 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /marketplace/inbox | 3 | 200 | 908–2422 ms | 500580–1365363 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T155857_61594063207669**, step 3: goto /marketplace/inbox: 200, 2422 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceYourListingDialogQuery",
  "server_timestamps": "true",
  "variables": {
    "listingId": "1425935622848350",
    "scale": 1,
    "shouldShowAllMessagesOnYouFeedCard": true,
    "__relay_internal__pv__ShouldUpdateMarketplaceBoostListingBoostedStatusrelayprovider": false
  },
  "doc_id": "27832601083046297"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_nux_states": {
        "mbl_www_selling_view_nux_state": "NOT_VISIBLE",
        "mbl_www_post_publish_nux_state": "NOT_VISIBLE"
      },
      "marketplace_suggested_crosspost_targets": {
        "edges": []
      },
      "__typename": "Viewer",
      "marketplace_listing": {
        "__typename": "GroupCommerceProductItem",
        "__isMarketplaceListingRenderable": "GroupCommerceProductItem",
        "id": "1425935622848350",
        "is_sold": false,
        "is_pending": false,
        "is_profile_selling_post": false,
        "is_draft": false,
        "product_item": {
          "for_sale_item": {
            "id": "1425935622848350"
          },
          "id": "28800458926283039",
          "promoted_listing": {
            "page_posted_from": null,
            "product_item_override": null,
            "button_text": "Promote now",
            "page_id": "1383267438207114",
            "coupon_offer_id": null
          },
          "boosted_marketplace_listing": null,
          "product_catalog": {
            "id": "1116789430997720"
          }
        },
        "listing_inventory_type": "SINGLE_QUANTITY",
        "marketplace_listing_seller": {
          "__typename": "User",
          "id": "61594063207669"
        },
        "marketplace_bump_info": {
          "bump_count": 0,
          "days_until_next_bump": 7,
          "max_bump_count": 100000
        },
        "origin_group": null,
        "__isMarketplaceListingSellerNotices": "GroupCommerceProductItem",
        "fi_enhanced_appeal_data": {
          "use_fi_appeals": true,
          "enforcement_instance_id": null
        },
        "listing_seller_notices": [],
        "__isMarketplaceListingWithEmailCommunication": "GroupCommerceProductItem",
        "is_email_communication_enabled": false,
        "listing_photos": [
          {
            "__typename": "ProductImage",
            "image": {
              "uri": "https://scontent-lga3-1.xx.fbcdn.net/v/t45.5328-4/856660594_2379535212790769_660742871528716392_n.jpg?stp=c0.80.206.206a_dst-jpg_p206x206_tt6&_nc_cat=111&ccb=1-7&_nc_sid=247b10&_nc_ohc=azfCRYsIeUMQ7kNvwEjo79u&_nc_oc=AdozHNnxDlOGj-O-d6nMyUIv_5xQ_vPfVLHlwEGwDBliY61x7UM6iY-yTA2cUqxtM28&_nc_zt=23&_nc_ht=scontent-lga3-1.xx&_nc_gid=GIMqVqjP7TUtEkjLnMkTuQ&_nc_ss=792a8&oh=00_AQP7A_2mH3JUHvJmN33qz_wtaHTFeW… (428 chars)"
            },
            "id": "2379535206124103"
          },
          {
            "__typename": "ProductImage",
            "image": {
              "uri": "https://scontent-lga3-3.xx.fbcdn.net/v/t45.5328-4/856888990_1841284863737368_3153641676653129513_n.jpg?stp=c0.80.206.206a_dst-jpg_p206x206_tt6&_nc_cat=104&ccb=1-7&_nc_sid=247b10&_nc_ohc=08r2jHz1AtQQ7kNvwHDQzyp&_nc_oc=AdpXtiSFpCIOZXyXtbmmAnulAQ42S_05VPKgl7-KVKQjDggHyZPZxckHpOPkAoyyJB8&_nc_zt=23&_nc_ht=scontent-lga3-3.xx&_nc_gid=GIMqVqjP7TUtEkjLnMkTuQ&_nc_ss=792a8&oh=00_AQOg_yQZit6uuUZ1sRKbvOwLmiFn1… (429 chars)"
            },
            "id": "1841284860404035"
          }
        ],
        "__isMarketplaceListingWithChildListings": "GroupCommerceProductItem",
        "children": {
          "__typename": "GroupCommerceProductItemChildrenConnection",
          "nodes": []
        },
        "inventory_count": null,
        "marketplace_listing_title": "Junk Removal & Cleanouts: Houses, Garages, Basements",
        "listing_price": {
          "formatted_amount": "$99",
          "currency": "USD"
        },
        "creation_time": 1792667894,
        "location": {
          "reverse_geocode_detailed": {
            "city": "Bethlehem",
            "state": "PA"
          }
        },
        "__isMarketplaceListingWithSKU": "GroupCommerceProductItem",
        "sku": null,
        "__isMarketplaceListingWithVariants": "GroupCommerceProductItem",
        "base_marketplace_listing_title": "Junk Removal & Cleanouts: Houses, Garages, Basements",
        "is_multi_variant_listing": false,
        "__isMarketplaceListingWithRenderableListingStatus": "GroupCommerceProductItem",
        "renderable_listing_status": "AVAILABLE",
        "is_viewer_seller": true,
        "__isGroupCommerceProductItemIsDeprecated": "GroupCommerceProductItem",
        "all_message_threads": {
          "is_empty": true,
          "edges": []
        },
        "has_children": false,
        "__isMarketplaceListingWithIntegrityStatus": "GroupCommerceProductItem",
        "can_seller_change_availability": true,
        "marketplace_listing_category_id": "895487550471874",
        "should_show_txn_survey_on_mas": true,
        "story": {
          "id": "UzpfSTYxNTk0MDYzMjA3NjY5OlZLOjE0MjU5MzU2MjI4NDgzNTA=",
          "__isEntity": "Story",
          "url": "https://www.facebook.com/marketplace/item/1425935622848350/",
          "__isNode": "Story"
        },
        "__isMarketplaceListingWithDeliveryOptions": "GroupCommerceProductItem",
        "is_mark_as_available_enabled": false,
        "listing_is_rejected": false,
        "__isMarketplaceListingWithCrossposting": "GroupCommerceProductItem",
        "cross_post_info": {
          "all_listings": [
            {
              "__typename": "GroupCommerceProductItem",
              "origin_target": {
                "__typename": "Marketplace",
                "id": "1663689853903557",
                "name": "United States Marketplace"
              },
              "id": "1425935622848350",
              "is_on_marketplace": true,
              "url": "https://www.facebook.com/marketplace/item/1425935622848350/",
              "story": {
                "feedback": {
                  "comment_count_reduced": "0",
                  "id": "ZmVlZGJhY2s6MTQyNTkzNTYyMjg0ODM1MA=="
                },
                "url": "https://www.facebook.com/marketplace/item/1425935622848350/",
                "to": null,
                "id": "UzpfSTYxNTk0MDYzMjA3NjY5OlZLOjE0MjU5MzU2MjI4NDgzNTA="
              },
              "__isMarketplaceListingWithInsights": "GroupCommerceProductItem",
              "listing_insights": {
                "insights": [
                  {
                    "count": "…"
                  }
                ]
              }
            }
          ],
          "count": 1
        },
        "incentive_campaign_for_free_shipping": null,
        "default_variant_listing": null,
        "__isNode": "GroupCommerceProductItem",
        "__isMarketplaceListingHideableFromFriends": "GroupCommerceProductItem",
        "hidden_from_friends": "VISIBLE_TO_EVERYONE",
        "can_share": true,
        "reportable_ent_id": "28800458926283039",
        "__isMarketplaceListingWithInsights": "GroupCommerceProductItem",
        "listing_insights": {
          "clicks": [
            {
              "count": 7
            }
          ],
          "saves": [
            {
              "count": 0
            }
          ],
          "shares": [
            {
              "count": 0
            }
          ]
        },
        "__isMarketplaceListingWithCheckoutOffers": "GroupCommerceProductItem",
        "offers": {
          "__typename": "GroupCommerceProductItemOffersConnection",
          "count": 0
        },
        "can_seller_edit": true,
        "c2c_shipping_eligible": false,
        "is_shipping_offered": false,
        "show_view_order_cta": false,
        "show_view_offers_cta": false,
        "most_recent_active_order_as_buyer": null,
        "order_summaries": []
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792685358288,
      "time_at_flush_ms": 1792685360281
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Opens one of the seller's own listings in its dialog on Selling (`listingId`): the listing in full (`viewer.marketplace_listing`), its redesign panel and boost state. Seen three times while Bethlehem's open browser sat on the inbox step (8 to 23 minutes in), when the listing was opened by hand.

## What our machine does with it

Nothing reads it yet. The check gets each listing's state and clicks from the Selling list, which is enough; the dialog is where more of one listing's insights would be read if they are ever needed.

## What can go wrong

Seen only with 200. Failing, the dialog shows empty; no step waits on it.
