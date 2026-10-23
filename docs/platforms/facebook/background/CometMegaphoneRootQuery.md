# CometMegaphoneRootQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28541893478753857` |
| Path | `/api/graphql/` |
| Sends | `first`, `scale` |
| Reads | `viewer.megaphonePromotions` |
| Called from | `CometMegaphoneRoot.react` |
| rea | `ev_a2e1e82b09a10f9f97361e424dc787adb4a3a8c0a7bb15f7feb91de015e7d2fa` |

Seen 17 time(s) in 11 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 553 ms | 13566 ms | — |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 672 ms | 12034 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 756 ms | 7053 ms | — |
| warmup | step 11: goto /marketplace/ | 1 | 200 | 583 ms | 8607 ms | — |
| warmup | step 17: goto /marketplace/ | 1 | 200 | 504 ms | 12044 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 739 ms | 1258019 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 613 ms | 5493 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 518 ms | 8266 ms | — |
| inspect | step 4: snapshot | 1 | 200 | 587 ms | 342 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 743 ms | 6675 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 913 ms | 103687 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 1 | 200 | 1020 ms | 5697 ms | — |
| inspect | step 4: goto /marketplace/inbox | 1 | 200 | 1290 ms | 558516 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 1917 ms | 59459 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 2596 ms | 11543 ms | — |
| inspect | step 6: goto /marketplace/inbox | 1 | 200 | 803 ms | 1708101 ms | — |
| inspect | openAny: read /marketplace/item/<id>/ | 1 | 200 | 883 ms | 15210 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T045453_61594063207669**, openAny: read /marketplace/item/<id>/: 200, 883 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMegaphoneRootQuery",
  "server_timestamps": "true",
  "variables": {
    "first": 1,
    "scale": 1
  },
  "doc_id": "28541893478753857"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "megaphonePromotions": {
        "edges": []
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792731520768,
      "time_at_flush_ms": 1792731520977
    },
    "is_final": true
  }
}
```

**runs/inspect/20261023T000744_61594063207669**, step 3: goto /marketplace/inbox: 200, 1917 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMegaphoneRootQuery",
  "server_timestamps": "true",
  "variables": {
    "first": 1,
    "scale": 1
  },
  "doc_id": "28541893478753857"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "megaphonePromotions": {
        "edges": []
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792714191788,
      "time_at_flush_ms": 1792714192084
    },
    "is_final": true
  }
}
```

**runs/inspect/20261023T000744_61594063207669**, step 5: goto /marketplace/you/selling: 200, 2596 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMegaphoneRootQuery",
  "server_timestamps": "true",
  "variables": {
    "first": 1,
    "scale": 1
  },
  "doc_id": "28541893478753857"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "megaphonePromotions": {
        "edges": []
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792715273182,
      "time_at_flush_ms": 1792715273311
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

The banner slot at the top of the page (announcements, prompts).

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
