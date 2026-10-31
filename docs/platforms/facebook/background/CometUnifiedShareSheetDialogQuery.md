# CometUnifiedShareSheetDialogQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29088025014115370` |
| Path | `/api/graphql/` |
| Sends | `feedLocation`, `hasParentStory`, `isComposerDisabled`, `isLinkSharingEnabled`, `isShareToFeedDisabled`, `privacySelectorRenderLocation`, `privacyWriteID`, `qe_optional_share_to_page`, `scale`, `shareableParams`, `storyParams` |
| Reads | `link_preview.story`, `...UnifiedShareSheetSharingOptionsSection_share` |
| Called from | `CometUnifiedShareSheetDialog.react` |
| rea | `ev_7035e27a70b6da58b992c6e61088868e0fe0ad453f923f702505c93025db22f8` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 20: clickRole button "…" | 1 | 200 | 1864 ms | 1291 ms | — |
| inspect | scroll: +515px in 13 wheel steps, 656 ms | 1 | 200 | 575 ms | 270629 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261024T060921_61594063207669**, scroll: +515px in 13 wheel steps, 656 ms: 200, 575 ms

Sent:

```json
{
  "qpl_active_flow_ids": "431626709",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometUnifiedShareSheetDialogQuery",
  "server_timestamps": "true",
  "variables": {
    "feedLocation": "GROUP",
    "hasParentStory": false,
    "isComposerDisabled": false,
    "isLinkSharingEnabled": true,
    "isShareToFeedDisabled": false,
    "privacySelectorRenderLocation": "COMET_COMPOSER",
    "qe_optional_share_to_page": true,
    "scale": 1,
    "shareableParams": {
      "url": "https://www.facebook.com/groups/junkremovalwinners/"
    },
    "storyParams": {}
  },
  "doc_id": "29088025014115370",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=431626709"
  ]
}
```

Answered:

