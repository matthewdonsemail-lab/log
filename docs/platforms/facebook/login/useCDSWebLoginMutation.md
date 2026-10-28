# useCDSWebLoginMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | login |
| Kind | mutation |
| doc_id | `28077768681846394` |
| Path | `/api/graphql/` |
| Sends | `input`, `scale` |
| Reads | `caa_login_web.error_code`, `caa_login_web.error_message`, `caa_login_web.error_style`, `caa_login_web.redirect_uri`, `caa_login_web.two_factor_result`, `caa_login_web.reg_nta_context`, `caa_login_web.is_3pl`, `caa_login_web.is_xapp_login`, `caa_login_web.recaptcha_needed`, `caa_login_web.is_ig_login_recaptcha`, `caa_login_web.should_show_profile_selector`, `caa_login_web.should_show_save_password_dialog` and 14 more |
| Called from | `useCDSWebLoginMutation` |
| rea | `ev_f18654fe13879f40a482e2123ed7247d7d2430323d52092806de0435de449a7c` |

Seen 4 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | signIn: password typed; submitting with Enter | 3 | 200 | 3650–4726 ms | 29–79 ms | — |
| inspect | signIn: password typed; submitting with Enter | 1 | 0 | 0 ms | 9069 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T164654_61594285317994**, signIn: password typed; submitting with Enter: 200, 3650 ms

Sent:

```json
{
  "qpl_active_flow_ids": "516759801",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useCDSWebLoginMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "actor_id": "0",
      "client_mutation_id": "1",
      "access_flow_version": "pre_mt_behavior",
      "account_recovery_entry_point": null,
      "app": "facebook",
      "auth_domain_data_key": null,
      "caa_login_request_extra_info": {
        "ab_test_data": "DAAAj/AAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAA/BAAAAAANGBB",
        "shared_prefs_data": "eyIxMTAyMCI6W3sidCI6MTc5MzAzMzQwNS43ODQsImN0eCI6eyJjbiI6Imh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9sb2dpbi8ifSwidiI6IkFtZXJpY2EvVmFuY291dmVyIn1dLCIzMDAwMCI6W3sidCI6MTc5MzAzMzQwNS43ODQsImN0eCI6eyJjbiI6Imh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9sb2dpbi8ifSwidiI6ZmFsc2V9XSwiMzAwMDEiOlt7InQiOjE3OTMwMzM0MDUuNzg0LCJjdHgiOnsiY24iOiJodHRwczovL3d3dy5mYWNlYm9vay5jb20vbG9naW4vIn0sInYiOjV9XSwiMzAwMDIiOlt7InQiOjE3OTMwMzM0MDUu… (3120 chars)",
        "cuid": "",
        "guid": "f8ec9d2a12680a3af",
        "lgndim": "eyJ3IjoxNjgwLCJoIjoxMDUwLCJhdyI6MTY4MCwiYWgiOjEwMDIsImMiOjI0fQ==",
        "lgnjs": "1793033405",
        "lgnrnd": "095004_lCbR",
        "locale": "en_US",
        "login_source": "comet_headerless_login",
        "next": "",
        "prefill_contact_point": "",
        "prefill_source": "",
        "prefill_type": "",
        "skstamp": "",
        "timezone": "420"
      },
      "credential_type": "password",
      "dyi_job_id": "",
      "enc_password": {
        "sensitive_string_value": "#PWD_BROWSER:5:1793033423:AfRQAAqu9n5hlyIfsu/nwPKDU2qoia0r/iBTUqP3uDkttuhPR5gRBmXYFNvNKJS5UTQaemZERcbs2Ysbc9Ozb+cbUBrHK4evrBlYcWA6ixrSJLAw4B27lckBZkkVOiLHgXqRkh+kVoKmSiENYlJI4TsYS6hj"
      },
      "event_request_id": "864c554f-8f30-46a7-bda9-996bc49b0023",
      "identifier": "jjsz4nr6wvvv@merepost.com",
      "ig_web_device_id": null,
      "initial_request_id": "1",
      "lids": null,
      "login_source": "LOGIN",
      "next": null,
      "passkey_payload": null,
      "persistent": true,
      "query_params": "{}",
      "trusted_device_records": "{}",
      "use_uid_to_login": false,
      "waterfall_id": "343c14ca-baf8-4090-bda0-840cc59411c6"
    },
    "scale": 1
  },
  "doc_id": "28077768681846394",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=516759801"
  ]
}
```

