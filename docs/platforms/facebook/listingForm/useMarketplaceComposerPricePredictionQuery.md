# useMarketplaceComposerPricePredictionQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | listingForm |
| Kind | query |
| doc_id | `9566914303429765` |
| Path | `/api/graphql/` |
| Sends | `params` |
| Reads | `marketplace_c2c_pricing.price_range` |
| Called from | `useMarketplaceComposerPricePrediction` |
| rea | `ev_e0d48b4c63f6347e0b108720f3b175a44c57110e43d648bf8fbb7d94c4d2e334` |

Seen 18 time(s) in 16 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Uploading 5 photo(s) | 9 | 200 | 303–577 ms | 5443–9787 ms | — |
| publish | Uploading 2 photo(s) | 2 | 200 | 311–312 ms | 6545–8172 ms | — |
| inspect | step 16: type e232 | 1 | 200 | 370 ms | 7263 ms | — |
| inspect | scroll: container +87px in 3 steps | 1 | 200 | 1663 ms | 1091 ms | — |
| inspect | step 10: type e232 | 1 | 200 | 380 ms | 6953 ms | — |
| flow | step 7: fillRole textbox "…" | 2 | 200 | 434–1622 ms | 7866–7867 ms | — |
| flow | scroll: container +87px in 3 steps | 1 | 200 | 659 ms | 963 ms | — |
| host | setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9 | 1 | 200 | 1622 ms | 707185 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T110738_61594063207669**, step 16: type e232: 200, 370 ms

Sent:

```json
{
  "qpl_active_flow_ids": "138820675",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useMarketplaceComposerPricePredictionQuery",
  "server_timestamps": "true",
  "variables": {
    "params": {
      "category_id": "1583634935226685",
      "currency": "USD",
      "photo_id": "122127505023468773",
      "title": "Junk Removal & Cleanouts: Houses, Garages, Basements"
    }
  },
  "doc_id": "9566914303429765",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=138820675"
  ]
}
```

Answered:

```json
{
  "data": {
    "marketplace_c2c_pricing": {
      "price_range": null
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667670444,
      "time_at_flush_ms": 1792667670470
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T110738_61594063207669**, scroll: container +87px in 3 steps: 200, 1663 ms

Sent:

```json
{
  "qpl_active_flow_ids": "138820675",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useMarketplaceComposerPricePredictionQuery",
  "server_timestamps": "true",
  "variables": {
    "params": {
      "category_id": "895487550471874",
      "currency": "USD",
      "photo_id": "122127505023468773",
      "title": "Junk Removal & Cleanouts: Houses, Garages, Basements"
    }
  },
  "doc_id": "9566914303429765",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=138820675"
  ]
}
```

Answered:

```json
{
  "data": {
    "marketplace_c2c_pricing": {
      "price_range": null
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667747051,
      "time_at_flush_ms": 1792667747084
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T105341_61594063207669**, step 10: type e232: 200, 380 ms

Sent:

```json
{
  "qpl_active_flow_ids": "138820675",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useMarketplaceComposerPricePredictionQuery",
  "server_timestamps": "true",
  "variables": {
    "params": {
      "category_id": "1583634935226685",
      "currency": "ILS",
      "photo_id": "122127497595468773",
      "title": "Junk Removal & Cleanouts: Houses, Garages, Basements"
    }
  },
  "doc_id": "9566914303429765",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=138820675"
  ]
}
```

Answered:

```json
{
  "data": {
    "marketplace_c2c_pricing": {
      "price_range": null
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792666664376,
      "time_at_flush_ms": 1792666664405
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Asks Facebook's price suggestion for the listing (`marketplace_c2c_pricing.price_range`). Fires after the photos upload, 5-8 s into the step.

## What our machine does with it

Nothing. The price comes from the listing in Twenty.

## What can go wrong

Harmless. It firing means Facebook has read the uploaded photos (it follows `useSherlockPhotoPredictionMutation`).
