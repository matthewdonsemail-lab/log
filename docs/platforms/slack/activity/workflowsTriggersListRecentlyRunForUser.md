# workflowsTriggersListRecentlyRunForUser

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | activity |
| Kind | query |
| doc_id | — |
| Path | `/api/workflows.triggers.listRecentlyRunForUser` |
| Sends | `------WebKitFormBoundary2IUWVm8fAgMVaoCW
Content-Disposition: form-data; name`, `------WebKitFormBoundarygmu4A018S3LUAKlR
Content-Disposition: form-data; name` |
| Reads | `ok`, `recently_run_triggers`, `recently_run_triggers_with_timestamps` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script35.js:275 anonymous` |
| rea | `ev_dedefe8f5c9bf25865878532dacaef0267cd959144206d2bf7454178e4b7d09a` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 537 ms | 7085 ms | — |
| inspect | step 6: goto /client/<teamId:1>/<channelId:1> | 1 | 200 | 292 ms | 5023 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 537 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689064.894",
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
    "------WebKitFormBoundary2IUWVm8fAgMVaoCW\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundary2IUWVm8fAgMVaoCW\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetch_and_upsert_recently_run_triggers\r\n------WebKitFormBoundary2IUWVm8fAgMVaoCW\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundary2IUWVm8fAgMVaoC… (608 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "recently_run_triggers": [],
  "recently_run_triggers_with_timestamps": []
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/<teamId:1>/<channelId:1>: 200, 292 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689120.108",
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
    "------WebKitFormBoundarygmu4A018S3LUAKlR\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundarygmu4A018S3LUAKlR\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetch_and_upsert_recently_run_triggers\r\n------WebKitFormBoundarygmu4A018S3LUAKlR\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundarygmu4A018S3LUAKl… (608 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "recently_run_triggers": [],
  "recently_run_triggers_with_timestamps": []
}
```

<!-- facts:end -->

## What it does

Asks which workflow triggers the user ran recently: it answered `ok: true` with empty `recently_run_triggers` and `recently_run_triggers_with_timestamps`, on step 4 goto /client (537 ms) and step 6 goto the DM (292 ms).

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`, actions ping, workspaces, chats, read, send, watch over `vendor/gabrielSlack`) never uses this endpoint; it is Slack's web client's own traffic, seen only because the `log inspect` AdsPower run on mattSlack loaded the page.

## What can go wrong

Both calls were 200. An `ok: false` would only change the client's recent-workflows list; no run of ours depends on it.
