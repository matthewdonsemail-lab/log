# useMarketplaceComposerPricePredictionQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | listingForm |
| Kind | query |
| doc_id | `9566914303429765` |
| Path | `/api/graphql/` |
| Sends | `params` |
| Reads | `marketplace_c2c_pricing.price_range` |
| Called from | `useMarketplaceComposerPricePrediction` |
| rea | `ev_e0d48b4c63f6347e0b108720f3b175a44c57110e43d648bf8fbb7d94c4d2e334` |

Seen 11 time(s) in 11 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Uploading 5 photo(s) | 9 | 200 | 303–577 ms | 5443–9787 ms | — |
| publish | Uploading 2 photo(s) | 2 | 200 | 311–312 ms | 6545–8172 ms | — |

<!-- facts:end -->

## What it does

Asks Facebook's price suggestion for the listing (`marketplace_c2c_pricing.price_range`). Fires after the photos upload, 5-8 s into the step.

## What our machine does with it

Nothing. The price comes from the listing in Twenty.

## What can go wrong

Harmless. It firing means Facebook has read the uploaded photos (it follows `useSherlockPhotoPredictionMutation`).
