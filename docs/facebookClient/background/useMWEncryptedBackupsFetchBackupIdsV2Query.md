# useMWEncryptedBackupsFetchBackupIdsV2Query

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `25220416984279164` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `...EBFetchBackupIdsSharedFragment` |
| Called from | `useMWEncryptedBackupsFetchBackupIdsV2` |
| rea | `ev_16df7daca80a72c8f44b7a489690336b7def96e564429f0639a122f48023372a` |

Seen 29 time(s) in 27 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| connect | Page: loggedIn /marketplace/selling/ | 5 | 200 | 315–533 ms | 2821–6530 ms | — |
| inspect | step 1: goto /marketplace/ | 6 | 200 | 336–665 ms | 7293–20008 ms | — |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1223 | 1 | 200 | 537 ms | 9874 ms | — |
| inspect | step 2: waitRole link "…" | 1 | 200 | 925 ms | 13652 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T121 | 1 | 200 | 872 ms | 550 ms | — |
| flow | step 1: goto /me | 2 | 200 | 323–403 ms | 8495–14974 ms | — |
| connect | Auto-login: typing the email. | 1 | 200 | 324 ms | 3866 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 2 | 200 | 319–326 ms | 4011–4182 ms | — |
| inspect | step 1: goto /me | 1 | 200 | 340 ms | 13538 ms | — |
| inspect | step 2: click e53 | 1 | 200 | 329 ms | 8491 ms | — |
| publish | Opening /marketplace/create/item | 7 | 200 | 294–366 ms | 8435–15068 ms | — |
| publish | Category: Miscellaneous | 1 | 200 | 313 ms | 1940 ms | — |

<!-- facts:end -->

## What it does

Messenger's encrypted chat backup ids.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
