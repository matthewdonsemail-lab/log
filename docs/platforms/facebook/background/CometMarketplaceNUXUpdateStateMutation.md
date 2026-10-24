# CometMarketplaceNUXUpdateStateMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `23955024057437109` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `marketplace_nux_update_state.viewer` |
| Called from | `CometMarketplaceNUXUpdateStateMutation` |
| rea | `ev_9ecefa2a0620b4c94f8bf3f4a7190a2f64f6cb5b3a8dfa2dc1c6ebd3cedfea74` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 21: goto /marketplace/ | 1 | 200 | 439 ms | 47 ms | — |
| inspect | step 27: click e1541 | 1 | 200 | 455 ms | 918 ms | — |
| host | step 6: goto /marketplace/status | 1 | 200 | 643 ms | 47 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T110738_61594063207669**, step 27: click e1541: 200, 455 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceNUXUpdateStateMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "force_dismiss": true,
      "nux_type": "marketplace_boosted_listing_www_post_publish_nux",
      "actor_id": "61594063207669",
      "client_mutation_id": "1"
    }
  },
  "doc_id": "23955024057437109"
}
```

Answered:

```json
{
  "data": {
    "marketplace_nux_update_state": {
      "viewer": {
        "marketplace_nux_states": {
          "interested_button_www_nux_state": false,
          "item_comparison_nux_state": false,
          "item_comparison_add_more_nux_state": false,
          "welcome_banner_nux_state": false,
          "welcome_banner_www_nux_state": false,
          "save_share_pdp_revisit_nux_state": false,
          "social_friends_card_nux_state": false,
          "daily_deals_pdp_nux_www": "VISIBLE",
          "mbl_www_cta_nux_state": "VISIBLE",
          "mbl_www_selling_view_nux_state": "NOT_VISIBLE",
          "mbl_www_post_publish_nux_state": "NOT_VISIBLE",
          "mbl_lwi_create_comet_nux_state": "VISIBLE",
          "mbl_www_bsg_post_publish_nux_state": "VISIBLE",
          "mp_bj_comet_bulk_boosting_nux": "VISIBLE",
          "mp_bj_comet_post_create_upsell_nux": "VISIBLE",
          "mp_deals_nav_pill_comet_nux": "VISIBLE",
          "rentals_nearby_schools_nux": "VISIBLE",
          "mp_composer_media_mail_nux": "VISIBLE",
          "composer_variants_nux": "VISIBLE",
          "marketplace_bulk_boost_comet_nux": "VISIBLE",
          "marketplace_personalization_info_nux": "VISIBLE",
          "marketplace_bulk_upload_entrypoint_nux": "VISIBLE",
          "marketplace_shipped_misc_deprecated_composer_nux": "VISIBLE",
          "marketplace_ppv3_policy_change_nux": "NOT_VISIBLE",
          "marketplace_bl_cps_billing_nux": "VISIBLE",
          "mp_seller_mode_browse_nux": "VISIBLE",
          "mp_seller_mode_settings_nux": "VISIBLE",
          "mp_seller_mode_tab_nux": "VISIBLE",
          "mp_seller_mode_return_nux": "VISIBLE",
          "mp_seller_mode_first_time_nux": "VISIBLE",
          "mp_seller_announcement_center_nux": "NOT_VISIBLE",
          "mp_insights_of_trends_comet_nux": "VISIBLE"
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667969600,
      "time_at_flush_ms": 1792667969711
    },
    "is_final": true
  }
}
```

**runs/host/20261024T211541_61593939852820**, step 6: goto /marketplace/status: 200, 643 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceNUXUpdateStateMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "nux_type": "mp_seller_announcement_center_nux",
      "actor_id": "61593939852820",
      "client_mutation_id": "1"
    }
  },
  "doc_id": "23955024057437109"
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

Marks a Marketplace first-use tip as seen.

## What our machine does with it

Nothing.

## What can go wrong

Harmless; it shows the account is new to Marketplace.
