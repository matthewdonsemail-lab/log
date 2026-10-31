# CometMarketplaceYouSellingFastContentContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29188899014069653` |
| Path | `/api/graphql/` |
| Sends | `count`, `cursor`, `order`, `scale`, `shouldDeferInfoSection`, `state`, `status`, `title_search`, `__relay_internal__pv__ShouldUpdateMarketplaceBoostListingBoostedStatusrelayprovider` |
| Reads | `...CometMarketplaceUnifiedYouSellingFastContent_query` |
| Called from | `CometMarketplaceYouSellingFastContentContainer.react` |
| rea | `ev_212cf616ae977ec0669a8e0077a1f11572208e25097749815af33b3cbeb6d22f` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /marketplace/inbox | 2 | 200 | 778–1275 ms | 494388–1361223 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T155857_61594063207669**, step 3: goto /marketplace/inbox: 200, 1275 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceYouSellingFastContentContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "count": 5,
    "order": "CREATION_TIMESTAMP_DESC",
    "scale": 1,
    "shouldDeferInfoSection": false,
    "state": null,
    "title_search": null,
    "__relay_internal__pv__ShouldUpdateMarketplaceBoostListingBoostedStatusrelayprovider": false
  },
  "doc_id": "29188899014069653"
}
```

Answered:

```json
{
  "first": {
    "data": {
      "xfb_c2c_shipped_viewer_access": {
        "can_onboard_to_shipped": {
          "has_access": false
        },
        "id": "c2c_shipped_access_checker:61594063207669"
      },
      "viewer": {
        "marketplace_nux_states": {
          "mbl_www_selling_view_nux_state": "NOT_VISIBLE",
          "mbl_www_post_publish_nux_state": "NOT_VISIBLE",
          "marketplace_bulk_boost_comet_nux": "VISIBLE"
        },
        "inactive_sets": {
          "is_empty": true
        },
        "active_sets": {
          "is_empty": false
        },
        "marketplace_c2c_shipping_seller": {
          "canUseMakeOffer": true,
          "is_onboarded": false,
          "you_selling_banner": null
        },
        "inactive_listing_sets": {
          "edges": "(0 items)"
        },
        "marketplace_listing_sets": {
          "edges": "(1 items)",
          "is_empty": false
        },
        "problematic_listing_sets": {
          "is_empty": true
        },
        "items": {
          "count_up_to": 1
        },
        "seller": {
          "__typename": "User",
          "id": "61594063207669",
          "marketplace_should_display_verified_badge": false,
          "should_display_true_blue_badge_mp": false,
          "__isActor": "User",
          "profile_picture_160": "(1 fields)",
          "profile_picture_112": "(1 fields)",
          "profile_picture_64": "(1 fields)",
          "profile_picture_60": "(1 fields)",
          "profile_picture_50": "(1 fields)",
          "__isActorWithCustomizableCommerceProfile": "User",
          "commerce_profile_picture_with_fallback_160": "(1 fields)",
          "commerce_profile_picture_with_fallback_112": "(1 fields)",
          "commerce_profile_picture_with_fallback_64": "(1 fields)",
          "commerce_profile_picture_with_fallback_60": "(1 fields)",
          "commerce_profile_picture_with_fallback_50": "(1 fields)",
          "name": "Bethlehem Trash"
        },
        "order_management": {
          "is_carrier_scan_based_tracking_enabled": false,
          "order_management_order_summaries": null,
          "waiting_for_carrier_scan_summaries": "(1 fields)"
        },
        "marketplace_boosted_listing_candidate": [
          "(6 fields)"
        ],
        "c2c_shipped_access": {
          "can_create_shipped_listings": "(1 fields)",
          "id": "c2c_shipped_access_checker:61594063207669",
          "can_onboard_to_shipped": "(1 fields)"
        },
        "marketplace_shipping_eligible_listings": {
          "nodes": "(1 items)"
        },
        "actor": {
          "__typename": "User",
          "human_readable_type": "(1 fields)",
          "id": "61594063207669"
        },
        "marketplace_settings": {
          "vacation_mode": null,
          "id": "TWFya2V0cGxhY2VTZXR0aW5nczo2MTU5NDA2MzIwNzY2OQ=="
        }
      }
    },
    "extensions": {
      "fulfilled_payloads": [
        {
          "label": "CometMarketplaceUnifiedYouSellingFastContent_viewer$defer$CometMarketplaceYouInfoSection_viewer",
          "path": "(1 items)"
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1792685352099,
        "time_at_flush_ms": 1792685352934
      },
      "is_final": false
    }
  },
  "followingParts": 2,
  "parts": [
    {
      "label": "MarketplaceYouSellingFastInactiveSection_viewerConnection$defer$MarketplaceYouSellingFastInactiveSection_inactive_listing_sets$page_info",
      "path": [
        "viewer",
        "inactive_listing_sets"
      ],
      "data": {
        "page_info": {
          "end_cursor": null,
          "has_next_page": false
        }
      },
      "extensions": {
        "is_final": false
      }
    },
    {
      "label": "MarketplaceYouSellingFastActiveSection_viewerConnection$defer$MarketplaceYouSellingFastActiveSection_marketplace_listing_sets$page_info",
      "path": [
        "viewer",
        "marketplace_listing_sets"
      ],
      "data": {
        "page_info": {
          "end_cursor": "AQHTu3I27_hS5J3JXAQPe7QV8wC_cn8Rb5r-OfPZa4AZ9olqBcbLLFOCWyryQCm-8HwFDgxLjyDV7g4bK1cIY3H0Eg",
          "has_next_page": false
        }
      },
      "extensions": {
        "is_final": true
      }
    }
  ]
}
```

<!-- facts:end -->

## What it does

Loads the seller's listings on Marketplace > Selling (`/marketplace/you/selling`), a page at a time (`count`, `cursor`), filtered and sorted by `state`, `status`, `order` and `title_search`. Each listing comes with its title, price, flags (`is_on_marketplace`, `is_sold`, `is_pending`, `is_draft`), its review notice, and `listing_insights.insights[0].count`: the page's "N clicks on listing", how many times people opened the listing's details page in the last 14 days. On a direct load the first page of it is preloaded in the page's own HTML (inspect 20261023T000744, step 02, entry 20); this POST is the same query when the list reloads or pages in the open browser (seen twice while the inbox step sat open, 8 and 23 minutes in).

## What our machine does with it

The Marketplace check (`src/facebook/marketplace/check`, `log facebook check` and the host's watch round) reads it from the Selling step's recording, preloaded or posted: `sellingListingsOf` takes each listing's state into Twenty's `agencyListings.status` and its clicks into `clicksCount` (Bethlehem's: 15, then 19, on 2026-10-23). Nothing waits on it and nothing is clicked.

## What can go wrong

Seen only with 200. If the page loads without it (a login wall, a checkpoint, a slow proxy), the check says "Selling didn't load" and changes nothing in Twenty. A listing without `listing_insights` keeps its last `clicksCount`. Paging past the first page isn't read yet: an account with more listings than the first page holds would miss the rest.
