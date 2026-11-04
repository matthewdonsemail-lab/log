# clientInit

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | boot |
| Kind | query |
| doc_id | — |
| Path | `/api/client.init` |
| Sends | `------WebKitFormBoundaryh4FkPYN2LP2EWElr
Content-Disposition: form-data; name`, `------WebKitFormBoundaryCpRFiSshkwUpt7BK
Content-Disposition: form-data; name` |
| Reads | `ok`, `self.id`, `self.name`, `self.is_bot`, `self.updated`, `self.is_app_user`, `self.team_id`, `self.deleted`, `self.color`, `self.is_email_confirmed`, `self.real_name`, `self.tz` and 28 more |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous` |
| rea | `ev_e942310078276f18690d9db6f8b6b3cb309fe84f36b3b458e894fc57e75c23aa` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 554 ms | 3154 ms | — |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 1 | 200 | 289 ms | 2221 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 554 ms

Sent:

```json
{
  "query": {
    "_x_id": "noversion-1793689060.890",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryh4FkPYN2LP2EWElr\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryh4FkPYN2LP2EWElr\r\nContent-Disposition: form-data; name=\"include_relevant_onboarding\"\r\n\r\ntrue\r\n------WebKitFormBoundaryh4FkPYN2LP2EWElr\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetch-client-init-data\r\n------WebKitFormBoundaryh4FkPYN2LP2EW… (610 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "self": "(23 fields)",
  "team": "(9 fields)",
  "workspaces": "(1 items)",
  "account_types": "(3 fields)",
  "slack_route": "T0C4VCD06MR",
  "image_proxy_url": "https://slack-imgs.com/",
  "reload_info": "(0 fields)",
  "cache_version": "v21-nomad",
  "user_date_created": 1790614676,
  "prefs_version": "f885351f584713756cb2973273f3d7122dd6f2b6e4b52d6d0e6929219f5a41d9",
  "mobile_app_requires_upgrade": false,
  "prefs": "(608 fields)"
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 289 ms

Sent:

```json
{
  "query": {
    "_x_id": "noversion-1793689117.040",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryCpRFiSshkwUpt7BK\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryCpRFiSshkwUpt7BK\r\nContent-Disposition: form-data; name=\"include_relevant_onboarding\"\r\n\r\ntrue\r\n------WebKitFormBoundaryCpRFiSshkwUpt7BK\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetch-client-init-data\r\n------WebKitFormBoundaryCpRFiSshkwUpt… (610 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "self": "(23 fields)",
  "team": "(9 fields)",
  "workspaces": "(1 items)",
  "account_types": "(3 fields)",
  "slack_route": "T0C4VCD06MR",
  "image_proxy_url": "https://slack-imgs.com/",
  "reload_info": "(0 fields)",
  "cache_version": "v21-nomad",
  "user_date_created": 1790614676,
  "prefs_version": "f885351f584713756cb2973273f3d7122dd6f2b6e4b52d6d0e6929219f5a41d9",
  "mobile_app_requires_upgrade": false,
  "prefs": "(608 fields)"
}
```

<!-- facts:end -->

## What it does

Is the client's main boot call: it returns the signed-in user (`self.id`, `self.name`, `self.team_id`, `self.tz`, `self.real_name`, and 28 more fields). It fired 3.2 s into step 4 (`goto /client`, 554 ms) and 2.2 s into step 6 (`goto /client/T0C4VCD06MR/D0C8VAE7REU`, 289 ms), both 200.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`) works through `GabrielCore` on curl_cffi, which signs in with the `d` cookie and calls only the web API methods it needs, so this is Slack's own web client boot traffic that `log inspect` recorded. The engine learns who the account is from the cookie exchange (`core.auth.exchange_cookie` in `teams_of`, and `core.initialize()`), which gives the team id, domain and user id.

## What can go wrong

Like every Slack web API answer it carries `ok`; with `ok: false` the `error` field says why (for example `not_authed`, `invalid_auth`, `ratelimited`). Both recorded answers were 200 with no error.
