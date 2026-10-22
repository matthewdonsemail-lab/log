# CometHomeMegaMenuShortcutsQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 9 time(s) in 8 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 27: dwell 0.29s | 1 | 200 | 620 ms | 106 ms | — |
| inspect | post: "…", 103 words, 0 image(s), scrolled 70 px | 1 | 200 | 569 ms | 1035 ms | — |
| inspect | step 12: dwell 0.14s | 1 | 200 | 537 ms | 852 ms | — |
| inspect | clickRole failed: RuntimeError: no visible button "…" | 1 | 200 | 417 ms | 15232 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 468 ms | 745368 ms | — |
| inspect | step 67: dwell 1s | 1 | 200 | 947 ms | 85 ms | — |
| inspect | setLocation failed: TimeoutError: Locator.wait_for: Timeout 30000ms exceeded. | 1 | 200 | 1619 ms | 512 ms | — |
| inspect | step 16: type e232 | 1 | 200 | 569 ms | 9101 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 699 ms | 5617 ms | — |

<!-- facts:end -->

## What it does

The "Menu" panel's shortcuts (the user's own frequent destinations).

## What our machine does with it

Nothing; fetched alongside CometHomeMegaMenuAllProductsQuery when the cursor rests on the menu button.

## What can go wrong

Harmless.
