# CometRightSideHeaderCardsQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29755211854079266` |
| Path | `/api/graphql/` |
| Sends | `refresh_num`, `scale`, `__relay_internal__pv__GHLShouldChangeRHCSideFeedFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeRHCAdsFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeRHCFieldNamerelayprovider` |
| Reads | `viewer....CometRightSideHeaderCards_viewerSideFeed`, `viewer....CometHomeRightSideEgoContainer_egoPanel`, `...PagesCometHomeAdminContainer_query` |
| Called from | `CometRightSideHeaderCards.react` |
| rea | `ev_f70d40a6da221078ba4399652077833b898545fdcfd626f69f6828e11eee5ac6` |

Seen 31 time(s) in 18 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 626 ms | 13568 ms | — |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 671 ms | 12036 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 990 ms | 7055 ms | — |
| warmup | step 11: goto /marketplace/ | 2 | 200 | 561–754 ms | 8608–15105 ms | — |
| warmup | step 17: goto /marketplace/ | 1 | 200 | 599 ms | 12045 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 722 ms | 1258021 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 430 ms | 5495 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 441 ms | 8268 ms | — |
| inspect | step 96: clickRole button "…" | 1 | 200 | 580 ms | 1305471 ms | — |
| inspect | step 4: snapshot | 1 | 200 | 714 ms | 344 ms | — |
| inspect | pin: typed the account's Messenger PIN | 1 | 200 | 627 ms | 558 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 649 ms | 6677 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 811 ms | 103690 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 1 | 200 | 723 ms | 5699 ms | — |
| inspect | step 4: goto /marketplace/inbox | 2 | 200 | 651–956 ms | 558519–564742 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 1507 ms | 59461 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 2574 ms | 11547 ms | — |
| inspect | step 6: goto /marketplace/inbox | 1 | 200 | 970 ms | 1708103 ms | — |
| inspect | openAny: read /marketplace/item/<id>/ | 1 | 200 | 876 ms | 15212 ms | — |
| warmup | step 14: goto /marketplace/ | 1 | 200 | 663 ms | 7195 ms | — |
| inspect | scroll: +386px in 10 wheel steps, 531 ms | 1 | 200 | 785 ms | 18344 ms | — |
| host | expected ProfileCometProfilePictureSetMutation: sent | 2 | 200 | 563–777 ms | 45804–1773942 ms | — |
| host | setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9 | 1 | 200 | 794 ms | 219890 ms | — |
| inspect | step 1: goto /marketplace/status | 1 | 200 | 635 ms | 12040 ms | — |
| inspect | step 4: goto /marketplace/status | 1 | 200 | 765 ms | 9215 ms | — |
| host | step 32: goto /marketplace/ | 1 | 200 | 276 ms | 12649 ms | — |
| host | step 38: goto /marketplace/you/selling | 1 | 200 | 285 ms | 17037 ms | — |
| host | step 40: goto /messages/ | 1 | 200 | 296 ms | 162 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, step 32: goto /marketplace/: 200, 276 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometRightSideHeaderCardsQuery",
  "server_timestamps": "true",
  "variables": {
    "refresh_num": 0,
    "scale": 1,
    "__relay_internal__pv__GHLShouldChangeRHCSideFeedFieldNamerelayprovider": true,
    "__relay_internal__pv__GHLShouldChangeRHCAdsFieldNamerelayprovider": true,
    "__relay_internal__pv__GHLShouldChangeRHCFieldNamerelayprovider": false
  },
  "doc_id": "29755211854079266"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "side_feed": {
        "nodes": []
      },
      "auxColumnUnits": {
        "nodes": []
      },
      "actor": {
        "__typename": "User",
        "id": "61594285317994",
        "delegate_page_id": null,
        "can_manage_classic_page_in_pages_tab": true
      }
    },
    "logout_whitelist": [
      "^CacheStorageVersion$",
      "^RSTData$",
      "^RTC_VIDEO_INPUT$",
      "^RTC_AUDIO_INPUT$",
      "^RTC_AUDIO_OUTPUT$",
      "^RTC_IS_AUDIO_ONLY$",
      "… 98 more"
    ]
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038331004,
      "time_at_flush_ms": 1793038331066
    },
    "is_final": true
  }
}
```

**runs/host/20261026T180628_61594285317994**, step 38: goto /marketplace/you/selling: 200, 285 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometRightSideHeaderCardsQuery",
  "server_timestamps": "true",
  "variables": {
    "refresh_num": 0,
    "scale": 1,
    "__relay_internal__pv__GHLShouldChangeRHCSideFeedFieldNamerelayprovider": true,
    "__relay_internal__pv__GHLShouldChangeRHCAdsFieldNamerelayprovider": true,
    "__relay_internal__pv__GHLShouldChangeRHCFieldNamerelayprovider": false
  },
  "doc_id": "29755211854079266"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "side_feed": {
        "nodes": []
      },
      "auxColumnUnits": {
        "nodes": []
      },
      "actor": {
        "__typename": "User",
        "id": "61594285317994",
        "delegate_page_id": null,
        "can_manage_classic_page_in_pages_tab": true
      }
    },
    "logout_whitelist": [
      "^CacheStorageVersion$",
      "^RSTData$",
      "^RTC_VIDEO_INPUT$",
      "^RTC_AUDIO_INPUT$",
      "^RTC_AUDIO_OUTPUT$",
      "^RTC_IS_AUDIO_ONLY$",
      "… 98 more"
    ]
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038436451,
      "time_at_flush_ms": 1793038436542
    },
    "is_final": true
  }
}
```

**runs/host/20261026T180628_61594285317994**, step 40: goto /messages/: 200, 296 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometRightSideHeaderCardsQuery",
  "server_timestamps": "true",
  "variables": {
    "refresh_num": 0,
    "scale": 1,
    "__relay_internal__pv__GHLShouldChangeRHCSideFeedFieldNamerelayprovider": true,
    "__relay_internal__pv__GHLShouldChangeRHCAdsFieldNamerelayprovider": true,
    "__relay_internal__pv__GHLShouldChangeRHCFieldNamerelayprovider": false
  },
  "doc_id": "29755211854079266"
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

Cards in the home page's right column.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
