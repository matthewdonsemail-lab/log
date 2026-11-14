# flagshipWebRscActionActionsServerStreamRequest

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/flagship-web/rsc-action/actions/server-stream-request` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261106T014139_<name:1>/script12.js:1 b7`, `runs/inspect/20261107T170649_<name:1>/script13.js:1 b8` |
| rea | `ev_871fc298a6ca40ab00a951152efd2b3867b8a360a5fceb78097b27f3c9e8f0bc` |

Seen 20 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /in/<profile>/ | 1 | 0 | 61674 ms | 1143 ms | — |
| inspect | step 4: click e2111 | 1 | 200 | 890086 ms | 1083 ms | — |
| inspect | step 6: click e2157 | 1 | 200 | 890084 ms | 849650 ms | — |
| inspect | step 2: snapshot | 1 | 0 | 9785 ms | 203468 ms | — |
| inspect | step 3: snapshot | 2 | 0 | 147–7187 ms | 3005–3152 ms | — |
| inspect | step 4: goto /feed/ | 5 | 0 | 102–5171 ms | 2055–10012 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/server-request (382 ms) | 3 | 0 | 176–13896 ms | 131–21587 ms | — |
| inspect | step 5: goto /feed/ | 3 | 0 | 97–4441 ms | 1912–6446 ms | — |
| inspect | step 6: goto /feed/ | 1 | 200 | 890091 ms | 1923 ms | — |
| inspect | step 12: goto /feed/ | 1 | 200 | 890110 ms | 2210 ms | — |
| inspect | step 25: goto /in/<profile>/ | 1 | 0 | 42757 ms | 1248 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 0, 61674 ms

Sent:

```json
{
  "query": {
    "sduiid": "com.linkedin.sdui.realtimeDefaultHandler",
    "csrfToken": "<csrfToken>",
    "payload": {
      "requestId": "com.linkedin.sdui.realtimeDefaultHandler",
      "serverRequest": {
        "requestId": "com.linkedin.sdui.realtimeDefaultHandler",
        "requestedArguments": {
          "$type": "proto.sdui.actions.requests.RequestedArguments",
          "requestedStateKeys": [
            {
              "key": {
                "value": {
                  "$case": "id",
                  "id": "<id:1>"
                }
              }
            },
            {
              "key": {
                "value": {
                  "$case": "id",
                  "id": "<id:2>"
                }
              }
            }
          ],
          "payload": {
            "sessionId": {
              "key": "realtimeSessionId",
              "namespace": "MemoryNamespace"
            },
            "lastHeartbeatTimestamp": {
              "key": "realtimeHeartbeat",
              "namespace": "MemoryNamespace"
            }
          },
          "requestMetadata": {
            "$type": "proto.sdui.common.RequestMetadata"
          }
        },
        "isApfcEnabled": false,
        "isStreaming": true,
        "rumPageKey": "",
        "maxRetries": 0,
        "backOffMultiplier": 0,
        "maxSeconds": 0
      },
      "states": [],
      "requestedArguments": {
        "$type": "proto.sdui.actions.requests.RequestedArguments",
        "requestedStateKeys": [
          {
            "key": {
              "value": {
                "$case": "id",
                "id": "<id:1>"
              }
            }
          },
          {
            "key": {
              "value": {
                "$case": "id",
                "id": "<id:2>"
              }
            }
          }
        ],
        "payload": {
          "sessionId": {
            "key": "realtimeSessionId",
            "namespace": "MemoryNamespace"
          },
          "lastHeartbeatTimestamp": {
            "key": "realtimeHeartbeat",
            "namespace": "MemoryNamespace"
          }
        },
        "requestMetadata": {
          "$type": "proto.sdui.common.RequestMetadata"
        },
        "states": [],
        "screenId": "com.linkedin.sdui.flagshipnav.home.Home",
        "knownTemplateIds": []
      }
    },
    "_v": "0.2.8421"
  },
  "body": null
}
```

Answered:

```json
null
```

**runs/inspect/20261107T170649_<name:1>**, step 4: click e2111: 200, 890086 ms

Sent:

