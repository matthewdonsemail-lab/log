# useMarketplaceComposerBISNumberEligibilityRefetchQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | listingForm |
| Kind | query |
| doc_id | `39227039350213554` |
| Path | `/api/graphql/` |
| Sends | `category_id`, `has_prefetched_category` |
| Reads | `...useMarketplaceComposerBISNumberEligibility_query` |
| Called from | `useMarketplaceComposerBISNumberEligibility_query.graphql` |
| rea | `ev_fec186f3a53375a91c81f711b409c16734353c11d8cc3768dff99a3a16802b2a` |

Seen 12 time(s) in 12 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Category: Miscellaneous | 11 | 200 | 301–381 ms | 4384–6081 ms | — |
| inspect | scroll: container +87px in 3 steps | 1 | 200 | 1465 ms | 1094 ms | — |

<!-- facts:end -->

## What it does

After the category is picked, asks whether the category needs a business registration number (BIS) from the seller (`category_id`, `has_prefetched_category`).

## What our machine does with it

Nothing today. Miscellaneous and Household have not needed one.

## What can go wrong

If a category ever needs a BIS number, the form gains a required field our machine does not fill, and Publish stays disabled. This request's answer is where that would show first.
