# SearchCometResultsInitialResultsParallelFetchQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29153416334301970` |
| Path | `/api/graphql/` |
| Sends | `params` |
| Reads | `search_serp_parallel_fetch.__typename` |
| Called from | `SearchCometResultsInitialResults.react` |
| rea | `ev_341ed678448951e99c44853959e4f2f7172f23af507915ea53cbc7f4cb1a96bf` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: click e1506 | 1 | 200 | 348 ms | 1209 ms | — |

<!-- facts:end -->

## What it does

Fetched alongside the first page of Facebook's search results (`search_serp_parallel_fetch`); it sends `params` and reads only `__typename`. It fired once, 1209 ms after step 4 (click e1506), at the same moment as `SearchCometResultsInitialResultsQuery`.

## What our machine does with it

Nothing. No machine of ours searches Facebook: `log facebook join group` opens the group by its own URL (`groupJoin`, state `opening`), and `parseGroupRef` refuses `search` as a group. The steps it fired in were a hand-run `log inspect` session, so no state waits for it or reads it.

## What can go wrong

None seen: one call, 200 in 348 ms. Nothing of ours depends on it.
