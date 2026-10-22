# CometClassicHomeLeftRailContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `37551561817767907` |
| Path | `/api/graphql/` |
| Sends | `isEligibleForProfessionalTools`, `numExploreBookmarks`, `numShortcutBookmarks`, `scale`, `useNucleusIcon` |
| Reads | `viewer....CometHomeLeftRailWithBlueRanking_viewer` |
| Called from | `CometClassicHomeLeftRailContainer.react` |
| rea | `ev_344ab74ba79925e4c65e7d7e1baed54ed21b8b5516428816c330a8a229cfc2b5` |

Seen 13 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 7: goto /marketplace/ | 1 | 200 | 556 ms | 13564 ms | — |
| warmup | step 15: goto /marketplace/ | 1 | 200 | 673 ms | 12032 ms | — |
| warmup | step 4: goto /marketplace/ | 1 | 200 | 896 ms | 7049 ms | — |
| warmup | step 11: goto /marketplace/ | 1 | 200 | 877 ms | 8605 ms | — |
| warmup | step 17: goto /marketplace/ | 1 | 200 | 544 ms | 12042 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 780 ms | 1258017 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 669 ms | 5491 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 585 ms | 8264 ms | — |
| inspect | step 96: clickRole button "…" | 1 | 200 | 539 ms | 1305467 ms | — |
| inspect | step 4: snapshot | 1 | 200 | 718 ms | 340 ms | — |
| inspect | pin: typed the account's Messenger PIN | 1 | 200 | 801 ms | 556 ms | — |
| inspect | step 5: goto /marketplace/create/item | 1 | 200 | 691 ms | 6674 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 754 ms | 103685 ms | — |

<!-- facts:end -->

## What it does

The home page's left menu (shortcuts). Only loads when a run lands on the home page.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
