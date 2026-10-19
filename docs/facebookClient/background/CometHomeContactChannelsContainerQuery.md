# CometHomeContactChannelsContainerQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `9934887189887478` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer....CometHomeContactChannels_viewer` |
| Called from | `CometHomeContactChannelsContainer.react` |
| rea | `ev_27664f28e3f3d309d196308b9c43966f0ed688c1846687da50769bd0e941bfe3` |

Seen 9 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1321 | 1 | 200 | 2522 ms | 20557 ms | — |
| publish | Marketplace location: Reading 19601 US | 1 | 200 | 373 ms | 5662 ms | — |
| publish | Uploading 5 photo(s) | 1 | 200 | 435 ms | 873 ms | — |
| inspect | step 16: goto /marketplace/create/item | 1 | 200 | 412 ms | 13449 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T122 | 1 | 200 | 334 ms | 1187 ms | — |
| inspect | step 2: wait 20s | 1 | 200 | 316 ms | 20984 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T120 | 2 | 200 | 299–364 ms | 10043–90156 ms | — |
| publish | Opening /marketplace/create/item | 1 | 200 | 381 ms | 11847 ms | — |

<!-- facts:end -->

## What it does

The home page's contacts column: channels.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
