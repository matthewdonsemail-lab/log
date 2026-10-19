# CometHomeContentQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28262615193401316` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | — |
| Called from | `CometHomeContent.react` |
| rea | `ev_c39813b09a6d101ec07e15decbcfc3b7d00474b5f7b79ea04cace0fb088e78a8` |

Seen 5 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T122 | 1 | 200 | 331 ms | 1209 ms | — |
| inspect | step 2: wait 20s | 1 | 200 | 315 ms | 20998 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T120 | 2 | 200 | 305–355 ms | 10052–90178 ms | — |
| publish | Opening /marketplace/create/item | 1 | 200 | 378 ms | 11853 ms | — |

<!-- facts:end -->

## What it does

The home page's main content.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
