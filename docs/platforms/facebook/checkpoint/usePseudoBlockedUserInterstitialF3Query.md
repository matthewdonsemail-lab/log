# usePseudoBlockedUserInterstitialF3Query

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 9 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id>/ | 3 | 200 | 381–459 ms | 3311–3501 ms | — |
| inspect | step 10: goto /groups/<id>/ | 1 | 200 | 422 ms | 2919 ms | — |
| inspect | step 11: goto /groups/<id>/ | 1 | 200 | 595 ms | 2702 ms | — |
| inspect | step 4: goto /groups/<id>/ | 1 | 200 | 411 ms | 2304 ms | — |
| inspect | step 1: goto / | 1 | 200 | 319 ms | 6764 ms | — |
| inspect | step 5: click e2647 | 1 | 200 | 310 ms | 2871 ms | — |
| inspect | step 7: click e2606 | 1 | 200 | 306 ms | 7519 ms | — |

<!-- facts:end -->

## What it does

Asks whether the account is "pseudo-blocked" (restricted, shown an interstitial instead of the page). It reads nothing back on a healthy account. It fires on every signed-in page: 11 of our runs, 0.3 s each.

## What our machine does with it

Nothing waits for it today. It is the cleanest health signal we have: every signed-in run sends it, so its answer can be compared across runs and accounts.

## What can go wrong

If its response ever carries data, Facebook is restricting the account: stop the run and read it back (rule 25). Not yet seen with data. A missing sighting on a signed-in page would mean the page did not finish loading.
