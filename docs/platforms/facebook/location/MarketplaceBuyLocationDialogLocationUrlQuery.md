# MarketplaceBuyLocationDialogLocationUrlQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | location |
| Kind | query |
| doc_id | `9608405655935574` |
| Path | `/api/graphql/` |
| Sends | `buy_location` |
| Reads | `viewer.marketplace_feed_stories` |
| Called from | `MarketplaceBuyLocationDialog.react` |
| rea | `ev_5c223465994e732643e6aa87f33963fe75a82b42cccf211f8169746b5944c30b` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 15: click e1354 | 1 | 200 | 372 ms | 914 ms | — |

<!-- facts:end -->

## What it does

Resolves the place picked in the Change location dialog to its Marketplace page (`/marketplace/<placeId>/`, Reading's is 109847139034270).

## What our machine does with it

Nothing; it fires with the Apply click, just before `CometMarketplaceSetBuyLocationMutation`.

## What can go wrong

Harmless.
