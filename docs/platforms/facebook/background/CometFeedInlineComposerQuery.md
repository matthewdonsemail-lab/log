# CometFeedInlineComposerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `38525622117053498` |
| Path | `/api/graphql/` |
| Sends | `scale` |
| Reads | — |
| Called from | `CometFeedInlineComposer.react` |
| rea | `ev_1da32d964859622ea061fac1c53fbd421740bac3b2982b94e6b35b9d9a4055ec` |

Seen 31 time(s) in 18 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 374 ms | 13557 ms | — |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 681 ms | 12025 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 524 ms | 7041 ms | — |
| warmup | step 11: goto /marketplace/ | 2 | 200 | 433–536 ms | 8600–15099 ms | — |
| warmup | step 17: goto /marketplace/ | 1 | 200 | 364 ms | 12036 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 563 ms | 1258001 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 358 ms | 5476 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 405 ms | 8251 ms | — |
| inspect | step 96: clickRole button "…" | 1 | 200 | 365 ms | 1305441 ms | — |
| inspect | step 4: snapshot | 1 | 200 | 512 ms | 330 ms | — |
| inspect | pin: typed the account's Messenger PIN | 1 | 200 | 411 ms | 538 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 423 ms | 6664 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 595 ms | 103685 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 1 | 200 | 496 ms | 5688 ms | — |
| inspect | step 4: goto /marketplace/inbox | 2 | 200 | 375–459 ms | 558508–564715 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 1700 ms | 59452 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 2513 ms | 11533 ms | — |
| inspect | step 6: goto /marketplace/inbox | 1 | 200 | 717 ms | 1708095 ms | — |
| inspect | openAny: read /marketplace/item/<id>/ | 1 | 200 | 399 ms | 15203 ms | — |
| warmup | step 14: goto /marketplace/ | 1 | 200 | 616 ms | 7184 ms | — |
| inspect | scroll: +386px in 10 wheel steps, 531 ms | 1 | 200 | 482 ms | 18331 ms | — |
| host | expected ProfileCometProfilePictureSetMutation: sent | 2 | 200 | 418–467 ms | 45791–1773905 ms | — |
| host | setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9 | 1 | 200 | 592 ms | 219879 ms | — |
| inspect | step 1: goto /marketplace/status | 1 | 200 | 389 ms | 12028 ms | — |
| inspect | step 4: goto /marketplace/status | 1 | 200 | 479 ms | 9204 ms | — |
| host | step 32: goto /marketplace/ | 1 | 200 | 248 ms | 12645 ms | — |
| host | step 38: goto /marketplace/you/selling | 1 | 200 | 256 ms | 17034 ms | — |
| host | step 40: goto /messages/ | 1 | 200 | 196 ms | 156 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, step 32: goto /marketplace/: 200, 248 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometFeedInlineComposerQuery",
  "server_timestamps": "true",
  "variables": {
    "scale": 1
  },
  "doc_id": "38525622117053498"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "actor": {
        "__typename": "User",
        "id": "61594285317994",
        "__isActor": "User",
        "short_name": "Halima",
        "__isProfile": "User",
        "__isEntity": "User",
        "url": "https://www.facebook.com/profile.php?id=61594285317994",
        "profile_picture": {
          "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (484 chars)"
        },
        "name": "Halima Ndjzn",
        "has_professional_features_for_watch": false
      },
      "feed_comet_composer": {
        "__isICometComposer": "FeedCometComposer",
        "inline_sprouts": [
          {
            "__typename": "FeedCometComposerLiveProducerSprout",
            "__isICometComposerSprout": "FeedCometComposerLiveProducerSprout",
            "inline_label": "Live video",
            "icon": {
              "uri": "https://static.xx.fbcdn.net/rsrc.php/yE/r/f0XMdTi7eQy.webp"
            },
            "__module_operation_CometFeedInlineComposerSproutsList_composer": {
              "__dr": "InlineComposerLiveProducerSprout_sprout$normalization.graphql"
            },
            "__module_component_CometFeedInlineComposerSproutsList_composer": {
              "__dr": "InlineComposerLiveProducerSprout.react"
            }
          },
          {
            "__typename": "CometComposerUploadMediaSprout",
            "__isICometComposerSprout": "CometComposerUploadMediaSprout",
            "inline_label": "Photo/video",
            "icon": {
              "uri": "https://static.xx.fbcdn.net/rsrc.php/yX/r/8_VnccIZfRa.webp"
            },
            "__module_operation_CometFeedInlineComposerSproutsList_composer": {
              "__dr": "FeedInlineComposerMediaSprout_sprout$normalization.graphql"
            },
            "__module_component_CometFeedInlineComposerSproutsList_composer": {
              "__dr": "FeedInlineComposerMediaSprout.react"
            }
          },
          {
            "__typename": "CometComposerMinutiaeSprout",
            "__isICometComposerSprout": "CometComposerMinutiaeSprout",
            "inline_label": "Feeling/activity",
            "icon": {
              "uri": "https://static.xx.fbcdn.net/rsrc.php/ya/r/XlpCJi9w2HF.webp"
            },
            "__module_operation_CometFeedInlineComposerSproutsList_composer": {
              "__dr": "FeedInlineComposerFeelingSprout_sprout$normalization.graphql"
            },
            "__module_component_CometFeedInlineComposerSproutsList_composer": {
              "__dr": "FeedInlineComposerFeelingSprout.react"
            }
          }
        ]
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yE/r/f0XMdTi7eQy.webp",
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
        "uri": "https://static.xx.fbcdn.net/rsrc.php/ya/r/XlpCJi9w2HF.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (484 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1793038330962,
      "time_at_flush_ms": 1793038331015
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hsdp": {
            "qexData": {
              "4917": {
                "r": false,
                "l": "J{\"qeid\":\"61594285317994\",\"u\":\"\",\"t\":\"fb_acting_account\",\"gks\":[],\"qe\":null}"
              },
              "5648": {
                "r": null,
                "l": "J{\"qeid\":\"61594285317994\",\"u\":\"\",\"t\":\"fb_acting_account\",\"gks\":[],\"qe\":null}"
              },
              "5702": {
                "r": null,
                "l": "J{\"qeid\":\"61594285317994\",\"u\":\"\",\"t\":\"fb_acting_account\",\"gks\":[],\"qe\":null}"
              }
            }
          },
          "hblp": {
            "consistency": {
              "rev": 1051718708
            },
            "rsrcMap": {
              "csr:_12_0_dQ": {
                "type": "csr",
                "src": ":1,372,9,168,12,8,2,7,30,10,11,13,41,22,49,54,18,68,6,20,14,28,5",
                "c": 1
              },
              "csr:_12_1_rw": {
                "type": "csr",
                "src": ":36",
                "c": 1
              },
              "4ELVBtO": {
                "type": "js",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v4icmD4/y9/l/en_GB-j/-sekXR_lQTM.js",
                "c": 1,
                "p": ":944",
                "m": "1051718708_main"
              },
              "FI4g3/A": {
                "type": "js",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v4iMzS4/yT/l/en_GB-j/I32hMZJHio9.js",
                "c": 1,
                "p": ":542",
                "m": "1051718708_main"
              },
              "cKshYeT": {
                "type": "js",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v4imXC4/yT/l/en_GB-j/wQUTfrWFlVq.js",
                "c": 1,
                "p": ":868",
                "m": "1051718708_main"
              },
              "nWze+I9": {
                "type": "js",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v4iPvu4/yM/l/en_GB-j/KXk65ncraD7.js",
                "c": 1,
                "p": ":396",
                "m": "1051718708_main"
              },
              "4aRLxJj": {
                "type": "css",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v5/yV/l/0,cross/gJvYo_zF64n.css",
                "c": 1,
                "p": ":852",
                "m": "1051718708_main"
              },
              "/mTsGG6": {
                "type": "js",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v4iu_P4/yA/l/en_GB-j/ZwSR1BLUZvv.js",
                "c": 1,
                "p": ":796",
                "m": "1051718708_main"
              },
              "csr:_12_2_HI": {
                "type": "csr",
                "src": ":9,168,12,100,259,122,33,203,326,306,20,14,22,8,2,395,160,7,187,30,148,28,322,347,174,3,162,23,114,363,10,11,245,292,128,36,13,75,185,283,5,1,40,49,308,68,54,18,6,124,145,83,104,135,92,43,4,29,197,32",
                "c": 1
              },
              "csr:_12_3_7J": {
                "type": "csr",
                "src": ":35,229,24,90,89,91,84,119,86,151",
                "c": 1
              },
              "hJy9YfN": {
                "type": "js",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v4iuLy4/yj/l/en_GB-j/xzXdfiV9Kbz.js",
                "c": 1,
                "p": ":1105",
                "m": "1051718708_main"
              },
              "csr:_12_4_NW": {
                "type": "csr",
                "src": ":166,115,94,76,353,123,538,244,64,298,179,319",
                "c": 1
              }
            },
            "compMap": {
              "CometComposerMediaAttachmentArea.react": {
                "r": [
                  "4ELVBtO",
                  "FI4g3/A",
                  "cKshYeT",
                  "nWze+I9",
                  "4aRLxJj",
                  "/mTsGG6",
                  "… 1 more"
                ],
                "rdfds": {
                  "m": [
                    "…",
                    "…",
                    "…",
                    "…"
                  ],
                  "r": [
                    "…"
                  ]
                },
                "rds": {
                  "m": [
                    "…",
                    "…",
                    "…",
                    "…",
                    "…",
                    "…",
                    "… 10 more"
                  ],
                  "r": [
                    "…",
                    "…"
                  ]
                },
                "be": 1
              }
            },
            "indexUpgrades": {
              "__hblp": ":3189",
              "__hsdp": ":998,997,974,975,1230,1229"
            }
          }
        },
        "jsmods": {
          "define": [
            [
              "cr:310",
              [
                "RunWWW"
              ],
              {
                "__rc": [
                  "RunWWW",
                  null
                ]
              },
              -1
            ],
            [
              "cr:564",
              [
                "ClickIDDomainBlacklistSVConfigJSModuleWrapper"
              ],
              {
                "__rc": [
                  "ClickIDDomainBlacklistSVConfigJSModuleWrapper",
                  null
                ]
              },
              -1
            ],
            [
              "cr:619",
              [
                "setTimeoutCometLoggingPriWWW"
              ],
              {
                "__rc": [
                  "setTimeoutCometLoggingPriWWW",
                  null
                ]
              },
              -1
            ],
            [
              "cr:686",
              [],
              {
                "__rc": [
                  null,
                  null
                ]
              },
              -1
            ],
            [
              "cr:734",
              [],
              {
                "__rc": [
                  null,
                  null
                ]
              },
              -1
            ],
            [
              "cr:755",
              [
                "warningWWW"
              ],
              {
                "__rc": [
                  "warningWWW",
                  null
                ]
              },
              -1
            ],
            "… 56 more"
          ],
          "require": [
            [
              "InlineComposerLiveProducerSprout_sprout$normalization.graphql"
            ],
            [
              "InlineComposerLiveProducerSprout.react"
            ],
            [
              "FeedInlineComposerMediaSprout_sprout$normalization.graphql"
            ],
            [
              "FeedInlineComposerMediaSprout.react"
            ],
            [
              "FeedInlineComposerFeelingSprout_sprout$normalization.graphql"
            ],
            [
              "FeedInlineComposerFeelingSprout.react"
            ],
            "… 10 more"
          ],
          "phd2_indexes": ":998,997,974,975,1230,1229"
        },
        "allResources": [
          "csr:_12_0_dQ",
          "csr:_12_1_rw"
        ],
        "tieredResources": {
          "r": [
            "csr:_12_0_dQ"
          ],
          "rdfds": [],
          "rds": [
            "csr:_12_1_rw"
          ]
        }
      }
    }
  }
}
```

**runs/host/20261026T180628_61594285317994**, step 38: goto /marketplace/you/selling: 200, 256 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometFeedInlineComposerQuery",
  "server_timestamps": "true",
  "variables": {
    "scale": 1
  },
  "doc_id": "38525622117053498"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "actor": {
        "__typename": "User",
        "id": "61594285317994",
        "__isActor": "User",
        "short_name": "Halima",
        "__isProfile": "User",
        "__isEntity": "User",
        "url": "https://www.facebook.com/profile.php?id=61594285317994",
        "profile_picture": {
          "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (484 chars)"
        },
        "name": "Halima Ndjzn",
        "has_professional_features_for_watch": false
      },
      "feed_comet_composer": {
        "__isICometComposer": "FeedCometComposer",
        "inline_sprouts": [
          {
            "__typename": "FeedCometComposerLiveProducerSprout",
            "__isICometComposerSprout": "FeedCometComposerLiveProducerSprout",
            "inline_label": "Live video",
            "icon": {
              "uri": "https://static.xx.fbcdn.net/rsrc.php/yE/r/f0XMdTi7eQy.webp"
            },
            "__module_operation_CometFeedInlineComposerSproutsList_composer": {
              "__dr": "InlineComposerLiveProducerSprout_sprout$normalization.graphql"
            },
            "__module_component_CometFeedInlineComposerSproutsList_composer": {
              "__dr": "InlineComposerLiveProducerSprout.react"
            }
          },
          {
            "__typename": "CometComposerUploadMediaSprout",
            "__isICometComposerSprout": "CometComposerUploadMediaSprout",
            "inline_label": "Photo/video",
            "icon": {
              "uri": "https://static.xx.fbcdn.net/rsrc.php/yX/r/8_VnccIZfRa.webp"
            },
            "__module_operation_CometFeedInlineComposerSproutsList_composer": {
              "__dr": "FeedInlineComposerMediaSprout_sprout$normalization.graphql"
            },
            "__module_component_CometFeedInlineComposerSproutsList_composer": {
              "__dr": "FeedInlineComposerMediaSprout.react"
            }
          },
          {
            "__typename": "CometComposerMinutiaeSprout",
            "__isICometComposerSprout": "CometComposerMinutiaeSprout",
            "inline_label": "Feeling/activity",
            "icon": {
              "uri": "https://static.xx.fbcdn.net/rsrc.php/ya/r/XlpCJi9w2HF.webp"
            },
            "__module_operation_CometFeedInlineComposerSproutsList_composer": {
              "__dr": "FeedInlineComposerFeelingSprout_sprout$normalization.graphql"
            },
            "__module_component_CometFeedInlineComposerSproutsList_composer": {
              "__dr": "FeedInlineComposerFeelingSprout.react"
            }
          }
        ]
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (484 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yE/r/f0XMdTi7eQy.webp",
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
        "uri": "https://static.xx.fbcdn.net/rsrc.php/ya/r/XlpCJi9w2HF.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1793038436445,
      "time_at_flush_ms": 1793038436478
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hsdp": {
            "qexData": {
              "4917": {
                "r": false,
                "l": "J{\"qeid\":\"61594285317994\",\"u\":\"\",\"t\":\"fb_acting_account\",\"gks\":[],\"qe\":null}"
              },
              "5648": {
                "r": null,
                "l": "J{\"qeid\":\"61594285317994\",\"u\":\"\",\"t\":\"fb_acting_account\",\"gks\":[],\"qe\":null}"
              },
              "5702": {
                "r": null,
                "l": "J{\"qeid\":\"61594285317994\",\"u\":\"\",\"t\":\"fb_acting_account\",\"gks\":[],\"qe\":null}"
              }
            }
          },
          "hblp": {
            "consistency": {
              "rev": 1051718708
            },
            "rsrcMap": {
              "csr:_r_0_0D": {
                "type": "csr",
                "src": ":1,372,9,168,12,8,2,7,30,10,11,13,41,22,49,54,18,68,6,20,14,28,5",
                "c": 1
              },
              "csr:_r_1_wE": {
                "type": "csr",
                "src": ":36",
                "c": 1
              },
              "4ELVBtO": {
                "type": "js",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v4icmD4/y9/l/en_GB-j/-sekXR_lQTM.js",
                "c": 1,
                "p": ":944",
                "m": "1051718708_main"
              },
              "FI4g3/A": {
                "type": "js",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v4iMzS4/yT/l/en_GB-j/I32hMZJHio9.js",
                "c": 1,
                "p": ":542",
                "m": "1051718708_main"
              },
              "cKshYeT": {
                "type": "js",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v4imXC4/yT/l/en_GB-j/wQUTfrWFlVq.js",
                "c": 1,
                "p": ":868",
                "m": "1051718708_main"
              },
              "nWze+I9": {
                "type": "js",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v4iPvu4/yM/l/en_GB-j/KXk65ncraD7.js",
                "c": 1,
                "p": ":396",
                "m": "1051718708_main"
              },
              "/mTsGG6": {
                "type": "js",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v4iu_P4/yA/l/en_GB-j/ZwSR1BLUZvv.js",
                "c": 1,
                "p": ":796",
                "m": "1051718708_main"
              },
              "csr:_r_2_lY": {
                "type": "csr",
                "src": ":9,168,12,100,259,122,33,203,326,306,20,14,22,8,2,395,160,7,187,30,148,852,28,322,347,174,3,162,23,114,363,10,11,245,292,128,36,13,75,185,283,5,1,40,49,308,68,54,18,6,124,145,83,104,135,92,43,4,29,197,32",
                "c": 1
              },
              "csr:_r_3_1f": {
                "type": "csr",
                "src": ":35,229,24,90,89,91,84,119,86,151",
                "c": 1
              },
              "hJy9YfN": {
                "type": "js",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v4iuLy4/yj/l/en_GB-j/xzXdfiV9Kbz.js",
                "c": 1,
                "p": ":1105",
                "m": "1051718708_main"
              },
              "csr:_r_4_s/": {
                "type": "csr",
                "src": ":166,115,94,76,353,123,538,244,64,298,179,319",
                "c": 1
              }
            },
            "compMap": {
              "CometComposerMediaAttachmentArea.react": {
                "r": [
                  "4ELVBtO",
                  "FI4g3/A",
                  "cKshYeT",
                  "nWze+I9",
                  "/mTsGG6",
                  "csr:_r_2_lY"
                ],
                "rdfds": {
                  "m": [
                    "…",
                    "…",
                    "…",
                    "…"
                  ],
                  "r": [
                    "…"
                  ]
                },
                "rds": {
                  "m": [
                    "…",
                    "…",
                    "…",
                    "…",
                    "…",
                    "…",
                    "… 10 more"
                  ],
                  "r": [
                    "…",
                    "…"
                  ]
                },
                "be": 1
              }
            },
            "indexUpgrades": {
              "__hblp": ":3189",
              "__hsdp": ":998,997,974,975,1230,1229"
            }
          }
        },
        "jsmods": {
          "define": [
            [
              "cr:310",
              [
                "RunWWW"
              ],
              {
                "__rc": [
                  "RunWWW",
                  null
                ]
              },
              -1
            ],
            [
              "cr:619",
              [
                "setTimeoutCometLoggingPriWWW"
              ],
              {
                "__rc": [
                  "setTimeoutCometLoggingPriWWW",
                  null
                ]
              },
              -1
            ],
            [
              "cr:686",
              [],
              {
                "__rc": [
                  null,
                  null
                ]
              },
              -1
            ],
            [
              "cr:734",
              [],
              {
                "__rc": [
                  null,
                  null
                ]
              },
              -1
            ],
            [
              "cr:755",
              [
                "warningWWW"
              ],
              {
                "__rc": [
                  "warningWWW",
                  null
                ]
              },
              -1
            ],
            [
              "cr:945",
              [],
              {
                "__rc": [
                  null,
                  null
                ]
              },
              -1
            ],
            "… 56 more"
          ],
          "require": [
            [
              "InlineComposerLiveProducerSprout_sprout$normalization.graphql"
            ],
            [
              "InlineComposerLiveProducerSprout.react"
            ],
            [
              "FeedInlineComposerMediaSprout_sprout$normalization.graphql"
            ],
            [
              "FeedInlineComposerMediaSprout.react"
            ],
            [
              "FeedInlineComposerFeelingSprout_sprout$normalization.graphql"
            ],
            [
              "FeedInlineComposerFeelingSprout.react"
            ],
            "… 10 more"
          ],
          "phd2_indexes": ":998,997,974,975,1230,1229"
        },
        "allResources": [
          "csr:_r_0_0D",
          "csr:_r_1_wE"
        ],
        "tieredResources": {
          "r": [
            "csr:_r_0_0D"
          ],
          "rdfds": [],
          "rds": [
            "csr:_r_1_wE"
          ]
        }
      }
    }
  }
}
```

**runs/host/20261026T180628_61594285317994**, step 40: goto /messages/: 200, 196 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometFeedInlineComposerQuery",
  "server_timestamps": "true",
  "variables": {
    "scale": 1
  },
  "doc_id": "38525622117053498"
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

The "What's on your mind?" box on the home feed.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
