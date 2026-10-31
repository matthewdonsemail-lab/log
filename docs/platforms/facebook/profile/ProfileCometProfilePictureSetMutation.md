# ProfileCometProfilePictureSetMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | mutation |
| doc_id | `29015178351504159` |
| Path | `/api/graphql/` |
| Sends | `input`, `isPage`, `isProfile`, `scale`, `__relay_internal__pv__ProfileGeminiIsCoinFlipEnabledrelayprovider` |
| Reads | `profile_picture_set.profile`, `profile_picture_set.viewer` |
| Called from | `ProfileCometProfilePictureSetMutation` |
| rea | `ev_3ea197cc6891a8a9d4f257222103633d99dce76f579531c2aa8b6b8a229babbf` |

Seen 7 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 5: clickRole button "…" | 2 | 200 | 5542–9236 ms | 742–1292 ms | — |
| inspect | step 6: click e1262 | 1 | 200 | 3395 ms | 646 ms | — |
| inspect | step 7: click e1395 | 1 | 200 | 4202 ms | 1820 ms | — |
| host | step 21: clickRole button "…" | 1 | 200 | 6478 ms | 1358 ms | — |
| host | step 39: clickRole button "…" | 1 | 200 | 2659 ms | 1151 ms | — |
| host | step 11: clickRole button "…" | 1 | 200 | 3169 ms | 796 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, step 11: clickRole button "…": 200, 3169 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "ProfileCometProfilePictureSetMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "attribution_id_v2": "ProfileCometTimelineListViewRoot.react,comet.profile.timeline.list,via_cold_start,1793038043453,728087,190055527696468,,",
      "caption": "",
      "existing_photo_id": "122127009279476177",
      "expiration_time": null,
      "profile_id": "61594285317994",
      "profile_pic_method": "EXISTING",
      "profile_pic_source": "TIMELINE",
      "scaled_crop_rect": {
        "height": 0.75826,
        "width": 1,
        "x": 0,
        "y": 0.12087
      },
      "skip_cropping": true,
      "actor_id": "61594285317994",
      "client_mutation_id": "2"
    },
    "isPage": false,
    "isProfile": true,
    "scale": 1,
    "__relay_internal__pv__ProfileGeminiIsCoinFlipEnabledrelayprovider": false
  },
  "doc_id": "29015178351504159"
}
```

Answered:

```json
{
  "first": {
    "data": {
      "profile_picture_set": {
        "profile": {
          "__typename": "User",
          "id": "61594285317994",
          "__isProfile": "User",
          "is_viewer_friend": false,
          "profile_active_messenger_room": null,
          "story_bucket": {
            "nodes": [
              {
                "should_show_close_friend_badge": false,
                "id": "122095713291476177",
                "first_story_to_show": null
              }
            ]
          },
          "is_additional_profile_plus": false,
          "delegate_page": null,
          "live_video_for_comet_live_ring": null,
          "msgr_user_rich_status": null,
          "is_live_for_comet_live_ring": false,
          "name": "Halima Ndjzn",
          "profilePhoto": {
            "url": "https://www.facebook.com/photo/?fbid=122127009393476177&set=a.122127009405476177",
            "viewer_image": {
              "height": 1059,
              "width": 803
            },
            "id": "122127009393476177"
          },
          "profilePicLarge": {
            "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (482 chars)"
          },
          "profilePicMedium": {
            "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (482 chars)"
          },
          "profilePicSmall": {
            "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (482 chars)"
          },
          "profile_video": null,
          "profile_picture_expiration_time": null,
          "__isRenderedProfile": "User",
          "profile_photo": {
            "accessibility_caption": "May be an image of one or more people",
            "id": "122127009393476177",
            "image": {
              "height": 960,
              "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-6/861826748_122127009285476177_3116611628911920417_n.jpg (467 chars)",
              "width": 728
            },
            "url": "https://www.facebook.com/photo/?fbid=122127009393476177&set=a.122127009405476177"
          },
          "profilePic96": {
            "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (482 chars)"
          },
          "__isIUser": "User",
          "profile_picture": {
            "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (484 chars)"
          },
          "big_picture": {
            "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (482 chars)"
          },
          "is_work_user": false,
          "work_info": null,
          "is_member_of_readonly_work_company": false,
          "__isActor": "User",
          "is_viewer": true,
          "work_foreign_entity_info": null,
          "profilePic32": {
            "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (484 chars)"
          },
          "profilePic40": {
            "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (484 chars)"
          },
          "profilePic50": {
            "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (484 chars)"
          },
          "profilePic52": {
            "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (484 chars)"
          },
          "profile_pic": {
            "is_silhouette": false,
            "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (484 chars)"
          }
        },
        "viewer": {
          "actor": {
            "__typename": "User",
            "id": "61594285317994",
            "__isActor": "User",
            "name": "Halima Ndjzn",
            "is_viewer": true,
            "is_work_user": false,
            "work_info": null,
            "work_foreign_entity_info": null,
            "profile_picture": {
              "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.30808-1/861826748_122127009285476177_3116611628911920417_n.jpg (484 chars)",
              "scale": 1
            }
          }
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
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1793038072325,
        "time_at_flush_ms": 1793038075316
      },
      "is_final": false
    }
  },
  "followingParts": 7,
  "parts": [
    {
      "label": "ProfileCometProfilePicture_user$defer$ProfileCometProfilePictureViewMenu_user",
      "path": [
        "profile_picture_set",
        "profile"
      ],
      "data": {
        "story_bucket": {
          "nodes": [
            {
              "should_show_close_friend_badge": false,
              "id": "122095713291476177",
              "first_story_to_show": null
            }
          ]
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
          }
        ],
        "is_final": false
      }
    },
    {
      "label": "ProfileCometProfilePicture_user$defer$ProfileCometProfilePictureEditMenu_user",
      "path": [
        "profile_picture_set",
        "profile"
      ],
      "data": {
        "story_bucket": {
          "nodes": [
            {
              "should_show_close_friend_badge": false,
              "id": "122095713291476177",
              "first_story_to_show": null
            }
          ]
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
          }
        ],
        "is_final": false
      }
    },
    {
      "label": "ProfileCometProfilePicture_user$defer$ProfileCometProfilePictureTemporaryEditMenu_user",
      "path": [
        "profile_picture_set",
        "profile"
      ],
      "data": {
        "story_bucket": {
          "nodes": [
            {
              "should_show_close_friend_badge": false,
              "id": "122095713291476177",
              "first_story_to_show": null
            }
          ]
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
          }
        ],
        "is_final": false
      }
    }
  ]
}
```

<!-- facts:end -->

## What it does

Saves the uploaded, cropped photo as the profile picture. 3.4 s on Lancaster, 5.5 s on Bethlehem.

## What our machine does with it

Confirms step 5 of the `profileSetup` flow (`log flow run profileSetup`, rule 31): the Save click waits for this request; until it is seen the step is not done.

## What can go wrong

Not seen within the wait: the step fails (`expected request … was not sent`) and the run stops; the picture may or may not be set, so read the step's screenshot before running again.
