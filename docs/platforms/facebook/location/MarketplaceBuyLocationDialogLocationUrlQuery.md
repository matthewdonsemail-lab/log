# MarketplaceBuyLocationDialogLocationUrlQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | location |
| Kind | query |
| doc_id | `9608405655935574` |
| Path | `/api/graphql/` |
| Sends | `buy_location` |
| Reads | `viewer.marketplace_feed_stories` |
| Called from | `MarketplaceBuyLocationDialog.react` |
| rea | `ev_95fd7e537f088c38f953af153bb28049a8689cb17a5dcc928459c2a5b68a0a8a` |

Seen 9 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 15: click e1354 | 1 | 200 | 372 ms | 914 ms | — |
| inspect | step 10: click e1174 | 1 | 200 | 405 ms | 1108 ms | — |
| inspect | step 4: setLocation Bethlehem, PA | 1 | 200 | 412 ms | 17238 ms | — |
| inspect | step 13: setLocation 18015 | 1 | 200 | 434 ms | 14917 ms | — |
| flow | setLocation: 'Mountain Top, Pennsylvania' is suggestion 1 of 2 | 2 | 200 | 506–528 ms | 4500–6172 ms | — |
| host | setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9 | 2 | 200 | 506–588 ms | 4540–644230 ms | — |
| host | setLocation: 'Kamloops, British Columbia' is suggestion 1 of 9 | 1 | 200 | 190 ms | 3139 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, setLocation: 'Kamloops, British Columbia' is suggestion 1 of 9: 200, 190 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceBuyLocationDialogLocationUrlQuery",
  "server_timestamps": "true",
  "variables": {
    "buy_location": {
      "latitude": 50.6759,
      "longitude": -120.33898
    }
  },
  "doc_id": "9608405655935574"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_feed_stories": {
        "buy_location": {
          "marketplace_vanity_id": "114995818516099",
          "id": "114995818516099"
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038114701,
      "time_at_flush_ms": 1793038114747
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Resolves the place picked in the Change location dialog to its Marketplace page (`/marketplace/<placeId>/`, Reading's is 109847139034270).

## What our machine does with it

Nothing; it fires with the Apply click, just before `CometMarketplaceSetBuyLocationMutation`.

## What can go wrong

Harmless.
