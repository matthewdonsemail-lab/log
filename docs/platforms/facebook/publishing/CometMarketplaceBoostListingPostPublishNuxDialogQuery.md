# CometMarketplaceBoostListingPostPublishNuxDialogQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | publishing |
| Kind | query |
| doc_id | `25465988359761944` |
| Path | `/api/graphql/` |
| Sends | `listingID`, `scale`, `__relay_internal__pv__ShouldUpdateMarketplaceBoostListingBoostedStatusrelayprovider` |
| Reads | `viewer....CometMarketplaceBoostListingButton_viewer`, `viewer.listing` |
| Called from | `CometMarketplaceBoostListingPostPublishNuxDialog.react` |
| rea | `ev_532ce4cf56bca38d3123d4452a4f0a065ca00a7563ccc92a35f6165b6888146e` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 25: click e1241 | 1 | 200 | 594 ms | 15265 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T110738_61594063207669**, step 25: click e1241: 200, 594 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceBoostListingPostPublishNuxDialogQuery",
  "server_timestamps": "true",
  "variables": {
    "listingID": "1425935622848350",
    "scale": 1,
    "__relay_internal__pv__ShouldUpdateMarketplaceBoostListingBoostedStatusrelayprovider": false
  },
  "doc_id": "25465988359761944"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_nux_states": {
        "mbl_www_selling_view_nux_state": "NOT_VISIBLE",
        "mbl_www_post_publish_nux_state": "VISIBLE"
      },
      "listing": {
        "__typename": "GroupCommerceProductItem",
        "__isMarketplaceListingRenderable": "GroupCommerceProductItem",
        "is_pending": false,
        "is_sold": false,
        "product_item": {
          "id": "28800458926283039",
          "boosted_marketplace_listing": null,
          "promoted_listing": {
            "button_text": "Promote now",
            "page_id": "1383267438207114",
            "product_item_override": {
              "id": "28800458926283039"
            },
            "coupon_offer_id": null,
            "page_posted_from": null
          }
        },
        "marketplace_listing_title": "Junk Removal & Cleanouts: Houses, Garages, Basements",
        "primary_listing_photo": {
          "__typename": "ProductImage",
          "image": {
            "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/856660594_2379535212790769_660742871528716392_n.jpg?stp=c0.24.64.64a_dst-jpg_p64x64_tt6&_nc_cat=111&ccb=1-7&_nc_sid=247b10&_nc_ohc=azfCRYsIeUMQ7kNvwGZmXcp&_nc_oc=AdrYIkopKXHPEEZazD1-Lmupbj-mFPKcmVAWcttXsHG4BXGTKFpWPu7PoTNvc8WgpWw&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=gRztmzhMazaseYE71lc5dQ&_nc_ss=792a8&oh=00_AQNP94sCNKK7FCeX3MEPI4aPqPlpfJSBZy… (424 chars)"
          },
          "id": "2379535206124103"
        },
        "id": "1425935622848350"
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667906865,
      "time_at_flush_ms": 1792667907108
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

The "Boost your listing" offer shown right after a listing is published (`CometMarketplaceBoostListingPostPublishNuxDialog.react`): by `listingID` it loads the listing and the account's Boost button state. In Bethlehem's publish (inspect 20261022T110738) it fired 15 s after Publish was clicked, once the page had moved to Selling.

## What our machine does with it

Nothing waits for it. Boosting turns the listing into a paid ad, so the `marketplaceListingPublish` flow never presses Promote (rule 41); its last step closes the dialog with Close. The listing is already created by `useCometMarketplaceListingCreateMutation` before this dialog loads.

## What can go wrong

None seen: one call, 200 in 594 ms. If it failed there would be no Boost dialog, and the flow's Close step would find nothing to close; the listing itself is unaffected.
