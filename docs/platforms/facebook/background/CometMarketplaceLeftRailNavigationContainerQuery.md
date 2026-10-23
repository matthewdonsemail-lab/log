# CometMarketplaceLeftRailNavigationContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `39413521514929752` |
| Path | `/api/graphql/` |
| Sends | `buyLocation`, `category_ranking_enabled`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__MarketplaceJobsSubtabFiltersCometrelayprovider`, `hide_l2_cats` |
| Reads | `...CometMarketplaceLeftRailNavigation_query` |
| Called from | `CometMarketplaceLeftRailNavigationContainer.react` |
| rea | `ev_a3f518ca5cd3399f6c39de02362bd62e28dd8a82451cecaa92129e250dbd95be` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 15: click e1354 | 1 | 200 | 413 ms | 2350 ms | — |
| inspect | step 4: click e191 | 1 | 200 | 1244 ms | 2960 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T110738_61594063207669**, step 4: click e191: 200, 1244 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceLeftRailNavigationContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "buyLocation": {
      "latitude": 37.193232725035,
      "longitude": -3.6622435304279
    },
    "category_ranking_enabled": false,
    "hide_l2_cats": true,
    "__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider": false,
    "__relay_internal__pv__MarketplaceJobsSubtabFiltersCometrelayprovider": false
  },
  "doc_id": "39413521514929752"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_settings": {
        "seller_mode_enabled": false,
        "id": "TWFya2V0cGxhY2VTZXR0aW5nczo2MTU5NDA2MzIwNzY2OQ==",
        "current_marketplace": {
          "__typename": "Marketplace",
          "is_metric_base": true,
          "id": "815544551944570"
        }
      },
      "actor": {
        "__typename": "User",
        "marketplace_seller_eligible_for_bulk_upload": false,
        "id": "61594063207669"
      },
      "marketplace_nux_states": {
        "marketplace_bulk_upload_entrypoint_nux": "VISIBLE"
      },
      "marketplaceViolationTransparencyViewModel": {
        "access_status": "GOOD"
      },
      "is_marketplace_pulse_enabled": false,
      "should_show_marketplace_job_seeker_logged_in_surfaces": true,
      "marketplace_ranked_categories": {
        "prediction_id": null,
        "categories_virtual_taxonomy": [
          {
            "id": "677457442746983",
            "name": "Clothing",
            "icon_name": "t-shirt",
            "seo_info": {
              "seo_url": "apparel",
              "id": "2626320500744915"
            },
            "virtual_taxonomy_publish_state": "PUBLISHED"
          },
          {
            "id": "759201041254543",
            "name": "Classifieds",
            "icon_name": "binoculars",
            "seo_info": {
              "seo_url": "classifieds",
              "id": "3370316233042991"
            },
            "virtual_taxonomy_publish_state": "PUBLISHED"
          },
          {
            "id": "479353692612078",
            "name": "Electronics",
            "icon_name": "mobile",
            "seo_info": {
              "seo_url": "electronics",
              "id": "2458992307542385"
            },
            "virtual_taxonomy_publish_state": "PUBLISHED"
          },
          {
            "id": "529595287638583",
            "name": "Entertainment",
            "icon_name": "film-projector",
            "seo_info": {
              "seo_url": "entertainment",
              "id": "3727006157324485"
            },
            "virtual_taxonomy_publish_state": "PUBLISHED"
          },
          {
            "id": "891748581240437",
            "name": "Family",
            "icon_name": "heart",
            "seo_info": {
              "seo_url": "family",
              "id": "3008548325836386"
            },
            "virtual_taxonomy_publish_state": "PUBLISHED"
          },
          {
            "id": "2796952007029050",
            "name": "Free stuff",
            "icon_name": "tag-remove",
            "seo_info": {
              "seo_url": "free",
              "id": "2632259956851668"
            },
            "virtual_taxonomy_publish_state": "PUBLISHED"
          },
          "… 13 more"
        ]
      },
      "marketplace_feed_stories": {
        "buy_location": {
          "display_name": "Maracena, Spain",
          "id": "108263972541612"
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667424510,
      "time_at_flush_ms": 1792667424598
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Redraws Marketplace's left rail (Browse all, Inbox, Marketplace status, Buying, Selling, Location) after a navigation or a location change.

## What our machine does with it

Nothing; it follows `CometMarketplaceSetBuyLocationMutation` when the location dialog is applied.

## What can go wrong

Harmless.
