# CometHomeContactChannelsContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `9934887189887478` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer....CometHomeContactChannels_viewer` |
| Called from | `CometHomeContactChannelsContainer.react` |
| rea | `ev_2b20cf591a095f7b9165ab97b7e2f350cb7e8c5253fad588365b692a046465d8` |

Seen 25 time(s) in 14 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 580 ms | 13569 ms | — |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 669 ms | 12038 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 748 ms | 7057 ms | — |
| warmup | step 11: goto /marketplace/ | 2 | 200 | 531–750 ms | 8610–15107 ms | — |
| warmup | step 17: goto /marketplace/ | 1 | 200 | 550 ms | 12047 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 494 ms | 1258006 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 381 ms | 5482 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 400 ms | 8256 ms | — |
| inspect | step 96: clickRole button "…" | 1 | 200 | 370 ms | 1305455 ms | — |
| inspect | step 4: snapshot | 1 | 200 | 714 ms | 346 ms | — |
| inspect | pin: typed the account's Messenger PIN | 1 | 200 | 617 ms | 560 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 598 ms | 6679 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 613 ms | 103692 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 1 | 200 | 503 ms | 5701 ms | — |
| inspect | step 4: goto /marketplace/inbox | 2 | 200 | 612–891 ms | 558522–564745 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 1431 ms | 59462 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 2500 ms | 11548 ms | — |
| inspect | step 6: goto /marketplace/inbox | 1 | 200 | 865 ms | 1708105 ms | — |
| inspect | openAny: read /marketplace/item/<id>/ | 1 | 200 | 829 ms | 15214 ms | — |
| warmup | step 14: goto /marketplace/ | 1 | 200 | 612 ms | 7196 ms | — |
| inspect | scroll: +386px in 10 wheel steps, 531 ms | 1 | 200 | 641 ms | 18348 ms | — |
| host | expected ProfileCometProfilePictureSetMutation: sent | 2 | 200 | 439–528 ms | 45806–1773944 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/warmup/20261023T074930_61594063207669**, step 11: goto /marketplace/: 200, 750 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeContactChannelsContainerQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "9934887189887478"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "is_eligible_for_broadcast_channel_creation": false,
      "actor": {
        "__typename": "User",
        "recent_broadcast_channels": [],
        "id": "61594063207669"
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792742237966,
      "time_at_flush_ms": 1792742237985
    },
    "is_final": true
  }
}
```

**runs/warmup/20261023T074930_61594063207669**, step 14: goto /marketplace/: 200, 612 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeContactChannelsContainerQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "9934887189887478"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "is_eligible_for_broadcast_channel_creation": false,
      "actor": {
        "__typename": "User",
        "recent_broadcast_channels": [],
        "id": "61594063207669"
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792742396587,
      "time_at_flush_ms": 1792742396608
    },
    "is_final": true
  }
}
```

**runs/inspect/20261024T060921_61594063207669**, scroll: +386px in 10 wheel steps, 531 ms: 200, 641 ms

Sent:

```json
{
  "qpl_active_flow_ids": "431626709",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeContactChannelsContainerQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "9934887189887478",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=431626709"
  ]
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "is_eligible_for_broadcast_channel_creation": false,
      "actor": {
        "__typename": "User",
        "recent_broadcast_channels": [],
        "id": "61594063207669"
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792822379784,
      "time_at_flush_ms": 1792822379806
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

The home page's contacts column: channels.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
