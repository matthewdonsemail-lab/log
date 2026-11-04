# conversationsView

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | messages |
| Kind | query |
| doc_id | — |
| Path | `/api/conversations.view` |
| Sends | `------WebKitFormBoundaryeQQNGgNZnW4W3ABy
Content-Disposition: form-data; name`, `------WebKitFormBoundaryOe5fM1wvJmNSHEnW
Content-Disposition: form-data; name` |
| Reads | `ok`, `history.messages`, `history.has_more`, `history.mutation_timestamps`, `history.channel_actions_ts`, `history.channel_actions_count`, `users`, `bots`, `channels`, `emojis`, `channel.id`, `channel.created` and 28 more |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous`, `runs/inspect/20261103T065639_mattSlack/script125.js:37 anonymous`, `runs/inspect/20261103T065639_mattSlack/script29.js:146 "2bB/"`, `runs/inspect/20261103T065639_mattSlack/script3.js:2954 "2bB/"` |
| rea | `ev_228206b12795c642f70ae405e9ec13d7b4581bac87ee57a88d8cf472063a4945` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 554 ms | 3163 ms | — |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 1 | 200 | 338 ms | 2228 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 554 ms

Sent:

```json
{
  "query": {
    "_x_id": "noversion-1793689060.914",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryeQQNGgNZnW4W3ABy\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryeQQNGgNZnW4W3ABy\r\nContent-Disposition: form-data; name=\"canonical_avatars\"\r\n\r\ntrue\r\n------WebKitFormBoundaryeQQNGgNZnW4W3ABy\r\nContent-Disposition: form-data; name=\"no_user_profile\"\r\n\r\ntrue\r\n------WebKitFormBoundaryeQQNGgNZnW4W3ABy\r\nContent-Dispositi… (1549 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "history": {
    "messages": [
      {
        "subtype": "channel_join",
        "user": "U0C4L7RF7HD",
        "text": "<@U0C4L7RF7HD> has joined the channel",
        "type": "message",
        "ts": "1790614677.128359"
      }
    ],
    "has_more": false,
    "mutation_timestamps": {
      "latest": "0000000000.000000",
      "updated": "0000000000.000000",
      "history_invalid": "0000000000.000000"
    },
    "channel_actions_ts": null,
    "channel_actions_count": 0
  },
  "users": [
    {
      "id": "U0C4L7RF7HD",
      "name": "matthewdonsemail",
      "is_bot": false,
      "updated": 1793356549,
      "is_app_user": false,
      "team_id": "T0C4VCD06MR",
      "deleted": false,
      "color": "5870dd",
      "is_email_confirmed": true,
      "real_name": "Matthew Don",
      "tz": "Asia/Bangkok",
      "tz_label": "Indochina Time",
      "tz_offset": 25200,
      "is_admin": true,
      "is_owner": true,
      "is_primary_owner": true,
      "is_restricted": false,
      "is_ultra_restricted": false,
      "has_2fa": false,
      "who_can_share_contact_card": "EVERYONE",
      "profile": {
        "real_name": "Matthew Don",
        "display_name": "",
        "avatar_hash": "c4e891e2ba88",
        "real_name_normalized": "Matthew Don",
        "display_name_normalized": "",
        "image_original": "https://s3-us-west-2.amazonaws.com/slack-files2/avatars/2026-09-28/12175321721380_c4e891e2ba88dcc86e9f_original.png",
        "is_custom_image": true,
        "first_name": "Matthew",
        "last_name": "Don",
        "team": "T0C4VCD06MR",
        "email": "matthewdonsemail@gmail.com",
        "title": "",
        "phone": "",
        "skype": "",
        "status_text": "",
        "status_text_canonical": "",
        "status_emoji": "",
        "status_emoji_display_info": [],
        "status_expiration": 0,
        "huddle_state": "default_unset",
        "huddle_state_expiration_ts": 0
      }
    }
  ],
  "bots": [],
  "channels": [],
  "emojis": {},
  "channel": {
    "id": "C0C4L7RSTGX",
    "created": 1790614676,
    "creator": "U0C4L7RF7HD",
    "is_org_shared": false,
    "is_im": false,
    "context_team_id": "T0C4VCD06MR",
    "updated": 1793285854394,
    "name": "all-matthew_s-team",
    "name_normalized": "all-matthew_s-team",
    "is_channel": true,
    "is_group": false,
    "is_mpim": false,
    "is_private": false,
    "is_archived": false,
    "is_general": true,
    "is_shared": false,
    "is_ext_shared": false,
    "unlinked": 0,
    "is_pending_ext_shared": false,
    "pending_shared": [],
    "parent_conversation": null,
    "purpose": {
      "value": "Share announcements and updates about company news, upcoming events, or teammates who deserve some kudos. ⭐",
      "creator": "U0C4L7RF7HD",
      "last_set": 1790614676
    },
    "topic": {
      "value": "",
      "creator": "",
      "last_set": 0
    },
    "shared_team_ids": [
      "T0C4VCD06MR"
    ],
    "pending_connected_team_ids": [],
    "is_member": true,
    "last_read": "1790614677.128359",
    "latest": "1790614677.128359",
    "unread_count": 0,
    "unread_count_display": 0,
    "use_case": "welcome",
    "properties": {
      "use_case": "welcome",
      "is_dormant": true
    },
    "is_thread_only": false,
    "is_read_only": false,
    "previous_names": [
      "all-matthewdonsemail_gmail_com_s-workspace"
    ],
    "is_slackbot_channel_enabled": false,
    "is_slackbot_channel_eligible": false
  }
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 338 ms

Sent:

```json
{
  "query": {
    "_x_id": "noversion-1793689117.058",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryOe5fM1wvJmNSHEnW\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryOe5fM1wvJmNSHEnW\r\nContent-Disposition: form-data; name=\"canonical_avatars\"\r\n\r\ntrue\r\n------WebKitFormBoundaryOe5fM1wvJmNSHEnW\r\nContent-Disposition: form-data; name=\"no_user_profile\"\r\n\r\ntrue\r\n------WebKitFormBoundaryOe5fM1wvJmNSHEnW\r\nContent-Dispositi… (1654 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "history": {
    "messages": [
      {
        "user": "U0C4L7RF7HD",
        "type": "message",
        "ts": "1793689111.667059",
        "client_msg_id": "1fc41dae-7241-49d9-833f-844b5a64cb91",
        "text": "yeah man",
        "team": "T0C4VCD06MR",
        "blocks": [
          {
            "type": "rich_text",
            "block_id": "1TNMt",
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
      {
        "user": "U0A9JFXK21L",
        "type": "message",
        "ts": "1793689083.105289",
        "client_msg_id": "e75553d9-fdeb-4a3c-bf75-cbbba0a4f4e4",
        "text": "u get paid on friday?",
        "team": "T0C4VCD06MR",
        "user_team": "T0A9H4FM18V",
        "source_team": "T0A9H4FM18V",
        "user_profile": {
          "avatar_hash": "g20ac8b5db69",
          "image_72": "https://secure.gravatar.com/avatar/20ac8b5db693fa622f5aa208ac2d569e.jpg?s=72&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0000-72.png",
          "first_name": "archie",
          "real_name": "archie",
          "display_name": "",
          "team": "T0A9H4FM18V",
          "name": "archie",
          "is_restricted": false,
          "is_ultra_restricted": false
        },
        "blocks": [
          {
            "type": "rich_text",
            "block_id": "x5skW",
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
      {
        "user": "U0A9JFXK21L",
        "type": "message",
        "ts": "1793689069.817319",
        "client_msg_id": "6f8397a1-fa17-4f06-880f-5ba76bf25c00",
        "text": "laddddd",
        "team": "T0C4VCD06MR",
        "user_team": "T0A9H4FM18V",
        "source_team": "T0A9H4FM18V",
        "user_profile": {
          "avatar_hash": "g20ac8b5db69",
          "image_72": "https://secure.gravatar.com/avatar/20ac8b5db693fa622f5aa208ac2d569e.jpg?s=72&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0000-72.png",
          "first_name": "archie",
          "real_name": "archie",
          "display_name": "",
          "team": "T0A9H4FM18V",
          "name": "archie",
          "is_restricted": false,
          "is_ultra_restricted": false
        },
        "blocks": [
          {
            "type": "rich_text",
            "block_id": "RZkvM",
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
      {
        "user": "U0C4L7RF7HD",
        "type": "message",
        "ts": "1793689024.177609",
        "client_msg_id": "0143404d-bb74-4227-ae81-eb5bdcacc0c2",
        "text": "yeah i went overboard have to wait until friday like smh",
        "team": "T0C4VCD06MR",
        "blocks": [
          {
            "type": "rich_text",
            "block_id": "xiE02",
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
      {
        "user": "U0A9JFXK21L",
        "type": "message",
        "ts": "1793688985.380489",
        "client_msg_id": "5f1e240e-c641-4c12-96e2-bee8cfa3211e",
        "text": "you've ran out of ps?",
        "team": "T0C4VCD06MR",
        "user_team": "T0A9H4FM18V",
        "source_team": "T0A9H4FM18V",
        "user_profile": {
          "avatar_hash": "g20ac8b5db69",
          "image_72": "https://secure.gravatar.com/avatar/20ac8b5db693fa622f5aa208ac2d569e.jpg?s=72&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0000-72.png",
          "first_name": "archie",
          "real_name": "archie",
          "display_name": "",
          "team": "T0A9H4FM18V",
          "name": "archie",
          "is_restricted": false,
          "is_ultra_restricted": false
        },
        "blocks": [
          {
            "type": "rich_text",
            "block_id": "qAgZK",
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
      {
        "user": "U0C4L7RF7HD",
        "type": "message",
        "ts": "1793688960.221989",
        "client_msg_id": "4db67697-efe3-4692-a510-4d6b35c443cf",
        "text": "or bank transfer or whatever its a uk bank acc just need to buy some stuff here went overboard there",
        "team": "T0C4VCD06MR",
        "blocks": [
          {
            "type": "rich_text",
            "block_id": "TdL6q",
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
      "… 22 more"
    ],
    "has_more": true,
    "mutation_timestamps": {
      "latest": "1793689111.667059",
      "updated": "1793688218.000400",
      "history_invalid": "1793273886.000400"
    },
    "channel_actions_ts": null,
    "channel_actions_count": 0,
    "next_ts": 1793688105842939
  },
  "users": [
    {
      "id": "U0C4L7RF7HD",
      "name": "matthewdonsemail",
      "is_bot": false,
      "updated": 1793356549,
      "is_app_user": false,
      "team_id": "T0C4VCD06MR",
      "deleted": false,
      "color": "5870dd",
      "is_email_confirmed": true,
      "real_name": "Matthew Don",
      "tz": "Asia/Bangkok",
      "tz_label": "Indochina Time",
      "tz_offset": 25200,
      "is_admin": true,
      "is_owner": true,
      "is_primary_owner": true,
      "is_restricted": false,
      "is_ultra_restricted": false,
      "has_2fa": false,
      "who_can_share_contact_card": "EVERYONE",
      "profile": {
        "real_name": "Matthew Don",
        "display_name": "",
        "avatar_hash": "c4e891e2ba88",
        "real_name_normalized": "Matthew Don",
        "display_name_normalized": "",
        "image_original": "https://s3-us-west-2.amazonaws.com/slack-files2/avatars/2026-09-28/12175321721380_c4e891e2ba88dcc86e9f_original.png",
        "is_custom_image": true,
        "first_name": "Matthew",
        "last_name": "Don",
        "team": "T0C4VCD06MR",
        "email": "matthewdonsemail@gmail.com",
        "title": "",
        "phone": "",
        "skype": "",
        "status_text": "",
        "status_text_canonical": "",
        "status_emoji": "",
        "status_emoji_display_info": [],
        "status_expiration": 0,
        "huddle_state": "default_unset",
        "huddle_state_expiration_ts": 0
      }
    },
    {
      "id": "U0A9JFXK21L",
      "name": "archie",
      "is_bot": false,
      "updated": 1793356549,
      "is_app_user": false,
      "team_id": "T0A9H4FM18V",
      "color": "50a0cf",
      "is_stranger": false,
      "who_can_share_contact_card": "EVERYONE",
      "profile": {
        "real_name": "archie",
        "display_name": "",
        "avatar_hash": "g20ac8b5db69",
        "real_name_normalized": "archie",
        "display_name_normalized": "",
        "first_name": "archie",
        "last_name": "",
        "team": "T0A9H4FM18V",
        "email": "archie@rheos.app"
      }
    }
  ],
  "bots": [],
  "channels": [],
  "emojis": {},
  "im": {
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
    "last_read": "1793689111.667059",
    "is_open": true,
    "connected_team_ids": [
      "T0C4VCD06MR",
      "T0A9H4FM18V"
    ],
    "shared_team_ids": [
      "T0A9H4FM18V"
    ],
    "is_ext_shared": true,
    "unread_count": 0,
    "unread_count_display": 0,
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
    },
    "latest": "1793689111.667059"
  },
  "response_metadata": {
    "next_cursor": "bmV4dF90czoxNzkzNjg4MTA1ODQyOTM5"
  }
}
```

<!-- facts:end -->

## What it does

Opens a conversation in one call: history (`history.messages`, `has_more`), the `users`, `bots`, `emojis` it needs and the `channel` record: it fired at 3.2 s into step 4 (554 ms) and 2.2 s into step 6 (338 ms), both 200.

## What our machine does with it

The engine does not call it. For a read it uses `conversations.history` plus `users.info` for names, and for chats `conversations.list`, which cover the same fields without the web client's extra payload.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. A refusal would only leave the opened conversation blank in the web client.
