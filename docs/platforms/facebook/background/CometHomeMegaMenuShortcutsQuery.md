# CometHomeMegaMenuShortcutsQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `26833428399625311` |
| Path | `/api/graphql/` |
| Sends | `scale`, `useNucleusIcon` |
| Reads | `viewer.actor`, `viewer.shortcut_bookmarks` |
| Called from | `CometHomeMegaMenuShortcuts.react` |
| rea | `ev_387da7dffb2d726280e5df4abfd25b5a3f00569b707462e4a6fe946ba8004ba8` |

Seen 6 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 27: dwell 0.29s | 1 | 200 | 620 ms | 106 ms | — |
| inspect | mouse: 1 wander, 1 scrollPosition, 1 flick; 0 idle drift move(s) | 1 | 200 | 569 ms | 43 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T103 | 1 | 200 | 537 ms | 94 ms | — |
| inspect | rea read step 72_clickroleButtonUnmute: exit 0, ev_183079e9de4526e8398a72e352c35b5ac9ce8fe | 1 | 200 | 417 ms | 8131 ms | — |
| inspect | rea read step 24_clickroleButtonNextCard: exit 0, ev_08bd0b0aa3e491db75fd341d53b6ccf63883a | 1 | 200 | 468 ms | 737593 ms | — |
| inspect | step 67: dwell 1s | 1 | 200 | 947 ms | 85 ms | — |

<!-- facts:end -->

## What it does

The "Menu" panel's shortcuts (the user's own frequent destinations).

## What our machine does with it

Nothing; fetched alongside CometHomeMegaMenuAllProductsQuery when the cursor rests on the menu button.

## What can go wrong

Harmless.
