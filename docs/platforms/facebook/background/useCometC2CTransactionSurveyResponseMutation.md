# useCometC2CTransactionSurveyResponseMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `10064548803584243` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `c2c_transaction_survey_response.client_mutation_id`, `c2c_transaction_survey_response.for_sale_item` |
| Called from | `useCometC2CTransactionSurveyResponseMutation` |
| rea | `ev_f56b393dd9282d09bc5adbed795f974cabe0b96740c22765e00120eded3d26b6` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 7: click e620 | 1 | 200 | 671 ms | 1172 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T173652_61594063207669**, step 7: click e620: 200, 671 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useCometC2CTransactionSurveyResponseMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "action": "DELETE",
      "duplicate_hash": "f770b48411f2c3f8d5207912dc894c177586273bbc5be446c262c51b831cebf0",
      "for_sale_item_id": "1425935622848350",
      "is_short_survey_holdout": true,
      "referral_surface": "UNKNOWN",
      "response": "NO",
      "surface_new": "MARKETPLACE_PAGE_SELLING",
      "actor_id": "61594063207669",
      "client_mutation_id": "2"
    }
  },
  "doc_id": "10064548803584243"
}
```

Answered:

```json
{
  "data": {
    "c2c_transaction_survey_response": {
      "client_mutation_id": "2",
      "for_sale_item": null
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792777202719,
      "time_at_flush_ms": 1792777203060
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Saves the answer to "Did you sell this item?": sent `action: DELETE`, `for_sale_item_id`, `duplicate_hash` and `response` (`NO` for "No, haven't sold"); answered `c2c_transaction_survey_response` (its `for_sale_item` is null once the listing is gone). Fires on the survey's Next.

## What our machine does with it

`marketplaceListingDelete` step `s06_clickNext` waits for it and checks `data.c2c_transaction_survey_response` is present. The listing is already deleted by then; this only closes the survey.

## What can go wrong

Seen with 200 only. If it fails, the listing is still deleted (the step before decided that); the run reports the step and Selling is checked by hand.
