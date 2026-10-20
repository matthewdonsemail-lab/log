# RTWebCallBlockSettingHooksQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `9989124061109700` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | — |
| Called from | `RTWebCallBlockSettingHooks` |
| rea | `ev_1cd240cd88b74ce0c02e6218c665f21c92f2ebe302e100c7ea846dce65f28ad6` |

Seen 24 time(s) in 9 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 5 | 200 | 468–542 ms | 7022–9299 ms | — |
| inspect | step 7: goto / | 1 | 200 | 480 ms | 4926 ms | — |
| inspect | rea read step 33_dwell028s: exit 0, ev_d164a9c78021b1afb8ce6c5a24456a0d8f46efdbc7c54440f7f | 1 | 200 | 583 ms | 3389 ms | — |
| inspect | step 38: goto /marketplace/ | 1 | 200 | 799 ms | 7823 ms | — |
| inspect | rea read step 21_dwell078s: exit 0, ev_87a54a6ea91a3418cb413686bdc6108f946bdf45884c8230e49 | 1 | 200 | 616 ms | 3650 ms | — |
| inspect | step 27: goto / | 1 | 200 | 497 ms | 5225 ms | — |
| inspect | step 4: goto /marketplace/ | 1 | 200 | 521 ms | 5680 ms | — |
| inspect | step 1: goto /groups/<id>/ | 1 | 200 | 372 ms | 6425 ms | — |
| inspect | step 1: goto /reel/ | 3 | 200 | 340–381 ms | 3376–4292 ms | — |
| inspect | step 71: goto /reel/ | 1 | 200 | 358 ms | 4007 ms | — |
| inspect | rea read step 13_dwell600s: exit 0, ev_e8922deafb7ba9951a51bda6f8cd82b5b68c41db19bfe0cd164 | 1 | 200 | 1005 ms | 2080 ms | — |
| inspect | rea read step 22_dwell600s: exit 0, ev_59385bb1add05e2efe91692d85b295ae9cd6334beafd2bccb4a | 1 | 200 | 364 ms | 2222 ms | — |
| inspect | step 9: goto /reel/<id> | 1 | 200 | 1008 ms | 6031 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 645 ms | 5250 ms | — |
| inspect | step 20: goto /reel/<id> | 1 | 200 | 1348 ms | 2829 ms | — |
| inspect | step 22: goto /reel/ | 1 | 200 | 3699 ms | 2945 ms | — |
| inspect | mouse: 1 wander, 1 approach, 1 flick; 1 idle drift move(s) | 1 | 200 | 1921 ms | 602 ms | — |
| inspect | step 53: goto /reel/ | 1 | 200 | 337 ms | 5594 ms | — |

<!-- facts:end -->

## What it does

Messenger calling: whether incoming calls are blocked.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
