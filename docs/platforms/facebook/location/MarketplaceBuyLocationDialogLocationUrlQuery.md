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
| rea | `ev_5c223465994e732643e6aa87f33963fe75a82b42cccf211f8169746b5944c30b` |

Seen 4 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 15: click e1354 | 1 | 200 | 372 ms | 914 ms | — |
| inspect | step 10: click e1174 | 1 | 200 | 405 ms | 1108 ms | — |
| inspect | step 4: setLocation Bethlehem, PA | 1 | 200 | 412 ms | 17238 ms | — |
| inspect | step 13: setLocation 18015 | 1 | 200 | 434 ms | 14917 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T110738_61594063207669**, step 10: click e1174: 200, 405 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceBuyLocationDialogLocationUrlQuery",
  "server_timestamps": "true",
  "variables": {
    "buy_location": {
      "latitude": 40.6262,
      "longitude": -75.3757
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
          "marketplace_vanity_id": "112122412138421",
          "id": "112122412138421"
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667562812,
      "time_at_flush_ms": 1792667562854
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T105341_61594063207669**, step 4: setLocation Bethlehem, PA: 200, 412 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceBuyLocationDialogLocationUrlQuery",
  "server_timestamps": "true",
  "variables": {
    "buy_location": {
      "latitude": 31.7031,
      "longitude": 35.1956
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
          "marketplace_vanity_id": "101880973186304",
          "id": "101880973186304"
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792666532972,
      "time_at_flush_ms": 1792666532996
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T105341_61594063207669**, step 13: setLocation 18015: 200, 434 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceBuyLocationDialogLocationUrlQuery",
  "server_timestamps": "true",
  "variables": {
    "buy_location": {
      "latitude": 37.193232725035,
      "longitude": -3.6622435304279
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
          "marketplace_vanity_id": "108263972541612",
          "id": "108263972541612"
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792666806577,
      "time_at_flush_ms": 1792666806614
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
