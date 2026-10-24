# CometClassicHomeLeftRailContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `37551561817767907` |
| Path | `/api/graphql/` |
| Sends | `isEligibleForProfessionalTools`, `numExploreBookmarks`, `numShortcutBookmarks`, `scale`, `useNucleusIcon` |
| Reads | `viewer....CometHomeLeftRailWithBlueRanking_viewer` |
| Called from | `CometClassicHomeLeftRailContainer.react` |
| rea | `ev_344ab74ba79925e4c65e7d7e1baed54ed21b8b5516428816c330a8a229cfc2b5` |

Seen 25 time(s) in 14 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 556 ms | 13564 ms | — |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 673 ms | 12032 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 896 ms | 7049 ms | — |
| warmup | step 11: goto /marketplace/ | 2 | 200 | 813–877 ms | 8605–15105 ms | — |
| warmup | step 17: goto /marketplace/ | 1 | 200 | 544 ms | 12042 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 780 ms | 1258017 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 669 ms | 5491 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 585 ms | 8264 ms | — |
| inspect | step 96: clickRole button "…" | 1 | 200 | 539 ms | 1305467 ms | — |
| inspect | step 4: snapshot | 1 | 200 | 718 ms | 340 ms | — |
| inspect | pin: typed the account's Messenger PIN | 1 | 200 | 801 ms | 556 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 691 ms | 6674 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 754 ms | 103685 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 1 | 200 | 725 ms | 5695 ms | — |
| inspect | step 4: goto /marketplace/inbox | 2 | 200 | 814–1193 ms | 558515–564740 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 1608 ms | 59457 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 2559 ms | 11541 ms | — |
| inspect | step 6: goto /marketplace/inbox | 1 | 200 | 932 ms | 1708099 ms | — |
| inspect | openAny: read /marketplace/item/<id>/ | 1 | 200 | 884 ms | 15209 ms | — |
| warmup | step 14: goto /marketplace/ | 1 | 200 | 657 ms | 7192 ms | — |
| inspect | scroll: +386px in 10 wheel steps, 531 ms | 1 | 200 | 591 ms | 18339 ms | — |
| host | expected ProfileCometProfilePictureSetMutation: sent | 2 | 200 | 736–764 ms | 45799–1773939 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/warmup/20261023T074930_61594063207669**, step 11: goto /marketplace/: 200, 813 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometClassicHomeLeftRailContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "isEligibleForProfessionalTools": false,
    "numExploreBookmarks": 10,
    "numShortcutBookmarks": 5,
    "scale": 1,
    "useNucleusIcon": false
  },
  "doc_id": "37551561817767907"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "comet_classic_identity": {
        "bookmarks": {
          "edges": [
            {
              "node": "(15 fields)"
            }
          ]
        },
        "id": "370399423318783"
      },
      "shortcut_bookmarks": {
        "shortcut_bookmark": {
          "count": 3,
          "edges": [
            {
              "__typename": "FolderBookmarksEdge"
            },
            {
              "__typename": "FolderBookmarksEdge"
            },
            {
              "__typename": "FolderBookmarksEdge"
            }
          ]
        },
        "id": "1592249071005526",
        "bookmarks": {
          "edges": [
            {
              "node": "(18 fields)",
              "cursor": null
            },
            {
              "node": "(18 fields)",
              "cursor": null
            },
            {
              "node": "(18 fields)",
              "cursor": null
            }
          ],
          "page_info": {
            "end_cursor": "Ym9va21hcms6MjQ3ODMzMjAxNTgxMDM5Mzow",
            "has_next_page": false
          }
        }
      },
      "explore_bookmarks": {
        "explore_bookmark": {
          "edges": [
            {
              "__typename": "FolderBookmarksEdge"
            },
            {
              "__typename": "FolderBookmarksEdge"
            },
            {
              "__typename": "FolderBookmarksEdge"
            },
            {
              "__typename": "FolderBookmarksEdge"
            },
            {
              "__typename": "FolderBookmarksEdge"
            },
            {
              "__typename": "FolderBookmarksEdge"
            },
            "… 4 more"
          ]
        },
        "id": "644715445650924",
        "bookmarks": {
          "edges": [
            {
              "node": "(18 fields)",
              "cursor": null
            },
            {
              "node": "(18 fields)",
              "cursor": null
            },
            {
              "node": "(18 fields)",
              "cursor": null
            },
            {
              "node": "(18 fields)",
              "cursor": null
            },
            {
              "node": "(18 fields)",
              "cursor": null
            },
            {
              "node": "(18 fields)",
              "cursor": null
            },
            "… 4 more"
          ],
          "page_info": {
            "end_cursor": "Ym9va21hcms6NjgwMjE1MjIzMDow",
            "has_next_page": true
          }
        }
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yz/r/wZBdW_qnLOB.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yv/r/J6QQVMYHUJU.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1792742237952,
      "time_at_flush_ms": 1792742238170
    },
    "is_final": true
  }
}
```

**runs/warmup/20261023T074930_61594063207669**, step 14: goto /marketplace/: 200, 657 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometClassicHomeLeftRailContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "isEligibleForProfessionalTools": false,
    "numExploreBookmarks": 10,
    "numShortcutBookmarks": 5,
    "scale": 1,
    "useNucleusIcon": false
  },
  "doc_id": "37551561817767907"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "comet_classic_identity": {
        "bookmarks": {
          "edges": [
            {
              "node": "(15 fields)"
            }
          ]
        },
        "id": "370399423318783"
      },
      "shortcut_bookmarks": {
        "shortcut_bookmark": {
          "count": 3,
          "edges": [
            {
              "__typename": "FolderBookmarksEdge"
            },
            {
              "__typename": "FolderBookmarksEdge"
            },
            {
              "__typename": "FolderBookmarksEdge"
            }
          ]
        },
        "id": "1592249071005526",
        "bookmarks": {
          "edges": [
            {
              "node": "(18 fields)",
              "cursor": null
            },
            {
              "node": "(18 fields)",
              "cursor": null
            },
            {
              "node": "(18 fields)",
              "cursor": null
            }
          ],
          "page_info": {
            "end_cursor": "Ym9va21hcms6MjQ3ODMzMjAxNTgxMDM5Mzow",
            "has_next_page": false
          }
        }
      },
      "explore_bookmarks": {
        "explore_bookmark": {
          "edges": [
            {
              "__typename": "FolderBookmarksEdge"
            },
            {
              "__typename": "FolderBookmarksEdge"
            },
            {
              "__typename": "FolderBookmarksEdge"
            },
            {
              "__typename": "FolderBookmarksEdge"
            },
            {
              "__typename": "FolderBookmarksEdge"
            },
            {
              "__typename": "FolderBookmarksEdge"
            },
            "… 4 more"
          ]
        },
        "id": "644715445650924",
        "bookmarks": {
          "edges": [
            {
              "node": "(18 fields)",
              "cursor": null
            },
            {
              "node": "(18 fields)",
              "cursor": null
            },
            {
              "node": "(18 fields)",
              "cursor": null
            },
            {
              "node": "(18 fields)",
              "cursor": null
            },
            {
              "node": "(18 fields)",
              "cursor": null
            },
            {
              "node": "(18 fields)",
              "cursor": null
            },
            "… 4 more"
          ],
          "page_info": {
            "end_cursor": "Ym9va21hcms6NjgwMjE1MjIzMDow",
            "has_next_page": true
          }
        }
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yv/r/J6QQVMYHUJU.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yz/r/wZBdW_qnLOB.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1792742396554,
      "time_at_flush_ms": 1792742396637
    },
    "is_final": true
  }
}
```

