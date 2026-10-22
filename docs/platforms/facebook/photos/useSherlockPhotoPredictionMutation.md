# useSherlockPhotoPredictionMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 42 time(s) in 13 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Uploading 5 photo(s) | 30 | 200 | 875–1551 ms | 4730–9792 ms | — |
| publish | Uploading 2 photo(s) | 4 | 200 | 789–913 ms | 6550–8179 ms | — |
| inspect | step 14: snapshot | 2 | 200 | 946–1004 ms | 1195–1197 ms | — |
| inspect | step 16: type e232 | 2 | 200 | 1388–1881 ms | 7266–7268 ms | — |
| inspect | upload: before.png handed to the file chooser | 2 | 200 | 2272–2835 ms | 4801–4803 ms | — |
| inspect | step 10: type e232 | 2 | 200 | 886–889 ms | 6956–6959 ms | — |

<!-- facts:end -->

## What it does

Facebook's image model reads the uploaded photos and suggests categories (`sherlock_photo_prediction.top_categories`: "Household" for our rubbish-removal photos). Sent as multipart form data, about 1 s each.

## What our machine does with it

Nothing. The publish machine picks the category from the listing, not from this suggestion.

## What can go wrong

Harmless, but telling: Facebook classifies every photo, so photos that do not match the listing's category are visible to it. Keep photos and category consistent.
