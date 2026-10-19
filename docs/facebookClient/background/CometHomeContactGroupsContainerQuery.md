# CometHomeContactGroupsContainerQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 9 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1321 | 1 | 200 | 3224 ms | 20564 ms | — |
| publish | Marketplace location: Reading 19601 US | 1 | 200 | 581 ms | 5669 ms | — |
| publish | Uploading 5 photo(s) | 1 | 200 | 658 ms | 882 ms | — |
| inspect | step 16: goto /marketplace/create/item | 1 | 200 | 1547 ms | 13455 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T122 | 1 | 200 | 593 ms | 1199 ms | — |
| inspect | step 2: wait 20s | 1 | 200 | 608 ms | 20992 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T120 | 2 | 200 | 602–617 ms | 10045–90165 ms | — |
| publish | Opening /marketplace/create/item | 1 | 200 | 1037 ms | 11851 ms | — |

<!-- facts:end -->

## What it does

The home page's contacts column: group chats.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
