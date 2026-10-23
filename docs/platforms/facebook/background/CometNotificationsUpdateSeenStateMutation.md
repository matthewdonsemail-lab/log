# CometNotificationsUpdateSeenStateMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `32345368141745868` |
| Path | `/api/graphql/` |
| Sends | `environment`, `input` |
| Reads | `notifications_update_seen_or_read.notifications`, `notifications_update_seen_or_read.viewer` |
| Called from | `CometNotificationsUpdateSeenStateMutation` |
| rea | `ev_93bb6af69452a5ed938292ec5a182e1e93cfbf55e743c8f55451b1103fbb50e5` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 19: clickRole button "…" | 1 | 200 | 5545 ms | 1475 ms | — |
| inspect | step 1: goto /marketplace/status | 1 | 200 | 5412 ms | 18509 ms | — |
| inspect | step 7: goto / | 1 | 200 | 6024 ms | 110426 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T045453_61594063207669**, step 7: goto /: 200, 6024 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometNotificationsUpdateSeenStateMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "environment": "MAIN_SURFACE",
      "is_comet": true,
      "last_notif_sync_time": 1792731669,
      "notif_ids": [
        "bm90aWZpY2F0aW9uOjYxNTk0MDYzMjA3NjY5OjE3OTI3Mjc0MDI0ODc4ODQ6NDUxNzYxNzExNTI2Njg3Ok1BSU5fU1VSRkFDRQ==",
        "bm90aWZpY2F0aW9uOjYxNTk0MDYzMjA3NjY5OjE3OTI3MDU3MDQ3MjY3ODk6NDUxNzYxNzExNTI2Njg3Ok1BSU5fU1VSRkFDRQ==",
        "bm90aWZpY2F0aW9uOjYxNTk0MDYzMjA3NjY5OjE3OTI0OTQ3ODA5MDA5MzU6NDUxNzYxNzExNTI2Njg3Ok1BSU5fU1VSRkFDRQ==",
        "bm90aWZpY2F0aW9uOjYxNTk0MDYzMjA3NjY5OjE3OTI0NjAxMzg5Mjc1MzM6NDUxNzYxNzExNTI2Njg3Ok1BSU5fU1VSRkFDRQ=="
      ],
      "query_id": "Cg8BdAZq2uoVDwNlbnYPDE1BSU5fU1VSRkFDRQ8CZnQKAQ8CcXQPBWZpcnN0DwJxZgoCAA8ISVNfQ09NRVQCAQ8VSU5DTFVERV9XQV9QMkJfTk9USUZTAQ8DZWZ0DgE=",
      "source": "unknown",
      "update_type": "MARK_ALL_SEEN",
      "actor_id": "61594063207669",
      "client_mutation_id": "1"
    },
    "environment": "MAIN_SURFACE"
  },
  "doc_id": "32345368141745868"
}
```

Answered:

```json
{
  "data": {
    "notifications_update_seen_or_read": {
      "notifications": [
        {
          "id": "bm90aWZpY2F0aW9uOjYxNTk0MDYzMjA3NjY5OjE3OTI3Mjc0MDI0ODc4ODQ6NDUxNzYxNzExNTI2Njg3Ok1BSU5fU1VSRkFDRQ==",
          "seen_state": "SEEN_BUT_UNREAD",
          "cache_timestamp": 1792731774
        },
        {
          "id": "bm90aWZpY2F0aW9uOjYxNTk0MDYzMjA3NjY5OjE3OTI3MDU3MDQ3MjY3ODk6NDUxNzYxNzExNTI2Njg3Ok1BSU5fU1VSRkFDRQ==",
          "seen_state": "SEEN_BUT_UNREAD",
          "cache_timestamp": 1792731774
        },
        {
          "id": "bm90aWZpY2F0aW9uOjYxNTk0MDYzMjA3NjY5OjE3OTI0OTQ3ODA5MDA5MzU6NDUxNzYxNzExNTI2Njg3Ok1BSU5fU1VSRkFDRQ==",
          "seen_state": "SEEN_BUT_UNREAD",
          "cache_timestamp": 1792731774
        },
        {
          "id": "bm90aWZpY2F0aW9uOjYxNTk0MDYzMjA3NjY5OjE3OTI0NjAxMzg5Mjc1MzM6NDUxNzYxNzExNTI2Njg3Ok1BSU5fU1VSRkFDRQ==",
          "seen_state": "SEEN_BUT_UNREAD",
          "cache_timestamp": 1792731774
        }
      ],
      "viewer": {
        "notifications_unseen_count": 0
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792731774171,
      "time_at_flush_ms": 1792731779568
    },
    "is_final": true
  }
}
```

**runs/inspect/20261023T000744_61594063207669**, step 1: goto /marketplace/status: 200, 5412 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometNotificationsUpdateSeenStateMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "environment": "MAIN_SURFACE",
      "is_comet": true,
      "last_notif_sync_time": 1792714089,
      "notif_ids": [
        "bm90aWZpY2F0aW9uOjYxNTk0MDYzMjA3NjY5OjE3OTI3MDU3MDQ3MjY3ODk6NDUxNzYxNzExNTI2Njg3Ok1BSU5fU1VSRkFDRQ==",
        "bm90aWZpY2F0aW9uOjYxNTk0MDYzMjA3NjY5OjE3OTI0OTQ3ODA5MDA5MzU6NDUxNzYxNzExNTI2Njg3Ok1BSU5fU1VSRkFDRQ==",
        "bm90aWZpY2F0aW9uOjYxNTk0MDYzMjA3NjY5OjE3OTI0NjAxMzg5Mjc1MzM6NDUxNzYxNzExNTI2Njg3Ok1BSU5fU1VSRkFDRQ==",
        "bm90aWZpY2F0aW9uOjYxNTk0MDYzMjA3NjY5OjE3OTI0NTQ4MzU0NzkyODE6NDUxNzYxNzExNTI2Njg3Ok1BSU5fU1VSRkFDRQ==",
        "bm90aWZpY2F0aW9uOjYxNTk0MDYzMjA3NjY5OjE3OTI0NTM4NTM4Nzg4MjI6NDUxNzYxNzExNTI2Njg3Ok1BSU5fU1VSRkFDRQ=="
      ],
      "query_id": "Cg8BdAZq2qVpDwNlbnYPDE1BSU5fU1VSRkFDRQ8CZnQKAQ8CcXQPBWZpcnN0DwJxZgoCAA8ISVNfQ09NRVQCAQ8VSU5DTFVERV9XQV9QMkJfTk9USUZTAQ8DZWZ0DgE=",
      "source": "unknown",
      "update_type": "MARK_ALL_SEEN",
      "actor_id": "61594063207669",
      "client_mutation_id": "1"
    },
    "environment": "MAIN_SURFACE"
  },
  "doc_id": "32345368141745868"
}
```

Answered:

```json
{
  "data": {
    "notifications_update_seen_or_read": {
      "notifications": [
        {
          "id": "bm90aWZpY2F0aW9uOjYxNTk0MDYzMjA3NjY5OjE3OTI3MDU3MDQ3MjY3ODk6NDUxNzYxNzExNTI2Njg3Ok1BSU5fU1VSRkFDRQ==",
          "seen_state": "SEEN_BUT_UNREAD",
          "cache_timestamp": 1792714102
        },
        {
          "id": "bm90aWZpY2F0aW9uOjYxNTk0MDYzMjA3NjY5OjE3OTI0OTQ3ODA5MDA5MzU6NDUxNzYxNzExNTI2Njg3Ok1BSU5fU1VSRkFDRQ==",
          "seen_state": "SEEN_BUT_UNREAD",
          "cache_timestamp": 1792714102
        },
        {
          "id": "bm90aWZpY2F0aW9uOjYxNTk0MDYzMjA3NjY5OjE3OTI0NjAxMzg5Mjc1MzM6NDUxNzYxNzExNTI2Njg3Ok1BSU5fU1VSRkFDRQ==",
          "seen_state": "SEEN_BUT_UNREAD",
          "cache_timestamp": 1792714102
        },
        {
          "id": "bm90aWZpY2F0aW9uOjYxNTk0MDYzMjA3NjY5OjE3OTI0NTQ4MzU0NzkyODE6NDUxNzYxNzExNTI2Njg3Ok1BSU5fU1VSRkFDRQ==",
          "seen_state": "SEEN_BUT_UNREAD",
          "cache_timestamp": 1792714102
        },
        {
          "id": "bm90aWZpY2F0aW9uOjYxNTk0MDYzMjA3NjY5OjE3OTI0NTM4NTM4Nzg4MjI6NDUxNzYxNzExNTI2Njg3Ok1BSU5fU1VSRkFDRQ==",
          "seen_state": "SEEN_BUT_UNREAD",
          "cache_timestamp": 1792714102
        }
      ],
      "viewer": {
        "notifications_unseen_count": 0
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792714102758,
      "time_at_flush_ms": 1792714107848
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Marks the account's notifications as seen (`notifications_update_seen_or_read`). It fired on run 20261020T162343 when the notifications list, opened from "Notifications, 9 unread", was closed with Escape (5545 ms); the bell's count went from 9 to none.

## What our machine does with it

Reading notifications is recorded (step 19: each notification is a link with its text and age, and a "Mark as read" button), not yet a flow: the bell's name carries the unread count ("Notifications, 9 unread"), so a flow clicking it by exact name would break as the count changes. Opening the list marks everything seen, so a reader that must not change state reads the list without closing it this way, or accepts that it marks them seen.

## What can go wrong

None seen. A failure would leave the count showing; nothing else.
