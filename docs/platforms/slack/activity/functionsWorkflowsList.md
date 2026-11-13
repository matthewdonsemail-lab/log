# functionsWorkflowsList

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | activity |
| Kind | query |
| doc_id | — |
| Path | `/api/functions.workflows.list` |
| Sends | `------WebKitFormBoundary2iFvIWWrbXlytcSn
Content-Disposition: form-data; name`, `------WebKitFormBoundary7GK1BazDUblJPGh5
Content-Disposition: form-data; name` |
| Reads | `ok`, `workflows`, `workflow_triggers`, `response_metadata.next_cursor` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script29.js:168 statement`, `runs/inspect/20261103T065639_mattSlack/script3.js:2976 statement`, `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous` |
| rea | `ev_d937ea767a7267c2663cc1ef22506520d6e297b8d2e8d426a4189b01ea42679a` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 539 ms | 7089 ms | — |
| inspect | step 6: goto /client/<teamId:1>/<channelId:1> | 1 | 200 | 288 ms | 5027 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 539 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689064.897",
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
    "------WebKitFormBoundary2iFvIWWrbXlytcSn\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundary2iFvIWWrbXlytcSn\r\nContent-Disposition: form-data; name=\"limit\"\r\n\r\n50\r\n------WebKitFormBoundary2iFvIWWrbXlytcSn\r\nContent-Disposition: form-data; name=\"filter_options\"\r\n\r\n{\"name\":\"\"}\r\n------WebKitFormBoundary2iFvIWWrbXlytcSn\r\nContent-Disposition: form… (1050 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "workflows": [],
  "workflow_triggers": {},
  "response_metadata": {
    "next_cursor": ""
  }
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/<teamId:1>/<channelId:1>: 200, 288 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689120.112",
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
    "------WebKitFormBoundary7GK1BazDUblJPGh5\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundary7GK1BazDUblJPGh5\r\nContent-Disposition: form-data; name=\"limit\"\r\n\r\n50\r\n------WebKitFormBoundary7GK1BazDUblJPGh5\r\nContent-Disposition: form-data; name=\"filter_options\"\r\n\r\n{\"name\":\"\"}\r\n------WebKitFormBoundary7GK1BazDUblJPGh5\r\nContent-Disposition: form… (1050 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "workflows": [],
  "workflow_triggers": {},
  "response_metadata": {
    "next_cursor": ""
  }
}
```

<!-- facts:end -->

## What it does

Lists Workflow Builder functions for the workspace: it answered `ok: true`, `workflows: []`, `workflow_triggers: {}` and an empty `response_metadata.next_cursor`, on step 4 goto /client (539 ms) and step 6 goto the DM (288 ms).

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`, actions ping, workspaces, chats, read, send, watch over `vendor/gabrielSlack`) never uses this endpoint; it is Slack's web client's own traffic, seen only because the `log inspect` AdsPower run on mattSlack loaded the page. The empty `next_cursor` means there was nothing to page.

## What can go wrong

Both calls were 200. An `ok: false` would only leave the client's workflow shortcuts empty; our actions never wait on it.
