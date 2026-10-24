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

Seen 10 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 4 | 200 | 390–1389 ms | 5337–8918 ms | — |
| inspect | step 38: goto /marketplace/ | 2 | 200 | 728–936 ms | 21112–22075 ms | — |
| inspect | scroll: +515px in 13 wheel steps, 656 ms | 2 | 200 | 496–568 ms | 500494–501021 ms | — |
| inspect | step 8: wait 5s | 2 | 200 | 463–539 ms | 1652578–1653124 ms | — |

### What it sent and what came back (the newest 2 from our runs)

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
      "attempt_token": "Q8CtDAGNYfv90QnSPXI4q-K4giDSjigK9LvrogqeDlsDnI22U9sI-JbqDUzfJoudvB7I7zHZIJMyYBwQDDWmyyE-x_0jeco5_re7GC9TxbMhUIf7vB2GVTGS4e1EMRWvh4cahqPYO0lRKIgKFFPbBQW2b1gGQtPVVE2Pz0wRxcnpGueLJ4AtJYNS1fAm3uk7vX4ppbOZS6qRFp18GzjfujKjddN8S1L9K9yp7jmcTTL2sjPgozhgAtjl2K6mueLQNkS4t8t8NQ51jO937G_xIcHK5X5taKuGFYWKdgU_uuHoTjok2UdBRcgK2kflODTD0MJfDZx6glLZTGuVTngtwD7LTTOf1FRaHFA6GXE1oOBFxEcrvW6figUU_co6Gu9ePb6O3yonKA38QDQY… (836 chars)"
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
      "attempt_token": "Q8CtDAEoCn4qCWgxsluih0G4Yxsz5XkrXIho1J1SOq2E7WLfu2N5GMj9wlNlrKfRoaZrHz7wc1CBC85tdDgKQtudxE4h3fwdfETVzeKGoRaXctkKfyJBzPLEtMLuL5EgjHKdFJdTGOcTnaaENp3VjhMSzzQW0IkXxM2hPF367ZpVNNF47nhvQB0JsufcbbjBpKnCj0kp6FG1qceh0XRisR3HsXQcbwcv7AcPsIy8Qpf-Mwl2dTHzK8V8oq0FN1A-NS5ORAUVDuQJR9tZmxVEndiZXIWMUBe23aAimwSf_mVTAhMHaSaekXLdHHMU7JjKcDgsOz2ET6qkEKM8CvfSi1sdDnV1p9xwCM6sXkNTXlkYvB0L-GROrS-QTBJ-hPRr_k_QOEd7hGX78OkG… (2007 chars)"
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

<!-- facts:end -->

## What it does

On a locked-account page, asks whether Facebook's AI support chat is offered for this checkpoint (`init_conversational_support_attempt_for_ufac.is_cometai_chat_available`) and gets an attempt token. UFAC is Facebook's account-checkpoint framework.

## What our machine does with it

Nothing waits for it. It fires on the page with "Back to Previous Page, Account settings", which the connect machine ends on as `checkpoint` or `videoSelfie`: a person takes over (rule 23).

## What can go wrong

Its presence means the account is inside a checkpoint flow, not a normal page. If it shows up in a publish or scan run, the account has been checkpointed since its last connect.
