# MWChatEncryptedBackupsUpsellMessengerInboxQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `25840958432234114` |
| Path | `/api/graphql/` |
| Sends | `doesUserHaveAnEB`, `shouldShowOnboardingInterstitial` |
| Reads | `...useEncryptedBackupsProcessStatePreLoaded_query`, `xfb_backup....useHasRestoreInterstitialSoftblockBeenDismissed_xfbBackup` |
| Called from | `MWChatEncryptedBackupsUpsellMessengerInbox.react` |
| rea | `ev_0427856e5e318d591f009ff82849b7d874599abd152a910cd4f4932c27587954` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 496 ms | 1354422 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T155857_61594063207669**, step 3: goto /marketplace/inbox: 200, 496 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MWChatEncryptedBackupsUpsellMessengerInboxQuery",
  "server_timestamps": "true",
  "variables": {
    "doesUserHaveAnEB": true,
    "shouldShowOnboardingInterstitial": false
  },
  "doc_id": "25840958432234114"
}
```

Answered:

```json
{
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
      "__typename": "XFBEncryptedBackup",
      "last_sync_time": 1792663634
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
      },
      "encrypted_backups_web_evergreen_pin_upsell_display_timestamp": null
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792686212087,
      "time_at_flush_ms": 1792686212157
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Whether Messenger's inbox should show the encrypted-backups onboarding or the restore soft-block (`doesUserHaveAnEB`, `shouldShowOnboardingInterstitial`): the screen behind "Create a PIN to access your chats on any device".

## What our machine does with it

Nothing reads it directly. The screen it decides is the page state `messengerPinCreate` (or `messengerPinEnter`), which the hook resolves with the recorded flow when the account's PIN is in Twenty (rule 67).

## What can go wrong

Seen only with 200. When it says to show the interstitial, the inbox stays behind the PIN screen until the flow runs; the check would then read no chats until it is cleared.
