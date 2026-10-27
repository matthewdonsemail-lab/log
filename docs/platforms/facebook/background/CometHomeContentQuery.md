# CometHomeContentQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28262615193401316` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | — |
| Called from | `CometHomeContent.react` |
| rea | `ev_459dbe6fc8392c5185df68a9768ec12e975c7619162cefba942b56b1aa56215a` |

Seen 31 time(s) in 18 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 473 ms | 13562 ms | — |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 668 ms | 12031 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 745 ms | 7048 ms | — |
| warmup | step 11: goto /marketplace/ | 2 | 200 | 477–754 ms | 8604–15104 ms | — |
| warmup | step 17: goto /marketplace/ | 1 | 200 | 439 ms | 12041 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 568 ms | 1258015 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 396 ms | 5489 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 412 ms | 8263 ms | — |
| inspect | step 96: clickRole button "…" | 1 | 200 | 493 ms | 1305465 ms | — |
| inspect | step 4: snapshot | 1 | 200 | 483 ms | 339 ms | — |
| inspect | pin: typed the account's Messenger PIN | 1 | 200 | 580 ms | 554 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 401 ms | 6674 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 390 ms | 103682 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 1 | 200 | 438 ms | 5693 ms | — |
| inspect | step 4: goto /marketplace/inbox | 2 | 200 | 559–680 ms | 558513–564737 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 1436 ms | 59456 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 2508 ms | 11539 ms | — |
| inspect | step 6: goto /marketplace/inbox | 1 | 200 | 712 ms | 1708097 ms | — |
| inspect | openAny: read /marketplace/item/<id>/ | 1 | 200 | 617 ms | 15207 ms | — |
| warmup | step 14: goto /marketplace/ | 1 | 200 | 448 ms | 7190 ms | — |
| inspect | scroll: +386px in 10 wheel steps, 531 ms | 1 | 200 | 418 ms | 18337 ms | — |
| host | expected ProfileCometProfilePictureSetMutation: sent | 2 | 200 | 384–395 ms | 45797–1773929 ms | — |
| host | setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9 | 1 | 200 | 624 ms | 219884 ms | — |
| inspect | step 1: goto /marketplace/status | 1 | 200 | 477 ms | 12033 ms | — |
| inspect | step 4: goto /marketplace/status | 1 | 200 | 475 ms | 9208 ms | — |
| host | step 32: goto /marketplace/ | 1 | 200 | 226 ms | 12646 ms | — |
| host | step 38: goto /marketplace/you/selling | 1 | 200 | 210 ms | 17036 ms | — |
| host | step 40: goto /messages/ | 1 | 200 | 190 ms | 161 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, step 32: goto /marketplace/: 200, 226 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeContentQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "28262615193401316"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "comet_top_of_home_feed_tabs_renderer": null
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038330984,
      "time_at_flush_ms": 1793038331007
    },
    "is_final": true
  }
}
```

**runs/host/20261026T180628_61594285317994**, step 38: goto /marketplace/you/selling: 200, 210 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeContentQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "28262615193401316"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "comet_top_of_home_feed_tabs_renderer": null
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038436446,
      "time_at_flush_ms": 1793038436471
    },
    "is_final": true
  }
}
```

**runs/host/20261026T180628_61594285317994**, step 40: goto /messages/: 200, 190 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeContentQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "28262615193401316"
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

The home page's main content.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
