# CometUFIFeedbackReactMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `27646120298312844` |
| Path | `/api/graphql/` |
| Sends | `canUseNicknameOnComet`, `input`, `scale`, `useDefaultActor`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider` |
| Reads | `feedback_react.feedback`, `feedback_react.detection_analytics_enabled` |
| Called from | `CometUFIFeedbackReactMutation` |
| rea | `ev_a524d63aa67afda368f84d97715d9e407ac62c8b9888f10a4ba1af4a0c4a24ba` |

Seen 10 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 6: likePost Like | 1 | 200 | 1719 ms | 1155 ms | — |
| inspect | scroll: +642px in 17 wheel steps, 985 ms | 1 | 200 | 2018 ms | 1126 ms | — |
| inspect | step 65: clickRole button "…" | 1 | 200 | 1161 ms | 1256 ms | — |
| inspect | step 10: clickRole button "…" | 1 | 200 | 960 ms | 1745 ms | — |
| inspect | step 21: clickRole button "…" | 1 | 200 | 872 ms | 1290 ms | — |
| inspect | step 45: clickRole button "…" | 1 | 200 | 1424 ms | 1325 ms | — |
| inspect | step 61: clickRole button "…" | 1 | 200 | 1009 ms | 1075 ms | — |
| inspect | step 87: clickRole button "…" | 1 | 200 | 1210 ms | 1322 ms | — |
| inspect | step 3: likePost Like | 1 | 200 | 1451 ms | 2203 ms | — |
| inspect | step 5: likePost Like | 1 | 200 | 1024 ms | 1133 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T051540_61594063207669**, step 3: likePost Like: 200, 1451 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometUFIFeedbackReactMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "attribution_id_v2": "CometHomeRoot.react,comet.home,via_cold_start,1792732560933,80386,4748854339,,",
      "feedback_id": "ZmVlZGJhY2s6MTIyMzExMjkxMDgyMDI5MDQx",
      "feedback_reaction_id": "1635855486666999",
      "feedback_source": "NEWS_FEED",
      "is_tracking_encrypted": true,
      "tracking": [
        "AZihIoUx0lY6kt-0ST0sCSSoGccaBFOsDLmHSkY3pflbhbwmj9jrlfcFCMOfOFfK5WpPjaTswdbTjmcApIJivCEzw10f7kQlQ0EBl9a4OSik5M3v9s2iZiYWn7JTF8HYn3VXNI-QE8GoiStheM-0p-7dCPsYuFsHV4Avvkr4IaTGTG2-kwMjb-qdSJ_fyodYM4WUj1lEgGycxnGD6rp8m-vQBt7YGQ77ZIZfq7T7oVDhKH5YYsDfStIjWzsJIrY9YjxmSF_sFZbiOW3n6b4_3HHfVGJyjP79FLe0HkAxe_cAcgWFwz0T9gCkBBXYHqK0c8GHJN_3pqGPUDNIMHmd3c81qMOo6JkPm2wlU0F-f6qSdThSkKt3Uu3GeMvRiHe2MJrbPlRd2qlYuKGF… (2060 chars)"
      ],
      "session_id": "4350d157-00b5-4b70-8d45-db5dbb1ef5be",
      "actor_id": "61594063207669",
      "client_mutation_id": "1"
    },
    "scale": 1,
    "canUseNicknameOnComet": false,
    "useDefaultActor": false,
    "__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider": false
  },
  "doc_id": "27646120298312844"
}
```

Answered:

