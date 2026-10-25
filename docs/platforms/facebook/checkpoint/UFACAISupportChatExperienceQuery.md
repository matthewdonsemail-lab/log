# UFACAISupportChatExperienceQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | checkpoint |
| Kind | query |
| doc_id | `26465902889674584` |
| Path | `/api/graphql/` |
| Sends | `request` |
| Reads | `init_conversational_support_attempt_for_ufac.is_cometai_chat_available`, `init_conversational_support_attempt_for_ufac.attempt_token` |
| Called from | `UFACAISupportChatExperience.react` |
| rea | `ev_8ee95faa5bbd82f99ae9dcfe8cbd78add4e5241ff8073ebf16e7331f832cc1d5` |

Seen 12 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 4 | 200 | 390–1389 ms | 5337–8918 ms | — |
| inspect | step 38: goto /marketplace/ | 2 | 200 | 728–936 ms | 21112–22075 ms | — |
| inspect | scroll: +515px in 13 wheel steps, 656 ms | 2 | 200 | 496–568 ms | 500494–501021 ms | — |
| inspect | step 8: wait 5s | 2 | 200 | 463–539 ms | 1652578–1653124 ms | — |
| flow | step 1: goto /marketplace/ | 2 | 200 | 564–683 ms | 9079–9773 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261024T164523_61593843527201**, step 8: wait 5s: 200, 539 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "UFACAISupportChatExperienceQuery",
  "server_timestamps": "true",
  "variables": {
    "request": {
      "existing_token": null
    }
  },
  "doc_id": "26465902889674584"
}
```

Answered:

```json
{
  "data": {
    "init_conversational_support_attempt_for_ufac": {
      "is_cometai_chat_available": false,
      "attempt_token": "(taken out)"
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792862151455,
      "time_at_flush_ms": 1792862151610
    },
    "is_final": true
  }
}
```

**runs/inspect/20261024T060921_61594063207669**, scroll: +515px in 13 wheel steps, 656 ms: 200, 496 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "UFACAISupportChatExperienceQuery",
  "server_timestamps": "true",
  "variables": {
    "request": {
      "existing_token": null
    }
  },
  "doc_id": "26465902889674584"
}
```

Answered:

```json
{
  "data": {
    "init_conversational_support_attempt_for_ufac": {
      "is_cometai_chat_available": true,
      "attempt_token": "(taken out)"
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792824697652,
      "time_at_flush_ms": 1792824697834
    },
    "is_final": true
  }
}
```

**runs/flow/20261025T063126_61594196161725**, step 1: goto /marketplace/: 200, 683 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "UFACAISupportChatExperienceQuery",
  "server_timestamps": "true",
  "variables": {
    "request": {
      "existing_token": null
    }
  },
  "doc_id": "26465902889674584"
}
```

Answered:

```json
{
  "data": {
    "init_conversational_support_attempt_for_ufac": {
      "is_cometai_chat_available": false,
      "attempt_token": "(taken out)"
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792909914656,
      "time_at_flush_ms": 1792909914928
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

On a locked-account page, asks whether Facebook's AI support chat is offered for this checkpoint (`init_conversational_support_attempt_for_ufac.is_cometai_chat_available`) and gets an attempt token. UFAC is Facebook's account-checkpoint framework.

## What our machine does with it

Nothing waits for it. It fires on the page with "Back to Previous Page, Account settings", which the connect machine ends on as `checkpoint` or `videoSelfie`: a person takes over (rule 23).

## What can go wrong

Its presence means the account is inside a checkpoint flow, not a normal page. If it shows up in a publish or scan run, the account has been checkpointed since its last connect.
