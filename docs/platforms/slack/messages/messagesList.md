# messagesList

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | messages |
| Kind | query |
| doc_id | — |
| Path | `/api/messages.list` |
| Sends | `------WebKitFormBoundaryWZRZEQWzGRAsoydV
Content-Disposition: form-data; name`, `------WebKitFormBoundaryxuSiqz6NNgZfdQ1w
Content-Disposition: form-data; name` |
| Reads | `ok`, `messages`, `messages_data.<channelId:1>`, `messages_data.<channelId:2>` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous`, `runs/inspect/20261103T065639_mattSlack/script29.js:146 ktgI`, `runs/inspect/20261103T065639_mattSlack/script3.js:2954 ktgI` |
| rea | `ev_c214088d5c37b96db1863c7fc1132784da2ee2181aa4d4d6115355253ee62580` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: saveState | 2 | 200 | 299–435 ms | 21925–22412 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 5: saveState: 200, 435 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689111.648",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "aVvVPXA0sak",
    "slack_route": "<teamId:1>",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryWZRZEQWzGRAsoydV\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundaryWZRZEQWzGRAsoydV\r\nContent-Disposition: form-data; name=\"message_ids\"\r\n\r\n[{\"channel\":\"<channelId:1>\",\"timestamps\":[\"1793426071.975999\",\"1793425977.214919\",\"1793289032.825259\",\"1792916547.440449\",\"1792916238.690269\",\"1792858415.559569\",\"1792858390.02084… (1138 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "messages": {},
  "messages_data": {
    "<channelId:1>": {
      "messages": [
        {
          "user": "<userId:1>",
          "type": "message",
          "ts": "1793426071.975999",
          "client_msg_id": "e0c0b2d3-4641-403f-be09-0e99af51e515",
          "text": "<messageText>",
          "team": "<teamId:1>",
          "blocks": [
            {
              "type": "rich_text",
              "block_id": "jrMp7",
              "elements": [
                {
                  "type": "rich_text_section",
                  "elements": [
                    "…"
                  ]
                }
              ]
            }
          ],
          "reactions": [
            {
              "name": "<name:1>",
              "users": [
                "<userId:2>"
              ],
              "count": 1
            }
          ]
        },
        {
          "user": "<userId:2>",
          "type": "message",
          "ts": "1793425977.214919",
          "client_msg_id": "ff4e26b4-5a4c-420a-9c5f-fc451f441672",
          "text": "<messageText>",
          "team": "<teamId:1>",
          "user_team": "<teamId:2>",
          "source_team": "<teamId:2>",
          "user_profile": {
            "avatar_hash": "g20ac8b5db69",
            "image_72": "<avatarUrl>",
            "first_name": "<name:2>",
            "real_name": "<name:2>",
            "display_name": "",
            "team": "<teamId:2>",
            "name": "<name:2>",
            "is_restricted": false,
            "is_ultra_restricted": false
          },
          "thread_ts": "1793425898.143889",
          "parent_user_id": "<userId:1>",
          "blocks": [
            {
              "type": "rich_text",
              "block_id": "q2HxB",
              "elements": [
                {
                  "type": "rich_text_section",
                  "elements": [
                    "…"
                  ]
                }
              ]
            }
          ]
        },
        {
          "user": "<userId:2>",
          "type": "message",
          "ts": "1793289032.825259",
          "client_msg_id": "c2de6ba2-5e73-452c-afac-7494949c53ca",
          "text": "noooo stress la",
          "team": "<teamId:1>",
          "user_team": "<teamId:2>",
          "source_team": "<teamId:2>",
          "user_profile": {
            "avatar_hash": "g20ac8b5db69",
            "image_72": "<avatarUrl>",
            "first_name": "<name:2>",
            "real_name": "<name:2>",
            "display_name": "",
            "team": "<teamId:2>",
            "name": "<name:2>",
            "is_restricted": false,
            "is_ultra_restricted": false
          },
          "thread_ts": "1793285917.544979",
          "parent_user_id": "<userId:1>",
          "blocks": [
            {
              "type": "rich_text",
              "block_id": "56x0F",
              "elements": [
                {
                  "type": "rich_text_section",
                  "elements": [
                    "…"
                  ]
                }
              ]
            }
          ]
        },
        {
          "user": "<userId:1>",
          "type": "message",
          "ts": "1792916547.440449",
          "client_msg_id": "03ababf2-4aac-4734-8db5-2b5699f7ada1",
          "text": "<messageText>",
          "team": "<teamId:1>",
          "blocks": [
            {
              "type": "rich_text",
              "block_id": "GwCvv",
              "elements": [
                {
                  "type": "rich_text_section",
                  "elements": [
                    "…"
                  ]
                }
              ]
            }
          ],
          "reactions": [
            {
              "name": "white_check_mark",
              "users": [
                "<userId:2>"
              ],
              "count": 1
            }
          ]
        },
        {
          "user": "<userId:2>",
          "type": "message",
          "ts": "1792916238.690269",
          "client_msg_id": "7663106d-c481-4d7a-8862-38170d867099",
          "text": "shi",
          "team": "<teamId:1>",
          "user_team": "<teamId:2>",
          "source_team": "<teamId:2>",
          "user_profile": {
            "avatar_hash": "g20ac8b5db69",
            "image_72": "<avatarUrl>",
            "first_name": "<name:2>",
            "real_name": "<name:2>",
            "display_name": "",
            "team": "<teamId:2>",
            "name": "<name:2>",
            "is_restricted": false,
            "is_ultra_restricted": false
          },
          "thread_ts": "1792825763.516099",
          "parent_user_id": "<userId:1>",
          "blocks": [
            {
              "type": "rich_text",
              "block_id": "tdq8+",
              "elements": [
                {
                  "type": "rich_text_section",
                  "elements": [
                    "…"
                  ]
                }
              ]
            }
          ]
        },
        {
          "user": "<userId:2>",
          "type": "message",
          "ts": "1792858415.559569",
          "client_msg_id": "BA0DEE6A-87BB-4A3B-839E-4A948E99DF04",
          "text": "<messageText>",
          "team": "<teamId:1>",
          "user_team": "<teamId:2>",
          "source_team": "<teamId:2>",
          "user_profile": {
            "avatar_hash": "g20ac8b5db69",
            "image_72": "<avatarUrl>",
            "first_name": "<name:2>",
            "real_name": "<name:2>",
            "display_name": "",
            "team": "<teamId:2>",
            "name": "<name:2>",
            "is_restricted": false,
            "is_ultra_restricted": false
          },
          "thread_ts": "1792823611.666799",
          "parent_user_id": "<userId:1>",
          "blocks": [
            {
              "type": "rich_text",
              "block_id": "ZDLzW",
              "elements": [
                {
                  "type": "rich_text_section",
                  "elements": [
                    "…"
                  ]
                }
              ]
            }
          ]
        },
        "… 1 more"
      ],
      "latest_updates": {
        "1793426071.975999": "1793426083.000400",
        "1793425977.214919": "1793425977.214919",
        "1793289032.825259": "1793289032.825259",
        "1792916547.440449": "1792916570.000400",
        "1792916238.690269": "1792916238.690269",
        "1792858415.559569": "1792858415.559569",
        "1792858390.020849": "1792858390.020849"
      },
      "unchanged_messages": []
    },
    "<channelId:2>": {
      "messages": [
        {
          "subtype": "bot_message",
          "text": "<messageText>",
          "user": "USLACK",
          "type": "message",
          "ts": "1793180184.720269",
          "bot_id": "B01",
          "blocks": [
            {
              "type": "rich_text",
              "block_id": "NxDFK",
              "elements": [
                {
                  "type": "rich_text_section",
                  "elements": [
                    "…",
                    "…",
                    "…",
                    "…"
                  ]
                }
              ]
            }
          ]
        }
      ],
      "latest_updates": {
        "1793180184.720269": "1793180184.720269"
      },
      "unchanged_messages": []
    }
  }
}
```

<!-- facts:end -->

## What it does

Loads specific messages by id for the client's cache (`messages`, `messages_data.<channelId:1>`, `messages_data.<channelId:2>`): it fired twice in step 5 (saveState), 21.9 to 22.4 s in, 299 to 435 ms, 200.

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client. The engine reads messages with `conversations.history`.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. A refusal would only leave those messages unloaded in the web client.
