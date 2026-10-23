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
| rea | `ev_190cc31dd8ebb100eb1c5d6829ff3154e6d1cde4c23cc8b04ad55d17d251d311` |

Seen 4 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: click e236 | 1 | 200 | 361 ms | 1017 ms | — |
| inspect | step 5: setLocation Bethlehem, Pennsylvania | 1 | 200 | 452 ms | 5727 ms | — |
| inspect | step 4: setLocation Bethlehem, PA | 1 | 200 | 1200 ms | 7428 ms | — |
| inspect | step 13: setLocation 18015 | 1 | 200 | 377 ms | 7904 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T110738_61594063207669**, step 5: setLocation Bethlehem, Pennsylvania: 200, 452 ms

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
          "id": "815544551944570"
        },
        "id": "TWFya2V0cGxhY2VTZXR0aW5nczo2MTU5NDA2MzIwNzY2OQ=="
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667457442,
      "time_at_flush_ms": 1792667457479
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T105341_61594063207669**, step 4: setLocation Bethlehem, PA: 200, 1200 ms

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
          "is_metric_base": false,
          "id": "1663689853903557"
        },
        "id": "TWFya2V0cGxhY2VTZXR0aW5nczo2MTU5NDA2MzIwNzY2OQ=="
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792666523263,
      "time_at_flush_ms": 1792666523291
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T105341_61594063207669**, step 13: setLocation 18015: 200, 377 ms

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
          "id": "431364634888083"
        },
        "id": "TWFya2V0cGxhY2VTZXR0aW5nczo2MTU5NDA2MzIwNzY2OQ=="
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792666799521,
      "time_at_flush_ms": 1792666799548
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
