# signinFindWorkspaces

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | signin |
| Kind | query |
| doc_id | — |
| Path | `/api/signin.findWorkspaces` |
| Sends | `------WebKitFormBoundaryzXTreFMDCL3VmMsQ
Content-Disposition: form-data; name`, `------WebKitFormBoundary3P4jUyYbxlPMD2Ap
Content-Disposition: form-data; name` |
| Reads | `ok`, `current_teams`, `current_orgs`, `invited_teams`, `domain_enabled_teams`, `has_valid_cookie`, `confirmed_email`, `privacy_consent_group` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script252.js:1 statement`, `runs/inspect/20261103T065639_mattSlack/script3.js:2977 B7kl` |
| rea | `ev_d0f640a6f473253defb026e7558c7e35073a8ccd86d05a61e21ddde6ffd69496` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /get-started | 1 | 200 | 648 ms | 2923 ms | — |
| inspect | step 3: click e536 | 1 | 200 | 1052 ms | 31637 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 1: goto /get-started: 200, 648 ms

Sent:

```json
{
  "query": {
    "_x_id": "noversion-1793689008.269",
    "slack_route": "T00000000",
    "_x_version_ts": "noversion",
    "fp": "57",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryzXTreFMDCL3VmMsQ\r\nContent-Disposition: form-data; name": "\"commingled_response\"\r\n\r\nfalse\r\n------WebKitFormBoundaryzXTreFMDCL3VmMsQ\r\nContent-Disposition: form-data; name=\"ssb_signin\"\r\n\r\nfalse\r\n------WebKitFormBoundaryzXTreFMDCL3VmMsQ\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nget_started_workspaces\r\n------WebKitFormBoundaryzXTreFMDCL3VmMsQ\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundaryzXTreFMDCL3VmMsQ--\r\n"
  }
}
```

Answered:

```json
{
  "ok": true,
  "current_teams": [
    {
      "email": "matthewdonsemail@gmail.com",
      "teams": [
        "(29 fields)",
        "(29 fields)",
        "(29 fields)",
        "(29 fields)",
        "(29 fields)",
        "(29 fields)",
        "… 1 more"
      ]
    }
  ],
  "current_orgs": [
    {
      "email": "matthewdonsemail@gmail.com",
      "org": {
        "id": "E07U77NLWDT",
        "name": "Comet",
        "url": "https://grid-comet-ml.enterprise.slack.com/",
        "domain": "grid-comet-ml",
        "icon": "(8 fields)",
        "icon_44": "https://avatars.slack-edge.com/2025-02-23/8520673528272_653829ce27f4ba680abf_44.png",
        "icon_88": "https://avatars.slack-edge.com/2025-02-23/8520673528272_653829ce27f4ba680abf_88.png",
        "two_factor_required": false,
        "is_enterprise": true,
        "signup_url": "https://grid-comet-ml.enterprise.slack.com/",
        "variant": "commercial",
        "active_users": 4395,
        "profile_photos": "(5 items)",
        "image_default": false,
        "sso_provider": "Google SAML",
        "sso_providers": "(1 items)",
        "auth_mode": "saml",
        "sso_required": false,
        "sso_suggested": true,
        "magic_login_code": "z-app-7959260710469-12486834575526-079f86a5ed4bfbacf52c536a709872ffaaa4d39bb300098d26055fa213bf3bc0",
        "last_login_ts": 1788094647,
        "user_type": "guest",
        "associated_user": "U0BN57MQZ1N",
        "user_workspace_signal_score": 0,
        "can_apply_canvas": true,
        "can_apply_list": true,
        "can_apply_workflow": false,
        "enterprise_mobile_device_check": false
      }
    }
  ],
  "invited_teams": [],
  "domain_enabled_teams": [],
  "has_valid_cookie": true,
  "confirmed_email": "matthewdonsemail@gmail.com",
  "privacy_consent_group": "B"
}
```

**runs/inspect/20261103T065218_mattSlack**, step 3: click e536: 200, 1052 ms

Sent:

```json
{
  "query": {
    "_x_id": "noversion-1793688811.872",
    "slack_route": "T00000000",
    "_x_version_ts": "noversion",
    "fp": "99",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundary3P4jUyYbxlPMD2Ap\r\nContent-Disposition: form-data; name": "\"commingled_response\"\r\n\r\nfalse\r\n------WebKitFormBoundary3P4jUyYbxlPMD2Ap\r\nContent-Disposition: form-data; name=\"ssb_signin\"\r\n\r\nfalse\r\n------WebKitFormBoundary3P4jUyYbxlPMD2Ap\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nget_started_workspaces\r\n------WebKitFormBoundary3P4jUyYbxlPMD2Ap\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundary3P4jUyYbxlPMD2Ap--\r\n"
  }
}
```

Answered:

```json
{
  "ok": true,
  "current_teams": [
    {
      "email": "matthewdonsemail@gmail.com",
      "teams": [
        "(29 fields)",
        "(29 fields)",
        "(29 fields)",
        "(29 fields)",
        "(29 fields)",
        "(29 fields)",
        "… 1 more"
      ]
    }
  ],
  "current_orgs": [
    {
      "email": "matthewdonsemail@gmail.com",
      "org": {
        "id": "E07U77NLWDT",
        "name": "Comet",
        "url": "https://grid-comet-ml.enterprise.slack.com/",
        "domain": "grid-comet-ml",
        "icon": "(8 fields)",
        "icon_44": "https://avatars.slack-edge.com/2025-02-23/8520673528272_653829ce27f4ba680abf_44.png",
        "icon_88": "https://avatars.slack-edge.com/2025-02-23/8520673528272_653829ce27f4ba680abf_88.png",
        "two_factor_required": false,
        "is_enterprise": true,
        "signup_url": "https://grid-comet-ml.enterprise.slack.com/",
        "variant": "commercial",
        "active_users": 4395,
        "profile_photos": "(5 items)",
        "image_default": false,
        "sso_provider": "Google SAML",
        "sso_providers": "(1 items)",
        "auth_mode": "saml",
        "sso_required": false,
        "sso_suggested": true,
        "magic_login_code": "z-app-7959260710469-12486834575526-079f86a5ed4bfbacf52c536a709872ffaaa4d39bb300098d26055fa213bf3bc0",
        "last_login_ts": 1788094647,
        "user_type": "guest",
        "associated_user": "U0BN57MQZ1N",
        "user_workspace_signal_score": 0,
        "can_apply_canvas": true,
        "can_apply_list": true,
        "can_apply_workflow": false,
        "enterprise_mobile_device_check": false
      }
    }
  ],
  "invited_teams": [],
  "domain_enabled_teams": [],
  "has_valid_cookie": true,
  "confirmed_email": "matthewdonsemail@gmail.com",
  "privacy_consent_group": "B"
}
```

<!-- facts:end -->

## What it does

Slack's sign-in page asks which workspaces the browser's session already belongs to: it answered `ok: true` with `current_teams` (a list per email, here matthewdonsemail@gmail.com, each team with 29 fields), `current_orgs`, `invited_teams`, `domain_enabled_teams`, `has_valid_cookie`, `confirmed_email` and `privacy_consent_group`. It fired in two runs: step 1 goto /get-started (648 ms) and step 3 click e536 (1052 ms).

## What our machine does with it

Not through this call. The engine's `workspaces` action (`teams_of` in `python/slackApi/engine.py`) lists the account's teams through gabriel's own client with the saved cookies, so nothing waits on `signin.findWorkspaces`; it was only seen because the inspect run opened Slack's sign-in page.

## What can go wrong

Both recorded calls were 200 with `ok: true`. `has_valid_cookie: false` or an empty `current_teams` would mean the browser holds no live Slack session; for our engine that case surfaces as `AUTH_DEAD` from its own session check, not from this endpoint.
