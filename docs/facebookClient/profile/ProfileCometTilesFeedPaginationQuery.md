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

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 5: clickRole button "…" | 2 | 200 | 388–483 ms | 6359–10591 ms | — |
| inspect | now on /profile.php "…" after 2734 ms; 0 request(s) | 1 | 200 | 408 ms | 1383 ms | — |

<!-- facts:end -->

## What it does

Loads the tiles on the profile (photos, friends) after it redraws.

## What our machine does with it

Nothing.

## What can go wrong

Harmless.
