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
| rea | `ev_0bc2c7d63d6a916cb1878ffcd7c758abb75c7c769856c711e28e55c7aeb1a5da` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | code: typed the current authenticator code; submitting with Enter | 2 | 200 | 2605–3066 ms | 11–29 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T164654_61594285317994**, code: typed the current authenticator code; submitting with Enter: 200, 2605 ms

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
    "encryptedContext": "AWS0QH6zFAzqoaf8cmMG-QxAIJwr6xNoT4IvAm7Od7SN9ZjOg0wEicKif6oM7UeBuSgdOUcH9Bj4EY1uVha68_tOERoY3Osu504jJKti4gwzseGxv-h6jyxHrdVjQ2_zX50Krc-2YxJ34UZT2Cc59O_bbh76gTM5TRPLvBh_27mN0Mdh7r4Fr39o12u05Z6tUWwZcchdPVb4_EKcWUAhzECtUCZsbtMPILJc5sks5C1zKRaOu5oIICYk6B98qGrqVGWTrnauSqy7nhaUfDk9b8dbGhYy_Tn_ajZSgWJkgKSRJtaN5yNJyENiqvsw-ShC2zh2Kp9BweCsZjS6abSVdyZjHGMXvPGcZO1OOxWB2mxnFnouTqVdtacAzRMvjfH2njhTW5Zqqs-wrxvN… (802 chars)",
    "maskedContactPoint": null,
    "next_uri": null,
    "shared_prefs_data": "eyIxMTAyMCI6W3sidCI6MTc5MzAzMzQzNS44MDYsImN0eCI6eyJjbiI6Imh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS90d29fc3RlcF92ZXJpZmljYXRpb24vdHdvX2ZhY3Rvci8ifSwidiI6IkFtZXJpY2EvVmFuY291dmVyIn1dLCIzMDAwMCI6W3sidCI6MTc5MzAzMzQzNS44MDYsImN0eCI6eyJjbiI6Imh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS90d29fc3RlcF92ZXJpZmljYXRpb24vdHdvX2ZhY3Rvci8ifSwidiI6ZmFsc2V9XSwiMzAwMDEiOlt7InQiOjE3OTMwMzM0MzUuODA2LCJjdHgiOnsiY24iOiJodHRwczovL3d3dy5m… (3740 chars)",
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
      "request_start_time_ms": 1793033446005,
      "time_at_flush_ms": 1793033448449
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
