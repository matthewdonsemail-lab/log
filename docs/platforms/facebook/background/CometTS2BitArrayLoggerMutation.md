# CometTS2BitArrayLoggerMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `25967579919558378` |
| Path | `/api/graphql` |
| Sends | `app_id`, `end_time`, `start_time` |
| Reads | `xfb_time_spent_bit_array.success` |
| Called from | `CometTS2BitArrayLogger` |
| rea | `ev_d253369048e91a1f311233968c4c1126ff89c73db7729307f69ee65b3bf42713` |

Seen 39 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | step 2: pageText | 1 | 200 | 398 ms | 417 ms | — |
| host | step 4: pageText | 1 | 200 | 395 ms | 5994 ms | — |
| host | step 6: goto /marketplace/status | 1 | 200 | 430 ms | 9811 ms | — |
| host | step 7: goto /me | 1 | 200 | 412 ms | 10049 ms | — |
| host | step 9: snapshot | 1 | 200 | 415 ms | 25205 ms | — |
| host | step 12: goto /me | 1 | 200 | 366 ms | 9794 ms | — |
| host | step 16: snapshot | 1 | 200 | 391 ms | 5583 ms | — |
| host | step 17: goto /me | 1 | 200 | 388 ms | 9318 ms | — |
| host | expected ProfileCometProfilePictureSetMutation: sent | 28 | 200 | 347–1145 ms | 6303–1734301 ms | — |
| inspect | step 1: goto /marketplace/status | 1 | 200 | 394 ms | 13007 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 1 | 200 | 418 ms | 10335 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 374 ms | 9995 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T065539_61593939852820**, step 1: goto /marketplace/status: 200, 394 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometTS2BitArrayLoggerMutation",
  "server_timestamps": "true",
  "variables": {
    "app_id": "2220391788200892",
    "end_time": 1792911376,
    "start_time": 1792911368
  },
  "doc_id": "25967579919558378"
}
```

Answered:

```json
{
  "data": {
    "xfb_time_spent_bit_array": {
      "success": true
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792911376601,
      "time_at_flush_ms": 1792911376671
    },
    "is_final": true
  }
}
```

**runs/inspect/20261025T065539_61593939852820**, step 2: goto /marketplace/you/selling: 200, 418 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometTS2BitArrayLoggerMutation",
  "server_timestamps": "true",
  "variables": {
    "app_id": "2220391788200892",
    "end_time": 1792911396,
    "start_time": 1792911388
  },
  "doc_id": "25967579919558378"
}
```

Answered:

```json
{
  "data": {
    "xfb_time_spent_bit_array": {
      "success": true
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792911396328,
      "time_at_flush_ms": 1792911396407
    },
    "is_final": true
  }
}
```

**runs/inspect/20261025T065539_61593939852820**, step 3: goto /marketplace/inbox: 200, 374 ms

Sent:

```json
{
  "__jssesw": "341",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometTS2BitArrayLoggerMutation",
  "server_timestamps": "true",
  "variables": {
    "app_id": "2220391788200892",
    "end_time": 1792911415,
    "start_time": 1792911407
  },
  "doc_id": "25967579919558378"
}
```

Answered:

```json
{
  "data": {
    "xfb_time_spent_bit_array": {
      "success": true
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792911415514,
      "time_at_flush_ms": 1792911415548
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Logs client timing data (`app_id`, `start_time`, `end_time`) in the background on most pages; it answers an empty `payload`.

## What our machine does with it

Nothing. The flow generator never takes it as a step's confirmation (`NOT_CONFIRMING` matches `Logger` in `flowFromRecording`), and no step waits on it.

## What can go wrong

Harmless.
