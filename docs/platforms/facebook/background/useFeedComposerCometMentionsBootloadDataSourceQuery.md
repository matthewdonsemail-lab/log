# useFeedComposerCometMentionsBootloadDataSourceQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `24037885915835927` |
| Path | `/api/graphql/` |
| Sends | `canUseSections`, `include_viewer`, `options`, `scale`, `typeaheadFirstDegreeFilters`, `typeahead_context` |
| Reads | `comet_composer_typeahead_bootload.__typename` |
| Called from | `useFeedComposerCometMentionsBootloadDataSource` |
| rea | `ev_b88de894e472c9e4c2ec2c53351f0c403c976168c8326f9aebe1899c251181fb` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 20: clickRole button "…" | 1 | 200 | 992 ms | 3303 ms | — |

<!-- facts:end -->

## What it does

The mention typeahead of the share sheet's composer (`useFeedComposerCometMentionsBootloadDataSource`): it preloads the people and pages the account could tag with @, before anything is typed. In run 20261020T153648 step 20 (Share group) it fired 3.3 s after the click, 992 ms, 200.

## What our machine does with it

No machine sends it on purpose and none reads it. It fires by itself when the share sheet opens: in the flow [`groupHeaderMenus`](../flows/groupHeaderMenus.md) the Share group step opens the sheet and Escape closes it, nothing is shared.

## What can go wrong

Only a 200 has been seen, in one run. If it failed, @ suggestions in the sheet's text box would be empty; nothing is posted.
