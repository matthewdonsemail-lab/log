# teamTargetingCriteria

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | boot |
| Kind | query |
| doc_id | — |
| Path | `/api/team.targetingCriteria` |
| Sends | `------WebKitFormBoundarynF2rs0smuABinXx5
Content-Disposition: form-data; name`, `------WebKitFormBoundarykJvoSYswtQcZFBx9
Content-Disposition: form-data; name` |
| Reads | `ok`, `users.count` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous`, `runs/inspect/20261103T065639_mattSlack/script29.js:169 "0TKi"`, `runs/inspect/20261103T065639_mattSlack/script3.js:2977 "0TKi"` |
| rea | `ev_c76a2f4b23303c5d6cb742e67c195f1e41c727894432459bbfa72ca602379f7e` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 304 ms | 8095 ms | — |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 1 | 200 | 301 ms | 6583 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 304 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689065.608",
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
    "------WebKitFormBoundarynF2rs0smuABinXx5\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundarynF2rs0smuABinXx5\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nteam_targeting_criteria\r\n------WebKitFormBoundarynF2rs0smuABinXx5\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundarynF2rs0smuABinXx5\r\nContent-Disp… (593 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "users": {
    "count": 1
  }
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 301 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689120.674",
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
    "------WebKitFormBoundarykJvoSYswtQcZFBx9\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundarykJvoSYswtQcZFBx9\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nteam_targeting_criteria\r\n------WebKitFormBoundarykJvoSYswtQcZFBx9\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundarykJvoSYswtQcZFBx9\r\nContent-Disp… (593 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "users": {
    "count": 1
  }
}
```

<!-- facts:end -->

## What it does

Returns the size of the audience Slack can target for notices in the workspace (`users.count`): fired 8.1 s into step 4 (`goto /client`, 304 ms) and 6.6 s into step 6 (301 ms), both 200.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`) works through `GabrielCore` on curl_cffi, which signs in with the `d` cookie and calls only the web API methods it needs, so this is Slack's own web client boot traffic that `log inspect` recorded.

## What can go wrong

Like every Slack web API answer it carries `ok`; with `ok: false` the `error` field says why (for example `not_authed`, `invalid_auth`, `ratelimited`). Both recorded answers were 200 without error.
