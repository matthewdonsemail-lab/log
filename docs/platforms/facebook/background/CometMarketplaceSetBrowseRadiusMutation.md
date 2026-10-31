# CometMarketplaceSetBrowseRadiusMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `27350813454583510` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `marketplace_set_browse_radius.viewer` |
| Called from | `CometMarketplaceSetBrowseRadiusMutation` |
| rea | `ev_0d16bb2d253cbbe06ed0969670f3303b16981024abd36781b1541146bcdaeddf` |

Seen 9 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 15: click e1354 | 1 | 200 | 454 ms | 1325 ms | — |
| inspect | step 10: click e1174 | 1 | 200 | 680 ms | 1527 ms | — |
| inspect | step 4: setLocation Bethlehem, PA | 1 | 200 | 751 ms | 17666 ms | — |
| inspect | step 13: setLocation 18015 | 1 | 200 | 558 ms | 15364 ms | — |
| flow | setLocation: 'Mountain Top, Pennsylvania' is suggestion 1 of 2 | 2 | 200 | 685–687 ms | 5017–6713 ms | — |
| host | setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9 | 2 | 200 | 685–724 ms | 5144–644747 ms | — |
| host | setLocation: 'Kamloops, British Columbia' is suggestion 1 of 9 | 1 | 200 | 281 ms | 3335 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, setLocation: 'Kamloops, British Columbia' is suggestion 1 of 9: 200, 281 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceSetBrowseRadiusMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "browse_radius": 65,
      "use_suggested_radius": false,
      "actor_id": "61594285317994",
      "client_mutation_id": "2"
    }
  },
  "doc_id": "27350813454583510"
}
```

Answered:

```json
{
  "data": {
    "marketplace_set_browse_radius": {
      "viewer": {
        "marketplace_settings": {
          "browse_radius": 65,
          "id": "TWFya2V0cGxhY2VTZXR0aW5nczo2MTU5NDI4NTMxNzk5NA=="
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038114895,
      "time_at_flush_ms": 1793038115023
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Saves the browse radius chosen in Marketplace's Change location dialog (e.g. 40 miles).

## What our machine does with it

Sent by the same Apply click as `CometMarketplaceSetBuyLocationMutation`; we keep the radius the dialog shows.

## What can go wrong

Harmless. A non-200 would mean the dialog's Apply didn't save.
