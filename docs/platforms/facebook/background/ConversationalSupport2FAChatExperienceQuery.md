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
| rea | `ev_375f167746b9b15f68ee15d1ed0bb62852294f30b4159b0bf56d1afad856bcf5` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | signIn: password typed; submitting with Enter | 2 | 200 | 239–430 ms | 11476–13779 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T164654_61594285317994**, signIn: password typed; submitting with Enter: 200, 239 ms

Sent:

```json
{
  "qpl_active_flow_ids": "241973805",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "ConversationalSupport2FAChatExperienceQuery",
  "server_timestamps": "true",
  "variables": {
    "request": {
      "encrypted_context": "AWS0QH6zFAzqoaf8cmMG-QxAIJwr6xNoT4IvAm7Od7SN9ZjOg0wEicKif6oM7UeBuSgdOUcH9Bj4EY1uVha68_tOERoY3Osu504jJKti4gwzseGxv-h6jyxHrdVjQ2_zX50Krc-2YxJ34UZT2Cc59O_bbh76gTM5TRPLvBh_27mN0Mdh7r4Fr39o12u05Z6tUWwZcchdPVb4_EKcWUAhzECtUCZsbtMPILJc5sks5C1zKRaOu5oIICYk6B98qGrqVGWTrnauSqy7nhaUfDk9b8dbGhYy_Tn_ajZSgWJkgKSRJtaN5yNJyENiqvsw-ShC2zh2Kp9BweCsZjS6abSVdyZjHGMXvPGcZO1OOxWB2mxnFnouTqVdtacAzRMvjfH2njhTW5Zqqs-wrxvN… (802 chars)",
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
      "request_start_time_ms": 1793033436331,
      "time_at_flush_ms": 1793033436367
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
