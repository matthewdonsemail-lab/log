# CometFeedInlineComposerQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `38525622117053498` |
| Path | `/api/graphql/` |
| Sends | `scale` |
| Reads | — |
| Called from | `CometFeedInlineComposer.react` |
| rea | `ev_3e02863ff58798e0b4e157f2227e5ceed62786408d21a22ae2d4cce84f7332b8` |

Seen 5 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T122 | 1 | 200 | 345 ms | 1175 ms | — |
| inspect | step 2: wait 20s | 1 | 200 | 332 ms | 20975 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T120 | 2 | 200 | 314–523 ms | 9992–90138 ms | — |
| publish | Opening /marketplace/create/item | 1 | 200 | 415 ms | 11840 ms | — |

<!-- facts:end -->

## What it does

The "What's on your mind?" box on the home feed.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
