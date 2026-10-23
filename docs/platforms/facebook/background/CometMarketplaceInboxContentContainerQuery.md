# CometMarketplaceInboxContentContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27439893065673498` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer....CometMarketplaceInboxContent_viewer` |
| Called from | `CometMarketplaceInboxContentContainer.react` |
| rea | `ev_4bc662aadf436f5bbfbb68090747cc344b4422b8b432341560b1e61402c05bcf` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: click e156 | 1 | 200 | 466 ms | 711 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 538 ms | 489436 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T155857_61594063207669**, step 3: goto /marketplace/inbox: 200, 538 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceInboxContentContainerQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "27439893065673498"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_settings": {
        "preferred_inbox_viewer_role": "SELLER",
        "id": "TWFya2V0cGxhY2VTZXR0aW5nczo2MTU5NDA2MzIwNzY2OQ=="
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792685347265,
      "time_at_flush_ms": 1792685347289
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T113536_61594063207669**, step 3: click e156: 200, 466 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceInboxContentContainerQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "27439893065673498"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_settings": {
        "preferred_inbox_viewer_role": "SELLER",
        "id": "TWFya2V0cGxhY2VTZXR0aW5nczo2MTU5NDA2MzIwNzY2OQ=="
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792669010712,
      "time_at_flush_ms": 1792669010749
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

The inbox page's frame: which tab opens by default (`marketplace_settings.preferred_inbox_viewer_role`, SELLER on Bethlehem). It fired when Inbox was clicked in Marketplace's sidebar (step 3).

## What our machine does with it

Nothing reads it. The check opens the seller tab by its URL (`?targetTab=SELLER`), whatever the default.

## What can go wrong

None seen: one call, 200 in 466 ms. Nothing of ours depends on it.
