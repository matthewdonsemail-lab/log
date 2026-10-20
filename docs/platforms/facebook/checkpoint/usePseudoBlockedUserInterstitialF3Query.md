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

Seen 30 time(s) in 11 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id>/ | 2 | 200 | 347–393 ms | 3530–5866 ms | — |
| inspect | step 1: goto /groups/<id> | 2 | 200 | 348–386 ms | 5609–6614 ms | — |
| inspect | step 1: goto / | 5 | 200 | 477–594 ms | 6589–8804 ms | — |
| inspect | step 7: goto / | 1 | 200 | 453 ms | 4922 ms | — |
| inspect | step 34: goto /marketplace/ | 1 | 200 | 471 ms | 6052 ms | — |
| inspect | scroll: -577px in 13 wheel steps, 859 ms | 1 | 200 | 470 ms | 3584 ms | — |
| inspect | scroll: +978px in 22 wheel steps, 1531 ms | 1 | 200 | 452 ms | 1989 ms | — |
| inspect | step 38: goto /marketplace/ | 1 | 200 | 809 ms | 7820 ms | — |
| inspect | step 22: goto /marketplace/ | 1 | 200 | 550 ms | 6211 ms | — |
| inspect | step 25: openAny 1-3 x /marketplace/item/ | 1 | 200 | 463 ms | 4047 ms | — |
| inspect | step 27: goto / | 1 | 200 | 450 ms | 5222 ms | — |
| inspect | step 4: goto /marketplace/ | 1 | 200 | 464 ms | 5295 ms | — |
| inspect | step 1: goto /reel/ | 3 | 200 | 332–388 ms | 3372–4289 ms | — |
| inspect | step 71: goto /reel/ | 1 | 200 | 357 ms | 4001 ms | — |
| inspect | step 14: goto /reel/<id> | 1 | 200 | 1721 ms | 4126 ms | — |
| inspect | step 23: goto /reel/<id> | 1 | 200 | 370 ms | 4961 ms | — |
| inspect | step 9: goto /reel/<id> | 1 | 200 | 391 ms | 5831 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 653 ms | 5247 ms | — |
| inspect | step 20: goto /reel/<id> | 1 | 200 | 2153 ms | 2827 ms | — |
| inspect | step 22: goto /reel/ | 1 | 200 | 3020 ms | 2940 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 1 | 200 | 1315 ms | 5511 ms | — |
| inspect | step 53: goto /reel/ | 1 | 200 | 334 ms | 5589 ms | — |

<!-- facts:end -->

## What it does

Asks whether the account is "pseudo-blocked" (restricted, shown an interstitial instead of the page). It reads nothing back on a healthy account. It fires on every signed-in page: 11 of our runs, 0.3 s each.

## What our machine does with it

Nothing waits for it today. It is the cleanest health signal we have: every signed-in run sends it, so its answer can be compared across runs and accounts.

## What can go wrong

If its response ever carries data, Facebook is restricting the account: stop the run and read it back (rule 25). Not yet seen with data. A missing sighting on a signed-in page would mean the page did not finish loading.
