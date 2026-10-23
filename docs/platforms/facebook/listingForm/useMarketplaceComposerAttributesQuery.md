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
| Called from | `MarketplacePDPC2CAttributesComponent.react` |
| rea | `ev_23049485227d4ec91cc2c3b57b4b7da0f6322c73b1f8f951a6753ba37172d8cd` |

Seen 8 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 13: goto /marketplace/create/item | 2 | 200 | 350–375 ms | 2490–9489 ms | — |
| inspect | step 11: goto /marketplace/create/item | 1 | 200 | 369 ms | 2287 ms | — |
| inspect | scroll: container +87px in 3 steps | 1 | 200 | 1709 ms | 1077 ms | — |
| inspect | step 1: goto /marketplace/create/item | 2 | 200 | 425–545 ms | 5315–8980 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 382 ms | 2487 ms | — |
| flow | step 3: goto /marketplace/create/item | 1 | 200 | 359 ms | 2389 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T045453_61594063207669**, step 1: goto /marketplace/create/item: 200, 425 ms

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
      "request_start_time_ms": 1792731335861,
      "time_at_flush_ms": 1792731335889
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T110738_61594063207669**, step 11: goto /marketplace/create/item: 200, 369 ms

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
      "request_start_time_ms": 1792667593019,
      "time_at_flush_ms": 1792667593043
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T110738_61594063207669**, scroll: container +87px in 3 steps: 200, 1709 ms

Sent:

```json
{
  "qpl_active_flow_ids": "138820675",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useMarketplaceComposerAttributesQuery",
  "server_timestamps": "true",
  "variables": {
    "categoryID": "895487550471874"
  },
  "doc_id": "24482075174793922",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=138820675"
  ]
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "definitions": [
        {
          "attribute_id": "607316689733399",
          "attribute_name": "Condition",
          "input_type": "LIST",
          "is_required": true,
          "attribute_type": "CONDITION",
          "value_label_inputs": [
            {
              "label": "New",
              "value": "new",
              "value_id": "346439422568856"
            },
            {
              "label": "Used – like new",
              "value": "used_like_new",
              "value_id": "364889705262752"
            },
            {
              "label": "Used – good",
              "value": "used_good",
              "value_id": "4220858314666743"
            },
            {
              "label": "Used – fair",
              "value": "used_fair",
              "value_id": "271795561030190"
            }
          ],
          "sections": []
        }
      ]
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667747056,
      "time_at_flush_ms": 1792667747107
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
