# CometMarketplaceRootQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27968591542751515` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer....CometMarketplaceRootHeader_viewer`, `viewer....MarketplaceCometFeatureAccessProvider_viewer`, `viewer....useCometMarketplaceSellerModeNUX_viewer` |
| Called from | `CometMarketplaceRoot.react` |
| rea | `ev_bd94a8399994851d5028209cd924241238d6867ec8a1ad0c92070386341533ca` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: click e191 | 1 | 200 | 603 ms | 2962 ms | — |

<!-- facts:end -->

## What it does

Marketplace's root (`CometMarketplaceRoot.react`): the header, which Marketplace features the account can use (`MarketplaceCometFeatureAccessProvider`) and the seller-mode tour. It fired as Marketplace's home loaded (step 4).

## What our machine does with it

Nothing waits for it today. Its feature-access part is where an account's Marketplace access shows; the flows only wait for the page to land, and the Selling page is what the host checks (rule 35).

## What can go wrong

None seen: one call, 200 in 603 ms. A failure would break Marketplace's page; the flow's next step would then fail its page check and the run is read from its recording (rule 25).
