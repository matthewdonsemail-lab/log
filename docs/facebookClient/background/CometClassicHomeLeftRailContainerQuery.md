# CometClassicHomeLeftRailContainerQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 5 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T122 | 1 | 200 | 637 ms | 1214 ms | — |
| inspect | step 2: wait 20s | 1 | 200 | 551 ms | 21000 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T120 | 2 | 200 | 374–471 ms | 10055–90179 ms | — |
| publish | Opening /marketplace/create/item | 1 | 200 | 1034 ms | 11854 ms | — |

<!-- facts:end -->

## What it does

The home page's left menu (shortcuts). Only loads when a run lands on the home page.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
