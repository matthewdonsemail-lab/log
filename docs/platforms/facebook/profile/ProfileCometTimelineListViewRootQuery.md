# ProfileCometTimelineListViewRootQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `29000545646228452` |
| Path | `/api/graphql/` |
| Sends | `previousProfileId`, `privacySelectorRenderLocation`, `referringStoryRenderLocation`, `renderLocation`, `scale`, `useDefaultActor`, `userID`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__GroupsCometGroupChatLazyLoadLastMessageSnippetrelayprovider`, `__relay_internal__pv__ProfileCometFeaturedHighlightsPortraitAspectRatioGKrelayprovider`, `__relay_internal__pv__WebPixelRatiorelayprovider` |
| Reads | `user.should_hide_visitor_content_on_timeline`, `user.should_hide_privacy_filters`, `user.if_viewer_has_professional_dashboard`, `user.profile_composer_info`, `user.highlight_units_section`, `user.delegate_page`, `user....ProfileCometTimelineAuxColumn_user`, `user....ProfileCometTimelineTabTopBanner_user`, `user....ProfileCometTimelineTabFeedBanner_user`, `user....ProfileCometTimelineTabTopOfMallBanner_user`, `viewer....ProfileCometTimelineAuxColumn_viewer`, `nux....ProfileCometTimelineAuxColumn_mentionsNux` |
| Called from | `ProfileCometTimelineListViewRoot.react` |
| rea | `ev_c3e882535cc14405a113b62c48091b838c63c9f6b191710a18a6d1bc6f873bf6` |

Seen 3 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | POST 200 /ajax/bulk-route-definitions/ (752 ms) | 1 | 200 | 647 ms | 5070 ms | — |
| host | step 9: saveState | 1 | 200 | 419 ms | 1539 ms | — |
| inspect | step 7: goto / | 1 | 200 | 1073 ms | 118258 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T045453_61594063207669**, step 7: goto /: 200, 1073 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "ProfileCometTimelineListViewRootQuery",
  "server_timestamps": "true",
  "variables": {
    "previousProfileId": null,
    "privacySelectorRenderLocation": "COMET_STREAM",
    "renderLocation": "timeline",
    "scale": 1,
    "userID": "61556829712306",
    "__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider": true,
    "__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider": false,
    "__relay_internal__pv__GroupsCometGroupChatLazyLoadLastMessageSnippetrelayprovider": false,
    "__relay_internal__pv__ProfileCometFeaturedHighlightsPortraitAspectRatioGKrelayprovider": false,
    "__relay_internal__pv__WebPixelRatiorelayprovider": 1
  },
  "doc_id": "29000545646228452"
}
```

Answered:

```json
{
  "data": {
    "user": {
      "should_hide_visitor_content_on_timeline": false,
      "should_hide_privacy_filters": false,
      "if_viewer_has_professional_dashboard": false,
      "profile_composer_info": null,
      "highlight_units_section": null,
      "delegate_page": null,
      "profile_info_review_unit": null,
      "id": "61556829712306",
      "profile_contextual_unit": null,
      "message_box_id": "61556829712306",
      "is_secure_thread": false,
      "message_capabilities2_str": "252061941156610305",
      "is_od_cutover_eligible": false,
      "profile_intelligence_layer_card": null,
      "profile_safety_info_renderer": null,
      "profile_tile_sections": {
        "edges": [
          {
            "node": {
              "profile_tile_section_type": "PHOTOS",
              "is_directory_protile": false,
              "profile_tile_views": {
                "nodes": []
              },
              "action_link": {
                "__typename": "SeeAllPhotosProfileTileActionLink",
                "title": "See All Photos",
                "url": null
              },
              "is_pinned_profile_feature": false,
              "title": {
                "text": "Photos"
              },
              "subtitle": null,
              "url": "https://www.facebook.com/profile.php?id=61556829712306&sk=photos",
              "id": "cHJvZmlsZV90aWxlX3NlY3Rpb246NjE1NTY4Mjk3MTIzMDY6cGhvdG9zOnByb2ZpbGVfdGltZWxpbmU6Mzo3",
              "__typename": "ProfileTileSection"
            },
            "cursor": null
          }
        ],
        "page_info": {
          "has_next_page": false,
          "end_cursor": "photos"
        }
      },
      "profile_plus_should_show_page_insights_disclaimer_link": false,
      "directory_tile_section_uncollapsed_count": 3,
      "directory_tile_section_truncation_string": {
        "delight_ranges": [],
        "image_ranges": [],
        "inline_style_ranges": [],
        "aggregated_ranges": [],
        "ranges": [],
        "color_ranges": [],
        "text": "See more about Tadele"
      },
      "aux_banner": null,
      "posts_tab_mentions_contextual_message": null,
      "wem_private_sharing_bundle": {
        "private_sharing_control_model_for_user": {
          "private_sharing_show_private_branding": false,
          "private_sharing_show_brandless_branding": false
        }
      },
      "comet_profile_banner": null,
      "feed_banner": null,
      "top_of_mall_banner": null
    },
    "viewer": {
      "is_wem_private_sharing_enabled": false
    },
    "nux": null
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792731782289,
      "time_at_flush_ms": 1792731782442
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Loads the frame of a profile's timeline: the side column, banners, the profile composer and whether the viewer has a professional dashboard (`user.if_viewer_has_professional_dashboard`). Fired with the header, in 0.4-0.6 s.

## What our machine does with it

Nothing directly: the profile machine works in the header. It is part of the own-profile load the page check accepts.

## What can go wrong

Nothing for our runs; an error leaves the timeline's frame empty, not the header.
