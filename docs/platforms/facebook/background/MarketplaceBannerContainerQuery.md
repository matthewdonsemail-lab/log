# MarketplaceBannerContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `36336015646043762` |
| Path | `/api/graphql/` |
| Sends | `params`, `scale` |
| Reads | `...MarketplaceBannerContainer_query` |
| Called from | `MarketplaceBannerContainer.react` |
| rea | `ev_381968d1c5011cfe91ef811cd87425592611ae2bb16d48689a668caffe2209d4` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: click e191 | 1 | 200 | 1283 ms | 2972 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 716 ms | 479391 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T155857_61594063207669**, step 3: goto /marketplace/inbox: 200, 716 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceBannerContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "params": {
      "render_location": "HOME_FEED"
    },
    "scale": 1
  },
  "doc_id": "36336015646043762"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_comet_banner": null
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792685337348,
      "time_at_flush_ms": 1792685337384
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T110738_61594063207669**, step 4: click e191: 200, 1283 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceBannerContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "params": {
      "render_location": "HOME_FEED"
    },
    "scale": 1
  },
  "doc_id": "36336015646043762"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_comet_banner": null
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667424741,
      "time_at_flush_ms": 1792667424867
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

The banner at the top of Marketplace's home (`MarketplaceBannerContainer.react`), loaded by `params`. It fired as Marketplace's home loaded (step 4).

## What our machine does with it

Nothing reads it: it is part of Marketplace's home loading.

## What can go wrong

None seen: one call, 200 in 1283 ms. A failure would only hide the banner.
