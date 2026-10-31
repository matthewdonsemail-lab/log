# useCometC2CTransactionSurveyImpressionMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `23933994179537667` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `c2c_transaction_survey_impression.client_mutation_id`, `c2c_transaction_survey_impression.for_sale_item` |
| Called from | `useCometC2CTransactionSurveyImpressionMutation` |
| rea | `ev_de0b7d4c9275c0b2a8c185f407116465efb1d8eb14097021b5d408d8d2121f1a` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e537 | 1 | 200 | 768 ms | 1983 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T173652_61594063207669**, step 5: click e537: 200, 768 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useCometC2CTransactionSurveyImpressionMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "action": "DELETE",
      "for_sale_item_id": "1425935622848350",
      "is_short_survey_holdout": true,
      "referral_surface": null,
      "surface_new": "MARKETPLACE_PAGE_SELLING",
      "actor_id": "61594063207669",
      "client_mutation_id": "1"
    }
  },
  "doc_id": "23933994179537667"
}
```

Answered:

```json
{
  "data": {
    "c2c_transaction_survey_impression": {
      "client_mutation_id": "1",
      "for_sale_item": {
        "should_show_txn_survey_on_mas": true,
        "should_show_txn_survey_on_delete": true,
        "id": "1425935622848350"
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792777167751,
      "time_at_flush_ms": 1792777167971
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Logs that the "Did you sell this item?" survey was shown after a delete: sent `action: DELETE`, `for_sale_item_id`, `surface_new: MARKETPLACE_PAGE_SELLING`; answered the item's `should_show_txn_survey_on_delete` and `should_show_txn_survey_on_mas`. Fires with the delete mutation.

## What our machine does with it

Nothing reads it; it is a side effect of `s04_clickDelete`, which the delete mutation decides.

## What can go wrong

Seen with 200 only. It changes nothing about the listing.
