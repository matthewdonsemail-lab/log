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

Seen 53 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Uploading 5 photo(s) | 13 | 200 | 430–643 ms | 26008–27370 ms | — |
| inspect | step 4: type e1311 | 21 | 200 | 421–658 ms | 159–2489 ms | — |
| inspect | step 6: press Backspace | 1 | 200 | 446 ms | 44 ms | — |
| inspect | step 8: press Backspace | 1 | 200 | 455 ms | 370 ms | — |
| inspect | step 9: type e1311 | 11 | 200 | 429–607 ms | 176–1500 ms | A server error field_exception occured. Check server logs for details. |
| inspect | step 11: press Backspace | 1 | 200 | 1411 ms | 926 ms | — |
| inspect | step 12: type e1311 | 5 | 200 | 527–779 ms | 224–652 ms | — |

<!-- facts:end -->

## What it does

The Change location dialog's lookahead: each keystroke in the Location box sends what was typed and returns places.

## What our machine does with it

Typed into by `set_marketplace_location` (publish) and the form's Location field: the zip finds the city ("19601" -> "Reading, PA, US 19601"), the city name may not ("Reading, PA" -> Reading, Jamaica and Reading, Berkshire). The typed value has to arrive as keystrokes: a value set without them sends nothing and no suggestion appears.

## What can go wrong

No suggestion in the right place: the run stops with `locationNotSet` and lists what it saw.
