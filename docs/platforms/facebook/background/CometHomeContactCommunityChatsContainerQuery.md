# CometHomeContactCommunityChatsContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `26941462065448526` |
| Path | `/api/graphql/` |
| Sends | `numChatsToFetch` |
| Reads | `viewer....CometHomeContactCommunityChats_viewer` |
| Called from | `CometHomeContactCommunityChatsContainer.react` |
| rea | `ev_31c792dc1d0492b3f41ce3e92ba6d4ff2d380989e4e3c6ae7c07672fd8425c13` |

Seen 31 time(s) in 18 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 580 ms | 13571 ms | — |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 668 ms | 12039 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 748 ms | 7059 ms | — |
| warmup | step 11: goto /marketplace/ | 2 | 200 | 614–750 ms | 8612–15110 ms | — |
| warmup | step 17: goto /marketplace/ | 1 | 200 | 554 ms | 12049 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 593 ms | 1258008 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 404 ms | 5483 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 399 ms | 8258 ms | — |
| inspect | step 96: clickRole button "…" | 1 | 200 | 389 ms | 1305458 ms | — |
| inspect | step 4: snapshot | 1 | 200 | 726 ms | 348 ms | — |
| inspect | pin: typed the account's Messenger PIN | 1 | 200 | 611 ms | 561 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 621 ms | 6681 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 630 ms | 103696 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 1 | 200 | 547 ms | 5703 ms | — |
| inspect | step 4: goto /marketplace/inbox | 2 | 200 | 612–916 ms | 558523–564747 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 1632 ms | 59464 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 2569 ms | 11550 ms | — |
| inspect | step 6: goto /marketplace/inbox | 1 | 200 | 927 ms | 1708107 ms | — |
| inspect | openAny: read /marketplace/item/<id>/ | 1 | 200 | 829 ms | 15216 ms | — |
| warmup | step 14: goto /marketplace/ | 1 | 200 | 650 ms | 7198 ms | — |
| inspect | scroll: +386px in 10 wheel steps, 531 ms | 1 | 200 | 620 ms | 18350 ms | — |
| host | expected ProfileCometProfilePictureSetMutation: sent | 2 | 200 | 470–515 ms | 45809–1773947 ms | — |
| host | setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9 | 1 | 200 | 793 ms | 219894 ms | — |
| inspect | step 1: goto /marketplace/status | 1 | 200 | 465 ms | 12044 ms | — |
| inspect | step 4: goto /marketplace/status | 1 | 200 | 629 ms | 9218 ms | — |
| host | step 32: goto /marketplace/ | 1 | 200 | 254 ms | 12654 ms | — |
| host | step 38: goto /marketplace/you/selling | 1 | 200 | 232 ms | 17038 ms | — |
| host | step 40: goto /messages/ | 1 | 200 | 260 ms | 163 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, step 32: goto /marketplace/: 200, 254 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeContactCommunityChatsContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "numChatsToFetch": 3
  },
  "doc_id": "26941462065448526"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "actor": {
        "__typename": "User",
        "should_hide_group_conversations_list": false,
        "id": "61594285317994"
      },
      "chat_sidebar_is_collapsed": false,
      "chat_visibility": true,
      "community_messaging": {
        "recent_channels": {
          "nodes": []
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038331010,
      "time_at_flush_ms": 1793038331032
    },
    "is_final": true
  }
}
```

**runs/host/20261026T180628_61594285317994**, step 38: goto /marketplace/you/selling: 200, 232 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeContactCommunityChatsContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "numChatsToFetch": 3
  },
  "doc_id": "26941462065448526"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "actor": {
        "__typename": "User",
        "should_hide_group_conversations_list": false,
        "id": "61594285317994"
      },
      "chat_sidebar_is_collapsed": false,
      "chat_visibility": true,
      "community_messaging": {
        "recent_channels": {
          "nodes": []
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038436462,
      "time_at_flush_ms": 1793038436486
    },
    "is_final": true
  }
}
```

**runs/host/20261026T180628_61594285317994**, step 40: goto /messages/: 200, 260 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeContactCommunityChatsContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "numChatsToFetch": 3
  },
  "doc_id": "26941462065448526"
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

The home page's contacts column: community chats.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
