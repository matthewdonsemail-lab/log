# MarketplaceComposerAIPricingDialogImplSimilarListingsQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | listingForm |
| Kind | query |
| doc_id | `28373107865682771` |
| Path | `/api/graphql/` |
| Sends | `ai_suggested_condition`, `ai_suggested_price_cents`, `category_ids`, `composer_mode`, `limit`, `listing_title`, `pricing_attempt_id`, `pricing_source`, `session_id` |
| Reads | — |
| Called from | — |
| rea | `ev_a60b29dd39f9845fa773f6bcea083bd82d632d73e635b10861713226edadb094` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | scroll: container +87px in 3 steps | 1 | 200 | 1461 ms | 1069 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T110738_61594063207669**, scroll: container +87px in 3 steps: 200, 1461 ms

Sent:

```json
{
  "qpl_active_flow_ids": "138820675",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceComposerAIPricingDialogImplSimilarListingsQuery",
  "server_timestamps": "true",
  "variables": {
    "ai_suggested_condition": null,
    "ai_suggested_price_cents": null,
    "category_ids": [
      "895487550471874"
    ],
    "composer_mode": "create",
    "limit": 10,
    "listing_title": "Junk Removal & Cleanouts: Houses, Garages, Basements",
    "pricing_attempt_id": "230dead1-5a56-4448-bf15-82d8f6cbdbe0",
    "pricing_source": "ONE_CLICK_LISTING",
    "session_id": null
  },
  "doc_id": "28373107865682771",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=138820675"
  ]
}
```

Answered:

```json
{
  "data": {
    "xfb_marketplace_ai_listing_creation_similar_listings": [],
    "xfb_marketplace_ai_listing_creation_sold_listings_data": null
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667746836,
      "time_at_flush_ms": 1792667746880
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

The listing form's price suggestion: with the title, the category, the condition and the suggested price, it asks for similar listings to compare against (`MarketplaceComposerAIPricingDialogImpl`). It fired 1 s after the Category was chosen in Bethlehem's publish (step 19).

## What our machine does with it

Nothing reads it. The flow types its own price (`{price}`) and never opens the pricing suggestion.

## What can go wrong

None seen: one call, 200 in 1461 ms. A failure would only hide the suggestion; the price typed is unaffected.
