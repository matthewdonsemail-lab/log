# MarketplaceComposerAIPricingDialogImplSimilarListingsQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | listingForm |
| Kind | query |
| doc_id | `28373107865682771` |
| Path | `/api/graphql/` |
| Sends | `ai_suggested_condition`, `ai_suggested_price_cents`, `category_ids`, `composer_mode`, `limit`, `listing_title`, `pricing_attempt_id`, `pricing_source`, `session_id` |
| Reads | — |
| Called from | — |
| rea | `ev_a60b29dd39f9845fa773f6bcea083bd82d632d73e635b10861713226edadb094` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | scroll: container +87px in 3 steps | 1 | 200 | 1461 ms | 1069 ms | — |

<!-- facts:end -->

## What it does

The listing form's price suggestion: with the title, the category, the condition and the suggested price, it asks for similar listings to compare against (`MarketplaceComposerAIPricingDialogImpl`). It fired 1 s after the Category was chosen in Bethlehem's publish (step 19).

## What our machine does with it

Nothing reads it. The flow types its own price (`{price}`) and never opens the pricing suggestion.

## What can go wrong

None seen: one call, 200 in 1461 ms. A failure would only hide the suggestion; the price typed is unaffected.
