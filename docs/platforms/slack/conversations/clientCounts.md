# clientCounts

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | conversations |
| Kind | query |
| doc_id | — |
| Path | `/api/client.counts` |
| Sends | `------WebKitFormBoundaryG3sqoOyD3ACJvPlS
Content-Disposition: form-data; name`, `------WebKitFormBoundaryHqp8uZ6lB21nDPhx
Content-Disposition: form-data; name`, `------WebKitFormBoundaryJIvuj0Foq8HPDwjY
Content-Disposition: form-data; name` |
| Reads | `ok`, `threads.has_unreads`, `threads.mention_count`, `threads.vip_count`, `threads.mention_count_by_channel`, `threads.unread_count_by_channel`, `channels`, `mpims`, `ims`, `file_channels.quip`, `file_channels.list`, `activity_v2.at_user` and 28 more |
| Called from | `runs/inspect/20261103T065639_mattSlack/script29.js:146 bvjQ`, `runs/inspect/20261103T065639_mattSlack/script3.js:2954 bvjQ`, `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous` |
| rea | `ev_a86fe74a91fad953021f06e73c8039c1c3b2b4c52523fba8841e4164ca4de847` |

Seen 3 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 560 ms | 3155 ms | — |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 1 | 200 | 316 ms | 2221 ms | — |
| inspect | step 7: pageText | 1 | 200 | 339 ms | 44069 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 560 ms

Sent:

