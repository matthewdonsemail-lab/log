# subscriptionsThreadGet

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | messages |
| Kind | query |
| doc_id | — |
| Path | `/api/subscriptions.thread.get` |
| Sends | `------WebKitFormBoundaryBc9uCNHsaN72M2Hp
Content-Disposition: form-data; name`, `------WebKitFormBoundaryjiFsRUgEucATBS7H
Content-Disposition: form-data; name`, `------WebKitFormBoundary4Drsl6JB4JCK4o5E
Content-Disposition: form-data; name`, `------WebKitFormBoundaryuTDJuZwHk6eOvWC4
Content-Disposition: form-data; name`, `------WebKitFormBoundaryUygUPHnlyUw6it8f
Content-Disposition: form-data; name` |
| Reads | `ok`, `subscriptions` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous`, `runs/inspect/20261103T065639_mattSlack/script29.js:146 z2QR`, `runs/inspect/20261103T065639_mattSlack/script3.js:2954 z2QR` |
| rea | `ev_a43314148da83fd9fe8fd728f37ab130d0765c5beffcd87246fa0be2eb978482` |

Seen 5 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 16: press Control+a | 5 | 200 | 290–302 ms | 86838–86850 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 16: press Control+a: 200, 290 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689599.759",
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
    "------WebKitFormBoundaryBc9uCNHsaN72M2Hp\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundaryBc9uCNHsaN72M2Hp\r\nContent-Disposition: form-data; name=\"channel\"\r\n\r\n<channelId:1>\r\n------WebKitFormBoundaryBc9uCNHsaN72M2Hp\r\nContent-Disposition: form-data; name=\"thread_ts\"\r\n\r\n1793425898.143889\r\n------WebKitFormBoundaryBc9uCNHsaN72M2Hp\r\nContent-Dispo… (814 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "subscriptions": [
    "1793425898.143889"
  ]
}
```

<!-- facts:end -->

## What it does

Asks which threads the viewer is following (`subscriptions`): it fired five times on step 16 (press Control+a), about 86.8 s in, 290 to 302 ms, all 200.

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client. The vendored gabrielSlack has `subscriptions.thread.*` writes, but the engine never calls them or this read.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. A refusal would only leave the web client's Threads view empty.
