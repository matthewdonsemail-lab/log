# calendarGetInstalledCalendars

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | activity |
| Kind | query |
| doc_id | — |
| Path | `/api/calendar.getInstalledCalendars` |
| Sends | `------WebKitFormBoundary4csPyWBwp64aQvbi
Content-Disposition: form-data; name`, `------WebKitFormBoundaryFULBM2u5B524L4yN
Content-Disposition: form-data; name` |
| Reads | `ok`, `gcal.is_installed`, `gcal.app_id`, `gcal.is_manageable_by_user`, `ocal.is_installed`, `ocal.app_id`, `ocal.is_manageable_by_user` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script35.js:275 anonymous` |
| rea | `ev_27798859e318688f0df5a046e58941768c2b8f864bb91f7e6ee7b291e3ad1a70` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 309 ms | 7637 ms | — |
| inspect | step 6: goto /client/<teamId:1>/<channelId:1> | 1 | 200 | 415 ms | 5526 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 309 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689064.912",
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
    "------WebKitFormBoundary4csPyWBwp64aQvbi\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundary4csPyWBwp64aQvbi\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\ncalendar-get-installed-calendars\r\n------WebKitFormBoundary4csPyWBwp64aQvbi\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundary4csPyWBwp64aQvbi\r\nCon… (602 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "gcal": {
    "is_installed": false,
    "app_id": "ADZ494LHY",
    "is_manageable_by_user": true
  },
  "ocal": {
    "is_installed": false,
    "app_id": "AFV5ECLBZ",
    "is_manageable_by_user": true
  }
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/<teamId:1>/<channelId:1>: 200, 415 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689120.132",
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
    "------WebKitFormBoundaryFULBM2u5B524L4yN\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundaryFULBM2u5B524L4yN\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\ncalendar-get-installed-calendars\r\n------WebKitFormBoundaryFULBM2u5B524L4yN\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundaryFULBM2u5B524L4yN\r\nCon… (602 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "gcal": {
    "is_installed": false,
    "app_id": "ADZ494LHY",
    "is_manageable_by_user": true
  },
  "ocal": {
    "is_installed": false,
    "app_id": "AFV5ECLBZ",
    "is_manageable_by_user": true
  }
}
```

<!-- facts:end -->

## What it does

Asks whether the Google Calendar and Outlook Calendar apps are installed in the workspace: it answered `ok: true` with `gcal` (app `ADZ494LHY`) and `ocal` (app `AFV5ECLBZ`), both `is_installed: false` and `is_manageable_by_user: true`, on step 4 goto /client (309 ms) and step 6 goto the DM (415 ms).

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`, actions ping, workspaces, chats, read, send, watch over `vendor/gabrielSlack`) never uses this endpoint; it is Slack's web client's own traffic, seen only because the `log inspect` AdsPower run on mattSlack loaded the page.

## What can go wrong

Both calls were 200 with `ok: true`. An `ok: false` would only change what the client's calendar prompts show; nothing in our actions depends on it.
