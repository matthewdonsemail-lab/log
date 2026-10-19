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

Seen 30 time(s) in 27 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| connect | Page: loggedIn /marketplace/selling/ | 6 | 200, -1 | -1–593 ms | 2315–6403 ms | — |
| inspect | step 1: goto /marketplace/ | 6 | 200 | 344–665 ms | 7057–20025 ms | — |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1223 | 1 | 200 | 481 ms | 7076 ms | — |
| inspect | step 2: waitRole link "…" | 1 | 200 | 1000 ms | 8300 ms | — |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1216 | 1 | 200 | 1168 ms | 6380 ms | — |
| flow | step 1: goto /me | 2 | 200 | 369–397 ms | 8222–14367 ms | — |
| connect | Auto-login: typing the email. | 1 | 200 | 348 ms | 3842 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 2 | 200 | 326–432 ms | 3911–4193 ms | — |
| inspect | step 1: goto /me | 1 | 200 | 452 ms | 13198 ms | — |
| inspect | step 2: click e53 | 1 | 200 | 427 ms | 8120 ms | — |
| publish | Opening /marketplace/create/item | 7 | 200 | 328–426 ms | 8284–15127 ms | — |
| publish | Category: Miscellaneous | 1 | 200 | 375 ms | 1941 ms | — |

<!-- facts:end -->

## What it does

Preloads search suggestions for the search box. Loads on every signed-in page.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
