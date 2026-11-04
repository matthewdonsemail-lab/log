# clientShouldReload

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | boot |
| Kind | query |
| doc_id | — |
| Path | `/api/client.shouldReload` |
| Sends | `------WebKitFormBoundaryukECt92Z3Jk8I9Iv
Content-Disposition: form-data; name`, `------WebKitFormBoundary9nMQaA1eVAIC7RGf
Content-Disposition: form-data; name` |
| Reads | `ok`, `build_version_enabled`, `should_reload`, `client_min_version`, `client_min_build_version`, `client_min_config_version`, `recommended_build_version`, `build_manifest_last_modified`, `should_fetch_new_service_worker` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous`, `runs/inspect/20261103T065639_mattSlack/script36.js:1 maybeStartTrace` |
| rea | `ev_2996fdc433a0d8c3802737045c4c2ddf029d1fd662a71194c2326befe2a9286f` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 540 ms | 3161 ms | — |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 1 | 200 | 298 ms | 2226 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 540 ms

Sent:

```json
{
  "query": {
    "_x_id": "noversion-1793689060.909",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_version_ts": "1793684253",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryukECt92Z3Jk8I9Iv\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryukECt92Z3Jk8I9Iv\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nboot\r\n------WebKitFormBoundaryukECt92Z3Jk8I9Iv\r\nContent-Disposition: form-data; name=\"build_manifest_last_modified\"\r\n\r\n1793687964\r\n------WebKitFormBoundaryukECt92Z3Jk8I9Iv\r\nConten… (818 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "build_version_enabled": true,
  "should_reload": false,
  "client_min_version": 1713823044,
  "client_min_build_version": 1713823044,
  "client_min_config_version": 1713312180,
  "recommended_build_version": 1793684253,
  "build_manifest_last_modified": 1793687964,
  "should_fetch_new_service_worker": false
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 298 ms

Sent:

```json
{
  "query": {
    "_x_id": "noversion-1793689117.054",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_version_ts": "1793684253",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundary9nMQaA1eVAIC7RGf\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundary9nMQaA1eVAIC7RGf\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nboot\r\n------WebKitFormBoundary9nMQaA1eVAIC7RGf\r\nContent-Disposition: form-data; name=\"build_manifest_last_modified\"\r\n\r\n1793687964\r\n------WebKitFormBoundary9nMQaA1eVAIC7RGf\r\nConten… (818 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "build_version_enabled": true,
  "should_reload": false,
  "client_min_version": 1713823044,
  "client_min_build_version": 1713823044,
  "client_min_config_version": 1713312180,
  "recommended_build_version": 1793684253,
  "build_manifest_last_modified": 1793687964,
  "should_fetch_new_service_worker": false
}
```

<!-- facts:end -->

## What it does

Asks whether the open client build is too old and should reload: it answered `should_reload: false`, `build_version_enabled: true`, `recommended_build_version: 1793684253`. Fired 3.2 s into step 4 (`goto /client`, 540 ms) and into step 6 (298 ms), both 200.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`) works through `GabrielCore` on curl_cffi, which signs in with the `d` cookie and calls only the web API methods it needs, so this is Slack's own web client boot traffic that `log inspect` recorded. The engine has no build version to go stale.

## What can go wrong

`should_reload: true` would make Slack's page reload itself mid-step; the recorded answers were `false`, so no reload interrupted the inspect run.
