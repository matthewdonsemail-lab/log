# CometMarketplaceSetProductItemSeenStateMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `9680593255390206` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `marketplace_set_product_item_seen_state.product_item` |
| Called from | `CometMarketplaceSetProductItemSeenStateMutation` |
| rea | `ev_d3844ff3ba89d42ce8912082c4735babb8314eb664819e8300eecce66eb73b01` |

Seen 10 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | scroll: +127px in 4 wheel steps, 125 ms | 1 | 200 | 800 ms | 4549 ms | — |
| warmup | scroll: -605px in 14 wheel steps, 687 ms | 1 | 200 | 868 ms | 2415 ms | — |
| warmup | scroll: +459px in 11 wheel steps, 500 ms | 1 | 200 | 1025 ms | 1149 ms | — |
| warmup | openAny: read /marketplace/item/<id>/ | 1 | 200 | 824 ms | 4243 ms | — |
| warmup | scroll: -756px in 16 wheel steps, 656 ms | 1 | 200 | 902 ms | 1785 ms | — |
| inspect | scroll: -577px in 13 wheel steps, 859 ms | 1 | 200 | 1029 ms | 3592 ms | — |
| inspect | scroll: +978px in 22 wheel steps, 1531 ms | 1 | 200 | 652 ms | 1996 ms | — |
| inspect | step 25: openAny 1-3 x /marketplace/item/ | 1 | 200 | 915 ms | 4060 ms | — |
| inspect | scroll: +161px in 5 wheel steps, 250 ms | 1 | 200 | 740 ms | 3443 ms | — |
| inspect | scroll: -161px in 5 wheel steps, 172 ms | 1 | 200 | 1264 ms | 1430 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T045453_61594063207669**, scroll: +161px in 5 wheel steps, 250 ms: 200, 740 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceSetProductItemSeenStateMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "has_seen": true,
      "product_item_id": "39887208997530861",
      "actor_id": "61594063207669",
      "client_mutation_id": "1"
    }
  },
  "doc_id": "9680593255390206"
}
```

Answered:

```json
{
  "data": {
    "marketplace_set_product_item_seen_state": {
      "product_item": null
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792731490393,
      "time_at_flush_ms": 1792731490791
    },
    "is_final": true
  }
}
```

**runs/inspect/20261023T045453_61594063207669**, scroll: -161px in 5 wheel steps, 172 ms: 200, 1264 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceSetProductItemSeenStateMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "has_seen": true,
      "product_item_id": "28549509658039213",
      "actor_id": "61594063207669",
      "client_mutation_id": "3"
    }
  },
  "doc_id": "9680593255390206"
}
```

Answered:

```json
{
  "data": {
    "marketplace_set_product_item_seen_state": {
      "product_item": null
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792731499387,
      "time_at_flush_ms": 1792731499877
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Marks Marketplace items as seen by the viewer: it sends `input` and reads `marketplace_set_product_item_seen_state.product_item`. It fired during scrolls of the Marketplace browse feed (steps 24 and 36, `scroll 1 x 400`, and a 978 px scroll), 1.5-3.2 s after the scroll began, as listings came into view.

## What our machine does with it

The feed warm-up's `scrollMarketplace` step (one scroll of 400-800 px) brings listings into view and makes the client send it. The machine does not wait for or read it; the scroll step passes on its own movement.

## What can go wrong

None seen: all three answered 200 in 652-1029 ms. Nothing waits on it, so a failure would not stop the run.
