# apiFeatures

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | boot |
| Kind | query |
| doc_id | — |
| Path | `/api/api.features` |
| Sends | `------WebKitFormBoundaryuKH9Aya6mNRohK1B
Content-Disposition: form-data; name`, `------WebKitFormBoundary7tQXAPxlsKoG9o1Q
Content-Disposition: form-data; name` |
| Reads | `ok`, `features.feature_builder_story_step`, `features.feature_olug_remove_required_workspace_setting`, `features.feature_file_threads`, `features.feature_broadcast_indicator`, `features.feature_channel_mgmt_message_count`, `features.feature_channel_exports`, `features.feature_allow_intra_word_formatting`, `features.feature_beacon_js_errors`, `features.feature_user_app_disable_speed_bump`, `features.feature_cea_allowlist_changes`, `features.feature_cea_admin_controls` and 13 more |
| Called from | `runs/inspect/20261103T065639_mattSlack/script36.js:1 anonymous`, `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous` |
| rea | `ev_1d54471c83d0e4beade9f26c5f556d7aa7a8fda485f4e34881297a1010f427a6` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 539 ms | 3159 ms | — |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 1 | 200 | 305 ms | 2225 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 539 ms

Sent:

```json
{
  "query": {
    "_x_id": "noversion-1793689060.901",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryuKH9Aya6mNRohK1B\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryuKH9Aya6mNRohK1B\r\nContent-Disposition: form-data; name=\"platform\"\r\n\r\nsonic\r\n------WebKitFormBoundaryuKH9Aya6mNRohK1B\r\nContent-Disposition: form-data; name=\"_x_app_name\"\r\n\r\nclient\r\n------WebKitFormBoundaryuKH9Aya6mNRohK1B\r\nContent-Disposition: form-d… (474 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "features": {
    "feature_builder_story_step": false,
    "feature_olug_remove_required_workspace_setting": false,
    "feature_file_threads": true,
    "feature_broadcast_indicator": true,
    "feature_channel_mgmt_message_count": false,
    "feature_channel_exports": false,
    "feature_allow_intra_word_formatting": true,
    "feature_beacon_js_errors": false,
    "feature_user_app_disable_speed_bump": true,
    "feature_cea_allowlist_changes": false,
    "feature_cea_admin_controls": false,
    "feature_cea_allowlist_changes_plus": false,
    "feature_ia_layout": true,
    "feature_enterprise_mobile_device_check": true,
    "feature_channel_sections": true,
    "feature_no_deprecation_in_updater": false,
    "feature_composer_auth_admin": true,
    "feature_esc_grid_migrations_format_translate": false,
    "feature_rel_notes_product_updates": false,
    "feature_users_count_latest_cache": false,
    "feature_builder_block_kit": true,
    "feature_cea_empty_pref_to_null": false,
    "feature_bot_user_id_lookup_for_app_profiles": false
  },
  "config_version_ts": 1793689060
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 305 ms

Sent:

```json
{
  "query": {
    "_x_id": "noversion-1793689117.049",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundary7tQXAPxlsKoG9o1Q\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundary7tQXAPxlsKoG9o1Q\r\nContent-Disposition: form-data; name=\"platform\"\r\n\r\nsonic\r\n------WebKitFormBoundary7tQXAPxlsKoG9o1Q\r\nContent-Disposition: form-data; name=\"_x_app_name\"\r\n\r\nclient\r\n------WebKitFormBoundary7tQXAPxlsKoG9o1Q\r\nContent-Disposition: form-d… (474 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "features": {
    "feature_builder_story_step": false,
    "feature_olug_remove_required_workspace_setting": false,
    "feature_file_threads": true,
    "feature_broadcast_indicator": true,
    "feature_channel_mgmt_message_count": false,
    "feature_channel_exports": false,
    "feature_allow_intra_word_formatting": true,
    "feature_beacon_js_errors": false,
    "feature_user_app_disable_speed_bump": true,
    "feature_cea_allowlist_changes": false,
    "feature_cea_admin_controls": false,
    "feature_cea_allowlist_changes_plus": false,
    "feature_ia_layout": true,
    "feature_enterprise_mobile_device_check": true,
    "feature_channel_sections": true,
    "feature_no_deprecation_in_updater": false,
    "feature_composer_auth_admin": true,
    "feature_esc_grid_migrations_format_translate": false,
    "feature_rel_notes_product_updates": false,
    "feature_users_count_latest_cache": false,
    "feature_builder_block_kit": true,
    "feature_cea_empty_pref_to_null": false,
    "feature_bot_user_id_lookup_for_app_profiles": false
  },
  "config_version_ts": 1793689117
}
```

<!-- facts:end -->

## What it does

Asks which feature flags (`features.feature_*`) are on for the workspace as the client boots: sent by step 4 (`goto /client`, 539 ms, 3.2 s after the step started) and again by step 6 (`goto /client/T0C4VCD06MR/D0C8VAE7REU`), answered 200 both times with `ok` and the flag map.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`) works through `GabrielCore` on curl_cffi, which signs in with the `d` cookie and calls only the web API methods it needs, so this is Slack's own web client boot traffic that `log inspect` recorded. Nothing in log-cli reads the flags.

## What can go wrong

Like every Slack web API answer it carries `ok`; with `ok: false` the `error` field says why (for example `not_authed`, `invalid_auth`, `ratelimited`). Both recorded answers were 200 with no error, so nothing here stopped the inspect run.
