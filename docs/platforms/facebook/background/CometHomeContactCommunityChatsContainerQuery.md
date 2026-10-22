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
| rea | `ev_ff39c007f8bb69c80d97054de98908b54ee980822a6e89a6dbd0fbf56d559bf9` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 24: clickRole button "…" | 1 | 200 | 593 ms | 1258008 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 404 ms | 5483 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 399 ms | 8258 ms | — |
| inspect | step 96: clickRole button "…" | 1 | 200 | 389 ms | 1305458 ms | — |

<!-- facts:end -->

## What it does

The home page's contacts column: community chats.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
