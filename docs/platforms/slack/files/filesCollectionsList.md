# filesCollectionsList

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | files |
| Kind | query |
| doc_id | — |
| Path | `/api/files.collections.list` |
| Sends | `------WebKitFormBoundary83o0XpQ5oIp3GdrA
Content-Disposition: form-data; name`, `------WebKitFormBoundaryhaL9E5FkqfRpLBCW
Content-Disposition: form-data; name` |
| Reads | `ok`, `collections` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script35.js:275 anonymous` |
| rea | `ev_f05c61f401ab56ba3699a78c0655e8f6ebc87a000b70cc91d182848f77e516a0` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 357 ms | 7590 ms | — |
| inspect | step 6: goto /client/<teamId:1>/<channelId:1> | 1 | 200 | 416 ms | 5525 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 357 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689064.910",
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
    "------WebKitFormBoundary83o0XpQ5oIp3GdrA\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundary83o0XpQ5oIp3GdrA\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetch_file_collections\r\n------WebKitFormBoundary83o0XpQ5oIp3GdrA\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundary83o0XpQ5oIp3GdrA\r\nContent-Dispo… (592 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "collections": [
    {
      "id": "Fs0C4WEY9N93",
      "name": "<name:1>",
      "position": "5000000000",
      "emoji": "",
      "type": "starred",
      "date_create": 1790614683,
      "date_update": 1790614683,
      "sort": "date_added",
      "is_collapsed": false,
      "files": []
    }
  ]
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/<teamId:1>/<channelId:1>: 200, 416 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689120.131",
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
    "------WebKitFormBoundaryhaL9E5FkqfRpLBCW\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundaryhaL9E5FkqfRpLBCW\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetch_file_collections\r\n------WebKitFormBoundaryhaL9E5FkqfRpLBCW\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundaryhaL9E5FkqfRpLBCW\r\nContent-Dispo… (592 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "collections": [
    {
      "id": "Fs0C4WEY9N93",
      "name": "<name:1>",
      "position": "5000000000",
      "emoji": "",
      "type": "starred",
      "date_create": 1790614683,
      "date_update": 1790614683,
      "sort": "date_added",
      "is_collapsed": false,
      "files": []
    }
  ]
}
```

<!-- facts:end -->

## What it does

Lists the viewer's file collections (`collections`): it fired at page load in step 4 (357 ms) and step 6 (416 ms), both 200.

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. A refusal would only leave the web client's Files section empty.
