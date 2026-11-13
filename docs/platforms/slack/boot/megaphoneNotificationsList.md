# megaphoneNotificationsList

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | boot |
| Kind | query |
| doc_id | — |
| Path | `/api/megaphone.notifications.list` |
| Sends | `------WebKitFormBoundaryQy8m2kZejs0F1edr
Content-Disposition: form-data; name`, `------WebKitFormBoundarysc00wkfN0SpO5oaj
Content-Disposition: form-data; name`, `------WebKitFormBoundarynOUC5X2qRikE1mHd
Content-Disposition: form-data; name`, `------WebKitFormBoundaryjJgVoI0ckgJPk0lY
Content-Disposition: form-data; name`, `------WebKitFormBoundarykOLlhd5pMoLAuhUF
Content-Disposition: form-data; name` |
| Reads | `ok`, `notifications.client_footer`, `notifications.client_header_right`, `notifications.message_pane`, `notifications.sidebar_footer`, `notifications.launch_modal`, `notifications.in_product_coachmark`, `notifications.in_product_glow`, `notifications.education_user_group_sections_coachmark`, `notifications.quick_reactions`, `notifications.message_actions_labels`, `notifications.welcome_space` and 28 more |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous`, `runs/inspect/20261103T065639_mattSlack/script29.js:169 oYBt`, `runs/inspect/20261103T065639_mattSlack/script3.js:2977 oYBt` |
| rea | `ev_e17cfbdfab177a94900b80d1ca7b2fe660af932547648ecd8e88b642d2eb9d73` |

Seen 5 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 2 | 200 | 513–527 ms | 7549–7573 ms | — |
| inspect | step 6: goto /client/<teamId:1>/<channelId:1> | 3 | 200 | 322–493 ms | 5031–7884 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 527 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689064.901",
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
    "------WebKitFormBoundaryQy8m2kZejs0F1edr\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundaryQy8m2kZejs0F1edr\r\nContent-Disposition: form-data; name=\"event\"\r\n\r\n{\"type\":\"request_spaces\",\"spaces\":[\"client_footer\",\"client_header_right\",\"message_pane\",\"sidebar_footer\",\"launch_modal\",\"in_product_coachmark\",\"in_product_glow\",\"education_user_group_… (1134 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "notifications": {
    "client_footer": {
      "name": "seasonal_delight_client_footer_revert_banner",
      "data": {
        "eligible_notifications": []
      }
    },
    "client_header_right": null,
    "message_pane": null,
    "sidebar_footer": null,
    "launch_modal": null,
    "in_product_coachmark": null,
    "in_product_glow": {
      "name": "later_todos_nux_tab_glow_coachmark",
      "data": {
        "eligible_notifications": []
      }
    },
    "education_user_group_sections_coachmark": null,
    "quick_reactions": {
      "name": "quick_reactions",
      "data": {
        "custom_emoji_1": "white_check_mark",
        "custom_emoji_2": "eyes",
        "custom_emoji_3": "raised_hands",
        "notify_user_about_user_pref": false,
        "send_click_data_for_reactions": true,
        "eligible_notifications": []
      }
    },
    "message_actions_labels": null,
    "welcome_space": null,
    "message_input": null,
    "activity_tab_sidebar": null,
    "activity_inbox_header": null,
    "tab_rail_home_tab": null,
    "admin_menu_bottom_banner": null,
    "sidebar_popout": null
  }
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/<teamId:1>/<channelId:1>: 200, 493 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689120.116",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "aVvVPXA0sak",
    "slack_route": "<teamId:1>",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundarynOUC5X2qRikE1mHd\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundarynOUC5X2qRikE1mHd\r\nContent-Disposition: form-data; name=\"event\"\r\n\r\n{\"type\":\"request_spaces\",\"spaces\":[\"client_footer\",\"client_header_right\",\"message_pane\",\"sidebar_footer\",\"launch_modal\",\"in_product_coachmark\",\"in_product_glow\",\"education_user_group_… (1134 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "notifications": {
    "client_footer": {
      "name": "seasonal_delight_client_footer_revert_banner",
      "data": {
        "eligible_notifications": []
      }
    },
    "client_header_right": null,
    "message_pane": null,
    "sidebar_footer": null,
    "launch_modal": null,
    "in_product_coachmark": null,
    "in_product_glow": {
      "name": "later_todos_nux_tab_glow_coachmark",
      "data": {
        "eligible_notifications": []
      }
    },
    "education_user_group_sections_coachmark": null,
    "quick_reactions": {
      "name": "quick_reactions",
      "data": {
        "custom_emoji_1": "white_check_mark",
        "custom_emoji_2": "eyes",
        "custom_emoji_3": "raised_hands",
        "notify_user_about_user_pref": false,
        "send_click_data_for_reactions": true,
        "eligible_notifications": []
      }
    },
    "message_actions_labels": null,
    "welcome_space": null,
    "message_input": null,
    "activity_tab_sidebar": null,
    "activity_inbox_header": null,
    "tab_rail_home_tab": null,
    "admin_menu_bottom_banner": null,
    "sidebar_popout": null
  }
}
```

<!-- facts:end -->

## What it does

Lists in-product notices Slack wants to show (`notifications.client_footer`, `launch_modal`, `in_product_coachmark`, and others). It fired twice during step 4 (`goto /client`, 513-527 ms) and three times during step 6 (322-493 ms), all 200.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`) works through `GabrielCore` on curl_cffi, which signs in with the `d` cookie and calls only the web API methods it needs, so this is Slack's own web client boot traffic that `log inspect` recorded. The notices are screen decoration that the engine never renders.

## What can go wrong

Like every Slack web API answer it carries `ok`; with `ok: false` the `error` field says why (for example `not_authed`, `invalid_auth`, `ratelimited`). All five recorded answers were 200. A notice returned here could open a modal over the page, which matters only to browser steps, not to the direct engine.
