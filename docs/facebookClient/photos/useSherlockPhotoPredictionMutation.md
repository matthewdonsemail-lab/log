# useSherlockPhotoPredictionMutation

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | photos |
| Kind | mutation |
| doc_id | `8975911135844322` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `sherlock_photo_prediction.top_categories`, `sherlock_photo_prediction.virtual_taxonomies` |
| Called from | `useSherlockPhotoPredictionMutation` |
| rea | `ev_c00a0898155fe51669981d0310887e094b1fc17734525a087f1d5dcfab9ef057` |

Seen 34 time(s) in 11 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Uploading 5 photo(s) | 30 | 200 | 875–1551 ms | 4730–9792 ms | — |
| publish | Uploading 2 photo(s) | 4 | 200 | 789–913 ms | 6550–8179 ms | — |

<!-- facts:end -->

## What it does

Facebook's image model reads the uploaded photos and suggests categories (`sherlock_photo_prediction.top_categories`: "Household" for our rubbish-removal photos). Sent as multipart form data, about 1 s each.

## What our machine does with it

Nothing. The publish machine picks the category from the listing, not from this suggestion.

## What can go wrong

Harmless, but telling: Facebook classifies every photo, so photos that do not match the listing's category are visible to it. Keep photos and category consistent.
