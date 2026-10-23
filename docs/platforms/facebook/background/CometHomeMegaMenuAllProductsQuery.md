# CometHomeMegaMenuAllProductsQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `26943575645248441` |
| Path | `/api/graphql/` |
| Sends | `scale`, `useNucleusIcon` |
| Reads | — |
| Called from | `CometHomeMegaMenuAllProducts.react` |
| rea | `ev_78a10afc58bb765d71fab141fd85b3c18aea439a22cd1af1ebfa86cb7d38ffd1` |

Seen 12 time(s) in 11 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 27: dwell 0.29s | 1 | 200 | 737 ms | 67 ms | — |
| inspect | post: "…", 103 words, 0 image(s), scrolled 70 px | 1 | 200 | 915 ms | 650 ms | — |
| inspect | step 12: dwell 0.14s | 1 | 200 | 586 ms | 811 ms | — |
| inspect | clickRole failed: RuntimeError: no visible button "…" | 1 | 200 | 434 ms | 15184 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 477 ms | 745298 ms | — |
| inspect | step 67: dwell 1s | 1 | 200 | 874 ms | 52 ms | — |
| inspect | setLocation failed: TimeoutError: Locator.wait_for: Timeout 30000ms exceeded. | 1 | 200 | 1735 ms | 458 ms | — |
| inspect | step 16: type e232 | 1 | 200 | 618 ms | 9064 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 722 ms | 5574 ms | — |
| inspect | step 3: goto /marketplace/inbox | 2 | 200 | 687–743 ms | 10616–22216 ms | — |
| inspect | step 4: goto /marketplace/inbox | 1 | 200 | 1840 ms | 1630107 ms | — |

<!-- facts:end -->

## What it does

Loads the "Menu" panel's full product list (Marketplace, Groups, Reels…) when the cursor rests on or opens the Facebook menu button.

## What our machine does with it

Nothing. It fired while the human mouse (rule 32) rested on the "Facebook menu" button between steps: a hover on the button prefetches the menu.

## What can go wrong

Harmless. Worth knowing: a resting cursor makes the page fetch; our idle mouse causes the same requests a person's hand does.
