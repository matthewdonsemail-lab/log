# edgeapiCacheUsersInfo

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | people |
| Kind | endpoint |
| doc_id | — |
| Path | `edgeapi.slack.com/cache/users/info` |
| Sends | — |
| Reads | `results`, `can_interact.U0A9JFXK21L`, `can_interact.USLACK`, `can_interact.USLACKBOT`, `ok`, `failed_ids`, `pending_ids`, `invalid_ids` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script38.js:771 anonymous` |
| rea | `ev_c768a8dd3a32ade2e987e251d0627a66b7d798dc007c87a92e41828826c7a8e2` |

Seen 11 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 8 | 200 | 58–518 ms | 7969–12592 ms | — |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 3 | 200 | 45–47 ms | 6790–9864 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 518 ms

Sent:

```json
{
  "query": {
    "_x_app_name": "client",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": "{\"token\":\"xoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\",\"check_interaction\":true,\"include_profile_only_users\":true,\"updated_ids\":{\"USLACK\":0,\"USLACKBOT\":0,\"U0A9JFXK21L\":0}}"
}
```

Answered:

```json
{
  "results": [
    {
      "id": "USLACKBOT",
      "team_id": "T0C4VCD06MR",
      "name": "slackbot",
      "deleted": false,
      "color": "757575",
      "real_name": "Slackbot",
      "tz": "America/Los_Angeles",
      "tz_label": "Pacific Standard Time",
      "tz_offset": -28800,
      "profile": {
        "title": "",
        "phone": "",
        "skype": "",
        "real_name": "Slackbot",
        "real_name_normalized": "Slackbot",
        "display_name": "Slackbot",
        "display_name_normalized": "Slackbot",
        "fields": null,
        "status_text": "",
        "status_emoji": "",
        "status_emoji_display_info": [],
        "status_expiration": 0,
        "status_clear_on_focus_end": false,
        "avatar_hash": "sv41d8cd98f0",
        "always_active": true,
        "first_name": "slackbot",
        "last_name": "",
        "status_text_canonical": "",
        "team": "T0C4VCD06MR"
      },
      "is_admin": false,
      "is_owner": false,
      "is_primary_owner": false,
      "is_restricted": false,
      "is_ultra_restricted": false,
      "is_bot": false,
      "is_app_user": false,
      "updated": 0,
      "is_email_confirmed": false,
      "who_can_share_contact_card": "EVERYONE"
    },
    {
      "id": "U0A9JFXK21L",
      "team_id": "T0A9H4FM18V",
      "name": "archie",
      "color": "50a0cf",
      "is_bot": false,
      "is_app_user": false,
      "profile": {
        "avatar_hash": "g20ac8b5db69",
        "email": "archie@rheos.app",
        "real_name": "archie",
        "display_name": "",
        "real_name_normalized": "archie",
        "display_name_normalized": "",
        "team": "T0A9H4FM18V"
      },
      "is_stranger": true,
      "updated": 1793356549,
      "who_can_share_contact_card": "EVERYONE"
    },
    {
      "id": "USLACK",
      "team_id": "T0C4VCD06MR",
      "name": "slack",
      "deleted": false,
      "color": "757575",
      "real_name": "Slack",
      "tz": "America/Los_Angeles",
      "tz_label": "Pacific Standard Time",
      "tz_offset": -28800,
      "profile": {
        "title": "",
        "phone": "",
        "skype": "",
        "real_name": "Slack",
        "real_name_normalized": "Slack",
        "display_name": "Slack",
        "display_name_normalized": "Slack",
        "fields": null,
        "status_text": "",
        "status_emoji": "",
        "status_emoji_display_info": [],
        "status_expiration": 0,
        "status_clear_on_focus_end": false,
        "avatar_hash": "svb051040db2",
        "always_active": true,
        "first_name": "Slack",
        "last_name": "",
        "status_text_canonical": "",
        "team": "T0C4VCD06MR"
      },
      "is_admin": false,
      "is_owner": false,
      "is_primary_owner": false,
      "is_restricted": false,
      "is_ultra_restricted": false,
      "is_bot": false,
      "is_app_user": false,
      "updated": 0,
      "is_email_confirmed": false,
      "who_can_share_contact_card": "EVERYONE"
    }
  ],
  "can_interact": {
    "U0A9JFXK21L": true,
    "USLACK": true,
    "USLACKBOT": true
  },
  "ok": true
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 47 ms

Sent:

```json
{
  "query": {
    "_x_app_name": "client",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": "{\"token\":\"xoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\",\"check_interaction\":true,\"include_profile_only_users\":true,\"updated_ids\":{\"U0C4L7RF7HD\":1793356549,\"U0A9JFXK21L\":1793356549}}"
}
```

Answered:

```json
{
  "results": [],
  "ok": true
}
```

<!-- facts:end -->

## What it does

Looks up people by id in the cache service (`users/info` with `check_interaction` and `updated_ids`): it answered `results` with full user records (`USLACKBOT`, name, tz, profile) plus `can_interact` and the `failed_ids`, `pending_ids`, `invalid_ids` lists. Seen 8 times in step 4 (`goto /client`, 58-518 ms) and 3 times in step 6 (45-47 ms), all 200.

## What our machine does with it

Not used by the engine, but it is the same lookup gabriel's hydrator makes with `call_edge_api("users/info")` (`vendor/gabrielSlack/gabriel/client/hydrator.py`), which only runs inside gabriel's full client. The engine resolves names with the web API `users.info` instead (`names_for`, called by `chats`, `read` and the watch).

## What can go wrong

An id Slack can't resolve comes back in `failed_ids` or `invalid_ids` rather than as an HTTP error, so a reader that only looks at status 200 would miss it. In the engine's own lookup (`names_for`) a failed user is skipped and the raw id is shown instead of a name.
