# experimentsGetByUser

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | boot |
| Kind | query |
| doc_id | — |
| Path | `/api/experiments.getByUser` |
| Sends | `------WebKitFormBoundaryA4lRALid1vvTbbAJ
Content-Disposition: form-data; name`, `------WebKitFormBoundarywoL1HkX4msIzF62m
Content-Disposition: form-data; name` |
| Reads | `ok`, `assignments.slackbot_skills_admin_page_redirect`, `assignments.slackbot_skill_set_admin_page`, `assignments.slackbot_skills_admin_edit_access`, `assignments.slackbot_skill_share_dialog_v2`, `assignments.dunning_churn_reduction`, `assignments.code_channels_ghes_provider`, `assignments.new_team_ai_app_invites`, `assignments.canvas_readtime`, `assignments.canvas_permalink_icon`, `assignments.canvas_navigable_callout`, `assignments.canvas_header_image` and 28 more |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous` |
| rea | `ev_c1f0045fb8d971ed590cc6de38e0a27b19246d205b6e190ed91fac4cabfedbae` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 556 ms | 3157 ms | — |
| inspect | step 6: goto /client/<teamId:1>/<channelId:1> | 1 | 200 | 341 ms | 2222 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 556 ms

Sent:

```json
{
  "query": {
    "_x_id": "noversion-1793689060.899",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryA4lRALid1vvTbbAJ\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundaryA4lRALid1vvTbbAJ\r\nContent-Disposition: form-data; name=\"web_client_version\"\r\n\r\n1793684253\r\n------WebKitFormBoundaryA4lRALid1vvTbbAJ\r\nContent-Disposition: form-data; name=\"_x_app_name\"\r\n\r\nclient\r\n------WebKitFormBoundaryA4lRALid1vvTbbAJ\r\nContent-Disp… (489 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "assignments": "(1588 fields)",
  "config_version_ts": 1793689060
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/<teamId:1>/<channelId:1>: 200, 341 ms

Sent:

```json
{
  "query": {
    "_x_id": "noversion-1793689117.048",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundarywoL1HkX4msIzF62m\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundarywoL1HkX4msIzF62m\r\nContent-Disposition: form-data; name=\"web_client_version\"\r\n\r\n1793684253\r\n------WebKitFormBoundarywoL1HkX4msIzF62m\r\nContent-Disposition: form-data; name=\"_x_app_name\"\r\n\r\nclient\r\n------WebKitFormBoundarywoL1HkX4msIzF62m\r\nContent-Disp… (489 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "assignments": "(1588 fields)",
  "config_version_ts": 1793689117
}
```

<!-- facts:end -->

## What it does

Returns the account's experiment assignments (`assignments.<experiment name>`, for example `slackbot_skills_admin_page_redirect`) so the client knows which variants to show: fired 3.2 s into step 4 (`goto /client`, 556 ms) and into step 6 (341 ms), both 200.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`) works through `GabrielCore` on curl_cffi, which signs in with the `d` cookie and calls only the web API methods it needs, so this is Slack's own web client boot traffic that `log inspect` recorded. log-cli does not read experiment assignments.

## What can go wrong

Like every Slack web API answer it carries `ok`; with `ok: false` the `error` field says why (for example `not_authed`, `invalid_auth`, `ratelimited`). Both recorded answers were 200 without error.
