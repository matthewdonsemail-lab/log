# MarketplaceCometPartnerListingDialogContentQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27750985964534474` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer.marketplace_settings`, `viewer.marketplace_partnership_catalog_settings` |
| Called from | `MarketplaceCometPartnerListingDialogContent.react` |
| rea | `ev_ec43a216261f8ed2a312cd6ca3d434b4b1b3fe2271135a6ecaf365f19bef18d1` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: click e191 | 1 | 200 | 840 ms | 1371 ms | — |
| inspect | step 13: setLocation 18015 | 1 | 200 | 423 ms | 16425 ms | — |

<!-- facts:end -->

## What it does

Loads the "Discover more when you shop" screen: the account's Marketplace settings and its partner catalog choices (`marketplace_partnership_catalog_settings`). It fired when that screen came up (step 13, after the zip set the location to Granada) and again as Update was pressed (step 4).

## What our machine does with it

It marks the `marketplacePartnerListings` page state from the network side, as the screen's text does from the page side. Nothing waits for it.

## What can go wrong

None seen: two calls, 200 in 423-840 ms. Nothing of ours depends on it.
