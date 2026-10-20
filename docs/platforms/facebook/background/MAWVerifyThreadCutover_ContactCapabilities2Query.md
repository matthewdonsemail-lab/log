# MAWVerifyThreadCutover_ContactCapabilities2Query

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `9948369021930229` |
| Path | `/api/graphql/` |
| Sends | `id` |
| Reads | `user.message_capabilities2_str` |
| Called from | `MAWVerifyThreadCutover` |
| rea | `ev_2ef4fcf81840e4c44dfd19b7c86b9e3e65429109c06595cfc96262bcea9f2bc2` |

Seen 24 time(s) in 9 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 5 | 200 | 501–553 ms | 6626–8849 ms | — |
| inspect | step 7: goto / | 1 | 200 | 500 ms | 4963 ms | — |
| inspect | rea read step 33_dwell028s: exit 0, ev_d164a9c78021b1afb8ce6c5a24456a0d8f46efdbc7c54440f7f | 1 | 200 | 524 ms | 3462 ms | — |
| inspect | step 38: goto /marketplace/ | 1 | 200 | 734 ms | 7900 ms | — |
| inspect | rea read step 21_dwell078s: exit 0, ev_87a54a6ea91a3418cb413686bdc6108f946bdf45884c8230e49 | 1 | 200 | 573 ms | 3703 ms | — |
| inspect | step 27: goto / | 1 | 200 | 549 ms | 5270 ms | — |
| inspect | step 4: goto /marketplace/ | 1 | 200 | 444 ms | 5803 ms | — |
| inspect | step 1: goto /groups/<id>/ | 1 | 200 | 389 ms | 6555 ms | — |
| inspect | step 1: goto /reel/ | 3 | 200 | 339–353 ms | 3408–4338 ms | — |
| inspect | step 71: goto /reel/ | 1 | 200 | 328 ms | 4281 ms | — |
| inspect | rea read step 13_dwell600s: exit 0, ev_e8922deafb7ba9951a51bda6f8cd82b5b68c41db19bfe0cd164 | 1 | 200 | 1714 ms | 1264 ms | — |
| inspect | rea read step 22_dwell600s: exit 0, ev_59385bb1add05e2efe91692d85b295ae9cd6334beafd2bccb4a | 1 | 200 | 328 ms | 2264 ms | — |
| inspect | step 9: goto /reel/<id> | 1 | 200 | 401 ms | 5863 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 585 ms | 5360 ms | — |
| inspect | step 20: goto /reel/<id> | 1 | 200 | 2124 ms | 2852 ms | — |
| inspect | step 22: goto /reel/ | 1 | 200 | 3661 ms | 2982 ms | — |
| inspect | mouse: 1 wander, 1 approach, 1 flick; 1 idle drift move(s) | 1 | 200 | 2065 ms | 459 ms | — |
| inspect | step 53: goto /reel/ | 1 | 200 | 381 ms | 5835 ms | — |

<!-- facts:end -->

## What it does

Messenger's end-to-end encrypted chat: checks what the contacts' clients support.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
