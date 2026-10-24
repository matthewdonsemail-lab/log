# MAWVerifyThreadCutover_ContactCapabilities2Query

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `9948369021930229` |
| Path | `/api/graphql/` |
| Sends | `id` |
| Reads | `user.message_capabilities2_str` |
| Called from | `MAWVerifyThreadCutover` |
| rea | `ev_44e3cb9f5f2e6e9a2fcdb0d5cab0d74c8132d812cb7b5877864210161e514c73` |

Seen 115 time(s) in 32 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 1: goto / | 4 | 200 | 349–584 ms | 7245–20961 ms | — |
| warmup | step 4: goto /marketplace/ | 3 | 200 | 376–398 ms | 4115–5425 ms | — |
| warmup | step 7: goto /marketplace/ | 3 | 200 | 356–390 ms | 3640–5793 ms | — |
| warmup | step 11: goto /marketplace/ | 3 | 200 | 366–416 ms | 3172–15231 ms | — |
| warmup | step 13: goto /marketplace/create/item | 3 | 200 | 350–368 ms | 3066–10443 ms | — |
| warmup | step 15: goto /marketplace/ | 2 | 200 | 357–368 ms | 2911–3209 ms | — |
| warmup | step 17: goto /marketplace/ | 2 | 200 | 344–432 ms | 2462–3835 ms | — |
| warmup | step 19: goto /marketplace/you/selling | 2 | 200 | 358–382 ms | 2530–8438 ms | — |
| warmup | step 21: goto /marketplace/ | 2 | 200 | 433–517 ms | 3863–4750 ms | — |
| warmup | step 23: goto /marketplace/you/selling | 2 | 200 | 371–771 ms | 2336–2482 ms | — |
| warmup | step 25: goto /messages/ | 2 | 200 | 388–435 ms | 2757–3737 ms | — |
| inspect | step 1: goto /groups/<id>/ | 5 | 200 | 361–412 ms | 3689–6555 ms | — |
| inspect | step 8: goto /groups/<id>/permalink/<id>/ | 1 | 200 | 377 ms | 6895 ms | — |
| inspect | step 25: goto /groups/<id>/questions | 1 | 200 | 363 ms | 6445 ms | — |
| inspect | step 4: goto /groups/<id>/permalink/<id>/ | 1 | 200 | 357 ms | 7132 ms | — |
| inspect | step 1: goto /groups/<id> | 1 | 200 | 358 ms | 7157 ms | — |
| inspect | step 1: goto / | 6 | 200 | 454–553 ms | 5800–8849 ms | — |
| inspect | step 7: goto / | 2 | 200 | 363–500 ms | 4963–5209 ms | — |
| inspect | step 34: goto /marketplace/ | 1 | 200 | 524 ms | 6129 ms | — |
| inspect | step 38: goto /marketplace/ | 1 | 200 | 734 ms | 7900 ms | — |
| inspect | step 22: goto /marketplace/ | 1 | 200 | 573 ms | 6267 ms | — |
| inspect | step 27: goto / | 1 | 200 | 549 ms | 5270 ms | — |
| inspect | step 4: goto /marketplace/ | 1 | 200 | 444 ms | 5803 ms | — |
| inspect | step 1: goto /reel/ | 4 | 200 | 339–386 ms | 3408–8805 ms | — |
| inspect | step 71: goto /reel/ | 1 | 200 | 328 ms | 4281 ms | — |
| inspect | step 14: goto /reel/<id> | 1 | 200 | 1714 ms | 4163 ms | — |
| inspect | step 23: goto /reel/<id> | 1 | 200 | 328 ms | 5005 ms | — |
| inspect | step 9: goto /reel/<id> | 1 | 200 | 401 ms | 5863 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 585 ms | 5360 ms | — |
| inspect | step 20: goto /reel/<id> | 1 | 200 | 2124 ms | 2852 ms | — |
| inspect | step 22: goto /reel/ | 1 | 200 | 3661 ms | 2982 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 1 | 200 | 2065 ms | 5570 ms | — |
| inspect | step 53: goto /reel/ | 1 | 200 | 381 ms | 5835 ms | — |
| inspect | step 1: goto /messages/ | 1 | 200 | 360 ms | 3368 ms | — |
| inspect | step 1: goto /marketplace/ | 2 | 200 | 419–2770 ms | 7246–10033 ms | — |
| inspect | step 2: setLocation Bethlehem, Pennsylvania | 1 | 200 | 845 ms | 3734 ms | — |
| inspect | step 5: setLocation Bethlehem, Pennsylvania | 1 | 200 | 787 ms | 3872 ms | — |
| inspect | step 11: goto /marketplace/create/item | 1 | 200 | 868 ms | 2851 ms | — |
| inspect | step 1: goto /marketplace/create/item | 2 | 200 | 464 ms | 6192–10151 ms | — |
| inspect | step 4: setLocation Bethlehem, PA | 1 | 200 | 599 ms | 5546 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 392 ms | 2940 ms | — |
| inspect | step 13: setLocation 18015 | 1 | 200 | 387 ms | 4587 ms | — |
| inspect | step 1: goto /marketplace/inbox | 2 | 200 | 405–414 ms | 6950–19783 ms | — |
| inspect | step 4: goto /marketplace/you/selling | 2 | 200 | 390–548 ms | 5357–6363 ms | — |
| inspect | step 6: goto /marketplace/status | 1 | 200 | 553 ms | 5497 ms | — |
| inspect | step 7: goto /marketplace/you/selling | 1 | 200 | 741 ms | 2468 ms | — |
| inspect | step 8: goto /marketplace/inbox | 1 | 200 | 694 ms | 4789 ms | — |
| inspect | step 9: goto /marketplace/status | 1 | 200 | 511 ms | 2773 ms | — |
| inspect | step 10: goto /marketplace/you/selling | 1 | 200 | 1234 ms | 2539 ms | — |
| inspect | step 11: goto /marketplace/inbox | 1 | 200 | 663 ms | 2526 ms | — |
| inspect | step 1: goto /marketplace/status | 2 | 200 | 349–468 ms | 6130–9577 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 2 | 200 | 340–438 ms | 4322–4620 ms | — |
| inspect | step 3: goto /marketplace/inbox | 5 | 200 | 341–807 ms | 4184–1344092 ms | — |
| inspect | step 2: goto /marketplace/status | 1 | 200 | 1395 ms | 3074 ms | — |
| inspect | step 3: goto /marketplace/you/selling | 1 | 200 | 3086 ms | 2324 ms | — |
| inspect | step 4: goto /marketplace/inbox | 1 | 200 | 3007 ms | 3024 ms | — |
| inspect | step 4: goto /marketplace/status | 1 | 200 | 845 ms | 4443 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 774 ms | 2246 ms | — |
| inspect | step 6: goto /marketplace/inbox | 3 | 200 | 438–853 ms | 2627–1515308 ms | — |
| inspect | step 2: goto /marketplace/ | 1 | 200 | 368 ms | 6696 ms | — |
| inspect | step 5: goto /messages/ | 1 | 200 | 715 ms | 8319 ms | — |
| flow | step 1: goto /marketplace/ | 1 | 200 | 824 ms | 6901 ms | — |
| flow | step 3: goto /marketplace/create/item | 1 | 200 | 366 ms | 3357 ms | — |
| warmup | step 1: goto /marketplace/ | 1 | 200 | 366 ms | 4224 ms | — |
| warmup | step 3: goto /marketplace/you/selling | 1 | 200 | 395 ms | 3452 ms | — |
| warmup | step 5: goto /messages/ | 1 | 200 | 492 ms | 5621 ms | — |
| warmup | step 14: goto /marketplace/ | 1 | 200 | 379 ms | 3909 ms | — |
| warmup | step 16: goto /marketplace/you/selling | 1 | 200 | 578 ms | 5794 ms | — |
| warmup | step 18: goto /marketplace/ | 1 | 200 | 391 ms | 3744 ms | — |
| inspect | step 8: goto /reel/<id> | 1 | 200 | 403 ms | 5374 ms | — |
| inspect | step 1: goto /marketplace/you/selling | 1 | 200 | 371 ms | 6682 ms | — |
| inspect | step 3: goto /groups/junkremovalwinners/members | 1 | 200 | 342 ms | 4919 ms | — |
| inspect | step 22: goto /groups/junkremovalwinners/members | 1 | 200 | 375 ms | 5030 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/warmup/20261023T080515_61594063207669**, step 1: goto /marketplace/: 200, 366 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MAWVerifyThreadCutover_ContactCapabilities2Query",
  "server_timestamps": "true",
  "variables": {
    "id": "61594063207669"
  },
  "doc_id": "9948369021930229"
}
```

Answered:

```json
{
  "data": {
    "user": {
      "message_capabilities2_str": "252060841644982528",
      "id": "61594063207669"
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792742733499,
      "time_at_flush_ms": 1792742733519
    },
    "is_final": true
  }
}
```

**runs/warmup/20261023T080515_61594063207669**, step 3: goto /marketplace/you/selling: 200, 395 ms

Sent:

```json
{
  "qpl_active_flow_ids": "30613466",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MAWVerifyThreadCutover_ContactCapabilities2Query",
  "server_timestamps": "true",
  "variables": {
    "id": "61594063207669"
  },
  "doc_id": "9948369021930229",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=30613466"
  ]
}
```

Answered:

```json
{
  "data": {
    "user": {
      "message_capabilities2_str": "252060841644982528",
      "id": "61594063207669"
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792742782510,
      "time_at_flush_ms": 1792742782533
    },
    "is_final": true
  }
}
```

**runs/warmup/20261023T080515_61594063207669**, step 5: goto /messages/: 200, 492 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MAWVerifyThreadCutover_ContactCapabilities2Query",
  "server_timestamps": "true",
  "variables": {
    "id": "61594063207669"
  },
  "doc_id": "9948369021930229"
}
```

Answered:

```json
{
  "data": {
    "user": {
      "message_capabilities2_str": "252060841644982528",
      "id": "61594063207669"
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792742814645,
      "time_at_flush_ms": 1792742814672
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Messenger's end-to-end encrypted chat: checks what the contacts' clients support.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
