# ajaxWebstorageProcessKeys

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | login |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/webstorage/process_keys/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_7f8ea80f4e34452669ec0cdfcb3903f390f53a34d7b406c129b026fb925639cb` |

Seen 59 time(s) in 23 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 11: goto /marketplace/ | 1 | 200 | 1806 ms | 9634 ms | — |
| inspect | step 2: clickRole button "…" | 1 | 200 | 678 ms | 11786 ms | — |
| inspect | step 22: dwell 21.38s | 1 | 200 | 477 ms | 19087 ms | — |
| inspect | step 8: dwell 23.53s | 1 | 200 | 542 ms | 15207 ms | — |
| inspect | scroll: +1397px in 29 wheel steps, 1765 ms | 1 | 200 | 1963 ms | 15734 ms | — |
| inspect | step 6: dwell 51.57s | 1 | 200 | 339 ms | 16729 ms | — |
| inspect | step 17: dwell 29.77s | 1 | 200 | 308 ms | 17099 ms | — |
| inspect | step 36: dwell 15.58s | 1 | 200 | 329 ms | 12170 ms | — |
| inspect | step 72: clickRole button "…" | 1 | 200 | 321 ms | 15304 ms | — |
| inspect | step 44: dwell 18s | 1 | 200 | 345 ms | 12469 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 4 | 200 | 328–496 ms | 15782–425825 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 387 ms | 4544 ms | — |
| inspect | step 96: clickRole button "…" | 2 | 200 | 348–351 ms | 39352–1289363 ms | — |
| inspect | step 2: setLocation Bethlehem, Pennsylvania | 1 | 200 | 889 ms | 13271 ms | — |
| inspect | step 3: click e | 1 | 200 | 629 ms | 13511 ms | — |
| inspect | step 26: wait 8s | 1 | 200 | 400 ms | 8699 ms | — |
| inspect | step 27: click e1541 | 1 | 200 | 457 ms | 8217 ms | — |
| inspect | step 5: wait 5s | 3 | 200 | 395–482 ms | 969–300966 ms | — |
| inspect | step 10: goto /marketplace/you/selling | 1 | 200 | 1026 ms | 16771 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 5 | 200 | 400–619 ms | 18175–34720 ms | — |
| inspect | step 3: goto /marketplace/inbox | 6 | 200 | 503–1552 ms | 509982–1675374 ms | — |
| inspect | step 3: goto /marketplace/you/selling | 1 | 200 | 979 ms | 17064 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 2 | 200 | 380–410 ms | 15668–16331 ms | — |
| inspect | step 4: goto /marketplace/you/selling | 1 | 200 | 1026 ms | 21524 ms | — |
| warmup | step 3: goto /marketplace/you/selling | 1 | 200 | 697 ms | 16142 ms | — |
| warmup | step 17: dwell 2-4s | 2 | 200 | 370–458 ms | 638–50657 ms | — |
| inspect | step 3: dwell 24s | 1 | 200 | 629 ms | 16127 ms | — |
| inspect | step 10: dwell 21s | 1 | 200 | 371 ms | 15216 ms | — |
| inspect | step 18: dwell 19s | 1 | 200 | 1289 ms | 11038 ms | — |
| inspect | step 1: goto /marketplace/you/selling | 1 | 200 | 382 ms | 20872 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 358 ms | 45975 ms | — |
| flow | expected useCometMarketplaceListingCreateMutation: sent | 1 | 200 | 527 ms | 6018 ms | — |
| host | setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9 | 1 | 200 | 490 ms | 727989 ms | — |
| flow | step 8: fillRole textbox "…" | 1 | 200 | 490 ms | 15750 ms | — |
| host | signIn failed: RuntimeError: the element kept moving under the cursor: the point is on Por | 2 | 200 | 164–585 ms | 3071–63079 ms | — |
| host | step 7: signIn | 1 | 200 | 162 ms | 22853 ms | — |
| host | signIn failed: RuntimeError: the element kept moving under the cursor: the point is on DIV | 1 | 200 | 168 ms | 50950 ms | — |
| host | step 21: goto /marketplace/status | 1 | 200 | 163 ms | 19002 ms | — |
| host | POST 0 /ajax/qm/ (0 ms) | 3 | 200 | 153–170 ms | 57423–167437 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T164654_61594285317994**, step 7: signIn: 200, 162 ms

Sent:

```json
{
  "query": {
    "state": "1"
  },
  "body": {
    "local_storage[hb_timestamp]": "13",
    "local_storage[banzai:last_storage_flush]": "13",
    "local_storage[bz:6ae9d1:fy0yv2:l3wb2w.1793033270608]": "4696",
    "local_storage[Session]": "20",
    "local_storage[signal_flush_timestamp]": "13",
    "session_storage[TabId]": "6",
    "logtime": "1",
    "qpl_active_flow_ids": "516759801"
  }
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AuNoSRPF_HQmZRwYpNKkHni",
  "payload": {
    "keys": []
  },
  "lid": "7701019420335494123"
}
```

**runs/host/20261026T164654_61594285317994**, signIn failed: RuntimeError: the element kept moving under the cursor: the point is on DIV: 200, 168 ms

Sent:

```json
{
  "query": {
    "state": "1"
  },
  "body": {
    "local_storage[hb_timestamp]": "13",
    "local_storage[banzai:last_storage_flush]": "13",
    "local_storage[bz:6ae9d1:fy0yv2:l3wb2w.1793033270608]": "4696",
    "local_storage[Session]": "20",
    "local_storage[signal_flush_timestamp]": "13",
    "session_storage[TabId]": "6",
    "logtime": "1",
    "qpl_active_flow_ids": "516759801"
  }
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AuRWpQcvEtWJcd_k_MMWPJc",
  "payload": {
    "keys": []
  },
  "lid": "7701019680696822971"
}
```

**runs/host/20261026T164654_61594285317994**, step 21: goto /marketplace/status: 200, 163 ms

Sent:

```json
{
  "query": {
    "state": "0"
  },
  "body": {
    "local_storage[screen_time_period_logging_facebook]": "267",
    "local_storage[RSTData]": "2",
    "local_storage[hb_timestamp]": "13",
    "local_storage[mw_encrypted_backups_restore_upsell_first_impression_time_key]": "13",
    "local_storage[signal_flush_timestamp]": "13",
    "local_storage[Session]": "20",
    "local_storage[bdz_playback_state]": "45",
    "local_storage[_oz_bandwidthAndTTFBSamples]": "15",
    "local_storage[last_headload_time]": "13",
    "local_storage[armadillo_msgr_data_loss_stats]": "2",
    "local_storage[ares_last_signal_flush]": "13",
    "local_storage[_oz_bandwidthEstimate]": "7",
    "local_storage[banzai:last_storage_flush]": "13",
    "session_storage[alcei]": "1",
    "session_storage[alcsid]": "9",
    "session_storage[TabId]": "6",
    "logtime": "1"
  }
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AR4Gwfw1mBXxYtKte-6c8yh",
  "payload": {
    "keys": []
  },
  "lid": "7701020339141554825"
}
```

<!-- facts:end -->

## What it does

The page tells Facebook which of its keys it holds in browser storage. Seen only on checkpoint and captcha pages (one run).

## What our machine does with it

Nothing. Browser storage is saved back to Twenty after a run (only while it still holds a Facebook login).

## What can go wrong

Only seen inside checkpoints, so it may be part of how Facebook checks the browser during one. Not enough sightings yet to say more; read it again if a checkpoint repeats.
