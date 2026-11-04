# usersProfileGet

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | people |
| Kind | query |
| doc_id | — |
| Path | `/api/users.profile.get` |
| Sends | `------WebKitFormBoundary5uS3k1bdJfS6iYn3
Content-Disposition: form-data; name`, `------WebKitFormBoundaryRYtYhXF3bL7Xrnmv
Content-Disposition: form-data; name` |
| Reads | `ok`, `profile.title`, `profile.phone`, `profile.skype`, `profile.real_name`, `profile.real_name_normalized`, `profile.display_name`, `profile.display_name_normalized`, `profile.fields`, `profile.status_text`, `profile.status_emoji`, `profile.status_emoji_display_info` and 18 more |
| Called from | `runs/inspect/20261103T065639_mattSlack/script3.js:2877 statement`, `runs/inspect/20261103T065639_mattSlack/script35.js:275 anonymous` |
| rea | `ev_faa9f7318ff0f6d50c372eeec541ae040c0c16f852fe8046533df4f9dd1da0c8` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 7: pageText | 1 | 200 | 288 ms | 13276 ms | — |
| inspect | POST 0 /beacon/error (383 ms) | 1 | 200 | 286 ms | 17690 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 7: pageText: 200, 288 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689156.960",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "aVvVPXA0sak",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundary5uS3k1bdJfS6iYn3\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundary5uS3k1bdJfS6iYn3\r\nContent-Disposition: form-data; name=\"user\"\r\n\r\nU0C4L7RF7HD\r\n------WebKitFormBoundary5uS3k1bdJfS6iYn3\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nwith-call-menu\r\n------WebKitFormBoundary5uS3k1bdJfS6iYn3\r\nContent-Disposition… (686 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "profile": {
    "title": "",
    "phone": "",
    "skype": "",
    "real_name": "Matthew Don",
    "real_name_normalized": "Matthew Don",
    "display_name": "",
    "display_name_normalized": "",
    "fields": {},
    "status_text": "",
    "status_emoji": "",
    "status_emoji_display_info": [],
    "status_expiration": 0,
    "status_clear_on_focus_end": false,
    "avatar_hash": "c4e891e2ba88",
    "image_original": "https://avatars.slack-edge.com/2026-09-28/12175321721380_c4e891e2ba88dcc86e9f_original.png",
    "is_custom_image": true,
    "email": "matthewdonsemail@gmail.com",
    "huddle_state": "default_unset",
    "huddle_state_expiration_ts": 0,
    "first_name": "Matthew",
    "last_name": "Don",
    "image_24": "https://avatars.slack-edge.com/2026-09-28/12175321721380_c4e891e2ba88dcc86e9f_24.png",
    "image_32": "https://avatars.slack-edge.com/2026-09-28/12175321721380_c4e891e2ba88dcc86e9f_32.png",
    "image_48": "https://avatars.slack-edge.com/2026-09-28/12175321721380_c4e891e2ba88dcc86e9f_48.png",
    "image_72": "https://avatars.slack-edge.com/2026-09-28/12175321721380_c4e891e2ba88dcc86e9f_72.png",
    "image_192": "https://avatars.slack-edge.com/2026-09-28/12175321721380_c4e891e2ba88dcc86e9f_192.png",
    "image_512": "https://avatars.slack-edge.com/2026-09-28/12175321721380_c4e891e2ba88dcc86e9f_512.png",
    "image_1024": "https://avatars.slack-edge.com/2026-09-28/12175321721380_c4e891e2ba88dcc86e9f_1024.png",
    "status_text_canonical": ""
  }
}
```

**runs/inspect/20261103T065639_mattSlack**, POST 0 /beacon/error (383 ms): 200, 286 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689505.285",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "qDE7gQoj5kY",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryRYtYhXF3bL7Xrnmv\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryRYtYhXF3bL7Xrnmv\r\nContent-Disposition: form-data; name=\"user\"\r\n\r\nU0C4L7RF7HD\r\n------WebKitFormBoundaryRYtYhXF3bL7Xrnmv\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nwith-call-menu\r\n------WebKitFormBoundaryRYtYhXF3bL7Xrnmv\r\nContent-Disposition… (686 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "profile": {
    "title": "",
    "phone": "",
    "skype": "",
    "real_name": "Matthew Don",
    "real_name_normalized": "Matthew Don",
    "display_name": "",
    "display_name_normalized": "",
    "fields": {},
    "status_text": "",
    "status_emoji": "",
    "status_emoji_display_info": [],
    "status_expiration": 0,
    "status_clear_on_focus_end": false,
    "avatar_hash": "c4e891e2ba88",
    "image_original": "https://avatars.slack-edge.com/2026-09-28/12175321721380_c4e891e2ba88dcc86e9f_original.png",
    "is_custom_image": true,
    "email": "matthewdonsemail@gmail.com",
    "huddle_state": "default_unset",
    "huddle_state_expiration_ts": 0,
    "first_name": "Matthew",
    "last_name": "Don",
    "image_24": "https://avatars.slack-edge.com/2026-09-28/12175321721380_c4e891e2ba88dcc86e9f_24.png",
    "image_32": "https://avatars.slack-edge.com/2026-09-28/12175321721380_c4e891e2ba88dcc86e9f_32.png",
    "image_48": "https://avatars.slack-edge.com/2026-09-28/12175321721380_c4e891e2ba88dcc86e9f_48.png",
    "image_72": "https://avatars.slack-edge.com/2026-09-28/12175321721380_c4e891e2ba88dcc86e9f_72.png",
    "image_192": "https://avatars.slack-edge.com/2026-09-28/12175321721380_c4e891e2ba88dcc86e9f_192.png",
    "image_512": "https://avatars.slack-edge.com/2026-09-28/12175321721380_c4e891e2ba88dcc86e9f_512.png",
    "image_1024": "https://avatars.slack-edge.com/2026-09-28/12175321721380_c4e891e2ba88dcc86e9f_1024.png",
    "status_text_canonical": ""
  }
}
```

<!-- facts:end -->

## What it does

Reads one person's profile (sent `user: U0C4L7RF7HD`, reason `with-call-menu`) and answered `ok: true` with `profile.real_name: Matthew Don`, empty status and title, avatar URLs and email. It fired 13.3 s into step 7 (`pageText`, 288 ms) and again with the page's `/beacon/error` POST (286 ms), both 200.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`) works through `GabrielCore` on curl_cffi, which signs in with the `d` cookie and calls only the web API methods it needs, so this is Slack's own web client boot traffic that `log inspect` recorded. The engine looks a person up with `users.info` (`names_for`), not `users.profile.get`, and keeps only the display name.

## What can go wrong

Like every Slack web API answer it carries `ok`; with `ok: false` the `error` field says why (for example `not_authed`, `invalid_auth`, `ratelimited`). Both recorded answers were 200.
