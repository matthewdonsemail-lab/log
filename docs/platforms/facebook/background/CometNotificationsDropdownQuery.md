# CometNotificationsDropdownQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29240849615602606` |
| Path | `/api/graphql/` |
| Sends | `count`, `environment`, `scale` |
| Reads | `viewer....CometNotificationsListWrapper_viewer` |
| Called from | `CometNotificationsDropdown.react` |
| rea | `ev_ab1965911932cb7fcf25b222bf92e0487c624ad5aa06bc6a0e5e7860bc09d85a` |

Seen 121 time(s) in 24 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | openAny: read /marketplace/item/<id>/ | 1 | 200 | 1931 ms | 21207 ms | — |
| warmup | step 11: goto /marketplace/ | 1 | 200 | 1057 ms | 28562 ms | — |
| warmup | scroll: +564px in 14 wheel steps, 781 ms | 1 | 200 | 1919 ms | 62273 ms | — |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 918 ms | 18068 ms | — |
| inspect | scroll: +700px in 16 wheel steps, 859 ms | 1 | 200 | 1251 ms | 11271 ms | — |
| inspect | scroll: +800px in 18 wheel steps, 781 ms | 1 | 200 | 2025 ms | 303920 ms | — |
| inspect | step 1: goto /profile.php | 1 | 200 | 1222 ms | 7446 ms | — |
| inspect | step 1: goto /groups/<id>/ | 4 | 200 | 930–2133 ms | 4061–6412 ms | — |
| inspect | step 25: goto /groups/<id>/questions | 1 | 200 | 1075 ms | 4614 ms | — |
| inspect | step 4: goto /groups/<id>/permalink/<id>/ | 1 | 200 | 876 ms | 5698 ms | — |
| inspect | step 1: goto /groups/<id> | 1 | 200 | 1837 ms | 7273 ms | — |
| inspect | step 1: goto / | 5 | 200 | 1260–1765 ms | 3655–7988 ms | — |
| inspect | step 7: goto / | 2 | 200 | 1674–2592 ms | 2008–5518 ms | — |
| inspect | step 34: goto /marketplace/ | 1 | 200 | 1266 ms | 5241 ms | — |
| inspect | step 38: goto /marketplace/ | 1 | 200 | 1512 ms | 2155 ms | — |
| inspect | step 22: goto /marketplace/ | 1 | 200 | 1586 ms | 2952 ms | — |
| inspect | step 27: goto / | 1 | 200 | 1365 ms | 2346 ms | — |
| inspect | step 4: goto /marketplace/ | 1 | 200 | 1066 ms | 5217 ms | — |
| inspect | step 1: goto /reel/ | 3 | 200 | 844–899 ms | 2297–3569 ms | — |
| inspect | step 71: goto /reel/ | 1 | 200 | 882 ms | 3045 ms | — |
| inspect | step 16: clickRole button "…" | 1 | 200 | 1248 ms | 3727 ms | — |
| inspect | step 17: dwell 0.80s | 1 | 200 | 784 ms | 1315 ms | — |
| inspect | step 18: clickRole button "…" | 1 | 200 | 800 ms | 2665 ms | — |
| inspect | step 19: clickRole button "…" | 1 | 200 | 759 ms | 4723 ms | — |
| inspect | step 24: clickRole button "…" | 28 | 200 | 700–7278 ms | 39233–1251567 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 1123 ms | 1062 ms | — |
| inspect | step 22: goto /reel/ | 1 | 200 | 843 ms | 1783 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 1 | 200 | 1954 ms | 4811 ms | — |
| inspect | step 53: goto /reel/ | 1 | 200 | 1385 ms | 4961 ms | — |
| inspect | setLocation failed: TimeoutError: Locator.wait_for: Timeout 30000ms exceeded. | 1 | 200 | 1112 ms | 30049 ms | — |
| inspect | upload: before.png handed to the file chooser | 2 | 200 | 704–998 ms | 3415–5994 ms | — |
| inspect | step 16: type e232 | 1 | 200 | 1021 ms | 8955 ms | — |
| inspect | step 27: click e1541 | 1 | 200 | 761 ms | 91066 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 826 ms | 519978 ms | — |
| inspect | step 8: goto /marketplace/inbox | 1 | 200 | 1394 ms | 10331 ms | — |
| inspect | step 11: goto /marketplace/inbox | 1 | 200 | 1177 ms | 7157 ms | — |
| inspect | step 3: goto /marketplace/inbox | 23 | 200 | 814–21715 ms | 5436–1410350 ms | — |
| inspect | step 1: goto /marketplace/ | 2 | 200 | 1158–1484 ms | 18023–18294 ms | — |
| inspect | step 4: goto /marketplace/inbox | 1 | 200 | 684 ms | 354420 ms | — |
| inspect | step 1: goto /marketplace/status | 1 | 200 | 1520 ms | 5189 ms | — |
| inspect | step 6: goto /marketplace/inbox | 13 | 200 | 846–2695 ms | 25003–1792588 ms | — |
| inspect | step 1: goto /marketplace/create/item | 1 | 200 | 2060 ms | 5602 ms | — |
| inspect | step 2: goto /marketplace/ | 1 | 200 | 905 ms | 6083 ms | — |
| inspect | step 4: goto /marketplace/you/selling | 1 | 200 | 1230 ms | 4876 ms | — |
| inspect | step 5: goto /messages/ | 1 | 200 | 1302 ms | 7717 ms | — |
| inspect | post: "…", 123 words, 0 image(s), scrolled 53 px | 3 | 200 | 1200–2222 ms | 3903–29419 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T051540_61594063207669**, post: "…", 123 words, 0 image(s), scrolled 53 px: 200, 2222 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometNotificationsDropdownQuery",
  "server_timestamps": "true",
  "variables": {
    "count": 15,
    "environment": "MAIN_SURFACE",
    "scale": 1
  },
  "doc_id": "29240849615602606"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "actor": {
        "__typename": "User",
        "id": "61594063207669",
        "__isActor": "User",
        "name": "Bethlehem Trash"
      },
      "notifications_page": {
        "filter_config": {
          "selected_filter_tokens": "(1 items)",
          "filters": "(2 items)"
        },
        "query_id": "Cg8BdAZq2u2rDwNlbnYPDE1BSU5fU1VSRkFDRQ8CZnQKAQ8CcXQPBWZpcnN0DwJxZgoCAA8ISVNfQ09NRVQCAQ8VSU5DTFVERV9XQV9QMkJfTk9USUZTAQ8DZWZ0DgE=",
        "edges": [
          "(2 fields)",
          "(2 fields)",
          "(2 fields)",
          "(2 fields)",
          "(2 fields)",
          "(2 fields)",
          "… 2 more"
        ],
        "page_info": {
          "end_cursor": "{\"bl\":[\"priority_inbox\",\"today\",\"mixed_state_notifs\"],\"bic\":2,\"rc\":8,\"nc\":4,\"rt\":\"see_previous_button\",\"ah\":473,\"bc\":\"comet_today_bucket_friending_before_today\",\"nf\":[\"Cg8CZnQPA2FsbAE=\"],\"qf\":[\"IS_COMET\",\"INCLUDE_WA_P2B_NOTIFS\"],\"f\":[\"has_attempted_ad_fetch\",\"hdr\",\"nt_see_more_button\"],\"erd\":[],\"fr\":[61556829712306],\"ts\":1792460138,\"nid\":[1792727402487884,1792705704726789,1792494780900935,17924601… (410 chars)",
          "has_next_page": true
        }
      },
      "notifications_unseen_count": 0,
      "last_update_timestamp": 1792732587,
      "notifications_sound_path": [
        "https://static.xx.fbcdn.net/rsrc.php/yQ/r/EE3t4uwM6Gd.ogg",
        "https://static.xx.fbcdn.net/rsrc.php/yF/r/NJ17yOPKZOV.mp3"
      ],
      "comet_push_turn_on_status": {
        "is_comet_push_turn_on_eligible": true
      },
      "browser_push_config": {
        "browser_name": "Chrome",
        "service_worker_uri": "/sw?s=push",
        "app_id": "1443096165982425"
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/840348325_10241292513862813_809262265811029330_n.jpg?stp=cp0_dst-jpg_tt6&cstp=mx2043x2048&ctp=s56x56&_nc_cat=103&ccb=1-7&_nc_sid=28885b&_nc_ohc=TuG5gHtck20Q7kNvwFYzsgG&_nc_oc=AdpQVwc4lI8PSMrjIrL26guCKOjo06Iq0-7oFybsXERjX_nRhk_g4Edjx1-MYYGBdeg&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=pGS2rA8GwovNtc_r9UyY8w&_nc_ss=792a8&oh=00_AQM6mzgJQKtbNIwkZjdd… (438 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/840406481_122351384084227657_2181478911876956811_n.jpg?stp=c0.0.736.736a_cp0_dst-jpg_tt6&cstp=mx736x736&ctp=s56x56&_nc_cat=102&ccb=1-7&_nc_sid=28885b&_nc_ohc=dWRATbNp6I8Q7kNvwEGQ49a&_nc_oc=Adrlwp_BnR4s3q_jF96kRTz5bpTmpjidFscmDGOQyeRCh2nNQSE1pZ4fsCC_6TRZNRA&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=pGS2rA8GwovNtc_r9UyY8w&_nc_ss=792a8&oh=00_AQN45c… (452 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/821486959_39897881166477289_5103141192190276859_n.jpg?stp=c174.0.612.612a_cp0_dst-jpg_tt6&cstp=mx612x612&ctp=s64x64&_nc_cat=108&ccb=1-7&_nc_sid=1760b9&_nc_ohc=6mhlZxHrGKoQ7kNvwGcwIM5&_nc_oc=AdqYy92OxfnJqb0NVNmuDJSx8xTfcLavIPe1D_CIgiH_RssK1rVYh8dqC7KJHa81D3Q&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=pGS2rA8GwovNtc_r9UyY8w&_nc_ss=792a8&oh=00_AQMDt… (453 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/735761467_10240081022656686_4372525202903403670_n.jpg?stp=cp0_dst-jpg_tt6&cstp=mx960x949&ctp=s64x64&_nc_cat=109&ccb=1-7&_nc_sid=1760b9&_nc_ohc=dU-1BxRTbF4Q7kNvwHDL1m0&_nc_oc=AdoLyEF-ay7BOTjIvDwdKlpaJkksxJF4_I139YFqTnZycmY5hTl_442BT5ShHXeHz-s&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=pGS2rA8GwovNtc_r9UyY8w&_nc_ss=792a8&oh=00_AQNuQxd66V6-4jL2htbwr… (437 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1792732587491,
      "time_at_flush_ms": 1792732588158
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hsdp": "(5 fields)",
          "hblp": "(3 fields)"
        },
        "jsmods": {
          "define": "(7 items)",
          "require": "(7 items)",
          "phd2_indexes": ":2259,2258,1838,1839"
        },
        "allResources": [
          "f94yn+O",
          "YG5p7TX",
          "csr:_18_0_XD",
          "csr:_18_1_1W"
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

**runs/inspect/20261023T045453_61594063207669**, step 1: goto /marketplace/create/item: 200, 2060 ms

Sent:

```json
{
  "qpl_active_flow_ids": "138820675",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometNotificationsDropdownQuery",
  "server_timestamps": "true",
  "variables": {
    "count": 15,
    "environment": "MAIN_SURFACE",
    "scale": 1
  },
  "doc_id": "29240849615602606",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=138820675"
  ]
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "actor": {
        "__typename": "User",
        "id": "61594063207669",
        "__isActor": "User",
        "name": "Bethlehem Trash"
      },
      "notifications_page": {
        "filter_config": {
          "selected_filter_tokens": "(1 items)",
          "filters": "(2 items)"
        },
        "query_id": "Cg8BdAZq2ujIDwNlbnYPDE1BSU5fU1VSRkFDRQ8CZnQKAQ8CcXQPBWZpcnN0DwJxZgoCAA8ISVNfQ09NRVQCAQ8VSU5DTFVERV9XQV9QMkJfTk9USUZTAQ8DZWZ0DgE=",
        "edges": [
          "(2 fields)",
          "(2 fields)",
          "(2 fields)",
          "(2 fields)",
          "(2 fields)",
          "(2 fields)",
          "… 2 more"
        ],
        "page_info": {
          "end_cursor": "{\"bl\":[\"priority_inbox\",\"today\",\"mixed_state_notifs\"],\"bic\":2,\"rc\":8,\"nc\":4,\"rt\":\"see_previous_button\",\"ah\":473,\"bc\":\"comet_today_bucket_friending_before_today\",\"nf\":[\"Cg8CZnQPA2FsbAE=\"],\"qf\":[\"IS_COMET\",\"INCLUDE_WA_P2B_NOTIFS\"],\"f\":[\"has_attempted_ad_fetch\",\"hdr\",\"nt_see_more_button\"],\"erd\":[],\"fr\":[61556829712306],\"ts\":1792460138,\"nid\":[1792727402487884,1792705704726789,1792494780900935,17924601… (410 chars)",
          "has_next_page": true
        }
      },
      "notifications_unseen_count": 1,
      "last_update_timestamp": 1792731336,
      "notifications_sound_path": [
        "https://static.xx.fbcdn.net/rsrc.php/yQ/r/EE3t4uwM6Gd.ogg",
        "https://static.xx.fbcdn.net/rsrc.php/yF/r/NJ17yOPKZOV.mp3"
      ],
      "comet_push_turn_on_status": {
        "is_comet_push_turn_on_eligible": true
      },
      "browser_push_config": {
        "browser_name": "Chrome",
        "service_worker_uri": "/sw?s=push",
        "app_id": "1443096165982425"
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/840406481_122351384084227657_2181478911876956811_n.jpg?stp=c0.0.736.736a_cp0_dst-jpg_tt6&cstp=mx736x736&ctp=s56x56&_nc_cat=102&ccb=1-7&_nc_sid=28885b&_nc_ohc=dWRATbNp6I8Q7kNvwEGQ49a&_nc_oc=Adrlwp_BnR4s3q_jF96kRTz5bpTmpjidFscmDGOQyeRCh2nNQSE1pZ4fsCC_6TRZNRA&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=LYPOzjK7cKwC7Y0P0aDhqw&_nc_ss=792a8&oh=00_AQPBgu… (452 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/840348325_10241292513862813_809262265811029330_n.jpg?stp=cp0_dst-jpg_tt6&cstp=mx2043x2048&ctp=s56x56&_nc_cat=103&ccb=1-7&_nc_sid=28885b&_nc_ohc=TuG5gHtck20Q7kNvwFYzsgG&_nc_oc=AdpQVwc4lI8PSMrjIrL26guCKOjo06Iq0-7oFybsXERjX_nRhk_g4Edjx1-MYYGBdeg&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=LYPOzjK7cKwC7Y0P0aDhqw&_nc_ss=792a8&oh=00_AQPzufbJd98EpriK0pYm… (438 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/735761467_10240081022656686_4372525202903403670_n.jpg?stp=cp0_dst-jpg_tt6&cstp=mx960x949&ctp=s64x64&_nc_cat=109&ccb=1-7&_nc_sid=1760b9&_nc_ohc=dU-1BxRTbF4Q7kNvwHDL1m0&_nc_oc=AdoLyEF-ay7BOTjIvDwdKlpaJkksxJF4_I139YFqTnZycmY5hTl_442BT5ShHXeHz-s&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=LYPOzjK7cKwC7Y0P0aDhqw&_nc_ss=792a8&oh=00_AQPuUFa6rJx1qoFKYBSV-… (437 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/821486959_39897881166477289_5103141192190276859_n.jpg?stp=c174.0.612.612a_cp0_dst-jpg_tt6&cstp=mx612x612&ctp=s64x64&_nc_cat=108&ccb=1-7&_nc_sid=1760b9&_nc_ohc=6mhlZxHrGKoQ7kNvwGcwIM5&_nc_oc=AdqYy92OxfnJqb0NVNmuDJSx8xTfcLavIPe1D_CIgiH_RssK1rVYh8dqC7KJHa81D3Q&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=LYPOzjK7cKwC7Y0P0aDhqw&_nc_ss=792a8&oh=00_AQP_0… (453 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1792731336340,
      "time_at_flush_ms": 1792731337687
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hsdp": "(6 fields)",
          "hblp": "(4 fields)"
        },
        "jsmods": {
          "define": "(7 items)",
          "require": "(7 items)",
          "phd2_indexes": ":2259,2258,142,141,1838,1839,1584,512,813,812,814,811,151"
        },
        "allResources": [
          "f94yn+O",
          "27aiPPU",
          "w0WEQPq",
          "qo0X/QJ",
          "4YfkVO4",
          "YG5p7TX",
          "… 3 more"
        ],
        "tieredResources": {
          "r": "(7 items)",
          "rdfds": "(0 items)",
          "rds": "(1 items)"
        }
      }
    }
  }
}
```

**runs/inspect/20261023T045453_61594063207669**, step 2: goto /marketplace/: 200, 905 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometNotificationsDropdownQuery",
  "server_timestamps": "true",
  "variables": {
    "count": 15,
    "environment": "MAIN_SURFACE",
    "scale": 1
  },
  "doc_id": "29240849615602606"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "actor": {
        "__typename": "User",
        "id": "61594063207669",
        "__isActor": "User",
        "name": "Bethlehem Trash"
      },
      "notifications_page": {
        "filter_config": {
          "selected_filter_tokens": "(1 items)",
          "filters": "(2 items)"
        },
        "query_id": "Cg8BdAZq2uk1DwNlbnYPDE1BSU5fU1VSRkFDRQ8CZnQKAQ8CcXQPBWZpcnN0DwJxZgoCAA8ISVNfQ09NRVQCAQ8VSU5DTFVERV9XQV9QMkJfTk9USUZTAQ8DZWZ0DgE=",
        "edges": [
          "(2 fields)",
          "(2 fields)",
          "(2 fields)",
          "(2 fields)",
          "(2 fields)",
          "(2 fields)",
          "… 2 more"
        ],
        "page_info": {
          "end_cursor": "{\"bl\":[\"priority_inbox\",\"today\",\"mixed_state_notifs\"],\"bic\":2,\"rc\":8,\"nc\":4,\"rt\":\"see_previous_button\",\"ah\":473,\"bc\":\"comet_today_bucket_friending_before_today\",\"nf\":[\"Cg8CZnQPA2FsbAE=\"],\"qf\":[\"IS_COMET\",\"INCLUDE_WA_P2B_NOTIFS\"],\"f\":[\"has_attempted_ad_fetch\",\"hdr\",\"nt_see_more_button\"],\"erd\":[],\"fr\":[61556829712306],\"ts\":1792460138,\"nid\":[1792727402487884,1792705704726789,1792494780900935,17924601… (410 chars)",
          "has_next_page": true
        }
      },
      "notifications_unseen_count": 1,
      "last_update_timestamp": 1792731445,
      "notifications_sound_path": [
        "https://static.xx.fbcdn.net/rsrc.php/yQ/r/EE3t4uwM6Gd.ogg",
        "https://static.xx.fbcdn.net/rsrc.php/yF/r/NJ17yOPKZOV.mp3"
      ],
      "comet_push_turn_on_status": {
        "is_comet_push_turn_on_eligible": true
      },
      "browser_push_config": {
        "browser_name": "Chrome",
        "service_worker_uri": "/sw?s=push",
        "app_id": "1443096165982425"
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/840406481_122351384084227657_2181478911876956811_n.jpg?stp=c0.0.736.736a_cp0_dst-jpg_tt6&cstp=mx736x736&ctp=s56x56&_nc_cat=102&ccb=1-7&_nc_sid=28885b&_nc_ohc=dWRATbNp6I8Q7kNvwEGQ49a&_nc_oc=Adrlwp_BnR4s3q_jF96kRTz5bpTmpjidFscmDGOQyeRCh2nNQSE1pZ4fsCC_6TRZNRA&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=FSfeRQmSqoR12x05EqGcuA&_nc_ss=792a8&oh=00_AQO8YC… (452 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/840348325_10241292513862813_809262265811029330_n.jpg?stp=cp0_dst-jpg_tt6&cstp=mx2043x2048&ctp=s56x56&_nc_cat=103&ccb=1-7&_nc_sid=28885b&_nc_ohc=TuG5gHtck20Q7kNvwFYzsgG&_nc_oc=AdpQVwc4lI8PSMrjIrL26guCKOjo06Iq0-7oFybsXERjX_nRhk_g4Edjx1-MYYGBdeg&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=FSfeRQmSqoR12x05EqGcuA&_nc_ss=792a8&oh=00_AQOnoGfKTJmNCNaA3Ti4… (438 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/735761467_10240081022656686_4372525202903403670_n.jpg?stp=cp0_dst-jpg_tt6&cstp=mx960x949&ctp=s64x64&_nc_cat=109&ccb=1-7&_nc_sid=1760b9&_nc_ohc=dU-1BxRTbF4Q7kNvwHDL1m0&_nc_oc=AdoLyEF-ay7BOTjIvDwdKlpaJkksxJF4_I139YFqTnZycmY5hTl_442BT5ShHXeHz-s&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=FSfeRQmSqoR12x05EqGcuA&_nc_ss=792a8&oh=00_AQN7qICjEY8n9B7L8ReMs… (437 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/821486959_39897881166477289_5103141192190276859_n.jpg?stp=c174.0.612.612a_cp0_dst-jpg_tt6&cstp=mx612x612&ctp=s64x64&_nc_cat=108&ccb=1-7&_nc_sid=1760b9&_nc_ohc=6mhlZxHrGKoQ7kNvwGcwIM5&_nc_oc=AdqYy92OxfnJqb0NVNmuDJSx8xTfcLavIPe1D_CIgiH_RssK1rVYh8dqC7KJHa81D3Q&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=FSfeRQmSqoR12x05EqGcuA&_nc_ss=792a8&oh=00_AQOpL… (453 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1792731445997,
      "time_at_flush_ms": 1792731446379
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hsdp": "(6 fields)",
          "hblp": "(4 fields)"
        },
        "jsmods": {
          "define": "(7 items)",
          "require": "(7 items)",
          "phd2_indexes": ":2259,2258,142,141,1838,1839,1584,512,813,812,814,811,151"
        },
        "allResources": [
          "f94yn+O",
          "27aiPPU",
          "w0WEQPq",
          "qo0X/QJ",
          "4YfkVO4",
          "YG5p7TX",
          "… 3 more"
        ],
        "tieredResources": {
          "r": "(7 items)",
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

The notifications menu's contents. Loads on every signed-in page.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
