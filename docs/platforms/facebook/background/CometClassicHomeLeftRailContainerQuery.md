# CometClassicHomeLeftRailContainerQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | POST 200 /ajax/bulk-route-definitions/ (489 ms) | 1 | 200 | 519 ms | 227 ms | — |
| inspect | page has 63 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T234 | 1 | 200 | 774 ms | 28681 ms | — |
| inspect | step 9: snapshot | 1 | 200 | 654 ms | 271 ms | — |

<!-- facts:end -->

## What it does

The home page's left menu (shortcuts). Only loads when a run lands on the home page.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
