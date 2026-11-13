# quipGetControllerInitData

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | files |
| Kind | query |
| doc_id | — |
| Path | `/api/quip.getControllerInitData` |
| Sends | `------WebKitFormBoundaryfXCqttnwvuT6AAtY
Content-Disposition: form-data; name` |
| Reads | `ok`, `init_options`, `preserialized`, `js_initializer.web_browser_id_cookie`, `js_initializer.staging_server`, `js_initializer.edge_resources_cookie`, `js_initializer.edge_resources_cookie_latest_val`, `js_initializer.js_autoreload`, `js_initializer.js_autoreload_frequency`, `js_initializer.css_autoreload`, `js_initializer.css_autoreload_frequency`, `js_initializer.live_apps_request_pool_timeout` and 28 more |
| Called from | `runs/inspect/20261103T065639_mattSlack/script35.js:275 anonymous` |
| rea | `ev_a47771702afcf6462bd855c398bf3b93af40c68eaaf29daf82d7f8e230768ee1` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 14: press Enter | 1 | 200 | 407 ms | 91163 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 14: press Enter: 200, 407 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689471.584",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "slack_route": "<teamId:1>",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryfXCqttnwvuT6AAtY\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundaryfXCqttnwvuT6AAtY\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\ncanvas-controller-init\r\n------WebKitFormBoundaryfXCqttnwvuT6AAtY\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundaryfXCqttnwvuT6AAtY\r\nContent-Dispo… (592 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "init_options": "CgthSEI5RUFBdlkySBJJCiBsaXN0ZW53ZWIzLnNsYWNrLXByb2Qub25xdWlwLmNvbRILLy0vbGlzdGVuLzEaAzQ0MyIBMCoQMTc5MzY4OTQ3MDUzNjUwMRrlARLiAQrfAQoLYUhCOUVBQXZZMkgQmOoFMgtVMEM0TDdSRjdIRFgAYgtVMEM0TDdSRjdIRMIBAOgBAPABAKgCALACALoCEggBEAEYASACKAI4AUABSABQAcgCxdX1nZ7IlwPaAhwKC0xZUjljQVlwWWI1EgtUMEM0VkNEMDZNUhoA6gIdaHR0cHM6Ly9zbGFjay1wcm9kLm9ucXVpcC5jb22SAwCiAwtMWVI5Y0FZcFliNboDAOgFAIIGANAGAOgG////////////AcgHAegHAPgH… (3492 chars)",
  "preserialized": null,
  "js_initializer": {
    "web_browser_id_cookie": "quip_id",
    "staging_server": false,
    "edge_resources_cookie": "edge_resources",
    "edge_resources_cookie_latest_val": "LATEST",
    "js_autoreload": false,
    "js_autoreload_frequency": 1000,
    "css_autoreload": false,
    "css_autoreload_frequency": 1000,
    "live_apps_request_pool_timeout": 30000,
    "sfdc_steam_types": [
      "stmpa",
      "stmpb"
    ],
    "sfdc_stmf_types": [
      "stmfa",
      "stmfb",
      "stmfc",
      "stmfd"
    ],
    "sfdc_steam_test_types": [
      "test1na44",
      "test1cs2",
      "test1na45",
      "test1cs3",
      "test1na46",
      "test1cs4"
    ],
    "sfdc_vpod_host": "sfdc_vpod_host",
    "native_app_force_windows_retirement": true,
    "usage_forever_free_companies": [
      "fPQAcAPz5E9",
      "DYTAcAiIFUr",
      "DHZAcAg3w7y",
      "WaQAcAuhMhm",
      "UBdAcAGFnyJ",
      "CPEAcA5Rm2R"
    ],
    "emoji_cdn_hash_activity": "mVFXFYpnQ60Ih7iriSz-zQ",
    "emoji_cdn_hash_flags": "5clQGBH57PH88rYb7r-tTA",
    "emoji_cdn_hash_food": "o4MdrAvsqGo_-WBHF3IvcA",
    "emoji_cdn_hash_nature": "sSMDHjSRucwm7JS9jLbrxw",
    "emoji_cdn_hash_objects": "_tcWulUWYzPWhfPlnqR9qw",
    "emoji_cdn_hash_people": "EULlNowX13KEPaEo97xrAg",
    "emoji_cdn_hash_travel": "oWI3NrRu3p-Bne5wUeR5GQ",
    "emoji_cdn_hash_symbols": "ma1lFmrVWCdhHezny0sizA",
    "edit_trace_enabled_threads": [],
    "edit_trace_sample_percentage": 1,
    "edit_trace_max_sections": 10,
    "search_clientperf_sample_fraction": 0.02,
    "show_example_templates": false,
    "folder_member_over_limit_company_list": [
      "NQHAcAV4DT7",
      "ZdXAcA53D9i",
      "NGZAcAXGt9c",
      "OZQAcALNw5G",
      "PeaAcAvdNVX",
      "MUYAcAEOstW",
      "… 83 more"
    ],
    "show_folder_limit_admin_console_alert_banner": false,
    "show_folder_limit_admin_console_alert_banner_v2": false,
    "search_index_name": "common",
    "sec_before_index_contributions_as_opens": 1420099200,
    "send_diagnostic_report_for_save_document_errors": false,
    "send_diagnostic_report_for_consecutive_sequence_out_of_order_errors_prob": 1,
    "slides_intro_ga_nux_template_thread_id": null,
    "slides_intro_ga_nux_template_thread_secret_path": null,
    "quip_end_of_sale": false,
    "external_sharing_support_article_link": "https://help.salesforce.com/s/articleView?id=000394470&type=1",
    "quip_slack_team_id": "T5J4Q04QG",
    "max_num_accounts": 8,
    "sfdc_email_max_num_accounts": 50,
    "enable_inbound_sharing_restriction_check": false,
    "folder_content_over_limit_company_list": [
      "NQHAcAV4DT7",
      "XEQAcA2S22G",
      "ZWBAcAaVMgw",
      "fBJAcAi1ucG",
      "EYHAcAE74b0",
      "dLQAcArjo4o",
      "… 110 more"
    ],
    "salesforce_query_all_users_limit": 10000,
    "sidebar_large_site_threshold": 500,
    "empty_document_data_hash": "5ba93c9db0cff93f52b521d7420e43f6eda2784f",
    "live_apps_retiring_soon": [],
    "elements_explorer_promoted_element_ids": [],
    "elements_explorer_template_data": "{}",
    "elements_url_protocol_allowlist": [
      "http",
      "https",
      "jamfselfservice",
      "keybase",
      "message",
      "notes",
      "… 35 more"
    ],
    "max_cell_sections": 100000,
    "max_lotta_cell_sections": 1001000,
    "featured_template_data": "[]",
    "folders_max_depth": 15,
    "copy_folder_max_threads": 100,
    "max_list_view_children_for_performance": 1000,
    "company_admin_min_level": 10,
    "company_member_lookup_large_company_ids": [],
    "canned_thread_metadata_by_name": "{}",
    "default_slide_layout_canned_thread_names": [
      "default_slide_layouts_titles",
      "default_slide_layouts_text",
      "default_slide_layouts_data",
      "default_slide_layouts_media",
      "default_slide_layouts_diagrams"
    ],
    "long_tasks_metric_threshold": 3000,
    "admin_console_offboarding_max_user_ids": 100,
    "max_company_members": 1000,
    "migration_user_mapping_page_size": 1000,
    "migration_user_mapping_export_csv_max_size": 5000,
    "export_csv_filtered_company_members": true,
    "salesforce_usage_show_delta_start_ms": 1585022447000,
    "salesforce_usage_data_start_date": 1582670829000,
    "export_company_max_members": 1000,
    "session_check_interval_ms": 90000,
    "lookup_user_mapping_runs_period_days": 30,
    "modal_full_text_offscreen_delay": 2000,
    "modal_full_text_short_query_delay": 1000,
    "diagnostic_report_max_mutations": 200,
    "model_updates_probe_chance": 0.01,
    "model_updates_probe_frequency": 600000,
    "model_integrity_probe_chance": 0.01,
    "model_integrity_probe_frequency": 600000,
    "model_fsck_probe_chance": 0.01,
    "model_fsck_probe_frequency": 600000,
    "web_cache_last_updated_cookie": "web_cache_last_updated",
    "throttled_collections_cache_only_threshold": 86400000,
    "web_cache_max_staleness_ms": 3600000
  },
  "quip_user_id": "aHB9EAAvY2H",
  "web_cache_key": "3RPNjvvbNZkeqQlENuFFsYY3OWqBokikQkiRe3hWNMA=",
  "web_cache_key_version": 6,
  "body_classes": "use-slack-font"
}
```

<!-- facts:end -->

## What it does

Loads the setup data for Slack's Quip-based canvas editor (`init_options`, `js_initializer`...): it fired once on step 14 (press Enter), 91 s in, 407 ms, 200.

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client. Canvases are not read or written by log-cli.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. A refusal would only stop a canvas opening in the web client.
