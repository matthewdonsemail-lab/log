# aiAppsList

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | activity |
| Kind | query |
| doc_id | — |
| Path | `/api/aiApps.list` |
| Sends | `------WebKitFormBoundaryPdFYG5OwqPV7O3jO
Content-Disposition: form-data; name`, `------WebKitFormBoundaryfIdWh1Bx3dddahuY
Content-Disposition: form-data; name` |
| Reads | `ok`, `apps`, `cache_ts` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous`, `runs/inspect/20261103T065639_mattSlack/script125.js:52 anonymous`, `runs/inspect/20261103T065639_mattSlack/script125.js:37 anonymous`, `runs/inspect/20261103T065639_mattSlack/script29.js:146 "2bB/"` |
| rea | `ev_d147c11b5443c862cf8014421fbb8a3ea0c08600e006a5d5f359fe61cd77d96d` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 354 ms | 7586 ms | — |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 1 | 200 | 402 ms | 5525 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 354 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689064.909",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryPdFYG5OwqPV7O3jO\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryPdFYG5OwqPV7O3jO\r\nContent-Disposition: form-data; name=\"exclude_sidekick\"\r\n\r\ntrue\r\n------WebKitFormBoundaryPdFYG5OwqPV7O3jO\r\nContent-Disposition: form-data; name=\"limit\"\r\n\r\n20\r\n------WebKitFormBoundaryPdFYG5OwqPV7O3jO\r\nContent-Disposition: form-data… (807 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "apps": [],
  "cache_ts": 1793686321
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 402 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689120.129",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "aVvVPXA0sak",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryfIdWh1Bx3dddahuY\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryfIdWh1Bx3dddahuY\r\nContent-Disposition: form-data; name=\"exclude_sidekick\"\r\n\r\ntrue\r\n------WebKitFormBoundaryfIdWh1Bx3dddahuY\r\nContent-Disposition: form-data; name=\"limit\"\r\n\r\n20\r\n------WebKitFormBoundaryfIdWh1Bx3dddahuY\r\nContent-Disposition: form-data… (807 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "apps": [],
  "cache_ts": 1793686321
}
```

<!-- facts:end -->

## What it does

Lists the AI apps available in the workspace for the client's sidebar: it sent `exclude_sidekick: true` and `limit: 20` and answered `ok: true`, `apps: []` and a `cache_ts` of 1793686321, on step 4 goto /client (354 ms) and step 6 goto the DM (402 ms).

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`, actions ping, workspaces, chats, read, send, watch over `vendor/gabrielSlack`) never uses this endpoint; it is Slack's web client's own traffic, seen only because the `log inspect` AdsPower run on mattSlack loaded the page. An empty `apps` list means the workspace has none installed.

## What can go wrong

Both calls were 200. An `ok: false` would only hide the AI apps in the client; our engine reads none of it.
