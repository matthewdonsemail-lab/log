# CometAddTypeaheadRecentSearchMutation

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `9990530167705749` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `search_typeahead_add_recent_search.client_mutation_id` |
| Called from | `CometAddTypeaheadRecentSearchMutation` |
| rea | `ev_5c01a936497d302e8b955633e17948b779d76b3e508c624be63df1b784c1943f` |

Seen 3 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: press Enter | 1 | 200 | 351 ms | 50 ms | — |
| inspect | step 5: click e2647 | 1 | 200 | 423 ms | 1962 ms | — |
| inspect | step 7: click e2606 | 1 | 200 | 327 ms | 6223 ms | — |

<!-- facts:end -->

## What it does

Adds a search to the account's recent searches in Facebook's search box (`search_typeahead_add_recent_search`); it reads back only `client_mutation_id`. In our one run it fired 50 ms after step 3 (press Enter on the search) and again after the clicks at steps 5 and 7.

## What our machine does with it

Nothing. No machine of ours searches Facebook: `log join group` opens the group by its own URL (`groupJoin`, state `opening`), and `parseGroupRef` refuses `search` as a group. The steps it fired in were a hand-run `log inspect` session, so no state waits for it or reads it.

## What can go wrong

None seen: all three calls answered 200 in 327-423 ms. If it failed, only the recent searches list would miss the entry; nothing of ours depends on it.
