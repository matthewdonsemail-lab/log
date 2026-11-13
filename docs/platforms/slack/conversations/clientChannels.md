# clientChannels

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | conversations |
| Kind | query |
| doc_id | — |
| Path | `/api/client.channels` |
| Sends | `------WebKitFormBoundaryyZuXdAJwZHCnkAKf
Content-Disposition: form-data; name`, `------WebKitFormBoundaryECI1JUjgnOTowPBr
Content-Disposition: form-data; name` |
| Reads | `ok`, `channels.has_more_mpdms`, `channels.channels`, `channels.ims`, `channels.mpims`, `channels.is_open`, `channels.channels_priority`, `sections.channel_sections`, `sections.entities`, `sections.checksum`, `channels.unchanged_channel_ids` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script289.js:1371 anonymous`, `runs/inspect/20261103T065639_mattSlack/script29.js:168 statement`, `runs/inspect/20261103T065639_mattSlack/script3.js:2976 statement`, `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous` |
| rea | `ev_785fbb3fccac7189d193fb23f8d798decd1eed93c410adce714e423f355e75f4` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 852 ms | 3196 ms | — |
| inspect | step 6: goto /client/<teamId:1>/<channelId:1> | 1 | 200 | 305 ms | 2333 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 852 ms

Sent:

```json
{
  "query": {
    "_x_id": "noversion-1793689061.005",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryyZuXdAJwZHCnkAKf\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundaryyZuXdAJwZHCnkAKf\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\ninitial-data\r\n------WebKitFormBoundaryyZuXdAJwZHCnkAKf\r\nContent-Disposition: form-data; name=\"version_all_channels\"\r\n\r\nfalse\r\n------WebKitFormBoundaryyZuXdAJwZHCnkAKf\r\nContent-Dis… (710 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "channels": {
    "has_more_mpdms": false,
    "channels": [
      {
        "id": "<channelId:2>",
        "name": "<name:1>",
        "is_channel": true,
        "is_group": false,
        "is_im": false,
        "is_mpim": false,
        "is_private": false,
        "created": 1790614676,
        "is_archived": false,
        "is_general": true,
        "unlinked": 0,
        "name_normalized": "<name:1>",
        "is_shared": false,
        "is_frozen": false,
        "is_org_shared": false,
        "is_pending_ext_shared": false,
        "pending_shared": [],
        "context_team_id": "<teamId:1>",
        "updated": 1793285854394,
        "parent_conversation": null,
        "creator": "<userId:1>",
        "use_case": "welcome",
        "is_ext_shared": false,
        "shared_team_ids": [
          "<teamId:1>"
        ],
        "pending_connected_team_ids": [],
        "topic": {
          "value": "",
          "creator": "",
          "last_set": 0
        },
        "purpose": {
          "value": "Share announcements and updates about company news, upcoming events, or teammates who deserve some kudos. ⭐",
          "creator": "<userId:1>",
          "last_set": 1790614676
        },
        "properties": {
          "use_case": "welcome",
          "is_dormant": true
        },
        "previous_names": [
          "all-matthewdonsemail_gmail_com_s-workspace"
        ],
        "is_slackbot_channel_enabled": false,
        "is_slackbot_channel_eligible": false
      },
      {
        "id": "<channelId:3>",
        "name": "<name:2>",
        "is_channel": true,
        "is_group": false,
        "is_im": false,
        "is_mpim": false,
        "is_private": false,
        "created": 1790614677,
        "is_archived": false,
        "is_general": false,
        "unlinked": 0,
        "name_normalized": "<name:2>",
        "is_shared": false,
        "is_frozen": false,
        "is_org_shared": false,
        "is_pending_ext_shared": false,
        "pending_shared": [],
        "context_team_id": "<teamId:1>",
        "updated": 1793285921304,
        "parent_conversation": null,
        "creator": "<userId:1>",
        "use_case": "random",
        "is_ext_shared": false,
        "shared_team_ids": [
          "<teamId:1>"
        ],
        "pending_connected_team_ids": [],
        "topic": {
          "value": "",
          "creator": "",
          "last_set": 0
        },
        "purpose": {
          "value": "Other channels are for work. This one’s just for fun. Get to know your teammates and show your lighter side. 🎈",
          "creator": "<userId:1>",
          "last_set": 1790614677
        },
        "properties": {
          "use_case": "random",
          "is_dormant": true
        },
        "previous_names": [],
        "is_slackbot_channel_enabled": false,
        "is_slackbot_channel_eligible": false
      },
      {
        "id": "<channelId:4>",
        "name": "<name:3>",
        "is_channel": true,
        "is_group": false,
        "is_im": false,
        "is_mpim": false,
        "is_private": true,
        "created": 1790614497,
        "is_archived": true,
        "is_general": false,
        "unlinked": 1793180184,
        "name_normalized": "<name:3>",
        "is_shared": false,
        "is_frozen": true,
        "is_org_shared": false,
        "is_pending_ext_shared": false,
        "pending_shared": [],
        "context_team_id": "<teamId:1>",
        "updated": 1793180184924,
        "frozen_reason": "connection_severed",
        "parent_conversation": null,
        "creator": "<userId:1>",
        "is_ext_shared": false,
        "shared_team_ids": [
          "<teamId:1>"
        ],
        "pending_connected_team_ids": [],
        "topic": {
          "value": "",
          "creator": "",
          "last_set": 0
        },
        "purpose": {
          "value": "",
          "creator": "",
          "last_set": 0
        },
        "properties": {},
        "previous_names": [],
        "is_slackbot_channel_enabled": false,
        "is_slackbot_channel_eligible": false
      }
    ],
    "ims": [
      {
        "id": "<channelId:5>",
        "created": 1790614723,
        "is_org_shared": false,
        "is_im": true,
        "is_archived": false,
        "context_team_id": "<teamId:1>",
        "updated": 1790614723826,
        "is_frozen": false,
        "is_slackbot_channel_enabled": false,
        "is_slackbot_channel_eligible": false,
        "user": "USLACK",
        "is_open": true
      },
      {
        "id": "<channelId:6>",
        "created": 1790614676,
        "is_org_shared": false,
        "is_im": true,
        "is_archived": false,
        "context_team_id": "<teamId:1>",
        "updated": 1793285898858,
        "is_frozen": false,
        "is_slackbot_channel_enabled": false,
        "is_slackbot_channel_eligible": false,
        "user": "USLACKBOT",
        "is_open": false,
        "properties": {
          "is_dormant": true
        }
      },
      {
        "id": "<channelId:7>",
        "created": 1790614676,
        "is_org_shared": false,
        "is_im": true,
        "is_archived": false,
        "context_team_id": "<teamId:1>",
        "updated": 1793285921277,
        "is_frozen": false,
        "is_slackbot_channel_enabled": false,
        "is_slackbot_channel_eligible": false,
        "user": "<userId:1>",
        "is_open": true,
        "properties": {
          "is_dormant": true
        }
      },
      {
        "id": "<channelId:1>",
        "created": 1791540333,
        "is_org_shared": false,
        "is_im": true,
        "is_archived": false,
        "context_team_id": "<teamId:1>",
        "updated": 1793354470891,
        "is_shared": true,
        "is_frozen": false,
        "is_slackbot_channel_enabled": false,
        "is_slackbot_channel_eligible": false,
        "user": "<userId:2>",
        "is_open": true,
        "connected_team_ids": [
          "<teamId:1>",
          "<teamId:2>"
        ],
        "shared_team_ids": [
          "<teamId:2>"
        ],
        "is_ext_shared": true,
        "properties": {
          "meeting_notes": {
            "file_id": "<fileId:1>"
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
                "file_id": "<fileId:1>",
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
                "file_id": "<fileId:1>",
                "shared_ts": "1793354470.599729"
              }
            }
          ]
        }
      }
    ],
    "mpims": [],
    "is_open": [
      "<channelId:5>",
      "<channelId:7>",
      "<channelId:1>"
    ],
    "channels_priority": {}
  },
  "sections": {
    "channel_sections": [
      {
        "channel_section_id": "L0CCME95NP5",
        "name": "",
        "type": "stars",
        "emoji": "",
        "last_updated": 1793194973,
        "is_redacted": false,
        "channel_ids": []
      },
      {
        "channel_section_id": "L0CCXC3LQ1J",
        "name": "<name:4>",
        "type": "slack_connect",
        "emoji": "",
        "last_updated": 1793194973,
        "is_redacted": false,
        "channel_ids": []
      },
      {
        "channel_section_id": "L0CDN2L8RB2",
        "name": "",
        "type": "temporary_channels",
        "emoji": "",
        "last_updated": 1793180189,
        "is_redacted": false,
        "channel_ids": []
      },
      {
        "channel_section_id": "L0CCVJ11T5F",
        "name": "<name:5>",
        "type": "salesforce_records",
        "emoji": "salesforce",
        "last_updated": 1793180189,
        "is_redacted": false,
        "channel_ids": []
      },
      {
        "channel_section_id": "L0CCNCE5TV3",
        "name": "<name:6>",
        "type": "channels",
        "emoji": "",
        "last_updated": 1793180189,
        "is_redacted": false,
        "channel_ids": []
      },
      {
        "channel_section_id": "L0CCC9WMAUF",
        "name": "<name:7>",
        "type": "direct_messages",
        "emoji": "",
        "last_updated": 1793180189,
        "is_redacted": false,
        "channel_ids": []
      },
      "… 2 more"
    ],
    "entities": [],
    "checksum": "36df2202c54abdefa40bc15089267ed6552f596f1d2848785bd7ef00962f6910"
  }
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/<teamId:1>/<channelId:1>: 200, 305 ms

