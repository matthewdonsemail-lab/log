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
| rea | `ev_6c7e203c15e273a1adfc76f48a3b85d02ad11eb05eea408878d7c7ec936ce3ee` |

Seen 4 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 15: click e1354 | 1 | 200 | 471 ms | 1321 ms | — |
| inspect | step 10: click e1174 | 1 | 200 | 937 ms | 1525 ms | — |
| inspect | step 4: setLocation Bethlehem, PA | 1 | 200 | 518 ms | 17664 ms | — |
| inspect | step 13: setLocation 18015 | 1 | 200 | 569 ms | 15362 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T110738_61594063207669**, step 10: click e1174: 200, 937 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceSetBuyLocationMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "latitude": 40.6262,
      "longitude": -75.3757,
      "actor_id": "61594063207669",
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
            "latitude": 40.6262,
            "longitude": -75.3757,
            "reverse_geocode": {
              "city": "Bethlehem",
              "city_page": {
                "marketplace_vanity_id": "112122412138421",
                "id": "112122412138421"
              },
              "state": "PA",
              "postal_code": "18018-2846"
            }
          },
          "current_marketplace": {
            "__typename": "Marketplace",
            "is_metric_base": false,
            "id": "1663689853903557"
          },
          "id": "TWFya2V0cGxhY2VTZXR0aW5nczo2MTU5NDA2MzIwNzY2OQ=="
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667563492,
      "time_at_flush_ms": 1792667563647
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T105341_61594063207669**, step 4: setLocation Bethlehem, PA: 200, 518 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceSetBuyLocationMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "latitude": 31.7031,
      "longitude": 35.1956,
      "actor_id": "61594063207669",
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
            "latitude": 31.7031,
            "longitude": 35.1956,
            "reverse_geocode": {
              "city": "Bethlehem",
              "city_page": {
                "marketplace_vanity_id": "101880973186304",
                "id": "101880973186304"
              },
              "state": "",
              "postal_code": ""
            }
          },
          "current_marketplace": {
            "__typename": "Marketplace",
            "is_metric_base": true,
            "id": "431364634888083"
          },
          "id": "TWFya2V0cGxhY2VTZXR0aW5nczo2MTU5NDA2MzIwNzY2OQ=="
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792666533392,
      "time_at_flush_ms": 1792666533454
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T105341_61594063207669**, step 13: setLocation 18015: 200, 569 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceSetBuyLocationMutation",
  "server_timestamps": "true",
  "variables": {
    "input": {
      "latitude": 37.193232725035,
      "longitude": -3.6622435304279,
      "actor_id": "61594063207669",
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
            "latitude": 37.193232725035,
            "longitude": -3.6622435304279,
            "reverse_geocode": {
              "city": "Granada",
              "city_page": {
                "marketplace_vanity_id": "108263972541612",
                "id": "108263972541612"
              },
              "state": "AN",
              "postal_code": "18015"
            }
          },
          "current_marketplace": {
            "__typename": "Marketplace",
            "is_metric_base": true,
            "id": "815544551944570"
          },
          "id": "TWFya2V0cGxhY2VTZXR0aW5nczo2MTU5NDA2MzIwNzY2OQ=="
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792666806995,
      "time_at_flush_ms": 1792666807098
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
