# CometHomeCreateMenuContentQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28430483319975420` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer.actor`, `viewer.account_user`, `viewer.can_create_page`, `viewer.can_create_nonprofit_fundraiser`, `viewer.marketplace_nav_tab_visible`, `viewer.marketplace_feature_access_status`, `lwi.should_direct_to_lwi` |
| Called from | `CometHomeCreateMenuContent.react` |
| rea | `ev_ce3a3e0411d4d96c98fb842dce351a191c4e1062c311b30b7ceaf8d2c63e104c` |

Seen 14 time(s) in 12 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 27: dwell 0.29s | 1 | 200 | 451 ms | 65 ms | — |
| inspect | post: "…", 103 words, 0 image(s), scrolled 70 px | 1 | 200 | 886 ms | 648 ms | — |
| inspect | step 12: dwell 0.14s | 1 | 200 | 494 ms | 808 ms | — |
| inspect | clickRole failed: RuntimeError: no visible button "…" | 1 | 200 | 327 ms | 15180 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 401 ms | 745295 ms | — |
| inspect | step 67: dwell 1s | 1 | 200 | 706 ms | 50 ms | — |
| inspect | setLocation failed: TimeoutError: Locator.wait_for: Timeout 30000ms exceeded. | 1 | 200 | 1685 ms | 456 ms | — |
| inspect | step 16: type e232 | 1 | 200 | 377 ms | 9063 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 489 ms | 5572 ms | — |
| inspect | step 3: goto /marketplace/inbox | 2 | 200 | 555–566 ms | 10615–22214 ms | — |
| inspect | step 4: goto /marketplace/inbox | 1 | 200 | 1467 ms | 1630105 ms | — |
| inspect | step 6: wait 6s | 2 | 200 | 427–739 ms | 17700–36577 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T045453_61594063207669**, step 6: wait 6s: 200, 739 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeCreateMenuContentQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "28430483319975420"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "actor": {
        "__typename": "User",
        "id": "61594063207669",
        "if_viewer_has_professional_dashboard": false
      },
      "account_user": {
        "should_use_page_rename": false,
        "id": "61594063207669"
      },
      "can_create_page": true,
      "can_create_nonprofit_fundraiser": false,
      "marketplace_nav_tab_visible": true,
      "marketplace_feature_access_status": {
        "sell_on_marketplace": "ELIGIBLE"
      }
    },
    "lwi": {
      "should_direct_to_lwi": false
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792731643581,
      "time_at_flush_ms": 1792731643608
    },
    "is_final": true
  }
}
```

**runs/inspect/20261023T000744_61594063207669**, step 3: goto /marketplace/inbox: 200, 555 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeCreateMenuContentQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "28430483319975420"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "actor": {
        "__typename": "User",
        "id": "61594063207669",
        "if_viewer_has_professional_dashboard": false
      },
      "account_user": {
        "should_use_page_rename": false,
        "id": "61594063207669"
      },
      "can_create_page": true,
      "can_create_nonprofit_fundraiser": false,
      "marketplace_nav_tab_visible": true,
      "marketplace_feature_access_status": {
        "sell_on_marketplace": "ELIGIBLE"
      }
    },
    "lwi": {
      "should_direct_to_lwi": false
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792714141637,
      "time_at_flush_ms": 1792714141661
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T130601_61594063207669**, step 4: goto /marketplace/inbox: 200, 1467 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeCreateMenuContentQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "28430483319975420"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "actor": {
        "__typename": "User",
        "id": "61594063207669",
        "if_viewer_has_professional_dashboard": false
      },
      "account_user": {
        "should_use_page_rename": false,
        "id": "61594063207669"
      },
      "can_create_page": true,
      "can_create_nonprofit_fundraiser": false,
      "marketplace_nav_tab_visible": true,
      "marketplace_feature_access_status": {
        "sell_on_marketplace": "ELIGIBLE"
      }
    },
    "lwi": {
      "should_direct_to_lwi": false
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792676064436,
      "time_at_flush_ms": 1792676064469
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

The "Create" half of the Menu panel (post, story, reel, page, ad, group…).

## What our machine does with it

Nothing; fetched with the other menu queries on a hover of the menu button.

## What can go wrong

Harmless.
