# CometSearchKeywordDataSourceQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29182563967998876` |
| Path | `/api/graphql/` |
| Sends | `query` |
| Reads | `search_keywords_suggestion.suggestions` |
| Called from | `CometSearchKeywordDataSource.query` |
| rea | `ev_4bbe3a01db8f52dda732dc8d5c503b20e5a231818f92e623cd3754de46f4f4b5` |

Seen 20 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: type e20 | 20 | 200 | 385–861 ms | 260–2424 ms | — |

<!-- facts:end -->

## What it does

Fetches keyword suggestions for Facebook's search box as text is typed: it sends the typed `query` and reads `search_keywords_suggestion.suggestions`. It fired 20 times during one step (step 2, typing into e20), 260-2424 ms after the step began.

## What our machine does with it

Nothing. No machine of ours searches Facebook: `log facebook join group` opens the group by its own URL (`groupJoin`, state `opening`), and `parseGroupRef` refuses `search` as a group. The steps it fired in were a hand-run `log inspect` session, so no state waits for it or reads it.

## What can go wrong

None seen: all 20 calls answered 200 in 385-861 ms. If it failed, the box would show no suggestions; an inspect `type` step records the page either way.
