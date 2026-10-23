# CometHomeContactGroupsContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `25945115421852941` |
| Path | `/api/graphql/` |
| Sends | `excludeBroadcastChannelThreads`, `excludeCmThreads`, `__relay_internal__pv__WebPixelRatiorelayprovider` |
| Reads | `viewer....CometHomeContactGroups_viewer` |
| Called from | `CometHomeContactGroupsContainer.react` |
| rea | `ev_afbb77778bb0832d0311179d99af4e1015fdbeadac3bded27db6e5939b581138` |

Seen 20 time(s) in 11 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 786 ms | 13574 ms | — |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 826 ms | 12041 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 983 ms | 7073 ms | — |
| warmup | step 11: goto /marketplace/ | 1 | 200 | 786 ms | 8614 ms | — |
| warmup | step 17: goto /marketplace/ | 1 | 200 | 736 ms | 12050 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 807 ms | 1258010 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 584 ms | 5485 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 640 ms | 8259 ms | — |
| inspect | step 96: clickRole button "…" | 1 | 200 | 573 ms | 1305460 ms | — |
| inspect | step 4: snapshot | 1 | 200 | 880 ms | 349 ms | — |
| inspect | pin: typed the account's Messenger PIN | 1 | 200 | 803 ms | 564 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 805 ms | 6685 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 802 ms | 103698 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 1 | 200 | 835 ms | 5706 ms | — |
| inspect | step 4: goto /marketplace/inbox | 2 | 200 | 883–1126 ms | 558525–564749 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 1626 ms | 59466 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 2664 ms | 11553 ms | — |
| inspect | step 6: goto /marketplace/inbox | 1 | 200 | 1122 ms | 1708110 ms | — |
| inspect | openAny: read /marketplace/item/<id>/ | 1 | 200 | 877 ms | 15218 ms | — |

<!-- facts:end -->

## What it does

The home page's contacts column: group chats.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
