# CometHomeContactChannelsContainerQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 5 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | POST 200 /ajax/bulk-route-definitions/ (489 ms) | 1 | 200 | 423 ms | 216 ms | — |
| inspect | page has 63 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T234 | 1 | 200 | 392 ms | 28668 ms | — |
| inspect | step 9: snapshot | 1 | 200 | 412 ms | 262 ms | — |
| inspect | page has 79 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T212 | 2 | 200 | 301–310 ms | 7185–14213 ms | — |

<!-- facts:end -->

## What it does

The home page's contacts column: channels.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
