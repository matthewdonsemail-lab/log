# FeedComposerCometRootQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29266302386340694` |
| Path | `/api/graphql/` |
| Sends | `callerName`, `customPartnerParams`, `hasStory`, `isBizWeb`, `isLinksInPostEnabled`, `privacySelectorRenderLocation`, `privacyWriteID`, `profileID`, `scale`, `serviceNames`, `storyID`, `__relay_internal__pv__ShouldEnableSimplifiedComposerIconsrelayprovider`, `__relay_internal__pv__CometUnifiedVideoCreation_showPrivacyMergerelayprovider`, `__relay_internal__pv__CometUGCPublicCreation_showComposerPublicAwarenessTooltiprelayprovider`, `__relay_internal__pv__FeedComposerCometRoot_shouldFetchCrosspostMetadatarelayprovider` |
| Reads | `viewer.actor`, `viewer.feed_comet_composer`, `viewer....FeedComposerComet_viewer` |
| Called from | `FeedComposerCometRoot.react` |
| rea | `ev_a7cba304334bc4e14c20455ee7a779e8ff76be7fa130500c1daa6ddab11f6589` |

Seen 10 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 1: goto / | 1 | 200 | 1402 ms | 25511 ms | — |
| inspect | step 27: goto / | 1 | 200 | 614 ms | 4855 ms | — |
| inspect | step 1: goto / | 3 | 200 | 658–801 ms | 7877–22524 ms | — |
| inspect | step 7: goto / | 2 | 200 | 594–778 ms | 10909–45148 ms | — |
| inspect | post: "…", 123 words, 0 image(s), scrolled 53 px | 1 | 200 | 3856 ms | 70245 ms | — |
| inspect | step 3: likePost Like | 1 | 200 | 422 ms | 21003 ms | — |
| warmup | expected MAWVerifyThreadCutover_ContactCapabilities2Query: sent | 1 | 200 | 729 ms | 4376 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/warmup/20261023T074930_61594063207669**, expected MAWVerifyThreadCutover_ContactCapabilities2Query: sent: 200, 729 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "FeedComposerCometRootQuery",
  "server_timestamps": "true",
  "variables": {
    "callerName": "fx_product_foundation_client_FXOnline_client_cache",
    "customPartnerParams": [
      {
        "key": "CROSSPOSTING_DESTINATION_APP",
        "value": "IG"
      },
      {
        "key": "CROSSPOSTING_SHARE_TO_SURFACE",
        "value": "FEED"
      },
      {
        "key": "SHOULD_RETURN_AUTO_XPOST_SETTING",
        "value": "true"
      }
    ],
    "hasStory": false,
    "isBizWeb": false,
    "isLinksInPostEnabled": false,
    "privacySelectorRenderLocation": "COMET_COMPOSER",
    "profileID": "61594063207669",
    "scale": 1,
    "serviceNames": [
      "CROSS_POSTING_SETTING"
    ],
    "storyID": "",
    "__relay_internal__pv__ShouldEnableSimplifiedComposerIconsrelayprovider": false,
    "__relay_internal__pv__CometUnifiedVideoCreation_showPrivacyMergerelayprovider": true,
    "__relay_internal__pv__CometUGCPublicCreation_showComposerPublicAwarenessTooltiprelayprovider": false,
    "__relay_internal__pv__FeedComposerCometRoot_shouldFetchCrosspostMetadatarelayprovider": false
  },
  "doc_id": "29266302386340694"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "actor": {
        "__typename": "User",
        "__isProfile": "User",
        "id": "61594063207669",
        "has_professional_features_for_watch": false,
        "name": "Bethlehem Trash",
        "profile_picture": {
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg (454 chars)"
        },
        "url": "https://www.facebook.com/profile.php?id=61594063207669",
        "short_name": "Bethlehem",
        "viewer": {
          "is_additional_profile_plus": false,
          "is_primary_profile_plus": false,
          "is_eligible_imagine_with_ai_regular_advertiser": false,
          "is_in_imagine_tier_3_privacy_jurisdiction": true
        },
        "profile_plus_category_display_name": null,
        "can_viewer_see_biz_intercept": false,
        "delegate_page_id": null,
        "delegate_page": null,
        "composer_interception": null,
        "vcuDisableCometSfvRedirect": {
          "enabled": true
        },
        "has_taggable_products": false,
        "is_product_tagging_apux_snoozed": false,
        "is_eligible_smcta_on_promode": false,
        "share_post_to_channels_settings": null,
        "reels_remix_and_original_audio_settings": "OA_ENABLED_REMIX_ENABLED"
      },
      "feed_comet_composer": {
        "sprouts": [
          "(8 fields)",
          "(8 fields)",
          "(8 fields)",
          "(8 fields)",
          "(8 fields)",
          "(8 fields)",
          "… 1 more"
        ],
        "__isICometComposer": "FeedCometComposer",
        "auxiliary_footer_buttons": [],
        "footer_primary_buttons": []
      },
      "eligible_promotions": {
        "nodes": []
      },
      "has_outstanding_conflicts_for_privacy_merge": true,
      "privacy_merge_metadata": {
        "id": "122126854887468773",
        "has_seen_privacy_merge_disclaimer": false,
        "has_resolved_conflicting_privacy_settings": false
      },
      "privacy_conflict_ui_to_display": "DEFAULT_RESOLUTION_TOAST",
      "privacy_merge_conflict_resolution_suggested_selected_option": {
        "name": "Friends",
        "privacy_row_input": {
          "allow": "(0 items)",
          "base_state": "FRIENDS",
          "deny": "(0 items)",
          "privacy_targeting": null,
          "tag_expansion_state": "UNSPECIFIED"
        },
        "post_param": "291667064279714",
        "id": "edddefcfe1b499ec9b1a11e02944e2b0"
      },
      "format_merge_milestone_for_user": "M1"
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
      },
      "can_viewer_edit": true,
      "privacy_write_id": "cHJpdmFjeV9zY29wZV9yZW5kZXJlcjp7ImlkIjo4Nzg3NjcwNzMzfQ",
      "show_quick_actions_menu": true
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
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yX/r/8_VnccIZfRa.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yO/r/UnRgJelt7Mg.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/ya/r/XlpCJi9w2HF.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yC/r/glLNpLPayUm.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/y1/r/pfuEaSjPXaI.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      "… 2 more"
    ],
    "server_metadata": {
      "request_start_time_ms": 1792741807579,
      "time_at_flush_ms": 1792741807701
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hsdp": "(5 fields)",
          "hblp": "(4 fields)"
        },
        "jsmods": {
          "define": "(7 items)",
          "require": "(7 items)",
          "phd2_indexes": ":1070,1821,1822,1069,2023,2026,2030,2031,2022,2021,2020,2024,2025,2027,2070,2069,2204,2205,1214,1277"
        },
        "allResources": [
          "lK6C1kY",
          "vnVZghq",
          "csr:_1b_0_t7",
          "csr:_1b_1_Rp"
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

Loads the "What's on your mind?" post composer at the top of the home feed for the signed-in account (`viewer.feed_comet_composer`). It fires when the home feed renders, 22 s after the sign-in's Enter, in 0.7 s.

## What our machine does with it

Nothing: no machine opens the composer or posts to the feed (rule 8). Its sighting only shows the home feed loaded signed in.

## What can go wrong

Nothing for our runs. A failure only hides the composer box; it doesn't block the feed, Marketplace or the warm-up.
