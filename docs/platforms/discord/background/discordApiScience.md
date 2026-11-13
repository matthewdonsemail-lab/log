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
| Called from | `runs/inspect/20261113T141543_<name:1>/script1.js:232 625075`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 559868`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 961943`, `runs/inspect/20261113T141543_<name:1>/script1294.js:1 634654` |
| rea | `ev_a9fa69c7432fa1fcc41058ba491790444cfcec72f4c96150b3d2566a4e5def67` |

Seen 156 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 5 | 204 | 273–485 ms | 9009–12359 ms | — |
| inspect | step 2: snapshot | 16 | 204 | 287–485 ms | 8909–52433 ms | — |
| inspect | step 4: press Enter | 6 | 204 | 267–490 ms | 7564–10902 ms | — |
| inspect | step 5: wait 75s | 25 | 204 | 273–727 ms | 75767–412983 ms | — |
| inspect | step 1: goto /login | 32 | 204 | 272–672 ms | 3263–1111934 ms | — |
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

**runs/inspect/20261113T141543_<name:1>**, step 1: goto /login: 204, 318 ms

Sent:

```json
{
  "events": [
    {
      "type": "libdiscore_loaded",
      "properties": {
        "client_track_timestamp": 1794579361435,
        "event_sequence_number": 1,
        "success": true,
        "experimental_features": [],
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 0,
        "launch_signature": "da0ec52b-87ca-46e9-9514-e7bc3ec174ea",
        "client_send_timestamp": 1794579363093
      }
    },
    {
      "type": "login_viewed",
      "properties": {
        "client_track_timestamp": 1794579362397,
        "event_sequence_number": 2,
        "login_source": null,
        "authenticated": true,
        "location": "Non-Invite Login Page",
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 1,
        "launch_signature": "da0ec52b-87ca-46e9-9514-e7bc3ec174ea",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1794579363093
      }
    },
    {
      "type": "app_web_perf_startup_metrics",
      "properties": {
        "client_track_timestamp": 1794579362518,
        "event_sequence_number": 3,
        "load_id": "312b7cea-30e4-45c9-8d22-cab15398b8d0",
        "metric_name": "tti",
        "url_root_path": "login",
        "was_authenticated": true,
        "time_first_render_after_ready_end": 4245,
        "script_cost_loaf_supported": true,
        "script_cost_unattributed_eval_ms": 31,
        "script_cost_total_count": 530,
        "script_cost_reported_count": 20,
        "script_cost_url": [
          "/assets/619666.39a9c889d48f07ce.js",
          "/assets/web.637e82960de4dc33.js",
          "/assets/572018.46aab2493cfbe4fb.js",
          "/assets/14335.8f50c7e3cc239ed9.js",
          "/assets/363189.f566234fc8638ced.js",
          "/assets/641877.378be635771f416b.js",
          "… 14 more"
        ],
        "script_cost_download_ms": [
          0,
          0,
          376,
          474,
          470,
          470,
          "… 14 more"
        ],
        "script_cost_transfer_size_bytes": [
          0,
          0,
          0,
          0,
          0,
          0,
          "… 14 more"
        ],
        "script_cost_from_cache": [
          false,
          false,
          true,
          true,
          true,
          true,
          "… 14 more"
        ],
        "script_cost_initial_eval_ms": [
          0,
          825,
          0,
          0,
          0,
          0,
          "… 14 more"
        ],
        "script_cost_total_eval_ms": [
          1079,
          825,
          102,
          0,
          0,
          0,
          "… 14 more"
        ],
        "script_cost_eval_attributed": [
          true,
          true,
          true,
          false,
          false,
          false,
          "… 14 more"
        ],
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 1,
        "launch_signature": "da0ec52b-87ca-46e9-9514-e7bc3ec174ea",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1794579363093
      }
    },
    {
      "type": "app_ui_viewed",
      "properties": {
        "client_track_timestamp": 1794579362637,
        "event_sequence_number": 4,
        "total_compressed_byte_size": 2291525,
        "total_uncompressed_byte_size": 8063806,
        "total_transfer_byte_size": 0,
        "js_compressed_byte_size": 731177,
        "js_uncompressed_byte_size": 2135098,
        "js_transfer_byte_size": 0,
        "css_compressed_byte_size": 126006,
        "css_uncompressed_byte_size": 519463,
        "css_transfer_byte_size": 0,
        "load_id": "312b7cea-30e4-45c9-8d22-cab15398b8d0",
        "screen_name": "<username:1>",
        "duration_ms_since_app_opened": 4143,
        "app_hardware_acceleration_enabled": true,
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 2,
        "launch_signature": "da0ec52b-87ca-46e9-9514-e7bc3ec174ea",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1794579363093
      }
    },
    {
      "type": "impression_multi_account_switch_landing",
      "properties": {
        "client_track_timestamp": 1794579362824,
        "event_sequence_number": 5,
        "impression_type": "modal",
        "location_section": "impression_multi_account_switch_landing",
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 2,
        "launch_signature": "da0ec52b-87ca-46e9-9514-e7bc3ec174ea",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1794579363093
      }
    }
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
