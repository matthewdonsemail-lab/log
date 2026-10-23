# MWQuickPromotionThreadlistBannerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27805253425807021` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer.eligible_promotions` |
| Called from | `MWQuickPromotionThreadlistBanner.react` |
| rea | `ev_53d322ba1b4a1e349ff941bf53186d5d9121e16f87cd8d7e1191528918759b00` |

Seen 6 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 25: goto /messages/ | 2 | 200 | 361–379 ms | 3052–4257 ms | — |
| inspect | step 1: goto /messages/ | 1 | 200 | 356 ms | 3595 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 436 ms | 1355898 ms | — |
| inspect | step 5: goto /messages/ | 1 | 200 | 399 ms | 10078 ms | — |
| warmup | step 5: goto /messages/ | 1 | 200 | 394 ms | 6212 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/warmup/20261023T080515_61594063207669**, step 5: goto /messages/: 200, 394 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MWQuickPromotionThreadlistBannerQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "27805253425807021"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "eligible_promotions": {
        "nodes": []
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792742815242,
      "time_at_flush_ms": 1792742815270
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T155857_61594063207669**, step 3: goto /marketplace/inbox: 200, 436 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MWQuickPromotionThreadlistBannerQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "27805253425807021"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "eligible_promotions": {
        "nodes": []
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792686213567,
      "time_at_flush_ms": 1792686213592
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T100521_61594063207669**, step 1: goto /messages/: 200, 356 ms

Sent:

```json
{
  "qpl_active_flow_ids": "521482085",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MWQuickPromotionThreadlistBannerQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "27805253425807021",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=521482085"
  ]
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "eligible_promotions": {
        "nodes": []
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792663538933,
      "time_at_flush_ms": 1792663538959
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Messenger's banner above the chat list (`MWQuickPromotionThreadlistBanner.react`): it asks which promotions the account may be shown there (`viewer.eligible_promotions`). Both times it fired 3-4 s after the warm-up's step 25 opened /messages/, alongside the inbox's other requests, while the "Create a PIN to access your chats on any device" dialog was up.

## What our machine does with it

Nothing waits for it or reads it. It is part of Messenger loading: the warm-up's `messagesVisit` goto (`warmupMessagesVisit`, step s05) only waits for the page to land on /messages/. What stops the inbox is the PIN dialog, a page state of its own (`messengerPinCreate`, `src/browser/flow/helpers/pageState.ts`), not this banner.

## What can go wrong

None seen: both calls answered 200 in 361-379 ms. If it failed, only the banner would be missing; the chat list and the PIN dialog don't depend on it.