```json
{
  "query": {
    "_x_id": "noversion-1793689060.897",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_version_ts": "1793684253",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryG3sqoOyD3ACJvPlS\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryG3sqoOyD3ACJvPlS\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetch-client-counts-data\r\n------WebKitFormBoundaryG3sqoOyD3ACJvPlS\r\nContent-Disposition: form-data; name=\"thread_counts_by_channel\"\r\n\r\ntrue\r\n------WebKitFormBoundaryG3sqoOyD3ACJvP… (936 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "threads": {
    "has_unreads": true,
    "mention_count": 0,
    "vip_count": 0,
    "mention_count_by_channel": {},
    "unread_count_by_channel": {
      "D0C8VAE7REU": 5
    }
  },
  "channels": [
    {
      "id": "C0C4L7RSTGX",
      "last_read": "1790614677.128359",
      "latest": "0000000000.000000",
      "updated": "0000000000.000000",
      "history_invalid": "0000000000.000000",
      "mention_count": 0,
      "has_unreads": false
    },
    {
      "id": "C0C559K0JA0",
      "last_read": "1790614677.298429",
      "latest": "0000000000.000000",
      "updated": "0000000000.000000",
      "history_invalid": "0000000000.000000",
      "mention_count": 0,
      "has_unreads": false
    },
    {
      "id": "C0CCTFK2D5G",
      "last_read": "0000000000.000000",
      "latest": "1793180188.288059",
      "updated": "0000000000.000000",
      "history_invalid": "0000000000.000000",
      "mention_count": 0,
      "has_unreads": true
    }
  ],
  "mpims": [],
  "ims": [
    {
      "id": "D0C4VCJA6NP",
      "last_read": "1790614725.624499",
      "latest": "1793180184.720269",
      "updated": "0000000000.000000",
      "history_invalid": "0000000000.000000",
      "mention_count": 1,
      "has_unreads": true
    },
    {
      "id": "D0C559JJT6Y",
      "last_read": "0000000000.000000",
      "latest": "0000000000.000000",
      "updated": "0000000000.000000",
      "history_invalid": "0000000000.000000",
      "mention_count": 0,
      "has_unreads": false
    },
    {
      "id": "D0C5W04RGPJ",
      "last_read": "0000000000.000000",
      "latest": "0000000000.000000",
      "updated": "0000000000.000000",
      "history_invalid": "0000000000.000000",
      "mention_count": 0,
      "has_unreads": false
    },
    {
      "id": "D0C8VAE7REU",
      "last_read": "1793689024.177609",
      "latest": "1793689024.177609",
      "updated": "1793688218.000400",
      "history_invalid": "1793273886.000400",
      "mention_count": 0,
      "has_unreads": false
    }
  ],
  "file_channels": {
    "quip": {
      "mention_count_by_channel": {}
    },
    "list": {
      "mention_count_by_channel": {}
    }
  },
  "activity_v2": {
    "at_user": 0,
    "at_user_group": 0,
    "at_channel": 0,
    "at_everyone": 0,
    "channel": 0,
    "dm": 0,
    "keyword": 0,
    "message_reaction": 0,
    "internal_channel_invite": 0,
    "external_channel_invite": 0,
    "external_dm_invite": 0,
    "shared_workspace_invite": 0,
    "team_joiner_invite": 0,
    "unjoined_channel_mention": 0,
    "list_record_assigned": 0,
    "list_record_edited": 0,
    "list_user_mentioned": 0,
    "list_todo_notification": 0,
    "list_approval_request": 0,
    "list_approval_reviewed": 0,
    "bot_dm_bundle": 1,
    "thread_v2": 5,
    "saved_reminder": 0,
    "prejoin_dm_welcome_party_alert": 0,
    "quietly_added_to_channel": 0,
    "code_review_requested": 0
  },
  "channel_badges": {
    "channels": 0,
    "dms": 0,
    "app_dms": 1,
    "thread_mentions": 0,
    "thread_unreads": 5
  },
  "alerts": {
    "external_channel_invite": 0,
    "external_dm_invite": 0,
    "shared_workspace_invite": 0,
    "sales_home_notification": 0,
    "lists_user_mentioned": 0,
    "lists_record_assigned": 0,
    "lists_record_edited": 0,
    "lists_todo_notification": 0,
    "lists_approval_request": 0,
    "lists_approval_reviewed": 0,
    "huddles_missed_huddle": 0,
    "calendar_upcoming_event": 0,
    "unjoined_channel_mention": 0,
    "generic_system_alert": 0,
    "prejoin_dm_welcome_party_alert": 0,
    "quietly_added_to_channel": 0,
    "code_review_requested": 0
  },
  "saved": {
    "uncompleted_count": 0,
    "uncompleted_overdue_count": 0,
    "archived_count": 0,
    "completed_count": 0,
    "total_count": 0
  },
  "counts_last_fetched": 1793689060
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 316 ms

Sent:

```json
{
  "query": {
    "_x_id": "noversion-1793689117.047",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_version_ts": "1793684253",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryHqp8uZ6lB21nDPhx\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryHqp8uZ6lB21nDPhx\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetch-client-counts-data\r\n------WebKitFormBoundaryHqp8uZ6lB21nDPhx\r\nContent-Disposition: form-data; name=\"thread_counts_by_channel\"\r\n\r\ntrue\r\n------WebKitFormBoundaryHqp8uZ6lB21nDP… (936 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "threads": {
    "has_unreads": true,
    "mention_count": 0,
    "vip_count": 0,
    "mention_count_by_channel": {},
    "unread_count_by_channel": {
      "D0C8VAE7REU": 5
    }
  },
  "channels": [
    {
      "id": "C0C4L7RSTGX",
      "last_read": "1790614677.128359",
      "latest": "0000000000.000000",
      "updated": "0000000000.000000",
      "history_invalid": "0000000000.000000",
      "mention_count": 0,
      "has_unreads": false
    },
    {
      "id": "C0C559K0JA0",
      "last_read": "1790614677.298429",
      "latest": "0000000000.000000",
      "updated": "0000000000.000000",
      "history_invalid": "0000000000.000000",
      "mention_count": 0,
      "has_unreads": false
    },
    {
      "id": "C0CCTFK2D5G",
      "last_read": "0000000000.000000",
      "latest": "1793180188.288059",
      "updated": "0000000000.000000",
      "history_invalid": "0000000000.000000",
      "mention_count": 0,
      "has_unreads": true
    }
  ],
  "mpims": [],
  "ims": [
    {
      "id": "D0C4VCJA6NP",
      "last_read": "1790614725.624499",
      "latest": "1793180184.720269",
      "updated": "0000000000.000000",
      "history_invalid": "0000000000.000000",
      "mention_count": 1,
      "has_unreads": true
    },
    {
      "id": "D0C559JJT6Y",
      "last_read": "0000000000.000000",
      "latest": "0000000000.000000",
      "updated": "0000000000.000000",
      "history_invalid": "0000000000.000000",
      "mention_count": 0,
      "has_unreads": false
    },
    {
      "id": "D0C5W04RGPJ",
      "last_read": "0000000000.000000",
      "latest": "0000000000.000000",
      "updated": "0000000000.000000",
      "history_invalid": "0000000000.000000",
      "mention_count": 0,
      "has_unreads": false
    },
    {
      "id": "D0C8VAE7REU",
      "last_read": "1793689111.667059",
      "latest": "1793689111.667059",
      "updated": "1793688218.000400",
      "history_invalid": "1793273886.000400",
      "mention_count": 0,
      "has_unreads": false
    }
  ],
  "file_channels": {
    "quip": {
      "mention_count_by_channel": {}
    },
    "list": {
      "mention_count_by_channel": {}
    }
  },
  "activity_v2": {
    "at_user": 0,
    "at_user_group": 0,
    "at_channel": 0,
    "at_everyone": 0,
    "channel": 0,
    "dm": 0,
    "keyword": 0,
    "message_reaction": 0,
    "internal_channel_invite": 0,
    "external_channel_invite": 0,
    "external_dm_invite": 0,
    "shared_workspace_invite": 0,
    "team_joiner_invite": 0,
    "unjoined_channel_mention": 0,
    "list_record_assigned": 0,
    "list_record_edited": 0,
    "list_user_mentioned": 0,
    "list_todo_notification": 0,
    "list_approval_request": 0,
    "list_approval_reviewed": 0,
    "bot_dm_bundle": 1,
    "thread_v2": 5,
    "saved_reminder": 0,
    "prejoin_dm_welcome_party_alert": 0,
    "quietly_added_to_channel": 0,
    "code_review_requested": 0
  },
  "channel_badges": {
    "channels": 0,
    "dms": 0,
    "app_dms": 1,
    "thread_mentions": 0,
    "thread_unreads": 5
  },
  "alerts": {
    "external_channel_invite": 0,
    "external_dm_invite": 0,
    "shared_workspace_invite": 0,
    "sales_home_notification": 0,
    "lists_user_mentioned": 0,
    "lists_record_assigned": 0,
    "lists_record_edited": 0,
    "lists_todo_notification": 0,
    "lists_approval_request": 0,
    "lists_approval_reviewed": 0,
    "huddles_missed_huddle": 0,
    "calendar_upcoming_event": 0,
    "unjoined_channel_mention": 0,
    "generic_system_alert": 0,
    "prejoin_dm_welcome_party_alert": 0,
    "quietly_added_to_channel": 0,
    "code_review_requested": 0
  },
  "saved": {
    "uncompleted_count": 0,
    "uncompleted_overdue_count": 0,
    "archived_count": 0,
    "completed_count": 0,
    "total_count": 0
  },
  "counts_last_fetched": 1793689117
}
```

**runs/inspect/20261103T065639_mattSlack**, step 7: pageText: 200, 339 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689187.756",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "aVvVPXA0sak",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryJIvuj0Foq8HPDwjY\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryJIvuj0Foq8HPDwjY\r\nContent-Disposition: form-data; name=\"thread_counts_by_channel\"\r\n\r\ntrue\r\n------WebKitFormBoundaryJIvuj0Foq8HPDwjY\r\nContent-Disposition: form-data; name=\"org_wide_aware\"\r\n\r\ntrue\r\n------WebKitFormBoundaryJIvuj0Foq8HPDwjY\r\nContent-Dis… (1157 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "threads": {
    "has_unreads": true,
    "mention_count": 0,
    "vip_count": 0,
    "mention_count_by_channel": {},
    "unread_count_by_channel": {
      "D0C8VAE7REU": 5
    }
  },
  "channels": [
    {
      "id": "C0C4L7RSTGX",
      "last_read": "1790614677.128359",
      "latest": "0000000000.000000",
      "updated": "0000000000.000000",
      "history_invalid": "0000000000.000000",
      "mention_count": 0,
      "has_unreads": false
    },
    {
      "id": "C0C559K0JA0",
      "last_read": "1790614677.298429",
      "latest": "0000000000.000000",
      "updated": "0000000000.000000",
      "history_invalid": "0000000000.000000",
      "mention_count": 0,
      "has_unreads": false
    },
    {
      "id": "C0CCTFK2D5G",
      "last_read": "0000000000.000000",
      "latest": "1793180188.288059",
      "updated": "0000000000.000000",
      "history_invalid": "0000000000.000000",
      "mention_count": 0,
      "has_unreads": true
    }
  ],
  "mpims": [],
  "ims": [
    {
      "id": "D0C4VCJA6NP",
      "last_read": "1790614725.624499",
      "latest": "1793180184.720269",
      "updated": "0000000000.000000",
      "history_invalid": "0000000000.000000",
      "mention_count": 1,
      "has_unreads": true
    },
    {
      "id": "D0C559JJT6Y",
      "last_read": "0000000000.000000",
      "latest": "0000000000.000000",
      "updated": "0000000000.000000",
      "history_invalid": "0000000000.000000",
      "mention_count": 0,
      "has_unreads": false
    },
    {
      "id": "D0C5W04RGPJ",
      "last_read": "0000000000.000000",
      "latest": "0000000000.000000",
      "updated": "0000000000.000000",
      "history_invalid": "0000000000.000000",
      "mention_count": 0,
      "has_unreads": false
    },
    {
      "id": "D0C8VAE7REU",
      "last_read": "1793689118.238869",
      "latest": "1793689118.238869",
      "updated": "1793688218.000400",
      "history_invalid": "1793273886.000400",
      "mention_count": 0,
      "has_unreads": false
    }
  ],
  "file_channels": {
    "quip": {
      "mention_count_by_channel": {}
    },
    "list": {
      "mention_count_by_channel": {}
    }
  },
  "activity_v2": {
    "at_user": 0,
    "at_user_group": 0,
    "at_channel": 0,
    "at_everyone": 0,
    "channel": 0,
    "dm": 0,
    "keyword": 0,
    "message_reaction": 0,
    "internal_channel_invite": 0,
    "external_channel_invite": 0,
    "external_dm_invite": 0,
    "shared_workspace_invite": 0,
    "team_joiner_invite": 0,
    "unjoined_channel_mention": 0,
    "list_record_assigned": 0,
    "list_record_edited": 0,
    "list_user_mentioned": 0,
    "list_todo_notification": 0,
    "list_approval_request": 0,
    "list_approval_reviewed": 0,
    "bot_dm_bundle": 1,
    "thread_v2": 5,
    "saved_reminder": 0,
    "prejoin_dm_welcome_party_alert": 0,
    "quietly_added_to_channel": 0,
    "code_review_requested": 0
  },
  "channel_badges": {
    "channels": 0,
    "dms": 0,
    "app_dms": 1,
    "thread_mentions": 0,
    "thread_unreads": 5
  },
  "alerts": {
    "external_channel_invite": 0,
    "external_dm_invite": 0,
    "shared_workspace_invite": 0,
    "sales_home_notification": 0,
    "lists_user_mentioned": 0,
    "lists_record_assigned": 0,
    "lists_record_edited": 0,
    "lists_todo_notification": 0,
    "lists_approval_request": 0,
    "lists_approval_reviewed": 0,
    "huddles_missed_huddle": 0,
    "calendar_upcoming_event": 0,
    "unjoined_channel_mention": 0,
    "generic_system_alert": 0,
    "prejoin_dm_welcome_party_alert": 0,
    "quietly_added_to_channel": 0,
    "code_review_requested": 0
  },
  "saved": {
    "uncompleted_count": 0,
    "uncompleted_overdue_count": 0,
    "archived_count": 0,
    "completed_count": 0,
    "total_count": 0
  },
  "counts_last_fetched": 1793689187
}
```

<!-- facts:end -->

## What it does

Asks for the unread and mention counters (`threads.has_unreads`, `threads.mention_count`, `unread_count_by_channel`, `channels`, `ims`, `mpims`, `activity_v2.at_user`...): it fired at page load in step 4 (560 ms), again in step 6 (316 ms) and once more in step 7 pageText (339 ms), all 200.

## What our machine does with it

The engine's own watch and read do not call it: `python/slackApi/engine.py` uses only the websocket and `conversations.history`. The vendored `gabriel/client/recovery.py` calls `client.counts` to find which channels fell behind after a gap, but the engine drives `GabrielCore`, not that recovery client, so catch-up (rule 135) goes through `read` with `oldest` instead.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. If it were refused or ever rate limited (429), a recovery built on it would have to stop, since a refusal stops the run (rule 94); today nothing in the engine depends on it.
