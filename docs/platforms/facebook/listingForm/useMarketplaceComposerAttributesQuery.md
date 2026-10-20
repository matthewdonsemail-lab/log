# useMarketplaceComposerAttributesQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | listingForm |
| Kind | query |
| doc_id | `24482075174793922` |
| Path | `/api/graphql/` |
| Sends | `categoryID` |
| Reads | `viewer.definitions` |
| Called from | `MarketplacePDPC2CAttributesComponent.react`, `useMarketplaceComposerAttributes` |
| rea | `ev_5c1bdd8a11d958246ca79d90b2b7102a39854b47f835d0a6d56d709e43f5ec8c` |

Seen 24 time(s) in 13 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Opening /marketplace/create/item | 12 | 200 | 304–397 ms | 5880–13687 ms | — |
| publish | Category: Miscellaneous | 11 | 200 | 324–410 ms | 4366–6080 ms | — |
| inspect | step 16: goto /marketplace/create/item | 1 | 200 | 406 ms | 4147 ms | — |

<!-- facts:end -->

## What it does

Fetches the form's fields for a category (`categoryID` in, the field definitions out): it decides which inputs the create form shows. Fires when the form opens and again after a category is picked.

## What our machine does with it

The publish machine picks the category, then fills the fields it finds. The second sighting, after `Category: ...`, is Facebook redrawing the form for that category: the fields to fill exist only after it.

## What can go wrong

If the fields our machine looks for are missing, read this request's sighting first: no second sighting means the category pick did not register. The US form's fields have no Location (why `locationNotSet` reads the "Listed ... in X" preview instead).
