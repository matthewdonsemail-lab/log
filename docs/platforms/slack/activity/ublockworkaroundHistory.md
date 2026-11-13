# ublockworkaroundHistory

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | activity |
| Kind | query |
| doc_id | — |
| Path | `/api/ublockworkaround.history` |
| Sends | `------WebKitFormBoundaryMjuaJBgUANQquNXo
Content-Disposition: form-data; name` |
| Reads | `ok`, `events`, `has_more`, `total` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script38.js:771 anonymous`, `runs/inspect/20261103T065639_mattSlack/script35.js:275 anonymous` |
| rea | `ev_2f8dd806490806c59de0f0b61fac07f8b79263d795e0780144a6544292b6ea5e` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 6: goto /client/<teamId:1>/<channelId:1> | 1 | 200 | 305 ms | 6669 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/<teamId:1>/<channelId:1>: 200, 305 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689121.753",
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
    "------WebKitFormBoundaryMjuaJBgUANQquNXo\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundaryMjuaJBgUANQquNXo\r\nContent-Disposition: form-data; name=\"start\"\r\n\r\n1793689111.020700\r\n------WebKitFormBoundaryMjuaJBgUANQquNXo\r\nContent-Disposition: form-data; name=\"count\"\r\n\r\n2000\r\n------WebKitFormBoundaryMjuaJBgUANQquNXo\r\nContent-Disposition: form-… (1260 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "events": [],
  "has_more": false,
  "total": 0
}
```

<!-- facts:end -->

## What it does

Reads a history of events for a workaround feature in the client: it answered `ok: true`, `events: []`, `has_more: false`, `total: 0`, once on step 6 goto the DM (305 ms).

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`, actions ping, workspaces, chats, read, send, watch over `vendor/gabrielSlack`) never uses this endpoint; it is Slack's web client's own traffic, seen only because the `log inspect` AdsPower run on mattSlack loaded the page.

## What can go wrong

The one recorded call was 200. An `ok: false` would only leave that client panel empty; our engine does not read it.
