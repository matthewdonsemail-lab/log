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
| rea | `ev_7099c1c21007c329c9526ae168304a481b11618c2a37ecf98ba0b54a4ee462ed` |

Seen 26 time(s) in 18 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 752 ms | 13577 ms | — |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 905 ms | 12045 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 1041 ms | 7076 ms | — |
| warmup | step 11: goto /marketplace/ | 2 | 200 | 784–1050 ms | 8617–15114 ms | — |
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
| warmup | step 14: goto /marketplace/ | 1 | 200 | 797 ms | 7204 ms | — |
| inspect | scroll: +386px in 10 wheel steps, 531 ms | 1 | 200 | 797 ms | 18356 ms | — |
| host | expected ProfileCometProfilePictureSetMutation: sent | 1 | 200 | 843 ms | 45817 ms | — |
| host | setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9 | 1 | 200 | 976 ms | 219901 ms | — |
| inspect | step 1: goto /marketplace/status | 1 | 200 | 979 ms | 12050 ms | — |
| inspect | step 4: goto /marketplace/status | 1 | 200 | 872 ms | 9222 ms | — |
| host | step 32: goto /marketplace/ | 1 | 200 | 386 ms | 12658 ms | — |
| host | step 38: goto /marketplace/you/selling | 1 | 200 | 385 ms | 17040 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, step 32: goto /marketplace/: 200, 386 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "StoriesTrayRectangularRootQuery",
  "server_timestamps": "true",
  "variables": {
    "blur": 10,
    "bucketsToFetch": 6,
    "isFbNotesIncluded": true,
    "scale": 1,
    "__relay_internal__pv__StoriesTrayTileCoverImageWidthrelayprovider": 110,
    "__relay_internal__pv__StoriesTrayTileCoverImageHeightrelayprovider": 160,
    "__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider": true,
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
              "id": "122095713291476177",
              "unified_stories": {
                "nodes": [],
                "is_empty": true
              },
              "first_story_to_show": null,
              "story_bucket_owner": {
                "__typename": "User",
                "profilePic": {
                  "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (484 chars)"
                },
                "__isNode": "User",
                "id": "61594285317994",
                "is_viewer_friend": false,
                "gender": "FEMALE",
                "name": "Halima Ndjzn",
                "profile_picture": {
                  "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (484 chars)"
                },
                "coverImage": {
                  "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (484 chars)"
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
              "ranking_tracking_string": "{\"request_id\":\"5a6bb19f-f7ef-48d5-9ed7-33d1d0b46bf5\",\"bucket_id\":\"122095713291476177\",\"owner_id\":\"61594285317994\",\"scored_time\":0,\"ranker_join_key\":\"54f4f4ff-4877-419d-bdea-5eb84251e262\",\"raas_position\":0,\"raas_newly_scored_position\":-1,\"random_rate\":0,\"usecase_id\":\"1\",\"is_suggested\":false,\"viewstate_token\":\"{\\\"shardManagerScope\\\":\\\"prn\\\",\\\"snapshotId\\\":7754077029247465175,\\\"versionId\\\":0,\\\"creati… (422 chars)",
              "thumbnail_story_to_show": null,
              "is_bucket_live": false
            },
            "cursor": "NjE1OTQyODUzMTc5OTQ6MToxNzkzMDM4MzMxOjEyMjA5NTcxMzI5MTQ3NjE3NzotMTpwcm46Nzc1NDA3NzAyOTI0NzQ2NTE3NTowOjE3OTMwMzgzMzE6OjA="
          }
        ],
        "page_info": {
          "end_cursor": "NjE1OTQyODUzMTc5OTQ6MToxNzkzMDM4MzMxOjEyMjA5NTcxMzI5MTQ3NjE3NzotMTpwcm46Nzc1NDA3NzAyOTI0NzQ2NTE3NTowOjE3OTMwMzgzMzE6OjA=",
          "has_next_page": false
        }
      },
      "id": "61594285317994",
      "profilePicture": {
        "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (482 chars)"
      }
    },
    "viewer": {
      "actor": {
        "__typename": "User",
        "id": "61594285317994"
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (482 chars)",
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
      "request_start_time_ms": 1793038331030,
      "time_at_flush_ms": 1793038331181
    },
    "is_final": true
  }
}
```

**runs/host/20261026T180628_61594285317994**, step 38: goto /marketplace/you/selling: 200, 385 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "StoriesTrayRectangularRootQuery",
  "server_timestamps": "true",
  "variables": {
    "blur": 10,
    "bucketsToFetch": 6,
    "isFbNotesIncluded": true,
    "scale": 1,
    "__relay_internal__pv__StoriesTrayTileCoverImageWidthrelayprovider": 110,
    "__relay_internal__pv__StoriesTrayTileCoverImageHeightrelayprovider": 160,
    "__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider": true,
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
              "id": "122095713291476177",
              "unified_stories": {
                "nodes": [],
                "is_empty": true
              },
              "first_story_to_show": null,
              "story_bucket_owner": {
                "__typename": "User",
                "profilePic": {
                  "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (484 chars)"
                },
                "__isNode": "User",
                "id": "61594285317994",
                "is_viewer_friend": false,
                "gender": "FEMALE",
                "name": "Halima Ndjzn",
                "profile_picture": {
                  "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (484 chars)"
                },
                "coverImage": {
                  "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (484 chars)"
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
              "ranking_tracking_string": "{\"request_id\":\"5c6f2bd0-63c1-481f-9c0f-9ab5745a8e88\",\"bucket_id\":\"122095713291476177\",\"owner_id\":\"61594285317994\",\"scored_time\":0,\"ranker_join_key\":\"54f4f4ff-4877-419d-bdea-5eb84251e262\",\"raas_position\":0,\"raas_newly_scored_position\":-1,\"random_rate\":0,\"usecase_id\":\"1\",\"is_suggested\":false,\"viewstate_token\":\"{\\\"shardManagerScope\\\":\\\"prn\\\",\\\"snapshotId\\\":336912580674075692,\\\"versionId\\\":0,\\\"creatio… (421 chars)",
              "thumbnail_story_to_show": null,
              "is_bucket_live": false
            },
            "cursor": "NjE1OTQyODUzMTc5OTQ6MToxNzkzMDM4NDM2OjEyMjA5NTcxMzI5MTQ3NjE3NzotMTpwcm46MzM2OTEyNTgwNjc0MDc1NjkyOjA6MTc5MzAzODQzNjo6MA=="
          }
        ],
        "page_info": {
          "end_cursor": "NjE1OTQyODUzMTc5OTQ6MToxNzkzMDM4NDM2OjEyMjA5NTcxMzI5MTQ3NjE3NzotMTpwcm46MzM2OTEyNTgwNjc0MDc1NjkyOjA6MTc5MzAzODQzNjo6MA==",
          "has_next_page": false
        }
      },
      "id": "61594285317994",
      "profilePicture": {
        "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (482 chars)"
      }
    },
    "viewer": {
      "actor": {
        "__typename": "User",
        "id": "61594285317994"
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (482 chars)",
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
      "request_start_time_ms": 1793038436485,
      "time_at_flush_ms": 1793038436636
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
