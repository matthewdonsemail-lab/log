# useMarketplaceComposerBISNumberEligibilityRefetchQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | listingForm |
| Kind | query |
| doc_id | `39227039350213554` |
| Path | `/api/graphql/` |
| Sends | `category_id`, `has_prefetched_category` |
| Reads | `...useMarketplaceComposerBISNumberEligibility_query` |
| Called from | `useMarketplaceComposerBISNumberEligibility_query.graphql` |
| rea | `ev_fec186f3a53375a91c81f711b409c16734353c11d8cc3768dff99a3a16802b2a` |

Seen 12 time(s) in 12 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Category: Miscellaneous | 11 | 200 | 301–381 ms | 4384–6081 ms | — |
| inspect | scroll: container +87px in 3 steps | 1 | 200 | 1465 ms | 1094 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T110738_61594063207669**, scroll: container +87px in 3 steps: 200, 1465 ms

Sent:

```json
{
  "qpl_active_flow_ids": "138820675",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useMarketplaceComposerBISNumberEligibilityRefetchQuery",
  "server_timestamps": "true",
  "variables": {
    "category_id": "895487550471874",
    "has_prefetched_category": true
  },
  "doc_id": "39227039350213554",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=138820675"
  ]
}
```

Answered:

```json
{
  "data": {
    "bis_number_category": {
      "__typename": "GroupSellCategory",
      "id": "895487550471874",
      "if_viewer_can_add_bis_certification_number": null
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667746836,
      "time_at_flush_ms": 1792667746900
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

After the category is picked, asks whether the category needs a business registration number (BIS) from the seller (`category_id`, `has_prefetched_category`).

## What our machine does with it

Nothing today. Miscellaneous and Household have not needed one.

## What can go wrong

If a category ever needs a BIS number, the form gains a required field our machine does not fill, and Publish stays disabled. This request's answer is where that would show first.
