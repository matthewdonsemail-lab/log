# CometSearchBootstrapKeywordsDataSourceQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 16 time(s) in 15 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 1: goto /me | 1 | 200 | 369 ms | 8222 ms | — |
| connect | Auto-login: typing the email. | 1 | 200 | 348 ms | 3842 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 2 | 200 | 326–432 ms | 3911–4193 ms | — |
| inspect | step 1: goto /me | 1 | 200 | 452 ms | 13198 ms | — |
| inspect | step 2: click e53 | 1 | 200 | 427 ms | 8120 ms | — |
| publish | Opening /marketplace/create/item | 7 | 200 | 328–426 ms | 8284–15127 ms | — |
| connect | Page: loggedIn /marketplace/selling/ | 2 | 200 | 336–345 ms | 3719–4785 ms | — |
| publish | Category: Miscellaneous | 1 | 200 | 375 ms | 1941 ms | — |

<!-- facts:end -->

## What it does

Preloads search suggestions for the search box. Loads on every signed-in page.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
