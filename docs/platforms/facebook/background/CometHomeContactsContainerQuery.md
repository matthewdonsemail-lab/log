# CometHomeContactsContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28451034771148738` |
| Path | `/api/graphql/` |
| Sends | `numContactsToFetch`, `scale` |
| Reads | — |
| Called from | `CometHomeContactsContainer.react` |
| rea | `ev_edd6229fed43c7c2a14f463d5a2826a2e5f0a94f2805081537efea9dcc02418a` |

Seen 31 time(s) in 18 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 654 ms | 13575 ms | A server error field_exception occured. Check server logs for details. |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 682 ms | 12042 ms | A server error field_exception occured. Check server logs for details. |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 980 ms | 7074 ms | A server error field_exception occured. Check server logs for details. |
| warmup | step 11: goto /marketplace/ | 2 | 200 | 625–747 ms | 8615–15112 ms | A server error field_exception occured. Check server logs for details. |
| warmup | step 17: goto /marketplace/ | 1 | 200 | 566 ms | 12051 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 24: clickRole button "…" | 1 | 200 | 609 ms | 1258011 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 3: clickRole button "…" | 1 | 200 | 623 ms | 5487 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 417 ms | 8261 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 96: clickRole button "…" | 1 | 200 | 389 ms | 1305463 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 4: snapshot | 1 | 200 | 715 ms | 351 ms | A server error field_exception occured. Check server logs for details. |
| inspect | pin: typed the account's Messenger PIN | 1 | 200 | 757 ms | 566 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 929 ms | 6691 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 5: wait 5s | 1 | 200 | 670 ms | 103700 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 2: goto /marketplace/you/selling | 1 | 200 | 713 ms | 5708 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 4: goto /marketplace/inbox | 2 | 200 | 924–967 ms | 558526–564751 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 1670 ms | 59468 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 2678 ms | 11555 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 6: goto /marketplace/inbox | 1 | 200 | 950 ms | 1708112 ms | A server error field_exception occured. Check server logs for details. |
| inspect | openAny: read /marketplace/item/<id>/ | 1 | 200 | 829 ms | 15219 ms | A server error field_exception occured. Check server logs for details. |
| warmup | step 14: goto /marketplace/ | 1 | 200 | 648 ms | 7202 ms | A server error field_exception occured. Check server logs for details. |
| inspect | scroll: +386px in 10 wheel steps, 531 ms | 1 | 200 | 953 ms | 18354 ms | A server error field_exception occured. Check server logs for details. |
| host | expected ProfileCometProfilePictureSetMutation: sent | 2 | 200 | 582–1109 ms | 45814–1773952 ms | A server error field_exception occured. Check server logs for details. |
| host | setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9 | 1 | 200 | 1077 ms | 219899 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 1: goto /marketplace/status | 1 | 200 | 562 ms | 12047 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 4: goto /marketplace/status | 1 | 200 | 928 ms | 9220 ms | A server error field_exception occured. Check server logs for details. |
| host | step 32: goto /marketplace/ | 1 | 200 | 277 ms | 12657 ms | A server error field_exception occured. Check server logs for details. |
| host | step 38: goto /marketplace/you/selling | 1 | 200 | 261 ms | 17039 ms | A server error field_exception occured. Check server logs for details. |
| host | step 40: goto /messages/ | 1 | 200 | 306 ms | 165 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, step 32: goto /marketplace/: 200, 277 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeContactsContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "numContactsToFetch": 17,
    "scale": 1
  },
  "doc_id": "28451034771148738"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "actor": {
        "__typename": "User",
        "contacts_home_renderer": {
          "__typename": "XFBContactsHomeDefaultRenderer",
          "viewer": {
            "chat_sidebar_is_collapsed": false,
            "messenger_inbox_tray_contacts": [],
            "chat_visibility": true
          },
          "__module_operation_CometHomeContactsContainerQuery": null,
          "__module_component_CometHomeContactsContainerQuery": null
        },
        "id": "61594285317994"
      }
    }
  },
  "errors": [
    {
      "message": "A server error field_exception occured. Check server logs for details.",
      "severity": "ERROR",
      "mids": [
        "001189db2a4071a04b876426152dd738"
      ],
      "debug_link": "https://www.meta.com/debug/?mid=001189db2a4071a04b876426152dd738",
      "path": [
        "viewer",
        "actor",
        "contacts_home_renderer",
        "__module_operation_CometHomeContactsContainerQuery"
      ]
    },
    {
      "message": "A server error field_exception occured. Check server logs for details.",
      "severity": "ERROR",
      "mids": [
        "38b7283558dc534b70b66c65fc1fcb18"
      ],
      "debug_link": "https://www.meta.com/debug/?mid=38b7283558dc534b70b66c65fc1fcb18",
      "path": [
        "viewer",
        "actor",
        "contacts_home_renderer",
        "__module_component_CometHomeContactsContainerQuery"
      ]
    }
  ],
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038331026,
      "time_at_flush_ms": 1793038331066
    },
    "is_final": true
  }
}
```

**runs/host/20261026T180628_61594285317994**, step 38: goto /marketplace/you/selling: 200, 261 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeContactsContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "numContactsToFetch": 17,
    "scale": 1
  },
  "doc_id": "28451034771148738"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "actor": {
        "__typename": "User",
        "contacts_home_renderer": {
          "__typename": "XFBContactsHomeDefaultRenderer",
          "viewer": {
            "chat_sidebar_is_collapsed": false,
            "messenger_inbox_tray_contacts": [],
            "chat_visibility": true
          },
          "__module_operation_CometHomeContactsContainerQuery": null,
          "__module_component_CometHomeContactsContainerQuery": null
        },
        "id": "61594285317994"
      }
    }
  },
  "errors": [
    {
      "message": "A server error field_exception occured. Check server logs for details.",
      "severity": "ERROR",
      "mids": [
        "001189db2a4071a04b876426152dd738"
      ],
      "debug_link": "https://www.meta.com/debug/?mid=001189db2a4071a04b876426152dd738",
      "path": [
        "viewer",
        "actor",
        "contacts_home_renderer",
        "__module_operation_CometHomeContactsContainerQuery"
      ]
    },
    {
      "message": "A server error field_exception occured. Check server logs for details.",
      "severity": "ERROR",
      "mids": [
        "38b7283558dc534b70b66c65fc1fcb18"
      ],
      "debug_link": "https://www.meta.com/debug/?mid=38b7283558dc534b70b66c65fc1fcb18",
      "path": [
        "viewer",
        "actor",
        "contacts_home_renderer",
        "__module_component_CometHomeContactsContainerQuery"
      ]
    }
  ],
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038436478,
      "time_at_flush_ms": 1793038436509
    },
    "is_final": true
  }
}
```

**runs/host/20261026T180628_61594285317994**, step 40: goto /messages/: 200, 306 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeContactsContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "numContactsToFetch": 17,
    "scale": 1
  },
  "doc_id": "28451034771148738"
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

The home page's contacts column: friends.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
