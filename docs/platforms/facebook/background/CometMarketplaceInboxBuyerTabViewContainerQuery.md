# CometMarketplaceInboxBuyerTabViewContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `37969822235938105` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer....CometMarketplaceInboxBuyerTabView_viewer` |
| Called from | `CometMarketplaceInboxBuyerTabViewContainer.react` |
| rea | `ev_0ba04ccc97b3a36dea9c7d1bc7fd39718afd5d2d4bca50d739399ea6403af44a` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /marketplace/inbox | 1 | 200 | 631 ms | 19340 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T113536_61594063207669**, step 1: goto /marketplace/inbox: 200, 631 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceInboxBuyerTabViewContainerQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "37969822235938105"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplaceInboxBuyerMessageThreads": {
        "edges": [],
        "page_info": {
          "end_cursor": null,
          "has_next_page": false
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792668973886,
      "time_at_flush_ms": 1792668974165
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

The buyer tab of Marketplace's inbox: chats where the account is the buyer (`marketplaceInboxBuyerMessageThreads`). It fired as Bethlehem's inbox loaded and answered with no threads.

## What our machine does with it

Nothing reads it: the account sells, so the check reads only the seller tab (`CometMarketplaceInboxSellerTabThreadViewContainerQuery`).

## What can go wrong

None seen: one call, 200 in 631 ms. Nothing of ours depends on it.
