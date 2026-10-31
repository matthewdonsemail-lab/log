# useMarketplaceComposerAttributesQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | listingForm |
| Kind | query |
| doc_id | `24482075174793922` |
| Path | `/api/graphql/` |
| Sends | `categoryID` |
| Reads | `viewer.definitions` |
| Called from | `MarketplacePDPC2CAttributesComponent.react`, `useMarketplaceComposerAttributes` |
| rea | `ev_9f20c975b10f276f1dba103dc009881528dc011b0c4292d6d82a40791b31bf70` |

Seen 16 time(s) in 11 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 13: goto /marketplace/create/item | 3 | 200 | 350–414 ms | 2490–9489 ms | — |
| inspect | step 11: goto /marketplace/create/item | 1 | 200 | 369 ms | 2287 ms | — |
| inspect | scroll: container +87px in 3 steps | 1 | 200 | 1709 ms | 1077 ms | — |
| inspect | step 1: goto /marketplace/create/item | 2 | 200 | 425–545 ms | 5315–8980 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 382 ms | 2487 ms | — |
| flow | step 3: goto /marketplace/create/item | 3 | 200 | 359–500 ms | 2389–4380 ms | — |
| flow | scroll: container +87px in 3 steps | 1 | 200 | 640 ms | 953 ms | — |
| host | step 40: goto /marketplace/create/item | 1 | 200 | 510 ms | 7021 ms | — |
| host | setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9 | 1 | 200 | 500 ms | 656908 ms | — |
| host | step 12: goto /marketplace/create/item | 1 | 200 | 176 ms | 8320 ms | — |
| host | step 28: goto /marketplace/create/item | 1 | 200 | 171 ms | 1826 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, step 12: goto /marketplace/create/item: 200, 176 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useMarketplaceComposerAttributesQuery",
  "server_timestamps": "true",
  "variables": {
    "categoryID": null
  },
  "doc_id": "24482075174793922"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "definitions": []
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038087373,
      "time_at_flush_ms": 1793038087398
    },
    "is_final": true
  }
}
```

**runs/host/20261026T180628_61594285317994**, step 28: goto /marketplace/create/item: 200, 171 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useMarketplaceComposerAttributesQuery",
  "server_timestamps": "true",
  "variables": {
    "categoryID": null
  },
  "doc_id": "24482075174793922"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "definitions": []
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038278090,
      "time_at_flush_ms": 1793038278113
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Fetches the form's fields for a category (`categoryID` in, the field definitions out): it decides which inputs the create form shows. Fires when the form opens and again after a category is picked.

## What our machine does with it

The publish machine picks the category, then fills the fields it finds. The second sighting, after `Category: ...`, is Facebook redrawing the form for that category: the fields to fill exist only after it.

## What can go wrong

If the fields our machine looks for are missing, read this request's sighting first: no second sighting means the category pick did not register. The US form's fields have no Location (why `locationNotSet` reads the "Listed ... in X" preview instead).
