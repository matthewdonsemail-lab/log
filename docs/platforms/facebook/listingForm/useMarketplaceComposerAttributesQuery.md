# useMarketplaceComposerAttributesQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | listingForm |
| Kind | query |
| doc_id | `24482075174793922` |
| Path | `/api/graphql/` |
| Sends | `categoryID` |
| Reads | `viewer.definitions` |
| Called from | `MarketplacePDPC2CAttributesComponent.react` |
| rea | `ev_23049485227d4ec91cc2c3b57b4b7da0f6322c73b1f8f951a6753ba37172d8cd` |

Seen 7 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 13: goto /marketplace/create/item | 2 | 200 | 350–375 ms | 2490–9489 ms | — |
| inspect | step 11: goto /marketplace/create/item | 1 | 200 | 369 ms | 2287 ms | — |
| inspect | scroll: container +87px in 3 steps | 1 | 200 | 1709 ms | 1077 ms | — |
| inspect | step 1: goto /marketplace/create/item | 2 | 200 | 425–545 ms | 5315–8980 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 382 ms | 2487 ms | — |

<!-- facts:end -->

## What it does

Fetches the form's fields for a category (`categoryID` in, the field definitions out): it decides which inputs the create form shows. Fires when the form opens and again after a category is picked.

## What our machine does with it

The publish machine picks the category, then fills the fields it finds. The second sighting, after `Category: ...`, is Facebook redrawing the form for that category: the fields to fill exist only after it.

## What can go wrong

If the fields our machine looks for are missing, read this request's sighting first: no second sighting means the category pick did not register. The US form's fields have no Location (why `locationNotSet` reads the "Listed ... in X" preview instead).
