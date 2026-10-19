# ProfileCometTilesFeedPaginationQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `29136283622728697` |
| Path | `/api/graphql/` |
| Sends | `count`, `cursor`, `id`, `previousProfileId`, `renderLocation`, `scale`, `__relay_internal__pv__ProfileCometFeaturedHighlightsPortraitAspectRatioGKrelayprovider` |
| Reads | `node....ProfileCometTilesFeed_user` |
| Called from | `ProfileCometTilesFeed_user.graphql` |
| rea | `ev_efd2b7f64a4d26eb9a0e0d532522efdc457bd9e31e37f7f1916ec248c64520d6` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | step 12: goto /me | 1 | 200 | 655 ms | 4553 ms | — |

<!-- facts:end -->

## What it does

Loads the tiles on the profile (photos, friends) after it redraws.

## What our machine does with it

Nothing.

## What can go wrong

Harmless.