```json
{
  "data": {
    "feedback_react": {
      "feedback": {
        "id": "ZmVlZGJhY2s6MTIyMzExMjkxMDgyMDI5MDQx",
        "i18n_reaction_count": "8.1K",
        "important_reactors": {
          "nodes": []
        },
        "reaction_count": {
          "count": 8181
        },
        "cross_universe_feedback_info": {
          "ig_reaction_count": null,
          "aggregated_reaction_count": null
        },
        "top_reactions": {
          "count": 6,
          "edges": [
            {
              "visible_in_bling_bar": true,
              "node": {
                "id": "1635855486666999",
                "localized_name": "Like"
              },
              "i18n_reaction_count": "7K",
              "reaction_count": 7068
            },
            {
              "visible_in_bling_bar": true,
              "node": {
                "id": "1678524932434102",
                "localized_name": "Love"
              },
              "i18n_reaction_count": "1K",
              "reaction_count": 1033
            },
            {
              "visible_in_bling_bar": false,
              "node": {
                "id": "613557422527858",
                "localized_name": "Care"
              },
              "i18n_reaction_count": "68",
              "reaction_count": 68
            },
            {
              "visible_in_bling_bar": false,
              "node": {
                "id": "478547315650144",
                "localized_name": "Wow"
              },
              "i18n_reaction_count": "10",
              "reaction_count": 10
            },
            {
              "visible_in_bling_bar": false,
              "node": {
                "id": "115940658764963",
                "localized_name": "Haha"
              },
              "i18n_reaction_count": "1",
              "reaction_count": 1
            },
            {
              "visible_in_bling_bar": false,
              "node": {
                "id": "444813342392137",
                "localized_name": "Angry"
              },
              "i18n_reaction_count": "1",
              "reaction_count": 1
            }
          ]
        },
        "reaction_display_config": {
          "reaction_display_strategy": "NONE",
          "reaction_string_with_viewer": null,
          "reaction_string_without_viewer": null,
          "__module_operation_CometUFIReactionsCount_feedback": {
            "__dr": "CometUFIReactionSentence_reactionDisplayConfig$normalization.graphql"
          },
          "__module_component_CometUFIReactionsCount_feedback": {
            "__dr": "CometUFIReactionSentence.react"
          }
        },
        "viewer_actor": {
          "__typename": "User",
          "id": "61594063207669",
          "name": "Bethlehem Trash"
        },
        "viewer_feedback_reaction_info": {
          "__typename": "FeedbackReactionInfo",
          "id": "1635855486666999"
        },
        "actor_provider": {
          "__typename": "Feedback",
          "current_actor": {
            "__typename": "User",
            "id": "61594063207669"
          },
          "id": "ZmVlZGJhY2s6MTIyMzExMjkxMDgyMDI5MDQx"
        },
        "if_viewer_can_comment_anonymously": null,
        "associated_group": null,
        "supported_reaction_infos": [
          {
            "animation": {
              "uri_keyframes2": "https://scontent-phl2-1.xx.fbcdn.net/m1/v/t6/AQMAyWFGBnpZcTK2dlEOkqcwMaoy83Uqi8TpzhTSUZALJigog3c9HtHsJXzd9MKLb2PVDBx4xkmV3RvB4Kmg5KEKOvlYs4Ggq0X-CadWq3u4PIz9eVH_MavO64AcP9J2BwNn0UffDXE0Hg.kf"
            },
            "id": "1635855486666999"
          },
          {
            "animation": {
              "uri_keyframes2": "https://scontent-phl2-1.xx.fbcdn.net/m1/v/t6/AQPAN3wnlj1_huOshOAAvpfjoCd5aVxnTwTsjiyYTTXnIsu-1nLzanwNU8zwOfMDhh5F6-nniwHcok3F4ABE47HhHIffqj71IsxixEAezmXyIEseNxv330rUs_42ET7mC4Ev-rfSuUF81Q.kf"
            },
            "id": "1678524932434102"
          },
          {
            "animation": {
              "uri_keyframes2": "https://scontent-phl2-1.xx.fbcdn.net/m1/v/t6/AQMnTnEXO5oaNMCRjmCBSOb8iEKffW1eD7CbZmX6dUtTWL1ahy-WsQKljBEgFdpzs3Sys-NSJrzuX6HIg4ZqQ8bMVRahZNPk5t-RWh1jh4p-eSRYh-tTFddUC38Bczzvb_GxYwgetHwypA.kf"
            },
            "id": "613557422527858"
          },
          {
            "animation": {
              "uri_keyframes2": "https://scontent-phl2-1.xx.fbcdn.net/m1/v/t6/AQMWA4JAROSuJJAbhBBxsoSgjlFmQDeVHKdfbsTQ7coDdrzyECj53gWbXyXm1HczF8nsTHQvp-Ixh5FkZoTPPLDYORgzSzWc-7diQcADjXDu-mfefSgINqs5OYiKYJokL9VMXBeCXrSTLQ.kf"
            },
            "id": "115940658764963"
          },
          {
            "animation": {
              "uri_keyframes2": "https://scontent-phl2-1.xx.fbcdn.net/m1/v/t6/AQN-JjoqwNXB4Tr0H7hDnxvTKrSzmlyJtPiMB8laTBI0c1SuWHx39YtQ6PPc0qPua7zsjkFb0q59kMgk3nyksqZBGpNhQYIf8EniQGrdYFJlHdodRDanIAkT5Nbn0tKhm8ZZyaZVkNUB.kf"
            },
            "id": "478547315650144"
          },
          {
            "animation": {
              "uri_keyframes2": "https://scontent-phl2-1.xx.fbcdn.net/m1/v/t6/AQP_tAIVJFa-mtUrEoOoncnEKU0zJrb28G5uey_89YuUd2ZqnoBcsl8Bww5d7ZaHwhavjL1BQ0PuggIA2VY9lnZQ6YTbY2qZ2f2XYGMeXXB8CeGbcyxm6tzviVu6BHOZow6MS8o8hW2h.kf"
            },
            "id": "908563459236466"
          },
          "… 1 more"
        ],
        "comet_ufi_reaction_icon_renderer": {
          "__typename": "XFBCometUFIAnimatedReactionIconRenderer",
          "__module_operation_CometUFIReactionStrategy_feedback": {
            "__dr": "CometAnimatedReactionIconRenderer_renderer$normalization.graphql"
          },
          "__module_component_CometUFIReactionStrategy_feedback": {
            "__dr": "CometAnimatedReactionIconRenderer.react"
          }
        },
        "associated_video": {
          "id": "1508021361207264"
        },
        "unified_reactors": {
          "count": 8182
        },
        "reactors": {
          "count": 8181,
          "is_empty": false,
          "count_reduced": "8.1K"
        },
        "url": "https://www.facebook.com/reel/1508021361207264/",
        "__typename": "Feedback",
        "if_viewer_has_locked_actor": null,
        "if_viewer_post_type_blocks_alternate_voice": null
      },
      "detection_analytics_enabled": false
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792732689236,
      "time_at_flush_ms": 1792732689750
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hblp": {
            "consistency": {
              "rev": 1051428616
            },
            "rsrcMap": {
              "csr:_24_0_SE": {
                "type": "csr",
                "src": ":1,2,14,20,15,16,4,5,8,3,45",
                "c": 1
              },
              "rWryKgE": {
                "type": "js",
                "src": "data:application/x-javascript; charset=utf-8;base64,Oy8qRkJfUEtHX0RFTElNKi8KCl9fZCgiQ29tZXRVRklSZWFjdGlvblNlbnRlbmNlX3JlYWN0aW9uRGlzcGxheUNvbmZpZy5ncmFwaHFsIixbXSwoZnVuY3Rpb24odCxuLHIsbyxhLGkpeyJ1c2Ugc3RyaWN0Ijt2YXIgZT17YXJndW1lbnREZWZpbml0aW9uczpbXSxraW5kOiJGcmFnbWVudCIsbWV0YWRhdGE6bnVsbCxuYW1lOiJDb21ldFVGSVJlYWN0aW9uU2VudGVuY2VfcmVhY3Rpb25EaXNwbGF5Q29uZmlnIixzZWxlY3Rpb25zOlt7YWxpYXM6bnVsbCxhcmdz… (2840 chars)",
                "d": 1,
                "nc": 0,
                "c": 1,
                "p": ":343",
                "m": "1051428616_main",
                "nonce": "50YfgUaM"
              }
            },
            "indexUpgrades": {
              "__hsdp": ":896,897"
            }
          }
        },
        "jsmods": {
          "define": [
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
            [
              "cr:1078",
              [],
              {
                "__rc": "(2 items)"
              },
              -1
            ],
            [
              "cr:1080",
              [
                "unexpectedUseInComet"
              ],
              {
                "__rc": "(2 items)"
              },
              -1
            ],
            [
              "cr:6640",
              [],
              {
                "__rc": "(2 items)"
              },
              -1
            ],
            [
              "cr:15957",
              [],
              {
                "__rc": "(2 items)"
              },
              -1
            ],
            [
              "cr:1108857",
              [],
              {
                "__rc": "(2 items)"
              },
              -1
            ],
            "… 1 more"
          ],
          "require": [
            [
              "CometAnimatedReactionIconRenderer.react"
            ],
            [
              "CometUFIReactionSentence_reactionDisplayConfig$normalization.graphql"
            ],
            [
              "CometUFIReactionSentence.react"
            ],
            [
              "CometAnimatedReactionIconRenderer_renderer$normalization.graphql"
            ],
            [
              "emptyFunction",
              "thatReturns",
              [
                "RequireDeferredReference"
              ],
              [
                "(4 items)"
              ]
            ],
            [
              "RequireDeferredReference",
              "unblock",
              [],
              [
                "(4 items)",
                "sd"
              ]
            ],
            "… 1 more"
          ],
          "phd2_indexes": ":896,897"
        },
        "allResources": [
          "rWryKgE",
          "csr:_24_0_SE"
        ],
        "tieredResources": {
          "r": [
            "rWryKgE",
            "csr:_24_0_SE"
          ],
          "rdfds": [],
          "rds": []
        }
      }
    }
  }
}
```

