# CometMarketplaceRecordPDPDwellTimeMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `24177643518491637` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `marketplace_record_pdp_dwell_time` |
| Called from | `CometMarketplaceRecordPDPDwellTimeMutation` |
| rea | `ev_035c67951c98f6eff1bacf4defb4feee36915f68619e6a00146f903b40de3c33` |

Seen 15 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | openAny: read /marketplace/item/<id>/ | 8 | 200 | 432–686 ms | 70–93 ms | — |
| inspect | openAny: read /marketplace/item/<id>/ | 5 | 200 | 448–893 ms | 73–112 ms | — |
| host | openAny: read /marketplace/item/<id>/ | 2 | 200 | 385–589 ms | 36–41 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, openAny: read /marketplace/item/<id>/: 200, 385 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceRecordPDPDwellTimeMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "listing_id": "1818774979262678",
      "start_time": 1793038230032,
      "actor_id": "61594285317994",
      "client_mutation_id": "3"
    }
  },
  "doc_id": "24177643518491637"
}
```

Answered:

```json
{
  "data": {
    "marketplace_record_pdp_dwell_time": true
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038235386,
      "time_at_flush_ms": 1793038235585
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Records how long the viewer stayed on a Marketplace listing's page (PDP, product details page): it sends `input` and reads back `marketplace_record_pdp_dwell_time`. In our runs it fired 73-112 ms into each `openAny` step that read a `/marketplace/item/<id>/` listing, three times in two runs, so it reports the dwell on the listing just opened.

## What our machine does with it

The feed warm-up's `openListings` step (`src/facebook/warmup/activities/helpers/feed.ts`, `openAny /marketplace/item/ 1-3`) opens the listing that makes Facebook's client send it; the dwell between opening and coming back is ours (`openAny`'s reading pause). The machine never waits for it or reads it: the step passes on the listing's URL. It matters because it is Facebook's own measure of how long each listing was looked at, so the reading pauses in `openAny` are what it reports.

## What can go wrong

None seen: all three answered 200 in 588-893 ms. A failure here would not stop the step (nothing waits on it). A login wall or checkpoint after it is a page state (rule 54): the agent hooks report it and the step's snapshot shows it.
