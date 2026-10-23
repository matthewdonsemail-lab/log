# FriendingCometFriendRequestsRootQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28020143907666118` |
| Path | `/api/graphql/` |
| Sends | `scale` |
| Reads | `viewer.friend_requests`, `viewer.should_show_proactive_friending_alert`, `viewer.max_friend_limit`, `viewer....FriendingCometFriendRequestsSectionPanel_viewerConnection`, `viewer.should_show_osa_explainer` |
| Called from | `FriendingCometFriendRequestsRoot.react` |
| rea | `ev_60448a387862bd9641e318b90c7c21ac41a46bae07de13b195f7c7773aeab539` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 7: goto / | 1 | 200 | 467 ms | 118255 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T045453_61594063207669**, step 7: goto /: 200, 467 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "FriendingCometFriendRequestsRootQuery",
  "server_timestamps": "true",
  "variables": {
    "scale": 1
  },
  "doc_id": "28020143907666118"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "friend_requests": {
        "count": 1
      },
      "should_show_proactive_friending_alert": false,
      "max_friend_limit": 6000,
      "friending_possibilities": {
        "all_pending_requests_expire": false,
        "count": 1,
        "should_hide_request_timestamp": false,
        "edges": [
          {
            "expiration_time": null,
            "expiry_text_content_variant": 1,
            "is_seen": false,
            "time": 1792727401,
            "node": {
              "id": "61556829712306",
              "friendship_status": "INCOMING_REQUEST",
              "name": "Tadele Azmeraw",
              "url": "https://www.facebook.com/profile.php?id=61556829712306",
              "profile_picture": {
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/840406481_122351384084227657_2181478911876956811_n.jpg?stp=c0.0.736.736a_cp0_dst-jpg_tt6&cstp=mx736x736&ctp=s60x60&_nc_cat=102&ccb=1-7&_nc_sid=e99d92&_nc_ohc=dWRATbNp6I8Q7kNvwEGQ49a&_nc_oc=Adrlwp_BnR4s3q_jF96kRTz5bpTmpjidFscmDGOQyeRCh2nNQSE1pZ4fsCC_6TRZNRA&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=w9O2SW9AMFnxzcwM8-uxQA&_nc_ss=792a8&oh=00_AQOVZz… (452 chars)"
              },
              "__isFriendNode": "User",
              "social_context": {
                "text": ""
              },
              "social_context_top_mutual_friends": [],
              "__typename": "User"
            },
            "cursor": "61556829712306"
          }
        ],
        "page_info": {
          "has_next_page": false,
          "end_cursor": "61556829712306"
        }
      },
      "should_show_osa_explainer": false
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792731781835,
      "time_at_flush_ms": 1792731781883
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

The friend requests panel on the home page: the account's pending friend requests, whether to show a friending alert, and its friend limit (`viewer.friend_requests`, `viewer.max_friend_limit`). It loaded about two minutes into step 7, the home feed.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
