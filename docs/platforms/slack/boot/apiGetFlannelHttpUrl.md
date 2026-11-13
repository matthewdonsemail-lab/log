# apiGetFlannelHttpUrl

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | boot |
| Kind | query |
| doc_id | — |
| Path | `/api/api.getFlannelHttpUrl` |
| Sends | `------WebKitFormBoundaryV0mPpAu74aTkR4GS
Content-Disposition: form-data; name`, `------WebKitFormBoundary37lIYZCOjIAKzHLE
Content-Disposition: form-data; name` |
| Reads | `ok`, `error`, `url`, `ttl_seconds` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script29.js:153 oYkW`, `runs/inspect/20261103T065639_mattSlack/script3.js:2961 oYkW`, `runs/inspect/20261103T065639_mattSlack/script125.js:38 anonymous` |
| rea | `ev_7ddb64541b988ce0d78e2608d31cf4d1894a133b795174337daaf20c71b573f4` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | scroll: +414px in 10 wheel steps, 375 ms | 1 | 200 | 280 ms | 4106 ms | — |
| inspect | step 4: goto /client | 1 | 200 | 564 ms | 7059 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, scroll: +414px in 10 wheel steps, 375 ms: 200, 280 ms

Sent:

```json
{
  "query": {
    "_x_id": "noversion-1793689041.233",
    "slack_route": "<teamId:1>",
    "_x_version_ts": "noversion",
    "fp": "57",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryV0mPpAu74aTkR4GS\r\nContent-Disposition: form-data; name": "\"include_external_workspaces\"\r\n\r\ntrue\r\n------WebKitFormBoundaryV0mPpAu74aTkR4GS\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nclient-needs-valid-flannel-url\r\n------WebKitFormBoundaryV0mPpAu74aTkR4GS\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundaryV0mPpAu74aTkR4GS--\r\n"
  }
}
```

Answered:

```json
{
  "ok": false,
  "error": "not_authed"
}
```

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 564 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689064.869",
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
    "------WebKitFormBoundary37lIYZCOjIAKzHLE\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundary37lIYZCOjIAKzHLE\r\nContent-Disposition: form-data; name=\"include_external_workspaces\"\r\n\r\ntrue\r\n------WebKitFormBoundary37lIYZCOjIAKzHLE\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nclient-needs-valid-flannel-url\r\n------WebKitFormBoundary37lIY… (718 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "url": "https://edgeapi.slack.com/cache/<teamId:1>",
  "ttl_seconds": 604800
}
```

<!-- facts:end -->

## What it does

Asks Slack for the URL of its cache service (`edgeapi.slack.com/cache/<team>`) and how long it is good for (`ttl_seconds`: 604800, a week). It was seen twice: during the scroll step it answered `ok: false, error: not_authed` (280 ms), and in step 4 (`goto /client`, 564 ms) it answered `ok: true` with the URL.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`) works through `GabrielCore` on curl_cffi, which signs in with the `d` cookie and calls only the web API methods it needs, so this is Slack's own web client boot traffic that `log inspect` recorded. The engine's EdgeAPI base is fixed in gabriel (`edge_api_base` = `https://edgeapi.slack.com/cache/`, `vendor/gabrielSlack/gabriel/core/metadata.py`) and not asked for here.

## What can go wrong

`not_authed` was answered once, at the scroll step before the client had finished loading its token, and the page still booted, so it was transient on Slack's side. A permanent `not_authed` would mean the session no longer signs in, which the engine reports as `sessionDead`.
