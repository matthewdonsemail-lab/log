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

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | signIn: password typed; submitting with Enter | 1 | 200 | 430 ms | 11476 ms | — |
| inspect | signIn: password typed; submitting with Enter | 1 | 200 | 672 ms | 29798 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261111T081957_61593610473511**, signIn: password typed; submitting with Enter: 200, 672 ms

Sent:

```json
{
  "qpl_active_flow_ids": "241973805",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "ConversationalSupport2FAChatExperienceQuery",
  "server_timestamps": "true",
  "variables": {
    "request": {
      "encrypted_context": "AWSQc_NCevZ8pzxONvPfuS4qG2w5MSxxBAQYhIjIz_AgSr0PmcG97jPcz49LgHI8GO2WfCu2WnrAnwFeFvajjkBKsJFEn6tOfSjQcrgoBTC82jceKxfQqgvvir9gXCClhAV4vZvDVg2yAYb01GIr6zpRp_QsMScNyNTH-5s7DcCDlhY_dMjRzRpLSvx5tvLxQqxtLMlTLRHSjJw7r2yi2OfJI4sMy7NzuIveTvbRPhxgpR5RpIIAeMAA_VxyNBPvxkebPYrFg9WidITh7gZsTGiVBrjOx2iW4ok_SQNW3nNYOxAr5RXJC6SSyyTdqpnODPDgH38Qdqk7HBm2X4SfgeeWPsW-dng0tI7c70KgdTk3qdr0dB4I_ewAyyYcqF6aUHY9Xc8S742a3Ccb… (958 chars)",
      "existing_token": null
    }
  },
  "doc_id": "26004414795821466",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=241973805"
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
      "request_start_time_ms": 1794385867218,
      "time_at_flush_ms": 1794385867243
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
