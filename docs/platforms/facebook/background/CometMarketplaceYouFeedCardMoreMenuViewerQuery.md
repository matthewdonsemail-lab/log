# CometMarketplaceYouFeedCardMoreMenuViewerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `26659699326980679` |
| Path | `/api/graphql/` |
| Sends | `listingId` |
| Reads | `viewer.marketplace_suggested_crosspost_targets`, `viewer....CometUFIShareToFriendsFeedMenuItem_viewer` |
| Called from | `CometMarketplaceYouFeedCardMoreMenu.react` |
| rea | `ev_74fd9d128460e37ab9ff0e2a845cd1f3ca87818f2de0f1cd7abe7708f9e7fdbc` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: click e356 | 1 | 200 | 525 ms | 939 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T173652_61594063207669**, step 3: click e356: 200, 525 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceYouFeedCardMoreMenuViewerQuery",
  "server_timestamps": "true",
  "variables": {
    "listingId": "1425935622848350"
  },
  "doc_id": "26659699326980679"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_suggested_crosspost_targets": {
        "edges": []
      },
      "can_share_to_friends_timeline": true
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792777112611,
      "time_at_flush_ms": 1792777112756
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Asks, for `listingId`, what the viewer may do from the card's menu: answered `can_share_to_friends_timeline`. Fires with the menu target query when the menu opens.

## What our machine does with it

Nothing reads it; `s02_clickMoreOptions` is decided by the target query beside it.

## What can go wrong

Seen with 200 only. It changes nothing; a failure would only hide sharing options in the menu.
