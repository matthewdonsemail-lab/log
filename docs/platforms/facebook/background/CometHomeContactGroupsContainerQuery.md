# CometHomeContactGroupsContainerQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `25945115421852941` |
| Path | `/api/graphql/` |
| Sends | `excludeBroadcastChannelThreads`, `excludeCmThreads`, `__relay_internal__pv__WebPixelRatiorelayprovider` |
| Reads | `viewer....CometHomeContactGroups_viewer` |
| Called from | `CometHomeContactGroupsContainer.react` |
| rea | `ev_1d05a014baf2cd336fd869d4a53a30ef7d6ab76df49c9ced2a1e73b1a60e03dd` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 24: clickRole button "…" | 1 | 200 | 807 ms | 1258010 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 584 ms | 5485 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 640 ms | 8259 ms | — |
| inspect | step 96: clickRole button "…" | 1 | 200 | 573 ms | 1305460 ms | — |

<!-- facts:end -->

## What it does

The home page's contacts column: group chats.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
