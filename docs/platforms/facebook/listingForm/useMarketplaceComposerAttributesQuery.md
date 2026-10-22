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
| Called from | `MarketplacePDPC2CAttributesComponent.react`, `useMarketplaceComposerAttributes` |
| rea | `ev_f009b64fbfa7218333e3de67fd6c9202ff2861e6898f0ead125036b3506659fa` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 13: goto /marketplace/create/item | 2 | 200 | 350–375 ms | 2490–9489 ms | — |

<!-- facts:end -->

## What it does

Fetches the form's fields for a category (`categoryID` in, the field definitions out): it decides which inputs the create form shows. Fires when the form opens and again after a category is picked.

## What our machine does with it

The publish machine picks the category, then fills the fields it finds. The second sighting, after `Category: ...`, is Facebook redrawing the form for that category: the fields to fill exist only after it.

## What can go wrong

If the fields our machine looks for are missing, read this request's sighting first: no second sighting means the category pick did not register. The US form's fields have no Location (why `locationNotSet` reads the "Listed ... in X" preview instead).
