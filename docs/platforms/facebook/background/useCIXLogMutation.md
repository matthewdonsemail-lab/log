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
| rea | `ev_861b046d2fca8f66f0fb54a8cbcb72051f984ac968338f63fa57bbc89194bb2d` |

Seen 12 time(s) in 6 run(s).

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

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/warmup/20261023T074930_61594063207669**, scroll: +213px in 7 wheel steps, 453 ms: 200, 445 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useCIXLogMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "frx": {
        "context": "{\"session_id\":\"adffeb56-4cac-4a66-b463-dc2a9d952d19\",\"type\":2,\"story_location\":\"marketplace_pdp\",\"entry_point\":\"report_button\",\"reportable_ent_token\":\"27743469221988791\"}",
        "frx_menu_item_loaded": null,
        "product_attribution": "CometMarketplacePermalinkRoot.react,comet.marketplace.item,unexpected,1792742061111,904453,1606854132932955,,;CometMarketplaceHomeRoot.react,comet.marketplace.home,via_cold_start,1792742007074,832974,1606854132932955,494,1749699906261391"
      },
      "actor_id": "61594063207669",
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
      "request_start_time_ms": 1792742065852,
      "time_at_flush_ms": 1792742065904
    },
    "is_final": true
  }
}
```

**runs/warmup/20261023T074930_61594063207669**, scroll: -1034px in 22 wheel steps, 1032 ms: 200, 384 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useCIXLogMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "frx": {
        "context": "{\"session_id\":\"d4362e68-8642-4c20-894a-0cfc7a92525d\",\"type\":2,\"story_location\":\"marketplace_pdp\",\"entry_point\":\"report_button\",\"reportable_ent_token\":\"28849178441364999\"}",
        "frx_menu_item_loaded": null,
        "product_attribution": "CometMarketplacePermalinkRoot.react,comet.marketplace.item,unexpected,1792742072683,373102,1606854132932955,,;CometMarketplaceHomeRoot.react,comet.marketplace.home,via_cold_start,1792742007074,832974,1606854132932955,494,1098292579663100"
      },
      "actor_id": "61594063207669",
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
      "request_start_time_ms": 1792742074008,
      "time_at_flush_ms": 1792742074054
    },
    "is_final": true
  }
}
```

**runs/warmup/20261023T074930_61594063207669**, scroll: +981px in 24 wheel steps, 1672 ms: 200, 392 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useCIXLogMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "frx": {
        "context": "{\"session_id\":\"5d0d97ca-9b93-4243-bb01-56693cf1b52b\",\"type\":2,\"story_location\":\"marketplace_pdp\",\"entry_point\":\"report_button\",\"reportable_ent_token\":\"28993031653624601\"}",
        "frx_menu_item_loaded": null,
        "product_attribution": "CometMarketplacePermalinkRoot.react,comet.marketplace.item,unexpected,1792742085256,781319,1606854132932955,,;CometMarketplaceHomeRoot.react,comet.marketplace.home,via_cold_start,1792742007074,832974,1606854132932955,494,2064512760864293"
      },
      "actor_id": "61594063207669",
      "client_mutation_id": "7"
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
      "request_start_time_ms": 1792742086778,
      "time_at_flush_ms": 1792742086838
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
