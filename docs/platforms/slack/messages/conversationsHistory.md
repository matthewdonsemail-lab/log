# conversationsHistory

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | messages |
| Kind | query |
| doc_id | — |
| Path | `/api/conversations.history` |
| Sends | `------WebKitFormBoundaryfjiQeuvYSeoiVLRO
Content-Disposition: form-data; name`, `------WebKitFormBoundary9ioTBWpmvAqVvnix
Content-Disposition: form-data; name`, `------WebKitFormBoundarykfxmrMKFyyOWMb1v
Content-Disposition: form-data; name`, `------WebKitFormBoundaryoeyA1epMYZr6M9G2
Content-Disposition: form-data; name` |
| Reads | `ok`, `latest_updates`, `unchanged_messages`, `oldest`, `messages`, `has_more`, `pin_count`, `channel_actions_ts`, `channel_actions_count`, `date_joined`, `latest_updates.1793689024.177609`, `latest_updates.1793688985.380489` and 28 more |
| Called from | `runs/inspect/20261103T065639_mattSlack/script29.js:146 "/4ak"`, `runs/inspect/20261103T065639_mattSlack/script3.js:2954 "/4ak"`, `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous` |
| rea | `ev_11ed74c75a76c1fe765d328b3636a7ee87faefb6d6d67305edf8e854a4df3fb4` |

