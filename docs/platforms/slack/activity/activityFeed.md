# activityFeed

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | activity |
| Kind | query |
| doc_id | — |
| Path | `/api/activity.feed` |
| Sends | `------WebKitFormBoundaryb8ppuqal9jzJ99N3
Content-Disposition: form-data; name`, `------WebKitFormBoundary8QKZWt7FM591i6EQ
Content-Disposition: form-data; name`, `------WebKitFormBoundaryXJve22ieEtZuVMPs
Content-Disposition: form-data; name` |
| Reads | `ok`, `items` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script3.js:2954 statement`, `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous` |
| rea | `ev_7561c58048793f56009510ea5b6d5edb12270f68a068cad2f2b1160b9c835346` |

Seen 3 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: saveState | 1 | 200 | 314 ms | 21599 ms | — |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 1 | 200 | 303 ms | 7210 ms | — |
| inspect | step 16: press Control+a | 1 | 200 | 458 ms | 86190 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 5: saveState: 200, 314 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689111.323",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "aVvVPXA0sak",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryb8ppuqal9jzJ99N3\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryb8ppuqal9jzJ99N3\r\nContent-Disposition: form-data; name=\"mode\"\r\n\r\nchrono_v1\r\n------WebKitFormBoundaryb8ppuqal9jzJ99N3\r\nContent-Disposition: form-data; name=\"types\"\r\n\r\nthread_v2,at_user,at_user_group,at_channel,at_everyone,keyword,message_reaction,int… (1625 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "items": [
    {
      "is_unread": false,
      "feed_ts": "1793689083.105289",
      "item": {
        "type": "dm",
        "bundle_info": {
          "payload": {
            "dm_entry": {
              "latest_message": {
                "ts": "1793689083.105289",
                "channel": "D0C8VAE7REU"
              }
            }
          }
        }
      },
      "key": "dm-D0C8VAE7REU",
      "is_archived": false,
      "version": "3d8d95975c81a77e2ade6618173dacad4c0908e93628341032b161ca019a799e"
    },
    {
      "is_unread": false,
      "feed_ts": "1793426083.000000",
      "item": {
        "type": "message_reaction",
        "message": {
          "ts": "1793426071.975999",
          "channel": "D0C8VAE7REU"
        },
        "reaction": {
          "user": "U0A9JFXK21L",
          "name": "+1"
        }
      },
      "key": "message_reaction-D0C8VAE7REU-1793426071.975999",
      "is_archived": false,
      "version": "3e880ef403d94f8f3f97983ff3b5adcca01178c24d9db1274ba9ffed24e26d03"
    },
    {
      "is_unread": true,
      "feed_ts": "1793425977.214919",
      "key": "thread_v2-D0C8VAE7REU-1793425898.143889",
      "item": {
        "type": "thread_v2",
        "bundle_info": {
          "payload": {
            "thread_entry": {
              "channel_id": "D0C8VAE7REU",
              "latest_ts": "1793425977.214919",
              "thread_ts": "1793425898.143889",
              "unread_msg_count": 1,
              "min_unread_ts": "1793425977.214919"
            }
          }
        }
      },
      "is_archived": false,
      "is_bot": false,
      "version": "ed51453d3dad094037b905f5eb8450794ada76d320682fa6ca64eb3424469fee"
    },
    {
      "is_unread": true,
      "feed_ts": "1793289032.825259",
      "key": "thread_v2-D0C8VAE7REU-1793285917.544979",
      "item": {
        "type": "thread_v2",
        "bundle_info": {
          "payload": {
            "thread_entry": {
              "channel_id": "D0C8VAE7REU",
              "latest_ts": "1793289032.825259",
              "thread_ts": "1793285917.544979",
              "unread_msg_count": 1,
              "min_unread_ts": "1793289032.825259"
            }
          }
        }
      },
      "is_archived": false,
      "is_bot": false,
      "version": "6753199c9ba6efba229ee14fd9a8e2fb83ef6f1d898b9be1d74707bb8fc52804"
    },
    {
      "is_unread": true,
      "feed_ts": "1793180184.720269",
      "item": {
        "type": "bot_dm_bundle",
        "bundle_info": {
          "unread_count": 2,
          "payload": {
            "message": {
              "ts": "1793180184.720269",
              "channel": "D0C4VCJA6NP"
            }
          }
        }
      },
      "key": "bot_dm_bundle-D0C4VCJA6NP",
      "is_archived": false,
      "is_bot": true,
      "version": "88a3b6af601756f53db908ba1a35cf29729964bb1e01135e5e5bc85221a114c1"
    },
    {
      "is_unread": false,
      "feed_ts": "1792916570.000000",
      "item": {
        "type": "message_reaction",
        "message": {
          "ts": "1792916547.440449",
          "channel": "D0C8VAE7REU"
        },
        "reaction": {
          "user": "U0A9JFXK21L",
          "name": "white_check_mark"
        }
      },
      "key": "message_reaction-D0C8VAE7REU-1792916547.440449",
      "is_archived": false,
      "version": "f4699e9152197f5c34b107a3141a2c89bd1933d0f533b99cf3c6167112637374"
    },
    "… 3 more"
  ]
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 303 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689122.292",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "aVvVPXA0sak",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundary8QKZWt7FM591i6EQ\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundary8QKZWt7FM591i6EQ\r\nContent-Disposition: form-data; name=\"channel_ids\"\r\n\r\nD0C8VAE7REU\r\n------WebKitFormBoundary8QKZWt7FM591i6EQ\r\nContent-Disposition: form-data; name=\"types\"\r\n\r\nthread_v2\r\n------WebKitFormBoundary8QKZWt7FM591i6EQ\r\nContent-Disposition: … (1105 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "items": [
    {
      "is_unread": true,
      "feed_ts": "1793425977.214919",
      "key": "thread_v2-D0C8VAE7REU-1793425898.143889",
      "item": {
        "type": "thread_v2",
        "bundle_info": {
          "payload": {
            "thread_entry": {
              "channel_id": "D0C8VAE7REU",
              "latest_ts": "1793425977.214919",
              "thread_ts": "1793425898.143889",
              "unread_msg_count": 1,
              "min_unread_ts": "1793425977.214919"
            }
          }
        }
      },
      "is_archived": false,
      "is_bot": false,
      "version": "ed51453d3dad094037b905f5eb8450794ada76d320682fa6ca64eb3424469fee"
    },
    {
      "is_unread": true,
      "feed_ts": "1793289032.825259",
      "key": "thread_v2-D0C8VAE7REU-1793285917.544979",
      "item": {
        "type": "thread_v2",
        "bundle_info": {
          "payload": {
            "thread_entry": {
              "channel_id": "D0C8VAE7REU",
              "latest_ts": "1793289032.825259",
              "thread_ts": "1793285917.544979",
              "unread_msg_count": 1,
              "min_unread_ts": "1793289032.825259"
            }
          }
        }
      },
      "is_archived": false,
      "is_bot": false,
      "version": "6753199c9ba6efba229ee14fd9a8e2fb83ef6f1d898b9be1d74707bb8fc52804"
    },
    {
      "is_unread": true,
      "feed_ts": "1792916238.690269",
      "key": "thread_v2-D0C8VAE7REU-1792825763.516099",
      "item": {
        "type": "thread_v2",
        "bundle_info": {
          "payload": {
            "thread_entry": {
              "channel_id": "D0C8VAE7REU",
              "latest_ts": "1792916238.690269",
              "thread_ts": "1792825763.516099",
              "unread_msg_count": 1,
              "min_unread_ts": "1792916238.690269"
            }
          }
        }
      },
      "is_archived": false,
      "is_bot": false,
      "version": "9f0c08ea91f7f16b82d84c0cd061df627204343efa83a8be750eece7948592d8"
    },
    {
      "is_unread": true,
      "feed_ts": "1792858415.559569",
      "key": "thread_v2-D0C8VAE7REU-1792823611.666799",
      "item": {
        "type": "thread_v2",
        "bundle_info": {
          "payload": {
            "thread_entry": {
              "channel_id": "D0C8VAE7REU",
              "latest_ts": "1792858415.559569",
              "thread_ts": "1792823611.666799",
              "unread_msg_count": 2,
              "min_unread_ts": "1792858408.800539"
            }
          }
        }
      },
      "is_archived": false,
      "is_bot": false,
      "version": "3d3b8ca5c08bce8607fb25538afda35d32141681ceaac28dd4ae17b6d696c3db"
    },
    {
      "is_unread": true,
      "feed_ts": "1792858390.020849",
      "key": "thread_v2-D0C8VAE7REU-1792754584.685549",
      "item": {
        "type": "thread_v2",
        "bundle_info": {
          "payload": {
            "thread_entry": {
              "channel_id": "D0C8VAE7REU",
              "latest_ts": "1792858390.020849",
              "thread_ts": "1792754584.685549",
              "unread_msg_count": 1,
              "min_unread_ts": "1792858390.020849"
            }
          }
        }
      },
      "is_archived": false,
      "is_bot": false,
      "version": "032dbeaedbf08db260a52cc6aa43aa38b46d98eda476d03d1df28b0effa9d305"
    }
  ]
}
```

