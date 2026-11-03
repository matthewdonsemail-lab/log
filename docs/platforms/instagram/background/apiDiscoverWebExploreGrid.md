# apiDiscoverWebExploreGrid

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/api/discover/web/explore_grid` |
| Sends | — |
| Reads | `sectional_items`, `rank_token`, `auto_load_more_enabled`, `more_available`, `next_max_id`, `max_id`, `session_paging_token`, `clusters`, `debug_info`, `grid_overlay_debug_info`, `overlay_info`, `interests` and 4 more |
| Called from | `runs/inspect/20261103T180010_mattinferencesaver/script103.js:25 anonymous`, `runs/inspect/20261103T180010_mattinferencesaver/script120.js:390 anonymous`, `runs/inspect/20261103T180010_mattinferencesaver/script156.js:1565 d`, `runs/inspect/20261103T180010_mattinferencesaver/script180.js:1 statement` |
| rea | `ev_81f93ca399ab17c211a4b7ac3fce16f7251a1535a1bbceb4efcb3b68ac1d0cd5` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 10: wait 40s | 1 | 200 | 2441 ms | 41576 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T180010_mattinferencesaver**, step 10: wait 40s: 200, 2441 ms

Sent:

```json
{
  "query": {
    "include_fixed_destinations": "true",
    "is_nonpersonalized_explore": "false",
    "is_prefetch": "false",
    "module": "explore_popular",
    "omit_cover_media": "false"
  },
  "body": null
}
```

Answered:

```json
{
  "sectional_items": [
    {
      "layout_type": "one_by_two_right",
      "feed_type": "clips",
      "explore_item_info": {
        "num_columns": 3,
        "total_num_columns": 3,
        "aspect_ratio": 1.5,
        "autoplay": true
      },
      "layout_content": {
        "one_by_two_item": {
          "clips": {
            "id": "clips-4004975759781233164_51338796124",
            "chaining_info": null,
            "items": "(1 items)",
            "max_id": "Gkbi2fvD_8v1h2-kkaHcuOGd826YiPz8_o7ElG_ks_OsoLXHhG4mlsWvqbRoFAhZCBgAGgg6BhkMAA==",
            "more_available": true,
            "type": "minor_unit",
            "design": "bottom_with_icon_horizontal",
            "label": "",
            "content_source": "default",
            "badge_label": null,
            "tag": null
          }
        },
        "fill_items": [
          {
            "media": "(127 fields)"
          },
          {
            "media": "(132 fields)"
          },
          {
            "media": "(132 fields)"
          },
          {
            "media": "(129 fields)"
          }
        ]
      }
    },
    {
      "layout_type": "one_by_two_left",
      "feed_type": "clips",
      "explore_item_info": {
        "num_columns": 3,
        "total_num_columns": 3,
        "aspect_ratio": 1.5,
        "autoplay": true
      },
      "layout_content": {
        "one_by_two_item": {
          "clips": {
            "id": "clips-3995602740142416978_5505619220",
            "chaining_info": null,
            "items": "(1 items)",
            "max_id": "Gkbi2fvD_8v1h2-kkaHcuOGd826YiPz8_o7ElG_ks_OsoLXHhG4mlsWvqbRoFAhZCBgAGgg6BhkMAA==",
            "more_available": true,
            "type": "minor_unit",
            "design": "bottom_with_icon_horizontal",
            "label": "",
            "content_source": "default",
            "badge_label": null,
            "tag": null
          }
        },
        "fill_items": [
          {
            "media": "(126 fields)"
          },
          {
            "media": "(131 fields)"
          },
          {
            "media": "(128 fields)"
          },
          {
            "media": "(131 fields)"
          }
        ]
      }
    },
    {
      "layout_type": "one_by_two_right",
      "feed_type": "clips",
      "explore_item_info": {
        "num_columns": 3,
        "total_num_columns": 3,
        "aspect_ratio": 1.5,
        "autoplay": true
      },
      "layout_content": {
        "one_by_two_item": {
          "clips": {
            "id": "clips-4001425385269982833_39687026465",
            "chaining_info": null,
            "items": "(1 items)",
            "max_id": "Gkbi2fvD_8v1h2-kkaHcuOGd826YiPz8_o7ElG_ks_OsoLXHhG4mlsWvqbRoFAhZCBgAGgg6BhkMAA==",
            "more_available": true,
            "type": "minor_unit",
            "design": "bottom_with_icon_horizontal",
            "label": "",
            "content_source": "default",
            "badge_label": null,
            "tag": null
          }
        },
        "fill_items": [
          {
            "media": "(126 fields)"
          },
          {
            "media": "(138 fields)"
          },
          {
            "media": "(132 fields)"
          },
          {
            "media": "(132 fields)"
          }
        ]
      }
    },
    {
      "layout_type": "one_by_two_left",
      "feed_type": "clips",
      "explore_item_info": {
        "num_columns": 3,
        "total_num_columns": 3,
        "aspect_ratio": 1.5,
        "autoplay": true
      },
      "layout_content": {
        "one_by_two_item": {
          "clips": {
            "id": "clips-3964450617519140082_16915232579",
            "chaining_info": null,
            "items": "(1 items)",
            "max_id": "Gkbi2fvD_8v1h2-kkaHcuOGd826YiPz8_o7ElG_ks_OsoLXHhG4mlsWvqbRoFAhZCBgAGgg6BhkMAA==",
            "more_available": true,
            "type": "minor_unit",
            "design": "bottom_with_icon_horizontal",
            "label": "",
            "content_source": "default",
            "badge_label": null,
            "tag": null
          }
        },
        "fill_items": [
          {
            "media": "(126 fields)"
          },
          {
            "media": "(131 fields)"
          },
          {
            "media": "(127 fields)"
          },
          {
            "media": "(126 fields)"
          }
        ]
      }
    }
  ],
  "rank_token": "(taken out)",
  "auto_load_more_enabled": true,
  "more_available": true,
  "next_max_id": "0",
  "max_id": "GvYUhLaAsMvqlJBumIj8_P6OxJRvnvyJgtHouZ5vqKShqKT785VvgJv4s9PWgZNvgun1vP2kjodujsvOgt3isP9tmOn70Omao81vpJGh3LjhnfNuppefy_KYzr5vpt_Xq-T7sshvqImPw7O3o65uruPR0Nenl8VvvKGvqLSN2fVuyu-os5D96Y5u1pGogtrN5Mdu3JOy2Ia16b1v4tn7w__L9Ydv5LPzrKC1x4Ru_OvDm8v1o9FuJpbFr6m0aBQoNAIpCBgAGgg6BhkMAA==",
  "session_paging_token": "(taken out)",
  "clusters": [
    {
      "id": "explore_all:0",
      "title": "For you",
      "context": "",
      "description": "",
      "labels": [],
      "type": "explore_all",
      "name": "For you",
      "can_mute": false,
      "is_muted": false,
      "debug_info": ""
    }
  ],
  "debug_info": null,
  "grid_overlay_debug_info": null,
  "overlay_info": null,
  "interests": null,
  "tentpole_interest": null,
  "tentpole_interests": null,
  "quantum_signals_parsed": false,
  "status": "ok"
}
```

<!-- facts:end -->

## What it does

<!-- toWrite --> What this request is for on Facebook's side, from its definition and the step it fires in.

## What our machine does with it

<!-- toWrite --> Which state of `marketplace/connect` or `marketplace/publish` waits for it, reads it, or ignores it, and why.

## What can go wrong

<!-- toWrite --> The errors and statuses it can return, what each means for the run, and the end or retry our machine takes.
