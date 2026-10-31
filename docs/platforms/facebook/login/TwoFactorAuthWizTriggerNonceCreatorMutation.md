# TwoFactorAuthWizTriggerNonceCreatorMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | login |
| Kind | mutation |
| doc_id | `24024744467132978` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | — |
| Called from | `TwoFactorAuthWizTriggerNonceCreator` |
| rea | `ev_7f334c5fc5c494318b71bb8f1ab8ba667a46159ebdad259a4359e556184216b7` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | step 15: click e45 | 1 | 200 | 652 ms | 4318 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261024T222706_61593981307720**, step 15: click e45: 200, 652 ms

Sent:

```json
{
  "qpl_active_flow_ids": "241973805",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "TwoFactorAuthWizTriggerNonceCreatorMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "tctx": "AWTUEHDUcB9PBQd5kdy9OgqSr7d1xncXAqTkIoIW4y_pYnHoLJDSCrIj-tyG_APliv1g1WN7hU2K4irzi4h-W4KX5Uout76RvX6aEdoxMG4ex_zi3zDRt5AYBqYVKeIBYCuBzhpIaaWYKr3-WzCBl40ltprT1ZBTesRIkkp-uBaZzFr-Z5pqT9qmuwG3t_M6VFRPNdB0Gam75M2WCJ-Ja-Lod899r2eO6nP_k9Vtsi0zUNT-N8mT6Dbk6ER93490GH2mJ-PCAvp-FafB1YCuFhi-7Fq0_HCKU_CJmtE53SugBLtra5RDGRUL3Cp8Z63r4FVKlk6pkrMpyGveHj9dfzXEbA0j_b6oPNB5WlKBowNbwBiEhgF9WHbrnJIPfqiEcHMS4vlvoXlwfyrW… (802 chars)",
      "actor_id": "0",
      "client_mutation_id": "1"
    }
  },
  "doc_id": "24024744467132978",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=241973805"
  ]
}
```

Answered:

```json
{
  "data": {
    "xfb_two_factor_authenticity_wizard_trigger_nonce": {
      "two_step_idr_wizard_input": {
        "security_token": "(taken out)",
        "external_flow_id": "2174560913439173"
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792880990661,
      "time_at_flush_ms": 1792880990961
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

At the start of the two-factor login wizard, mints a one-time nonce that ties the challenge to this session.

## What our machine does with it

Fires on its own as the two-step page arms; log-cli does not read it and instead waits for the code field or the method picker.

## What can go wrong

A failure here would break the 2FA wizard before the code box appears; otherwise it is background to our flow.
