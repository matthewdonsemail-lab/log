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

Seen 27 time(s) in 9 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 5 | 200 | 477–594 ms | 6589–8804 ms | — |
| inspect | step 7: goto / | 1 | 200 | 453 ms | 4922 ms | — |
| inspect | rea read step 33_dwell028s: exit 0, ev_d164a9c78021b1afb8ce6c5a24456a0d8f46efdbc7c54440f7f | 1 | 200 | 471 ms | 3385 ms | — |
| inspect | rea read step 36_scroll1X400: exit 0, ev_878f93e2480d9215dd7481db9487a1ed4fb3874251015daaf | 1 | 200 | 470 ms | 3145 ms | — |
| inspect | scroll: +978px in 22 wheel steps, 1531 ms | 1 | 200 | 452 ms | 1989 ms | — |
| inspect | step 38: goto /marketplace/ | 1 | 200 | 809 ms | 7820 ms | — |
| inspect | rea read step 21_dwell078s: exit 0, ev_87a54a6ea91a3418cb413686bdc6108f946bdf45884c8230e49 | 1 | 200 | 550 ms | 3647 ms | — |
| inspect | rea read step 24_scroll1X400: exit 0, ev_b216c28b15aac8907d6b5a345798a611d298acedb29f1a6ac | 1 | 200 | 463 ms | 1514 ms | — |
| inspect | step 27: goto / | 1 | 200 | 450 ms | 5222 ms | — |
| inspect | step 4: goto /marketplace/ | 1 | 200 | 464 ms | 5295 ms | — |
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
