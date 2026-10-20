# MarketplaceBuyLocationDialogQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: click e236 | 1 | 200 | 361 ms | 1017 ms | — |

<!-- facts:end -->

## What it does

Loads the Change location dialog: the current location, radius and map.

## What our machine does with it

Opened by the "Location: <city>, Within <n> mi" button in `set_marketplace_location`; the button's name says where the account is now.

## What can go wrong

Harmless.
