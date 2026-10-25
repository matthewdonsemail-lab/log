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
| rea | `ev_409b69ae26722c3e8c9f70e8efae9b924fb93ae509d12e86b5289bc3f4d7a34c` |

Seen 6 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 5: clickRole button "…" | 2 | 200 | 5542–9236 ms | 742–1292 ms | — |
| inspect | step 6: click e1262 | 1 | 200 | 3395 ms | 646 ms | — |
| inspect | step 7: click e1395 | 1 | 200 | 4202 ms | 1820 ms | — |
| host | step 21: clickRole button "…" | 1 | 200 | 6478 ms | 1358 ms | — |
| host | step 39: clickRole button "…" | 1 | 200 | 2659 ms | 1151 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261024T164523_61593843527201**, step 7: click e1395: 200, 4202 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "ProfileCometProfilePictureSetMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "attribution_id_v2": "ProfileCometTimelineListViewRoot.react,comet.profile.timeline.list,via_cold_start,1792860342969,926542,190055527696468,,",
      "caption": "",
      "existing_photo_id": "122123515989461450",
      "expiration_time": null,
      "profile_id": "61593843527201",
      "profile_pic_method": "EXISTING",
      "profile_pic_source": "TIMELINE",
      "scaled_crop_rect": {
        "height": 0.74667,
        "width": 1,
        "x": 0,
        "y": 0.12667
      },
      "skip_cropping": true,
      "actor_id": "61593843527201",
      "client_mutation_id": "1"
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
          "id": "61593843527201",
          "__isProfile": "User",
          "is_viewer_friend": false,
          "profile_active_messenger_room": null,
          "story_bucket": "(1 fields)",
          "is_additional_profile_plus": false,
          "delegate_page": null,
          "live_video_for_comet_live_ring": null,
          "msgr_user_rich_status": null,
          "is_live_for_comet_live_ring": false,
          "name": "Bariye Dao",
          "profilePhoto": "(3 fields)",
          "profilePicLarge": "(1 fields)",
          "profilePicMedium": "(1 fields)",
          "profilePicSmall": "(1 fields)",
          "profile_video": null,
          "profile_picture_expiration_time": null,
          "__isRenderedProfile": "User",
          "profile_photo": "(4 fields)",
          "profilePic96": "(1 fields)",
          "__isIUser": "User",
          "profile_picture": "(1 fields)",
          "big_picture": "(1 fields)",
          "is_work_user": false,
          "work_info": null,
          "is_member_of_readonly_work_company": false,
          "__isActor": "User",
          "is_viewer": true,
          "work_foreign_entity_info": null,
          "profilePic32": "(1 fields)",
          "profilePic40": "(1 fields)",
          "profilePic50": "(1 fields)",
          "profilePic52": "(1 fields)",
          "profile_pic": "(2 fields)"
        },
        "viewer": {
          "actor": "(9 fields)"
        }
      }
    },
    "extensions": {
      "prefetch_uris_v2": [
        {
          "uri": "https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-1/863613843_122123515995461450_843471129485614990_n.jpg (457 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1792860481945,
        "time_at_flush_ms": 1792860485667
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
          "nodes": "(1 items)"
        }
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)"
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
          "nodes": "(1 items)"
        }
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)"
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
          "nodes": "(1 items)"
        }
      },
      "extensions": {
        "prefetch_uris_v2": [
          "(5 fields)"
        ],
        "is_final": false
      }
    }
  ]
}
```

**runs/host/20261024T222706_61593981307720**, step 39: clickRole button "…": 200, 2659 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "ProfileCometProfilePictureSetMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "attribution_id_v2": "ProfileCometTimelineListViewRoot.react,comet.profile.timeline.list,via_cold_start,1792881170401,662025,190055527696468,,",
      "caption": "",
      "existing_photo_id": "122128629399466043",
      "expiration_time": null,
      "profile_id": "61593981307720",
      "profile_pic_method": "EXISTING",
      "profile_pic_source": "TIMELINE",
      "scaled_crop_rect": {
        "height": 0.73423,
        "width": 1,
        "x": 0,
        "y": 0.13288
      },
      "skip_cropping": true,
      "actor_id": "61593981307720",
      "client_mutation_id": "1"
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
          "id": "61593981307720",
          "__isProfile": "User",
          "is_viewer_friend": false,
          "profile_active_messenger_room": null,
          "story_bucket": {
            "nodes": [
              {
                "should_show_close_friend_badge": false,
                "id": "122100869853466043",
                "first_story_to_show": null
              }
            ]
          },
          "is_additional_profile_plus": false,
          "delegate_page": null,
          "live_video_for_comet_live_ring": null,
          "msgr_user_rich_status": null,
          "is_live_for_comet_live_ring": false,
          "name": "Hore Vai",
          "profilePhoto": {
            "url": "https://www.facebook.com/photo/?fbid=122128629453466043&set=a.122128629465466043",
            "viewer_image": {
              "height": 1110,
              "width": 815
            },
            "id": "122128629453466043"
          },
          "profilePicLarge": {
            "uri": "https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-1/864257525_122128629405466043_8971047615363713674_n.jpg (456 chars)"
          },
          "profilePicMedium": {
            "uri": "https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-1/864257525_122128629405466043_8971047615363713674_n.jpg (456 chars)"
          },
          "profilePicSmall": {
            "uri": "https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-1/864257525_122128629405466043_8971047615363713674_n.jpg (456 chars)"
          },
          "profile_video": null,
          "profile_picture_expiration_time": null,
          "__isRenderedProfile": "User",
          "profile_photo": {
            "accessibility_caption": "May be an image of flannel",
            "id": "122128629453466043",
            "image": {
              "height": 960,
              "uri": "https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-6/864257525_122128629405466043_8971047615363713674_n.jpg (441 chars)",
              "width": 705
            },
            "url": "https://www.facebook.com/photo/?fbid=122128629453466043&set=a.122128629465466043"
          },
          "profilePic96": {
            "uri": "https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-1/864257525_122128629405466043_8971047615363713674_n.jpg (456 chars)"
          },
          "__isIUser": "User",
          "profile_picture": {
            "uri": "https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-1/864257525_122128629405466043_8971047615363713674_n.jpg (458 chars)"
          },
          "big_picture": {
            "uri": "https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-1/864257525_122128629405466043_8971047615363713674_n.jpg (456 chars)"
          },
          "is_work_user": false,
          "work_info": null,
          "is_member_of_readonly_work_company": false,
          "__isActor": "User",
          "is_viewer": true,
          "work_foreign_entity_info": null,
          "profilePic32": {
            "uri": "https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-1/864257525_122128629405466043_8971047615363713674_n.jpg (458 chars)"
          },
          "profilePic40": {
            "uri": "https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-1/864257525_122128629405466043_8971047615363713674_n.jpg (458 chars)"
          },
          "profilePic50": {
            "uri": "https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-1/864257525_122128629405466043_8971047615363713674_n.jpg (458 chars)"
          },
          "profilePic52": {
            "uri": "https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-1/864257525_122128629405466043_8971047615363713674_n.jpg (458 chars)"
          },
          "profile_pic": {
            "is_silhouette": false,
            "uri": "https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-1/864257525_122128629405466043_8971047615363713674_n.jpg (458 chars)"
          }
        },
        "viewer": {
          "actor": {
            "__typename": "User",
            "id": "61593981307720",
            "__isActor": "User",
            "name": "Hore Vai",
            "is_viewer": true,
            "is_work_user": false,
            "work_info": null,
            "work_foreign_entity_info": null,
            "profile_picture": {
              "uri": "https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-1/864257525_122128629405466043_8971047615363713674_n.jpg (458 chars)",
              "scale": 1
            }
          }
        }
      }
    },
    "extensions": {
      "prefetch_uris_v2": [
        {
          "uri": "https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-1/864257525_122128629405466043_8971047615363713674_n.jpg (458 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1792881233706,
        "time_at_flush_ms": 1792881235836
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
              "id": "122100869853466043",
              "first_story_to_show": null
            }
          ]
        }
      },
      "extensions": {
        "prefetch_uris_v2": [
          {
            "uri": "https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-1/864257525_122128629405466043_8971047615363713674_n.jpg (458 chars)",
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
              "id": "122100869853466043",
              "first_story_to_show": null
            }
          ]
        }
      },
      "extensions": {
        "prefetch_uris_v2": [
          {
            "uri": "https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-1/864257525_122128629405466043_8971047615363713674_n.jpg (458 chars)",
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
              "id": "122100869853466043",
              "first_story_to_show": null
            }
          ]
        }
      },
      "extensions": {
        "prefetch_uris_v2": [
          {
            "uri": "https://scontent.fagc1-1.fna.fbcdn.net/v/t39.30808-1/864257525_122128629405466043_8971047615363713674_n.jpg (458 chars)",
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

**runs/host/20261024T211541_61593939852820**, step 21: clickRole button "…": 200, 6478 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "ProfileCometProfilePictureSetMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "attribution_id_v2": "ProfileCometTimelineListViewRoot.react,comet.profile.timeline.list,via_cold_start,1792876843541,732547,190055527696468,,",
      "caption": "",
      "existing_photo_id": "122127029205464661",
      "expiration_time": null,
      "profile_id": "61593939852820",
      "profile_pic_method": "EXISTING",
      "profile_pic_source": "TIMELINE",
      "scaled_crop_rect": {
        "height": 0.75788,
        "width": 0.99999,
        "x": 0,
        "y": 0.12106
      },
      "skip_cropping": true,
      "actor_id": "61593939852820",
      "client_mutation_id": "1"
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
          "id": "61593939852820",
          "__isProfile": "User",
          "is_viewer_friend": false,
          "profile_active_messenger_room": null,
          "story_bucket": {
            "nodes": [
              {
                "should_show_close_friend_badge": false,
                "id": "122103367671464661",
                "first_story_to_show": null
              }
            ]
          },
          "is_additional_profile_plus": false,
          "delegate_page": null,
          "live_video_for_comet_live_ring": null,
          "msgr_user_rich_status": null,
          "is_live_for_comet_live_ring": false,
          "name": "Uski Guvh",
          "profilePhoto": {
            "url": "https://www.facebook.com/photo/?fbid=122127029409464661&set=a.122127029421464661",
            "viewer_image": {
              "height": 1078,
              "width": 817
            },
            "id": "122127029409464661"
          },
          "profilePicLarge": {
            "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t39.30808-1/863325433_122127029211464661_923216486577496458_n.jpg (455 chars)"
          },
          "profilePicMedium": {
            "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t39.30808-1/863325433_122127029211464661_923216486577496458_n.jpg (455 chars)"
          },
          "profilePicSmall": {
            "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t39.30808-1/863325433_122127029211464661_923216486577496458_n.jpg (455 chars)"
          },
          "profile_video": null,
          "profile_picture_expiration_time": null,
          "__isRenderedProfile": "User",
          "profile_photo": {
            "accessibility_caption": "May be an image of one or more people",
            "id": "122127029409464661",
            "image": {
              "height": 960,
              "uri": "https://scontent.fagc3-2.fna.fbcdn.net/v/t39.30808-6/863325433_122127029211464661_923216486577496458_n.jpg (466 chars)",
              "width": 728
            },
            "url": "https://www.facebook.com/photo/?fbid=122127029409464661&set=a.122127029421464661"
          },
          "profilePic96": {
            "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t39.30808-1/863325433_122127029211464661_923216486577496458_n.jpg (455 chars)"
          },
          "__isIUser": "User",
          "profile_picture": {
            "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t39.30808-1/863325433_122127029211464661_923216486577496458_n.jpg (457 chars)"
          },
          "big_picture": {
            "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t39.30808-1/863325433_122127029211464661_923216486577496458_n.jpg (455 chars)"
          },
          "is_work_user": false,
          "work_info": null,
          "is_member_of_readonly_work_company": false,
          "__isActor": "User",
          "is_viewer": true,
          "work_foreign_entity_info": null,
          "profilePic32": {
            "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t39.30808-1/863325433_122127029211464661_923216486577496458_n.jpg (457 chars)"
          },
          "profilePic40": {
            "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t39.30808-1/863325433_122127029211464661_923216486577496458_n.jpg (457 chars)"
          },
          "profilePic50": {
            "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t39.30808-1/863325433_122127029211464661_923216486577496458_n.jpg (457 chars)"
          },
          "profilePic52": {
            "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t39.30808-1/863325433_122127029211464661_923216486577496458_n.jpg (457 chars)"
          },
          "profile_pic": {
            "is_silhouette": false,
            "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t39.30808-1/863325433_122127029211464661_923216486577496458_n.jpg (457 chars)"
          }
        },
        "viewer": {
          "actor": {
            "__typename": "User",
            "id": "61593939852820",
            "__isActor": "User",
            "name": "Uski Guvh",
            "is_viewer": true,
            "is_work_user": false,
            "work_info": null,
            "work_foreign_entity_info": null,
            "profile_picture": {
              "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t39.30808-1/863325433_122127029211464661_923216486577496458_n.jpg (457 chars)",
              "scale": 1
            }
          }
        }
      }
    },
    "extensions": {
      "prefetch_uris_v2": [
        {
          "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t39.30808-1/863325433_122127029211464661_923216486577496458_n.jpg (457 chars)",
          "label": null,
          "width": null,
          "height": null,
          "surface": null
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1792876900563,
        "time_at_flush_ms": 1792876906686
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
              "id": "122103367671464661",
              "first_story_to_show": null
            }
          ]
        }
      },
      "extensions": {
        "prefetch_uris_v2": [
          {
            "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t39.30808-1/863325433_122127029211464661_923216486577496458_n.jpg (457 chars)",
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
              "id": "122103367671464661",
              "first_story_to_show": null
            }
          ]
        }
      },
      "extensions": {
        "prefetch_uris_v2": [
          {
            "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t39.30808-1/863325433_122127029211464661_923216486577496458_n.jpg (457 chars)",
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
              "id": "122103367671464661",
              "first_story_to_show": null
            }
          ]
        }
      },
      "extensions": {
        "prefetch_uris_v2": [
          {
            "uri": "https://scontent.fagc3-1.fna.fbcdn.net/v/t39.30808-1/863325433_122127029211464661_923216486577496458_n.jpg (457 chars)",
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
