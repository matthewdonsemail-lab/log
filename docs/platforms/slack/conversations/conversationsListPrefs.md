# conversationsListPrefs

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | conversations |
| Kind | query |
| doc_id | — |
| Path | `/api/conversations.listPrefs` |
| Sends | `------WebKitFormBoundaryiM5iEyrfZOXiWIYu
Content-Disposition: form-data; name`, `------WebKitFormBoundaryp6cSJxAhR2FMhpZV
Content-Disposition: form-data; name`, `------WebKitFormBoundaryW4eEfk2QZRt46dFF
Content-Disposition: form-data; name` |
| Reads | `ok`, `prefs.can_huddle`, `prefs.can_upload_files`, `prefs.enable_at_channel`, `prefs.space_icon`, `prefs.channel_canvas_summary`, `prefs.space_is_primary`, `prefs.space_file_id`, `prefs.space_open_by_default`, `prefs.who_can_post`, `prefs.can_thread`, `prefs.canvas_share_status` and 3 more |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous` |
| rea | `ev_ece15874928453e39fcf14aae0aedbc39be3079aa0487749047b787f47d63b8f` |

Seen 3 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 305 ms | 8175 ms | — |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 1 | 200 | 291 ms | 6873 ms | — |
| inspect | step 16: press Control+a | 1 | 200 | 332 ms | 15112 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 305 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689065.851",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryiM5iEyrfZOXiWIYu\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryiM5iEyrfZOXiWIYu\r\nContent-Disposition: form-data; name=\"channel\"\r\n\r\nC0C4L7RSTGX\r\n------WebKitFormBoundaryiM5iEyrfZOXiWIYu\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nclient_redux_store\r\n------WebKitFormBoundaryiM5iEyrfZOXiWIYu\r\nContent-Disp… (693 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "prefs": {
    "can_huddle": true,
    "can_upload_files": true,
    "enable_at_channel": true,
    "space_icon": "",
    "channel_canvas_summary": "",
    "space_is_primary": false,
    "space_file_id": "",
    "space_open_by_default": false,
    "who_can_post": {
      "type": [
        "ra"
      ]
    },
    "can_thread": {
      "type": [
        "ra"
      ]
    },
    "canvas_share_status": "can_share",
    "list_share_status": "can_share",
    "shared_channel_invite_requested": false
  }
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 291 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689121.958",
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
    "------WebKitFormBoundaryp6cSJxAhR2FMhpZV\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryp6cSJxAhR2FMhpZV\r\nContent-Disposition: form-data; name=\"channel\"\r\n\r\nD0C8VAE7REU\r\n------WebKitFormBoundaryp6cSJxAhR2FMhpZV\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nclient_redux_store\r\n------WebKitFormBoundaryp6cSJxAhR2FMhpZV\r\nContent-Disp… (693 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "prefs": {
    "can_huddle": true,
    "can_upload_files": true,
    "enable_at_channel": true,
    "space_icon": "",
    "channel_canvas_summary": "",
    "space_is_primary": false,
    "space_file_id": "",
    "space_open_by_default": false,
    "who_can_post": {
      "type": [
        "ra"
      ]
    },
    "can_thread": {
      "type": [
        "ra"
      ]
    },
    "canvas_share_status": "can_share",
    "list_share_status": "can_share",
    "external_awareness_context_bar": "DEFAULT",
    "shared_channel_invite_requested": false
  }
}
```

**runs/inspect/20261103T065639_mattSlack**, step 16: press Control+a: 200, 332 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689528.023",
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
    "------WebKitFormBoundaryW4eEfk2QZRt46dFF\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryW4eEfk2QZRt46dFF\r\nContent-Disposition: form-data; name=\"channel\"\r\n\r\nC0CDBB09HT5\r\n------WebKitFormBoundaryW4eEfk2QZRt46dFF\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nclient_redux_store\r\n------WebKitFormBoundaryW4eEfk2QZRt46dFF\r\nContent-Disp… (693 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "prefs": {
    "can_huddle": true,
    "can_upload_files": true,
    "enable_at_channel": true,
    "space_icon": "",
    "channel_canvas_summary": "",
    "space_is_primary": false,
    "space_file_id": "",
    "space_open_by_default": false,
    "who_can_post": {
      "type": [
        "ra"
      ]
    },
    "can_thread": {
      "type": [
        "ra"
      ]
    },
    "canvas_share_status": "can_share",
    "list_share_status": "can_share",
    "external_awareness_context_bar": "DEFAULT",
    "shared_channel_invite_requested": false
  }
}
```

<!-- facts:end -->

## What it does

Reads a channel's preferences and posting rules (`prefs.who_can_post`, `can_thread`, `can_huddle`, `can_upload_files`, `enable_at_channel`, canvas fields): it fired in step 4 (305 ms), step 6 (291 ms, after opening the DM) and step 16 (press Control+a, 332 ms), all 200.

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client. The engine sends with `chat.postMessage` and relies on Slack's own answer, never on these prefs.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. If a chat's prefs said only some people may post, a send there would come back `ok: false` from `chat.postMessage` (the engine reports `slackRefused` and stops, rule 94); this read would not.
