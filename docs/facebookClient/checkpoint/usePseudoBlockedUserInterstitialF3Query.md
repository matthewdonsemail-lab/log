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

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | signIn: password typed; submitting with Enter | 1 | 200 | 527 ms | 12796 ms | — |
| host | step 10: goto /marketplace/selling/ | 1 | 200 | 371 ms | 5028 ms | — |
| host | step 12: goto /me | 1 | 200 | 348 ms | 5623 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 1 | 200 | 425 ms | 6134 ms | — |

<!-- facts:end -->

## What it does

Asks whether the account is "pseudo-blocked" (restricted, shown an interstitial instead of the page). It reads nothing back on a healthy account. It fires on every signed-in page: 11 of our runs, 0.3 s each.

## What our machine does with it

Nothing waits for it today. It is the cleanest health signal we have: every signed-in run sends it, so its answer can be compared across runs and accounts.

## What can go wrong

If its response ever carries data, Facebook is restricting the account: stop the run and read it back (rule 25). Not yet seen with data. A missing sighting on a signed-in page would mean the page did not finish loading.
