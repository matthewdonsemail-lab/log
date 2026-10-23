# ProfileCometHeaderQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `28621615384199313` |
| Path | `/api/graphql/` |
| Sends | `scale`, `shouldUseFXIMProfilePicEditor`, `userID`, `selectedID`, `selectedSpaceType` |
| Reads | — |
| Called from | `ProfileCometHeader.react` |
| rea | `ev_4cedb55954fe0c35463d9aac371107df285f48cd40a1dfe186a84c7c4647ff7d` |

Seen 5 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 12: clickAny 1 x link /see owner profile$/ | 1 | 200 | 944 ms | 2253 ms | — |
| inspect | step 21: clickAny 1 x link /see owner profile$/ | 1 | 200 | 717 ms | 1889 ms | — |
| inspect | step 8: clickAny 1 x link /see owner profile$/ | 1 | 200 | 757 ms | 1915 ms | — |
| inspect | step 19: clickAny 1 x link /see owner profile$/ | 1 | 200 | 610 ms | 2108 ms | — |
| inspect | step 7: goto / | 1 | 200 | 994 ms | 118255 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T045453_61594063207669**, step 7: goto /: 200, 994 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "ProfileCometHeaderQuery",
  "server_timestamps": "true",
  "variables": {
    "scale": 1,
    "selectedID": "61556829712306",
    "selectedSpaceType": "profile",
    "shouldUseFXIMProfilePicEditor": false,
    "userID": "61556829712306"
  },
  "doc_id": "28621615384199313"
}
```

Answered:

```json
{
  "first": {
    "data": {
      "user": {
        "profile_header_renderer": {
          "__typename": "XFBProfileEntityConvergenceHeaderRenderer",
          "user": "(38 fields)",
          "viewer": "(1 fields)",
          "nux": null,
          "restriction_violation_status": "No Violations.",
          "dsa16_report_entrypoint": "profile",
          "dsa16_reporting_url": "https://www.facebook.com/profile.php?id=61556829712306",
          "is_dsa16_legal_reporting_enabled": false,
          "legal_reporting_uri": null,
          "legal_reporting_cta_type": null,
          "rr_removal_viewer_exposure_universe": null,
          "rr_removal_business_exposure_universe": null,
          "rr_removal_business_exposure_id": null,
          "__module_operation_ProfileCometHeaderQuery": "(1 fields)",
          "__module_component_ProfileCometHeaderQuery": "(1 fields)"
        },
        "id": "61556829712306",
        "profile_plus_post_transition_modal": null
      }
    },
    "extensions": {
      "prefetch_uris_v2": [
        {
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/490717431_122234604848227657_5345076135601296617_n.jpg?stp=dst-jpg_fb50_s320x320_tt6&_nc_cat=107&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=bR6Z9oNseYcQ7kNvwH_95yC&_nc_oc=AdqKCmumXMkxRPT9cwcl23jwqljRKMV2xThP8u6SB4iRwE6D7kSPLf_KLqbJVkpFDkA&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=E6HJsEOlZqO8WQbsBzj41w&_nc_ss=792a8&oh=00_AQNNG0dvQdcgs4r7Ux_YPMeNPGhyY0xaP4DE… (422 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        },
        {
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/490717431_122234604848227657_5345076135601296617_n.jpg?stp=dst-jpg_tt6&cstp=mx720x1106&ctp=s960x960&_nc_cat=107&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=bR6Z9oNseYcQ7kNvwH_95yC&_nc_oc=AdqKCmumXMkxRPT9cwcl23jwqljRKMV2xThP8u6SB4iRwE6D7kSPLf_KLqbJVkpFDkA&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=E6HJsEOlZqO8WQbsBzj41w&_nc_ss=792a8&oh=00_AQMRXO56jun9pJMgM5UZb… (437 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1792731782076,
        "time_at_flush_ms": 1792731782173
      },
      "is_final": false,
      "sr_payload": {
        "ddd": {
          "hsrp": "(2 fields)",
          "jsmods": "(3 fields)",
          "allResources": "(3 items)",
          "tieredResources": "(3 fields)"
        }
      }
    }
  },
  "followingParts": 18,
  "parts": [
    {
      "label": "ProfileCometProfilePicture_user$defer$ProfileCometLockedProfilePopover_user",
      "path": [
        "user",
        "profile_header_renderer",
        "user"
      ],
      "data": {
        "name": "Tadele Azmeraw",
        "gender": "FEMALE",
        "wem_private_sharing_bundle": {
          "private_sharing_control_model_for_user": "(2 fields)"
        }
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)",
          "(5 fields)"
        ],
        "is_final": false,
        "sr_payload": {
          "ddd": "(4 fields)"
        }
      }
    },
    {
      "label": "ProfileCometProfilePicture_user$defer$ProfileCometProfilePictureViewMenu_user",
      "path": [
        "user",
        "profile_header_renderer",
        "user"
      ],
      "data": {
        "story_bucket": {
          "nodes": "(0 items)"
        }
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)",
          "(5 fields)"
        ],
        "is_final": false
      }
    },
    {
      "label": "ProfileCometProfilePicture_user$defer$ProfileCometProfilePictureEditMenu_user",
      "path": [
        "user",
        "profile_header_renderer",
        "user"
      ],
      "data": {
        "story_bucket": {
          "nodes": "(0 items)"
        }
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)",
          "(5 fields)"
        ],
        "is_final": false
      }
    }
  ]
}
```

<!-- facts:end -->

## What it does

Loads a profile's header: name, profile picture, cover photo and the edit buttons (`shouldUseFXIMProfilePicEditor` picks the Accounts Center picture editor). It fires as soon as `/me` resolves, 5 s after the route definitions, in 1.0-1.5 s.

## What our machine does with it

The `profileSetup` flow clicks the header's picture and cover controls, so this is the request that puts them on the page: a step that looks for them before it answers finds nothing. The page check (`pageCheck.ts`) accepts `/me` landing on `/profile.php` or a vanity path, which is what this header is loaded for.

## What can go wrong

No sighting after `/me` means the profile never rendered (signed out or a checkpoint: the page check reports `loginWall` or `checkpointed`). A 200 with an error leaves the header without its edit controls, so the profile steps fail `pageNotReached` instead of clicking blind.
