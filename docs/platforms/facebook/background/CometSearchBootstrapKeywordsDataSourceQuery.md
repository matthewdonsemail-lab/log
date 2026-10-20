# CometSearchBootstrapKeywordsDataSourceQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27797631676573850` |
| Path | `/api/graphql/` |
| Sends | `first` |
| Reads | `viewer.bootstrap_keywords` |
| Called from | `CometSearchBootstrapKeywordsDataSource.query` |
| rea | `ev_5cb62e3a7cd21788732d77960d11bcea0adc8730aaaa23e6a78c097c1c44c7a6` |

Seen 4 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id>/ | 2 | 200 | 425–448 ms | 3463–4159 ms | — |
| inspect | step 4: goto /groups/<id>/ | 1 | 200 | 381 ms | 2302 ms | — |
| inspect | step 1: goto / | 1 | 200 | 347 ms | 6761 ms | — |

<!-- facts:end -->

## What it does

Preloads search suggestions for the search box. Loads on every signed-in page.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
