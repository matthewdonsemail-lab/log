# CometHomeContactChannelsContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 24: clickRole button "…" | 1 | 200 | 494 ms | 1258006 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 381 ms | 5482 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 400 ms | 8256 ms | — |
| inspect | step 96: clickRole button "…" | 1 | 200 | 370 ms | 1305455 ms | — |

<!-- facts:end -->

## What it does

The home page's contacts column: channels.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
