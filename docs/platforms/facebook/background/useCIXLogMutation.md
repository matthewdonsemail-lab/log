# useCIXLogMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `24438951589125380` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `cix_log.__typename` |
| Called from | `useCIXLogMutation` |
| rea | `ev_0ca36e9f0272f54d6efc377d69610c37c2f02cb2d73b8dde56b76160adbc8ead` |

Seen 14 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | scroll: +127px in 4 wheel steps, 125 ms | 1 | 200 | 359 ms | 4540 ms | — |
| warmup | scroll: -605px in 14 wheel steps, 687 ms | 1 | 200 | 379 ms | 2410 ms | — |
| warmup | scroll: +459px in 11 wheel steps, 500 ms | 1 | 200 | 368 ms | 1144 ms | — |
| warmup | openAny: read /marketplace/item/<id>/ | 1 | 200 | 375 ms | 4240 ms | — |
| warmup | scroll: -756px in 16 wheel steps, 656 ms | 1 | 200 | 383 ms | 1781 ms | — |
| inspect | step 22: clickRole button "…" | 1 | 200 | 583 ms | 3161 ms | — |
| inspect | scroll: -577px in 13 wheel steps, 859 ms | 1 | 200 | 503 ms | 3589 ms | — |
| inspect | scroll: +978px in 22 wheel steps, 1531 ms | 1 | 200 | 468 ms | 1992 ms | — |
| inspect | step 25: openAny 1-3 x /marketplace/item/ | 1 | 200 | 486 ms | 4053 ms | — |
| warmup | scroll: +213px in 7 wheel steps, 453 ms | 1 | 200 | 445 ms | 290 ms | — |
| warmup | scroll: -1034px in 22 wheel steps, 1032 ms | 1 | 200 | 384 ms | 1573 ms | — |
| warmup | scroll: +981px in 24 wheel steps, 1672 ms | 1 | 200 | 392 ms | 3051 ms | — |
| host | scroll: -553px in 12 wheel steps, 499 ms | 1 | 200 | 194 ms | 1144 ms | — |
| host | scroll: +617px in 15 wheel steps, 789 ms | 1 | 200 | 172 ms | 1220 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, scroll: -553px in 12 wheel steps, 499 ms: 200, 194 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useCIXLogMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "frx": {
        "context": "{\"session_id\":\"a3c99675-e371-4f34-9bbe-c54b4e7989b5\",\"type\":2,\"story_location\":\"marketplace_pdp\",\"entry_point\":\"report_button\",\"reportable_ent_token\":\"29987156274207440\"}",
        "frx_menu_item_loaded": null,
        "product_attribution": "CometMarketplacePermalinkRoot.react,comet.marketplace.item,unexpected,1793038230014,797264,1606854132932955,,;CometMarketplaceHomeRoot.react,comet.marketplace.home,via_cold_start,1793038198638,353894,1606854132932955,494,1818774979262678"
      },
      "actor_id": "61594285317994",
      "client_mutation_id": "1"
    }
  },
  "doc_id": "24438951589125380"
}
```

Answered:

```json
{
  "data": {
    "cix_log": {
      "__typename": "CIXLoggerOutput"
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038229438,
      "time_at_flush_ms": 1793038229468
    },
    "is_final": true
  }
}
```

**runs/host/20261026T180628_61594285317994**, scroll: +617px in 15 wheel steps, 789 ms: 200, 172 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useCIXLogMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "frx": {
        "context": "{\"session_id\":\"b3d92a3a-357f-4d8c-a7a1-1ac47fe02e73\",\"type\":2,\"story_location\":\"marketplace_pdp\",\"entry_point\":\"report_button\",\"reportable_ent_token\":\"29436407615976563\"}",
        "frx_menu_item_loaded": null,
        "product_attribution": "CometMarketplacePermalinkRoot.react,comet.marketplace.item,unexpected,1793038240744,92809,1606854132932955,,;CometMarketplaceHomeRoot.react,comet.marketplace.home,via_cold_start,1793038198638,353894,1606854132932955,494,2249546198922840"
      },
      "actor_id": "61594285317994",
      "client_mutation_id": "4"
    }
  },
  "doc_id": "24438951589125380"
}
```

Answered:

```json
{
  "data": {
    "cix_log": {
      "__typename": "CIXLoggerOutput"
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038240068,
      "time_at_flush_ms": 1793038240094
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

A logging call from Facebook's client: it sends `input` and reads only `cix_log.__typename`. It fired 3 times in 2 runs, 1.5-3.2 s into scrolls of the Marketplace browse feed, with `CometMarketplaceSetProductItemSeenStateMutation`.

## What our machine does with it

Nothing in our machines reads it; it comes with the feed warm-up's `scrollMarketplace`.

## What can go wrong

None seen: all three answered 200 in 468-503 ms. Nothing waits on it.
