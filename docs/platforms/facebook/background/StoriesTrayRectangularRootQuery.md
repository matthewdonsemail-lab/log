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

Seen 24 time(s) in 17 run(s).

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

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/warmup/20261023T074930_61594063207669**, step 11: goto /marketplace/: 200, 1050 ms

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
                  "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg (454 chars)"
                },
                "__isNode": "User",
                "id": "61594063207669",
                "is_viewer_friend": false,
                "gender": "FEMALE",
                "name": "Bethlehem Trash",
                "profile_picture": {
                  "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg (454 chars)"
                },
                "coverImage": {
                  "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg (452 chars)"
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
              "ranking_tracking_string": "{\"request_id\":\"1d4fce12-54a1-4b5d-a249-e943acaa586d\",\"bucket_id\":\"122126439807468773\",\"owner_id\":\"61594063207669\",\"scored_time\":0,\"ranker_join_key\":\"1d4fce12-54a1-4b5d-a249-e943acaa586d\",\"raas_position\":0,\"raas_newly_scored_position\":0,\"random_rate\":0,\"usecase_id\":\"1\",\"is_suggested\":false,\"viewstate_token\":\"{\\\"shardManagerScope\\\":\\\"rva\\\",\\\"snapshotId\\\":7981457366225466703,\\\"versionId\\\":0,\\\"creatio… (421 chars)",
              "thumbnail_story_to_show": null,
              "is_bucket_live": false
            },
            "cursor": "NjE1OTQwNjMyMDc2Njk6MToxNzkyNzQyMjM4OjEyMjEyNjQzOTgwNzQ2ODc3MzotMTpydmE6Nzk4MTQ1NzM2NjIyNTQ2NjcwMzowOjE3OTI3NDIyMzg6OjA="
          }
        ],
        "page_info": {
          "end_cursor": "NjE1OTQwNjMyMDc2Njk6MToxNzkyNzQyMjM4OjEyMjEyNjQzOTgwNzQ2ODc3MzotMTpydmE6Nzk4MTQ1NzM2NjIyNTQ2NjcwMzowOjE3OTI3NDIyMzg6OjA=",
          "has_next_page": false
        }
      },
      "id": "61594063207669",
      "profilePicture": {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg (452 chars)"
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
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg (452 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg (454 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1792742238170,
      "time_at_flush_ms": 1792742238449
    },
    "is_final": true
  }
}
```

**runs/warmup/20261023T074930_61594063207669**, step 14: goto /marketplace/: 200, 797 ms

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
                  "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg (454 chars)"
                },
                "__isNode": "User",
                "id": "61594063207669",
                "is_viewer_friend": false,
                "gender": "FEMALE",
                "name": "Bethlehem Trash",
                "profile_picture": {
                  "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg (454 chars)"
                },
                "coverImage": {
                  "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg (452 chars)"
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
              "ranking_tracking_string": "{\"request_id\":\"6aef2c79-927e-410f-81e1-333758f5d71e\",\"bucket_id\":\"122126439807468773\",\"owner_id\":\"61594063207669\",\"scored_time\":0,\"ranker_join_key\":\"6aef2c79-927e-410f-81e1-333758f5d71e\",\"raas_position\":0,\"raas_newly_scored_position\":0,\"random_rate\":0,\"usecase_id\":\"1\",\"is_suggested\":false,\"viewstate_token\":\"{\\\"shardManagerScope\\\":\\\"ncg\\\",\\\"snapshotId\\\":2336266685962601271,\\\"versionId\\\":0,\\\"creatio… (421 chars)",
              "thumbnail_story_to_show": null,
              "is_bucket_live": false
            },
            "cursor": "NjE1OTQwNjMyMDc2Njk6MToxNzkyNzQyMzk2OjEyMjEyNjQzOTgwNzQ2ODc3MzotMTpuY2c6MjMzNjI2NjY4NTk2MjYwMTI3MTowOjE3OTI3NDIzOTY6OjA="
          }
        ],
        "page_info": {
          "end_cursor": "NjE1OTQwNjMyMDc2Njk6MToxNzkyNzQyMzk2OjEyMjEyNjQzOTgwNzQ2ODc3MzotMTpuY2c6MjMzNjI2NjY4NTk2MjYwMTI3MTowOjE3OTI3NDIzOTY6OjA=",
          "has_next_page": false
        }
      },
      "id": "61594063207669",
      "profilePicture": {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg (452 chars)"
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
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg (452 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/854235004_122126440527468773_6121991966981932868_n.jpg (454 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1792742396622,
      "time_at_flush_ms": 1792742396947
    },
    "is_final": true
  }
}
```

