# CometMarketplaceNUXUpdateStateMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `23955024057437109` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `marketplace_nux_update_state.viewer` |
| Called from | `CometMarketplaceNUXUpdateStateMutation` |
| rea | `ev_5dd6ed80daee8a5185dc431c11be593a45faaf3f946b9b525956215575f252d6` |

Seen 6 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 21: goto /marketplace/ | 1 | 200 | 439 ms | 47 ms | — |
| inspect | step 27: click e1541 | 1 | 200 | 455 ms | 918 ms | — |
| host | step 6: goto /marketplace/status | 1 | 200 | 643 ms | 47 ms | — |
| flow | step 16: clickRole button "…" | 2 | 200 | 502–852 ms | 1012–1017 ms | — |
| host | step 4: goto /marketplace/status | 1 | -1 | -1 ms | 35 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T170006_61594285317994**, step 4: goto /marketplace/status: -1, -1 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceNUXUpdateStateMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "nux_type": "mp_seller_announcement_center_nux",
      "actor_id": "61594285317994",
      "client_mutation_id": "1"
    }
  },
  "doc_id": "23955024057437109"
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

Marks a Marketplace first-use tip as seen.

## What our machine does with it

Nothing.

## What can go wrong

Harmless; it shows the account is new to Marketplace.
