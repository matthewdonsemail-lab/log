# MarketplaceDeleteUtilsQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27605324959069136` |
| Path | `/api/graphql/` |
| Sends | `id`, `shouldSkip` |
| Reads | — |
| Called from | `MarketplaceDeleteUtils` |
| rea | `ev_75e93fe4d2b889bd9688924dddf4badc31bafa4e41796fccaf9ed0e07501d6eb` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /marketplace/inbox | 2 | 200 | 548–581 ms | 503022–1366292 ms | — |

<!-- facts:end -->

## What it does

Asks, for a listing (`id`), what deleting it would involve, so the listing's menu can offer Delete. It is a read (`shouldSkip` lets the page skip it); it fires when a listing's menu or dialog is opened, here twice while the inbox step was open.

## What our machine does with it

Nothing reads it, and nothing in log-cli deletes a listing (rule 8: nothing is deleted unless matt asks).

## What can go wrong

Seen only with 200. It changes nothing on its own; a delete would be a separate mutation, which log-cli never sends.
