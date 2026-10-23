# MarketplaceCometPartnerListingDialogContentMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `29149244201389409` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `marketplace_settings_set_partner_selection.__typename` |
| Called from | `MarketplaceCometPartnerListingDialogContent.react` |
| rea | `ev_5b31db3e700fe377600ec4ca4c8eb028becb0ea4a81d55b5c76a2acc3954c44d` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: click e191 | 1 | 200 | 558 ms | 808 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T110738_61594063207669**, step 4: click e191: 200, 558 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceCometPartnerListingDialogContentMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "actor_id": "61594063207669",
      "client_mutation_id": "1",
      "selected_partner_ids": [
        "1240470891063721",
        "1629659441068862"
      ],
      "should_enable_auto_opt_in": true,
      "should_hide_organic_listings": false,
      "viewed_partner_ids": [
        "1240470891063721",
        "1629659441068862"
      ]
    }
  },
  "doc_id": "29149244201389409"
}
```

Answered:

```json
{
  "data": {
    "marketplace_settings_set_partner_selection": {
      "__typename": "MarketplaceSettingsSetPartnerSelectionResponsePayload"
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667422168,
      "time_at_flush_ms": 1792667422308
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Saves the account's choices on Marketplace's "Discover more when you shop" screen (`marketplace_settings_set_partner_selection`): which partner shops' listings appear in its Marketplace. It fired 0.8 s after Update was pressed on that screen (step 4), with every box as Facebook had ticked it.

## What our machine does with it

It is what pressing Update on the `marketplacePartnerListings` page state sends; that screen only appears while the account's location is in Europe (rule 68). Nothing of ours reads it.

## What can go wrong

None seen: one call, 200 in 558 ms. A failure would leave the screen up, and the state's resolver would press Update again.
