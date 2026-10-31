# MWThreadListQPQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `26280754921508865` |
| Path | `/api/graphql/` |
| Sends | `__relay_internal__pv__MWThreadListQP_enableEBWebUXrelayprovider`, `__relay_internal__pv__MWEBNewUserOnboardingShouldLoadUpsellsrelayprovider` |
| Reads | `...MWThreadListQP_query` |
| Called from | `MWThreadListQP.react` |
| rea | `ev_fac3a4787d43e7e54b0b1e89f34f2fe7bb756024faabde3c30ea45217ba1e933` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 524 ms | 1354422 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T155857_61594063207669**, step 3: goto /marketplace/inbox: 200, 524 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MWThreadListQPQuery",
  "server_timestamps": "true",
  "variables": {
    "__relay_internal__pv__MWThreadListQP_enableEBWebUXrelayprovider": true,
    "__relay_internal__pv__MWEBNewUserOnboardingShouldLoadUpsellsrelayprovider": false
  },
  "doc_id": "26280754921508865"
}
```

Answered:

```json
{
  "first": {
    "data": {
      "xfb_backup": {
        "virtual_devices": [
          {
            "client_generated_id": "sp5MI2FeHD/hrI1wOQXbKg==",
            "device_type": "HSM",
            "id": "1127653853075647"
          }
        ],
        "has_otc_eligible_devices": false,
        "id": "1127653843075648"
      },
      "viewer": {
        "messenger_default_encrypted_backup": {
          "vesta_user_info": {
            "attempts_remaining": 10,
            "is_registered": true,
            "login_timeout_remaining_secs": null
          }
        },
        "if_viewer_can_see_messenger_eb_auto_eb_upsells": null
      }
    },
    "extensions": {
      "server_metadata": {
        "request_start_time_ms": 1792686212087,
        "time_at_flush_ms": 1792686212138
      },
      "is_final": false
    }
  },
  "followingParts": 2,
  "parts": [
    {
      "label": "MWEncryptedBackupsThreadListNux_query$defer$MWEncryptedBackupsThreadListRestoreQPWrapperDeferred_query",
      "path": [],
      "data": {
        "xfb_backup": {
          "last_sync_time": 1792663634,
          "id": "1127653843075648"
        }
      },
      "extensions": {
        "is_final": false
      }
    },
    {
      "label": "MWEncryptedBackupsThreadListRestoreQPWrapperDeferred_query$defer$MWEncryptedBackupsThreadListRestoreQPWrapper_query",
      "path": [],
      "data": {
        "xfb_backup": {
          "last_sync_time": 1792663634,
          "id": "1127653843075648"
        },
        "viewer": {
          "messenger_default_encrypted_backup": {
            "vesta_user_info": {
              "attempts_remaining": 10,
              "is_registered": true,
              "login_timeout_remaining_secs": null
            }
          },
          "encrypted_backup": {
            "has_seen_eb_auto_restore_notice": false,
            "id": "1127653843075648"
          }
        }
      },
      "extensions": {
        "is_final": true
      }
    }
  ]
}
```

<!-- facts:end -->

## What it does

Promotions shown above Messenger's thread list (`MWThreadListQP`), including the encrypted-backups prompt when it is enabled. It fires when a thread list loads.

## What our machine does with it

Nothing reads it.

## What can go wrong

Seen only with 200. Failing, it only removes the promotion; the thread list itself comes from the inbox query.