**runs/inspect/20261103T065639_mattSlack**, step 16: press Control+a: 200, 458 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689599.083",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryXJve22ieEtZuVMPs\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryXJve22ieEtZuVMPs\r\nContent-Disposition: form-data; name=\"mode\"\r\n\r\nchrono_v1\r\n------WebKitFormBoundaryXJve22ieEtZuVMPs\r\nContent-Disposition: form-data; name=\"types\"\r\n\r\nthread_v2,at_user,at_user_group,at_channel,at_everyone,keyword,message_reaction,int… (1625 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "items": [
    {
      "is_unread": false,
      "feed_ts": "1793689365.012729",
      "item": {
        "type": "dm",
        "bundle_info": {
          "payload": {
            "dm_entry": {
              "latest_message": {
                "ts": "1793689380.462369",
                "channel": "D0C8VAE7REU"
              }
            }
          }
        }
      },
      "key": "dm-D0C8VAE7REU",
      "is_archived": false,
      "version": "d574899588cf71383ba8c3ff9d863b80b09f99eb35623561e5743cc2fb24c204"
    },
    {
      "is_unread": false,
      "feed_ts": "1793426083.000000",
      "item": {
        "type": "message_reaction",
        "message": {
          "ts": "1793426071.975999",
          "channel": "D0C8VAE7REU"
        },
        "reaction": {
          "user": "U0A9JFXK21L",
          "name": "+1"
        }
      },
      "key": "message_reaction-D0C8VAE7REU-1793426071.975999",
      "is_archived": false,
      "version": "3e880ef403d94f8f3f97983ff3b5adcca01178c24d9db1274ba9ffed24e26d03"
    },
    {
      "is_unread": true,
      "feed_ts": "1793425977.214919",
      "key": "thread_v2-D0C8VAE7REU-1793425898.143889",
      "item": {
        "type": "thread_v2",
        "bundle_info": {
          "payload": {
            "thread_entry": {
              "channel_id": "D0C8VAE7REU",
              "latest_ts": "1793425977.214919",
              "thread_ts": "1793425898.143889",
              "unread_msg_count": 1,
              "min_unread_ts": "1793425977.214919"
            }
          }
        }
      },
      "is_archived": false,
      "is_bot": false,
      "version": "ed51453d3dad094037b905f5eb8450794ada76d320682fa6ca64eb3424469fee"
    },
    {
      "is_unread": true,
      "feed_ts": "1793289032.825259",
      "key": "thread_v2-D0C8VAE7REU-1793285917.544979",
      "item": {
        "type": "thread_v2",
        "bundle_info": {
          "payload": {
            "thread_entry": {
              "channel_id": "D0C8VAE7REU",
              "latest_ts": "1793289032.825259",
              "thread_ts": "1793285917.544979",
              "unread_msg_count": 1,
              "min_unread_ts": "1793289032.825259"
            }
          }
        }
      },
      "is_archived": false,
      "is_bot": false,
      "version": "6753199c9ba6efba229ee14fd9a8e2fb83ef6f1d898b9be1d74707bb8fc52804"
    },
    {
      "is_unread": true,
      "feed_ts": "1793180184.720269",
      "item": {
        "type": "bot_dm_bundle",
        "bundle_info": {
          "unread_count": 2,
          "payload": {
            "message": {
              "ts": "1793180184.720269",
              "channel": "D0C4VCJA6NP"
            }
          }
        }
      },
      "key": "bot_dm_bundle-D0C4VCJA6NP",
      "is_archived": false,
      "is_bot": true,
      "version": "88a3b6af601756f53db908ba1a35cf29729964bb1e01135e5e5bc85221a114c1"
    },
    {
      "is_unread": false,
      "feed_ts": "1792916570.000000",
      "item": {
        "type": "message_reaction",
        "message": {
          "ts": "1792916547.440449",
          "channel": "D0C8VAE7REU"
        },
        "reaction": {
          "user": "U0A9JFXK21L",
          "name": "white_check_mark"
        }
      },
      "key": "message_reaction-D0C8VAE7REU-1792916547.440449",
      "is_archived": false,
      "version": "f4699e9152197f5c34b107a3141a2c89bd1933d0f533b99cf3c6167112637374"
    },
    "… 3 more"
  ]
}
```

<!-- facts:end -->

## What it does

Loads the Activity tab's feed for the signed-in user: it sent the `token`, a `mode` of `chrono_v1` and a long `types` list (thread_v2, at_user, message_reaction and more), and answered `ok: true` with `items` such as `dm`, `thread_v2`, `message_reaction` and `bot_dm_bundle` entries, each with `is_unread`, `feed_ts` and a `key`. It fired in three inspect steps: step 5 saveState (314 ms), step 6 goto the DM `D0C8VAE7REU` (303 ms, with `channel_ids` and `types: thread_v2`, so only that DM's threads came back) and step 16 press Control+a (458 ms).

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`, actions ping, workspaces, chats, read, send, watch over `vendor/gabrielSlack`) never uses this endpoint; it is Slack's web client's own traffic, seen only because the `log inspect` AdsPower run on mattSlack loaded the page. Unread state for our account comes from the watch websocket and the `read` action's conversations.history, not from this feed.

## What can go wrong

All three recorded calls were status 200 with `ok: true`. An `ok: false` with an `error` such as `invalid_auth` would mean the session behind the cookies is dead, which our engine reports as `AUTH_DEAD` from its own session check, not through this call; a rate-limit answer would mean stop (rule 94).
