# CometMarketplaceSetBuyLocationMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | location |
| Kind | mutation |
| doc_id | `27784133851221395` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `marketplace_set_buy_location.viewer` |
| Called from | `CometMarketplaceSetBuyLocationMutation` |
| rea | `ev_430e5e1debf1390088b8251ec9975aa2d81e827bdfb162d1d14168df4fc79b23` |

Seen 9 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 15: click e1354 | 1 | 200 | 471 ms | 1321 ms | — |
| inspect | step 10: click e1174 | 1 | 200 | 937 ms | 1525 ms | — |
| inspect | step 4: setLocation Bethlehem, PA | 1 | 200 | 518 ms | 17664 ms | — |
| inspect | step 13: setLocation 18015 | 1 | 200 | 569 ms | 15362 ms | — |
| flow | setLocation: 'Mountain Top, Pennsylvania' is suggestion 1 of 2 | 2 | 200 | 471–509 ms | 5015–6710 ms | — |
| host | setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9 | 2 | 200 | 471–536 ms | 5142–644745 ms | — |
| host | setLocation: 'Kamloops, British Columbia' is suggestion 1 of 9 | 1 | 200 | 283 ms | 3334 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, setLocation: 'Kamloops, British Columbia' is suggestion 1 of 9: 200, 283 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceSetBuyLocationMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "latitude": 50.6759,
      "longitude": -120.33898,
      "actor_id": "61594285317994",
      "client_mutation_id": "1"
    }
  },
  "doc_id": "27784133851221395"
}
```

Answered:

```json
{
  "data": {
    "marketplace_set_buy_location": {
      "viewer": {
        "marketplace_settings": {
          "buy_location": {
            "latitude": 50.6759,
            "longitude": -120.33898,
            "reverse_geocode": {
              "city": "Kamloops",
              "city_page": {
                "marketplace_vanity_id": "114995818516099",
                "id": "114995818516099"
              },
              "state": "BC",
              "postal_code": "V2C"
            }
          },
          "current_marketplace": {
            "__typename": "Marketplace",
            "is_metric_base": true,
            "id": "1759579680997030"
          },
          "id": "TWFya2V0cGxhY2VTZXR0aW5nczo2MTU5NDI4NTMxNzk5NA=="
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038114895,
      "time_at_flush_ms": 1793038115033
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Saves the account's Marketplace location from the Change location dialog. The create form's `sell_location` follows it: the listing is placed there.

## What our machine does with it

Sent by `set_marketplace_location` in a `--live` publish when the form would list elsewhere (Reading was in Pensacola, FL), with the listing's `locationPostalCode`; the run waits for its 200, reopens the form and checks `sell_location` again. First sent by hand on Reading, 2026-10-19 13:18.

## What can go wrong

A non-200, or `sell_location` still elsewhere afterwards: `locationNotSet`, nothing is uploaded or published.
