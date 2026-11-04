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
  "body": "{\"token\":\"xoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\",\"channels\":[\"C0C4L7RSTGX\"],\"present_first\":true,\"filter\":\"everyone AND NOT bots AND NOT apps\",\"count\":30}"
}
```

Answered:

```json
{
  "results": [
    {
      "id": "U0C4L7RF7HD",
      "team_id": "T0C4VCD06MR",
      "name": "matthewdonsemail",
      "deleted": false,
      "color": "5870dd",
      "real_name": "Matthew Don",
      "tz": "Asia/Bangkok",
      "tz_label": "Indochina Time",
      "tz_offset": 25200,
      "profile": {
        "title": "",
        "phone": "",
        "skype": "",
        "real_name": "Matthew Don",
        "real_name_normalized": "Matthew Don",
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
        "email": "matthewdonsemail@gmail.com",
        "huddle_state": "default_unset",
        "huddle_state_expiration_ts": 0,
        "first_name": "Matthew",
        "last_name": "Don",
        "status_text_canonical": "",
        "team": "T0C4VCD06MR"
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
