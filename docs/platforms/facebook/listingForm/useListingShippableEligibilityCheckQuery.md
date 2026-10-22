# useListingShippableEligibilityCheckQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | listingForm |
| Kind | query |
| doc_id | `9589653544404234` |
| Path | `/api/graphql/` |
| Sends | `params` |
| Reads | `isListingEligibleForShipping` |
| Called from | `useListingShippableEligibilityCheck` |
| rea | `ev_2268109b78d0872eb0a55170e823376ab0a90f53109df20c59492cda9ce542b7` |

Seen 33 time(s) in 11 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Category: Miscellaneous | 11 | 200 | 306–379 ms | 4402–6091 ms | — |
| publish | Uploading 5 photo(s) | 18 | 200 | 326–397 ms | 5483–10056 ms | — |
| publish | Uploading 2 photo(s) | 4 | 200 | 319–333 ms | 4295–4779 ms | — |

<!-- facts:end -->

## What it does

Asks whether the listing can be shipped (`isListingEligibleForShipping`). Fires again after the category is picked and after each photo batch, 0.3 s each.

## What our machine does with it

Nothing waits for it. A rubbish-removal service is local pickup; shipping is never turned on.

## What can go wrong

Harmless. It firing after a category pick confirms Facebook took the category.
