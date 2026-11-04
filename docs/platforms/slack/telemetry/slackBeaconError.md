# slackBeaconError

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | telemetry |
| Kind | endpoint |
| doc_id | — |
| Path | `slack.com/beacon/error` |
| Sends | `description`, `version`, `version_sha`, `error_json`, `team`, `user`, `session_id`, `visitor_cookie`, `sub_app_name`, `tracing_enabled_for_session`, `frontend_build_type`, `app_context`, `app_variant`, `is_service_worker_active` |
| Reads | — |
| Called from | `runs/inspect/20261103T065639_mattSlack/script125.js:37 anonymous`, `runs/inspect/20261103T065639_mattSlack/script125.js:102 setLocalePreference`, `runs/inspect/20261103T065639_mattSlack/script3.js:2878 anonymous`, `runs/inspect/20261103T065639_mattSlack/script29.js:200 mHed` |
| rea | `ev_bdfab10512b46ded775d22e8102fdb497797c1e0af64f1c1366855e7e9a17cfd` |

Seen 12 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 0 | 280 ms | 10949 ms | — |
| inspect | POST 0 /clog/track/ (0 ms) | 2 | 0 | 293–294 ms | 131–2435 ms | — |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 2 | 0 | 297–358 ms | 9826–12206 ms | — |
| inspect | step 14: press Enter | 6 | 0 | 370–383 ms | 36542–95968 ms | — |
| inspect | step 17: press Backspace | 1 | 0 | 335 ms | 18104 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 0, 280 ms

Sent:

```json
{
  "description": "Nov-03 13:57:48.757 AVDeviceService (?) [AVDeviceService] [ACQUISITION] [avds_1793689064791] Failed to get valid device list after 4 attempts",
  "version": "1793684253",
  "version_sha": "2c6eaecfe1c5bc5ec8c84737545fd1425e2efd1b",
  "error_json": {
    "subtype": "missing_subtype",
    "message": "Nov-03 13:57:48.757 AVDeviceService (?) [AVDeviceService] [[A________]] [avds_1793689064791] Failed to get valid device list after 4 attempts",
    "stack": "Error: Nov-03 13:57:48.757 AVDeviceService (?) [AVDeviceService] [ACQUISITION] [avds_1793689064791] Failed to get valid device list after 4 attempts\n    at Object.error (https://a.slack-edge.com/bv1-13-br/client-boot.17eb08f1c854c6f9.min.js?cacheKey=gantry-1793684253:5:152167)\n    at Object.error (https://a.slack-edge.com/bv1-13-br/client-boot.17eb08f1c854c6f9.min.js?cacheKey=gantry-1793684253:5:1… (2065 chars)"
  },
  "team": "?",
  "user": "?",
  "session_id": "6fec80a3-9024-4a7d-8d7a-942e548e38a3",
  "visitor_cookie": ".ba7b41a58e712cdee4b8b723c88bf595",
  "sub_app_name": "client",
  "tracing_enabled_for_session": "false",
  "frontend_build_type": "current",
  "app_context": "user_team",
  "app_variant": "ia4",
  "is_service_worker_active": "false"
}
```

Answered:

```json
null
```

**runs/inspect/20261103T065639_mattSlack**, POST 0 /clog/track/ (0 ms): 0, 294 ms

Sent:

```json
{
  "description": "Nov-03 13:57:52.151 AVDeviceService (?) [AVDeviceService] [ACQUISITION] [avds_1793689064791] Failed to get valid device list after 4 attempts",
  "version": "1793684253",
  "version_sha": "2c6eaecfe1c5bc5ec8c84737545fd1425e2efd1b",
  "error_json": {
    "subtype": "missing_subtype",
    "message": "Nov-03 13:57:52.151 AVDeviceService (?) [AVDeviceService] [[A________]] [avds_1793689064791] Failed to get valid device list after 4 attempts",
    "stack": "Error: Nov-03 13:57:52.151 AVDeviceService (?) [AVDeviceService] [ACQUISITION] [avds_1793689064791] Failed to get valid device list after 4 attempts\n    at Object.error (https://a.slack-edge.com/bv1-13-br/client-boot.17eb08f1c854c6f9.min.js?cacheKey=gantry-1793684253:5:152167)\n    at Object.error (https://a.slack-edge.com/bv1-13-br/client-boot.17eb08f1c854c6f9.min.js?cacheKey=gantry-1793684253:5:1… (2056 chars)"
  },
  "team": "?",
  "user": "?",
  "session_id": "6fec80a3-9024-4a7d-8d7a-942e548e38a3",
  "visitor_cookie": ".ba7b41a58e712cdee4b8b723c88bf595",
  "sub_app_name": "client",
  "tracing_enabled_for_session": "false",
  "frontend_build_type": "current",
  "app_context": "user_team",
  "app_variant": "ia4",
  "is_service_worker_active": "true"
}
```

Answered:

```json
null
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 0, 358 ms

Sent:

```json
{
  "description": "Nov-03 13:58:44.910 AVDeviceService (?) [AVDeviceService] [ACQUISITION] [avds_1793689119988] Failed to get valid device list after 4 attempts",
  "version": "1793684253",
  "version_sha": "2c6eaecfe1c5bc5ec8c84737545fd1425e2efd1b",
  "error_json": {
    "subtype": "missing_subtype",
    "message": "Nov-03 13:58:44.910 AVDeviceService (?) [AVDeviceService] [[A________]] [avds_1793689119988] Failed to get valid device list after 4 attempts",
    "stack": "Error: Nov-03 13:58:44.910 AVDeviceService (?) [AVDeviceService] [ACQUISITION] [avds_1793689119988] Failed to get valid device list after 4 attempts\n    at Object.error (https://a.slack-edge.com/bv1-13-br/client-boot.17eb08f1c854c6f9.min.js?cacheKey=gantry-1793684253:5:152167)\n    at Object.error (https://a.slack-edge.com/bv1-13-br/client-boot.17eb08f1c854c6f9.min.js?cacheKey=gantry-1793684253:5:1… (2065 chars)"
  },
  "team": "?",
  "user": "?",
  "session_id": "c87cf839-e831-469d-bb42-6a05207d97bf",
  "visitor_cookie": ".ba7b41a58e712cdee4b8b723c88bf595",
  "sub_app_name": "client",
  "tracing_enabled_for_session": "false",
  "frontend_build_type": "current",
  "app_context": "user_team",
  "app_variant": "ia4",
  "is_service_worker_active": "true"
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

Slack's client reports its own JavaScript errors to `slack.com/beacon/error`: it sent `description`, `version`, `version_sha`, `error_json`, `team`, `user` (both `?` before sign-in), `session_id` and the build fields, and the one shown reads `AVDeviceService ... Failed to get valid device list after 4 attempts` (the huddle audio/video device check). Seen 12 times, every one with status 0 and no answer (280-383 ms), on steps 4, 6, 14 and 17 and on a `POST /clog/track/` entry.

## What our machine does with it

Nothing: no log-cli code calls it. Status 0 means the request got no answer; it is the inspect browser's own traffic, and our engine's curl_cffi calls send no such report.

## What can go wrong

Status 0 with no body means the beacon was dropped or blocked on the wire, which cost the run nothing. The error text is about a missing audio/video device in the AdsPower profile, not about the account.
