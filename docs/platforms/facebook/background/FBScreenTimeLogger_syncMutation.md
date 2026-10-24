# FBScreenTimeLogger_syncMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `28969188822673160` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `screen_time_sync.aggs` |
| Called from | `FBScreenTimeLogger.react` |
| rea | `ev_9c20c08fbf4c14d62fa5b772be9b8dc2f4b32b06aa445a78cfb8f8ea86ba73c3` |

Seen 81 time(s) in 24 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | scroll: +388px in 10 wheel steps, 1109 ms | 1 | 200 | 496 ms | 145 ms | — |
| warmup | step 13: goto /marketplace/create/item | 1 | 200 | 503 ms | 6848 ms | — |
| warmup | step 23: goto /marketplace/you/selling | 1 | 200 | 631 ms | 16495 ms | — |
| warmup | scroll: +531px in 14 wheel steps, 765 ms | 1 | 200 | 514 ms | 8077 ms | — |
| inspect | scroll: +800px in 18 wheel steps, 781 ms | 6 | 200 | 421–2294 ms | 151337–1651976 ms | — |
| inspect | step 13: wait 8s | 1 | 200 | 542 ms | 26897 ms | — |
| inspect | step 23: press Escape | 1 | 200 | 633 ms | 5741 ms | — |
| inspect | step 39: snapshot | 1 | 200 | 2124 ms | 4241 ms | — |
| inspect | step 22: dwell 21.38s | 1 | 200 | 764 ms | 20848 ms | — |
| inspect | post: "…", 50 words, 0 image(s), scrolled 742 px | 1 | 200 | 912 ms | 443 ms | — |
| inspect | openAny: read /marketplace/item/<id>/ | 1 | 200 | 538 ms | 6418 ms | — |
| inspect | step 31: clickRole button "…" | 1 | 200 | 660 ms | 96068 ms | — |
| inspect | post: "…", 106 words, 1 image(s) | 1 | 200 | 845 ms | 5619 ms | — |
| inspect | scroll: +783px in 18 wheel steps, 797 ms | 2 | 200 | 539–704 ms | 216636–516909 ms | — |
| inspect | step 64: clickRole button "…" | 1 | 200 | 497 ms | 1245 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 3 | 200 | 396–426 ms | 219147–519435 ms | — |
| inspect | step 20: clickRole button "…" | 1 | 200 | 447 ms | 4790 ms | — |
| inspect | step 24: clickRole button "…" | 6 | 200 | 426–5897 ms | 266562–1767309 ms | — |
| inspect | step 17: scrollIn heading "…" 2-3 x 300-500px | 1 | 200 | 412 ms | 36 ms | — |
| inspect | step 44: dwell 18s | 1 | 200 | 474 ms | 790 ms | — |
| inspect | step 82: dwell 1s | 1 | 200 | 425 ms | 5069 ms | — |
| inspect | step 96: clickRole button "…" | 6 | 200 | 386–1201 ms | 184115–1686233 ms | — |
| inspect | step 1: goto /messages/ | 1 | 200 | 662 ms | 7270 ms | — |
| inspect | step 11: goto /marketplace/create/item | 1 | 200 | 1332 ms | 11562 ms | — |
| inspect | step 25: click e1241 | 1 | 200 | 464 ms | 10781 ms | — |
| inspect | type failed: TimeoutError: Locator.press_sequentially: Timeout 30000ms exceeded. | 1 | 200 | 1542 ms | 40440 ms | — |
| inspect | step 5: wait 5s | 2 | 200 | 491–494 ms | 216260–516495 ms | — |
| inspect | step 11: goto /marketplace/inbox | 1 | 200 | 524 ms | 26832 ms | — |
| inspect | step 3: goto /marketplace/inbox | 9 | 200 | 497–1377 ms | 223677–1728919 ms | — |
| inspect | step 4: goto /marketplace/inbox | 6 | 200 | 572–2282 ms | 252472–1753170 ms | — |
| inspect | step 6: goto /marketplace/inbox | 5 | 200 | 434–874 ms | 11719–1213257 ms | — |
| inspect | step 6: wait 6s | 1 | 200 | 558 ms | 10373 ms | — |
| warmup | openAny: read /marketplace/item/<id>/ | 1 | 200 | 420 ms | 1941 ms | — |
| warmup | step 14: goto /marketplace/ | 1 | 200 | 806 ms | 6666 ms | — |
| inspect | step 8: goto /reel/<id> | 1 | 200 | 514 ms | 19383 ms | — |
| inspect | step 20: dwell 2s | 2 | 200 | 497–801 ms | 171530–471647 ms | — |
| inspect | scroll: +425px in 10 wheel steps, 360 ms | 1 | 200 | 419 ms | 937 ms | — |
| inspect | scroll: +517px in 12 wheel steps, 500 ms | 1 | 200 | 417 ms | 3612 ms | — |
| inspect | scroll: +315px in 8 wheel steps, 297 ms | 4 | 200 | 433–1378 ms | 278596–1179741 ms | — |
| inspect | scroll: +515px in 13 wheel steps, 656 ms | 2 | 200 | 430–1366 ms | 96579–396929 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/warmup/20261023T074930_61594063207669**, openAny: read /marketplace/item/<id>/: 200, 420 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "FBScreenTimeLogger_syncMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "actor_id": "61594063207669",
      "client_mutation_id": "1",
      "device_time_iso": "2026-10-23T07:54:52.628Z",
      "fb_web_fb_intervals_payload": {
        "device_timestamp": "1792742092",
        "device_timezone": "America/New_York",
        "intervals": [
          {
            "end_timestamp": "1792731798",
            "start_timestamp": "1792731337"
          },
          {
            "end_timestamp": "1792732767",
            "start_timestamp": "1792732562"
          },
          {
            "end_timestamp": "1792737847",
            "start_timestamp": "1792737807"
          },
          {
            "end_timestamp": "1792740565",
            "start_timestamp": "1792740545"
          },
          {
            "end_timestamp": "1792740809",
            "start_timestamp": "1792740691"
          },
          {
            "end_timestamp": "1792742092",
            "start_timestamp": "1792741789"
          }
        ],
        "local_storage_id": "2159989",
        "version": "V1"
      },
      "screentime_snapshot_payload": {
        "l24h_s": -1,
        "last_sync_timestamp": 1792741789,
        "today_s": 300
      },
      "trigger_reason": "REGULAR"
    }
  },
  "doc_id": "28969188822673160"
}
```

Answered:

```json
{
  "data": {
    "screen_time_sync": {
      "aggs": {
        "__typename": "ScreenTimeSyncMutationOutput",
        "today_s": 1147,
        "l24h_s": -1
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792742093258,
      "time_at_flush_ms": 1792742093338
    },
    "is_final": true
  }
}
```

**runs/warmup/20261023T074930_61594063207669**, step 14: goto /marketplace/: 200, 806 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "FBScreenTimeLogger_syncMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "actor_id": "61594063207669",
      "client_mutation_id": "1",
      "device_time_iso": "2026-10-23T07:59:55.380Z",
      "fb_web_fb_intervals_payload": {
        "device_timestamp": "1792742395",
        "device_timezone": "America/New_York",
        "intervals": [
          {
            "end_timestamp": "1792742395",
            "start_timestamp": "1792741789"
          }
        ],
        "local_storage_id": "53504705",
        "version": "V1"
      },
      "screentime_snapshot_payload": {
        "l24h_s": -1,
        "last_sync_timestamp": 1792742092,
        "today_s": 1147
      },
      "trigger_reason": "REGULAR"
    }
  },
  "doc_id": "28969188822673160"
}
```

Answered:

```json
{
  "data": {
    "screen_time_sync": {
      "aggs": {
        "__typename": "ScreenTimeSyncMutationOutput",
        "today_s": 1450,
        "l24h_s": -1
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792742396315,
      "time_at_flush_ms": 1792742396414
    },
    "is_final": true
  }
}
```

**runs/inspect/20261024T060921_61594063207669**, scroll: +425px in 10 wheel steps, 360 ms: 200, 419 ms

Sent:

```json
{
  "qpl_active_flow_ids": "431626709",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "FBScreenTimeLogger_syncMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "actor_id": "61594063207669",
      "client_mutation_id": "1",
      "device_time_iso": "2026-10-24T06:14:48.772Z",
      "fb_web_fb_intervals_payload": {
        "device_timestamp": "1792822488",
        "device_timezone": "America/New_York",
        "intervals": [
          {
            "end_timestamp": "1792743639",
            "start_timestamp": "1792742903"
          },
          {
            "end_timestamp": "1792777218",
            "start_timestamp": "1792777033"
          },
          {
            "end_timestamp": "1792822488",
            "start_timestamp": "1792822188"
          }
        ],
        "local_storage_id": "50811158",
        "version": "V1"
      },
      "screentime_snapshot_payload": {
        "l24h_s": -1,
        "last_sync_timestamp": 1792822188,
        "today_s": 2517
      },
      "trigger_reason": "REGULAR"
    }
  },
  "doc_id": "28969188822673160",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=431626709"
  ]
}
```

Answered:

```json
{
  "data": {
    "screen_time_sync": {
      "aggs": {
        "__typename": "ScreenTimeSyncMutationOutput",
        "today_s": 300,
        "l24h_s": -1
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792822488238,
      "time_at_flush_ms": 1792822488345
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Logs time spent on screen.

## What our machine does with it

Nothing. The flow generator ignores it as a confirmation.

## What can go wrong

Harmless.
