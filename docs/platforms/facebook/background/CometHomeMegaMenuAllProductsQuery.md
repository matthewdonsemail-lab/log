# CometHomeMegaMenuAllProductsQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | rea read step 24_clickroleButtonNextCard: exit 0, ev_08bd0b0aa3e491db75fd341d53b6ccf63883a | 1 | 200 | 477 ms | 737523 ms | — |
| inspect | step 67: dwell 1s | 1 | 200 | 874 ms | 52 ms | — |

<!-- facts:end -->

## What it does

Loads the "Menu" panel's full product list (Marketplace, Groups, Reels…) when the cursor rests on or opens the Facebook menu button.

## What our machine does with it

Nothing. It fired while the human mouse (rule 32) rested on the "Facebook menu" button between steps: a hover on the button prefetches the menu.

## What can go wrong

Harmless. Worth knowing: a resting cursor makes the page fetch; our idle mouse causes the same requests a person's hand does.
