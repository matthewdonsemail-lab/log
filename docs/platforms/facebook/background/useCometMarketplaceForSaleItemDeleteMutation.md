# useCometMarketplaceForSaleItemDeleteMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `30073389588942699` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `commerce_for_sale_item_delete.deleted_for_sale_item_id`, `commerce_for_sale_item_delete.viewer` |
| Called from | `useCometMarketplaceForSaleItemDeleteMutation` |
| rea | `ev_5dd7bf6f94f8fe929eed7e9e090b91f7765b7fa77d275863734a42a43b68d6e7` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e537 | 1 | 200 | 1115 ms | 1981 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T173652_61594063207669**, step 5: click e537: 200, 1115 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useCometMarketplaceForSaleItemDeleteMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "actor_id": "61594063207669",
      "client_mutation_id": "1",
      "batch_delete_variants": true,
      "for_sale_item_id": "1425935622848350",
      "referral_surface": null,
      "surface": "MARKETPLACE_PAGE_SELLING"
    }
  },
  "doc_id": "30073389588942699"
}
```

Answered:

```json
{
  "data": {
    "commerce_for_sale_item_delete": {
      "deleted_for_sale_item_id": "1425935622848350",
      "viewer": {
        "items": {
          "count_up_to": 0
        },
        "inactive_sets": {
          "is_empty": true
        },
        "active_sets": {
          "is_empty": true
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792777167555,
      "time_at_flush_ms": 1792777168317
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Deletes the listing: sent `input.for_sale_item_id` (the listing), `batch_delete_variants: true`, `surface: MARKETPLACE_PAGE_SELLING` and the `actor_id`; answered `data.commerce_for_sale_item_delete.deleted_for_sale_item_id` and the seller's remaining items (`items.count_up_to`, active and inactive sets). Fires on the dialog's Delete button, about 1.1 s. Bethlehem 2026-10-23: deleted 1425935622848350, 0 items left.

## What our machine does with it

`marketplaceListingDelete` step `s04_clickDelete` waits for it and its answer decides the step (rule 73): `deleted_for_sale_item_id` must equal the `listingId` given and what we sent as `variables.input.for_sale_item_id`. Only then does `log facebook listing remove` set the Twenty row REMOVED.

## What can go wrong

Seen with 200 only. An answer without that id, or an error, fails the step with `answerNotAsExpected` and the Twenty row is left as it was, to be checked on Selling by hand. Never retried: a second press would act on whatever card is next.