Answered:

```json
{
  "data": {
    "caa_login_web": {
      "error_code": 1348043,
      "error_message": {
        "text": "Something went wrong. Please try again.",
        "inline_style_ranges": [],
        "image_ranges": [],
        "ranges": [],
        "color_ranges": []
      },
      "error_style": "GENERIC_BANNER",
      "redirect_uri": "https://www.facebook.com/two_step_verification/two_factor/?encrypted_context=AWS0QH6zFAzqoaf8cmMG-QxAIJwr6xNoT4IvAm7Od7SN9ZjOg0wEicKif6oM7UeBuSgdOUcH9Bj4EY1uVha68_tOERoY3Osu504jJKti4gwzseGxv-h6jyxHrdVjQ2_zX50Krc-2YxJ34UZT2Cc59O_bbh76gTM5TRPLvBh_27mN0Mdh7r4Fr39o12u05Z6tUWwZcchdPVb4_EKcWUAhzECtUCZsbtMPILJc5sks5C1zKRaOu5oIICYk6B98qGrqVGWTrnauSqy7nhaUfDk9b8dbGhYy_Tn_ajZSgWJkgKSRJtaN5yNJyENiqvsw-ShC2zh… (914 chars)",
      "two_factor_result": null,
      "reg_nta_context": null,
      "is_3pl": null,
      "is_xapp_login": false,
      "recaptcha_needed": false,
      "is_ig_login_recaptcha": false,
      "should_show_profile_selector": false,
      "should_show_save_password_dialog": false,
      "captcha_persist_data": null,
      "crypted_uid": "AYgvWh_jt7YdXaOkBJXoRkbDW29RvJ7AcX9qVhIYtVDnMALIVV4zjWH6GwZMbT-BZO0YYFhNvGGL1X-_u_pDDnGyQu9x6SQP7eu4_hrHsO-LDqBkVZEFCjgwFC9by-73g_nhcBB7QIGNR-oAhTQZ0cdFD_obDU2wYHzYUXcXQWjpO-wvYe__O9r5bqwP3PMt1QgSmVx6F-svBIV09SNfTi8B|fetaaymh",
      "ig_nonce_refresh": null,
      "ig_trusted_device_nonce_refresh": null,
      "stop_deletion_payload": {
        "stop_deletion_nonce": null,
        "stop_deletion_date": null,
        "is_feta": true
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
      "request_start_time_ms": 1793033423035,
      "time_at_flush_ms": 1793033426478
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

The sign-in on Facebook's newer login page (`/login/`, the Comet "CDS" form): the password is sent as a GraphQL mutation instead of the old form POST (`loginDeviceBasedRegularLogin`). It fired 79 ms after the host's `signIn` pressed Enter and took 4.7 s. Its answer, `caa_login_web`, carries the outcome: `error_code`/`error_message`, `redirect_uri`, `two_factor_result`, `recaptcha_needed`.

## What our machine does with it

The host's `signIn` actor (`src/cli/host/helpers/hostActors.ts`) and the inspect `signIn` step press Enter, then wait for the URL or the password field to change (up to 15 s) instead of a fixed time, because this request takes several seconds. Signed in is then decided by the `c_user` and `xs` cookies, never by this answer's wording.

## What can go wrong

`error_code` set means the form came back (wrong password: `wrongPassword`). `two_factor_result` set means the two-step page follows (the `code` step). `recaptcha_needed` true means a captcha (rule 10's solvers). A `redirect_uri` to `/checkpoint/` is the cause line for a checkpoint at sign-in. No sighting after Enter means the submit never left the page.
