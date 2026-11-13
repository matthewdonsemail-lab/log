# useTwoFactorLoginValidateCodeMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | login |
| Kind | mutation |
| doc_id | `29046425138349150` |
| Path | `/api/graphql/` |
| Sends | `code`, `encryptedContext`, `flow`, `logging_data`, `maskedContactPoint`, `method`, `next_uri`, `shared_prefs_data`, `trust_this_device` |
| Reads | `xfb_two_factor_login_validate_code.is_code_valid`, `xfb_two_factor_login_validate_code.error_message`, `xfb_two_factor_login_validate_code.next`, `xfb_two_factor_login_validate_code.trusted_device_nonce`, `xfb_two_factor_login_validate_code.user_id` |
| Called from | `useTwoFactorLoginValidateCode` |
| rea | `ev_16ef1655d595b668ff277d1a59536372fa190c4076373faa12e7faa014d3db84` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | code: typed the current authenticator code; submitting with Enter | 1 | 200 | 3066 ms | 29 ms | — |
| inspect | code: typed the current authenticator code; submitting with Enter | 1 | 200 | 3546 ms | 28 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261111T081957_<id:1>**, code: typed the current authenticator code; submitting with Enter: 200, 3546 ms

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
    "encryptedContext": "AWSQc_NCevZ8pzxONvPfuS4qG2w5MSxxBAQYhIjIz_AgSr0PmcG97jPcz49LgHI8GO2WfCu2WnrAnwFeFvajjkBKsJFEn6tOfSjQcrgoBTC82jceKxfQqgvvir9gXCClhAV4vZvDVg2yAYb01GIr6zpRp_QsMScNyNTH-5s7DcCDlhY_dMjRzRpLSvx5tvLxQqxtLMlTLRHSjJw7r2yi2OfJI4sMy7NzuIveTvbRPhxgpR5RpIIAeMAA_VxyNBPvxkebPYrFg9WidITh7gZsTGiVBrjOx2iW4ok_SQNW3nNYOxAr5RXJC6SSyyTdqpnODPDgH38Qdqk7HBm2X4SfgeeWPsW-dng0tI7c70KgdTk3qdr0dB4I_ewAyyYcqF6aUHY9Xc8S742a3Ccb… (958 chars)",
    "maskedContactPoint": null,
    "next_uri": null,
    "shared_prefs_data": "eyIxMTAyMCI6W3sidCI6MTc5NDM4NTg2NS43NzcsImN0eCI6eyJjbiI6Imh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS90d29fc3RlcF92ZXJpZmljYXRpb24vdHdvX2ZhY3Rvci8ifSwidiI6IkFtZXJpY2EvVmFuY291dmVyIn1dLCIzMDAwMCI6W3sidCI6MTc5NDM4NTg2NS43NzcsImN0eCI6eyJjbiI6Imh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS90d29fc3RlcF92ZXJpZmljYXRpb24vdHdvX2ZhY3Rvci8ifSwidiI6ZmFsc2V9XSwiMzAwMDEiOlt7InQiOjE3OTQzODU4NjUuNzc4LCJjdHgiOnsiY24iOiJodHRwczovL3d3dy5m… (3924 chars)",
    "trust_this_device": null,
    "logging_data": null
  },
  "doc_id": "29046425138349150",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=241973805"
  ]
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

Submits the 6-digit two-factor code (method TOTP) during login and returns whether Facebook accepted it.

## What our machine does with it

The `code` step types the current TOTP from Twenty's `totpSecret` and waits on this mutation; a 200 with no error means the code passed and sign-in continues.

## What can go wrong

A rejected or expired code fails sign-in; even on success Facebook may still raise an "automated behaviour" checkpoint on a fresh account.
