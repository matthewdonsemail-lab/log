# useGroupsCometVisitMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | mutation |
| doc_id | `27788177020768038` |
| Path | `/api/graphql/` |
| Sends | `bookmarkID`, `input`, `scale` |
| Reads | `viewer_groups_tab_log_group_visit.group_bookmark`, `viewer_groups_tab_log_group_visit.viewer_for_homepage_unread_count`, `viewer_groups_tab_log_group_visit.viewer` |
| Called from | `useGroupsCometVisitMutation` |
| rea | `ev_2c88e3ef14f464196a06b0ac6105cdffb275c24ee965feffc7bee400f8fa9337` |

Seen 8 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id>/ | 4 | 200 | 541–697 ms | 3115–6334 ms | — |
| inspect | step 11: clickRole tab "…" | 1 | 200 | 726 ms | 2952 ms | — |
| inspect | step 42: clickRole tab "…" | 1 | 200 | 1155 ms | 5132 ms | — |
| inspect | step 1: goto /groups/<id> | 1 | 200 | 726 ms | 5607 ms | — |
| inspect | step 1: goto /groups/junkremovalwinners | 1 | 200 | 930 ms | 5826 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261024T060921_61594063207669**, step 1: goto /groups/junkremovalwinners: 200, 930 ms

Sent:

```json
{
  "qpl_active_flow_ids": "25305590",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useGroupsCometVisitMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "actor_id": "61594063207669",
      "client_mutation_id": "1",
      "badge_entry_point": "GROUPS_TAB_MAIN",
      "bookmark_folder_id": "FAVORITES",
      "environment": "COMET",
      "group_id": "3549906855288164"
    },
    "scale": 1,
    "bookmarkID": "3549906855288164"
  },
  "doc_id": "27788177020768038",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=25305590"
  ]
}
```

Answered:

```json
{
  "data": {
    "viewer_groups_tab_log_group_visit": {
      "group_bookmark": {
        "bookmarked_node": {
          "__typename": "Group",
          "id": "3549906855288164"
        },
        "last_used_timestamp": null,
        "is_news_feed": false,
        "section": "UNKNOWN",
        "name": "Junk Removal Winners ™ - How to Start, Get Leads & Grow Your Business",
        "has_user_hidden": false,
        "url": "https://www.facebook.com/groups/junkremovalwinners/",
        "tracking": "{\"bmid\":3549906855288164,\"bookmark_type\":\"type_group\",\"content_type\":null}",
        "bookmark_icon_sprite": {
          "sprited": 0,
          "sprite_map_css_class": null,
          "sprite_css_class": null,
          "preloading_spi": null,
          "w": null,
          "h": null,
          "p": null,
          "sz": null,
          "spi": null,
          "uri": "https://static.xx.fbcdn.net/rsrc.php/yC/r/SUhRjnBDPdg.webp",
          "width": 36,
          "height": 36,
          "logging_id": ""
        },
        "image": {
          "uri": "https://scontent-xxc1-1.xx.fbcdn.net/v/t39.30808-6/447843169_122043041345420024_8407522355823862737_n.png (432 chars)",
          "is_silhouette": true
        },
        "query_prefetching_eligible": true,
        "unread_count": 0,
        "unread_count_string": null,
        "context_sentence": null,
        "id": "Ym9va21hcms6NjE1OTQwNjMyMDc2Njk6MTU5MjI0OTA3MTAwNTUyNjozNTQ5OTA2ODU1Mjg4MTY0Ojo6OnVua25vd24="
      },
      "viewer_for_homepage_unread_count": {
        "bookmarks": {
          "edges": [
            {
              "node": {
                "bookmarked_node": {
                  "__typename": "Group",
                  "id": "3549906855288164"
                },
                "bookmark_unread_count": 0,
                "bookmark_unread_count_string": null,
                "id": "Ym9va21hcms6NjE1OTQwNjMyMDc2Njk6NjQ0NzE1NDQ1NjUwOTI0OjM1NDk5MDY4NTUyODgxNjQ6Ojo6dW5rbm93bg=="
              }
            }
          ]
        }
      },
      "viewer": {
        "groups_tab": {
          "badge_content": {
            "edges": []
          }
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792822186502,
      "time_at_flush_ms": 1792822187096
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Logs a visit to a group for the account's Groups tab (`viewer_groups_tab_log_group_visit`), with the group's `bookmarkID`; it reads back the group bookmark and the home page's unread count. It fired 2858 ms after step 5 (click e2647) and 7513 ms after step 7 (click e2606), each time a group page opened.

## What our machine does with it

Nothing. `groupJoin` reads the group page's HTML and snapshot, not this request; it is only named in a domain test (`facebookClient.test.ts`).

## What can go wrong

None seen: both calls 200, in 458-472 ms. Nothing of ours depends on it. If the step fails anyway, `groupJoin` stops on the page, not on this request: a checkpoint or login page (`pageProblem`) or a failed step gives `groupPageNotOpened` or `groupJoinNotConfirmed`.
