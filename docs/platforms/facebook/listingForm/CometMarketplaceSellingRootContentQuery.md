# CometMarketplaceSellingRootContentQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | listingForm |
| Kind | query |
| doc_id | `28536703559357267` |
| Path | `/api/graphql/` |
| Sends | `includeSellerCompliance`, `scale` |
| Reads | `viewer....MarketplaceCometFeatureAccessProvider_viewer`, `viewer....MarketplaceYourAccountLeftRail_viewer`, `viewer....useYouSubNavConfig_viewer`, `viewer....useCometMarketplaceSellingRootHeader_viewer` |
| Called from | `CometMarketplaceSellingRootContent.react` |
| rea | `ev_a8fc692ec81fda7e31eaa01f9cb8f5fedf563c1195f890aaccc01e8a4d29106e` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 452 ms | 494386 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T155857_61594063207669**, step 3: goto /marketplace/inbox: 200, 452 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceSellingRootContentQuery",
  "server_timestamps": "true",
  "variables": {
    "includeSellerCompliance": true,
    "scale": 1
  },
  "doc_id": "28536703559357267"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_age_verification_banner": null,
      "marketplace_feature_access_status": {
        "checkout_on_marketplace": "ELIGIBLE",
        "comment_on_bsg_listing": "ELIGIBLE",
        "comment_on_marketplace_listing": "ELIGIBLE",
        "message_seller_on_marketplace": "ELIGIBLE",
        "react_on_bsg_listing": "ELIGIBLE",
        "react_on_marketplace_listing": "ELIGIBLE",
        "see_seller_surfaces": "ELIGIBLE",
        "sell_on_marketplace": "ELIGIBLE",
        "view_seller_on_marketplace": "ELIGIBLE"
      },
      "order_management": {
        "is_carrier_scan_based_tracking_enabled": false
      },
      "c2c_shipped_access": {
        "can_see_shipped_orders": "(1 fields)",
        "id": "c2c_shipped_access_checker:61594063207669",
        "can_see_shipped_payouts": "(1 fields)"
      },
      "is_above_tpv_limit_override": false,
      "commerce_merchant_settings": null,
      "marketplace_settings": {
        "current_marketplace": "(3 fields)",
        "id": "TWFya2V0cGxhY2VTZXR0aW5nczo2MTU5NDA2MzIwNzY2OQ==",
        "seller_mode_enabled": false
      },
      "marketplace_nux_states": {
        "mp_your_payouts_name_nux": "VISIBLE",
        "mp_seller_mode_browse_nux": "VISIBLE",
        "mp_seller_mode_settings_nux": "VISIBLE",
        "mp_seller_mode_tab_nux": "VISIBLE",
        "mp_seller_mode_return_nux": "VISIBLE",
        "mp_seller_announcement_center_nux": "NOT_VISIBLE",
        "marketplace_bulk_upload_entrypoint_nux": "VISIBLE"
      },
      "marketplace_c2c_shipping_seller": {
        "should_use_your_payouts_name": false,
        "is_shipped_payment_on_file_required": false,
        "add_payment_method_url": "https://accountscenter.facebook.com/meta_pay_wallet/?tab=manage",
        "commerce_merchant_settings": null
      },
      "actor": {
        "__typename": "User",
        "__isActor": "User",
        "id": "61594063207669",
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
        "marketplace_seller_eligible_for_bulk_upload": false
      },
      "cms": null,
      "marketplace_seller_announcements": {
        "count": 0
      },
      "is_marketplace_pulse_enabled": false,
      "marketplace_inventory_refinements": {
        "filters": "(4 items)"
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792685352088,
      "time_at_flush_ms": 1792685352138
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

The Selling area's frame: the left rail (`MarketplaceYourAccountLeftRail`), its sub-navigation and header, the account's Marketplace feature access (`MarketplaceCometFeatureAccessProvider`) and, with `includeSellerCompliance`, the seller-compliance state. It fires when a Selling page is opened in the browser (here while the inbox step was open, 8 minutes in).

## What our machine does with it

Nothing reads it yet. Whether the account may sell is read from `/marketplace/status` (`CometMarketplaceStatusContentContainerQuery`), which says it directly; this query's feature access could back it up if that page ever fails to load.

## What can go wrong

Seen only with 200. A missing or failed answer would leave the Selling frame empty, and the listings query beside it is what the check depends on.
