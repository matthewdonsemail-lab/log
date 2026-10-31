# CometMegaphoneRootQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28541893478753857` |
| Path | `/api/graphql/` |
| Sends | `first`, `scale` |
| Reads | `viewer.megaphonePromotions` |
| Called from | `CometMegaphoneRoot.react` |
| rea | `ev_07965c7ee3ae520c7059b7c63745dab54a0aa1ce3d5596f3777cd22f2bc2f028` |

Seen 26 time(s) in 18 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 553 ms | 13566 ms | — |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 672 ms | 12034 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 756 ms | 7053 ms | — |
| warmup | step 11: goto /marketplace/ | 2 | 200 | 583–789 ms | 8607–15105 ms | — |
| warmup | step 17: goto /marketplace/ | 1 | 200 | 504 ms | 12044 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 739 ms | 1258019 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 613 ms | 5493 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 518 ms | 8266 ms | — |
| inspect | step 4: snapshot | 1 | 200 | 587 ms | 342 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 743 ms | 6675 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 913 ms | 103687 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 1 | 200 | 1020 ms | 5697 ms | — |
| inspect | step 4: goto /marketplace/inbox | 1 | 200 | 1290 ms | 558516 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 1917 ms | 59459 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 2596 ms | 11543 ms | — |
| inspect | step 6: goto /marketplace/inbox | 1 | 200 | 803 ms | 1708101 ms | — |
| inspect | openAny: read /marketplace/item/<id>/ | 1 | 200 | 883 ms | 15210 ms | — |
| warmup | step 14: goto /marketplace/ | 1 | 200 | 622 ms | 7193 ms | — |
| inspect | scroll: +386px in 10 wheel steps, 531 ms | 1 | 200 | 902 ms | 18342 ms | — |
| host | expected ProfileCometProfilePictureSetMutation: sent | 1 | 200 | 805 ms | 45801 ms | — |
| host | setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9 | 1 | 200 | 861 ms | 219888 ms | — |
| inspect | step 1: goto /marketplace/status | 1 | 200 | 851 ms | 12037 ms | — |
| inspect | step 4: goto /marketplace/status | 1 | 200 | 723 ms | 9213 ms | — |
| host | step 32: goto /marketplace/ | 1 | 200 | 362 ms | 12648 ms | — |
| host | step 38: goto /marketplace/you/selling | 1 | 200 | 273 ms | 17036 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, step 32: goto /marketplace/: 200, 362 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMegaphoneRootQuery",
  "server_timestamps": "true",
  "variables": {
    "first": 1,
    "scale": 1
  },
  "doc_id": "28541893478753857"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "megaphonePromotions": {
        "edges": [
          {
            "node": {
              "id": "1012732625523263",
              "user_interaction_info": "(1 fields)",
              "comet_qp_sections": "(1 fields)"
            }
          }
        ]
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038331000,
      "time_at_flush_ms": 1793038331133
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hsdp": {
            "clpData": {
              "1743465": "(1 fields)"
            },
            "gkxData": {
              "5070": "(2 fields)",
              "5279": "(2 fields)",
              "10188": "(2 fields)",
              "22681": "(2 fields)"
            },
            "ixData": {
              "671882": "(7 fields)",
              "869053": "(7 fields)",
              "1521755": "(7 fields)",
              "1669083": "(7 fields)",
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
              "1940513": "(4 fields)",
              "1960581": "(7 fields)",
              "1960583": "(7 fields)",
              "1969816": "(7 fields)",
              "1969818": "(7 fields)",
              "1988479": "(7 fields)",
              "1988481": "(7 fields)"
            },
            "justknobxData": {
              "6778": "(1 fields)"
            }
          },
          "hblp": {
            "consistency": {
              "rev": 1051718708
            },
            "rsrcMap": {
              "MFf1moB": "(5 fields)",
              "csr:_16_0_i2": "(3 fields)",
              "csr:_16_1_Zo": "(3 fields)",
              "AD4wloP": "(5 fields)",
              "2hYTLuM": "(5 fields)",
              "csr:_16_2_H/": "(3 fields)",
              "pTwdKAI": "(5 fields)",
              "csr:_16_3_s0": "(3 fields)",
              "VucoS4V": "(5 fields)",
              "csr:_16_4_qZ": "(3 fields)",
              "goo34vO": "(5 fields)",
              "csr:_16_5_pg": "(3 fields)"
            },
            "compMap": {
              "CometFeedStoryMenu.react": "(4 fields)",
              "HideXoutAction": "(3 fields)"
            },
            "indexUpgrades": {
              "__hblp": ":4691,2412",
              "__hsdp": ":3136,3137,461,462,2482"
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
            "… 56 more"
          ],
          "require": [
            [
              "CometMegaphoneWWWDeviceBasedLoginRendererStrategy.react"
            ],
            [
              "CometMegaphoneWWWDeviceBasedLoginRendererStrategy_quickPromotion$normalization.graphql"
            ],
            [
              "emptyFunction",
              "thatReturns",
              "(1 items)",
              "(1 items)"
            ],
            [
              "QpActionFalcoEvent"
            ],
            [
              "QpImpressionFalcoEvent"
            ],
            [
              "bumpVultureJSHash"
            ],
            "… 10 more"
          ],
          "phd2_indexes": ":3136,3137,461,462,2482"
        },
        "allResources": [
          "MFf1moB",
          "csr:_16_0_i2",
          "csr:_16_1_Zo"
        ],
        "tieredResources": {
          "r": [
            "MFf1moB",
            "csr:_16_0_i2"
          ],
          "rdfds": [],
          "rds": [
            "csr:_16_1_Zo"
          ]
        }
      }
    }
  }
}
```

**runs/host/20261026T180628_61594285317994**, step 38: goto /marketplace/you/selling: 200, 273 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMegaphoneRootQuery",
  "server_timestamps": "true",
  "variables": {
    "first": 1,
    "scale": 1
  },
  "doc_id": "28541893478753857"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "megaphonePromotions": {
        "edges": [
          {
            "node": {
              "id": "1012732625523263",
              "user_interaction_info": "(1 fields)",
              "comet_qp_sections": "(1 fields)"
            }
          }
        ]
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038436448,
      "time_at_flush_ms": 1793038436497
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hsdp": {
            "clpData": {
              "1743465": "(1 fields)"
            },
            "gkxData": {
              "5070": "(2 fields)",
              "5279": "(2 fields)",
              "10188": "(2 fields)",
              "22681": "(2 fields)"
            },
            "ixData": {
              "671882": "(7 fields)",
              "869053": "(7 fields)",
              "1521755": "(7 fields)",
              "1669083": "(7 fields)",
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
              "1940513": "(4 fields)",
              "1960581": "(7 fields)",
              "1960583": "(7 fields)",
              "1969816": "(7 fields)",
              "1969818": "(7 fields)",
              "1988479": "(7 fields)",
              "1988481": "(7 fields)"
            },
            "justknobxData": {
              "6778": "(1 fields)"
            }
          },
          "hblp": {
            "consistency": {
              "rev": 1051718708
            },
            "rsrcMap": {
              "MFf1moB": "(5 fields)",
              "csr:_v_0_4f": "(3 fields)",
              "csr:_v_1_J2": "(3 fields)",
              "VucoS4V": "(5 fields)",
              "csr:_v_2_n8": "(3 fields)",
              "goo34vO": "(5 fields)",
              "csr:_v_3_MF": "(3 fields)",
              "AD4wloP": "(5 fields)",
              "2hYTLuM": "(5 fields)",
              "csr:_v_4_u7": "(3 fields)",
              "pTwdKAI": "(5 fields)",
              "csr:_v_5_gp": "(3 fields)"
            },
            "compMap": {
              "HideXoutAction": "(3 fields)",
              "CometFeedStoryMenu.react": "(4 fields)"
            },
            "indexUpgrades": {
              "__hblp": ":4691,2412",
              "__hsdp": ":3136,3137,461,462,2482"
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
            [
              "cr:1078",
              "(0 items)",
              "(1 fields)",
              -1
            ],
            "… 56 more"
          ],
          "require": [
            [
              "CometMegaphoneWWWDeviceBasedLoginRendererStrategy.react"
            ],
            [
              "CometMegaphoneWWWDeviceBasedLoginRendererStrategy_quickPromotion$normalization.graphql"
            ],
            [
              "emptyFunction",
              "thatReturns",
              "(1 items)",
              "(1 items)"
            ],
            [
              "QpActionFalcoEvent"
            ],
            [
              "QpImpressionFalcoEvent"
            ],
            [
              "bumpVultureJSHash"
            ],
            "… 10 more"
          ],
          "phd2_indexes": ":3136,3137,461,462,2482"
        },
        "allResources": [
          "MFf1moB",
          "csr:_v_0_4f",
          "csr:_v_1_J2"
        ],
        "tieredResources": {
          "r": [
            "MFf1moB",
            "csr:_v_0_4f"
          ],
          "rdfds": [],
          "rds": [
            "csr:_v_1_J2"
          ]
        }
      }
    }
  }
}
```

<!-- facts:end -->

## What it does

The banner slot at the top of the page (announcements, prompts).

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
