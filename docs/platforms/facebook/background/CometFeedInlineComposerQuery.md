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
| rea | `ev_3e02863ff58798e0b4e157f2227e5ceed62786408d21a22ae2d4cce84f7332b8` |

Seen 20 time(s) in 11 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 374 ms | 13557 ms | — |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 681 ms | 12025 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 524 ms | 7041 ms | — |
| warmup | step 11: goto /marketplace/ | 1 | 200 | 433 ms | 8600 ms | — |
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

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T045453_61594063207669**, openAny: read /marketplace/item/<id>/: 200, 399 ms

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
        "id": "61594063207669",
        "__isActor": "User",
        "short_name": "Bethlehem",
        "__isProfile": "User",
        "__isEntity": "User",
        "url": "https://www.facebook.com/profile.php?id=61594063207669",
        "profile_picture": {
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c239.0.950.951a_cp0_dst-jpg_tt6&cstp=mx950x951&ctp=s40x40&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwE6bxJw&_nc_oc=AdqzfI05YFO4WVkHHaoOX7NfkF0BMZceA_z57oIowgpfBIwIKrM5VIHRnNOHr1H3XWY&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=3n-7yyo5fYZ408NGG4CCEQ&_nc_ss=792a8&oh=00_AQMf… (454 chars)"
        },
        "name": "Bethlehem Trash",
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
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c239.0.950.951a_cp0_dst-jpg_tt6&cstp=mx950x951&ctp=s40x40&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwE6bxJw&_nc_oc=AdqzfI05YFO4WVkHHaoOX7NfkF0BMZceA_z57oIowgpfBIwIKrM5VIHRnNOHr1H3XWY&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=3n-7yyo5fYZ408NGG4CCEQ&_nc_ss=792a8&oh=00_AQMf… (454 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1792731520532,
      "time_at_flush_ms": 1792731520576
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hsdp": {
            "qexData": {
              "4917": {
                "r": false,
                "l": "J{\"qeid\":\"61594063207669\",\"u\":\"\",\"t\":\"fb_acting_account\",\"gks\":[],\"qe\":null}"
              },
              "5648": {
                "r": null,
                "l": "J{\"qeid\":\"61594063207669\",\"u\":\"\",\"t\":\"fb_acting_account\",\"gks\":[],\"qe\":null}"
              },
              "5702": {
                "r": null,
                "l": "J{\"qeid\":\"61594063207669\",\"u\":\"\",\"t\":\"fb_acting_account\",\"gks\":[],\"qe\":null}"
              }
            }
          },
          "hblp": {
            "consistency": {
              "rev": 1051428616
            },
            "rsrcMap": {
              "csr:_1p_0_d3": {
                "type": "csr",
                "src": ":1,440,2,183,14,15,6,36,4,5,8,3,80,9,45,39,42,12,16,74,25,58,10",
                "c": 1
              },
              "csr:_1p_1_3v": {
                "type": "csr",
                "src": ":24",
                "c": 1
              },
              "cKshYeT": {
                "type": "js",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v4ip9B4/yr/l/en_GB-j/u8cLtwvMvGe.js",
                "c": 1,
                "p": ":932",
                "m": "1051428616_main"
              },
              "/mTsGG6": {
                "type": "js",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v4iu_P4/yA/l/en_GB-j/ZwSR1BLUZvv.js",
                "c": 1,
                "p": ":698",
                "m": "1051428616_main"
              },
              "nWze+I9": {
                "type": "js",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v4iPvu4/yM/l/en_GB-j/KXk65ncraD7.js",
                "c": 1,
                "p": ":445",
                "m": "1051428616_main"
              },
              "csr:_1p_2_aS": {
                "type": "csr",
                "src": ":2,1,183,39,740,579,14,417,131,15,77,19,249,294,438,24,16,6,108,464,247,239,112,36,240,871,25,295,164,13,237,17,396,4,174,5,248,86,8,3,184,191,133,10,9,18,45,229,58,42,12,74,103,170,94,92,117,109,81,11,114,30,196,23",
                "c": 1
              },
              "csr:_1p_3_L9": {
                "type": "csr",
                "src": ":26,166,29,141,142,140,83,76,143,136",
                "c": 1
              },
              "hJy9YfN": {
                "type": "js",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v4iuLy4/yj/l/en_GB-j/xzXdfiV9Kbz.js",
                "c": 1,
                "p": ":876",
                "m": "1051428616_main"
              },
              "csr:_1p_4_BR": {
                "type": "csr",
                "src": ":193,56,155,49,515,116,448,203,48,315,228,258",
                "c": 1
              }
            },
            "compMap": {
              "CometComposerMediaAttachmentArea.react": {
                "r": "(4 items)",
                "rdfds": "(2 fields)",
                "rds": "(2 fields)",
                "be": 1
              }
            },
            "indexUpgrades": {
              "__hblp": ":3189",
              "__hsdp": ":993,994,972,971,1245,1246"
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
                "__rc": "(2 items)"
              },
              -1
            ],
            [
              "cr:564",
              [
                "ClickIDDomainBlacklistSVConfigJSModuleWrapper"
              ],
              {
                "__rc": "(2 items)"
              },
              -1
            ],
            [
              "cr:619",
              [
                "setTimeoutCometLoggingPriWWW"
              ],
              {
                "__rc": "(2 items)"
              },
              -1
            ],
            [
              "cr:686",
              [],
              {
                "__rc": "(2 items)"
              },
              -1
            ],
            [
              "cr:734",
              [],
              {
                "__rc": "(2 items)"
              },
              -1
            ],
            [
              "cr:755",
              [
                "warningWWW"
              ],
              {
                "__rc": "(2 items)"
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
          "phd2_indexes": ":993,994,972,971,1245,1246"
        },
        "allResources": [
          "csr:_1p_0_d3",
          "csr:_1p_1_3v"
        ],
        "tieredResources": {
          "r": [
            "csr:_1p_0_d3"
          ],
          "rdfds": [],
          "rds": [
            "csr:_1p_1_3v"
          ]
        }
      }
    }
  }
}
```

**runs/inspect/20261023T000744_61594063207669**, step 3: goto /marketplace/inbox: 200, 1700 ms

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
        "id": "61594063207669",
        "__isActor": "User",
        "short_name": "Bethlehem",
        "__isProfile": "User",
        "__isEntity": "User",
        "url": "https://www.facebook.com/profile.php?id=61594063207669",
        "profile_picture": {
          "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c239.0.950.951a_cp0_dst-jpg_tt6&cstp=mx950x951&ctp=s40x40&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwFGX9Mc&_nc_oc=AdrcJvjvCTJsMtX_wCl0FuLhtWE_LjJPvmUjOuO3q_fxG-8z1zV8Cz68OKvdIm8D0M0&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=K6V4162Mbdi5jnem44gqNA&_nc_ss=792a8&oh=00_AQO2… (454 chars)"
        },
        "name": "Bethlehem Trash",
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
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c239.0.950.951a_cp0_dst-jpg_tt6&cstp=mx950x951&ctp=s40x40&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwFGX9Mc&_nc_oc=AdrcJvjvCTJsMtX_wCl0FuLhtWE_LjJPvmUjOuO3q_fxG-8z1zV8Cz68OKvdIm8D0M0&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=K6V4162Mbdi5jnem44gqNA&_nc_ss=792a8&oh=00_AQO2… (454 chars)",
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
      "request_start_time_ms": 1792714191774,
      "time_at_flush_ms": 1792714191840
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hsdp": {
            "qexData": {
              "4917": {
                "r": false,
                "l": "J{\"qeid\":\"61594063207669\",\"u\":\"\",\"t\":\"fb_acting_account\",\"gks\":[],\"qe\":null}"
              },
              "5648": {
                "r": null,
                "l": "J{\"qeid\":\"61594063207669\",\"u\":\"\",\"t\":\"fb_acting_account\",\"gks\":[],\"qe\":null}"
              },
              "5702": {
                "r": null,
                "l": "J{\"qeid\":\"61594063207669\",\"u\":\"\",\"t\":\"fb_acting_account\",\"gks\":[],\"qe\":null}"
              }
            }
          },
          "hblp": {
            "consistency": {
              "rev": 1051388320
            },
            "rsrcMap": {
              "csr:_1k_0_tB": {
                "type": "csr",
                "src": ":1,416,2,210,34,16,8,15,6,4,5,14,83,9,27,45,38,12,3,54,21,52,10",
                "c": 1
              },
              "csr:_1k_1_wI": {
                "type": "csr",
                "src": ":19",
                "c": 1
              },
              "4ELVBtO": {
                "type": "js",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v4icmD4/y9/l/en_GB-j/-sekXR_lQTM.js",
                "c": 1,
                "p": ":762",
                "m": "1051388320_main"
              },
              "nWze+I9": {
                "type": "js",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v4iPvu4/yM/l/en_GB-j/KXk65ncraD7.js",
                "c": 1,
                "p": ":415",
                "m": "1051388320_main"
              },
              "csr:_1k_2_Lj": {
                "type": "csr",
                "src": ":2,1,210,953,810,106,45,574,34,383,110,16,68,44,216,19,8,231,3,15,6,132,382,241,883,218,220,21,338,202,13,188,23,358,4,224,5,94,130,292,363,213,193,14,10,9,22,27,204,52,38,12,54,138,200,150,141,118,92,64,11,88,29,235,20",
                "c": 1
              },
              "csr:_1k_3_NR": {
                "type": "csr",
                "src": ":203,24,28,109,108,101,80,76,105,87",
                "c": 1
              },
              "csr:_1k_4_+5": {
                "type": "csr",
                "src": ":866,237,62,140,46,390,134,544,243,49,274,230,302",
                "c": 1
              }
            },
            "compMap": {
              "CometComposerMediaAttachmentArea.react": {
                "r": [
                  "4ELVBtO",
                  "nWze+I9",
                  "csr:_1k_2_Lj"
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
                    "…"
                  ]
                },
                "be": 1
              }
            },
            "indexUpgrades": {
              "__hblp": ":3168",
              "__hsdp": ":993,992,970,971,1246,1245"
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
          "phd2_indexes": ":993,992,970,971,1246,1245"
        },
        "allResources": [
          "csr:_1k_0_tB",
          "csr:_1k_1_wI"
        ],
        "tieredResources": {
          "r": [
            "csr:_1k_0_tB"
          ],
          "rdfds": [],
          "rds": [
            "csr:_1k_1_wI"
          ]
        }
      }
    }
  }
}
```

