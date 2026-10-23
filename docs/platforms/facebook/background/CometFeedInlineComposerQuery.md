# CometFeedInlineComposerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 22 time(s) in 12 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 374 ms | 13557 ms | — |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 681 ms | 12025 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 524 ms | 7041 ms | — |
| warmup | step 11: goto /marketplace/ | 2 | 200 | 433–536 ms | 8600–15099 ms | — |
| warmup | step 17: goto /marketplace/ | 1 | 200 | 364 ms | 12036 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 563 ms | 1258001 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 358 ms | 5476 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 405 ms | 8251 ms | — |
| inspect | step 96: clickRole button "…" | 1 | 200 | 365 ms | 1305441 ms | — |
| inspect | step 4: snapshot | 1 | 200 | 512 ms | 330 ms | — |
| inspect | pin: typed the account's Messenger PIN | 1 | 200 | 411 ms | 538 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 423 ms | 6664 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 595 ms | 103685 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 1 | 200 | 496 ms | 5688 ms | — |
| inspect | step 4: goto /marketplace/inbox | 2 | 200 | 375–459 ms | 558508–564715 ms | — |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 1700 ms | 59452 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 2513 ms | 11533 ms | — |
| inspect | step 6: goto /marketplace/inbox | 1 | 200 | 717 ms | 1708095 ms | — |
| inspect | openAny: read /marketplace/item/<id>/ | 1 | 200 | 399 ms | 15203 ms | — |
| warmup | step 14: goto /marketplace/ | 1 | 200 | 616 ms | 7184 ms | — |

<!-- facts:end -->

## What it does

The "What's on your mind?" box on the home feed.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
