# ProfileCometProfilePictureEditDialogQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `27308360595486690` |
| Path | `/api/graphql/` |
| Sends | `scale` |
| Reads | `viewer....ProfileCometSelfProfilePictureMediaPicker_page`, `viewer....ProfileCometSelfProfilePictureMediaPicker_viewer`, `viewer.actor`, `...useFXIMCometProfilePhotoSyncReminderOnSaveHandler_fxim` |
| Called from | `ProfileCometProfilePictureEditDialog.react` |
| rea | `ev_631faf82feb0aa91596f983ef6d75562e9506a404244a843dcfea4553f081aa5` |

Seen 7 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 3: clickRole menuitem "…" | 2 | 200 | 378–800 ms | 577–606 ms | — |
| inspect | step 3: click e1096 | 1 | 200 | 399 ms | 791 ms | — |
| inspect | step 4: click e1211 | 1 | 200 | 433 ms | 773 ms | — |
| host | step 19: clickRole menuitem "…" | 1 | 200 | 423 ms | 2167 ms | — |
| host | step 37: clickRole menuitem "…" | 1 | 200 | 576 ms | 1744 ms | — |
| host | step 9: clickRole menuitem "…" | 1 | 200 | 193 ms | 618 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, step 9: clickRole menuitem "…": 200, 193 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "ProfileCometProfilePictureEditDialogQuery",
  "server_timestamps": "true",
  "variables": {
    "scale": 1
  },
  "doc_id": "27308360595486690"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "media_sets": {
        "edges": [],
        "page_info": {
          "end_cursor": null,
          "has_next_page": false
        }
      },
      "actor": {
        "__typename": "User",
        "__isIUser": "User",
        "id": "61594285317994",
        "profile_video": null,
        "profile_picture_is_silhouette": true,
        "viewer_mv4b_asset_info": null,
        "profile_photo": null
      }
    },
    "fxim_viewer_identity": {
      "__typename": "PersonalLinkedIdentityData",
      "profile_photo_update_passive_reminder": null,
      "profile_photo_update_interstitial_reminder": null
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038061524,
      "time_at_flush_ms": 1793038061570
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Loads the "Choose profile picture" dialog (Upload Photo, Add Frame, earlier photos) when "Profile picture actions" → "Choose profile picture" is clicked.

## What our machine does with it

Step 3 of the `profileSetup` flow (`log flow run profileSetup`, rule 31): the click on menuitem "Choose profile picture" fires it; the next step waits for button "Upload Photo" in the dialog it draws.

## What can go wrong

If it fails, the dialog never draws and step 4 times out looking for "Upload Photo": the run ends at s04 with nothing changed.
