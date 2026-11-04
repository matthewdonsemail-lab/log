# usersCustomStatusList

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | people |
| Kind | query |
| doc_id | — |
| Path | `/api/users.customStatus.list` |
| Sends | `------WebKitFormBoundary1zkEhGmC9bzRFJ7g
Content-Disposition: form-data; name`, `------WebKitFormBoundary471ZzVBFskZF4LKQ
Content-Disposition: form-data; name` |
| Reads | `ok`, `statuses`, `scheduled_statuses`, `custom_sections` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script35.js:275 anonymous` |
| rea | `ev_9b329f109ece119a5ee9eaa1772ab1fafca7445da1e77b7a6358c53385f505b9` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 296 ms | 8933 ms | — |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 1 | 200 | 287 ms | 6713 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 296 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689066.010",
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
    "------WebKitFormBoundary1zkEhGmC9bzRFJ7g\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundary1zkEhGmC9bzRFJ7g\r\nContent-Disposition: form-data; name=\"statuses_count_per_section\"\r\n\r\n0\r\n------WebKitFormBoundary1zkEhGmC9bzRFJ7g\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetchCustomStatusOnReconnect\r\n------WebKitFormBoundary1zkEhGmC9bz… (712 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "statuses": [],
  "scheduled_statuses": [],
  "custom_sections": []
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 287 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689121.760",
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
    "------WebKitFormBoundary471ZzVBFskZF4LKQ\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundary471ZzVBFskZF4LKQ\r\nContent-Disposition: form-data; name=\"statuses_count_per_section\"\r\n\r\n0\r\n------WebKitFormBoundary471ZzVBFskZF4LKQ\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetchCustomStatusOnReconnect\r\n------WebKitFormBoundary471ZzVBFskZ… (712 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "statuses": [],
  "scheduled_statuses": [],
  "custom_sections": []
}
```

<!-- facts:end -->

## What it does

Lists the account's saved custom statuses (`statuses`, `scheduled_statuses`, `custom_sections`) for the status menu: fired 8.9 s into step 4 (`goto /client`, 296 ms) and 6.7 s into step 6 (287 ms), both 200.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`) works through `GabrielCore` on curl_cffi, which signs in with the `d` cookie and calls only the web API methods it needs, so this is Slack's own web client boot traffic that `log inspect` recorded.

## What can go wrong

Like every Slack web API answer it carries `ok`; with `ok: false` the `error` field says why (for example `not_authed`, `invalid_auth`, `ratelimited`). Both recorded answers were 200 without error.