**runs/inspect/20261023T000744_61594063207669**, step 5: goto /marketplace/you/selling: 200, 2513 ms

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
        "id": "61594063207669",
        "__isActor": "User",
        "short_name": "Bethlehem",
        "__isProfile": "User",
        "__isEntity": "User",
        "url": "https://www.facebook.com/profile.php?id=61594063207669",
        "profile_picture": {
          "uri": "https://scontent.fabe1-1.fna.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c239.0.950.951a_cp0_dst-jpg_tt6&cstp=mx950x951&ctp=s40x40&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwEITPV4&_nc_oc=AdqEplgGjnePZ5zQrRkgwcAbuKvOmuSS8asUxh-ms3DJOH2sCP766S3hpzddiXuq3KY&_nc_zt=24&_nc_ht=scontent.fabe1-1.fna&_nc_gid=bcrsU8-BGPTj9GV_… (484 chars)"
        },
        "name": "Bethlehem Trash",
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
        "uri": "https://scontent.fabe1-1.fna.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c239.0.950.951a_cp0_dst-jpg_tt6&cstp=mx950x951&ctp=s40x40&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwEITPV4&_nc_oc=AdqEplgGjnePZ5zQrRkgwcAbuKvOmuSS8asUxh-ms3DJOH2sCP766S3hpzddiXuq3KY&_nc_zt=24&_nc_ht=scontent.fabe1-1.fna&_nc_gid=bcrsU8-BGPTj9GV_… (484 chars)",
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
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yX/r/8_VnccIZfRa.webp",
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
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1792715272863,
      "time_at_flush_ms": 1792715272900
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hsdp": {
            "qexData": {
              "4917": {
                "r": false,
                "l": "J{\"qeid\":\"61594063207669\",\"u\":\"\",\"t\":\"fb_acting_account\",\"gks\":[],\"qe\":null}"
              },
              "5648": {
                "r": null,
                "l": "J{\"qeid\":\"61594063207669\",\"u\":\"\",\"t\":\"fb_acting_account\",\"gks\":[],\"qe\":null}"
              },
              "5702": {
                "r": null,
                "l": "J{\"qeid\":\"61594063207669\",\"u\":\"\",\"t\":\"fb_acting_account\",\"gks\":[],\"qe\":null}"
              }
            }
          },
          "hblp": {
            "consistency": {
              "rev": 1051388320
            },
            "rsrcMap": {
              "csr:_y_0_DJ": {
                "type": "csr",
                "src": ":1,2,210,34,416,16,8,15,6,4,5,14,83,9,27,45,38,12,3,54,21,52,10",
                "c": 1
              },
              "csr:_y_1_u/": {
                "type": "csr",
                "src": ":19",
                "c": 1
              },
              "cKshYeT": {
                "type": "js",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v4ip9B4/yr/l/en_GB-j/u8cLtwvMvGe.js",
                "c": 1,
                "p": ":953",
                "m": "1051388320_main"
              },
              "/mTsGG6": {
                "type": "js",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v4iu_P4/yA/l/en_GB-j/ZwSR1BLUZvv.js",
                "c": 1,
                "p": ":810",
                "m": "1051388320_main"
              },
              "nWze+I9": {
                "type": "js",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v4iPvu4/yM/l/en_GB-j/KXk65ncraD7.js",
                "c": 1,
                "p": ":415",
                "m": "1051388320_main"
              },
              "csr:_y_2_m1": {
                "type": "csr",
                "src": ":2,1,210,106,45,762,574,34,383,110,16,68,44,216,19,8,231,3,15,6,132,382,241,883,218,220,21,338,202,13,188,23,358,4,224,5,94,130,292,363,213,193,14,10,9,22,27,204,52,38,12,54,138,200,150,141,118,92,64,11,88,29,235,20",
                "c": 1
              },
              "csr:_y_3_v6": {
                "type": "csr",
                "src": ":203,24,28,109,108,101,80,76,105,87",
                "c": 1
              },
              "hJy9YfN": {
                "type": "js",
                "src": "https://static.xx.fbcdn.net/rsrc.php/v4iuLy4/yj/l/en_GB-j/xzXdfiV9Kbz.js",
                "c": 1,
                "p": ":866",
                "m": "1051388320_main"
              },
              "csr:_y_4_PC": {
                "type": "csr",
                "src": ":237,62,140,46,390,134,544,243,49,274,230,302",
                "c": 1
              }
            },
            "compMap": {
              "CometComposerMediaAttachmentArea.react": {
                "r": [
                  "cKshYeT",
                  "/mTsGG6",
                  "nWze+I9",
                  "csr:_y_2_m1"
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
              "__hblp": ":3168",
              "__hsdp": ":1245,993,992,970,971,1246"
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
              "cr:1078",
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
              "FeedInlineComposerFeelingSprout.react"
            ],
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
            "… 10 more"
          ],
          "phd2_indexes": ":1245,993,992,970,971,1246"
        },
        "allResources": [
          "csr:_y_0_DJ",
          "csr:_y_1_u/"
        ],
        "tieredResources": {
          "r": [
            "csr:_y_0_DJ"
          ],
          "rdfds": [],
          "rds": [
            "csr:_y_1_u/"
          ]
        }
      }
    }
  }
}
```

<!-- facts:end -->

## What it does

The "What's on your mind?" box on the home feed.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
