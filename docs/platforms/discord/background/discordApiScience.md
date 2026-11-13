# discordApiScience

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/science` |
| Sends | `events` |
| Reads | — |
| Called from | `runs/inspect/20261113T044840_<name:1>/script0.js:232 625075`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 559868`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 961943`, `runs/inspect/20261113T044840_<name:1>/script1294.js:1 634654` |
| rea | `ev_a2c13a863ad5f319eaac4d44d769e6d522d9fe84530518651d5e0ef88672c56b` |

Seen 142 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 5 | 204 | 273–485 ms | 9009–12359 ms | — |
| inspect | step 2: snapshot | 16 | 204 | 287–485 ms | 8909–52433 ms | — |
| inspect | step 4: press Enter | 6 | 204 | 267–490 ms | 7564–10902 ms | — |
| inspect | step 5: wait 75s | 25 | 204 | 273–727 ms | 75767–412983 ms | — |
| inspect | step 1: goto /login | 18 | 204 | 272–480 ms | 3263–46934 ms | — |
| inspect | step 3: goto /login | 4 | 204 | 291–396 ms | 5385–47260 ms | — |
| inspect | step 5: click e40 | 8 | 204 | 306–511 ms | 816–13580 ms | — |
| inspect | step 7: snapshot | 4 | 204 | 299–529 ms | 16081–19305 ms | — |
| inspect | step 8: click e221 | 2 | 204 | 280–323 ms | 1656–3422 ms | — |
| inspect | step 9: goto /channels/@me | 5 | 204 | 277–391 ms | 6423–10573 ms | — |
| inspect | step 10: click e1454 | 3 | 204 | 281–320 ms | 2355–3177 ms | — |
| inspect | step 12: press Enter | 1 | 204 | 337 ms | 964 ms | — |
| inspect | step 13: press PageUp | 1 | 204 | 308 ms | 651 ms | — |
| inspect | step 15: press PageUp | 11 | 204 | 281–494 ms | 47194–78449 ms | — |
| inspect | step 17: click e180 | 1 | 204 | 342 ms | 2378 ms | — |
| inspect | step 18: click e3208 | 2 | 204 | 281–318 ms | 1563–7053 ms | — |
| inspect | step 19: type e3935 | 1 | 204 | 296 ms | 522 ms | — |
| inspect | step 20: press Enter | 1 | 204 | 327 ms | 8110 ms | — |
| inspect | step 24: snapshot | 5 | 204 | 274–344 ms | 12923–20365 ms | — |
| inspect | step 25: goto /channels/@me | 3 | 204 | 292–337 ms | 5903–9334 ms | — |
| inspect | step 26: press Control+k | 2 | 204 | 316–330 ms | 532–537 ms | — |
| inspect | step 28: press Enter | 2 | 204 | 283–318 ms | 1132–1155 ms | — |
| inspect | step 29: type e3276 | 1 | 204 | 324 ms | 7422 ms | — |
| inspect | step 31: wait 60s | 3 | 204 | 280–567 ms | 40027–243549 ms | — |
| inspect | step 2: wait 8s | 6 | 204 | 273–319 ms | 22473–28128 ms | — |
| inspect | step 1: goto /channels/@me | 3 | 204 | 301–321 ms | 10837–12629 ms | — |
| inspect | Stopping after 1 step(s). | 3 | 204 | 273–490 ms | 1179–5845 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T044840_<name:1>**, step 1: goto /login: 204, 319 ms

Sent:

```json
{
  "events": [
    {
      "type": "libdiscore_loaded",
      "properties": {
        "client_track_timestamp": 1794545333913,
        "event_sequence_number": 1,
        "success": true,
        "experimental_features": [],
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 0,
        "launch_signature": "d02bcd25-a0eb-4106-812a-4b37defeb286",
        "client_send_timestamp": 1794545337661
      }
    },
    {
      "type": "experiment_user_evaluation_exposed",
      "properties": {
        "client_track_timestamp": 1794545334133,
        "event_sequence_number": 2,
        "evaluation_id": "e9edfa4",
        "experiment": "2026-05-server-theme-user",
        "exposure_location": "useActiveGuildTheme",
        "unit_type": "user",
        "tracked_variation_id": 1,
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 1,
        "launch_signature": "d02bcd25-a0eb-4106-812a-4b37defeb286",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1794545337661
      }
    },
    {
      "type": "experiment_user_evaluation_exposed",
      "properties": {
        "client_track_timestamp": 1794545334663,
        "event_sequence_number": 3,
        "evaluation_id": "e9edfa4",
        "experiment": "2026-08-dcf-new-user-cooldown",
        "exposure_location": "useDcfNewUserCooldown",
        "unit_type": "user",
        "tracked_variation_id": 0,
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 1,
        "launch_signature": "d02bcd25-a0eb-4106-812a-4b37defeb286",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1794545337661
      }
    },
    {
      "type": "login_viewed",
      "properties": {
        "client_track_timestamp": 1794545336677,
        "event_sequence_number": 4,
        "login_source": null,
        "authenticated": true,
        "location": "Non-Invite Login Page",
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 3,
        "launch_signature": "d02bcd25-a0eb-4106-812a-4b37defeb286",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1794545337661
      }
    },
    {
      "type": "app_web_perf_startup_metrics",
      "properties": {
        "client_track_timestamp": 1794545336713,
        "event_sequence_number": 5,
        "load_id": "3a7a5b0c-e3e4-4f93-aa1b-121efdf6e705",
        "metric_name": "tti",
        "url_root_path": "login",
        "was_authenticated": true,
        "time_first_render_after_ready_end": 7089,
        "script_cost_loaf_supported": true,
        "script_cost_unattributed_eval_ms": 0,
        "script_cost_total_count": 599,
        "script_cost_reported_count": 20,
        "script_cost_url": [
          "/assets/web.637e82960de4dc33.js",
          "/assets/f4ee462337834e02.js",
          "/assets/5d589a7e3b3504f1.js",
          "/assets/675110210e2fb008.js",
          "/assets/87d569fbd37f6690.js",
          "/assets/3c9379d40707abdc.js",
          "… 14 more"
        ],
        "script_cost_download_ms": [
          2429,
          1977,
          1347,
          1345,
          1345,
          1343,
          "… 14 more"
        ],
        "script_cost_transfer_size_bytes": [
          3543003,
          41566,
          934,
          3730,
          707,
          804,
          "… 14 more"
        ],
        "script_cost_from_cache": [
          false,
          false,
          false,
          false,
          false,
          false,
          "… 14 more"
        ],
        "script_cost_initial_eval_ms": [
          763,
          0,
          0,
          0,
          0,
          0,
          "… 14 more"
        ],
        "script_cost_total_eval_ms": [
          763,
          0,
          0,
          0,
          0,
          0,
          "… 14 more"
        ],
        "script_cost_eval_attributed": [
          true,
          false,
          false,
          false,
          false,
          false,
          "… 14 more"
        ],
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 3,
        "launch_signature": "d02bcd25-a0eb-4106-812a-4b37defeb286",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1794545337661
      }
    },
    {
      "type": "app_ui_viewed",
      "properties": {
        "client_track_timestamp": 1794545336789,
        "event_sequence_number": 6,
        "total_compressed_byte_size": 4692555,
        "total_uncompressed_byte_size": 20754364,
        "total_transfer_byte_size": 0,
        "js_compressed_byte_size": 729241,
        "js_uncompressed_byte_size": 2926786,
        "js_transfer_byte_size": 0,
        "css_compressed_byte_size": 19492,
        "css_uncompressed_byte_size": 87569,
        "css_transfer_byte_size": 0,
        "load_id": "3a7a5b0c-e3e4-4f93-aa1b-121efdf6e705",
        "screen_name": "<username:1>",
        "duration_ms_since_app_opened": 7071,
        "app_hardware_acceleration_enabled": true,
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 3,
        "launch_signature": "d02bcd25-a0eb-4106-812a-4b37defeb286",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1794545337661
      }
    },
    "… 1 more"
  ]
}
```

Answered:

```json
null
```

**runs/inspect/20261113T044840_<name:1>**, Stopping after 1 step(s).: 204, 281 ms

Sent:

```json
{
  "events": [
    {
      "type": "quest_content_loaded",
      "properties": {
        "client_track_timestamp": 1794545380358,
        "client_heartbeat_session_id": "18fa4278-989f-4a8a-a0cd-a6ac55dae24e",
        "event_sequence_number": 48,
        "client_ad_session_id": "f20855a6-d7de-453b-9ffc-da1aa6c9dfe7",
        "billing_session_id": "18fa4278-989f-4a8a-a0cd-a6ac55dae24e",
        "ad_content_id": "0",
        "is_targeted": false,
        "creative_type": 4,
        "metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMUVRzcFNNalJKK2tuaFBta3JpeTlqSW52OVlPLzhJZ2U4NitEckQwSFBZUXVPYzdta3R2WVZod3F0RHB2UWk4UEZPSmlnTWVkVHQ4M01hRFBwSXZndGVDQ3FDSldlVzU4dG9MUDlkZHhCd1F6Z3lrSHBXUy8zMzdKWFhMbWY1UE9QWUQ2dm5iOU1Kd0tiMFoxZVl5WUFDY3FVTzF3Vi9qcGhTaGVTYTdMZG1JRVNNWk9TTklTdERMTW9jSXFvVDZGRk1pNTdnM0dmT05oNTJLSG1vQzNFZEI0c2lDdmREcUlRcDRiTUNFalRTcUhzRXFqSnoxMTZLUEsySC9D… (852 chars)",
        "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKS2huOU5Sa3VRYXNlaElFMkdGZ3VRdGNUS0ZaRUtRK0ZxdmVudWRuL0FLdEdrdTV6ajZXbkVVWjcyNGRJbU0yazVvSnFJZldYUndmT0xrUFQ3amRmWkNvVGlaZTRpNitINWZrTEJ2eFNOMmVleGptQitzMGdkWnlwTzNRdUk1TVp1V2ZRUm5GZ1BVdTZSbEc3eEtsVHNFQT09In0=",
        "decision_id": "e941b5b6-3b21-4ecc-b498-57da9db62dfa",
        "triggered_by_status_change": false,
        "impression_id": "d820e4fa-8abd-45d7-adda-00415ffc6297",
        "is_quest_enrollment_blocked": false,
        "content_id": 10,
        "content_name": "QUEST_BAR_V2",
        "client_performance_memory": 0,
        "accessibility_features": 524416,
        "rendered_locale": "en-US",
        "uptime_app": 47,
        "launch_signature": "d02bcd25-a0eb-4106-812a-4b37defeb286",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_uuid": "UABCI2oq6BPh8X6X7rI806EBAAAjAAAA",
        "client_send_timestamp": 1794545380723
      }
    }
  ]
}
```

Answered:

```json
null
```

**runs/inspect/20261030T222341_<name:1>**, step 1: goto /channels/@me: 204, 321 ms

Sent:

```json
{
  "events": [
    {
      "type": "libdiscore_loaded",
      "properties": {
        "client_track_timestamp": 1793399045821,
        "client_heartbeat_session_id": "89078896-68d6-43c2-8cf6-7676bb88761e",
        "event_sequence_number": 1,
        "success": true,
        "experimental_features": [
          "2026-10-wasm-precompressed-brotli:1"
        ],
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 0,
        "launch_signature": "7242838a-60a3-40ff-8b74-371f049c70d6",
        "client_send_timestamp": 1793399050810
      }
    },
    {
      "type": "client_heartbeat",
      "properties": {
        "client_track_timestamp": 1793399045844,
        "client_heartbeat_session_id": "89078896-68d6-43c2-8cf6-7676bb88761e",
        "event_sequence_number": 2,
        "client_heartbeat_initialization_timestamp": 1793399045821,
        "client_heartbeat_version": 31,
        "is_idle": false,
        "idle_duration_ms": 1793399045843,
        "is_afk": false,
        "is_system_suspended": false,
        "is_system_locked": false,
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 0,
        "launch_signature": "7242838a-60a3-40ff-8b74-371f049c70d6",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1793399050810
      }
    },
    {
      "type": "client_ad_heartbeat",
      "properties": {
        "client_track_timestamp": 1793399049622,
        "client_heartbeat_session_id": "89078896-68d6-43c2-8cf6-7676bb88761e",
        "event_sequence_number": 3,
        "client_ad_session_id": "7aa0183c-a722-4bb4-a9c7-700cd2fff0fa",
        "client_heartbeat_initialization_timestamp": 1793399049480,
        "client_heartbeat_version": 3,
        "client_performance_memory": 0,
        "accessibility_features": 524416,
        "rendered_locale": "en-US",
        "uptime_app": 4,
        "launch_signature": "7242838a-60a3-40ff-8b74-371f049c70d6",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1793399050810
      }
    },
    {
      "type": "dismissible_content_shown_before_connection_open",
      "properties": {
        "client_track_timestamp": 1793399049624,
        "client_heartbeat_session_id": "89078896-68d6-43c2-8cf6-7676bb88761e",
        "event_sequence_number": 4,
        "content_type": "NITRO_FILE_UPLOAD_1GB_UPSELL",
        "group_name": null,
        "latest_version": null,
        "guild_id": null,
        "snowflake_id": null,
        "client_performance_memory": 0,
        "accessibility_features": 524416,
        "rendered_locale": "en-US",
        "uptime_app": 4,
        "launch_signature": "7242838a-60a3-40ff-8b74-371f049c70d6",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1793399050810
      }
    },
    {
      "type": "session_start_client",
      "properties": {
        "client_track_timestamp": 1793399049866,
        "client_heartbeat_session_id": "89078896-68d6-43c2-8cf6-7676bb88761e",
        "event_sequence_number": 5,
        "client_performance_memory": 0,
        "accessibility_features": 524416,
        "rendered_locale": "en-US",
        "uptime_app": 4,
        "launch_signature": "7242838a-60a3-40ff-8b74-371f049c70d6",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1793399050810
      }
    },
    {
      "type": "gateway_connected",
      "properties": {
        "client_track_timestamp": 1793399049926,
        "client_heartbeat_session_id": "89078896-68d6-43c2-8cf6-7676bb88761e",
        "event_sequence_number": 6,
        "num_failed_connect_attempts": 0,
        "gateway_url": "wss://gateway.discord.gg",
        "is_reconnect": false,
        "is_fast_connect": false,
        "duration_ms_since_first_connect_attempt": 430,
        "duration_ms_since_connect_attempt_start": 430,
        "client_performance_memory": 0,
        "accessibility_features": 524416,
        "rendered_locale": "en-US",
        "uptime_app": 4,
        "launch_signature": "7242838a-60a3-40ff-8b74-371f049c70d6",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1793399050810
      }
    },
    "… 2 more"
  ]
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

Discord's analytics events (what was clicked, opened and seen), batched in the background.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
