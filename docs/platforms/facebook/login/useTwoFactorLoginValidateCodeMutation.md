# useTwoFactorLoginValidateCodeMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | login |
| Kind | mutation |
| doc_id | `26264014419868193` |
| Path | `/api/graphql/` |
| Sends | `code`, `encryptedContext`, `flow`, `maskedContactPoint`, `method`, `next_uri`, `shared_prefs_data`, `trust_this_device` |
| Reads | `xfb_two_factor_login_validate_code.is_code_valid`, `xfb_two_factor_login_validate_code.error_message`, `xfb_two_factor_login_validate_code.next`, `xfb_two_factor_login_validate_code.trusted_device_nonce`, `xfb_two_factor_login_validate_code.user_id` |
| Called from | `useTwoFactorLoginValidateCode` |
| rea | `ev_78e735bcbf9c2e10f51aa3a1cb3946e20af0a808d212397110532f84e2ad76cc` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | code: typed the current authenticator code; submitting with Enter | 1 | 200 | 3066 ms | 29 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261024T222706_61593981307720**, code: typed the current authenticator code; submitting with Enter: 200, 3066 ms

Sent:

```json
{
  "qpl_active_flow_ids": "241973805",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useTwoFactorLoginValidateCodeMutation",
  "server_timestamps": "true",
  "variables": {
    "method": "TOTP",
    "flow": "TWO_FACTOR_LOGIN",
    "encryptedContext": "AWTUEHDUcB9PBQd5kdy9OgqSr7d1xncXAqTkIoIW4y_pYnHoLJDSCrIj-tyG_APliv1g1WN7hU2K4irzi4h-W4KX5Uout76RvX6aEdoxMG4ex_zi3zDRt5AYBqYVKeIBYCuBzhpIaaWYKr3-WzCBl40ltprT1ZBTesRIkkp-uBaZzFr-Z5pqT9qmuwG3t_M6VFRPNdB0Gam75M2WCJ-Ja-Lod899r2eO6nP_k9Vtsi0zUNT-N8mT6Dbk6ER93490GH2mJ-PCAvp-FafB1YCuFhi-7Fq0_HCKU_CJmtE53SugBLtra5RDGRUL3Cp8Z63r4FVKlk6pkrMpyGveHj9dfzXEbA0j_b6oPNB5WlKBowNbwBiEhgF9WHbrnJIPfqiEcHMS4vlvoXlwfyrW… (802 chars)",
    "maskedContactPoint": null,
    "next_uri": null,
    "shared_prefs_data": "eyIxMTAyMCI6W3sidCI6MTc5Mjg4MTA4Ny44NTYsImN0eCI6eyJjbiI6Imh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS90d29fc3RlcF92ZXJpZmljYXRpb24vdHdvX2ZhY3Rvci8ifSwidiI6IkFtZXJpY2EvTmV3X1lvcmsifV0sIjMwMDAwIjpbeyJ0IjoxNzkyODgxMDg3Ljg1NiwiY3R4Ijp7ImNuIjoiaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL3R3b19zdGVwX3ZlcmlmaWNhdGlvbi90d29fZmFjdG9yLyJ9LCJ2IjpmYWxzZX1dLCIzMDAwMSI6W3sidCI6MTc5Mjg4MTA4Ny44NTYsImN0eCI6eyJjbiI6Imh0dHBzOi8vd3d3LmZh… (4184 chars)",
    "trust_this_device": null
  },
  "doc_id": "26264014419868193",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=241973805"
  ]
}
```

Answered:

```json
{
  "data": {
    "xfb_two_factor_login_validate_code": {
      "is_code_valid": true,
      "error_message": null,
      "next": null,
      "trusted_device_nonce": null,
      "user_id": null
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792881093429,
      "time_at_flush_ms": 1792881096149
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Submits the 6-digit two-factor code (method TOTP) during login and returns whether Facebook accepted it.

## What our machine does with it

The `code` step types the current TOTP from Twenty's `totpSecret` and waits on this mutation; a 200 with no error means the code passed and sign-in continues.

## What can go wrong

A rejected or expired code fails sign-in; even on success Facebook may still raise an "automated behaviour" checkpoint on a fresh account.
