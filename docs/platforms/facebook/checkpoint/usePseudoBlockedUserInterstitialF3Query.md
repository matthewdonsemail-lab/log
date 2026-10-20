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

Seen 13 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id>/ | 1 | 200 | 347 ms | 5866 ms | — |
| inspect | step 1: goto /reel/ | 3 | 200 | 332–388 ms | 3372–4289 ms | — |
| inspect | step 71: goto /reel/ | 1 | 200 | 357 ms | 4001 ms | — |
| inspect | rea read step 13_dwell600s: exit 0, ev_e8922deafb7ba9951a51bda6f8cd82b5b68c41db19bfe0cd164 | 1 | 200 | 1721 ms | 1227 ms | — |
| inspect | rea read step 22_dwell600s: exit 0, ev_59385bb1add05e2efe91692d85b295ae9cd6334beafd2bccb4a | 1 | 200 | 370 ms | 2220 ms | — |
| inspect | step 9: goto /reel/<id> | 1 | 200 | 391 ms | 5831 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 653 ms | 5247 ms | — |
| inspect | step 20: goto /reel/<id> | 1 | 200 | 2153 ms | 2827 ms | — |
| inspect | step 22: goto /reel/ | 1 | 200 | 3020 ms | 2940 ms | — |
| inspect | mouse: 1 wander, 1 approach, 1 flick; 1 idle drift move(s) | 1 | 200 | 1315 ms | 400 ms | — |
| inspect | step 53: goto /reel/ | 1 | 200 | 334 ms | 5589 ms | — |

<!-- facts:end -->

## What it does

Asks whether the account is "pseudo-blocked" (restricted, shown an interstitial instead of the page). It reads nothing back on a healthy account. It fires on every signed-in page: 11 of our runs, 0.3 s each.

## What our machine does with it

Nothing waits for it today. It is the cleanest health signal we have: every signed-in run sends it, so its answer can be compared across runs and accounts.

## What can go wrong

If its response ever carries data, Facebook is restricting the account: stop the run and read it back (rule 25). Not yet seen with data. A missing sighting on a signed-in page would mean the page did not finish loading.