**runs/inspect/20261025T065539_61593939852820**, step 1: goto /marketplace/status: 200, 979 ms

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
              "id": "122103367671464661",
              "unified_stories": {
                "nodes": [],
                "is_empty": true
              },
              "first_story_to_show": null,
              "story_bucket_owner": {
                "__typename": "User",
                "profilePic": {
                  "uri": "https://scontent.fagc3-2.fna.fbcdn.net/v/t39.30808-1/863325433_122127029211464661_923216486577496458_n.jpg (483 chars)"
                },
                "__isNode": "User",
                "id": "61593939852820",
                "is_viewer_friend": false,
                "gender": "MALE",
                "name": "Uski Guvh",
                "profile_picture": {
                  "uri": "https://scontent.fagc3-2.fna.fbcdn.net/v/t39.30808-1/863325433_122127029211464661_923216486577496458_n.jpg (483 chars)"
                },
                "coverImage": {
                  "uri": "https://scontent.fagc3-2.fna.fbcdn.net/v/t39.30808-1/863325433_122127029211464661_923216486577496458_n.jpg (483 chars)"
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
              "ranking_tracking_string": "{\"request_id\":\"098ea336-ba99-4c7b-b5a6-832c9b8e08e4\",\"bucket_id\":\"122103367671464661\",\"owner_id\":\"61593939852820\",\"scored_time\":0,\"ranker_join_key\":\"098ea336-ba99-4c7b-b5a6-832c9b8e08e4\",\"raas_position\":0,\"raas_newly_scored_position\":0,\"random_rate\":0,\"usecase_id\":\"1\",\"is_suggested\":false,\"viewstate_token\":\"{\\\"shardManagerScope\\\":\\\"gtn\\\",\\\"snapshotId\\\":465952181725427692,\\\"versionId\\\":0,\\\"creation… (420 chars)",
              "thumbnail_story_to_show": null,
              "is_bucket_live": false
            },
            "cursor": "NjE1OTM5Mzk4NTI4MjA6MToxNzkyOTExMzc1OjEyMjEwMzM2NzY3MTQ2NDY2MTotMTpndG46NDY1OTUyMTgxNzI1NDI3NjkyOjA6MTc5MjkxMTM3NTo6MA=="
          },
          {
            "node": {
              "__typename": "DirectMessageThreadBucket",
              "__isStoryBucket": "DirectMessageThreadBucket",
              "id": "100495278795482",
              "unified_stories": {
                "nodes": [
                  {
                    "id": "…"
                  },
                  {
                    "id": "…"
                  },
                  {
                    "id": "…"
                  },
                  {
                    "id": "…"
                  },
                  {
                    "id": "…"
                  },
                  {
                    "id": "…"
                  },
                  "… 44 more"
                ],
                "is_empty": false
              },
              "first_story_to_show": {
                "story_overlays": [
                  {
                    "__typename": "…"
                  }
                ],
                "story_card_info": {
                  "story_video_thumbnail": null,
                  "can_viewer_reply": true
                },
                "id": "UzpfSVNDOjE2OTI5NDMxNzU2Nzc3Nzg=",
                "media_attribution_elements": [],
                "backdrop": null,
                "attachments": [
                  {
                    "media": "…"
                  }
                ]
              },
              "story_bucket_owner": {
                "__typename": "User",
                "profilePic": {
                  "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t39.30808-1/352511829_227291250077490_3984895517667165862_n.jpg (465 chars)"
                },
                "__isNode": "User",
                "id": "100065050291573",
                "is_viewer_friend": false,
                "gender": "NEUTER",
                "name": "dbcnews.tv",
                "profile_picture": {
                  "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t39.30808-1/352511829_227291250077490_3984895517667165862_n.jpg (465 chars)"
                },
                "coverImage": {
                  "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t39.30808-1/352511829_227291250077490_3984895517667165862_n.jpg (479 chars)"
                }
              },
              "story_bucket_type": "ADMINED_ADDITIONAL_PROFILE_STORY",
              "is_bucket_seen_by_viewer": false,
              "unified_stories_with_notes": {
                "edges": [
                  {
                    "node": "…"
                  },
                  {
                    "node": "…"
                  },
                  {
                    "node": "…"
                  },
                  {
                    "node": "…"
                  },
                  {
                    "node": "…"
                  },
                  {
                    "node": "…"
                  },
                  "… 44 more"
                ],
                "nodes": [
                  {
                    "story_card_info": "…",
                    "id": "…"
                  },
                  {
                    "story_card_info": "…",
                    "id": "…"
                  },
                  {
                    "story_card_info": "…",
                    "id": "…"
                  },
                  {
                    "story_card_info": "…",
                    "id": "…"
                  },
                  {
                    "story_card_info": "…",
                    "id": "…"
                  },
                  {
                    "story_card_info": "…",
                    "id": "…"
                  },
                  "… 44 more"
                ]
              },
              "can_viewer_post": false,
              "should_show_close_friend_badge": false,
              "ranking_tracking_string": "{\"request_id\":\"098ea336-ba99-4c7b-b5a6-832c9b8e08e4\",\"bucket_id\":\"100495278795482\",\"owner_id\":\"100065050291573\",\"scored_time\":0,\"ranker_join_key\":\"098ea336-ba99-4c7b-b5a6-832c9b8e08e4\",\"raas_position\":1,\"raas_newly_scored_position\":1,\"random_rate\":0,\"usecase_id\":\"1\",\"is_suggested\":false,\"viewstate_token\":\"{\\\"shardManagerScope\\\":\\\"gtn\\\",\\\"snapshotId\\\":465952181725427692,\\\"versionId\\\":0,\\\"creationTi… (418 chars)",
              "thumbnail_story_to_show": {
                "id": "UzpfSVNDOjE2OTI5NDMxNzU2Nzc3Nzg=",
                "attachments": [
                  {
                    "media": "…"
                  }
                ],
                "story_card_info": {
                  "thread_status": "PUBLISHED",
                  "story_thumbnail": {
                    "uri": "…",
                    "thumbnail_frame_pts": "…"
                  },
                  "background_color_info": {
                    "color_info": "…",
                    "id": "…"
                  },
                  "story_video_thumbnail": null
                },
                "story_overlays": [
                  {
                    "__typename": "…"
                  }
                ]
              },
              "is_bucket_live": false
            },
            "cursor": "NjE1OTM5Mzk4NTI4MjA6MToxNzkyOTExMzc1OjEwMDQ5NTI3ODc5NTQ4MjotMTpndG46NDY1OTUyMTgxNzI1NDI3NjkyOjA6MTc5MjkxMTM3NTo6MA=="
          }
        ],
        "page_info": {
          "end_cursor": "NjE1OTM5Mzk4NTI4MjA6MToxNzkyOTExMzc1OjEwMDQ5NTI3ODc5NTQ4MjotMTpndG46NDY1OTUyMTgxNzI1NDI3NjkyOjA6MTc5MjkxMTM3NTo6MA==",
          "has_next_page": false
        }
      },
      "id": "61593939852820",
      "profilePicture": {
        "uri": "https://scontent.fagc3-2.fna.fbcdn.net/v/t39.30808-1/863325433_122127029211464661_923216486577496458_n.jpg (481 chars)"
      }
    },
    "viewer": {
      "actor": {
        "__typename": "User",
        "id": "61593939852820"
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://scontent.fagc3-2.fna.fbcdn.net/v/t39.30808-1/863325433_122127029211464661_923216486577496458_n.jpg (481 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent.fagc3-2.fna.fbcdn.net/v/t39.30808-1/863325433_122127029211464661_923216486577496458_n.jpg (483 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t39.30808-1/352511829_227291250077490_3984895517667165862_n.jpg (465 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent.fagc3-2.fna.fbcdn.net/v/t39.30808-6/861563965_1633381778840150_6932217892148580524_n.jpg (476 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1792911375725,
      "time_at_flush_ms": 1792911376293
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
