# useCometMarketplaceAIListingSettingsQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | listingForm |
| Kind | query |
| doc_id | `26452546304365128` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer.marketplace_user_settings` |
| Called from | `useCometMarketplaceAIListingSettings` |
| rea | `ev_4d1402ec5fa8c0fc525fb6c662599b221431fe29666e589d678ee5b4cc02c85d` |

Seen 13 time(s) in 13 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Opening /marketplace/create/item | 12 | 200 | 299–514 ms | 5871–13680 ms | — |
| inspect | step 16: goto /marketplace/create/item | 1 | 200 | 440 ms | 4146 ms | — |

<!-- facts:end -->

## What it does

Reads the seller's Marketplace settings for Meta AI listing drafts (`viewer.marketplace_user_settings`), so the form can show "Draft listings with Meta AI". Fires once while the create form opens.

## What our machine does with it

Nothing. The publish machine fills the form itself and leaves Meta AI off.

## What can go wrong

Harmless. Its sighting means the create form's own code started, 6-14 s after we opened the page: if it is missing, the form never drew (the publish machine reloads once after 15 s, Listaro's path).
