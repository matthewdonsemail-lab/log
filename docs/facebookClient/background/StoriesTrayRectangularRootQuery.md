# StoriesTrayRectangularRootQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27831542276468324` |
| Path | `/api/graphql/` |
| Sends | `blur`, `bucketsToFetch`, `isFbNotesIncluded`, `scale`, `trayType`, `__relay_internal__pv__StoriesTrayTileCoverImageWidthrelayprovider`, `__relay_internal__pv__StoriesTrayTileCoverImageHeightrelayprovider`, `__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider`, `__relay_internal__pv__StoriesTrayTileShouldSkipPrefetchImageURIrelayprovider`, `__relay_internal__pv__StoriesTrayProfessionalInset3DEnabledrelayprovider`, `__relay_internal__pv__StoriesShouldEnableVideoAutoplayrelayprovider`, `__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider` |
| Reads | `me`, `viewer.actor`, `viewer....useStoriesTrayRefresh_viewer` |
| Called from | `StoriesTrayRectangularRoot.react` |
| rea | `ev_c974048d5563e87d75f5e8ddd458fdc3829a195d00e0a636a969922c24e6ae81` |

Seen 7 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1321 | 1 | 200 | 4942 ms | 20577 ms | — |
| publish | Marketplace location: Reading 19601 US | 1 | 200 | 524 ms | 5686 ms | — |
| publish | Uploading 5 photo(s) | 1 | 200 | 554 ms | 896 ms | — |
| inspect | step 16: goto /marketplace/create/item | 1 | 200 | 1657 ms | 13474 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T122 | 1 | 200 | 532 ms | 1245 ms | — |
| inspect | step 2: wait 20s | 1 | 200 | 565 ms | 21006 ms | — |
| publish | Opening /marketplace/create/item | 1 | 200 | 1354 ms | 11861 ms | — |

<!-- facts:end -->

## What it does

The stories row on the home page.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
