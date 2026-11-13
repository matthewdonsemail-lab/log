# edgeapiCacheUsersList

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | people |
| Kind | endpoint |
| doc_id | — |
| Path | `edgeapi.slack.com/cache/users/list` |
| Sends | — |
| Reads | `results`, `ok` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script38.js:771 anonymous` |
| rea | `ev_c768a8dd3a32ade2e987e251d0627a66b7d798dc007c87a92e41828826c7a8e2` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 2 | 200 | 68–133 ms | 8921–13322 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 133 ms

Sent:

```json
{
  "query": {
    "_x_app_name": "client",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": "{\"token\":\"<slackToken>\",\"channels\":[\"<channelId:1>\"],\"present_first\":true,\"filter\":\"everyone AND NOT bots AND NOT apps\",\"count\":30}"
}
```

Answered:

```json
{
  "results": [
    {
      "id": "<userId:1>",
      "team_id": "<teamId:1>",
      "name": "<name:1>",
      "deleted": false,
      "color": "5870dd",
      "real_name": "<name:2>",
      "tz": "<timezone>",
      "tz_label": "<timezone>",
      "tz_offset": 25200,
      "profile": {
        "title": "",
        "phone": "",
        "skype": "",
        "real_name": "<name:2>",
        "real_name_normalized": "<name:2>",
        "display_name": "",
        "display_name_normalized": "",
        "fields": null,
        "status_text": "",
        "status_emoji": "",
        "status_emoji_display_info": [],
        "status_expiration": 0,
        "status_clear_on_focus_end": false,
        "avatar_hash": "c4e891e2ba88",
        "image_original": "https://s3-us-west-2.amazonaws.com/slack-files2/avatars/2026-09-28/12175321721380_c4e891e2ba88dcc86e9f_original.png",
        "is_custom_image": true,
        "email": "<email>",
        "huddle_state": "default_unset",
        "huddle_state_expiration_ts": 0,
        "first_name": "<name:3>",
        "last_name": "<name:4>",
        "status_text_canonical": "",
        "team": "<teamId:1>"
      },
      "is_admin": true,
      "is_owner": true,
      "is_primary_owner": true,
      "is_restricted": false,
      "is_ultra_restricted": false,
      "is_bot": false,
      "is_app_user": false,
      "updated": 1793356549,
      "is_email_confirmed": true,
      "who_can_share_contact_card": "EVERYONE"
    }
  ],
  "ok": true
}
```

<!-- facts:end -->

## What it does

Lists people from the cache service (`results`), used by the client to fill its people picker. Seen twice in step 4 (`goto /client`, 68-133 ms, 8.9-13.3 s after the step started), both 200.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`) works through `GabrielCore` on curl_cffi, which signs in with the `d` cookie and calls only the web API methods it needs, so this is Slack's own web client boot traffic that `log inspect` recorded.

## What can go wrong

A failure would show as `ok: false` with an `error`; both recorded answers were 200.
