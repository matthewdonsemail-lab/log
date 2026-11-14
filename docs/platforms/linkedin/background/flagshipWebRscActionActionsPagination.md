# flagshipWebRscActionActionsPagination

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/flagship-web/rsc-action/actions/pagination` |
| Sends | `pagerId`, `clientArguments`, `paginationRequest` |
| Reads | — |
| Called from | `runs/inspect/20261107T170649_<name:1>/script37.js:80 statement`, `runs/inspect/20261107T170649_<name:1>/script60.js:60 statement`, `runs/chrome/20261114T213510_<name:1>/script1.js:76 statement`, `runs/chrome/20261114T213510_<name:1>/script46.js:80 statement` |
| rea | `ev_5cfd2fb233988a083e7a32eaf9b52c9716fd2449612f4b8adb678922b4ffcc9e` |

Seen 11 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | POST 0 /flagship-web/rsc-action/actions/app-config (501 ms) | 1 | 200 | 509 ms | 7662 ms | — |
| inspect | step 4: goto /feed/ | 2 | 0 | 759–1224 ms | 2070–7899 ms | — |
| inspect | step 5: goto /feed/ | 1 | 0 | 965 ms | 1913 ms | — |
| inspect | step 6: goto /feed/ | 1 | 200 | 753 ms | 1930 ms | — |
| inspect | step 12: goto /feed/ | 1 | 0 | 970 ms | 2216 ms | — |
| inspect | step 21: click e1341 | 1 | 200 | 733 ms | 1588 ms | — |
| chrome | step 2: send a message, by hand | 1 | 200 | 716 ms | 8862 ms | — |
| chrome | step 3: react to a post, by hand | 1 | 200 | 876 ms | 9342 ms | — |
| chrome | step 8: comment on a post, by hand | 1 | 200 | 811 ms | 3043 ms | — |
| chrome | step 9: open My Network's invitations, by hand | 1 | 200 | 752 ms | 54 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T161246_<name:1>**, POST 0 /flagship-web/rsc-action/actions/app-config (501 ms): 200, 509 ms

Sent:

```json
{
  "query": {
    "sduiid": "com.linkedin.sdui.pagers.feed.mainFeed",
    "parentSpanId": "M2R8Aw1Me5Q="
  },
  "body": {
    "pagerId": "com.linkedin.sdui.pagers.feed.mainFeed",
    "clientArguments": {
      "$type": "proto.sdui.actions.requests.RequestedArguments",
      "requestedStateKeys": [],
      "payload": {
        "startIndex": 3,
        "count": 5,
        "feedSortOrder": "FeedSortOrder_RELEVANCE",
        "requestType": "Pagination"
      },
      "requestMetadata": {
        "$type": "proto.sdui.common.RequestMetadata"
      },
      "states": [],
      "screenId": "com.linkedin.sdui.flagshipnav.feed.ForYouFeed",
      "knownTemplateIds": []
    },
    "paginationRequest": {
      "$type": "proto.sdui.actions.requests.PaginationRequest",
      "pagerId": "com.linkedin.sdui.pagers.feed.mainFeed",
      "trigger": {
        "$case": "itemDistanceTrigger",
        "itemDistanceTrigger": {
          "$type": "proto.sdui.actions.requests.ItemDistanceTrigger",
          "preloadDistance": 5,
          "preloadLength": 2000
        }
      },
      "retryCount": 1,
      "requestedArguments": {
        "$type": "proto.sdui.actions.requests.RequestedArguments",
        "requestedStateKeys": [],
        "payload": {
          "startIndex": 3,
          "count": 5,
          "feedSortOrder": "FeedSortOrder_RELEVANCE",
          "requestType": "Pagination"
        },
        "requestMetadata": {
          "$type": "proto.sdui.common.RequestMetadata"
        }
      },
      "onClientError": {
        "actions": [
          {
            "$type": "proto.sdui.actions.core.ServerRequest",
            "value": {
              "requestId": "com.linkedin.sdui.update.incrementCounterMetric",
              "requestedArguments": {
                "$type": "proto.sdui.actions.requests.RequestedArguments",
                "requestedStateKeys": [],
                "payload": {
                  "feedType": "FeedType_MAIN_FEED_RELEVANCE",
                  "requestType": "EndOfFeed"
                },
                "requestMetadata": {
                  "$type": "proto.sdui.common.RequestMetadata"
                }
              },
              "isApfcEnabled": false,
              "isStreaming": false,
              "rumPageKey": "",
              "maxRetries": 0,
              "backOffMultiplier": 0,
              "maxSeconds": 0
            }
          },
          {
            "$type": "proto.sdui.actions.core.ConditionalAction",
            "value": {
              "expression": {
                "$type": "proto.sdui.expressions.BooleanExpression",
                "expression": {
                  "$case": "stringEqualsExpression",
                  "stringEqualsExpression": {
                    "$type": "…",
                    "ignoreCase": "…",
                    "a": "…",
                    "b": "…"
                  }
                },
                "isReactive": true
              },
              "whenTrue": {
                "actions": [
                  {
                    "$type": "…",
                    "value": "…"
                  }
                ]
              },
              "whenFalse": {
                "actions": [
                  {
                    "$type": "…",
                    "value": "…"
                  }
                ]
              }
            }
          },
          {
            "$type": "proto.sdui.actions.core.SetState",
            "value": {
              "state": {
                "key": {
                  "key": {
                    "value": "…"
                  }
                },
                "value": {
                  "$case": "expression",
                  "expression": {
                    "expression": "…"
                  }
                }
              }
            }
          },
          {
            "$type": "proto.sdui.actions.core.ConditionalAction",
            "value": {
              "expression": {
                "$type": "proto.sdui.expressions.BooleanExpression",
                "expression": {
                  "$case": "stringEqualsExpression",
                  "stringEqualsExpression": {
                    "$type": "…",
                    "ignoreCase": "…",
                    "a": "…",
                    "b": "…"
                  }
                },
                "isReactive": true
              },
              "whenTrue": {
                "actions": [
                  {
                    "$type": "…",
                    "value": "…"
                  },
                  {
                    "$type": "…",
                    "value": "…"
                  }
                ]
              },
              "whenFalse": {
                "actions": [
                  {
                    "$type": "…",
                    "value": "…"
                  }
                ]
              }
            }
          },
          {
            "$type": "proto.sdui.actions.core.ConditionalAction",
            "value": {
              "expression": {
                "$type": "proto.sdui.expressions.BooleanExpression",
                "expression": {
                  "$case": "stringEqualsExpression",
                  "stringEqualsExpression": {
                    "$type": "…",
                    "ignoreCase": "…",
                    "a": "…",
                    "b": "…"
                  }
                },
                "isReactive": true
              },
              "whenFalse": {
                "actions": [
                  {
                    "$type": "…",
                    "value": "…"
                  }
                ]
              }
            }
          }
        ]
      }
    }
  }
}
```

Answered:

```json
null
```

**runs/inspect/20261107T161246_<name:1>**, step 4: goto /feed/: 0, 1224 ms

Sent:

```json
{
  "query": {
    "sduiid": "com.linkedin.sdui.pagers.feed.mainFeed",
    "parentSpanId": "E2FvMC5bOIE="
  },
  "body": {
    "pagerId": "com.linkedin.sdui.pagers.feed.mainFeed",
    "clientArguments": {
      "$type": "proto.sdui.actions.requests.RequestedArguments",
      "requestedStateKeys": [],
      "payload": {
        "startIndex": 3,
        "count": 5,
        "feedSortOrder": "FeedSortOrder_RELEVANCE",
        "requestType": "Pagination"
      },
      "requestMetadata": {
        "$type": "proto.sdui.common.RequestMetadata"
      },
      "states": [],
      "screenId": "com.linkedin.sdui.flagshipnav.feed.ForYouFeed",
      "knownTemplateIds": []
    },
    "paginationRequest": {
      "$type": "proto.sdui.actions.requests.PaginationRequest",
      "pagerId": "com.linkedin.sdui.pagers.feed.mainFeed",
      "trigger": {
        "$case": "itemDistanceTrigger",
        "itemDistanceTrigger": {
          "$type": "proto.sdui.actions.requests.ItemDistanceTrigger",
          "preloadDistance": 5,
          "preloadLength": 2000
        }
      },
      "retryCount": 1,
      "requestedArguments": {
        "$type": "proto.sdui.actions.requests.RequestedArguments",
        "requestedStateKeys": [],
        "payload": {
          "startIndex": 3,
          "count": 5,
          "feedSortOrder": "FeedSortOrder_RELEVANCE",
          "requestType": "Pagination"
        },
        "requestMetadata": {
          "$type": "proto.sdui.common.RequestMetadata"
        }
      },
      "onClientError": {
        "actions": [
          {
            "$type": "proto.sdui.actions.core.ServerRequest",
            "value": {
              "requestId": "com.linkedin.sdui.update.incrementCounterMetric",
              "requestedArguments": {
                "$type": "proto.sdui.actions.requests.RequestedArguments",
                "requestedStateKeys": [],
                "payload": {
                  "feedType": "FeedType_MAIN_FEED_RELEVANCE",
                  "requestType": "EndOfFeed"
                },
                "requestMetadata": {
                  "$type": "proto.sdui.common.RequestMetadata"
                }
              },
              "isApfcEnabled": false,
              "isStreaming": false,
              "rumPageKey": "",
              "maxRetries": 0,
              "backOffMultiplier": 0,
              "maxSeconds": 0
            }
          },
          {
            "$type": "proto.sdui.actions.core.ConditionalAction",
            "value": {
              "expression": {
                "$type": "proto.sdui.expressions.BooleanExpression",
                "expression": {
                  "$case": "stringEqualsExpression",
                  "stringEqualsExpression": {
                    "$type": "…",
                    "ignoreCase": "…",
                    "a": "…",
                    "b": "…"
                  }
                },
                "isReactive": true
              },
              "whenTrue": {
                "actions": [
                  {
                    "$type": "…",
                    "value": "…"
                  }
                ]
              },
              "whenFalse": {
                "actions": [
                  {
                    "$type": "…",
                    "value": "…"
                  }
                ]
              }
            }
          },
          {
            "$type": "proto.sdui.actions.core.SetState",
            "value": {
              "state": {
                "key": {
                  "key": {
                    "value": "…"
                  }
                },
                "value": {
                  "$case": "expression",
                  "expression": {
                    "expression": "…"
                  }
                }
              }
            }
          },
          {
            "$type": "proto.sdui.actions.core.ConditionalAction",
            "value": {
              "expression": {
                "$type": "proto.sdui.expressions.BooleanExpression",
                "expression": {
                  "$case": "stringEqualsExpression",
                  "stringEqualsExpression": {
                    "$type": "…",
                    "ignoreCase": "…",
                    "a": "…",
                    "b": "…"
                  }
                },
                "isReactive": true
              },
              "whenTrue": {
                "actions": [
                  {
                    "$type": "…",
                    "value": "…"
                  },
                  {
                    "$type": "…",
                    "value": "…"
                  }
                ]
              },
              "whenFalse": {
                "actions": [
                  {
                    "$type": "…",
                    "value": "…"
                  }
                ]
              }
            }
          },
          {
            "$type": "proto.sdui.actions.core.ConditionalAction",
            "value": {
              "expression": {
                "$type": "proto.sdui.expressions.BooleanExpression",
                "expression": {
                  "$case": "stringEqualsExpression",
                  "stringEqualsExpression": {
                    "$type": "…",
                    "ignoreCase": "…",
                    "a": "…",
                    "b": "…"
                  }
                },
                "isReactive": true
              },
              "whenFalse": {
                "actions": [
                  {
                    "$type": "…",
                    "value": "…"
                  }
                ]
              }
            }
          }
        ]
      }
    }
  }
}
```

Answered:

```json
null
```

**runs/inspect/20261107T161246_<name:1>**, step 5: goto /feed/: 0, 965 ms

Sent:

```json
{
  "query": {
    "sduiid": "com.linkedin.sdui.pagers.feed.mainFeed",
    "parentSpanId": "XD5hFYSQYoE="
  },
  "body": {
    "pagerId": "com.linkedin.sdui.pagers.feed.mainFeed",
    "clientArguments": {
      "$type": "proto.sdui.actions.requests.RequestedArguments",
      "requestedStateKeys": [],
      "payload": {
        "startIndex": 3,
        "count": 5,
        "feedSortOrder": "FeedSortOrder_RELEVANCE",
        "requestType": "Pagination"
      },
      "requestMetadata": {
        "$type": "proto.sdui.common.RequestMetadata"
      },
      "states": [],
      "screenId": "com.linkedin.sdui.flagshipnav.feed.ForYouFeed",
      "knownTemplateIds": []
    },
    "paginationRequest": {
      "$type": "proto.sdui.actions.requests.PaginationRequest",
      "pagerId": "com.linkedin.sdui.pagers.feed.mainFeed",
      "trigger": {
        "$case": "itemDistanceTrigger",
        "itemDistanceTrigger": {
          "$type": "proto.sdui.actions.requests.ItemDistanceTrigger",
          "preloadDistance": 5,
          "preloadLength": 2000
        }
      },
      "retryCount": 1,
      "requestedArguments": {
        "$type": "proto.sdui.actions.requests.RequestedArguments",
        "requestedStateKeys": [],
        "payload": {
          "startIndex": 3,
          "count": 5,
          "feedSortOrder": "FeedSortOrder_RELEVANCE",
          "requestType": "Pagination"
        },
        "requestMetadata": {
          "$type": "proto.sdui.common.RequestMetadata"
        }
      },
      "onClientError": {
        "actions": [
          {
            "$type": "proto.sdui.actions.core.ServerRequest",
            "value": {
              "requestId": "com.linkedin.sdui.update.incrementCounterMetric",
              "requestedArguments": {
                "$type": "proto.sdui.actions.requests.RequestedArguments",
                "requestedStateKeys": [],
                "payload": {
                  "feedType": "FeedType_MAIN_FEED_RELEVANCE",
                  "requestType": "EndOfFeed"
                },
                "requestMetadata": {
                  "$type": "proto.sdui.common.RequestMetadata"
                }
              },
              "isApfcEnabled": false,
              "isStreaming": false,
              "rumPageKey": "",
              "maxRetries": 0,
              "backOffMultiplier": 0,
              "maxSeconds": 0
            }
          },
          {
            "$type": "proto.sdui.actions.core.ConditionalAction",
            "value": {
              "expression": {
                "$type": "proto.sdui.expressions.BooleanExpression",
                "expression": {
                  "$case": "stringEqualsExpression",
                  "stringEqualsExpression": {
                    "$type": "…",
                    "ignoreCase": "…",
                    "a": "…",
                    "b": "…"
                  }
                },
                "isReactive": true
              },
              "whenTrue": {
                "actions": [
                  {
                    "$type": "…",
                    "value": "…"
                  }
                ]
              },
              "whenFalse": {
                "actions": [
                  {
                    "$type": "…",
                    "value": "…"
                  }
                ]
              }
            }
          },
          {
            "$type": "proto.sdui.actions.core.SetState",
            "value": {
              "state": {
                "key": {
                  "key": {
                    "value": "…"
                  }
                },
                "value": {
                  "$case": "expression",
                  "expression": {
                    "expression": "…"
                  }
                }
              }
            }
          },
          {
            "$type": "proto.sdui.actions.core.ConditionalAction",
            "value": {
              "expression": {
                "$type": "proto.sdui.expressions.BooleanExpression",
                "expression": {
                  "$case": "stringEqualsExpression",
                  "stringEqualsExpression": {
                    "$type": "…",
                    "ignoreCase": "…",
                    "a": "…",
                    "b": "…"
                  }
                },
                "isReactive": true
              },
              "whenTrue": {
                "actions": [
                  {
                    "$type": "…",
                    "value": "…"
                  },
                  {
                    "$type": "…",
                    "value": "…"
                  }
                ]
              },
              "whenFalse": {
                "actions": [
                  {
                    "$type": "…",
                    "value": "…"
                  }
                ]
              }
            }
          },
          {
            "$type": "proto.sdui.actions.core.ConditionalAction",
            "value": {
              "expression": {
                "$type": "proto.sdui.expressions.BooleanExpression",
                "expression": {
                  "$case": "stringEqualsExpression",
                  "stringEqualsExpression": {
                    "$type": "…",
                    "ignoreCase": "…",
                    "a": "…",
                    "b": "…"
                  }
                },
                "isReactive": true
              },
              "whenFalse": {
                "actions": [
                  {
                    "$type": "…",
                    "value": "…"
                  }
                ]
              }
            }
          }
        ]
      }
    }
  }
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

Fetches the next page of a server-driven list by its `pagerId`; every recorded call was the main feed (`com.linkedin.sdui.pagers.feed.mainFeed`), sent as the feed loaded or after a click. Its `paginationRequest` carries a distance trigger and follow-up actions, including a `server-request` to `incrementCounterMetric`.

## What our machine does with it

log's LinkedIn direct-API engine never sends it: nothing in `python/linkedinApi` or `vendor/openLinkedinApi` names this path, so no run waits on it, reads it or replays it. No command of ours reads the feed's pages.

## What can go wrong

Two calls answered 200; the other five have status 0. Status 0 means our recording holds no answer: the browser cut the request off or had not finished it when the step's capture closed, usually because the page moved on. Neither affects our runs.
