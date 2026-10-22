# withSearchCometTypeaheadSERPWarmCallDecoratorQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `24307341962185897` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | — |
| Called from | `withSearchCometTypeaheadSERPWarmCallDecorator` |
| rea | `ev_c8b0cd690bc8b3048eb732ef9f2f4f803d931fe078700faf009d77495e3136f9` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 12: clickRole button "…" | 1 | 200 | 845 ms | 1032 ms | — |

<!-- facts:end -->

## What it does

A warm call for the search results page (SERP), made by `withSearchCometTypeaheadSERPWarmCallDecorator` as the search box is used. It sends no variables and the doc lists no fields read. It fired once, 64 ms after step 2 (typing into e20).

## What our machine does with it

Nothing. No machine of ours searches Facebook: `log facebook join group` opens the group by its own URL (`groupJoin`, state `opening`), and `parseGroupRef` refuses `search` as a group. The steps it fired in were a hand-run `log inspect` session, so no state waits for it or reads it.

## What can go wrong

None seen: one call, 200 in 446 ms. Nothing of ours depends on it.
