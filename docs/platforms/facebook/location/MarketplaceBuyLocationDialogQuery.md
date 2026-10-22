# MarketplaceBuyLocationDialogQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | location |
| Kind | query |
| doc_id | `27586196974346486` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer.marketplace_settings` |
| Called from | `MarketplaceBuyLocationDialog.react` |
| rea | `ev_190cc31dd8ebb100eb1c5d6829ff3154e6d1cde4c23cc8b04ad55d17d251d311` |

Seen 4 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: click e236 | 1 | 200 | 361 ms | 1017 ms | — |
| inspect | step 5: setLocation Bethlehem, Pennsylvania | 1 | 200 | 452 ms | 5727 ms | — |
| inspect | step 4: setLocation Bethlehem, PA | 1 | 200 | 1200 ms | 7428 ms | — |
| inspect | step 13: setLocation 18015 | 1 | 200 | 377 ms | 7904 ms | — |

<!-- facts:end -->

## What it does

Loads the Change location dialog: the current location, radius and map.

## What our machine does with it

Opened by the "Location: <city>, Within <n> mi" button in `set_marketplace_location`; the button's name says where the account is now.

## What can go wrong

Harmless.
