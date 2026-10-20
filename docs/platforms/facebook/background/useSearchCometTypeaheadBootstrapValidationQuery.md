# useSearchCometTypeaheadBootstrapValidationQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `9365993650171871` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `search_client_cache_policy_check.policy_decision` |
| Called from | `useSearchCometTypeaheadBootstrapValidation` |
| rea | `ev_c33ea74b6c58aecc48c1986dffe1182fdb3f69b020230253104232d716ec7d1a` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: press Enter | 1 | 200 | 308 ms | 47 ms | — |

<!-- facts:end -->

## What it does

Asks whether the search box's cached data can still be used: it sends `input` and reads `search_client_cache_policy_check.policy_decision`. It fired once, 47 ms after step 3 (press Enter on the search).

## What our machine does with it

Nothing. No machine of ours searches Facebook: `log join group` opens the group by its own URL (`groupJoin`, state `opening`), and `parseGroupRef` refuses `search` as a group. The steps it fired in were a hand-run `log inspect` session, so no state waits for it or reads it.

## What can go wrong

None seen: one call, 200 in 308 ms. Nothing of ours depends on it.
