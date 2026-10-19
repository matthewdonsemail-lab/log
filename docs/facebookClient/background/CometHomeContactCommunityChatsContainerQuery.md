# CometHomeContactCommunityChatsContainerQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 9 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1321 | 1 | 200 | 2693 ms | 20562 ms | — |
| publish | Marketplace location: Reading 19601 US | 1 | 200 | 412 ms | 5667 ms | — |
| publish | Uploading 5 photo(s) | 1 | 200 | 467 ms | 878 ms | — |
| inspect | step 16: goto /marketplace/create/item | 1 | 200 | 463 ms | 13453 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T122 | 1 | 200 | 348 ms | 1189 ms | — |
| inspect | step 2: wait 20s | 1 | 200 | 408 ms | 20989 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T120 | 2 | 200 | 309–382 ms | 10044–90160 ms | — |
| publish | Opening /marketplace/create/item | 1 | 200 | 386 ms | 11849 ms | — |

<!-- facts:end -->

## What it does

The home page's contacts column: community chats.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