**runs/inspect/20261024T060921_61594063207669**, scroll: +386px in 10 wheel steps, 531 ms: 200, 591 ms

Sent:

```json
{
  "qpl_active_flow_ids": "431626709",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometClassicHomeLeftRailContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "isEligibleForProfessionalTools": false,
    "numExploreBookmarks": 10,
    "numShortcutBookmarks": 5,
    "scale": 1,
    "useNucleusIcon": false
  },
  "doc_id": "37551561817767907",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=431626709"
  ]
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "comet_classic_identity": {
        "bookmarks": {
          "edges": [
            {
              "node": "(15 fields)"
            }
          ]
        },
        "id": "370399423318783"
      },
      "shortcut_bookmarks": {
        "shortcut_bookmark": {
          "count": 3,
          "edges": [
            {
              "__typename": "FolderBookmarksEdge"
            },
            {
              "__typename": "FolderBookmarksEdge"
            },
            {
              "__typename": "FolderBookmarksEdge"
            }
          ]
        },
        "id": "1592249071005526",
        "bookmarks": {
          "edges": [
            {
              "node": "(18 fields)",
              "cursor": null
            },
            {
              "node": "(18 fields)",
              "cursor": null
            },
            {
              "node": "(18 fields)",
              "cursor": null
            }
          ],
          "page_info": {
            "end_cursor": "Ym9va21hcms6MjQ3ODMzMjAxNTgxMDM5Mzow",
            "has_next_page": false
          }
        }
      },
      "explore_bookmarks": {
        "explore_bookmark": {
          "edges": [
            {
              "__typename": "FolderBookmarksEdge"
            },
            {
              "__typename": "FolderBookmarksEdge"
            },
            {
              "__typename": "FolderBookmarksEdge"
            },
            {
              "__typename": "FolderBookmarksEdge"
            },
            {
              "__typename": "FolderBookmarksEdge"
            },
            {
              "__typename": "FolderBookmarksEdge"
            },
            "… 4 more"
          ]
        },
        "id": "644715445650924",
        "bookmarks": {
          "edges": [
            {
              "node": "(18 fields)",
              "cursor": null
            },
            {
              "node": "(18 fields)",
              "cursor": null
            },
            {
              "node": "(18 fields)",
              "cursor": null
            },
            {
              "node": "(18 fields)",
              "cursor": null
            },
            {
              "node": "(18 fields)",
              "cursor": null
            },
            {
              "node": "(18 fields)",
              "cursor": null
            },
            "… 4 more"
          ],
          "page_info": {
            "end_cursor": "Ym9va21hcms6NjgwMjE1MjIzMDow",
            "has_next_page": true
          }
        }
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yz/r/wZBdW_qnLOB.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yD/r/gx8cUEKrUN7.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1792822379571,
      "time_at_flush_ms": 1792822379769
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

The home page's left menu (shortcuts). Only loads when a run lands on the home page.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
