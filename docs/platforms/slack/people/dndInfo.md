# dndInfo

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | people |
| Kind | query |
| doc_id | — |
| Path | `/api/dnd.info` |
| Sends | `------WebKitFormBoundary7oAG8IKB2BS6iLDC
Content-Disposition: form-data; name`, `------WebKitFormBoundarybrp71Cf9YHZ1gPSV
Content-Disposition: form-data; name` |
| Reads | `ok`, `dnd_enabled`, `next_dnd_start_ts`, `next_dnd_end_ts`, `dnd_profile_status.type`, `snooze_enabled` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous`, `runs/inspect/20261103T065639_mattSlack/script29.js:168 "3P8c"`, `runs/inspect/20261103T065639_mattSlack/script3.js:2976 "3P8c"` |
| rea | `ev_9fcaf9c15ef062642e32d15435406fc3694dd7d4085eff1e354774b9beb7340f` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 300 ms | 8964 ms | — |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 1 | 200 | 299 ms | 7973 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 300 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689066.720",
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
    "------WebKitFormBoundary7oAG8IKB2BS6iLDC\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundary7oAG8IKB2BS6iLDC\r\nContent-Disposition: form-data; name=\"user\"\r\n\r\nU0C4L7RF7HD\r\n------WebKitFormBoundary7oAG8IKB2BS6iLDC\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetchAndUpsertDndForUsers-getDndTimesFor:self\r\n------WebKitFormBoundary7oAG8I… (717 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "dnd_enabled": true,
  "next_dnd_start_ts": 1793689066,
  "next_dnd_end_ts": 9999999999,
  "dnd_profile_status": {
    "type": "focus_mode"
  },
  "snooze_enabled": false
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 299 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689123.056",
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
    "------WebKitFormBoundarybrp71Cf9YHZ1gPSV\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundarybrp71Cf9YHZ1gPSV\r\nContent-Disposition: form-data; name=\"user\"\r\n\r\nU0C4L7RF7HD\r\n------WebKitFormBoundarybrp71Cf9YHZ1gPSV\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetchAndUpsertDndForUsers-getDndTimesFor:self\r\n------WebKitFormBoundarybrp71C… (717 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "dnd_enabled": true,
  "next_dnd_start_ts": 1793689123,
  "next_dnd_end_ts": 9999999999,
  "dnd_profile_status": {
    "type": "focus_mode"
  },
  "snooze_enabled": false
}
```

<!-- facts:end -->

## What it does

Reads the account's own do-not-disturb state: `dnd_enabled`, `next_dnd_start_ts`, `next_dnd_end_ts`, `snooze_enabled`. Fired 9.0 s into step 4 (`goto /client`, 300 ms) and 8.0 s into step 6 (299 ms), both 200.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`) works through `GabrielCore` on curl_cffi, which signs in with the `d` cookie and calls only the web API methods it needs, so this is Slack's own web client boot traffic that `log inspect` recorded. Gabriel's client uses `dnd.teamInfo` for presence tracking, and the engine does not use that client.

## What can go wrong

Like every Slack web API answer it carries `ok`; with `ok: false` the `error` field says why (for example `not_authed`, `invalid_auth`, `ratelimited`). Both recorded answers were 200 without error.
