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
| rea | `ev_6b89dd01fee5c5a08e8c93273e5fb4867df9de4e9e89f1936ca56a4191f334d1` |

Seen 266 time(s) in 9 run(s).

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
| flow | step 2: setLocation Mountain Top, Pennsylvania | 82 | 200 | 439–3124 ms | 8700–15611 ms | — |
| host | step 42: setLocation Mountain Top, Pennsylvania | 28 | 200 | 470–3016 ms | 10101–12820 ms | — |
| host | setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9 | 27 | 200 | 453–721 ms | 634413–637145 ms | — |
| host | step 14: setLocation Kamloops, British Columbia | 27 | 200 | 178–533 ms | 9853–12426 ms | A server error field_exception occured. Check server logs for details. |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, step 14: setLocation Kamloops, British Columbia: 200, 178 ms

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
      "query": "",
      "search_type": "PLACE_TYPEAHEAD",
      "viewer_coordinates": {
        "latitude": 32.739,
        "longitude": -97.1145
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
        "edges": []
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038108619,
      "time_at_flush_ms": 1793038108656
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
