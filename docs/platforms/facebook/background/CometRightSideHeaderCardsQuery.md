# CometRightSideHeaderCardsQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29755211854079266` |
| Path | `/api/graphql/` |
| Sends | `refresh_num`, `scale`, `__relay_internal__pv__GHLShouldChangeRHCSideFeedFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeRHCAdsFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeRHCFieldNamerelayprovider` |
| Reads | `viewer....CometRightSideHeaderCards_viewerSideFeed`, `viewer....CometHomeRightSideEgoContainer_egoPanel`, `...PagesCometHomeAdminContainer_query` |
| Called from | `CometRightSideHeaderCards.react` |
| rea | `ev_0ca298c8c568c93036a5e8e8d989f3baf2a29fa5ca4d1fd7a8070819f4515962` |

Seen 22 time(s) in 12 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 626 ms | 13568 ms | — |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 671 ms | 12036 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 990 ms | 7055 ms | — |
| warmup | step 11: goto /marketplace/ | 2 | 200 | 561–754 ms | 8608–15105 ms | — |
| warmup | step 17: goto /marketplace/ | 1 | 200 | 599 ms | 12045 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 722 ms | 1258021 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 430 ms | 5495 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 441 ms | 8268 ms | — |
| inspect | step 96: clickRole button "…" | 1 | 200 | 580 ms | 1305471 ms | — |
| inspect | step 4: snapshot | 1 | 200 | 714 ms | 344 ms | — |
| inspect | pin: typed the account's Messenger PIN | 1 | 200 | 627 ms | 558 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 649 ms | 6677 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 811 ms | 103690 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 1 | 200 | 723 ms | 5699 ms | — |
| inspect | step 4: goto /marketplace/inbox | 2 | 200 | 651–956 ms | 558519–564742 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 1507 ms | 59461 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 2574 ms | 11547 ms | — |
| inspect | step 6: goto /marketplace/inbox | 1 | 200 | 970 ms | 1708103 ms | — |
| inspect | openAny: read /marketplace/item/<id>/ | 1 | 200 | 876 ms | 15212 ms | — |
| warmup | step 14: goto /marketplace/ | 1 | 200 | 663 ms | 7195 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/warmup/20261023T074930_61594063207669**, step 11: goto /marketplace/: 200, 754 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometRightSideHeaderCardsQuery",
  "server_timestamps": "true",
  "variables": {
    "refresh_num": 0,
    "scale": 1,
    "__relay_internal__pv__GHLShouldChangeRHCSideFeedFieldNamerelayprovider": true,
    "__relay_internal__pv__GHLShouldChangeRHCAdsFieldNamerelayprovider": true,
    "__relay_internal__pv__GHLShouldChangeRHCFieldNamerelayprovider": false
  },
  "doc_id": "29755211854079266"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "side_feed": {
        "nodes": [
          {
            "__typename": "FriendingRequestsSideFeedUnit",
            "is_hidden": false,
            "highlighted_requests": [
              "(4 fields)"
            ],
            "should_show_osa_explainer": false,
            "__module_operation_CometRightSideHeaderCards_viewerSideFeed": {
              "__dr": "FriendingCometHomeInlineRHCContainer_friendsPanel$normalization.graphql"
            },
            "__module_component_CometRightSideHeaderCards_viewerSideFeed": {
              "__dr": "FriendingCometHomeInlineRHCContainer.react"
            }
          }
        ]
      },
      "auxColumnUnits": {
        "nodes": [
          {
            "__typename": "FriendingRequestsSideFeedUnit"
          }
        ]
      },
      "actor": {
        "__typename": "User",
        "id": "61594063207669",
        "delegate_page_id": null,
        "can_manage_classic_page_in_pages_tab": true
      }
    },
    "logout_whitelist": [
      "^CacheStorageVersion$",
      "^RSTData$",
      "^RTC_VIDEO_INPUT$",
      "^RTC_AUDIO_INPUT$",
      "^RTC_AUDIO_OUTPUT$",
      "^RTC_IS_AUDIO_ONLY$",
      "… 98 more"
    ]
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792742237966,
      "time_at_flush_ms": 1792742238112
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hsdp": {
            "clpData": {
              "981": "(2 fields)",
              "3282": "(2 fields)",
              "3299": "(2 fields)",
              "6883": "(2 fields)",
              "1744261": "(1 fields)",
              "1744262": "(1 fields)",
              "1744267": "(1 fields)"
            },
            "gkxData": {
              "4229": "(2 fields)",
              "5279": "(2 fields)",
              "12718": "(2 fields)",
              "14760": "(2 fields)"
            },
            "ixData": {
              "478232": "(7 fields)",
              "478237": "(7 fields)",
              "484391": "(7 fields)",
              "484757": "(7 fields)",
              "492454": "(7 fields)",
              "492518": "(7 fields)",
              "492521": "(7 fields)",
              "492572": "(7 fields)",
              "492575": "(7 fields)",
              "505565": "(7 fields)",
              "545517": "(7 fields)",
              "621399": "(7 fields)",
              "659288": "(7 fields)",
              "1876411": "(4 fields)",
              "1876412": "(4 fields)",
              "1876413": "(4 fields)",
              "1876414": "(4 fields)",
              "1876415": "(4 fields)",
              "1876416": "(4 fields)",
              "1876418": "(4 fields)",
              "1876419": "(4 fields)",
              "1876420": "(4 fields)",
              "1876421": "(4 fields)",
              "1876422": "(4 fields)",
              "1876423": "(4 fields)",
              "1876424": "(4 fields)",
              "1876426": "(4 fields)",
              "1876427": "(4 fields)",
              "1876428": "(4 fields)",
              "1876429": "(4 fields)",
              "1876430": "(4 fields)",
              "1876431": "(4 fields)",
              "1876432": "(4 fields)",
              "1876434": "(4 fields)",
              "1876435": "(4 fields)",
              "1876436": "(4 fields)",
              "1876437": "(4 fields)",
              "1876438": "(4 fields)",
              "1876439": "(4 fields)",
              "1876440": "(4 fields)",
              "1876442": "(4 fields)",
              "1876443": "(4 fields)",
              "1876444": "(4 fields)",
              "1876445": "(4 fields)",
              "1876446": "(4 fields)",
              "1876447": "(4 fields)",
              "1876448": "(4 fields)",
              "1876450": "(4 fields)",
              "1876451": "(4 fields)",
              "1876452": "(4 fields)",
              "1876453": "(4 fields)",
              "1876454": "(4 fields)",
              "1876455": "(4 fields)",
              "1876456": "(4 fields)",
              "1876458": "(4 fields)",
              "1940508": "(4 fields)",
              "1940509": "(4 fields)",
              "1940510": "(4 fields)",
              "1940511": "(4 fields)",
              "1940512": "(4 fields)",
              "1940513": "(4 fields)"
            },
            "qexData": {
              "1134": "(2 fields)"
            },
            "qplData": {
              "180": "(1 fields)"
            }
          },
          "hblp": {
            "consistency": {
              "rev": 1051444067
            },
            "rsrcMap": {
              "csr:_1d_0_wh": "(3 fields)",
              "csr:_1d_1_5w": "(3 fields)",
              "nWm7Eze": "(5 fields)",
              "csr:_1d_2_FN": "(3 fields)",
              "csr:_1d_3_gk": "(3 fields)",
              "csr:_1d_4_CW": "(3 fields)"
            },
            "compMap": {
              "FriendingCometFriendRequestsListItemMoreMenu.react": "(4 fields)"
            },
            "indexUpgrades": {
              "__hblp": ":10833",
              "__hsdp": ":1613,1614,1795,1586,1829"
            }
          }
        },
        "jsmods": {
          "define": [
            [
              "cr:310",
              "(1 items)",
              "(1 fields)",
              -1
            ],
            [
              "cr:564",
              "(1 items)",
              "(1 fields)",
              -1
            ],
            [
              "cr:619",
              "(1 items)",
              "(1 fields)",
              -1
            ],
            [
              "cr:686",
              "(0 items)",
              "(1 fields)",
              -1
            ],
            [
              "cr:734",
              "(0 items)",
              "(1 fields)",
              -1
            ],
            [
              "cr:755",
              "(1 items)",
              "(1 fields)",
              -1
            ],
            "… 55 more"
          ],
          "require": [
            [
              "FriendingCometHomeInlineRHCContainer.react"
            ],
            [
              "FriendingCometHomeInlineRHCContainer_friendsPanel$normalization.graphql"
            ],
            [
              "emptyFunction",
              "thatReturns",
              "(1 items)",
              "(1 items)"
            ],
            [
              "CometToast.react"
            ],
            [
              "RequestClickFalcoEvent"
            ],
            [
              "RequestSeenFalcoEvent"
            ],
            "… 16 more"
          ],
          "phd2_indexes": ":1613,1614,1795,1586,1829"
        },
        "allResources": [
          "csr:_1d_0_wh",
          "csr:_1d_1_5w"
        ],
        "tieredResources": {
          "r": [
            "csr:_1d_0_wh"
          ],
          "rdfds": [],
          "rds": [
            "csr:_1d_1_5w"
          ]
        }
      }
    }
  }
}
```

**runs/warmup/20261023T074930_61594063207669**, step 14: goto /marketplace/: 200, 663 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometRightSideHeaderCardsQuery",
  "server_timestamps": "true",
  "variables": {
    "refresh_num": 0,
    "scale": 1,
    "__relay_internal__pv__GHLShouldChangeRHCSideFeedFieldNamerelayprovider": true,
    "__relay_internal__pv__GHLShouldChangeRHCAdsFieldNamerelayprovider": true,
    "__relay_internal__pv__GHLShouldChangeRHCFieldNamerelayprovider": false
  },
  "doc_id": "29755211854079266"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "side_feed": {
        "nodes": [
          {
            "__typename": "FriendingRequestsSideFeedUnit",
            "is_hidden": false,
            "highlighted_requests": [
              "(4 fields)"
            ],
            "should_show_osa_explainer": false,
            "__module_operation_CometRightSideHeaderCards_viewerSideFeed": {
              "__dr": "FriendingCometHomeInlineRHCContainer_friendsPanel$normalization.graphql"
            },
            "__module_component_CometRightSideHeaderCards_viewerSideFeed": {
              "__dr": "FriendingCometHomeInlineRHCContainer.react"
            }
          }
        ]
      },
      "auxColumnUnits": {
        "nodes": [
          {
            "__typename": "FriendingRequestsSideFeedUnit"
          }
        ]
      },
      "actor": {
        "__typename": "User",
        "id": "61594063207669",
        "delegate_page_id": null,
        "can_manage_classic_page_in_pages_tab": true
      }
    },
    "logout_whitelist": [
      "^CacheStorageVersion$",
      "^RSTData$",
      "^RTC_VIDEO_INPUT$",
      "^RTC_AUDIO_INPUT$",
      "^RTC_AUDIO_OUTPUT$",
      "^RTC_IS_AUDIO_ONLY$",
      "… 98 more"
    ]
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792742396562,
      "time_at_flush_ms": 1792742396651
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hsdp": {
            "clpData": {
              "981": "(2 fields)",
              "3282": "(2 fields)",
              "3299": "(2 fields)",
              "6883": "(2 fields)",
              "1744261": "(1 fields)",
              "1744262": "(1 fields)",
              "1744267": "(1 fields)"
            },
            "gkxData": {
              "4229": "(2 fields)",
              "5279": "(2 fields)",
              "12718": "(2 fields)",
              "14760": "(2 fields)"
            },
            "ixData": {
              "478232": "(7 fields)",
              "478237": "(7 fields)",
              "484391": "(7 fields)",
              "484757": "(7 fields)",
              "492454": "(7 fields)",
              "492518": "(7 fields)",
              "492521": "(7 fields)",
              "492572": "(7 fields)",
              "492575": "(7 fields)",
              "505565": "(7 fields)",
              "545517": "(7 fields)",
              "621399": "(7 fields)",
              "659288": "(7 fields)",
              "1876411": "(4 fields)",
              "1876412": "(4 fields)",
              "1876413": "(4 fields)",
              "1876414": "(4 fields)",
              "1876415": "(4 fields)",
              "1876416": "(4 fields)",
              "1876418": "(4 fields)",
              "1876419": "(4 fields)",
              "1876420": "(4 fields)",
              "1876421": "(4 fields)",
              "1876422": "(4 fields)",
              "1876423": "(4 fields)",
              "1876424": "(4 fields)",
              "1876426": "(4 fields)",
              "1876427": "(4 fields)",
              "1876428": "(4 fields)",
              "1876429": "(4 fields)",
              "1876430": "(4 fields)",
              "1876431": "(4 fields)",
              "1876432": "(4 fields)",
              "1876434": "(4 fields)",
              "1876435": "(4 fields)",
              "1876436": "(4 fields)",
              "1876437": "(4 fields)",
              "1876438": "(4 fields)",
              "1876439": "(4 fields)",
              "1876440": "(4 fields)",
              "1876442": "(4 fields)",
              "1876443": "(4 fields)",
              "1876444": "(4 fields)",
              "1876445": "(4 fields)",
              "1876446": "(4 fields)",
              "1876447": "(4 fields)",
              "1876448": "(4 fields)",
              "1876450": "(4 fields)",
              "1876451": "(4 fields)",
              "1876452": "(4 fields)",
              "1876453": "(4 fields)",
              "1876454": "(4 fields)",
              "1876455": "(4 fields)",
              "1876456": "(4 fields)",
              "1876458": "(4 fields)",
              "1940508": "(4 fields)",
              "1940509": "(4 fields)",
              "1940510": "(4 fields)",
              "1940511": "(4 fields)",
              "1940512": "(4 fields)",
              "1940513": "(4 fields)"
            },
            "qexData": {
              "1134": "(2 fields)"
            },
            "qplData": {
              "180": "(1 fields)"
            }
          },
          "hblp": {
            "consistency": {
              "rev": 1051444067
            },
            "rsrcMap": {
              "3DOOcgm": "(5 fields)",
              "csr:_y_0_vM": "(3 fields)",
              "csr:_y_1_5K": "(3 fields)",
              "I/zsb5H": "(5 fields)",
              "csr:_y_2_Sm": "(3 fields)",
              "csr:_y_3_Mw": "(3 fields)",
              "UVz5j8D": "(5 fields)",
              "jTUZcHE": "(5 fields)",
              "csr:_y_4_fO": "(3 fields)",
              "csr:_y_5_SJ": "(3 fields)",
              "T1Ru4n9": "(5 fields)",
              "csr:_y_6_VK": "(3 fields)",
              "csr:_y_7_to": "(3 fields)",
              "FOOxfhh": "(5 fields)",
              "csr:_y_8_In": "(3 fields)",
              "csr:_y_9_0D": "(3 fields)",
              "nWm7Eze": "(5 fields)",
              "csr:_y_a_x5": "(3 fields)",
              "csr:_y_b_Rt": "(3 fields)",
              "csr:_y_c_Wo": "(3 fields)",
              "m+O8KBK": "(5 fields)",
              "+pZJFVd": "(5 fields)",
              "vokD0Pd": "(5 fields)",
              "/XjEHFG": "(5 fields)",
              "csr:_y_d_fn": "(3 fields)",
              "csr:_y_e_E2": "(3 fields)",
              "csr:_y_f_pF": "(3 fields)"
            },
            "compMap": {
              "CometHovercardQueryRenderer.react": "(3 fields)",
              "FriendingCometAcceptRequestWarningDialog.react": "(4 fields)",
              "FriendingCometMutualFriendsSocialContextTooltipContent.react": "(3 fields)",
              "FriendingCometErrorDialog.react": "(4 fields)",
              "FriendingCometFriendRequestsListItemMoreMenu.react": "(4 fields)",
              "CometProfileListDialog.react": "(4 fields)"
            },
            "indexUpgrades": {
              "__hblp": ":1491,3074,19108,3279,11104,10833",
              "__hsdp": ":1613,1614,1795,1586,812,813,814,1829,815"
            }
          }
        },
        "jsmods": {
          "define": [
            [
              "cr:310",
              "(1 items)",
              "(1 fields)",
              -1
            ],
            [
              "cr:564",
              "(1 items)",
              "(1 fields)",
              -1
            ],
            [
              "cr:619",
              "(1 items)",
              "(1 fields)",
              -1
            ],
            [
              "cr:686",
              "(0 items)",
              "(1 fields)",
              -1
            ],
            [
              "cr:734",
              "(0 items)",
              "(1 fields)",
              -1
            ],
            [
              "cr:755",
              "(1 items)",
              "(1 fields)",
              -1
            ],
            "… 55 more"
          ],
          "require": [
            [
              "FriendingCometHomeInlineRHCContainer.react"
            ],
            [
              "FriendingCometHomeInlineRHCContainer_friendsPanel$normalization.graphql"
            ],
            [
              "emptyFunction",
              "thatReturns",
              "(1 items)",
              "(1 items)"
            ],
            [
              "CometToast.react"
            ],
            [
              "RequestClickFalcoEvent"
            ],
            [
              "RequestSeenFalcoEvent"
            ],
            "… 16 more"
          ],
          "phd2_indexes": ":1613,1614,1795,1586,513,812,813,814,1829,815"
        },
        "allResources": [
          "3DOOcgm",
          "csr:_y_0_vM",
          "csr:_y_1_5K"
        ],
        "tieredResources": {
          "r": [
            "3DOOcgm",
            "csr:_y_0_vM"
          ],
          "rdfds": [],
          "rds": [
            "csr:_y_1_5K"
          ]
        }
      }
    }
  }
}
```

<!-- facts:end -->

## What it does

Cards in the home page's right column.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
