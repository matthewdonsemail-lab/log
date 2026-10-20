# OhaiWebPublicKeyConfigQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `26996952523264441` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | — |
| Called from | `OhaiWebPublicKeyConfig` |
| rea | `ev_786baf260253294e0033320946363519208e8dffae26d32768956add42a7d013` |

Seen 24 time(s) in 9 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 5 | 200 | 467–582 ms | 6556–8723 ms | — |
| inspect | step 7: goto / | 1 | 200 | 580 ms | 4381 ms | — |
| inspect | rea read step 33_dwell028s: exit 0, ev_d164a9c78021b1afb8ce6c5a24456a0d8f46efdbc7c54440f7f | 1 | 200 | 515 ms | 3259 ms | — |
| inspect | step 38: goto /marketplace/ | 1 | 200 | 846 ms | 7746 ms | — |
| inspect | rea read step 21_dwell078s: exit 0, ev_87a54a6ea91a3418cb413686bdc6108f946bdf45884c8230e49 | 1 | 200 | 469 ms | 3582 ms | — |
| inspect | step 27: goto / | 1 | 200 | 464 ms | 5159 ms | — |
| inspect | step 4: goto /marketplace/ | 1 | 200 | 647 ms | 5532 ms | — |
| inspect | step 1: goto /groups/<id>/ | 1 | 200 | 343 ms | 5713 ms | — |
| inspect | step 1: goto /reel/ | 3 | 200 | 339–358 ms | 3193–4211 ms | — |
| inspect | step 71: goto /reel/ | 1 | 200 | 323 ms | 3846 ms | — |
| inspect | rea read step 13_dwell600s: exit 0, ev_e8922deafb7ba9951a51bda6f8cd82b5b68c41db19bfe0cd164 | 1 | 200 | 1035 ms | 2019 ms | — |
| inspect | rea read step 22_dwell600s: exit 0, ev_59385bb1add05e2efe91692d85b295ae9cd6334beafd2bccb4a | 1 | 200 | 360 ms | 2128 ms | — |
| inspect | step 9: goto /reel/<id> | 1 | 200 | 940 ms | 5978 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 630 ms | 5195 ms | — |
| inspect | step 20: goto /reel/<id> | 1 | 200 | 358 ms | 2721 ms | — |
| inspect | step 22: goto /reel/ | 1 | 200 | 2420 ms | 2624 ms | — |
| inspect | mouse: 1 wander, 1 approach, 1 flick; 1 idle drift move(s) | 1 | 200 | 1307 ms | 350 ms | — |
| inspect | step 53: goto /reel/ | 1 | 200 | 340 ms | 5471 ms | — |

<!-- facts:end -->

## What it does

Fetches a public key the page uses to encrypt some data it sends (likely for Messenger or logging).

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
