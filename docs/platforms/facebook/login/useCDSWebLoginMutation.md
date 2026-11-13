# useCDSWebLoginMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | login |
| Kind | mutation |
| doc_id | `28610511871940857` |
| Path | `/api/graphql/` |
| Sends | `input`, `scale` |
| Reads | `caa_login_web.error_code`, `caa_login_web.error_message`, `caa_login_web.error_style`, `caa_login_web.redirect_uri`, `caa_login_web.two_factor_result`, `caa_login_web.reg_nta_context`, `caa_login_web.is_3pl`, `caa_login_web.is_xapp_login`, `caa_login_web.recaptcha_needed`, `caa_login_web.is_ig_login_recaptcha`, `caa_login_web.should_show_profile_selector`, `caa_login_web.should_show_save_password_dialog` and 14 more |
| Called from | `useCDSWebLoginMutation` |
| rea | `ev_7630b3b2ad8d6015e4bdad2865ac23060a67ca91fe9aaed097a61390a0455796` |

Seen 4 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | signIn: password typed; submitting with Enter | 2 | 200 | 4014–4726 ms | 52–79 ms | — |
| inspect | signIn: password typed; submitting with Enter | 2 | 0, 200 | 0–5033 ms | 67–9069 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261111T081957_<userId:1>**, signIn: password typed; submitting with Enter: 200, 5033 ms

Sent:

```json
{
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
      "app": "facebook",
      "auth_domain_data_key": null,
      "caa_login_request_extra_info": {
        "ab_test_data": "ACAAA/AAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAA/KAAAAAAOFCB",
        "shared_prefs_data": "eyIxMTAyMCI6W3sidCI6MTc5NDM4NTIyOS4zNTcsImN0eCI6eyJjbiI6Imh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS8ifSwidiI6IkFtZXJpY2EvVmFuY291dmVyIn1dLCIzMDAwMCI6W3sidCI6MTc5NDM4NTIyOS4zNTcsImN0eCI6eyJjbiI6Imh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS8ifSwidiI6ZmFsc2V9XSwiMzAwMDEiOlt7InQiOjE3OTQzODUyMjkuMzU4LCJjdHgiOnsiY24iOiJodHRwczovL3d3dy5mYWNlYm9vay5jb20vIn0sInYiOjV9XSwiMzAwMDIiOlt7InQiOjE3OTQzODUyMjkuMzU4LCJjdHgiOnsiY24iOiJo… (2912 chars)",
        "cuid": "",
        "guid": "f99a386e0aabef4fe",
        "lgndim": "eyJ3IjoxOTIwLCJoIjoxMDgwLCJhdyI6MTkyMCwiYWgiOjEwMzIsImMiOjI0fQ==",
        "lgnjs": "1794385229",
        "lgnrnd": "002027_v4Xm",
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
        "<password>": "<password>"
      },
      "event_request_id": "c9a24a67-40fa-40c7-b014-2caaebf326ce",
      "identifier": "<email>",
      "ig_web_device_id": null,
      "initial_request_id": "1",
      "lids": null,
      "login_source": "COMET_HEADERLESS_LOGIN",
      "next": null,
      "passkey_payload": null,
      "persistent": true,
      "query_params": "{}",
      "trusted_device_records": "{}",
      "use_uid_to_login": false,
      "waterfall_id": "2f95ec40-3025-4c26-99b1-8de48ae02903"
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
      "error_code": 1348043,
      "error_message": {
        "text": "Something went wrong. Please try again.",
        "inline_style_ranges": [],
        "image_ranges": [],
        "ranges": [],
        "color_ranges": []
      },
      "error_style": "GENERIC_BANNER",
      "redirect_uri": "https://www.facebook.com/two_step_verification/two_factor/?encrypted_context=AWSQc_NCevZ8pzxONvPfuS4qG2w5MSxxBAQYhIjIz_AgSr0PmcG97jPcz49LgHI8GO2WfCu2WnrAnwFeFvajjkBKsJFEn6tOfSjQcrgoBTC82jceKxfQqgvvir9gXCClhAV4vZvDVg2yAYb01GIr6zpRp_QsMScNyNTH-5s7DcCDlhY_dMjRzRpLSvx5tvLxQqxtLMlTLRHSjJw7r2yi2OfJI4sMy7NzuIveTvbRPhxgpR5RpIIAeMAA_VxyNBPvxkebPYrFg9WidITh7gZsTGiVBrjOx2iW4ok_SQNW3nNYOxAr5RXJC6SSyyTdqpnODPD… (1070 chars)",
      "two_factor_result": null,
      "reg_nta_context": null,
      "is_3pl": null,
      "is_xapp_login": false,
      "recaptcha_needed": false,
      "is_ig_login_recaptcha": false,
      "should_show_profile_selector": false,
      "should_show_save_password_dialog": false,
      "captcha_persist_data": null,
      "crypted_uid": "AYieyhu92WaPzRxvYc2-idoe9srFqLIUM5eCxOCQsQzvzz1p4OcBN3W39NzQIDQRVTtySUJTraiHgo36UMlIAAGarmqpk7WudmWhFTHmb4pFMoJu1kOQqSdfDIXV-bTk4XpqL6lF-KR-wcXu7ooJ_BM-oBeOIefdPnCD7UwSspLktRqrLucj1-ysgQ7KgCdZW2PUI_v4pGKNS1Qkl9izfU4h|fetaaymh",
      "ig_nonce_refresh": null,
      "ig_trusted_device_nonce_refresh": null,
      "stop_deletion_payload": {
        "stop_deletion_nonce": null,
        "stop_deletion_date": null,
        "is_feta": true,
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
      "request_start_time_ms": 1794385837330,
      "time_at_flush_ms": 1794385841912
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
