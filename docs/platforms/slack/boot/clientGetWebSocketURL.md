# clientGetWebSocketURL

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | boot |
| Kind | query |
| doc_id | — |
| Path | `/api/client.getWebSocketURL` |
| Sends | `------WebKitFormBoundary7CeHsXHg0E6AeAEi
Content-Disposition: form-data; name` |
| Reads | `ok`, `primary_websocket_url`, `fallback_websocket_url`, `ttl_seconds`, `routing_context` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script289.js:1370 socketUrl` |
| rea | `ev_51ccc56eec661692e09ef6bbff958d9df505a7e706f58b323b19ae855768c702` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 556 ms | 7069 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 556 ms

Sent:

```json
{
  "query": {
    "_x_id": "noversion-1793689064.879",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_version_ts": "1793684253",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundary7CeHsXHg0E6AeAEi\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundary7CeHsXHg0E6AeAEi\r\nContent-Disposition: form-data; name=\"_x_app_name\"\r\n\r\nclient\r\n------WebKitFormBoundary7CeHsXHg0E6AeAEi\r\nContent-Disposition: form-data; name=\"_x_sonic\"\r\n\r\ntrue\r\n------WebKitFormBoundary7CeHsXHg0E6AeAEi--\r\n"
  }
}
```

Answered:

```json
{
  "ok": true,
  "primary_websocket_url": "wss://wss-primary.slack.com/",
  "fallback_websocket_url": "wss://wss-backup.slack.com/",
  "ttl_seconds": 604800,
  "routing_context": "<teamId:1>-4"
}
```

<!-- facts:end -->

## What it does

Asks where to open the realtime socket: it answered `primary_websocket_url: wss://wss-primary.slack.com/`, `fallback_websocket_url: wss://wss-backup.slack.com/`, `ttl_seconds: 604800` and `routing_context: <teamId:1>-4`. Fired 7.1 s into step 4 (`goto /client`), 556 ms, 200.

## What our machine does with it

Not called, but its answer matches what the `watch` action opens: gabriel builds the socket address itself from the fixed `ws_base` (`wss://wss-primary.slack.com/`) plus query parameters (`vendor/gabrielSlack/gabriel/core/ws.py`, `core/metadata.py`) and follows the `reconnect_url` frames Slack sends, so the engine never asks this endpoint (`python/slackApi/engine.py`, `watch`).

## What can go wrong

If Slack moved the primary host, the fixed base would stop connecting and the watch would fail on the socket rather than on this call; `ok: false` here would carry an `error` such as `not_authed`. The recorded answer was 200 with `ok: true`.
