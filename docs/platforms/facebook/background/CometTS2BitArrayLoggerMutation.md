# CometTS2BitArrayLoggerMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `25967579919558378` |
| Path | `/api/graphql` |
| Sends | `app_id`, `end_time`, `start_time` |
| Reads | — |
| Called from | — |
| rea | not read yet |

Seen 36 time(s) in 1 run(s).

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

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261024T211541_61593939852820**, step 2: pageText: 200, 398 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometTS2BitArrayLoggerMutation",
  "server_timestamps": "true",
  "variables": {
    "app_id": "2220391788200892",
    "end_time": 1792876565,
    "start_time": 1792876557
  },
  "doc_id": "25967579919558378"
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "ANShEo3O4HYUWoUtq9xa9pL",
  "payload": {},
  "lid": "7700346212494473024"
}
```

**runs/host/20261024T211541_61593939852820**, step 4: pageText: 200, 395 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometTS2BitArrayLoggerMutation",
  "server_timestamps": "true",
  "variables": {
    "app_id": "2220391788200892",
    "end_time": 1792876591,
    "start_time": 1792876583
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
      "request_start_time_ms": 1792876591463,
      "time_at_flush_ms": 1792876591534
    },
    "is_final": true
  }
}
```

**runs/host/20261024T211541_61593939852820**, step 6: goto /marketplace/status: 200, 430 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometTS2BitArrayLoggerMutation",
  "server_timestamps": "true",
  "variables": {
    "app_id": "2220391788200892",
    "end_time": 1792876623,
    "start_time": 1792876615
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
      "request_start_time_ms": 1792876623132,
      "time_at_flush_ms": 1792876623233
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
