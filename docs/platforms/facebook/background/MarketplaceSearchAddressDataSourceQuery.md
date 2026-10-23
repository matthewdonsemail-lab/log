# MarketplaceSearchAddressDataSourceQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `9660140454040174` |
| Path | `/api/graphql/` |
| Sends | `params` |
| Reads | `city_street_search.street_results` |
| Called from | `MarketplaceSearchAddressDataSource.query` |
| rea | `ev_419a0ebcddf76c934d343c10ff391a0b746b3baeb9644f33bc1850a30093eb4e` |

Seen 102 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Uploading 5 photo(s) | 13 | 200 | 430–643 ms | 26008–27370 ms | — |
| inspect | step 4: type e1311 | 21 | 200 | 421–658 ms | 159–2489 ms | — |
| inspect | step 6: press Backspace | 2 | 200 | 446–1864 ms | 44–79 ms | — |
| inspect | step 8: press Backspace | 1 | 200 | 455 ms | 370 ms | — |
| inspect | step 9: type e1311 | 11 | 200 | 429–607 ms | 176–1500 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 11: press Backspace | 1 | 200 | 1411 ms | 926 ms | — |
| inspect | step 12: type e1311 | 5 | 200 | 527–779 ms | 224–652 ms | — |
| inspect | step 5: setLocation Bethlehem, Pennsylvania | 25 | 200 | 446–4392 ms | 8240–10641 ms | — |
| inspect | step 7: press a | 1 | 200 | 708 ms | 61 ms | — |
| inspect | step 4: setLocation Bethlehem, PA | 15 | 200 | 727–1420 ms | 11130–12491 ms | — |
| inspect | step 13: setLocation 18015 | 7 | 200 | 444–668 ms | 9754–10258 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T110738_61594063207669**, step 5: setLocation Bethlehem, Pennsylvania: 200, 716 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceSearchAddressDataSourceQuery",
  "server_timestamps": "true",
  "variables": {
    "params": {
      "caller": "MARKETPLACE",
      "country_filter": null,
      "integration_strategy": "STRING_MATCH",
      "page_category": [
        "CITY",
        "SUBCITY",
        "NEIGHBORHOOD",
        "POSTAL_CODE"
      ],
      "query": "Maracena, Spain",
      "search_type": "PLACE_TYPEAHEAD",
      "viewer_coordinates": {
        "latitude": 37.193232725035,
        "longitude": -3.6622435304279
      }
    }
  },
  "doc_id": "9660140454040174"
}
```

Answered:

```json
{
  "data": {
    "city_street_search": {
      "street_results": {
        "edges": [
          {
            "node": {
              "single_line_address": "Maracena, Spain",
              "multi_line_address": [],
              "subtitle": "City",
              "page": {
                "id": "108263972541612"
              },
              "location": {
                "latitude": 37.20537,
                "longitude": -3.63734,
                "reverse_geocode_detailed": {
                  "city": "Maracena",
                  "postal_code": "18200"
                }
              }
            }
          },
          {
            "node": {
              "single_line_address": "Cerrillo De Maracena, Andalucia, Spain",
              "multi_line_address": [],
              "subtitle": "Cerrillo de Maracena, Spain · 1,061 people checked in here",
              "page": {
                "id": "107477972621413"
              },
              "location": {
                "latitude": 37.2,
                "longitude": -3.63333,
                "reverse_geocode_detailed": {
                  "city": "Granada",
                  "postal_code": "18014"
                }
              }
            }
          }
        ]
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667459954,
      "time_at_flush_ms": 1792667460300
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T110738_61594063207669**, step 6: press Backspace: 200, 1864 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceSearchAddressDataSourceQuery",
  "server_timestamps": "true",
  "variables": {
    "params": {
      "caller": "MARKETPLACE",
      "country_filter": null,
      "integration_strategy": "STRING_MATCH",
      "page_category": [
        "CITY",
        "SUBCITY",
        "NEIGHBORHOOD",
        "POSTAL_CODE"
      ],
      "query": "Bethlehem, Pennsylvani",
      "search_type": "PLACE_TYPEAHEAD",
      "viewer_coordinates": {
        "latitude": 37.193232725035,
        "longitude": -3.6622435304279
      }
    }
  },
  "doc_id": "9660140454040174"
}
```

Answered:

```json
{
  "data": {
    "city_street_search": {
      "street_results": {
        "edges": [
          {
            "node": {
              "single_line_address": "Bethlehem, Pennsylvania",
              "multi_line_address": [],
              "subtitle": "City",
              "page": {
                "id": "112122412138421"
              },
              "location": {
                "latitude": 40.6262,
                "longitude": -75.3757,
                "reverse_geocode_detailed": {
                  "city": "Bethlehem",
                  "postal_code": "18018-2846"
                }
              }
            }
          },
          {
            "node": {
              "single_line_address": "West Bethlehem",
              "multi_line_address": [],
              "subtitle": "West Bethlehem, PA, US · 8,917 people checked in here",
              "page": {
                "id": "106487812719927"
              },
              "location": {
                "latitude": 40.633495,
                "longitude": -75.40961,
                "reverse_geocode_detailed": {
                  "city": "Bethlehem",
                  "postal_code": "18018-1515"
                }
              }
            }
          },
          {
            "node": {
              "single_line_address": "South Bethlehem",
              "multi_line_address": [],
              "subtitle": "South Bethlehem, PA, US · 8,314 people checked in here",
              "page": {
                "id": "522250254591818"
              },
              "location": {
                "latitude": 40.604397,
                "longitude": -75.349135,
                "reverse_geocode_detailed": {
                  "city": "Bethlehem",
                  "postal_code": "18015"
                }
              }
            }
          },
          {
            "node": {
              "single_line_address": "New Bethlehem, Pennsylvania",
              "multi_line_address": [],
              "subtitle": "City",
              "page": {
                "id": "107987009229121"
              },
              "location": {
                "latitude": 41.0033,
                "longitude": -79.3308,
                "reverse_geocode_detailed": {
                  "city": "New Bethlehem",
                  "postal_code": "16242-1114"
                }
              }
            }
          },
          {
            "node": {
              "single_line_address": "South Bethlehem, Pennsylvania",
              "multi_line_address": [],
              "subtitle": "City",
              "page": {
                "id": "112587042087177"
              },
              "location": {
                "latitude": 41.00106,
                "longitude": -79.33716,
                "reverse_geocode_detailed": {
                  "city": "New Bethlehem",
                  "postal_code": "16242-1214"
                }
              }
            }
          },
          {
            "node": {
              "single_line_address": "Central Bethlehem",
              "multi_line_address": [],
              "subtitle": "Central Bethlehem, PA, US · 558 people checked in here",
              "page": {
                "id": "867728996597059"
              },
              "location": {
                "latitude": 40.627606,
                "longitude": -75.363761,
                "reverse_geocode_detailed": {
                  "city": "Bethlehem",
                  "postal_code": "18018-3104"
                }
              }
            }
          },
          "… 2 more"
        ]
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667509330,
      "time_at_flush_ms": 1792667509592
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T110738_61594063207669**, step 7: press a: 200, 708 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceSearchAddressDataSourceQuery",
  "server_timestamps": "true",
  "variables": {
    "params": {
      "caller": "MARKETPLACE",
      "country_filter": null,
      "integration_strategy": "STRING_MATCH",
      "page_category": [
        "CITY",
        "SUBCITY",
        "NEIGHBORHOOD",
        "POSTAL_CODE"
      ],
      "query": "Bethlehem, Pennsylvania",
      "search_type": "PLACE_TYPEAHEAD",
      "viewer_coordinates": {
        "latitude": 37.193232725035,
        "longitude": -3.6622435304279
      }
    }
  },
  "doc_id": "9660140454040174"
}
```

Answered:

```json
{
  "data": {
    "city_street_search": {
      "street_results": {
        "edges": [
          {
            "node": {
              "single_line_address": "Bethlehem, Pennsylvania",
              "multi_line_address": [],
              "subtitle": "City",
              "page": {
                "id": "112122412138421"
              },
              "location": {
                "latitude": 40.6262,
                "longitude": -75.3757,
                "reverse_geocode_detailed": {
                  "city": "Bethlehem",
                  "postal_code": "18018-2846"
                }
              }
            }
          },
          {
            "node": {
              "single_line_address": "New Bethlehem, Pennsylvania",
              "multi_line_address": [],
              "subtitle": "City",
              "page": {
                "id": "107987009229121"
              },
              "location": {
                "latitude": 41.0033,
                "longitude": -79.3308,
                "reverse_geocode_detailed": {
                  "city": "New Bethlehem",
                  "postal_code": "16242-1114"
                }
              }
            }
          },
          {
            "node": {
              "single_line_address": "South Bethlehem, Pennsylvania",
              "multi_line_address": [],
              "subtitle": "City",
              "page": {
                "id": "112587042087177"
              },
              "location": {
                "latitude": 41.00106,
                "longitude": -79.33716,
                "reverse_geocode_detailed": {
                  "city": "New Bethlehem",
                  "postal_code": "16242-1214"
                }
              }
            }
          },
          {
            "node": {
              "single_line_address": "West Bethlehem",
              "multi_line_address": [],
              "subtitle": "West Bethlehem, PA, US · 8,917 people checked in here",
              "page": {
                "id": "106487812719927"
              },
              "location": {
                "latitude": 40.633495,
                "longitude": -75.40961,
                "reverse_geocode_detailed": {
                  "city": "Bethlehem",
                  "postal_code": "18018-1515"
                }
              }
            }
          },
          {
            "node": {
              "single_line_address": "South Bethlehem",
              "multi_line_address": [],
              "subtitle": "South Bethlehem, PA, US · 8,314 people checked in here",
              "page": {
                "id": "522250254591818"
              },
              "location": {
                "latitude": 40.604397,
                "longitude": -75.349135,
                "reverse_geocode_detailed": {
                  "city": "Bethlehem",
                  "postal_code": "18015"
                }
              }
            }
          },
          {
            "node": {
              "single_line_address": "Central Bethlehem",
              "multi_line_address": [],
              "subtitle": "Central Bethlehem, PA, US · 558 people checked in here",
              "page": {
                "id": "867728996597059"
              },
              "location": {
                "latitude": 40.627606,
                "longitude": -75.363761,
                "reverse_geocode_detailed": {
                  "city": "Bethlehem",
                  "postal_code": "18018-3104"
                }
              }
            }
          },
          "… 2 more"
        ]
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792667515988,
      "time_at_flush_ms": 1792667516104
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

The Change location dialog's lookahead: each keystroke in the Location box sends what was typed and returns places.

## What our machine does with it

Typed into by `set_marketplace_location` (publish) and the form's Location field: the zip finds the city ("19601" -> "Reading, PA, US 19601"), the city name may not ("Reading, PA" -> Reading, Jamaica and Reading, Berkshire). The typed value has to arrive as keystrokes: a value set without them sends nothing and no suggestion appears.

## What can go wrong

No suggestion in the right place: the run stops with `locationNotSet` and lists what it saw.
