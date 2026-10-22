# CometMarketplacePartnerSelectorContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27690950030545801` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer....useCometMarketplacePartnerAutoOptInMutation_viewer`, `viewer.marketplace_settings` |
| Called from | `CometMarketplacePartnerSelectorContainer.react` |
| rea | `ev_50e521a88520c78fabaff28b3f6a9a9e16709d88bb7829a3cc3a8eaa71e481b7` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: click e191 | 1 | 200 | 1283 ms | 2969 ms | — |

<!-- facts:end -->

## What it does

Loads the account's partner-listing settings (`viewer.marketplace_settings`, the partner auto opt-in) for Marketplace's partner selector (`CometMarketplacePartnerSelectorContainer.react`). It appeared only while Bethlehem's Marketplace location was in Spain, after a bare zip picked Granada (step 4).

## What our machine does with it

Nothing reads it. It belongs to the `marketplacePartnerListings` page state, which only appears with a European location; with the location set as "City, State" written out (rule 68) Marketplace never shows it.

## What can go wrong

None seen: one call, 200 in 1283 ms. Nothing of ours depends on it.
