# apiGraphql

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/api/graphql` |
| Sends | `input`, `scale`, `render_succeeded`, `encrypted_context`, `failure_reason`, `device_id`, `captcha_response`, `device_id_for_iris_subscription`, `__relay_internal__pv__IGDMetaAIThreadingEnabledGKrelayprovider`, `data`, `surface_nux_ids`, `trigger_context`, `_request_data`, `payload`, `min_uq_seq_id`, `thread_fbid`, `__relay_internal__pv__IGDEnableOffMsysChatThemesQErelayprovider`, `__relay_internal__pv__IGDInitialMessagePageCountrelayprovider`, `folder`, `__relay_internal__pv__IGDIsProfessionalAccountGKrelayprovider`, `__relay_internal__pv__IGDPinnedThreadsRenderEnabledGKrelayprovider`, `__relay_internal__pv__IGDMaxUnreadMessagesCountrelayprovider`, `__relay_internal__pv__IGDThreadListActionsEnabledGKrelayprovider`, `newer_than_timestamp_ms`, `metadata`, `ig_thread_igid`, `offline_threading_id`, `recipient_igids`, `replied_to_client_context`, `replied_to_item_id`, `reply_to_message_id`, `sampled`, `text`, `mentions`, `mentioned_user_ids`, `commands`, `forwarded_from_thread_id`, `is_forwarded_from_own_message`, `send_attribution`, `attachment_fbid`, `thread_id` |
| Reads | `data.caa_login_web`, `extensions.server_metadata`, `extensions.is_final`, `data.xfb_auth_platform_anti_scripting_content`, `data.xfb_auth_platform_recaptcha_render_outcome`, `data.xfb_auth_platform_user_passed_google_recaptcha`, `data.get_slide_mailbox_for_iris_subscription`, `data.get_paginated_share_sheet_ranked_items`, `data.xdt_api__v1__feed__reels_tray`, `data.xdt_viewer`, `data.ig_quick_promotion_batch_fetch_root`, `data.xdt_api__v1__web__accounts__get_encrypted_credentials` and 17 more |
| Called from | `runs/inspect/20261103T180010_mattinferencesaver/script118.js:87 anonymous`, `runs/inspect/20261103T180010_mattinferencesaver/script120.js:165 anonymous`, `runs/inspect/20261103T180010_mattinferencesaver/script121.js:371 m` |
| rea | `ev_27eceaba6115086f4af94c2fc0c0d7947c1495c9588392e6a8d948ff7f80c47b` |

Seen 82 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 2663 ms | 12638 ms | — |
| inspect | step 2: snapshot | 13 | 200 | 220–3780 ms | 2137–35184 ms | — |
| inspect | step 3: goto /direct/inbox/ | 25 | 200 | 184–849 ms | 878–5606 ms | — |
| inspect | step 5: goto /direct/t/<id>/ | 27 | 200 | 183–581 ms | 938–5562 ms | — |
| inspect | step 8: click e777 | 3 | 200 | 182–786 ms | 2003–2032 ms | — |
| inspect | step 10: wait 40s | 5 | 200 | 187–572 ms | 5740–63454 ms | — |
| inspect | step 13: click e948 | 5 | 200 | 181–746 ms | 1201–63098 ms | — |
| inspect | step 16: click e1036 | 3 | 200 | 249–485 ms | 1955–1991 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T180010_mattinferencesaver**, step 1: goto /: 200, 2663 ms

Sent:

```json
{
  "__d": "www",
  "qpl_active_flow_ids": "175125627,516759801",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useCDSWebLoginMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "actor_id": "0",
      "client_mutation_id": "1",
      "access_flow_version": "pre_mt_behavior",
      "account_recovery_entry_point": null,
      "app": "instagram",
      "auth_domain_data_key": null,
      "caa_login_request_extra_info": {
        "ab_test_data": "",
        "shared_prefs_data": "",
        "cuid": "",
        "guid": "f5010abbde3c87e40",
        "lgndim": "",
        "lgnjs": "1793728825",
        "lgnrnd": "",
        "locale": "",
        "login_source": "caa_login",
        "next": "",
        "prefill_contact_point": "",
        "prefill_source": "",
        "prefill_type": "",
        "skstamp": "",
        "timezone": ""
      },
      "credential_type": "password",
      "dyi_job_id": "",
      "enc_password": {
        "sensitive_string_value": "#PWD_BROWSER:10:1793728837:AexQAA0TMde8DkF2FwmRl+VGN2vQS/NFqx5PlThnMl56odY/z7Q7sMIb5mxENKvy8NwW1ppTlPlkVDLT4yVHHIdB1Xf2V+IoNtxkyG6z25WtoDAQRciXDR4aMMu3b+EHC8U0MfpE3J9rw7XlkcGqeg=="
      },
      "event_request_id": "9a4cc071-512d-4885-9535-f9c6c204beb6",
      "identifier": "matthewdonsemail@gmail.com",
      "ig_web_device_id": "DF1D3D1D-255B-4F43-9DDA-041497A618B6",
      "initial_request_id": "1",
      "lids": null,
      "login_source": "COMET_HEADERLESS_LOGIN",
      "next": null,
      "passkey_payload": null,
      "persistent": true,
      "query_params": "{}",
      "trusted_device_records": "{}",
      "use_uid_to_login": false,
      "waterfall_id": "3f4e6904-214b-43e8-8483-10db567b6fda"
    },
    "scale": 1
  },
  "doc_id": "28610511871940857",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=175125627,516759801"
  ]
}
```

Answered:

```json
{
  "data": {
    "caa_login_web": {
      "error_code": 1348009,
      "error_message": {
        "text": "The login information you entered is incorrect. Find your account and log in.",
        "inline_style_ranges": [],
        "image_ranges": [],
        "ranges": [
          {
            "entity_is_weak_reference": false,
            "length": 29,
            "offset": 48,
            "entity": {
              "__typename": "ExternalUrl",
              "url": "http://instagram.com/accounts/password/reset/",
              "__isNode": "ExternalUrl",
              "id": "NjQyMTgzOTU5MjA4MTA3Omh0dHBcYS8vaW5zdGFncmFtLmNvbS9hY2NvdW50cy9wYXNzd29yZC9yZXNldC86Ojo6Ojo="
            }
          }
        ],
        "color_ranges": []
      },
      "error_style": "GENERIC_BANNER",
      "redirect_uri": "https://www.instagram.com/auth_platform/?apc=AdrZ4Svkwz77as0G7nQcGYcQE8R5gv8Nk_LZIe-PdDdKgVagfpf-ivK_7yLOyfgxMaO0XGarfmi4FL1E9bQLZNww-xKn8UonR9bsme8gq2D96zlMTqUPJhJwwbZINHK8z0vQh1085dgXzutlfZcj0SVBURxcDB40je054g4wKaDLPcz_iuFib5gub177NTSnmmJVVFjBXnFn1TEHl9br_eSIBQULGfYO6QOCDL1-OK7diDhOKFuwHSxTYPa5vdJAjW5f95d-efCpXs8ra6oJs1WVYsLmHnDjzArKU2tfVrWcla8m_nUlXhh0KzDZu30mAhB3qBo0cwu-fTu_MISRxB1Uzr6MVIkAOLJ… (1337 chars)",
      "two_factor_result": null,
      "reg_nta_context": null,
      "is_3pl": null,
      "is_xapp_login": false,
      "recaptcha_needed": true,
      "is_ig_login_recaptcha": false,
      "should_show_profile_selector": false,
      "should_show_save_password_dialog": false,
      "captcha_persist_data": null,
      "crypted_uid": null,
      "ig_nonce_refresh": null,
      "ig_trusted_device_nonce_refresh": null,
      "stop_deletion_payload": {
        "stop_deletion_nonce": null,
        "stop_deletion_date": null,
        "is_feta": false,
        "unified_screen_enabled": false
      },
      "ig_authenticated": false,
      "ig_login_upsell_ar": null,
      "should_show_google_oauth_after_failure": false,
      "google_oauth_uri": null,
      "lara_recovery_redirect_uri": null,
      "lara_recovery_captcha_persist_data": null,
      "lara_recovery_captcha_cipher": null,
      "lara_recovery_method": null,
      "lara_recovery_cuid": null
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793728837191,
      "time_at_flush_ms": 1793728839654
    },
    "is_final": true
  }
}
```

**runs/inspect/20261103T180010_mattinferencesaver**, step 2: snapshot: 200, 232 ms

Sent:

```json
{
  "__d": "www",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "AuthPlatformReCaptchaContentQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "34422716160661050"
}
```

Answered:

```json
{
  "data": {
    "xfb_auth_platform_anti_scripting_content": {
      "wait_screen_title": "We will now redirect you",
      "wait_screen_subtitle": "You will be automatically redirected in a few seconds. Please wait."
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793728840867,
      "time_at_flush_ms": 1793728840886
    },
    "is_final": true
  }
}
```

**runs/inspect/20261103T180010_mattinferencesaver**, step 3: goto /direct/inbox/: 200, 186 ms

Sent:

```json
{
  "__d": "www",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "PolarisAutomaticPreviewsDisabledContextProviderQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "36445470711719123"
}
```

Answered:

```json
{
  "data": {
    "xdt_get_igd_automatic_previews_disabled": {
      "disabled": 0
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793728883126,
      "time_at_flush_ms": 1793728883140
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

<!-- toWrite --> What this request is for on Facebook's side, from its definition and the step it fires in.

## What our machine does with it

<!-- toWrite --> Which state of `marketplace/connect` or `marketplace/publish` waits for it, reads it, or ignores it, and why.

## What can go wrong

<!-- toWrite --> The errors and statuses it can return, what each means for the run, and the end or retry our machine takes.
