# StoriesTrayRectangularRootQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 19 time(s) in 12 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 752 ms | 13577 ms | — |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 905 ms | 12045 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 1041 ms | 7076 ms | — |
| warmup | step 11: goto /marketplace/ | 2 | 200 | 784–1050 ms | 8617–15114 ms | — |
| warmup | step 17: goto /marketplace/ | 1 | 200 | 749 ms | 12053 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 862 ms | 1258023 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 575 ms | 5497 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 625 ms | 8271 ms | — |
| inspect | step 4: snapshot | 1 | 200 | 902 ms | 354 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 891 ms | 6698 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 1021 ms | 103706 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 1 | 200 | 1050 ms | 5710 ms | — |
| inspect | step 4: goto /marketplace/inbox | 1 | 200 | 1150 ms | 558528 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 1623 ms | 59470 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 2586 ms | 11556 ms | — |
| inspect | step 6: goto /marketplace/inbox | 1 | 200 | 1190 ms | 1708114 ms | — |
| inspect | openAny: read /marketplace/item/<id>/ | 1 | 200 | 948 ms | 15223 ms | — |
| warmup | step 14: goto /marketplace/ | 1 | 200 | 797 ms | 7204 ms | — |

<!-- facts:end -->

## What it does

The stories row on the home page.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
