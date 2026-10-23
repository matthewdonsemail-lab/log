# useListingShippableEligibilityCheckQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | listingForm |
| Kind | query |
| doc_id | `9589653544404234` |
| Path | `/api/graphql/` |
| Sends | `params` |
| Reads | `isListingEligibleForShipping` |
| Called from | `useListingShippableEligibilityCheck` |
| rea | `ev_2268109b78d0872eb0a55170e823376ab0a90f53109df20c59492cda9ce542b7` |

Seen 34 time(s) in 12 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Category: Miscellaneous | 11 | 200 | 306–379 ms | 4402–6091 ms | — |
| publish | Uploading 5 photo(s) | 18 | 200 | 326–397 ms | 5483–10056 ms | — |
| publish | Uploading 2 photo(s) | 4 | 200 | 319–333 ms | 4295–4779 ms | — |
| inspect | scroll: container +87px in 3 steps | 1 | 200 | 1668 ms | 1104 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T110738_61594063207669**, scroll: container +87px in 3 steps: 200, 1668 ms

Sent:

```json
{
  "qpl_active_flow_ids": "138820675",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useListingShippableEligibilityCheckQuery",
  "server_timestamps": "true",
  "variables": {
    "params": {
      "category_id": "895487550471874",
      "item_price": {
        "currency": "USD",
        "price": "99"
      },
      "title": ""
    }
  },
  "doc_id": "9589653544404234",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=138820675"
  ]
}
```

Answered:

```json
{
  "data": {
    "isListingEligibleForShipping": false
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667747064,
      "time_at_flush_ms": 1792667747103
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Asks whether the listing can be shipped (`isListingEligibleForShipping`). Fires again after the category is picked and after each photo batch, 0.3 s each.

## What our machine does with it

Nothing waits for it. A rubbish-removal service is local pickup; shipping is never turned on.

## What can go wrong

Harmless. It firing after a category pick confirms Facebook took the category.
