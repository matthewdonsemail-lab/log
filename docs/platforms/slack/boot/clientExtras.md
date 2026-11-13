# clientExtras

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | boot |
| Kind | query |
| doc_id | — |
| Path | `/api/client.extras` |
| Sends | `------WebKitFormBoundary04DaMvzhwowPvAZL
Content-Disposition: form-data; name`, `------WebKitFormBoundaryTPAAfLjL1sov5Ehk
Content-Disposition: form-data; name` |
| Reads | `ok`, `misc.is_europe`, `misc.is_content_reporting_enabled`, `misc.transfer_links`, `misc.team_classification`, `misc.creator_email_type`, `salesforce_features.is_sfdc_auto_slack`, `salesforce_features.is_slack_first_crm`, `salesforce_features.lob_sales_home_enabled_for_team`, `salesforce_features.lob_sales_home_enabled_for_user`, `salesforce_features.is_salesforce_pro_connected`, `salesforce_features.is_salesforce_any_connected` and 15 more |
| Called from | `runs/inspect/20261103T065639_mattSlack/script289.js:1371 anonymous`, `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous` |
| rea | `ev_c9fe1f0442839e09888210f67ae438498321d994bf73af4f7232c51ba282598b` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 555 ms | 3162 ms | — |
| inspect | step 6: goto /client/<teamId:1>/<channelId:1> | 1 | 200 | 310 ms | 2227 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 555 ms

Sent:

```json
{
  "query": {
    "_x_id": "noversion-1793689060.911",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundary04DaMvzhwowPvAZL\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundary04DaMvzhwowPvAZL\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetch-client-extras-data\r\n------WebKitFormBoundary04DaMvzhwowPvAZL\r\nContent-Disposition: form-data; name=\"extras\"\r\n\r\ncache_timestamps,features,salesforce_features,misc,subteams,te… (710 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "misc": {
    "is_europe": false,
    "is_content_reporting_enabled": false,
    "transfer_links": "(1 fields)",
    "team_classification": "social",
    "creator_email_type": "social"
  },
  "salesforce_features": {
    "is_sfdc_auto_slack": false,
    "is_slack_first_crm": false,
    "lob_sales_home_enabled_for_team": false,
    "lob_sales_home_enabled_for_user": false,
    "is_salesforce_pro_connected": false,
    "is_salesforce_any_connected": false
  },
  "stats": {},
  "team_prefs": {
    "toplevel_prefs": "(366 fields)"
  },
  "default_workspace": "<teamId:1>",
  "subteams": [],
  "features": {
    "paid_features": "(0 items)",
    "is_eligible_invited_user_glow_up": false
  },
  "cache_timestamps": {
    "translations_cache_ts": "1793689060.000000",
    "emoji_cache_ts": "1560987000.000000",
    "app_commands_cache_ts": "1582676714.000000",
    "ai_apps_cache_ts": 1793686321
  },
  "plan_info": {
    "is_plan_frozen": false,
    "plan_level": "",
    "user_can_access_admin_billing": true
  },
  "feature_usage_data": {
    "slackbot_ai:access": "(4 fields)",
    "slackbot_tasks:use": "(4 fields)"
  }
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/<teamId:1>/<channelId:1>: 200, 310 ms

Sent:

```json
{
  "query": {
    "_x_id": "noversion-1793689117.056",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryTPAAfLjL1sov5Ehk\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundaryTPAAfLjL1sov5Ehk\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetch-client-extras-data\r\n------WebKitFormBoundaryTPAAfLjL1sov5Ehk\r\nContent-Disposition: form-data; name=\"extras\"\r\n\r\ncache_timestamps,features,salesforce_features,misc,subteams,te… (710 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "misc": {
    "is_europe": false,
    "is_content_reporting_enabled": false,
    "transfer_links": "(1 fields)",
    "team_classification": "social",
    "creator_email_type": "social"
  },
  "salesforce_features": {
    "is_sfdc_auto_slack": false,
    "is_slack_first_crm": false,
    "lob_sales_home_enabled_for_team": false,
    "lob_sales_home_enabled_for_user": false,
    "is_salesforce_pro_connected": false,
    "is_salesforce_any_connected": false
  },
  "stats": {},
  "team_prefs": {
    "toplevel_prefs": "(366 fields)"
  },
  "default_workspace": "<teamId:1>",
  "subteams": [],
  "features": {
    "paid_features": "(0 items)",
    "is_eligible_invited_user_glow_up": false
  },
  "cache_timestamps": {
    "translations_cache_ts": "1793689117.000000",
    "emoji_cache_ts": "1560987000.000000",
    "app_commands_cache_ts": "1582676714.000000",
    "ai_apps_cache_ts": 1793686321
  },
  "plan_info": {
    "is_plan_frozen": false,
    "plan_level": "",
    "user_can_access_admin_billing": true
  },
  "feature_usage_data": {
    "slackbot_ai:access": "(4 fields)",
    "slackbot_tasks:use": "(4 fields)"
  }
}
```

<!-- facts:end -->

## What it does

Fetches extra workspace facts the client needs at boot: `misc.is_europe`, `misc.team_classification`, Salesforce feature switches and similar. Fired 3.2 s into step 4 (`goto /client`, 555 ms) and into step 6 (`goto /client/<teamId:1>/<channelId:1>`, 310 ms), both 200.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`) works through `GabrielCore` on curl_cffi, which signs in with the `d` cookie and calls only the web API methods it needs, so this is Slack's own web client boot traffic that `log inspect` recorded.

## What can go wrong

Like every Slack web API answer it carries `ok`; with `ok: false` the `error` field says why (for example `not_authed`, `invalid_auth`, `ratelimited`). Both recorded answers were 200 without error.