```json
{
  "query": {
    "sduiid": "com.linkedin.sdui.realtimeDefaultHandler",
    "csrfToken": "<csrfToken>",
    "payload": {
      "requestId": "com.linkedin.sdui.realtimeDefaultHandler",
      "serverRequest": {
        "requestId": "com.linkedin.sdui.realtimeDefaultHandler",
        "requestedArguments": {
          "$type": "proto.sdui.actions.requests.RequestedArguments",
          "requestedStateKeys": [
            {
              "key": {
                "value": {
                  "$case": "id",
                  "id": "<id:1>"
                }
              }
            },
            {
              "key": {
                "value": {
                  "$case": "id",
                  "id": "<id:2>"
                }
              }
            }
          ],
          "payload": {
            "sessionId": {
              "key": "realtimeSessionId",
              "namespace": "MemoryNamespace"
            },
            "lastHeartbeatTimestamp": {
              "key": "realtimeHeartbeat",
              "namespace": "MemoryNamespace"
            }
          },
          "requestMetadata": {
            "$type": "proto.sdui.common.RequestMetadata"
          }
        },
        "isApfcEnabled": false,
        "isStreaming": true,
        "rumPageKey": "",
        "maxRetries": 0,
        "backOffMultiplier": 0,
        "maxSeconds": 0
      },
      "states": [
        {
          "key": "realtimeHeartbeat",
          "namespace": "MemoryNamespace",
          "value": {
            "type": "bigint",
            "value": "-1"
          },
          "originalProtoCase": "signedLongValue",
          "protoKey": {
            "$type": "proto.sdui.Key",
            "value": {
              "$case": "id",
              "id": "<id:2>"
            }
          }
        }
      ],
      "requestedArguments": {
        "$type": "proto.sdui.actions.requests.RequestedArguments",
        "requestedStateKeys": [
          {
            "key": {
              "value": {
                "$case": "id",
                "id": "<id:1>"
              }
            }
          },
          {
            "key": {
              "value": {
                "$case": "id",
                "id": "<id:2>"
              }
            }
          }
        ],
        "payload": {
          "sessionId": {
            "key": "realtimeSessionId",
            "namespace": "MemoryNamespace"
          },
          "lastHeartbeatTimestamp": {
            "key": "realtimeHeartbeat",
            "namespace": "MemoryNamespace"
          }
        },
        "requestMetadata": {
          "$type": "proto.sdui.common.RequestMetadata"
        },
        "states": [
          {
            "key": "realtimeHeartbeat",
            "namespace": "MemoryNamespace",
            "value": {
              "type": "bigint",
              "value": "-1"
            },
            "originalProtoCase": "signedLongValue",
            "protoKey": {
              "$type": "proto.sdui.Key",
              "value": {
                "$case": "id",
                "id": "<id:2>"
              }
            }
          }
        ],
        "screenId": "com.linkedin.sdui.flagshipnav.home.Home",
        "knownTemplateIds": []
      }
    },
    "_v": "0.2.8421"
  },
  "body": null
}
```

Answered:

```json
"data: {\"type\":\"message\",\"data\":\"0:{\\\"response\\\":{\\\"$type\\\":\\\"proto.sdui.responses.ServerRequestResponse\\\",\\\"errors\\\":[],\\\"isRetryable\\\":false,\\\"completionAction\\\":{\\\"actions\\\":[{\\\"$type\\\":\\\"proto.sdui.actions.core.SetState\\\",\\\"value\\\":{\\\"isOptimistic\\\":false,\\\"state\\\":{\\\"$type\\\":\\\"proto.sdui.State\\\",\\\"stateKey\\\":\\\"\\\",\\\"value\\\":{\\\"$case\\\":\\\"intValue\\\",\\\"intValue\\\":1},\\\"isOptimistic\\\":false,\\\"key\\\":… (71588 chars)"
```

**runs/inspect/20261107T170649_<name:1>**, step 6: click e2157: 200, 890084 ms

Sent:

