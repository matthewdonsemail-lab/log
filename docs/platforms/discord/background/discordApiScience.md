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
| Called from | `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1059.js:1 parse`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_2070dc40e13af93274e72f1888affeb563d50467d7eb14b18189f1443a1c0d33` |

Seen 116 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 5 | 204 | 273–485 ms | 9009–12359 ms | — |
| inspect | step 2: snapshot | 6 | 204 | 297–424 ms | 8909–22188 ms | — |
| inspect | step 4: press Enter | 6 | 204 | 267–490 ms | 7564–10902 ms | — |
| inspect | step 5: wait 75s | 25 | 204 | 273–727 ms | 75767–412983 ms | — |
| inspect | step 1: goto /login | 8 | 204 | 294–466 ms | 3263–19363 ms | — |
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

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder**, step 1: goto /login: 204, 389 ms

Sent:

```json
{
  "events": [
    {
      "type": "libdiscore_loaded",
      "properties": {
        "client_track_timestamp": 1793173310772,
        "event_sequence_number": 1,
        "success": true,
        "experimental_features": [
          "2026-10-wasm-precompressed-brotli:1"
        ],
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 0,
        "launch_signature": "d00245ea-668b-47d6-9700-e828a267d6f5",
        "client_send_timestamp": 1793173321354
      }
    },
    {
      "type": "login_viewed",
      "properties": {
        "client_track_timestamp": 1793173312208,
        "event_sequence_number": 2,
        "login_source": null,
        "authenticated": true,
        "location": "Non-Invite Login Page",
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 2,
        "launch_signature": "d00245ea-668b-47d6-9700-e828a267d6f5",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1793173321354
      }
    },
    {
      "type": "app_web_perf_startup_metrics",
      "properties": {
        "client_track_timestamp": 1793173312295,
        "event_sequence_number": 3,
        "load_id": "4e2033f3-f004-4038-b70c-563eb151a51c",
        "metric_name": "tti",
        "url_root_path": "login",
        "was_authenticated": true,
        "time_first_render_after_ready_end": 6365,
        "script_cost_loaf_supported": true,
        "script_cost_unattributed_eval_ms": 0,
        "script_cost_total_count": 384,
        "script_cost_reported_count": 20,
        "script_cost_url": [
          "/assets/web.33a8a649a2fda558.js",
          "/assets/556707.bb1a25f3c212ce8f.js",
          "/assets/650195.0e8e00a4ed4dbb1c.js",
          "/assets/67702.4e066046965d6b8a.js",
          "/assets/662387.dffd15f867960c06.js",
          "/assets/31544.2ba7e1214ad9444a.js",
          "… 14 more"
        ],
        "script_cost_download_ms": [
          1480,
          0,
          512,
          511,
          510,
          510,
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
          true,
          false,
          true,
          true,
          true,
          true,
          "… 14 more"
        ],
        "script_cost_initial_eval_ms": [
          1543,
          0,
          0,
          0,
          0,
          0,
          "… 14 more"
        ],
        "script_cost_total_eval_ms": [
          1543,
          796,
          0,
          0,
          0,
          0,
          "… 14 more"
        ],
        "script_cost_eval_attributed": [
          true,
          true,
          false,
          false,
          false,
          false,
          "… 14 more"
        ],
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 2,
        "launch_signature": "d00245ea-668b-47d6-9700-e828a267d6f5",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1793173321354
      }
    },
    {
      "type": "client_heartbeat",
      "properties": {
        "client_track_timestamp": 1793173312589,
        "client_heartbeat_session_id": "042a6464-5284-440e-831b-0ed816011058",
        "event_sequence_number": 4,
        "client_heartbeat_initialization_timestamp": 1793173312588,
        "client_heartbeat_version": 31,
        "is_idle": false,
        "idle_duration_ms": 1793173312589,
        "is_afk": false,
        "is_system_suspended": false,
        "is_system_locked": false,
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 2,
        "launch_signature": "d00245ea-668b-47d6-9700-e828a267d6f5",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1793173321354
      }
    },
    {
      "type": "client_ad_heartbeat",
      "properties": {
        "client_track_timestamp": 1793173312643,
        "client_heartbeat_session_id": "042a6464-5284-440e-831b-0ed816011058",
        "event_sequence_number": 5,
        "client_ad_session_id": "8b8ce89d-11bc-4e79-b242-5c10647e14f5",
        "client_heartbeat_initialization_timestamp": 1793173312608,
        "client_heartbeat_version": 3,
        "client_performance_memory": 0,
        "accessibility_features": 524416,
        "rendered_locale": "en-US",
        "uptime_app": 2,
        "launch_signature": "d00245ea-668b-47d6-9700-e828a267d6f5",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1793173321354
      }
    },
    {
      "type": "gateway_connected",
      "properties": {
        "client_track_timestamp": 1793173312662,
        "client_heartbeat_session_id": "042a6464-5284-440e-831b-0ed816011058",
        "event_sequence_number": 6,
        "num_failed_connect_attempts": 0,
        "gateway_url": "wss://gateway.discord.gg",
        "is_reconnect": false,
        "is_fast_connect": false,
        "duration_ms_since_first_connect_attempt": 8,
        "duration_ms_since_connect_attempt_start": 8,
        "client_performance_memory": 0,
        "accessibility_features": 524416,
        "rendered_locale": "en-US",
        "uptime_app": 2,
        "launch_signature": "d00245ea-668b-47d6-9700-e828a267d6f5",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1793173321354
      }
    },
    "… 6 more"
  ]
}
```

Answered:

```json
null
```

**runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder**, step 2: wait 8s: 204, 319 ms

Sent:

```json
{
  "events": [
    {
      "type": "quest_hover",
      "properties": {
        "client_track_timestamp": 1793173389738,
        "client_heartbeat_session_id": "042a6464-5284-440e-831b-0ed816011058",
        "event_sequence_number": 25,
        "content_id": 47,
        "content_name": "QUEST_HOME_ENTRYPOINT",
        "client_performance_memory": 0,
        "accessibility_features": 524416,
        "rendered_locale": "en-US",
        "uptime_app": 79,
        "launch_signature": "d00245ea-668b-47d6-9700-e828a267d6f5",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_uuid": "UABCI2oq6BP4QB0Hnkp1gaEBAAAQAAAA",
        "client_send_timestamp": 1793173389750
      }
    }
  ]
}
```

Answered:

```json
null
```

**runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me/<id>: 204, 310 ms

Sent:

```json
{
  "events": [
    {
      "type": "libdiscore_loaded",
      "properties": {
        "client_track_timestamp": 1793170332937,
        "client_heartbeat_session_id": "76647484-56eb-47e1-a676-e51ce70342ac",
        "event_sequence_number": 1,
        "success": true,
        "experimental_features": [
          "2026-10-wasm-precompressed-brotli:1"
        ],
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 0,
        "launch_signature": "fb6d2ee3-b1a1-4522-9616-ca296a4d367b",
        "client_send_timestamp": 1793170338433
      }
    },
    {
      "type": "client_heartbeat",
      "properties": {
        "client_track_timestamp": 1793170332980,
        "client_heartbeat_session_id": "76647484-56eb-47e1-a676-e51ce70342ac",
        "event_sequence_number": 2,
        "client_heartbeat_initialization_timestamp": 1793169102300,
        "client_heartbeat_version": 31,
        "is_idle": false,
        "idle_duration_ms": 1793170332979,
        "is_afk": false,
        "is_system_suspended": false,
        "is_system_locked": false,
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 0,
        "launch_signature": "fb6d2ee3-b1a1-4522-9616-ca296a4d367b",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1793170338433
      }
    },
    {
      "type": "client_ad_heartbeat",
      "properties": {
        "client_track_timestamp": 1793170334440,
        "client_heartbeat_session_id": "76647484-56eb-47e1-a676-e51ce70342ac",
        "event_sequence_number": 3,
        "client_ad_session_id": "c139cbba-8718-4677-a6a8-4401494e07df",
        "client_heartbeat_initialization_timestamp": 1793170334269,
        "client_heartbeat_version": 3,
        "client_performance_memory": 0,
        "accessibility_features": 524416,
        "rendered_locale": "en-US",
        "uptime_app": 2,
        "launch_signature": "fb6d2ee3-b1a1-4522-9616-ca296a4d367b",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1793170338433
      }
    },
    {
      "type": "gateway_connected",
      "properties": {
        "client_track_timestamp": 1793170334440,
        "client_heartbeat_session_id": "76647484-56eb-47e1-a676-e51ce70342ac",
        "event_sequence_number": 4,
        "num_failed_connect_attempts": 0,
        "gateway_url": "wss://gateway.discord.gg",
        "is_reconnect": false,
        "is_fast_connect": true,
        "duration_ms_since_first_connect_attempt": 7,
        "duration_ms_since_connect_attempt_start": 7,
        "client_performance_memory": 0,
        "accessibility_features": 524416,
        "rendered_locale": "en-US",
        "uptime_app": 2,
        "launch_signature": "fb6d2ee3-b1a1-4522-9616-ca296a4d367b",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1793170338433
      }
    },
    {
      "type": "dismissible_content_shown_before_connection_open",
      "properties": {
        "client_track_timestamp": 1793170334442,
        "client_heartbeat_session_id": "76647484-56eb-47e1-a676-e51ce70342ac",
        "event_sequence_number": 5,
        "content_type": "NITRO_FILE_UPLOAD_1GB_UPSELL",
        "group_name": null,
        "latest_version": null,
        "guild_id": null,
        "snowflake_id": null,
        "client_performance_memory": 0,
        "accessibility_features": 524416,
        "rendered_locale": "en-US",
        "uptime_app": 2,
        "launch_signature": "fb6d2ee3-b1a1-4522-9616-ca296a4d367b",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_send_timestamp": 1793170338433
      }
    },
    {
      "type": "ready_payload_received",
      "properties": {
        "client_track_timestamp": 1793170337277,
        "client_heartbeat_session_id": "76647484-56eb-47e1-a676-e51ce70342ac",
        "event_sequence_number": 6,
        "compressed_byte_size": 755550,
        "uncompressed_byte_size": 6945986,
        "compression_algorithm": "zlib-stream",
        "packing_algorithm": "json",
        "unpack_duration_ms": 49,
        "identify_total_server_duration_ms": 602,
        "identify_api_duration_ms": 441,
        "identify_guilds_duration_ms": 60,
        "num_guilds": 97,
        "num_guild_channels": 7396,
        "num_guild_category_channels": 846,
        "presences_size": 2,
        "users_size": 271809,
        "read_states_size": 222107,
        "private_channels_size": 48230,
        "user_settings_size": 14566,
        "experiments_size": 8671,
        "user_guild_settings_size": 288046,
        "relationships_size": 105470,
        "remaining_data_size": 10359,
        "guild_channels_size": 4293752,
        "guild_members_size": 26074,
        "guild_presences_size": 2,
        "guild_roles_size": 904218,
        "guild_emojis_size": 418590,
        "guild_threads_size": 13524,
        "guild_stickers_size": 72143,
        "guild_events_size": 16394,
        "guild_features_size": 37385,
        "guild_remaining_data_size": 6068969,
        "size_metrics_duration_ms": 63,
        "duration_ms_since_identify_start": -1793170327926.2,
        "duration_ms_since_connection_start": -1793170327923.2,
        "duration_ms_since_emit_start": 1793170329780.2,
        "is_reconnect": false,
        "is_fast_connect": true,
        "did_force_clear_guild_hashes": false,
        "identify_uncompressed_byte_size": 0,
        "identify_compressed_byte_size": 0,
        "had_cache_at_startup": false,
        "used_cache_at_startup": false,
        "client_performance_memory": 0,
        "accessibility_features": 524416,
        "rendered_locale": "en-US",
        "uptime_app": 4,
        "launch_signature": "fb6d2ee3-b1a1-4522-9616-ca296a4d367b",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 917,
        "client_uuid": "UABCI2oq6BMSvZt4d9lHgaEBAAAAAAAA",
        "client_send_timestamp": 1793170338433
      }
    },
    "… 3 more"
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
