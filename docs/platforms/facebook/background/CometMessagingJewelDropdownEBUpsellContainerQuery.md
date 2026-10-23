# CometMessagingJewelDropdownEBUpsellContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `25961980840158091` |
| Path | `/api/graphql/` |
| Sends | `__relay_internal__pv__MWEBNewUserOnboardingShouldLoadUpsellsrelayprovider` |
| Reads | `...MWEncryptedBackupsJewelNuxWrapper_query` |
| Called from | `CometMessagingJewelDropdownEBUpsellContainer.react` |
| rea | `ev_9fdcb875b45d48b4564dd5235fa4f00d220e86c6696c908ee222067d4dddeb63` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 674 ms | 1346636 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T155857_61594063207669**, step 3: goto /marketplace/inbox: 200, 674 ms

Sent:

```json
{
  "qpl_active_flow_ids": "30613466",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMessagingJewelDropdownEBUpsellContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "__relay_internal__pv__MWEBNewUserOnboardingShouldLoadUpsellsrelayprovider": false
  },
  "doc_id": "25961980840158091",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=30613466"
  ]
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
        "id": "1127653843075648",
        "__typename": "XFBEncryptedBackup"
      },
      "viewer": {
        "messenger_default_encrypted_backup": {
          "vesta_user_info": {
            "attempts_remaining": 10,
            "is_registered": true,
            "login_timeout_remaining_secs": null
          }
        },
        "if_viewer_can_see_messenger_eb_auto_eb_upsells": null,
        "jewel_qp": {
          "nodes": []
        }
      }
    },
    "extensions": {
      "server_metadata": {
        "request_start_time_ms": 1792686204367,
        "time_at_flush_ms": 1792686204425
      },
      "is_final": false
    }
  },
  "followingParts": 2,
  "parts": [
    {
      "label": "MWEncryptedBackupsJewelNuxWrapper_query$defer$MWEncryptedBackupsThreadListRestoreQPWrapperDeferred_query",
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

Messenger's encrypted-backups upsell for the chats dropdown in the top bar (`MWEncryptedBackupsJewelNuxWrapper`): whether to show the prompt to set up a backup PIN. It fires when the Messenger dropdown loads.

## What our machine does with it

Nothing reads it. The PIN screens themselves are page states the hook resolves (`messengerPinCreate`, `messengerPinEnter`, rule 67).

## What can go wrong

Seen only with 200. If it says to show the upsell, a PIN prompt can appear over Messenger; that prompt is handled as its page state, not from this answer.
