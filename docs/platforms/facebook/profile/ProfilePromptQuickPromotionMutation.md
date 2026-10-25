# ProfilePromptQuickPromotionMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | mutation |
| doc_id | `23874483825521845` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `profile_prompt_bump_counter.count_updated` |
| Called from | `ProfilePromptQuickPromotionMutation` |
| rea | `ev_14b0cd727e25dbe1ccb26c1e7fd99092c8962aad531cf5b54bb5ac47aef1ff39` |

Seen 4 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 1: goto /me | 2 | 200 | 377–689 ms | 8431–13347 ms | — |
| inspect | step 1: goto /me | 1 | 200 | 469 ms | 13195 ms | — |
| inspect | step 7: click e1395 | 1 | 200 | 531 ms | 11051 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261024T164523_61593843527201**, step 7: click e1395: 200, 531 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "ProfilePromptQuickPromotionMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "profile_id": "61593843527201",
      "prompt_event": "impression",
      "prompt_type": "PERSONAL_PROFILE_DIRECTORY_PROFILE_MEGAPHONE_PROMPT",
      "qp_id": "1256202615885785",
      "actor_id": "61593843527201",
      "client_mutation_id": "1"
    }
  },
  "doc_id": "23874483825521845"
}
```

Answered:

```json
{
  "data": {
    "profile_prompt_bump_counter": {
      "count_updated": true
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792860491178,
      "time_at_flush_ms": 1792860491254
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Logs that a profile prompt ("Update your profile") was shown when the profile opened.

## What our machine does with it

Nothing. It was the first mutation of the recorded page load, so the flow generator now ignores Prompt/QuickPromotion requests as confirmations.

## What can go wrong

Harmless; it only fires when Facebook has a prompt to show.
