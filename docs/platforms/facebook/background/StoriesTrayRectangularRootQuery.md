# StoriesTrayRectangularRootQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27831542276468324` |
| Path | `/api/graphql/` |
| Sends | `blur`, `bucketsToFetch`, `isFbNotesIncluded`, `scale`, `trayType`, `__relay_internal__pv__StoriesTrayTileCoverImageWidthrelayprovider`, `__relay_internal__pv__StoriesTrayTileCoverImageHeightrelayprovider`, `__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider`, `__relay_internal__pv__StoriesTrayTileShouldSkipPrefetchImageURIrelayprovider`, `__relay_internal__pv__StoriesTrayProfessionalInset3DEnabledrelayprovider`, `__relay_internal__pv__StoriesShouldEnableVideoAutoplayrelayprovider`, `__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider` |
| Reads | `me`, `viewer.actor`, `viewer....useStoriesTrayRefresh_viewer` |
| Called from | `StoriesTrayRectangularRoot.react` |
| rea | `ev_c974048d5563e87d75f5e8ddd458fdc3829a195d00e0a636a969922c24e6ae81` |

Seen 17 time(s) in 11 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 752 ms | 13577 ms | — |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 905 ms | 12045 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 1041 ms | 7076 ms | — |
| warmup | step 11: goto /marketplace/ | 1 | 200 | 784 ms | 8617 ms | — |
| warmup | step 17: goto /marketplace/ | 1 | 200 | 749 ms | 12053 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 862 ms | 1258023 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 575 ms | 5497 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 625 ms | 8271 ms | — |
| inspect | step 4: snapshot | 1 | 200 | 902 ms | 354 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 891 ms | 6698 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 1021 ms | 103706 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 1 | 200 | 1050 ms | 5710 ms | — |
| inspect | step 4: goto /marketplace/inbox | 1 | 200 | 1150 ms | 558528 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 1623 ms | 59470 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 2586 ms | 11556 ms | — |
| inspect | step 6: goto /marketplace/inbox | 1 | 200 | 1190 ms | 1708114 ms | — |
| inspect | openAny: read /marketplace/item/<id>/ | 1 | 200 | 948 ms | 15223 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T045453_61594063207669**, openAny: read /marketplace/item/<id>/: 200, 948 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "StoriesTrayRectangularRootQuery",
  "server_timestamps": "true",
  "variables": {
    "blur": 10,
    "bucketsToFetch": 6,
    "isFbNotesIncluded": false,
    "scale": 1,
    "__relay_internal__pv__StoriesTrayTileCoverImageWidthrelayprovider": 110,
    "__relay_internal__pv__StoriesTrayTileCoverImageHeightrelayprovider": 160,
    "__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider": false,
    "__relay_internal__pv__StoriesTrayTileShouldSkipPrefetchImageURIrelayprovider": false,
    "__relay_internal__pv__StoriesTrayProfessionalInset3DEnabledrelayprovider": true,
    "__relay_internal__pv__StoriesShouldEnableVideoAutoplayrelayprovider": true,
    "__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider": false
  },
  "doc_id": "27831542276468324"
}
```

Answered:

```json
{
  "data": {
    "me": {
      "__typename": "User",
      "unified_stories_buckets": {
        "edges": [
          {
            "node": {
              "__typename": "DirectMessageThreadBucket",
              "__isStoryBucket": "DirectMessageThreadBucket",
              "id": "122126439807468773",
              "unified_stories": {
                "nodes": [],
                "is_empty": true
              },
              "first_story_to_show": null,
              "story_bucket_owner": {
                "__typename": "User",
                "profilePic": {
                  "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c239.0.950.951a_cp0_dst-jpg_tt6&cstp=mx950x951&ctp=s40x40&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwE6bxJw&_nc_oc=AdqzfI05YFO4WVkHHaoOX7NfkF0BMZceA_z57oIowgpfBIwIKrM5VIHRnNOHr1H3XWY&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=6EFm-S9U6ycWKgPjW7pUBw&_nc_ss=792a8&oh=00_AQO3… (454 chars)"
                },
                "__isNode": "User",
                "id": "61594063207669",
                "is_viewer_friend": false,
                "gender": "FEMALE",
                "name": "Bethlehem Trash",
                "profile_picture": {
                  "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c239.0.950.951a_cp0_dst-jpg_tt6&cstp=mx950x951&ctp=s40x40&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwE6bxJw&_nc_oc=AdqzfI05YFO4WVkHHaoOX7NfkF0BMZceA_z57oIowgpfBIwIKrM5VIHRnNOHr1H3XWY&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=6EFm-S9U6ycWKgPjW7pUBw&_nc_ss=792a8&oh=00_AQO3… (454 chars)"
                },
                "coverImage": {
                  "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c387.0.654.951a_dst-jpg_tt6&cstp=mx654x951&ctp=s160x160&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwE6bxJw&_nc_oc=AdqzfI05YFO4WVkHHaoOX7NfkF0BMZceA_z57oIowgpfBIwIKrM5VIHRnNOHr1H3XWY&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=6EFm-S9U6ycWKgPjW7pUBw&_nc_ss=792a8&oh=00_AQOouB… (452 chars)"
                }
              },
              "story_bucket_type": "STORY",
              "is_bucket_seen_by_viewer": true,
              "unified_stories_with_notes": {
                "edges": [],
                "nodes": []
              },
              "can_viewer_post": true,
              "should_show_close_friend_badge": false,
              "ranking_tracking_string": "{\"request_id\":\"136959db-1fad-42ad-8252-b67c0a5f5d2c\",\"bucket_id\":\"122126439807468773\",\"owner_id\":\"61594063207669\",\"scored_time\":0,\"ranker_join_key\":\"136959db-1fad-42ad-8252-b67c0a5f5d2c\",\"raas_position\":0,\"raas_newly_scored_position\":0,\"random_rate\":0,\"usecase_id\":\"1\",\"is_suggested\":false,\"viewstate_token\":\"{\\\"shardManagerScope\\\":\\\"rva\\\",\\\"snapshotId\\\":6729382173318379007,\\\"versionId\\\":0,\\\"creatio… (421 chars)",
              "thumbnail_story_to_show": null,
              "is_bucket_live": false
            },
            "cursor": "NjE1OTQwNjMyMDc2Njk6MToxNzkyNzMxNTIwOjEyMjEyNjQzOTgwNzQ2ODc3MzotMTpydmE6NjcyOTM4MjE3MzMxODM3OTAwNzowOjE3OTI3MzE1MjA6OjA="
          }
        ],
        "page_info": {
          "end_cursor": "NjE1OTQwNjMyMDc2Njk6MToxNzkyNzMxNTIwOjEyMjEyNjQzOTgwNzQ2ODc3MzotMTpydmE6NjcyOTM4MjE3MzMxODM3OTAwNzowOjE3OTI3MzE1MjA6OjA=",
          "has_next_page": false
        }
      },
      "id": "61594063207669",
      "profilePicture": {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c239.0.950.951a_dst-jpg_tt6&cstp=mx950x951&ctp=s160x160&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwE6bxJw&_nc_oc=AdqzfI05YFO4WVkHHaoOX7NfkF0BMZceA_z57oIowgpfBIwIKrM5VIHRnNOHr1H3XWY&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=6EFm-S9U6ycWKgPjW7pUBw&_nc_ss=792a8&oh=00_AQOCar… (452 chars)"
      }
    },
    "viewer": {
      "actor": {
        "__typename": "User",
        "id": "61594063207669"
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c239.0.950.951a_dst-jpg_tt6&cstp=mx950x951&ctp=s160x160&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwE6bxJw&_nc_oc=AdqzfI05YFO4WVkHHaoOX7NfkF0BMZceA_z57oIowgpfBIwIKrM5VIHRnNOHr1H3XWY&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=6EFm-S9U6ycWKgPjW7pUBw&_nc_ss=792a8&oh=00_AQOCar… (452 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c239.0.950.951a_cp0_dst-jpg_tt6&cstp=mx950x951&ctp=s40x40&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwE6bxJw&_nc_oc=AdqzfI05YFO4WVkHHaoOX7NfkF0BMZceA_z57oIowgpfBIwIKrM5VIHRnNOHr1H3XWY&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=6EFm-S9U6ycWKgPjW7pUBw&_nc_ss=792a8&oh=00_AQO3… (454 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1792731520978,
      "time_at_flush_ms": 1792731521152
    },
    "is_final": true
  }
}
```

**runs/inspect/20261023T000744_61594063207669**, step 3: goto /marketplace/inbox: 200, 1623 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "StoriesTrayRectangularRootQuery",
  "server_timestamps": "true",
  "variables": {
    "blur": 10,
    "bucketsToFetch": 6,
    "isFbNotesIncluded": false,
    "scale": 1,
    "__relay_internal__pv__StoriesTrayTileCoverImageWidthrelayprovider": 110,
    "__relay_internal__pv__StoriesTrayTileCoverImageHeightrelayprovider": 160,
    "__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider": false,
    "__relay_internal__pv__StoriesTrayTileShouldSkipPrefetchImageURIrelayprovider": false,
    "__relay_internal__pv__StoriesTrayProfessionalInset3DEnabledrelayprovider": true,
    "__relay_internal__pv__StoriesShouldEnableVideoAutoplayrelayprovider": true,
    "__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider": false
  },
  "doc_id": "27831542276468324"
}
```

Answered:

```json
{
  "data": {
    "me": {
      "__typename": "User",
      "unified_stories_buckets": {
        "edges": [
          {
            "node": {
              "__typename": "DirectMessageThreadBucket",
              "__isStoryBucket": "DirectMessageThreadBucket",
              "id": "122126439807468773",
              "unified_stories": {
                "nodes": [],
                "is_empty": true
              },
              "first_story_to_show": null,
              "story_bucket_owner": {
                "__typename": "User",
                "profilePic": {
                  "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c239.0.950.951a_cp0_dst-jpg_tt6&cstp=mx950x951&ctp=s40x40&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwFGX9Mc&_nc_oc=AdrcJvjvCTJsMtX_wCl0FuLhtWE_LjJPvmUjOuO3q_fxG-8z1zV8Cz68OKvdIm8D0M0&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=rsbEMIjmzs6OSDWt4407Jw&_nc_ss=792a8&oh=00_AQPt… (454 chars)"
                },
                "__isNode": "User",
                "id": "61594063207669",
                "is_viewer_friend": false,
                "gender": "FEMALE",
                "name": "Bethlehem Trash",
                "profile_picture": {
                  "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c239.0.950.951a_cp0_dst-jpg_tt6&cstp=mx950x951&ctp=s40x40&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwFGX9Mc&_nc_oc=AdrcJvjvCTJsMtX_wCl0FuLhtWE_LjJPvmUjOuO3q_fxG-8z1zV8Cz68OKvdIm8D0M0&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=rsbEMIjmzs6OSDWt4407Jw&_nc_ss=792a8&oh=00_AQPt… (454 chars)"
                },
                "coverImage": {
                  "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c387.0.654.951a_dst-jpg_tt6&cstp=mx654x951&ctp=s160x160&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwFGX9Mc&_nc_oc=AdrcJvjvCTJsMtX_wCl0FuLhtWE_LjJPvmUjOuO3q_fxG-8z1zV8Cz68OKvdIm8D0M0&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=rsbEMIjmzs6OSDWt4407Jw&_nc_ss=792a8&oh=00_AQPwxb… (452 chars)"
                }
              },
              "story_bucket_type": "STORY",
              "is_bucket_seen_by_viewer": true,
              "unified_stories_with_notes": {
                "edges": [],
                "nodes": []
              },
              "can_viewer_post": true,
              "should_show_close_friend_badge": false,
              "ranking_tracking_string": "{\"request_id\":\"bd100d01-3652-4065-8a58-c4af2ab7fbc0\",\"bucket_id\":\"122126439807468773\",\"owner_id\":\"61594063207669\",\"scored_time\":0,\"ranker_join_key\":\"bd100d01-3652-4065-8a58-c4af2ab7fbc0\",\"raas_position\":0,\"raas_newly_scored_position\":0,\"random_rate\":0,\"usecase_id\":\"1\",\"is_suggested\":false,\"viewstate_token\":\"{\\\"shardManagerScope\\\":\\\"ldc\\\",\\\"snapshotId\\\":5747614978618130299,\\\"versionId\\\":0,\\\"creatio… (421 chars)",
              "thumbnail_story_to_show": null,
              "is_bucket_live": false
            },
            "cursor": "NjE1OTQwNjMyMDc2Njk6MToxNzkyNzE0MTkxOjEyMjEyNjQzOTgwNzQ2ODc3MzotMTpsZGM6NTc0NzYxNDk3ODYxODEzMDI5OTowOjE3OTI3MTQxOTE6OjA="
          }
        ],
        "page_info": {
          "end_cursor": "NjE1OTQwNjMyMDc2Njk6MToxNzkyNzE0MTkxOjEyMjEyNjQzOTgwNzQ2ODc3MzotMTpsZGM6NTc0NzYxNDk3ODYxODEzMDI5OTowOjE3OTI3MTQxOTE6OjA=",
          "has_next_page": false
        }
      },
      "id": "61594063207669",
      "profilePicture": {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c239.0.950.951a_dst-jpg_tt6&cstp=mx950x951&ctp=s160x160&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwFGX9Mc&_nc_oc=AdrcJvjvCTJsMtX_wCl0FuLhtWE_LjJPvmUjOuO3q_fxG-8z1zV8Cz68OKvdIm8D0M0&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=rsbEMIjmzs6OSDWt4407Jw&_nc_ss=792a8&oh=00_AQN3XL… (452 chars)"
      }
    },
    "viewer": {
      "actor": {
        "__typename": "User",
        "id": "61594063207669"
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c239.0.950.951a_dst-jpg_tt6&cstp=mx950x951&ctp=s160x160&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwFGX9Mc&_nc_oc=AdrcJvjvCTJsMtX_wCl0FuLhtWE_LjJPvmUjOuO3q_fxG-8z1zV8Cz68OKvdIm8D0M0&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=rsbEMIjmzs6OSDWt4407Jw&_nc_ss=792a8&oh=00_AQN3XL… (452 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c239.0.950.951a_cp0_dst-jpg_tt6&cstp=mx950x951&ctp=s40x40&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwFGX9Mc&_nc_oc=AdrcJvjvCTJsMtX_wCl0FuLhtWE_LjJPvmUjOuO3q_fxG-8z1zV8Cz68OKvdIm8D0M0&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=rsbEMIjmzs6OSDWt4407Jw&_nc_ss=792a8&oh=00_AQPt… (454 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1792714191563,
      "time_at_flush_ms": 1792714191790
    },
    "is_final": true
  }
}
```

**runs/inspect/20261023T000744_61594063207669**, step 5: goto /marketplace/you/selling: 200, 2586 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "StoriesTrayRectangularRootQuery",
  "server_timestamps": "true",
  "variables": {
    "blur": 10,
    "bucketsToFetch": 6,
    "isFbNotesIncluded": false,
    "scale": 1,
    "__relay_internal__pv__StoriesTrayTileCoverImageWidthrelayprovider": 110,
    "__relay_internal__pv__StoriesTrayTileCoverImageHeightrelayprovider": 160,
    "__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider": false,
    "__relay_internal__pv__StoriesTrayTileShouldSkipPrefetchImageURIrelayprovider": false,
    "__relay_internal__pv__StoriesTrayProfessionalInset3DEnabledrelayprovider": true,
    "__relay_internal__pv__StoriesShouldEnableVideoAutoplayrelayprovider": true,
    "__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider": false
  },
  "doc_id": "27831542276468324"
}
```

Answered:

```json
{
  "data": {
    "me": {
      "__typename": "User",
      "unified_stories_buckets": {
        "edges": [
          {
            "node": {
              "__typename": "DirectMessageThreadBucket",
              "__isStoryBucket": "DirectMessageThreadBucket",
              "id": "122126439807468773",
              "unified_stories": {
                "nodes": [],
                "is_empty": true
              },
              "first_story_to_show": null,
              "story_bucket_owner": {
                "__typename": "User",
                "profilePic": {
                  "uri": "https://scontent.fabe1-1.fna.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c239.0.950.951a_cp0_dst-jpg_tt6&cstp=mx950x951&ctp=s40x40&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwEITPV4&_nc_oc=AdqEplgGjnePZ5zQrRkgwcAbuKvOmuSS8asUxh-ms3DJOH2sCP766S3hpzddiXuq3KY&_nc_zt=24&_nc_ht=scontent.fabe1-1.fna&_nc_gid=XMm-SneFx2H9kDTU… (484 chars)"
                },
                "__isNode": "User",
                "id": "61594063207669",
                "is_viewer_friend": false,
                "gender": "FEMALE",
                "name": "Bethlehem Trash",
                "profile_picture": {
                  "uri": "https://scontent.fabe1-1.fna.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c239.0.950.951a_cp0_dst-jpg_tt6&cstp=mx950x951&ctp=s40x40&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwEITPV4&_nc_oc=AdqEplgGjnePZ5zQrRkgwcAbuKvOmuSS8asUxh-ms3DJOH2sCP766S3hpzddiXuq3KY&_nc_zt=24&_nc_ht=scontent.fabe1-1.fna&_nc_gid=XMm-SneFx2H9kDTU… (484 chars)"
                },
                "coverImage": {
                  "uri": "https://scontent.fabe1-1.fna.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c387.0.654.951a_dst-jpg_tt6&cstp=mx654x951&ctp=s160x160&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwEITPV4&_nc_oc=AdqEplgGjnePZ5zQrRkgwcAbuKvOmuSS8asUxh-ms3DJOH2sCP766S3hpzddiXuq3KY&_nc_zt=24&_nc_ht=scontent.fabe1-1.fna&_nc_gid=XMm-SneFx2H9kDTUWy… (482 chars)"
                }
              },
              "story_bucket_type": "STORY",
              "is_bucket_seen_by_viewer": true,
              "unified_stories_with_notes": {
                "edges": [],
                "nodes": []
              },
              "can_viewer_post": true,
              "should_show_close_friend_badge": false,
              "ranking_tracking_string": "{\"request_id\":\"cb364f5b-41cf-4e13-9add-d1160874e3a0\",\"bucket_id\":\"122126439807468773\",\"owner_id\":\"61594063207669\",\"scored_time\":0,\"ranker_join_key\":\"cb364f5b-41cf-4e13-9add-d1160874e3a0\",\"raas_position\":0,\"raas_newly_scored_position\":0,\"random_rate\":0,\"usecase_id\":\"1\",\"is_suggested\":false,\"viewstate_token\":\"{\\\"shardManagerScope\\\":\\\"rva\\\",\\\"snapshotId\\\":8948936269539997508,\\\"versionId\\\":0,\\\"creatio… (421 chars)",
              "thumbnail_story_to_show": null,
              "is_bucket_live": false
            },
            "cursor": "NjE1OTQwNjMyMDc2Njk6MToxNzkyNzE1MjczOjEyMjEyNjQzOTgwNzQ2ODc3MzotMTpydmE6ODk0ODkzNjI2OTUzOTk5NzUwODowOjE3OTI3MTUyNzM6OjA="
          }
        ],
        "page_info": {
          "end_cursor": "NjE1OTQwNjMyMDc2Njk6MToxNzkyNzE1MjczOjEyMjEyNjQzOTgwNzQ2ODc3MzotMTpydmE6ODk0ODkzNjI2OTUzOTk5NzUwODowOjE3OTI3MTUyNzM6OjA=",
          "has_next_page": false
        }
      },
      "id": "61594063207669",
      "profilePicture": {
        "uri": "https://scontent.fabe1-1.fna.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c239.0.950.951a_dst-jpg_tt6&cstp=mx950x951&ctp=s160x160&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwEITPV4&_nc_oc=AdqEplgGjnePZ5zQrRkgwcAbuKvOmuSS8asUxh-ms3DJOH2sCP766S3hpzddiXuq3KY&_nc_zt=24&_nc_ht=scontent.fabe1-1.fna&_nc_gid=XMm-SneFx2H9kDTUWy… (482 chars)"
      }
    },
    "viewer": {
      "actor": {
        "__typename": "User",
        "id": "61594063207669"
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://scontent.fabe1-1.fna.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c239.0.950.951a_dst-jpg_tt6&cstp=mx950x951&ctp=s160x160&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwEITPV4&_nc_oc=AdqEplgGjnePZ5zQrRkgwcAbuKvOmuSS8asUxh-ms3DJOH2sCP766S3hpzddiXuq3KY&_nc_zt=24&_nc_ht=scontent.fabe1-1.fna&_nc_gid=XMm-SneFx2H9kDTUWy… (482 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent.fabe1-1.fna.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg?stp=c239.0.950.951a_cp0_dst-jpg_tt6&cstp=mx950x951&ctp=s40x40&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8hLmZGt4kLwQ7kNvwEITPV4&_nc_oc=AdqEplgGjnePZ5zQrRkgwcAbuKvOmuSS8asUxh-ms3DJOH2sCP766S3hpzddiXuq3KY&_nc_zt=24&_nc_ht=scontent.fabe1-1.fna&_nc_gid=XMm-SneFx2H9kDTU… (484 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1792715273351,
      "time_at_flush_ms": 1792715273522
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

The stories row on the home page.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