Sent:

```json
{
  "query": {
    "_x_id": "noversion-1793689117.415",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryECI1JUjgnOTowPBr\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundaryECI1JUjgnOTowPBr\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\ndeferred-data\r\n------WebKitFormBoundaryECI1JUjgnOTowPBr\r\nContent-Disposition: form-data; name=\"version_all_channels\"\r\n\r\nfalse\r\n------WebKitFormBoundaryECI1JUjgnOTowPBr\r\nContent-Di… (830 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "channels": {
    "has_more_mpdms": false,
    "channels": [],
    "ims": [
      {
        "id": "<channelId:5>",
        "created": 1790614723,
        "is_org_shared": false,
        "is_im": true,
        "is_archived": false,
        "context_team_id": "<teamId:1>",
        "updated": 1790614723826,
        "is_frozen": false,
        "is_slackbot_channel_enabled": false,
        "is_slackbot_channel_eligible": false,
        "user": "USLACK",
        "is_open": true
      },
      {
        "id": "<channelId:6>",
        "created": 1790614676,
        "is_org_shared": false,
        "is_im": true,
        "is_archived": false,
        "context_team_id": "<teamId:1>",
        "updated": 1793285898858,
        "is_frozen": false,
        "is_slackbot_channel_enabled": false,
        "is_slackbot_channel_eligible": false,
        "user": "USLACKBOT",
        "is_open": false,
        "properties": {
          "is_dormant": true
        }
      },
      {
        "id": "<channelId:7>",
        "created": 1790614676,
        "is_org_shared": false,
        "is_im": true,
        "is_archived": false,
        "context_team_id": "<teamId:1>",
        "updated": 1793285921277,
        "is_frozen": false,
        "is_slackbot_channel_enabled": false,
        "is_slackbot_channel_eligible": false,
        "user": "<userId:1>",
        "is_open": true,
        "properties": {
          "is_dormant": true
        }
      },
      {
        "id": "<channelId:1>",
        "created": 1791540333,
        "is_org_shared": false,
        "is_im": true,
        "is_archived": false,
        "context_team_id": "<teamId:1>",
        "updated": 1793354470891,
        "is_shared": true,
        "is_frozen": false,
        "is_slackbot_channel_enabled": false,
        "is_slackbot_channel_eligible": false,
        "user": "<userId:2>",
        "is_open": true,
        "connected_team_ids": [
          "<teamId:1>",
          "<teamId:2>"
        ],
        "shared_team_ids": [
          "<teamId:2>"
        ],
        "is_ext_shared": true,
        "properties": {
          "meeting_notes": {
            "file_id": "<fileId:1>"
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
                "file_id": "<fileId:1>",
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
                "file_id": "<fileId:1>",
                "shared_ts": "1793354470.599729"
              }
            }
          ]
        }
      }
    ],
    "mpims": [],
    "is_open": [
      "<channelId:5>",
      "<channelId:7>",
      "<channelId:1>"
    ],
    "unchanged_channel_ids": [
      "<channelId:2>",
      "<channelId:3>",
      "<channelId:4>"
    ],
    "channels_priority": {}
  },
  "sections": {
    "channel_sections": [
      {
        "channel_section_id": "L0CCME95NP5",
        "name": "",
        "type": "stars",
        "emoji": "",
        "last_updated": 1793194973,
        "is_redacted": false,
        "channel_ids": []
      },
      {
        "channel_section_id": "L0CCXC3LQ1J",
        "name": "<name:4>",
        "type": "slack_connect",
        "emoji": "",
        "last_updated": 1793194973,
        "is_redacted": false,
        "channel_ids": []
      },
      {
        "channel_section_id": "L0CDN2L8RB2",
        "name": "",
        "type": "temporary_channels",
        "emoji": "",
        "last_updated": 1793180189,
        "is_redacted": false,
        "channel_ids": []
      },
      {
        "channel_section_id": "L0CCVJ11T5F",
        "name": "<name:5>",
        "type": "salesforce_records",
        "emoji": "salesforce",
        "last_updated": 1793180189,
        "is_redacted": false,
        "channel_ids": []
      },
      {
        "channel_section_id": "L0CCNCE5TV3",
        "name": "<name:6>",
        "type": "channels",
        "emoji": "",
        "last_updated": 1793180189,
        "is_redacted": false,
        "channel_ids": []
      },
      {
        "channel_section_id": "L0CCC9WMAUF",
        "name": "<name:7>",
        "type": "direct_messages",
        "emoji": "",
        "last_updated": 1793180189,
        "is_redacted": false,
        "channel_ids": []
      },
      "… 2 more"
    ],
    "entities": [],
    "checksum": "36df2202c54abdefa40bc15089267ed6552f596f1d2848785bd7ef00962f6910"
  }
}
```

<!-- facts:end -->

## What it does

Slack's web client asks for the viewer's channel list and sidebar sections in one call (`channels.channels`, `channels.ims`, `channels.mpims`, `sections.channel_sections`, `sections.checksum`, `unchanged_channel_ids`): it fired 3.2 s into step 4 (goto /client, 852 ms) and again 2.3 s into step 6 (305 ms), both 200, on account mattSlack (run 20261103T065639).

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client. The engine lists chats with `conversations.list` (`chats` action) instead.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. An `ok: false` (for example `not_authed` or `invalid_auth`) would mean the session cookie is dead; in the engine that maps to `sessionDead`, but this call is not one the engine makes.
