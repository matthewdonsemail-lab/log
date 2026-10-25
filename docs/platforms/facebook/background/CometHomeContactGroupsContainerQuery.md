# CometHomeContactGroupsContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `25945115421852941` |
| Path | `/api/graphql/` |
| Sends | `excludeBroadcastChannelThreads`, `excludeCmThreads`, `__relay_internal__pv__WebPixelRatiorelayprovider` |
| Reads | `viewer....CometHomeContactGroups_viewer` |
| Called from | `CometHomeContactGroupsContainer.react` |
| rea | `ev_afbb77778bb0832d0311179d99af4e1015fdbeadac3bded27db6e5939b581138` |

Seen 28 time(s) in 17 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 786 ms | 13574 ms | — |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 826 ms | 12041 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 983 ms | 7073 ms | — |
| warmup | step 11: goto /marketplace/ | 2 | 200 | 786–970 ms | 8614–15112 ms | — |
| warmup | step 17: goto /marketplace/ | 1 | 200 | 736 ms | 12050 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 807 ms | 1258010 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 584 ms | 5485 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 640 ms | 8259 ms | — |
| inspect | step 96: clickRole button "…" | 1 | 200 | 573 ms | 1305460 ms | — |
| inspect | step 4: snapshot | 1 | 200 | 880 ms | 349 ms | — |
| inspect | pin: typed the account's Messenger PIN | 1 | 200 | 803 ms | 564 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 805 ms | 6685 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 802 ms | 103698 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 1 | 200 | 835 ms | 5706 ms | — |
| inspect | step 4: goto /marketplace/inbox | 2 | 200 | 883–1126 ms | 558525–564749 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 1626 ms | 59466 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 2664 ms | 11553 ms | — |
| inspect | step 6: goto /marketplace/inbox | 1 | 200 | 1122 ms | 1708110 ms | — |
| inspect | openAny: read /marketplace/item/<id>/ | 1 | 200 | 877 ms | 15218 ms | — |
| warmup | step 14: goto /marketplace/ | 1 | 200 | 787 ms | 7200 ms | — |
| inspect | scroll: +386px in 10 wheel steps, 531 ms | 1 | 200 | 793 ms | 18351 ms | — |
| host | expected ProfileCometProfilePictureSetMutation: sent | 2 | 200 | 689–895 ms | 45811–1773949 ms | — |
| host | setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9 | 1 | 200 | 869 ms | 219896 ms | — |
| inspect | step 1: goto /marketplace/status | 1 | 200 | 737 ms | 12045 ms | — |
| inspect | step 4: goto /marketplace/status | 1 | 200 | 691 ms | 9219 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/warmup/20261023T074930_61594063207669**, step 11: goto /marketplace/: 200, 970 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeContactGroupsContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "excludeBroadcastChannelThreads": true,
    "excludeCmThreads": true,
    "__relay_internal__pv__WebPixelRatiorelayprovider": 1
  },
  "doc_id": "25945115421852941"
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
        "id": "61594063207669"
      },
      "chat_sidebar_is_collapsed": false,
      "chat_visibility": true,
      "message_threads": {
        "edges": []
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792742237966,
      "time_at_flush_ms": 1792742238183
    },
    "is_final": true
  }
}
```

**runs/warmup/20261023T074930_61594063207669**, step 14: goto /marketplace/: 200, 787 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeContactGroupsContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "excludeBroadcastChannelThreads": true,
    "excludeCmThreads": true,
    "__relay_internal__pv__WebPixelRatiorelayprovider": 1
  },
  "doc_id": "25945115421852941"
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
        "id": "61594063207669"
      },
      "chat_sidebar_is_collapsed": false,
      "chat_visibility": true,
      "message_threads": {
        "edges": []
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792742396611,
      "time_at_flush_ms": 1792742396928
    },
    "is_final": true
  }
}
```

**runs/inspect/20261025T065539_61593939852820**, step 1: goto /marketplace/status: 200, 737 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeContactGroupsContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "excludeBroadcastChannelThreads": true,
    "excludeCmThreads": true,
    "__relay_internal__pv__WebPixelRatiorelayprovider": 1
  },
  "doc_id": "25945115421852941"
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
        "id": "61593939852820"
      },
      "chat_sidebar_is_collapsed": false,
      "chat_visibility": true,
      "message_threads": {
        "edges": []
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792911375716,
      "time_at_flush_ms": 1792911376049
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

The home page's contacts column: group chats.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
