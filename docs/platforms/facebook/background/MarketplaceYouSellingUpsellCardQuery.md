# MarketplaceYouSellingUpsellCardQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `9626969840719635` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer....MarketplaceYouSellingUpsellCard_viewer` |
| Called from | `MarketplaceYouSellingUpsellCard.react` |
| rea | `ev_00977e2ab70ca12a60a74cc135fd797089c7b462f9a8434a2065fcc5480f693a` |

Seen 14 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Marketplace location: Reading 19601 US | 1 | 200 | 2247 ms | 37650 ms | — |
| inspect | step 25: click e1241 | 1 | 200 | 800 ms | 15204 ms | — |
| inspect | step 4: goto /marketplace/you/selling | 2 | 200 | 442–460 ms | 4339–4602 ms | — |
| inspect | step 7: goto /marketplace/you/selling | 1 | 200 | 797 ms | 1919 ms | — |
| inspect | step 10: goto /marketplace/you/selling | 1 | 200 | 579 ms | 1845 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 2 | 200 | 713–769 ms | 3188–3423 ms | — |
| inspect | step 3: goto /marketplace/inbox | 3 | 200 | 368–711 ms | 65288–1343361 ms | — |
| inspect | step 3: goto /marketplace/you/selling | 1 | 200 | 1382 ms | 1687 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 1182 ms | 1644 ms | — |
| inspect | step 6: goto /marketplace/inbox | 1 | 200 | 669 ms | 1503917 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T045453_61594063207669**, step 4: goto /marketplace/you/selling: 200, 460 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceYouSellingUpsellCardQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "9626969840719635"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_uim_upsell_card": {
        "card_type": "PROJECT_HAVEN_SELLER_TRUST_UPSELL",
        "c2c_shipping_incentive_campaign_id": null,
        "body": "Marking items as sold reduces unwanted messages and ensures transparency for potential buyers.",
        "header": "Keep your listings up to date",
        "icon_name": "shield",
        "primary_button_text": "Learn more",
        "primary_button_uri": "https://www.facebook.com/help/1156544111079919?helpref=about_content",
        "secondary_button_text": null,
        "secondary_button_uri": null,
        "is_primary_button": true,
        "is_deemphasized_button": false,
        "ui_components": {
          "component_name": "UIM_UPSELL_CARD_PROJECT_HAVEN_SELLER_TRUST_UPSELL",
          "xout_component": "UIM_UPSELL_CARD_PROJECT_HAVEN_SELLER_TRUST_UPSELL_XOUT"
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792731562021,
      "time_at_flush_ms": 1792731562102
    },
    "is_final": true
  }
}
```

**runs/inspect/20261023T000744_61594063207669**, step 2: goto /marketplace/you/selling: 200, 713 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceYouSellingUpsellCardQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "9626969840719635"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_uim_upsell_card": {
        "card_type": "PROJECT_HAVEN_SELLER_TRUST_UPSELL",
        "c2c_shipping_incentive_campaign_id": null,
        "body": "Marking items as sold reduces unwanted messages and ensures transparency for potential buyers.",
        "header": "Keep your listings up to date",
        "icon_name": "shield",
        "primary_button_text": "Learn more",
        "primary_button_uri": "https://www.facebook.com/help/1156544111079919?helpref=about_content",
        "secondary_button_text": null,
        "secondary_button_uri": null,
        "is_primary_button": true,
        "is_deemphasized_button": false,
        "ui_components": {
          "component_name": "UIM_UPSELL_CARD_PROJECT_HAVEN_SELLER_TRUST_UPSELL",
          "xout_component": "UIM_UPSELL_CARD_PROJECT_HAVEN_SELLER_TRUST_UPSELL_XOUT"
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792714113181,
      "time_at_flush_ms": 1792714113278
    },
    "is_final": true
  }
}
```

**runs/inspect/20261023T000744_61594063207669**, step 3: goto /marketplace/inbox: 200, 368 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceYouSellingUpsellCardQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "9626969840719635"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_uim_upsell_card": {
        "card_type": "PROJECT_HAVEN_SELLER_TRUST_UPSELL",
        "c2c_shipping_incentive_campaign_id": null,
        "body": "Marking items as sold reduces unwanted messages and ensures transparency for potential buyers.",
        "header": "Keep your listings up to date",
        "icon_name": "shield",
        "primary_button_text": "Learn more",
        "primary_button_uri": "https://www.facebook.com/help/1156544111079919?helpref=about_content",
        "secondary_button_text": null,
        "secondary_button_uri": null,
        "is_primary_button": true,
        "is_deemphasized_button": false,
        "ui_components": {
          "component_name": "UIM_UPSELL_CARD_PROJECT_HAVEN_SELLER_TRUST_UPSELL",
          "xout_component": "UIM_UPSELL_CARD_PROJECT_HAVEN_SELLER_TRUST_UPSELL_XOUT"
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792714196312,
      "time_at_flush_ms": 1792714196358
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

A promotional card on Marketplace > Selling (boost a listing, sell more).

## What our machine does with it

Nothing; it loads with the Selling page, which publish reads after Publish for the listing's review state.

## What can go wrong

Harmless.
