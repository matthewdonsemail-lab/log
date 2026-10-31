# CometMarketplaceNotificationsListContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28153689817567734` |
| Path | `/api/graphql/` |
| Sends | `isCOBMOB`, `scale` |
| Reads | `viewer....MarketplaceSurfaceHighlights_viewer` |
| Called from | `CometMarketplaceNotificationsListContainer.react` |
| rea | `ev_db6029b93648bb0f97bb48100e923a2f1b143b437bc497c6144d5dfbf55f1720` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: click e191 | 1 | 200 | 1238 ms | 2967 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 718 ms | 479389 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T155857_61594063207669**, step 3: goto /marketplace/inbox: 200, 718 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceNotificationsListContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "isCOBMOB": false,
    "scale": 1
  },
  "doc_id": "28153689817567734"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "notifications_page": {
        "edges": [],
        "page_info": {
          "end_cursor": null,
          "has_next_page": false
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792685337346,
      "time_at_flush_ms": 1792685337385
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T110738_61594063207669**, step 4: click e191: 200, 1238 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceNotificationsListContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "isCOBMOB": false,
    "scale": 1
  },
  "doc_id": "28153689817567734"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "notifications_page": {
        "edges": [],
        "page_info": {
          "end_cursor": null,
          "has_next_page": false
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667424738,
      "time_at_flush_ms": 1792667424814
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Marketplace's notifications panel in the left rail (`CometMarketplaceNotificationsListContainer.react`): it loads the account's Marketplace highlights. It fired as Marketplace's home loaded after the partner screen's Update (step 4).

## What our machine does with it

Nothing reads it: it is part of Marketplace's home loading. No machine of ours opens Marketplace notifications; buyer messages are read from the inbox (`docs/conversations.md`, not built yet).

## What can go wrong

None seen: one call, 200 in 1238 ms. A failure would leave the notifications panel empty; nothing of ours depends on it.
