# useCometMarketplaceListingCreateMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | publishing |
| Kind | mutation |
| doc_id | `9551550371629242` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `marketplace_listing_create.listing`, `marketplace_listing_create.boosted_component` |
| Called from | `useCometMarketplaceListingCreateMutation` |
| rea | `ev_9b09bc743ecfcdaaf9245c052c78813cdc1ea6ffecabbeede3a18621e77a9635` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Marketplace location: Reading 19601 US | 1 | 200 | 6401 ms | 16766 ms | — |

<!-- facts:end -->

## What it does

The Publish click itself: creates the Marketplace listing and returns `marketplace_listing_create.listing.id` (the item id) and its story URL.

## What our machine does with it

The publish session listens for its answer and keeps the id (`created_listing_id`), so the id never depends on the Selling page having drawn the new card. Reading's first listing, 4095105027293522, 2026-10-19 13:25:58. The listing can still be held for review afterwards: the Selling page's `integrity_status_indicator` says so, and the run writes UNDER_REVIEW.

## What can go wrong

Once this is sent nothing is retried (rule 10). No answer, or no id in it: the run looks on Selling; failing that it ends `unconfirmedId` for a person to check.
