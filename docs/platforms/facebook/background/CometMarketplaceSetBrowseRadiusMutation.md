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
| rea | `ev_de8df333d384b2ad1cb2aac17072e4f280e3ef041a7fecc4615138d38c3313f9` |

Seen 8 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 15: click e1354 | 1 | 200 | 454 ms | 1325 ms | — |
| inspect | step 10: click e1174 | 1 | 200 | 680 ms | 1527 ms | — |
| inspect | step 4: setLocation Bethlehem, PA | 1 | 200 | 751 ms | 17666 ms | — |
| inspect | step 13: setLocation 18015 | 1 | 200 | 558 ms | 15364 ms | — |
| flow | setLocation: 'Mountain Top, Pennsylvania' is suggestion 1 of 2 | 2 | 200 | 685–687 ms | 5017–6713 ms | — |
| host | setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9 | 2 | 200 | 685–724 ms | 5144–644747 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T110738_61594063207669**, step 10: click e1174: 200, 680 ms

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
      "actor_id": "61594063207669",
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
          "id": "TWFya2V0cGxhY2VTZXR0aW5nczo2MTU5NDA2MzIwNzY2OQ=="
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667563493,
      "time_at_flush_ms": 1792667563550
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T105341_61594063207669**, step 4: setLocation Bethlehem, PA: 200, 751 ms

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
      "actor_id": "61594063207669",
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
          "id": "TWFya2V0cGxhY2VTZXR0aW5nczo2MTU5NDA2MzIwNzY2OQ=="
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792666533515,
      "time_at_flush_ms": 1792666533613
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T105341_61594063207669**, step 13: setLocation 18015: 200, 558 ms

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
      "actor_id": "61594063207669",
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
          "id": "TWFya2V0cGxhY2VTZXR0aW5nczo2MTU5NDA2MzIwNzY2OQ=="
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792666806995,
      "time_at_flush_ms": 1792666807027
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
