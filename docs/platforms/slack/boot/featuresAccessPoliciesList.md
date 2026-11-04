# featuresAccessPoliciesList

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | boot |
| Kind | query |
| doc_id | — |
| Path | `/api/features.access.policies.list` |
| Sends | `------WebKitFormBoundaryW6zdeU2xALzQZmIy
Content-Disposition: form-data; name`, `------WebKitFormBoundarytRJKOVFiA68YryY9
Content-Disposition: form-data; name` |
| Reads | `ok`, `feature_policies.admin_productivity_suite__access`, `feature_policies.analytics_ai__view`, `feature_policies.analytics_app__view`, `feature_policies.analytics_all_channels_in_org__view`, `feature_policies.analytics_member__view`, `feature_policies.analytics_channel_insights_client__view`, `feature_policies.analytics_slackbot__view`, `feature_policies.analytics_member_plan_with_ai_feature__view`, `feature_policies.analytics_member_paid_plan__view`, `feature_policies.analytics_enterprise_plus_admin__view`, `feature_policies.canvas_standalone__edit` and 28 more |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous` |
| rea | `ev_7f96348a092aafff7bc33ebbf88e3b2d0490512a370bd68c7b2e6d032a514bb3` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 559 ms | 3159 ms | — |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 1 | 200 | 305 ms | 2225 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 559 ms

Sent:

```json
{
  "query": {
    "_x_id": "noversion-1793689060.903",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryW6zdeU2xALzQZmIy\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryW6zdeU2xALzQZmIy\r\nContent-Disposition: form-data; name=\"_x_app_name\"\r\n\r\nclient\r\n------WebKitFormBoundaryW6zdeU2xALzQZmIy\r\nContent-Disposition: form-data; name=\"_x_sonic\"\r\n\r\ntrue\r\n------WebKitFormBoundaryW6zdeU2xALzQZmIy--\r\n"
  }
}
```

Answered:

```json
{
  "ok": true,
  "feature_policies": {
    "admin_productivity_suite__access": "(3 fields)",
    "analytics_ai__view": "(3 fields)",
    "analytics_app__view": "(3 fields)",
    "analytics_all_channels_in_org__view": "(3 fields)",
    "analytics_member__view": "(3 fields)",
    "analytics_channel_insights_client__view": "(3 fields)",
    "analytics_slackbot__view": "(3 fields)",
    "analytics_member_plan_with_ai_feature__view": "(3 fields)",
    "analytics_member_paid_plan__view": "(3 fields)",
    "analytics_enterprise_plus_admin__view": "(3 fields)",
    "canvas_standalone__edit": "(3 fields)",
    "canvas_standalone__create": "(3 fields)",
    "canvas_channel__delete": "(2 fields)",
    "canvas_channel__edit": "(2 fields)",
    "canvas_channel__create": "(2 fields)",
    "canvas_huddle__edit": "(2 fields)",
    "canvas_huddle__create": "(2 fields)",
    "canvas_template__create": "(3 fields)",
    "webhook_trigger__create": "(3 fields)",
    "workflow_connector__use": "(3 fields)",
    "rosi_app__create": "(3 fields)",
    "hermes__write": "(3 fields)",
    "hermes__read": "(2 fields)",
    "trigger__trip": "(3 fields)",
    "workflow_custom_steps__use": "(3 fields)",
    "workflow_conditional_steps__use": "(3 fields)",
    "workflow_repeater_steps__use": "(3 fields)",
    "workflow_transform_variable_steps__use": "(3 fields)",
    "slack_ai__access": "(3 fields)",
    "slack_ai_exclude_from_slack_ai_property__access": "(3 fields)",
    "slackbot_ai_deep_thoughts__access": "(3 fields)",
    "enterprise_search__access": "(3 fields)",
    "huddle__start": "(3 fields)",
    "user_groups__manage": "(3 fields)",
    "channel_sections__create": "(3 fields)",
    "file_collections__create": "(3 fields)",
    "file_tabs__create": "(3 fields)",
    "slack_connect_dm__access": "(2 fields)",
    "slack_connect_channel__access": "(3 fields)",
    "salesforce__access": "(2 fields)",
    "salesforce_multi_org__access": "(3 fields)",
    "salesforce_standalone_lists__access": "(3 fields)",
    "salesforce_seamless_auth__access": "(3 fields)",
    "salesforce_data_fields__access": "(3 fields)",
    "salesforce_org_slack_first_crm__access": "(3 fields)",
    "salesforce_slack_first_crm_provisioning__access": "(2 fields)",
    "salesforce_sales_tracker__access": "(3 fields)",
    "salesforce_crm_onboarding_refresh__access": "(3 fields)",
    "salesforce_eac__access": "(3 fields)",
    "salesforce_csv_import__access": "(3 fields)",
    "salesforce_agenda__access": "(3 fields)",
    "salesforce_crm_license_management__access": "(3 fields)",
    "salesforce_default_sidebar_lists__access": "(3 fields)",
    "salesforce_web_to_lead__access": "(3 fields)",
    "salesforce_email_to_case__access": "(3 fields)",
    "salesforce_domain_verification__access": "(3 fields)",
    "salesforce_email_activity_capture__access": "(3 fields)",
    "enterprise_managed_auth__access": "(3 fields)",
    "slack_ai_apps_assistant_view__access": "(3 fields)",
    "audit_log__access": "(3 fields)",
    "audit_log_addon__access": "(3 fields)",
    "discovery_api__access": "(3 fields)",
    "discovery_api_addon__access": "(3 fields)",
    "export_api__access": "(3 fields)",
    "frontline__access": "(3 fields)",
    "retention_custom_setting__access": "(3 fields)",
    "lists__access": "(3 fields)",
    "manage_channel_posting__access": "(3 fields)",
    "search_query_audit__access": "(3 fields)",
    "enterprise_channel_properties__access": "(3 fields)",
    "discoverable_channels__access": "(3 fields)"
  }
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 305 ms

Sent:

```json
{
  "query": {
    "_x_id": "noversion-1793689117.050",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundarytRJKOVFiA68YryY9\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundarytRJKOVFiA68YryY9\r\nContent-Disposition: form-data; name=\"_x_app_name\"\r\n\r\nclient\r\n------WebKitFormBoundarytRJKOVFiA68YryY9\r\nContent-Disposition: form-data; name=\"_x_sonic\"\r\n\r\ntrue\r\n------WebKitFormBoundarytRJKOVFiA68YryY9--\r\n"
  }
}
```

Answered:

```json
{
  "ok": true,
  "feature_policies": {
    "admin_productivity_suite__access": "(3 fields)",
    "analytics_ai__view": "(3 fields)",
    "analytics_app__view": "(3 fields)",
    "analytics_all_channels_in_org__view": "(3 fields)",
    "analytics_member__view": "(3 fields)",
    "analytics_channel_insights_client__view": "(3 fields)",
    "analytics_slackbot__view": "(3 fields)",
    "analytics_member_plan_with_ai_feature__view": "(3 fields)",
    "analytics_member_paid_plan__view": "(3 fields)",
    "analytics_enterprise_plus_admin__view": "(3 fields)",
    "canvas_standalone__edit": "(3 fields)",
    "canvas_standalone__create": "(3 fields)",
    "canvas_channel__delete": "(2 fields)",
    "canvas_channel__edit": "(2 fields)",
    "canvas_channel__create": "(2 fields)",
    "canvas_huddle__edit": "(2 fields)",
    "canvas_huddle__create": "(2 fields)",
    "canvas_template__create": "(3 fields)",
    "webhook_trigger__create": "(3 fields)",
    "workflow_connector__use": "(3 fields)",
    "rosi_app__create": "(3 fields)",
    "hermes__write": "(3 fields)",
    "hermes__read": "(2 fields)",
    "trigger__trip": "(3 fields)",
    "workflow_custom_steps__use": "(3 fields)",
    "workflow_conditional_steps__use": "(3 fields)",
    "workflow_repeater_steps__use": "(3 fields)",
    "workflow_transform_variable_steps__use": "(3 fields)",
    "slack_ai__access": "(3 fields)",
    "slack_ai_exclude_from_slack_ai_property__access": "(3 fields)",
    "slackbot_ai_deep_thoughts__access": "(3 fields)",
    "enterprise_search__access": "(3 fields)",
    "huddle__start": "(3 fields)",
    "user_groups__manage": "(3 fields)",
    "channel_sections__create": "(3 fields)",
    "file_collections__create": "(3 fields)",
    "file_tabs__create": "(3 fields)",
    "slack_connect_dm__access": "(2 fields)",
    "slack_connect_channel__access": "(3 fields)",
    "salesforce__access": "(2 fields)",
    "salesforce_multi_org__access": "(3 fields)",
    "salesforce_standalone_lists__access": "(3 fields)",
    "salesforce_seamless_auth__access": "(3 fields)",
    "salesforce_data_fields__access": "(3 fields)",
    "salesforce_org_slack_first_crm__access": "(3 fields)",
    "salesforce_slack_first_crm_provisioning__access": "(2 fields)",
    "salesforce_sales_tracker__access": "(3 fields)",
    "salesforce_crm_onboarding_refresh__access": "(3 fields)",
    "salesforce_eac__access": "(3 fields)",
    "salesforce_csv_import__access": "(3 fields)",
    "salesforce_agenda__access": "(3 fields)",
    "salesforce_crm_license_management__access": "(3 fields)",
    "salesforce_default_sidebar_lists__access": "(3 fields)",
    "salesforce_web_to_lead__access": "(3 fields)",
    "salesforce_email_to_case__access": "(3 fields)",
    "salesforce_domain_verification__access": "(3 fields)",
    "salesforce_email_activity_capture__access": "(3 fields)",
    "enterprise_managed_auth__access": "(3 fields)",
    "slack_ai_apps_assistant_view__access": "(3 fields)",
    "audit_log__access": "(3 fields)",
    "audit_log_addon__access": "(3 fields)",
    "discovery_api__access": "(3 fields)",
    "discovery_api_addon__access": "(3 fields)",
    "export_api__access": "(3 fields)",
    "frontline__access": "(3 fields)",
    "retention_custom_setting__access": "(3 fields)",
    "lists__access": "(3 fields)",
    "manage_channel_posting__access": "(3 fields)",
    "search_query_audit__access": "(3 fields)",
    "enterprise_channel_properties__access": "(3 fields)",
    "discoverable_channels__access": "(3 fields)"
  }
}
```

<!-- facts:end -->

## What it does

Lists which features the account may access (`feature_policies.<feature>__<permission>`, for example `analytics_app__view`): fired 3.2 s into step 4 (`goto /client`, 559 ms) and into step 6 (305 ms), both 200.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`) works through `GabrielCore` on curl_cffi, which signs in with the `d` cookie and calls only the web API methods it needs, so this is Slack's own web client boot traffic that `log inspect` recorded. The engine finds out what the account may do from Slack's own answer to the call it makes (`ok: false` with an `error`), not from this list.

## What can go wrong

Like every Slack web API answer it carries `ok`; with `ok: false` the `error` field says why (for example `not_authed`, `invalid_auth`, `ratelimited`). Both recorded answers were 200 without error.
