# clientDms

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | conversations |
| Kind | query |
| doc_id | — |
| Path | `/api/client.dms` |
| Sends | `------WebKitFormBoundary8IRjHEUSOUhY5Y4K
Content-Disposition: form-data; name` |
| Reads | `ok`, `ims`, `mpims` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script35.js:275 anonymous` |
| rea | `ev_a13fc52804073bfb00598ae35b2d8423b6c780212c02a1b59a064f824b314775` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 8: click e1075 | 1 | 200 | 403 ms | 5870 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 8: click e1075: 200, 403 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689245.880",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "b3O92r22OFk",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundary8IRjHEUSOUhY5Y4K\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundary8IRjHEUSOUhY5Y4K\r\nContent-Disposition: form-data; name=\"count\"\r\n\r\n250\r\n------WebKitFormBoundary8IRjHEUSOUhY5Y4K\r\nContent-Disposition: form-data; name=\"include_closed\"\r\n\r\ntrue\r\n------WebKitFormBoundary8IRjHEUSOUhY5Y4K\r\nContent-Disposition: form-data;… (996 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "ims": [
    {
      "id": "D0C8VAE7REU",
      "message": {
        "user": "U0A9JFXK21L",
        "type": "message",
        "ts": "1793689118.238869",
        "client_msg_id": "e10f3ff0-5d53-4c66-b0bf-cb2bb3e41382",
        "text": "from who",
        "team": "T0C4VCD06MR",
        "user_team": "T0A9H4FM18V",
        "source_team": "T0A9H4FM18V",
        "blocks": [
          {
            "type": "rich_text",
            "block_id": "bD+4B",
            "elements": [
              {
                "type": "rich_text_section",
                "elements": [
                  {
                    "type": "…",
                    "text": "…"
                  }
                ]
              }
            ]
          }
        ]
      },
      "channel": {
        "id": "D0C8VAE7REU",
        "created": 1791540333,
        "is_org_shared": false,
        "is_im": true,
        "is_archived": false,
        "context_team_id": "T0C4VCD06MR",
        "updated": 1793354470891,
        "is_shared": true,
        "is_frozen": false,
        "is_slackbot_channel_enabled": false,
        "is_slackbot_channel_eligible": false,
        "user": "U0A9JFXK21L",
        "last_read": "1793689118.238869",
        "is_open": true,
        "connected_team_ids": [
          "T0C4VCD06MR",
          "T0A9H4FM18V"
        ],
        "shared_team_ids": [
          "T0A9H4FM18V"
        ],
        "is_ext_shared": true,
        "properties": {
          "meeting_notes": {
            "file_id": "F0CDBB09HT5"
          },
          "tabs": [
            {
              "type": "files",
              "label": "",
              "id": "files"
            },
            {
              "id": "Ct0CDC95GAMB",
              "type": "canvas",
              "data": {
                "file_id": "F0CDBB09HT5",
                "shared_ts": "1793354470.599729"
              },
              "label": ""
            }
          ],
          "tabz": [
            {
              "type": "files"
            },
            {
              "id": "Ct0CDC95GAMB",
              "type": "canvas",
              "data": {
                "file_id": "F0CDBB09HT5",
                "shared_ts": "1793354470.599729"
              }
            }
          ]
        }
      },
      "latest": "1793689118.238869"
    },
    {
      "id": "D0C4VCJA6NP",
      "message": {
        "subtype": "bot_message",
        "text": "Matthew's Team’s free trial of Slack Pro has ended. Any channels with people outside your company — such as *#matt-rheos* — have been disconnected.\n\nTo continue using Slack Connect channels, upgrade to a paid plan. <https://slack.com/pricing|See upgrade options>",
        "user": "USLACK",
        "type": "message",
        "ts": "1793180184.720269",
        "bot_id": "B01",
        "blocks": [
          {
            "type": "rich_text",
            "block_id": "26Pxa",
            "elements": [
              {
                "type": "rich_text_section",
                "elements": [
                  {
                    "type": "…",
                    "text": "…"
                  },
                  {
                    "type": "…",
                    "text": "…",
                    "style": "…"
                  },
                  {
                    "type": "…",
                    "text": "…"
                  },
                  {
                    "type": "…",
                    "url": "…",
                    "text": "…"
                  }
                ]
              }
            ]
          }
        ]
      },
      "channel": {
        "id": "D0C4VCJA6NP",
        "created": 1790614723,
        "is_org_shared": false,
        "is_im": true,
        "is_archived": false,
        "context_team_id": "T0C4VCD06MR",
        "updated": 1790614723826,
        "is_frozen": false,
        "is_slackbot_channel_enabled": false,
        "is_slackbot_channel_eligible": false,
        "user": "USLACK",
        "last_read": "1790614725.624499",
        "is_open": true
      },
      "latest": "1793180184.720269"
    }
  ],
  "mpims": []
}
```

<!-- facts:end -->

## What it does

Loads the viewer's direct-message and group-DM lists (`ims`, `mpims`) when a sidebar section is opened: it fired 5.9 s after step 8 (click e1075) and answered 200 in 403 ms.

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client. The engine's `chats` action gets the same DM and group-DM list from `conversations.list` with `types: im,mpim`.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. A refusal would only leave the web client's sidebar empty; it would not affect any log-cli run.