```json
{
  "data": {
    "link_preview": {
      "story": null,
      "share_scrape_data": "{\"share_type\":6,\"share_params\":[3549906855288164]}"
    },
    "viewer": {
      "actor": {
        "__typename": "User",
        "__isProfile": "User",
        "name": "Bethlehem Trash",
        "id": "61594063207669",
        "profile_picture": {
          "uri": "https://scontent-xxc1-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg (454 chars)"
        },
        "url": "https://www.facebook.com/profile.php?id=61594063207669"
      }
    },
    "privacy_selector": {
      "privacy_scope_renderer": {
        "__typename": "PrivacyScopeEditableRenderer",
        "__isPrivacySelectorRenderer": "PrivacyScopeEditableRenderer",
        "privacy_row_input": {
          "allow": "(0 items)",
          "base_state": "FRIENDS",
          "deny": "(0 items)",
          "privacy_targeting": null,
          "tag_expansion_state": "UNSPECIFIED"
        },
        "scope": {
          "selected_row_override": null,
          "selected_option": "(3 fields)",
          "can_viewer_edit": true,
          "privacy_write_id": "cHJpdmFjeV9zY29wZV9yZW5kZXJlcjp7ImlkIjo4Nzg3NjcwNzMzfQ",
          "show_quick_actions_menu": true
        },
        "id": "cHJpdmFjeV9zY29wZV9yZW5kZXJlcjp7ImlkIjo4Nzg3NjcwNzMzfQ",
        "scope_for_exposure": {
          "icon_image": "(1 fields)"
        },
        "entry_point_renderer": {
          "__typename": "PrivacyScopeCometComposerButtonEntryPointRenderer",
          "source": "(4 fields)",
          "__module_operation_CometPrivacySelectorEntryPointMatchContainer_renderer": "(1 fields)",
          "__module_component_CometPrivacySelectorEntryPointMatchContainer_renderer": "(1 fields)"
        },
        "__module_operation_CometPrivacySelectorForScope_scope": {
          "__dr": "CometPrivacySelectorEditable_renderer$normalization.graphql"
        },
        "__module_component_CometPrivacySelectorForScope_scope": {
          "__dr": "CometPrivacySelectorEditable.react"
        }
      }
    },
    "link": {
      "default_share_items_firstBatch": [
        {
          "__typename": "ShareToMessengerShareMenuItem",
          "link_preview_root": "(1 fields)",
          "__module_operation_UnifiedShareSheetSharingOptionsItems_linkPreviewRoot_default_firstbatch": "(1 fields)",
          "__module_component_UnifiedShareSheetSharingOptionsItems_linkPreviewRoot_default_firstbatch": "(1 fields)"
        },
        {
          "__typename": "WhatsAppExternalShareMenuItem",
          "external_share_api_url": "https://wa.me/?text=https%3A%2F%2Fwww.facebook.com%2Fgroups%2Fjunkremovalwinners%2F",
          "__module_operation_UnifiedShareSheetSharingOptionsItems_linkPreviewRoot_default_firstbatch": "(1 fields)",
          "__module_component_UnifiedShareSheetSharingOptionsItems_linkPreviewRoot_default_firstbatch": "(1 fields)"
        },
        {
          "__typename": "CopyLinkShareMenuItem",
          "url_with_tracking": null,
          "__module_operation_UnifiedShareSheetSharingOptionsItems_linkPreviewRoot_default_firstbatch": "(1 fields)",
          "__module_component_UnifiedShareSheetSharingOptionsItems_linkPreviewRoot_default_firstbatch": "(1 fields)"
        },
        {
          "__typename": "ShareToGroupShareMenuItem",
          "link_preview_root": "(1 fields)",
          "__module_operation_UnifiedShareSheetSharingOptionsItems_linkPreviewRoot_default_firstbatch": "(1 fields)",
          "__module_component_UnifiedShareSheetSharingOptionsItems_linkPreviewRoot_default_firstbatch": "(1 fields)"
        }
      ],
      "qe_include_items": [],
      "default_share_items_lastBatch": [
        {
          "__typename": "ShareToFriendsFeedShareMenuItem",
          "link_preview_root": "(1 fields)",
          "__module_operation_UnifiedShareSheetSharingOptionsItems_linkPreviewRoot_default_lastbatch": "(1 fields)",
          "__module_component_UnifiedShareSheetSharingOptionsItems_linkPreviewRoot_default_lastbatch": "(1 fields)"
        },
        {
          "__typename": "TwitterExternalShareMenuItem",
          "external_share_api_url": "https://twitter.com/intent/tweet?url=https%3A%2F%2Fwww.facebook.com%2Fgroups%2Fjunkremovalwinners%2F",
          "__module_operation_UnifiedShareSheetSharingOptionsItems_linkPreviewRoot_default_lastbatch": "(1 fields)",
          "__module_component_UnifiedShareSheetSharingOptionsItems_linkPreviewRoot_default_lastbatch": "(1 fields)"
        }
      ]
    },
    "xfb_query_ls_disclosure_impression_count": {
      "inline": 1,
      "bottom_sheet": 0
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/y7/r/OjzrEPbbX0p.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1792824467922,
      "time_at_flush_ms": 1792824468025
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hsdp": "(7 fields)",
          "hblp": "(4 fields)"
        },
        "jsmods": {
          "define": "(7 items)",
          "require": "(7 items)",
          "phd2_indexes": ":1071,1815,1816,1070,2467,2468,2744,2743,2457,2458,2408,2407,2423,2424,2443,2442,1219,1180,1096,1879,880,1892"
        },
        "allResources": [
          "lK6C1kY",
          "rp+IZWR",
          "csr:_2q_0_6e",
          "csr:_2q_1_kH"
        ],
        "tieredResources": {
          "r": "(3 items)",
          "rdfds": "(0 items)",
          "rds": "(1 items)"
        }
      }
    }
  }
}
```

<!-- facts:end -->

## What it does

Loads Facebook's share dialog for a story: its link preview (`link_preview.story`) and the sharing options (`UnifiedShareSheetSharingOptionsSection_share`), with the privacy and composer settings it sends. In our runs it fired during `log inspect` snapshot steps on 2026-10-19, 12-91 s after the step started, never right after a click of ours.

## What our machine does with it

Nothing. None of our machines opens a share dialog: `reelOrderer.ts` says this repo has no save, follow or share, and no code refers to this request. No state waits for it or reads it.

## What can go wrong

None seen: three calls, all 200 in 547-951 ms. If it failed, only the share dialog would be empty; a snapshot step records the page either way.
