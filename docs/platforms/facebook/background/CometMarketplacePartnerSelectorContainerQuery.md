# CometMarketplacePartnerSelectorContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27690950030545801` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer....useCometMarketplacePartnerAutoOptInMutation_viewer`, `viewer.marketplace_settings` |
| Called from | `CometMarketplacePartnerSelectorContainer.react` |
| rea | `ev_50e521a88520c78fabaff28b3f6a9a9e16709d88bb7829a3cc3a8eaa71e481b7` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: click e191 | 1 | 200 | 1283 ms | 2969 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T110738_61594063207669**, step 4: click e191: 200, 1283 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplacePartnerSelectorContainerQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "27690950030545801"
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
        "is_partner_auto_opt_in_enabled": true,
        "should_show_partner_selector": false,
        "viewed_partner_ids": [
          "1629659441068862",
          "1240470891063721"
        ],
        "id": "TWFya2V0cGxhY2VTZXR0aW5nczo2MTU5NDA2MzIwNzY2OQ==",
        "qualifies_for_partner_selector": true
      },
      "marketplace_partnership_catalog_settings": [
        {
          "partnership_settings_id": "1240470891063721"
        },
        {
          "partnership_settings_id": "1629659441068862"
        }
      ]
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667424740,
      "time_at_flush_ms": 1792667424854
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Loads the account's partner-listing settings (`viewer.marketplace_settings`, the partner auto opt-in) for Marketplace's partner selector (`CometMarketplacePartnerSelectorContainer.react`). It appeared only while Bethlehem's Marketplace location was in Spain, after a bare zip picked Granada (step 4).

## What our machine does with it

Nothing reads it. It belongs to the `marketplacePartnerListings` page state, which only appears with a European location; with the location set as "City, State" written out (rule 68) Marketplace never shows it.

## What can go wrong

None seen: one call, 200 in 1283 ms. Nothing of ours depends on it.
