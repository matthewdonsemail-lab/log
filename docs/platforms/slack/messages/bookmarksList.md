# bookmarksList

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | messages |
| Kind | query |
| doc_id | — |
| Path | `/api/bookmarks.list` |
| Sends | `------WebKitFormBoundarymIWIAcmxy6B9Gyo6
Content-Disposition: form-data; name`, `------WebKitFormBoundaryv1xTOdawMpoX4ADF
Content-Disposition: form-data; name` |
| Reads | `ok`, `bookmarks` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous`, `runs/inspect/20261103T065639_mattSlack/script3.js:2976 dCBi` |
| rea | `ev_40d3903db77a72ccaeaab50917039bb895fce5af28babe9b1304895404c96802` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 295 ms | 9356 ms | — |
| inspect | step 6: goto /client/<teamId:1>/<channelId:2> | 1 | 200 | 288 ms | 7924 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 295 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689066.782",
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
    "------WebKitFormBoundarymIWIAcmxy6B9Gyo6\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundarymIWIAcmxy6B9Gyo6\r\nContent-Disposition: form-data; name=\"channel\"\r\n\r\n<channelId:1>\r\n------WebKitFormBoundarymIWIAcmxy6B9Gyo6\r\nContent-Disposition: form-data; name=\"include_folders\"\r\n\r\ntrue\r\n------WebKitFormBoundarymIWIAcmxy6B9Gyo6\r\nContent-Disposition:… (932 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "bookmarks": []
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/<teamId:1>/<channelId:2>: 200, 288 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689123.009",
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
    "------WebKitFormBoundaryv1xTOdawMpoX4ADF\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundaryv1xTOdawMpoX4ADF\r\nContent-Disposition: form-data; name=\"channel\"\r\n\r\n<channelId:2>\r\n------WebKitFormBoundaryv1xTOdawMpoX4ADF\r\nContent-Disposition: form-data; name=\"include_folders\"\r\n\r\ntrue\r\n------WebKitFormBoundaryv1xTOdawMpoX4ADF\r\nContent-Disposition:… (932 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "bookmarks": []
}
```

<!-- facts:end -->

## What it does

Lists a channel's bookmarks (`bookmarks`): it fired in step 4 (295 ms) and step 6 (288 ms, for the opened DM), both 200.

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. A refusal would only hide the bookmarks bar in the web client.
