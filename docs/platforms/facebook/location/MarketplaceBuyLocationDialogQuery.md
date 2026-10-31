# MarketplaceBuyLocationDialogQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | location |
| Kind | query |
| doc_id | `27586196974346486` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer.marketplace_settings` |
| Called from | `MarketplaceBuyLocationDialog.react` |
| rea | `ev_e520c158b16f2e0fd7639487699f3f243eb4486a4d45996737d74e06c5ffce85` |

Seen 10 time(s) in 8 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: click e236 | 1 | 200 | 361 ms | 1017 ms | — |
| inspect | step 5: setLocation Bethlehem, Pennsylvania | 1 | 200 | 452 ms | 5727 ms | — |
| inspect | step 4: setLocation Bethlehem, PA | 1 | 200 | 1200 ms | 7428 ms | — |
| inspect | step 13: setLocation 18015 | 1 | 200 | 377 ms | 7904 ms | — |
| flow | step 2: setLocation Mountain Top, Pennsylvania | 3 | 200 | 415–2321 ms | 6539–9184 ms | — |
| host | step 42: setLocation Mountain Top, Pennsylvania | 1 | 200 | 426 ms | 7747 ms | — |
| host | setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9 | 1 | 200 | 415 ms | 632252 ms | — |
| host | step 14: setLocation Kamloops, British Columbia | 1 | 200 | 173 ms | 8523 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, step 14: setLocation Kamloops, British Columbia: 200, 173 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceBuyLocationDialogQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "27586196974346486"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_settings": {
        "current_marketplace": {
          "__typename": "Marketplace",
          "is_metric_base": true,
          "id": "1759579680997030"
        },
        "id": "TWFya2V0cGxhY2VTZXR0aW5nczo2MTU5NDI4NTMxNzk5NA=="
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038107283,
      "time_at_flush_ms": 1793038107313
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Loads the Change location dialog: the current location, radius and map.

## What our machine does with it

Opened by the "Location: <city>, Within <n> mi" button in `set_marketplace_location`; the button's name says where the account is now.

## What can go wrong

Harmless.
