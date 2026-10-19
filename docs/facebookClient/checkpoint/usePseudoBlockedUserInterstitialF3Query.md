# usePseudoBlockedUserInterstitialF3Query

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | checkpoint |
| Kind | query |
| doc_id | `27255340990751033` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | — |
| Called from | `usePseudoBlockedUserInterstitial` |
| rea | `ev_4f0f59bc7d5ff4c02ef9f2aba85fc9de893084a7a8fbdf3f1627ce6c1c3456fe` |

Seen 29 time(s) in 27 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| connect | Page: loggedIn /marketplace/selling/ | 5 | 200 | 316–512 ms | 2827–6543 ms | — |
| inspect | step 1: goto /marketplace/ | 6 | 200 | 337–551 ms | 7296–19812 ms | — |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1223 | 1 | 200 | 504 ms | 9913 ms | — |
| inspect | step 2: waitRole link "…" | 1 | 200 | 876 ms | 13767 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T121 | 1 | 200 | 831 ms | 601 ms | — |
| flow | step 1: goto /me | 2 | 200 | 338–378 ms | 8529–15038 ms | — |
| connect | Auto-login: typing the email. | 1 | 200 | 325 ms | 3882 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 2 | 200 | 316–430 ms | 4011–4196 ms | — |
| inspect | step 1: goto /me | 1 | 200 | 338 ms | 13542 ms | — |
| inspect | step 2: click e53 | 1 | 200 | 323 ms | 8520 ms | — |
| publish | Opening /marketplace/create/item | 7 | 200 | 300–358 ms | 8443–14936 ms | — |
| publish | Category: Miscellaneous | 1 | 200 | 305 ms | 1696 ms | — |

<!-- facts:end -->

## What it does

Asks whether the account is "pseudo-blocked" (restricted, shown an interstitial instead of the page). It reads nothing back on a healthy account. It fires on every signed-in page: 11 of our runs, 0.3 s each.

## What our machine does with it

Nothing waits for it today. It is the cleanest health signal we have: every signed-in run sends it, so its answer can be compared across runs and accounts.

## What can go wrong

If its response ever carries data, Facebook is restricting the account: stop the run and read it back (rule 25). Not yet seen with data. A missing sighting on a signed-in page would mean the page did not finish loading.
