# MarketplaceYouSellingUpsellCardQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `9626969840719635` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer....MarketplaceYouSellingUpsellCard_viewer` |
| Called from | `MarketplaceYouSellingUpsellCard.react` |
| rea | `ev_00977e2ab70ca12a60a74cc135fd797089c7b462f9a8434a2065fcc5480f693a` |

Seen 13 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Marketplace location: Reading 19601 US | 1 | 200 | 2247 ms | 37650 ms | — |
| inspect | step 25: click e1241 | 1 | 200 | 800 ms | 15204 ms | — |
| inspect | step 4: goto /marketplace/you/selling | 1 | 200 | 442 ms | 4339 ms | — |
| inspect | step 7: goto /marketplace/you/selling | 1 | 200 | 797 ms | 1919 ms | — |
| inspect | step 10: goto /marketplace/you/selling | 1 | 200 | 579 ms | 1845 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 2 | 200 | 713–769 ms | 3188–3423 ms | — |
| inspect | step 3: goto /marketplace/inbox | 3 | 200 | 368–711 ms | 65288–1343361 ms | — |
| inspect | step 3: goto /marketplace/you/selling | 1 | 200 | 1382 ms | 1687 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 1182 ms | 1644 ms | — |
| inspect | step 6: goto /marketplace/inbox | 1 | 200 | 669 ms | 1503917 ms | — |

<!-- facts:end -->

## What it does

A promotional card on Marketplace > Selling (boost a listing, sell more).

## What our machine does with it

Nothing; it loads with the Selling page, which publish reads after Publish for the listing's review state.

## What can go wrong

Harmless.
