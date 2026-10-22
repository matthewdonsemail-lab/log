# CometHomeContactCommunityChatsContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `26941462065448526` |
| Path | `/api/graphql/` |
| Sends | `numChatsToFetch` |
| Reads | `viewer....CometHomeContactCommunityChats_viewer` |
| Called from | `CometHomeContactCommunityChatsContainer.react` |
| rea | `ev_38a62071407b1d580cabfa2361b5d2c8ad31a9bb9fb9fefb54b7b887fa2b16aa` |

Seen 12 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 580 ms | 13571 ms | — |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 668 ms | 12039 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 748 ms | 7059 ms | — |
| warmup | step 11: goto /marketplace/ | 1 | 200 | 614 ms | 8612 ms | — |
| warmup | step 17: goto /marketplace/ | 1 | 200 | 554 ms | 12049 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 593 ms | 1258008 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 404 ms | 5483 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 399 ms | 8258 ms | — |
| inspect | step 96: clickRole button "…" | 1 | 200 | 389 ms | 1305458 ms | — |
| inspect | step 4: snapshot | 1 | 200 | 726 ms | 348 ms | — |
| inspect | pin: typed the account's Messenger PIN | 1 | 200 | 611 ms | 561 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 621 ms | 6681 ms | — |

<!-- facts:end -->

## What it does

The home page's contacts column: community chats.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
