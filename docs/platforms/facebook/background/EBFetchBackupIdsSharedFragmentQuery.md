# EBFetchBackupIdsSharedFragmentQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `25164225499885252` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `...EBFetchBackupIdsSharedFragment` |
| Called from | `EBFetchBackupIdsSharedFragment.graphql` |
| rea | `ev_e9b67921b83e1e4b1e1e87836c9b6acfe8abcfcc56deb5844bbdff1bb58749b7` |

Seen 6 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | pin: typed the account's Messenger PIN | 6 | 200 | 360–457 ms | 9081–11927 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T100521_61594063207669**, pin: typed the account's Messenger PIN: 200, 457 ms

Sent:

```json
{
  "qpl_active_flow_ids": "521482085,521482858",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "EBFetchBackupIdsSharedFragmentQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "25164225499885252",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=521482085,521482858"
  ]
}
```

Answered:

```json
{
  "data": {
    "xfb_backup": {
      "id": "1127653843075648",
      "backup_tenancy": "PRODUCTION",
      "is_user_opted_out": false,
      "has_otc_eligible_devices": false,
      "encryption_management_delegator_id": null,
      "virtual_devices": [
        {
          "client_generated_id": "sp5MI2FeHD/hrI1wOQXbKg==",
          "device_type": "HSM",
          "device_created_on": "Chrome",
          "creation_time": 1792663635,
          "migration_status": "DOES_NOT_REQUIRE_MIGRATION",
          "id": "1127653853075647"
        }
      ],
      "devices": {
        "edges": [
          {
            "node": {
              "id": "1127653846408981"
            }
          }
        ]
      }
    },
    "xfb_eb_user_preferences": null
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792663636078,
      "time_at_flush_ms": 1792663636210
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Messenger's encrypted-backup ids (`EB` is encrypted backups): once the PIN is registered, the page fetches the account's backup ids so the chat history can be stored behind it. It fired twice in the confirm `pin` step, 9-12 s in, after Finish.

## What our machine does with it

Nothing waits for it. It is the page settling after the PIN: the `messengerPinCreate` flow is done once Finish answered, and the inbox snapshot follows. It shows the backup now exists, the same backup the PIN dialog asked for.

## What can go wrong

None seen: both calls answered 200 in 360-457 ms. A failure would only delay the backup; the PIN is already set and the inbox stays open.
