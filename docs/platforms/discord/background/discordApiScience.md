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
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_8cc8df3885612ca767e27a638d04cf6acc9ca7088dd1bcdbc3e850e9b459c9ac` |

Seen 235 time(s) in 13 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 5 | 204 | 273–485 ms | 9009–12359 ms | — |
| inspect | step 2: snapshot | 16 | 204 | 287–485 ms | 8909–52433 ms | — |
| inspect | step 4: press Enter | 6 | 204 | 267–490 ms | 7564–10902 ms | — |
| inspect | step 5: wait 75s | 25 | 204 | 273–727 ms | 75767–412983 ms | — |
| inspect | step 1: goto /login | 87 | 204 | 107–672 ms | 786–1111934 ms | — |
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
| inspect | step 1: goto /channels/@me | 14 | 204 | 115–326 ms | 1776–12629 ms | — |
| inspect | Stopping after 1 step(s). | 3 | 204 | 273–490 ms | 1179–5845 ms | — |
| inspect | signIn: password typed; submitting with Enter | 1 | 204 | 160 ms | 392 ms | — |
| inspect | step 5: wait 40s | 1 | 204 | 225 ms | 32196 ms | — |
| inspect | step 6: wait 45s | 9 | 204 | 105–144 ms | 6126–25852 ms | — |
| inspect | step 2: saveState | 2 | 204 | 111–247 ms | 8891–9221 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T231616_deepman2**, step 1: goto /login: 204, 118 ms

Sent:

```json
{
  "events": [
    {
      "type": "libdiscore_loaded",
      "properties": {
        "client_track_timestamp": 1794611784062,
        "event_sequence_number": 1,
        "success": true,
        "experimental_features": [],
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 0,
        "launch_signature": "5d2a4289-8209-4283-9e4e-cb8a4e52e40f",
        "client_send_timestamp": 1794611785020
      }
    },
    {
      "type": "login_viewed",
      "properties": {
        "client_track_timestamp": 1794611784706,
        "event_sequence_number": 2,
        "login_source": null,
        "authenticated": true,
        "location": "Non-Invite Login Page",
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 0,
        "launch_signature": "5d2a4289-8209-4283-9e4e-cb8a4e52e40f",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 965,
        "client_send_timestamp": 1794611785020
      }
    },
    {
      "type": "app_web_perf_startup_metrics",
      "properties": {
        "client_track_timestamp": 1794611784717,
        "event_sequence_number": 3,
        "load_id": "45f502c0-8f15-4c38-b72b-1533f2785dd9",
        "metric_name": "tti",
        "url_root_path": "login",
        "was_authenticated": true,
        "time_first_render_after_ready_end": 2132,
        "script_cost_loaf_supported": true,
        "script_cost_unattributed_eval_ms": 0,
        "script_cost_total_count": 444,
        "script_cost_reported_count": 20,
        "script_cost_url": [
          "/assets/web.de87d610f53637ad.js",
          "/assets/619666.39a9c889d48f07ce.js",
          "/assets/bfd4a6f49b9d55af.js",
          "/assets/184782.5d5ce3c335610c0d.js",
          "/assets/847727.df0adb53ace998ba.js",
          "/assets/419070.a248636d4a4a7b5a.js",
          "… 14 more"
        ],
        "script_cost_download_ms": [
          861,
          0,
          208,
          286,
          279,
          276,
          "… 14 more"
        ],
        "script_cost_transfer_size_bytes": [
          3553955,
          0,
          472701,
          0,
          0,
          0,
          "… 14 more"
        ],
        "script_cost_from_cache": [
          false,
          false,
          false,
          true,
          true,
          true,
          "… 14 more"
        ],
        "script_cost_initial_eval_ms": [
          272,
          0,
          89,
          0,
          0,
          0,
          "… 14 more"
        ],
        "script_cost_total_eval_ms": [
          272,
          340,
          89,
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
        "uptime_app": 0,
        "launch_signature": "5d2a4289-8209-4283-9e4e-cb8a4e52e40f",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 965,
        "client_send_timestamp": 1794611785020
      }
    },
    {
      "type": "app_ui_viewed",
      "properties": {
        "client_track_timestamp": 1794611784719,
        "event_sequence_number": 4,
        "total_compressed_byte_size": 4707355,
        "total_uncompressed_byte_size": 20354097,
        "total_transfer_byte_size": 0,
        "js_compressed_byte_size": 680629,
        "js_uncompressed_byte_size": 2497666,
        "js_transfer_byte_size": 0,
        "css_compressed_byte_size": 176852,
        "css_uncompressed_byte_size": 673656,
        "css_transfer_byte_size": 0,
        "load_id": "45f502c0-8f15-4c38-b72b-1533f2785dd9",
        "screen_name": "<username:1>",
        "duration_ms_since_app_opened": 2125,
        "app_hardware_acceleration_enabled": true,
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 0,
        "launch_signature": "5d2a4289-8209-4283-9e4e-cb8a4e52e40f",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 965,
        "client_send_timestamp": 1794611785020
      }
    },
    {
      "type": "impression_multi_account_switch_landing",
      "properties": {
        "client_track_timestamp": 1794611784906,
        "event_sequence_number": 5,
        "impression_type": "modal",
        "location_section": "impression_multi_account_switch_landing",
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 1,
        "launch_signature": "5d2a4289-8209-4283-9e4e-cb8a4e52e40f",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 965,
        "client_send_timestamp": 1794611785020
      }
    }
  ]
}
```

Answered:

```json
null
```

**runs/inspect/20261113T231616_deepman2**, signIn: password typed; submitting with Enter: 204, 160 ms

Sent:

```json
{
  "events": [
    {
      "type": "open_modal",
      "properties": {
        "client_track_timestamp": 1794611819182,
        "event_sequence_number": 7,
        "type": "Guild Join Captcha",
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 35,
        "launch_signature": "5d2a4289-8209-4283-9e4e-cb8a4e52e40f",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 965,
        "client_uuid": "QiBC2OQZzRUysZRJXKgy16EBAAABAAAA",
        "client_send_timestamp": 1794611819184
      }
    },
    {
      "type": "open_modal",
      "properties": {
        "client_track_timestamp": 1794611819182,
        "event_sequence_number": 8,
        "type": "Captcha Modal",
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 35,
        "launch_signature": "5d2a4289-8209-4283-9e4e-cb8a4e52e40f",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 965,
        "client_uuid": "QiBC2OQZzRUysZRJXKgy16EBAAACAAAA",
        "client_send_timestamp": 1794611819184
      }
    },
    {
      "type": "captcha_event",
      "properties": {
        "client_track_timestamp": 1794611819182,
        "event_sequence_number": 9,
        "captcha_event_name": "initial-load",
        "captcha_service": "hcaptcha",
        "sitekey": "a9b5fb07-92ff-493f-86fe-352a2803b3df",
        "captcha_flow_key": "6c4c1504-9c87-4cc7-9b25-e617212357cf",
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 35,
        "launch_signature": "5d2a4289-8209-4283-9e4e-cb8a4e52e40f",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 965,
        "client_uuid": "QiBC2OQZzRUysZRJXKgy16EBAAADAAAA",
        "client_send_timestamp": 1794611819184
      }
    }
  ]
}
```

Answered:

```json
null
```

**runs/inspect/20261113T231616_deepman2**, step 5: wait 40s: 204, 225 ms

Sent:

```json
{
  "events": [
    {
      "type": "captcha_event",
      "properties": {
        "client_track_timestamp": 1794611881111,
        "event_sequence_number": 10,
        "captcha_event_name": "open",
        "captcha_service": "hcaptcha",
        "sitekey": "a9b5fb07-92ff-493f-86fe-352a2803b3df",
        "captcha_flow_key": "b02bff83-01db-4ced-ac69-689ea56089f7",
        "client_performance_memory": 0,
        "accessibility_features": 128,
        "rendered_locale": "en-US",
        "uptime_app": 97,
        "launch_signature": "5d2a4289-8209-4283-9e4e-cb8a4e52e40f",
        "client_rtc_state": "DISCONNECTED",
        "client_app_state": "focused",
        "client_viewport_width": 929,
        "client_viewport_height": 965,
        "client_uuid": "QiBC2OQZzRUysZRJXKgy16EBAAAEAAAA",
        "client_send_timestamp": 1794611881118
      }
    }
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