```json
{
  "query": {
    "sduiid": "com.linkedin.sdui.realtimeDefaultHandler",
    "csrfToken": "<csrfToken>",
    "payload": {
      "requestId": "com.linkedin.sdui.realtimeDefaultHandler",
      "serverRequest": {
        "requestId": "com.linkedin.sdui.realtimeDefaultHandler",
        "requestedArguments": {
          "$type": "proto.sdui.actions.requests.RequestedArguments",
          "requestedStateKeys": [
            {
              "key": {
                "value": {
                  "$case": "id",
                  "id": "<id:1>"
                }
              }
            },
            {
              "key": {
                "value": {
                  "$case": "id",
                  "id": "<id:2>"
                }
              }
            }
          ],
          "payload": {
            "sessionId": {
              "key": "realtimeSessionId",
              "namespace": "MemoryNamespace"
            },
            "lastHeartbeatTimestamp": {
              "key": "realtimeHeartbeat",
              "namespace": "MemoryNamespace"
            }
          },
          "requestMetadata": {
            "$type": "proto.sdui.common.RequestMetadata"
          }
        },
        "isApfcEnabled": false,
        "isStreaming": true,
        "rumPageKey": "",
        "maxRetries": 0,
        "backOffMultiplier": 0,
        "maxSeconds": 0
      },
      "states": [
        {
          "key": "realtimeHeartbeat",
          "namespace": "MemoryNamespace",
          "value": {
            "type": "bigint",
            "value": "-1"
          },
          "originalProtoCase": "signedLongValue",
          "protoKey": {
            "$type": "proto.sdui.Key",
            "value": {
              "$case": "id",
              "id": "<id:2>"
            }
          }
        }
      ],
      "requestedArguments": {
        "$type": "proto.sdui.actions.requests.RequestedArguments",
        "requestedStateKeys": [
          {
            "key": {
              "value": {
                "$case": "id",
                "id": "<id:1>"
              }
            }
          },
          {
            "key": {
              "value": {
                "$case": "id",
                "id": "<id:2>"
              }
            }
          }
        ],
        "payload": {
          "sessionId": {
            "key": "realtimeSessionId",
            "namespace": "MemoryNamespace"
          },
          "lastHeartbeatTimestamp": {
            "key": "realtimeHeartbeat",
            "namespace": "MemoryNamespace"
          }
        },
        "requestMetadata": {
          "$type": "proto.sdui.common.RequestMetadata"
        },
        "states": [
          {
            "key": "realtimeHeartbeat",
            "namespace": "MemoryNamespace",
            "value": {
              "type": "bigint",
              "value": "-1"
            },
            "originalProtoCase": "signedLongValue",
            "protoKey": {
              "$type": "proto.sdui.Key",
              "value": {
                "$case": "id",
                "id": "<id:2>"
              }
            }
          }
        ],
        "screenId": "com.linkedin.sdui.flagshipnav.home.Home",
        "knownTemplateIds": []
      }
    },
    "_v": "0.2.8421"
  },
  "body": null
}
```

Answered:

```json
"data: {\"type\":\"message\",\"data\":\"0:{\\\"response\\\":{\\\"$type\\\":\\\"proto.sdui.responses.ServerRequestResponse\\\",\\\"errors\\\":[],\\\"isRetryable\\\":false,\\\"completionAction\\\":{\\\"actions\\\":[{\\\"$type\\\":\\\"proto.sdui.actions.core.SetState\\\",\\\"value\\\":{\\\"isOptimistic\\\":false,\\\"state\\\":{\\\"$type\\\":\\\"proto.sdui.State\\\",\\\"stateKey\\\":\\\"\\\",\\\"value\\\":{\\\"$case\\\":\\\"intValue\\\",\\\"intValue\\\":1},\\\"isOptimistic\\\":false,\\\"key\\\":… (67478 chars)"
```

<!-- facts:end -->

## What it does

The web client's realtime channel: a long-lived stream for `com.linkedin.sdui.realtimeDefaultHandler`, with the CSRF token in its query. It stays open while the page does (up to about 890 s in our recordings) and pushes `data:` frames, each a `ServerRequestResponse` with its completion actions, so the page updates without asking.

## What our machine does with it

log's LinkedIn direct-API engine never sends it: nothing in `python/linkedinApi` or `vendor/openLinkedinApi` names this path, so no run waits on it, reads it or replays it. The engine opens no realtime stream.

## What can go wrong

200 is a stream that ran until the page closed it. Status 0 means our recording holds no answer: the browser cut the request off or had not finished it when the step's capture closed, usually because the page moved on. A dropped stream only stops the browser page's live updates and has no bearing on our runs.