Seen 4 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 305 ms | 8955 ms | — |
| inspect | POST 0 /clog/track/ (0 ms) | 1 | 200 | 317 ms | 3620 ms | — |
| inspect | step 6: goto /client/<teamId:1>/<channelId:2> | 2 | 200 | 290–316 ms | 7889–7955 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 305 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689066.654",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "slack_route": "<teamId:1>",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryfjiQeuvYSeoiVLRO\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundaryfjiQeuvYSeoiVLRO\r\nContent-Disposition: form-data; name=\"channel\"\r\n\r\n<channelId:1>\r\n------WebKitFormBoundaryfjiQeuvYSeoiVLRO\r\nContent-Disposition: form-data; name=\"limit\"\r\n\r\n28\r\n------WebKitFormBoundaryfjiQeuvYSeoiVLRO\r\nContent-Disposition: form-data; … (1602 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "latest_updates": {},
  "unchanged_messages": [
    "1790614677.128359"
  ],
  "oldest": "1790614677.128359",
  "messages": [],
  "has_more": false,
  "pin_count": 0,
  "channel_actions_ts": null,
  "channel_actions_count": 0,
  "date_joined": 1790614677
}
```

**runs/inspect/20261103T065639_mattSlack**, POST 0 /clog/track/ (0 ms): 200, 317 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689075.639",
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
    "------WebKitFormBoundary9ioTBWpmvAqVvnix\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundary9ioTBWpmvAqVvnix\r\nContent-Disposition: form-data; name=\"channel\"\r\n\r\n<channelId:2>\r\n------WebKitFormBoundary9ioTBWpmvAqVvnix\r\nContent-Disposition: form-data; name=\"limit\"\r\n\r\n28\r\n------WebKitFormBoundary9ioTBWpmvAqVvnix\r\nContent-Disposition: form-data; … (1495 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "latest_updates": {
    "1793689024.177609": "1793689024.177609",
    "1793688985.380489": "1793688985.380489",
    "1793688960.221989": "1793688960.221989",
    "1793688917.563629": "1793688917.563629",
    "1793688911.505729": "1793688911.505729",
    "1793688905.602129": "1793688905.602129",
    "1793688893.234029": "1793688893.234029",
    "1793688875.488979": "1793688875.488979",
    "1793688551.299369": "1793688551.299369",
    "1793688377.728899": "1793688377.728899",
    "1793688365.345629": "1793688365.345629",
    "1793688354.628539": "1793688354.628539",
    "1793688347.168699": "1793688347.168699",
    "1793688342.507589": "1793688342.507589",
    "1793688330.979059": "1793688330.979059",
    "1793688218.019909": "1793688218.000400",
    "1793688196.600209": "1793688196.000300",
    "1793688183.308549": "1793688183.308549",
    "1793688179.368339": "1793688179.368339",
    "1793688175.791579": "1793688175.791579",
    "1793688162.932339": "1793688162.932339",
    "1793688144.803229": "1793688144.803229",
    "1793688138.071039": "1793688138.071039",
    "1793688132.547199": "1793688132.547199",
    "1793688109.484139": "1793688109.484139",
    "1793688105.842939": "1793688105.842939",
    "1793688100.332789": "1793688100.332789"
  },
  "unchanged_messages": [
    "1793689069.817319"
  ],
  "messages": [
    {
      "user": "<userId:1>",
      "type": "message",
      "ts": "1793689024.177609",
      "client_msg_id": "0143404d-bb74-4227-ae81-eb5bdcacc0c2",
      "text": "<messageText>",
      "team": "<teamId:1>",
      "blocks": [
        {
          "type": "rich_text",
          "block_id": "xiE02",
          "elements": [
            {
              "type": "rich_text_section",
              "elements": [
                {
                  "type": "text",
                  "text": "<messageText>"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "user": "<userId:2>",
      "type": "message",
      "ts": "1793688985.380489",
      "client_msg_id": "5f1e240e-c641-4c12-96e2-bee8cfa3211e",
      "text": "<messageText>",
      "team": "<teamId:1>",
      "user_team": "<teamId:2>",
      "source_team": "<teamId:2>",
      "blocks": [
        {
          "type": "rich_text",
          "block_id": "qAgZK",
          "elements": [
            {
              "type": "rich_text_section",
              "elements": [
                {
                  "type": "text",
                  "text": "<messageText>"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "user": "<userId:1>",
      "type": "message",
      "ts": "1793688960.221989",
      "client_msg_id": "4db67697-efe3-4692-a510-4d6b35c443cf",
      "text": "<messageText>",
      "team": "<teamId:1>",
      "blocks": [
        {
          "type": "rich_text",
          "block_id": "TdL6q",
          "elements": [
            {
              "type": "rich_text_section",
              "elements": [
                {
                  "type": "text",
                  "text": "<messageText>"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "user": "<userId:2>",
      "type": "message",
      "ts": "1793688917.563629",
      "client_msg_id": "7ff0eb98-693c-4d45-9797-7facfad49d1d",
      "text": "dont have revolut",
      "team": "<teamId:1>",
      "user_team": "<teamId:2>",
      "source_team": "<teamId:2>",
      "blocks": [
        {
          "type": "rich_text",
          "block_id": "hr6qk",
          "elements": [
            {
              "type": "rich_text_section",
              "elements": [
                {
                  "type": "text",
                  "text": "dont have revolut"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "user": "<userId:1>",
      "type": "message",
      "ts": "1793688911.505729",
      "client_msg_id": "f7cde888-95e9-4a37-980d-615e1db08647",
      "text": "yeah bro",
      "team": "<teamId:1>",
      "blocks": [
        {
          "type": "rich_text",
          "block_id": "68TTZ",
          "elements": [
            {
              "type": "rich_text_section",
              "elements": [
                {
                  "type": "text",
                  "text": "yeah bro"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "user": "<userId:2>",
      "type": "message",
      "ts": "1793688905.602129",
      "client_msg_id": "90e5a31a-05b3-422c-b314-9248356a3823",
      "text": "like revolut pay",
      "team": "<teamId:1>",
      "user_team": "<teamId:2>",
      "source_team": "<teamId:2>",
      "blocks": [
        {
          "type": "rich_text",
          "block_id": "Z3O0Z",
          "elements": [
            {
              "type": "rich_text_section",
              "elements": [
                {
                  "type": "text",
                  "text": "like revolut pay"
                }
              ]
            }
          ]
        }
      ]
    },
    "… 21 more"
  ],
  "has_more": true,
  "pin_count": 0,
  "channel_actions_ts": null,
  "channel_actions_count": 0,
  "response_metadata": {
    "next_cursor": "bmV4dF90czoxNzkzNjg3NTQxMDUxMDg5"
  }
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/<teamId:1>/<channelId:2>: 200, 316 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689122.640",
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
    "------WebKitFormBoundarykfxmrMKFyyOWMb1v\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundarykfxmrMKFyyOWMb1v\r\nContent-Disposition: form-data; name=\"channel\"\r\n\r\n<channelId:2>\r\n------WebKitFormBoundarykfxmrMKFyyOWMb1v\r\nContent-Disposition: form-data; name=\"limit\"\r\n\r\n28\r\n------WebKitFormBoundarykfxmrMKFyyOWMb1v\r\nContent-Disposition: form-data; … (1602 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "latest_updates": {
    "1793689118.238869": "1793689118.238869"
  },
  "unchanged_messages": [
    "1793689111.667059"
  ],
  "oldest": "1793689111.667059",
  "messages": [
    {
      "user": "<userId:2>",
      "type": "message",
      "ts": "1793689118.238869",
      "client_msg_id": "e10f3ff0-5d53-4c66-b0bf-cb2bb3e41382",
      "text": "from who",
      "team": "<teamId:1>",
      "user_team": "<teamId:2>",
      "source_team": "<teamId:2>",
      "blocks": [
        {
          "type": "rich_text",
          "block_id": "bD+4B",
          "elements": [
            {
              "type": "rich_text_section",
              "elements": [
                {
                  "type": "text",
                  "text": "from who"
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "has_more": false,
  "pin_count": 0,
  "channel_actions_ts": null,
  "channel_actions_count": 0,
  "date_joined": 1791540333
}
```

<!-- facts:end -->

## What it does

Reads a conversation's messages newest first (`messages`, `has_more`, `oldest`, `latest_updates`, `unchanged_messages`, `pin_count`): the web client fired it in step 4 (305 ms), step 6 twice (290 to 316 ms) and once from a `/clog/track/` POST, all 200, with `oldest` values like `1793689111.667059` so it asked only for what changed.

## What our machine does with it

This is the engine's `read` action: `read` in `python/slackApi/engine.py` calls `core.call_web_api("conversations.history", {channel, limit, oldest?, cursor?})`, pages with `response_metadata.next_cursor` while `has_more`, then names the senders (`users.info`) and returns rows. Catch-up after a gap (rule 135) uses its `oldest` to fetch only what is newer than the saved ts. It is the `slackRead` surface and marks nothing read.

## What can go wrong

`ok: false` returns an error from the engine's call: `channel_not_found`, `not_in_channel` or `missing_scope` would mean the chat id is wrong or not visible to the account, and `ratelimited` or `not_authed` mean the run stops (rule 94) and the account stays behind until matt says so. The recordings here all answered 200 with `ok: true`.
