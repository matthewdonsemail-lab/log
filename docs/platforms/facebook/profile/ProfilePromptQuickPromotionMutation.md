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
| rea | `ev_7f71f06ed8dfb8410c15d2d332e23a6560dd3659b33c283a594853fdb1402e48` |

Seen 5 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 1: goto /me | 2 | 200 | 377–689 ms | 8431–13347 ms | — |
| inspect | step 1: goto /me | 1 | 200 | 469 ms | 13195 ms | — |
| inspect | step 7: click e1395 | 1 | 200 | 531 ms | 11051 ms | — |
| host | step 5: goto /me | 1 | 200 | 219 ms | 4576 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, step 5: goto /me: 200, 219 ms

Sent:

```json
{
  "qpl_active_flow_ids": "25305590",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "ProfilePromptQuickPromotionMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "profile_id": "61594285317994",
      "prompt_event": "impression",
      "prompt_type": "PERSONAL_PROFILE_DIRECTORY_PROFILE_MEGAPHONE_PROMPT",
      "qp_id": "1256202615885785",
      "actor_id": "61594285317994",
      "client_mutation_id": "1"
    }
  },
  "doc_id": "23874483825521845",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=25305590"
  ]
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
      "request_start_time_ms": 1793038043122,
      "time_at_flush_ms": 1793038043191
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
