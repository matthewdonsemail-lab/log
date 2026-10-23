# CometMarketplaceRootQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27968591542751515` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer....CometMarketplaceRootHeader_viewer`, `viewer....MarketplaceCometFeatureAccessProvider_viewer`, `viewer....useCometMarketplaceSellerModeNUX_viewer` |
| Called from | `CometMarketplaceRoot.react` |
| rea | `ev_bd94a8399994851d5028209cd924241238d6867ec8a1ad0c92070386341533ca` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: click e191 | 1 | 200 | 603 ms | 2962 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T110738_61594063207669**, step 4: click e191: 200, 603 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceRootQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "27968591542751515",
  "fb_api_analytics_tags": [
    "prefetch"
  ]
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_settings": {
        "seller_mode_enabled": false,
        "id": "TWFya2V0cGxhY2VTZXR0aW5nczo2MTU5NDA2MzIwNzY2OQ=="
      },
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
      "marketplace_nux_states": {
        "mp_seller_mode_browse_nux": "VISIBLE",
        "mp_seller_mode_settings_nux": "VISIBLE",
        "mp_seller_mode_tab_nux": "VISIBLE",
        "mp_seller_mode_return_nux": "VISIBLE"
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667424510,
      "time_at_flush_ms": 1792667424567
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Marketplace's root (`CometMarketplaceRoot.react`): the header, which Marketplace features the account can use (`MarketplaceCometFeatureAccessProvider`) and the seller-mode tour. It fired as Marketplace's home loaded (step 4).

## What our machine does with it

Nothing waits for it today. Its feature-access part is where an account's Marketplace access shows; the flows only wait for the page to land, and the Selling page is what the host checks (rule 35).

## What can go wrong

None seen: one call, 200 in 603 ms. A failure would break Marketplace's page; the flow's next step would then fail its page check and the run is read from its recording (rule 25).
