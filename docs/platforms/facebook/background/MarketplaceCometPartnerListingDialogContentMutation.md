# MarketplaceCometPartnerListingDialogContentMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `29149244201389409` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `marketplace_settings_set_partner_selection.__typename` |
| Called from | `MarketplaceCometPartnerListingDialogContent.react` |
| rea | `ev_5b31db3e700fe377600ec4ca4c8eb028becb0ea4a81d55b5c76a2acc3954c44d` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: click e191 | 1 | 200 | 558 ms | 808 ms | — |

<!-- facts:end -->

## What it does

Saves the account's choices on Marketplace's "Discover more when you shop" screen (`marketplace_settings_set_partner_selection`): which partner shops' listings appear in its Marketplace. It fired 0.8 s after Update was pressed on that screen (step 4), with every box as Facebook had ticked it.

## What our machine does with it

It is what pressing Update on the `marketplacePartnerListings` page state sends; that screen only appears while the account's location is in Europe (rule 68). Nothing of ours reads it.

## What can go wrong

None seen: one call, 200 in 558 ms. A failure would leave the screen up, and the state's resolver would press Update again.
