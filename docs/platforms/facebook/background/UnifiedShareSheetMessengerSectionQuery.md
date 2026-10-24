# UnifiedShareSheetMessengerSectionQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `23993111606963614` |
| Path | `/api/graphql/` |
| Sends | `__relay_internal__pv__isAttachmentsQueryOptimizationEnabledrelayprovider`, `__relay_internal__pv__isWaAddressableFieldsEnabledrelayprovider` |
| Reads | `...UnifiedShareSheetMessengerHscroll_messenger` |
| Called from | `UnifiedShareSheetMessengerSection.react` |
| rea | `ev_4e9844fcc357413d99295417750833b29f6f0dc5dbf4020e81d9cb65904242c5` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 20: clickRole button "…" | 1 | 200 | 1619 ms | 1289 ms | — |
| inspect | scroll: +515px in 13 wheel steps, 656 ms | 1 | 200 | 443 ms | 270626 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261024T060921_61594063207669**, scroll: +515px in 13 wheel steps, 656 ms: 200, 443 ms

Sent:

```json
{
  "qpl_active_flow_ids": "431626709",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "UnifiedShareSheetMessengerSectionQuery",
  "server_timestamps": "true",
  "variables": {
    "__relay_internal__pv__isAttachmentsQueryOptimizationEnabledrelayprovider": true,
    "__relay_internal__pv__isWaAddressableFieldsEnabledrelayprovider": true
  },
  "doc_id": "23993111606963614",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=431626709"
  ]
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "messenger_suggested_recipients": {
        "nodes": [
          {
            "section_type": "RECENTS",
            "attachments_pageable": {
              "edges": []
            },
            "id": "messengerbroadcastsection:recents"
          },
          {
            "section_type": "COMMUNITY_CHATS",
            "attachments_pageable": {
              "edges": []
            },
            "id": "messengerbroadcastsection:community_chats"
          },
          {
            "section_type": "GROUPS",
            "attachments_pageable": {
              "edges": []
            },
            "id": "messengerbroadcastsection:groups"
          },
          {
            "section_type": "CONTACTS",
            "attachments_pageable": {
              "edges": []
            },
            "id": "messengerbroadcastsection:contacts"
          }
        ]
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792824467799,
      "time_at_flush_ms": 1792824467843
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Loads the Messenger section of Facebook's share dialog (`UnifiedShareSheetMessengerHscroll_messenger`). It fired in the same `log inspect` snapshot steps as `CometUnifiedShareSheetDialogQuery`, within a few ms of it, so it is part of that dialog loading.

## What our machine does with it

Nothing. None of our machines opens a share dialog (`reelOrderer.ts`: no save, follow or share), and no code refers to this request. No state waits for it or reads it.

## What can go wrong

None seen: three calls, all 200 in 400-465 ms. Nothing of ours depends on it.