**runs/inspect/20261023T051540_61594063207669**, step 5: likePost Like: 200, 1024 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometUFIFeedbackReactMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "attribution_id_v2": "CometHomeRoot.react,comet.home,via_cold_start,1792732560933,80386,4748854339,,",
      "feedback_id": "ZmVlZGJhY2s6NDIyMTAxNDMyNDg3NTQ3OA==",
      "feedback_reaction_id": "1635855486666999",
      "feedback_source": "NEWS_FEED",
      "is_tracking_encrypted": true,
      "tracking": [
        "AZheieZQlJyJM8SeUT7TdbW0tHls18qzSEj20nPskhQkqzybZJowGgQkY6MLCAsqI9Vo6Z3a5L_7YdNQlaWsiVsP-Df-96_HR2-OvH3CSvVUuXvg2AkWWx6kTmUM65uFHmas9LLDgnjP6ag8-EAvEWHvec13KHgSnnTvGARS4zlxAFQTDfSMonFVDI48cK1j8C1kDMIHX6wlFf00SpISOu0dmARvjIuHLdOqYOg0ukCoPOlILOiM5dgnVLt9m6a_Hx5Qhy9yV5wyORQiKEuYiq7m5IKGQuYJizuDYkt5wCF3LqpUIR7svFG4qyRHrYQ_Pp7e019G2QrYol9WmmHPhhSPYM0NMoXOi4_FyrB2JmOqx0jDDrBgSnB1jgtL2S-t9BS7BjZY_XjQDHXJ… (1438 chars)"
      ],
      "session_id": "4350d157-00b5-4b70-8d45-db5dbb1ef5be",
      "actor_id": "61594063207669",
      "client_mutation_id": "2"
    },
    "scale": 1,
    "canUseNicknameOnComet": false,
    "useDefaultActor": false,
    "__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider": false
  },
  "doc_id": "27646120298312844"
}
```

Answered:

```json
{
  "data": {
    "feedback_react": {
      "feedback": {
        "id": "ZmVlZGJhY2s6NDIyMTAxNDMyNDg3NTQ3OA==",
        "i18n_reaction_count": "1",
        "important_reactors": {
          "nodes": []
        },
        "reaction_count": {
          "count": 1
        },
        "cross_universe_feedback_info": {
          "ig_reaction_count": null,
          "aggregated_reaction_count": null
        },
        "top_reactions": {
          "count": 1,
          "edges": [
            {
              "visible_in_bling_bar": true,
              "node": {
                "id": "1635855486666999",
                "localized_name": "Like"
              },
              "i18n_reaction_count": "1",
              "reaction_count": 1
            }
          ]
        },
        "reaction_display_config": {
          "reaction_display_strategy": "NONE",
          "reaction_string_with_viewer": null,
          "reaction_string_without_viewer": null,
          "__module_operation_CometUFIReactionsCount_feedback": {
            "__dr": "CometUFIReactionSentence_reactionDisplayConfig$normalization.graphql"
          },
          "__module_component_CometUFIReactionsCount_feedback": {
            "__dr": "CometUFIReactionSentence.react"
          }
        },
        "viewer_actor": {
          "__typename": "User",
          "id": "61594063207669",
          "name": "Bethlehem Trash"
        },
        "viewer_feedback_reaction_info": {
          "__typename": "FeedbackReactionInfo",
          "id": "1635855486666999"
        },
        "actor_provider": {
          "__typename": "Feedback",
          "current_actor": {
            "__typename": "User",
            "id": "61594063207669"
          },
          "id": "ZmVlZGJhY2s6NDIyMTAxNDMyNDg3NTQ3OA=="
        },
        "if_viewer_can_comment_anonymously": null,
        "associated_group": {
          "feature_intervention": null,
          "id": "2478332015810393"
        },
        "supported_reaction_infos": [
          {
            "animation": {
              "uri_keyframes2": "https://scontent-phl2-1.xx.fbcdn.net/m1/v/t6/AQMAyWFGBnpZcTK2dlEOkqcwMaoy83Uqi8TpzhTSUZALJigog3c9HtHsJXzd9MKLb2PVDBx4xkmV3RvB4Kmg5KEKOvlYs4Ggq0X-CadWq3u4PIz9eVH_MavO64AcP9J2BwNn0UffDXE0Hg.kf"
            },
            "id": "1635855486666999"
          },
          {
            "animation": {
              "uri_keyframes2": "https://scontent-phl2-1.xx.fbcdn.net/m1/v/t6/AQPAN3wnlj1_huOshOAAvpfjoCd5aVxnTwTsjiyYTTXnIsu-1nLzanwNU8zwOfMDhh5F6-nniwHcok3F4ABE47HhHIffqj71IsxixEAezmXyIEseNxv330rUs_42ET7mC4Ev-rfSuUF81Q.kf"
            },
            "id": "1678524932434102"
          },
          {
            "animation": {
              "uri_keyframes2": "https://scontent-phl2-1.xx.fbcdn.net/m1/v/t6/AQMnTnEXO5oaNMCRjmCBSOb8iEKffW1eD7CbZmX6dUtTWL1ahy-WsQKljBEgFdpzs3Sys-NSJrzuX6HIg4ZqQ8bMVRahZNPk5t-RWh1jh4p-eSRYh-tTFddUC38Bczzvb_GxYwgetHwypA.kf"
            },
            "id": "613557422527858"
          },
          {
            "animation": {
              "uri_keyframes2": "https://scontent-phl2-1.xx.fbcdn.net/m1/v/t6/AQMWA4JAROSuJJAbhBBxsoSgjlFmQDeVHKdfbsTQ7coDdrzyECj53gWbXyXm1HczF8nsTHQvp-Ixh5FkZoTPPLDYORgzSzWc-7diQcADjXDu-mfefSgINqs5OYiKYJokL9VMXBeCXrSTLQ.kf"
            },
            "id": "115940658764963"
          },
          {
            "animation": {
              "uri_keyframes2": "https://scontent-phl2-1.xx.fbcdn.net/m1/v/t6/AQN-JjoqwNXB4Tr0H7hDnxvTKrSzmlyJtPiMB8laTBI0c1SuWHx39YtQ6PPc0qPua7zsjkFb0q59kMgk3nyksqZBGpNhQYIf8EniQGrdYFJlHdodRDanIAkT5Nbn0tKhm8ZZyaZVkNUB.kf"
            },
            "id": "478547315650144"
          },
          {
            "animation": {
              "uri_keyframes2": "https://scontent-phl2-1.xx.fbcdn.net/m1/v/t6/AQP_tAIVJFa-mtUrEoOoncnEKU0zJrb28G5uey_89YuUd2ZqnoBcsl8Bww5d7ZaHwhavjL1BQ0PuggIA2VY9lnZQ6YTbY2qZ2f2XYGMeXXB8CeGbcyxm6tzviVu6BHOZow6MS8o8hW2h.kf"
            },
            "id": "908563459236466"
          },
          "… 1 more"
        ],
        "comet_ufi_reaction_icon_renderer": {
          "__typename": "XFBCometUFIAnimatedReactionIconRenderer",
          "__module_operation_CometUFIReactionStrategy_feedback": {
            "__dr": "CometAnimatedReactionIconRenderer_renderer$normalization.graphql"
          },
          "__module_component_CometUFIReactionStrategy_feedback": {
            "__dr": "CometAnimatedReactionIconRenderer.react"
          }
        },
        "associated_video": null,
        "unified_reactors": {
          "count": 1
        },
        "reactors": {
          "count": 1,
          "is_empty": false,
          "count_reduced": "1"
        },
        "url": "https://www.facebook.com/groups/2478332015810393/permalink/4221014324875478/",
        "__typename": "Feedback",
        "if_viewer_has_locked_actor": null,
        "if_viewer_post_type_blocks_alternate_voice": null
      },
      "detection_analytics_enabled": false
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792732745032,
      "time_at_flush_ms": 1792732745701
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hblp": {
            "consistency": {
              "rev": 1051428616
            },
            "rsrcMap": {
              "csr:_2a_0_7P": {
                "type": "csr",
                "src": ":1,2,14,20,15,16,4,5,8,3,343",
                "c": 1
              }
            },
            "indexUpgrades": {}
          }
        },
        "jsmods": {
          "require": [
            [
              "CometAnimatedReactionIconRenderer.react"
            ],
            [
              "CometUFIReactionSentence_reactionDisplayConfig$normalization.graphql"
            ],
            [
              "CometUFIReactionSentence.react"
            ],
            [
              "CometAnimatedReactionIconRenderer_renderer$normalization.graphql"
            ],
            [
              "emptyFunction",
              "thatReturns",
              [
                "RequireDeferredReference"
              ],
              [
                [
                  {
                    "__dr": "…"
                  },
                  {
                    "__dr": "…"
                  },
                  {
                    "__dr": "…"
                  },
                  {
                    "__dr": "…"
                  }
                ]
              ]
            ],
            [
              "RequireDeferredReference",
              "unblock",
              [],
              [
                [
                  "CometAnimatedReactionIconRenderer.react",
                  "CometUFIReactionSentence_reactionDisplayConfig$normalization.graphql",
                  "CometUFIReactionSentence.react",
                  "CometAnimatedReactionIconRenderer_renderer$normalization.graphql"
                ],
                "sd"
              ]
            ],
            "… 1 more"
          ]
        },
        "allResources": [
          "csr:_2a_0_7P"
        ],
        "tieredResources": {
          "r": [
            "csr:_2a_0_7P"
          ],
          "rdfds": [],
          "rds": []
        }
      }
    }
  }
}
```

<!-- facts:end -->

## What it does

Sets a reaction on a post or reel: it sends `input` and reads back `feedback_react.feedback` and `feedback_react.detection_analytics_enabled`. It fired 1.1-1.7 s after each of five clickRole button steps (10, 21, 45, 61, 87); in run 20261020T052708 each of those steps is a `button "Like"` click.

## What our machine does with it

It decides the like (rule 73). The Reels warm-up's `like` step (`src/facebook/warmup/activities/helpers/reel.ts`) and the feed's `likePost` (`feed.ts`) click Like, wait for this call (`answerWaitOf`, 15 s), and pass only when it answers 2xx with no errors and `data.feedback_react.feedback.viewer_feedback_reaction_info.id` is the reaction we sent as `variables.input.feedback_reaction_id` (`answerIssue`, `checkStep`). The Like is `1635855486666999`. The "Remove Like" button is no longer what decides it. The steps only run with `--live` and `--likes` (rule 8, `allowedActions`), and `planReel` keeps a like cooldown between reels.

## What can go wrong

Every like seen answered 200 in 872-2018 ms. What the step then reports, and the run stops or outlines:
- no answer in the step: `Facebook never answered CometUFIFeedbackReactMutation in this step`;
- a status other than 2xx, or errors in the answer: the status or the errors;
- a saved reaction other than the one sent, or none (`viewer_feedback_reaction_info: null`): `answered data.feedback_react.feedback.viewer_feedback_reaction_info.id = …, not "1635855486666999"`.

A checkpoint or login page ends the run as `blocked`, as before.
