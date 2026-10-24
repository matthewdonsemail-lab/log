# MarketplaceCometPartnerListingDialogContentQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27750985964534474` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer.marketplace_settings`, `viewer.marketplace_partnership_catalog_settings` |
| Called from | `MarketplaceCometPartnerListingDialogContent.react` |
| rea | `ev_ec43a216261f8ed2a312cd6ca3d434b4b1b3fe2271135a6ecaf365f19bef18d1` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: click e191 | 1 | 200 | 840 ms | 1371 ms | — |
| inspect | step 13: setLocation 18015 | 1 | 200 | 423 ms | 16425 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T110738_61594063207669**, step 4: click e191: 200, 840 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceCometPartnerListingDialogContentQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "27750985964534474"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_settings": {
        "selected_partner_ids": [
          "1629659441068862",
          "1240470891063721"
        ],
        "should_hide_organic_listings": false,
        "should_show_partner_selector": false,
        "is_partner_auto_opt_in_enabled": true,
        "viewed_partner_ids": [
          "1629659441068862",
          "1240470891063721"
        ],
        "id": "TWFya2V0cGxhY2VTZXR0aW5nczo2MTU5NDA2MzIwNzY2OQ=="
      },
      "marketplace_partnership_catalog_settings": [
        {
          "display_name": "buycycle-es",
          "partnership_settings_id": "1240470891063721",
          "catalog_status": "LIVE",
          "partner_logo_url": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/316533383_505688224948226_1676972430895592491_n.jpg (433 chars)",
          "is_downstream_enabled": true
        },
        {
          "display_name": "Catawiki",
          "partnership_settings_id": "1629659441068862",
          "catalog_status": "LIVE",
          "partner_logo_url": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/492831975_122130561776785943_7058135208485371260_n.jpg (436 chars)",
          "is_downstream_enabled": true
        }
      ]
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667422906,
      "time_at_flush_ms": 1792667423192
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T105341_61594063207669**, step 13: setLocation 18015: 200, 423 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceCometPartnerListingDialogContentQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "27750985964534474"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_settings": {
        "selected_partner_ids": [],
        "should_hide_organic_listings": false,
        "should_show_partner_selector": true,
        "is_partner_auto_opt_in_enabled": false,
        "viewed_partner_ids": [],
        "id": "TWFya2V0cGxhY2VTZXR0aW5nczo2MTU5NDA2MzIwNzY2OQ=="
      },
      "marketplace_partnership_catalog_settings": [
        {
          "display_name": "buycycle-es",
          "partnership_settings_id": "1240470891063721",
          "catalog_status": "LIVE",
          "partner_logo_url": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/316533383_505688224948226_1676972430895592491_n.jpg (431 chars)",
          "is_downstream_enabled": true
        },
        {
          "display_name": "Catawiki",
          "partnership_settings_id": "1629659441068862",
          "catalog_status": "LIVE",
          "partner_logo_url": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/492831975_122130561776785943_7058135208485371260_n.jpg (436 chars)",
          "is_downstream_enabled": true
        }
      ]
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792666808049,
      "time_at_flush_ms": 1792666808121
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Loads the "Discover more when you shop" screen: the account's Marketplace settings and its partner catalog choices (`marketplace_partnership_catalog_settings`). It fired when that screen came up (step 13, after the zip set the location to Granada) and again as Update was pressed (step 4).

## What our machine does with it

It marks the `marketplacePartnerListings` page state from the network side, as the screen's text does from the page side. Nothing waits for it.

## What can go wrong

None seen: two calls, 200 in 423-840 ms. Nothing of ours depends on it.
