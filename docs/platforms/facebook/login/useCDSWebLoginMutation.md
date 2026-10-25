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
| rea | `ev_7543806195ba80ee29295f7f912b572624ba9a9d878999614d2a53b06a616590` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | signIn: password typed; submitting with Enter | 2 | 200 | 4014–4726 ms | 52–79 ms | — |
| inspect | signIn: password typed; submitting with Enter | 1 | 0 | 0 ms | 9069 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261024T222706_61593981307720**, signIn: password typed; submitting with Enter: 200, 4014 ms

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
        "ab_test_data": "CAAAA/AAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAA/AAAAAAAOFBB",
        "shared_prefs_data": "eyIxMTAyMCI6W3sidCI6MTc5Mjg4MDg3My41MTksImN0eCI6eyJjbiI6Imh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9sb2dpbi8ifSwidiI6IkFtZXJpY2EvTmV3X1lvcmsifV0sIjMwMDAwIjpbeyJ0IjoxNzkyODgwODczLjUxOSwiY3R4Ijp7ImNuIjoiaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL2xvZ2luLyJ9LCJ2IjpmYWxzZX1dLCIzMDAwMSI6W3sidCI6MTc5Mjg4MDg3My41MiwiY3R4Ijp7ImNuIjoiaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL2xvZ2luLyJ9LCJ2Ijo1fV0sIjMwMDAyIjpbeyJ0IjoxNzkyODgwODczLjUy… (3068 chars)",
        "cuid": "",
        "guid": "f6750bf83416fd988",
        "lgndim": "eyJ3IjoxOTIwLCJoIjoxMDgwLCJhdyI6MTkyMCwiYWgiOjEwMzIsImMiOjI0fQ==",
        "lgnjs": "1792880873",
        "lgnrnd": "152748_m0Xu",
        "locale": "en_US",
        "login_source": "comet_headerless_login",
        "next": "",
        "prefill_contact_point": "",
        "prefill_source": "",
        "prefill_type": "",
        "skstamp": "",
        "timezone": "240"
      },
      "credential_type": "password",
      "dyi_job_id": "",
      "enc_password": {
        "sensitive_string_value": "#PWD_BROWSER:5:1792880899:AfNQAGndqWdiJ71i24ndngIcSbBcGr4+y4phsD83Do1Bq/ZXsr8XGWra/LbY2f0tetQUaShJTuJ+wlfQZMMqeHmm3T4AJf60S4gn97Q4MVJsA82p6yKJMDyPjbKfwMy48cusnnth1n+bisPJWRgAI5itFpC5"
      },
      "event_request_id": "cc7fd771-7ecd-4773-9b81-24ecc8f92e1e",
      "identifier": "cnscaqudutld@fexpost.com",
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
      "waterfall_id": "1a270a36-1ddb-46c8-b303-5198533ed3fc"
    },
    "scale": 1
  },
  "doc_id": "28077768681846394",
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
      "redirect_uri": "https://www.facebook.com/two_step_verification/two_factor/?encrypted_context=AWTUEHDUcB9PBQd5kdy9OgqSr7d1xncXAqTkIoIW4y_pYnHoLJDSCrIj-tyG_APliv1g1WN7hU2K4irzi4h-W4KX5Uout76RvX6aEdoxMG4ex_zi3zDRt5AYBqYVKeIBYCuBzhpIaaWYKr3-WzCBl40ltprT1ZBTesRIkkp-uBaZzFr-Z5pqT9qmuwG3t_M6VFRPNdB0Gam75M2WCJ-Ja-Lod899r2eO6nP_k9Vtsi0zUNT-N8mT6Dbk6ER93490GH2mJ-PCAvp-FafB1YCuFhi-7Fq0_HCKU_CJmtE53SugBLtra5RDGRUL3Cp8Z63r4FV… (914 chars)",
      "two_factor_result": null,
      "reg_nta_context": null,
      "is_3pl": null,
      "is_xapp_login": false,
      "recaptcha_needed": false,
      "is_ig_login_recaptcha": false,
      "should_show_profile_selector": false,
      "should_show_save_password_dialog": false,
      "captcha_persist_data": null,
      "crypted_uid": "AYhEMcHTu4TxJyg-Qzo_iNSK3XkJ6lMBO9EXG5g7YLsieMfq4-WjTySBUjg4na34Y5c9oCgfkMxAzCFf6QBIUnRkdmJ9HkFWbUEfji8Q7bXHHKi2VmjcNa5PixBuf3-ftFnnKRX6Ix0AWJoCQ5M0-yPnilqaEsUBxW0Y2y66v4Jx418lfILy1TgHW9oU_lWdtAigC2cELUyLYF_KZj9FFhDu|fetaaymh",
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
      "request_start_time_ms": 1792880899446,
      "time_at_flush_ms": 1792880903090
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
