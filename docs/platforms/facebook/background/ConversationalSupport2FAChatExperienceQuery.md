# ConversationalSupport2FAChatExperienceQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `26004414795821466` |
| Path | `/api/graphql/` |
| Sends | `request` |
| Reads | `init_conversational_support_attempt_for_2fa.is_cometai_chat_available`, `init_conversational_support_attempt_for_2fa.attempt_token` |
| Called from | `ConversationalSupport2FAChatExperience.react` |
| rea | `ev_d11be8721cd4afab0439fc3c849dca2fa71e71821ec061de98d513058883f28e` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | signIn: password typed; submitting with Enter | 1 | 200 | 430 ms | 11476 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261024T222706_61593981307720**, signIn: password typed; submitting with Enter: 200, 430 ms

Sent:

```json
{
  "qpl_active_flow_ids": "175125627,241973805",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "ConversationalSupport2FAChatExperienceQuery",
  "server_timestamps": "true",
  "variables": {
    "request": {
      "encrypted_context": "AWTUEHDUcB9PBQd5kdy9OgqSr7d1xncXAqTkIoIW4y_pYnHoLJDSCrIj-tyG_APliv1g1WN7hU2K4irzi4h-W4KX5Uout76RvX6aEdoxMG4ex_zi3zDRt5AYBqYVKeIBYCuBzhpIaaWYKr3-WzCBl40ltprT1ZBTesRIkkp-uBaZzFr-Z5pqT9qmuwG3t_M6VFRPNdB0Gam75M2WCJ-Ja-Lod899r2eO6nP_k9Vtsi0zUNT-N8mT6Dbk6ER93490GH2mJ-PCAvp-FafB1YCuFhi-7Fq0_HCKU_CJmtE53SugBLtra5RDGRUL3Cp8Z63r4FVKlk6pkrMpyGveHj9dfzXEbA0j_b6oPNB5WlKBowNbwBiEhgF9WHbrnJIPfqiEcHMS4vlvoXlwfyrW… (802 chars)",
      "existing_token": null
    }
  },
  "doc_id": "26004414795821466",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=175125627,241973805"
  ]
}
```

Answered:

```json
{
  "data": {
    "init_conversational_support_attempt_for_2fa": {
      "is_cometai_chat_available": false,
      "attempt_token": null
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792880910852,
      "time_at_flush_ms": 1792880910881
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Checks whether Facebook's conversational support (UFAC) chat is available on the 2FA/checkpoint surface and returns an attempt token.

## What our machine does with it

Background noise on the checkpoint and two-step pages; log-cli does not read or act on it.

## What can go wrong

Nothing: it does not gate sign-in and carries no state our machine needs.
