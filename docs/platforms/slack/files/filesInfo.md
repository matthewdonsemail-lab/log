# filesInfo

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | files |
| Kind | query |
| doc_id | — |
| Path | `/api/files.info` |
| Sends | `------WebKitFormBoundaryfB0CNISI5mABPHiN
Content-Disposition: form-data; name` |
| Reads | `ok`, `file.id`, `file.created`, `file.timestamp`, `file.mimetype`, `file.filetype`, `file.pretty_type`, `file.user`, `file.user_team`, `file.editable`, `file.size`, `file.mode` and 28 more |
| Called from | `runs/inspect/20261103T065639_mattSlack/script29.js:146 ONID`, `runs/inspect/20261103T065639_mattSlack/script3.js:2954 ONID`, `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous` |
| rea | `ev_12ba4cbff16bcfff03c965806d7b9ef2b8cd4fa735ec9b7a8a1cf8c7cfa9bb71` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 6: goto /client/<teamId:2>/<channelId:1> | 1 | 200 | 346 ms | 6930 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/<teamId:2>/<channelId:1>: 200, 346 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689122.015",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "aVvVPXA0sak",
    "slack_route": "<teamId:2>",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryfB0CNISI5mABPHiN\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundaryfB0CNISI5mABPHiN\r\nContent-Disposition: form-data; name=\"file\"\r\n\r\n<fileId:1>\r\n------WebKitFormBoundaryfB0CNISI5mABPHiN\r\nContent-Disposition: form-data; name=\"page\"\r\n\r\n1\r\n------WebKitFormBoundaryfB0CNISI5mABPHiN\r\nContent-Disposition: form-data; name=<name:2> (1085 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "file": {
    "id": "<fileId:1>",
    "created": 1793354470,
    "timestamp": 1793354470,
    "mimetype": "application/vnd.slack-docs",
    "filetype": "quip",
    "pretty_type": "Canvas",
    "user": "<userId:1>",
    "user_team": "<teamId:1>",
    "editable": true,
    "size": 0,
    "mode": "quip",
    "is_external": false,
    "external_type": "",
    "is_public": false,
    "public_url_shared": false,
    "display_as_bot": false,
    "username": "",
    "name": "<name:1>",
    "title": "Untitled",
    "is_modified_by_ai": false,
    "url_private": "<mediaUrl>",
    "url_private_download": "<mediaUrl>",
    "permalink": "https://<workspace:1>.slack.com/docs/<teamId:1>/<fileId:1>",
    "permalink_public": "<mediaUrl>",
    "url_static_preview": "https://<workspace:1>.slack.com/docs/<teamId:1>/<fileId:1>/mobile",
    "quip_thread_id": "YZR9AAL1PgV",
    "update_notification": null,
    "source_team": "<teamId:1>",
    "favorites": [],
    "is_starred": false,
    "skipped_shares": true,
    "is_restricted_sharing_enabled": false,
    "has_rich_preview": false,
    "file_access": "visible",
    "access": "write",
    "org_or_workspace_access": "none",
    "canvas_creator_id": "<userId:1>",
    "team_pref_version_history_enabled": true,
    "canvas_printing_enabled": true,
    "is_ai_suggested": false,
    "editors": [],
    "show_badge": false,
    "comments_count": 0
  },
  "comments": [],
  "paging": {
    "count": 0,
    "total": 0,
    "page": 1,
    "pages": 0
  }
}
```

<!-- facts:end -->

## What it does

Fetches one file object (`file.id`, `file.mimetype`, `file.filetype`, `file.size`, `file.user`, `file.mode`...): it fired once, 6.9 s into step 6 (goto the DM), 346 ms, 200.

## What our machine does with it

The engine does not call it: `file_of` in `python/slackApi/engine.py` uses the `url_private_download` or `url_private` already on the message's file (from `conversations.history` or the websocket) and fetches it with `fetch_authenticated`. The vendored `gabriel/client/files.py` has `files.info` but nothing in the engine uses it.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. `file_not_found` would mean the file was deleted; a send or read in log-cli does not depend on it.
